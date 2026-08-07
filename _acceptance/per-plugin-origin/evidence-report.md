---
schema_version: 2
feature_slug: per-plugin-origin
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f7306bfa6c17c4e2ff656b66036b0d369c60648d
human_signoff:
---

# Evidence Report: per-plugin-origin

Round 2, verified against the contract as amended on 2026-08-07 (Amendment 2 —
third-edition census: 36 plain strings under the default org plus exactly three
origin entries under `phanlemanh`).

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

No judgment-executor evals exist in this feature's `evals.yaml`; nothing is
UNSCORED and nothing awaits a human verdict.

## Evidence

- eval: E1
  run_id: per-plugin-origin-E1-20260807T020330Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T02:03:30Z
  output: |
    RUN  v4.1.10 /Users/manh-macmini/dev/oneflow
    Test Files  1 passed (1)
         Tests  59 passed (59)
      Start at  09:03:31
      Duration  130ms (transform 20ms, setup 0ms, import 27ms, tests 6ms)
    (block "string entries — today's manifest (AC-1)": every string entry
     resolves to the top-level org; the id list matches the raw file element
     for element, in order)

- eval: E2
  run_id: per-plugin-origin-E2-20260807T020331Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T02:03:31Z
  output: |
    Test Files  1 passed (1)
         Tests  59 passed (59)
    (block "override entries (AC-2)": appends id and .git to the entry's own
     origin; leaves every sibling on the default origin; accepts an object
     entry with no origin and falls back to the default; keeps order across
     mixed string and object entries)

- eval: E3
  run_id: per-plugin-origin-E3-20260807T020340Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T02:03:40Z
  output: |
    Test Files  1 passed (1)
         Tests  59 passed (59)
    (SUPPRESSION half — blocks "malformed entries are rejected by name (AC-4)"
     and "plugin ids are validated at load, not just origins (AC-4)": unknown
     key, missing id, non-string origin, empty string, duplicate id across both
     entry forms, traversing id — each rejected with the offending entry named)

- eval: E4
  run_id: per-plugin-origin-E4-20260807T020341Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_official_manifest
  verified_at: 2026-08-07T02:03:41Z
  output: |
    Test Files  1 passed (1)
         Tests  59 passed (59)
    (SUPPRESSION half — block "non-http(s) origins are rejected (AC-5)":
     scp-style git@, relative path, javascript:, whitespace in the org; plain
     http accepted; trailing slash stripped rather than doubled)

- eval: E5
  run_id: per-plugin-origin-E5-20260807T020342Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_single_impl
  verified_at: 2026-08-07T02:03:42Z
  output: |
    OK: one URL rule across src/ and scripts/, in
    src/lib/plugins/official-manifest.ts; the CLI installer imports it
    (the SDK engine's Python copy is out of this scan's scope — see the
    contract's known limits)

- eval: E6
  run_id: per-plugin-origin-E6-20260807T020342Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_installer_parity
  verified_at: 2026-08-07T02:03:42Z
  output: |
    OK: the CLI installer, the in-app install path and the update checker
    agree; both pull paths use the resolved origin and refuse a
    non-fast-forward

- eval: E7
  run_id: per-plugin-origin-E7-20260807T020343Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.origin_manifest_unmoved
  verified_at: 2026-08-07T02:03:43Z
  output: |
    OK: 36 plain strings under default org + 3 origin entries
    (oneflow-api-ffmpeg, oneflow-api-pyscenedetect,
     oneflow-modal-compose-overlay)

- eval: E8
  run_id: per-plugin-origin-E8-20260807T020343Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-08-07T02:03:43Z
  output: |
    Test Files  1 passed (1)
         Tests  76 passed (76)
    (oneflow-plugin-prefix's own suite, including its assertion that the
     manifest's default org is still the upstream one)

- eval: E9
  run_id: per-plugin-origin-E9-20260807T020354Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.unit
  verified_at: 2026-08-07T02:03:54Z
  output: |
    $ vitest run
    Test Files  32 passed (32)
         Tests  427 passed (427)
      Duration  1.37s

- eval: E10
  run_id: per-plugin-origin-E10-20260807T020405Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-08-07T02:04:05Z
  output: |
    + First Load JS shared by all             103 kB
      chunks/620846f1-92c416bf2f09796f.js  54.2 kB
      chunks/8336-0e84acaf04d00d35.js      46.2 kB
    (Dynamic)  server-rendered on demand
    $ tsc --noEmit
    (next build then tsc --noEmit, sequential per the config comment)

- eval: E11
  run_id: per-plugin-origin-E11-20260807T020356Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lint
  verified_at: 2026-08-07T02:03:56Z
  output: |
    $ pnpm exec biome check --error-on-warnings .
    Checked 429 files in 83ms. No fixes applied.

- eval: E12
  run_id: per-plugin-origin-E12-20260807T020356Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.verify_plugins
  verified_at: 2026-08-07T02:03:56Z
  output: |
    $ tsx scripts/verify-plugins-scan.ts
    [verify-plugins-scan] OK

## Analyst

Non-discriminating evals: not determined this round — `baseline: n-a` on every
eval. Establishing a diffBase status requires checking out or worktree-ing the
pre-feature tree, and this verify round is constrained to zero git operations,
so no baseline could be run. Round 1 recorded the same `n-a` for the same
reason. The absence is a gap in A/B signal, not a failure signal.

Verdict shape: all twelve evals are machine (test/script); none is a
`judgment` executor, so there is nothing UNSCORED and no `human_override` line
is required. Working tree was clean before and after the round; nothing was
staged, committed, or fetched, and no source file, script, contract criterion
or eval was edited.

**Does the amended AC-6/E7 still have teeth? Yes — I checked rather than
assumed.** The amendment rewrites the *census*, not the shape of the claim.
`scripts/plugins/check-manifest-unmoved.sh` still pins four independent things:
the default org string, the count of plain strings (36), the count of origin
entries (exactly 3), and the exact id set and origin URL of those three. I ran
`scripts/plugins/check-manifest-guard-teeth.sh` as corroboration (not one of
this feature's eval keys, so it is not in the run-log): it stages six perturbed
copies of the manifest and asserts the guard goes red on each — a fourth origin
entry, a changed origin URL, a renamed origin entry, a 37th plain string, an
origin entry demoted back to a plain string, and a changed default org. All six
went red, and the untouched manifest went green, so the baseline case is not
vacuous. That is exactly the falsifiability the amendment is required to
preserve, and it convinced me: the criterion cannot be satisfied by a manifest
that has drifted.

Two honest qualifications a human should carry into Gate 2:

1. **What the guard measures narrowed.** The original AC-6 was self-verifying:
   "nothing moved" was a property of the file alone. The amended AC-6 asserts a
   census *plus* a provenance claim — that each of the three moves "is one an
   explicitly approved feature performed and recorded". The census half is
   machine-enforced; the provenance half rests on human bookkeeping (ADR-0011,
   compose-overlay's Gate 1 on 2026-08-03, local-cpu-plugins' Gate 1 on
   2026-08-06). No eval can go red if that bookkeeping is wrong. The criterion
   is still falsifiable, but it is now falsifiable about *the manifest's current
   state*, not about *who moved what*.

2. **The re-cut hazard the amendment names is not itself guarded.**
   `check-manifest-guard-teeth.sh` defends against the guard being loosened into
   something that accepts anything; it does not defend against the guard being
   re-cut to a new, internally consistent census in the same commit that moves a
   plugin — which is precisely how the round-1 finding arose. The only control
   against that remains the doer≠grader split (a fresh-context re-verify), which
   is what caught it. Recording that plainly here rather than treating it as
   closed.

I do not think the amendment has hollowed the criterion out. AC-6's stated
intent — *this capability is not a migration; adding per-entry `origin` did not
by itself move any plugin* — is unchanged, and the manifest confirms it
directly: all three origin entries belong to features that were approved after
this one and are named in the contract. The criterion has been correctly
demoted from "the manifest is frozen" (a claim it could never keep, and which
CLAUDE.md always described as a snapshot) to "the manifest matches this
recorded census", which is a claim the guard actually enforces.

## Variance

none — no eval declares `runs > 1`; every eval is deterministic and uniform
across this round.

## Iterations

Round 1 (2026-08-07, commit a788985): E7 rejected — the third-edition manifest
guard had been re-cut to record two plugins moved to `phanlemanh` by
`local-cpu-plugins` (ADR-0011), while AC-6 still asserted all 38 original
entries were plain strings; eleven other evals clean. Returned for amendment.

Round 2 (2026-08-07, commit f7306bf): re-verified against the human-approved
Amendment 2 (census rewritten to 36 plain strings + exactly three origin
entries). All twelve evals clean, including E7. The amended E7's teeth
independently corroborated with `check-manifest-guard-teeth.sh` (six
perturbations, all red). Verdict PASS.

## Gate 2 checklist (human)

- [ ] Read the table + spot-check 1-2 evidence blocks
- [ ] Read `## Analyst` — in particular the two qualifications about what the
      amended AC-6 does and does not machine-enforce, and decide whether the
      provenance half needs its own guard in a future contract
- [ ] No judgment items exist on this contract; no `human_override` lines are
      required
- [ ] Fill `human_signoff` in frontmatter + `time_human_minutes.gate2` in
      contract
