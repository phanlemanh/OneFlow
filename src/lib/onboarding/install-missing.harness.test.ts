import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
// `@ext/*` are cloud-shell seams vitest's resolver does not carry. These are
// NOT stubs: each maps to the identical module the OSS build resolves, so the
// harness exercises the real install path and the real registry scanner.
vi.mock(
    "@ext/plugin-registry",
    () => import("../../ext-default/plugin-registry"),
);
vi.mock("@ext/plugin-env", () => import("../../ext-default/plugin-env"));
vi.mock("@ext/db", () => import("../../ext-default/db"));
vi.mock("@ext/scope", () => import("../../ext-default/scope"));

/**
 * E7 / E8 harness — NETWORK-DEPENDENT (real `git clone` of the example's two
 * plugins) and python3-dependent (registry rescan), so it only runs when the
 * guard scripts set BKO_INSTALL_HARNESS=1:
 *
 *   bash scripts/onboarding/check-one-action-installs-all.sh   (E7)
 *   bash scripts/onboarding/check-no-restart-after-install.sh  (E8)
 *
 * In the plain unit suite every test here reports as skipped.
 */

const CLONE_TIMEOUT_MS = 300_000;

describe.runIf(process.env.BKO_INSTALL_HARNESS === "1")(
    "install-missing harness",
    () => {
        let pluginsRoot: string;

        beforeEach(() => {
            pluginsRoot = mkdtempSync(join(tmpdir(), "bko-plugins-"));
            process.env.TONGFLOW_PLUGINS_DIR = pluginsRoot;
        });

        afterEach(() => {
            rmSync(pluginsRoot, { recursive: true, force: true });
            delete process.env.TONGFLOW_PLUGINS_DIR;
        });

        it(
            "E7: from an empty plugins dir, ONE call installs every id the example needs",
            async () => {
                const { exampleRequirementIds, installMissingForExample } =
                    await import("./install-missing.server");

                const ids = await exampleRequirementIds();
                // The length floor keeps the claim non-vacuous, same as E1.
                expect(ids.length).toBeGreaterThanOrEqual(2);

                const result = await installMissingForExample(ids);

                // Element-by-element: the SET the one call installed is the
                // SET the example needs — not "some install happened".
                expect([...result.installed].sort()).toEqual([...ids].sort());
                expect(result.skipped).toEqual([]);
                expect(result.failed).toEqual([]);
                for (const id of ids) {
                    expect(
                        existsSync(
                            join(pluginsRoot, id, "tongflow.plugin.json"),
                        ),
                    ).toBe(true);
                }
            },
            CLONE_TIMEOUT_MS,
        );

        it(
            "E7 suppression: an already-present plugin is skipped, never re-cloned",
            async () => {
                const { exampleRequirementIds, installMissingForExample } =
                    await import("./install-missing.server");

                const ids = await exampleRequirementIds();
                const [present, ...rest] = ids;

                // "Installed" by the same definition the product uses
                // (<pluginsDir>/<id>/.git exists). The marker is the tripwire:
                // a re-clone would wipe it.
                mkdirSync(join(pluginsRoot, present, ".git"), {
                    recursive: true,
                });
                const marker = join(pluginsRoot, present, "USER-MARKER");
                writeFileSync(marker, "placed before the install call");

                const result = await installMissingForExample(ids);

                expect(result.skipped).toEqual([present]);
                expect([...result.installed].sort()).toEqual([...rest].sort());
                expect(result.failed).toEqual([]);
                expect(existsSync(marker)).toBe(true);
            },
            CLONE_TIMEOUT_MS,
        );

        it(
            "E8: a plugin installed in this process is registered in this process — no restart",
            async () => {
                const { exampleRequirementIds } = await import(
                    "./install-missing.server"
                );
                const { installPlugin } = await import(
                    "@/lib/plugins/plugins-install.server"
                );
                const { loadPluginsRegistry } = await import(
                    "@/lib/plugins/plugins-registry.server"
                );

                const [id] = await exampleRequirementIds();
                const installed = await installPlugin({ id });
                expect(installed.recognized).toBe(true);

                // The SAME process, the ordinary read path — not the install
                // call's own return value.
                const registry = loadPluginsRegistry();
                expect(registry.plugins[id]).toBeTruthy();
            },
            CLONE_TIMEOUT_MS,
        );
    },
);
