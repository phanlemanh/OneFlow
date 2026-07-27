# Review Findings: per-plugin-origin (Round 2)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-2 implementation, listed
most-severe first.

## Findings

### 1. The manifest normaliser validates `origin` but never validates the plugin `id`, which is then joined into a filesystem path

- **File**: `src/lib/plugins/official-manifest.ts:147`
- **Severity**: medium
- **Source**: conventions
- **Detail**: `normalizeOfficialManifest` is the declared validation boundary for `config/official-plugins.json` ("The manifest is validated when it loads… a typo must never fall back silently and clone the wrong repository", docs/plugins.md). It checks the root shape, unknown keys, duplicate ids, and forces `org`/`origin` to be http(s) URLs — including explicit tests rejecting `../etc` as an origin. It does not check the id at all beyond non-empty/unique.

  That id flows straight into path construction with no further guard: `installPlugin({id})` looks the entry up and calls `cloneOrPull(entry.id, …)` → `join(pluginsDir(), id)` (src/lib/plugins/plugins-install.server.ts:82), which on a failed clone runs `fs.rmSync(dir, { recursive: true, force: true })`; `isPluginInstalled` and `uninstallPlugin` join the same way. Note that `installPlugin` applies `assertValidPluginId` only on the `gitUrl` branch — the official branch trusts the manifest — and `assertValidPluginId`'s own comment says it "also guards against path traversal — ids never contain '/' or '..'". An id like `../x` or `a/b` in the manifest would traverse out of the plugins dir and would also be invisible to the scanner.

  The repo already owns the rule (`isValidPluginId`/`pluginIdError` in src/lib/plugins/plugin-id.ts, importable from non-server code — plugin-id.test.ts imports it), but today it is only asserted in a unit test against the shipped file, not at load time. Since this change makes the manifest a richer, per-entry-editable surface, the normaliser is the right place to enforce the id convention the rest of the system already assumes.

### 2. The plugin manager's repo link is still built from the default org + id, ignoring a per-entry origin

- **File**: `src/components/workspace/plugins-dialog.tsx:325`
- **Severity**: medium
- **Source**: bugs
- **Detail**: `listOfficialPlugins()` (src/lib/plugins/official-plugins.server.ts:85) still returns only `org: manifest.org` and drops each entry's resolved `origin`. The dialog then renders `href={`${org}/${p.id}`}`. So for a plugin carrying `{"id": ..., "origin": ...}` the app clones/pulls/update-checks against the fork while the visible 'open repo' link sends the user to the upstream repo — a fourth copy of the `org + id` rule that this feature set out to eliminate.

  Why the guards miss it: `scripts/plugins/check-single-url-rule.sh` greps for `\$\{...\}/\$\{...\}\.git`, and this call site has no `.git` suffix, so the single-rule guard structurally cannot see it. `check-installer-parity.ts` only inspects the two server modules, never the UI.

  Note the contract (_acceptance/per-plugin-origin/contract.md:75) declares 'hiển thị origin trên UI' a non-goal, so this may be intentional deferral — but the rendered link is wrong, not merely absent, the moment the first override lands. Fix is either returning the resolved origin per entry from `listOfficialPlugins()` or having the API emit a `repoUrl` per plugin.

### 3. `git.pull` is fast-forward-preferring, not fast-forward-only: a re-pointed origin can silently create a merge commit and a permanently stuck "update available"

- **File**: `src/lib/plugins/plugins-install.server.ts:112`
- **Severity**: medium
- **Source**: bugs
- **Detail**: Both pull paths pass `fastForward: true` with `fastForwardOnly` left at its default `false` (src/lib/plugins/plugins-install.server.ts:106-114 and scripts/install-official-plugins.ts:62-70), while the comments above them describe the operation as 'fast-forward it to the latest commit'.

  In isomorphic-git 1.40.0 `_merge` (node_modules/isomorphic-git/index.js:11158-11221): if `baseOid !== ourOid` and `fastForwardOnly` is false, it does NOT fail — it runs `mergeTree` and, absent conflicts, writes a merge commit with `parent: [ourOid, theirOid]`.

  Concrete scenario, which is precisely the new origin-override case: a plugin is checked out at upstream tip Y; the manifest entry gains `origin` pointing at a fork that branched at X and advanced to Z. Pull now fetches from the fork, base = X, ours = Y, theirs = Z — not a fast-forward. A merge commit M is created locally, `cloneOrPull` returns "updated", and the user is told the install succeeded.

  From then on `checkPluginUpdate` compares `localHeadCommit` (= M) against `remoteHeadCommit` (= Z, via ls-remote on HEAD) — they differ forever, so `hasUpdate` stays true and the dialog shows an update badge permanently. Clicking Update again hits the `baseOid === theirOid` branch (index.js:11152), returns `alreadyMerged`, and reports "updated" success with nothing changed. No error is raised at any point.

  That is exactly the failure mode the comment at plugins-install.server.ts:92-100 says this change exists to prevent, reached by a different route. `fastForwardOnly: true` would surface it as a loud FastForwardError instead.

### 4. The standalone SDK engine still rebuilds the remote from a hard-coded `DEFAULT_ORG`, so headless runs fetch an overridden plugin from upstream

- **File**: `sdk/tongflow/engine/plugins.py:47`
- **Severity**: medium
- **Source**: bugs
- **Detail**: `_git_url_for` does `f"{org.rstrip('/')}/{plugin_id}.git"` with `DEFAULT_ORG = "https://github.com/tong-io"` (line 28) and never reads config/official-plugins.json. A plugin whose manifest entry carries an `origin` is therefore cloned by the desktop app from the fork and by the engine from upstream — the same `pluginId` resolves to two different codebases, and the engine's clone succeeds silently, so the divergence shows up later as unexplained behaviour differences rather than an install error.

  This is acknowledged as a known limit in _acceptance/per-plugin-origin/contract.md:84 and check-single-url-rule.sh's scan is deliberately scoped to .ts/.tsx/.mjs/.js so it cannot see the Python copy. Flagging it because the escape hatch (`plugin_git_urls` overrides passed by the caller) is not wired to the manifest, so nothing in the repo keeps the two in sync — the guard that would have caught it is scoped away.

### 5. CLI installer claims to mirror `cloneOrPull` but omits its interrupted-clone recovery, and uses a different git author

- **File**: `scripts/install-official-plugins.ts:52`
- **Severity**: low
- **Source**: conventions
- **Detail**: `installOne` branches on `fs.existsSync(dir)` and its comment says "Mirrors cloneOrPull in plugins-install.server.ts", but it skips the specific recovery that function documents at length: `cloneOrPull` (src/lib/plugins/plugins-install.server.ts:86-88) wipes a directory that exists without a `.git`, because "a leftover directory without a .git is the corpse of an interrupted/failed earlier clone: it can never be pulled and the scanner ignores it". The CLI path instead calls `git.getConfig({ dir, path: 'remote.origin.url' })` and `git.pull` against that corpse, both of which fail on every subsequent `pnpm plugins:install` run for that plugin — permanently, with no way to recover except manual `rm -rf`. This behaviour is inherited from the deleted `.mjs`, but the new comment now asserts parity that does not exist.

  Separately, the two paths sign with different identities: the server uses `PLUGIN_GIT_AUTHOR = { name: "tongflow", email: "tongflow@local" }` while this script hardcodes `{ name: "oneflow", email: "oneflow@local" }` (line 69). Harmless under `fastForward: true`, but it is a second copy of a constant the shared module could own.

### 6. Parity guard's `git.pull` assertion uses a regex that stops at the first `}`, so it inspects only part of the call

- **File**: `scripts/plugins/check-installer-parity.ts:126`
- **Severity**: low
- **Source**: conventions
- **Detail**: `assertPullUsesResolvedUrl` matches `/git\.pull\(\{[^}]*\}/` and then tests that window for `\burl\b`. `[^}]*` terminates at the first closing brace, which in `scripts/install-official-plugins.ts` is the brace of the inline `author: { name: "oneflow", … }` object — so the guard only ever sees the option keys that happen to precede `author`. It passes today because `url` is listed before `author` in both files. Reordering the object literal (a pure formatting change) would make the guard fail on correct code; conversely a `url` key inside a nested object would satisfy it on incorrect code.

  Given this guard was added specifically because "building the right URL is not the same as fetching from it" — i.e. it is the only mechanical check standing between the feature and the defect it just fixed — it should not depend on argument ordering. Matching balanced braces, or asserting on the AST/`url,` key explicitly within the full call range, would make it say what it means.

### 7. The parity guard's independent expectation model omits the trailing-slash normalisation the resolver performs, producing a false mismatch

- **File**: `scripts/plugins/check-installer-parity.ts:33`
- **Severity**: low
- **Source**: bugs
- **Detail**: `expectedRemotes()` builds `${base}/${id}.git` straight from the raw JSON, where `base` is `entry.origin ?? raw.org` verbatim. The shared resolver's `requireHttpUrl` (src/lib/plugins/official-manifest.ts:59) strips trailing slashes: `value.replace(/\/+$/, "")`.

  With an entry such as `"origin": "https://github.com/phanlemanh/"` — the exact browser-address-bar paste that trailing-slash stripping was added to handle, and which official-manifest.test.ts:208-223 asserts is valid — the guard expects `https://github.com/phanlemanh//x.git` while the installer correctly prints `https://github.com/phanlemanh/x.git`. `compare()` then throws and the guard fails on a manifest that is entirely correct.

  The file's header justifies re-deriving the rule independently, which is sound, but the independent model has to encode the same normalisation contract or it flags conformance as divergence.

## Review incomplete

None — no finder/refuter died during this round's review.

## Chưa adversarial-verify (refuter chết)

None — all 7 findings above went through adversarial verification (no
`unverified: true` findings in this round).
