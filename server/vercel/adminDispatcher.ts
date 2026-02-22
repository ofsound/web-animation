import type { IncomingMessage, ServerResponse } from "node:http";
import {
  AdminApiError,
  createCategory,
  createDemo,
  deleteCategory,
  deleteDemo,
  forwardSignInRequest,
  forwardSignOutRequest,
  getAdminSessionResponse,
  listCategories,
  listDemos,
  publishDemoById,
  reorderCategories,
  reorderDemos,
  requireAdminSession,
  updateCategory,
  updateDemo,
  upsertDemoFiles,
} from "../services/admin.js";

type RouteKey =
  | "sign-in"
  | "sign-out"
  | "session"
  | "categories"
  | "categories-reorder"
  | "category-by-id"
  | "demos"
  | "demos-reorder"
  | "demo-by-id"
  | "demo-delete-legacy"
  | "demo-files"
  | "demo-publish";

type RouteDefinition = {
  key: RouteKey;
  methods: readonly string[];
  pattern: RegExp;
};

type RouteMatch = {
  key: RouteKey;
  params: {
    id?: string;
  };
};

type MatchResult =
  | { type: "match"; route: RouteMatch }
  | { type: "method_not_allowed"; allow: string[] }
  | { type: "not_found" };

const ROUTES: readonly RouteDefinition[] = [
  { key: "sign-in", methods: ["POST"], pattern: /^\/api\/admin\/sign-in$/ },
  { key: "sign-out", methods: ["POST"], pattern: /^\/api\/admin\/sign-out$/ },
  { key: "session", methods: ["GET"], pattern: /^\/api\/admin\/session$/ },
  {
    key: "categories-reorder",
    methods: ["POST"],
    pattern: /^\/api\/admin\/categories\/reorder$/,
  },
  {
    key: "category-by-id",
    methods: ["PATCH", "DELETE"],
    pattern: /^\/api\/admin\/categories\/([^/]+)$/,
  },
  {
    key: "categories",
    methods: ["GET", "POST"],
    pattern: /^\/api\/admin\/categories$/,
  },
  {
    key: "demos-reorder",
    methods: ["POST"],
    pattern: /^\/api\/admin\/demos\/reorder$/,
  },
  {
    key: "demo-publish",
    methods: ["POST"],
    pattern: /^\/api\/admin\/demos\/([^/]+)\/publish$/,
  },
  {
    key: "demo-files",
    methods: ["PUT"],
    pattern: /^\/api\/admin\/demos\/([^/]+)\/files$/,
  },
  {
    key: "demo-delete-legacy",
    methods: ["POST"],
    pattern: /^\/api\/admin\/demos\/([^/]+)\/delete$/,
  },
  {
    key: "demo-by-id",
    methods: ["PATCH", "DELETE"],
    pattern: /^\/api\/admin\/demos\/([^/]+)$/,
  },
  {
    key: "demos",
    methods: ["GET", "POST"],
    pattern: /^\/api\/admin\/demos$/,
  },
] as const;

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function getOrigin(req: IncomingMessage): string {
  const host = req.headers.host ?? "localhost";
  const protoRaw = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(protoRaw) ? protoRaw[0] : protoRaw) ?? "https";
  return `${proto === "https" ? "https" : "http"}://${host}`;
}

function decodeParam(value: string | undefined): string {
  if (!value) {
    throw new AdminApiError(400, { error: "Missing id parameter" });
  }
  try {
    return decodeURIComponent(value);
  } catch {
    throw new AdminApiError(400, { error: "Invalid path parameter" });
  }
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
) {
  res.statusCode = status;
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function sendFetchResponse(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  const headerMap = toNodeHeaderMap(response.headers);

  for (const [key, values] of headerMap.entries()) {
    if (key.toLowerCase() === "set-cookie") {
      res.setHeader(key, values);
      continue;
    }
    res.setHeader(key, values.join(", "));
  }

  const responseBody = await response.text();
  res.end(responseBody);
}

export function toNodeHeaderMap(headers: Headers): Map<string, string[]> {
  const headerMap = new Map<string, string[]>();
  headers.forEach((value, key) => {
    const existing = headerMap.get(key) ?? [];
    existing.push(value);
    headerMap.set(key, existing);
  });
  return headerMap;
}

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const body = await readBody(req);
  if (body.length === 0) return {};
  try {
    return JSON.parse(body.toString());
  } catch {
    throw new AdminApiError(400, { error: "Invalid JSON body" });
  }
}

export function matchAdminRoute(method: string, pathname: string): MatchResult {
  const normalizedPath = normalizePath(pathname);
  const methodUpper = method.toUpperCase();
  let lastMatchByPath: RouteDefinition | null = null;

  for (const route of ROUTES) {
    const result = normalizedPath.match(route.pattern);
    if (!result) continue;
    lastMatchByPath = route;

    if (!route.methods.includes(methodUpper)) {
      continue;
    }

    const id = result[1];
    return {
      type: "match",
      route: {
        key: route.key,
        params: {
          id,
        },
      },
    };
  }

  if (lastMatchByPath) {
    return { type: "method_not_allowed", allow: [...lastMatchByPath.methods] };
  }

  return { type: "not_found" };
}

export async function handleAdminRequest(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const method = (req.method ?? "GET").toUpperCase();
  const url = new URL(req.url ?? "/api/admin", getOrigin(req));
  const matched = matchAdminRoute(method, url.pathname);

  if (matched.type === "not_found") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  if (matched.type === "method_not_allowed") {
    sendJson(
      res,
      405,
      { error: "Method not allowed" },
      { Allow: matched.allow.join(", ") },
    );
    return;
  }

  try {
    const route = matched.route;
    if (route.key === "sign-in") {
      const body = await readBody(req);
      const response = await forwardSignInRequest({
        origin: url.origin,
        headers: req.headers as HeadersInit,
        body: body.length > 0 ? new Uint8Array(body) : undefined,
      });
      await sendFetchResponse(res, response);
      return;
    }

    if (route.key === "sign-out") {
      const response = await forwardSignOutRequest({
        origin: url.origin,
        headers: req.headers as HeadersInit,
        method,
      });
      await sendFetchResponse(res, response);
      return;
    }

    const session = await requireAdminSession(req.headers as HeadersInit);
    if (route.key === "session") {
      sendJson(res, 200, await getAdminSessionResponse(session));
      return;
    }

    if (route.key === "categories") {
      if (method === "GET") {
        sendJson(res, 200, await listCategories());
      } else {
        sendJson(res, 201, await createCategory(await readJsonBody(req)));
      }
      return;
    }

    if (route.key === "categories-reorder") {
      sendJson(res, 200, await reorderCategories(await readJsonBody(req)));
      return;
    }

    if (route.key === "category-by-id") {
      const id = decodeParam(route.params.id);
      if (method === "PATCH") {
        sendJson(res, 200, await updateCategory(id, await readJsonBody(req)));
      } else {
        sendJson(res, 200, await deleteCategory(id));
      }
      return;
    }

    if (route.key === "demos") {
      if (method === "GET") {
        sendJson(res, 200, await listDemos(url.searchParams.get("categoryId")));
      } else {
        sendJson(res, 201, await createDemo(await readJsonBody(req)));
      }
      return;
    }

    if (route.key === "demos-reorder") {
      sendJson(res, 200, await reorderDemos(await readJsonBody(req)));
      return;
    }

    if (route.key === "demo-by-id") {
      const id = decodeParam(route.params.id);
      if (method === "PATCH") {
        sendJson(res, 200, await updateDemo(id, await readJsonBody(req)));
      } else {
        sendJson(res, 200, await deleteDemo(id));
      }
      return;
    }

    if (route.key === "demo-delete-legacy") {
      sendJson(res, 200, await deleteDemo(decodeParam(route.params.id)));
      return;
    }

    if (route.key === "demo-files") {
      sendJson(
        res,
        200,
        await upsertDemoFiles(
          decodeParam(route.params.id),
          await readJsonBody(req),
        ),
      );
      return;
    }

    if (route.key === "demo-publish") {
      sendJson(
        res,
        200,
        await publishDemoById(
          decodeParam(route.params.id),
          await readJsonBody(req),
        ),
      );
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    if (error instanceof AdminApiError) {
      sendJson(res, error.status, error.body);
      return;
    }
    console.error("[admin-dispatcher] Unexpected error:", error);
    sendJson(res, 500, { error: "Internal server error" });
  }
}
