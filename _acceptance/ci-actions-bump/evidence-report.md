---
schema_version: 2
feature_slug: ci-actions-bump
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 6)
enforcement_mode: strict
bypass_used: false
verified_commit: 572cb98a44f29174acd496e5aa648bd6a6ac08b0
human_signoff:
---

# Evidence Report: ci-actions-bump

Round 6 is a full re-verification at commit 572cb98: all eight evals executed,
all eight exited zero, each with captured output below. Five earlier rounds each
found a defect in these eval scripts, so this round assumed a sixth crop existed
and went looking for it.

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
  run_id: ci-actions-bump-r6-e1-20260726085840
  exit_code: 0
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
  verifier: config:executors.script.ci_actions_pinned
  verified_at: 2026-07-26T08:58:40Z
  output: |
    ok actions/checkout: 7 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

    Re-derived independently of the script this round: `grep -rn 'uses:' .github/workflows` lists exactly seven `actions/checkout@v7` sites — ci.yml lines 18, 42, 63, 84, 102; desktop-release.yml line 61; docker-publish.yml line 23 — and one `docker/login-action@v4` at docker-publish.yml line 32. AC-1 is true on this tree as written. Round 5's `sed` fix was re-driven against the concealment that defeated the previous version, including the variant where it predates the branch; it holds (Analyst item 3). Analyst item 4 records what a green E1 still does not establish.

- eval: E2
  run_id: ci-actions-bump-r6-e2-20260726085848
  exit_code: 0
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
  verifier: config:executors.script.ci_gate_plumbing
  verified_at: 2026-07-26T08:58:48Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30195519130 @ 572cb98a44f29174acd496e5aa648bd6a6ac08b0
    ok  checkout ran with fetch-depth: 0
    ok  the checkout under test is v7
    ok  pre-merge-check emitted 5 per-feature verdict line(s)
    ok  no shallow-history or unresolvable-base complaint anywhere in the log
    fetch-depth: 0 under checkout@v7 gave pre-merge-check.sh a usable base at 572cb98a44f29174acd496e5aa648bd6a6ac08b0

    The run's overall conclusion is not success, and that is expected: the Acceptance Gate job reports bookkeeping state for five features, one of them this feature awaiting its own signature. That is precisely why AC-2 was narrowed — see Analyst item 7. What this eval asserts is the plumbing: checkout@v7 ran with fetch-depth: 0 and pre-merge-check reached acceptance logic, emitting five real per-feature verdict lines with no shallow-history or unresolvable-base complaint.

- eval: E3
  run_id: ci-actions-bump-r6-e3-20260726085856
  exit_code: 0
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
  verifier: config:executors.script.ci_jobs_green
  verified_at: 2026-07-26T08:58:56Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30195519130 @ 572cb98a44f29174acd496e5aa648bd6a6ac08b0
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    all requested jobs succeeded at 572cb98a44f29174acd496e5aa648bd6a6ac08b0

    Re-derived from the run object: the four named jobs each carry conclusion `success` at this head SHA under the node24 runtime. The run as a whole concluded otherwise because of the Acceptance Gate job, which this eval deliberately does not depend on — `assert_run_finished`, not `assert_run_complete`.

- eval: E4
  run_id: ci-actions-bump-r6-e4-20260726085900
  exit_code: 0
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
  verifier: config:executors.script.ci_docker_dryrun_guard
  verified_at: 2026-07-26T08:59:00Z
  output: |
    dry-run guard present:          push: ${{ github.ref_type == 'tag' }}
    a workflow_dispatch run builds both platforms and publishes nothing

    Static half of AC-4. The dynamic half is E5/E6: an actual dispatched run that succeeded and wrote nothing. Five mutations of this guard were driven this round and all five are caught or declined (Analyst item 2).

- eval: E5
  run_id: ci-actions-bump-r6-e5-20260726085907
  exit_code: 0
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
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
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
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
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
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
  run_id: ci-actions-bump-r6-e8-20260726085925
  exit_code: 0
  baseline: red — driven into its failure branches again this round on `--no-hardlinks` scratch clones and through a `gh` double written for this round; see Analyst item 2
  verifier: config:executors.script.ci_no_behaviour_drift
  verified_at: 2026-07-26T08:59:25Z
  output: |
    workflow drift vs origin/main: 16 declared pin line(s), comments, and the dry-run guard (-1 +1); no file added, deleted or renamed

    Re-derived from the diff by hand: every changed line under .github/workflows is one of the 16 declared pin lines (`actions/checkout` v4→v7 at seven sites, `docker/login-action` v3→v4 at one, counted as removed+added), a comment, or the one declared guard line pair. `git diff --name-status` reports three `M` entries and nothing added, deleted or renamed.

## Analyst

### 1. Scope of this round

Round 6 is a full round. All eight evals were executed against the working tree
at commit 572cb98 and all eight exited zero, each with captured output above.
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
