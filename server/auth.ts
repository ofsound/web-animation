import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/client";
import { isAdminEmail, serverEnv } from "./env";

const allowSignUp = serverEnv.BETTER_AUTH_ALLOW_SIGNUP;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: serverEnv.BETTER_AUTH_TRUSTED_ORIGINS,
  emailAndPassword: {
    enabled: true,
    disableSignUp: !allowSignUp,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  rateLimit: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (inputUser) => {
          const email = String(inputUser.email ?? "").trim().toLowerCase();
          if (!isAdminEmail(email)) {
            return false;
          }

          return {
            data: {
              ...inputUser,
              email,
              name: String(inputUser.name ?? serverEnv.ADMIN_NAME),
            },
          };
        },
      },
    },
  },
});
