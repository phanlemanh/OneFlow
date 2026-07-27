# Review Findings: per-plugin-origin (Round 8)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-8 implementation, listed
most-severe first.

## Findings

### 1. Origin URL validation admits query/fragment/credentials, defeating the fail-at-load invariant

- **File**: `src/lib/plugins/official-manifest.ts:73`
- **Severity**: low
- **Source**: conventions
- **Detail**: `requireHttpUrl` only checks for whitespace/control chars and an http(s) protocol. An origin pasted from a browser with an anchor or query — e.g. `https://github.com/org#readme` or `https://github.com/org?tab=repositories` — validates cleanly, and `officialGitUrl` then yields a malformed remote like `https://github.com/org#readme/<id>.git` (everything after `#` is a fragment, so git fetches the wrong path). This is exactly the failure class the module's own doc comment says it exists to prevent ("a typo must never fall back silently... every rejection names the offending entry"): the error will instead surface later as an opaque git failure naming no manifest entry. Embedded userinfo (`https://user:token@host/org`) also passes and would be echoed into error messages/logs. Rejecting `parsed.search`, `parsed.hash`, and `parsed.username`/`password` in `requireHttpUrl` closes the gap in one place.

### 2. CLI moved-origin refusal hardcodes `plugins/` path, wrong when `TONGFLOW_PLUGINS_DIR` is set

- **File**: `scripts/install-official-plugins.ts:73`
- **Severity**: low
- **Source**: conventions
- **Detail**: The refusal message tells the user to "Delete `plugins/${entry.id}` and run again", but the actual checkout lives at `path.join(pluginsDir(), entry.id)`, and `pluginsDir()` honours `TONGFLOW_PLUGINS_DIR` (lines 42-45) — the relocated-directory case the packaged app uses per the script's own header comment. In that environment the instruction points at a directory that does not contain the plugin (deleting a repo-local `plugins/<id>` would not clear the refusal). The parity guard (`assertMovedOriginRefused`) only asserts a way-out phrase exists, not that the path is correct. Use `` `Delete ${dir}` `` (the already-computed absolute path) instead.

### 3. `remoteIsAhead` swallows every error as "update available", not just the missing-object case

- **File**: `src/lib/plugins/official-plugins.server.ts:202`
- **Severity**: low
- **Source**: bugs
- **Detail**: The catch block in `remoteIsAhead` (lines ~196-207) is a bare catch that returns `true` for ANY failure of `git.isDescendent`, while the comment asserts the only failure mode is "the remote commit is not in the local object store". A corrupt `.git` directory, an unreadable packfile, or any I/O error (`EACCES`, `ENOENT` mid-walk) is silently converted into `hasUpdate=true`. The consequence is a spuriously lit update badge whose underlying error is never logged anywhere — a genuine silent swallow, though in the conservative direction (false positive rather than a missed update, and the subsequent pull would then fail loudly). Distinguishing `NotFoundError` (isomorphic-git exports `Errors.NotFoundError` with a `.code`) from other errors, or at least `logger.warn`-ing the swallowed error, would match the documented intent.

### 4. `requireHttpUrl` accepts query/fragment/userinfo, so `officialGitUrl` can silently build a malformed remote

- **File**: `src/lib/plugins/official-manifest.ts:73`
- **Severity**: low
- **Source**: bugs
- **Detail**: `requireHttpUrl` validates only protocol + whitespace/control characters. A base URL such as `https://github.com/org?x=1` or `https://github.com/org#frag` passes validation, and `officialGitUrl` then appends `/{id}.git` AFTER the query/fragment, producing e.g. `https://github.com/org?x=1/plugin.git` — the plugin path lands inside the query string, so git fetches the wrong path and fails with an opaque "git failed: ..." 500 that names no manifest entry. That is exactly the failure mode this module's own doc comment says it exists to prevent ("Failing here, naming the entry, is the whole point of this module"). Userinfo (`https://user:token@host/org`) also passes and would flow into the 409 moved-origin message and logs verbatim. Mitigated in practice by the manifest being repo-controlled and pinned to 38 plain entries by `check-manifest-unmoved.sh`, hence low severity — but rejecting `parsed.search`/`parsed.hash`/`parsed.username` in `requireHttpUrl` would close it in one place. Verified mechanically; the shipped manifest and all tests are unaffected (132 tests and both guard scripts pass).

## Chua adversarial-verify (refuter chet)

None — all findings above completed adversarial verification this round.

## Findings resolved since round 7

Round 7's findings #1 (delete-before-clone uninstalls the plugin on a failed
clone, `plugins-install.server.ts:109`, severity high), #2 (origin-move
detection compares remote URLs as raw strings, `plugins-install.server.ts:105`,
severity high), #3 (clone/pull procedure duplicated across server module and
CLI script, `install-official-plugins.ts:49`, severity medium), #4 (custom-URL
branch never normalised before the origin-equality check,
`plugins-install.server.ts:185`, severity medium), #5 (checkout deleted before
the replacement clone is proven to work, `plugins-install.server.ts:112`,
severity medium), and #7 (dead `PluginInstallError` re-throw in `cloneOrPull`'s
catch block, `plugins-install.server.ts:156`, severity low) do not recur in
this round's findings list. Round 7's finding #6 (`hasUpdate` walks the entire
local commit history per plugin, `official-plugins.server.ts:194`, severity
low, a performance/cost concern) also does not recur as such this round, though
this round's finding #3 above is a distinct correctness issue found in the same
`remoteIsAhead` function (error-handling scope, not walk cost).

This round's findings are a new, entirely low-severity set: two instances of
the same underlying URL-validation gap (`requireHttpUrl` admitting
query/fragment/userinfo) surfaced independently by separate adversarial passes
over `official-manifest.ts:73` (#1 and #4, recorded separately per this round's
instructions, without merging), plus one CLI-message accuracy issue (#2) and
one error-handling breadth issue (#3). This section records only that round
8's adversarial pass did or did not re-flag each round-7 item; the report
writer did not independently re-verify the un-recurring items' current status
in code.
