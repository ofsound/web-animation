import { Hono } from "hono";
import { and, asc, eq, inArray, max } from "drizzle-orm";
import { z } from "zod";
import { auth } from "../auth";
import { db } from "../db/client";
import { demoCategories, demoFiles, demos } from "../db/schema";
import { isAdminEmail } from "../env";
import { createId, toSlug } from "../utils";

const categoryTypeSchema = z.enum(["css", "tailwind"]);
const fileKindSchema = z.enum(["html", "css", "js", "tailwind_css", "meta"]);

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

const publishDemoSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1).optional(),
  description: z.string().default(""),
  difficulty: z.string().nullable().optional(),
  support: z.string().nullable().optional(),
  files: z.array(demoFileSchema),
});


type SessionPayload = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
type DemoFileInput = z.infer<typeof demoFileSchema>;

type AdminBindings = {
  Variables: {
    session: SessionPayload;
  };
};

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

export const adminRoutes = new Hono<AdminBindings>();

adminRoutes.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isAdminEmail(session.user.email)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  c.set("session", session);
  await next();
});

adminRoutes.get("/session", (c) => {
  const session = c.get("session");
  return c.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  });
});

adminRoutes.get("/categories", async (c) => {
  const categories = await db
    .select()
    .from(demoCategories)
    .orderBy(
      asc(demoCategories.type),
      asc(demoCategories.sortOrder),
      asc(demoCategories.createdAt),
    );

  return c.json({ categories });
});

adminRoutes.post("/categories", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { type, label } = parsed.data;
  const slug = parsed.data.slug ? toSlug(parsed.data.slug) : toSlug(label);
  const [sortRow] = await db
    .select({ maxSort: max(demoCategories.sortOrder) })
    .from(demoCategories)
    .where(eq(demoCategories.type, type));

  const [category] = await db
    .insert(demoCategories)
    .values({
      id: createId("cat"),
      type,
      label,
      slug,
      icon: parsed.data.icon ?? "layers",
      description: parsed.data.description,
      sortOrder: (sortRow?.maxSort ?? -1) + 1,
    })
    .returning();

  return c.json({ category }, 201);
});

adminRoutes.patch("/categories/:id", async (c) => {
  const categoryId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const updateData: Partial<typeof demoCategories.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (parsed.data.label !== undefined) updateData.label = parsed.data.label;
  if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;
  if (parsed.data.description !== undefined) {
    updateData.description = parsed.data.description;
  }
  if (parsed.data.slug !== undefined) {
    updateData.slug = toSlug(parsed.data.slug);
  } else if (parsed.data.label !== undefined) {
    updateData.slug = toSlug(parsed.data.label);
  }

  const [category] = await db
    .update(demoCategories)
    .set(updateData)
    .where(eq(demoCategories.id, categoryId))
    .returning();

  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json({ category });
});

adminRoutes.delete("/categories/:id", async (c) => {
  const categoryId = c.req.param("id");

  const [existingDemo] = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.categoryId, categoryId))
    .limit(1);

  if (existingDemo) {
    return c.json(
      { error: "Category has demos; move or delete demos first." },
      409,
    );
  }

  const [deleted] = await db
    .delete(demoCategories)
    .where(eq(demoCategories.id, categoryId))
    .returning({ id: demoCategories.id });

  if (!deleted) {
    return c.json({ error: "Category not found" }, 404);
  }

  return c.json({ success: true });
});

adminRoutes.post("/categories/reorder", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = reorderCategoriesSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { type, orderedIds } = parsed.data;
  const rows = await db
    .select({ id: demoCategories.id, type: demoCategories.type })
    .from(demoCategories)
    .where(inArray(demoCategories.id, orderedIds));

  if (rows.length !== orderedIds.length) {
    return c.json({ error: "One or more categories do not exist" }, 400);
  }
  if (rows.some((row) => row.type !== type)) {
    return c.json({ error: "All categories in reorder must have same type" }, 400);
  }

  await db.transaction(async (tx) => {
    for (const [sortOrder, id] of orderedIds.entries()) {
      await tx
        .update(demoCategories)
        .set({ sortOrder, updatedAt: new Date() })
        .where(and(eq(demoCategories.id, id), eq(demoCategories.type, type)));
    }
  });

  return c.json({ success: true });
});

adminRoutes.get("/demos", async (c) => {
  const categoryId = c.req.query("categoryId");

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

  return c.json({
    demos: demoRows.map((demo) => ({
      ...demo,
      files: filesByDemo.get(demo.id) ?? [],
    })),
  });
});

adminRoutes.post("/demos", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createDemoSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [category] = await db
    .select()
    .from(demoCategories)
    .where(eq(demoCategories.id, parsed.data.categoryId))
    .limit(1);

  if (!category) {
    return c.json({ error: "Category not found" }, 404);
  }

  const [sortRow] = await db
    .select({ maxSort: max(demos.sortOrder) })
    .from(demos)
    .where(eq(demos.categoryId, parsed.data.categoryId));

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
      sortOrder: (sortRow?.maxSort ?? -1) + 1,
    })
    .returning();

  const files = dedupeFiles(parsed.data.files);
  if (files.length > 0) {
    await db.insert(demoFiles).values(
      files.map((file, sortOrder) => ({
        id: createId("file"),
        demoId: demo.id,
        fileKind: file.fileKind,
        content: file.content,
        sortOrder,
      })),
    );
  }

  const persistedFiles = await db
    .select()
    .from(demoFiles)
    .where(eq(demoFiles.demoId, demo.id))
    .orderBy(asc(demoFiles.sortOrder));

  return c.json({ demo: { ...demo, files: persistedFiles } }, 201);
});

adminRoutes.patch("/demos/:id", async (c) => {
  const demoId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = updateDemoSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [existing] = await db.select().from(demos).where(eq(demos.id, demoId)).limit(1);
  if (!existing) {
    return c.json({ error: "Demo not found" }, 404);
  }

  const updateData: Partial<typeof demos.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (parsed.data.categoryId !== undefined) {
    const [targetCategory] = await db
      .select()
      .from(demoCategories)
      .where(eq(demoCategories.id, parsed.data.categoryId))
      .limit(1);

    if (!targetCategory) {
      return c.json({ error: "Target category not found" }, 404);
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

  if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.difficulty !== undefined) updateData.difficulty = parsed.data.difficulty;
  if (parsed.data.support !== undefined) updateData.support = parsed.data.support;
  if (parsed.data.slug !== undefined) {
    updateData.slug = toSlug(parsed.data.slug);
  } else if (parsed.data.title !== undefined) {
    updateData.slug = toSlug(parsed.data.title);
  }

  const [demo] = await db
    .update(demos)
    .set(updateData)
    .where(eq(demos.id, demoId))
    .returning();

  if (!demo) {
    return c.json({ error: "Demo update failed" }, 500);
  }

  return c.json({ demo });
});

adminRoutes.delete("/demos/:id", async (c) => {
  const demoId = c.req.param("id");
  const [deleted] = await db
    .delete(demos)
    .where(eq(demos.id, demoId))
    .returning({ id: demos.id });

  if (!deleted) {
    return c.json({ error: "Demo not found" }, 404);
  }

  return c.json({ success: true });
});

adminRoutes.post("/demos/reorder", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = reorderDemosSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { categoryId, orderedIds } = parsed.data;

  const rows = await db
    .select({ id: demos.id, categoryId: demos.categoryId })
    .from(demos)
    .where(inArray(demos.id, orderedIds));

  if (rows.length !== orderedIds.length) {
    return c.json({ error: "One or more demos do not exist" }, 400);
  }

  if (rows.some((row) => row.categoryId !== categoryId)) {
    return c.json({ error: "All demos must belong to the same category" }, 400);
  }

  await db.transaction(async (tx) => {
    for (const [sortOrder, id] of orderedIds.entries()) {
      await tx
        .update(demos)
        .set({ sortOrder, updatedAt: new Date() })
        .where(eq(demos.id, id));
    }
  });

  return c.json({ success: true });
});

adminRoutes.put("/demos/:id/files", async (c) => {
  const demoId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = upsertFilesSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [demo] = await db
    .select({ id: demos.id })
    .from(demos)
    .where(eq(demos.id, demoId))
    .limit(1);

  if (!demo) {
    return c.json({ error: "Demo not found" }, 404);
  }

  const deduped = dedupeFiles(parsed.data.files);

  await db.transaction(async (tx) => {
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

  const files = await db
    .select()
    .from(demoFiles)
    .where(eq(demoFiles.demoId, demoId))
    .orderBy(asc(demoFiles.sortOrder));

  return c.json({ files });
});

adminRoutes.post("/demos/:id/publish", async (c) => {
  const demoId = c.req.param("id");
  const body = await c.req.json().catch(() => null);
  const parsed = publishDemoSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [existing] = await db.select().from(demos).where(eq(demos.id, demoId)).limit(1);
  if (!existing) {
    return c.json({ error: "Demo not found" }, 404);
  }

  const [targetCategory] = await db
    .select()
    .from(demoCategories)
    .where(eq(demoCategories.id, parsed.data.categoryId))
    .limit(1);
  if (!targetCategory) {
    return c.json({ error: "Category not found" }, 404);
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

  return c.json({
    demo: {
      ...publishedDemo,
      files: publishedFiles,
    },
  });
});
