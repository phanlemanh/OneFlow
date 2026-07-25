import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Metering write paths (plan item 0.2).
 *
 * `executeTask` has four exits — success, plugin-reported failure, thrown
 * failure, and abort. A GPU-time ledger is only trustworthy if the first three
 * record time and the fourth records nothing, so each exit gets its own case.
 */

const h = vi.hoisted(() => ({
    updates: [] as Record<string, unknown>[],
    taskRow: {} as Record<string, unknown>,
    controller: new AbortController(),
    executePlugin: vi.fn(),
    prepareAssetInput: vi.fn(),
}));

vi.mock("@/db", async () => {
    // Real table objects: `eq(tasks.id, …)` needs actual drizzle columns.
    // workspace.schema only imports from drizzle-orm/sqlite-core, so pulling it
    // in costs nothing and opens no database.
    const schema = await vi.importActual<
        typeof import("@/db/workspace.schema")
    >("@/db/workspace.schema");
    return {
        getDb: async () => ({
            query: { tasks: { findFirst: async () => h.taskRow } },
            update: () => ({
                set: (payload: Record<string, unknown>) => {
                    h.updates.push(payload);
                    return { where: async () => undefined };
                },
            }),
        }),
        tasks: schema.tasks,
        workflows: schema.workflows,
    };
});

vi.mock("@/lib/plugin-executor/execute", () => ({
    executePlugin: h.executePlugin,
}));
vi.mock("@/lib/plugin-executor/prepare-asset-input.server", () => ({
    prepareAssetInput: h.prepareAssetInput,
}));
vi.mock("./engine-delegate.server", () => ({
    executeWorkflowViaEngine: vi.fn(),
}));
vi.mock("./emitter", () => ({
    notifyTask: vi.fn(),
    registerTask: () => h.controller,
    removeTask: vi.fn(),
}));
vi.mock("@/lib/logger", () => ({
    logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}));

import { executeTask } from "./runner";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Payloads that carry a terminal status — the ones the ledger reads. */
function terminalUpdates() {
    return h.updates.filter(
        (u) => u.status === "completed" || u.status === "failed",
    );
}

beforeEach(() => {
    h.updates = [];
    h.controller = new AbortController();
    h.taskRow = {
        id: "task-1",
        nodeId: "node-1",
        feature: "image-gen",
        pluginId: "tongflow-modal-z-image",
        model: null,
        prompt: '{"text":"a cat"}',
        workflowId: null,
    };
    h.prepareAssetInput.mockReset();
    h.prepareAssetInput.mockImplementation(async () => ({ text: "a cat" }));
    h.executePlugin.mockReset();
});

describe("successful invocation (AC-4)", () => {
    it("records the elapsed plugin time next to status completed", async () => {
        h.executePlugin.mockImplementation(async () => {
            await sleep(20);
            return { success: true, image: { file_key: "x.png" } };
        });

        await executeTask("task-1");

        const [terminal] = terminalUpdates();
        expect(terminal.status).toBe("completed");
        expect(typeof terminal.durationMs).toBe("number");
        expect(terminal.durationMs as number).toBeGreaterThan(0);
        expect(Number.isInteger(terminal.durationMs)).toBe(true);
    });
});

describe("plugin reports failure (AC-5)", () => {
    it("still records the time — a failed generation burns GPU too", async () => {
        h.executePlugin.mockImplementation(async () => {
            await sleep(20);
            return { success: false, error: "out of memory" };
        });

        await executeTask("task-1");

        const [terminal] = terminalUpdates();
        expect(terminal.status).toBe("failed");
        expect(terminal.durationMs as number).toBeGreaterThan(0);
    });
});

describe("plugin throws (AC-6)", () => {
    it("records the time from the catch branch", async () => {
        h.executePlugin.mockImplementation(async () => {
            await sleep(20);
            throw new Error("subprocess crashed");
        });

        await executeTask("task-1");

        const [terminal] = terminalUpdates();
        expect(terminal.status).toBe("failed");
        expect(terminal.durationMs as number).toBeGreaterThan(0);
    });
});

describe("measurement boundary (AC-7)", () => {
    it("excludes asset preparation from the billable number", async () => {
        h.prepareAssetInput.mockImplementation(async () => {
            await sleep(120);
            return { text: "a cat" };
        });
        h.executePlugin.mockImplementation(async () => {
            await sleep(20);
            return { success: true };
        });

        await executeTask("task-1");

        const [terminal] = terminalUpdates();
        // ~20ms of plugin time, ~140ms of wall clock. Anything at or above the
        // preparation cost means the boundary moved and the invoice
        // reconciliation this column exists for would be wrong.
        expect(terminal.durationMs as number).toBeLessThan(100);
    });
});

describe("aborted run (AC-8) — suppression half", () => {
    it("writes no duration for a cancelled task", async () => {
        h.executePlugin.mockImplementation(async () => {
            await sleep(10);
            h.controller.abort();
            return { success: true };
        });

        await executeTask("task-1");

        expect(terminalUpdates()).toHaveLength(0);
        for (const update of h.updates) {
            expect(update).not.toHaveProperty("durationMs");
        }
    });
});

describe("cost and gpu stay unmeasured (AC-9) — suppression half", () => {
    it("never writes cost_usd or gpu_type on any exit", async () => {
        const exits = [
            async () => ({ success: true }),
            async () => ({ success: false, error: "nope" }),
            async () => {
                throw new Error("boom");
            },
        ];

        for (const impl of exits) {
            h.updates = [];
            h.controller = new AbortController();
            h.executePlugin.mockReset();
            h.executePlugin.mockImplementation(impl);

            await executeTask("task-1");

            expect(h.updates.length).toBeGreaterThan(0);
            for (const update of h.updates) {
                // NULL has to stay distinguishable from a measured zero, so
                // item 0.3 can reconcile a real invoice instead of a guess.
                expect(update).not.toHaveProperty("costUsd");
                expect(update).not.toHaveProperty("gpuType");
                expect(update).not.toHaveProperty("cost_usd");
                expect(update).not.toHaveProperty("gpu_type");
            }
        }
    });
});
