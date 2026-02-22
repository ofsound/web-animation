import { loadPublicGalleryPayload } from "../../server/routes/public.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function gallery(): Promise<Response> {
  try {
    const payload = await loadPublicGalleryPayload();
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Public gallery API failed.", error);
    const detail =
      error instanceof Error ? error.message : "Unknown gallery error";
    return new Response(
      JSON.stringify({ error: "Failed to load gallery", detail }),
      {
        status: 500,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
