import { serve } from "@hono/node-server";
import { app } from "./app";
import { serverEnv } from "./env";

serve(
  {
    fetch: app.fetch,
    port: serverEnv.API_PORT,
  },
  (info) => {
    console.log(`Hono API listening on http://localhost:${info.port}`);
  },
);
