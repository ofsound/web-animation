/**
 * Minimal health check - no Hono, no shared imports.
 * Use this to verify Vercel serverless functions respond.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function handler() {
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
