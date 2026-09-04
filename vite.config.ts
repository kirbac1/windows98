import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Everything ships as one static bundle — there is no server side to this
// machine. base stays "/" because the site owns its own subdomain.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "es2020",
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
