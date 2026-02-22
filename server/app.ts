import { Hono, type Context } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { auth } from "./auth.js";
import { adminRoutes } from "./routes/admin.js";
import { publicRoutes } from "./routes/public.js";

export const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
    xFrameOptions: "SAMEORIGIN",
    xContentTypeOptions: "nosniff",
    referrerPolicy: "strict-origin-when-cross-origin",
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/api/health", (c) => c.json({ status: "ok" }));

const authHandler = async (c: Context) => {
  return auth.handler(c.req.raw);
};
app.all("/api/auth/*", authHandler);

app.route("/api/admin", adminRoutes);
app.route("/api/public", publicRoutes);

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});
