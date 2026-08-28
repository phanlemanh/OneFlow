import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
    REFUSED_TOKENS_RENDERED,
    readerRefusalOutput,
} from "@/lib/normalize/__fixtures__/reader-refusal";
import {
    NORMALIZE_ERROR_CODES,
    normalizeRefusalFrom,
} from "@/lib/normalize/error-copy";

const ROOT = join(__dirname, "..", "..", "..");
const LOCALES = ["en", "vi", "ja", "ko", "zh"] as const;

function readCatalogue(locale: string): Record<string, string> {
    const file = join(ROOT, "src", "i18n", "messages", `${locale}.json`);
    const parsed = JSON.parse(readFileSync(file, "utf8"));
    return parsed?.Workspace?.nodes?.normalizeErrors?.normalizeTextVi ?? {};
}

/**
 * The Python reader owns the code set. Read it out of the SOURCE rather than
 * retyping it: a copy retyped here would agree with itself forever while
 * drifting from the thing it mirrors — the exact shape this contract exists to
 * close (AC-6, AC-8).
 */
function codesDeclaredBySdk(): string[] {
    const file = join(ROOT, "sdk", "tongflow", "text", "normalize_vi.py");
    const source = readFileSync(file, "utf8");
    const block = source.match(
        /NORMALIZE_ERROR_CODES:\s*frozenset\[str\]\s*=\s*frozenset\(\s*\{([^}]*)\}/,
    );
    if (!block) throw new Error("NORMALIZE_ERROR_CODES not found in the SDK");
    const constants = block[1]
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    return constants
        .map((name) => {
            const assignment = source.match(
                new RegExp(`^${name}\\s*=\\s*"([^"]+)"`, "m"),
            );
            if (!assignment) throw new Error(`${name} has no string value`);
            return assignment[1];
        })
        .sort();
}

describe("normalize refusal copy", () => {
    it("mirrors the SDK code set exactly, both directions", () => {
        expect([...NORMALIZE_ERROR_CODES].sort()).toEqual(codesDeclaredBySdk());
    });

    it.each(LOCALES)("%s renders every code", (locale) => {
        const catalogue = readCatalogue(locale);
        for (const code of NORMALIZE_ERROR_CODES) {
            // Indexed by the code itself, exactly the way the shipping path
            // does it (`tNormalize(refusal.code)`). An indirection here that
            // production does not use would let the two drift apart.
            const copy = catalogue[code];
            expect(
                typeof copy === "string" && copy.trim().length > 0,
                `${locale}.json thiếu câu cho mã ${code} — người dùng locale này sẽ thấy khoá thô`,
            ).toBe(true);
        }
    });

    it("keeps the token placeholder wherever the tokens matter", () => {
        // RESIDUAL_TOKENS is the only code whose sentence names what stopped the
        // reading. A translation that drops {tokens} turns a specific refusal
        // into a shrug, so the placeholder is asserted per locale.
        for (const locale of LOCALES) {
            const copy = readCatalogue(locale).RESIDUAL_TOKENS;
            expect(
                copy.includes("{tokens}"),
                `${locale}.json: câu RESIDUAL_TOKENS mất chỗ trống {tokens} — người dùng không biết cụm nào chặn`,
            ).toBe(true);
        }
    });

    it("reads the refusal off the output object, not the sentence", () => {
        // The payload is built FROM the ABI, so this cannot pass against a
        // field the contract forbids a plugin to emit.
        expect(normalizeRefusalFrom(readerRefusalOutput())).toEqual({
            code: "RESIDUAL_TOKENS",
            tokens: REFUSED_TOKENS_RENDERED,
        });
    });

    it("ignores failures that are not a reader refusal", () => {
        expect(
            normalizeRefusalFrom({ success: false, error: "boom" }),
        ).toBeNull();
        expect(normalizeRefusalFrom({ code: "SOMETHING_ELSE" })).toBeNull();
        expect(normalizeRefusalFrom(null)).toBeNull();
        expect(normalizeRefusalFrom("RESIDUAL_TOKENS")).toBeNull();
    });
});
