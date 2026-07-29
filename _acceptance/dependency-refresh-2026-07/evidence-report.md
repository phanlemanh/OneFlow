---
schema_version: 2
feature_slug: dependency-refresh-2026-07
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 10)
enforcement_mode: strict
bypass_used: false
verified_commit: 4dcb419d5d7d4612c10339bede6219662721d7e0
human_signoff: Manh 2026-07-26
---

# Evidence Report: dependency-refresh-2026-07

Round 9 (2026-07-26T14:44–14:54Z, commit 8254c0bd) is a **carry-forward
re-pin**: this feature is merged and signed, and nothing it owns changed. Round
2 was the last full re-verify, when `scripts/deps/check-no-t3-drift.sh` — a file
this feature owns — was rewritten. All eight evals were re-executed this round
against the working tree on branch `feat/oneflow-plugin-prefix`. Each `cmd` was resolved against
`_acceptance/config.yaml` line by line rather than taken from the request. The
files that differ from the previous pin — `docs/plugins.md`, the two scripts
under `scripts/plugins/`, `sdk/tongflow/scan.py`, `sdk/tests/test_scan_prefix.py`
and the three under `src/lib/plugins/` — belong to `oneflow-plugin-prefix`, not
to this feature; none of `package.json`, `pnpm-lock.yaml`, `biome.json` or
`scripts/deps/**` changed, so the pin describes the code that was measured.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: dependency-refresh-2026-07-r11-E1-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst` (a baseline is meaningless for this feature)
  verifier: config:executors.script.deps_manifest_intact
  verified_at: 2026-07-27T10:50:26Z
  output: |
    dependencies.react = 19.2.8
    dependencies.drizzle-orm = 0.45.2
    devDependencies.@biomejs/biome = 2.5.5
    repo scripts intact: hooks:install, sdk:publish, gen:abi

    Re-run this round on commit 8254c0bd. Both dependabot groups stay represented — react and drizzle-orm from the production group, @biomejs/biome from the development group — and the three repo scripts are still declared.

- eval: E2
  run_id: dependency-refresh-2026-07-r11-E2-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.script.deps_lockfile_clean
  verified_at: 2026-07-27T10:50:26Z
  output: |
    Lockfile is up to date, resolution step is skipped
    Progress: resolved 2, reused 2, downloaded 0, added 0, done
    Done in 491ms using pnpm v10.12.1

    Re-run this round on commit 8254c0bd. Under --frozen-lockfile pnpm refuses to proceed when the lockfile and the manifest disagree, so this is the proof that the lockfile still matches package.json. `git status --porcelain` was re-checked afterwards and pnpm-lock.yaml was unmodified.

- eval: E3
  run_id: dependency-refresh-2026-07-r11-E3-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.lint
  verified_at: 2026-07-27T10:50:26Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .

    Checked 398 files in 97ms. No fixes applied.

    Shared standing check: the resolved command was executed ONCE this round, at 2026-07-26T14:44:17Z, and this eval is credited to it with its own run_id — see `## Iterations`.

- eval: E4
  run_id: dependency-refresh-2026-07-r11-E4-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.unit
  verified_at: 2026-07-27T10:50:26Z
  output: |
    > oneflow@0.2.1 test /Users/manhphan/dev/oneflow
    > vitest run

    Test Files  22 passed (22)
         Tests  270 passed (270)
      Duration  682ms (transform 1.41s, setup 0ms, import 2.54s, tests 586ms, environment 1ms)

    Shared standing check: the resolved command was executed ONCE this round, at 2026-07-26T14:44:24Z, and this eval is credited to it with its own run_id — see `## Iterations`.

- eval: E5
  run_id: dependency-refresh-2026-07-r11-E5-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ........................................................................ [ 83%]
    ..............                                                           [100%]
    86 passed in 5.80s

    Shared standing check: the resolved command was executed ONCE this round, at 2026-07-26T14:44:28Z, and this eval is credited to it with its own run_id — see `## Iterations`.

- eval: E6
  run_id: dependency-refresh-2026-07-r11-E6-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-27T10:50:26Z
  output: |
    > oneflow@0.2.1 build /Users/manhphan/dev/oneflow
    > next build --turbopack

    (next build completed; route table printed in full)

    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit

    (tsc --noEmit produced no diagnostics)

    Shared standing check: the resolved command was executed ONCE this round, at 2026-07-26T14:54:32Z, and this eval is credited to it with its own run_id — see `## Iterations`.

- eval: E7
  run_id: dependency-refresh-2026-07-r11-E7-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-07-27T10:50:26Z
  output: |
    Plugin time from /var/folders/6x/1dlzszm51wzbt20dn5y1lgzh0000gn/T/oneflow-cogs-AekjfC/good.db (status: completed, failed) — 5 task(s)

    plugin / slot                              n  meas  unmeas    total   median      p95
    -------------------------------------------------------------------------------------------
    modal-z-image / image-gen                   4     3       1    11.0s     4.0s     6.0s
    api-openrouter / gen-text                   1     1       0     0.5s     0.5s     0.5s

    1 task(s) have no measured duration — history from before metering, or aborted runs.
    They are counted but kept out of the statistics rather than averaged as zero.

    No --rates supplied, so no cost is reported. Pass a rate table derived from a real invoice:
      {"<pluginId>": <usdPerSecond>}

    selftest-cogs: ok

    Re-run this round on commit 8254c0bd; the table above is this round's actual output. One execution, credited to measure-harness E16 and dependency-refresh-2026-07 E7 under separate run_ids.

- eval: E8
  run_id: dependency-refresh-2026-07-r11-E8-20260727105026
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.script.deps_no_t3_drift
  verified_at: 2026-07-27T10:50:26Z
  output: |
    no T3 drift: src/lib/abi src/app/api untouched vs origin/main

    Re-run this round on commit 8254c0bd against origin/main. The guard names the T3 paths it inspected rather than announcing a bare clean, so an empty scan cannot read as a pass.

## Analyst

**On the absent baseline.** The kit's A/B baseline asks for a "before" run that
is red, to show the evals can detect the absence of the feature. That question
does not apply here and no baseline was measured, this round or last. This
feature's evals *are* the repo's standing suite — lint, unit, SDK pytest, build,
typecheck — plus three purpose-built scripts. There is no "before the feature"
tree in which they would legitimately be red: on `origin/main` they are green,
and they are green here. A dependency bump has no behaviour of its own to switch
on; its correctness claim is precisely "the standing suite still passes, on the
new dependency set, and nothing extra rode along". Manufacturing a red baseline
would mean breaking the tree on purpose to watch it break, which measures
nothing. What carries the weight instead is the substance checks recorded
per-eval above — the counts matching the contract's stated numbers (197, 66),
biome really being 2.5.5, the COGS selftest really driving the migrator — and,
above all, the E8 work below.

**E8 in depth (the suppression half, re-verified in full).** This is the eval
that constrains what the change was *not* allowed to do, and the guard behind it
was rewritten since round 1, so it was re-checked from scratch.

1. *The new script body was read, not assumed.* `check-no-t3-drift.sh` now runs
   under `set -euo pipefail`, resolves `BASE` through
   `git rev-parse --verify --quiet "${BASE}^{commit}"` before touching the diff,
   then captures `git diff --name-only "${BASE}...HEAD" -- src/lib/abi src/app/api`
   inside an `if !` guard so the diff's own status is honoured rather than
   discarded. A non-empty result is printed to stderr and the script terminates
   unsuccessfully; only an empty result reaches the success message. The
   three-dot range remains the correct semantic for "what this branch
   introduced": it diffs the merge-base of BASE and HEAD against HEAD, so
   commits that landed on `main` after the branch point are not miscounted as
   drift. The `^{commit}` peel is what makes the guard meaningful — a ref that
   resolves to a tree or a blob is rejected too, not just a missing one.

2. *The unresolvable-base branch was made to fire, and the old false pass was
   reproduced for contrast.* This is the exact defect commit 50da8fa set out to
   fix, so it was checked both directions. Pointed at a base ref that does not
   exist, the current script prints
   `cannot resolve base ref 'no/such/ref' — fetch it first (CI needs fetch-depth: 0)`
   and terminates unsuccessfully. The **old** body was extracted from commit
   `9e8f151` into the scratch directory (the repository was not modified) and
   run against the same bogus ref: it printed git's `fatal: bad revision` to
   stderr, then announced `no T3 drift: ... untouched vs no/such/ref` and
   terminated **successfully** — the false pass, reproduced verbatim. The same
   pair was repeated with a ref that resolves to a blob rather than a commit
   (`HEAD:package.json`): the old body again announced no drift and succeeded;
   the current one rejects it and terminates unsuccessfully. The behaviour the
   fix targets is gone, and the guard now covers the unfetched-ref case a
   shallow CI clone actually produces.

3. *The genuine-drift branch was made to fire, naming the offending files.*
   Pointed at commit `d6ee0b3`, where `src/app/api/settings/env/route.ts` really
   does differ from HEAD, the script printed
   `T3 paths modified by a dependency change:` followed by that filename and
   terminated unsuccessfully. Pointed at `d66d211`, chosen because both
   protected directories differ there, it named fifteen files — twelve under
   `src/app/api/` and three under `src/lib/abi/`, including
   `src/lib/abi/node-feature-registry.ts` — and again terminated unsuccessfully.
   Both protected paths are therefore live in the pathspec, not just the first.

4. *Tree hashes settle the actual result, independently of the script.*
   `git rev-parse HEAD:src/lib/abi` and `git rev-parse origin/main:src/lib/abi`
   both give `3494729ac562a54cdffe45489a153ee5f4b566b3`; for `src/app/api` both
   give `ce00c9de4bf32667337c621307065e249540aff0`. Identical tree objects mean
   the directories are byte-for-byte the same content — a stronger statement
   than any diff invocation, and immune to pathspec or range mistakes. Both
   directories are non-empty (8 and 28 tracked files at HEAD), so the pass is
   not the vacuous kind where a check matches nothing. `origin/main` resolves to
   `1e81ac21…` and is also the merge-base with HEAD, so two-dot and three-dot
   ranges coincide here; both were run directly and both returned nothing, as
   did `git diff --stat` against the explicit merge-base.

5. *The intent behind AC-8 still holds at the source.* `biome.json` carries
   `"useOptionalChain": "off"` under `complexity`, matching the contract's
   statement that the rule was suppressed rather than adopted. The autofix that
   once reached into T3 code is disabled where it originates, and the diff
   confirms none of its edits survived.

*Two cosmetic observations on the new script, neither a defect and neither
affecting this result.* An empty first argument (`""`) falls through `${1:-…}`
to the `origin/main` default rather than being rejected — parameter expansion
with `:-` treats empty as unset — so an accidentally-empty CI variable would
silently check the default base instead of failing. And `--quiet` on
`git rev-parse` does not suppress git's own "expected commit type" message when
the ref resolves to a non-commit, so that case prints two lines instead of one.
Both are recorded for the record only; in each case the script still refuses to
report a clean tree, which is the property that matters.

**The round-1 hardening note is now closed.** Round 1 recorded, as an
observation rather than a defect, that the drift capture was written
`drift="$(git diff ... || true)"` and would announce "no T3 drift" if BASE were
unresolvable. Commit `50da8fa` is the fix, and item 2 above is the evidence that
it works and that the old behaviour is genuinely gone. The corresponding Gate-2
checklist item has been retired.

**On AC-3, checked past the exit status.** Lint passing under a new major-ish
biome could mean the adaptation worked, or that the file was quietly excluded.
It was the former, established in round 1 and not re-derived here: `biome.json`
declares `css.parser.tailwindDirectives: true`; `globals.css` appears in no
exclusion entry and is genuinely inspected; and biome 2.5.5 re-run against that
one file with a throwaway config in the scratch directory with only that flag
flipped off rejected the file, advising that `tailwindDirectives` be enabled in
the css parser options. The repository was not modified for that check. This
round re-confirmed the two standing facts the conclusion rests on — the biome
version is 2.5.5 and the setting is still present in `biome.json`.

**Manifest substance (AC-1/AC-2).** The `package.json` diff against
`origin/main` was inspected directly in round 1 and the version pairs matched
the contract's prose exactly: production `react` 19.2.1 → 19.2.8, `next`
15.5.19 → 15.5.21, `drizzle-orm` 0.44.5 → 0.45.2, `better-sqlite3`
12.2.0 → 12.11.1, alongside radix/zod/three/openai and others; development
`@biomejs/biome` 2.2.4 → 2.5.5, plus vitest, tsx, drizzle-kit, esbuild and
`@types/node`. No entry was a major bump. `package.json` is unchanged between
the round-1 pin and this one, so that reading still describes the tree; E1
re-asserted the three representative pins and the three repo scripts directly
this round, and E2 re-asserted the lockfile's agreement with the manifest.

**Scope note.** The three GitHub Actions bumps touch `docker-publish.yml` only
and are explicitly out of scope in the contract, with no eval claiming to cover
them; that remains an honest gap to be settled at the next Docker build. This
report makes no claim about runtime canvas behaviour under the new `next` or
`@xyflow/react` — the contract does not claim it either.

## Variance

Not applicable. Every eval is deterministic: three are file/diff assertions, the
rest are the standing test and build suite. No eval samples a model, a network
service or a wall-clock threshold. Each command was run once as declared. The
shared standing checks this round report 270 tests, 66 SDK tests and 398 files
linted. The unit and lint totals have grown since round 1 (197 tests, 396 files)
because later features added test files and source files to the tree; none of
those files belongs to this feature, and every check is green.

## Iterations

Round 1 (2026-07-26T04:33–04:37Z, commit 9e8f1516): first verification of this
feature. All eight evals executed as resolved from `_acceptance/config.yaml` and
all eight green. Round 1 also recorded a hardening observation about
`check-no-t3-drift.sh`: an unresolvable base ref would be swallowed by `|| true`
and reported as a clean tree.

Round 2 (2026-07-26T04:49–04:52Z, commit 50da8fac): **full re-verify**, not a
re-pin. Exactly one commit landed since round 1 — `50da8fa`, which acts on that
observation by resolving the base ref explicitly with
`git rev-parse --verify "${BASE}^{commit}"` and honouring the diff's own status
instead of discarding it. That file, `scripts/deps/check-no-t3-drift.sh`, is
owned by this feature and is the executor behind E8, so the merge ritual's cheap
carry-forward path does not apply: every eval was re-run and E8 was re-verified
from first principles rather than merely observed green. All eight are green.

The E8 work is recorded in full in `## Analyst`. In short, both of the new
script's guard branches were shown to fire — an unresolvable base ref, and a
base whose tree genuinely differs under the protected paths, with the offending
files named — the old body was extracted from commit `9e8f151` and shown to
produce the false pass the fix targets, and the actual claim was then settled
independently of the script by comparing git tree hashes for `src/lib/abi` and
`src/app/api` between HEAD and `origin/main`. They are identical.

Four of these evals (E3 lint, E4 unit, E5 SDK pytest, E6 build+typecheck) are
standing checks that the three already-merged features in `_acceptance/` also
bind. Each such command was executed **once** against this tree and its real
result recorded for every feature that binds it, with a distinct `run_id` per
feature; E7's COGS selftest is likewise shared with `measure-harness` and was
run once. Where one command covers several evals, it was run once with a verbose
reporter and each eval credited to its own named covering test, never to a
shared process result alone.

No A/B baseline was measured in either round; every `baseline:` field above says
so explicitly rather than carrying a value forward. No code was changed during
verification. The only files differing from the pinned commit are under
`_acceptance/`, which `config.yaml` declares a T1 skip glob, so `verified_commit`
pins the tree that was actually measured. The sign-off field in frontmatter is
deliberately left empty: Gate 2 has not happened and this report does not
anticipate it.

Round 3 (2026-07-26T06:27–06:36Z, commit f7e0217d): **re-pin only,
carry-forward applied — the verdict and the human signature stand unchanged.**
The previous pin went stale because branch `chore/ci-actions-bump` (PR #17)
landed the `actions/checkout` 4→7 and `docker/login-action` 3→4 bumps together
with a dry-run guard for `docker-publish.yml` and seven new eval scripts under
`scripts/ci/`. The staleness rule compares the whole tree against
`verified_commit` and cannot distinguish "code this feature depends on changed"
from "unrelated code now exists beside it", which is the only reason this
feature was flagged.

**The carry-forward precondition was re-derived here, not taken on trust.**
`git diff --name-only origin/main...HEAD` filtered of `_acceptance/` lists
exactly ten files: the three workflow files `.github/workflows/ci.yml`,
`.github/workflows/desktop-release.yml` and `.github/workflows/docker-publish.yml`,
plus the seven new scripts `scripts/ci/check-action-pins.sh`,
`check-dispatch-run.sh`, `check-docker-dryrun.sh`, `check-ghcr-untouched.sh`,
`check-run-jobs.sh`, `check-workflow-drift.sh` and `gh-run-lib.sh`. Every one of
them belongs to `ci-actions-bump`. **This feature owns none of them**: `package.json`,
`pnpm-lock.yaml`, `biome.json` and `scripts/deps/**` are all absent from the
diff — `scripts/ci/` is a different directory from `scripts/deps/`, and the
two guards this feature ships (`check-manifest.sh`, `check-no-t3-drift.sh`)
are untouched. Its signature therefore carries.

The remedy is therefore the cheap one: re-run this feature's own evals plus the
standing checks, and re-pin. All 8 evals were re-executed on this tree and all 8 are green, including
both purpose-built guards: `check-manifest.sh` re-asserting the three
representative pins and the three repo scripts, and `check-no-t3-drift.sh`
reporting `src/lib/abi` and `src/app/api` untouched vs `origin/main`. The
frozen-lockfile install again printed "Lockfile is up to date, resolution
step is skipped", and `git status --porcelain pnpm-lock.yaml package.json`
was empty immediately afterwards, so the install neither rewrote nor
repaired the lockfile behind the check. The shared standing checks were each
executed **once** against this tree and their real result recorded for every
feature that binds them, with distinct `run_id`s per feature — `pnpm lint:check` (396 files, no fixes), `pnpm test`
(21 files, 197 tests), `cd sdk && python3 -m pytest -q` (66 tests),
`pnpm build && pnpm typecheck`, and the COGS selftest shared with
`measure-harness`, all green. Where
several evals share one command, the command was run once with a verbose
reporter (a reporter flag changes formatting only, not selection or outcome) and
each eval credited to its own named covering test rather than to a shared
result.

No A/B baseline was measured this round either; every `baseline:` field
above says so explicitly rather than carrying a value forward, for the
reason given in `## Analyst`.
`verified_commit` moves 50da8fac → f7e0217d; `run_id`, `verified_at`
and `output` were updated and nothing else. The verdict is unchanged, and the
human signature line in frontmatter is preserved byte-for-byte as signed —
verified by diffing the file and confirming that line produced no change.


Round 4 (2026-07-26T07:37–07:38Z, commit f2928c05) is a **carry-forward re-pin**
driven by a fresh-context verifier that wrote none of this code. It is not a
fresh Gate-2 verification and does not extend approval over anything new: this
feature is merged and signed, and **no file it owns changed**.

Ownership was checked rather than assumed. `git diff --name-only origin/main...HEAD`
minus `_acceptance/` lists exactly eleven files — the three workflows under
`.github/workflows/` and the eight scripts under `scripts/ci/` — and every one of
them belongs to `ci-actions-bump`, the feature under review in this PR. Against
the previous pin `f7e0217d` the non-`_acceptance` delta is narrower still: only
the eight `scripts/ci/*.sh` files, same owner. Nothing under `package.json`, `pnpm-lock.yaml`, `biome.json`, `scripts/deps/**` differs, so
the signature attests to the same code the human originally judged, and the
first condition of the carry-forward rule in `AGENTS.md` holds.

The second condition — standing checks green on the new tree — was met by
executing them, not by inference. All 8 evals evals were re-run against the working
tree at commit f2928c05, each `cmd` resolved line by line against
`_acceptance/config.yaml` rather than taken from the request, and every one
exited zero.

The shared standing checks (`pnpm lint:check`, `pnpm test`,
`cd sdk && python3 -m pytest -q`, `pnpm build && pnpm typecheck`) were each
executed **ONCE** for this whole re-pin and their single real result recorded for
every feature and every eval that binds them, with a **distinct `run_id` per
eval** so no two evidence rows claim the same execution. Where several evals of
this feature share one command, the command was additionally run once with a
verbose reporter — a reporter flag changes formatting only, never selection or
outcome — and each eval is credited to its own named covering test rather than
to a shared exit status.

No A/B baseline was measured this round; every `baseline:` field above says so
explicitly rather than carrying a value forward. `verified_commit` moves
f7e0217d → f2928c05; `run_id`, `verified_at` and `output` were updated and
nothing else. The verdict is unchanged, and the human signature line in
frontmatter is preserved byte-for-byte as signed — confirmed by diffing the file
and observing that line produced no change.

Round 5 (2026-07-26T08:11–08:12Z, commit a751b5f): **carry-forward re-pin —
the verdict and the human signature stand unchanged.** The round-4 pin
f2928c05 went stale under the whole-tree staleness rule because the
`ci-actions-bump` work continued on this branch. Ownership was re-derived here
rather than assumed: `git diff --name-only f2928c05 HEAD` with `_acceptance/`
excluded lists exactly three files — `scripts/ci/check-ghcr-untouched.sh`,
`scripts/ci/check-workflow-drift.sh` and `scripts/ci/gh-run-lib.sh` — and all
three are eval scripts owned by `ci-actions-bump`. Measured against
`origin/main` the branch's non-`_acceptance` footprint is the three files under
`.github/workflows/` plus the eight under `scripts/ci/`, which is the same
feature. Nothing this feature owns appears in that diff: not `package.json`, not `pnpm-lock.yaml`, not `biome.json`, and nothing under `scripts/deps/` — `scripts/ci/` is a different directory from `scripts/deps/`.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 8
evals were nonetheless re-executed on this tree and all 8 are green, so the
pin moves on measured evidence rather than on an edited SHA. `verified_commit`
moves f2928c05 → a751b5f; `run_id`, `verified_at` and `output` were updated and
nothing else. The signature field in frontmatter is preserved byte-for-byte as
signed, and no code was changed during verification.

The shared standing checks were each executed **once** against this tree — `pnpm
lint:check` at 08:11:12Z, `pnpm test` at 08:11:31Z, `cd sdk && python3 -m pytest
-q` at 08:11:19Z, `pnpm build && pnpm typecheck` finishing 08:12:13Z — and every
eval that binds one is credited to that single execution with its own distinct
`run_id`; no eval shares a `run_id` with another. Where one command covers
several evals, the covering test is named per eval and read from a second
invocation of the same selection under a verbose reporter, which changes neither
the selection nor the outcome. `pnpm tsx scripts/measure/selftest-cogs.ts` ran
once at 08:11:51Z and is credited to both `dependency-refresh-2026-07` E7 and
`measure-harness` E16.

Round 6 (2026-07-26T08:41–08:42Z, commit 73a8d93): **carry-forward re-pin —
the verdict and the human signature stand unchanged.** The round-5 pin
a751b5f went stale under the whole-tree staleness rule because `ci-actions-bump`
round-5 verification landed one more eval-script fix on this branch. Ownership
was re-derived here rather than assumed: `git diff --name-only a751b5f HEAD`
with `_acceptance/` excluded lists exactly one file,
`scripts/ci/check-workflow-drift.sh`, an eval script owned by `ci-actions-bump`.
Measured against `origin/main` the branch's whole non-`_acceptance` footprint is
the three files under `.github/workflows/` plus the eight under `scripts/ci/` —
the same feature, start to finish. Nothing this feature owns appears in that diff: `package.json`, `pnpm-lock.yaml`, `biome.json` and `scripts/deps/` are all untouched.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 8
evals were nonetheless re-executed on this tree and all 8 are green, so the pin
moves on measured evidence rather than on an edited SHA. `verified_commit` moves
a751b5f → 73a8d93; `run_id`, `verified_at` and `output` were updated and nothing
else. The signature field in frontmatter is preserved byte-for-byte as signed,
and no code was changed during verification.

The shared standing checks were each executed **once** against this tree — `pnpm
build && pnpm typecheck` finishing 08:41:42Z, `pnpm lint:check` at 08:41:49Z,
`pnpm test` at 08:41:50Z, `cd sdk && python3 -m pytest -q` at 08:42:03Z — and
every eval that binds one is credited to that single execution with its own
distinct `run_id`; no eval shares a `run_id` with another, here or across the
other three re-pinned features (53 evidence blocks, 53 distinct ids). This feature's own script evals ran at 08:42:09Z (`check-manifest.sh`), 08:42:16Z (`pnpm install --frozen-lockfile`), 08:42:09Z (`check-no-t3-drift.sh origin/main`); `pnpm tsx scripts/measure/selftest-cogs.ts` ran once at 08:42:30Z and is credited to both this feature's E7 and `measure-harness` E16 under separate run_ids.

Where one command covers several evals the covering test is named per eval and
read from a second invocation of the same selection under a verbose reporter,
which changes neither the selection nor the outcome. This round those named
lines were **re-matched** against the fresh verbose output rather than copied
forward — a carried line that had not actually run again would have stopped the
re-pin; none had.

Round 7 (2026-07-26T09:11–09:12Z, commit 572cb98): **carry-forward re-pin —
the verdict and the human signature stand unchanged.** The previous pin 73a8d93
went stale under the whole-tree staleness rule when `ci-actions-bump` landed one
further eval-script fix on this branch (`scripts/ci/check-action-pins.sh`, which
now extracts a pin with `sed` so a trailing comment can no longer stand in for a
deleted step).

Ownership was re-derived here rather than assumed. `git diff --name-only
origin/main...HEAD` with `_acceptance/` excluded lists exactly eleven files: the
three under `.github/workflows/` and the eight under `scripts/ci/`. Every one of
them belongs to `ci-actions-bump`, the feature under review in this PR. Nothing
this feature owns appears in that diff — `package.json`, `pnpm-lock.yaml`, `biome.json` and `scripts/deps/` are all untouched. Measured
against the previous pin instead, the diff narrows to a single file,
`scripts/ci/check-action-pins.sh`, with the same owner.

Both carry-forward conditions in AGENTS.md therefore hold: this feature's own
code is unchanged, and the standing checks are green on the new tree. All 8 evals
were nonetheless re-executed on this tree and all are green, so the pin moves on
measured evidence rather than on an edited SHA.

The shared standing checks were each executed **once** for this round and
credited to every eval they cover, under distinct `run_id`s: E3 to `pnpm lint:check`, E4 to `pnpm test`, E5 to the SDK pytest suite and E6 to `pnpm build && pnpm typecheck`. One
execution per command, one `run_id` per eval — the ids differ so the run-log
stays per-eval addressable, while the `verified_at` timestamps of evals sharing
a command are deliberately identical, because they record the same execution.

`verified_commit` moves 73a8d93 → 572cb98; `run_id`, `verified_at` and `output`
were updated and nothing else. Where a named test line's millisecond duration
differed from this round's run, the excerpt was corrected to this round's actual
value rather than carried forward. The signature field in frontmatter is
preserved byte-for-byte as signed, and this round did not touch it.

Round 8 (2026-07-26T13:52–14:00Z, commit 5975bb4): **carry-forward re-pin —
no fresh Gate-2 signature.** Re-pinned because the `oneflow-plugin-prefix` work
landed on this branch after round 7 and `stale_files` compares the whole tree
against `verified_commit`.

The tree changed only where `oneflow-plugin-prefix` owns it. `git diff --name-only
origin/main...HEAD`, with `_acceptance/**` removed, lists six files:
`docs/plugins.md`, `scripts/plugins/check-prefix-docs.sh`,
`scripts/plugins/check-no-config-drift.sh`, `src/lib/plugins/plugin-id.ts`,
`src/lib/plugins/plugin-id.test.ts` and `src/lib/plugins/plugins-install.server.ts`.
Every one belongs to that feature; none falls in this feature's ownership set. This feature owns `package.json`, `pnpm-lock.yaml`, `biome.json` and
`scripts/deps/**`; none appears in the diff.

All eight evals were re-run on the new tree and all eight exited zero:
`deps_manifest_intact`, `deps_lockfile_clean` (`pnpm install --frozen-lockfile`,
which refuses to proceed when lockfile and manifest disagree),
`deps_no_t3_drift`, `smoke_measure_cogs`, and the four shared standing checks.

The three shared standing checks were each executed ONCE for the whole PR and
credited to every feature and eval that binds them, under a distinct `run_id`
per eval — `pnpm build && pnpm typecheck` at 2026-07-26T13:52:28Z,
`pnpm lint:check` at 2026-07-26T13:55:47Z (398 files, no fixes) and `pnpm test`
at 2026-07-26T13:55:54Z (22 files, 270 tests). `cd sdk && pytest` ran once at
2026-07-26T13:59:51Z (66 tests). No eval shares a `run_id` with another, here or
across the other features re-pinned in this PR.

`verified_commit` moves 572cb98 → 5975bb4; `run_id`, `verified_at` and `output`
were updated from this round's actual runs and nothing else in the report body
changed. The human signature line is byte-identical to the one committed at Gate
2 — it attests to the same code it originally did, which is what the
carry-forward rule in AGENTS.md authorises.

Round 9 (2026-07-26T14:44–14:54Z, commit 8254c0bd): **carry-forward re-pin —
not a fresh Gate-2 signature.** The feature under review in PR #18 is
`oneflow-plugin-prefix`; this feature is merged, signed, and went stale only
because `stale_files` compares the whole tree against each report's
`verified_commit`.

Both carry-forward preconditions from AGENTS.md were checked, not assumed.

1. **This feature's own code is unchanged.** `git diff --name-only 5975bb4`
   filtered of `_acceptance/` lists four files — `docs/plugins.md`,
   `scripts/plugins/check-prefix-docs.sh`, `sdk/tongflow/scan.py` and
   `sdk/tests/test_scan_prefix.py`. Widened to the whole branch,
   `git diff --name-only origin/main...HEAD` filtered of `_acceptance/` adds
   `scripts/plugins/check-no-config-drift.sh`, `src/lib/plugins/plugin-id.ts`,
   `src/lib/plugins/plugin-id.test.ts` and
   `src/lib/plugins/plugins-install.server.ts`. `docs/**` is a declared T1 skip
   glob; every other file belongs to `oneflow-plugin-prefix`. None of `package.json`, `pnpm-lock.yaml`, `biome.json` or `scripts/deps/**` — the paths this feature owns — differs.
2. **The standing checks are green on the new tree.** `pnpm test` (22 files, 270 tests), `pnpm lint:check` (398 files, no fixes) and `pnpm build && pnpm typecheck` all exited zero on this tree.

All eight of this feature's evals were re-executed at this commit and all eight
exited zero, including the three that are specific to it: E1
(`deps_manifest_intact`), E2 (`deps_lockfile_clean` — `pnpm install
--frozen-lockfile`, which refuses when the lockfile and manifest disagree) and E8
(`deps_no_t3_drift`). E5 (`sdk_pytest`) reports 86 tests rather than the
previous 66, because `oneflow-plugin-prefix` added 20 SDK tests; the suite is
green, which is what AC-5 asserts.

Each shared standing check was executed ONCE for the whole PR and credited to
every feature and eval that binds it, under a **distinct `run_id` per eval** —
`pnpm build && pnpm typecheck` at 2026-07-26T14:54:32Z, `pnpm lint:check` at
2026-07-26T14:44:17Z (398 files, no fixes) and `pnpm test` at
2026-07-26T14:44:24Z (22 files, 270 tests). `cd sdk && pytest` ran once at
2026-07-26T14:44:28Z (86 tests — 20 more than the previous round, because
`oneflow-plugin-prefix` added `sdk/tests/test_scan_prefix.py`). No eval shares a
`run_id` with another, here or across the other features re-pinned in this PR.

`verified_commit` moves 5975bb4 → 8254c0bd; `run_id`, `verified_at` and `output`
were updated from this round's actual runs and nothing else in the report body
changed. The signature bytes in frontmatter were not touched — the signature
attests to the same code it originally did, which is what the carry-forward rule
in AGENTS.md authorises.

**One feature in this PR could not be carried.** `sdk-distribution-rename` owns
`sdk/**`, and this branch changes `sdk/tongflow/scan.py` and adds
`sdk/tests/test_scan_prefix.py`. Precondition 1 fails for it as written, so its
report was left untouched and its pin was not moved.


Round 10 (2026-07-26T15:41–15:42Z, commit 66f80430): **carry-forward re-pin —
no fresh Gate-2 signature.** Re-pinned because commit `66f80430` landed on this
branch after round 9 and `stale_files` compares the whole tree against
`verified_commit`, unscoped to the feature.

Precondition checked, not assumed. `git diff --name-only 8254c0bd..HEAD` with
`_acceptance/**` removed lists **twelve** files:

```
scripts/plugins/check-prefix-docs.sh
sdk/tests/test_scan_prefix.py
src/components/workspace/nodes/base/node-plugin-id-select.tsx
src/components/workspace/plugins-dialog.tsx
src/components/workspace/settings-dialog.tsx
src/i18n/messages/en.json
src/i18n/messages/ja.json
src/i18n/messages/ko.json
src/i18n/messages/vi.json
src/i18n/messages/zh.json
src/lib/plugins/plugin-id.test.ts
src/lib/plugins/plugin-id.ts
```

Every one belongs to **`oneflow-plugin-prefix`** — the commit moved
`pluginDisplayName` into `plugin-id.ts` and taught it both vendor prefixes,
refreshed the install hint in five locales and the dialog placeholder, added
prefix-less cases to the scanner's prefix tests, and anchored an assertion in
that feature's docs guard. None of the twelve falls in this feature's ownership
set (`package.json`, `pnpm-lock.yaml`, `biome.json` and `scripts/deps/**`), so the carry-forward precondition in AGENTS.md holds: the
signature attests to the same code it originally did.

This feature's own evals were all re-run on this tree and all are green:
`deps_manifest_intact` (react 19.2.8, drizzle-orm 0.45.2, @biomejs/biome 2.5.5,
repo scripts intact), `deps_lockfile_clean` (`pnpm install --frozen-lockfile`),
`deps_no_t3_drift` (`src/lib/abi` and `src/app/api` untouched vs origin/main)
and `smoke_measure_cogs`, alongside the four standing checks it binds.

The shared standing checks were each executed **once** for the whole PR and
credited to every feature and eval that binds them, under a distinct `run_id`
per eval — `pnpm build && pnpm typecheck` at 2026-07-26T15:42:13Z,
`pnpm lint:check` at 2026-07-26T15:41:23Z (398 files, no fixes), `pnpm test` at
2026-07-26T15:41:22Z (22 files, 272 tests) and `cd sdk && pytest` at
2026-07-26T15:41:17Z (89 tests). One execution per command, one `run_id` per
eval: the ids differ so the run-log stays per-eval addressable, while the
`verified_at` timestamps of evals sharing a command are deliberately identical,
because they record the same execution. No eval shares a `run_id` with another,
here or across the other features re-pinned in this PR.

`verified_commit` moves 8254c0bd → 66f80430; `verified_by` records round 10;
`run_id` and `verified_at` were updated from this round's actual runs and nothing
else in the report body changed. The human signature line in frontmatter was not
touched — it attests to the same code it originally did, which is what the
carry-forward rule in AGENTS.md authorises.

Carry-forward re-pin (2026-07-29, branch feat/stale-scope-by-paths):
`verified_commit` moved from e657d56ea07675e2f887048e01e73724f400226a to
4dcb419d5d7d4612c10339bede6219662721d7e0 with NO re-verify, under the carry-forward
rule in AGENTS.md. Both of its conditions were checked, not assumed.

(1) This feature's own code is unchanged. Filtered of `_acceptance/`, the files
differing since the old pin are: the five `scripts/acceptance/**` guard files and
`scripts/pre-merge-check.sh` — all owned by **stale-scope-by-paths**, the feature
under review on this branch, and the only non-exempt changes the gate reports; plus
t1-exempt documentation and config that reached main independently of this branch —
`STATUS.md`, `.gitignore`, `docs/**` (ADRs, roadmap, strategy, G0 runbook),
`measure/wer-corpus/README.md`, and `biome.json` + `lib/evidence-core.js` +
`lib/gap-probe.js` (acceptance-gate kit 1.24.0, merged to main as PR #26).


(2) Standing checks green on the new tree: `pnpm lint:check`, `pnpm test`
(329 passed), `pnpm build && pnpm typecheck`.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.

## Gate 2 checklist (human)

- [ ] Read the table, then spot-check E8 — it is the eval that says what the
      change was not allowed to do, and its guard script was rewritten this round
- [ ] Confirm you accept the out-of-scope items: the three GitHub Actions bumps
      (unexercised until the next Docker build) and the deferred
      `useOptionalChain` adoption
- [ ] Fill the sign-off field in frontmatter + `time_human_minutes.gate2` in the
      contract
