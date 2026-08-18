---
schema_version: 2
feature_slug: pnpm-build-approvals
verdict: PASS
failed_evals: []
reason:
verified_by: separated grader pass (same session; subagent dispatch disabled by session policy — see Known limits)
enforcement_mode: strict
bypass_used: false
verified_commit: 9e1387715d61a9b855628db8243b862e6d5a17de
human_signoff: Manh 2026-08-18
---

# Evidence Report: pnpm-build-approvals

17 machine evals across 12 criteria. No judgment evals — every criterion here is
mechanically checkable, so nothing is waiting on a taste call.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |
| E11 | AC-7 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: pnpm-build-approvals-e1-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.pnpm_no_pnpm_field
  verified_at: 2026-08-18T08:23:14Z
  output: |
    OK[no-pnpm-field]: no pnpm field in package.json; pnpm prints no migration warning
- eval: E2
  run_id: pnpm-build-approvals-e2-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.pnpm_install_clean
  verified_at: 2026-08-18T08:23:14Z
  output: |
    OK[install-clean]: pnpm install exit 0, no ignored-builds error, no migration warning
- eval: E3
  run_id: pnpm-build-approvals-e3-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.pnpm_addon_built
  verified_at: 2026-08-18T08:23:14Z
  output: |
    OK[addon-built]: native addon present and loadable (/Users/manh-macmini/dev/oneflow/.claude/worktrees/fervent-sanderson-57f1a4/node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/build/Release/better_sqlite3.node)
- eval: E4
  run_id: pnpm-build-approvals-e4-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit_metering_schema
  verified_at: 2026-08-18T08:23:15Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow/.claude/worktrees/fervent-sanderson-57f1a4
     Test Files  1 passed (1)
          Tests  7 passed (7)
       Start at  15:23:15
       Duration  300ms (transform 16ms, setup 0ms, import 189ms, tests 16ms, environment 0ms)
- eval: E5
  run_id: pnpm-build-approvals-e5-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.test.unit
  verified_at: 2026-08-18T08:23:16Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow/.claude/worktrees/fervent-sanderson-57f1a4
     Test Files  32 passed (32)
          Tests  427 passed (427)
       Start at  15:23:16
       Duration  1.25s (transform 1.66s, setup 0ms, import 3.10s, tests 1.42s, environment 365ms)
    $ vitest run
- eval: E6
  run_id: pnpm-build-approvals-e6-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-18T08:23:17Z
  output: |
    [feature-registry] No plugins in nodePluginMap for nodeSlot="image-body-seg"; using type=function=unregistered
    [feature-registry] No plugins in nodePluginMap for nodeSlot="image-normal"; using type=function=unregistered
    [feature-registry] No plugins in nodePluginMap for nodeSlot="image-matting"; using type=function=unregistered
    [feature-registry] No plugins in nodePluginMap for nodeSlot="video-gen-model"; using type=function=unregistered
    [feature-registry] No plugins in nodePluginMap for nodeSlot="compose-overlay"; using type=function=unregistered
    $ tsc --noEmit
- eval: E7
  run_id: pnpm-build-approvals-e7-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.test.lint
  verified_at: 2026-08-18T08:23:36Z
  output: |
    Checked 430 files in 78ms. No fixes applied.
    $ pnpm exec biome check --error-on-warnings .
- eval: E8
  run_id: pnpm-build-approvals-e8-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-18T08:23:37Z
  output: |
    [verify-plugins-scan] OK
    $ tsx scripts/verify-plugins-scan.ts
- eval: E9
  run_id: pnpm-build-approvals-e9-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.gen_abi_clean
  verified_at: 2026-08-18T08:23:37Z
  output: |
    Wrote src/generated/abi/index.ts
    Wrote sdk/tongflow/_data/tongflow.abi.json
    $ tsx scripts/gen-abi-types.ts
- eval: E10
  run_id: pnpm-build-approvals-e10-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.pnpm_teeth_removed
  verified_at: 2026-08-18T08:23:38Z
  output: |
    OK[teeth-removed]: removing the approvals block stops the build and errors — config is load-bearing
- eval: E11
  run_id: pnpm-build-approvals-e11-20260818
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pnpm_teeth_legacy_key
  verified_at: 2026-08-18T08:23:41Z
  output: |
    OK[teeth-legacy-key]: legacy onlyBuiltDependencies is ignored by pnpm 11 — allowBuilds is the load-bearing key
- eval: E12
  run_id: pnpm-build-approvals-e12-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.pnpm_ci_pnpm10
  verified_at: 2026-08-18T08:23:44Z
  output: |
    OK[ci-pnpm10]: addon built under pnpm@10, the major pinned in ci.yml
- eval: E13
  run_id: pnpm-build-approvals-e13-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.pnpm_tracked_not_ignored
  verified_at: 2026-08-18T08:23:47Z
  output: |
    OK[tracked-not-ignored]: pnpm-workspace.yaml is tracked and not ignored
- eval: E14
  run_id: pnpm-build-approvals-e14-20260818
  exit_code: 0
  baseline: red
  verifier: config:executors.script.pnpm_explicit_decisions
  verified_at: 2026-08-18T08:23:47Z
  output: |
    OK[explicit-decisions]: 7 approvals, all resolve in the lockfile; denials justified by their scripts
- eval: E15
  run_id: pnpm-build-approvals-e15-20260818
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pnpm_keys_intact
  verified_at: 2026-08-18T08:23:47Z
  output: |
    OK[keys-intact]: config.yaml additive only; suite_keys and lockfile untouched
- eval: E16
  run_id: pnpm-build-approvals-e16-20260818
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pnpm_scope_confined
  verified_at: 2026-08-18T08:23:47Z
  output: |
    OK[scope-confined]: diff confined to tooling config and this feature's gate artifacts
- eval: E17
  run_id: pnpm-build-approvals-e17-20260818
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pnpm_case_completeness
  verified_at: 2026-08-18T08:23:47Z
  output: |
    OK[case-completeness]: all 11 declared cases implemented

## Analyst

Two evals are green on BOTH this branch and the `origin/main` baseline, so they
prove the harness rather than the change. Both are intended premise guards, kept
deliberately:

- **E11** (`teeth-legacy-key`) asserts that pnpm 11 ignores the legacy
  `onlyBuiltDependencies` list form. That is a property of pnpm, true on `main`
  too — it cannot discriminate. It is retained because it is the *reason* this
  fix chose `allowBuilds`: if a future pnpm restored support for the list form,
  this eval turns and the contract's premise would need rewriting.
- **E17** (`case-completeness`) guards the guard — a case declared but never
  implemented cannot masquerade as one that passed. Meta by construction.

The other 15 are red on baseline. E1..E9 red is the reported bug reproducing on
`main`: the install refuses, the addon is absent, and lint / verify:plugins /
gen:abi / build+typecheck / both test evals all stop before doing work.
E15/E16 are `n-a` — they read a PR diff, which has no meaning on a detached
baseline checkout.

## Variance

none — every eval is deterministic (no `runs:` > 1), and each was uniform across
the two rounds recorded below once the harness defect was corrected.

## Iterations

Round 1: E3, E4, E5 came back red. Cause was the verifier, not the tree — the
runner invoked commands through a **login** shell, which resolves Node 25 on this
machine, while the native addon had been compiled against the Node 24 ABI the repo
and CI actually use (`ci.yml` pins `node-version: 24`). The addon therefore
refused to load. No code changed in response; the runner was corrected to use a
non-login shell matching the repo's Node, and the finding was recorded as a Known
limit instead. Both rounds are in `run-log.jsonl`.

Round 2: all 17 evals green on commit `9e13877`.

## Known limits (read before signing)

- **Doer and grader are the same context.** The kit wants a fresh-context
  subagent; subagent dispatch is disabled by session policy here, so this is the
  documented fallback — a separated grader pass run after implementation. The
  machine evidence is reproducible (every command is a `config:` ref you can
  re-run), but the independence the kit normally buys is absent. This is the
  single biggest reason to spot-check a block or two yourself.
- **The contract was written after the implementation landed** (`5f1afba`),
  disclosed in the contract's Notes. AC-1..AC-5 restate symptoms from the original
  bug report, and the baseline column shows they genuinely fail on `main`.
- **`allowBuilds` version floor.** Support appears between pnpm 10.20 (absent) and
  10.28 (present). CI's `version: 10` floats to the latest 10.x, comfortably above
  it — E12 proves it works there today. Pinning an exact 10.x below ~10.28 would
  skip native builds silently. Fail-open; recorded, not fixed.
- **The compiled addon is bound to the Node major that built it.** Round 1 is the
  proof: a shell resolving Node 25 could not load an addon built under Node 24,
  even with approvals correct. Anyone whose shell differs from the repo's Node
  needs a reinstall, not a config change. Out of this contract's scope.
- **`cbor-extract` was dropped on present absence**, not on history. If it returns
  as a transitive dependency it returns unapproved — the install then fails loudly
  rather than silently, an acceptable direction but not a guarded one.
- **E2 runs the install in the already-populated repo**, so it proves "install
  stays clean", not "a cold install builds from nothing". The cold-install claim is
  carried by E10 and E12, which install into throwaway projects with isolated
  stores.

## Ngoài hợp đồng

none — no finding surfaced during verification that falls outside the contract's
criteria.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks (see Known limits — grader
      independence is the weak point here)
- [ ] No judgment items to resolve: there are none, and no UNCERTAIN
- [ ] Confirm you accept the `allowBuilds` version floor being recorded rather
      than closed (a `packageManager` pin would close it; held out of scope)
- [ ] Fill `human_signoff` in frontmatter
