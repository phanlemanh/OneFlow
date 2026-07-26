---
schema_version: 2
feature_slug: oneflow-plugin-prefix
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 2)
enforcement_mode: strict
bypass_used: false
verified_commit: 8254c0bda4d98c02db789e816f6d19a6c09773a4
human_signoff:
---

# Evidence Report: oneflow-plugin-prefix

Round 1 rejected this feature on AC-1. The contract had claimed the installer's
regex was the only place the prefix is enforced and that the scanner does not
filter by directory name; both sentences were false, so an `oneflow-*` plugin
would install and then never register. Round 2 verifies the fix: the scanner's
gate was widened, the contract was amended and re-tiered T2 → T3, AC-7 and evals
E10/E11 were added, and a third assertion in `check-prefix-docs.sh` was narrowed.

Nothing was taken on trust from round 1 or from the contract. Every `cmd` was
resolved line by line against `_acceptance/config.yaml` before it was run.
`enforcement_mode` is `strict`, read from that file. `ACCEPTANCE_GATE_BYPASS` was
checked with `printf '%s'` and prints nothing, so `bypass_used` is false. AC-7
was re-derived end to end without using the repository's own tests — two
byte-identical copies of real installed plugins, run through the real scanner the
way `plugins-scanner.server.ts` runs it — and the round-1 defect was driven back
in to confirm the new tests actually kill it.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-1 | test | PASS |
| E8 | AC-3 | test | PASS |
| E9 | AC-4 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-7 | test | PASS |

## Shared invocation — E1 through E4

E1, E2, E3 and E4 all resolve to the same command,
`config:executors.test.unit_plugin_id`. It was run **once**, with
`--reporter=verbose` (a reporter flag: selection and outcome are unchanged) so
that every test name is visible. Each eval below is credited to its **own named
covering block** from that listing, not to the shared exit status:

- **E1** — the `plugin id — oneflow convention (AC-1)` block (7 tests).
- **E2** — the `plugin id — tongflow stays installable (AC-2)` block (40 tests:
  2 manifest guards plus one per official plugin).
- **E3** — the `plugin id — everything else is still rejected (AC-3)` block
  (22 tests).
- **E4** — the `plugin id — the error teaches the current convention (AC-4)`
  block (4 tests).

Counted from the verbose log this round: 7 + 40 + 22 + 4 = 73, which is the whole
file — no test is unaccounted for and no eval rests on another eval's block.
`grep -c "accepts official plugin"` over the same log returns 38, and
`len(json["plugins"])` on `config/official-plugins.json` is also 38, so the AC-2
table has one live assertion per manifest entry.

## Evidence

- eval: E1
  run_id: oneflow-plugin-prefix-r2-E1-20260726144403
  exit_code: 0
  baseline: red — mutation M1 (regex reverted to the tongflow-only form) kills
    exactly this block's 7 tests; see "Failure-branch drive"
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-26T14:44:03Z
  output: |
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-foo 1ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-api-foo 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-z-image 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-api-openrouter-free 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-a 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-0 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-flux2-klein9b 0ms

    AC-1 asks whether the new convention works end to end, not merely whether the validator accepts a name. That is the question round 1 answered against this feature. It is now answered by E10 and by the independent re-derivation below: the same `oneflow-modal-*` name that this block accepts at install time also registers in the scanner, with a record identical to its `tongflow-` twin.

- eval: E2
  run_id: oneflow-plugin-prefix-r2-E2-20260726144403
  exit_code: 0
  baseline: red — mutation M2 (regex tightened to the oneflow-only form) kills
    exactly the 38 per-plugin cases and nothing else
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-26T14:44:03Z
  output: |
    ✓ plugin id — tongflow stays installable (AC-2) > the manifest still points at the upstream org we do not control 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > has a non-trivial number of official plugins 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-openrouter-free 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-gemini 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-ffmpeg 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-triposplat 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-whisper 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-scrapling 0ms
    … 38 "accepts official plugin" lines in total, one per manifest entry

    AC-2 is not vacuous, checked three ways: the test reads `config/official-plugins.json` with `readFileSync` at run time rather than from a fixture; the verbose log carries exactly 38 per-id cases against a manifest of exactly 38 entries; and two guards (`org` must equal the upstream URL, `plugins.length` must exceed 30) make the table impossible to empty silently.

- eval: E3
  run_id: oneflow-plugin-prefix-r2-E3-20260726144403
  exit_code: 0
  baseline: red — M3 (runner segment widened) kills the three runner cases and
    M4 (anchors dropped) kills the five shape cases; neither touches the other's
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-26T14:44:03Z
  output: |
    ✓ plugin id — everything else is still rejected (AC-3) > rejects foo-modal-bar (unrelated prefix) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflowmodal-x (missing the separator) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-gpu-x (hardware token instead of a runner) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-cpu-x (hardware token instead of a runner) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-worker-x (unknown runner) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-modal- (empty name segment) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow- (prefix alone) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects ONEFLOW-MODAL-X (uppercase) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-modal-foo/bar (path separator) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects ../oneflow-modal-foo (traversal) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects a name whose valid form is only a substring 0ms

    The suppression half is real: 22 named cases, and the anchors are genuine — JavaScript's `$` matches only at end of input without the `m` flag, and the suite pins that with an explicit `"oneflow-modal-foo\nevil"` case rather than relying on it.

- eval: E4
  run_id: oneflow-plugin-prefix-r2-E4-20260726144403
  exit_code: 0
  baseline: red — three separate message mutations (drop "legacy", name tongflow
    first, drop the `oneflow-api-*` token) each kill their own assertion
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-26T14:44:03Z
  output: |
    ✓ plugin id — the error teaches the current convention (AC-4) > quotes the offending name 0ms
    ✓ plugin id — the error teaches the current convention (AC-4) > names oneflow before tongflow 0ms
    ✓ plugin id — the error teaches the current convention (AC-4) > marks the tongflow form as legacy rather than presenting it as equal 0ms
    ✓ plugin id — the error teaches the current convention (AC-4) > names both runner segments for the current convention 0ms

    The scanner's own rejection hint is held to the same rule by a separate test in the SDK suite (`test_unknown_prefix_hint_leads_with_oneflow`), so both enforcement layers teach the current convention rather than only the installer.

- eval: E5
  run_id: oneflow-plugin-prefix-r2-E5-20260726144417
  exit_code: 0
  baseline: red — eight branches driven, seven rule deletions plus the
    cannot-look path; see "Failure-branch drive"
  verifier: config:executors.script.docs_plugin_prefix
  verified_at: 2026-07-26T14:44:17Z
  output: |
    ok  state the oneflow-api convention
    ok  state the oneflow-modal convention
    ok  record that the legacy tongflow form is still accepted
    ok  give the reason — the upstream repos are not ours
    ok  keep the lowercase rule
    ok  keep the no-hardware rule
    ok  the primary convention bullet leads with oneflow-
    docs/plugins.md: documents the oneflow convention and the legacy exception, with its reason

    Read independently of the guard: `docs/plugins.md` §3 is headed "The naming convention the scanner enforces:", its first bullet names `oneflow-api-…` / `oneflow-modal-…`, and the legacy bullet now also states that "The rule lives in two places that must agree: the installer's id check and `_detect_runner` in the scanner" — the sentence round 1 said the docs would need once the scanner was fixed. AC-5 holds, and the docs now describe the product rather than the intention.

- eval: E6
  run_id: oneflow-plugin-prefix-r2-E6-20260726144417
  exit_code: 0
  baseline: red — ten branches driven, including all four cannot-look paths
  verifier: config:executors.script.prefix_no_config_drift
  verified_at: 2026-07-26T14:44:17Z
  output: |
    no drift vs origin/main: config src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db untouched
    manifest intact: 38 plugins, org still https://github.com/tong-io

    Re-derived from the diff itself: `git diff --name-only origin/main...HEAD` outside `_acceptance/` lists eight files — `docs/plugins.md`, the two scripts under `scripts/plugins/`, `sdk/tongflow/scan.py`, `sdk/tests/test_scan_prefix.py`, and the three under `src/lib/plugins/` (`plugin-id.ts`, `plugin-id.test.ts`, `plugins-install.server.ts`). None is under `config/`, none matches `plugins-registry*`, none is under `src/db/`.

- eval: E7
  run_id: oneflow-plugin-prefix-r2-E7-20260726145432
  exit_code: 0
  baseline: n/a — a compile gate; it is red by construction on a type error
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-26T14:54:32Z

- eval: E8
  run_id: oneflow-plugin-prefix-r2-E8-20260726144424
  exit_code: 0
  baseline: red — every regex mutation below is caught by this suite as well as
    by the targeted file
  verifier: config:executors.test.unit
  verified_at: 2026-07-26T14:44:24Z
  output: |
    Test Files  22 passed (22)
         Tests  270 passed (270)

- eval: E9
  run_id: oneflow-plugin-prefix-r2-E9-20260726144417
  exit_code: 0
  baseline: n/a — a lint gate, red by construction on a violation
  verifier: config:executors.test.lint
  verified_at: 2026-07-26T14:44:17Z
  output: |
    Checked 398 files in 97ms. No fixes applied.

- eval: E10
  run_id: oneflow-plugin-prefix-r2-E10-20260726144446
  exit_code: 0
  baseline: red — reverting `sdk/tongflow/scan.py` to its origin/main form kills
    9 of these 20 tests, including the AC-7 twin test itself
  verifier: config:executors.test.sdk_pytest_scan_prefix
  verified_at: 2026-07-26T14:44:46Z
  output: |
    tests/test_scan_prefix.py::test_both_conventions_register[oneflow-modal-foo] PASSED
    tests/test_scan_prefix.py::test_both_conventions_register[oneflow-api-foo] PASSED
    tests/test_scan_prefix.py::test_both_conventions_register[tongflow-modal-foo] PASSED
    tests/test_scan_prefix.py::test_both_conventions_register[tongflow-api-foo] PASSED
    tests/test_scan_prefix.py::test_identical_plugins_differing_only_in_prefix_fare_identically PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[foo-modal-bar] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[flow-modal-bar] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[oneflowmodal-foo] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[one-flow-modal-foo] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[oneflow-worker-foo] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[oneflow-foo] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_hint_leads_with_oneflow PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-modal-gpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-modal-cpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-api-gpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-api-cpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[tongflow-modal-gpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[tongflow-api-cpu-foo] PASSED
    tests/test_scan_prefix.py::test_uppercase_gets_the_rename_hint_not_the_prefix_error[OneFlow-Modal-Foo] PASSED
    tests/test_scan_prefix.py::test_uppercase_gets_the_rename_hint_not_the_prefix_error[TongFlow-Api-Foo] PASSED

    20 passed. `-v` is a reporter flag; the config key resolves to `cd sdk && python3 -m pytest -q tests/test_scan_prefix.py` and was also run in that exact form, with the same outcome. These tests call `tongflow.scan.scan()` directly — the same function `python3 -m tongflow` invokes — over fixtures they build in `tmp_path`, so they exercise the production code path rather than a re-implementation.

- eval: E11
  run_id: oneflow-plugin-prefix-r2-E11-20260726144428
  exit_code: 0
  baseline: red — the same scan.py revert leaves the rest of the SDK suite green
    and kills only the new prefix tests, so widening the gate broke nothing
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-26T14:44:28Z
  output: |
    86 passed in 5.80s

## AC-7 re-derived independently, without the repository's tests

The contract has been wrong once about the scanner, so AC-7 was rebuilt from
scratch rather than read off `test_scan_prefix.py`.

`src/lib/plugins/plugins-scanner.server.ts` runs the scanner as
`execFileSync(python3, ["-m", "tongflow", "--root", pluginsDir(), "--abi",
join(resourcesDir(), "config", "tongflow.abi.json")])`, with `cwd` at
`resourcesDir()` and `PYTHONPATH` prefixed by `resourcesDir()/sdk`. That exact
invocation was reproduced by hand.

The fixtures are not synthetic. Two **real** installed official plugins were
copied into a scratch plugins root twice each, once under an `oneflow-` name and
once under a `tongflow-` name, `.git` excluded so nothing but the directory name
could differ:

```
oneflow-modal-twin / tongflow-modal-twin   ← copies of tongflow-modal-whisper (deploy-first)
oneflow-api-twin   / tongflow-api-twin     ← copies of tongflow-api-gemini    (nine slots)
```

Byte-identity was proven, not assumed: `diff -r` reports no differences within
each pair, and a rolled-up SHA-256 over each directory's sorted file list gives
`b1052781…` for both members of the modal pair and `637eabd0…` for both members
of the api pair.

Running the real scanner over that root:

```
registered plugin ids: ['oneflow-api-twin', 'oneflow-modal-twin', 'tongflow-api-twin', 'tongflow-modal-twin']

--- oneflow-modal-twin vs tongflow-modal-twin ---
 localSubdir: oneflow-modal-twin | tongflow-modal-twin
 everything else identical: True
  record: {"entryFile": "entry.py", "methodsByNodeSlot": {"transcribe": {"methodName": "transcribe_slot"},
           "transcribe-timestamp": {"methodName": "transcribe_timestamp"}}, "needsDeploy": true}

--- oneflow-api-twin vs tongflow-api-twin ---
 localSubdir: oneflow-api-twin | tongflow-api-twin
 everything else identical: True

--- nodePluginMap ---
  transcribe            -> ['oneflow-modal-twin', 'tongflow-modal-twin']
  transcribe-timestamp  -> ['oneflow-modal-twin', 'tongflow-modal-twin']
  gen-text              -> ['oneflow-api-twin', 'tongflow-api-twin']
  image-gen             -> ['oneflow-api-twin', 'tongflow-api-twin']
  … nine slots for the api pair, both members present in each
```

All four register; each pair's registry record is identical once `localSubdir`
— the directory name itself — is removed; and both members of each pair appear in
`nodePluginMap` for every slot they implement. That is AC-7, observed directly on
production code with production plugin contents. The deploy-first member also
carries `needsDeploy: true` identically, so the `@deploy` AST path is
prefix-blind as well.

Two honest caveats, neither a criterion failure:

1. The scanner emitted default-claim clash errors, because installing two copies
   of the same plugin means two plugins claim the same slot's default. The winner
   is `oneflow-*` in every case, and the reason is directory order, not prefix
   preference: `_iter_plugin_dirs` sorts names and `"oneflow-" < "tongflow-"`.
   This is the documented first-in-directory-order behaviour, and it cannot arise
   from a real install (two directories cannot share a name).
2. A twin pair is **not** fully indistinguishable in the product. See
   "A third place the directory name is matched" below.

## The round-1 defect is gone — driven, not assumed

The original mutation was put back two ways in a `--no-hardlinks` scratch clone,
each grep-confirmed to have landed before anything was read from it.

**A1 — narrow the shared tuple** to `_PLUGIN_PREFIXES = ("tongflow-",)`: 8 of the
20 prefix tests are killed, including `test_identical_plugins_differing_only_in_prefix_fare_identically`.

**A2 — restore `sdk/tongflow/scan.py` wholesale from `origin/main`** (17
insertions, 41 deletions against HEAD; `grep` confirms `startswith("tongflow-modal-")`
is back at lines 61 and 84): 9 of the 20 are killed, adding
`test_unknown_prefix_hint_leads_with_oneflow`.

With A2 in place, the real scanner was re-run over the *same* twin fixtures used
above:

```
WITH ROUND-1 scan.py (origin/main) — registered: ['tongflow-api-twin', 'tongflow-modal-twin']
  error: oneflow-api-twin   -> unknown pluginId prefix; fix: use tongflow-modal-<name> or tongflow-api-<name>
  error: oneflow-modal-twin -> unknown pluginId prefix; fix: use tongflow-modal-<name> or tongflow-api-<name>
```

Same fixtures, same command, opposite outcome. The defect round 1 reported was
real, it is fixed, and the new tests are what stands between it and a regression.
`scan.py` was restored and the clone re-confirmed clean afterwards.

## Failure-branch drive

All mutation work was done in a `--no-hardlinks` scratch clone outside the
repository. The repository working tree was never modified and no commit was made
in it; `git status --porcelain` on the repository is empty and HEAD is unchanged
at 8254c0bd. Every mutation was confirmed landed (`git diff --stat` plus a
targeted `grep`) before its result was read, and the clone was confirmed clean
after each restore — a mutation that does not land reads exactly like a guard
that does not fire.

### `src/lib/plugins/plugin-id.ts` — 7 mutations, all caught

| # | Mutation | Tests killed |
|---|---|---|
| M1 | revert to the `tongflow`-only regex | 7 — the whole AC-1 block |
| M2 | tighten to the `oneflow`-only regex | 38 — every official-plugin case, and only those |
| M3 | widen the runner segment to `[a-z]+` | 3 — `oneflow-gpu-x`, `oneflow-cpu-x`, `oneflow-worker-x` |
| M4 | drop both anchors | 5 — leading/trailing space, path separator, traversal, substring |
| M5a | remove the word "legacy" from the error | 1 — the legacy-marking assertion |
| M5b | name the tongflow form first | 2 — the ordering assertion and the runner-token assertion |
| M5c | drop the `oneflow-api-*` token | 1 — the runner-token assertion |

Each was caught by the tests that claim to cover that behaviour, not by
collateral damage. M3 left the uppercase and separator cases alone and M4 left
the underscore and uppercase cases alone, both correctly — no test is doing
double duty as a coincidental guard.

### `sdk/tongflow/scan.py` — 5 mutations, 4 caught, 1 survivor

| # | Mutation | Tests killed |
|---|---|---|
| A1 | shared tuple narrowed to `tongflow-` only | 8 |
| A2 | whole file reverted to origin/main | 9 |
| B1 | **the unknown-prefix gate removed** (`rest` falls back to the unstripped id) | **0 — survivor** |
| B2 | the gpu/cpu guard never runs | 6 — all six hardware cases, both prefixes |
| B3 | the lowercase hint made `tongflow`-aware only | 1 — the `OneFlow-Modal-Foo` case |
| B4 | the hint reordered to lead with tongflow and lose "legacy" | 1 — the hint-ordering assertion |

**B1 is a real coverage gap, and it is a gap in the tests, not a defect in the
shipped code.** Removing the first unknown-prefix gate is indistinguishable to
this suite because every rejected name it exercises (`foo-modal-bar`,
`flow-modal-bar`, `oneflowmodal-foo`, `one-flow-modal-foo`, `oneflow-worker-foo`,
`oneflow-foo`) also fails the *second* prefix check further down, which returns
the identical message. The suite contains no directory named with a bare runner
segment and no vendor prefix at all. Driven directly against the real scanner:

```
directories: modal-foo, api-foo (valid handlers, no vendor prefix)

UNMUTATED HEAD          plugins: []                      errors: unknown pluginId prefix ×2
WITH B1 (gate removed)  plugins: ['api-foo', 'modal-foo'] errors: none
```

So HEAD is correct — a prefix-less directory is rejected — but nothing in
`test_scan_prefix.py` would notice if that stopped being true. Adding
`"modal-foo"` and `"api-foo"` to `test_unknown_prefix_is_still_rejected`'s
parameter list closes it in one line and is worth doing before the gate is
relied on as a standing check.

### `scripts/plugins/check-prefix-docs.sh` — 8 branches, 8 fail closed

| Branch | Result |
|---|---|
| `docs/plugins.md` absent (cannot look) | refuses: "missing docs/plugins.md — refusing to report the docs correct" |
| oneflow-api bullet reworded | names the missing rule |
| the `oneflow-modal-` token removed from the primary bullet | names the missing rule |
| legacy tongflow bullet deleted | names the missing rule |
| the "not ours" reason removed from the bullet | names the missing rule |
| lowercase rule deleted | names the missing rule |
| no-hardware rule deleted | names the missing rule |
| primary bullet switched back to `tongflow-` | caught, by two assertions plus the dedicated negative check |

### `scripts/plugins/check-no-config-drift.sh` — 10 branches, 10 fail closed

| Branch | Result |
|---|---|
| base ref unresolvable (cannot look) | refuses: "cannot resolve base ref … fetch it first" |
| `git diff` itself fails — driven with a failing `git` shim on PATH (cannot look) | refuses: "git diff against 'origin/main' failed — refusing to report a clean tree" |
| `config/official-plugins.json` absent (cannot look) | refuses: "missing … — refusing to report it unchanged" |
| `python3` unavailable, so the manifest cannot be parsed (cannot look) | terminates unsuccessfully rather than reporting the manifest intact |
| the manifest is malformed JSON (cannot look) | terminates unsuccessfully with the decoder error |
| a file added under `config/` | names the file |
| `plugins-registry.server.ts` edited | names the file |
| `plugins-registry-schema.ts` edited | names the file |
| `src/db/workspace.schema.ts` edited | names the file |
| `org` repointed / manifest shrunk to 5 entries | caught — and, with the diff neutralised so the content assertions were the only thing left, each is caught by its own assertion with its own message |

One methodological note worth recording, because it changes how these branches
must be driven: the guard reads `git diff --name-only "${BASE}...HEAD"`, which
compares **commits**. An uncommitted edit in the working tree is invisible to it
and the guard reports clean — correctly, since an uncommitted edit is not part of
the pull request. Every drift branch above was therefore committed in the scratch
clone (on a throwaway branch, reset to a fixed SHA afterwards) rather than merely
written to disk. The two manifest-content branches were driven a second way, with
a base ref carrying the same change so the diff was empty, which is the only
state in which the `org` and count assertions are reachable at all.

## Adversarial read — one false pass is still present

The recurring defect in this repo is a guard that announces "clean" when it could
not look. `check-prefix-docs.sh` has now had three instances. The third was
addressed since round 1, but **it was narrowed, not anchored**, and the residual
false pass survives.

The assertion now reads:

```bash
# Anchored like the rest. Left unanchored, this one accepted the phrase from
# anywhere in the file …
need "give the reason — the upstream repos are not ours" 'are upstream repos under an org this fork does not control'
```

The comment says "Anchored like the rest". It is not: its six neighbours begin
with `^- `, and this pattern has no anchor at all. What changed is that the
phrase became much more specific, which raises the bar without moving it. Driven:
the reason clause was deleted from the convention bullet (`are upstream repos
under an org this fork does not control, and the installer…` → `are elsewhere,
and the installer…`) and the same sentence was re-introduced elsewhere in the
file as an HTML comment quoting `sdk/tongflow/scan.py`. The guard's response:

```
ok  give the reason — the upstream repos are not ours
docs/plugins.md: documents the oneflow convention and the legacy exception, with its reason
```

It reports the reason present, and its closing line claims "with its reason",
after the reason has been removed from the bullet the check exists to protect.
The phrase is duplicated verbatim in `sdk/tongflow/scan.py` and
`src/lib/plugins/plugin-id.ts` today, so a future doc that quotes either — a
perfectly ordinary thing to do — recreates exactly this state. The remedy is the
one already applied to the six neighbours: anchor it to the legacy bullet rather
than searching the whole document.

This does not overturn AC-5: the docs *are* correct on this tree, verified by
reading §3 directly and independently of the guard. What is unreliable is the
guard's ability to notice if they stop being correct.

Two smaller observations, neither a false pass today:

- `check-no-config-drift.sh` enumerates `plugins-registry-schema.ts` and
  `plugins-registry.server.ts` by name where AC-6 says `plugins-registry*`. Those
  are still the only two files matching that glob (`ls src/lib/plugins/plugins-registry*`
  confirms), so coverage is currently exact; a future third file would fall
  outside the list.
- `check-prefix-docs.sh`'s negative check fires only on `^- It must begin with
  \`tongflow-`. A document that keeps the correct primary bullet and adds a
  *separate* bullet recommending `tongflow-` for new work would pass. Narrow, but
  it is the same anchoring habit.

Nothing else in either script, either test file, or the changed source produces a
false pass. `test_scan_prefix.py`'s helpers fail closed: `_error_for` returns the
empty string when no error matches that plugin id, which makes the following
`assert "…" in msg` fail rather than pass; `_ids` reads the `plugins` dict's keys,
so a plugin that never registered cannot appear; and the register-side tests
assert `payload["errors"] == []` rather than merely checking the id is present.
`plugin-id.test.ts` reads the manifest at run time and guards both its shape and
its size, so the 38-case table cannot be silently emptied.

## A third place the directory name is matched — and the "two layers" claim

The contract states the prefix is enforced in exactly two places. The whole
repository was swept for other sites where a plugin directory name is
pattern-matched: `git grep` for `flow-(modal|api)`, for `startswith` / `startsWith`
/ regex / glob use over directory listings, and a read of every file that
enumerates the plugins root.

**On enforcement, the "two layers" claim now holds.** The only gates that decide
whether a plugin is accepted or registered are `PLUGIN_ID_RE` in
`src/lib/plugins/plugin-id.ts` (used by `plugins-install.server.ts`) and
`_detect_runner` in `sdk/tongflow/scan.py`. Everything else that walks the
plugins root gates on file presence, not on the name:
`src/ext-default/plugin-env.ts` requires `.git` plus `tongflow.plugin.json`;
`official-plugins.server.ts::listInstalledCommunityPlugins` filters by manifest
membership and `.git` presence; `scripts/install-official-plugins.mjs` derives
the directory from the manifest id; `verify-plugins-scan.ts` has no name logic.
The desktop shell has none. Nothing in the SDK outside `scan.py` matches a
directory name. `SKIP_DIR_NAMES` in `scan.py` excludes a directory literally
named `tongflow` (the vendored SDK), which is an exact-name skip, not a prefix
gate.

**But there is a third place the directory name is pattern-matched, and it treats
the two prefixes differently.** `pluginDisplayName()` in
`src/components/workspace/nodes/base/node-plugin-id-select.tsx`:

```ts
const semantic = parts[0] === "tongflow" ? parts.slice(1) : parts;
```

A `tongflow-api-openai` plugin is listed in the node's plugin picker as
`api-openai`; an `oneflow-api-openai` plugin is listed as `oneflow-api-openai`.
So the byte-identical twins of the AC-7 experiment are **not** indistinguishable
in the product: they render under different labels. This is presentation, not
enforcement — it cannot stop a plugin registering or running — so AC-7, scoped as
it is to registry records, is unaffected, and no eval is failed by it. It is
recorded because it is a real inconsistency shipped by this change and because
the contract's framing ("two places") invites the reader to believe the name is
matched nowhere else.

Two user-facing strings were also left behind, both outside the gate's reach
(`src/i18n/messages/**` is a declared T1 skip glob):

- the install dialog's `customHint`, in all five locales, still says the
  repository name "must follow the tongflow-modal-\* or tongflow-api-\*
  convention";
- `plugins-dialog.tsx`'s custom-URL placeholder is still
  `https://github.com/org/tongflow-api-foo.git`.

AC-4 is about the message raised on rejection, which is `pluginIdError()` and
does lead with `oneflow-`, so AC-4 stands. But a developer who reads the dialog
before they trigger an error is still taught the legacy convention. Worth a
follow-up alongside `pluginDisplayName`.

## The T3 escalation — recorded, but one stale copy of the false claim remains

The contract handles the escalation honestly in the place that matters. The
`## Amendment` section quotes the false sentences verbatim ("The regex is the
whole surface: it is the only place the prefix is enforced. The scanner does not
filter by name"), states plainly that both were false, records that a
fresh-context verifier rejected the feature on them, and gives the consequences
including `risk_tier` T2 → T3 with its reason (`sdk/**` is a `t3_paths` entry) and
the admission that AC-1 as originally written was too weak. The `## Context`
section was edited to point at the amendment rather than to hide the error. That
is the right shape: the claim is preserved and corrected, not rewritten away.

One leftover contradicts it. The contract's final `## Notes` section still reads:

> `PLUGIN_ID_RE` là bề mặt duy nhất: scanner không lọc theo tên …

— "`PLUGIN_ID_RE` is the only surface: the scanner does not filter by name". That
is the retracted claim, still stated as current fact, three sections below the
amendment that retracts it. It is a documentation defect in the contract rather
than in the product, and it fails no criterion, but a contract that has already
been wrong once about this should not carry a live second copy of the wrong
sentence. It should be struck or rewritten to point at the amendment.

## Verdict

PASS. All eleven evals executed on this tree and all eleven exited zero, each
with captured output where the eval requires it. AC-7 — the criterion added
because AC-1 alone could be green while the feature was broken — was re-derived
independently of the repository's tests, on real plugin contents, through the
real scanner, and holds. The round-1 defect was driven back in and is killed by
the new tests. Both eval scripts fail closed on every cannot-look path.

Two items are recorded for the human rather than blocking: the residual
unanchored assertion in `check-prefix-docs.sh` (a guard that can still report the
reason present after it is deleted), and the B1 mutation survivor in the SDK
suite (a prefix-less directory name is correctly rejected by the code but by no
test). Neither changes a criterion's verdict; both are cheap to close. The
picker-label inconsistency and the five stale locale hints are a scoping question,
not a gate question.

Gate 2 is a human step; the signature line in this report's frontmatter is
deliberately empty.

## Iterations

- **Round 1 (2026-07-26, commit 5975bb4)** — first verification, outcome REJECT.
  All nine evals then defined were executed and all nine commands exited zero.
  E1 was nevertheless recorded against AC-1: the scanner in `sdk/tongflow/scan.py`
  filtered plugin directories on a tongflow-only prefix before reading their
  contents, so an `oneflow-*` plugin would install and never register —
  demonstrated with byte-identical fixtures under two directory names against the
  real scanner. Five regex/message mutations and fifteen script failure branches
  were driven in a scratch clone; every one was caught. One residual false pass
  was found in `check-prefix-docs.sh`: the "give the reason" assertion was an
  unanchored whole-file search.

- **Round 2 (2026-07-26T14:44–14:54Z, commit 8254c0bd)** — full re-verification
  after the fix, outcome PASS. Two commits landed since the round-1 pin:
  `7901cb6` (docs check) and `8254c0bd` (the scanner gate). The suite grew to
  eleven evals: AC-7 and E10/E11 were added and the contract was re-tiered to T3.
  All eleven were executed and all eleven exited zero. E1–E4 share one verbose
  invocation, credited block by block (7 + 40 + 22 + 4 = 73 tests, the whole
  file). AC-7 was re-derived without the repository's tests, using two real
  official plugins copied under both prefixes and the real
  `python3 -m tongflow` invocation; all four registered with pair-identical
  records. The round-1 defect was reintroduced two ways and kills 8 and 9 of the
  20 new SDK tests respectively. Twelve mutations were driven across
  `plugin-id.ts` and `scan.py` and eighteen branches across the two eval scripts,
  all in a `--no-hardlinks` scratch clone; eleven of twelve mutations were caught
  and all eighteen script branches fail closed. Findings: the round-1 false pass
  in `check-prefix-docs.sh` is **still present** (narrowed, not anchored, and its
  own comment claims otherwise); one mutation survivor in the SDK suite (no test
  covers a prefix-less directory name); a third directory-name match exists in
  `pluginDisplayName()`, presentation-only, which makes the two prefixes render
  differently in the plugin picker; five locale hints and one dialog placeholder
  still teach the legacy convention; and the contract's `## Notes` section still
  carries a live copy of the claim its own amendment retracts.
