/**
 * `listOfficialPlugins` is what the plugins dialog renders, so the browsable
 * repo URL must be resolved HERE, from each manifest entry's own origin.
 *
 * The dialog used to join the default org with the id, which 404s for every
 * forked entry — compose-overlay being the first one shipped. Testing
 * `officialGitUrl` alone did not cover this: the helper was always correct, the
 * consumer was not.
 *
 * The module is `server-only` and reads the repo's real files, so the module
 * marker is stubbed and the filesystem is left alone (the assertions use the
 * shipped manifest).
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
// `@ext/*` are workspace-external packages the vitest resolver does not carry;
// the code under test never touches them on this path.
vi.mock("@ext/plugin-env", () => ({
    loadPluginEnvDecls: () => [],
    PLUGIN_ENV_MANIFEST_FILE: "plugin.env.json",
}));

const { listOfficialPlugins } = await import(
    "@/lib/plugins/official-plugins.server"
);

const DEFAULT_ORG = "https://github.com/tong-io";

describe("listOfficialPlugins — browsable repo URL", () => {
    it("resolves the forked entry to its own origin", () => {
        const { plugins } = listOfficialPlugins();
        const overlay = plugins.find(
            (p) => p.id === "oneflow-modal-compose-overlay",
        );
        expect(overlay).toBeDefined();
        expect(overlay?.repoUrl).toBe(
            "https://github.com/phanlemanh/oneflow-modal-compose-overlay",
        );
    });

    it("keeps every plain entry on the default org", () => {
        const { plugins } = listOfficialPlugins();
        const plain = plugins.find((p) => p.id === "tongflow-modal-ffmpeg");
        expect(plain?.repoUrl).toBe(`${DEFAULT_ORG}/tongflow-modal-ffmpeg`);
    });

    it("never emits a .git suffix — these are browsable pages, not clone URLs", () => {
        const { plugins } = listOfficialPlugins();
        expect(plugins.every((p) => !p.repoUrl.endsWith(".git"))).toBe(true);
    });
});
