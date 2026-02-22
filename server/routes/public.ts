import { Hono } from "hono";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { demoCategories, demoFiles, demos } from "../db/schema.js";

export const publicRoutes = new Hono();

export async function loadPublicGalleryPayload() {
  const categories = await db
    .select()
    .from(demoCategories)
    .orderBy(asc(demoCategories.type), asc(demoCategories.sortOrder), asc(demoCategories.createdAt));

  const publishedDemos = await db
    .select()
    .from(demos)
    .where(eq(demos.status, "published"))
    .orderBy(asc(demos.source), asc(demos.categoryId), asc(demos.sortOrder), asc(demos.createdAt));

  const demoIds = publishedDemos.map((demo) => demo.id);
  const files = demoIds.length
    ? await db
        .select()
        .from(demoFiles)
        .where(inArray(demoFiles.demoId, demoIds))
        .orderBy(asc(demoFiles.demoId), asc(demoFiles.sortOrder))
    : [];

  const filesByDemoId = new Map<string, typeof files>();
  for (const file of files) {
    const existing = filesByDemoId.get(file.demoId) ?? [];
    existing.push(file);
    filesByDemoId.set(file.demoId, existing);
  }

  return {
    categories,
    demos: publishedDemos.map((demo) => ({
      ...demo,
      files: filesByDemoId.get(demo.id) ?? [],
    })),
  };
}

publicRoutes.get("/gallery", async (c) => {
  const payload = await loadPublicGalleryPayload();
  return c.json(payload);
});
