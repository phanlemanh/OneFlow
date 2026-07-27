# Review Findings: per-plugin-origin (Round 6)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-6 implementation, listed
most-severe first.

## Findings

### 1. CI runs none of the checks that enforce this feature's invariants

- **File**: `.github/workflows/ci.yml:32`
- **Severity**: medium
- **Source**: conventions
- **Detail**: The PR adds 301 lines of `src/lib/plugins/official-manifest.test.ts` plus three acceptance executors (`origin_single_impl`, `origin_installer_parity`, `origin_manifest_unmoved` in `_acceptance/config.yaml:75-78`). `.github/workflows/ci.yml` runs lint, typecheck, build, sdk pytest, and `scripts/pre-merge-check.sh` — it never runs `pnpm test` (vitest) and never runs any acceptance executor. So on a PR nothing verifies the single-URL rule, the installer/app parity, the `fastForwardOnly` + resolved-`url` assertions in `assertPullUsesResolvedUrl`, or the manifest normaliser's rejection cases. Every invariant this change establishes is enforced only when a human happens to run the acceptance runner locally. AGENTS.md lists `pnpm test` and `pnpm verify:plugins` in the mandatory verify suite; `verify:plugins` is in CI, `pnpm test` is not.

### 2. `remoteIsAhead` catch swallows real repository corruption into "update available", and its justifying comment is factually wrong

- **File**: `src/lib/plugins/official-plugins.server.ts:203`
- **Severity**: medium
- **Source**: bugs
- **Detail**: The bare `catch { return true }` is justified by "The remote commit is not in the local object store at all, so it is genuinely new to us." That is not how `git.isDescendent` behaves.

  Verified in the installed isomorphic-git (node_modules/isomorphic-git/index.js:12265-12322): `_isDescendent` walks the local history from `oid` looking for `ancestor` among commit parents and never reads the ancestor object. When `ancestor` is absent from the local store it exhausts the queue and `return false` at line 12321 — no throw. With `depth: -1` the `MaxDepthError` branch is unreachable too (`searchdepth` starts at 0 and only ever increments). So the documented case is already handled by the normal `!false` path and this catch never fires for that reason.

  What the catch actually swallows is repository breakage encountered during traversal: `_readObject` throwing `NotFoundError` on a missing/corrupt object, or `ObjectTypeError` on a malformed one. Failure scenario: a plugin checkout with one corrupt object in its history — `/api/plugins/check-updates` returns `hasUpdate: true` forever, the badge stays lit, and each Update click runs `cloneOrPull`, which either fails with an opaque `git failed: ...` 500 or reports "updated" without changing anything. Nothing is logged (unlike `remoteHeadCommit` at line 173, which does warn), so the corruption is never surfaced.

  Secondary consequence of the same call: because the ancestor-absent case is the *normal* "an update exists" case, every check now walks the entire local commit graph of every out-of-date plugin — where the old code was a string compare — and `checkOfficialPluginUpdates` fans that out across all installed plugins in parallel on one request.

### 3. The origin-move path pulls `refs/heads/<local branch>` but validates the move against the new remote's symbolic HEAD

- **File**: `src/lib/plugins/plugins-install.server.ts:132`
- **Severity**: medium
- **Source**: bugs
- **Detail**: `git.pull({ url: gitUrl, ... })` does not pin a remote ref. In isomorphic-git `_fetch` (node_modules/isomorphic-git/index.js:9916-9920) the ref resolves as `_remoteRef || config.get(`branch.${ref}.merge`) || 'HEAD'`, and clone writes `branch.<name>.merge = refs/heads/<name>` (index.js:7014). So the pull fetches the branch whose *name* matches the local checkout. The move confirmation immediately below (line 132-140) and `remoteHeadCommitForUrl` (official-plugins.server.ts:156-162) instead resolve the remote's symbolic `HEAD`. The two disagree whenever the new origin's default branch is named differently from the old one — `master` vs `main` is the ordinary case for a fork.

  Two failure scenarios:
  1. New origin has no branch of that name: `resolveAgainstMap` throws `NotFoundError`, which surfaces as `git failed: ...` with a 500 and no mention of the origin move or of the branch mismatch.
  2. New origin has both (e.g. default `master`, plus a stale `main`): the pull fast-forwards the working tree onto the fork's `main`, then the guard sees `localHead !== remoteHead` and throws `Cannot move ... Uninstall the plugin and install it again`. The working tree has already moved to the fork's code while `.git/config` still names the old origin, and the error text asserts nothing happened. Every subsequent attempt repeats the same throw, so the plugin is permanently stuck in that inconsistent state.

  `scripts/install-official-plugins.ts:88-102` has the identical logic and the identical exposure.

### 4. `_acceptance/config.yaml` now hand-mirrors the SDK's runtime dependency list in three places

- **File**: `_acceptance/config.yaml:25`
- **Severity**: low
- **Source**: conventions
- **Detail**: `sdk_pytest`, `sdk_pytest_packaging` and `sdk_pytest_scan_prefix` each hardcode `uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions`. `--no-project` + `PYTHONPATH=.` means the SDK is never installed, so its real dependency list (`sdk/pyproject.toml:11` → `pydantic>=2.0`, `typing_extensions>=4.12`) is duplicated by hand into three shell strings. CI does it properly (`pip install -e sdk pytest tomli`). A dependency added to pyproject.toml diverges silently: CI green, local eval rounds ImportError — or worse, the reverse. Either use `uv run --with-requirements`/`--project sdk` so the deps come from pyproject, or define the invocation once (a YAML anchor, or a `scripts/sdk-test.sh` the three keys call) rather than three literal copies.

### 5. The whitespace/control hardening was applied to the trusted manifest but not to the untrusted install request body

- **File**: `src/lib/plugins/plugins-install.server.ts:59`
- **Severity**: low
- **Source**: bugs
- **Detail**: `official-manifest.ts:requireHttpUrl` now rejects whitespace and control characters *before* parsing, with an explicit and correct rationale: `new URL()` strips surrounding whitespace and removes embedded tab/CR/LF while parsing, so a value that only looks valid passes a protocol check and then "flows unchanged into git.clone".

  The other entry point into the same `cloneOrPull`, in the same file, still does only `/^https?:\/\//i.test(gitUrl.trim())` followed by `.trim()` — and that path takes `gitUrl` straight off the `POST /api/plugins/install` body (src/app/api/plugins/install/route.ts:18-27).

  Failure scenario: `{"gitUrl": "https://gi\nthub.com/x/oneflow-api-foo.git"}`. `.trim()` does not touch the embedded newline, the protocol regex passes, `derivePluginIdFromGitUrl` yields the valid id `oneflow-api-foo`, and the raw string reaches `git.clone`, where isomorphic-git's own `new URL()` silently removes the newline and fetches from `github.com`. The stored `remote.origin.url` then differs from what was validated. Net effect: the fully-trusted in-repo config file is now validated more strictly than the fully-untrusted request body, with two divergent notions of "a safe remote URL" ~40 lines apart in one file. The shared module already exports the predicate.

## Chua adversarial-verify (refuter chet)

None — all findings above completed adversarial verification this round.

## Findings resolved since round 5

Round 5's finding #1 (plugin manager's "open repo" link built from the bare
default org in `plugins-dialog.tsx:325`, severity high), #2 (parity guard's
independent expectation model not being equivalent to the resolver in
`check-installer-parity.ts:41`, severity medium), and #5 (the known-limits
doc gap in `plugins-dialog.tsx:325`, severity low) do not recur in this
round's findings.

Round 5's #3 (whitespace/control hardening applied to the trusted manifest
but not the untrusted request body) and #4 (`remoteIsAhead`'s catch
swallowing real repo errors) both recur this round as findings #5 and #2
respectively — #2's detail is substantially expanded this round with a
verified trace into the installed isomorphic-git source and a newly-noted
secondary consequence (full commit-graph walk replacing a string compare).
Neither is asserted fixed in code; this section records only that round 6's
adversarial pass did or did not re-flag each round-5 item, and the report
writer did not independently re-verify the un-recurring items' current
status in code.
