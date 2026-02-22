import { Hono } from "hono";
import { handle } from "hono/vercel";
import { adminRoutes } from "../../server/routes/admin.js";

const app = new Hono();

app.route("/api/admin", adminRoutes);
app.route("/admin", adminRoutes);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
