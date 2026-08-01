import { EventEmitter } from "node:events";
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
 *
 * `@/db` additionally needs the REAL drizzle `tasks` table object (not `{}`)
 * for the wiring tests below, which drive `executeWorkflowViaEngine` end to
 * end and assert on the actual `db.update(tasks).set(...)` payload — `eq`
 * needs a real Column, not an empty object. `node:child_process`'s `spawn`
 * and `@/lib/plugins/plugin-python-env.server`'s `resolveBasePython` are
 * mocked so those same wiring tests never touch a real subprocess.
 */
const hoisted = vi.hoisted(() => ({
    spawn: vi.fn(),
    getDb: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@ext/scope", () => ({ resolveScope: async () => "" }));
vi.mock("@/db", async () => {
    const schema = await vi.importActual<
        typeof import("@/db/workspace.schema")
    >("@/db/workspace.schema");
    return { getDb: hoisted.getDb, tasks: schema.tasks };
});
vi.mock("@/lib/file/storage.server", () => ({
    getStorage: () => ({ remote: null }),
}));
vi.mock("@/lib/settings/env-store.server", () => ({
    withStoredEnv: async (env: Record<string, string>) => env,
}));
vi.mock("./emitter", () => ({
    notifyTask: vi.fn(),
    registerTask: () => ({ signal: new AbortController().signal }),
    removeTask: vi.fn(),
}));
vi.mock("./engine-asset-tokens.server", () => ({
    issueEngineAssetToken: vi.fn(),
    revokeEngineAssetToken: vi.fn(),
}));
vi.mock("node:child_process", () => ({ spawn: hoisted.spawn }));
vi.mock("@/lib/plugins/plugin-python-env.server", () => ({
    resolveBasePython: () => "python3",
}));

/** A minimal `ChildProcess`-shaped fake: stdout/stderr emitters, a no-op
 * stdin, and the `exit`/`error` events the delegate listens for. */
function fakeChild() {
    const child = new EventEmitter() as EventEmitter & {
        stdout: EventEmitter;
        stderr: EventEmitter;
        stdin: { write: (s: string) => void; end: () => void };
        kill: () => void;
    };
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.stdin = { write: () => {}, end: () => {} };
    child.kill = () => {};
    return child;
}

/** Wires the mocked `getDb` to a fresh in-memory capture of every
 * `db.update(tasks).set(payload)` call the run under test makes. */
function captureDbUpdates(): Record<string, unknown>[] {
    const updates: Record<string, unknown>[] = [];
    hoisted.getDb.mockResolvedValue({
        update: () => ({
            set: (payload: Record<string, unknown>) => {
                updates.push(payload);
                return { where: async () => undefined };
            },
        }),
    });
    return updates;
}

describe("engine delegate options", () => {
    it("translates scope into an explicit tenant sentinel", async () => {
        // Empty scope is the single-tenant OSS build; it must become "local",
        // never the empty string — an empty tenant is what the engine treats as
        // "not declared", and a misconfigured cloud looks identical to it.
        const { tenantFor, engineOptionsFor } = await import(
            "./engine-delegate.server"
        );
        expect(tenantFor("")).toBe("local");
        expect(tenantFor("abc")).toBe("user:abc");
        for (const scope of ["", "abc"]) {
            expect(tenantFor(scope)).not.toBe("");
        }

        // Hold the WIRING itself, not just the helper: assert the actual
        // `options` object the engine request carries, so a reviewer deleting
        // `tenant: tenantFor(scope)` from the request reddens this test.
        const extras = {
            pluginsDir: "/plugins",
            assetOptions: {},
            autoInstall: true,
            taskId: "task-1",
            workflowId: null,
        };
        expect(engineOptionsFor("", extras).tenant).toBe("local");
        expect(engineOptionsFor("abc", extras).tenant).toBe("user:abc");
        for (const scope of ["", "abc"]) {
            expect(engineOptionsFor(scope, extras).tenant).not.toBe("");
        }
    });

    it("data_dir is stable across two consecutive runs for one scope", async () => {
        const { dataRootFor, engineOptionsFor } = await import(
            "./engine-delegate.server"
        );
        const a = dataRootFor("abc");
        const b = dataRootFor("abc");
        expect(a).toBe(b);
        // And it must derive from the scoped data dir, not a per-task or temp
        // path: a hardcoded constant would satisfy equality alone.
        const { scopedDataDirFor } = await import("@/lib/runtime/scope.server");
        expect(a).toBe(scopedDataDirFor("abc"));

        // Same for the wired `options.data_dir`: hardcoding it (e.g. "/tmp/nope")
        // inside the request must fail this assertion, not just the pure helper.
        const extras = {
            pluginsDir: "/plugins",
            assetOptions: {},
            autoInstall: true,
            taskId: "task-1",
            workflowId: null,
        };
        const optsA = engineOptionsFor("abc", extras);
        const optsB = engineOptionsFor("abc", extras);
        expect(optsA.data_dir).toBe(scopedDataDirFor("abc"));
        expect(optsA.data_dir).toBe(optsB.data_dir);
    });

    it("emits options.workflow_id as a numeric string, or null — never an empty string", async () => {
        // AC-9 (cross-layer): runner.ts threads task.workflowId through
        // engineOptionsFor into options.workflow_id. Assert on the actual
        // built OBJECT (not a standalone helper) so deleting the
        // `workflow_id` line from the builder reddens this test.
        //
        // `workflowId` is a REQUIRED field of `EngineOptionsExtras` (I1
        // fix): a non-workflow task must pass `workflowId: null` explicitly,
        // there is no "omitted" case to test here anymore — omitting it is
        // now a `pnpm typecheck` failure, not a runtime null. See the I1
        // mutation proof (delete `workflowId,` from the extras object in
        // engine-delegate.server.ts) for that guarantee.
        const { engineOptionsFor } = await import("./engine-delegate.server");
        const baseExtras = {
            pluginsDir: "/plugins",
            assetOptions: {},
            autoInstall: true,
            taskId: "task-1",
        };

        const withId = engineOptionsFor("", { ...baseExtras, workflowId: 41 });
        expect(withId.workflow_id).toBe("41");
        expect(withId.workflow_id).not.toBe("");

        const withNull = engineOptionsFor("", {
            ...baseExtras,
            workflowId: null,
        });
        expect(withNull.workflow_id).toBeNull();
        expect(withNull.workflow_id).not.toBe("");
    });
});

describe("cache counters", () => {
    it("a present cache block maps to its numbers", async () => {
        const { cacheColumnsFrom } = await import("./engine-delegate.server");
        const result = { cache: { calls_total: 5, calls_cached: 2 } };
        expect(cacheColumnsFrom(result)).toEqual({
            cacheCallsTotal: 5,
            cacheCallsCached: 2,
        });
    });

    it("an absent cache block maps to both null — NULL, never a fabricated 0", async () => {
        const { cacheColumnsFrom } = await import("./engine-delegate.server");
        expect(cacheColumnsFrom({})).toEqual({
            cacheCallsTotal: null,
            cacheCallsCached: null,
        });
        expect(cacheColumnsFrom(null)).toEqual({
            cacheCallsTotal: null,
            cacheCallsCached: null,
        });
    });

    it("a cache block that is not an object maps to both null", async () => {
        const { cacheColumnsFrom } = await import("./engine-delegate.server");
        expect(cacheColumnsFrom({ cache: "x" })).toEqual({
            cacheCallsTotal: null,
            cacheCallsCached: null,
        });
    });

    it("a non-numeric counter (e.g. a stringified number) nulls only that field", async () => {
        const { cacheColumnsFrom } = await import("./engine-delegate.server");
        expect(
            cacheColumnsFrom({
                cache: { calls_total: "3", calls_cached: 2 },
            }),
        ).toEqual({
            cacheCallsTotal: null,
            cacheCallsCached: 2,
        });
    });

    /**
     * The four tests above hold the pure helper to the contract. They cannot
     * catch a wiring bug — the helper called correctly but never spread into
     * one of the two terminal `db.update(tasks).set(...)` calls. These two
     * drive `executeWorkflowViaEngine` end to end (mocked spawn + mocked db)
     * and assert on the actual persisted payload, the same "hold the WIRING
     * itself" standard the `engineOptionsFor` tests above apply.
     */
    describe("cache counters wiring — the actual terminal db.update calls", () => {
        it("spreads cacheColumnsFrom into the success terminal update", async () => {
            const { executeWorkflowViaEngine } = await import(
                "./engine-delegate.server"
            );
            const updates = captureDbUpdates();
            hoisted.spawn.mockReset();
            const child = fakeChild();
            hoisted.spawn.mockReturnValue(child);

            const promise = executeWorkflowViaEngine(
                "task-1",
                JSON.stringify({ nodes: [], edges: [] }),
                {},
                null,
            );
            await vi.waitFor(() => {
                if (hoisted.spawn.mock.calls.length === 0) {
                    throw new Error("spawn not called yet");
                }
            });

            child.stdout.emit(
                "data",
                Buffer.from(
                    `${JSON.stringify({
                        result: {
                            status: "success",
                            outputs: {},
                            cache: { calls_total: 7, calls_cached: 3 },
                        },
                    })}\n`,
                ),
            );
            child.emit("exit", 0);
            await promise;

            const terminal = updates.find((u) => u.status === "completed");
            expect(terminal?.cacheCallsTotal).toBe(7);
            expect(terminal?.cacheCallsCached).toBe(3);
        });

        it("spreads cacheColumnsFrom into the failed terminal update too", async () => {
            const { executeWorkflowViaEngine } = await import(
                "./engine-delegate.server"
            );
            const updates = captureDbUpdates();
            hoisted.spawn.mockReset();
            const child = fakeChild();
            hoisted.spawn.mockReturnValue(child);

            const promise = executeWorkflowViaEngine(
                "task-1",
                JSON.stringify({ nodes: [], edges: [] }),
                {},
                null,
            );
            await vi.waitFor(() => {
                if (hoisted.spawn.mock.calls.length === 0) {
                    throw new Error("spawn not called yet");
                }
            });

            child.stdout.emit(
                "data",
                Buffer.from(
                    `${JSON.stringify({
                        result: {
                            status: "failed",
                            outputs: {},
                            errors: ["boom"],
                            failures: [],
                            cache: { calls_total: 4, calls_cached: 1 },
                        },
                    })}\n`,
                ),
            );
            child.emit("exit", 1);
            await promise;

            const terminal = updates.find((u) => u.status === "failed");
            expect(terminal?.cacheCallsTotal).toBe(4);
            expect(terminal?.cacheCallsCached).toBe(1);
        });
    });
});
