/**
 * Minimal health check - no Hono, no shared imports.
 * Uses legacy (req, res) format for Vercel Node.js compatibility.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function handler(
  _req: { method?: string },
  res: { status: (n: number) => { json: (o: object) => void } },
) {
  res.status(200).json({ status: "ok" });
}
