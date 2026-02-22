import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import { auth } from "../../server/auth.js";

const app = new Hono();

function toCandidatePaths(pathname: string): string[] {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const candidates = new Set<string>();

  candidates.add(withLeadingSlash);

  const withoutApiAuth = withLeadingSlash.replace(/^\/api\/auth/, "") || "/";
  const normalizedWithoutPrefix = withoutApiAuth.startsWith("/")
    ? withoutApiAuth
    : `/${withoutApiAuth}`;
  candidates.add(`/api/auth${normalizedWithoutPrefix === "/" ? "" : normalizedWithoutPrefix}`);

  if (normalizedWithoutPrefix === "/email") {
    candidates.add("/api/auth/sign-in/email");
  }

  if (normalizedWithoutPrefix === "/sign-in/email") {
    candidates.add("/api/auth/sign-in/email");
  }

  return Array.from(candidates);
}

app.all("*", async (c) => {
  const url = new URL(c.req.raw.url);
  const body =
    c.req.raw.method === "GET" || c.req.raw.method === "HEAD"
      ? undefined
      : await c.req.raw.arrayBuffer();

  const candidates = toCandidatePaths(url.pathname);
  let lastResponse: Response | null = null;

  for (const pathname of candidates) {
    const nextUrl = new URL(pathname + url.search, url.origin);
    const request = new Request(nextUrl.toString(), {
      method: c.req.raw.method,
      headers: c.req.raw.headers,
      body: body ? body.slice(0) : undefined,
    });

    const response = await auth.handler(request);
    lastResponse = response;

    if (response.status !== 404) {
      return response;
    }
  }

  return lastResponse ?? new Response("Not Found", { status: 404 });
});

export default handle(app);
