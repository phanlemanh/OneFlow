/**
 * E11b (AC-11, backend half) — the plan route returns the INSTANCE graph the
 * engine ran (params visible in node data), computed independently here with
 * instantiate(); a non-skill task is 404.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({ registry: { current: null as unknown } }));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
}));

pointDataDirAtTemp("plan");

describe("GET /api/skills/runs/<taskId>/plan (E11b)", () => {
    let GET: typeof import("./runs/[taskId]/plan/route").GET;

    beforeAll(async () => {
        ({ GET } = await import("./runs/[taskId]/plan/route"));
        const h = await import("@/lib/skills/test-support/route-harness");
        hoisted.registry.current = h.registryWith(["split-video"]);
        await h.insertTask({
            id: "t-plan",
            feature: "skill",
            prompt: {
                skillId: "cat-canh-video",
                skillVersion: "1.0.0",
                params: {
                    video: { fileKey: "plan.mp4", name: "plan.mp4" },
                    "do-nhay": 33,
                },
            },
            status: "completed",
        });
        await h.insertTask({
            id: "t-wf",
            feature: "workflow",
            prompt: {},
            status: "completed",
        });
    });

    const get = (taskId: string) =>
        GET(new Request(`http://localhost/api/skills/runs/${taskId}/plan`), {
            params: Promise.resolve({ taskId }),
        });

    it("returns the instance graph, not the template", async () => {
        const { getSkill } = await import("@/lib/skills/catalog");
        const { instantiate } = await import("@/lib/skills/instantiate");
        const { slotDefaultPluginFrom } = await import(
            "@/lib/skills/run.server"
        );
        const def = getSkill("cat-canh-video");
        if (!def) throw new Error("cat-canh-video missing");
        const expected = instantiate(
            def,
            { video: { fileKey: "plan.mp4", name: "plan.mp4" }, "do-nhay": 33 },
            slotDefaultPluginFrom(
                (
                    hoisted.registry.current as {
                        nodePluginMap: Record<string, string[]>;
                    }
                ).nodePluginMap,
            ),
        );
        if (!expected.ok) throw new Error("instantiate refused");
        const body = await (await get("t-plan")).json();
        expect(JSON.parse(JSON.stringify(body.nodes))).toEqual(
            JSON.parse(JSON.stringify(expected.instance.originalFlow.nodes)),
        );
        expect(body.edges).toEqual(
            JSON.parse(JSON.stringify(expected.instance.originalFlow.edges)),
        );
        const s1 = body.nodes.find((n: { id: string }) => n.id === "s1");
        expect(s1?.data?.threshold, "param missing from node data").toBe(33);
    });

    it("non-skill task → 404", async () => {
        expect((await get("t-wf")).status).toBe(404);
    });
});
