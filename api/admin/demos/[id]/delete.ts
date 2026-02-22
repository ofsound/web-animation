/**
 * Standalone delete handler for Vercel reliability.
 * Takes precedence for POST/DELETE /api/admin/demos/:id/delete.
 */
import { eq } from "drizzle-orm";
import { auth } from "../../../../server/auth.js";
import { db } from "../../../../server/db/client.js";
import { demos } from "../../../../server/db/schema.js";
import { isAdminEmail } from "../../../../server/env.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  data: object,
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  const method = req.method ?? "GET";
  if (method !== "POST" && method !== "DELETE") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });
    if (!session) {
      sendJson(res, 401, { error: "Unauthorized" });
      return;
    }
    if (!isAdminEmail(session.user.email)) {
      sendJson(res, 403, { error: "Forbidden" });
      return;
    }

    const url = req.url ?? "";
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const match = path.match(/\/api\/admin\/demos\/([^/]+)\/delete/);
    const id = match?.[1];
    if (!id) {
      sendJson(res, 400, { error: "Missing demo id" });
      return;
    }

    const [deleted] = await db
      .delete(demos)
      .where(eq(demos.id, id))
      .returning({ id: demos.id });

    if (!deleted) {
      sendJson(res, 404, { error: "Demo not found" });
      return;
    }

    sendJson(res, 200, { success: true });
  } catch (error) {
    console.error("[delete-demo] Error:", error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
