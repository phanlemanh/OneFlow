import { describe, expect, it } from "vitest";
import { extensionFor } from "./extension";

describe("extensionFor — three rungs, in order (E18)", () => {
    it("rung 1: takes the extension from the URL path even when Content-Type disagrees", () => {
        expect(
            extensionFor("https://s.example/a/clip.webm?sig=x", "video/mp4"),
        ).toBe("webm");
    });

    it("rung 2: falls back to Content-Type when the URL carries no suffix", () => {
        expect(
            extensionFor("https://s.example/a/blob?sig=x", "video/quicktime"),
        ).toBe("mov");
    });

    it("rung 3: falls back to mp4 when neither says anything usable", () => {
        expect(
            extensionFor(
                "https://s.example/a/blob",
                "application/octet-stream",
            ),
        ).toBe("mp4");
        expect(extensionFor("https://s.example/a/blob", null)).toBe("mp4");
    });

    it("survives a signed URL that does not parse", () => {
        expect(extensionFor("not a url", "video/webm")).toBe("webm");
    });

    /**
     * SUPPRESSION — the load-bearing case: an implementation that always
     * answered "mp4" passes rungs 2 and 3 and breaks exactly here, producing a
     * file_key whose suffix makes /api/uploads serve the wrong Content-Type.
     */
    it("does NOT turn a .webm url into mp4", () => {
        expect(extensionFor("https://s.example/a/clip.webm", null)).not.toBe(
            "mp4",
        );
    });
});

/**
 * The stored suffix decides the Content-Type /api/uploads serves, and rung 1
 * reads that suffix off a URL an OUTSIDE service chose. Unconstrained, a `.svg`
 * object key becomes a file served same-origin as image/svg+xml — active
 * content. Rung 1 is therefore allow-listed to the same video set as rung 2.
 */
describe("extensionFor — rung 1 is allow-listed (E18)", () => {
    it("refuses a .svg suffix and falls through to the declared type", () => {
        expect(extensionFor("https://s.example/a/clip.svg", "video/mp4")).toBe(
            "mp4",
        );
    });

    it("refuses any other unknown suffix and falls through", () => {
        expect(
            extensionFor("https://s.example/a/download.aspx", "video/webm"),
        ).toBe("webm");
        expect(extensionFor("https://s.example/a/asset.bin", null)).toBe("mp4");
    });

    /**
     * SUPPRESSION: the allow-list must not swallow the rung-1 behaviour it was
     * added to constrain — a real video suffix still wins over Content-Type.
     */
    it("still prefers a KNOWN video suffix over a disagreeing Content-Type", () => {
        expect(extensionFor("https://s.example/a/clip.webm", "video/mp4")).toBe(
            "webm",
        );
        expect(extensionFor("https://s.example/a/clip.mov", "video/mp4")).toBe(
            "mov",
        );
    });
});
