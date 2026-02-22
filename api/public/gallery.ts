import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import { loadPublicGalleryPayload } from "../../server/routes/public.js";

const app = new Hono();

app.get("*", async (c) => {
  try {
    const payload = await loadPublicGalleryPayload();
    return c.json(payload);
  } catch (error) {
    console.error("Public gallery API failed.", error);
    return c.json(
      {
        error: "Failed to load gallery",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

export default handle(app);
