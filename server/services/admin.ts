import { asc, desc, eq, inArray, max, sql } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../auth.js";
import { db } from "../db/client.js";
import {
  isDbTransactionExecutionError,
  withDbTransactionWithMode,
} from "../db/transaction.js";
import { demoCategories, demoFiles, demos } from "../db/schema.js";
import { isAdminEmail } from "../env.js";
import { publishDemo } from "../publishDemo.js";
import { createId, toSlug } from "../utils.js";

const categoryTypeSchema = z.enum(["css", "tailwind"]);
const fileKindSchema = z.enum(["html", "css", "js"]);

const createCategorySchema = z.object({
  type: categoryTypeSchema,
  label: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  icon: z.string().trim().min(1).optional(),
  description: z.string().default(""),
});

const updateCategorySchema = z
  .object({
    label: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    icon: z.string().trim().min(1).optional(),
    description: z.string().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const reorderCategoriesSchema = z.object({
  type: categoryTypeSchema,
  orderedIds: z.array(z.string().min(1)).min(1),
});

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

const updateDemoSchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    title: z.string().trim().min(1).optional(),
    slug: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    difficulty: z.string().optional(),
    support: z.string().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

const reorderDemosSchema = z.object({
  categoryId: z.string().min(1),
  orderedIds: z.array(z.string().min(1)).min(1),
});

const upsertFilesSchema = z.object({
  files: z.array(demoFileSchema),
});

type DemoFileInput = z.infer<typeof demoFileSchema>;
export type SessionPayload = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

export class AdminApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(typeof body === "string" ? body : `HTTP ${status}`);
    this.name = "AdminApiError";
    this.status = status;
    this.body = body;
  }
}

export function isAdminApiError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError;
}

function toInternalError(message: string, cause: unknown): never {
  console.error(message, cause);
  throw new AdminApiError(500, { error: "Internal server error" });
}

function parseBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AdminApiError(400, { error: parsed.error.flatten() });
  }
  return parsed.data;
}

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

function rethrowTransactionCause(error: unknown): never {
  if (isDbTransactionExecutionError(error)) {
    throw error.cause;
  }
  throw error;
}

export async function requireAdminSession(
  headers: HeadersInit,
): Promise<SessionPayload> {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new AdminApiError(401, { error: "Unauthorized" });
  }

  if (!isAdminEmail(session.user.email)) {
    throw new AdminApiError(403, { error: "Forbidden" });
  }

  return session;
}

export async function forwardSignInRequest(params: {
  origin: string;
  headers: HeadersInit;
  body?: BodyInit;
}) {
  const request = new Request(new URL("/api/auth/sign-in/email", params.origin), {
    method: "POST",
    headers: params.headers,
    body: params.body,
  });
  return auth.handler(request);
}

export async function forwardSignOutRequest(params: {
  origin: string;
  headers: HeadersInit;
  method: string;
}) {
  const request = new Request(new URL("/api/auth/sign-out", params.origin), {
    method: params.method,
    headers: params.headers,
  });
  return auth.handler(request);
}

export async function getAdminSessionResponse(session: SessionPayload) {
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  };
}

export async function listCategories() {
  const categories = await db
    .select()
    .from(demoCategories)
    .orderBy(
      asc(demoCategories.type),
      asc(demoCategories.sortOrder),
      asc(demoCategories.createdAt),
    );
  return { categories };
}

export async function createCategory(body: unknown) {
  const parsed = parseBody(createCategorySchema, body);
  const slug = parsed.slug ? toSlug(parsed.slug) : toSlug(parsed.label);
  const [sortRow] = await db
    .select({ maxSort: max(demoCategories.sortOrder) })
    .from(demoCategories)
    .where(eq(demoCategories.type, parsed.type));

  const [category] = await db
    .insert(demoCategories)
    .values({
      id: createId("cat"),
      type: parsed.type,
      label: parsed.label,
      slug,
      icon: parsed.icon ?? "layers",
      description: parsed.description,
      sortOrder: (sortRow?.maxSort ?? -1) + 1,
    })
    .returning();

  return { category };
}

export async function updateCategory(categoryId: string, body: unknown) {
  const parsed = parseBody(updateCategorySchema, body);
  const updateData: Partial<typeof demoCategories.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.label !== undefined) updateData.label = parsed.label;
  if (parsed.icon !== undefined) updateData.icon = parsed.icon;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.slug !== undefined) {
    updateData.slug = toSlug(parsed.slug);
  } else if (parsed.label !== undefined) {
    updateData.slug = toSlug(parsed.label);
  }

  const [category] = await db
    .update(demoCategories)
    .set(updateData)
    .where(eq(demoCategories.id, categoryId))
    .returning();

  if (!category) {
    throw new AdminApiError(404, { error: "Category not found" });
  }

  return { category };
}

export async function deleteCategory(categoryId: string) {
  const [existingDemo] = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.categoryId, categoryId))
    .limit(1);

  if (existingDemo) {
    throw new AdminApiError(409, {
      error: "Category has demos; move or delete demos first.",
    });
  }

  const [deleted] = await db
    .delete(demoCategories)
    .where(eq(demoCategories.id, categoryId))
    .returning({ id: demoCategories.id });

  if (!deleted) {
    throw new AdminApiError(404, { error: "Category not found" });
  }

  return { success: true };
}

export async function reorderCategories(body: unknown) {
  const parsed = parseBody(reorderCategoriesSchema, body);
  const rows = await db
    .select({ id: demoCategories.id, type: demoCategories.type })
    .from(demoCategories)
    .where(inArray(demoCategories.id, parsed.orderedIds));

  if (rows.length !== parsed.orderedIds.length) {
    throw new AdminApiError(400, { error: "One or more categories do not exist" });
  }
  if (rows.some((row) => row.type !== parsed.type)) {
    throw new AdminApiError(400, {
      error: "All categories in reorder must have same type",
    });
  }

  const caseSql = sql.join(
    parsed.orderedIds.map((id, sortOrder) => sql`WHEN ${id} THEN ${sortOrder}`),
    sql` `,
  );
  const idSql = sql.join(parsed.orderedIds.map((id) => sql`${id}`), sql`, `);

  await db.execute(sql`
    UPDATE ${demoCategories}
    SET
      ${demoCategories.sortOrder} = CASE ${demoCategories.id}
        ${caseSql}
        ELSE ${demoCategories.sortOrder}
      END,
      ${demoCategories.updatedAt} = ${new Date()}
    WHERE
      ${demoCategories.type} = ${parsed.type}
      AND ${demoCategories.id} IN (${idSql})
  `);

  return { success: true };
}

export async function listDemos(categoryId?: string | null) {
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

  return {
    demos: demoRows.map((demo) => ({
      ...demo,
      files: filesByDemo.get(demo.id) ?? [],
    })),
  };
}

export async function createDemo(body: unknown) {
  const parsed = parseBody(createDemoSchema, body);
  const [category] = await db
    .select()
    .from(demoCategories)
    .where(eq(demoCategories.id, parsed.categoryId))
    .limit(1);

  if (!category) {
    throw new AdminApiError(404, { error: "Category not found" });
  }

  const [sortRow] = await db
    .select({ sortOrder: demos.sortOrder })
    .from(demos)
    .where(eq(demos.categoryId, parsed.categoryId))
    .orderBy(desc(demos.sortOrder))
    .limit(1);

  const [demo] = await db
    .insert(demos)
    .values({
      id: createId("demo"),
      source: category.type,
      categoryId: parsed.categoryId,
      slug: parsed.slug ? toSlug(parsed.slug) : toSlug(parsed.title),
      title: parsed.title,
      description: parsed.description,
      difficulty: parsed.difficulty,
      support: parsed.support,
      sortOrder: (sortRow?.sortOrder ?? -1) + 1,
    })
    .returning();

  const files = dedupeFiles(parsed.files);
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

  return { demo: { ...demo, files: persistedFiles } };
}

export async function updateDemo(demoId: string, body: unknown) {
  const parsed = parseBody(updateDemoSchema, body);
  const [existing] = await db.select().from(demos).where(eq(demos.id, demoId)).limit(1);
  if (!existing) {
    throw new AdminApiError(404, { error: "Demo not found" });
  }

  const updateData: Partial<typeof demos.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.categoryId !== undefined) {
    const [targetCategory] = await db
      .select()
      .from(demoCategories)
      .where(eq(demoCategories.id, parsed.categoryId))
      .limit(1);

    if (!targetCategory) {
      throw new AdminApiError(404, { error: "Target category not found" });
    }

    updateData.categoryId = targetCategory.id;
    updateData.source = targetCategory.type;

    if (targetCategory.id !== existing.categoryId) {
      const [sortRow] = await db
        .select({ maxSort: max(demos.sortOrder) })
        .from(demos)
        .where(eq(demos.categoryId, targetCategory.id));
      updateData.sortOrder = (sortRow?.maxSort ?? -1) + 1;
    }
  }

  if (parsed.title !== undefined) updateData.title = parsed.title;
  if (parsed.description !== undefined) updateData.description = parsed.description;
  if (parsed.difficulty !== undefined) updateData.difficulty = parsed.difficulty;
  if (parsed.support !== undefined) updateData.support = parsed.support;
  if (parsed.slug !== undefined) {
    updateData.slug = toSlug(parsed.slug);
  } else if (parsed.title !== undefined) {
    updateData.slug = toSlug(parsed.title);
  }

  const [demo] = await db
    .update(demos)
    .set(updateData)
    .where(eq(demos.id, demoId))
    .returning();

  if (!demo) {
    throw new AdminApiError(500, { error: "Demo update failed" });
  }

  return { demo };
}

export async function deleteDemo(demoId: string) {
  const [deleted] = await db
    .delete(demos)
    .where(eq(demos.id, demoId))
    .returning({ id: demos.id });

  if (!deleted) {
    throw new AdminApiError(404, { error: "Demo not found" });
  }

  return { success: true };
}

export async function reorderDemos(body: unknown) {
  const parsed = parseBody(reorderDemosSchema, body);
  const rows = await db
    .select({ id: demos.id, categoryId: demos.categoryId })
    .from(demos)
    .where(inArray(demos.id, parsed.orderedIds));

  if (rows.length !== parsed.orderedIds.length) {
    throw new AdminApiError(400, { error: "One or more demos do not exist" });
  }

  if (rows.some((row) => row.categoryId !== parsed.categoryId)) {
    throw new AdminApiError(400, {
      error: "All demos must belong to the same category",
    });
  }

  const caseSql = sql.join(
    parsed.orderedIds.map((id, sortOrder) => sql`WHEN ${id} THEN ${sortOrder}`),
    sql` `,
  );
  const idSql = sql.join(parsed.orderedIds.map((id) => sql`${id}`), sql`, `);

  await db.execute(sql`
    UPDATE ${demos}
    SET
      ${demos.sortOrder} = CASE ${demos.id}
        ${caseSql}
        ELSE ${demos.sortOrder}
      END,
      ${demos.updatedAt} = ${new Date()}
    WHERE
      ${demos.categoryId} = ${parsed.categoryId}
      AND ${demos.id} IN (${idSql})
  `);

  return { success: true };
}

async function restoreDemoFilesSnapshot(
  demoId: string,
  files: typeof demoFiles.$inferSelect[],
) {
  await db.delete(demoFiles).where(eq(demoFiles.demoId, demoId));
  if (files.length === 0) return;

  await db.insert(demoFiles).values(
    files.map((file) => ({
      id: file.id,
      demoId: file.demoId,
      fileKind: file.fileKind,
      content: file.content,
      sortOrder: file.sortOrder,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt,
    })),
  );
}

export async function upsertDemoFiles(demoId: string, body: unknown) {
  const parsed = parseBody(upsertFilesSchema, body);
  const [demo] = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.id, demoId))
    .limit(1);

  if (!demo) {
    throw new AdminApiError(404, { error: "Demo not found" });
  }

  const snapshot = await db
    .select()
    .from(demoFiles)
    .where(eq(demoFiles.demoId, demoId))
    .orderBy(asc(demoFiles.sortOrder));

  const deduped = dedupeFiles(parsed.files);

  try {
    await withDbTransactionWithMode(async (tx) => {
      await tx.delete(demoFiles).where(eq(demoFiles.demoId, demoId));

      if (deduped.length === 0) {
        return;
      }

      await tx.insert(demoFiles).values(
        deduped.map((file, sortOrder) => ({
          id: createId("file"),
          demoId,
          fileKind: file.fileKind,
          content: file.content,
          sortOrder,
        })),
      );
    });
  } catch (error) {
    if (
      isDbTransactionExecutionError(error) &&
      error.mode === "fallback"
    ) {
      try {
        await restoreDemoFilesSnapshot(demoId, snapshot);
      } catch (restoreError) {
        toInternalError("[admin/files] Recovery failed after fallback write error.", {
          error,
          restoreError,
        });
      }

      throw new AdminApiError(503, {
        error:
          "File update failed while using non-transactional mode. Previous files were restored.",
      });
    }

    rethrowTransactionCause(error);
  }

  const files = await db
    .select()
    .from(demoFiles)
    .where(eq(demoFiles.demoId, demoId))
    .orderBy(asc(demoFiles.sortOrder));

  return { files };
}

export async function publishDemoById(demoId: string, body: unknown) {
  try {
    return await publishDemo(demoId, body);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      "error" in error
    ) {
      const rawStatus = (error as { status?: unknown }).status;
      const status: 400 | 404 | 500 | 503 =
        rawStatus === 400 ||
        rawStatus === 404 ||
        rawStatus === 500 ||
        rawStatus === 503
          ? rawStatus
          : 500;
      throw new AdminApiError(status, {
        error: (error as { error: unknown }).error,
      });
    }
    throw error;
  }
}
