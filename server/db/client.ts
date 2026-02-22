import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { serverEnv } from "../env";
import * as schema from "./schema";

const sql = neon(serverEnv.DATABASE_URL);

export const db = drizzle({
  client: sql,
  schema,
});
