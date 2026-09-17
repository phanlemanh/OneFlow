// @vitest-environment jsdom
/**
 * E11 (AC-11) — «Xem/sửa kế hoạch» puts the instance graph the engine ran on
 * the canvas (real canvas store, plan from the real plan route): straight
 * away on an empty canvas; behind a confirmation when the canvas already has
 * a graph, where «Huỷ» leaves the canvas exactly as it was.
 */
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";
import { pointDataDirAtTemp } from "@/lib/skills/test-support/temp-env";

vi.mock("server-only", () => ({}));
const hoisted = vi.hoisted(() => ({ registry: { current: null as unknown } }));
vi.mock("@/lib/plugins/plugins-registry.server", () => ({
    loadPluginsRegistry: () => hoisted.registry.current,
    getPluginConfig: () => null,
}));

pointDataDirAtTemp("panel-plan");

import { useFlow } from "@/hooks/use-flow";
import { SKILLS } from "@/lib/skills/catalog";
import {
    type FetchLog,
    installRouteFetch,
    messages,
    ViIntl,
} from "@/lib/skills/test-support/panel-harness";
import {
    insertTask,
    registryWith,
} from "@/lib/skills/test-support/route-harness";
import { SkillPanel } from "./skill-sheet";

const log: FetchLog = { runBodies: [], contractErrors: [] };
const def = SKILLS[0];
const PARAMS = { ...def.sampleParams };
const S = messages.Skills;

beforeAll(async () => {
    hoisted.registry.current = registryWith(def.manifest.requires);
    await installRouteFetch(log);
    await insertTask({
        id: "t-plan",
        feature: "skill",
        prompt: {
            skillId: def.manifest.id,
            skillVersion: def.manifest.version,
            params: PARAMS,
        },
        status: "completed",
        result: {},
    });
});

beforeEach(() => {
    useFlow.setState({ nodes: [], edges: [] });
});
afterEach(() => cleanup());

const openOnResult = async () => {
    const closed = vi.fn();
    render(
        <ViIntl>
            <SkillPanel
                onClose={closed}
                lastRun={{ skillId: def.manifest.id, taskId: "t-plan" }}
            />
        </ViIntl>,
    );
    fireEvent.click(await screen.findByRole("button", { name: S.viewPlan }));
    return closed;
};

async function expectedGraph() {
    const { GET } = await import("@/app/api/skills/runs/[taskId]/plan/route");
    const res = await GET(new Request("http://localhost/x"), {
        params: Promise.resolve({ taskId: "t-plan" }),
    });
    return (await res.json()) as {
        nodes: { id: string; data: Record<string, unknown> }[];
        edges: unknown[];
    };
}

describe("view/edit plan (E11)", () => {
    it("empty canvas: the instance graph lands on the canvas with param values", async () => {
        const closed = await openOnResult();
        const plan = await expectedGraph();
        await waitFor(() =>
            expect(useFlow.getState().nodes.map((n) => n.id)).toEqual(
                plan.nodes.map((n) => n.id),
            ),
        );
        expect(JSON.parse(JSON.stringify(useFlow.getState().edges))).toEqual(
            plan.edges,
        );
        for (const p of def.manifest.params) {
            if (p.target.kind !== "config") continue;
            const { nodeId, field } = p.target;
            const node = useFlow.getState().nodes.find((n) => n.id === nodeId);
            expect(
                (node?.data as Record<string, unknown>)?.[field],
                `param ${p.key} not visible in node ${nodeId}`,
            ).toEqual(PARAMS[p.key]);
        }
        expect(closed).toHaveBeenCalled();
    });

    it("non-empty canvas: asks first, and «Huỷ» leaves the canvas untouched", async () => {
        const existing = [
            {
                id: "mine",
                type: "textNode",
                position: { x: 0, y: 0 },
                data: {},
            },
        ];
        useFlow.setState({ nodes: existing as never, edges: [] });
        await openOnResult();
        await screen.findByRole("alertdialog");
        fireEvent.click(screen.getByRole("button", { name: S.cancel }));
        await waitFor(() =>
            expect(screen.queryByRole("alertdialog")).toBeNull(),
        );
        const nodes = useFlow.getState().nodes;
        expect(
            nodes.length,
            `canvas lost ${existing.length - nodes.length} node(s)`,
        ).toBe(existing.length);
        expect(nodes.map((n) => n.id)).toEqual(["mine"]);
    });

    it("non-empty canvas: «Thay» replaces with the instance graph", async () => {
        useFlow.setState({
            nodes: [
                {
                    id: "mine",
                    type: "textNode",
                    position: { x: 0, y: 0 },
                    data: {},
                },
            ] as never,
            edges: [],
        });
        await openOnResult();
        await screen.findByRole("alertdialog");
        fireEvent.click(screen.getByRole("button", { name: S.replace }));
        const plan = await expectedGraph();
        await waitFor(() =>
            expect(useFlow.getState().nodes.map((n) => n.id)).toEqual(
                plan.nodes.map((n) => n.id),
            ),
        );
    });
});
