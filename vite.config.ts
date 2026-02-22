/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { inspectorServer } from "@react-dev-inspector/vite-plugin";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [
      ...(isDev ? [inspectorServer()] : []),
      react({
        ...(isDev
          ? {
              babel: {
                plugins: ["@react-dev-inspector/babel-plugin"],
              },
            }
          : {}),
      }),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_ORIGIN ?? "http://localhost:8787",
          changeOrigin: false,
        },
      },
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
