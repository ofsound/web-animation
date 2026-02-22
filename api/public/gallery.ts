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

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
} as const;

export default async function handler() {
  try {
    const payload = await withTimeout(
      loadPublicGalleryPayload(),
      DB_TIMEOUT_MS,
    );
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database error";
    console.error("[gallery] Error:", message, error);
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 503,
        headers: jsonHeaders,
      },
    );
  }
}
