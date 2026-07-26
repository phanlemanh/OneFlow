/**
 * Clone the official plugins into the gitignored plugins/ directory.
 *
 * Tracks each repo's default branch (no pinned ref) so a plain pull always
 * lands the latest — zero maintenance, no version bumps here.
 *
 * The manifest shape and the remote-URL rule come from
 * src/lib/plugins/official-manifest.ts — the same module the in-app plugin
 * manager and the update checker use. This script used to build the remote URL
 * itself from the org and the id, which meant the CLI and the app could drift
 * into fetching from different places without anything noticing.
 *
 * Mirrors src/lib/runtime/paths.server.ts so build-time seeding can target the
 * same relocated directories the packaged app uses.
 */

import fs from "node:fs";
import path from "node:path";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import {
    normalizeOfficialManifest,
    type OfficialPluginEntry,
    officialGitUrl,
} from "../src/lib/plugins/official-manifest";

const resourcesDir = process.env.TONGFLOW_RESOURCES_DIR?.trim()
    ? path.resolve(process.env.TONGFLOW_RESOURCES_DIR.trim())
    : process.cwd();

const manifest = normalizeOfficialManifest(
    JSON.parse(
        fs.readFileSync(
            path.join(resourcesDir, "config", "official-plugins.json"),
            "utf8",
        ),
    ),
);

function pluginsDir(): string {
    return process.env.TONGFLOW_PLUGINS_DIR?.trim()
        ? path.resolve(process.env.TONGFLOW_PLUGINS_DIR.trim())
        : path.join(process.cwd(), "plugins");
}

// Clone the plugin if missing, otherwise fast-forward it to the latest commit.
// Uses isomorphic-git (pure JS) so no system git binary is required.
// Returns "cloned" | "updated"; throws on git failure.
async function installOne(entry: OfficialPluginEntry): Promise<string> {
    const dir = path.join(pluginsDir(), entry.id);
    const url = officialGitUrl(entry);
    if (fs.existsSync(dir)) {
        // Pull from the resolved URL rather than the one baked into
        // .git/config at clone time, so an entry that gained its own `origin`
        // actually moves. Re-point the stored remote only after a successful
        // pull. Mirrors cloneOrPull in plugins-install.server.ts.
        const storedUrl = await git.getConfig({
            fs,
            dir,
            path: "remote.origin.url",
        });
        await git.pull({
            fs,
            http,
            dir,
            url,
            singleBranch: true,
            fastForward: true,
            author: { name: "oneflow", email: "oneflow@local" },
        });
        if (storedUrl !== url) {
            await git.setConfig({
                fs,
                dir,
                path: "remote.origin.url",
                value: url,
            });
            console.log(
                `[install-plugins] ${entry.id}: remote re-pointed ${storedUrl} -> ${url}`,
            );
        }
        return "updated";
    }
    await git.clone({ fs, http, dir, url, singleBranch: true });
    return "cloned";
}

async function main(): Promise<void> {
    const argv = process.argv.slice(2);
    const printOnly = argv.includes("--print-remotes");
    const requested = argv.filter((arg) => arg !== "--print-remotes");
    const known = manifest.entries.map((entry) => entry.id);

    const unknown = requested.filter((id) => !known.includes(id));
    if (unknown.length) {
        console.error(
            `[install-plugins] Unknown plugin(s): ${unknown.join(", ")}`,
        );
        console.error(`[install-plugins] Available: ${known.join(", ")}`);
        process.exit(1);
    }

    const targets = requested.length
        ? manifest.entries.filter((entry) => requested.includes(entry.id))
        : manifest.entries;

    // Print the remotes this run would clone from, touching neither the network
    // nor the disk. The parity guard compares this against the other consumers.
    if (printOnly) {
        for (const entry of targets) {
            console.log(`${entry.id}\t${officialGitUrl(entry)}`);
        }
        return;
    }

    fs.mkdirSync(pluginsDir(), { recursive: true });
    console.log(`[install-plugins] Installing ${targets.length} plugin(s)…`);

    const failed: string[] = [];
    for (const entry of targets) {
        try {
            const action = await installOne(entry);
            console.log(`[install-plugins] ${action}: ${entry.id}`);
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`[install-plugins] FAILED: ${entry.id} — ${msg}`);
            failed.push(entry.id);
        }
    }

    const ok = targets.length - failed.length;
    console.log(`[install-plugins] Done — ${ok} ok, ${failed.length} failed.`);
    if (failed.length) process.exit(1);
}

main();
