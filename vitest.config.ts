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
            // tsconfig maps `@ext/*` to `src/ext/*` then `src/ext-default/*`;
            // vite aliases have no fallback form, and `src/ext/` is gitignored
            // (a cloud shell links its own there), so under test the alias
            // always resolves to the default implementations — the same ones a
            // plain checkout builds with. Without this, nothing downstream of
            // `@ext/storage-driver` is reachable from a test at all, which is
            // how the AC-9 round trip ended up asserting against a mock.
            "@ext": path.resolve(__dirname, "./src/ext-default"),
        },
    },
});
