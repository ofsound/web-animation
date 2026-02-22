export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function health(): Response {
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}
