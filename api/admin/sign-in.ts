/**
 * Standalone sign-in handler - bypasses Hono for reliability on Vercel.
 * Takes precedence over the catch-all [...route].ts for POST /api/admin/sign-in.
 */
import { auth } from "../../server/auth.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function handler(
  req: import("node:http").IncomingMessage,
  res: import("node:http").ServerResponse,
) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);

  const host = req.headers.host ?? "localhost";
  const protoRaw = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(protoRaw) ? protoRaw[0] : protoRaw) ?? "https";
  const origin = `${proto === "https" ? "https" : "http"}://${host}`;
  const request = new Request(new URL("/api/auth/sign-in/email", origin), {
    method: "POST",
    headers: req.headers as HeadersInit,
    body: body.length > 0 ? body : undefined,
  });

  const AUTH_TIMEOUT_MS = 20_000;
  try {
    const response = await Promise.race([
      auth.handler(request),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Auth handler timed out")),
          AUTH_TIMEOUT_MS,
        ),
      ),
    ]);

    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const responseBody = await response.text();
    res.end(responseBody);
  } catch (error) {
    console.error("[sign-in] Error:", error);
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Sign-in failed",
      }),
    );
  }
}
