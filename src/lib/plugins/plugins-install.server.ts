import "server-only";

import fs, { existsSync } from "node:fs";
import { join } from "node:path";
import { and, eq, inArray } from "drizzle-orm";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import { getDb, tasks } from "@/db";
import { logger } from "@/lib/logger";
import {
    findOfficialEntry,
    isPluginInstalled,
    loadOfficialPluginManifest,
    officialGitUrl,
    sameGitRemote,
} from "@/lib/plugins/official-plugins.server";
import { PLUGIN_GIT_AUTHOR } from "@/lib/plugins/plugin-git";
import { isValidPluginId, pluginIdError } from "@/lib/plugins/plugin-id";
import { invalidatePluginsRegistry } from "@/lib/plugins/plugins-registry.server";
import { pluginsDir } from "@/lib/runtime/paths.server";

// We clone with isomorphic-git (pure JS) so the host does not need a system git
// binary. Trade-off: isomorphic-git speaks HTTP(S) only — SSH remotes are not
// supported, which is why assertSafeGitUrl restricts custom URLs to http(s).

export interface InstallResult {
    id: string;
    /** "cloned" for a fresh checkout, "updated" for a fast-forward pull. */
    action: "cloned" | "updated";
    /** Whether the scanner recognized the plugin after the rescan. */
    recognized: boolean;
}

export class PluginInstallError extends Error {
    constructor(
        message: string,
        readonly status = 400,
    ) {
        super(message);
        this.name = "PluginInstallError";
    }
}

export interface UninstallResult {
    id: string;
}

/**
 * Derive the plugin id (and on-disk directory name) from a git remote URL.
 * Handles https / ssh / scp-style forms and strips an optional `.git` suffix.
 */
export function derivePluginIdFromGitUrl(gitUrl: string): string {
    const trimmed = gitUrl.trim().replace(/\/+$/, "");
    // Basename after the last "/" or ":" (scp-style git@host:org/repo.git).
    const base = trimmed.split(/[/:]/).pop() ?? "";
    return base.replace(/\.git$/i, "");
}

function assertSafeGitUrl(gitUrl: string): void {
    // isomorphic-git only supports the HTTP(S) smart protocol — no SSH/git://.
    if (!/^https?:\/\//i.test(gitUrl.trim())) {
        throw new PluginInstallError(
            "Git URL must be an http(s) URL — SSH remotes (git@…) are not supported.",
        );
    }
}

// The scanner only detects directories that follow the naming convention; a
// plugin cloned under any other name is silently ignored. We enforce it up
// front so a custom git URL either yields a usable plugin or a clear error.
function assertValidPluginId(id: string): void {
    if (!isValidPluginId(id)) {
        throw new PluginInstallError(pluginIdError(id));
    }
}

// Clone the plugin if missing, otherwise fast-forward it to the latest commit.
// Uses isomorphic-git (pure JS) so no system git binary is required.
async function cloneOrPull(
    id: string,
    gitUrl: string,
): Promise<"cloned" | "updated"> {
    const dir = join(pluginsDir(), id);
    // A leftover directory without a .git is the corpse of an interrupted/failed
    // earlier clone: it can never be pulled and the scanner ignores it. Wipe it
    // so we clone fresh instead of erroring (or silently doing nothing) forever.
    if (existsSync(dir) && !existsSync(join(dir, ".git"))) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
    // If the checkout's remote names a different repository than the resolved
    // entry, refuse loudly instead of migrating.
    //
    // Both migration strategies were tried and each failed a review round:
    // fast-forwarding in place produced silent wrong states (merge commits no
    // remote has, a config naming an origin the tree never fetched from), and
    // delete-then-re-clone turned a failed clone into an uninstall and a
    // cosmetic URL difference into data loss. The honest answer is that
    // "an installed plugin whose entry moved origin" has no acceptance
    // criterion in this feature — AC-6 guarantees the shipped manifest cannot
    // produce that state — so automatic migration belongs to the contract of
    // the first real fork. Until then: detect (in normalised form, so a
    // hand-cloned checkout without the .git suffix is not misread as moved)
    // and tell the user exactly what to do.
    if (existsSync(join(dir, ".git"))) {
        const storedUrl = await git.getConfig({
            fs,
            dir,
            path: "remote.origin.url",
        });
        if (!sameGitRemote(storedUrl, gitUrl)) {
            throw new PluginInstallError(
                `Plugin ${id} is checked out from ${storedUrl ?? "an unknown remote"}, but its manifest entry now resolves to ${gitUrl}. Uninstall the plugin and install it again to pick up the new origin.`,
                409,
            );
        }
    }
    const cloning = !existsSync(dir);
    try {
        if (!cloning) {
            // The origin cannot differ by this point — a mismatch was refused
            // above — so this is an ordinary update against the same remote.
            // `url` is still passed so the fetch never falls back to whatever
            // .git/config happens to say.
            await git.pull({
                fs,
                http,
                dir,
                url: gitUrl,
                singleBranch: true,
                fastForward: true,
                // `fastForward` alone only *prefers* a fast-forward: on
                // divergence isomorphic-git writes a merge commit and reports
                // success, leaving a local HEAD no remote has — so the update
                // check would report an update forever and every click would
                // "succeed" without changing anything. Fail loudly instead.
                fastForwardOnly: true,
                author: PLUGIN_GIT_AUTHOR,
            });
            return "updated";
        }
        await git.clone({
            fs,
            http,
            dir,
            url: gitUrl,
            singleBranch: true,
        });
        return "cloned";
    } catch (e) {
        // A failed clone leaves a partial/empty dir that would poison every
        // future attempt (dir exists, but no usable checkout). Remove it so the
        // next install starts clean. Don't touch a pre-existing checkout whose
        // pull merely failed (e.g. transient network) — it's still usable.
        if (cloning) {
            fs.rmSync(dir, { recursive: true, force: true });
        }
        // A PluginInstallError raised inside this block is a deliberate,
        // user-actionable refusal carrying its own status and wording.
        // Re-wrapping it would relabel a 400 as a 500 and prefix "git failed"
        // onto a case where git did not fail, misdirecting whoever reads it.
        if (e instanceof PluginInstallError) throw e;
        const msg = e instanceof Error ? e.message : String(e);
        throw new PluginInstallError(`git failed: ${msg}`, 500);
    }
}

/**
 * Install an official plugin (by id) or a custom one (by git URL), then rescan
 * the registry. Exactly one of `id` / `gitUrl` must be provided.
 */
export async function installPlugin(params: {
    id?: string;
    gitUrl?: string;
}): Promise<InstallResult> {
    let id: string;
    let gitUrl: string;

    if (params.id) {
        const manifest = loadOfficialPluginManifest();
        const entry = findOfficialEntry(manifest, params.id);
        if (!entry) {
            throw new PluginInstallError(
                `Unknown official plugin: ${params.id}`,
            );
        }
        id = entry.id;
        gitUrl = officialGitUrl(entry);
    } else if (params.gitUrl) {
        assertSafeGitUrl(params.gitUrl);
        gitUrl = params.gitUrl.trim();
        id = derivePluginIdFromGitUrl(gitUrl);
        assertValidPluginId(id);
    } else {
        throw new PluginInstallError("Provide either an id or a git URL");
    }

    const action = await cloneOrPull(id, gitUrl);
    logger.info(`[plugins] ${action}: ${id}`);

    // Rescan so the new plugin shows up in the registry without a restart.
    const registry = invalidatePluginsRegistry();
    const recognized = Boolean(registry.plugins[id]);

    return { id, action, recognized };
}

/**
 * Remove an installed plugin's directory and rescan the registry.
 * Refuses while the plugin still has pending/processing tasks.
 */
export async function uninstallPlugin(id: string): Promise<UninstallResult> {
    // Also guards against path traversal — ids never contain "/" or "..".
    assertValidPluginId(id);

    const dir = join(pluginsDir(), id);
    if (!existsSync(dir)) {
        throw new PluginInstallError(`Plugin is not installed: ${id}`, 404);
    }

    const db = await getDb();
    const active = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(
            and(
                eq(tasks.pluginId, id),
                inArray(tasks.status, ["pending", "processing"]),
            ),
        )
        .limit(1);
    if (active.length > 0) {
        throw new PluginInstallError(
            `Plugin ${id} still has running tasks — wait for them to finish or cancel them first.`,
            409,
        );
    }

    fs.rmSync(dir, { recursive: true, force: true });
    logger.info(`[plugins] uninstalled: ${id}`);

    // Rescan so the removed plugin disappears from node pickers immediately.
    invalidatePluginsRegistry();

    return { id };
}

export { isPluginInstalled };
