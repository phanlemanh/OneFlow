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

    it("is ignored when the store is healthy", async () => {
        // The flag names a CONDITION, not a mode. With a readable store it must
        // not become a second write path with its own behaviour.
        writeFileSync(store(), '{"A":"1"}', "utf8");
        const { PUT } = await import("./route");

        const plain = await PUT(put({ env: { A: "2" } }) as never);
        const plainBody = await plain.json();
        const plainDisk = readFileSync(store(), "utf8");

        writeFileSync(store(), '{"A":"1"}', "utf8");
        const flagged = await PUT(
            put({ env: { A: "2" }, replaceUnreadableStore: true }) as never,
        );

        expect(flagged.status).toBe(plain.status);
        await expect(flagged.json()).resolves.toEqual(plainBody);
        expect(readFileSync(store(), "utf8")).toBe(plainDisk);
    });
});
