import { createHash } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
    // `resolveConfig` reads through `readEnvStore` so it can tell an unreadable
    // store from an unconfigured one. This fake always reports a healthy store,
    // which is the condition every case in this file is about; the unreadable
    // paths have their own suite in config.server.unreadable.test.ts, on a real
    // temp dir rather than a fake.
    readEnvStore: async () => ({ state: "ok", env: { ...store.env } }),
}));

import { readUploadFileByFileKey } from "@/lib/file/file-utils";
import { VIDEO_CARD } from "./__fixtures__/cards";
import { type StubHandle, startStub } from "./__fixtures__/stub-server";
import { importAsset } from "./import.server";

/**
 * The REAL round trip for AC-9 — deliberately its own file.
 *
 * `import.server.test.ts` mocks `@/lib/file/file-utils` wholesale, which made
 * its "sha256 matches" assertion measure the buffer handed TO the stub rather
 * than anything the store gave back: a `saveFile` that truncated its input,
 * wrote to the wrong directory, or never persisted at all stayed green, and the
 * returned `file_key` was never resolved back to bytes even once. That is
 * measuring the writer's INPUT and calling it a round trip.
 *
 * Here nothing is mocked below the store: `TONGFLOW_DATA_DIR` points at a fresh
 * temp directory, so the production driver (src/ext-default/storage-driver.ts)
 * writes a real file, and `readUploadFileByFileKey` resolves the returned key
 * back through the same driver. Write and read are separate code paths, so the
 * hash comparison finally has two ends.
 *
 * What this still does NOT prove, stated so the eval's `expected` can stop
 * overclaiming: it exercises the local-disk driver only. A cloud shell links a
 * different driver via `@ext/storage-driver`, and that one is not covered here.
 */
const BYTES = Buffer.from("pretend this is an mp4 file, several bytes long");

let stub: StubHandle | undefined;
let dataDir: string;
let previousDataDir: string | undefined;

beforeEach(async () => {
    previousDataDir = process.env.TONGFLOW_DATA_DIR;
    dataDir = await mkdtemp(path.join(tmpdir(), "aml-store-"));
    process.env.TONGFLOW_DATA_DIR = dataDir;
    delete process.env.MEDIA_LIBRARY_URL;
    delete process.env.MEDIA_LIBRARY_API_KEY;
});

afterEach(async () => {
    await stub?.close();
    stub = undefined;
    if (previousDataDir === undefined) delete process.env.TONGFLOW_DATA_DIR;
    else process.env.TONGFLOW_DATA_DIR = previousDataDir;
    await rm(dataDir, { recursive: true, force: true });
});

/** Files sitting in the uploads root, so "nothing was left behind" is countable. */
async function uploadedFiles(): Promise<string[]> {
    try {
        return await readdir(path.join(dataDir, "uploads"));
    } catch {
        return [];
    }
}

const sha256 = (b: Buffer | Uint8Array) =>
    createHash("sha256").update(b).digest("hex");

describe("importAsset — a real write, then a real read (E15 / AC-9)", () => {
    it("returns a file_key that reads back out of the store with the same sha256", async () => {
        stub = await startStub({
            bytes: BYTES,
            assetOriginalPath: "/bytes/clip.mp4",
        });
        store.env = {
            MEDIA_LIBRARY_URL: stub.url,
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(true);
        if (!result.ok) return;

        // The key must RESOLVE — this is the half the mocked test never had.
        const readBack = await readUploadFileByFileKey(result.fileKey);
        expect(sha256(readBack)).toBe(sha256(BYTES));
        expect(readBack.byteLength).toBe(BYTES.byteLength);
        expect(await uploadedFiles()).toHaveLength(1);
    });

    /**
     * SUPPRESSION — the load-bearing half. A test that only ever asserts "the
     * bytes came back" passes for an implementation that writes first and
     * validates afterwards, leaving a truncated file behind on every failure.
     * Counting the directory is what makes that visible.
     */
    it("leaves NOTHING in the store when the signed URL cannot be fetched", async () => {
        stub = await startStub({
            bytes: BYTES,
            assetResponse: {
                card: VIDEO_CARD,
                urls: {
                    original: "https://127.0.0.256/gone.mp4",
                    proxy: null,
                    thumb: null,
                },
                expires_in_s: 900,
                contracts_version: "0.2.0",
            },
        });
        store.env = {
            MEDIA_LIBRARY_URL: stub.url,
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(false);
        expect(await uploadedFiles()).toHaveLength(0);
    });

    /**
     * A key the store cannot resolve must THROW rather than answer with empty
     * bytes — otherwise the success assertion above would also pass against a
     * reader that silently returns nothing for every key.
     */
    it("refuses to resolve a key that was never written", async () => {
        await expect(
            readUploadFileByFileKey("never-written-aaaa.mp4"),
        ).rejects.toThrow();
    });
});

/**
 * E17's third branch — "a response that hangs past the deadline is aborted".
 *
 * It was listed in the eval's `expected` and had no assertion anywhere: no fake
 * timer, no abort signal, no stalled stream. `DOWNLOAD_TIMEOUT_MS` could have
 * been set to zero, or the signal deleted outright, and the entire suite stayed
 * green — the mechanism existed and nothing was keeping it.
 *
 * The reason it went unmeasured is mundane: at 120 seconds no test can wait for
 * it. So the constant now reads an env override that exists solely to make it
 * observable, and the stub can hold a body open forever.
 *
 * Scope note, deliberate: what AC-10 asks for is that the download is CUT OFF —
 * not that the resulting message names the cause well. A stalled transfer is
 * currently reported as LOCAL_FAILURE ("your machine"), which is a genuine
 * misdirection and a confirmed finding, but triage placed it outside this
 * contract. It goes to Gate 2 rather than being quietly fixed here, so this test
 * asserts termination and storage, not wording.
 */
describe("a stalled download is cut off, not waited on (E17 / AC-10)", () => {
    it("gives up on a body that never finishes, and stores nothing", async () => {
        process.env.MEDIA_LIBRARY_DOWNLOAD_TIMEOUT_MS = "300";
        stub = await startStub({
            bytes: BYTES,
            assetOriginalPath: "/bytes/clip.mp4",
            hangBytes: true,
        });
        store.env = {
            MEDIA_LIBRARY_URL: stub.url,
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const started = performance.now();
        // Either shape counts as "cut off"; hanging does not.
        const outcome = await importAsset(VIDEO_CARD.id).then(
            (r) => (r.ok ? "imported" : "refused"),
            () => "threw",
        );
        const elapsed = performance.now() - started;

        expect(outcome).not.toBe("imported");
        // Well under the real 120s deadline: proof the abort fired rather than
        // the socket happening to close.
        expect(elapsed).toBeLessThan(10_000);
        expect(await uploadedFiles()).toHaveLength(0);

        delete process.env.MEDIA_LIBRARY_DOWNLOAD_TIMEOUT_MS;
    });

    /**
     * SUPPRESSION: with the same short deadline, a body that DOES finish must
     * still import. Otherwise "nothing was stored" is satisfied by a timeout
     * that fires on every download.
     */
    it("still imports a body that arrives inside the same deadline", async () => {
        process.env.MEDIA_LIBRARY_DOWNLOAD_TIMEOUT_MS = "5000";
        stub = await startStub({
            bytes: BYTES,
            assetOriginalPath: "/bytes/clip.mp4",
        });
        store.env = {
            MEDIA_LIBRARY_URL: stub.url,
            MEDIA_LIBRARY_API_KEY: "k",
        };

        const result = await importAsset(VIDEO_CARD.id);

        expect(result.ok).toBe(true);
        expect(await uploadedFiles()).toHaveLength(1);

        delete process.env.MEDIA_LIBRARY_DOWNLOAD_TIMEOUT_MS;
    });
});
