---
schema_version: 2
feature_slug: local-cpu-plugins
verdict: REJECT
failed_evals: [E20]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 090a2c38aefa957188d6975f095368009b13394a
human_signoff:
---

# Evidence Report: local-cpu-plugins

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
| E20 | AC-17 | script | FAIL |
| E21 | AC-17 | judgment | NOT SCORED |

## Evidence

- eval: E1
  run_id: local-cpu-plugins-E1-1786059685
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_per_plugin
  verified_at: 2026-08-06T23:41:25Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  1 passed (1)
          Tests  1 passed | 13 skipped (14)

- eval: E2
  run_id: local-cpu-plugins-E2-1786059702
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_common_parent
  verified_at: 2026-08-06T23:41:42Z
  output: |
     Test Files  1 passed (1)
          Tests  1 passed | 13 skipped (14)

- eval: E24
  run_id: local-cpu-plugins-E24-1786059703
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_legacy_migration
  verified_at: 2026-08-06T23:41:43Z
  output: |
     Test Files  1 passed (1)
          Tests  2 passed | 12 skipped (14)
    (both halves: the pre-2026-08-07 shared venv at the new per-plugin root is
    removed on first provision; a root already holding per-plugin venvs is left
    untouched)

- eval: E3
  run_id: local-cpu-plugins-E3-1786059703
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_unsafe_id
  verified_at: 2026-08-06T23:41:43Z
  output: |
     Test Files  1 passed (1)
          Tests  6 passed | 8 skipped (14)
    (six escape-attempt assertions green: venvDirFor throws rather than deriving
    a path outside the venv root)

- eval: E4
  run_id: local-cpu-plugins-E4-1786060078
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_venv_conflicting_pins
  verified_at: 2026-08-06T23:47:58Z
  output: |
    provisioning isolation-probe-a (six==1.16.0) and isolation-probe-b (six==1.17.0) concurrently
    [plugin-env] creating venv for isolation-probe-a with python3.12
    [plugin-env] creating venv for isolation-probe-b with python3.12
    [plugin-env] installing requirements.txt for isolation-probe-a
    [plugin-env] installing requirements.txt for isolation-probe-b
      isolation-probe-a -> six 1.16.0
      isolation-probe-b -> six 1.17.0
      shared venv after both installs -> six 1.17.0
    OK: each plugin resolved its own pin (1.16.0 / 1.17.0); one shared venv would
    have left only 1.17.0

- eval: E5
  run_id: local-cpu-plugins-E5-1786059719
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_tier_boundary
  verified_at: 2026-08-06T23:41:59Z
  output: |
    comparing HEAD against origin/main (merge-base efbbd691714b)
    checked 22 changed file(s) against 9 t3 path rule(s)
    OK: no t3 path touched — the declared tier holds

- eval: E6
  run_id: local-cpu-plugins-E6-1786059719
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-06T23:41:59Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
     Test Files  32 passed (32)
          Tests  427 passed (427)
       Duration  1.63s

- eval: E7
  run_id: local-cpu-plugins-E7-1786059704
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_chain_per_id
  verified_at: 2026-08-06T23:41:44Z
  output: |
     Test Files  1 passed (1)
          Tests  2 passed | 12 skipped (14)
    (chain keyed per plugin id: two ids are not serialized against each other,
    calls sharing one id are)

- eval: E22
  run_id: local-cpu-plugins-E22-1786059705
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_fail_loudly
  verified_at: 2026-08-06T23:41:45Z
  output: |
     Test Files  1 passed (1)
          Tests  1 passed | 13 skipped (14)
    (with provisioning broken, ensurePluginPython throws for a plugin declaring
    requirements.txt, naming the plugin and the fix)

- eval: E23
  run_id: local-cpu-plugins-E23-1786059705
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_venv_lite_fallback_kept
  verified_at: 2026-08-06T23:41:45Z
  output: |
     Test Files  1 passed (1)
          Tests  1 passed | 13 skipped (14)
    (suppression half: under the same broken provisioning, a plugin declaring no
    requirements.txt still gets the lightweight fallback)

- eval: E8
  run_id: local-cpu-plugins-E8-1786060102
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_slots
  verified_at: 2026-08-06T23:48:22Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 1.11s

- eval: E9
  run_id: local-cpu-plugins-E9-1786060118
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_missing_input
  verified_at: 2026-08-06T23:48:38Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 1.80s

- eval: E10
  run_id: local-cpu-plugins-E10-1786060119
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_no_audio_track
  verified_at: 2026-08-06T23:48:39Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 0.17s

- eval: E11
  run_id: local-cpu-plugins-E11-1786060119
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_resolver_order
  verified_at: 2026-08-06T23:48:39Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E12
  run_id: local-cpu-plugins-E12-1786060119
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_ffmpeg_resolver_teeth
  verified_at: 2026-08-06T23:48:39Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-ffmpeg)
    plugin_commit_sha: e0b8df87ef542d4ac8323a1a909a9734005597fa
    .                                                                        [100%]
    1 passed in 0.12s

- eval: E13
  run_id: local-cpu-plugins-E13-1786060121
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_split_video_parts
  verified_at: 2026-08-06T23:48:41Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-pyscenedetect)
    plugin_commit_sha: 4dc7764a9bf32b037c9a1aed78f1b0a818aae9a9
    .                                                                        [100%]
    1 passed in 0.80s

- eval: E14
  run_id: local-cpu-plugins-E14-1786060121
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_split_ffprobe_required
  verified_at: 2026-08-06T23:48:41Z
  output: |
    plugin_source: worktree (/Users/manh-macmini/dev/oneflow/plugins/oneflow-api-pyscenedetect)
    plugin_commit_sha: 4dc7764a9bf32b037c9a1aed78f1b0a818aae9a9
    .                                                                        [100%]
    1 passed in 0.04s

- eval: E15
  run_id: local-cpu-plugins-E15-1786060134
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_no_modal
  verified_at: 2026-08-06T23:48:54Z
  output: |
    scanning oneflow-api-ffmpeg (worktree: .../plugins/oneflow-api-ffmpeg)
      ok — oneflow-api-ffmpeg is Modal-free
    scanning oneflow-api-pyscenedetect (worktree: .../plugins/oneflow-api-pyscenedetect)
      ok — oneflow-api-pyscenedetect is Modal-free
    OK: neither local plugin imports modal, ships deploy/download, requires a
    token, or uploads to S3

- eval: E16
  run_id: local-cpu-plugins-E16-1786060134
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_counts
  verified_at: 2026-08-06T23:48:54Z
  output: |
    OK: 36 plain strings under default org + 3 origin entries
    (oneflow-api-ffmpeg, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay)

- eval: E17
  run_id: local-cpu-plugins-E17-1786060135
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-06T23:48:55Z
  output: |
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

- eval: E18
  run_id: local-cpu-plugins-E18-1786060136
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_manifest_guard_teeth
  verified_at: 2026-08-06T23:48:56Z
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
  run_id: local-cpu-plugins-E19-1786060136
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lcp_docs_synced
  verified_at: 2026-08-06T23:48:56Z
  output: |
    OK: CLAUDE.md describes scripts/plugins/check-manifest-unmoved.sh as it
    behaves — 36 plain strings + 3 origin entry
    ok  state the oneflow-api convention
    ok  state the oneflow-modal convention
    ok  record that the legacy tongflow form is still accepted
    ok  keep the lowercase rule / no-hardware rule
    docs/plugins.md: documents the oneflow convention and the legacy exception

- eval: E20
  run_id: local-cpu-plugins-E20-1786060139
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.lcp_resign_wave
  verified_at: 2026-08-06T23:48:59Z
  output: |
    VIOLATION [ci-actions-bump]: evidence is stale — code changed after verify
    VIOLATION [ci-vitest-sdk-pin]: evidence is stale — code changed after verify
    VIOLATION [compose-overlay]: evidence is stale — code changed after verify
    VIOLATION [conformance-l0]: evidence is stale — code changed after verify
    VIOLATION [dependency-refresh-2026-07]: evidence is stale — code changed after verify
    VIOLATION [measure-harness]: evidence is stale — code changed after verify
    VIOLATION [oneflow-plugin-prefix]: evidence is stale — code changed after verify
    VIOLATION [per-plugin-origin]: evidence is stale — code changed after verify
    VIOLATION [sdk-distribution-rename]: evidence is stale — code changed after verify
    VIOLATION [stale-scope-by-paths]: evidence is stale — code changed after verify
    VIOLATION [task-metering]: evidence is stale — code changed after verify
    FAIL: violations outside 'local-cpu-plugins' — the re-sign wave has not cleared

    Cause (from a diagnostic `pre-merge-check.sh . --base origin/main` run, not an
    eval): the files this package edits — config/official-plugins.json,
    scripts/plugins/check-manifest-unmoved.sh, check-manifest-guard-teeth.sh,
    check-local-plugins-no-modal.sh, check-venv-isolation.{sh,ts},
    run-local-plugin-tests.sh, scripts/acceptance/check-t3-untouched.sh,
    scripts/acceptance/t3-scan.mjs, src/lib/plugins/official-plugins-list.test.ts,
    src/lib/plugins/plugin-python-env.{server.ts,test.ts} — landed after the
    verified_commit of eleven already-signed features, so their evidence is now
    stale. per-plugin-origin (the feature AC-17 names explicitly) is among them.
    This is exactly the re-signature wave AC-17 exists to force; it has not been
    run.

- eval: E21
  judged_by:
  verdict: NOT SCORED
  rationale: |
    This verify round did not dispatch the judge panel. E21's inputs include this
    evidence-report.md, which did not exist when the machine evals ran, and the
    orchestrator retains the judge dispatch. Note that the machine half (E20)
    already answers the factual part negatively: per-plugin-origin appears in the
    stale list, so its earlier signature has NOT been re-verified against the new
    third-edition (36/3) guard.
  required_evidence:
    - A re-run of per-plugin-origin's own evals against the new
      scripts/plugins/check-manifest-unmoved.sh (36 plain strings + 3 origin
      entries), with a fresh evidence-report.md whose verified_commit is at or
      after this branch's HEAD.
  human_override:

## Analyst

Baseline (A/B): every eval carries `baseline: n-a`. This round was run under a
hard no-mutation constraint — no checkout, no fetch, no worktree move — so the
diffBase tree could not be materialised to run the A-side. Discrimination is
therefore unproven by A/B here; it is argued only structurally, by the teeth
evals that mutate their own input in-process (E4's shared-venv control arm, E18's
six manifest perturbations, E12/E14's resolver-starvation arms, E22/E23's
broken-provisioning pair).

Non-discriminating evals: not computable this round (see above). E6 (`pnpm test`)
is a whole-suite regression guard and would be green on both trees by design.

Field note on E8–E14: `run-local-plugin-tests.sh` reported
`plugin_source: worktree` for both plugins, i.e. the seven slot evals ran against
the local `plugins/oneflow-api-ffmpeg` @ e0b8df87 and
`plugins/oneflow-api-pyscenedetect` @ 4dc7764a working copies, NOT against a
fetched remote commit. The wrapper prints this on purpose. Gate 2 should confirm
those two commits are what is actually pushed to
`https://github.com/phanlemanh/<name>` before the manifest entries point users
there.

## Variance

none — every eval is deterministic and ran once (no `runs: N` declared).

## Iterations

Round 1: E20 failed — the re-signature wave has not cleared. Eleven previously
signed features (including per-plugin-origin, the one AC-17 names) now carry
stale evidence because this package edited files inside their staleness scope.
Returned to implementation / orchestration: the wave must be re-verified and
re-signed, then E20 re-run. All 22 other machine evals passed; E21 was not
scored.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
