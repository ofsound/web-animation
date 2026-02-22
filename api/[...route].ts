import { handle } from "@hono/node-server/vercel";
import { app } from "../server/app.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
