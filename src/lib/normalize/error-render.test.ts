import { afterEach, describe, expect, it, vi } from "vitest";

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

/** A refusal exactly as the slot emits it: code + the tokens that stopped it. */
const REFUSAL_OUTPUT = {
    success: false,
    code: "RESIDUAL_TOKENS",
    residual: ["đ", "/"],
    // The Vietnamese sentence the SDK keeps for logs. Nothing the user reads
    // may be derived from it — that is the whole point of the code.
    error: "Chưa đọc được: đ, /",
};

function stubBrowser(cookie: string, language: string): void {
    vi.stubGlobal("document", { cookie });
    vi.stubGlobal("navigator", { language, languages: [language] });
}

/** Render the refusal the way `task-failure-toaster` renders it. */
async function renderRefusal(): Promise<string> {
    vi.resetModules();
    const { getClientTranslator } = await import("@/i18n/client");
    const refusal = normalizeRefusalFrom(REFUSAL_OUTPUT);
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
                shown.includes("đ, /"),
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
        expect(shown.includes("đ, /")).toBe(true);
    });

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
