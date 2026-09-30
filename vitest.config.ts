import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["app/frontend/test/setup.ts"],
    include: ["app/frontend/test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["app/frontend/**/*.{ts,tsx}"],
      exclude: [
        "app/frontend/components/ui/**",
        "app/frontend/entrypoints/**",
        "app/frontend/test/**",
        "app/frontend/types/**",
      ],
      reportsDirectory: "coverage/frontend",
      reporter: ["text", "html", "clover", "json", "json-summary"],
      thresholds: {
        statements: 98,
        branches: 94,
        functions: 96,
        lines: 99,
        autoUpdate: (newThreshold) => Math.floor(newThreshold),
      },
    },
  },
});
