import { describe, expect, it } from "vitest";
import { computeReadiness } from "./use-first-run-readiness";

const workflow = {
    executableNodes: [
        { pluginId: "p-split", feature: "split-video" },
        { pluginId: "p-concat", feature: "concat-videos" },
    ],
};
const names = { "p-split": "Tách cảnh video", "p-concat": "Cắt ghép video" };

describe("computeReadiness", () => {
    it("suppresses the strip once the example has completed a run", () => {
        expect(
            computeReadiness({
                workflow,
                installedIds: [],
                pluginNames: names,
                exampleCompleted: true,
            }),
        ).toBeNull();
    });

    it("still helps a workspace that has not completed a run", () => {
        // Suppression half: "never nag" must not become "never help".
        const state = computeReadiness({
            workflow,
            installedIds: [],
            pluginNames: names,
            exampleCompleted: false,
        });
        expect(state?.phase).toBe("missing-plugins");
    });

    it("describes what is missing in human words, never plugin ids", () => {
        const state = computeReadiness({
            workflow,
            installedIds: [],
            pluginNames: names,
            exampleCompleted: false,
        });
        if (state?.phase !== "missing-plugins") throw new Error("wrong phase");
        expect(state.capabilities).toEqual([
            "Tách cảnh video",
            "Cắt ghép video",
        ]);
        expect(JSON.stringify(state)).not.toContain("p-split");
    });

    it("reports ready when every plugin is present but the run has not happened", () => {
        const state = computeReadiness({
            workflow,
            installedIds: ["p-split", "p-concat"],
            pluginNames: names,
            exampleCompleted: false,
        });
        expect(state?.phase).toBe("ready");
    });

    it("falls back to a readable label when a plugin ships no display name", () => {
        const state = computeReadiness({
            workflow,
            installedIds: [],
            pluginNames: {},
            exampleCompleted: false,
        });
        if (state?.phase !== "missing-plugins") throw new Error("wrong phase");
        // Still not the raw id — the type must make an id unrepresentable here.
        expect(state.capabilities.every((c) => !c.startsWith("p-"))).toBe(true);
    });
});
