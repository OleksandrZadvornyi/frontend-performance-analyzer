import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "test/",
        "**/*.config.js",
        "src/cli.js", // Exclude CLI entry point from coverage as it's hard to test
      ],
    },
  },
});
