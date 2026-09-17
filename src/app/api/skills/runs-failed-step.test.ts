/**
 * E7b (AC-10, backend half) — a two-node skill whose SECOND node fails, run
 * through the real runner and engine delegate (only the engine child process
 * is a stand-in): the node events carry the right node ids while it runs, and
 * afterwards the run view marks the first step done and the second failed.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({
    registry: { current: null as unknown },
    lines: { current: [] as unknown[] },
}));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
    getPluginConfig: () => null,
}));
vi.mock("node:child_process", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:child_process")>();
    const { fakeEngineChild } = await import(
        "@/lib/skills/test-support/fake-engine"
    );
    const spawn = () => fakeEngineChild(hoisted.lines.current as never);
    return { ...actual, default: { ...actual, spawn }, spawn };
});
vi.mock("@/lib/plugins/plugin-python-env.server", () => ({
    resolveBasePython: () => "python3",
}));

pointDataDirAtTemp("failed-step");

const SKILL = "tach-tieng-video";

async function runWithEngine(failId: string) {
    const h = await import("@/lib/skills/test-support/route-harness");
    const { submitSkillRun, readSkillRun } = await import(
        "@/lib/skills/run.server"
    );
    const { getSkill } = await import("@/lib/skills/catalog");
    const { failingRun } = await import(
        "@/lib/skills/test-support/fake-engine"
    );
    const { onTaskEvent } = await import("@/lib/task/emitter");
    const { dispatchTask } = await import("@/lib/task/runner");
    const def = getSkill(SKILL);
    if (!def) throw new Error(`${SKILL} missing from the registry`);
    hoisted.registry.current = h.registryWith(def.manifest.requires);
    const nodeIds = def.template.executable.executableNodes.map((n) => n.id);
    hoisted.lines.current = failingRun(nodeIds, failId);

    const submitted = await submitSkillRun(SKILL, def.sampleParams);
    if (submitted.status !== 200) throw new Error(JSON.stringify(submitted));
    const events: { status: string; nodeId?: string | null }[] = [];
    const unsubscribe = onTaskEvent(submitted.taskId, (e) =>
        events.push({ status: String(e.status), nodeId: e.nodeId }),
    );
    await dispatchTask(submitted.taskId);
    unsubscribe();
    return { nodeIds, events, view: await readSkillRun(submitted.taskId) };
}

describe("run view after a failure in the second node (E7b)", () => {
    beforeAll(() => {
        hoisted.lines.current = [];
    });

    it("events name each node, then the view marks first done and second failed", async () => {
        const probe = await import("@/lib/skills/catalog");
        const ids =
            probe
                .getSkill(SKILL)
                ?.template.executable.executableNodes.map((n) => n.id) ?? [];
        expect(ids.length, `${SKILL} node count`).toBe(2);
        const [first, second] = ids;

        const { events, view } = await runWithEngine(second);

        const nodeEvents = events.filter((e) => e.status.startsWith("NODE_"));
        expect(nodeEvents).toEqual([
            { status: "NODE_STARTED", nodeId: first },
            { status: "NODE_COMPLETED", nodeId: first },
            { status: "NODE_STARTED", nodeId: second },
            { status: "NODE_FAILED", nodeId: second },
        ]);
        expect(view?.status).toBe("failed");
        const byNode = Object.fromEntries(
            (view?.steps ?? []).map((s) => [s.nodeId, s.status]),
        );
        expect(byNode[first], `step ${first}`).toBe("done");
        expect(byNode[second], `step ${second}`).toBe("failed");
    });
});
