import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/lib/**/*.{ts,tsx}"],
      exclude: [
        "src/lib/**/*.d.ts",
        "src/lib/**/*.test.{ts,tsx}",
        "src/integrations/**",
      ],
    },
  },
  resolve: {
    alias: {
      // Stub static asset imports (png/jpg/svg) so tests don't need real files.
      "@/assets/badges/first-step.png": "/dev-server/test/asset-stub.ts",
    },
  },
});
