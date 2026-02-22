import { loadPublicGalleryPayload } from "../../server/routes/public.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function handler() {
  const payload = await loadPublicGalleryPayload();
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
