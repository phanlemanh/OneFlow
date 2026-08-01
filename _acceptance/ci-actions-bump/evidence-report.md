---
schema_version: 2
feature_slug: ci-actions-bump
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 9)
enforcement_mode: strict
bypass_used: false
verified_commit: c000b4b6b32f29eea6217f8de26596a052737128
human_signoff: Manh 2026-07-26
---

# Evidence Report: ci-actions-bump

Round 6 was the last full re-verification, at commit 572cb98: all eight evals
executed, all eight exited zero, each with captured output below. Five earlier
rounds each found a defect in these eval scripts, so that round assumed a sixth
crop existed and went looking for it. Round 8 is a carry-forward re-pin on top of
it — see `## Iterations` for exactly which evals ran again at commit 8254c0bd and
which three could not be evaluated on this branch.

Round 5's fix was re-driven with the exact mutation that defeated the previous
version — including the variant where the concealment predates the branch, which
is the case that had defeated both E1 and E8 — and it holds (Analyst item 3).

No false pass was found: every criterion was checked against primary sources and
all eight are true on this tree. The mutation matrix did surface a bounded limit
on what a green E1 or a green E8 establishes in isolation, which the suite covers
through the tree-provenance pin in E5, E6 and E7. That is written up in Analyst
item 4, with two cheap hardenings for the human to accept or track.

Nothing was taken on trust from the previous rounds. Every `cmd` was resolved
line by line against `_acceptance/config.yaml`; four criteria were additionally
re-derived from primary sources — the dispatched run's own job log, the run
objects, the workflow files, and the git diff — independently of the script that
reports them.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: ci-actions-bump-r10-E1-20260727105026
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_actions_pinned
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ok actions/checkout: 7 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

    Re-derived independently of the script this round: `grep -rn 'uses:' .github/workflows` lists exactly seven `actions/checkout@v7` sites — ci.yml lines 18, 42, 63, 84, 102; desktop-release.yml line 61; docker-publish.yml line 23 — and one `docker/login-action@v4` at docker-publish.yml line 32. AC-1 is true on this tree as written. Round 5's `sed` fix was re-driven against the concealment that defeated the previous version, including the variant where it predates the branch; it holds (Analyst item 3). Analyst item 4 records what a green E1 still does not establish.

- eval: E2
  run_id: ci-actions-bump-r9-E2-20260726154143
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_gate_plumbing
  verified_at: 2026-07-26T15:41:43Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30207732088 @ 66f804306fb83fc12d5ed32e37031dac406068d6
    ok  checkout ran with fetch-depth: 0
    ok  the checkout under test is v7
    ok  pre-merge-check emitted 6 per-feature verdict line(s)
    ok  no shallow-history or unresolvable-base complaint anywhere in the log
    fetch-depth: 0 under checkout@v7 gave pre-merge-check.sh a usable base at 66f804306fb83fc12d5ed32e37031dac406068d6

    Re-read on this branch's own CI run at HEAD. The run's overall conclusion is not success, and that is expected: the Acceptance Gate job reports bookkeeping state, now for six features, one of them the feature under review on this branch awaiting its own signature. That is precisely why AC-2 was narrowed — see Analyst item 7. What this eval asserts is the plumbing: checkout@v7 ran with fetch-depth: 0 and pre-merge-check reached acceptance logic, emitting six real per-feature verdict lines with no shallow-history or unresolvable-base complaint.

- eval: E3
  run_id: ci-actions-bump-r9-E3-20260726154149
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_jobs_green
  verified_at: 2026-07-26T15:41:49Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30207732088 @ 66f804306fb83fc12d5ed32e37031dac406068d6
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    all requested jobs succeeded at 66f804306fb83fc12d5ed32e37031dac406068d6

    Re-derived from the run object: the four named jobs each carry conclusion `success` at this head SHA under the node24 runtime. The run as a whole concluded otherwise because of the Acceptance Gate job, which this eval deliberately does not depend on — `assert_run_finished`, not `assert_run_complete`.

- eval: E4
  run_id: ci-actions-bump-r10-E4-20260727105026
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_docker_dryrun_guard
  verified_at: 2026-07-27T10:50:26Z
  output: |
    dry-run guard present:          push: ${{ github.ref_type == 'tag' }}
    a workflow_dispatch run builds both platforms and publishes nothing

    Static half of AC-4. The dynamic half is E5/E6: an actual dispatched run that succeeded and wrote nothing. Five mutations of this guard were driven this round and all five are caught or declined (Analyst item 2).

- eval: E5
  run_id: ci-actions-bump-r6-e5-20260726085907
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_docker_dispatch_green
  verified_at: 2026-07-26T08:59:07Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190339168
      branch under test: chore/ci-actions-bump   run head: b48699c612fab479deede3d7d1d9959e110d7335
      workflow tree matches HEAD: c2bd8c61cfc2a159cd3287783e750dfd72ce02b9
    ok job 'Build & push (amd64 + arm64)': success
       ok step 'Set up QEMU': success
       ok step 'Log in to GHCR': success
       ok step 'Build & push': success
    ok  linux/amd64 build stages present in the log
    ok  linux/arm64 build stages present in the log
    dispatched docker dry run succeeded, and reached every step that carries a bumped action

    Re-derived from the run's own log independently of the script: the buildx invocation carries `--platform linux/amd64,linux/arm64`, and `docker/login-action@v4` ran against ghcr.io and reported success — the login that covers PR #2. Nothing outside `_acceptance/` and `scripts/ci/` differs between the dispatched run's commit b48699c and HEAD, so the tree-only provenance pin is sound here: the Dockerfile and every other build input are byte-identical to what the dry run built.

- eval: E6
  run_id: ci-actions-bump-r6-e6-20260726085913
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_ghcr_untouched
  verified_at: 2026-07-26T08:59:13Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190339168 (started 2026-07-26T06:01:26Z)
    ok  run's workflow tree matches HEAD
    ok  runner resolved 'push: false'
    ok  no registry write anywhere in 3575 log lines
    ok  buildx invoked without --push
    --  registry cross-check unavailable: the token cannot read packages.
        Not treated as evidence either way — a 404 from the versions endpoint
        is indistinguishable from a package this token simply cannot see.
    no publish occurred during the dry run

    The registry cross-check is correctly declined: this token cannot read packages, and a 404 from it would be indistinguishable from absence. The criterion rests on the log half, which was independently rebuilt from run 30190339168's log this round without reference to any script in this suite — see Analyst item 6.

- eval: E7
  run_id: ci-actions-bump-r6-e7-20260726085921
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_desktop_dispatch_green
  verified_at: 2026-07-26T08:59:21Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190355369
      branch under test: chore/ci-actions-bump   run head: b48699c612fab479deede3d7d1d9959e110d7335
      workflow tree matches HEAD: c2bd8c61cfc2a159cd3287783e750dfd72ce02b9
    ok job 'build (macos-14, --targets universal --camera --microphone --user-agent "Mozilla/5.0 (Macintosh; ...': success
       ok step 'Cache cargo registry': success
       ok step 'Sanity-check installer': success
       ok step 'Upload as Actions artifact (dry run)': success
       ok step 'Upload to draft GitHub Release': not taken on a dispatch
    ok job 'build (windows-latest, --targets x64, *.msi, TongFlow-win-x64.msi)': success
       ok step 'Cache cargo registry': success
       ok step 'Sanity-check installer': success
       ok step 'Upload as Actions artifact (dry run)': success
       ok step 'Upload to draft GitHub Release': not taken on a dispatch
    -- job 'prepare': skipped (tag-only path, expected on a dispatch)
    -- job 'publish': skipped (tag-only path, expected on a dispatch)
    dispatched desktop dry run succeeded, and reached every step that carries a bumped action

    Both matrix legs ran and both uploaded an artifact; the tag-only `prepare` and `publish` jobs were skipped, and the release-upload step was not taken in either leg. That is the dry run working, and it covers the cache@v6 debt from #16 on the two runner OSes ci.yml never touches.

- eval: E8
  run_id: ci-actions-bump-r10-E8-20260727105026
  exit_code: 0
  baseline: red — failure branches driven on `--no-hardlinks` scratch clones and through a `gh` double at round 8; carried forward, NOT re-measured this round (see Analyst item 2 and `## Iterations`)
  verifier: config:executors.script.ci_no_behaviour_drift
  verified_at: 2026-07-27T10:50:26Z
  output: |
    no workflow changes vs origin/main

    The output changed shape this round because the feature is merged: on `feat/oneflow-plugin-prefix` the 16 declared pin lines and the dry-run guard are already in `origin/main`, so the diff under `.github/workflows` is empty and the guard reports the strongest possible form of "no behaviour drift". Re-derived from the diff by hand: `git diff --name-only origin/main...HEAD -- .github/workflows` prints nothing, and the round-6 finding — every changed line was one of the 16 declared pin lines (`actions/checkout` v4→v7 at seven sites, `docker/login-action` v3→v4 at one, counted as removed+added), a comment, or the one declared guard line pair — is what landed on main unchanged.

## Analyst

### 1. Scope of this round

Round 6 was a full round: all eight evals were executed against the working tree
at commit 572cb98 and all eight exited zero, each with captured output above.
Round 8 re-ran five of them at commit 8254c0bd, all zero; the three that read a
dispatched workflow run could not be evaluated on this branch and keep their
round-6 evidence (see `## Iterations`).
Every `cmd` was resolved line by line against `_acceptance/config.yaml` before it
was run. `enforcement_mode` is `strict`, read from that file.
`ACCEPTANCE_GATE_BYPASS` was checked with `printf '%s'` and prints nothing, so
`bypass_used` is false. No verdict here rests on an eval script alone: AC-6 was
rebuilt from run 30190339168's log without reference to any script in this
suite, and AC-1, AC-5 and AC-8 were re-derived from the workflow files, the run
objects and the git diff.

Five prior rounds each found a false pass in these scripts. This round assumed a
sixth existed and went looking. What it found is recorded in item 4: not a new
defect introduced since round 5, but a limit on how much a green E1 or a green E8
can carry on its own, which the suite covers through a different eval.

### 2. Discrimination: every script and every helper was driven into failure again

Five of these evals read real Actions runs that did not exist before the feature,
so "was it red beforehand" is not an available baseline. The useful question is
whether each guard can fail at all, and whether it fails for the right reason.
Fifty-eight mutations and probes were driven this round.

**Method, and the safety rule it respects.** The repository working tree was
never modified and no commit was made in it. A `--no-hardlinks` clone was made in
a scratch directory outside the repo; every workflow, diff and rename mutation
was committed and reset there, always against a fixed SHA rather than a branch
name — an early probe in this round reset to a branch ref it had itself moved,
which leaked one mutation into the next, and was redone. Another probe's `sed`
matched nothing; the report of "nothing to commit" caught it and it too was
redone. Both are recorded because a mutation that does not land reads exactly
like a guard that does not fire.

The `gh`-backed scripts were driven through a `gh` test double written for this
round and placed on `PATH` — deliberately not the one a previous round left in
the scratch directory, which was read but not used. It was seeded with run JSON
and job logs captured from the real runs, and before any mutation was applied the
unmutated double was checked to reproduce the real output of
`check-gate-plumbing.sh`, `check-run-jobs.sh`, `check-dispatch-run.sh` (both
keys) and `check-ghcr-untouched.sh`, so a difference later in the matrix is
attributable to the mutation and not to the harness.

- `check-action-pins.sh` (6 probes) — the `.github/workflows` directory absent;
  one checkout site downgraded to v4; the login pin removed entirely; the round-5
  concealment (a site deleted in one file, a trailing comment naming the pin
  added in another); the same concealment planted so that it predates the branch;
  and a decoy hidden inside a YAML block scalar. Five are named and terminated
  unsuccessfully or declined. The sixth is item 4.
- `check-docker-dryrun.sh` (5 mutations) — the file missing; `push: true`
  restored; `push` hardcoded to `false` rather than gated on the ref; the `push:`
  input deleted; a second valued `push:` input added. All caught or declined.
  Note the third: a bare `false` fails too, because a guard that never publishes
  would break the real tag release.
- `check-workflow-drift.sh` (10 mutations) — an unresolvable base ref; a
  permissions block added; a pin repointed to `@main`; an out-of-scope action
  bumped; a workflow file added; `ci.yml` deleted; the guard line duplicated; a
  guard-shaped line planted in the wrong file; a pure 100%-similar rename; and
  the no-change early return. Nine terminate unsuccessfully naming the offending
  line or file; the unresolvable base and the genuine no-change case are declined
  and passed respectively, both correctly. The rename is worth noting because the
  line loop cannot see it at all — git emits header lines but no `+`/`-` content
  — so the `--name-status` check is what catches it.
- `check-run-jobs.sh` (5 probes) — a named job unsuccessful; a named job absent;
  the run still in flight; `run_json` failing; a job name that does not exist.
  All caught or declined.
- `check-dispatch-run.sh` (13 probes across both keys) — `run_json` failing; the
  run in flight; the run concluded unsuccessfully; no jobs; every job skipped; a
  required step absent; a required step unsuccessful; a run head SHA git cannot
  resolve; a run whose `.github/workflows` tree differs from HEAD's; only one
  architecture in the log; the log unreadable; only one desktop matrix leg; and
  the release-upload step marked as having run on a dispatch. All caught or
  declined.
- `check-ghcr-untouched.sh` (13 probes) — the runner resolving `push: true`; a
  `pushing manifest` line injected; buildx invoked with `--push`; the resolved
  input absent from the log; no buildx invocation; a log too short to have built
  anything; the log unreadable; the run in flight; a differing workflow tree;
  and, against a token that CAN read packages, a version created after the run
  started, a package genuinely absent, only pre-existing versions, and a non-404
  error from the endpoint. All caught or declined; the three innocent shapes
  correctly pass and the non-404 error is reported as inconclusive rather than
  as a clean bill.
- `gh-run-lib.sh` (6 probes, plus the paths exercised above) — `require_gh` with
  `gh` absent from `PATH` and with `gh` unauthenticated; `workflow_file` with an
  unknown key; `find_run` with `gh run list` failing, with zero runs returned,
  and with an unknown key called directly. Every one refuses rather than passing.
  `find_run`'s unknown-key path is worth its own line: it returns 2 *and* prints
  the sentinel `UNKNOWN_WORKFLOW_KEY`, so even inside a command substitution —
  where `exit` would not propagate — the caller receives a poisoned value rather
  than an empty string that would query `gh run list --workflow ""`. That was
  confirmed by tracing the double: every call site passes a non-empty
  `--workflow`.

### 3. Round 5's fix holds, including the predates-the-branch variant

Round 5's finding was that `check-action-pins.sh` extracted pins with `grep -o`,
which emits every occurrence on a line, so a trailing comment naming the action
inflated the site count and could pay for a step deleted elsewhere. The fix
replaced the extraction with `sed`, taking only the token immediately after
`uses:`.

Both were re-driven by reproducing the mutation, not by reading the diff.

1. **The plain concealment.** A checkout step was deleted from
   `desktop-release.yml` and a trailing `# mirrors actions/checkout@v7 in ci.yml`
   was appended to a surviving `uses:` line in `ci.yml`. The mutation was
   confirmed to have landed: the raw text `actions/checkout@v7` still occurs
   seven times across the directory, which is exactly what the old extraction
   counted. The check now reports six sites and terminates unsuccessfully.
   **Fixed.**
2. **The variant that predates the branch.** This is the case round 5 recorded as
   defeating both E1 and E8, so it was built properly: the deletion and the decoy
   were committed to a synthetic `main`, and the bump was applied on a branch off
   it, so the concealment appears in neither the branch's diff nor E8's view. Two
   shapes were driven. In the first the decoy sat on a line the branch also
   touches, and both evals objected. In the second — the honest test — the decoy
   was placed on a `pnpm/action-setup@v4` line the branch never touches, so E8's
   diff is genuinely clean and E8 passes, correctly, because nothing drifted on
   the branch. E1 is then the sole guard, and E1 terminates unsuccessfully with
   "expected 7 pinned site(s), found 6". **The fix holds where it matters: E1 is
   tree-absolute and does not depend on the diff at all.**

### 4. What a green E1 and a green E8 still do not establish

No false pass was found in the sense of an eval reporting green about a claim
that is false on this tree. Every criterion was checked against primary sources
and all eight hold. What the mutation matrix did surface is a bounded limit on
two evals, which is recorded here rather than left for a seventh round to find.

**E1 is a grep, not a YAML parser.** Its anchored pattern rejects a comment line
and, since round 5, a trailing comment on a real line. It does not reject a
`uses:`-shaped line inside a block scalar. Planting

        run: |
          - uses: actions/checkout@v7

and deleting a real site leaves E1 counting seven and reporting clean.

**E8 pairs pin lines but does not check parity.** A removed `-actions/checkout@v4`
with no matching `+` still classifies as a declared bump, so a silently dropped
site reads as part of the bump. The tell is visible in E8's own summary line: the
clean tree reports 16 declared pin lines, an even number because pins move in
removed/added pairs, while the tree with a dropped site reports 15. The script
does not test that.

Combine the two — decoy planted on `main`, site silently dropped on the branch —
and **both E1 and E8 report clean**. That was driven, not reasoned about.

**Why this is not a false pass for the feature.** The suite does not rest on
those two. The dropped site changes `.github/workflows`, so the tree-provenance
pin in E5, E6 and E7 no longer matches the dispatched runs, and all three
terminate unsuccessfully — driven and confirmed. Re-dispatching does not rescue
it either: a `desktop-release.yml` with no checkout step cannot build, and a
`ci.yml` job with no checkout cannot pass, so E7 or E3 fails at the head SHA. The
defence in depth is real, and it is what makes this a hardening note rather than
a defect in the verdict.

Two cheap hardenings, if the human wants them in this PR rather than tracked:
assert `declared_pins` is even in `check-workflow-drift.sh`, and count a site in
`check-action-pins.sh` only when it parses as a step rather than as text.

### 5. No other false pass was found

The remaining seven scripts were read line by line against the shapes that
defeat this kind of guard, and nothing else survived.

- **SIGPIPE under `pipefail`.** Three scripts carry an explicit comment about
  `grep -q` closing the pipe and making a successful match read as a miss. Every
  `grep` in a `printf | grep` pipeline is written without `-q`, checked across
  all eight files.
- **"Could not look" is never "looked and it was fine".** Every unreadable log,
  unresolvable ref, missing run, failed API call and absent directory exits 2,
  distinct from both the pass and the fail paths. Fifteen such paths were driven
  and every one declined.
- **A run at the wrong tree.** E2 and E3 pin to the head SHA; E5, E6 and E7 pin
  the run's `.github/workflows` tree to HEAD's. The tree comparison rather than a
  SHA comparison is deliberate and correct: later commits on this branch add
  `_acceptance/**` evidence, which must not invalidate a dry run that exercised
  identical workflow content. It was verified that nothing outside `_acceptance/`
  and `scripts/ci/` differs between the dispatched runs' commit and HEAD, so the
  narrower pin gives up nothing here.
- **A green run that never reached the action.** `check-dispatch-run.sh` checks
  each required step by name and refuses a run in which every job skipped; both
  were driven.
- **The advisory that looks like guilt.** `check-ghcr-untouched.sh` filters
  `WARNING:` before scanning for push activity, because buildx emits an advisory
  naming `--push` precisely when it did *not* push. Confirmed against the real
  log, where that warning is the only occurrence of the string.
- **A registry answer the token cannot give.** The corroborating half declines
  when the scope is missing rather than reading a 404 as absence, and reports a
  non-404 error as inconclusive. Both were driven.

### 6. AC-6 re-derived from run 30190339168's log, independently of any script here

Read straight from the job log, without running or consulting
`check-ghcr-untouched.sh`:

1. The action's own resolved-input echo reports `push: false`.
2. The buildx command line carries `--platform linux/amd64,linux/arm64`,
   `--cache-from`, `--cache-to`, `--iidfile`, `--metadata-file`, labels and a
   `--tag`. It carries **no** `--push` and **no** `--output type=registry`. A
   `--tag` names an image; it does not publish one.
3. A search of all 3,575 log lines for `pushing manifest`, `pushing layer`,
   `exporting to image`, `exporting to registry` and `--output type=registry`
   returns nothing.
4. The single occurrence of the string `--push` anywhere in the log is buildx's
   own advisory: no output was specified with the docker-container driver, so the
   build result remains in the build cache. That is positive evidence of the
   absence of a push, and it is the line a naive textual scan would misread as
   guilt.
5. The run is `completed` / `success`, event `workflow_dispatch`, head
   b48699c — the guard was exercised on the workflow content being merged.

AC-6 holds. The registry-side corroboration is unavailable to this token and is
correctly not claimed in either direction.

### 7. Judgement on the contract's AC-2 amendment

The amendment is recorded in the contract and is sound. AC-2 as originally
written required the `Acceptance Gate` job to pass. That job runs the acceptance
gate, so its colour is dominated by acceptance bookkeeping: a feature awaiting
its Gate 2 signature keeps it red however well git behaved. Evidence must exist
before the signature, so a criterion satisfiable only after it is circular. The
narrowed form — the gate reached acceptance logic, meaning the base resolved and
real per-feature verdicts came out — is exactly what a checkout bump can be held
to, and this round observed five such verdict lines with no plumbing complaint.

Three caveats for the human, unchanged from the previous round and still true:
the amendment narrows a criterion already approved at Gate 1; the Acceptance Gate
job's colour is now covered by no eval and is enforced only by the merge itself;
and `check-gate-plumbing.sh` uses `assert_run_finished` rather than
`assert_run_complete`, which is what lets E2 and E3 pass on a run whose overall
conclusion is not success. That is deliberate and documented in both scripts, but
it is the kind of choice a human should ratify rather than inherit.

## Variance

none — no eval declares runs > 1

## Iterations

Round 1 (2026-07-26T06:27–06:32Z, commit f7e0217d): six of eight evals observed,
all six exited zero. **E2 was deliberately not run**, and E3 was run but did not
exit zero for the same underlying reason.

Why E2 was deferred: the eval as then written asserted that the `Acceptance Gate`
job of `ci.yml` concluded success. That job runs `scripts/pre-merge-check.sh`,
which at that commit reported two things — `ci-actions-bump` had no evidence
report yet, and the four already-merged features were stale until re-pinned. Both
are facts about the gate's own bookkeeping, not about `actions/checkout` or
`docker/login-action`.

E3 was a second-order casualty of the same fact: its four jobs all concluded
success at that head SHA, but the eval script also required the whole `ci.yml`
run to be green, and that run contains the Acceptance Gate job.

Round 1 also recorded three findings against the eval scripts themselves: the
dispatch check never asserted the dispatched run's branch despite printing it;
the GHCR check reported "nothing has ever been published" on a 404 that a token
without `read:packages` cannot distinguish from a package it may not see; and
`check-run-jobs.sh` was coupled to sibling jobs it does not claim anything about.

Round 2 (commits 42b43fc9 → f2928c05): AC-2 was narrowed by contract amendment
and re-bound to a new eval key, `config:executors.script.ci_gate_plumbing`; the
three round-1 findings were acted on; and a fresh-context verifier drove roughly
forty mutations and reported three survivors — the pin check counting the bare
string, the drift check's file-agnostic `push:` budget, and `workflow_file`'s
unreachable refusal. A platform assertion was added to `check-dispatch-run.sh`,
because AC-5 had always claimed both architectures were built and nothing checked
it.

Round 3 (2026-07-26T07:25–07:27Z, commit f2928c05): **complete round, verdict
PASS.** All eight evals executed, all eight exited zero, every one with captured
output above. Roughly fifty mutations were driven, entirely outside the
repository working tree — a scratch clone for the file- and diff-based checks, a
`gh` test double seeded with fixtures from the real runs for the rest. No probe
commit touched the repository or its history.

All four fixes claimed for f2928c05 were re-driven with the exact mutations that
defeated the previous versions, and all four hold (`## Analyst` item 3). The
three round-1 findings were re-tested and all three are closed.

A third crop of defects was found, as expected. The substantive one is in
`## Analyst` item 4: `check-workflow-drift.sh` allows any `uses:` line change
through without pairing removals to additions, so inserting an entirely new
action step, swapping a pin to a different publisher, or deleting an existing
step's pin all pass as "pins and comments only" — and the first of those is
caught by **no** eval in this suite. AC-8's verdict is unaffected because the
criterion was established by hand from the actual 26-line diff, but the guard is
materially weaker than the criterion it stands for and should be fixed before it
is relied on as a standing check. A latent defect is recorded in item 5: round
2's third fix was applied at the call sites, not in `gh-run-lib.sh`, whose own
refusal path is still unreachable from a command substitution.

Five criteria were re-derived from primary sources independently of the scripts:
AC-1 from `grep` over the workflow files, AC-2 and AC-6 from the runs' own job
logs, AC-7 from `gh release list` and the run's artifact list, and AC-8 from the
git diff line by line.

This round also carried forward the four merged features' signatures onto
f2928c05 — see each of their reports' `## Iterations`. Ownership was checked, not
assumed: the only non-`_acceptance/` files differing from `origin/main` are the
three workflows and the eight `scripts/ci/*.sh`, all owned by this feature, so
none of the four owns a changed file. The shared standing checks were each run
ONCE and credited to every covering eval with a distinct `run_id`.

Round 4 (2026-07-26T07:58–08:00Z, commit a751b5f): **complete round, verdict
PASS.** All eight evals executed, all eight exited zero, every one with captured
output above. Around eighty mutations and probes were driven, entirely outside
the repository working tree — a scratch `--no-hardlinks` clone for the file- and
diff-based checks, a freshly written `gh` test double seeded with fixtures from
the real runs for the rest. No probe commit touched the repository or its
history, and every mutation was verified to have actually changed its target
before its result was believed (two silent no-ops in the first pass would each
have read as a false pass).

All three fixes claimed for a751b5f were re-driven with the exact mutations that
defeated the previous versions, and all three hold (`## Analyst` item 3): the
drift check now pairs additions to removals by action path, `find_run` resolves
its workflow key inline so `--workflow` is never empty, and
`check-ghcr-untouched.sh` pins its run to HEAD's `.github/workflows` tree. Round
3's latent defect is closed (item 5), and round 3's "E6 does not pin the run
tree" residual is closed too.

A fourth crop was found, as expected, and it is the same shape one level down
(`## Analyst` item 4): the drift check pairs on the action **path** and discards
everything after the `@`, so any change to what a `uses:` line resolves to passes
as a matched pair. Repointing `docker/setup-buildx-action@v3` to `@main` — a
mutable branch, and a standing supply-chain change — passes E8 clean and is
caught by no other eval in this suite, because E1 floors only `actions/checkout`
and `docker/login-action`. Silently bumping `actions/setup-node@v4` to `@v99`,
which the contract's "Out of scope" section names as an action not to be bumped
alongside, likewise passes. Two narrower residuals are recorded with it: a pure
rename or move of a workflow file is invisible to both E8 and E1 (moving `ci.yml`
into a subdirectory disables CI and both still report clean), and one exact `--`
line shape still reaches the `---` file-header arm. AC-8's verdict is unaffected,
because the criterion was established by hand from the actual 26-line diff, but
E8's green means "this diff was classified", not "this guard would have stopped a
behaviour change".

Six criteria were re-derived from primary sources independently of the scripts:
AC-1 from `grep` over the workflow files, AC-2 and AC-6 from the runs' own job
logs, AC-3 from the run object's job conclusions, AC-7 from the releases and
artifacts APIs, and AC-8 from the git diff line by line. AC-6 in particular was
rebuilt from run 30190339168's log without reference to any script here — five
independent observations, listed in E6's block.

This round also carried the four merged features' signatures forward onto
a751b5f — see each of their reports' `## Iterations`. Ownership was checked, not
assumed: `git diff --name-only f2928c05 HEAD` with `_acceptance/` excluded lists
exactly three files, all `scripts/ci/*.sh` owned by this feature; against
`origin/main` the branch's non-`_acceptance` footprint is the three workflows
plus the eight `scripts/ci/*.sh`, again all this feature's. None of the four owns
a changed file, and the standing checks are green, so both carry-forward
conditions in AGENTS.md hold. Each shared standing check was executed ONCE and
credited to every covering eval with its own distinct `run_id`.

Round 5 (2026-07-26T08:30–08:32Z, commit 73a8d93): **complete round, verdict
PASS.** All eight evals executed against this tree, all eight exited zero, every
one with captured output above. Sixty-two mutations and probes were driven,
entirely outside the repository working tree — two `--no-hardlinks` scratch
clones for the file-, diff- and rename-based checks, and a freshly written `gh`
test double seeded with fixtures from the real runs for the rest. The double was
verified to reproduce the real output before any mutation was applied. No probe
commit touched the repository or its history.

Both fixes claimed for this HEAD were re-driven with the exact mutations that
defeated the previous version, and both hold (`## Analyst` item 3). The drift
check now pairs on the whole pin: `docker/setup-buildx-action@v3` → `@main`,
`actions/setup-node@v4` → `@v99` and `actions/checkout@v7` → `@v4.9.9-evil` all
terminate unsuccessfully, and so do five further shapes added this round,
including a checkout pin taken to `v8` — above E1's floor, so E1 alone would not
object. The rename hole is closed too: five shapes were driven (rename in place,
move into a subdirectory, delete, move out of the directory, add a new file) and
all five fail, the pure rename via the new `--name-status` check, which is the
only thing that can see it.

A fifth crop was found, as the round assumed one would be, and it is the same
shape one level down again (`## Analyst` item 4). `check-action-pins.sh` anchors
its *line* match — round 3's fix, and it works — but extracts pins with `grep
-oE`, which emits every occurrence on a matched line, so the site count counts
occurrences rather than sites. A trailing comment naming the pin on a surviving
`uses:` line therefore pays for a site deleted elsewhere. Driven in the scratch
clone: with the `actions/checkout` step removed outright from `docker-publish.yml`
and a comment appended to the surviving checkout line in `desktop-release.yml`,
E1 exits zero and reports "7 site(s), all >= v7" on a tree with six. It is
precisely the substitution the script's own comment says it exists to catch,
relocated from a standalone comment to a trailing one.

On this PR's diff E8 does catch it, because the commented line is a changed
`uses:` line that is not a declared bump. But that is a property of the diff, not
of AC-1, which is a whole-tree claim with E1 as its only eval; E8 is scoped to
`BASE...HEAD` and says nothing about the base. This was demonstrated rather than
argued — a second scratch clone whose base already carries the deletion and the
comment produces exit zero from **both** E1 and E8 on a tree where
`docker-publish.yml` has no checkout step at all. AC-1's verdict is unaffected:
it was re-derived by hand from the workflow files this round, and the seven sites
and the login site are all genuinely present at or above the floor. What a green
E1 does not establish is that it would still be true after an edit.

Four criteria were re-derived from primary sources independently of the scripts:
AC-1 from `grep` over the workflow files, AC-5 and AC-6 from run 30190339168's
own 3,576-line job log, and AC-8 from the git diff. AC-6 in particular was
rebuilt without reference to any script here — five independent observations,
including buildx's own statement that the result stayed in the build cache and
the fact that the single `exporting to …` stage in the whole log is the GitHub
Actions Cache. The AC-2 amendment was judged on its merits and is recommended for
acceptance, with three caveats for the human (`## Analyst` item 7).

This round also carried the four merged features' signatures forward onto
73a8d93 — see each of their reports' `## Iterations`. Ownership was checked, not
assumed: `git diff --name-only origin/main...HEAD` with `_acceptance/` excluded
lists exactly eleven files, the three under `.github/workflows/` and the eight
under `scripts/ci/`, every one of them owned by this feature. None of the four
merged features owns a changed file — nothing under `src/db/`, `src/lib/task/`,
`drizzle/`, `src/lib/measure/`, `scripts/measure/`, `sdk/`,
`scripts/publish-tongflow-pypi.sh`, `package.json`, `pnpm-lock.yaml`,
`biome.json` or `scripts/deps/` — and the standing checks are green, so both
carry-forward conditions in AGENTS.md hold. All 53 of their evals were re-executed
anyway, and all 53 are green. Each shared standing check was executed ONCE and
credited to every covering eval under its own distinct `run_id`; across the four
reports the 53 evidence blocks carry 53 distinct ids. Where a named per-test line
is quoted, it was re-matched against this round's verbose output rather than
copied forward.

Round 6 (2026-07-26T08:58–08:59Z, commit 572cb98): full re-verification. All
eight evals executed, all eight exited zero. `enforcement_mode` strict,
`bypass_used` false — `ACCEPTANCE_GATE_BYPASS` checked with `printf '%s'` and
prints nothing. Every `cmd` re-resolved against `_acceptance/config.yaml` line by
line before it was run.

Fifty-eight mutations and probes were driven, on a `--no-hardlinks` scratch clone
outside the repository and through a `gh` double written for this round rather
than inherited from the scratch directory. Every eval script and every
`gh-run-lib.sh` helper reached its failure branches. Two probes were caught not
having landed — one `sed` matched nothing, one reset used a branch ref it had
itself moved — and both were redone; they are recorded in `## Analyst` item 2
because a mutation that does not land is indistinguishable from a guard that does
not fire.

Round 5's `check-action-pins.sh` fix was re-driven against the concealment that
defeated its predecessor and holds, including the predates-the-branch variant
built two ways: with the decoy on a line the branch also touches, and — the
honest test — on a line it never touches, where E8's diff is genuinely clean and
E1 is the sole guard. E1 catches it, because it is tree-absolute (`## Analyst`
item 3).

No false pass was found. `## Analyst` item 4 records a bounded limit instead: E1
is a grep rather than a YAML parser, so a `uses:`-shaped line inside a block
scalar counts as a site, and E8 pairs pin lines without checking parity, so a
lone removal reads as a declared bump. Combined and planted so as to predate the
branch, both report clean. The suite still catches it — the tree-provenance pin
in E5, E6 and E7 fails, which was driven and confirmed — so this is a hardening
note, not a defect in the verdict. AC-6 was independently rebuilt from run
30190339168's log, five observations, without reference to any script here.

This round also carried the four merged features' signatures forward onto
572cb98 — see each of their reports' `## Iterations`. Ownership was checked, not
assumed: `git diff --name-only origin/main...HEAD` with `_acceptance/` excluded
lists exactly eleven files, the three under `.github/workflows/` and the eight
under `scripts/ci/`, every one of them owned by this feature. None of the four
merged features owns a changed file — nothing under `src/db/`, `src/lib/task/`,
`drizzle/`, `src/lib/measure/`, `scripts/measure/`, `sdk/`,
`scripts/publish-tongflow-pypi.sh`, `package.json`, `pnpm-lock.yaml`,
`biome.json` or `scripts/deps/` — and the standing checks are green, so both
carry-forward conditions in AGENTS.md hold. All 53 of their evals were re-executed
anyway, and all 53 are green. Each shared standing check was executed ONCE and
credited to every covering eval under its own distinct `run_id`; across the four
reports this round's evidence blocks carry 53 distinct ids. Where a named
per-test line is quoted, it was re-matched against this round's verbose output
rather than copied forward, and six millisecond durations that had drifted were
corrected to this round's actual values.

Round 7 (2026-07-26T13:52–14:00Z, commit 5975bb4): **carry-forward re-pin —
no fresh Gate-2 signature.** Re-pinned because the `oneflow-plugin-prefix` work
landed on this branch after round 6 and `stale_files` compares the whole tree
against `verified_commit`.

The tree changed only where `oneflow-plugin-prefix` owns it. `git diff --name-only
origin/main...HEAD`, with `_acceptance/**` removed, lists six files:
`docs/plugins.md`, `scripts/plugins/check-prefix-docs.sh`,
`scripts/plugins/check-no-config-drift.sh`, `src/lib/plugins/plugin-id.ts`,
`src/lib/plugins/plugin-id.test.ts` and `src/lib/plugins/plugins-install.server.ts`.
Every one belongs to that feature; none falls in this feature's ownership set. This feature owns `.github/workflows/**` and `scripts/ci/**`; neither
appears in the diff. The workflow directory is byte-identical across the whole
question: `git rev-parse HEAD:.github/workflows`, `origin/main:.github/workflows`
and `572cb98:.github/workflows` all resolve to tree c2bd8c6.

**Five of the eight evals were re-run on this tree and all five exited zero** —
E1 `ci_actions_pinned` (checkout at or above v7 across 7 sites), E2
`ci_gate_plumbing`, E3 `ci_jobs_green` (Lint, Type Check, Build and SDK Tests
all succeeded on the Actions run for this very commit), E4
`ci_docker_dryrun_guard` and E8 `ci_no_behaviour_drift`.

**E5, E6 and E7 were not evaluable on this branch and are NOT re-run this
round.** Those three read a real `workflow_dispatch` run of `docker-publish.yml`
or `desktop-release.yml` for the current branch; no such run exists for
`feat/oneflow-plugin-prefix`, and each script correctly refused to answer rather
than reporting anything. Producing one would mean dispatching release workflows,
which is a side-effectful action outside a verifier's remit and was not
performed. Their evidence rows therefore keep their round-6 `run_id`s and
timestamps unchanged, and rest on the fact established above — the
`.github/workflows` tree they exercised at 572cb98 is the identical tree being
merged here. AGENTS.md's carry-forward rule asks for the standing checks plus a
merged feature's own evals "when cheap"; a dispatched CI run is not cheap, and
the substance those three prove has not moved.

The three shared standing checks were each executed ONCE for the whole PR and
credited to every feature and eval that binds them, under a distinct `run_id`
per eval — `pnpm build && pnpm typecheck` at 2026-07-26T13:52:28Z,
`pnpm lint:check` at 2026-07-26T13:55:47Z (398 files, no fixes) and `pnpm test`
at 2026-07-26T13:55:54Z (22 files, 270 tests). `cd sdk && pytest` ran once at
2026-07-26T13:59:51Z (66 tests). No eval shares a `run_id` with another, here or
across the other features re-pinned in this PR.

`verified_commit` moves 572cb98 → 5975bb4; `run_id`, `verified_at` and `output`
were updated from this round's actual runs for the five evals that ran, and
nothing else in the report body changed. The human signature line is
byte-identical to the one committed at Gate 2.

Round 8 (2026-07-26T14:44–14:54Z, commit 8254c0bd): **carry-forward re-pin —
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
   glob; every other file belongs to `oneflow-plugin-prefix`. No file under `.github/workflows/**` or `scripts/ci/**` — the paths this feature owns — differs.
2. **The standing checks are green on the new tree.** `pnpm test` (22 files, 270 tests), `pnpm lint:check` (398 files, no fixes) and `pnpm build && pnpm typecheck` all exited zero on this tree.

Five of this feature's own evals were also re-run at this commit and all five
exited zero: E1 (`ci_actions_pinned`), E2 (`ci_gate_plumbing`), E3
(`ci_jobs_green`), E4 (`ci_docker_dryrun_guard`) and E8 (`ci_no_behaviour_drift`).
E2 and E3 read this branch's own CI run 30206355728 at 8254c0bd, where `Lint`,
`Type Check`, `Build` and `SDK Tests (Python)` all concluded success and
pre-merge-check emitted six per-feature verdict lines from a usable base. E8's
output changed shape because the feature is merged: the workflow diff against
`origin/main` is now empty, which is the strongest form of "no behaviour drift"
the guard can report. E5, E6 and E7 read a dispatched `workflow_dispatch` run;
no such run of `docker-publish.yml` or `desktop-release.yml` exists on
`feat/oneflow-plugin-prefix`, so all three **refused rather than reported**, were
logged with that refusal in `run-log.jsonl`, and keep their round-6 evidence
blocks unchanged. That is the same disposition as round 7.

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


Round 9 (2026-07-26T15:41–15:42Z, commit 66f80430): **carry-forward re-pin —
no fresh Gate-2 signature.** Re-pinned because commit `66f80430` landed on this
branch after round 8 and `stale_files` compares the whole tree against
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
set (`.github/workflows/**` and `scripts/ci/**`), so the carry-forward precondition in AGENTS.md holds: the
signature attests to the same code it originally did.

This feature's own evals were re-run where they can be. Five of the eight are
green on this tree: `ci_actions_pinned`, `ci_gate_plumbing`, `ci_jobs_green`,
`ci_docker_dryrun_guard` and `ci_no_behaviour_drift`. E2 and E3 read this
branch's own CI run **30207732088** at head `66f804306fb83fc12d5ed32e37031dac406068d6`,
where `Lint`, `Type Check`, `Build` and `SDK Tests (Python)` each carry
conclusion `success`; their output excerpts were refreshed to that run rather
than carried forward from round 8's.

The three run-reading evals that need a manual dispatch — E5
(`ci_docker_dispatch_green`), E6 (`ci_ghcr_untouched`) and E7
(`ci_desktop_dispatch_green`) — **were not re-run**, and are not claimed as
re-run. Each guard refused to report anything, correctly, because no
`workflow_dispatch` run of `docker-publish.yml` or `desktop-release.yml` exists
on this branch: "the workflow must actually have run before this eval can say
anything". Their evidence blocks keep their earlier-round `run_id` and
timestamp untouched, and the run-log records the refusal with a note rather than
a result. This is the same state round 8 recorded; nothing about it changed.

The failure-branch drives recorded in `## Analyst` are carried forward from
round 8 and were **not** re-measured this round; the per-eval `baseline` lines
say so explicitly.

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

`verified_commit` moves 8254c0bd → 66f80430; `verified_by` records round 9;
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

Carry-forward re-pin (2026-07-29, branch feat/conformance-l0):
`verified_commit` moved from 4dcb419d5d7d4612c10339bede6219662721d7e0 to
05fc9453fa561eaa60166c594974231459359db3 with NO re-verify, under the carry-forward
rule in AGENTS.md. Both of its conditions were checked, not assumed.

(1) This feature's own code is unchanged. Filtered of `_acceptance/`, the files
differing since the old pin are the 31 gated files of **conformance-l0** — the
feature under review on this branch — plus t1-exempt `STATUS.md` and
`docs/superpowers/**`. Ownership was computed rather than eyeballed: for each
merged feature, its owned set was taken from the diff of the merge commit that
landed it, then intersected with this branch's gated diff. This feature's
intersection is empty. Across the whole repo exactly one intersection is not
empty — `sdk/tongflow/scan.py`, owned by **oneflow-plugin-prefix** — so that
feature is deliberately NOT re-pinned here; it is on the re-verify path instead,
which is the half of the rule this note does not license.

(2) Standing checks green on the new tree: `pnpm lint:check` (413 files),
`pnpm test` (347 passed), `pnpm build && pnpm typecheck` (run sequentially, per
the config note about `.next/types`), and `cd sdk && pytest` (117 passed).

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.

Carry-forward re-pin (2026-07-30, branch feat/cache-l1-fingerprint):
`verified_commit` moved from 05fc9453fa561eaa60166c594974231459359db3 to
aba508a0edc61656b21d46bec6361cf4c6a0f927 with NO re-verify, under the carry-forward
rule in AGENTS.md. Both conditions were checked, not assumed.

(1) This feature's own code is unchanged. The branch's entire gated diff is FOUR
NEW FILES — `sdk/tongflow/engine/fingerprint.py`, `sdk/tests/test_fingerprint.py`,
`sdk/tests/test_fingerprint_vectors.py`, `sdk/tests/fixtures/fingerprint_vectors.json`
— so no pre-existing feature can own any of them. Ownership was computed per file
under the rule settled 2026-07-29, not inferred from the subtree: each feature's
owned set is the gated diff of the merge commit that landed it, intersected with
this branch's gated diff. All eight intersections are empty. Note in particular
that conformance-l0 declares `paths: ["sdk/**"]`, so narrow scope does NOT save it
— it is carried on ownership, not on scope.

(2) Standing checks green on the new tree, measured by round 2 of this branch's
own S4 verify rather than re-run by hand: `pnpm build && pnpm typecheck`,
`pnpm lint:check`, `pnpm test`, `cd sdk && pytest` (133 passed),
`pnpm verify:plugins`, and the generated-ABI drift check — all six suite commands
exited 0, alongside 16/16 feature evals.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.

Carry-forward re-pin (2026-07-30, branch feat/cache-l2-store):
`verified_commit` moved from aba508a0edc61656b21d46bec6361cf4c6a0f927 to
e8fe1f26da983983f6ce5c5acf0d56217dfd1ae2 with NO re-verify, under the carry-forward rule in AGENTS.md.

(1) This feature's own code is unchanged. The branch's gated diff is ten files:
four owned by cache-l1-fingerprint (fingerprint.py + its tests + vectors), two
owned by conformance-l0 (runner.py, engine-delegate.server.ts), and four NEW
files owned by cache-l2-store (node_cache.py, test_node_cache.py, __main__.py's
tenant hunk, engine-delegate.test.ts). Ownership computed per file: this
feature's owned set (the gated diff of its landing merge commit) intersects the
branch's gated diff EMPTY. The two features whose intersections are non-empty
are deliberately NOT re-pinned here — they go to re-verify with fresh Gate 2
signatures instead.

(2) Standing checks green on the new tree, measured by this branch's own S4
round 1 rather than re-run by hand: all six suite commands (build+typecheck,
lint, unit 349, sdk pytest 159, verify:plugins, ABI drift) exited 0 alongside
18/18 feature evals.

The human signature line in frontmatter was not touched.

## Gate 2 checklist (human)

- [ ] Read `## Analyst` item 3 first: round 5's finding is closed. The pin check
      now extracts a pin with `sed`, so a trailing comment naming the action can
      no longer stand in for a deleted checkout site — re-driven this round with
      the exact mutation, including the variant where the concealment predates
      the branch, which is the case that had defeated both E1 and E8.
- [ ] Then read `## Analyst` item 4. No false pass was found, and all eight
      criteria are true on this tree. What item 4 records is a bounded limit: E1
      counts a `uses:`-shaped line inside a block scalar as a site, and E8 does
      not check that pin lines pair up, so a lone removal reads as a declared
      bump. Planted together so as to predate the branch, both report clean —
      while E5, E6 and E7 fail on the tree-provenance pin, which is what keeps
      this a hardening note rather than a hole. Decide whether the two one-line
      fixes land in this PR or are tracked as follow-up.
- [ ] Read E6's block: the criterion is carried by the build log (resolved
      `push: false`, a buildx command line with no `--push` and no `--output
      type=registry`, no registry-write line anywhere in 3,575 lines, and
      buildx's own statement that the result stayed in the build cache), not by
      the registry listing, which this token cannot read and which the script
      correctly declines to use.
- [ ] Confirm you accept the AC-2 amendment as recorded in the contract; the
      verifier's reasoning is in `## Analyst` item 7, which recommends accepting
      it. Three costs to accept deliberately: the amendment narrows a criterion
      already approved at Gate 1; the Acceptance Gate job's colour is now covered
      by no eval and is enforced only by the merge itself; and E2 and E3 pass on
      a run whose overall conclusion is not success, because both use
      `assert_run_finished` rather than `assert_run_complete`.
- [ ] If you accept, fill the signature field in frontmatter — it is empty and
      must be filled by a human, in its own human-fields-only commit — and
      `time_human_minutes.gate2` in the contract.


---

Carry-forward re-pin (2026-07-30, branch feat/cache-l3-tier-b):
`verified_commit` moved from e8fe1f26da983983f6ce5c5acf0d56217dfd1ae2 to
77fb83f9cc25c9d65e0021563203aafd899928e0 with NO re-verify, under the carry-forward rule in AGENTS.md.
Both conditions were checked, not assumed.

(1) This feature's own code is unchanged. The branch's gated diff is exactly the
11 files of **cache-l3-tier-b**:
sdk/tests/fixtures/fingerprint_vectors.json · sdk/tests/test_fingerprint.py ·
sdk/tests/test_fingerprint_vectors.py · sdk/tests/test_node_cache.py ·
sdk/tongflow/engine/__main__.py · sdk/tongflow/engine/fingerprint.py ·
sdk/tongflow/engine/node_cache.py · sdk/tongflow/engine/runner.py ·
src/lib/task/engine-delegate.server.ts · src/lib/task/engine-delegate.test.ts ·
src/lib/task/runner.ts
Ownership was computed, not eyeballed: each merged feature's owned set was taken
from the gated diff of the merge commit that landed it, then intersected with
this branch's gated diff. This feature's intersection is empty. Four features
have non-empty intersections — cache-l1-fingerprint, cache-l2-store,
conformance-l0 (sdk/tongflow/engine/runner.py + src/lib/task/engine-delegate.server.ts),
and task-metering (src/lib/task/runner.ts) — all four are on the re-verify path
with fresh rerun evidence and fresh signatures, the half of the rule this note
does not license.

(2) Standing checks green on the new tree (S4 round 1 of cache-l3-tier-b, run-log `_acceptance/cache-l3-tier-b/run-log.jsonl`): `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test` (350 passed), full sdk pytest (170 passed), `pnpm verify:plugins`, `pnpm gen:abi` diff-clean.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.


---

Carry-forward re-pin (2026-07-31, branch feat/cache-l4-eviction):
`verified_commit` moved to c000b4b6b32f29eea6217f8de26596a052737128 with NO re-verify, under the carry-forward rule in AGENTS.md.
Both conditions were checked, not assumed.

(1) This feature's own code is unchanged. The branch's gated diff is exactly the
17 files of **cache-l4-eviction**:
drizzle/0003_clammy_blazing_skull.sql · drizzle/meta/0003_snapshot.json ·
drizzle/meta/_journal.json · scripts/cache/check-test-layout.sh ·
sdk/tests/cache_helpers.py · sdk/tests/test_cache_runner_wiring.py ·
sdk/tests/test_cache_sweep.py · sdk/tests/test_node_cache.py ·
sdk/tests/test_node_cache_tier_b.py · sdk/tongflow/engine/__main__.py ·
sdk/tongflow/engine/node_cache.py · sdk/tongflow/engine/runner.py ·
src/db/metering-schema.test.ts · src/db/workspace.schema.ts ·
src/lib/task/engine-delegate.server.ts · src/lib/task/engine-delegate.test.ts ·
src/lib/task/node-cached.test.ts
Ownership was computed, not eyeballed: each merged feature's owned set was taken
from the gated diff of the merge commit that landed it, then intersected with
this branch's gated diff. This feature's intersection is empty. Four features
have non-empty intersections — cache-l2-store, cache-l3-tier-b, conformance-l0
and task-metering — all four are on the re-verify path with fresh rerun evidence
and fresh signatures, the half of the rule this note does not license.

(2) Standing checks green on the new tree (S4 round 1 of cache-l4-eviction, run-log `_acceptance/cache-l4-eviction/run-log.jsonl`): `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test` (363 passed), full sdk pytest (189 passed), `pnpm verify:plugins`, `pnpm gen:abi` diff-clean.

The human signature line in frontmatter was not touched — it attests to the same
code it originally did.
