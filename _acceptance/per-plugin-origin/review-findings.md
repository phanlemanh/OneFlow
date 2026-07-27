# Review Findings: per-plugin-origin (Round 3)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-3 implementation, listed
most-severe first.

## Findings

### 1. `requireHttpUrl` validates the normalized URL but returns the raw string, so whitespace/control chars survive into the git remote

- **File**: `src/lib/plugins/official-manifest.ts:61`
- **Severity**: medium
- **Source**: bugs
- **Detail**: `isHttpUrl(value)` validates by constructing `new URL(value)`, but `requireHttpUrl` returns `value.replace(/\/+$/, "")` — the *original* input, not the parsed/normalized form. Node's WHATWG URL parser strips surrounding whitespace and removes all embedded ASCII tab/CR/LF before parsing, so inputs that only *look* valid pass the check and then flow unchanged into `officialGitUrl()` and on to `git.clone` / `git.pull` / `git.listServerRefs`.

  Verified empirically:
  - `" https://github.com/x "` -> `new URL` ok; returned value keeps both spaces -> remote becomes `" https://github.com/x /tongflow-api-foo.git"`.
  - `"https://github.com/x/ "` -> `new URL` ok; the trailing-slash strip does NOT fire because the string ends in a space, so the remote becomes `"https://github.com/x/ /tongflow-api-foo.git"`. This defeats the exact normalization the function's own doc comment says it exists for ("A URL pasted from a browser address bar often ends in `/`...").
  - `"https://git\nhub.com/x"` -> `new URL` ok (newline is removed by the parser); the returned value still contains the newline.

  Note the code already trims for the *emptiness* check (`entry.origin.trim() === ""`) but never uses the trimmed value, which is what makes the gap easy to miss. This directly undercuts the module's stated contract that "a typo must never fall back silently and clone the wrong repository" — a hand-edited manifest with a stray space or a wrapped line passes validation and produces a malformed remote whose failure surfaces only as an opaque git error at install time. Fix: return `parsed.href` (with the trailing-slash strip applied to it), or at minimum `value.trim().replace(/\/+$/, "")`. The existing test "strips a trailing slash rather than emitting a double slash" does not cover any whitespace case, so it passes today.

### 2. Re-pointing origin to a base that is an ancestor of local HEAD is a silent no-op reported as "updated", leaving the checkout on the old remote's code and the plugin permanently "update available"

- **File**: `src/lib/plugins/plugins-install.server.ts:120`
- **Severity**: medium
- **Source**: bugs
- **Detail**: The new pull path (same logic duplicated in `scripts/install-official-plugins.ts:70-94`) does: read `remote.origin.url`, `git.pull({ url: gitUrl, fastForward: true, fastForwardOnly: true })`, then `git.setConfig` to re-point origin, then `return "updated"`.

  `fastForwardOnly` only guards the *divergent* case. In `isomorphic-git`'s `_merge` (node_modules/isomorphic-git/index.js:11152):

      if (baseOid === theirOid) {
        return { oid: ourOid, alreadyMerged: true }
      }

  When the newly-resolved origin's HEAD is an ancestor of the local HEAD (i.e. a fork taken from an older upstream snapshot, or any fork that is behind the currently-checked-out commit), the merge base equals *theirs*, so `_merge` returns `alreadyMerged` with no error and `_pull` discards that result. Consequently `cloneOrPull` reaches `setConfig` and returns `"updated"`.

  The resulting state is inconsistent in a way nothing detects:
  1. `.git/config` `remote.origin.url` now claims the fork, and the log line prints `remote re-pointed <old> -> <new>`, but the working tree still contains the OLD origin's code. The plugin runs upstream's implementation while the manifest, the git config, and the UI all say it comes from the fork.
  2. `installPlugin` returns `{ action: "updated" }`, and `plugins-dialog.tsx` `reportResult` shows the `updateSuccess` toast.
  3. `checkPluginUpdate` computes `hasUpdate` as `localCommit !== remoteCommit` (src/lib/plugins/official-plugins.server.ts:195) — not "remote is ahead" — so local-ahead reads as an available update. The plugin shows "update available" forever, and every click reports success while changing nothing.

  That is precisely the failure mode the two large comment blocks at plugins-install.server.ts:113-119 and scripts/install-official-plugins.ts:75-79 claim `fastForwardOnly` prevents ("the update check would report an update forever and every click would 'succeed' without changing anything"), so the invariant is documented as held when it is not. The `check-installer-parity.ts` guard only asserts the literal presence of `fastForwardOnly: true`, so it cannot catch this.

  Suggested fix: treat the pull result as authoritative — capture the merge outcome (or compare `resolveRef("HEAD")` before/after against the fetched remote HEAD) and refuse to re-point / refuse to report "updated" unless the local HEAD actually equals the new remote's HEAD; and make `hasUpdate` mean "remote is not an ancestor of local" rather than plain inequality.

### 3. Git author constant duplicated and divergent between the two pull paths that claim to mirror each other

- **File**: `scripts/install-official-plugins.ts:81`
- **Severity**: low
- **Source**: conventions
- **Detail**: `installOne` hardcodes `author: { name: "oneflow", email: "oneflow@local" }` while the server path uses the named constant `PLUGIN_GIT_AUTHOR = { name: "tongflow", email: "tongflow@local" }` (src/lib/plugins/plugins-install.server.ts:23). The comment at scripts/install-official-plugins.ts:60-63 asserts "Mirrors cloneOrPull in plugins-install.server.ts", and the whole point of this change was to stop the CLI and the app from drifting into separate copies of shared plugin-install rules — the header comment at lines 9-11 says exactly that about the URL template.

  Harmless today (the comment at lines 77-79 correctly notes a fast-forward writes no commit, so the field is never used), but it is a second copy of a constant that already has a home, sitting in the one file the single-rule guard was written to keep watching. `official-manifest.ts` — already the shared, non-server-only module both paths import — is the natural owner.

  Related, same file: the two paths also emit different log prefixes for the same event (`[plugins] ... remote re-pointed` vs `[install-plugins] ... remote re-pointed`), which is fine, but the identity itself should not differ.

## Chua adversarial-verify (refuter chet)

None — all findings above completed adversarial verification this round.
