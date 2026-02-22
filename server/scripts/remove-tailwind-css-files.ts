import "dotenv/config";

import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { demoFiles } from "../db/schema.js";

async function main(): Promise<void> {
  const existing = await db
    .select({ id: demoFiles.id })
    .from(demoFiles)
    .where(eq(demoFiles.fileKind, "tailwind_css"));

  if (existing.length === 0) {
    console.log("No demo_files rows with file_kind='tailwind_css' found.");
    return;
  }

  await db.delete(demoFiles).where(eq(demoFiles.fileKind, "tailwind_css"));
  console.log(`Deleted ${existing.length} demo_files rows with file_kind='tailwind_css'.`);
}

main().catch((error: unknown) => {
  console.error("Failed to remove tailwind_css demo files.");
  console.error(error);
  process.exitCode = 1;
});
