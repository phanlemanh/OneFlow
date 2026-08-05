import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    // tsconfig has `jsx: "preserve"` (Next.js); force the automatic runtime so
    // vitest (vite 8 / oxc) can execute .test.tsx component suites.
    oxc: { jsx: { runtime: "automatic" } },
    test: {
        environment: "node",
        include: ["src/**/*.test.{ts,tsx}"],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
