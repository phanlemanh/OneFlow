import { describe, expect, it } from "vitest";
import { ABI_NODES } from "@/generated/abi";
import { getAbiTopology } from "@/lib/abi/handle-introspect";
import { DIRECTOR_EXCLUDED_SLOTS } from "./safe-slots";
import { installedSafeSlots, renderVocabulary } from "./vocabulary";

describe("renderVocabulary", () => {
    it("renders one line per slot with inputs, params and output", () => {
        const v = renderVocabulary(["image-gen", "image-fusion"]);
        expect(v).toContain('slot "image-gen"');
        expect(v).toContain('slot "image-fusion"');
        // image-fusion consumes an image array handle
        expect(v).toMatch(/images:\s*image\[\]/);
    });

    it("advertises every accepted modality of a widened handle", () => {
        // compose-overlay's `media` takes an image OR a video (alsoAccepts).
        // Listing only the primary type meant the planner never proposed a
        // video for it and the compiler then rejected one as a mismatch.
        const v = renderVocabulary(["compose-overlay"]);
        expect(v).toMatch(/media:\s*image\|video/);
    });

    it("advertises every modality a widened slot can produce", () => {
        // The output half of the same rule. Advertising `-> image` alone told
        // the planner a video overlay yields an image, so it never chained one
        // into a video-consuming slot.
        const v = renderVocabulary(["compose-overlay"]);
        expect(v).toMatch(/->\s*image\|video/);
    });

    it("leaves a slot with no widened handle on its single primary output", () => {
        // separate-sound declares two audio outputs and image-gen one image;
        // neither widened anything, so both keep exactly what they always
        // advertised — this is the guard on the new rule's blast radius.
        expect(renderVocabulary(["image-gen"])).toMatch(/->\s*image$/m);
        expect(renderVocabulary(["separate-sound"])).toMatch(/->\s*audio$/m);
    });

    it("is byte-stable regardless of input order", () => {
        expect(renderVocabulary(["image-gen", "image-fusion"])).toBe(
            renderVocabulary(["image-fusion", "image-gen"]),
        );
    });

    it("is byte-stable regardless of duplicate entries", () => {
        expect(
            renderVocabulary(["image-gen", "image-gen", "image-fusion"]),
        ).toBe(renderVocabulary(["image-fusion", "image-gen"]));
    });

    it("renders exactly one line for a single slot", () => {
        const v = renderVocabulary(["image-gen"]);
        expect(v.split("\n")).toHaveLength(1);
    });

    it("skips slots without a canonical node type", () => {
        // "image-describe" is a real NodeSlot with no entry in
        // SLOT_TO_NODE_TYPE (no ReactFlow node implements it yet).
        const v = renderVocabulary(["image-describe", "image-gen"]);
        expect(v.split("\n")).toHaveLength(1);
        expect(v).toContain('slot "image-gen"');
        expect(v).not.toContain("image-describe");
    });

    // Spot-check against compile.ts's own classification (see compile.ts's
    // classifyField and NODE_TYPE_SOURCE_SPEC) so the vocabulary never tells
    // the LLM something the compiler would then reject.

    it("classifies image-gen's text as a batch-capable handle (compile.ts's batchOn override), not a config param", () => {
        const v = renderVocabulary(["image-gen"]);
        expect(v).toContain("inputs(text: text[])");
        expect(v).not.toMatch(/params\([^)]*text:/);
    });

    it("classifies image-fusion's text as a manual, required handle and images as an array handle, matching compile.ts", () => {
        const v = renderVocabulary(["image-fusion"]);
        expect(v).toContain("text: text (required, manual)");
        expect(v).toContain("images: image[]");
    });

    it("classifies image-gen-video's image as a required array handle and duration/text as required params, matching compile.ts", () => {
        const v = renderVocabulary(["image-gen-video"]);
        expect(v).toContain("image: image[] (required)");
        expect(v).toContain("duration: number (required)");
        expect(v).toContain("text: string (required)");
    });

    // --- Fix 2: array-typed config params, which the DSL's ParamEntrySchema
    // (string | number | boolean only) can never carry, must not be
    // advertised — the model would always write a value the compiler then
    // rejects. ---

    it("omits arrange-group's array-typed config fields (items, infos) but keeps its scalar params", () => {
        const v = renderVocabulary(["arrange-group"]);
        expect(v).not.toMatch(/\bitems:/);
        expect(v).not.toMatch(/\binfos:/);
        expect(v).toContain("query: string");
        expect(v).toContain("groupCount: integer");
        expect(v).toContain("duplicatable: boolean");
    });

    it("omits music-complete's array-typed tracks param but keeps its scalar params", () => {
        const v = renderVocabulary(["music-complete"]);
        expect(v).not.toMatch(/\btracks:/);
        expect(v).toContain("text: string");
        expect(v).toContain("seed: integer");
    });

    it("omits separate-sound's array-typed spans param", () => {
        const v = renderVocabulary(["separate-sound"]);
        expect(v).not.toMatch(/\bspans:/);
    });
});

describe("installedSafeSlots", () => {
    it("keeps a director-safe slot that has an installed plugin", () => {
        const slots = installedSafeSlots({ "image-gen": ["demo-plugin"] });
        expect(slots).toContain("image-gen");
    });

    it("drops a slot with no installed plugin even if director-safe", () => {
        const slots = installedSafeSlots({});
        expect(slots).not.toContain("image-gen");
    });

    it("drops a slot the compiler cannot classify correctly, even when a plugin serves it, and keeps it out of the rendered vocabulary", () => {
        // DIRECTOR_EXCLUDED_SLOTS happens to be empty right now (every slot
        // the compiler used to mis-classify has since been fixed at the
        // source — see safe-slots.ts's own comment) — so there is currently
        // no real slot to exercise this path with. Mutate the exported Set
        // (ReadonlySet is a compile-time view; the underlying object is a
        // real, mutable Set) to simulate the next slot that needs excluding,
        // and restore it afterwards so no other test observes the change.
        const mutableExcluded = DIRECTOR_EXCLUDED_SLOTS as Set<string>;
        mutableExcluded.add("gen-music");
        try {
            const slots = installedSafeSlots({
                "gen-music": ["demo-plugin"],
                "image-gen": ["demo-plugin"],
            });
            expect(slots).not.toContain("gen-music");
            expect(slots).toContain("image-gen");

            const vocab = renderVocabulary(slots);
            expect(vocab).not.toMatch(/slot "gen-music"/);
            expect(vocab).toMatch(/slot "image-gen"/);
        } finally {
            mutableExcluded.delete("gen-music");
        }
    });

    it("returns a sorted list", () => {
        const slots = installedSafeSlots({
            "image-gen": ["p"],
            "gen-text": ["p"],
        });
        expect(slots).toEqual([...slots].sort());
    });

    // --- Fix 1: two vocabulary slots are structurally unplannable ---

    /** Every director-safe slot with an installed plugin — isolates the
     * modality-reachability filter from the "is it installed" filter. */
    function everySlotInstalled(): Record<string, string[]> {
        const map: Record<string, string[]> = {};
        for (const slot of Object.keys(ABI_NODES)) {
            map[slot] = ["demo-plugin"];
        }
        return map;
    }

    it("never returns a slot whose required, non-manual handle input names a modality nothing in the returned set can produce (self-correcting: holds under any future DSL source-kind expansion, not just today's text-only one)", () => {
        const slots = installedSafeSlots(everySlotInstalled());
        // DSL v1's only source kind is text; a slot's own output is the
        // only other thing that can feed another slot's input (spec §5).
        // This invariant is data-derived, not a hardcoded slot list, so it
        // keeps holding (and keeps being a real test) after a future DSL
        // version adds another source kind and the returned set changes.
        const producible = new Set<string>(["textNode"]);
        for (const slot of slots) {
            const out = getAbiTopology(slot).outputs[0];
            if (out) producible.add(out.nodeType);
        }
        for (const slot of slots) {
            const topo = getAbiTopology(slot);
            for (const field of topo.requiredInputs) {
                const cls = topo.inputs[field];
                if (cls.kind !== "handle") continue;
                expect(
                    producible.has(cls.nodeType),
                    `${slot}.${field} requires ${cls.nodeType}`,
                ).toBe(true);
            }
        }
    });

    it("drops link and parse-document today: their required handle input (link[]/file[]) matches no modality DSL v1's text-only source kind or any slot output can produce", () => {
        const slots = installedSafeSlots(everySlotInstalled());
        expect(slots).not.toContain("link");
        expect(slots).not.toContain("parse-document");
    });

    it("drops a slot only when its required input is truly unsatisfiable, keeping slots with no required handle input (e.g. image-gen's text is required but batch-promoted, not a plain required handle a source can never feed)", () => {
        const slots = installedSafeSlots(everySlotInstalled());
        expect(slots).toContain("image-gen");
        expect(slots).toContain("image-fusion");
        expect(slots).toContain("image-gen-video");
    });

    it("iterates to a fixed point: dropping a slot's sole producer cascades, which a single pass would miss", () => {
        // "image-gen-model" requires an image handle; "get-first-frame"
        // outputs image but itself requires a video handle nothing here
        // produces. With only these two installed, a *single* pass computes
        // the producible set from both candidates before dropping anything,
        // so "image-gen-model" looks satisfied (get-first-frame's image
        // output is still counted) even though get-first-frame — the only
        // thing that could have supplied it — is itself unsatisfiable and
        // gets dropped the same round. Iterating to a fixed point recomputes
        // the producible set after that drop and correctly removes
        // "image-gen-model" too on the next round.
        const cascaded = installedSafeSlots({
            "image-gen-model": ["demo-plugin"],
            "get-first-frame": ["demo-plugin"],
        });
        expect(cascaded).toEqual([]);

        // Installing a real image producer alongside breaks the cascade for
        // "image-gen-model" (now satisfiable) while "get-first-frame" stays
        // dropped (still nothing here produces video).
        const withImageProducer = installedSafeSlots({
            "image-gen-model": ["demo-plugin"],
            "get-first-frame": ["demo-plugin"],
            "image-gen": ["demo-plugin"],
        });
        expect(withImageProducer).toEqual(["image-gen", "image-gen-model"]);
    });
});
