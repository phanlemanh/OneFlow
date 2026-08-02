import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    type ConformanceFixture,
    callLogForFixture,
    normalizeCall,
} from "./conformance";

/**
 * The fixtures live under `sdk/` on purpose: one copy, read by both runtimes. A
 * mirror under `src/` would drift, and a drifting fixture reports agreement
 * between two files nobody compares.
 */
const FIXTURES =
    process.env.CONFORMANCE_FIXTURES ??
    join(process.cwd(), "sdk/tests/conformance/fixtures");
/**
 * Every fixture on disk is a case, on both sides. A hand-written list is the
 * mirror image of the missing-fixture failure guarded against below: a fixture
 * that is present but unlisted runs on one runtime only, and a case running on
 * one side reports nothing about agreement while looking like it does. Both
 * halves glob this same directory, so adding a file is the whole of adding a
 * case.
 */
function discoverCases(): string[] {
    const names = readdirSync(FIXTURES)
        .filter((f) => f.endsWith(".json") && !f.startsWith("baseline-"))
        .map((f) => f.slice(0, -".json".length))
        .sort();
    if (names.length === 0) {
        throw new Error(`no conformance fixtures found under ${FIXTURES}`);
    }
    return names;
}

const CASES = discoverCases();

function loadFixture(name: string): ConformanceFixture {
    // Fail loudly rather than skipping: a silently absent fixture shrinks the
    // suite to whatever happens to be on disk, which is exactly the kind of
    // quiet coverage loss this suite exists to prevent.
    return JSON.parse(
        readFileSync(join(FIXTURES, `${name}.json`), "utf8"),
    ) as ConformanceFixture;
}

describe("TS↔Python conformance", () => {
    for (const name of CASES) {
        it(`${name}: the canvas call-log matches the shared fixture`, () => {
            const fixture = loadFixture(name);
            expect(callLogForFixture(fixture)).toEqual(fixture.expectedCalls);
        });
    }
});

describe("compose-overlay (AC-13): in the suite from birth, as a non-batch slot", () => {
    // The parametrized case above already holds this log to expectedCalls;
    // these assertions state the properties that comparison must keep
    // carrying, so a fixture edit cannot quietly weaken them. The Python
    // mirror is test_compose_overlay_single_call_ops_and_placeholder_pass_through.
    const fixture = loadFixture("compose-overlay");
    const log = callLogForFixture(fixture);

    it("makes exactly one call — no batchField, so nothing fans out", () => {
        expect(log).toHaveLength(1);
        expect(log[0].slot).toBe("compose-overlay");
    });

    it("passes ops through untouched, {text} placeholder unsubstituted", () => {
        const bindings = fixture.workflow.executableNodes[0].bindings;
        const ops = log[0].input.ops as { type: string; text?: string }[];
        // Substitution is plugin-side: the text input travels beside the ops,
        // and op[0].text still holds the literal placeholder.
        expect(ops).toEqual((bindings.ops as { value: unknown }).value);
        expect(ops[0].text).toContain("{text}");
        expect(log[0].input.text).toBe("50%");
    });

    it("keeps the logo op bare — the logo asset arrives only as the input", () => {
        const ops = log[0].input.ops as Record<string, unknown>[];
        expect(Object.keys(ops[1]).sort()).toEqual([
            "anchor",
            "opacity",
            "type",
            "width",
            "x",
            "y",
        ]);
        expect(Object.keys(log[0].input.logo as object)).toEqual(["__asset"]);
    });
});

describe("call-log normalization", () => {
    it("keeps every business field, not just the batched one", () => {
        // The scope of the comparison is the whole point: a log carrying only
        // the batched value would stay green while one side quietly injects a
        // plugin default the other never sees.
        const call = normalizeCall("gen-text", {
            text: "một",
            userPrompt: "gọn lại",
            duration: 5,
        });
        expect(Object.keys(call.input).sort()).toEqual([
            "duration",
            "text",
            "userPrompt",
        ]);
    });

    it("drops per-run keys that carry no semantics", () => {
        const call = normalizeCall("gen-text", {
            text: "một",
            _tongflow: { progressUrl: "http://x", token: "secret" },
            taskId: "task-123",
            level: 2,
        });
        expect(call.input).toEqual({ text: "một" });
    });

    it("renders an asset as a content digest, not as bytes or a file key", () => {
        // The two sides materialize assets by different routes, so file_key
        // always differs while the content does not.
        const call = normalizeCall("image-gen", {
            image: { bytesBase64: Buffer.from("abc").toString("base64") },
        });
        const image = call.input.image as Record<string, string>;
        expect(Object.keys(image)).toEqual(["__asset"]);
        expect(image.__asset).toMatch(/^[0-9a-f]{64}$/);
    });

    it("omits a valueless field instead of writing null", () => {
        const call = normalizeCall("gen-text", {
            text: "một",
            userPrompt: null,
            comment: "",
        });
        expect(call.input).toEqual({ text: "một" });
    });
});
