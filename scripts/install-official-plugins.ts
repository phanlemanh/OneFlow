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
import { PLUGIN_GIT_AUTHOR } from "../src/lib/plugins/plugin-git";

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
    // A directory without a .git is the corpse of an interrupted clone: it can
    // never be pulled and the scanner ignores it, so every later run would fail
    // on it forever. cloneOrPull in plugins-install.server.ts wipes it; this
    // path inherited the omission from the .mjs it replaced.
    if (fs.existsSync(dir) && !fs.existsSync(path.join(dir, ".git"))) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
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
            // See cloneOrPull: without this a divergent fork is merged
            // silently and reported as a successful update. The author below
            // is consequently never used — a fast-forward writes no commit —
            // but isomorphic-git still requires the field.
            fastForwardOnly: true,
            author: PLUGIN_GIT_AUTHOR,
        });
        if (storedUrl !== url) {
            // See cloneOrPull: fastForwardOnly does not fire when the new
            // origin's HEAD is an ancestor of ours, so the move must be
            // confirmed against the remote tip rather than assumed.
            const [localHead, refs] = await Promise.all([
                git.resolveRef({ fs, dir, ref: "HEAD" }),
                git.listServerRefs({
                    http,
                    url,
                    prefix: "HEAD",
                    symrefs: true,
                }),
            ]);
            const remoteHead = refs.find((r) => r.ref === "HEAD")?.oid ?? null;
            if (!remoteHead || localHead !== remoteHead) {
                throw new Error(
                    `cannot move to ${url}: a fast-forward does not reach that remote's HEAD (local ${localHead.slice(0, 8)}, remote ${remoteHead?.slice(0, 8) ?? "unknown"}). Delete plugins/${entry.id} and run again to pick up the new origin.`,
                );
            }
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
