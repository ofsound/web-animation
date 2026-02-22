import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { auth } from "../../server/auth.js";

const app = new Hono();

app.all("*", async (c) => auth.handler(c.req.raw));

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listener = getRequestListener(app.fetch);

export default function handler(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) {
  return listener(req, res);
}
