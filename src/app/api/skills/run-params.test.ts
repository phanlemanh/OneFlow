/**
 * E2 (AC-2) — a run with bad params is refused by reason code, one code per
 * class, and leaves the tasks table untouched; a good run creates exactly one
 * row. Real route, real SQLite in a temp data dir.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));

const hoisted = vi.hoisted(() => ({
    registry: { current: null as unknown },
}));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
}));

// A fixture skill with an enum param, built on the first skill's real template:
// no shipped skill has an enum, but the enum class must still be measured
// through the product's params.ts.
vi.mock("@/lib/skills/catalog", async () => {
    const real = await vi.importActual<typeof import("@/lib/skills/catalog")>(
        "@/lib/skills/catalog",
    );
    const base = real.getSkill("cat-canh-video");
    if (!base) throw new Error("cat-canh-video missing from the registry");
    const fixture = {
        ...base,
        manifest: {
            ...base.manifest,
            id: "fixture-enum",
            params: [
                ...base.manifest.params,
                {
                    key: "mode",
                    type: "enum" as const,
                    required: false,
                    options: ["a", "b"],
                    target: {
                        kind: "config" as const,
                        nodeId: "s1",
                        field: "mode",
                    },
                },
            ],
        },
    };
    return {
        SKILLS: [fixture],
        getSkill: (id: string) => (id === "fixture-enum" ? fixture : undefined),
    };
});

pointDataDirAtTemp("params");

const VIDEO = { fileKey: "k.mp4", name: "k.mp4" };

type Post = typeof import("./[id]/run/route").POST;
let POST: Post;
let harness: typeof import("@/lib/skills/test-support/route-harness");
let REASONS: readonly string[];

beforeAll(async () => {
    ({ POST } = await import("./[id]/run/route"));
    harness = await import("@/lib/skills/test-support/route-harness");
    ({ SKILL_PARAM_REASONS: REASONS } = await import("@/lib/skills/params"));
    hoisted.registry.current = harness.registryWith(["split-video"]);
});

const run = (params: unknown) =>
    POST(
        harness.jsonRequest("http://localhost/api/skills/fixture-enum/run", {
            params,
        }) as never,
        { params: Promise.resolve({ id: "fixture-enum" }) },
    );

// Written first: one bad body per reason code.
const MATRIX: Record<string, { params: unknown; param: string }> = {
    required: { params: {}, param: "video" },
    type: { params: { video: VIDEO, "do-nhay": "hai muoi" }, param: "do-nhay" },
    range: { params: { video: VIDEO, "do-nhay": 90 }, param: "do-nhay" },
    option: { params: { video: VIDEO, mode: "c" }, param: "mode" },
    unknown: { params: { video: VIDEO, extra: 1 }, param: "extra" },
};

describe("POST /api/skills/<id>/run — parameter refusals (E2)", () => {
    it("the matrix has exactly one case per exported reason", () => {
        expect(Object.keys(MATRIX).sort()).toEqual([...REASONS].sort());
    });

    for (const reason of ["required", "type", "range", "option", "unknown"]) {
        it(`refuses ${reason} with its code and writes nothing`, async () => {
            const c = MATRIX[reason];
            const before = await harness.countTasks();
            const res = await run(c.params);
            const body = await res.json();
            expect(res.status, `status for ${reason}`).toBe(400);
            expect(body.code).toBe("SKILL_PARAMS_INVALID");
            expect(body.errors, `errors for ${reason}`).toContainEqual({
                param: c.param,
                reason,
            });
            expect(await harness.countTasks(), `rows after ${reason}`).toBe(
                before,
            );
        });
    }

    it("control: valid params with the plugin installed create exactly one task", async () => {
        const before = await harness.countTasks();
        const res = await run({ video: VIDEO, mode: "a" });
        const body = await res.json();
        expect(res.status, JSON.stringify(body)).toBe(200);
        expect(typeof body.taskId).toBe("string");
        expect(await harness.countTasks()).toBe(before + 1);
    });
});
