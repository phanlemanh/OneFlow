---
schema_version: 2
feature_slug: dependency-refresh-2026-07
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50da8fac07d41cc48ea3cdc298374d0ab8375ad1
human_signoff:
---

# Evidence Report: dependency-refresh-2026-07

Round 2 (2026-07-26T04:49–04:52Z, commit 50da8fac). A **full** re-verify: this
is the feature under review, and the one commit that landed since round 1
(`50da8fa`) rewrites `scripts/deps/check-no-t3-drift.sh`, which this feature
owns. All eight evals were re-executed against the working tree on branch
`chore/dependency-updates`. Each `cmd` was resolved against
`_acceptance/config.yaml` line by line rather than taken from the request. Only
files under `_acceptance/` differ from the pinned commit, and `_acceptance/**`
is a declared T1 skip glob, so the pin describes the code that was measured.

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
  run_id: dependency-refresh-2026-07-r2-e1-20260726044921
  exit_code: 0
  baseline: not measured — see `## Analyst` (a baseline is meaningless for this feature)
  verifier: config:executors.script.deps_manifest_intact
  verified_at: 2026-07-26T04:49:21Z
  output: |
    dependencies.react = 19.2.8
    dependencies.drizzle-orm = 0.45.2
    devDependencies.@biomejs/biome = 2.5.5
    repo scripts intact: hooks:install, sdk:publish, gen:abi
    Script body re-read this round: check-manifest.sh requires each of the three
    keys to be truthy and each of hooks:install / sdk:publish / gen:abi to be
    present in p.scripts, failing loudly on any absence rather than warning.
    Both dependabot groups are therefore represented — react and drizzle-orm
    from the production group, @biomejs/biome from the development group.

- eval: E2
  run_id: dependency-refresh-2026-07-r2-e2-20260726044928
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.script.deps_lockfile_clean
  verified_at: 2026-07-26T04:49:28Z
  output: |
    Lockfile is up to date, resolution step is skipped
    Progress: resolved 2, reused 2, downloaded 0, added 0, done
    Done in 482ms using pnpm v10.12.1
    "Lockfile is up to date, resolution step is skipped" is the substantive
    line: under --frozen-lockfile pnpm refuses to proceed when the lockfile and
    the manifest disagree, so this is the proof that the regenerated lockfile
    matches the merged package.json exactly. `git status --porcelain` was
    re-checked immediately afterwards and pnpm-lock.yaml was unmodified, so the
    install neither rewrote nor repaired the lockfile behind the check.

- eval: E3
  run_id: dependency-refresh-2026-07-r2-e3-20260726044937
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T04:49:37Z
  output: |
    > oneflow@0.2.1 lint:check /Users/manhphan/dev/oneflow
    > pnpm exec biome check --error-on-warnings .
    Checked 396 files in 90ms. No fixes applied.
    Re-confirmed this round that this is not a vacuous pass: `biome --version`
    reports 2.5.5, and biome.json declares `css.parser.tailwindDirectives`,
    without which the Tailwind at-rules in src/app/globals.css are rejected.
    The counterfactual run that established the setting is load-bearing is
    recorded in `## Analyst` and was not repeated this round.

- eval: E4
  run_id: dependency-refresh-2026-07-r2-e4-20260726044944
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.unit
  verified_at: 2026-07-26T04:49:44Z
  output: |
    > oneflow@0.2.1 test /Users/manhphan/dev/oneflow
    > vitest run
     RUN  v4.1.10 /Users/manhphan/dev/oneflow
     Test Files  21 passed (21)
          Tests  197 passed (197)
       Duration  679ms (transform 1.33s, setup 0ms, import 2.45s, tests 583ms, environment 3ms)
    The count matches AC-4's stated 197 exactly, so the criterion is checked on
    its number and not merely on a green result. This round's run used
    --reporter=verbose (a reporter flag only — selection and outcome are
    unchanged), and the listing enumerated all 197 individually with the same
    totals, confirming none were skipped or filtered.

- eval: E5
  run_id: dependency-refresh-2026-07-r2-e5-20260726044955
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-26T04:49:55Z
  output: |
    ..................................................................       [100%]
    66 passed in 5.38s
    The count matches AC-5's stated 66 exactly. The 66 dots are one per test and
    all are passes; the companion verbose listing of the packaging module (run
    for `sdk-distribution-rename`) named its 11 tests individually, all PASSED,
    consistent with the quiet-mode total not masking skips.

- eval: E6
  run_id: dependency-refresh-2026-07-r2-e6-20260726045014
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T04:50:14Z
  output: |
    > oneflow@0.2.1 build /Users/manhphan/dev/oneflow
    > next build
     ✓ Compiled successfully in 2.8s
    ... route table rendered, all routes emitted ...
    + First Load JS shared by all             103 kB
    > oneflow@0.2.1 typecheck /Users/manhphan/dev/oneflow
    > tsc --noEmit
    Run as the single sequential command the config declares, so `next build`
    finishes rewriting .next/types before `tsc` reads them. Both halves
    completed; tsc emitted no diagnostics under next 15.5.21 / react 19.2.8.

- eval: E7
  run_id: dependency-refresh-2026-07-r2-e7-20260726045041
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.script.smoke_measure_cogs
  verified_at: 2026-07-26T04:50:41Z
  output: |
    Plugin time from /var/folders/.../oneflow-cogs-Q1VEdQ/good.db (status: completed, failed) — 5 task(s)

    plugin / slot                              n  meas  unmeas    total   median      p95
    modal-z-image / image-gen                   4     3       1    11.0s     4.0s     6.0s
    api-openrouter / gen-text                   1     1       0     0.5s     0.5s     0.5s

    1 task(s) have no measured duration — history from before metering, or aborted runs.
    No --rates supplied, so no cost is reported.
    selftest-cogs: ok
    Source re-read this round to confirm the eval bites on the two bumps it
    claims to cover: scripts/measure/selftest-cogs.ts imports `better-sqlite3`
    and both `drizzle-orm/better-sqlite3` and its `/migrator`, then calls
    migrate(drizzle(good), { migrationsFolder: "drizzle" }) against a real temp
    sqlite file. The temp path in the header above is that database, freshly
    created for this run. This is genuine runtime exercise of drizzle-orm 0.45.2
    and better-sqlite3 12.11.1, not merely compiling against their types.

- eval: E8
  run_id: dependency-refresh-2026-07-r2-e8-20260726044921
  exit_code: 0
  baseline: not measured — see `## Analyst`
  verifier: config:executors.script.deps_no_t3_drift
  verified_at: 2026-07-26T04:49:21Z
  output: |
    no T3 drift: src/lib/abi src/app/api untouched vs origin/main
    This is the suppression half and the focus of this round, because the script
    behind it was rewritten in commit 50da8fa. It was corroborated five
    independent ways rather than taken from the script's own word — see
    `## Analyst`, "E8 in depth". Summary: the new script body was read and its
    logic reproduced by hand; both of its guard branches were made to fire
    (an unresolvable base ref, and a base whose tree genuinely differs under the
    protected paths, which was named in the output); the previously-reported
    false-pass on an unresolvable ref was reproduced against the old script body
    and confirmed absent from the new one; and, independently of the script
    entirely, the git tree hashes of both protected directories are identical
    between HEAD and origin/main.

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
shared standing checks produced totals identical to round 1 (197 tests, 66 SDK
tests, 396 files linted), which is the expected result given that no source file
changed between the two rounds apart from the drift guard itself.

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

## Gate 2 checklist (human)

- [ ] Read the table, then spot-check E8 — it is the eval that says what the
      change was not allowed to do, and its guard script was rewritten this round
- [ ] Confirm you accept the out-of-scope items: the three GitHub Actions bumps
      (unexercised until the next Docker build) and the deferred
      `useOptionalChain` adoption
- [ ] Fill the sign-off field in frontmatter + `time_human_minutes.gate2` in the
      contract
