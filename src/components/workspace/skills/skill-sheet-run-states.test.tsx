// @vitest-environment jsdom
/**
 * E10 (AC-10) — running a skill from the panel: steps move with the engine's
 * node events, a success shows every manifest output as a link under
 * /api/uploads, a failure names the failed STEP in product words and «Chạy lại»
 * re-submits exactly the params of the failed run.
 *
 * Wiring, not logic: the real panel talks to the real routes over a temp DB,
 * and the run is dispatched through the real runner and engine delegate; only
 * the engine child process, the plugin registry and the upload are stand-ins
 * (see src/lib/skills/test-support/panel-harness.tsx).
 */
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
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
vi.mock("@/lib/api/upload", () => ({
    getPresignedUploadUrl: async (file: File) => ({
        fileKey: `uploads/${file.name}`,
        url: `/api/uploads/uploads/${file.name}`,
        uploadUrl: "",
        expiresIn: 0,
    }),
}));

pointDataDirAtTemp("panel-run");

import {
    failingRun,
    succeedingRun,
} from "@/lib/skills/test-support/fake-engine";
import {
    type FetchLog,
    installRouteFetch,
    installWaitRouteEventSource,
    messages,
    ViIntl,
} from "@/lib/skills/test-support/panel-harness";
import { SkillPanel } from "./skill-sheet";

const log: FetchLog = { runBodies: [], contractErrors: [] };
const STEP_LABEL =
    messages.Skills.skills["cat-canh-video"].steps["split-video"];
const OUTPUT_LABEL =
    messages.Skills.skills["cat-canh-video"].outputs["cac-canh"].label;

beforeAll(async () => {
    const h = await import("@/lib/skills/test-support/route-harness");
    hoisted.registry.current = h.registryWith(["split-video"]);
    await installRouteFetch(log);
    await installWaitRouteEventSource();
});

afterEach(() => {
    cleanup();
    log.runBodies.length = 0;
    log.contractErrors.length = 0;
});

async function fillAndRun() {
    render(
        <ViIntl>
            <SkillPanel onClose={() => {}} />
        </ViIntl>,
    );
    fireEvent.click(
        await screen.findByText(messages.Skills.skills["cat-canh-video"].name),
    );
    const input = (await screen.findByLabelText(/Video/)) as HTMLInputElement;
    fireEvent.change(input, {
        target: { files: [new File(["x"], "tour.mp4", { type: "video/mp4" })] },
    });
    const runButton = await screen.findByRole("button", {
        name: messages.Skills.run,
    });
    await waitFor(() =>
        expect((runButton as HTMLButtonElement).disabled).toBe(false),
    );
    fireEvent.click(runButton);
}

describe("skill panel run states (E10)", () => {
    it("success: steps finish and each manifest output links to /api/uploads", async () => {
        hoisted.lines.current = succeedingRun(["s1"], {
            output_s1: ["tasks/t/clip-1.mp4", "tasks/t/clip-2.mp4"],
        });
        await fillAndRun();
        const title = messages.Skills.resultTitle.replace(
            "{name}",
            messages.Skills.skills["cat-canh-video"].name,
        );
        await waitFor(
            () => {
                expect(log.contractErrors, "route contract").toEqual([]);
                expect(screen.getByText(title)).toBeTruthy();
            },
            { timeout: 4000 },
        );
        const output = document.querySelector('[data-output="cac-canh"]');
        expect(output, "output cac-canh not rendered").not.toBeNull();
        expect(output?.textContent).toContain(OUTPUT_LABEL);
        const links = Array.from(output?.querySelectorAll("a") ?? []).map((a) =>
            a.getAttribute("href"),
        );
        expect(links).toEqual([
            "/api/uploads/tasks/t/clip-1.mp4",
            "/api/uploads/tasks/t/clip-2.mp4",
        ]);
    });

    it("failure: names the failed step and «Chạy lại» re-sends the same params", async () => {
        hoisted.lines.current = failingRun(["s1"], "s1");
        await fillAndRun();
        const expectedSentence = messages.Skills.failedBody.replace(
            "{step}",
            STEP_LABEL,
        );
        const alert = await waitFor(
            () => {
                expect(log.contractErrors, "route contract").toEqual([]);
                return screen.getByText(expectedSentence);
            },
            { timeout: 4000 },
        );
        expect(alert, `failed step ${STEP_LABEL} not named`).toBeTruthy();
        const failedStep = document.querySelector(
            '[data-step-status="failed"]',
        );
        expect(failedStep?.textContent).toContain(STEP_LABEL);

        const first = log.runBodies[0];
        fireEvent.click(
            screen.getByRole("button", { name: messages.Skills.rerun }),
        );
        await waitFor(() => expect(log.runBodies.length).toBe(2));
        expect(log.runBodies[1], "params lost on rerun").toEqual(first);
    });
});
