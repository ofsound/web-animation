import "dotenv/config";

const DEFAULT_ADMIN_EMAIL = "ben@modernthings.net";
const DEFAULT_ADMIN_NAME = "ben";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

function parseTrustedOrigins(): string[] {
  const raw = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  if (!raw) {
    return ["http://localhost:5173", "http://localhost:8787"];
  }

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const serverEnv = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: requireEnv("DATABASE_URL"),
  BETTER_AUTH_SECRET: requireEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  BETTER_AUTH_TRUSTED_ORIGINS: parseTrustedOrigins(),
  BETTER_AUTH_ALLOW_SIGNUP: parseBoolean(process.env.BETTER_AUTH_ALLOW_SIGNUP),
  ADMIN_EMAIL: (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase(),
  ADMIN_NAME: process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  API_PORT: Number(process.env.API_PORT ?? 8787),
} as const;

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === serverEnv.ADMIN_EMAIL;
}
