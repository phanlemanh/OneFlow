---
schema_version: 2
feature_slug: ci-actions-bump
verdict: BLOCKED
failed_evals: []
reason: >-
  Round 1 is incomplete by design. E2 was deliberately not run this round, and
  E3 cannot conclude until E2's job does — both are gated on the `ci.yml` run
  concluding success, which cannot happen until this very report is committed
  and the four merged features are re-pinned. Neither is a defect in the action
  bump; both are the acceptance gate's own bookkeeping. The six evals that can
  be observed now (E1, E4, E5, E6, E7, E8) were all run and all exited zero.
  E2 and E3 get their own short round after this one lands.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f7e0217d13aff74527c05e3cb6e163e758594c07
human_signoff:
---

# Evidence Report: ci-actions-bump

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PENDING — not run this round (see `## Iterations`) |
| E3 | AC-3 | script | PENDING — command ran, did not exit zero (see below) |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

**Neither PENDING row is a claim that the criterion holds.** E2 was not executed
at all; E3 was executed and its recorded exit status is honest. Read the two
blocks below for exactly what was and was not established.

## Evidence

- eval: E1
  run_id: ci-actions-bump-r1-e1-20260726062757
  exit_code: 0
  baseline: red — the same script run against a tree with any one site left at v4 reports the offending pin and terminates unsuccessfully (see `## Analyst`)
  verifier: config:executors.script.ci_actions_pinned
  verified_at: 2026-07-26T06:27:57Z
  output: |
    ok actions/checkout: 7 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

    Re-derived independently of the script: `grep -rnoE "actions/checkout@v[0-9]+"
    .github/workflows` lists exactly seven hits — ci.yml lines 18, 42, 63, 84, 102;
    desktop-release.yml line 61; docker-publish.yml line 23 — every one at v7, and
    `docker/login-action@v4` once at docker-publish.yml line 32. The contract's
    "seven sites" figure is therefore correct as written.

- eval: E2
  status: not run this round — deferred by instruction
  verifier: config:executors.script.ci_job_gate_green
  partial_finding: |
    The substantive half of AC-2 IS established, from the Acceptance Gate job log
    of run 30190888234 (the `ci.yml` run at this branch's head SHA
    f7e0217d13aff74527c05e3cb6e163e758594c07). What AC-2 actually asks is whether
    `checkout@v7` with `fetch-depth: 0` still gives `pre-merge-check.sh` a base to
    diff against. It does:

      Run actions/checkout@v7
      with:
        fetch-depth: 0
        allow-unsafe-pr-checkout: false
      [command]/usr/bin/git -c protocol.version=2 fetch --no-tags --prune
        --no-recurse-submodules origin +refs/heads/*:refs/remotes/origin/*
        +refs/tags/*:refs/tags/* +bd8064e…:refs/remotes/pull/17/merge
       * [new branch]      main  -> origin/main

    `origin/main` was fetched, so the base ref resolves. And the gate script then
    produced a real file-level diff rather than a "cannot resolve base" complaint —
    it named the ten changed files one per line under each stale-evidence notice:

      Pre-merge acceptance check
        …evidence is stale — code changed after verify
        (verified_commit 50da8fac07d41cc48ea3cdc298374d0ab8375ad1); Changed:
            .github/workflows/ci.yml
            .github/workflows/desktop-release.yml
            .github/workflows/docker-publish.yml
            scripts/ci/check-action-pins.sh
            … (six more, all under scripts/ci/)

    A shallow clone cannot produce that list. This is the proof the checkout bump
    was worth verifying, and it is positive. Two further readings from the same
    log: the resolved input defaults are the v4 values the contract claims
    (`persist-credentials: true`, `submodules: false`, `fetch-tags: false`), and
    the new `allow-unsafe-pr-checkout` resolved to `false` without changing what
    was checked out — the run is a `pull_request` event, not one of the two events
    the new default constrains.

    What is NOT established is the job's own conclusion, which is what the eval
    command asserts. That job did not succeed, for two reasons that are entirely
    about the gate's bookkeeping and not about any action: `ci-actions-bump` had
    no evidence report yet, and the four already-merged features were stale until
    re-pinned. Committing this report and the four re-pins is the fix for both.
    E2 is therefore observable only on the NEXT run of `ci.yml`, and gets its own
    short round then.

- eval: E3
  run_id: ci-actions-bump-r1-e3-20260726062911
  exit_code: 1
  baseline: red — with any named job's conclusion doctored, the script names it and terminates unsuccessfully (see `## Analyst`)
  verifier: config:executors.script.ci_jobs_green
  verified_at: 2026-07-26T06:29:11Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30190888234 @ f7e0217d13aff74527c05e3cb6e163e758594c07
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    (then, from the shared run-level assertion) the run as a whole concluded
    unsuccessfully, and the script propagates that.

    All four jobs AC-3 names concluded success at this branch's head SHA under the
    node24 runtime — that is the substantive half, and it is green. The script
    nonetheless does not exit zero, because `assert_run_complete` in
    `scripts/ci/gh-run-lib.sh` requires the WHOLE run to be green, and the fifth
    job in that same run is the Acceptance Gate job E2 covers. So E3 is hostage to
    E2 through a shared run object: while the gate job is red for bookkeeping
    reasons, E3 cannot exit zero however healthy its own four jobs are.

    This is a script-design finding, not a finding about the bump — see
    `## Analyst`, item 6. E3 is left PENDING rather than marked PASS: the recorded
    exit status is what it is, and a green subset is not the thing the eval
    asserts. It will be re-run alongside E2 in the follow-up round.

- eval: E4
  run_id: ci-actions-bump-r1-e4-20260726062829
  exit_code: 0
  baseline: red — restoring `push: true`, or gating it on anything other than the ref being a tag, makes the script terminate unsuccessfully (see `## Analyst`)
  verifier: config:executors.script.ci_docker_dryrun_guard
  verified_at: 2026-07-26T06:28:29Z
  output: |
    dry-run guard present:          push: ${{ github.ref_type == 'tag' }}
    a workflow_dispatch run builds both platforms and publishes nothing

    Read directly from the file as well: `.github/workflows/docker-publish.yml`
    carries `push:` twice — line 4 is the workflow trigger (a bare key with a block
    under it) and line 64 is the build-push-action input carrying a value. Only the
    second is the guard, and the script distinguishes them on that shape rather
    than on indentation.

- eval: E5
  run_id: ci-actions-bump-r1-e5-20260726062941
  exit_code: 0
  baseline: red — dropping the 'Log in to GHCR' step from the run JSON, or marking 'Build & push' unsuccessful, each makes the script terminate unsuccessfully (see `## Analyst`)
  verifier: config:executors.script.ci_docker_dispatch_green
  verified_at: 2026-07-26T06:29:41Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190339168
      branch under test: chore/ci-actions-bump   run head: b48699c612fab479deede3d7d1d9959e110d7335
      workflow tree matches HEAD: c2bd8c61cfc2a159cd3287783e750dfd72ce02b9
    ok job 'Build & push (amd64 + arm64)': success
       ok step 'Set up QEMU': success
       ok step 'Log in to GHCR': success
       ok step 'Build & push': success
    dispatched docker dry run succeeded, and reached every step that carries a bumped action

    Provenance re-derived rather than taken from the script: `gh run view
    30190339168` reports event `workflow_dispatch`, branch `chore/ci-actions-bump`,
    head b48699c — and `git merge-base --is-ancestor b48699c HEAD` confirms that
    commit is on this branch. The only commit after it is f7e0217, which touches
    `scripts/ci/check-dispatch-run.sh` alone; the Dockerfile and `src/` are
    byte-identical between b48699c and HEAD, so the run built this tree's image.
    The actions the run actually resolved are the ones under test:
    `docker/login-action@v4` (SHA abd2ef4), `docker/build-push-action@v7`
    (SHA 53b7df9), `docker/setup-qemu-action@v4` (SHA 96fe6ef). Login step output:
    "Logging into ghcr.io… Login Succeeded!" — which is the whole point of PR #2.
    Both platforms genuinely compiled: the buildx log carries 79 `linux/amd64` and
    62 `linux/arm64` stage lines across a ~21-minute cross-arch build.

- eval: E6
  run_id: ci-actions-bump-r1-e6-20260726063040
  exit_code: 0
  baseline: red — with a package version dated after the run's start, the script names it and terminates unsuccessfully; with only older versions it passes; with the API refusing, it declines to answer (see `## Analyst`)
  verifier: config:executors.script.ci_ghcr_untouched
  verified_at: 2026-07-26T06:30:40Z
  output: |
    dispatched run started 2026-07-26T06:01:26Z (https://github.com/phanlemanh/OneFlow/actions/runs/30190339168)
    checking GHCR package phanlemanh/oneflow
    no GHCR container package exists for phanlemanh/oneflow — nothing has ever been published
    no publish occurred during the dry run

    **This green came from the script's weakest branch and is NOT accepted as
    sufficient.** It is the 404 path, and the token this eval runs under does not
    hold `read:packages` — see `## Analyst`, item 5, where the 404 is shown to be
    indistinguishable from a scope-masked package.

    AC-6 is instead established directly from the dispatched run's own log, which
    is not subject to that ambiguity. Three independent readings, all from run
    30190339168:

      1. The resolved input to the action was `push: false`.
      2. The buildx invocation carries no `--push` and no `--output type=registry`;
         its only outputs are `--iidfile` and `--metadata-file`, both local paths.
      3. The single export stage in the whole build is
         `#42 exporting to GitHub Actions Cache` — the layer cache, not a registry.

    Corroborating: the metadata step emitted `type=raw,value=latest,enable=false`,
    so even the `latest` tag was disabled for this run; and across all 3576 log
    lines there is not one occurrence of "pushing", "exporting to image" or
    "exporting to registry". The lone `--output` in the log belongs to
    `docker buildx history export`, which writes a `.dockerbuild` file uploaded as
    an Actions artifact. Nothing reached ghcr.io.

- eval: E7
  run_id: ci-actions-bump-r1-e7-20260726063157
  exit_code: 0
  baseline: red — marking 'Upload to draft GitHub Release' as having run, or skipping either matrix leg, each makes the script terminate unsuccessfully (see `## Analyst`)
  verifier: config:executors.script.ci_desktop_dispatch_green
  verified_at: 2026-07-26T06:31:57Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190355369
      branch under test: chore/ci-actions-bump   run head: b48699c612fab479deede3d7d1d9959e110d7335
      workflow tree matches HEAD: c2bd8c61cfc2a159cd3287783e750dfd72ce02b9
    ok job 'build (macos-14, …)': success
       ok step 'Cache cargo registry': success
       ok step 'Sanity-check installer': success
       ok step 'Upload as Actions artifact (dry run)': success
       ok step 'Upload to draft GitHub Release': not taken on a dispatch
    ok job 'build (windows-latest, …)': success
       ok step 'Cache cargo registry': success
       ok step 'Sanity-check installer': success
       ok step 'Upload as Actions artifact (dry run)': success
       ok step 'Upload to draft GitHub Release': not taken on a dispatch
    -- job 'prepare': skipped (tag-only path, expected on a dispatch)
    -- job 'publish': skipped (tag-only path, expected on a dispatch)
    dispatched desktop dry run succeeded, and reached every step that carries a bumped action

    Re-derived rather than taken from the script: `gh run view 30190355369` reports
    event `workflow_dispatch` on branch `chore/ci-actions-bump` at b48699c, the
    same commit as the Docker dry run and an ancestor of HEAD. The release path was
    not taken on either leg — `Upload to draft GitHub Release` is `skipped` in both
    jobs' step lists, and the tag-only `prepare` / `publish` jobs never started.
    Independently of the run entirely, `gh release list` returns nothing and the
    releases API returns an empty array, so no release — draft or public — exists
    in this repository at all. The two bumped actions really executed on both
    runner OSes: `actions/checkout@v7` (SHA 3d3c42e) and `actions/cache@v6`
    (SHA 55cc834) were downloaded on macos-14 and windows-latest alike, which is
    the cache-v6 debt #16 recorded. Both legs uploaded an installer artifact
    (`TongFlow-mac-universal.dmg.zip`, `TongFlow-win-x64.msi.zip`).

- eval: E8
  run_id: ci-actions-bump-r1-e8-20260726062847
  exit_code: 0
  baseline: red — a smuggled `schedule:` trigger added to docker-publish.yml is named as an offender and the script terminates unsuccessfully (see `## Analyst`)
  verifier: config:executors.script.ci_no_behaviour_drift
  verified_at: 2026-07-26T06:28:47Z
  output: |
    workflow drift vs origin/main: pins and comments only, plus the declared dry-run guard (2 push: line(s))

    Confirmed by reading the diff by hand rather than trusting the classifier.
    `git diff origin/main...HEAD -- .github/workflows` is 7 changed content lines:
    five `uses: actions/checkout@v4` → `@v7` in ci.yml, one in
    desktop-release.yml, one in docker-publish.yml, one
    `docker/login-action@v3` → `@v4`, the declared `push:` guard (one removed, one
    added), and an 8-line comment block above it. No trigger, permission, job,
    runner or input line is touched anywhere.

## Analyst

### 1. Scope of this round

Six of eight evals were observed. E2 was deferred by instruction and E3 is
transitively blocked by the same shared CI run; both are recorded above with
what IS established and what is not. **No eval was marked PASS without captured
output, and no PASS was invented for E2.**

### 2. Discrimination: every eval script was made to fail

The kit's baseline question here is not "was it red before the feature" — five
of these evals read real Actions runs that did not exist before the feature. The
useful question is whether each guard can fail at all. Each was driven into its
failure branch, against copies in a scratch directory or through a `gh` shim;
**the repository was never modified.**

- `check-action-pins.sh` — one site downgraded to v4: names the offending pin and
  terminates unsuccessfully. One checkout step deleted: "expected 7 pinned
  site(s), found 6". `login-action` at v3: named. No `.github/workflows`
  directory: declines to answer rather than passing.
- `check-docker-dryrun.sh` — `push: true` restored: "push is unconditionally
  true". `push` gated on `github.event_name == 'workflow_dispatch'` instead of
  the ref type: "push is not gated on the ref being a tag". File missing:
  declines to answer.
- `check-workflow-drift.sh` — a `schedule:` trigger smuggled into
  docker-publish.yml in a scratch clone: both added lines are printed as
  offenders. An unresolvable base ref: declines to answer.
- `check-dispatch-run.sh` — seven separate mutations of the run JSON, each caught:
  a required step removed ("the bumped action was never reached"); `Build & push`
  marked unsuccessful; `Upload to draft GitHub Release` marked as having run ("a
  dry run must not take the release path", fired on both legs); every job skipped
  ("no job in this run actually executed"); one matrix leg skipped ("expected both
  matrix legs, got 1"); the run's own conclusion flipped; and the run's head SHA
  pointed at a commit not present locally, which makes it decline to answer rather
  than pass.
- `check-ghcr-untouched.sh` — a package version dated after the run's start: named
  and unsuccessful. Only older versions: passes, correctly. API refusing for scope:
  declines to answer.

So none of the six is a rubber stamp. The remaining problems are the two below.

### 3. Sound: the dispatch check compares trees, not commits

`check-dispatch-run.sh` compares `git rev-parse <run-sha>:.github/workflows`
against `HEAD:.github/workflows` rather than comparing commits. I judge this
**sound for the claim it makes.** A git tree object is a recursive content hash,
so equal hashes mean byte-identical workflow files; comparing commits instead
would fail every time a later `_acceptance/**` (T1) commit lands, forcing a
re-dispatch of a 20-minute cross-arch build for no added signal. And when the
run's commit is not present locally the script declines to answer rather than
skipping the comparison, which is the right default.

One limit worth naming: the workflow tree is not everything a dispatched run
consumes — `docker-publish.yml` builds the repo's `Dockerfile` and source, and
`desktop-release.yml` runs `desktop/`. An identical workflow tree does not prove
identical *code*. For AC-5/AC-7, whose claim is about the bumped actions rather
than about the app, that is the right scope, and here the gap is not triggered:
the only commit between the dispatched runs and HEAD touches
`scripts/ci/check-dispatch-run.sh` and nothing else.

### 4. FALSE-PASS FOUND — the dispatch check never asserts the run's branch

`check-dispatch-run.sh` computes `BRANCH="$(git rev-parse --abbrev-ref HEAD)"`,
prints it as "branch under test", and then **never compares it to anything**.
`find_run <key> workflow_dispatch` in `gh-run-lib.sh` passes no `--branch` and no
`--commit`, so it selects the newest `workflow_dispatch` run of that workflow on
*any* branch. A dispatch fired from `main`, or from a stale sibling branch, would
be picked up and — if its `.github/workflows` tree happened to match — accepted
as evidence for this PR. The printed line reads like an assertion and is only a
label, which is exactly the shape that survives review.

The tree comparison mitigates but does not close this: two branches carrying the
same workflow files are not unusual (a rebase, or a branch cut from this one).
The fix is one line: pass `--branch "$BRANCH"` to `gh run list`. It did not bite
this round — both runs were re-confirmed by hand to be `workflow_dispatch` on
`chore/ci-actions-bump` at b48699c — but the guard is weaker than it reads.

### 5. FALSE-PASS FOUND — the GHCR check treats an unreadable package as an absent one

This is the failure mode the round-1 lesson names: a guard that announces "clean"
when it could not actually look. `check-ghcr-untouched.sh` maps any `HTTP 404` /
`Not Found` from the packages API to "no GHCR container package exists … nothing
has ever been published" and exits zero.

The token these evals run under does **not** hold `read:packages` — `gh auth
status` reports scopes `gist`, `read:org`, `repo`, `workflow`. Probed directly
this round:

    GET /users/phanlemanh/packages?package_type=container
      → HTTP 403 "You need at least read:packages scope to list packages."
    GET /users/phanlemanh/packages/container/oneflow/versions
      → HTTP 404 "Package not found."

The 403 proves the token cannot enumerate this user's packages at all, so the
404 from the sibling endpoint cannot be read as authoritative evidence of
non-existence. A package that exists **and received a version during the dry
run** would return the same 404 to this token, and the script would print
"nothing has ever been published" and exit zero. The script's own 403 branch is
correct and fires (verified via a shim), but nothing checks the token's scopes
before trusting a 404.

Two fixes, either sufficient: assert `read:packages` is present up front (`gh
auth status` output, or a probe of the list endpoint) and decline to answer
otherwise; or treat 404 as inconclusive unless a package listing has been read
successfully at least once.

**This does not change E6's verdict**, because E6 is not resting on the script's
green. AC-6 is carried by the dispatched run's own log — resolved `push: false`,
a buildx command line with no `--push` and no registry output, and a single
export stage targeting the GHA cache. That evidence is immune to the token's
scopes. But a human should read E6's green as "proved from the build log", not
"proved by the GHCR check".

### 6. Design finding — E3 is coupled to E2 through a shared run object

`check-run-jobs.sh` checks each named job and then calls `assert_run_complete`,
which requires the run's own conclusion to be success. For a script whose stated
purpose is "named jobs of a workflow run succeeded at THIS commit", that is
stronger than the claim: it makes every per-job eval on `ci.yml` fail whenever
any *other* job in the same run fails. AC-2 and AC-3 are separate criteria
precisely because they cover different jobs, and this coupling collapses them.

It is a false FAIL, not a false pass, so it is the safe direction to be wrong in
— but it is why E3 is PENDING rather than PASS this round despite all four of its
jobs being green. The narrower assertion the eval needs is that the run reached
`status: completed`; the run-level conclusion belongs in E2, which is where it is
already checked.

### 7. Minor: the dry-run guard check is a substring test

`check-docker-dryrun.sh` requires the `push:` line to contain
`github.ref_type == 'tag'`, so `push: ${{ github.ref_type == 'tag' || true }}`
would satisfy it. Noted for completeness only: the dynamic halves (E5's real
dispatch, plus the log evidence under E6) would catch that, and the current line
is exactly the contracted form.

### 8. On the `latest` tag and the metadata step

`docker/metadata-action@v5` is unchanged by this PR and is out of the contract's
scope, but its behaviour is load-bearing for AC-6 and was checked: it emitted
`type=raw,value=latest,enable=false` on the dispatch, so the dry run computed a
single `sha-b48699c` tag and no `latest`. Even had `push` been true, no floating
tag would have moved.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1 (2026-07-26T06:27–06:32Z, commit f7e0217d): six of eight evals observed,
all six exited zero. **E2 was deliberately not run**, and E3 was run but did not
exit zero for the same underlying reason.

Why E2 was deferred: the eval asserts that the `Acceptance Gate` job of `ci.yml`
concluded success. That job runs `scripts/pre-merge-check.sh`, which at this
commit reports two things — `ci-actions-bump` has no evidence report yet, and the
four already-merged features are stale until re-pinned. Both are facts about the
gate's own bookkeeping, not about `actions/checkout` or `docker/login-action`,
and both are fixed by committing this report together with the four re-pins. So
E2 is unobservable until the commit that contains this file has run through CI.
Running it now could only record the bookkeeping state, which proves nothing
about the bump. It gets its own short round once this lands.

The substantive half of AC-2 was established anyway, and is recorded in E2's
block: the Acceptance Gate job log for run 30190888234 shows `checkout@v7` with
`fetch-depth: 0` fetching `origin/main` and `pre-merge-check.sh` emitting a real
file-level diff — ten filenames, one per line — rather than failing to resolve a
base. That is what proves the checkout bump; the job's colour is not.

E3 is a second-order casualty of the same fact. Its four jobs (Lint, Type Check,
Build, SDK Tests) all concluded success at this head SHA, but the eval script
also requires the whole `ci.yml` run to be green, and that run contains the
Acceptance Gate job. E3 will be re-run alongside E2. See `## Analyst` item 6.

Two false-pass findings were recorded against the eval scripts themselves
(`## Analyst` items 4 and 5): `check-dispatch-run.sh` never asserts the
dispatched run's branch despite printing it, and `check-ghcr-untouched.sh`
reports "nothing has ever been published" on a 404 that this token — which lacks
`read:packages` — cannot distinguish from a package it is not allowed to see.
Neither changes a verdict this round, because both affected criteria were
re-derived from the runs' own logs, but both should be fixed before the evidence
is relied on again.

## Gate 2 checklist (human)

- [ ] Do NOT sign this round — it is incomplete by construction. E2 and E3 have
      no result yet.
- [ ] Read E6's block: its green came from the GHCR check's weakest branch, and
      the criterion is carried instead by the build log (`push: false`, no
      `--push`, export to the GHA cache only)
- [ ] Decide whether the two false-pass findings in `## Analyst` (items 4 and 5)
      are fixed in this PR or tracked separately
- [ ] After this lands and CI re-runs, verify E2 and E3 in a short follow-up
      round, then fill the signature field in frontmatter +
      `time_human_minutes.gate2` in the contract
