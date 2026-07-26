---
schema_version: 2
feature_slug: ci-actions-bump
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 5)
enforcement_mode: strict
bypass_used: false
verified_commit: 73a8d935b7cc9bb649b2baee265379b7b207274a
human_signoff:
---

# Evidence Report: ci-actions-bump

Round 5 is a full re-verification at commit 73a8d93: all eight evals executed,
all eight exited zero, each with captured output below. Four earlier rounds each
found defects in these eval scripts, so this round assumed a fifth crop existed
and went looking for it. It found one — reported in Analyst item 4. It concerns
what a green E1 can be relied on to mean, not the truth of AC-1 on this tree,
which was re-derived by hand from the workflow files.

Round 4's two findings were re-driven with the exact mutations that defeated the
previous version and both are closed (Analyst item 3).

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
  run_id: ci-actions-bump-r5-e1-20260726083209
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_actions_pinned
  verified_at: 2026-07-26T08:32:09Z
  output: |
    ok actions/checkout: 7 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

    Re-derived independently of the script this round: `grep -rn 'uses:' .github/workflows` lists exactly seven `actions/checkout@v7` sites — ci.yml lines 18, 42, 63, 84, 102; desktop-release.yml line 61; docker-publish.yml line 23 — and one `docker/login-action@v4` at docker-publish.yml line 32, none of them carrying a trailing comment. The contract's "seven sites" figure is correct as written and no site sits below the contracted floor. Read Analyst item 4 for what this green does NOT establish.

- eval: E2
  run_id: ci-actions-bump-r5-e2-20260726083210
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_gate_plumbing
  verified_at: 2026-07-26T08:32:10Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30194630546 @ 73a8d935b7cc9bb649b2baee265379b7b207274a
    ok  checkout ran with fetch-depth: 0
    ok  the checkout under test is v7
    ok  pre-merge-check emitted 5 per-feature verdict line(s)
    ok  no shallow-history or unresolvable-base complaint anywhere in the log
    fetch-depth: 0 under checkout@v7 gave pre-merge-check.sh a usable base at 73a8d935b7cc9bb649b2baee265379b7b207274a

    The run's overall conclusion is not success, and that is expected: the Acceptance Gate job is red because five per-feature verdict lines report bookkeeping state, one of them this feature awaiting its own signature. That is precisely why AC-2 was narrowed — see Analyst item 7. What this eval asserts is the plumbing: checkout@v7 ran with fetch-depth: 0 and pre-merge-check reached acceptance logic.

- eval: E3
  run_id: ci-actions-bump-r5-e3-20260726083211
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_jobs_green
  verified_at: 2026-07-26T08:32:11Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30194630546 @ 73a8d935b7cc9bb649b2baee265379b7b207274a
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    all requested jobs succeeded at 73a8d935b7cc9bb649b2baee265379b7b207274a

    Re-derived from the run object: the four named jobs each carry conclusion `success` at this head SHA under the node24 runtime. The run as a whole concluded otherwise because of the Acceptance Gate job, which this eval deliberately does not depend on.

- eval: E4
  run_id: ci-actions-bump-r5-e4-20260726083212
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_docker_dryrun_guard
  verified_at: 2026-07-26T08:32:12Z
  output: |
    dry-run guard present:          push: ${{ github.ref_type == 'tag' }}
    a workflow_dispatch run builds both platforms and publishes nothing

    Static half of AC-4. The dynamic half is E5/E6: an actual dispatched run that succeeded and wrote nothing.

- eval: E5
  run_id: ci-actions-bump-r5-e5-20260726083213
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_docker_dispatch_green
  verified_at: 2026-07-26T08:32:13Z
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

    Re-derived from the same log independently of the script: `docker/login-action@v4` ran against ghcr.io and reported success, and the build produced 48 `[linux/amd64 …]` and 54 `[linux/arm64 …]` stage lines — both architectures, and the login that covers PR #2.

- eval: E6
  run_id: ci-actions-bump-r5-e6-20260726083214
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_ghcr_untouched
  verified_at: 2026-07-26T08:32:14Z
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

    The registry cross-check is correctly declined: this token carries `gist`, `read:org`, `repo`, `workflow` and not `read:packages`, and a 404 from it would be indistinguishable from absence. The criterion rests on the log half. AC-6 was independently rebuilt from run 30190339168's log this round — five observations, Analyst item 6.

- eval: E7
  run_id: ci-actions-bump-r5-e7-20260726083215
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_desktop_dispatch_green
  verified_at: 2026-07-26T08:32:15Z
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
  run_id: ci-actions-bump-r5-e8-20260726083216
  exit_code: 0
  baseline: red — driven into its failure branches this round on a scratch clone and through a purpose-written `gh` double; see Analyst item 2
  verifier: config:executors.script.ci_no_behaviour_drift
  verified_at: 2026-07-26T08:32:16Z
  output: |
    workflow drift vs origin/main: 16 declared pin line(s), comments, and the dry-run guard (-1 +1); no file added, deleted or renamed

    Re-derived from the diff by hand: every changed line under .github/workflows is one of the 16 declared pin lines (`actions/checkout` v4→v7 at seven sites, `docker/login-action` v3→v4 at one, counted as removed+added), a comment, or the one declared guard line pair. `git diff --name-status` reports three `M` entries and nothing added, deleted or renamed.

## Analyst

### 1. Scope of this round

Round 5 is a full round. All eight evals were executed against the working tree
at commit 73a8d93 and all eight exited zero, each with captured output above.
Every `cmd` was resolved line by line against `_acceptance/config.yaml` before it
was run. `enforcement_mode` is `strict`, read from that file.
`ACCEPTANCE_GATE_BYPASS` was checked with `printf '%s'` and prints nothing, so
`bypass_used` is false. No verdict here rests on an eval script alone: AC-6 was
rebuilt from run 30190339168's log without reference to any script in this
suite, and AC-1, AC-5 and AC-8 were re-derived from the workflow files, the run
objects and the git diff.

### 2. Discrimination: every script and every helper was driven into failure again

Five of these evals read real Actions runs that did not exist before the feature,
so "was it red beforehand" is not an available baseline. The useful question is
whether each guard can fail at all, and whether it fails for the right reason.
Sixty-two mutations and probes were driven this round.

**Method, and the safety rule it respects.** The repository working tree was
never modified and no commit was made in it. Two `--no-hardlinks` clones were
made in a scratch directory outside the repo; every workflow, diff and rename
mutation was committed and reset there. The `gh`-backed scripts were driven
through a freshly written `gh` test double placed on `PATH` — not one left behind
by a previous round — seeded with run JSON and job logs captured from the real
runs. Before any mutation was applied, the unmutated double was checked to
reproduce the real output of `check-gate-plumbing.sh` and `check-run-jobs.sh`
byte for byte, so a difference later in the matrix is attributable to the
mutation and not to the harness. Every mutation printed its effect on the target
(occurrence counts, remaining lines, changed-line counts, job and step
conclusions) before its result was read, so a silent no-op could not be recorded
as a pass.

- `check-action-pins.sh` (8 mutations) — one checkout site downgraded to v4; a
  site deleted; a site replaced by a comment naming the pin; the login pin
  downgraded to v3; a pin moved to `@v4.9.9-evil`; a pin moved to `@main`; an
  eighth checkout site added; the `.github/workflows` directory absent. Seven
  named the offence and terminated unsuccessfully; the missing directory is
  declined rather than answered. One further probe found a defect — item 4.
- `check-docker-dryrun.sh` (6 mutations) — `push: true` restored; the `push:`
  input deleted; a second valued `push:` input added; the guard gated on
  `github.event_name` instead of `github.ref_type`; the comparison inverted to
  `!=`; the file missing. All caught or declined.
- `check-workflow-drift.sh` (16 mutations) — the three round-4 survivors
  (re-driven, item 3); `ci.yml` moved into a subdirectory, deleted, moved out of
  the workflows directory, duplicated as `.yaml`; a new workflow file added;
  `runs-on` changed; a `pull_request_target` trigger added; a permission added; a
  `with:` input added under a checkout step; a trailing comment appended to a
  declared pin; a checkout pin taken to `v8`, above E1's floor; the guard line
  added twice; a guard-shaped line planted in `ci.yml`; the guard's value
  altered; an unresolvable base ref. Fifteen terminated unsuccessfully naming the
  offending line; the unresolvable base is declined. **No survivors.**
- `check-run-jobs.sh` (4 probes) — a named job unsuccessful; a named job absent
  from the run; a named job skipped; too few arguments. All caught or declined.
- `check-dispatch-run.sh` (12 probes across both keys) — a run whose
  `.github/workflows` tree differs from HEAD's; a run head SHA git cannot
  resolve; a required step absent; a required step unsuccessful; every job
  skipped; a log showing only one architecture; the log unreadable; an unknown
  key; one desktop matrix leg absent; the release-upload step marked as having
  run; the tag-only jobs marked as having run. All caught or declined.
- `check-ghcr-untouched.sh` (11 probes) — the runner resolving `push: true`; the
  resolved input absent from the log; a `pushing manifest` line injected; an
  `exporting to registry` line injected; buildx invoked with `--push`; no buildx
  invocation; a log too short to have built anything; the log unreadable; a
  differing workflow tree; and, with a token that CAN read packages, a version
  created after the run started and only pre-existing versions. All caught or
  declined; the innocent shape correctly passes.
- `gh-run-lib.sh` (11 probes) — `require_gh` with `gh` absent from `PATH` and
  with `gh` unauthenticated; `workflow_file` with an unknown key; `find_run` with
  `gh run list` failing, with zero runs returned, and with an unknown key both
  through the assignment form the call sites use and directly; `run_json` with
  `gh run view` failing; `head_sha` outside a repository; `assert_run_finished`
  on an in-flight run; `assert_run_complete` on a finished-but-unsuccessful run.
  Every one refuses or reports rather than passing.

### 3. Both fixes claimed for this HEAD were re-driven and both hold

Each was tested by reproducing the exact mutation that defeated the previous
version, not by reading the diff.

1. **The drift check now pairs on the whole pin, ref included.** The three
   round-4 survivors were re-driven in the scratch clone and all three now
   terminate unsuccessfully, each naming the offending line with `<- not a
   declared bump`: `docker/setup-buildx-action@v3` → `@main` (the mutable-branch
   supply-chain case), `actions/setup-node@v4` → `@v99` (an out-of-scope action
   the contract names explicitly), and `actions/checkout@v7` → `@v4.9.9-evil`.
   Five further shapes in the same family were added this round and all five are
   caught: a checkout pin taken to `v8` — above E1's floor, so E1 alone would not
   object; a trailing comment appended to an otherwise-declared pin; the guard
   line added twice; a guard-shaped `push:` line planted in `ci.yml` rather than
   `docker-publish.yml`; and the guard's value altered to `'branch'`. **Fixed.**
2. **A workflow file added, deleted or renamed now fails.** Round 4 recorded that
   moving `ci.yml` aside disables the whole suite without changing a line inside
   any file. Five shapes were driven: `ci.yml` renamed within the directory,
   moved into a subdirectory, deleted, moved outside `.github/workflows`, and a
   new workflow file added. All five terminate unsuccessfully — the first two via
   the new `--name-status` check reporting `R100`, the rest via that check or the
   line classifier. The rename case is worth noting because it is the one the
   line loop cannot see at all: a 100%-similar rename produces no `+`/`-` content
   lines, and the `--name-status` check is what catches it. **Fixed.**

The `[ -z "$diff" ] → exit 0` early return was checked against the rename case
specifically, since an early clean return before the `--name-status` check would
have reopened the hole: git emits `similarity index` / `rename from` / `rename
to` header lines for a pure rename, so `$diff` is non-empty and control reaches
the file-level check. That is load-bearing and worth keeping in mind if the early
return is ever moved.

### 4. FALSE PASS FOUND — the pin check counts occurrences per line, not sites

`check-action-pins.sh` matches candidate lines with an anchored pattern, which is
round 3's fix and works: a standalone comment line naming a pin is not counted.
But it then extracts the pins with

    grep -oE "${action}@v[0-9]+"

which emits **every occurrence on each matched line**, and the site count is the
number of occurrences rather than the number of matching lines. So a trailing
comment on a surviving `uses:` line inflates the count by one, and can pay for a
site deleted somewhere else.

Driven in the scratch clone. Starting from the real tree, the `actions/checkout`
step was deleted outright from `docker-publish.yml` — leaving that workflow with
no checkout at all — and a comment was appended to the surviving checkout line in
`desktop-release.yml`:

    - uses: actions/checkout@v7 # mirrors actions/checkout@v7 in ci.yml

Six real sites remain. E1 exits zero and reports:

    ok actions/checkout: 7 site(s), all >= v7
    ok docker/login-action: 1 site(s), all >= v4
    action pins: at or above the contracted floor at every site

This is the same class of defect the script's own comment claims to have closed —
"counting bare text let a deleted step be replaced by `# was:
actions/checkout@v7` and still count, verbatim the substitution this check exists
to catch". Round 3 anchored the *line* match; the *occurrence count* was left on
`grep -o`, so the substitution still works, just from a comment attached to a
surviving line instead of a standalone one.

**How far it reaches.** On this PR's diff, E8 does catch it: the line carrying
the comment is a changed `uses:` line and is not a declared bump, so the drift
check names it. But that is a property of the diff, not of AC-1. AC-1 is a
whole-tree claim — "no `actions/checkout@v` below 7 … remain anywhere", plus the
seven sites still being present — and E1 is its only eval. E8 is scoped to
`BASE...HEAD` and is silent about anything already on the base. This was
demonstrated rather than argued: a second scratch clone was built whose base
already contains the deletion and the comment, with the branch making only an
unrelated comment edit. On that pair E8 exits zero ("0 declared pin line(s) …
no file added, deleted or renamed") **and** E1 exits zero reporting seven sites,
on a tree where `docker-publish.yml` has no checkout step. E1's own failure
message — "a site was added or removed — re-read the contract before changing
this number" — is exactly the sentence that does not appear.

The bias is one-directional and worth stating precisely. A trailing comment
naming a **lower** version (`# TODO revert to actions/checkout@v4`) is caught,
because the extra occurrence trips the floor test. Only a mention at or above the
floor is silently absorbed, and only where the expected site count exceeds one —
`docker/login-action`, with one expected site, fails on the inflation instead.

The minimal fix is to strip a trailing `#…` from the line before extracting, or
to count matching lines and take one pin per line.

**AC-1's verdict is unaffected.** It was re-derived by hand this round: `grep -rn
'uses:' .github/workflows` lists exactly seven `actions/checkout@v7` sites —
ci.yml 18, 42, 63, 84, 102; desktop-release.yml 61; docker-publish.yml 23 — and
one `docker/login-action@v4` at docker-publish.yml 32, with no trailing comment
on any of them. The claim is true on this tree; what a green E1 does not
establish is that it would still be true after an edit.

### 5. No other false pass was found

Every other guard in the suite either terminates unsuccessfully or declines to
answer on every shape driven at it. Three specific properties were checked
against the recurring "announces clean when it could not look" failure mode, and
all three hold:

- **Unreadable inputs are declined, never passed.** A missing workflow directory,
  a missing workflow file, an unresolvable base ref, an absent `gh`, an
  unauthenticated `gh`, a failing `gh run list` or `gh run view`, an unreadable
  job log, an empty job log, a log too short to have built anything, a run
  head SHA git cannot resolve, and a run still in flight all produce a distinct
  non-answer rather than a pass.
- **Absence of evidence is not evidence.** `check-ghcr-untouched.sh` probes the
  token's package scope before reading the registry and, finding it absent — this
  token carries `gist`, `read:org`, `repo`, `workflow` and not `read:packages` —
  reports the cross-check as unavailable and rests the verdict on the log half,
  which needs no scope. Its own comment says a 404 from a token that cannot see
  the package is indistinguishable from a package that does not exist, and the
  code matches the comment.
- **A green run is not accepted as a green step.** `check-dispatch-run.sh`
  requires each named step by name and fails when one is absent, and refuses a
  run in which every job was skipped. Removing `Log in to GHCR` or `Cache cargo
  registry` from the run JSON fails with "the bumped action was never reached".

Two observations that are not defects but bound what the green means:

- **E5/E6/E7 pin on the workflow *tree*, not the commit.** The dispatched runs
  are at b48699c and HEAD is 73a8d93; the scripts compare
  `HEAD:.github/workflows` against the run's, which match. This is deliberate and
  documented in the script. It is sound for AC-5 and AC-7, which are claims about
  the actions, and the delta between the two commits is only `_acceptance/**` and
  `scripts/ci/**` — no application code, and `docker-publish.yml` builds with
  `context: .`. Worth knowing rather than fixing: a change to the Dockerfile or to
  application code after a dispatch would not re-open these evals.
- **E8's comment skip is safe here only because the workflows contain no
  heredocs.** Changed lines whose first non-space character is `#` are treated as
  behaviour-free. That is true of YAML comments and false of, say, a shebang
  written into a file from a `run: |` block. `grep -nE '<<|#!'` over the three
  workflow files returns nothing, and every `#` line in them is a genuine YAML
  comment, so the assumption holds on this tree.

### 6. AC-6 re-derived from the run's own log, independently of any script here

Run 30190339168 (`workflow_dispatch`, concluded successfully, head b48699c,
06:01:26Z → 06:23:22Z). Five observations, read straight from the 3,576-line job
log with `grep`, none of them via `check-ghcr-untouched.sh`:

1. **The runner resolved the input to false.** The `Build & push` step's echoed
   inputs show `context: .`, `platforms: linux/amd64,linux/arm64`, and
   `push: false`, with `tags: ghcr.io/phanlemanh/oneflow:sha-b48699c`. The tag was
   computed; nothing was pushed to it.
2. **The buildx command line carries no push instruction.** The full invocation is
   `docker buildx build` with `--cache-from type=gha`, `--cache-to
   type=gha,mode=max`, `--iidfile`, ten `--label`s, `--platform
   linux/amd64,linux/arm64`, `--attest type=provenance,mode=max`, `--tag
   ghcr.io/phanlemanh/oneflow:sha-b48699c`, `--metadata-file`, and `.`. There is
   no `--push`, no `--load` and no `--output`.
3. **Buildx says so itself.** The build ends with the builder's own advisory: no
   output was specified with the docker-container driver, so the result remained
   in the build cache. That is the builder stating it wrote the image nowhere,
   which is stronger than any observation of the registry afterwards.
4. **The only export stage is the cache.** Across the whole log the single
   `exporting to …` line is `#42 exporting to GitHub Actions Cache`. A
   case-insensitive search for `docker push`, `pushing manifest`, `pushing layer`,
   `exporting to registry`, `exporting to image` and `--output type=registry`
   returns zero matches.
5. **Login is not publication, and it did happen.** `docker/login-action@v4`
   ran against `ghcr.io` and reported success. That is AC-5's evidence for PR #2;
   authenticating to a registry writes nothing to it.

Both architectures are present in the same log — 48 `[linux/amd64 …]` build stage
lines and 54 `[linux/arm64 …]` — which is AC-5's cross-arch half, also read
directly rather than from the script.

The registry listing was deliberately not used: this token cannot read packages,
and a 404 from it would be indistinguishable from absence. The criterion is
carried entirely by the four log observations above, which need no scope at all.

### 7. Judgement on the contract's AC-2 amendment

**The amendment is sound and should be accepted.** AC-2 originally required the
`Acceptance Gate` job to pass. That job runs `pre-merge-check.sh`, whose verdict
is dominated by acceptance bookkeeping: a feature awaiting its Gate 2 signature
keeps it red however well git behaved. The run at this HEAD demonstrates it
concretely — the `ci.yml` run concluded unsuccessfully while `Lint`, `Type
Check`, `Build` and `SDK Tests (Python)` all concluded successfully, and the gate
job's log shows the five per-feature lines that make it red, one of which is
`ci-actions-bump` itself pending its signature. Evidence must exist before the
signature; a criterion satisfiable only after it is circular, and no amount of
correct behaviour by `actions/checkout@v7` could have satisfied the original
wording.

The narrowed criterion is the right one because it is exactly what the bump can
be held to. What `fetch-depth: 0` under a new major must deliver is a usable base
for the diff, and the narrowed eval asserts precisely that and nothing else: the
job ran `actions/checkout@v7`, it ran with `fetch-depth: 0`, `pre-merge-check.sh`
emitted real per-feature verdict lines rather than a plumbing complaint, and no
shallow-history or unresolvable-base message appears anywhere in the log. A
checkout that had broken `fetch-depth: 0` would fail every one of those.

Three things are worth the human's attention before accepting:

- **A criterion approved at Gate 1 is being narrowed after implementation.** That
  is the shape of moving the goalposts, and the reason it is defensible here is
  that the original was unsatisfiable by construction rather than merely hard —
  and that the contract records the change in its own section rather than editing
  AC-2 in place. The amendment is legible to the human deciding.
- **The Acceptance Gate job's colour is now covered by no eval.** It is enforced
  by the merge itself, not by this contract. That is a real reduction in what the
  gate asserts, and it should be accepted deliberately.
- **The narrowed eval is genuinely discriminating**, which is what makes it worth
  having rather than a formality. It was driven into eight distinct failures this
  round: a missing gate job, a log without `fetch-depth: 0`, an empty log from a
  skipped job, an unreadable log, a job that ran `checkout@v4`, a log with no
  per-feature verdicts, an injected `fatal: bad revision`, and an injected
  `shallow` complaint. The first four are declined as non-answers; the last four
  terminate unsuccessfully.

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

## Gate 2 checklist (human)

- [ ] Read `## Analyst` item 4 first. It is the finding that changes what a green
      E1 means: the pin check counts occurrences per line, so a trailing comment
      naming the action can conceal a deleted checkout site, and on a tree where
      the concealment predates the branch both E1 and E8 report clean. AC-1 is
      true on this tree — that was re-derived by hand — but decide whether the
      one-line fix lands in this PR or is tracked as follow-up.
- [ ] Note what is now closed: round 4's two findings were both re-driven and
      both hold (`## Analyst` item 3). An action repointed at a mutable branch,
      an out-of-scope action bumped, and a workflow file renamed or moved aside
      all now fail.
- [ ] Read E6's block: the criterion is carried by the build log (resolved
      `push: false`, a buildx command line with no `--push` and no `--output`,
      the only export stage being the GitHub Actions Cache, and buildx's own
      statement that the result stayed in the cache), not by the registry
      listing, which this token cannot read and which the script correctly
      declines to use.
- [ ] Confirm you accept the AC-2 amendment as recorded in the contract; the
      verifier's reasoning is in `## Analyst` item 7, which recommends accepting
      it. Two costs to accept deliberately: the Acceptance Gate job's colour is
      now covered by no eval and is enforced only by the merge itself, and the
      amendment narrows a criterion that was already approved at Gate 1.
- [ ] If you accept, fill the signature field in frontmatter — it is empty and
      must be filled by a human, in its own human-fields-only commit — and
      `time_human_minutes.gate2` in the contract.
