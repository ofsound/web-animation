import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";
import { loadPublicGalleryPayload } from "../../server/routes/public.js";

const app = new Hono();

app.use("*", cors());

app.get("*", async (c) => {
  const payload = await loadPublicGalleryPayload();
  return c.json(payload);
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
