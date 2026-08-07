---
schema_version: 2
feature_slug: local-cpu-plugins
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a4c6eca33542e78037b05273a280237194415004
human_signoff: Manh 2026-08-07
---

# Evidence Report: local-cpu-plugins

Verify round 2. The full 26-eval set was re-run from scratch on this tree; no
result was carried over from round 1. E21 is a `judgment` eval: the verify
subagent left it unscored, a blind judge panel scored it separately, and the
orchestrator merged that verdict below — the verify context never judged its
own feature.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E24 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E22 | AC-18 | test | PASS |
| E23 | AC-18 | test | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-10 | script | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | script | PASS |
| E15 | AC-13 | script | PASS |
| E16 | AC-14 | script | PASS |
| E17 | AC-14 | script | PASS |
| E18 | AC-15 | script | PASS |
| E19 | AC-16 | script | PASS |
| E25 | AC-19 | script | PASS |
| E26 | AC-17 | script | PASS |
| E20 | AC-17 | script | PASS |
| E21 | AC-17 | judgment | PASS (blind judge panel) |

## Evidence

- eval: E1
  run_id: local-cpu-plugins-E1-20260807T014801Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_per_plugin
  verified_at: 2026-08-07T01:48:01Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  1 passed | 13 skipped (14)
      Duration  142ms

- eval: E2
  run_id: local-cpu-plugins-E2-20260807T014801Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_common_parent
  verified_at: 2026-08-07T01:48:02Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  1 passed | 13 skipped (14)
      Duration  143ms

- eval: E24
  run_id: local-cpu-plugins-E24-20260807T014802Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_legacy_migration
  verified_at: 2026-08-07T01:48:03Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  2 passed | 12 skipped (14)
      Duration  142ms
    (both halves: the legacy shared venv at the new root is removed on first
    provision; a root already holding per-plugin venvs is left untouched)

- eval: E3
  run_id: local-cpu-plugins-E3-20260807T014803Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_unsafe_id
  verified_at: 2026-08-07T01:48:03Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  6 passed | 8 skipped (14)
      Duration  144ms
    (six escape-shaped ids asserted to throw; no path outside the venv root
    is ever derived)

- eval: E4
  run_id: local-cpu-plugins-E4-20260807T014740Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_venv_conflicting_pins
  verified_at: 2026-08-07T01:53:33Z
  output: |
    provisioning isolation-probe-a (six==1.16.0) and isolation-probe-b (six==1.17.0) concurrently
    [plugin-env] creating venv for isolation-probe-a with python3.12
    [plugin-env] creating venv for isolation-probe-b with python3.12
      isolation-probe-a -> six 1.16.0
      isolation-probe-b -> six 1.17.0
      shared venv after both installs -> six 1.17.0
    OK: each plugin resolved its own pin (1.16.0 / 1.17.0); one shared venv would have left only 1.17.0

- eval: E5
  run_id: local-cpu-plugins-E5-20260807T014842Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_tier_boundary
  verified_at: 2026-08-07T01:48:42Z
  output: |
    comparing HEAD against origin/main (merge-base efbbd691714b)
    checked 62 changed file(s) against 9 t3 path rule(s)
    OK: no t3 path touched — the declared tier holds

- eval: E6
  run_id: local-cpu-plugins-E6-20260807T014936Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-07T01:49:37Z
  output: |
    $ vitest run
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  32 passed (32)
         Tests  427 passed (427)
      Duration  1.36s

- eval: E7
  run_id: local-cpu-plugins-E7-20260807T014803Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_chain_per_id
  verified_at: 2026-08-07T01:48:04Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  2 passed | 12 skipped (14)
      Duration  137ms
    (chain keyed per plugin id: same id serializes, different ids do not)

- eval: E22
  run_id: local-cpu-plugins-E22-20260807T014804Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_fail_loudly
  verified_at: 2026-08-07T01:48:05Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  1 passed | 13 skipped (14)
      Duration  172ms
    (a plugin declaring requirements.txt gets a thrown error naming the plugin
    and the fix, not a bare interpreter)

- eval: E23
  run_id: local-cpu-plugins-E23-20260807T014805Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_lite_fallback_kept
  verified_at: 2026-08-07T01:48:05Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  1 passed | 13 skipped (14)
      Duration  171ms
    (suppression half: with the same broken provisioning, a plugin declaring no
    requirements still gets the lightweight fallback)

- eval: E8
  run_id: local-cpu-plugins-E8-20260807T014937Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_slots
  verified_at: 2026-08-07T01:49:40Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 1.43s

- eval: E9
  run_id: local-cpu-plugins-E9-20260807T014940Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_missing_input
  verified_at: 2026-08-07T01:49:42Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 1.85s

- eval: E10
  run_id: local-cpu-plugins-E10-20260807T014942Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_no_audio_track
  verified_at: 2026-08-07T01:49:42Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 0.18s

- eval: E11
  run_id: local-cpu-plugins-E11-20260807T014942Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_resolver_order
  verified_at: 2026-08-07T01:49:43Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E12
  run_id: local-cpu-plugins-E12-20260807T014943Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_resolver_teeth
  verified_at: 2026-08-07T01:49:43Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 0.13s

- eval: E13
  run_id: local-cpu-plugins-E13-20260807T014943Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_split_video_parts
  verified_at: 2026-08-07T01:49:44Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-pyscenedetect)
    plugin_commit_sha: 4dc7764a9bf32b037c9a1aed78f1b0a818aae9a9
    .                                                                        [100%]
    1 passed in 0.84s

- eval: E14
  run_id: local-cpu-plugins-E14-20260807T014944Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_split_ffprobe_required
  verified_at: 2026-08-07T01:49:45Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-pyscenedetect)
    plugin_commit_sha: 4dc7764a9bf32b037c9a1aed78f1b0a818aae9a9
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E15
  run_id: local-cpu-plugins-E15-20260807T014842Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_no_modal
  verified_at: 2026-08-07T01:48:42Z
  output: |
    scanning oneflow-api-ffmpeg (worktree: .../plugins/oneflow-api-ffmpeg)
      ok — oneflow-api-ffmpeg is Modal-free
    scanning oneflow-api-pyscenedetect (worktree: .../plugins/oneflow-api-pyscenedetect)
      ok — oneflow-api-pyscenedetect is Modal-free
    OK: neither local plugin imports modal, ships deploy/download, requires a token, or uploads to S3

- eval: E16
  run_id: local-cpu-plugins-E16-20260807T014842Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_counts
  verified_at: 2026-08-07T01:48:42Z
  output: |
    OK: 36 plain strings under default org + 3 origin entries (oneflow-api-ffmpeg, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay)

- eval: E17
  run_id: local-cpu-plugins-E17-20260807T014842Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-07T01:48:43Z
  output: |
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK
    (the real tongflow scanner ran over plugins/ against config/tongflow.abi.json
    and reported an empty `errors` array — a default-slot clash is one of the
    entries that array would have carried)

- eval: E18
  run_id: local-cpu-plugins-E18-20260807T014843Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_guard_teeth
  verified_at: 2026-08-07T01:48:43Z
  output: |
    check-manifest-guard-teeth: perturbing a copy of the manifest
      ok — guard is green on the real manifest
      ok — guard goes red: a fourth origin entry was added
      ok — guard goes red: an origin URL was changed
      ok — guard goes red: an origin entry id was changed
      ok — guard goes red: a 37th plain string was added
      ok — guard goes red: an origin entry was demoted to a plain string
      ok — guard goes red: the default org was changed
    OK: the manifest guard is red for all 6 perturbations

- eval: E19
  run_id: local-cpu-plugins-E19-20260807T014843Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_docs_synced
  verified_at: 2026-08-07T01:48:43Z
  output: |
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it behaves — 36 plain strings + 3 origin entries
    ok  state the oneflow-api convention
    ok  state the oneflow-modal convention
    ok  record that the legacy tongflow form is still accepted
    ok  keep the lowercase rule / the no-hardware rule
    docs/plugins.md: documents the oneflow convention and the legacy exception, with its reason

- eval: E25
  run_id: local-cpu-plugins-E25-20260807T014843Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_gate_residual_teeth
  verified_at: 2026-08-07T01:48:44Z
  output: |
    check-gate-residual-teeth: classification cases
      ok   [green] a genuinely clean gate
      ok   [green] own slug: PASS awaiting signature
      ok   [green] foreign slug: PASS awaiting the same signature run
      ok   [red] own slug: STALE evidence is never forgiven
      ok   [red] foreign slug: STALE evidence still blocks
      ok   [red] foreign stale hiding behind a forgiven foreign signature wait
      ok   [red] output that never reached a verdict line
    OK: check-gate-residual forgives only unfinished-Gate-2 classes (own: 3, foreign: 1)
    (all 13 cases green; excerpt shows 7)

- eval: E26
  run_id: local-cpu-plugins-E26-20260807T014844Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_resign_wave_teeth
  verified_at: 2026-08-07T01:48:44Z
  output: |
    check-resign-wave-teeth:
      ok   [green] a clean gate
      ok   [red] foreign STALE evidence — the wave itself
      ok   [red] foreign stale hidden among forgiven classes
      ok   [green] foreign awaiting signature — not the wave
      ok   [green] foreign REJECT — deliberately not the wave
      ok   [green] own slug stale — check-gate-residual's job, not this one
      ok   [red] output that never reached a verdict line
    OK: check-resign-wave blocks foreign stale evidence and nothing else

- eval: E20
  run_id: local-cpu-plugins-E20-20260807T014844Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_resign_wave
  verified_at: 2026-08-07T01:48:47Z
  output: |
    OK: no feature other than local-cpu-plugins carries stale evidence — the re-sign wave has cleared

- eval: E21
  judged_by: blind judge subagent (fresh context; no diff, no implementer reasoning)
  verdict: PASS
  rationale: |
    A concrete re-run exists rather than an assumption. `_acceptance/per-plugin-origin/run-log.jsonl`
    records E7 at 2026-08-07T01:26:40Z executing `check-manifest-unmoved.sh`, and
    `git show a788985:scripts/plugins/check-manifest-unmoved.sh` confirms that commit carries the
    THIRD edition (36 plain strings + exactly three origin entries) — so per-plugin-origin was
    measured against the new guard. That re-verification is current: its verified_commit is a
    descendant of the round-1 tree, and every later commit touches `_acceptance/**` documents only.
    AC-17's other conjunct is met too: the wave was machine-computed and named eleven features.
  judge_note: |
    The judge added a Gate-2 aside asserting the wave had not cleared and E20 was still red. That
    was read from the ROUND 1 report and is superseded here: round 2 re-ran E20 against
    check-resign-wave.sh and it is green. The half of the aside that still stands is recorded on
    the Gate 2 checklist below — per-plugin-origin's own verdict is REJECT, which blocks the merge
    through pre-merge-check even though it is not an eval of this feature.

## Analyst

Baseline is `n-a` for every eval. This round was explicitly forbidden from
checking out another ref, so no diffBase tree was ever materialised and the A/B
half of the report could not be computed — the numbers above are branch-only.
That is a deliberate constraint of this round, not a failure of the evals: the
discrimination question ("would this eval have been red on the old code?") is
therefore unanswered here. Two mitigations are worth a human's eye at Gate 2:

- Nine of the criteria are *teeth* evals whose guard scripts carry their own
  built-in counterfactual, so they discriminate within a single run rather than
  needing a baseline checkout. E4 installs the two conflicting pins into one
  shared venv and asserts the loser is silently overwritten; E18 perturbs a copy
  of the manifest six ways and asserts the guard goes red each time; E25 and E26
  drive 13 and 7 synthetic classification cases respectively, each asserting a
  specific green-or-red outcome. These are self-discriminating by construction.
- E6 (`pnpm test`, 32 files / 427 tests) and E17 (`pnpm verify:plugins`) are
  regression guards, expected green on both sides; they are not evidence for the
  feature and are not claimed as such.

E17's own stdout is thin (`[verify-plugins-scan] OK`). Its substance is that it
runs the real bundled tongflow scanner over `plugins/` against
`config/tongflow.abi.json` and exits non-zero if the registry's `errors` array
is non-empty — which is where a default-slot clash would surface. The eval's
stronger phrasing ("registers both local plugins") is satisfied only indirectly:
the scanner did enumerate both worktrees, but the script prints no per-plugin
line, so a human wanting that stated explicitly should read the registry output
directly.

E4's guard stages a `.venv`-free copy of `sdk/` before provisioning, and
documents why in its header: a developer machine keeps an 18 MB `.venv` inside
`sdk/`, which pip copies during `pip install <sdkDir>` and which kills the build
on this machine. That work-around is confined to the eval harness; removing the
`.venv` from the packaged `sdk/` would be a `sdk/**` change and therefore t3,
outside this package's declared tier. Worth knowing that the eval is green
partly because it sidesteps a real local-machine fragility.

## Variance

none — no eval declares `runs > 1`; every eval ran once and deterministically.

## Iterations

Round 1: E20 failed — the re-signature wave had not cleared; eleven previously
signed features (including `per-plugin-origin`, the one AC-17 names) carried
stale evidence because this package edited files inside their staleness scope.
Returned to implementation / orchestration.

Round 2: all 25 machine evals PASS on commit a4c6eca. Since round 1 the guard
E20 binds to was replaced (`check-gate-residual.sh` → `check-resign-wave.sh`,
per the AC-19 amendment) and two new teeth evals were added (E25 for AC-19,
E26 for AC-17); the FULL set was re-run and nothing was carried over. E21
remains unscored pending the judge panel, so the verdict is PENDING-JUDGMENT.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Merge the judge panel's E21 verdict into this report; if it is UNCERTAIN,
      personally verify it and fill `human_override: <name> <date>`
- [ ] E21 asks specifically whether `per-plugin-origin` was re-verified against
      the NEW `check-manifest-unmoved.sh` (third edition, 36/3) rather than
      assumed still valid — point at the re-run, not at the old signature
- [ ] Note that `baseline:` is `n-a` throughout (no diffBase checkout was
      permitted this round); accept or ask for an A/B pass
- [ ] Upgrade the verdict from PENDING-JUDGMENT to PASS (this write is when the
      hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
