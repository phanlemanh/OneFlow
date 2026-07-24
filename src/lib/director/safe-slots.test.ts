import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { LOCAL_SOURCE_SPEC_OVERRIDES } from "./compile";
import { DIRECTOR_EXCLUDED_SLOTS, isDirectorSafeSlot } from "./safe-slots";
import { SLOT_TO_NODE_TYPE } from "./slot-node-type";

const NODES_DIR = "src/components/workspace/nodes";

function tsxFiles(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) out.push(...tsxFiles(p));
        else if (entry.endsWith(".tsx")) out.push(p);
    }
    return out;
}

/** slot -> true when its component declares any sourceSpec override. */
function slotsWithComponentSourceSpec(): Map<string, string> {
    const found = new Map<string, string>();
    for (const file of tsxFiles(NODES_DIR)) {
        const src = readFileSync(file, "utf8");
        if (!src.includes("sourceSpec")) continue;
        const m = src.match(/feature=["']([a-z0-9_-]+)["']/i);
        if (m) found.set(m[1], file);
    }
    return found;
}

describe("director safe slots", () => {
    it("every slot whose component declares a sourceSpec is either modelled or excluded", () => {
        const modelledNodeTypes = new Set([
            ...Object.keys(NODE_TYPE_SOURCE_SPEC),
            ...Object.keys(LOCAL_SOURCE_SPEC_OVERRIDES),
        ]);
        const unguarded: string[] = [];
        for (const [slot, file] of slotsWithComponentSourceSpec()) {
            const nodeType = SLOT_TO_NODE_TYPE[slot as never];
            const modelled =
                nodeType !== undefined && modelledNodeTypes.has(nodeType);
            if (!modelled && !DIRECTOR_EXCLUDED_SLOTS.has(slot)) {
                unguarded.push(`${slot} (${file})`);
            }
        }
        expect(unguarded).toEqual([]);
    });

    it("scans a plausible number of component files", () => {
        // Guards against the scan silently matching nothing (wrong path, rename).
        expect(slotsWithComponentSourceSpec().size).toBeGreaterThan(10);
    });

    it("keeps the demo path safe", () => {
        for (const slot of [
            "image-gen",
            "image-fusion",
            "image-gen-video",
            "gen-text",
        ]) {
            expect(isDirectorSafeSlot(slot)).toBe(true);
        }
    });

    it("rejects slots with no canonical node type", () => {
        expect(isDirectorSafeSlot("not-a-real-slot")).toBe(false);
    });

    it("excludes the known mis-classified slots", () => {
        for (const slot of [
            "subtitle_remove",
            "remove_watermark",
            "denoise_audio",
            "convert_voice",
            "parse-document",
            "arrange-group",
        ]) {
            expect(isDirectorSafeSlot(slot)).toBe(false);
        }
    });
});
