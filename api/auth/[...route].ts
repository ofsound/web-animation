import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "../../server/auth.js";

const app = new Hono();

app.all("*", async (c) => auth.handler(c.req.raw));

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
