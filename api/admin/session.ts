import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "../../server/auth.js";
import { isAdminEmail } from "../../server/env.js";

const app = new Hono();

app.get("*", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!isAdminEmail(session.user.email)) {
    return c.json({ error: "Forbidden" }, 403);
  }

  return c.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
  });
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
