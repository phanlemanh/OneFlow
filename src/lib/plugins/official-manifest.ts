/**
 * The official-plugin manifest: its shape, its validation, and the one rule
 * that turns an entry into a git remote.
 *
 * Lives outside `official-plugins.server.ts` for the same reason `plugin-id.ts`
 * does — that file is `server-only` and cannot be imported from vitest or from
 * a tsx script. Keeping this module pure (it takes parsed JSON; it never reads
 * a file) is what lets the in-app manager, the CLI installer
 * (scripts/install-official-plugins.ts), and the update checker all share one
 * implementation instead of three lookalikes.
 *
 * `origin` on an entry is a **base URL**, exactly like the top-level `org`: the
 * id and `.git` are still appended. It is not a finished clone URL.
 */

/** One manifest entry with its origin already resolved. */
export interface OfficialPluginEntry {
    id: string;
    /** Effective base URL: the entry's own `origin`, else the manifest `org`. */
    origin: string;
}

export interface NormalizedOfficialManifest {
    /** Default origin for entries that do not override it. */
    org: string;
    entries: OfficialPluginEntry[];
}

const ALLOWED_ENTRY_KEYS = new Set(["id", "origin"]);

function isHttpUrl(value: string): boolean {
    let parsed: URL;
    try {
        parsed = new URL(value);
    } catch {
        return false;
    }
    return parsed.protocol === "http:" || parsed.protocol === "https:";
}

/**
 * Validate a base URL and strip any trailing slash.
 *
 * A URL pasted from a browser address bar often ends in `/`, which would
 * otherwise survive into the remote URL as a double slash before the id. Some
 * hosts tolerate that and some do not, so normalising here keeps one shape
 * rather than leaving the outcome to the remote.
 *
 * (Described in prose deliberately: check-single-url-rule.sh counts literal
 * occurrences of the template, and a comment quoting it would read as a second
 * copy of the rule.)
 */
function requireHttpUrl(value: string, label: string): string {
    if (!isHttpUrl(value)) {
        throw new Error(
            `official-plugins manifest: ${label} must be an http(s) URL, got ${JSON.stringify(value)}`,
        );
    }
    return value.replace(/\/+$/, "");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate and normalise a parsed manifest.
 *
 * Every rejection names the offending entry: a typo that silently fell back to
 * the default origin would clone the wrong repository, which is the failure
 * this validation exists to prevent.
 */
export function normalizeOfficialManifest(
    raw: unknown,
): NormalizedOfficialManifest {
    if (!isPlainObject(raw)) {
        throw new Error("official-plugins manifest: root must be an object");
    }
    if (typeof raw.org !== "string") {
        throw new Error("official-plugins manifest: `org` must be a string");
    }
    const org = requireHttpUrl(raw.org, "`org`");

    if (!Array.isArray(raw.plugins)) {
        throw new Error(
            "official-plugins manifest: `plugins` must be an array",
        );
    }

    const entries: OfficialPluginEntry[] = [];
    const seen = new Set<string>();

    raw.plugins.forEach((entry: unknown, index: number) => {
        const at = `entry ${index}`;
        let id: string;
        let origin = org;

        if (typeof entry === "string") {
            id = entry;
        } else if (isPlainObject(entry)) {
            for (const key of Object.keys(entry)) {
                if (!ALLOWED_ENTRY_KEYS.has(key)) {
                    throw new Error(
                        `official-plugins manifest: ${at} has unknown key ${JSON.stringify(key)} (allowed: id, origin)`,
                    );
                }
            }
            if (typeof entry.id !== "string") {
                throw new Error(
                    `official-plugins manifest: ${at} is missing a string \`id\``,
                );
            }
            id = entry.id;
            if (entry.origin !== undefined) {
                if (typeof entry.origin !== "string") {
                    throw new Error(
                        `official-plugins manifest: ${at} (${id}) has a non-string \`origin\``,
                    );
                }
                if (entry.origin.trim() === "") {
                    throw new Error(
                        `official-plugins manifest: ${at} (${id}) has an empty \`origin\``,
                    );
                }
                origin = requireHttpUrl(
                    entry.origin,
                    `${at} (${id}) \`origin\``,
                );
            }
        } else {
            throw new Error(
                `official-plugins manifest: ${at} must be a string or an object, got ${JSON.stringify(entry)}`,
            );
        }

        if (id.trim() === "") {
            throw new Error(
                `official-plugins manifest: ${at} has an empty plugin id`,
            );
        }
        if (seen.has(id)) {
            throw new Error(
                `official-plugins manifest: duplicate plugin id ${JSON.stringify(id)} at ${at}`,
            );
        }
        seen.add(id);
        entries.push({ id, origin });
    });

    return { org, entries };
}

/**
 * The git remote for an entry — the only place this template exists.
 *
 * It takes an entry rather than an `(org, id)` pair on purpose: with the pair
 * form a caller holding only the default org could build a URL for a plugin
 * that overrides it, which is exactly how the update checker would have kept
 * pointing at upstream after a fork.
 */
export function officialGitUrl(entry: OfficialPluginEntry): string {
    return `${entry.origin}/${entry.id}.git`;
}

export function findOfficialEntry(
    manifest: NormalizedOfficialManifest,
    id: string,
): OfficialPluginEntry | undefined {
    return manifest.entries.find((entry) => entry.id === id);
}
