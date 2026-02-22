import { eq } from "drizzle-orm";
import { auth } from "../auth.js";
import { db } from "../db/client.js";
import { user } from "../db/schema.js";
import { serverEnv } from "../env.js";

async function main() {
  if (!serverEnv.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is required to seed the admin account.");
  }

  const [existing] = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.email, serverEnv.ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    console.log(`Admin already exists: ${existing.email}`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: serverEnv.ADMIN_EMAIL,
      password: serverEnv.ADMIN_PASSWORD,
      name: serverEnv.ADMIN_NAME,
    },
  });

  console.log(`Admin created: ${serverEnv.ADMIN_EMAIL}`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
