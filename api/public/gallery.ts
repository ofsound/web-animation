import { loadPublicGalleryPayload } from "../../server/routes/public.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DB_TIMEOUT_MS = 25_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Database request timed out")), ms),
    ),
  ]);
}

export default async function handler(
  _req: { method?: string },
  res: { status: (n: number) => { json: (o: object) => void }; setHeader: (k: string, v: string) => unknown },
) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  try {
    const payload = await withTimeout(
      loadPublicGalleryPayload(),
      DB_TIMEOUT_MS,
    );
    res.status(200).json(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database error";
    console.error("[gallery] Error:", message, error);
    res.status(503).json({ error: message });
  }
}
