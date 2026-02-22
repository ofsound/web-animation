export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default function notFoundFallback(request: Request): Response {
  const url = new URL(request.url);
  return new Response(
    JSON.stringify({
      error: "Not found",
      path: url.pathname,
    }),
    {
      status: 404,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
