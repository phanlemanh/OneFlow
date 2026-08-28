import { afterEach, describe, expect, it, vi } from "vitest";

import {
    REFUSED_TOKENS_RENDERED,
    readerRefusalOutput,
} from "@/lib/normalize/__fixtures__/reader-refusal";
import { normalizeRefusalFrom } from "@/lib/normalize/error-copy";

/**
 * The sentence a non-Vietnamese user actually reads when the reader refuses.
 *
 * `error-copy.test.ts` proves the catalogues hold a sentence for every code.
 * That is necessary and not sufficient: the keys can all be present while the
 * render path still hands the SDK's Vietnamese `error` string to the toast,
 * which is exactly the state this contract found (AC-6). So this file measures
 * the OUTPUT of the render path, per locale, on a real refusal payload.
 *
 * Locale is driven the way the shipped resolver drives it — cookie first, then
 * browser language — rather than by calling a translator with a locale
 * argument, because a test that picks the locale by hand cannot notice the
 * resolver breaking.
 */

/**
 * A refusal as the slot emits it, built from the ABI rather than typed out —
 * see `__fixtures__/reader-refusal.ts` for why a hand-written one proves
 * nothing about what a plugin can actually send.
 */
const REFUSAL_OUTPUT = readerRefusalOutput();

function stubBrowser(cookie: string, language: string): void {
    vi.stubGlobal("document", { cookie });
    vi.stubGlobal("navigator", { language, languages: [language] });
}

/**
 * A refusal with nothing to list. `EMPTY_INPUT` is the second refusal path and
 * its sentence names no tokens, so it is the one that would go wrong if a
 * catalogue leaned on `{tokens}` always being non-empty.
 */
const EMPTY_INPUT_OUTPUT = {
    success: false,
    code: "EMPTY_INPUT",
    residual: [],
    error: "Chuỗi rỗng",
};

/** Render a refusal the way `task-failure-toaster` renders it. */
async function renderRefusal(
    output: unknown = REFUSAL_OUTPUT,
): Promise<string> {
    vi.resetModules();
    const { getClientTranslator } = await import("@/i18n/client");
    const refusal = normalizeRefusalFrom(output);
    if (!refusal) throw new Error("payload was not recognised as a refusal");
    const t = getClientTranslator(
        "Workspace.nodes.normalizeErrors.normalizeTextVi",
    );
    return t(refusal.code, { tokens: refusal.tokens });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("reader refusal reaches the user in their own language", () => {
    it.each([
        ["en", "NEXT_LOCALE=en", "en-US"],
        ["ja", "NEXT_LOCALE=ja", "ja-JP"],
        ["ko", "NEXT_LOCALE=ko", "ko-KR"],
        ["zh", "NEXT_LOCALE=zh", "zh-CN"],
    ])(
        "%s renders a sentence that is not the SDK's Vietnamese",
        async (locale, cookie, language) => {
            stubBrowser(cookie, language);
            const shown = await renderRefusal();

            expect(
                shown,
                `${locale}: câu hiện cho người dùng vẫn là chuỗi tiếng Việt của SDK`,
            ).not.toBe(REFUSAL_OUTPUT.error);
            expect(
                shown.includes("Chưa đọc được"),
                `${locale}: câu tiếng Việt của SDK lọt vào giao diện`,
            ).toBe(false);
            expect(
                shown.includes("RESIDUAL_TOKENS"),
                `${locale}: khoá thô lọt ra màn hình thay vì một câu`,
            ).toBe(false);
            // The tokens that stopped the reading must survive translation, or the
            // user is told "something failed" with no way to find what.
            expect(
                shown.includes(REFUSED_TOKENS_RENDERED),
                `${locale}: mất danh sách cụm chặn, người dùng không biết sửa gì`,
            ).toBe(true);
        },
    );

    it("vi reads its own sentence from the catalogue, not from the SDK", async () => {
        stubBrowser("NEXT_LOCALE=vi", "vi-VN");
        const shown = await renderRefusal();

        // Vietnamese is the one locale where the catalogue sentence and the SDK
        // sentence could be confused. They are deliberately different wordings,
        // so an accidental fall-through to `result.error` is still visible here.
        expect(shown).not.toBe(REFUSAL_OUTPUT.error);
        expect(shown.includes(REFUSED_TOKENS_RENDERED)).toBe(true);
    });

    it.each([
        ["en", "NEXT_LOCALE=en", "en-US"],
        ["ja", "NEXT_LOCALE=ja", "ja-JP"],
    ])(
        "%s renders the second refusal path, the one with nothing to list",
        async (locale, cookie, language) => {
            stubBrowser(cookie, language);
            const shown = await renderRefusal(EMPTY_INPUT_OUTPUT);

            expect(shown).not.toBe(EMPTY_INPUT_OUTPUT.error);
            expect(
                shown.includes("EMPTY_INPUT"),
                `${locale}: khoá thô lọt ra màn hình thay vì một câu`,
            ).toBe(false);
            // A sentence, not a fragment: a catalogue that assumed every code
            // carries tokens would leave a dangling separator here.
            expect(
                shown.trim().length > 0 && !shown.includes("{tokens}"),
                `${locale}: câu EMPTY_INPUT còn chỗ trống chưa thay`,
            ).toBe(true);
        },
    );

    it("every locale renders a DIFFERENT sentence", async () => {
        const rendered: string[] = [];
        for (const [cookie, language] of [
            ["NEXT_LOCALE=en", "en-US"],
            ["NEXT_LOCALE=ja", "ja-JP"],
            ["NEXT_LOCALE=ko", "ko-KR"],
            ["NEXT_LOCALE=zh", "zh-CN"],
            ["NEXT_LOCALE=vi", "vi-VN"],
        ]) {
            stubBrowser(cookie, language);
            rendered.push(await renderRefusal());
            vi.unstubAllGlobals();
        }
        // Five identical strings would mean the catalogue lookup is not actually
        // locale-dependent — a copy-paste of one language into all five files
        // would otherwise pass every check above.
        expect(new Set(rendered).size).toBe(rendered.length);
    });
});
