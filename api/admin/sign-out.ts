import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "../../server/auth.js";

const app = new Hono();

app.post("*", async (c) => {
  const url = new URL(c.req.url);
  const request = new Request(new URL("/api/auth/sign-out", url.origin), {
    method: "POST",
    headers: c.req.raw.headers,
  });

  return auth.handler(request);
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
