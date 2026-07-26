---
schema_version: 2
feature_slug: ci-actions-bump
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 4)
enforcement_mode: strict
bypass_used: false
verified_commit: a751b5fa7b842cf9373d1b358dc47b015fd10e7f
human_signoff:
---

# Evidence Report: ci-actions-bump

Round 4 is a full re-verification at commit a751b5f: all eight evals executed,
all eight exited zero, each with captured output below. Rounds 1, 2 and 3 each
found defects in these eval scripts, so this round assumed a fourth crop existed
and went looking for it. It found one — reported in Analyst item 4. It
concerns what E8's guard can see, not the truth of AC-8 on this tree, which was
re-derived by hand from the diff below.

Nothing was taken on trust from the previous rounds. Every `cmd` was resolved
line by line against `_acceptance/config.yaml`; five criteria were additionally
re-derived from primary sources — the runs' own logs, the run objects, the
artifact and release APIs, and the git diff — independently of the script that
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
  run_id: ci-actions-bump-r4-e1-20260726075840
  exit_code: 0
  baseline: red — driven into its failure branch this round on a scratch clone; see `## Analyst` item 2
  verifier: config:executors.script.ci_actions_pinned
  verified_at: 2026-07-26T07:58:40Z
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
  run_id: ci-actions-bump-r4-e2-20260726075847
  exit_code: 0
  baseline: red — nine mutations of the run JSON and job log, each caught or declined; see `## Analyst` item 2
  verifier: config:executors.script.ci_gate_plumbing
  verified_at: 2026-07-26T07:58:47Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30193626163 @ a751b5fa7b842cf9373d1b358dc47b015fd10e7f
    ok  checkout ran with fetch-depth: 0
    ok  the checkout under test is v7
    ok  pre-merge-check emitted 5 per-feature verdict line(s)
    ok  no shallow-history or unresolvable-base complaint anywhere in the log
    fetch-depth: 0 under checkout@v7 gave pre-merge-check.sh a usable base at a751b5fa7b842cf9373d1b358dc47b015fd10e7f

    Re-derived independently of the script, from the Acceptance Gate job log of
    run 30193626163 (the ci.yml run at this branch's head SHA). Provenance of the
    matched string was checked rather than assumed — the `fetch-depth: 0` match is
    the checkout step's own input echo, inside the `Run actions/checkout@v7` step
    group, not an incidental mention elsewhere in the log:

      Set up job              Download action repository 'actions/checkout@v7'
                                (SHA:3d3c42e5aac5ba805825da76410c181273ba90b1)
      Run actions/checkout@v7 ##[group]Run actions/checkout@v7
      Run actions/checkout@v7   with:
      Run actions/checkout@v7     fetch-depth: 0
      Run actions/checkout@v7     repository: phanlemanh/OneFlow

    And the gate then reached acceptance logic rather than stopping at git: the
    log carries five per-feature verdict lines, one for each feature under
    `_acceptance/`, each naming the feature and the bookkeeping state it found —
    this feature's PASS report awaiting its Gate-2 signature, and the four merged
    features stale against the pin they carried into this round. That is only
    reachable once the base ref has resolved and a file-level diff has been
    produced. No shallow-history, `unknown revision` or unresolvable-base
    complaint appears anywhere in the 211-line job log.

- eval: E3
  run_id: ci-actions-bump-r4-e3-20260726075859
  exit_code: 0
  baseline: red — a named job absent, a named job unsuccessful, a named job skipped, a run with no jobs and a run still in flight are each caught; see `## Analyst` item 2
  verifier: config:executors.script.ci_jobs_green
  verified_at: 2026-07-26T07:58:59Z
  output: |
    run https://github.com/phanlemanh/OneFlow/actions/runs/30193626163 @ a751b5fa7b842cf9373d1b358dc47b015fd10e7f
    ok job 'Lint': success
    ok job 'Type Check': success
    ok job 'Build': success
    ok job 'SDK Tests (Python)': success
    all requested jobs succeeded at a751b5fa7b842cf9373d1b358dc47b015fd10e7f

    Confirmed against the run object directly (`gh run view 30193626163 --json
    jobs`): the run contains five jobs — Lint, Type Check, Build, SDK Tests
    (Python) and Acceptance Gate — and the four named above each carry conclusion
    `success` under the node24 runtime. The run is `status: completed`, so these
    are final results rather than a snapshot of something still moving.

- eval: E4
  run_id: ci-actions-bump-r4-e4-20260726075907
  exit_code: 0
  baseline: red — eleven mutations of the guard line, each caught; see `## Analyst` item 2
  verifier: config:executors.script.ci_docker_dryrun_guard
  verified_at: 2026-07-26T07:59:07Z
  output: |
    dry-run guard present:          push: ${{ github.ref_type == 'tag' }}
    a workflow_dispatch run builds both platforms and publishes nothing

    Re-read from the file this round: `.github/workflows/docker-publish.yml`
    carries exactly one `push:` line bearing a value — line 64, the
    build-push-action input — and it resolves to false for any ref that is not a
    tag. The other `push` in the file is the bare trigger key at line 4, which
    has a block under it rather than a value, so the two cannot be confused.

- eval: E5
  run_id: ci-actions-bump-r4-e5-20260726075912
  exit_code: 0
  baseline: red — twelve mutations of the run JSON and log, each caught or declined; see `## Analyst` item 2
  verifier: config:executors.script.ci_docker_dispatch_green
  verified_at: 2026-07-26T07:59:12Z
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

    The platform half was re-counted by hand in the run's own log this round: 48
    build-stage lines prefixed `[linux/amd64 ` and 54 prefixed `[linux/arm64 `.
    The buildx command line carries `--platform linux/amd64,linux/arm64`, and the
    step concluded successfully, so both architectures were genuinely produced
    rather than merely requested. The step that carries PR #2's action reported
    `Login Succeeded!`, and the run's credentials were removed afterwards by the
    post step. The run's `.github/workflows` tree object is identical to HEAD's
    (c2bd8c6), so this is a dry run of the workflow content being merged.

- eval: E6
  run_id: ci-actions-bump-r4-e6-20260726075923
  exit_code: 0
  baseline: red — eleven mutations of the run JSON, the log and the package listing, each caught or declined; see `## Analyst` item 2
  verifier: config:executors.script.ci_ghcr_untouched
  verified_at: 2026-07-26T07:59:23Z
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

    AC-6 was re-derived from run 30190339168's log again this round,
    independently of the script, and rests on five observations rather than on
    the registry:

      1. The run's own metadata: `event: workflow_dispatch`, `status: completed`,
         `conclusion: success`, head b48699c. It is the dispatch under test.
      2. The only `push:` input line in the whole 3576-line log is the runner's
         echo of the resolved build-push inputs, and it reads `push: false`.
         `load:` reads false in the same block.
      3. The buildx command line was read flag by flag. It carries
         `--cache-from`, `--cache-to`, `--iidfile`, eight `--label`,
         `--platform`, `--attest`, `--tag` and `--metadata-file`. There is no
         `--push`, no `--output` and no `--load`.
      4. Zero lines anywhere match `pushing manifest`, `pushing layer`,
         `pushing blob`, `exporting to image`, `exporting to registry` or
         `--output type=registry`. The only export stage in the run reads
         `#42 exporting to GitHub Actions Cache`, which is the `cache-to:
         type=gha,mode=max` input doing its job.
      5. buildx's own closing statement, which is the strongest form of this
         evidence because the builder is describing what it did:
           "No output specified with docker-container driver. Build result will
            only remain in the build cache. To push result image into registry
            use --push or to load image into docker use --load"

    The tag `ghcr.io/phanlemanh/oneflow:sha-b48699c` was computed by the metadata
    step and never pushed. `Login Succeeded!` appears — logging in to a registry
    is not publishing to it, and that login is what proves PR #2's action for
    AC-5. The registry listing was NOT used as evidence: this token holds scopes
    gist, read:org, repo and workflow, and not `read:packages`, so the script's
    scope probe fails and it declines to read a 404 from the versions endpoint
    either way. I make the same declaration in my own words: I could not observe
    the GHCR namespace, and I do not claim the package is absent — I claim the
    builder never attempted a write, which the log settles on its own.

- eval: E7
  run_id: ci-actions-bump-r4-e7-20260726075938
  exit_code: 0
  baseline: red — seven mutations covering a missing leg, a skipped leg, an unsuccessful step, an absent required step and the release-upload step having run, each caught; see `## Analyst` item 2
  verifier: config:executors.script.ci_desktop_dispatch_green
  verified_at: 2026-07-26T07:59:38Z
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

    The suppression half was re-derived independently again this round: `gh
    release list` returns nothing, and `GET repos/phanlemanh/OneFlow/releases`
    returns an array of length 0 — so no Release, draft or public, exists at all,
    let alone one created by the dispatch. The positive half was corroborated
    from the run's artifacts rather than from step names: run 30190355369 holds
    TongFlow-mac-universal.dmg (8,234,308 bytes) and TongFlow-win-x64.msi
    (3,338,000 bytes), one per matrix leg, both inside the 1–30 MB band the
    workflow's own sanity check enforces. Both `cache@v6` steps ran and succeeded
    on the two runner OSes ci.yml never touches.

- eval: E8
  run_id: ci-actions-bump-r4-e8-20260726075946
  exit_code: 0
  baseline: red — sixteen mutations, thirteen caught and three residuals reported; see `## Analyst` items 2 and 4
  verifier: config:executors.script.ci_no_behaviour_drift
  verified_at: 2026-07-26T07:59:46Z
  output: |
    workflow drift vs origin/main: 8 matched pin pair(s), comments, and the declared dry-run guard (-1 +1)

    AC-8 was re-derived by hand this round rather than accepted from the script,
    because the script is still weaker than the criterion (`## Analyst` item 4).
    The complete diff under .github/workflows against origin/main is 26 changed
    lines, every one of which was classified individually:

      16 lines  eight matched removed/added PAIRS, each the SAME action path with
                only the major version changed — seven of actions/checkout v4→v7
                (ci.yml ×5, desktop-release.yml ×1, docker-publish.yml ×1) and one
                of docker/login-action v3→v4. No action was added, removed, or
                swapped to a different publisher.
       8 lines  added comment lines in docker-publish.yml, documenting the guard.
       2 lines  the declared dry-run guard itself: `push: true` removed and
                `push: ${{ github.ref_type == 'tag' }}` added, in
                docker-publish.yml, which the contract declares in advance.

    Counted mechanically as a cross-check: 26 changed lines, of which 16 match
    `uses:`, 8 are comment lines, and 2 are the guard pair — leaving zero lines
    in any other class. No trigger, permission, job, `runs-on`, `if:`, input or
    step was altered. The criterion holds on this tree, established from the diff
    itself rather than from the guard.

## Analyst

### 1. Scope of this round

Round 4 is a full round. All eight evals were executed and all eight exited zero,
each with captured output above. Five criteria (AC-1, AC-2, AC-3, AC-6, AC-7)
were re-derived from primary sources — the run objects, the Acceptance Gate and
docker job logs, the artifacts and releases APIs — and AC-8 from the git diff
line by line, so no verdict rests on an eval script alone.

`enforcement_mode` is `strict`, read from `_acceptance/config.yaml`.
`ACCEPTANCE_GATE_BYPASS` was checked with `printf '%s'` and prints nothing, so
`bypass_used` is false.

### 2. Discrimination: every script and every helper was driven into failure again

The baseline question for these evals is not "was it red before the feature" —
five of them read real Actions runs that did not exist beforehand. The useful
question is whether each guard can fail at all, and whether it fails for the
right reason. Around eighty mutations and probes were driven this round.

**Method, and the safety rule it respects.** The repository working tree was
never modified and no commit was made in it. A `--no-hardlinks` clone was made in
a scratch directory outside the repo and every workflow and diff mutation was
committed and reset there. The `gh`-backed scripts were driven through a freshly
written `gh` test double on `PATH` — not the one a previous round left behind —
seeded with fixtures captured from the real runs, so the unmutated double
reproduces the real output before any mutation is applied. Every mutation was
verified to have actually changed the file before its result was believed: the
first pass silently produced two no-ops (a BSD-`sed` address form and a pattern
that did not exist in the target file), each of which would have read as a false
pass, and the harness was changed to print the applied diff and refuse a no-op.

- `check-action-pins.sh` (7 mutations) — one site downgraded to v4; the login pin
  downgraded to v3; a checkout step deleted; an eighth checkout step added; a step
  replaced by a comment naming the pin; the login pin raised above the floor
  (correctly still passes). Each failure named the offence and terminated
  unsuccessfully. With no `.github/workflows` directory it declines to answer.
- `check-docker-dryrun.sh` (11 mutations) — the file missing; the `push:` input
  deleted; `push: true` restored; a second `push:` input added; the guard gated on
  `github.event_name`; the comparison inverted to `!=`; `push: false`; the
  expression double-quoted; the expression with a trailing comment. All caught or
  declined. Extra inner whitespace inside `${{ }}` correctly still passes.
- `check-workflow-drift.sh` (16 mutations) — the three round-3 survivors (below);
  a permissions escalation `contents: read` → `write`; a `pull_request_target`
  trigger added; a `run:` command extended; a duplicate insertion of an
  already-paired action; a base ref that cannot be resolved. Thirteen caught,
  three residuals reported in item 4.
- `check-run-jobs.sh` (8 probes) — too few arguments; an unknown workflow key; a
  job name absent from the run; a named job unsuccessful; a named job skipped; a
  run with no jobs at all; and the named jobs green while the run is still in
  flight. All caught or declined.
- `check-dispatch-run.sh` (19 probes across both keys) — no key and an unknown
  key; a run head SHA git cannot resolve; a run whose `.github/workflows` tree
  differs from HEAD's; the run concluded unsuccessfully; a run with no jobs; every
  job skipped; a required step absent; a required step unsuccessful; the log
  showing only one architecture; the log unreadable; one desktop matrix leg
  absent; one leg skipped; the `Cache cargo registry` step absent; the installer
  sanity check unsuccessful; the release-upload step marked as having run; the run
  still in flight. All caught or declined.
- `check-ghcr-untouched.sh` (15 probes) — a differing workflow tree; an
  unresolvable run SHA; a run still in flight; the log unreadable; a log too short
  to have built anything; the runner resolving `push: true`; the resolved input
  absent; a `pushing manifest` line injected; buildx invoked with `--push`; no
  buildx invocation; and, with a token that CAN read packages, a version created
  after the run started, only pre-existing versions, a genuine 404, and a 500.
  All caught or declined; the two innocent shapes correctly pass.
- `gh-run-lib.sh` (13 probes) — `workflow_file` with a valid and an unknown key,
  the latter both directly and through a command substitution; `require_gh` with
  `gh` absent and with `gh` unauthenticated; `head_sha` outside a repository;
  `find_run` with an unknown key, with `gh run list` failing, with zero runs
  returned, and with several runs (it takes the highest `databaseId`); `run_json`
  with `gh run view` failing; `assert_run_finished` on an in-flight run;
  `assert_run_complete` on a finished-but-unsuccessful run. Every one refuses or
  reports rather than passing.

### 3. The three fixes claimed for a751b5f were re-driven and all three hold

Each was tested by reproducing the exact mutation that defeated the previous
version, not by reading the diff.

1. **The drift check's three round-3 survivors.** Inserting a brand-new step
   `- uses: evil/exfiltrate@v1` into the `Lint` job now reports "action(s) added
   that replace nothing" and terminates unsuccessfully. Swapping the publisher at
   the same version (`docker/login-action@v4` → `evil/login-action@v4`) reports
   the same. Deleting a `uses:` step outright reports "action(s) removed with no
   replacement". A fourth shape was added this round and is also caught:
   duplicating an already-paired action as an extra step leaves an unmatched
   addition, because `comm` compares the sorted lists as multisets rather than
   sets. **Fixed.**
2. **`find_run`'s workflow key.** `gh-run-lib.sh` now resolves the key in an
   inline `case` inside `find_run` itself. Driven through the test double with the
   trace enabled, `--workflow` was never once empty: every query carried
   `ci.yml`, `docker-publish.yml` or `desktop-release.yml`. Called with an unknown
   key in the assignment form all four call sites use, it refuses and the caller
   terminates. **Fixed in the library, not only at the call sites** — which is
   what round 3 asked for.
3. **`check-ghcr-untouched.sh` pins its run to HEAD's workflow tree.** Fed a run
   whose head SHA carries `origin/main`'s `.github/workflows` tree, it now reports
   "this run used a different .github/workflows tree than HEAD" and terminates.
   Fed a head SHA git cannot resolve, it declines rather than guessing. **Fixed** —
   round 3 recorded this as a minor residual and it is now closed.

The `---` case arm was also narrowed as claimed: it matches `--- a/…` and
`--- /dev/null` only, so a removed line beginning `--` is no longer swallowed
generically. One narrow shape survives — see item 4.

### 4. FALSE PASS FOUND — the drift check pairs on the action path and ignores the ref

`check-workflow-drift.sh` now pairs additions to removals, which closed round 3's
three survivors. But it pairs on the action **path** only: `action="${pin%%@*}"`
discards everything after the `@`. So any change to what a `uses:` line actually
resolves to — as long as the publisher and repository stay the same — is a
matched pair and passes as clean. Three shapes were driven this round in the
scratch clone and all three passed with exit zero:

- **An out-of-scope action repointed to a mutable branch.**
  `docker/setup-buildx-action@v3` → `docker/setup-buildx-action@main` passes,
  reported as "9 matched pin pair(s)". This is the serious one: the action now
  resolves to whatever that branch's tip contains at run time, which is a
  standing supply-chain change, and CI would stay green because the action still
  works. `check-action-pins.sh` does not catch it either — E1 floors only
  `actions/checkout` and `docker/login-action`, and this is neither. **No eval in
  this suite catches it.**
- **An out-of-scope action silently bumped a major.**
  `actions/setup-node@v4` → `@v99` at all four sites passes, reported as "12
  matched pin pair(s)". The contract's "Out of scope" section names
  `actions/setup-node` explicitly among the actions not to be bumped alongside,
  so this is exactly the thing AC-8's prose forbids.
- **A pin moved to an arbitrary tag.** `actions/upload-artifact@v4` →
  `@v4.9.9-evil` passes.

AC-8's own eval text reads "every line this branch changes … is a `uses:` pin
line", which these mutations satisfy literally. The criterion in the contract is
stronger — "no job, trigger, permission or input is altered under cover of the
bump" — and the version on a `uses:` line is the input that decides what code
runs. Round 3's fix established that "it is a `uses:` line" is too weak a test;
the same argument applies one level down. The fix is to pair on the whole pin and
require the action path to be identical AND the ref to move only within the
contracted set — or, minimally, to refuse a ref that is not `v<digits>`.

Two further residuals in the same script, both narrow:

- **A pure rename or move is invisible.** Git records a 100%-similar rename as
  `R100` with no `+`/`-` content lines, so the loop sees nothing. Moving
  `.github/workflows/ci.yml` to `.github/workflows/disabled/ci.yml` — which
  disables the whole CI workflow, because Actions only loads files at the top
  level of that directory — is reported as "8 matched pin pair(s)", exit zero.
  `check-action-pins.sh` also passes it at "7 site(s)", because its `grep -r`
  descends into the new subdirectory. The suite as a whole does not false-pass:
  E2 and E3 would then find no `ci.yml` run at HEAD and decline to answer. But
  two evals describe a tree they have mis-read.
- **The `---` arm still swallows one exact shape.** Removing a workflow line whose
  content is literally `-- a/<anything>` (or `-- /dev/null`) renders in the diff as
  `--- a/<anything>`, matches the file-header arm and is skipped; the script then
  reports "0 matched pin pair(s)", exit zero. Demonstrated in the scratch clone
  against a synthetic base. It needs a column-0 `--` line, which is not valid
  YAML in any position these workflows use, so it is a parser hole rather than an
  exploitable one.

**None of these changes AC-8's verdict**, because the criterion was established
from the actual 26-line diff by hand (see E8's block) and that diff contains only
matched same-action, version-only pairs, comments, and the declared guard. But
E8's green must be read as "this diff was inspected and classified", not "this
guard would have stopped a behaviour change".

### 5. The round-3 latent defect is closed

Round 3 recorded that `find_run` resolved its workflow key through a nested
command substitution, where bash does not apply `set -e`, so an unknown key left
`--workflow` empty and any run answered the query. That is fixed at the library
level in a751b5f and was re-driven here. Called as
`id="$(find_run bogus)"` — the form all four call sites use — it prints the
refusal and the caller terminates with status 2.

One cosmetic residual: called in a non-assignment substitution such as
`echo "$(find_run bogus)"`, `return 2` is still swallowed by the substitution and
the sentinel string `UNKNOWN_WORKFLOW_KEY` flows on. No caller uses that form,
and the sentinel would fail the very next `gh run view`, so this is defence in
depth rather than a live path.

### 6. Minor residuals, reported for completeness

- **E7's skipped-step assertion cannot see a rename.** In
  `check-dispatch-run.sh`, a step listed in `SKIPPED_STEPS` that is simply absent
  from the run prints "not taken on a dispatch". If `Upload to draft GitHub
  Release` were renamed and then ran, the check would not notice. The suppression
  half of AC-7 was therefore also established independently, from the releases
  API returning an empty array.
- **E5 and E6 read only the first job's log.** Both use `.jobs[0].databaseId`.
  `docker-publish.yml` has exactly one job today, so both see everything; a second
  job added later would be invisible to them.
- **E6's registry cross-check assumes a user-owned package.** It queries
  `/users/{owner}/packages/...`. This repository's owner is a user account, so
  that is the right endpoint here; if the repo ever moved to an organisation the
  correct endpoint would be `/orgs/{org}/...` and a real package would answer 404,
  which the script would print as "no GHCR package exists". That branch is
  corroboration only and the verdict rests on the log, but the wording would be
  wrong.
- **`check-workflow-drift.sh` is sensitive to git diff configuration.** With
  `diff.noprefix=true` the file headers stop matching and every header becomes an
  offender, so it fails closed — noisy but safe. `diff.mnemonicPrefix=true` does
  not affect a commit-to-commit diff. Neither is set in this repository.
- **Over-strictness in E4**, noted so a future editor is not surprised: the guard
  line must match a single anchored form, so quoting the expression or appending a
  trailing comment is rejected even though YAML would treat it identically. Extra
  whitespace inside `${{ }}` is tolerated. That is the safe direction to be wrong
  in.
- **E1 counts any `uses:` line under `.github/workflows`**, including one in a
  file Actions never loads. That is the safe direction for an added file and the
  unsafe direction for a moved one — see item 4's rename residual.

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
   conclude successfully at a751b5f for exactly five bookkeeping reasons —
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

Round 4 concurs, having read the amendment fresh and checked its factual claim
against the job log rather than against round 3's summary. Every one of the five
verdict lines in the Acceptance Gate job at a751b5f is an acceptance-bookkeeping
complaint — one that this feature's PASS report has no signature yet, four that
merged features are stale against their pin. Not one is a git complaint. The
circularity is demonstrated, not asserted.

Two things a Gate-2 signer should consciously accept rather than have waved
through. First, the amendment narrows a criterion that a human had already
approved at Gate 1; it is a scope change, even though it narrows rather than
widens and is recorded in the contract with its date and reason. Second, the
amendment's closing move — "CI being fully green is enforced by the merge itself"
— is a deferral to a different control, not evidence. It is true of this
repository, and it is the reason the residual is acceptable, but AC-2 now carries
no assertion that the gate job ever goes green.

One looseness in the eval, for the record: `check-gate-plumbing.sh` greps the
whole job log for `fetch-depth: 0` rather than confining the match to the
checkout step's `with:` block. In this run the match is in the right place — the
provenance is quoted in E2's block — but the assertion is weaker than the line it
prints. It fails closed: when the string cannot be found at all the script
declines to answer.

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

## Gate 2 checklist (human)

- [ ] Read `## Analyst` item 4 first. It is the one finding that changes what a
      green E8 means: the drift guard pairs on the action path and ignores the
      ref, so an action could be repointed at a mutable branch — a supply-chain
      change — and pass every eval here. Decide whether that is fixed in this PR
      or tracked as follow-up work.
- [ ] Read E6's block: the criterion is carried by the build log (resolved
      `push: false`, a buildx command line with no `--push` and no `--output`,
      the only export stage being the GitHub Actions Cache, and buildx's own
      statement that the result stayed in the cache), not by the registry
      listing, which this token cannot read and which the script correctly
      declines to use.
- [ ] Confirm you accept the AC-2 amendment as recorded in the contract; the
      verifier's reasoning is in `## Analyst` item 7. Two costs to accept
      deliberately: the Acceptance Gate job's colour is now covered by no eval
      and is enforced only by the merge itself, and the amendment narrows a
      criterion that was already approved at Gate 1.
- [ ] If you accept, fill the signature field in frontmatter — it is empty and
      must be filled by a human, in its own human-fields-only commit — and
      `time_human_minutes.gate2` in the contract.
