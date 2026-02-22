import { handle } from "hono/vercel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type VercelHandler = (
  request: Request,
  context?: unknown,
) => Response | Promise<Response>;

let cachedHandler: VercelHandler | null = null;

export default async function entrypoint(
  request: Request,
  context?: unknown,
): Promise<Response> {
  try {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    if (!cachedHandler) {
      const { app } = await import("../server/app.js");
      cachedHandler = handle(app) as VercelHandler;
    }
    return await cachedHandler(request, context);
  } catch (error) {
    console.error("API bootstrap failure", error);
    const message =
      error instanceof Error ? error.message : "Unknown startup failure";
    return new Response(
      JSON.stringify({
        error: "API bootstrap failed",
        detail: message,
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json; charset=utf-8",
        },
      },
    );
  }
}
