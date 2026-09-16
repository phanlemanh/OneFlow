/**
 * E9b (AC-9, backend half) — GET /api/skills reports, per skill, the slots no
 * installed plugin serves. The plugin registry is NOT mocked: fixture plugins
 * are written to a temp TONGFLOW_PLUGINS_DIR and read by the real Python
 * scanner, so a route that ignores the registry, or reads the checkout's
 * plugins/ dir, turns this red.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
// The dev file watcher would keep the test process alive; the scan itself is real.
vi.mock("chokidar", () => {
    const watcher = { on: () => watcher };
    return { default: { watch: () => watcher } };
});

const PLUGINS = mkdtempSync(path.join(tmpdir(), "ssv1-plugins-"));
process.env.TONGFLOW_PLUGINS_DIR = PLUGINS;

function writePlugin(
    id: string,
    slots: { enumName: string; module: string; model: string }[],
): void {
    const dir = path.join(PLUGINS, id);
    mkdirSync(dir, { recursive: true });
    const imports = slots
        .map(
            (s) =>
                `from tongflow.models.${s.module} import ${s.model}Input, ${s.model}Output`,
        )
        .join("\n");
    const fns = slots
        .map(
            (s) =>
                `@node_slot(NodeSlots.${s.enumName})\ndef ${s.module}(input: ${s.model}Input) -> ${s.model}Output:\n    return ${s.model}Output(success=False)\n`,
        )
        .join("\n\n");
    writeFileSync(
        path.join(dir, "entry.py"),
        `from tongflow import NodeSlots, node_slot\n${imports}\n\n\n${fns}`,
    );
}

describe("GET /api/skills — missing slots from the real registry (E9b)", () => {
    let GET: typeof import("./route").GET;
    let invalidate: () => unknown;

    beforeAll(async () => {
        writePlugin("oneflow-api-fixture-ffmpeg", [
            {
                enumName: "EXTRACT_AUDIO",
                module: "extract_audio",
                model: "ExtractAudio",
            },
            {
                enumName: "REMOVE_VIDEO_AUDIO",
                module: "remove_video_audio",
                model: "RemoveVideoAudio",
            },
        ]);
        ({ GET } = await import("./route"));
        ({ invalidatePluginsRegistry: invalidate } = await import(
            "@/lib/plugins/plugins-registry.server"
        ));
        invalidate();
    });

    const list = async () =>
        (await (await GET()).json()).skills as {
            id: string;
            missingSlots: string[];
        }[];

    it("the scanner really read the fixture (an empty registry would pass vacuously)", async () => {
        const { loadPluginsRegistry } = await import(
            "@/lib/plugins/plugins-registry.server"
        );
        expect(loadPluginsRegistry().nodePluginMap["extract-audio"]).toEqual([
            "oneflow-api-fixture-ffmpeg",
        ]);
    });

    it("a skill whose slot has no plugin names that slot", async () => {
        const skills = await list();
        const cat = skills.find((s) => s.id === "cat-canh-video");
        expect(cat, "cat-canh-video not listed").toBeDefined();
        expect(cat?.missingSlots, "cat-canh-video").toEqual(["split-video"]);
    });

    it("control: once the slot has a plugin, nothing is missing", async () => {
        writePlugin("oneflow-api-fixture-scenes", [
            {
                enumName: "SPLIT_VIDEO",
                module: "split_video",
                model: "SplitVideo",
            },
        ]);
        invalidate();
        const skills = await list();
        for (const s of skills) {
            expect(s.missingSlots, s.id).toEqual([]);
        }
    });
});
