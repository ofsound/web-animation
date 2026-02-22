import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import { auth } from "../../server/auth.js";

const app = new Hono();

app.all("*", async (c) => {
  const url = new URL(c.req.raw.url);
  const rewritten = new URL(`/api/auth/sign-in/email${url.search}`, url.origin);
  const body =
    c.req.raw.method === "GET" || c.req.raw.method === "HEAD"
      ? undefined
      : await c.req.raw.arrayBuffer();

  const request = new Request(rewritten.toString(), {
    method: c.req.raw.method,
    headers: c.req.raw.headers,
    body: body ? body.slice(0) : undefined,
  });

  return auth.handler(request);
});

export default handle(app);
