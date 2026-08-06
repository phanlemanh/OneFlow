/**
 * `plugin-python-env.server.ts` imports `"server-only"`, which throws outside a
 * Next.js server bundle — mocked away exactly as engine-delegate.test.ts does.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let venvDirFor: (pluginId: string) => string;
let serializeVenvMutation: <T>(
    pluginId: string,
    fn: () => Promise<T>,
) => Promise<T>;
let ensurePluginPython: (
    pluginId: string,
    pluginDir: string,
) => Promise<string>;

beforeAll(async () => {
    const mod = await import("./plugin-python-env.server");
    venvDirFor = mod.venvDirFor;
    serializeVenvMutation = mod.serializeVenvMutation;
    ensurePluginPython = mod.ensurePluginPython;
});

describe("venvDirFor", () => {
    it("gives each plugin its own directory", () => {
        const a = venvDirFor("oneflow-api-ffmpeg");
        const b = venvDirFor("oneflow-api-pyscenedetect");
        expect(a).not.toBe(b);
        expect(a.endsWith("oneflow-api-ffmpeg")).toBe(true);
        expect(b.endsWith("oneflow-api-pyscenedetect")).toBe(true);
    });

    it("keeps every venv under one parent so eviction can find them", () => {
        const a = venvDirFor("a");
        const b = venvDirFor("b");
        expect(a.slice(0, a.lastIndexOf("a"))).toBe(
            b.slice(0, b.lastIndexOf("b")),
        );
    });

    it.each(["../../etc", "..", ".ssh", "a/b", "a\\b", ""])(
        "refuses %j, which would escape the venv root",
        (bad) => {
            expect(() => venvDirFor(bad)).toThrow();
        },
    );
});

describe("serializeVenvMutation", () => {
    it("serializes within one plugin id but never across ids (per plugin id)", async () => {
        const order: string[] = [];
        let release: () => void = () => {};
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });

        const a1 = serializeVenvMutation("alpha", async () => {
            order.push("a1-start");
            await gate;
            order.push("a1-end");
        });
        const b1 = serializeVenvMutation("beta", async () => {
            order.push("b1-start");
        });
        const a2 = serializeVenvMutation("alpha", async () => {
            order.push("a2-start");
        });

        // beta completes while alpha's first job is still blocked: the two
        // plugins are not serialized against each other.
        await b1;
        expect(order).toContain("b1-start");
        // alpha's second job has NOT started — pip stays serialized per venv.
        expect(order).not.toContain("a2-start");

        release();
        await Promise.all([a1, a2]);
        expect(order).toEqual(["a1-start", "b1-start", "a1-end", "a2-start"]);
    });

    it("keeps the chain alive after a failed job (per plugin id)", async () => {
        const boom = serializeVenvMutation("gamma", async () => {
            throw new Error("provisioning failed");
        });
        await expect(boom).rejects.toThrow("provisioning failed");
        await expect(
            serializeVenvMutation("gamma", async () => "ok"),
        ).resolves.toBe("ok");
    });
});

describe("ensurePluginPython — provisioning failure (fail loudly)", () => {
    const originalDataDir = process.env.TONGFLOW_DATA_DIR;

    afterEach(() => {
        if (originalDataDir === undefined) delete process.env.TONGFLOW_DATA_DIR;
        else process.env.TONGFLOW_DATA_DIR = originalDataDir;
    });

    /** A data dir under a regular file: every mkdir below it fails with ENOTDIR. */
    function breakProvisioning(): void {
        const box = mkdtempSync(join(tmpdir(), "venv-fail-"));
        const wall = join(box, "not-a-directory");
        writeFileSync(wall, "");
        process.env.TONGFLOW_DATA_DIR = join(wall, "data");
    }

    function pluginDir(withRequirements: boolean): string {
        const dir = join(mkdtempSync(join(tmpdir(), "venv-plugin-")), "plugin");
        mkdirSync(dir, { recursive: true });
        if (withRequirements) {
            writeFileSync(join(dir, "requirements.txt"), "moviepy\n");
        }
        return dir;
    }

    it("throws, naming the plugin and the fix, when it declares requirements", async () => {
        breakProvisioning();
        await expect(
            ensurePluginPython("needs-deps", pluginDir(true)),
        ).rejects.toThrow(
            /could not provision a Python environment for needs-deps/,
        );
        await expect(
            ensurePluginPython("needs-deps-2", pluginDir(true)),
        ).rejects.toThrow(/venv and pip/);
    });

    it("still falls back to plain python when the plugin declares no requirements", async () => {
        breakProvisioning();
        const py = await ensurePluginPython("no-deps", pluginDir(false));
        expect(py).toBeTruthy();
        expect(py).not.toContain("plugin-venv");
    });
});
