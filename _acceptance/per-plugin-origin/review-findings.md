# Review Findings: per-plugin-origin (Round 4)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-4 implementation, listed
most-severe first.

## Findings

### 1. The new "Cannot move" guard throws a `PluginInstallError` inside the block whose catch re-wraps everything as `git failed: …` with status 500

- **File**: `src/lib/plugins/plugins-install.server.ts:137`
- **Severity**: medium
- **Source**: conventions
- **Detail**: `cloneOrPull` throws `new PluginInstallError("Cannot move ${id} to ${gitUrl}: … Uninstall the plugin and install it again to pick up the new origin.")` at line 137, i.e. *inside* the `try` that starts at line 91. The catch at lines 161-171 does not special-case `PluginInstallError`: it unconditionally does `throw new PluginInstallError("git failed: " + msg, 500)`.

  Consequences, both contrary to the pattern this file already established:
  1. The status is wrong. `PluginInstallError` carries an intentional status — 400 by default for user-actionable input errors, 404/409 in `uninstallPlugin`, and 500 reserved for a genuine git failure. This is a deliberate, user-actionable refusal ("uninstall and reinstall"), and it reaches `/api/plugins/install` (route.ts:31-36) as HTTP 500.
  2. The message is wrong. It is prefixed "git failed:" when git did not fail — the pull succeeded; the code refused to accept the move. The carefully-worded guidance the commit added (015d196 "confirm the move actually landed") is delivered to the user as a server-error string.

  The sibling CLI path is unaffected (`scripts/install-official-plugins.ts:99` throws a plain Error that `main` prints verbatim), so the two paths that the feature explicitly set out to keep in lockstep now report the same condition differently.

  Fix: re-throw untouched in the catch (`if (e instanceof PluginInstallError) throw e;`) before wrapping, or perform the move-confirmation outside the try. Note this is not covered by `check-installer-parity.ts`, which only asserts the literal presence of `url` and `fastForwardOnly: true` inside the `git.pull({…})` call text.

### 2. The "Cannot move" origin-refusal error is swallowed by the outer catch and re-thrown as a generic 500 "git failed"

- **File**: `src/lib/plugins/plugins-install.server.ts:137`
- **Severity**: medium
- **Source**: bugs
- **Detail**: The new move-confirmation guard throws `new PluginInstallError("Cannot move ${id} to ${gitUrl}: … Uninstall the plugin and install it again …")` — a deliberate 400 with actionable text. But that throw sits INSIDE the `try` that opens at line 91. The catch at line 161 catches every throwable and unconditionally re-wraps it: `throw new PluginInstallError(\`git failed: ${msg}\`, 500)`.

  Concrete consequence, verified end-to-end:
  - `src/app/api/plugins/install/route.ts:31-35` returns `e.status`, so the response becomes **500** instead of **400** — a client/user error is reported as a server fault.
  - The message becomes `git failed: Cannot move …` while git in fact *succeeded* (the pull fast-forwarded / reported alreadyMerged); the failing step was the ancestry check, not git. The prefix actively misdirects whoever reads it.

  Repro: an installed plugin whose manifest entry gains an `origin` pointing at a fork taken from an older upstream snapshot. `git.pull({fastForwardOnly: true})` returns `alreadyMerged` with no error (confirmed in isomorphic-git 1.40.0 `_merge`: `if (baseOid === theirOid) return { oid: ourOid, alreadyMerged: true }`), the `localHead !== remoteHead` branch fires, and the user gets a 500 "git failed".

  Fix: hoist the guard out of the `try`, or make the catch re-throw `PluginInstallError` untouched (`if (e instanceof PluginInstallError) throw e;`) before wrapping. Note the same shape exists in the CLI mirror at scripts/install-official-plugins.ts:99, but there the throw is caught by `main()`'s per-entry handler, which prints the message verbatim — so only the server path is affected.

  This is the same underlying defect as finding 1 above, surfaced independently via a bug-hunt pass rather than a conventions pass; both are kept here since each documents a distinct verification angle (message/status correctness vs. control-flow placement) and both point at the same fix.

### 3. `PluginUpdateInfo.hasUpdate` doc comment still documents the exact semantics this diff removed

- **File**: `src/lib/plugins/official-plugins.server.ts:128`
- **Severity**: medium
- **Source**: conventions
- **Detail**: The exported interface still carries `/** True only when both commits are known and differ. */` on `hasUpdate`. This diff deliberately replaced that rule: `checkPluginUpdate` now computes `Boolean(localCommit && remoteCommit) && await remoteIsAhead(...)`, and `remoteIsAhead` (lines ~170-195) is documented as "Deliberately not `local !== remote`" — precisely because after a fork is adopted the local HEAD can legitimately be *ahead*, and plain inequality would leave the badge lit forever.

  So the surviving comment states the behaviour the change exists to eliminate, on an exported interface whose shape the client mirrors (`src/components/workspace/plugins-dialog.tsx:96-101`). In a codebase where comments are the load-bearing record of these invariants — and where round 3 of this feature's own review flagged "the invariant is documented as held when it is not" as a finding — this is the same defect re-introduced one file over. It should read something like "True only when both commits are known and the remote commit is not already in our history."

### 4. `requireHttpUrl` validates the parsed URL but returns the raw string, so what is checked is not what reaches git

- **File**: `src/lib/plugins/official-manifest.ts:87`
- **Severity**: low
- **Source**: bugs
- **Detail**: `isHttpUrl(value)` decides via `new URL(value)`, but `requireHttpUrl` returns `value.replace(/\/+$/, "")` — the original input, never the parsed/normalized `href`. The previous review round flagged exactly this and the fix only closed the whitespace/control subset (`hasWhitespaceOrControl`). Other WHATWG normalizations still diverge; verified with Node:

  ```
  "https:/github.com/x"          -> parses as https://github.com/x   (single slash typo accepted)
  "https:\\evil.com\\x"          -> parses as https://evil.com//x    (backslashes folded to slashes)
  "https://github.com/a/../../b" -> parses as https://github.com/b    (dot segments resolved)
  ```

  In each case validation passes on the *parsed* form while `officialGitUrl()` emits the *raw* form into `git.clone` / `git.pull` / `git.listServerRefs`. The most likely real-world hit is the single-slash typo: it sails past the validator whose whole stated job is to "reject by name", then fails deep inside isomorphic-git with a URL-parse error that names no manifest entry.

  Fix: return the parsed value — e.g. have `isHttpUrl` hand back the `URL` object and return `parsed.href.replace(/\/+$/, "")` — so the string that was validated is the string that is used.

## Chua adversarial-verify (refuter chet)

None — all findings above completed adversarial verification this round.
