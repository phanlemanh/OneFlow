/**
 * `plugin-python-env.server.ts` imports `"server-only"`, which throws outside a
 * Next.js server bundle — mocked away exactly as engine-delegate.test.ts does.
 */
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

let venvDirFor: (pluginId: string) => string;
let serializeVenvMutation: <T>(
    pluginId: string,
    fn: () => Promise<T>,
) => Promise<T>;

beforeAll(async () => {
    const mod = await import("./plugin-python-env.server");
    venvDirFor = mod.venvDirFor;
    serializeVenvMutation = mod.serializeVenvMutation;
});

describe("venvDirFor", () => {
    it("gives each plugin its own directory", () => {
        const a = venvDirFor("oneflow-local-ffmpeg");
        const b = venvDirFor("oneflow-local-pyscenedetect");
        expect(a).not.toBe(b);
        expect(a.endsWith("oneflow-local-ffmpeg")).toBe(true);
        expect(b.endsWith("oneflow-local-pyscenedetect")).toBe(true);
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
