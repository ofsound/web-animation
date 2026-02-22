import { handleAdminRequest } from "../../../../server/vercel/adminHandler.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function handler(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  return handleAdminRequest(req, res);
}
