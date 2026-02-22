import { Hono } from "hono";
import { handle } from "hono/vercel";
import { loadPublicGalleryPayload } from "../../server/routes/public.js";

const app = new Hono();

app.get("*", async (c) => {
  const payload = await loadPublicGalleryPayload();
  return c.json(payload);
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
