---
schema_version: 2
feature_slug: ci-actions-bump
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 3)
enforcement_mode: strict
bypass_used: false
verified_commit: f2928c05e13ca2693de765bac5a605187fffca85
human_signoff:
---

# Evidence Report: ci-actions-bump

Round 3 is the first **complete** round: all eight evals were executed against
commit f2928c05 and all eight exited zero. Rounds 1 and 2 each found defects in
these eval scripts, so this round assumed a third crop existed and went looking
for it. It found one — reported in full in `## Analyst` item 4. It concerns the
strength of E8's guard, not the truth of AC-8 on this tree, which was re-derived
by hand below.

Nothing here was taken on trust from the previous rounds. Every `cmd` was
resolved line by line against `_acceptance/config.yaml`; five criteria were
additionally re-derived from the runs' own logs and from git, independently of
the script that reports them.

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
  run_id: ci-actions-bump-r3-e1-20260726072533
  exit_code: 0
  baseline: red — driven into its failure branch this round on scratch copies; see `## Analyst` item 2
  verifier: config:executors.script.ci_actions_pinned
  verified_at: 2026-07-26T07:25:33Z
  output: |
    ok actions/checkout: 7 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

    Re-derived independently of the script this round:
    `grep -rn "actions/checkout@" .github/workflows` lists exactly seven sites —
    ci.yml lines 18, 42, 63, 84, 102; desktop-release.yml line 61;
    docker-publish.yml line 23 — each at v7, and `docker/login-action@v4` once at
    docker-publish.yml line 32. The contract's "seven sites" figure is correct as
    written, and no site sits below the contracted floor.

- eval: E2
  run_id: ci-actions-bump-r3-e2-20260726072609
  exit_code: 0
  baseline: red — mutations of the run JSON and job log, each caught or declined; see `## Analyst` item 2
  verifier: config:executors.script.ci_gate_plumbing
  verified_at: 2026-07-26T07:26:09Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30192682106 @ f2928c05e13ca2693de765bac5a605187fffca85
    ok  checkout ran with fetch-depth: 0
    ok  the checkout under test is v7
    ok  pre-merge-check emitted 5 per-feature verdict line(s)
    ok  no shallow-history or unresolvable-base complaint anywhere in the log

    Re-derived independently of the script, from the Acceptance Gate job log of
    run 30192682106 (the ci.yml run at this branch's head SHA). Provenance of each
    matched string was checked rather than assumed — the `fetch-depth: 0` match is
    the checkout step's own input echo, inside the `Run actions/checkout@v7` step
    group, not an incidental mention elsewhere in the log:

      Set up job              Download action repository 'actions/checkout@v7'
                                (SHA: 3d3c42e5aac5ba805825da76410c181273ba90b1)
      Run actions/checkout@v7 ##[group]Run actions/checkout@v7
      Run actions/checkout@v7   with:
      Run actions/checkout@v7     fetch-depth: 0
      Run actions/checkout@v7     repository: phanlemanh/OneFlow

    And the gate then reached acceptance logic rather than stopping at git: the
    log carries five per-feature verdict lines, one for each feature under
    `_acceptance/`, each naming the feature and the bookkeeping state it found.
    That is only reachable once the base ref has resolved and a file-level diff
    has been produced. No shallow-history, `unknown revision` or unresolvable-base
    complaint appears anywhere in the 231-line job log.

- eval: E3
  run_id: ci-actions-bump-r3-e3-20260726072621
  exit_code: 0
  baseline: red — a named job absent, a named job unsuccessful, and a run still in flight are each caught; see `## Analyst` item 2
  verifier: config:executors.script.ci_jobs_green
  verified_at: 2026-07-26T07:26:21Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30192682106 @ f2928c05e13ca2693de765bac5a605187fffca85
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    all requested jobs succeeded at f2928c05e13ca2693de765bac5a605187fffca85

    Confirmed against the run object directly (`gh run view 30192682106 --json
    jobs`): the run contains five jobs, and the four named above each carry
    conclusion `success` under the node24 runtime. The run is `status: completed`,
    so these are final results rather than a snapshot of something still moving.
    This is also the round-1 coupling defect closed — see `## Analyst` item 3.

- eval: E4
  run_id: ci-actions-bump-r3-e4-20260726072540
  exit_code: 0
  baseline: red — seven mutations of the guard line, each caught; see `## Analyst` item 2
  verifier: config:executors.script.ci_docker_dryrun_guard
  verified_at: 2026-07-26T07:25:40Z
  output: |
    dry-run guard present:          push: ${{ github.ref_type == 'tag' }}
    a workflow_dispatch run builds both platforms and publishes nothing

    Re-read from the file this round: `.github/workflows/docker-publish.yml`
    carries exactly one `push:` line bearing a value — line 64, the
    build-push-action input — and it resolves to false for any ref that is not a
    tag. The other `push` in the file is the bare trigger key at line 4, which
    has a block under it rather than a value, so the two cannot be confused.

- eval: E5
  run_id: ci-actions-bump-r3-e5-20260726072632
  exit_code: 0
  baseline: red — ten mutations of the run JSON and log, each caught or declined; see `## Analyst` item 2
  verifier: config:executors.script.ci_docker_dispatch_green
  verified_at: 2026-07-26T07:26:32Z
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

    The platform half was re-counted by hand in the run's own log: 48 build-stage
    lines prefixed `[linux/amd64 ` and 54 prefixed `[linux/arm64 `. The buildx
    command line carries `--platform linux/amd64,linux/arm64`, and the step
    concluded successfully, so both architectures were genuinely produced rather
    than merely requested. The step that carries PR #2's action reported
    `Login Succeeded!`, and the run's own credentials were removed afterwards by
    the post step.

- eval: E6
  run_id: ci-actions-bump-r3-e6-20260726072644
  exit_code: 0
  baseline: red — a resolved `push: true`, a registry-write line, a `--push` invocation, a truncated log and a package version dated after the run are each caught or declined; see `## Analyst` item 2
  verifier: config:executors.script.ci_ghcr_untouched
  verified_at: 2026-07-26T07:26:44Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190339168 (started 2026-07-26T06:01:26Z)
    ok  runner resolved 'push: false'
    ok  no registry write anywhere in 3575 log lines
    ok  buildx invoked without --push
    --  registry cross-check unavailable: the token cannot read packages.
        Not treated as evidence either way — a 404 from the versions endpoint
        is indistinguishable from a package this token simply cannot see.
    no publish occurred during the dry run

    AC-6 was re-derived from run 30190339168's log this round, independently of
    the script, and rests on four observations rather than on the registry:

      1. The only `push:` input line in the whole 3576-line log is the runner's
         echo of the resolved build-push inputs, and it reads `push: false`.
      2. The buildx command line contains no `--push` and no
         `--output type=registry`. Its only exporters are `--iidfile`,
         `--metadata-file` and `--cache-to type=gha,mode=max`.
      3. Zero lines anywhere match `pushing manifest`, `pushing layer`,
         `exporting to image` or `exporting to registry`. The single export stage
         present reads `exporting to GitHub Actions Cache`.
      4. buildx's own closing statement, which is the strongest form of this
         evidence because the builder is describing what it did:
           "No output specified with docker-container driver. Build result will
            only remain in the build cache. To push result image into registry
            use --push or to load image into docker use --load"

    The tag `ghcr.io/phanlemanh/oneflow:sha-b48699c` was computed by the metadata
    step and never pushed. The registry listing was NOT used as evidence: this
    token holds scopes gist, read:org, repo, workflow and not `read:packages`, so
    the script's scope probe fails and it declines to read the versions endpoint's
    404 either way. That is the round-1 defect fixed — see `## Analyst` item 3.

- eval: E7
  run_id: ci-actions-bump-r3-e7-20260726072658
  exit_code: 0
  baseline: red — a leg missing, a leg unsuccessful, a required step absent and the release-upload step having run are each caught; see `## Analyst` item 2
  verifier: config:executors.script.ci_desktop_dispatch_green
  verified_at: 2026-07-26T07:26:58Z
  output: |
    dispatched run https://github.com/phanlemanh/OneFlow/actions/runs/30190355369
      branch under test: chore/ci-actions-bump   run head: b48699c612fab479deede3d7d1d9959e110d7335
      workflow tree matches HEAD: c2bd8c61cfc2a159cd3287783e750dfd72ce02b9
    ok job 'build (macos-14, ...': success
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

    The suppression half was re-derived independently: `gh release list` returns
    nothing at all for this repository, so no Release — draft or public — was
    created by the dispatch. The positive half was corroborated from the run's
    artifacts rather than from step names: run 30190355369 holds
    TongFlow-mac-universal.dmg (8,234,308 bytes) and TongFlow-win-x64.msi
    (3,338,000 bytes), one per matrix leg, both inside the 1–30 MB band the
    workflow's own sanity check enforces. Both `cache@v6` steps ran and succeeded
    on the two runner OSes ci.yml never touches.

- eval: E8
  run_id: ci-actions-bump-r3-e8-20260726072549
  exit_code: 0
  baseline: red — a trigger edit, a permissions block, a job rename, a fetch-depth change and a stray `push: true` outside docker-publish.yml are each caught; see `## Analyst` items 2 and 4
  verifier: config:executors.script.ci_no_behaviour_drift
  verified_at: 2026-07-26T07:25:49Z
  output: |
    workflow drift vs origin/main: pins and comments only, plus the declared dry-run guard (-1 +1)

    AC-8 was re-derived by hand this round rather than accepted from the script,
    because the script is weaker than the criterion (`## Analyst` item 4). The
    complete diff under .github/workflows against origin/main is 26 changed lines,
    every one of which was classified individually:

      16 lines  eight matched removed/added PAIRS, each the SAME action path with
                only the major version changed — seven of actions/checkout v4→v7
                (ci.yml ×5, desktop-release.yml ×1, docker-publish.yml ×1) and one
                of docker/login-action v3→v4. No action was added, removed, or
                swapped to a different publisher.
       8 lines  added comment lines in docker-publish.yml, documenting the guard.
       2 lines  the declared dry-run guard itself: `push: true` removed and
                `push: ${{ github.ref_type == 'tag' }}` added, in
                docker-publish.yml, which the contract declares in advance.

    No trigger, permission, job, `runs-on`, `if:`, input or step was altered. The
    criterion holds on this tree, established from the diff itself.

## Analyst

### 1. Scope of this round

Round 3 is the full round the contract asks for. All eight evals were executed
and all eight exited zero, each with captured output above. Five criteria
(AC-1, AC-2, AC-6, AC-7, AC-8) were additionally re-derived from primary sources
— run logs, the run object, `gh release list`, and the git diff — so their
verdicts do not rest on the eval scripts alone.

`enforcement_mode` is `strict`, read from `_acceptance/config.yaml`.
`ACCEPTANCE_GATE_BYPASS` was checked with `printf '%s'` and is empty, so
`bypass_used` is false.

### 2. Discrimination: every script and every helper was driven into failure

The baseline question for these evals is not "was it red before the feature" —
five of them read real Actions runs that did not exist beforehand. The useful
question is whether each guard can fail at all, and whether it fails for the
right reason. Roughly fifty mutations were driven this round.

**Method, and the safety rule it respects.** The repository working tree was
never modified. A `--no-hardlinks` clone was made in a scratch directory outside
the repo and every workflow/diff mutation was committed and reset there; no probe
commit, `git commit -am` or `git reset --hard` ever touched the real repository or
its history. The `gh`-backed scripts were driven through a `gh` test double on
`PATH`, seeded with fixtures captured from the real runs so the unmutated double
reproduces the real output byte for byte before any mutation is applied.

- `check-action-pins.sh` (12 mutations) — one site downgraded; all seven
  downgraded; an eighth site added; the login pin downgraded; the login step
  commented out; a site replaced by a `run:` line that merely mentions the action;
  a site SHA-pinned with a `# v7` trailing comment; a stray file in the workflow
  directory carrying a `uses:` line. Each named the offence and terminated
  unsuccessfully. With no `.github/workflows` directory, or with the workflow
  files present but empty, it declines to answer rather than reporting clean.
- `check-docker-dryrun.sh` (8 mutations) — `push: true` restored; the guard
  gated on `github.event_name` instead of the ref type; the input deleted
  entirely (which would restore the action's own publishing default); a second
  `push:` input added; the same expression quoted; the same expression with a
  trailing comment; and `github.ref_type == 'tag' || true`. All caught. The file
  missing: declines to answer.
- `check-workflow-drift.sh` (16 mutations) — a trigger key edited; a
  `permissions:` block added; a job renamed; `fetch-depth: 0` changed to 1; the
  guard's exact text smuggled into ci.yml; a whole workflow file deleted; a stray
  `push: true` added inside a `with:` block in ci.yml. All caught. An unresolvable
  base ref: declines to answer. Comment-only additions correctly pass. Three
  mutations were NOT caught — see item 4.
- `check-dispatch-run.sh` (15 mutations) — run conclusion flipped; run still in
  flight; run with no jobs; every job skipped; a required step removed; a required
  step unsuccessful; the run's head SHA pointed at a different tree; the log
  showing only one architecture's build stages; the log showing neither; the log
  unreadable; one matrix leg absent; a matrix leg unsuccessful; the
  release-upload step marked as having run; every desktop job skipped; an
  unknown or absent workflow key. All caught or declined.
- `check-ghcr-untouched.sh` (12 mutations) — the runner resolving `push: true`;
  the resolved input absent from the log; a `pushing manifest` line injected;
  buildx invoked with `--push`; a truncated log; no buildx invocation in the log;
  the log unreadable; the run still in flight; and, with a token that CAN read
  packages, a package version created during the run. All caught or declined.
  With only pre-existing versions, or a genuine 404 under a scope-confirmed
  token, it correctly passes.
- `gh-run-lib.sh` (9 probes) — `gh` absent from PATH; `gh` unauthenticated;
  `gh run list` failing; no run matching the query; `gh run view` failing; HEAD
  unresolvable outside a git repository; a run still in flight; a run whose
  overall conclusion is unsuccessful. Each refuses or reports rather than
  passing. One latent defect remains — see item 5.

### 3. The four fixes claimed for f2928c05 were re-driven and all four hold

Each was tested by reproducing the exact mutation that defeated the previous
version, not by reading the diff.

1. **Pin check counted the string.** Deleting `- uses: actions/checkout@v7` from
   ci.yml and leaving `# was: actions/checkout@v7` in its place: the old check
   still counted seven. The current check reports "expected 7 pinned site(s),
   found 6" and terminates unsuccessfully. It requires a real `uses:` step line,
   so a commented-out login step, a `run:` line quoting the action, and a
   SHA-pinned site with a `# v7` comment are all correctly invisible to the count.
   **Fixed.**
2. **Drift check's `push:` budget was global.** Adding a stray `push: true` inside
   a `with:` block in ci.yml while the declared guard is present: the old budget
   absorbed it. The current check reports it as an offender, because the budget is
   now tied to the file, the sign and the exact text. The guard's own text
   smuggled into ci.yml is likewise rejected. **Fixed** — though the check has a
   separate weakness, see item 4.
3. **`workflow_file`'s refusal was unreachable.** `check-run-jobs.sh bogus Lint`
   now prints "unknown workflow key 'bogus' (expected: ci | docker | desktop)" and
   terminates without querying anything, because the key is validated in the
   calling shell before `find_run` is entered. **Fixed at every call site.** The
   underlying library behaviour is not fixed — see item 5.
4. **The platform assertion is new and real.** With every `[linux/arm64 ` line
   removed from the docker job's log, the check reports "no linux/arm64 build
   stages — the run did not build both platforms". With both architectures'
   stages removed it reports both. With the log unreadable it declines to answer
   rather than assuming. **Present and effective.**

Three findings from round 1 were also re-tested and all three are closed. The
dispatch queries are now branch-scoped (`find_run <key> workflow_dispatch ""
"$BRANCH"`; confirmed against the live API that the same query returns nothing
for `main` and exactly run 30190339168 for this branch). The GHCR check now
probes the token's package scope first and, on this scope-less token, declines to
treat a 404 as absence — which is why E6 rests on the build log. And
`check-run-jobs.sh` now asserts only that the run is finished, not that it is
green overall, so E3 exits zero this round even though the run containing it
concluded unsuccessfully for the Acceptance Gate job's own bookkeeping reasons.
That is the coupling between E2 and E3 removed.

### 4. FALSE PASS FOUND — the drift check cannot tell a bumped pin from a new action

`check-workflow-drift.sh` allows any changed line matching `uses:*` through
unconditionally. It never pairs a removed pin with an added one, so it cannot
distinguish "an existing pin's version changed" — the only thing AC-8 means to
permit — from three other things it should refuse. All three were driven this
round in the scratch clone and all three passed as "pins and comments only":

- **A brand-new action step inserted.** Adding `- uses: evil/exfiltrate@v1` as a
  new step in the `Lint` job passes. `check-action-pins.sh` does not catch it
  either — the checkout count stays at seven and the new action is neither
  checkout nor login-action — so **no eval in this suite catches it.** This is
  the most serious of the three: adding a whole action step is precisely the
  "behaviour smuggled under cover of a bump" that AC-8 exists to forbid.
- **An existing pin swapped to a different publisher.** Changing
  `pnpm/action-setup@v4` to `attacker/action-setup@v4` passes. The version does
  not move at all, so this is not a version bump by any reading, yet the checker
  classifies it as a pin.
- **An existing step's `uses:` line deleted.** Removing the
  `actions/setup-python` pin passes.

A fourth, narrower miss: because the check only bounds the guard counts from
above and never requires the removal to be present, git's minimal-diff line
matching can absorb it. Inserting a second `push: true` immediately after the
guard in docker-publish.yml leaves a tree that still contains `push: true`, while
the diff shows only the guard's addition, and the check reports clean at
`-0 +1`. That one **is** caught by E4, which requires exactly one `push:` input
in the file, so it does not escape the suite — but E8 alone accepts it.

A fifth, contrived: a removed line whose content begins with `--` renders as
`---…` in the diff and is swallowed by the case arm that skips `---` file
headers. Reaching it needs a column-0 `--` line, which no workflow here has.

**None of these changes AC-8's verdict**, because the criterion was established
from the actual 26-line diff by hand (see E8's block) and that diff contains only
matched same-action version pairs, comments, and the declared guard. But E8's
green must be read as "this diff was inspected", not "this guard would have
stopped a behaviour change". The fix is to pair removals with additions per file
and require that a `uses:` change keep the action path identical and move only
the version — plus require the guard's removed line to be present, not merely
not-duplicated.

### 5. Latent defect — the library's own refusal is still unreachable

Round 2's third finding was patched at the call site, not in the library.
`gh-run-lib.sh`'s `find_run` still calls `workflow_file` through a nested command
substitution (`file="$(workflow_file "$key")"`), and bash does not apply `set -e`
to that failing assignment when `find_run` is itself running inside a command
substitution — which is how all four callers invoke it. Driven directly this
round through a probe that sources the library and calls `find_run bogus` from a
`$( )`: the refusal is printed, execution continues past it, `gh run list` is
invoked with an empty `--workflow`, and a run id comes back. That is verbatim the
round-2 behaviour.

It is latent, not live: `check-run-jobs.sh` validates the key in the calling shell
first, `check-dispatch-run.sh` validates it in its own `case`, and
`check-gate-plumbing.sh` and `check-ghcr-untouched.sh` pass a literal. So no eval
in this suite is affected today. The other refusals in the library — no run found,
`gh run list` failing, `gh run view` failing, HEAD unresolvable — are at the top
level of their function bodies and were each confirmed to propagate. The fix is
to make `find_run` test the call explicitly — wrap the assignment in
`if ! file="$(workflow_file "$key")"; then …; fi` and refuse from there — so the
library is safe for any future caller.

### 6. Minor residuals, reported for completeness

- **E7's skipped-step assertion cannot see a rename.** In
  `check-dispatch-run.sh`, a step listed in `SKIPPED_STEPS` that is simply absent
  from the run prints "not taken on a dispatch". If `Upload to draft GitHub
  Release` were renamed and then ran, the check would not notice. The suppression
  half of AC-7 was therefore also established independently, from `gh release
  list` being empty.
- **E6 reads only the first job's log.** `check-ghcr-untouched.sh` uses
  `.jobs[0].databaseId`. `docker-publish.yml` has exactly one job today, so the
  decisive half sees everything; a second job added later would be invisible to it.
- **E6 does not pin the run to HEAD's workflow tree** the way E5 does, so on its
  own it would accept a dry run of an older workflow. In practice both scripts
  select the same run id, and E5 does assert the tree, so the pair is sound.
- **Over-strictness in E4**, noted so a future editor is not surprised: the guard
  line must match a single anchored form, so quoting the expression or appending a
  trailing comment is rejected even though YAML would treat it identically. That
  is the safe direction to be wrong in.
- **E1 counts any `uses:` line under `.github/workflows`**, including one in a
  non-YAML file dropped in that directory. That inflates the count and reports the
  mismatch — again the safe direction.

### 7. Judgement on the AC-2 amendment: honest narrowing

The contract's "Amendment" section narrows AC-2 from "the `Acceptance Gate` job
passes" to "the gate reached acceptance logic — the base resolved and real
per-feature verdicts came out". **I judge this an honest narrowing, not a problem
defined away**, on four grounds.

1. **The original was circular, and the amendment says so in those words.** The
   Acceptance Gate job runs the acceptance gate. Its colour is dominated by
   whether features have been signed and re-pinned. Evidence must exist before a
   Gate-2 signature; a criterion satisfiable only after that signature cannot be
   met by any honest round. This round demonstrates it concretely: the job did not
   conclude successfully at f2928c05 for exactly five bookkeeping reasons —
   `ci-actions-bump` having no PASS report yet, and the four merged features being
   stale — none of which is a statement about `actions/checkout`.
2. **The narrowed criterion still discriminates.** It is not a formality. Driven
   against a log with the checkout at v4, it reports the wrong version. Against a
   log with no per-feature verdict line, it reports the gate never got past git.
   Against a log carrying `fatal: bad revision` or a shallow-history complaint, it
   reports the complaint. And against a log where `fetch-depth: 0` cannot be
   confirmed at all, it declines to answer rather than passing — the discipline
   this whole exercise is about.
3. **It targets what the bump could actually break.** A checkout major bump that
   broke `fetch-depth: 0` would show up as an unresolvable base, and that is
   precisely what the narrowed criterion looks for. The job's overall colour never
   was the load-bearing signal.
4. **Nothing was quietly lost.** The amendment states that full CI green is
   enforced by the merge itself rather than by a criterion, which is true of this
   repository, and it is recorded in the contract as a dated amendment with its
   reason rather than edited into AC-2 silently. The contract does the same thing
   elsewhere — it records that its own first draft said five checkout sites
   instead of seven. That is the behaviour of a document being kept honest.

The one thing a reader should hold the amendment to: it means the Acceptance Gate
job's colour is now covered by no eval at all. That is acceptable here only
because merge itself enforces it.

### 8. On the `latest` tag and the metadata step

`docker/metadata-action@v5` is unchanged by this PR and out of the contract's
scope, but its behaviour is load-bearing for AC-6 and was re-checked. The
dispatch computed the single tag `ghcr.io/phanlemanh/oneflow:sha-b48699c` and no
`latest`. Even had `push` resolved true, no floating tag would have moved.

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

## Gate 2 checklist (human)

- [ ] Read `## Analyst` item 4 first. It is the one finding that changes what a
      green E8 means: the drift guard would not stop a new action step being
      added to a workflow, and nothing else in this suite would either. Decide
      whether that is fixed in this PR or tracked as follow-up work.
- [ ] Read E6's block: the criterion is carried by the build log (resolved
      `push: false`, a buildx command line with no `--push`, and buildx's own
      statement that the result stayed in the cache), not by the registry
      listing, which this token cannot read and which the script correctly
      declines to use.
- [ ] Note `## Analyst` item 5: `gh-run-lib.sh`'s own refusal is still
      unreachable from a command substitution. No eval is affected today because
      every caller validates its key first.
- [ ] Confirm you accept the AC-2 amendment as recorded in the contract; the
      verifier's reasoning is in `## Analyst` item 7. Its cost is that the
      Acceptance Gate job's colour is now covered by no eval and is enforced only
      by the merge itself.
- [ ] If you accept, fill the signature field in frontmatter — it is empty and
      must be filled by a human, in its own human-fields-only commit — and
      `time_human_minutes.gate2` in the contract.
