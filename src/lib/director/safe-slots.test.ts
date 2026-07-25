import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
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
        const modelledNodeTypes = new Set(Object.keys(NODE_TYPE_SOURCE_SPEC));
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

    it("every excluded slot is one the scan actually found needing exclusion", () => {
        const modelledNodeTypes = new Set(Object.keys(NODE_TYPE_SOURCE_SPEC));
        const scannedSlots = slotsWithComponentSourceSpec();
        const staleExclusions: string[] = [];
        for (const slot of DIRECTOR_EXCLUDED_SLOTS) {
            const nodeType = SLOT_TO_NODE_TYPE[slot as never];
            const isScanned = scannedSlots.has(slot);
            const modelled =
                nodeType !== undefined && modelledNodeTypes.has(nodeType);
            if (!isScanned || modelled) {
                staleExclusions.push(slot);
            }
        }
        expect(staleExclusions).toEqual([]);
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

    it("admits the formerly mis-classified slots now that they read from the registry", () => {
        // These six resolved their asset input to `imageNode` while the
        // component declared video/audio/file, so they had to be excluded.
        // NODE_TYPE_SOURCE_SPEC now carries the real classification.
        for (const slot of [
            "subtitle_remove",
            "remove_watermark",
            "denoise_audio",
            "convert_voice",
            "parse-document",
            "arrange-group",
        ]) {
            expect(isDirectorSafeSlot(slot), slot).toBe(true);
        }
    });

    it("classifies the formerly mis-classified asset fields from the registry", () => {
        // The reason those slots were unsafe: upstream nodeType and array-ness.
        // Assert the compiler now sees what the component wires, not the bare
        // ABI default (`imageNode`, scalar).
        const cases: Array<[string, string, string, boolean]> = [
            // slot, field, upstream nodeType, array (batch/collect)
            ["subtitle_remove", "fileKey", "videoNode", true],
            ["remove_watermark", "fileKey", "videoNode", true],
            ["denoise_audio", "fileKey", "audioNode", true],
            ["convert_voice", "sourceKey", "audioNode", true],
            ["parse-document", "document", "fileNode", true],
            ["arrange-group", "fileKeys", "videoNode", true],
        ];
        for (const [slot, field, nodeType, array] of cases) {
            const target = SLOT_TO_NODE_TYPE[slot as never] as string;
            const spec = (
                NODE_TYPE_SOURCE_SPEC as Record<
                    string,
                    Record<
                        string,
                        {
                            kind: string;
                            nodeType?: string;
                            batch?: boolean;
                            collect?: boolean;
                        }
                    >
                >
            )[target];
            const f = spec?.[field];
            expect(f?.kind, `${slot}.${field}`).toBe("handle");
            expect(f?.nodeType, `${slot}.${field} nodeType`).toBe(nodeType);
            expect(!!(f?.batch || f?.collect), `${slot}.${field} array`).toBe(
                array,
            );
        }
    });

    it("rejects Object.prototype keys", () => {
        for (const slot of [
            "constructor",
            "toString",
            "valueOf",
            "__proto__",
        ]) {
            expect(isDirectorSafeSlot(slot)).toBe(false);
        }
    });
});
