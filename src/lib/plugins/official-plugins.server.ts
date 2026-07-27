import "server-only";

import fs, { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import { logger } from "@/lib/logger";
import {
    findOfficialEntry,
    type NormalizedOfficialManifest,
    normalizeOfficialManifest,
    type OfficialPluginEntry,
    officialGitUrl,
} from "@/lib/plugins/official-manifest";
import { loadPluginMetaMap } from "@/lib/plugins/plugin-env-manifests.server";
import { pluginsDir, resourcesDir } from "@/lib/runtime/paths.server";

/**
 * The canonical official-plugin manifest lives in config/official-plugins.json
 * and is shared with scripts/install-official-plugins.ts — a single source of
 * truth for both the CLI installer and the in-app plugin manager.
 *
 * Its shape, validation, and URL rule live in official-manifest.ts, which is
 * not server-only so the CLI installer and vitest can import it too. They are
 * re-exported here for the existing importers of this module.
 */
export {
    findOfficialEntry,
    type NormalizedOfficialManifest,
    type OfficialPluginEntry,
    officialGitUrl,
};

export interface OfficialPluginInfo {
    id: string;
    installed: boolean;
    /** Presentation metadata (from an installed plugin's manifest). */
    name?: string;
    description?: string;
    /** App-root path or URL to the plugin icon (manifest, else public convention). */
    icon?: string;
}

function manifestPath(): string {
    return join(resourcesDir(), "config", "official-plugins.json");
}

/**
 * Icon served from the app bundle by convention: `public/plugins/<id>.(svg|png)`.
 * Available even for not-yet-installed plugins (unlike the per-plugin manifest).
 * Returns the web path (e.g. `/plugins/<id>.svg`) or null when no file exists.
 */
function publicIconPath(id: string): string | null {
    const dir = join(resourcesDir(), "public", "plugins");
    for (const ext of ["svg", "png", "webp"]) {
        if (existsSync(join(dir, `${id}.${ext}`))) {
            return `/plugins/${id}.${ext}`;
        }
    }
    return null;
}

export function loadOfficialPluginManifest(): NormalizedOfficialManifest {
    const raw = readFileSync(manifestPath(), "utf8");
    return normalizeOfficialManifest(JSON.parse(raw));
}

/**
 * A plugin is "installed" once it has a real git checkout under the plugins dir.
 * We check for `.git` rather than the directory alone: an interrupted/failed
 * clone leaves an empty (or partial) directory behind, and treating that as
 * "installed" would hide the install button forever while the scanner ignores
 * the empty dir — the node then reports "no implementation" with no way to fix.
 */
export function isPluginInstalled(id: string): boolean {
    return existsSync(join(pluginsDir(), id, ".git"));
}

export function listOfficialPlugins(): {
    org: string;
    plugins: OfficialPluginInfo[];
} {
    const manifest = loadOfficialPluginManifest();
    const metaMap = loadPluginMetaMap();
    return {
        org: manifest.org,
        plugins: manifest.entries.map(({ id }) => {
            const meta = metaMap[id];
            // Manifest icon wins; otherwise fall back to the public convention
            // so even not-yet-installed plugins can show an icon.
            const icon = meta?.icon ?? publicIconPath(id) ?? undefined;
            return {
                id,
                installed: isPluginInstalled(id),
                name: meta?.name,
                description: meta?.description,
                icon,
            };
        }),
    };
}

/**
 * Installed plugins under the plugins dir that are not in the official
 * manifest — i.e. community plugins cloned from a custom git URL.
 */
export function listInstalledCommunityPlugins(): string[] {
    const official = new Set(
        loadOfficialPluginManifest().entries.map((entry) => entry.id),
    );
    let entries: string[];
    try {
        entries = fs.readdirSync(pluginsDir());
    } catch {
        // Plugins dir not created yet — nothing installed.
        return [];
    }
    return entries
        .filter((id) => !official.has(id) && isPluginInstalled(id))
        .sort();
}

/** Update status for one installed plugin, from comparing local vs remote HEAD. */
export interface PluginUpdateInfo {
    id: string;
    localCommit: string | null;
    remoteCommit: string | null;
    /** True only when both commits are known and differ. */
    hasUpdate: boolean;
}

/** Local HEAD commit of an installed plugin (read from its .git, no network). */
async function localHeadCommit(id: string): Promise<string | null> {
    try {
        return await git.resolveRef({
            fs,
            dir: join(pluginsDir(), id),
            ref: "HEAD",
        });
    } catch {
        return null;
    }
}

/** Remote default-branch HEAD commit (a single ls-remote, no clone). */
export async function remoteHeadCommitForUrl(
    url: string,
): Promise<string | null> {
    const refs = await git.listServerRefs({
        http,
        url,
        prefix: "HEAD",
        symrefs: true,
    });
    return refs.find((r) => r.ref === "HEAD")?.oid ?? null;
}

async function remoteHeadCommit(
    entry: OfficialPluginEntry,
): Promise<string | null> {
    try {
        return await remoteHeadCommitForUrl(officialGitUrl(entry));
    } catch (e) {
        // Network/auth failure: treat as "unknown" rather than surfacing an error
        // — the user can still pull manually.
        logger.warn(
            `[plugins] update check failed for ${entry.id}: ${String(e)}`,
        );
        return null;
    }
}

/**
 * Is the remote holding something we do not have?
 *
 * Deliberately not `local !== remote`. After a fork is adopted the local HEAD
 * can legitimately be *ahead* of the new origin, and plain inequality reads
 * that as an available update — so the badge would never clear and every click
 * would report success while changing nothing. The question is ancestry: an
 * update exists only when the remote commit is not already in our history.
 */
async function remoteIsAhead(
    dir: string,
    localOid: string,
    remoteOid: string,
): Promise<boolean> {
    if (localOid === remoteOid) return false;
    try {
        return !(await git.isDescendent({
            fs,
            dir,
            oid: localOid,
            ancestor: remoteOid,
            depth: -1,
        }));
    } catch {
        // The remote commit is not in the local object store at all, so it is
        // genuinely new to us.
        return true;
    }
}

/**
 * Compare local vs remote HEAD for one plugin. Not-installed -> no update.
 *
 * Takes the entry rather than an org: a forked plugin must be checked against
 * the origin it was cloned from, not the manifest default. This function used
 * to receive `manifest.org` for every plugin alike, which would have reported
 * updates from upstream for a plugin that had moved.
 */
export async function checkPluginUpdate(
    entry: OfficialPluginEntry,
): Promise<PluginUpdateInfo> {
    if (!isPluginInstalled(entry.id)) {
        return {
            id: entry.id,
            localCommit: null,
            remoteCommit: null,
            hasUpdate: false,
        };
    }
    const [localCommit, remoteCommit] = await Promise.all([
        localHeadCommit(entry.id),
        remoteHeadCommit(entry),
    ]);
    return {
        id: entry.id,
        localCommit,
        remoteCommit,
        hasUpdate:
            Boolean(localCommit && remoteCommit) &&
            (await remoteIsAhead(
                join(pluginsDir(), entry.id),
                localCommit as string,
                remoteCommit as string,
            )),
    };
}

/** Check every installed official plugin in parallel (one ls-remote each). */
export async function checkOfficialPluginUpdates(): Promise<
    PluginUpdateInfo[]
> {
    const manifest = loadOfficialPluginManifest();
    const installed = manifest.entries.filter((entry) =>
        isPluginInstalled(entry.id),
    );
    return Promise.all(installed.map((entry) => checkPluginUpdate(entry)));
}
