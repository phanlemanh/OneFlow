# Per-plugin origin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a single entry in `config/official-plugins.json` carry its own `origin`, so one plugin can be forked without moving the other 37.

**Architecture:** A new pure module `src/lib/plugins/official-manifest.ts` becomes the one home of both the manifest shape and the URL rule. It takes parsed JSON and returns normalised entries whose `origin` is already resolved (own `origin`, else the top-level `org`). The URL builder takes an **entry**, never an `(org, id)` pair — that signature is what structurally prevents the bug this feature exists to fix, because there is no longer a way to build a URL while holding only the default org. All three consumers (in-app install, CLI installer, update checker) switch to entries, and the CLI installer moves from `.mjs` to TypeScript so it imports the same module instead of re-deriving the rule.

**Tech Stack:** TypeScript, vitest, tsx (for scripts), isomorphic-git, Biome.

## Global Constraints

- Code comments in **English only** (CLAUDE.md).
- Conventional Commits.
- Verify suite before every commit: `pnpm lint:check` · `pnpm typecheck` · `pnpm build` · `pnpm test` · `pnpm verify:plugins`.
- Branch off `main`; we are already on `feat/per-plugin-origin`.
- The shipped `config/official-plugins.json` must end this change **unmodified**: 38 plain string entries, `"org": "https://github.com/tong-io"` (AC-6). No plugin is repointed here.
- The new module must **not** import `server-only` — vitest cannot import server-only files. This is the same reason `plugin-id.ts` exists outside `plugins-install.server.ts`.
- Scripts run under `tsx` and import with **relative paths** (`../src/lib/...`), not the `@/` alias — match `scripts/verify-plugins-scan.ts`.

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/plugins/official-manifest.ts` | **Create.** Pure: manifest types, validation, normalisation, and the single URL rule. |
| `src/lib/plugins/official-manifest.test.ts` | **Create.** E1–E4: string entries, override entries, malformed entries, non-http origins. |
| `src/lib/plugins/official-plugins.server.ts` | **Modify.** Delegate to the new module; `listOfficialPlugins`, `listInstalledCommunityPlugins`, `checkOfficialPluginUpdates` consume entries. Drop the local `officialGitUrl`. |
| `src/lib/plugins/plugins-install.server.ts` | **Modify.** Look up an entry rather than testing `manifest.plugins.includes(id)`. |
| `scripts/install-official-plugins.ts` | **Create.** Replaces the `.mjs`; imports the shared module; gains `--print-remotes`. |
| `scripts/install-official-plugins.mjs` | **Delete.** Its existence is what E5 asserts against. |
| `package.json` | **Modify.** `plugins:install` runs under `tsx`. |
| `scripts/plugins/check-single-url-rule.sh` | **Create.** E5. |
| `scripts/plugins/check-consumer-parity.ts` | **Create.** E6, three-consumer parity. |
| `scripts/plugins/check-manifest-unmoved.sh` | **Create.** E7. |

Config keys `executors.script.origin_single_impl` / `origin_installer_parity` / `origin_manifest_unmoved` already exist in `_acceptance/config.yaml` and point at `check-single-url-rule.sh`, `check-installer-parity.ts`, `check-manifest-unmoved.sh`. **Task 4 must create `check-installer-parity.ts` under exactly that name** — the eval command is fixed and renaming it would break the approved eval.

---

### Task 1: The normaliser and the single URL rule

Serves E1, E2, E3, E4 (AC-1, AC-2, AC-4, AC-5). `independent: false` — Tasks 2 and 3 both consume it.

**Files:**
- Create: `src/lib/plugins/official-manifest.ts`
- Test: `src/lib/plugins/official-manifest.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `interface OfficialPluginEntry { id: string; origin: string }` — `origin` is the **effective** base URL, already resolved.
  - `interface NormalizedOfficialManifest { org: string; entries: OfficialPluginEntry[] }`
  - `function normalizeOfficialManifest(raw: unknown): NormalizedOfficialManifest` — throws `Error` on any malformed input.
  - `function officialGitUrl(entry: OfficialPluginEntry): string`
  - `function findOfficialEntry(manifest: NormalizedOfficialManifest, id: string): OfficialPluginEntry | undefined`

- [ ] **Step 1: Write the failing test**

Create `src/lib/plugins/official-manifest.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    findOfficialEntry,
    normalizeOfficialManifest,
    officialGitUrl,
} from "@/lib/plugins/official-manifest";

const DEFAULT_ORG = "https://github.com/tong-io";
const FORK_ORIGIN = "https://github.com/phanlemanh";

function shipped(): unknown {
    return JSON.parse(
        readFileSync(
            join(process.cwd(), "config", "official-plugins.json"),
            "utf8",
        ),
    );
}

describe("string entries — today's manifest (AC-1)", () => {
    it("resolves every id to the top-level org", () => {
        const m = normalizeOfficialManifest(shipped());
        expect(m.org).toBe(DEFAULT_ORG);
        for (const entry of m.entries) {
            expect(entry.origin).toBe(DEFAULT_ORG);
            expect(officialGitUrl(entry)).toBe(
                `${DEFAULT_ORG}/${entry.id}.git`,
            );
        }
    });

    it("preserves the id list element for element, in order", () => {
        const raw = shipped() as { plugins: string[] };
        const m = normalizeOfficialManifest(raw);
        expect(m.entries.map((e) => e.id)).toEqual(raw.plugins);
    });
});

describe("override entries (AC-2)", () => {
    const raw = {
        org: DEFAULT_ORG,
        plugins: [
            "tongflow-api-gemini",
            { id: "oneflow-api-openai", origin: FORK_ORIGIN },
            "tongflow-api-deepseek",
        ],
    };

    it("appends id and .git to the entry's own origin", () => {
        const m = normalizeOfficialManifest(raw);
        const entry = findOfficialEntry(m, "oneflow-api-openai");
        expect(entry).toBeDefined();
        expect(officialGitUrl(entry as never)).toBe(
            `${FORK_ORIGIN}/oneflow-api-openai.git`,
        );
    });

    it("leaves every sibling on the default origin", () => {
        const m = normalizeOfficialManifest(raw);
        for (const id of ["tongflow-api-gemini", "tongflow-api-deepseek"]) {
            const entry = findOfficialEntry(m, id);
            expect(officialGitUrl(entry as never)).toBe(
                `${DEFAULT_ORG}/${id}.git`,
            );
        }
    });

    it("accepts an object entry with no origin and falls back to the default", () => {
        const m = normalizeOfficialManifest({
            org: DEFAULT_ORG,
            plugins: [{ id: "tongflow-api-gemini" }],
        });
        expect(officialGitUrl(m.entries[0])).toBe(
            `${DEFAULT_ORG}/tongflow-api-gemini.git`,
        );
    });

    it("keeps order across mixed string and object entries", () => {
        const m = normalizeOfficialManifest(raw);
        expect(m.entries.map((e) => e.id)).toEqual([
            "tongflow-api-gemini",
            "oneflow-api-openai",
            "tongflow-api-deepseek",
        ]);
    });
});

describe("malformed entries are rejected by name (AC-4)", () => {
    it.each([
        [
            "unknown key",
            { id: "tongflow-api-gemini", orgin: FORK_ORIGIN },
            "orgin",
        ],
        ["missing id", { origin: FORK_ORIGIN }, "id"],
        ["non-string id", { id: 7 }, "id"],
        ["empty string entry", "", "empty"],
        ["empty id", { id: "" }, "empty"],
        ["non-string origin", { id: "tongflow-api-gemini", origin: 7 }, "origin"],
        ["empty origin", { id: "tongflow-api-gemini", origin: "" }, "origin"],
        ["entry is an array", [], "entry"],
        ["entry is null", null, "entry"],
    ])("rejects %s", (_label, entry, needle) => {
        expect(() =>
            normalizeOfficialManifest({ org: DEFAULT_ORG, plugins: [entry] }),
        ).toThrowError(new RegExp(needle, "i"));
    });

    it("rejects a duplicate id and names it", () => {
        expect(() =>
            normalizeOfficialManifest({
                org: DEFAULT_ORG,
                plugins: ["tongflow-api-gemini", "tongflow-api-gemini"],
            }),
        ).toThrowError(/tongflow-api-gemini/);
    });

    it("rejects a duplicate across string and object forms", () => {
        expect(() =>
            normalizeOfficialManifest({
                org: DEFAULT_ORG,
                plugins: [
                    "tongflow-api-gemini",
                    { id: "tongflow-api-gemini", origin: FORK_ORIGIN },
                ],
            }),
        ).toThrowError(/tongflow-api-gemini/);
    });

    it("rejects a missing or non-array plugins list", () => {
        expect(() => normalizeOfficialManifest({ org: DEFAULT_ORG })).toThrow();
        expect(() =>
            normalizeOfficialManifest({ org: DEFAULT_ORG, plugins: {} }),
        ).toThrow();
    });

    it("rejects a missing or non-string org", () => {
        expect(() => normalizeOfficialManifest({ plugins: [] })).toThrow();
        expect(() =>
            normalizeOfficialManifest({ org: 7, plugins: [] }),
        ).toThrow();
    });
});

describe("non-http(s) origins are rejected (AC-5)", () => {
    it.each([
        "git@github.com:phanlemanh/x",
        "../etc",
        "javascript:alert(1)",
        "file:///tmp/x",
        "ssh://git@github.com/x",
        "not a url at all",
    ])("rejects %s as an entry origin", (origin) => {
        expect(() =>
            normalizeOfficialManifest({
                org: DEFAULT_ORG,
                plugins: [{ id: "tongflow-api-gemini", origin }],
            }),
        ).toThrowError(/http/i);
    });

    it("rejects a non-http(s) top-level org", () => {
        expect(() =>
            normalizeOfficialManifest({
                org: "git@github.com:tong-io",
                plugins: [],
            }),
        ).toThrowError(/http/i);
    });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm vitest run src/lib/plugins/official-manifest.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/plugins/official-manifest"`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/plugins/official-manifest.ts`:

```ts
/**
 * The official-plugin manifest: its shape, its validation, and the one rule
 * that turns an entry into a git remote.
 *
 * Lives outside `official-plugins.server.ts` for the same reason `plugin-id.ts`
 * does — that file is `server-only` and cannot be imported from vitest or from
 * a tsx script. Keeping this module pure (it takes parsed JSON; it never reads
 * a file) is what lets the in-app manager, the CLI installer, and the update
 * checker all share one implementation instead of three lookalikes.
 *
 * `origin` on an entry is a **base URL**, exactly like the top-level `org`:
 * the id and `.git` are still appended. It is not a finished clone URL.
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

function requireHttpUrl(value: string, label: string): string {
    if (!isHttpUrl(value)) {
        throw new Error(
            `official-plugins manifest: ${label} must be an http(s) URL, got ${JSON.stringify(value)}`,
        );
    }
    return value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === "object" && value !== null && !Array.isArray(value)
    );
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
        throw new Error("official-plugins manifest: `plugins` must be an array");
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm vitest run src/lib/plugins/official-manifest.test.ts`
Expected: PASS, all describes green.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/lib/plugins/official-manifest.ts src/lib/plugins/official-manifest.test.ts
git commit -m "feat(plugins): give the manifest one normaliser and one URL rule"
```

---

### Task 2: Move the three consumers onto entries

Serves E2, E6 (AC-2, AC-3). `independent: true` **relative to Task 3**; both depend on Task 1.

**Files:**
- Modify: `src/lib/plugins/official-plugins.server.ts:11-19` (types), `:50-58` (loader and URL rule), `:71-93` (`listOfficialPlugins`), `:99-101` (`listInstalledCommunityPlugins`), `:135-187` (update checker)
- Modify: `src/lib/plugins/plugins-install.server.ts:12-13` (imports), `:134-141` (official lookup)

**Interfaces:**
- Consumes: `normalizeOfficialManifest`, `officialGitUrl`, `findOfficialEntry`, `OfficialPluginEntry`, `NormalizedOfficialManifest` from Task 1.
- Produces:
  - `loadOfficialPluginManifest(): NormalizedOfficialManifest` — same name, normalised return.
  - `checkPluginUpdate(entry: OfficialPluginEntry): Promise<PluginUpdateInfo>` — **signature change**: no longer takes `(org, id)`.
  - `officialGitUrl` is re-exported from `official-plugins.server.ts` for existing importers.

- [ ] **Step 1: Replace the local types and loader**

In `src/lib/plugins/official-plugins.server.ts`, delete the local `OfficialPluginManifest` interface (lines 16–19) and the local `officialGitUrl` (lines 55–58). Add to the import block:

```ts
import {
    findOfficialEntry,
    type NormalizedOfficialManifest,
    normalizeOfficialManifest,
    type OfficialPluginEntry,
    officialGitUrl,
} from "@/lib/plugins/official-manifest";
```

Re-export so existing importers keep working:

```ts
export {
    findOfficialEntry,
    officialGitUrl,
    type NormalizedOfficialManifest,
    type OfficialPluginEntry,
};
```

Replace the loader:

```ts
export function loadOfficialPluginManifest(): NormalizedOfficialManifest {
    const raw = readFileSync(manifestPath(), "utf8");
    return normalizeOfficialManifest(JSON.parse(raw));
}
```

- [ ] **Step 2: Move the three readers onto `entries`**

`listOfficialPlugins` (was `manifest.plugins.map((id) => ...)`):

```ts
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
```

The API response keeps its shape — `org` still reports the default. Out of scope says the response shape does not change (no T3 surface).

`listInstalledCommunityPlugins` (line 100):

```ts
    const official = new Set(
        loadOfficialPluginManifest().entries.map((entry) => entry.id),
    );
```

- [ ] **Step 3: Make the update checker origin-aware**

Replace `remoteHeadCommit`, `checkPluginUpdate`, and `checkOfficialPluginUpdates`:

```ts
/** Remote default-branch HEAD commit (a single ls-remote, no clone). */
async function remoteHeadCommit(
    entry: OfficialPluginEntry,
): Promise<string | null> {
    try {
        const refs = await git.listServerRefs({
            http,
            url: officialGitUrl(entry),
            prefix: "HEAD",
            symrefs: true,
        });
        return refs.find((r) => r.ref === "HEAD")?.oid ?? null;
    } catch (e) {
        logger.warn(
            `[plugins] update check failed for ${entry.id}: ${String(e)}`,
        );
        return null;
    }
}

/**
 * Compare local vs remote HEAD for one plugin. Not-installed -> no update.
 *
 * Takes the entry, not an org: a forked plugin must be checked against the
 * origin it was cloned from, not the manifest default.
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
        hasUpdate: Boolean(
            localCommit && remoteCommit && localCommit !== remoteCommit,
        ),
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
```

- [ ] **Step 4: Move the install path onto the entry**

In `src/lib/plugins/plugins-install.server.ts`, change the import to pull `findOfficialEntry` alongside the existing two, then replace lines 134–141:

```ts
        const manifest = loadOfficialPluginManifest();
        const entry = findOfficialEntry(manifest, params.id);
        if (!entry) {
            // keep the existing error/throw that followed `if (!manifest.plugins.includes(...))`
        }
        gitUrl = officialGitUrl(entry);
```

Keep the existing error message and control flow verbatim — only the lookup and the URL call change.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm typecheck && pnpm lint:check && pnpm test
```

Expected: PASS. `pnpm typecheck` is the real gate here — the `checkPluginUpdate` signature change surfaces any call site this task missed.

- [ ] **Step 6: Commit**

```bash
git add src/lib/plugins/official-plugins.server.ts src/lib/plugins/plugins-install.server.ts
git commit -m "feat(plugins): resolve remotes from entries, update checker included"
```

---

### Task 3: Move the CLI installer to TypeScript

Serves E5, E6, E10 (AC-3). `independent: true` **relative to Task 2**; depends on Task 1.

**Files:**
- Create: `scripts/install-official-plugins.ts`
- Delete: `scripts/install-official-plugins.mjs`
- Modify: `package.json:37`

**Interfaces:**
- Consumes: `normalizeOfficialManifest`, `officialGitUrl`, `OfficialPluginEntry` from Task 1, imported by **relative path**.
- Produces: a `--print-remotes` mode printing `<id>\t<url>` per line, which Task 4's parity check consumes.

- [ ] **Step 1: Write the TypeScript installer**

Create `scripts/install-official-plugins.ts`:

```ts
/**
 * Clone the official plugins into the gitignored plugins/ directory.
 *
 * Tracks each repo's default branch (no pinned ref) so a plain pull always
 * lands the latest. The manifest and the URL rule come from
 * src/lib/plugins/official-manifest.ts — the same module the in-app plugin
 * manager and the update checker use, so all three can never disagree about
 * where a plugin comes from.
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
    if (fs.existsSync(dir)) {
        await git.pull({
            fs,
            http,
            dir,
            singleBranch: true,
            fastForward: true,
            author: { name: "oneflow", email: "oneflow@local" },
        });
        return "updated";
    }
    await git.clone({
        fs,
        http,
        dir,
        url: officialGitUrl(entry),
        singleBranch: true,
    });
    return "cloned";
}

async function main(): Promise<void> {
    const argv = process.argv.slice(2);
    const printOnly = argv.includes("--print-remotes");
    const requested = argv.filter((a) => a !== "--print-remotes");
    const known = manifest.entries.map((e) => e.id);

    const unknown = requested.filter((id) => !known.includes(id));
    if (unknown.length) {
        console.error(
            `[install-plugins] Unknown plugin(s): ${unknown.join(", ")}`,
        );
        console.error(`[install-plugins] Available: ${known.join(", ")}`);
        process.exit(1);
    }

    const targets = requested.length
        ? manifest.entries.filter((e) => requested.includes(e.id))
        : manifest.entries;

    // Print the remotes this run would clone from, without touching the
    // network or the disk. The parity check compares this against the other
    // two consumers.
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
```

- [ ] **Step 2: Delete the old script and repoint the package script**

```bash
git rm scripts/install-official-plugins.mjs
```

In `package.json`, change line 37 to:

```json
        "plugins:install": "tsx scripts/install-official-plugins.ts",
```

- [ ] **Step 3: Fix the stale comment in the server module**

`src/lib/plugins/official-plugins.server.ts:13` names the `.mjs` file. Change that line to read `scripts/install-official-plugins.ts`.

- [ ] **Step 4: Verify the dry run**

Run: `pnpm plugins:install --print-remotes | head -3`

Expected: three lines, each `<id><TAB>https://github.com/tong-io/<id>.git`. No network access, no directory created.

Run: `pnpm plugins:install --print-remotes | wc -l`
Expected: `38`.

- [ ] **Step 5: Lint, typecheck, commit**

```bash
pnpm lint:check && pnpm typecheck
git add scripts/install-official-plugins.ts package.json src/lib/plugins/official-plugins.server.ts
git commit -m "refactor(plugins): move the CLI installer to TypeScript on the shared resolver"
```

---

### Task 4: The three guard scripts

Serves E5, E6, E7 (AC-3, AC-6). `independent: false` — needs Tasks 2 and 3 merged.

**Files:**
- Create: `scripts/plugins/check-single-url-rule.sh`
- Create: `scripts/plugins/check-installer-parity.ts`
- Create: `scripts/plugins/check-manifest-unmoved.sh`

**Interfaces:**
- Consumes: `--print-remotes` from Task 3; `normalizeOfficialManifest` / `officialGitUrl` from Task 1.
- Produces: exit 0 / non-zero with a named reason. Bound to the approved eval commands — **do not rename these files.**

- [ ] **Step 1: E5 — the URL rule exists exactly once**

Create `scripts/plugins/check-single-url-rule.sh`:

```bash
#!/usr/bin/env bash
# E5 / AC-3: the `${...}/${id}.git` template must exist in exactly one place.
#
# Scope is declared rather than implied: src/ and scripts/, source extensions
# only, excluding this checker (which quotes the pattern) and test fixtures
# (which legitimately spell out expected URLs). Without the exclusions a
# correct tree would fail; without the scope a stray copy under scripts/ would
# pass.
set -euo pipefail

pattern='\$\{[^}]*\}/\$\{[^}]*\}\.git'

matches=$(grep -rnE "$pattern" src scripts \
    --include='*.ts' --include='*.tsx' --include='*.mjs' --include='*.js' \
    | grep -v 'scripts/plugins/check-single-url-rule.sh' \
    | grep -v '\.test\.' || true)

count=$(printf '%s' "$matches" | grep -c . || true)

if [ "$count" -ne 1 ]; then
    echo "FAIL: expected the URL template exactly once, found $count:"
    printf '%s\n' "$matches"
    exit 1
fi

if ! printf '%s' "$matches" | grep -q 'src/lib/plugins/official-manifest.ts'; then
    echo "FAIL: the single occurrence is not in official-manifest.ts:"
    printf '%s\n' "$matches"
    exit 1
fi

if [ -e scripts/install-official-plugins.mjs ]; then
    echo "FAIL: scripts/install-official-plugins.mjs still exists; it moved to TypeScript"
    exit 1
fi

if ! grep -q 'official-manifest' scripts/install-official-plugins.ts; then
    echo "FAIL: the CLI installer does not import the shared resolver"
    exit 1
fi

echo "OK: one URL rule, in official-manifest.ts; installer imports it"
```

Make it executable: `chmod +x scripts/plugins/check-single-url-rule.sh`

- [ ] **Step 2: E6 — all three consumers agree**

Create `scripts/plugins/check-installer-parity.ts`:

```ts
/**
 * E6 / AC-3: the CLI installer, the in-app install path, and the update
 * checker must build the same remote for the same entry.
 *
 * The expected table is re-derived here in three deliberate lines rather than
 * imported from the resolver. Comparing the resolver against itself would pass
 * even if every consumer were wrong; this way the expectation is independent.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

interface RawManifest {
    org: string;
    plugins: (string | { id: string; origin?: string })[];
}

/** Independent expectation model — intentionally NOT the shared resolver. */
function expectedRemotes(raw: RawManifest): Map<string, string> {
    const out = new Map<string, string>();
    for (const entry of raw.plugins) {
        const id = typeof entry === "string" ? entry : entry.id;
        const base =
            typeof entry === "string" ? raw.org : (entry.origin ?? raw.org);
        out.set(id, `${base}/${id}.git`);
    }
    return out;
}

function installerRemotes(resourcesDir: string): Map<string, string> {
    const stdout = execFileSync(
        "pnpm",
        ["tsx", "scripts/install-official-plugins.ts", "--print-remotes"],
        { encoding: "utf8", env: { ...process.env, TONGFLOW_RESOURCES_DIR: resourcesDir } },
    );
    const out = new Map<string, string>();
    for (const line of stdout.split("\n")) {
        if (!line.trim()) continue;
        const [id, url] = line.split("\t");
        out.set(id, url);
    }
    return out;
}

function compare(label: string, want: Map<string, string>, got: Map<string, string>): void {
    if (want.size !== got.size) {
        throw new Error(
            `${label}: expected ${want.size} remotes, installer printed ${got.size}`,
        );
    }
    for (const [id, url] of want) {
        if (got.get(id) !== url) {
            throw new Error(
                `${label}: ${id} — expected ${url}, installer printed ${got.get(id)}`,
            );
        }
    }
}

/**
 * The in-app path and the update checker live in `server-only` modules that
 * cannot be imported here, so their agreement is asserted structurally: after
 * this change neither may thread a bare org into a URL builder. Any call site
 * that still does is the second copy of the rule coming back.
 */
function assertNoBareOrgUrlBuild(): void {
    const files = [
        "src/lib/plugins/official-plugins.server.ts",
        "src/lib/plugins/plugins-install.server.ts",
    ];
    for (const file of files) {
        const src = readFileSync(file, "utf8");
        const bad = src.match(/officialGitUrl\(\s*[^)]*\borg\b/);
        if (bad) {
            throw new Error(
                `${file}: officialGitUrl is being called with an org rather than an entry — ${bad[0]}`,
            );
        }
    }
}

function main(): void {
    // 1. The shipped manifest.
    const raw = JSON.parse(
        readFileSync(join(process.cwd(), "config", "official-plugins.json"), "utf8"),
    ) as RawManifest;
    compare("shipped manifest", expectedRemotes(raw), installerRemotes(process.cwd()));

    // 2. A fixture whose entry overrides its origin.
    const fixtureRoot = mkdtempSync(join(tmpdir(), "oneflow-parity-"));
    const fixture: RawManifest = {
        org: "https://github.com/tong-io",
        plugins: [
            "tongflow-api-gemini",
            { id: "oneflow-api-openai", origin: "https://github.com/phanlemanh" },
        ],
    };
    execFileSync("mkdir", ["-p", join(fixtureRoot, "config")]);
    writeFileSync(
        join(fixtureRoot, "config", "official-plugins.json"),
        JSON.stringify(fixture, null, 4),
    );
    compare("override fixture", expectedRemotes(fixture), installerRemotes(fixtureRoot));

    // 3. No consumer may build a URL from a bare org.
    assertNoBareOrgUrlBuild();

    console.log("OK: installer, in-app path and update checker agree");
}

main();
```

- [ ] **Step 3: E7 — the shipped manifest did not move**

Create `scripts/plugins/check-manifest-unmoved.sh`:

```bash
#!/usr/bin/env bash
# E7 / AC-6: this change is a capability, not a migration. The shipped manifest
# must still be 38 plain string entries under the upstream org.
set -euo pipefail

manifest=config/official-plugins.json

org=$(node -e "process.stdout.write(JSON.parse(require('fs').readFileSync('$manifest','utf8')).org)")
if [ "$org" != "https://github.com/tong-io" ]; then
    echo "FAIL: default org is '$org', expected https://github.com/tong-io"
    exit 1
fi

total=$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$manifest','utf8')).plugins.length))")
strings=$(node -e "process.stdout.write(String(JSON.parse(require('fs').readFileSync('$manifest','utf8')).plugins.filter(e=>typeof e==='string').length))")

if [ "$total" != "38" ] || [ "$strings" != "38" ]; then
    echo "FAIL: expected 38 plain string entries, got $strings string(s) of $total total"
    exit 1
fi

echo "OK: 38 plain string entries, default org unchanged"
```

Make it executable: `chmod +x scripts/plugins/check-manifest-unmoved.sh`

- [ ] **Step 4: Run all three guards**

```bash
bash scripts/plugins/check-single-url-rule.sh
pnpm tsx scripts/plugins/check-installer-parity.ts
bash scripts/plugins/check-manifest-unmoved.sh
```

Expected: three `OK:` lines, all exit 0.

- [ ] **Step 5: Run the whole verify suite**

```bash
pnpm lint:check && pnpm typecheck && pnpm build && pnpm test && pnpm verify:plugins
```

Expected: all green. `pnpm test` must include both `official-manifest.test.ts` and the untouched `plugin-id.test.ts` (E8).

- [ ] **Step 6: Commit**

```bash
chmod +x scripts/plugins/check-single-url-rule.sh scripts/plugins/check-manifest-unmoved.sh
git add scripts/plugins/
git commit -m "test(plugins): guard the single URL rule, consumer parity and the unmoved manifest"
```

---

## Documentation

- [ ] **Task 5: Update the docs that describe the manifest**

**Files:**
- Modify: `docs/plugins.md` — document the optional per-entry `origin` beside the existing manifest description, stating that it is a base URL like `org` and that omitting it falls back to the default.
- Modify: `README.md:220` — no change needed (`pnpm plugins:install` is unchanged); verify only.

Commit: `docs: describe per-plugin origin in the manifest`

---

## Self-Review

**Spec coverage:**

| AC | Task |
|---|---|
| AC-1 (strings resolve to org, order preserved) | Task 1, tests in Step 1 |
| AC-2 (override resolves to own origin, siblings unaffected, object without origin valid) | Task 1 tests; Task 2 wiring |
| AC-3 (one resolver, three consumers agree) | Tasks 2, 3, 4 |
| AC-4 (malformed named and rejected) | Task 1 |
| AC-5 (non-http(s) rejected) | Task 1 |
| AC-6 (manifest unmoved, prefix guards green) | Task 4 Step 3, plus untouched `plugin-id.test.ts` |

| Eval | Task |
|---|---|
| E1–E4 | Task 1 |
| E5 | Task 4 Step 1 |
| E6 | Task 4 Step 2 |
| E7 | Task 4 Step 3 |
| E8, E9 | Task 4 Step 5 |
| E10, E11 | every task's verify step |
| E12 | Task 4 Step 5 |

**Placeholder scan:** one deliberate ellipsis remains — Task 2 Step 4 says "keep the existing error/throw that followed". That is intentional: the existing message is correct and copying it here risks it drifting from the file. The implementer reads it in place at `plugins-install.server.ts:135-140`.

**Type consistency:** `OfficialPluginEntry` / `NormalizedOfficialManifest` / `normalizeOfficialManifest` / `officialGitUrl(entry)` / `findOfficialEntry` are spelled identically in Tasks 1, 2, 3, 4. `officialGitUrl` takes **one** argument everywhere — the old two-argument form appears only in the "delete this" instruction of Task 2 Step 1 and in the E6 guard that forbids its return.
