// @vitest-environment node
/**
 * E1 / AC-9 — "the store is broken" is not "you have not configured a key".
 *
 * Today both come out as `Chưa gọi được media-library: thiếu …`, and that
 * sentence sends the user to re-enter a key — which is the data-loss path this
 * whole dossier exists to close.
 *
 * Nothing here mocks the store. `@ext` resolves to `src/ext-default` under
 * vitest and `scopedDataDir()` reads `TONGFLOW_DATA_DIR`, so the fixture is a
 * real file in a real temp dir. The HEALTHY fixtures are written with
 * `saveEnvStore()` — the app's own writer — rather than hand-rolled JSON: a
 * fixture the test shapes to match what the reader expects only proves the two
 * halves of the test agree with each other, never that the reader can read what
 * the product actually writes.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let dir: string;

beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "kkt-cfg-"));
    process.env.TONGFLOW_DATA_DIR = dir;
    delete process.env.MEDIA_LIBRARY_URL;
    delete process.env.MEDIA_LIBRARY_API_KEY;
    vi.resetModules();
});

afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.TONGFLOW_DATA_DIR;
    delete process.env.MEDIA_LIBRARY_URL;
    delete process.env.MEDIA_LIBRARY_API_KEY;
});

/** Healthy fixtures go through the REAL writer, never hand-rolled JSON. */
async function writeHealthyStore(env: Record<string, string>) {
    const { saveEnvStore } = await import("@/lib/settings/env-store.server");
    await saveEnvStore(env);
}

function corruptStore() {
    writeFileSync(
        path.join(dir, "settings.json"),
        "{ this is not json",
        "utf8",
    );
}

describe("resolveConfig — a broken store is not an unconfigured one", () => {
    it("(a) healthy store with both values resolves", async () => {
        await writeHealthyStore({
            MEDIA_LIBRARY_URL: "https://x.test",
            MEDIA_LIBRARY_API_KEY: "k",
        });
        const { resolveConfig } = await import("./config.server");
        expect((await resolveConfig()).ok).toBe(true);
    });

    it("(b) absent store and no env vars reports missing, naming both variables", async () => {
        const { resolveConfig } = await import("./config.server");
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (r.ok) throw new Error("unreachable");
        expect(r.kind).toBe("missing");
        if (r.kind !== "missing") throw new Error("unreachable");
        expect([...r.missing].sort()).toEqual([
            "MEDIA_LIBRARY_API_KEY",
            "MEDIA_LIBRARY_URL",
        ]);
    });

    it("(c) corrupt store and no env vars reports store-unreadable, NOT missing", async () => {
        corruptStore();
        const { resolveConfig } = await import("./config.server");
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (r.ok) throw new Error("unreachable");
        expect(
            r.kind,
            "a corrupt store reported as 'missing keys' sends the user to re-enter them",
        ).toBe("store-unreadable");
    });

    it("(d) corrupt store but env vars supply BOTH values still resolves", async () => {
        // The fallback must run BEFORE the verdict. Without this case, a fix
        // that simply reports store-unreadable whenever the file is bad passes
        // (c) and (e) while taking down every env-var deployment.
        corruptStore();
        process.env.MEDIA_LIBRARY_URL = "https://x.test";
        process.env.MEDIA_LIBRARY_API_KEY = "k";
        const { resolveConfig } = await import("./config.server");
        expect(
            (await resolveConfig()).ok,
            "one broken file must not take down a deployment configured by environment",
        ).toBe(true);
    });

    it("(e) corrupt store with only PART of the values in env reports store-unreadable", async () => {
        corruptStore();
        process.env.MEDIA_LIBRARY_URL = "https://x.test";
        const { resolveConfig } = await import("./config.server");
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (r.ok) throw new Error("unreachable");
        expect(
            r.kind,
            "the value we lack may well be inside the store we cannot read",
        ).toBe("store-unreadable");
    });
});
