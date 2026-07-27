# Review Findings: per-plugin-origin (Round 7)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-7 implementation, listed
most-severe first.

## Findings

### 1. Origin-move handling deletes the checkout before the replacement clone succeeds — a failed clone uninstalls the plugin

- **File**: `src/lib/plugins/plugins-install.server.ts:109`
- **Severity**: high
- **Source**: conventions
- **Detail**: Both install paths (`plugins-install.server.ts:105-111` and `scripts/install-official-plugins.ts:69-74`) call `fs.rmSync` on the existing checkout the moment `remote.origin.url` differs from the resolved URL, and only then attempt `git.clone`. If that clone fails — transient network, auth, or an origin typo in `config/official-plugins.json` that passed the http(s) validation but points at a non-existent repo — the plugin is gone: `cloning` is now `true`, so the catch at `plugins-install.server.ts:149-151` removes whatever remains as well. The user's action was "update"; the outcome is "uninstalled". The design decision recorded in the comment ("re-clone rather than reconcile") does not require destroying first: clone into a sibling temp dir under `pluginsDir()` and rename over the old one, so the working checkout survives a failed fetch. This matters more than before this change because a manifest edit is now enough to trigger it across every user on the next update, and the CLI path is worse still — `installOne` has no catch-side cleanup at all, so a failure there leaves a partial directory that the corpse-wipe at line 57 has to clean up on the run after.

### 2. Origin-move detection compares remote URLs as raw strings, so an equivalent remote is treated as "moved" and the checkout is recursively deleted

- **File**: `src/lib/plugins/plugins-install.server.ts:105`
- **Severity**: high
- **Source**: bugs
- **Detail**: `cloneOrPull` (and the identical block in `scripts/install-official-plugins.ts:69`) decides an origin has moved with `storedUrl !== gitUrl`, where `storedUrl` comes from `git.getConfig({path: "remote.origin.url"})` and `gitUrl` from `officialGitUrl(entry)`, which always appends `.git`. Any string-level difference that is not an actual origin change fires the destructive branch: a missing `.git` suffix, a trailing slash, `http` vs `https`, host casing, a remote named something other than `origin`, or `getConfig` returning `undefined` when no remote is configured at all.

  Concrete failure: `docs/plugins.md:401` tells contributors they can `git clone` a plugin straight into `plugins/`. A user who runs `git clone https://github.com/tong-io/tongflow-api-gemini` (no `.git` suffix — the form GitHub's web UI and most copy/paste give) gets `remote.origin.url = https://github.com/tong-io/tongflow-api-gemini`, while the resolver builds `https://github.com/tong-io/tongflow-api-gemini.git`. The next "Install/Update" click in the plugins dialog, or the next `pnpm plugins:install`, logs `origin moved … -> …; re-cloning` and runs `fs.rmSync(dir, { recursive: true, force: true })` on the whole plugin directory — deleting any uncommitted local work — then re-clones the exact same repository. The only signal is a `logger.info` line; the API returns a normal `{action: "cloned"}` success.

  Before this diff `git.pull` used the checkout's own stored remote and this directory was never removed. Suggested fix: normalise both sides before comparing (parse with `new URL`, strip a trailing `.git` and trailing slashes) and treat `storedUrl === undefined` as "not a move" rather than a move.

### 3. The whole clone/pull procedure is duplicated across the server module and the CLI script, and is policed by regex greps instead of being shared

- **File**: `scripts/install-official-plugins.ts:49`
- **Severity**: medium
- **Source**: conventions
- **Detail**: This feature's own stated rationale (contract.md: "one rule written in two places" is the disease) drove extracting `official-manifest.ts` and `plugin-git.ts` as non-server modules precisely so both install paths share code — the same pattern `plugin-id.ts` already established. But only the URL rule and the git author were extracted. `installOne` (`scripts/install-official-plugins.ts:49-90`) and `cloneOrPull` (`src/lib/plugins/plugins-install.server.ts:78-160`) still duplicate the entire procedure: the `.git`-less corpse wipe, the `remote.origin.url` comparison plus `rmSync`, and the exact `git.pull` option set (`url` / `singleBranch` / `fastForward` / `fastForwardOnly` / `author`). `check-installer-parity.ts` compensates with three grep-based assertions (`assertNoBareOrgUrlBuild`, `assertPullUsesResolvedUrl`, `assertOriginMoveReclones`) that read both files as text and check that certain tokens are present. A token grep cannot catch semantic drift, and the two copies have already drifted: the server path removes a partially-cloned directory in its catch block (line 149-151) while the CLI path has no error handling around `git.clone` at all. Extracting a shared `cloneOrPullPlugin()` into a non-server module (e.g. `src/lib/plugins/plugin-clone.ts`, alongside `plugin-git.ts`) makes two of those three guards unnecessary.

### 4. The new origin-equality check wipes community plugins on a cosmetically different git URL, because custom URLs are never normalised

- **File**: `src/lib/plugins/plugins-install.server.ts:185`
- **Severity**: medium
- **Source**: conventions
- **Detail**: `installPlugin` stores the custom-URL branch's value as `params.gitUrl.trim()` (line 185) — raw, unparsed — while manifest origins now go through `requireHttpUrl` and come back as `parsed.href` with trailing slashes stripped. `cloneOrPull` then compares that raw string against `remote.origin.url` with plain `!==`. `derivePluginIdFromGitUrl` already strips a trailing slash and a `.git` suffix, so `'https://github.com/x/oneflow-foo'` and `'https://github.com/x/oneflow-foo.git'` resolve to the same plugin id but to different URL strings. Installing/updating a community plugin with the URL spelled either way after it was first cloned with the other reads as "origin moved", deletes the checkout, and re-clones — combined with the delete-before-clone issue, a re-typed URL plus a network hiccup uninstalls the plugin. Note this is distinct from the "assertSafeGitUrl is laxer than the manifest boundary" item already in the contract's Known limits: that one is about validation strictness, this one is about the new equality check destroying a working checkout. Running the custom URL through the same `requireHttpUrl` normalisation (or comparing normalised forms) fixes it.

### 5. The checkout is deleted before the replacement clone is proven to work, so a transient failure leaves the plugin uninstalled

- **File**: `src/lib/plugins/plugins-install.server.ts:112`
- **Severity**: medium
- **Source**: bugs
- **Detail**: On the moved-origin path `fs.rmSync(dir, …)` runs at line 109, then `const cloning = !existsSync(dir)` at line 112 evaluates to `true`, so the catch block at line 150 (`if (cloning) fs.rmSync(dir, …)`) also runs on failure. Net effect: if `git.clone` from the new origin throws for any reason — network blip, private/typo'd origin in the manifest, rate limit — the previously working checkout is already gone and nothing restores it. The plugin silently becomes uninstalled (`isPluginInstalled` checks for `.git`), and nodes bound to it report "no implementation".

  This directly contradicts the intent stated two lines below in the same catch block: "Don't touch a pre-existing checkout whose pull merely failed — it's still usable." The pull path preserves the checkout; the re-clone path destroys it up front.

  `scripts/install-official-plugins.ts:73` has the same ordering and is worse in aggregate: `main()` catches per-plugin errors and continues, so one bad `origin` value shipped in `config/official-plugins.json` wipes that plugin for every user who runs `pnpm plugins:install`, printing only `FAILED: <id>` among 38 lines.

  Suggested fix: clone the new origin into a sibling temp directory first and only `rmSync` + rename once the clone succeeds. (Note this recommendation is the same remediation as finding #1 above — the two findings were surfaced by separate adversarial passes over the same code path and are recorded here as given, without merging, per this round's instructions.)

### 6. `hasUpdate` now walks the entire local commit history per plugin on every plugins-dialog open

- **File**: `src/lib/plugins/official-plugins.server.ts:194`
- **Severity**: low
- **Source**: conventions
- **Detail**: `remoteIsAhead` calls `git.isDescendent({ oid: localOid, ancestor: remoteOid, depth: -1 })`. isomorphic-git's implementation is a breadth-first walk that reads every reachable commit object; with `depth -1` it never short-circuits and returns `false` only after exhausting the history. That is exactly the common case here — when the remote genuinely has something new, the remote oid is not in the local history, so the walk always runs to completion — and the unrelated-history case this feature enables (a fork with no shared ancestry) is always a full walk too. `checkOfficialPluginUpdates` fans this out with `Promise.all` over every installed plugin, and `src/components/workspace/plugins-dialog.tsx:151` hits `/api/plugins/check-updates` on dialog open. The previous implementation was a string comparison. The ancestry semantics are the right fix for the badge-never-clears problem, but bounding the walk (a finite depth with the `MaxDepthError` treated as "assume ahead") would keep the correctness without the unbounded per-open cost.

### 7. Dead `PluginInstallError` re-throw in `cloneOrPull`'s catch block after the re-clone refactor

- **File**: `src/lib/plugins/plugins-install.server.ts:156`
- **Severity**: low
- **Source**: conventions
- **Detail**: `if (e instanceof PluginInstallError) throw e;` was added in `a66a425` ("stop relabelling a refusal as a git failure") when the try block still contained a deliberate refusal for a non-fast-forward / unlanded move. The final refactor (`21eafc5`) replaced that with the re-clone path, which sits above the try. The try block now contains only `git.pull` and `git.clone`, neither of which throws `PluginInstallError`, so the branch is unreachable and its comment ("a deliberate, user-actionable refusal carrying its own status and wording") describes a code path that no longer exists — misleading to the next reader deciding where refusals belong. Either drop it or move the refusal it was written for back inside.

## Chua adversarial-verify (refuter chet)

None — all findings above completed adversarial verification this round.

## Findings resolved since round 6

Round 6's finding #1 (CI runs none of the checks that enforce this feature's
invariants, `.github/workflows/ci.yml:32`, severity medium), #2 (`remoteIsAhead`
catch swallows real repository corruption, `official-plugins.server.ts:203`,
severity medium), #3 (origin-move path pulls the wrong branch ref against the
new remote's symbolic HEAD, `plugins-install.server.ts:132`, severity medium),
#4 (`_acceptance/config.yaml` hand-mirrors the SDK's dependency list in three
places, severity low), and #5 (whitespace/control hardening not applied to the
untrusted install-request body, `plugins-install.server.ts:59`, severity low)
do not recur in this round's findings list.

This round's findings are a distinct set, concentrated on the delete-before-clone
re-clone path introduced by the origin-move handling (findings #1, #2, #5
above) plus duplication and staleness issues (#3, #6, #7). Neither is asserted
fixed in code; this section records only that round 7's adversarial pass did
or did not re-flag each round-6 item, and the report writer did not
independently re-verify the un-recurring items' current status in code.
