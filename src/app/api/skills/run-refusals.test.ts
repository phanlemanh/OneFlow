/**
 * E4 (AC-4) — missing plugin, unknown skill and the busy ceiling are refused
 * with their own codes and write no task row. Includes the suppression half
 * of the ceiling: two runs in flight do NOT trigger 429.
 */
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({ registry: { current: null as unknown } }));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
}));

pointDataDirAtTemp("refusals");

let POST: typeof import("./[id]/run/route").POST;
let h: typeof import("@/lib/skills/test-support/route-harness");
let MAX: number;

beforeAll(async () => {
    ({ POST } = await import("./[id]/run/route"));
    h = await import("@/lib/skills/test-support/route-harness");
    ({ SKILL_CONCURRENCY_MAX: MAX } = await import("@/lib/skills/run.server"));
});

beforeEach(async () => {
    const { getDb, tasks } = await import("@/db");
    await (await getDb()).delete(tasks);
    hoisted.registry.current = h.registryWith(["split-video"]);
});

const VIDEO = { fileKey: "k.mp4", name: "k.mp4" };
const run = (id: string) =>
    POST(
        h.jsonRequest(`http://localhost/api/skills/${id}/run`, {
            params: { video: VIDEO },
        }) as never,
        { params: Promise.resolve({ id }) },
    );

async function seedInFlight(n: number): Promise<void> {
    for (let i = 0; i < n; i++) {
        await h.insertTask({
            id: `busy-${i}`,
            feature: "workflow",
            prompt: {},
            status: i % 2 === 0 ? "pending" : "processing",
        });
    }
}

describe("POST /api/skills/<id>/run — refusals (E4)", () => {
    it("no installed plugin for a slot → 400 PLUGIN_NOT_INSTALLED naming the slot", async () => {
        hoisted.registry.current = h.registryWith([]);
        const before = await h.countTasks();
        const res = await run("cat-canh-video");
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({
            code: "PLUGIN_NOT_INSTALLED",
            missingSlots: ["split-video"],
        });
        expect(await h.countTasks()).toBe(before);
    });

    it("unknown skill → 404 and no row", async () => {
        const before = await h.countTasks();
        const res = await run("khong-co-skill-nay");
        expect(res.status).toBe(404);
        expect(await h.countTasks()).toBe(before);
    });

    it("the ceiling is 3", () => {
        expect(MAX, "concurrency ceiling").toBe(3);
    });

    it("3 runs in flight → 429 and the count stays 3", async () => {
        await seedInFlight(3);
        const res = await run("cat-canh-video");
        expect(res.status, "status with 3 in flight").toBe(429);
        expect((await res.json()).code).toBe("CONCURRENT_TASK_LIMIT_EXCEEDED");
        expect(await h.countTasks()).toBe(3);
    });

    it("suppression: 2 runs in flight → accepted", async () => {
        await seedInFlight(2);
        const res = await run("cat-canh-video");
        expect(res.status, "status with 2 in flight").toBe(200);
        expect(await h.countTasks()).toBe(3);
    });
});
