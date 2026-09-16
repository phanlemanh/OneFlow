/**
 * E5 (AC-5) — an accepted run writes one tasks row whose prompt carries ONLY
 * the business fields: skillId, skillVersion, params. The key SET is compared,
 * so an extra executable or routing key turns this red.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({ registry: { current: null as unknown } }));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
}));

pointDataDirAtTemp("task-row");

describe("POST /api/skills/<id>/run — task row shape (E5)", () => {
    let POST: typeof import("./[id]/run/route").POST;
    let h: typeof import("@/lib/skills/test-support/route-harness");

    beforeAll(async () => {
        ({ POST } = await import("./[id]/run/route"));
        h = await import("@/lib/skills/test-support/route-harness");
        hoisted.registry.current = h.registryWith(["split-video"]);
    });

    it("writes feature=skill, empty plugin_id and a business-only prompt", async () => {
        const params = { video: { fileKey: "k.mp4", name: "k.mp4" } };
        const res = await POST(
            h.jsonRequest("http://localhost/api/skills/cat-canh-video/run", {
                params,
            }) as never,
            { params: Promise.resolve({ id: "cat-canh-video" }) },
        );
        expect(res.status).toBe(200);
        const { taskId } = await res.json();

        const { getDb, tasks } = await import("@/db");
        const { eq } = await import("drizzle-orm");
        const row = await (await getDb()).query.tasks.findFirst({
            where: eq(tasks.id, taskId),
        });
        expect(row?.feature).toBe("skill");
        expect(row?.pluginId).toBe("");
        const prompt = JSON.parse(row?.prompt ?? "{}");
        expect(Object.keys(prompt).sort(), "prompt keys").toEqual([
            "params",
            "skillId",
            "skillVersion",
        ]);
        expect(prompt.skillId).toBe("cat-canh-video");
        // Defaults are applied server-side and recorded with the run.
        expect(prompt.params).toEqual({ ...params, "do-nhay": 20 });
    });
});
