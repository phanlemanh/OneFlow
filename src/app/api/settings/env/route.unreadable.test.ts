// @vitest-environment node
/**
 * What the route does when the key store cannot be read.
 *
 * Unlike `route.test.ts`, nothing here stubs the store: the blob is a real file
 * in a real temp dir, so the assertions are about bytes on disk rather than
 * about a fake that agrees with the handler by construction. That matters most
 * for the refusal case — the promise is "answers 409 AND leaves the file
 * alone", and only one of those halves is visible to a mock.
 */

import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/plugins/plugin-env-manifests.server", () => ({
    loadPluginEnvDecls: () => [],
}));

let dir: string;
const store = () => path.join(dir, "settings.json");
const sha = () =>
    createHash("sha256").update(readFileSync(store())).digest("hex");

const put = (body: unknown) =>
    new Request("http://localhost/api/settings/env", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
    });

beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "byo-route-"));
    process.env.TONGFLOW_DATA_DIR = dir;
    vi.resetModules();
});

afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
    delete process.env.TONGFLOW_DATA_DIR;
});

describe("GET /api/settings/env", () => {
    it("answers 503 with a machine-readable code when the store is unreadable", async () => {
        writeFileSync(store(), "[1,2,3]", "utf8");
        const { GET } = await import("./route");
        const res = await GET();
        expect(res.status).toBe(503);
        await expect(res.json()).resolves.toMatchObject({
            code: "ENV_STORE_UNREADABLE",
        });
    });

    it("still answers 200 with an empty map when nothing is stored", async () => {
        // Suppression half: a route that always 503s passes the case above.
        const { GET } = await import("./route");
        const res = await GET();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toMatchObject({ env: {} });
    });
});

describe("PUT refuses and leaves the blob", () => {
    it("answers 409 and does not change a single byte on disk", async () => {
        writeFileSync(store(), "[1,2,3]", "utf8");
        const before = sha();

        const { PUT } = await import("./route");
        const res = await PUT(put({ env: { NEW: "value" } }) as never);

        expect(res.status).toBe(409);
        await expect(res.json()).resolves.toMatchObject({
            code: "ENV_STORE_UNREADABLE",
        });
        // Both halves, or the measurement is worthless: a handler that answers
        // 409 and writes anyway passes the status assertion alone, and that is
        // precisely the bug. This is the same check `git config` passes when
        // asked to write into a malformed config file.
        expect(sha()).toBe(before);
    });
});

describe("PUT replaceUnreadableStore", () => {
    it("overwrites only when the caller asks for it by name", async () => {
        writeFileSync(store(), "[1,2,3]", "utf8");
        const { PUT, GET } = await import("./route");

        const res = await PUT(
            put({ env: { NEW: "v" }, replaceUnreadableStore: true }) as never,
        );
        expect(res.status).toBe(200);

        const after = await GET();
        expect(after.status).toBe(200);
        await expect(after.json()).resolves.toMatchObject({
            env: { NEW: "v" },
        });
    });

    it("is REFUSED when the store is healthy", async () => {
        // SUPERSEDED, deliberately. This case used to assert the flag was
        // *ignored* on a readable store — "it names a condition, not a mode".
        // That reading held only because this case sends `env: {A:"2"}`: with a
        // non-empty map, "behaves like a plain PUT" looks harmless. The screen
        // that sets the flag sends `env: {}`, and there "behaves like a plain
        // PUT" means "overwrites every key with nothing".
        //
        // So the flag is now a CLAIM the server checks, and a false claim is
        // refused rather than quietly obeyed (khong-noi-sai-ve-kho-khoa AC-1).
        writeFileSync(store(), '{"A":"1"}', "utf8");
        const { PUT } = await import("./route");

        const flagged = await PUT(
            put({ env: { A: "2" }, replaceUnreadableStore: true }) as never,
        );

        expect(flagged.status, "a false premise must be refused").toBe(409);
        await expect(flagged.json()).resolves.toMatchObject({
            code: "ENV_STORE_REPLACE_REFUSED",
            state: "ok",
        });
        expect(
            readFileSync(store(), "utf8"),
            "the refusal must write nothing",
        ).toBe('{"A":"1"}');
    });
});
