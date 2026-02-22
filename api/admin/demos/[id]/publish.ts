/**
 * Standalone publish handler - Vercel's catch-all doesn't route nested paths correctly.
 * Takes precedence for POST /api/admin/demos/:id/publish.
 */
import { auth } from "../../../../server/auth.js";
import { isAdminEmail } from "../../../../server/env.js";
import { publishDemo } from "../../../../server/publishDemo.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sendJson(
  res: import("node:http").ServerResponse,
  status: number,
  data: object,
) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));
}

export default async function handler(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  const sendError = (status: number, message: string) => {
    sendJson(res, status, { error: message });
  };

  try {
    if (req.method !== "POST") {
      sendError(405, "Method not allowed");
      return;
    }

    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });
    if (!session) {
      sendError(401, "Unauthorized");
      return;
    }
    if (!isAdminEmail(session.user.email)) {
      sendError(403, "Forbidden");
      return;
    }

    const url = req.url ?? "";
    const path = url.startsWith("http") ? new URL(url).pathname : url;
    const match = path.match(/\/api\/admin\/demos\/([^/]+)\/publish/);
    const id = match?.[1];
    if (!id) {
      sendError(400, "Missing demo id");
      return;
    }

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks);
    let parsed: unknown;
    try {
      parsed = body.length > 0 ? JSON.parse(body.toString()) : {};
    } catch {
      sendError(400, "Invalid JSON body");
      return;
    }

    try {
      const result = await publishDemo(id, parsed);
      sendJson(res, 200, result);
    } catch (err) {
      if (err && typeof err === "object" && "status" in err && "error" in err) {
        sendJson(res, (err as { status: number }).status, {
          error: (err as { error: unknown }).error,
        });
      } else {
        console.error("[publish] Error:", err);
        sendError(500, "Publish failed");
      }
    }
  } catch (err) {
    console.error("[publish] Handler error:", err);
    sendError(500, err instanceof Error ? err.message : "Internal server error");
  }
}
