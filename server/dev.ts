import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { serverEnv } from "./env.js";

serve(
  {
    fetch: app.fetch,
    port: serverEnv.API_PORT,
  },
  (info) => {
    console.log(`Hono API listening on http://localhost:${info.port}`);
  },
);
