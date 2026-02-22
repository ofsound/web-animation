import { Hono, type Context } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import {
  AdminApiError,
  createCategory,
  createDemo,
  deleteCategory,
  deleteDemo,
  forwardSignInRequest,
  forwardSignOutRequest,
  getAdminSessionResponse,
  listCategories,
  listDemos,
  publishDemoById,
  reorderCategories,
  reorderDemos,
  requireAdminSession,
  type SessionPayload,
  updateCategory,
  updateDemo,
  upsertDemoFiles,
} from "../services/admin.js";

type AdminBindings = {
  Variables: {
    session: SessionPayload;
  };
};

export const adminRoutes = new Hono<AdminBindings>();

function isJsonRequestMethod(method: string): boolean {
  return !["GET", "HEAD"].includes(method.toUpperCase());
}

async function readJsonBody(c: Context): Promise<unknown> {
  if (!isJsonRequestMethod(c.req.raw.method)) {
    return null;
  }
  return c.req.json().catch(() => null);
}

adminRoutes.post("/sign-in", async (c) => {
  const url = new URL(c.req.url);
  const body = await c.req.raw.arrayBuffer();
  return forwardSignInRequest({
    origin: url.origin,
    headers: c.req.raw.headers,
    body: body.byteLength > 0 ? body.slice(0) : undefined,
  });
});

adminRoutes.post("/sign-out", async (c) => {
  const url = new URL(c.req.url);
  return forwardSignOutRequest({
    origin: url.origin,
    headers: c.req.raw.headers,
    method: c.req.raw.method,
  });
});

adminRoutes.use("*", async (c, next) => {
  const session = await requireAdminSession(c.req.raw.headers);
  c.set("session", session);
  await next();
});

adminRoutes.get("/session", async (c) => {
  return c.json(await getAdminSessionResponse(c.get("session")));
});

adminRoutes.get("/categories", async (c) => {
  return c.json(await listCategories());
});

adminRoutes.post("/categories", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await createCategory(body), 201);
});

adminRoutes.patch("/categories/:id", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await updateCategory(c.req.param("id"), body));
});

adminRoutes.delete("/categories/:id", async (c) => {
  return c.json(await deleteCategory(c.req.param("id")));
});

adminRoutes.post("/categories/reorder", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await reorderCategories(body));
});

adminRoutes.get("/demos", async (c) => {
  return c.json(await listDemos(c.req.query("categoryId")));
});

adminRoutes.post("/demos", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await createDemo(body), 201);
});

adminRoutes.patch("/demos/:id", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await updateDemo(c.req.param("id"), body));
});

adminRoutes.delete("/demos/:id", async (c) => {
  return c.json(await deleteDemo(c.req.param("id")));
});

adminRoutes.post("/demos/:id/delete", async (c) => {
  return c.json(await deleteDemo(c.req.param("id")));
});

adminRoutes.post("/demos/reorder", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await reorderDemos(body));
});

adminRoutes.put("/demos/:id/files", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await upsertDemoFiles(c.req.param("id"), body));
});

adminRoutes.post("/demos/:id/publish", async (c) => {
  const body = await readJsonBody(c);
  return c.json(await publishDemoById(c.req.param("id"), body));
});

adminRoutes.onError((error, c) => {
  if (error instanceof AdminApiError) {
    return c.newResponse(JSON.stringify(error.body), error.status as StatusCode, {
      "Content-Type": "application/json",
    });
  }
  console.error("[adminRoutes] Unexpected error:", error);
  return c.json({ error: "Internal server error" }, 500);
});
