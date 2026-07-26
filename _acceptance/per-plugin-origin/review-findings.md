# Review Findings: per-plugin-origin (Round 1)

Informational only — not parsed by the acceptance-evidence-gate hook. These are
adversarial-verified findings from reviewing the round-1 implementation, listed
most-severe first.

## Findings

### 1. The prefix guard still reads the manifest raw as `string[]` — the first override entry breaks it

- **File**: `src/lib/plugins/plugin-id.test.ts:54`
- **Severity**: high
- **Source**: conventions
- **Detail**: `official-manifest.ts` is introduced as the one place that knows the manifest shape, but `plugin-id.test.ts` (the guard from the merged `oneflow-plugin-prefix` feature) still parses `config/official-plugins.json` itself and casts it: line 33 `as { org: string; plugins: string[] }`, line 54 `.plugins as string[]`, then `it.each(...)` asserts `isValidPluginId(id)` on each element.

  The moment anyone writes the object form this PR exists to enable — `{ "id": "oneflow-api-openai", "origin": "..." }` — that test feeds an object into `PLUGIN_ID_RE.test(...)`, which coerces to `"[object Object]"` and returns false. The prefix guard fails with a meaningless case name, and it stops validating the actual id of exactly the entries most likely to be new. TypeScript cannot catch it because the shape is asserted with `as`, not derived.

  So the shipped capability is unusable on first use without editing an unrelated feature's guard. The fix is one line in spirit: consume `normalizeOfficialManifest(...).entries.map(e => e.id)` like every other reader now does. `official-manifest.test.ts` already imports the resolver; `plugin-id.test.ts` is the one reader that was missed.

### 2. The SDK engine keeps its own copy of the URL rule, outside every guard's reach

- **File**: `sdk/tongflow/engine/plugins.py:48`
- **Severity**: medium
- **Source**: conventions
- **Detail**: `sdk/tongflow/engine/plugins.py` hardcodes `DEFAULT_ORG = "https://github.com/tong-io"` (line 28) and re-implements the rule in `_git_url_for` (line 48): `f"{org.rstrip('/')}/{plugin_id}.git"`. Its module docstring states outright that the convention "matches `official-plugins.server.ts`" — the exact coupling this feature set out to remove.

  It never reads `config/official-plugins.json`, so a plugin with an entry `origin` gets cloned by the standalone engine's preflight from the upstream org (404, or worse, a stale upstream copy). The `plugin_git_urls` override parameter exists but the default path is the broken one.

  This predates the diff, but the diff is what makes it consequential, and the new guard's scan scope (`grep -rn ... src scripts --include='*.ts' --include='*.tsx' --include='*.mjs' --include='*.js'`) structurally cannot see Python. The guard's own comment claims the rule exists in exactly one place; it enforces that over a subset of the repo.

### 3. `check-manifest-unmoved.sh` hardcodes 38 and forbids the object form it is shipped alongside

- **File**: `scripts/plugins/check-manifest-unmoved.sh:9`
- **Severity**: medium
- **Source**: conventions
- **Detail**: The guard asserts `expected_count=38` AND that all 38 entries are plain strings. Two routine, documented operations turn it red:

  1. Registering a 39th official plugin — CLAUDE.md's "Registering an official plugin" section describes this as editing `config/official-plugins.json` plus the three READMEs. It was not updated to mention this fourth coupled constant, so the next registration fails an eval with no breadcrumb.
  2. Using the capability this PR adds — the first `{id, origin}` entry fails the `strings != 38` branch.

  Contrast `scripts/plugins/check-no-config-drift.sh:47`, which deliberately uses `count -lt 30` and an org check so it tolerates growth. That guard's looseness is the right shape for a standing invariant; the exact-38 form is a snapshot assertion that only makes sense for the PR it was written in.

  AGENTS.md's re-pin ritual says a merged feature's own evals get re-run "when cheap", so this will surface as a red eval on some later, unrelated PR. Either loosen it the way `check-no-config-drift.sh` is loosened, or note the coupling in CLAUDE.md's registration checklist.

### 4. The acceptance verify suite now requires `uv`, which no prerequisite list mentions

- **File**: `_acceptance/config.yaml:25`
- **Severity**: low
- **Source**: conventions
- **Detail**: All three SDK executors moved from `python3 -m pytest` to `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic python -m pytest -q`. The reasoning in the comment is sound (PEP 668 on Homebrew Python), but three conventions drift:

  - `uv` appears nowhere in CONTRIBUTING.md's Prerequisites (Node 20+, pnpm, Python 3.10+, Modal), nor in README.md or sdk/README.md. A contributor running the gate hits `command not found` with no documented remedy.
  - AGENTS.md's "Verify suite" still documents `cd sdk && pytest`, so the two authoritative agent-facing files now disagree on how SDK tests run.
  - The SDK's runtime dependencies are now spelled out a second time, in `--with` flags, away from `sdk/pyproject.toml` (`dependencies = ["pydantic>=2.0", "typing_extensions>=4.12"]`). `typing_extensions` is already missing from the flags — harmless today because no `sdk/` module imports it, latent the day one does. CI (`pip install -e sdk pytest tomli`) resolves deps from pyproject and does not have this problem; `PYTHONPATH=.` opts out of that resolution.

  The identical 100-character command is also pasted three times, so a future change touches three lines.

### 5. An origin override never reaches an already-installed plugin — the pull silently uses the old remote

- **File**: `src/lib/plugins/plugins-install.server.ts:92`
- **Severity**: high
- **Source**: bugs
- **Detail**: `cloneOrPull` only passes `url` to `git.clone`; the `git.pull` branch (plugins-install.server.ts:92-99) omits `url`, so isomorphic-git resolves the remote from the checkout's own `.git/config` (`url` is an accepted param on `pull` — see `node_modules/isomorphic-git/index.d.ts:2457` — it is simply not passed). `installOne` in `scripts/install-official-plugins.ts:52-59` has the identical shape.

  This is exactly the case the feature exists for. Failure scenario: `tongflow-api-openai` is installed from the default org, then the manifest entry gains `{"id": ..., "origin": "https://github.com/phanlemanh"}`. From then on:
  - `remoteHeadCommit` (`official-plugins.server.ts:150`) does ls-remote against the NEW origin, while the local HEAD came from the OLD one, so `hasUpdate` is true forever;
  - the user clicks update, `installPlugin` resolves `gitUrl = officialGitUrl(entry)` (the new origin) and then throws it away — `cloneOrPull` fast-forwards from the OLD remote, returns "updated", logs success, and `hasUpdate` is still true on the next check.

  No error is raised at any point. The user is told the plugin updated and is left on the upstream repo, not the fork. Only a manual `rm -rf plugins/<id>` (or uninstall) makes the override take effect. Neither the parity guard nor the unit tests cover this: the parity guard only compares the URL each consumer *builds*, never what the pull path actually fetches from. A fix is either passing `url: gitUrl` to `git.pull`, or comparing the stored `remote.origin.url` against the resolved entry URL and re-pointing/re-cloning when they differ.

### 6. A trailing slash on `org` or `origin` passes validation and yields a double-slash clone URL

- **File**: `src/lib/plugins/official-manifest.ts:41`
- **Severity**: low
- **Source**: bugs
- **Detail**: `requireHttpUrl` only checks the protocol; it never normalises the base. `officialGitUrl` (line 150) then does `${entry.origin}/${entry.id}.git`.

  Failure scenario: `"origin": "https://github.com/phanlemanh/"` — a completely natural thing to paste from a browser address bar — validates cleanly and resolves to `https://github.com/phanlemanh//tongflow-api-openai.git`. The clone fails at the network layer with a git-level error, far from the manifest that caused it, which is precisely the class of failure the module's own comment says validation exists to prevent ("a typo that silently fell back to the default origin would clone the wrong repository"). Stripping trailing slashes in `requireHttpUrl` (and asserting no `?`/`#`) closes it; the unit tests currently exercise only protocol rejection (`official-manifest.test.ts:182-206`).

## Review incomplete

None — no finder/refuter died during this round's review.

## Chưa adversarial-verify (refuter chết)

None — all 6 findings above went through adversarial verification (no
`unverified: true` findings in this round).
