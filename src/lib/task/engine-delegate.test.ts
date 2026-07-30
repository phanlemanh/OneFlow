import { describe, expect, it, vi } from "vitest";

/**
 * `engine-delegate.server.ts` imports `"server-only"` and, transitively,
 * `@/db`, `@/lib/file/storage.server`, and `@/lib/settings/env-store.server`
 * — each of which resolves to a cloud-shell seam under `@ext/*` that vitest's
 * alias config (only `@/*`) does not know how to resolve. Mock those exact
 * module paths so the real `engine-delegate.server` module loads for real:
 * this test needs its actual `tenantFor` / `dataRootFor` logic, not a stub.
 * `@/lib/runtime/scope.server` is deliberately left unmocked — only its own
 * `@ext/scope` dependency is stubbed — because the test compares
 * `dataRootFor` against that module's real `scopedDataDirFor`. `./emitter`
 * re-exports from `@ext/task-events` the same way, so it is mocked directly
 * rather than mocking `@ext/task-events` itself. `./engine-asset-tokens.server`
 * re-exports from `@ext/asset-token` and gets the same treatment.
 */
vi.mock("server-only", () => ({}));
vi.mock("@ext/scope", () => ({ resolveScope: async () => "" }));
vi.mock("@/db", () => ({ getDb: vi.fn(), tasks: {} }));
vi.mock("@/lib/file/storage.server", () => ({
    getStorage: () => ({ remote: null }),
}));
vi.mock("@/lib/settings/env-store.server", () => ({
    withStoredEnv: async (env: Record<string, string>) => env,
}));
vi.mock("./emitter", () => ({
    notifyTask: vi.fn(),
    registerTask: vi.fn(),
    removeTask: vi.fn(),
}));
vi.mock("./engine-asset-tokens.server", () => ({
    issueEngineAssetToken: vi.fn(),
    revokeEngineAssetToken: vi.fn(),
}));

describe("engine delegate options", () => {
    it("translates scope into an explicit tenant sentinel", async () => {
        // Empty scope is the single-tenant OSS build; it must become "local",
        // never the empty string — an empty tenant is what the engine treats as
        // "not declared", and a misconfigured cloud looks identical to it.
        const { tenantFor } = await import("./engine-delegate.server");
        expect(tenantFor("")).toBe("local");
        expect(tenantFor("abc")).toBe("user:abc");
        for (const scope of ["", "abc"]) {
            expect(tenantFor(scope)).not.toBe("");
        }
    });

    it("data_dir is stable across two consecutive runs for one scope", async () => {
        const { dataRootFor } = await import("./engine-delegate.server");
        const a = dataRootFor("abc");
        const b = dataRootFor("abc");
        expect(a).toBe(b);
        // And it must derive from the scoped data dir, not a per-task or temp
        // path: a hardcoded constant would satisfy equality alone.
        const { scopedDataDirFor } = await import("@/lib/runtime/scope.server");
        expect(a).toBe(scopedDataDirFor("abc"));
    });
});
