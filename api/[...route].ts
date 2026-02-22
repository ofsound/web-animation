import { handle } from "hono/vercel";
import { app } from "../server/app";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default handle(app);
