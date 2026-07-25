import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The imperative translator must resolve the same locale that
 * `src/i18n/request.ts` resolves for the very same request: cookie first,
 * then browser language negotiation, then the "zh" default. When the two
 * disagree, React components render in one language while toasts render in
 * another — which is exactly what a missing NEXT_LOCALE cookie used to do.
 *
 * `Director.open` is asserted because it differs across all five locales.
 */

function stubBrowser(cookie: string, language: string): void {
    vi.stubGlobal("document", { cookie });
    vi.stubGlobal("navigator", { language, languages: [language] });
}

async function translateDirectorOpen(): Promise<string> {
    // Re-import per case: the module reads the environment at call time, but a
    // fresh module registry keeps the cases independent of import order.
    vi.resetModules();
    const { getClientTranslator } = await import("./client");
    return getClientTranslator("Director")("open");
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("getClientTranslator locale resolution", () => {
    it("honours an explicit NEXT_LOCALE cookie", async () => {
        stubBrowser("NEXT_LOCALE=ja", "en-US");
        expect(await translateDirectorOpen()).toBe("ディレクター");
    });

    it("honours an explicit NEXT_LOCALE=vi cookie", async () => {
        stubBrowser("NEXT_LOCALE=vi", "en-US");
        expect(await translateDirectorOpen()).toBe("Đạo diễn");
    });

    it("negotiates the browser language when no cookie is set", async () => {
        stubBrowser("__next_hmr_refresh_hash__=abc", "en-US");
        expect(await translateDirectorOpen()).toBe("Director");
    });

    it("negotiates ja and ko from the browser language", async () => {
        stubBrowser("", "ja-JP");
        expect(await translateDirectorOpen()).toBe("ディレクター");
        stubBrowser("", "ko-KR");
        expect(await translateDirectorOpen()).toBe("디렉터");
    });

    it("negotiates vi from the browser language", async () => {
        stubBrowser("", "vi-VN");
        expect(await translateDirectorOpen()).toBe("Đạo diễn");
    });

    it("falls back to zh for an unsupported browser language", async () => {
        stubBrowser("", "fr-FR");
        expect(await translateDirectorOpen()).toBe("导演");
    });

    it("ignores an unsupported cookie value and negotiates instead", async () => {
        stubBrowser("NEXT_LOCALE=de", "en-US");
        expect(await translateDirectorOpen()).toBe("Director");
    });

    it("falls back to zh when there is no browser environment at all", async () => {
        vi.stubGlobal("document", undefined);
        vi.stubGlobal("navigator", undefined);
        expect(await translateDirectorOpen()).toBe("导演");
    });
});
