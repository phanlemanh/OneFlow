import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
    REFUSED_TOKENS_RENDERED,
    readerRefusalOutput,
} from "@/lib/normalize/__fixtures__/reader-refusal";
import { normalizeRefusalFromTaskData } from "@/lib/normalize/error-copy";

/**
 * Can the localized refusal actually be REACHED from a real failure message?
 *
 * `error-copy.test.ts` proves the catalogues are complete and `error-render.
 * test.ts` proves the sentence renders per locale. Both were green while the
 * toast was unreachable: the extraction tested `Array.isArray(data.outputs)`,
 * and neither producer has ever sent an array there, so every failure fell
 * through to the SDK's Vietnamese string — the exact defect AC-6 closes.
 *
 * So this file measures the step those two skip: envelope → refusal.
 */

const ROOT = join(__dirname, "..", "..", "..");

/** A workflow node id — the key `engine-delegate.server.ts` builds `outputs` under. */
const NODE_ID = "node-normalize-1";

describe("a reader refusal is found in the failure message the server sends", () => {
    it("finds it in a workflow failure, where outputs is keyed by node id", () => {
        const data = {
            status: "failed",
            outputs: {
                "node-tts-0": { success: true, audio: null },
                [NODE_ID]: readerRefusalOutput(),
            },
            errors: [],
            failures: [],
        };

        expect(normalizeRefusalFromTaskData(data)).toEqual({
            code: "RESIDUAL_TOKENS",
            tokens: REFUSED_TOKENS_RENDERED,
        });
    });

    it("finds it in a single-node failure, where the slot output IS the payload", () => {
        // `runner.ts` passes the plugin result straight to `notifyTask`, so
        // there is no `outputs` wrapper at all — reading only the wrapper
        // would silently drop every single-node refusal.
        expect(normalizeRefusalFromTaskData(readerRefusalOutput())).toEqual({
            code: "RESIDUAL_TOKENS",
            tokens: REFUSED_TOKENS_RENDERED,
        });
    });

    it("stays out of the way of failures that are not a reader refusal", () => {
        expect(
            normalizeRefusalFromTaskData({
                status: "failed",
                outputs: { "node-1": { success: false, error: "GPU OOM" } },
            }),
        ).toBeNull();
        expect(
            normalizeRefusalFromTaskData({
                message: "Task execution failed",
                error: "boom",
            }),
        ).toBeNull();
        expect(normalizeRefusalFromTaskData(null)).toBeNull();
        expect(normalizeRefusalFromTaskData("RESIDUAL_TOKENS")).toBeNull();
    });

    it("pins the wire shape it depends on: outputs is an object, not a list", () => {
        // The dead branch this file exists to prevent read `outputs` as an
        // array. `src/types/sse.ts` is the one typed statement of that shape,
        // so assert against it: if the wire ever does become a list, this goes
        // red here rather than silently disabling the localized message.
        const source = readFileSync(
            join(ROOT, "src", "types", "sse.ts"),
            "utf8",
        );
        const declaration = source.match(/outputs\?:\s*([^;]+);/)?.[1]?.trim();
        expect(
            declaration,
            "src/types/sse.ts no longer declares `outputs` — the extraction reads it",
        ).toBeDefined();
        expect(
            declaration,
            `SSE outputs is declared as \`${declaration}\`; the extraction walks it with Object.values`,
        ).toBe("Record<string, unknown>");
    });
});
