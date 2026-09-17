/**
 * E7 (AC-7) — the run view: one step per node of the instance for every
 * status, outputs keyed by the manifest, the failed step named from the error
 * envelope the engine delegate writes, and 404 for non-skill or unknown tasks.
 * The error JSON is produced by the REAL writer (error-envelope.ts), and the
 * completed result is the engine's REAL output recorded from an end-to-end run
 * (test-support/fixtures/tach-tieng-video.engine-result.json) — the first
 * version of this test typed the result in the shape the reader expected and
 * stayed green while the real engine wrote a different one.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({ registry: { current: null as unknown } }));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
}));

pointDataDirAtTemp("collect");

let GET: typeof import("./runs/[taskId]/route").GET;
let h: typeof import("@/lib/skills/test-support/route-harness");
let def: import("@/lib/skills/types").SkillDefinition;

const get = (taskId: string) =>
    GET(new Request(`http://localhost/api/skills/runs/${taskId}`), {
        params: Promise.resolve({ taskId }),
    });

beforeAll(async () => {
    ({ GET } = await import("./runs/[taskId]/route"));
    h = await import("@/lib/skills/test-support/route-harness");
    hoisted.registry.current = h.registryWith(["split-video"]);
    const { getSkill } = await import("@/lib/skills/catalog");
    const found = getSkill("cat-canh-video");
    if (!found) throw new Error("cat-canh-video missing");
    def = found;
    const prompt = {
        skillId: "cat-canh-video",
        skillVersion: def.manifest.version,
        params: def.sampleParams,
    };
    const { serializeTaskErrorForDb, workflowTaskFailureEnvelope } =
        await import("@/lib/task/error-envelope");
    const nodeIds = def.template.executable.executableNodes.map((n) => n.id);
    const recorded = (
        await import(
            "@/lib/skills/test-support/fixtures/tach-tieng-video.engine-result.json"
        )
    ).default as { result: Record<string, unknown> };
    const tachTieng = getSkill("tach-tieng-video");
    if (!tachTieng) throw new Error("tach-tieng-video missing");
    await h.insertTask({
        id: "t-real",
        feature: "skill",
        prompt: {
            skillId: "tach-tieng-video",
            skillVersion: tachTieng.manifest.version,
            params: tachTieng.sampleParams,
        },
        status: "completed",
        result: recorded.result,
    });
    await h.insertTask({
        id: "t-run",
        feature: "skill",
        prompt,
        status: "processing",
    });
    await h.insertTask({
        id: "t-done",
        feature: "skill",
        prompt,
        status: "completed",
    });
    await h.insertTask({
        id: "t-fail",
        feature: "skill",
        prompt,
        status: "failed",
        error: serializeTaskErrorForDb(
            workflowTaskFailureEnvelope(
                ["boom"],
                [{ nodeId: nodeIds[nodeIds.length - 1], summary: "boom" }],
            ),
        ),
    });
    await h.insertTask({
        id: "t-wf",
        feature: "workflow",
        prompt: {},
        status: "completed",
    });
});

describe("GET /api/skills/runs/<taskId> (E7)", () => {
    it("every status carries one step per instance node", async () => {
        const n = def.template.executable.executableNodes.length;
        for (const id of ["t-run", "t-done", "t-fail"]) {
            const body = await (await get(id)).json();
            expect(Array.isArray(body.steps), `${id} has no steps field`).toBe(
                true,
            );
            expect(body.steps.length, `${id} step count`).toBe(n);
            for (const s of body.steps) {
                expect(Object.keys(s).sort()).toEqual([
                    "nodeId",
                    "slot",
                    "status",
                ]);
            }
        }
    });

    it("processing → steps running, no outputs", async () => {
        const body = await (await get("t-run")).json();
        expect(body.status).toBe("processing");
        expect(
            body.steps.every((s: { status: string }) => s.status === "running"),
        ).toBe(true);
        expect(body.outputs).toEqual({});
    });

    it("completed → steps done", async () => {
        const body = await (await get("t-done")).json();
        expect(
            body.steps.every((s: { status: string }) => s.status === "done"),
        ).toBe(true);
    });

    it("completed with the engine's real result → every manifest output has its file key", async () => {
        const { getSkill } = await import("@/lib/skills/catalog");
        const tachTieng = getSkill("tach-tieng-video");
        const recorded = (
            await import(
                "@/lib/skills/test-support/fixtures/tach-tieng-video.engine-result.json"
            )
        ).default as { result: Record<string, { [k: string]: unknown }[]> };
        const body = await (await get("t-real")).json();
        const keys = (tachTieng?.manifest.outputs ?? [])
            .map((o) => o.key)
            .sort();
        expect(Object.keys(body.outputs).sort(), "output keys").toEqual(keys);
        for (const o of tachTieng?.manifest.outputs ?? []) {
            const item = recorded.result[o.from.nodeId][0][o.from.field] as {
                file_key: string;
            };
            expect(body.outputs[o.key].values, `output ${o.key}`).toEqual([
                item.file_key,
            ]);
        }
    });

    it("failed → the node named in failures is the failed step", async () => {
        const body = await (await get("t-fail")).json();
        const nodeIds = def.template.executable.executableNodes.map(
            (n) => n.id,
        );
        const failed = nodeIds[nodeIds.length - 1];
        expect(body.status).toBe("failed");
        expect(body.error).toEqual({
            code: "RUN_FAILED",
            failedNodeIds: [failed],
        });
        expect(
            body.steps.find((s: { nodeId: string }) => s.nodeId === failed)
                ?.status,
        ).toBe("failed");
    });

    it("non-skill task and unknown task → 404", async () => {
        expect((await get("t-wf")).status).toBe(404);
        expect((await get("khong-co")).status).toBe(404);
    });
});
