---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: aba508a0edc61656b21d46bec6361cf4c6a0f927
human_signoff: Manh 2026-07-27
---

# Evidence Report: per-plugin-origin

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-5 | test | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-1 | test | PASS |
| E10 | AC-3 | test | PASS |
| E11 | AC-3 | test | PASS |
| E12 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-per-plugin-origin-E1-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T10:36:08Z
  output: |
         Tests  57 passed (57)
      Start at  17:36:47
      Duration  136ms (transform 20ms, setup 0ms, import 28ms, tests 7ms, environment 0ms)

- eval: E2
  run_id: minted-per-plugin-origin-E2-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T10:36:08Z
  output: |
         Tests  57 passed (57)
      Start at  17:36:47
      Duration  136ms (transform 20ms, setup 0ms, import 28ms, tests 7ms, environment 0ms)

- eval: E3
  run_id: minted-per-plugin-origin-E3-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T10:36:08Z
  output: |
         Tests  57 passed (57)
      Start at  17:36:47
      Duration  136ms (transform 20ms, setup 0ms, import 28ms, tests 7ms, environment 0ms)

- eval: E4
  run_id: minted-per-plugin-origin-E4-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-07-27T10:36:08Z
  output: |
         Tests  57 passed (57)
      Start at  17:36:47
      Duration  136ms (transform 20ms, setup 0ms, import 28ms, tests 7ms, environment 0ms)

- eval: E5
  run_id: minted-per-plugin-origin-E5-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-07-27T10:36:08Z
  output: |
    OK: one URL rule across src/ and scripts/, in src/lib/plugins/official-manifest.ts; the CLI installer imports it (the SDK engine's Python copy is out of this scan's scope — see the contract's known limits)

- eval: E6
  run_id: minted-per-plugin-origin-E6-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-07-27T10:36:08Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker agree; both pull paths use the resolved origin and refuse a non-fast-forward

- eval: E7
  run_id: minted-per-plugin-origin-E7-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-07-27T10:36:08Z
  output: |
    OK: 38 plain string entries, default org unchanged

- eval: E8
  run_id: minted-per-plugin-origin-E8-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-27T10:36:08Z
  output: |
         Tests  75 passed (75)
      Start at  17:36:45
      Duration  133ms (transform 19ms, setup 0ms, import 28ms, tests 3ms, environment 0ms)

- eval: E9
  run_id: minted-per-plugin-origin-E9-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-07-27T10:36:08Z
  output: |
         Tests  329 passed (329)
      Start at  17:36:42
      Duration  1.32s (transform 2.48s, setup 0ms, import 4.97s, tests 740ms, environment 1ms)

- eval: E10
  run_id: minted-per-plugin-origin-E10-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-27T10:36:08Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new settings.
    $ tsc --noEmit

- eval: E11
  run_id: minted-per-plugin-origin-E11-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-07-27T10:36:08Z
  output: |
    Checked 402 files in 86ms. No fixes applied.

- eval: E12
  run_id: minted-per-plugin-origin-E12-r8
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-07-27T10:36:08Z
  output: |
    [WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies". See https://pnpm.io/settings for the new home of each setting.
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

### Additional runs (not mapped to any eval / AC)

Two further commands were run as supplementary guards but are not attached to
any eval id in this contract, so they do not appear in the table above and do
not affect the verdict:

- `cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions python -m pytest -q` — 1 run, passed (89 passed in 3.19s), baseline n-a.
- `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json` — 1 run, passed (wrote src/generated/abi/index.ts and sdk/tongflow/_data/tongflow.abi.json, no diff — files in sync), baseline n-a.

## Analyst

carried tu round truoc — baseline khong do lai round nay (P2 — evals.yaml
khong doi tu lan baseline cuoi).

none — no non-discriminating evals reported for round 8 (baseline was not
re-measured this round; see round 1's Analyst findings for the last measured
baseline classification of E8/E9/E12 as intended regression-guards).

## Variance

none — every eval this round has `runs: 1` (deterministic); no eval carries
`variance: true`.

## Iterations

Round 1: E11 failed — `pnpm lint:check` (biome, `--error-on-warnings`) exits 1.
All other evals (E1-E10, E12) pass, including baseline-discriminating evals
E1-E7 (red on the pre-feature tree, green on HEAD). Verdict: REJECT. Returned
to implementation.

Round 2: all evals E1-E12 pass (exit 0), including the previously-failing
E11 (`pnpm lint:check`). Full suite (`pnpm test`, 304 passed), build +
typecheck, and the plugins scan verifier are all green. The standalone SDK
pytest suite (89 passed) and the ABI-generation diff check also pass as
unmapped supplementary guards. No judgment items are pending for this
contract this round (judge panel list is empty). Verdict: PASS.

Round 3: all evals E1-E12 pass again (exit 0) against the re-verified tree.
Unit test counts grew (E1-E4's suite now 40 tests, was 32; the whole-repo
suite E9 now 312, was 304), build/typecheck, lint, and the plugins scan
verifier remain green, and the two unmapped supplementary guards (SDK pytest
89 passed; ABI-generation diff check) stay green. No judgment items pending
(judge panel list is empty). Verdict: PASS.

Round 4: all evals E1-E12 pass again (exit 0) against the re-verified tree at
commit 015d196ec7199f89c3ff614869736775f59ca806. Unit test counts grew
further (E1-E4's suite now 47 tests, was 40; the whole-repo suite E9 now 319,
was 312; E8's suite holds at 75), build/typecheck, lint, and the plugins scan
verifier remain green, and the two unmapped supplementary guards (SDK pytest
89 passed; ABI-generation diff check) stay green. Baseline was not
re-measured this round (P2 — evals.yaml unchanged since round 1's baseline
run); the Analyst section carries forward round 1's classification. No
judgment items are pending for this contract this round (judge panel list is
empty). Verdict: PASS.

Round 5: all evals E1-E12 pass again (exit 0) against the re-verified tree at
commit a66a425b49fc0d0b3f12281173abd2412c797523. Unit test counts hold steady
(E1-E4's suite at 47 tests, same as round 4; the whole-repo suite E9 at 319,
same as round 4; E8's suite holds at 75), build/typecheck, lint, and the
plugins scan verifier remain green, and the two unmapped supplementary guards
(SDK pytest 89 passed; ABI-generation diff check, which this round also
regenerated and fixed one file with no resulting diff) stay green. Baseline
was not re-measured this round (P2 — evals.yaml unchanged since round 1's
baseline run); the Analyst section carries forward round 1's classification.
No judgment items are pending for this contract this round (judge panel list
is empty). Verdict: PASS.

Round 6: all evals E1-E12 pass again (exit 0) against the re-verified tree at
commit abfba9b00180c607d116b12de497ba6f8136f221. Unit test counts hold steady
(E1-E4's suite at 47 tests, same as rounds 4-5; the whole-repo suite E9 at
319, same as rounds 4-5; E8's suite holds at 75), build/typecheck, lint, and
the plugins scan verifier remain green, and the two unmapped supplementary
guards (SDK pytest 89 passed; ABI-generation diff check, which this round
also regenerated and fixed one file with no resulting diff) stay green.
Baseline was not re-measured this round (P2 — evals.yaml unchanged since
round 1's baseline run); the Analyst section carries forward round 1's
classification. No judgment items are pending for this contract this round
(judge panel list is empty). Verdict: PASS.

Round 7: all evals E1-E12 pass again (exit 0) against the re-verified tree at
commit 21eafc5ec0f3affa61cfb98bcfe542d782e5f907. Unit test counts hold steady
(E1-E4's suite at 47 tests, same as rounds 4-6; the whole-repo suite E9 at
319, same as rounds 4-6; E8's suite holds at 75), build/typecheck, lint, and
the plugins scan verifier remain green, and the two unmapped supplementary
guards (SDK pytest 89 passed; ABI-generation diff check, which this round
also regenerated and fixed one file with no resulting diff) stay green.
Baseline was not re-measured this round (P2 — evals.yaml unchanged since
round 1's baseline run); the Analyst section carries forward round 1's
classification. No judgment items are pending for this contract this round
(judge panel list is empty). Verdict: PASS.

Round 8: all evals E1-E12 pass again (exit 0) against the re-verified tree at
commit 70457b5f0eaf43bd6fe7db5265ffc39df6b74b62. Unit test counts grew again
(E1-E4's suite now 57 tests, was 47 in rounds 4-7; the whole-repo suite E9
now 329, was 319 in rounds 4-7; E8's suite holds at 75), build/typecheck,
lint, and the plugins scan verifier remain green, and the two unmapped
supplementary guards (SDK pytest 89 passed; ABI-generation diff check, which
this round also regenerated with no resulting diff) stay green. Baseline was
not re-measured this round (P2 — evals.yaml unchanged since round 1's
baseline run); the Analyst section carries forward round 1's classification.
No judgment items are pending for this contract this round (judge panel list
is empty). Verdict: PASS.

Carry-forward re-pin (2026-07-29, branch feat/stale-scope-by-paths):
`verified_commit` moved from 70457b5f0eaf43bd6fe7db5265ffc39df6b74b62 to
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

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Personally verify every judgment item marked UNCERTAIN, then fill its
      `human_override: <name> <date>` line
- [ ] T3 only: personally verify ALL judgment items and fill `human_override`
      on each (judge verdicts are advisory; the hook blocks PASS without them)
- [ ] If verdict was PENDING-JUDGMENT: upgrade it to PASS (this write is when
      the hook re-validates evidence + overrides)
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in contract
