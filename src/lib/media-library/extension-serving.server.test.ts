import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET as serveUpload } from "@/app/api/uploads/[...path]/route";
import { saveFile } from "@/lib/file/file-utils";
import { extensionFor } from "./extension";

/**
 * The SECOND half of AC-11, which E18 described and no test touched.
 *
 * E18's `expected` said "and with the key it produces, /api/uploads'
 * Content-Type table must return something playable", and listed the uploads
 * route in its `paths`. But its command ran `extension.test.ts`, which only
 * calls `extensionFor(url, contentType)` — never the route, never its mime
 * table. So the causal chain the criterion is actually about (the extension
 * chosen at import time decides the Content-Type the canvas gets later) had its
 * first link measured and its second link asserted in prose.
 *
 * That gap is not academic: the reason `extension.ts` allow-lists extensions at
 * all is that a `.svg` object key would come back as `image/svg+xml`, i.e.
 * same-origin active content. The rule lives in one file and its consequence in
 * another; only running both together shows it holding.
 */
let dataDir: string;
let previousDataDir: string | undefined;

beforeEach(async () => {
    previousDataDir = process.env.TONGFLOW_DATA_DIR;
    dataDir = await mkdtemp(path.join(tmpdir(), "aml-serve-"));
    process.env.TONGFLOW_DATA_DIR = dataDir;
});

afterEach(async () => {
    if (previousDataDir === undefined) delete process.env.TONGFLOW_DATA_DIR;
    else process.env.TONGFLOW_DATA_DIR = previousDataDir;
    await rm(dataDir, { recursive: true, force: true });
});

/** Store bytes under `ext`, then ask the uploads route for them back. */
async function servedContentType(ext: string): Promise<string | null> {
    const fileKey = await saveFile(Buffer.from("bytes"), ext);
    const response = await serveUpload(
        // The handler reads only `params`; the request object is never touched.
        {} as NextRequest,
        { params: Promise.resolve({ path: fileKey.split("/") }) },
    );
    return response.headers.get("content-type");
}

describe("the extension chosen at import decides what the canvas is served (E18 / AC-11)", () => {
    it("serves a playable video type for each extension the import path can choose", async () => {
        // Exactly the three rungs of the ladder in extension.ts, resolved
        // through the same function the import path uses — not a hand-copied
        // list of extensions that could drift away from it.
        const fromUrl = extensionFor("https://cdn.example/clip.webm", null);
        const fromContentType = extensionFor(
            "https://cdn.example/clip",
            "video/mp4",
        );
        const fallback = extensionFor("https://cdn.example/clip", "nonsense/x");

        expect(fromUrl).toBe("webm");
        expect(fromContentType).toBe("mp4");
        expect(fallback).toBe("mp4");

        expect(await servedContentType(fromUrl)).toBe("video/webm");
        expect(await servedContentType(fromContentType)).toBe("video/mp4");
        expect(await servedContentType(fallback)).toBe("video/mp4");
    });

    /**
     * SUPPRESSION — the load-bearing half. The assertions above pass for a
     * route that answers `video/mp4` to everything, which would be a security
     * bug, not a feature. An extension the ladder must never produce has to
     * come back as something inert.
     */
    it("does not serve active content for an extension the ladder refuses", async () => {
        // The ladder's allow-list is what keeps this out of a file key.
        expect(extensionFor("https://cdn.example/evil.svg", null)).toBe("mp4");
        // And if one ever did get stored, the route must not claim it is video.
        expect(await servedContentType("txt")).toBe("text/plain");
    });

    it("404s for a key that was never written, rather than serving empty bytes", async () => {
        const response = await serveUpload({} as NextRequest, {
            params: Promise.resolve({ path: ["nope.mp4"] }),
        });
        expect(response.status).toBe(404);
    });
});
