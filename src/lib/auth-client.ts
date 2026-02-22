import { createAuthClient } from "better-auth/client";

const baseURL =
  typeof window === "undefined" ? "http://localhost:5173" : window.location.origin;

export const authClient = createAuthClient({
  baseURL,
  basePath: "/api/auth",
});
