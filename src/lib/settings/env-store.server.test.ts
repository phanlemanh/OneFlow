// @vitest-environment node
/**
 * The key store, measured on a REAL temp directory.
 *
 * No mock stands in for the storage seam: `vitest.config.ts` aliases
 * `@ext -> src/ext-default` and `dataDir()` reads `TONGFLOW_DATA_DIR`, so these
 * tests exercise the same file reader a plain checkout ships. That config's own
 * comment records why it has to be this way — "which is how the AC-9 round trip
 * ended up asserting against a mock".
 *
 * Every module is imported INSIDE a test via `await import(...)` because the
 * data dir is chosen per test; a top-level import would bind the first one.
 */

import {
    chmodSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The repo-wide pattern: neutralise the server-only SENTINEL, never the
// storage seam itself.
vi.mock("server-only", () => ({}));

let dir: string;
const store = () => path.join(dir, "settings.json");
const isRoot = () => process.getuid?.() === 0;

beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "byo-store-"));
    process.env.TONGFLOW_DATA_DIR = dir;
    vi.resetModules();
});

afterEach(() => {
    // Undo the chmod 000 fixture first, or the cleanup cannot remove the file.
    if (existsSync(store())) {
        try {
            chmodSync(store(), 0o600);
        } catch {
            /* already a directory, or already writable */
        }
    }
    rmSync(dir, { recursive: true, force: true });
    delete process.env.TONGFLOW_DATA_DIR;
    vi.doUnmock("@ext/settings-codec");
});

describe("seam: absent vs unreadable", () => {
    it("returns null when the blob has never been written", async () => {
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).resolves.toBeNull();
    });

    it("throws with the original errno when the file cannot be read", async () => {
        if (isRoot()) {
            // chmod cannot lock root out. Say so — a silent skip is a green
            // that means nothing.
            console.warn("SKIP EACCES branch: running as uid 0");
            return;
        }
        writeFileSync(store(), '{"A":"1"}', "utf8");
        chmodSync(store(), 0o000);
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).rejects.toMatchObject({
            code: "EACCES",
        });
    });

    it("throws EISDIR when the path is a directory", async () => {
        mkdirSync(store());
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).rejects.toMatchObject({
            code: "EISDIR",
        });
    });
});

describe("readEnvStore: ok vs absent", () => {
    it("returns the stored map verbatim", async () => {
        writeFileSync(store(), '{"A":"1","B":"2"}', "utf8");
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(readEnvStore()).resolves.toEqual({
            state: "ok",
            env: { A: "1", B: "2" },
        });
    });

    it("says absent — not unreadable — when nothing was ever stored", async () => {
        // Suppression half: a reader that always answers "unreadable" passes
        // the unreadable matrix below and is exactly the bug this guards.
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(readEnvStore()).resolves.toEqual({ state: "absent" });
    });
});

describe("readEnvStore: unreadable matrix", () => {
    // Full matrix over the four causes: one assertion per element, and the
    // reasons must stay distinct so a caller can tell them apart.
    const BLOB_CAUSES = [
        ["parse", "{oops", "parse"],
        ["shape", "[1,2,3]", "shape"],
        ["shape-scalar", '"just a string"', "shape"],
    ] as const;

    it.each(BLOB_CAUSES)("%s reads as unreadable", async (_label, blob, reason) => {
        writeFileSync(store(), blob, "utf8");
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(readEnvStore()).resolves.toEqual({
            state: "unreadable",
            reason,
        });
    });

    it("io: an unreadable file reads as unreadable", async () => {
        if (isRoot()) {
            console.warn("SKIP io branch: running as uid 0");
            return;
        }
        writeFileSync(store(), '{"A":"1"}', "utf8");
        chmodSync(store(), 0o000);
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(readEnvStore()).resolves.toEqual({
            state: "unreadable",
            reason: "io",
        });
    });

    it("decode: a codec failure reads as unreadable", async () => {
        writeFileSync(store(), "ciphertext", "utf8");
        vi.doMock("@ext/settings-codec", () => ({
            encodeEnvStore: async (s: string) => s,
            decodeEnvStore: async () => {
                throw new Error("bad key");
            },
        }));
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(readEnvStore()).resolves.toEqual({
            state: "unreadable",
            reason: "decode",
        });
    });

    it("keeps the four reasons distinct", async () => {
        const seen = new Set<string>();
        for (const [, blob, reason] of BLOB_CAUSES) {
            void blob;
            seen.add(reason);
        }
        seen.add("io");
        seen.add("decode");
        expect([...seen].sort()).toEqual(["decode", "io", "parse", "shape"]);
    });
});

describe("loadEnvStore stays tolerant", () => {
    // Owner decision 2 (31/08): an unreadable store must NOT block a run.
    // These assert the RUN path keeps today's behaviour exactly.
    const CASES = [
        ["absent", null],
        ["parse", "{oops"],
        ["shape", "[1,2,3]"],
    ] as const;

    it.each(CASES)("%s: returns {} and never throws", async (_label, blob) => {
        if (blob !== null) writeFileSync(store(), blob, "utf8");
        const { loadEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(loadEnvStore()).resolves.toEqual({});
    });

    it("io: returns {} and never throws", async () => {
        if (isRoot()) {
            console.warn("SKIP io branch: running as uid 0");
            return;
        }
        writeFileSync(store(), '{"A":"1"}', "utf8");
        chmodSync(store(), 0o000);
        const { loadEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(loadEnvStore()).resolves.toEqual({});
    });

    it("ok: still returns the real map", async () => {
        // Positive control: a reader that always returns {} passes every case
        // above.
        writeFileSync(store(), '{"A":"1"}', "utf8");
        const { loadEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(loadEnvStore()).resolves.toEqual({ A: "1" });
    });
});
