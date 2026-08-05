---
schema_version: 2
feature_slug: oneflow-plugin-prefix
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent (round 3); round 4 re-verify 2026-07-29
enforcement_mode: strict
bypass_used: false
verified_commit: f39723a228be90031eb1e3e423664c84829851db
human_signoff: Manh 2026-07-29
---

# Evidence Report: oneflow-plugin-prefix

Round 1 rejected this feature on AC-1: the contract claimed the installer's
regex was the only place the prefix is enforced, the real scanner gated on it
too, and an `oneflow-*` plugin would install and then never register. Round 2
verified the fix and reported four further findings. Round 3 verifies the tree
that closes them, and re-derives everything rather than reading it off round 2.

Nothing was taken on trust from an earlier round or from the contract. Every
`cmd` was resolved line by line against `_acceptance/config.yaml` before it was
run. `enforcement_mode` is `strict`, read from that file. `ACCEPTANCE_GATE_BYPASS`
was checked with `printf '%s'`, which printed nothing, so `bypass_used` is false.
AC-7 was re-derived end to end without the repository's own tests. Every round-2
finding was checked by driving the original mutation back in. The whole
repository was swept again for places a plugin directory name is matched.

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
`config:executors.test.unit_plugin_id`. **It was run once**, with
`--reporter=verbose` (a reporter flag: selection and outcome are unchanged) so
that every test name is visible. Each eval below is credited to its **own named
covering block** from that listing, never to the shared exit status:

- **E1** — the `plugin id — oneflow convention (AC-1)` block, 7 tests.
- **E2** — the `plugin id — tongflow stays installable (AC-2)` block, 40 tests
  (2 manifest guards plus one per official plugin).
- **E3** — the `plugin id — everything else is still rejected (AC-3)` block,
  22 tests.
- **E4** — the `plugin id — the error teaches the current convention (AC-4)`
  block, 4 tests.

Counted from this round's verbose log: 7 + 40 + 22 + 4 = 73. The file reports 75
tests. The two unaccounted-for tests are a **new** block,
`plugin display name — the prefix is a label, not a distinction`, added at HEAD
for the round-2 presentation finding. It is credited to no eval, because no eval
claims it — it is recorded here so the arithmetic is closed rather than rounded.
`grep -c "accepts official plugin"` over the same log returns 38, and
`len(json["plugins"])` on `config/official-plugins.json` is also 38, so the AC-2
table has one live assertion per manifest entry.

## Evidence

- eval: E1
  run_id: oneflow-plugin-prefix-r4-E1-20260727105026
  exit_code: 0
  baseline: red — mutation M1 (regex reverted to the tongflow-only form) kills
    exactly this block's 7 tests; see "Failure-branch drive"
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-foo 1ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-api-foo 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-z-image 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-api-openrouter-free 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-a 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-0 0ms
    ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-flux2-klein9b 0ms

    AC-1 asks whether the new convention works end to end, not merely whether the validator accepts a name — that is the question round 1 answered against this feature. It is answered by E10 and by the independent re-derivation below: the same `oneflow-modal-*` name this block accepts at install time also registers in the scanner, with a record identical to its `tongflow-` twin.

- eval: E2
  run_id: oneflow-plugin-prefix-r4-E2-20260727105026
  exit_code: 0
  baseline: red — mutation M2 (regex tightened to the oneflow-only form) kills
    exactly the 38 per-plugin cases and nothing else
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ plugin id — tongflow stays installable (AC-2) > the manifest still points at the upstream org we do not control 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > has a non-trivial number of official plugins 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-openrouter-free 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-gemini 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-openai 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-deepseek 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-bytedance 0ms
    ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-apimart 0ms
    … 38 "accepts official plugin" lines in total, one per manifest entry

    AC-2 is not vacuous, checked three ways this round: the test reads `config/official-plugins.json` with `readFileSync` at run time rather than from a fixture; the verbose log carries exactly 38 per-id cases against a manifest of exactly 38 entries; and two guards (`org` must equal the upstream URL, `plugins.length` must exceed 30) make the table impossible to empty silently.

- eval: E3
  run_id: oneflow-plugin-prefix-r4-E3-20260727105026
  exit_code: 0
  baseline: red — M3 (runner segment widened) kills the three runner cases and
    M4 (anchors dropped) kills the five shape cases; neither touches the other's
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ plugin id — everything else is still rejected (AC-3) > rejects foo-modal-bar (unrelated prefix) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects flow-modal-bar (prefix substring only) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects twoflow-modal-bar (near-miss prefix) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflowmodal-x (missing the separator) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects one-flow-modal-x (hyphen inside the prefix) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-gpu-x (hardware token instead of a runner) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-cpu-x (hardware token instead of a runner) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-worker-x (unknown runner) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-modal (no name segment) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-modal- (empty name segment) 0ms
    ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow- (prefix alone) 0ms
    … 22 named cases in total, including uppercase, underscore, leading/trailing space, path separator and traversal

    The suppression half is real: the anchors are genuine — JavaScript's `$` matches only at end of input without the `m` flag, and the suite pins that with an explicit `"oneflow-modal-foo\nevil"` case rather than relying on it.

- eval: E4
  run_id: oneflow-plugin-prefix-r4-E4-20260727105026
  exit_code: 0
  baseline: red — three separate message mutations (drop "legacy", name tongflow
    first, drop the `oneflow-api-*` token) each kill their own assertion
  verifier: config:executors.test.unit_plugin_id
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ✓ plugin id — the error teaches the current convention (AC-4) > quotes the offending name 0ms
    ✓ plugin id — the error teaches the current convention (AC-4) > names oneflow before tongflow 0ms
    ✓ plugin id — the error teaches the current convention (AC-4) > marks the tongflow form as legacy rather than presenting it as equal 0ms
    ✓ plugin id — the error teaches the current convention (AC-4) > names both runner segments for the current convention 0ms

    The scanner's own rejection hint is held to the same rule by a separate test in the SDK suite (`test_unknown_prefix_hint_leads_with_oneflow`), so both enforcement layers teach the current convention, not only the installer.

- eval: E5
  run_id: oneflow-plugin-prefix-r4-E5-20260727105026
  exit_code: 0
  baseline: red — nine branches driven this round, seven rule deletions plus the
    cannot-look path plus the round-2 bypass replay; see "Failure-branch drive"
  verifier: config:executors.script.docs_plugin_prefix
  verified_at: 2026-07-27T10:50:26Z
  output: |
    ok  state the oneflow-api convention
    ok  state the oneflow-modal convention
    ok  record that the legacy tongflow form is still accepted
    ok  give the reason — the upstream repos are not ours
    ok  keep the lowercase rule
    ok  keep the no-hardware rule
    ok  the primary convention bullet leads with oneflow-
    docs/plugins.md: documents the oneflow convention and the legacy exception, with its reason

    Read independently of the guard: `docs/plugins.md` §3 is headed "The naming convention the scanner enforces:", its first bullet names `oneflow-api-…` / `oneflow-modal-…`, and the legacy bullet states that the official plugins "are upstream repos under an org this fork does not control" and that "The rule lives in two places that must agree: the installer's id check and `_detect_runner` in the scanner". AC-5 holds on a direct read, not only on the guard's word.

- eval: E6
  run_id: oneflow-plugin-prefix-r4-E6-20260727105026
  exit_code: 0
  baseline: red — eleven branches driven, including all five cannot-look paths
  verifier: config:executors.script.prefix_no_config_drift
  verified_at: 2026-07-27T10:50:26Z
  output: |
    no drift vs origin/main: config src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db untouched
    manifest intact: 38 plugins, org still https://github.com/tong-io

    Re-derived from the diff itself rather than from the guard: `git diff --name-only origin/main...HEAD` outside `_acceptance/` lists sixteen files — `docs/plugins.md`, the two scripts under `scripts/plugins/`, `sdk/tongflow/scan.py`, `sdk/tests/test_scan_prefix.py`, three under `src/components/workspace/`, the five locale files under `src/i18n/messages/`, and three under `src/lib/plugins/` (`plugin-id.ts`, `plugin-id.test.ts`, `plugins-install.server.ts`). None is under `config/`, none matches `plugins-registry*`, none is under `src/db/`.

- eval: E7
  run_id: oneflow-plugin-prefix-r4-E7-20260727105026
  exit_code: 0
  baseline: n/a — a compile gate; it is red by construction on a type error
  verifier: config:executors.test.build_typecheck
  verified_at: 2026-07-27T10:50:26Z

- eval: E8
  run_id: oneflow-plugin-prefix-r4-E8-20260727105026
  exit_code: 0
  baseline: red — every regex mutation below is caught by this suite as well as
    by the targeted file
  verifier: config:executors.test.unit
  verified_at: 2026-07-27T10:50:26Z
  output: |
    Test Files  22 passed (22)
         Tests  272 passed (272)

- eval: E9
  run_id: oneflow-plugin-prefix-r4-E9-20260727105026
  exit_code: 0
  baseline: n/a — a lint gate, red by construction on a violation
  verifier: config:executors.test.lint
  verified_at: 2026-07-27T10:50:26Z
  output: |
    Checked 398 files in 68ms. No fixes applied.

- eval: E10
  run_id: oneflow-plugin-prefix-r4-E10-20260727105026
  exit_code: 0
  baseline: red — six mutations of the scanner's prefix logic were driven and
    all six are caught, including the one that survived round 2
  verifier: config:executors.test.sdk_pytest_scan_prefix
  verified_at: 2026-07-27T10:50:26Z
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
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[modal-foo] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[api-foo] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[foo] PASSED
    tests/test_scan_prefix.py::test_unknown_prefix_hint_leads_with_oneflow PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-modal-gpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-modal-cpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-api-gpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[oneflow-api-cpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[tongflow-modal-gpu-foo] PASSED
    tests/test_scan_prefix.py::test_hardware_in_the_id_is_still_rejected[tongflow-api-cpu-foo] PASSED
    tests/test_scan_prefix.py::test_uppercase_gets_the_rename_hint_not_the_prefix_error[OneFlow-Modal-Foo] PASSED
    tests/test_scan_prefix.py::test_uppercase_gets_the_rename_hint_not_the_prefix_error[TongFlow-Api-Foo] PASSED

    23 passed. `-v` is a reporter flag; the config key resolves to `cd sdk && python3 -m pytest -q tests/test_scan_prefix.py` and was also run in that exact form, with the same outcome. The suite grew from 20 to 23 this round: `modal-foo`, `api-foo` and `foo` are the prefix-less cases round 2 found missing. These tests call `tongflow.scan.scan()` directly — the same function `python3 -m tongflow` invokes — over fixtures they build in `tmp_path`, so they exercise the production code path rather than a re-implementation.

- eval: E11
  run_id: oneflow-plugin-prefix-r4-E11-20260727105026
  exit_code: 0
  baseline: red — the scan.py revert leaves the rest of the SDK suite green and
    kills only the prefix tests, so widening the gate broke nothing
  verifier: config:executors.test.sdk_pytest
  verified_at: 2026-07-27T10:50:26Z
  output: |
    89 passed in 4.15s

## AC-7 re-derived independently, without the repository's tests

The contract has been wrong once about the scanner, so AC-7 was rebuilt from
scratch again rather than read off `test_scan_prefix.py` or off round 2.

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
each pair, and a rolled-up SHA-256 over each directory's sorted file list and
contents gives `96c8b053…` for both members of the modal pair and `579c3a00…`
for both members of the api pair.

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

--- nodePluginMap (slots where a twin appears) ---
  arrange-group          -> ['oneflow-api-twin', 'tongflow-api-twin']
  audio-describe         -> ['oneflow-api-twin', 'tongflow-api-twin']
  combine-text           -> ['oneflow-api-twin', 'tongflow-api-twin']
  drop-video             -> ['oneflow-api-twin', 'tongflow-api-twin']
  gen-text               -> ['oneflow-api-twin', 'tongflow-api-twin']
  image-edit             -> ['oneflow-api-twin', 'tongflow-api-twin']
  image-fusion           -> ['oneflow-api-twin', 'tongflow-api-twin']
  image-gen              -> ['oneflow-api-twin', 'tongflow-api-twin']
  split-text             -> ['oneflow-api-twin', 'tongflow-api-twin']
  transcribe             -> ['oneflow-modal-twin', 'tongflow-modal-twin']
  transcribe-timestamp   -> ['oneflow-modal-twin', 'tongflow-modal-twin']
```

All four register; each pair's registry record is identical once `localSubdir`
— the directory name itself — is removed; and both members of each pair appear
in `nodePluginMap` for every slot they implement. That is AC-7, observed directly
on production code with production plugin contents. The deploy-first member also
carries `needsDeploy: true` identically, so the `@deploy` AST path is
prefix-blind as well.

The presentation half was re-derived the same way, because round 2 found the
label was where the prefix leaked back out. `pluginDisplayName` was imported and
called directly, outside the test file:

```
oneflow-api-twin -> api-twin   |   tongflow-api-twin -> api-twin   |   identical: true
oneflow-modal-twin -> modal-twin   |   tongflow-modal-twin -> modal-twin   |   identical: true
oneflow-api-openai -> api-openai   |   tongflow-api-openai -> api-openai   |   identical: true
oneflow-modal-z-image -> modal-z-image   |   tongflow-modal-z-image -> modal-z-image   |   identical: true
```

The twins are now indistinguishable in the picker as well as in the registry.

One honest caveat, unchanged from round 2 and not a criterion failure: the
scanner emitted default-claim clash entries, because installing two copies of the
same plugin means two plugins claim the same slot's default. The winner is
`oneflow-*` in every case, and the reason is directory order, not prefix
preference — `_iter_plugin_dirs` sorts names and `"oneflow-" < "tongflow-"`.
This is the documented first-in-directory-order behaviour and cannot arise from
a real install, since two directories cannot share a name.

## The four round-2 findings — each driven, not assumed

All mutation work was done in a `--no-hardlinks` scratch clone outside the
repository, checked out at the same commit as HEAD. The repository working tree
was never modified and no commit was made in it; `git status --porcelain` on the
repository is empty and HEAD is unchanged. Every mutation was confirmed landed
(a targeted `grep` plus, where relevant, `git diff --stat`) before its result was
read — a mutation that does not land reads exactly like a guard that does not
fire — and the clone was confirmed clean after each restore.

**Finding 1 — the third pattern-match site (`pluginDisplayName` stripped only
`tongflow`). Fixed, and now pinned by tests.** The helper moved from
`src/components/workspace/nodes/base/node-plugin-id-select.tsx` into
`src/lib/plugins/plugin-id.ts`, beside the regex; both call sites
(`node-plugin-id-select.tsx`, `settings-dialog.tsx`) import it from there. Three
mutations were driven against it and each is caught by the new block:

| # | Mutation | Tests killed |
|---|---|---|
| M6 | `VENDOR_PREFIXES` narrowed back to `["tongflow"]` — the exact round-2 defect | 1 |
| M7 | `VENDOR_PREFIXES` emptied, so no prefix is stripped | 1 |
| M8 | the first segment stripped unconditionally, prefix or not | 1 |

**Finding 2 — the install hint and the dialog placeholder taught only the legacy
form. Fixed in all five locales and in the dialog.** Read directly: every one of
`en`, `ja`, `ko`, `vi`, `zh` now carries a `plugins.customHint` naming
`oneflow-modal-*` / `oneflow-api-*` first and marking the `tongflow-*` names as
still accepted, and `plugins-dialog.tsx`'s custom-URL placeholder reads
`https://github.com/org/oneflow-api-foo.git`. Each locale diff against
`origin/main` is exactly one changed value line.

**Finding 3 — the surviving mutation in the SDK suite (removing the scanner's
first unknown-prefix gate killed zero tests). Closed.** The suite grew by three
prefix-less cases and the mutation now kills two of them:

```
tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[modal-foo]
tests/test_scan_prefix.py::test_unknown_prefix_is_still_rejected[api-foo]
```

Two neighbouring gate-removal variants were driven as well, to check the closure
is not narrowly aimed at the one mutation that was reported: removing the
**second** unknown-prefix gate kills the `oneflow-worker-foo` and `oneflow-foo`
cases, and making `_strip_plugin_prefix` return the id unchanged instead of
`None` kills the same two prefix-less cases as B1. No survivor remains among the
eight scanner mutations driven.

**Finding 4 — the third assertion in `check-prefix-docs.sh` was narrowed, not
anchored, under a comment claiming it was anchored. Fixed, and the round-2
bypass no longer works.** The assertion now reads

```bash
need "give the reason — the upstream repos are not ours" '^  are upstream repos under an org this fork does not control'
```

and its comment now records all three attempts honestly rather than claiming a
state the code was not in. Round 2's exact bypass was replayed: the reason clause
was deleted from the legacy bullet and the same sentence was reintroduced
elsewhere in the file as an HTML comment quoting `sdk/tongflow/scan.py`. The
guard's response this round:

```
FAIL: docs/plugins.md does not give the reason — the upstream repos are not ours
```

The bypass is closed. A residual remains and is recorded below.

## Failure-branch drive

### `src/lib/plugins/plugin-id.ts` — 10 mutations, all caught

| # | Mutation | Tests killed |
|---|---|---|
| M1 | revert to the `tongflow`-only regex | 7 — the whole AC-1 block |
| M2 | tighten to the `oneflow`-only regex | 38 — every official-plugin case, and only those |
| M3 | widen the runner segment to `[a-z]+` | 3 — `oneflow-gpu-x`, `oneflow-cpu-x`, `oneflow-worker-x` |
| M4 | drop both anchors | 5 — leading/trailing space, path separator, traversal, substring |
| M5a | remove the word "legacy" from the error | 1 — the legacy-marking assertion |
| M5b | swap the message so tongflow is named first | 1 — the ordering assertion |
| M5c | drop the `oneflow-api-*` token | 1 — the runner-token assertion |
| M6–M8 | the three `pluginDisplayName` mutations above | 1 each |

Each was caught by the tests that claim to cover that behaviour, not by
collateral damage. M3 left the uppercase and separator cases alone and M4 left
the underscore and uppercase cases alone, both correctly — no test is doing
double duty as a coincidental guard.

### `sdk/tongflow/scan.py` — 8 mutations, all caught

| # | Mutation | Tests killed |
|---|---|---|
| A1 | shared tuple narrowed to `tongflow-` only | 8 |
| A2 | whole file restored from origin/main (the round-1 state) | 9 |
| B1 | the **first** unknown-prefix gate removed — the round-2 survivor | 2 |
| B2 | the gpu/cpu guard never runs | 6 — all six hardware cases, both prefixes |
| B3 | the lowercase hint made `tongflow`-aware only | 1 — the `OneFlow-Modal-Foo` case |
| B4 | the hint reordered to lead with tongflow and lose "legacy" | 1 |
| B5 | the **second** unknown-prefix gate removed | 2 |
| B6 | `_strip_plugin_prefix` accepts an id with no prefix | 2 |

A2 was verified landed by inspecting the restored file: `startswith("tongflow-`
is back at five sites, and the change against HEAD is 17 insertions and 41
deletions. `scan.py` was restored afterwards and the clone re-confirmed clean.

### `scripts/plugins/check-prefix-docs.sh` — 9 branches, 8 fail closed

| Branch | Result |
|---|---|
| `docs/plugins.md` absent (cannot look) | refuses: "missing docs/plugins.md — refusing to report the docs correct" |
| oneflow-api bullet reworded | names the missing rule |
| the `oneflow-modal-` token removed from the primary bullet | names the missing rule |
| legacy tongflow bullet deleted | names the missing rule |
| **round-2 bypass replay**: reason deleted from the bullet, same sentence re-added as an HTML comment | now names the missing rule — closed |
| lowercase rule deleted | names the missing rule |
| no-hardware rule deleted | names the missing rule |
| primary bullet switched back to `tongflow-` | caught, by two assertions plus the dedicated negative check |
| reason deleted from the bullet, phrase re-added as a two-space-indented continuation line under a different bullet | **reports the docs correct — residual, see below** |

### `scripts/plugins/check-no-config-drift.sh` — 11 branches, 11 fail closed

| Branch | Result |
|---|---|
| base ref unresolvable (cannot look) | refuses: "cannot resolve base ref … fetch it first" |
| `git diff` itself fails — driven with a failing `git` shim on PATH (cannot look) | refuses: "git diff against 'origin/main' failed — refusing to report a clean tree" |
| `config/official-plugins.json` absent (cannot look) | refuses: "missing … — refusing to report it unchanged" |
| `python3` unavailable, so the manifest cannot be parsed (cannot look) | terminates unsuccessfully rather than reporting the manifest intact |
| the manifest is malformed JSON (cannot look) | terminates unsuccessfully, printing the decoder error |
| a file added under `config/` | names the file |
| `plugins-registry.server.ts` edited | names the file |
| `plugins-registry-schema.ts` edited | names the file |
| `src/db/workspace.schema.ts` edited | names the file |
| `org` repointed | caught by its own assertion, with its own message |
| manifest shrunk to 5 entries | caught by its own assertion, with its own message |

The methodological note from round 2 was re-confirmed and still governs how these
branches must be driven: the guard reads `git diff --name-only "${BASE}...HEAD"`,
which compares **commits**. An uncommitted edit is invisible to it and the guard
reports clean — correctly, since an uncommitted edit is not part of the pull
request. Every drift branch was therefore committed in the scratch clone on a
throwaway branch and reset afterwards. The two manifest-content branches were
driven with the base ref pointed at the mutated commit itself, so the diff was
empty and the `org` and count assertions were the only thing left to fire —
which is the only state in which they are reachable at all.

## Every place a plugin directory name is matched — the complete list

The count has been wrong twice, so the sweep was redone from scratch and widened
to every file type: TypeScript, Python, JSON, shell, workflow YAML, Docker,
`.gitignore`, the desktop shell, and the five locale files. Searches used:
`(one|tong)flow-` across all tracked files; `startsWith` / `startswith` /
`split("-")` / `replace(` / `match(` over anything named `pluginId`,
`plugin_id`, `localSubdir` or `.name`; every regex literal containing `flow`;
every call that enumerates a directory (`readdir*`, `iterdir`, `rglob`, `glob`,
`opendir`); and a read of every file that mentions `pluginId` / `plugin_id` /
`localSubdir` at all — 44 tracked files.

**Sites that pattern-match the directory name — four, of which two are gates:**

| # | Site | Kind | Prefix-symmetric? |
|---|---|---|---|
| 1 | `PLUGIN_ID_RE` in `src/lib/plugins/plugin-id.ts`, used by `plugins-install.server.ts` | enforcement — decides whether a plugin installs | yes |
| 2 | `_PLUGIN_PREFIXES` / `_strip_plugin_prefix` / `_detect_runner` in `sdk/tongflow/scan.py` | enforcement — decides whether a plugin registers | yes |
| 3 | `VENDOR_PREFIXES` / `pluginDisplayName` in `src/lib/plugins/plugin-id.ts` | presentation — the picker and settings label | yes, as of this commit |
| 4 | `SKIP_DIR_NAMES` in `sdk/tongflow/scan.py` | exact-name skip of the vendored SDK directory | n/a — matches the literal name `tongflow`, not a prefix |

**Verdict on the contract's claim.** The contract says the prefix is enforced in
**two** places. **That claim holds.** Sites 1 and 2 are the only gates that decide
whether a plugin is accepted or registered. Site 3 is presentation and cannot
stop a plugin registering or running; it now lives in the same file as site 1,
which is the structural reason a fifth crop of this bug is less likely. Site 4
matches the literal directory name `tongflow` — the vendored SDK package — and is
not a prefix test; the package directory is still named `tongflow`, so it is
correct today. (It is asymmetric in one cosmetic respect: a directory named
exactly `oneflow` in the plugins root would not be skipped. It would be reported
as an unknown-prefix error rather than silently ignored, so it fails loudly. Worth
adding if the import package is ever renamed.)

**Everything else that walks the plugins root gates on file presence or manifest
membership, never on the name.** Checked one by one:

- `src/ext-default/plugin-env.ts` — requires `.git` plus the env manifest file.
- `src/lib/plugins/official-plugins.server.ts::listInstalledCommunityPlugins` —
  filters by manifest membership and install state.
- `src/ext-default/plugin-registry.ts` — globs `*.py` under the root; no name logic.
- `scripts/install-official-plugins.mjs` — derives the directory from the manifest id.
- `scripts/verify-plugins-scan.ts` — no name logic.
- `src/lib/plugins/plugin-python-env.server.ts` — uses the id as a marker filename.
- `src/lib/plugin-executor/runners/generic.ts` — joins `localSubdir` as a path.
- `sdk/tongflow/engine/plugins.py` — uses the id as an opaque path and URL
  component (`{org}/{plugin_id}.git`); prefix-blind, and overridable.
- `.github/workflows/**`, `Dockerfile`, `docker-compose.yml`, `.gitignore`,
  `next.config.ts` — reference the plugins **directory**, never a plugin name pattern.
- The desktop shell contains no plugin-name logic at all (it is a README and an icon).

Two corroborating counts: `split("-")` now appears **exactly once** in the whole
of `src/` and `scripts/` — in `pluginDisplayName` — and the only regex literal
matching a plugin name anywhere in the repository is `PLUGIN_ID_RE`.

**Human-readable strings that teach the convention** (not matching, but they are
where round 2's second finding lived, so they are enumerated): the five
`plugins.customHint` locale values, `plugins-dialog.tsx`'s placeholder, the
rejection message in `pluginIdError`, the two hint strings in `scan.py`, and
`docs/plugins.md` §3. All nine now lead with `oneflow-` and mark `tongflow-` as
legacy.

## i18n key parity

The locale edits did not damage key parity. Keys were flattened and compared at
HEAD and at `origin/main`:

```
--- HEAD --- en keys: 978
  en:  978  missing_vs_en=  0  extra_vs_en=  0
  ja:  902  missing_vs_en= 76  extra_vs_en=  0
  ko:  978  missing_vs_en=  0  extra_vs_en=  0
  vi:  978  missing_vs_en=  0  extra_vs_en=  0
  zh:  978  missing_vs_en=  0  extra_vs_en=  0

--- origin/main --- en keys: 978
  ja:  902  missing_vs_en= 76  extra_vs_en=  0
  (ko / vi / zh identical to HEAD)
```

`ja.json` is 76 keys short of `en.json`, and **the shortfall is identical on
`origin/main`** — it predates this branch and is untouched by it. No locale gained
or lost a key here; each of the five diffs is one changed value.

## Adversarial read

Read in full this round: both eval scripts, both test files, and every changed
source file (`plugin-id.ts`, `plugin-id.test.ts`, `plugins-install.server.ts`,
`scan.py`, `test_scan_prefix.py`, `node-plugin-id-select.tsx`,
`settings-dialog.tsx`, `plugins-dialog.tsx`, `docs/plugins.md`, the five locales).

**One residual false pass, materially narrower than round 2's.** The "give the
reason" assertion in `check-prefix-docs.sh` is now anchored to a line beginning
with two spaces, not to the legacy bullet it exists to protect. Driven: delete
the reason clause from the legacy bullet, then add a two-space-indented
continuation line carrying the same phrase under an unrelated bullet. The guard
reports the reason present and closes with "with its reason", after the reason
has left the bullet.

This is the same shape of defect as round 2's, but its reach has shrunk to the
point where it is unlikely to occur by accident, which is why it is recorded and
not escalated. Round 2's version fired on the phrase appearing **anywhere** in
the document, and the phrase is duplicated verbatim in `sdk/tongflow/scan.py`, so
any doc quoting the scanner recreated the bypass. That no longer works: the
scanner's copy lives on `# `-prefixed comment lines, `plugin-id.ts`'s copy is in a
`*`-prefixed JSDoc block with different wording, and neither produces a line
beginning with exactly two spaces followed by the phrase. Triggering it now takes
someone deliberately writing the sentence as an indented continuation elsewhere.
The remedy is unchanged and cheap: match the legacy bullet and its continuation
as one unit rather than matching a line shape.

This does not overturn AC-5. The docs *are* correct on this tree, verified by
reading §3 directly and independently of the guard. What is imperfect is the
guard's ability to notice if they stop being correct.

Two smaller observations, neither a false pass today:

- `check-no-config-drift.sh` enumerates `plugins-registry-schema.ts` and
  `plugins-registry.server.ts` by name where AC-6 says `plugins-registry*`. Those
  are still the only two files matching that glob, so coverage is currently
  exact; a future third file would fall outside the list.
- `check-prefix-docs.sh`'s negative check fires only on ``^- It must begin with
  `tongflow-``. A document that keeps the correct primary bullet and adds a
  *separate* bullet recommending `tongflow-` for new work would pass. Narrow, but
  it is the same anchoring habit.

Nothing else in either script, either test file, or the changed source produces a
false pass. `test_scan_prefix.py`'s helpers fail closed: `_error_for` returns the
empty string when no error matches that plugin id, which makes the following
`assert "…" in msg` fail rather than pass; `_ids` reads the `plugins` dict's keys,
so a plugin that never registered cannot appear; and the register-side tests
assert `payload["errors"] == []` rather than merely checking the id is present.
`plugin-id.test.ts` reads the manifest at run time and guards both its shape and
its size, so the 38-case table cannot be silently emptied; its AC-4 ordering
assertion uses `indexOf` on both tokens and `oneflow-` is not a substring of
`tongflow-`, so the comparison is meaningful rather than accidentally true. The
new display-name block asserts equality against literal expected labels rather
than comparing the two calls to each other, so a helper that returned its input
unchanged would fail it.

**No new false pass was found, and no criterion is affected by the one residual.**

## The contract's retracted claim

Round 2 recorded that the contract's `## Notes` still carried the retracted "the
regex is the only surface" sentence as current fact, three sections below the
amendment that retracts it. **That is fixed.** The Notes now open by stating that
the prefix is enforced at two layers, name both of them, and record explicitly
that the earlier note asserted a single layer and was the very sentence the
amendment retracts. A thing retracted is now retracted everywhere it was written.

## Verdict

PASS. All eleven evals were executed on this tree and all eleven exited zero,
each with captured output where the eval requires it. AC-7 — the criterion added
because AC-1 alone could be green while the feature was broken — was re-derived
independently of the repository's tests, on real plugin contents, through the
real scanner, and holds in the registry and now in the picker label too. All four
of round 2's findings are closed, each confirmed by driving the original mutation
back in. Eighteen mutations across `plugin-id.ts` and `scan.py` were driven and
all eighteen are caught; twenty script branches were driven and nineteen fail
closed.

One item is recorded for the human rather than blocking: the residual in
`check-prefix-docs.sh`'s "give the reason" assertion, which is line-anchored
rather than bullet-anchored and can still report the reason present after it is
deleted from the bullet — reachable now only by deliberately reintroducing the
sentence as an indented continuation elsewhere. It changes no criterion's verdict
and is cheap to close.

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
  after the fix, outcome PASS. The suite grew to eleven evals: AC-7 and E10/E11
  were added and the contract was re-tiered to T3. All eleven were executed and
  all eleven exited zero. E1–E4 share one verbose invocation, credited block by
  block. AC-7 was re-derived without the repository's tests, using two real
  official plugins copied under both prefixes and the real `python3 -m tongflow`
  invocation; all four registered with pair-identical records. Twelve mutations
  and eighteen script branches were driven. Findings: the round-1 false pass in
  `check-prefix-docs.sh` was still present (narrowed, not anchored, under a
  comment claiming otherwise); one mutation survivor in the SDK suite (no test
  covered a prefix-less directory name); a third directory-name match in
  `pluginDisplayName()`, presentation-only, which made the two prefixes render
  differently in the plugin picker; five locale hints and one dialog placeholder
  still teaching the legacy convention; and the contract's `## Notes` still
  carrying a live copy of the claim its own amendment retracts.

- **Round 3 (2026-07-26T15:41–15:42Z, commit 66f80430)** — full re-verification
  at the commit that closes round 2's findings, outcome PASS. One commit landed
  since the round-2 pin: `66f80430`, which moved `pluginDisplayName` into
  `plugin-id.ts` and made it strip both prefixes, updated the five locale hints
  and the dialog placeholder, added the three prefix-less cases to
  `test_scan_prefix.py`, anchored the third assertion in `check-prefix-docs.sh`,
  and corrected the contract's `## Notes`. All eleven evals were executed and all
  eleven exited zero. E1–E4 again share one verbose invocation, credited block by
  block: 7 + 40 + 22 + 4 = 73 of the file's 75 tests, the remaining 2 being the
  new display-name block that no eval claims. AC-7 was re-derived from scratch
  again — same real-plugin twin fixtures, same hand-reproduced
  `python3 -m tongflow` invocation, plus a direct call of `pluginDisplayName`
  outside the test file to check the label half. Eighteen mutations were driven
  across `plugin-id.ts` and `scan.py` and all eighteen are caught, including the
  round-2 survivor (now killing the `modal-foo` and `api-foo` cases) and two
  neighbouring gate-removal variants added to check the closure is not narrowly
  aimed. Twenty script branches were driven; nineteen fail closed. The repository
  was swept again for directory-name matching across every file type: four sites,
  two of them gates, and the contract's "two layers" claim holds. i18n key parity
  is undamaged — `ja.json`'s 76-key shortfall against `en.json` is identical on
  `origin/main` and predates this branch. Residual finding: the "give the reason"
  assertion in `check-prefix-docs.sh` is line-anchored rather than
  bullet-anchored, so round 2's bypass is closed but a deliberately indented
  reintroduction of the sentence elsewhere still satisfies it. No new false pass
  was found.

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

Round 4 — re-verify on `feat/conformance-l0` (2026-07-29). NOT a carry-forward.
`verified_commit` moved from 4dcb419d5d7d4612c10339bede6219662721d7e0 to
05fc9453fa561eaa60166c594974231459359db3, and this one needed a fresh human
signature because the carry-forward rule explicitly does not reach it.

Why it does not carry: this feature owns `sdk/tongflow/scan.py` — the scanner is
the second place the prefix is enforced and the one that decides registration,
which is why the T3 amendment added `sdk_pytest_scan_prefix` in the first place.
The branch under review modifies that file. Ownership was computed, not assumed:
this feature's owned set is the diff of merge commit dd39da8 (PR #18), intersected
with the branch's gated diff; the intersection is `sdk/tongflow/scan.py` and
nothing else. It is the only non-empty intersection in the repo, which is why the
other six features were re-pinned and this one was not.

What that change actually is: purely additive. `conformance-l0` adds a
`read_plugin_rev()` function and its two imports; no existing line of the
prefix-gating path is edited, moved, or reordered.

Evals re-run on the merged tree, one at a time rather than as a suite:

| Eval | Key | Result |
|---|---|---|
| AC-1/AC-2 normaliser | `unit_plugin_id` | PASS — 75 tests |
| AC-4 scanner gating | `sdk_pytest_scan_prefix` | PASS — 23 tests |
| AC-5 docs | `docs_plugin_prefix` | PASS — exit 0, both assertions reported ok |
| AC-6 no-carry | `prefix_no_config_drift` | **FAIL — exit 1**, and it is measuring the wrong PR |

The fourth is the finding of this round, recorded rather than papered over. That
guard asserts "widening the prefix did not carry anything else along" by diffing
`origin/main...HEAD`. On a later branch `HEAD` is a different feature's work, so
it flags `src/lib/plugins/plugins-registry-schema.ts` — a file `conformance-l0`
changes on purpose to record `pluginRev`, and one this feature has no claim on.
It fails closed, so nothing unsafe passed; what it cannot do is tell a reviewer
whether this feature regressed, because it was never asking about this feature's
state. It asks about a PR that merged two days ago.

The substance of AC-6 was therefore checked directly instead of through the
guard: on this branch `config/`, `src/db/`, and
`src/lib/plugins/plugins-registry.server.ts` are untouched, and
`config/official-plugins.json` still carries 38 plugins under
`https://github.com/tong-io`. The full write-up — and why this belongs to a whole
family of expires-at-merge evals rather than being a bug in one script — is in
the contract's Known limits; the fix is queued into item 0.6.

Standing checks green on the merged tree: `pnpm lint:check` (413 files),
`pnpm test` (347 passed), `pnpm build && pnpm typecheck` run sequentially, and
`cd sdk && pytest` (117 passed).

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

## Vòng kiểm lại 2026-08-04 (sau hạng mục 0.6 `gate-scope-anchors`)

Hợp đồng `gate-scope-anchors` chạm `scripts/**`, nên bằng chứng của hồ sơ này
thành cũ theo cơ chế staleness. Đã chạy lại: **11/11 eval xanh** ở
`5acc982e7690`, trong một đợt chạy chung 194 eval / 131 lệnh duy nhất của cả 13 hồ
sơ bị ảnh hưởng — không hồ sơ nào đỏ.

Chi phí này đã khai trước ở Cổng 1 của `gate-scope-anchors`.

## Ghim lại 2026-08-05 (nhánh `chore/landed-merge-anchors`)

Nhánh điền `landed_merge` chạm `scripts/**` (sửa test + hoàn nguyên golden), nên
bằng chứng lại thành cũ. Đã chạy lại đợt chung 139 eval / 85 lệnh của 10 hồ sơ
bị ảnh hưởng ở `f39723a228be` — **0 hồ sơ đỏ**.
