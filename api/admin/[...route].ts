import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { adminRoutes } from "../../server/routes/admin.js";

const app = new Hono();

app.route("/api/admin", adminRoutes);
app.route("/admin", adminRoutes);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const listener = getRequestListener(app.fetch);

export default function handler(req: import("node:http").IncomingMessage, res: import("node:http").ServerResponse) {
  return listener(req, res);
}
