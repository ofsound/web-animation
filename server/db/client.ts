import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { serverEnv } from "../env.js";
import * as schema from "./schema.js";

const sql = neon(serverEnv.DATABASE_URL);

export const db = drizzle({
  client: sql,
  schema,
});
