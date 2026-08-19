import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ProvisioningEvent } from "./provisioning-events";

describe("provisioning milestones", () => {
    let pluginDir: string;
    let events: ProvisioningEvent[];

    beforeEach(() => {
        pluginDir = mkdtempSync(join(tmpdir(), "bko-plugin-"));
        events = [];
    });

    it("emits the three steps in order, each completion after its work", async () => {
        writeFileSync(join(pluginDir, "requirements.txt"), "packaging\n");
        const { ensurePluginPython } = await import(
            "@/lib/plugins/plugin-python-env.server"
        );

        await ensurePluginPython(`bko-${Date.now()}`, pluginDir, (e) =>
            events.push(e),
        );

        const completed = events
            .filter((e) => e.phase === "completed")
            .map((e) => e.step);
        expect(completed).toEqual([
            "create-venv",
            "install-sdk",
            "install-requirements",
        ]);
        // Every completion is preceded by its own start.
        for (const step of completed) {
            const startIdx = events.findIndex(
                (e) => e.step === step && e.phase === "started",
            );
            const doneIdx = events.findIndex(
                (e) => e.step === step && e.phase === "completed",
            );
            expect(startIdx).toBeGreaterThanOrEqual(0);
            expect(startIdx).toBeLessThan(doneIdx);
        }
        rmSync(pluginDir, { recursive: true, force: true });
    });

    it("emits NO create-venv milestone when the venv already exists", async () => {
        // Suppression half, and the load-bearing one: a milestone fired on a
        // code path that did nothing is exactly the simulated bar AC-7 bans.
        const pluginId = `bko-cached-${Date.now()}`;
        const { ensurePluginPython } = await import(
            "@/lib/plugins/plugin-python-env.server"
        );

        await ensurePluginPython(pluginId, pluginDir, () => {});
        await ensurePluginPython(pluginId, pluginDir, (e) => events.push(e));

        expect(events.some((e) => e.step === "create-venv")).toBe(false);
        rmSync(pluginDir, { recursive: true, force: true });
    });

    it("emits no requirements milestone for a plugin that declares none", async () => {
        const pluginId = `bko-noreq-${Date.now()}`;
        const { ensurePluginPython } = await import(
            "@/lib/plugins/plugin-python-env.server"
        );

        await ensurePluginPython(pluginId, pluginDir, (e) => events.push(e));

        expect(events.some((e) => e.step === "install-requirements")).toBe(
            false,
        );
        rmSync(pluginDir, { recursive: true, force: true });
    });
});
