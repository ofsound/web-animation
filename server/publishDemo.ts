/**
 * Shared publish logic for demo - used by both Hono admin route and standalone Vercel handler.
 */
import { asc, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db } from "./db/client.js";
import { demoCategories, demoFiles, demos } from "./db/schema.js";
import { createId, toSlug } from "./utils.js";

const fileKindSchema = z.enum(["html", "css", "js"]);
const demoFileSchema = z.object({
  fileKind: fileKindSchema,
  content: z.string(),
});

export const publishDemoSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().default(""),
  difficulty: z.string().nullable().optional(),
  support: z.string().nullable().optional(),
  files: z.array(demoFileSchema),
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

export type PublishDemoResult = {
  demo: {
    id: string;
    categoryId: string;
    source: string;
    title: string;
    slug: string;
    description: string;
    difficulty: string | null;
    support: string | null;
    status: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    files: Array<{
      id: string;
      demoId: string;
      fileKind: string;
      content: string;
      sortOrder: number;
    }>;
  };
};

export async function publishDemo(
  demoId: string,
  body: unknown,
): Promise<PublishDemoResult> {
  const parsed = publishDemoSchema.safeParse(body);
  if (!parsed.success) {
    throw { status: 400, error: parsed.error.flatten() };
  }

  const [existing] = await db.select().from(demos).where(eq(demos.id, demoId)).limit(1);
  if (!existing) {
    throw { status: 404, error: "Demo not found" };
  }

  const [targetCategory] = await db
    .select()
    .from(demoCategories)
    .where(eq(demoCategories.id, parsed.data.categoryId))
    .limit(1);
  if (!targetCategory) {
    throw { status: 404, error: "Category not found" };
  }

  const dedupedFiles = dedupeFiles(parsed.data.files);

  await db.transaction(async (tx) => {
    let nextSortOrder = existing.sortOrder;

    if (existing.categoryId !== targetCategory.id) {
      const [sortRow] = await tx
        .select({ maxSort: max(demos.sortOrder) })
        .from(demos)
        .where(eq(demos.categoryId, targetCategory.id));
      nextSortOrder = (sortRow?.maxSort ?? -1) + 1;
    }

    await tx
      .update(demos)
      .set({
        categoryId: targetCategory.id,
        source: targetCategory.type,
        title: parsed.data.title,
        slug: parsed.data.slug ? toSlug(parsed.data.slug) : toSlug(parsed.data.title),
        description: parsed.data.description,
        difficulty: parsed.data.difficulty ?? null,
        support: parsed.data.support ?? null,
        status: "published",
        sortOrder: nextSortOrder,
        updatedAt: new Date(),
        publishedAt: new Date(),
      })
      .where(eq(demos.id, demoId));

    await tx.delete(demoFiles).where(eq(demoFiles.demoId, demoId));

    if (dedupedFiles.length > 0) {
      await tx.insert(demoFiles).values(
        dedupedFiles.map((file, sortOrder) => ({
          id: createId("file"),
          demoId,
          fileKind: file.fileKind,
          content: file.content,
          sortOrder,
        })),
      );
    }
  });

  const [publishedDemo] = await db.select().from(demos).where(eq(demos.id, demoId)).limit(1);
  const publishedFiles = await db
    .select()
    .from(demoFiles)
    .where(eq(demoFiles.demoId, demoId))
    .orderBy(asc(demoFiles.sortOrder));

  if (!publishedDemo) {
    throw { status: 500, error: "Publish failed" };
  }

  return {
    demo: {
      ...publishedDemo,
      files: publishedFiles,
    },
  };
}
