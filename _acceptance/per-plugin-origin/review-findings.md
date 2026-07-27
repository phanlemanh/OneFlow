# Review Findings: per-plugin-origin (Round 5)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-5 implementation, listed
most-severe first.

## Findings

### 1. Plugin manager still builds each repo link from the default `org`, ignoring per-plugin `origin`

- **File**: `src/components/workspace/plugins-dialog.tsx:325`
- **Severity**: high
- **Source**: bugs
- **Detail**: The whole point of this diff is that a manifest entry may carry its own `origin`, and `check-installer-parity.ts:assertNoBareOrgUrlBuild()` exists to stop any consumer from building a URL out of the bare org. But that guard only scans `src/lib/plugins/official-plugins.server.ts` and `src/lib/plugins/plugins-install.server.ts` — it never looks at the UI.

  `plugins-dialog.tsx:325` renders the plugin title as `href={`${org}/${p.id}`}`, where `org` comes from `/api/plugins/official` -> `listOfficialPlugins()`, which returns `org: manifest.org` (the *default*) and maps entries with `manifest.entries.map(({ id }) => ...)` (`official-plugins.server.ts:86-87`) — the per-entry `origin` is dropped on the floor and never reaches the client at all.

  Failure scenario: add `{ "id": "oneflow-api-openai", "origin": "https://github.com/phanlemanh" }` to config/official-plugins.json (exactly the fixture `check-installer-parity.ts` itself constructs). Install/update and the update checker correctly use `https://github.com/phanlemanh/oneflow-api-openai.git`, but the dialog's "open repo" link points at `https://github.com/tong-io/oneflow-api-openai` — the upstream repo the plugin no longer tracks. For the forked/renamed/private case that motivated the feature, this is a 404 or, worse, a live-but-wrong repo. This is the same class of bug the feature was built to eliminate, surviving in the one consumer the parity guard structurally cannot see. Fix: include the resolved `origin` per entry in `OfficialPluginInfo` and have the dialog use it.

### 2. Parity guard's "independent model" is not equivalent to the resolver — it will fail on a correct tree

- **File**: `scripts/plugins/check-installer-parity.ts:41`
- **Severity**: medium
- **Source**: conventions
- **Detail**: `expectedRemotes()` builds the expectation as `${base.replace(/\/+$/, "")}/${id}.git`, i.e. it mirrors only trailing-slash stripping. The resolver it checks (`requireHttpUrl` in `src/lib/plugins/official-manifest.ts`) returns `parsed.href.replace(/\/+$/, "")` — the WHATWG-normalized form, deliberately, per the comment "Return what was validated, not what was written". The two diverge for any origin that is not already canonical. Verified with Node:
  ```
  https://GitHub.com/tong-io      -> resolver https://github.com/tong-io   | model https://GitHub.com/tong-io
  https://github.com:443/tong-io  -> resolver https://github.com/tong-io   | model https://github.com:443/tong-io
  https://github.com/a/../b       -> resolver https://github.com/b         | model https://github.com/a/../b
  backslash form                  -> resolver folds \\ to //               | model leaves it
  ```
  The guard's own doc comment (line 30) asserts the opposite: "It must still mirror every rule the resolver applies, trailing-slash stripping included: a model that is merely *different* rather than *equivalent* would fail on a correct tree the first time an origin is pasted with a trailing slash." That is precisely the failure mode, one normalization wider than the comment accounts for. It is latent today only because AC-6 keeps the shipped manifest at 38 plain strings; it fires on the very PR the guard exists for — the first fork, whose origin is pasted from a browser. Making the model equivalent without making it dependent is one line: `new URL(base).href.replace(/\/+$/, "")`.

### 3. Whitespace/control hardening applied to the trusted manifest boundary but not to the untrusted user-supplied git URL

- **File**: `src/lib/plugins/plugins-install.server.ts:59`
- **Severity**: low
- **Source**: conventions
- **Detail**: This change added `hasWhitespaceOrControl()` to the manifest path with an explicit rationale: `new URL()` strips surrounding whitespace and removes embedded tab/CR/LF while parsing, so a value that only looks valid would pass a protocol check and then "flow unchanged into git.clone". The same file's other entry point into the same `cloneOrPull` — `assertSafeGitUrl`, which handles `gitUrl` straight off the `POST /api/plugins/install` body — still does only `/^https?:\/\//i.test(gitUrl.trim())` followed by `.trim()`. Embedded tab/CR/LF/space survive both and reach `git.clone` unchanged. So the in-repo config file (fully trusted, reviewed in a PR) is now validated more strictly than the request body (fully untrusted), which inverts the usual boundary ordering and leaves two divergent notions of "a safe remote URL" ~40 lines apart in one file. The shared module already exports the predicate; routing `assertSafeGitUrl` through it would collapse both to one rule.

### 4. `remoteIsAhead`'s catch swallows real repo errors into "update available", and its justifying comment is factually wrong

- **File**: `src/lib/plugins/official-plugins.server.ts:203`
- **Severity**: low
- **Source**: bugs
- **Detail**: The catch at `official-plugins.server.ts:203` returns `true` and justifies it with "The remote commit is not in the local object store at all, so it is genuinely new to us."

  That is not how `git.isDescendent` behaves. In isomorphic-git 1.40.0, `_isDescendent` (index.js:12265-12322) walks the local history from `oid` looking for `ancestor` among commit parents; it never reads the ancestor object. When `ancestor` is absent from the local store it exhausts the queue and `return false` (index.js:12321) — no throw. With `depth: -1` the `MaxDepthError` branch is also unreachable (`searchdepth` starts at 0 and only increments). So the documented case is handled by the normal `!false` path, and the catch never fires for that reason.

  What the catch actually swallows is genuine repository breakage encountered while traversing: `_readObject` throwing `NotFoundError` on a missing/corrupt object, or `ObjectTypeError` on a malformed one. Failure scenario: a plugin checkout with a corrupted object in its history — `/api/plugins/check-updates` reports `hasUpdate: true` forever, the badge stays lit, and every click on Update runs `cloneOrPull`, which either fails with an opaque "git failed" or reports "updated" without changing anything. The underlying corruption is never surfaced. At minimum the catch should log (like `remoteHeadCommit` at line 170 does) rather than silently coercing any error to "there is an update".

### 5. Plugin manager's "open repo" link built from the bare default org is an accepted known limit, but invisible outside `_acceptance/`

- **File**: `src/components/workspace/plugins-dialog.tsx:325`
- **Severity**: low
- **Source**: conventions
- **Detail**: `listOfficialPlugins()` (`src/lib/plugins/official-plugins.server.ts:87`) destructures `manifest.entries.map(({ id }) => ...)` and drops `origin`, returning only the default `org` at the top level; the dialog then renders `href={`${org}/${p.id}`}`. This is the exact shape the feature removed everywhere else — the reason `officialGitUrl` was changed to take an entry was so "a caller holding only the default org cannot build a URL for a plugin that overrides it" — and neither guard catches it: `check-single-url-rule.sh`'s pattern requires a literal `.git`, and `check-installer-parity.ts` scans only the two server modules.

  Reporting it not as a defect to fix here but as a documentation gap: it IS recorded in `_acceptance/per-plugin-origin/contract.md` "Known limits" (with a sound scope argument — fixing it changes the API response shape, a T3 path past what Gate 1 approved), yet the two places a future contributor will actually read say the opposite. `docs/plugins.md` §10 states "One resolver ... serves all three consumers: the in-app plugin manager, the CLI installer, and the update checker", and CLAUDE.md's new bullet points at "the one resolver". The same applies to the second recorded limit, `sdk/tongflow/engine/plugins.py:28-51`, which keeps its own `DEFAULT_ORG` and f-string URL rule. Consider carrying one sentence of the known limits into `docs/plugins.md` §10 so the first fork does not ship a link pointing at upstream.

## Chua adversarial-verify (refuter chet)

None — all findings above completed adversarial verification this round.

## Findings resolved since round 4

Round 4's findings 1-4 (the "Cannot move" guard status/message mismatch in
`plugins-install.server.ts:137`, the stale `hasUpdate` doc comment in
`official-plugins.server.ts:128`, and `requireHttpUrl` returning the raw
string instead of the parsed URL in `official-manifest.ts:87`) do not
recur in this round's findings — the round-5 pass surfaced a different set
(led by the plugins-dialog.tsx bare-org link, promoted here to high after
confirming it survives the parity guard's scan scope). This section does
not assert those round-4 items were fixed in code; it records only that
this round's adversarial pass did not re-flag them, and the report writer
did not independently re-verify their current status.
