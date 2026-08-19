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
            extensionFor("https://s.example/a/blob", "application/octet-stream"),
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
