import {
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
// `@ext/*` are cloud-shell seams vitest's resolver does not carry; the empty
// scope is the OSS single-tenant path, which is the one a first run takes.
vi.mock("@ext/scope", () => ({ resolveScope: async () => "" }));

/**
 * The seed is what makes the bundled example survive a fresh install: the
 * clip ships in `public/`, but fileKeys resolve against the uploads root, so
 * without this copy `example.json` opens with a dead pointer where its input
 * video should be — the exact silent failure AC-2 exists to catch.
 */
describe("bundled example asset seed", () => {
    let dataRoot: string;
    let resourcesRoot: string;

    beforeEach(() => {
        dataRoot = mkdtempSync(join(tmpdir(), "bko-data-"));
        resourcesRoot = mkdtempSync(join(tmpdir(), "bko-res-"));
        process.env.TONGFLOW_DATA_DIR = dataRoot;
        process.env.TONGFLOW_RESOURCES_DIR = resourcesRoot;
        vi.resetModules();
    });

    afterEach(() => {
        rmSync(dataRoot, { recursive: true, force: true });
        rmSync(resourcesRoot, { recursive: true, force: true });
        process.env.TONGFLOW_DATA_DIR = undefined;
        process.env.TONGFLOW_RESOURCES_DIR = undefined;
    });

    function shipTheClip(bytes: string): void {
        const dir = join(resourcesRoot, "public", "example-assets");
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "two-scenes.mp4"), bytes);
    }

    it("copies the shipped clip under the fixed fileKey the example references", async () => {
        shipTheClip("fake-mp4-bytes");
        const { EXAMPLE_VIDEO_FILE_KEY, seedExampleAsset } = await import(
            "./seed-example-asset.server"
        );

        const key = await seedExampleAsset();

        expect(key).toBe(EXAMPLE_VIDEO_FILE_KEY);
        // Asserted as BYTES at the resolved path, not merely "the call
        // returned a key": a seed that creates an empty file would satisfy a
        // key-only assertion while still leaving the example broken.
        const landed = join(dataRoot, "uploads", EXAMPLE_VIDEO_FILE_KEY);
        expect(readFileSync(landed, "utf8")).toBe("fake-mp4-bytes");
    });

    it("leaves an already-seeded file untouched on the second run", async () => {
        shipTheClip("fake-mp4-bytes");
        const { EXAMPLE_VIDEO_FILE_KEY, seedExampleAsset } = await import(
            "./seed-example-asset.server"
        );
        await seedExampleAsset();

        // Stand in for a user-edited copy: if the seed overwrote blindly it
        // would clobber this on every server boot.
        const landed = join(dataRoot, "uploads", EXAMPLE_VIDEO_FILE_KEY);
        writeFileSync(landed, "edited-by-user");

        await expect(seedExampleAsset()).resolves.toBe(EXAMPLE_VIDEO_FILE_KEY);
        expect(readFileSync(landed, "utf8")).toBe("edited-by-user");
    });

    it("returns null instead of throwing when the clip is not shipped", async () => {
        // No shipTheClip() here — this is the RED half of the pair. A server
        // boot hook that throws takes the whole app down over a missing
        // sample, so the failure has to be reported as a value.
        const { seedExampleAsset } = await import(
            "./seed-example-asset.server"
        );

        await expect(seedExampleAsset()).resolves.toBeNull();
    });
});
