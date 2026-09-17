/**
 * E6 (AC-6) — dispatching a skill task rebuilds the executable from the
 * business-only prompt and hands exactly that to the engine delegate; a
 * version recorded at submit time that no longer matches the registry fails
 * the task by name WITHOUT calling the engine.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({
    registry: { current: null as unknown },
    engine: vi.fn(async () => {}),
}));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
    getPluginConfig: () => null,
}));
vi.mock("@/lib/task/engine-delegate.server", () => ({
    executeWorkflowViaEngine: hoisted.engine,
}));

pointDataDirAtTemp("runner");

describe("dispatchTask for skill tasks (E6)", () => {
    let dispatchTask: typeof import("./runner").dispatchTask;
    let h: typeof import("@/lib/skills/test-support/route-harness");

    beforeAll(async () => {
        ({ dispatchTask } = await import("./runner"));
        h = await import("@/lib/skills/test-support/route-harness");
        hoisted.registry.current = h.registryWith(["split-video"]);
    });

    it("hands the engine the executable instantiate() builds from the prompt", async () => {
        hoisted.engine.mockClear();
        const { getSkill } = await import("@/lib/skills/catalog");
        const { instantiate } = await import("@/lib/skills/instantiate");
        const { slotDefaultPluginFrom } = await import(
            "@/lib/skills/run.server"
        );
        const def = getSkill("cat-canh-video");
        if (!def) throw new Error("cat-canh-video missing");
        const prompt = {
            skillId: "cat-canh-video",
            skillVersion: def.manifest.version,
            params: def.sampleParams,
        };
        await h.insertTask({
            id: "t-ok",
            feature: "skill",
            prompt,
            status: "pending",
        });

        await dispatchTask("t-ok");

        expect(hoisted.engine, "engine calls").toHaveBeenCalledTimes(1);
        const call = hoisted.engine.mock.calls[0] as unknown as [
            string,
            string,
            unknown,
            unknown,
        ];
        expect(call[0]).toBe("t-ok");
        // Computed independently of the runner.
        const expected = instantiate(
            def,
            def.sampleParams,
            slotDefaultPluginFrom(
                (
                    hoisted.registry.current as {
                        nodePluginMap: Record<string, string[]>;
                    }
                ).nodePluginMap,
            ),
        );
        if (!expected.ok) throw new Error("instantiate refused");
        expect(JSON.parse(call[1])).toEqual(
            JSON.parse(JSON.stringify(expected.instance.executable)),
        );
    });

    it("a stale skillVersion fails the task by name and never calls the engine", async () => {
        hoisted.engine.mockClear();
        await h.insertTask({
            id: "t-stale",
            feature: "skill",
            prompt: {
                skillId: "cat-canh-video",
                skillVersion: "0.0.1",
                params: {},
            },
            status: "pending",
        });

        await dispatchTask("t-stale");

        const calls = hoisted.engine.mock.calls.length;
        expect(calls, `engine called ${calls} times on version drift`).toBe(0);
        const { getDb, tasks } = await import("@/db");
        const { eq } = await import("drizzle-orm");
        const row = await (await getDb()).query.tasks.findFirst({
            where: eq(tasks.id, "t-stale"),
        });
        expect(row?.status).toBe("failed");
        expect(JSON.parse(row?.error ?? "{}").message).toBe(
            "SKILL_VERSION_CHANGED",
        );
    });
});
