import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono();

app.get("*", (c) => c.json({ status: "ok" }));

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
