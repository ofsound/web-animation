import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { adminRoutes } from "../routes/admin.js";

const app = new Hono();

app.route("/api/admin", adminRoutes);
app.route("/admin", adminRoutes);

const listener = getRequestListener(app.fetch);

export function handleAdminRequest(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  return listener(req, res);
}
