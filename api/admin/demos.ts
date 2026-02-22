/**
 * Standalone demos handler for Vercel reliability.
 * Takes precedence for:
 * - GET /api/admin/demos
 * - POST /api/admin/demos
 */
import { asc, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../../server/auth.js";
import { db } from "../../server/db/client.js";
import { demoCategories, demoFiles, demos } from "../../server/db/schema.js";
import { isAdminEmail } from "../../server/env.js";
import { createId, toSlug } from "../../server/utils.js";

const fileKindSchema = z.enum(["html", "css", "js"]);
const demoFileSchema = z.object({
  fileKind: fileKindSchema,
  content: z.string(),
});

const createDemoSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().default(""),
  difficulty: z.string().optional(),
  support: z.string().optional(),
  files: z.array(demoFileSchema).default([]),
});

type DemoFileInput = z.infer<typeof demoFileSchema>;

function dedupeFiles(files: DemoFileInput[]): DemoFileInput[] {
  const map = new Map<z.infer<typeof fileKindSchema>, string>();
  for (const file of files) {
    map.set(file.fileKind, file.content);
  }

  return Array.from(map.entries()).map(([fileKind, content]) => ({
    fileKind,
    content,
  }));
}

function getOrigin(req: import("node:http").IncomingMessage): string {
  const host = req.headers.host ?? "localhost";
  const protoRaw = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(protoRaw) ? protoRaw[0] : protoRaw) ?? "https";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  data: object,
): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

async function readJsonBody(
  req: import("node:http").IncomingMessage,
): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks);
  if (body.length === 0) return {};
  try {
    return JSON.parse(body.toString());
  } catch {
    throw new Error("Invalid JSON body");
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function handler(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  const method = req.method ?? "GET";
  if (method !== "GET" && method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });
    if (!session) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    if (!isAdminEmail(session.user.email)) {
      sendJson(res, 403, { error: "Forbidden" });
      return;
    }

    if (method === "GET") {
      const url = new URL(req.url ?? "/api/admin/demos", getOrigin(req));
      const categoryId = url.searchParams.get("categoryId");

      const demoRows = await db
        .select()
        .from(demos)
        .where(categoryId ? eq(demos.categoryId, categoryId) : undefined)
        .orderBy(asc(demos.categoryId), asc(demos.sortOrder), asc(demos.createdAt));

      const demoIds = demoRows.map((demo) => demo.id);
      const fileRows = demoIds.length
        ? await db
            .select()
            .from(demoFiles)
            .where(inArray(demoFiles.demoId, demoIds))
            .orderBy(asc(demoFiles.demoId), asc(demoFiles.sortOrder))
        : [];

      const filesByDemo = new Map<string, typeof fileRows>();
      for (const row of fileRows) {
        const existing = filesByDemo.get(row.demoId) ?? [];
        existing.push(row);
        filesByDemo.set(row.demoId, existing);
      }

      sendJson(res, 200, {
        demos: demoRows.map((demo) => ({
          ...demo,
          files: filesByDemo.get(demo.id) ?? [],
        })),
      });
      return;
    }

    const body = await readJsonBody(req);
    const parsed = createDemoSchema.safeParse(body);
    if (!parsed.success) {
      sendJson(res, 400, { error: parsed.error.flatten() });
      return;
    }

    const [category] = await db
      .select()
      .from(demoCategories)
      .where(eq(demoCategories.id, parsed.data.categoryId))
      .limit(1);

    if (!category) {
      sendJson(res, 404, { error: "Category not found" });
      return;
    }

    const [sortRow] = await db
      .select({ sortOrder: demos.sortOrder })
      .from(demos)
      .where(eq(demos.categoryId, parsed.data.categoryId))
      .orderBy(desc(demos.sortOrder))
      .limit(1);

    const [demo] = await db
      .insert(demos)
      .values({
        id: createId("demo"),
        source: category.type,
        categoryId: parsed.data.categoryId,
        slug: parsed.data.slug ? toSlug(parsed.data.slug) : toSlug(parsed.data.title),
        title: parsed.data.title,
        description: parsed.data.description,
        difficulty: parsed.data.difficulty,
        support: parsed.data.support,
        sortOrder: (sortRow?.sortOrder ?? -1) + 1,
      })
      .returning();

    const files = dedupeFiles(parsed.data.files);
    let persistedFiles: typeof demoFiles.$inferSelect[] = [];
    if (files.length > 0) {
      persistedFiles = await db
        .insert(demoFiles)
        .values(
          files.map((file, sortOrder) => ({
            id: createId("file"),
            demoId: demo.id,
            fileKind: file.fileKind,
            content: file.content,
            sortOrder,
          })),
        )
        .returning();
    }

    sendJson(res, 201, { demo: { ...demo, files: persistedFiles } });
  } catch (error) {
    console.error("[admin/demos] Error:", error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
