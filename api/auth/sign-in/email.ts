import { Hono } from "hono";
import { handle } from "@hono/node-server/vercel";
import { auth } from "../../../server/auth.js";

const app = new Hono();

app.all("*", async (c) => {
  return auth.handler(c.req.raw);
});

export default handle(app);
