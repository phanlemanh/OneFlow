---
schema_version: 2
feature_slug: oneflow-plugin-prefix
verdict: REJECT
failed_evals: [E1]
reason: >-
  AC-1 is not satisfied. The contract's load-bearing premise — "the regex is the
  whole surface: it is the only place the prefix is enforced. The scanner does
  not filter by name" — is false. sdk/tongflow/scan.py::_detect_runner gates
  every plugin directory on a tongflow- prefix and rejects anything else with
  "unknown pluginId prefix" before it looks at the directory's contents. An
  oneflow-* plugin therefore passes the id validator at install time and is then
  never registered, so the new convention does not work end to end. E1's command
  is green because it exercises only the TypeScript regex, which is the half of
  the surface the contract assumed was all of it.
verified_by: fresh-context verification subagent (round 1)
enforcement_mode: strict
bypass_used: false
verified_commit: 5975bb43b6c61febe829718982c926d87fcea9d0
human_signoff:
---

# Evidence Report: oneflow-plugin-prefix

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | FAIL |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-1 | test | PASS |
| E8 | AC-3 | test | PASS |
| E9 | AC-4 | test | PASS |

Round 1 ran all nine evals on the current tree. Every eval command exited zero.
E1 is nevertheless recorded as failed: its command is green but the criterion it
is bound to is not met, for the reason set out under "The regex is not the whole
surface" below. That finding is the substance of this round.

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

7 + 40 + 22 + 4 = 73, which is the whole file — no test is unaccounted for and
no eval rests on another eval's block.

## Evidence

### E1 — AC-1: an oneflow-* id is accepted

- run_id: oneflow-plugin-prefix-r1-E1-20260726135519
- verifier: config:executors.test.unit_plugin_id
- verified_at: 2026-07-26T13:55:19Z
- exit_code: 0
- verdict: FAIL — the command is green, the criterion is not met (see below)
- output:

```
 ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-foo 1ms
 ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-api-foo 0ms
 ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-z-image 0ms
 ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-api-openrouter-free 0ms
 ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-a 0ms
 ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-0 0ms
 ✓ src/lib/plugins/plugin-id.test.ts > plugin id — oneflow convention (AC-1) > accepts oneflow-modal-flux2-klein9b 0ms
```

The TypeScript validator does accept the new names. AC-1 asks for more than
that — "the new convention works end to end" — and the contract justifies the
narrow test by asserting the regex is the only enforcement point. It is not.

### E2 — AC-2: the 38 official tongflow-* plugins still validate

- run_id: oneflow-plugin-prefix-r1-E2-20260726135519
- verifier: config:executors.test.unit_plugin_id
- verified_at: 2026-07-26T13:55:19Z
- exit_code: 0
- output:

```
 ✓ plugin id — tongflow stays installable (AC-2) > the manifest still points at the upstream org we do not control 0ms
 ✓ plugin id — tongflow stays installable (AC-2) > has a non-trivial number of official plugins 0ms
 ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-openrouter-free 0ms
 ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-api-gemini 0ms
 ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-ffmpeg 0ms
 ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-triposplat 0ms
 ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-whisper 0ms
 ✓ plugin id — tongflow stays installable (AC-2) > accepts official plugin tongflow-modal-scrapling 0ms
   … 38 "accepts official plugin" lines in total, one per manifest entry
```

**AC-2 is not vacuous** — checked three ways, not assumed:

1. The test opens `config/official-plugins.json` with `readFileSync` at runtime
   (twice: once for the two guard assertions, once inline as the `it.each`
   table). There is no copied fixture list.
2. `grep -c "accepts official plugin"` over the verbose log returns **38**, and
   `len(json["plugins"])` on the manifest is **38** — one assertion per id, each
   its own test case with its own pass/fail.
3. The two guards make the per-id table impossible to empty silently: `org` must
   equal `https://github.com/tong-io`, and `plugins.length` must exceed 30. An
   emptied manifest would make `it.each([])` register nothing; the length guard
   fails first.

The mutation `M2` below independently confirms it: tightening the regex to
`oneflow`-only kills exactly those 38 tests and nothing else.

### E3 — AC-3: everything outside both conventions is rejected

- run_id: oneflow-plugin-prefix-r1-E3-20260726135519
- verifier: config:executors.test.unit_plugin_id
- verified_at: 2026-07-26T13:55:19Z
- exit_code: 0
- output:

```
 ✓ plugin id — everything else is still rejected (AC-3) > rejects foo-modal-bar (unrelated prefix) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflowmodal-x (missing the separator) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-gpu-x (hardware token instead of a runner) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-cpu-x (hardware token instead of a runner) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-worker-x (unknown runner) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow-modal- (empty name segment) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects oneflow- (prefix alone) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects ONEFLOW-MODAL-X (uppercase) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects ../oneflow-modal-foo (traversal) 0ms
 ✓ plugin id — everything else is still rejected (AC-3) > rejects a name whose valid form is only a substring 0ms
```

The anchors are genuine. JavaScript's `$` — unlike Perl's or Python's — matches
only at end of input when the `m` flag is absent, so the trailing-newline escape
that would defeat a Python port of the same pattern does not apply here. I
probed it directly rather than reasoning about it: `"oneflow-modal-foo\n"` and
`"tongflow-api-x\n"` both test false.

### E4 — AC-4: the rejection message teaches the current convention

- run_id: oneflow-plugin-prefix-r1-E4-20260726135519
- verifier: config:executors.test.unit_plugin_id
- verified_at: 2026-07-26T13:55:19Z
- exit_code: 0
- output:

```
 ✓ plugin id — the error teaches the current convention (AC-4) > quotes the offending name 0ms
 ✓ plugin id — the error teaches the current convention (AC-4) > names oneflow before tongflow 0ms
 ✓ plugin id — the error teaches the current convention (AC-4) > marks the tongflow form as legacy rather than presenting it as equal 0ms
 ✓ plugin id — the error teaches the current convention (AC-4) > names both runner segments for the current convention 0ms
```

### E5 — AC-5: docs/plugins.md documents the convention

- run_id: oneflow-plugin-prefix-r1-E5-20260726135540
- verifier: config:executors.script.docs_plugin_prefix
- verified_at: 2026-07-26T13:55:40Z
- exit_code: 0
- output:

```
ok  state the oneflow-api convention
ok  state the oneflow-modal convention
ok  record that the legacy tongflow form is still accepted
ok  give the reason — the upstream repos are not ours
ok  keep the lowercase rule
ok  keep the no-hardware rule
ok  the primary convention bullet leads with oneflow-
docs/plugins.md: documents the oneflow convention and the legacy exception, with its reason
```

AC-5 as written is met. It is worth recording, though, that the section the
guard inspects is headed *"The naming convention the scanner enforces:"* and its
first bullet now names `oneflow-api-…` / `oneflow-modal-…`. Given the E1 finding,
that sentence is currently false: the scanner enforces the tongflow forms. The
docs are not wrong about what the contract intended; they are wrong about the
product, and they will become right when the scanner is fixed.

### E6 — AC-6: no drift into config/, plugins-registry*, or src/db

- run_id: oneflow-plugin-prefix-r1-E6-20260726135545
- verifier: config:executors.script.prefix_no_config_drift
- verified_at: 2026-07-26T13:55:45Z
- exit_code: 0
- output:

```
no drift vs origin/main: config src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db untouched
manifest intact: 38 plugins, org still https://github.com/tong-io
```

### E7 — AC-1: build and typecheck

- run_id: oneflow-plugin-prefix-r1-E7-20260726135228
- verifier: config:executors.test.build_typecheck
- verified_at: 2026-07-26T13:52:28Z
- exit_code: 0

### E8 — AC-3: the whole unit suite

- run_id: oneflow-plugin-prefix-r1-E8-20260726135554
- verifier: config:executors.test.unit
- verified_at: 2026-07-26T13:55:54Z
- exit_code: 0

`Test Files 22 passed (22)`, `Tests 270 passed (270)`.

### E9 — AC-4: lint

- run_id: oneflow-plugin-prefix-r1-E9-20260726135547
- verifier: config:executors.test.lint
- verified_at: 2026-07-26T13:55:47Z
- exit_code: 0

`Checked 398 files. No fixes applied.`

## The regex is not the whole surface

The contract states, twice, that `PLUGIN_ID_RE` is the only place the prefix is
enforced and that "the scanner does not filter by name". I checked that claim
against the code rather than accepting it, because AC-1 rests entirely on it.

`src/lib/plugins/plugins-scanner.server.ts` does not inspect names — it shells
out to `python3 -m tongflow --root <pluginsDir>`. The scanner is therefore
`sdk/tongflow/scan.py`, and `_detect_runner` there reads:

```python
    if plugin_id.startswith("tongflow-modal-"):
        prefix_runner = "modal"
    elif plugin_id.startswith("tongflow-api-"):
        prefix_runner = "api"
    else:
        return None, (
            f"{plugin_dir}:1: unknown pluginId prefix; "
            "fix: use tongflow-modal-<name> or tongflow-api-<name>"
        )
```

That is a directory-name filter, and it runs before any of the plugin's contents
are examined. The same function also carries tongflow-only spellings of the
lowercase rule and the no-gpu/cpu rule.

I confirmed the consequence empirically instead of arguing from the source. Two
directories were created under a scratch plugins root with **byte-identical**
`entry.py` files, differing only in directory name, and the real scanner was run
over them:

```
PLUGINS: ['tongflow-modal-foo']
ERRORS:
   oneflow-modal-foo -> oneflow-modal-foo:1: unknown pluginId prefix; fix: use tongflow-modal-<name> or tongflow-api-<name>
```

The tongflow-named copy registers. The oneflow-named copy is rejected at the
name gate. So the end-to-end path for a new-convention plugin is: the id
validator accepts it, the clone succeeds, and `installPlugin` returns with
`recognized: false` because `registry.plugins[id]` is never populated. A
developer following the documented convention gets a plugin that installs and
does nothing.

**Fixing this is not a one-line edit inside this feature's blast radius.**
`sdk/tongflow/scan.py` is under `sdk/**`, which `_acceptance/config.yaml` lists
as a T3 path, and the SDK is a published PyPI artifact whose version every Modal
plugin pins. Widening the scanner means a version bump, a republish, and the pin
sweep described in CLAUDE.md's release checklist. That is a scoping decision for
a human, which is why this report stops at reporting it. AC-6 does not forbid
touching `sdk/`, so the work is not contract-blocked — only unscoped.

## Failure-branch drive: the test suite

Five mutations were applied to `src/lib/plugins/plugin-id.ts` in a
`--no-hardlinks` scratch clone at 5975bb4 (the working tree and its history were
not touched; every mutation was grep-confirmed to have landed before the suite
was run, and the file was restored and re-confirmed afterwards).

| # | Mutation | Tests killed |
|---|---|---|
| M1 | revert to `/^tongflow-(modal\|api)-…/` | 7 — the entire AC-1 `accepts oneflow-*` block |
| M2 | tighten to `/^oneflow-(modal\|api)-…/` | 38 — every `accepts official plugin tongflow-*` case, and only those |
| M3 | widen the runner segment to `[a-z]+` | 3 — `rejects oneflow-gpu-x`, `oneflow-cpu-x`, `oneflow-worker-x` |
| M4 | unanchor (drop `^` and `$`) | 5 — trailing space, leading space, `oneflow-modal-foo/bar`, `../oneflow-modal-foo`, and the substring test |
| M5a | drop the word "legacy" from the error | 1 — `marks the tongflow form as legacy rather than presenting it as equal` |
| M5b | reorder so tongflow is named first | 1 — `names oneflow before tongflow` |
| M5c | drop the `oneflow-api-*` token from the error | 1 — `names both runner segments for the current convention` |

Every mutation was caught, and each was caught by the tests that claim to cover
that behaviour rather than by collateral damage elsewhere. M2 in particular is
the direct proof that the 38 per-plugin assertions are load-bearing.

Two mutations are worth noting for what they did **not** kill. M3 left the
uppercase and separator cases green, and M4 left `oneflow-modal-_foo`,
`oneflow-modal--foo` and the uppercase cases green — correctly, since neither
mutation affects those. No test is doing double duty as a coincidental guard.

## Failure-branch drive: the two scripts

Both scripts were driven through every branch in the same scratch clone, with
the tree confirmed clean afterwards.

`scripts/plugins/check-prefix-docs.sh` — 7 branches, all non-zero:

| Branch | Result |
|---|---|
| `docs/plugins.md` absent (cannot look) | refuses: "missing docs/plugins.md — refusing to report the docs correct" |
| oneflow-api bullet reworded | names the missing rule |
| legacy tongflow bullet deleted | names the missing rule |
| the "not ours" reason removed | names the missing rule |
| lowercase rule deleted | names the missing rule |
| no-hardware rule deleted | names the missing rule |
| primary bullet switched back to `tongflow-` | caught |

`scripts/plugins/check-no-config-drift.sh` — 8 branches, all non-zero, including
all three "cannot look" paths:

| Branch | Result |
|---|---|
| base ref unresolvable (cannot look) | refuses: "cannot resolve base ref … fetch it first" |
| `git diff` itself fails (cannot look — driven with a failing `git` shim on PATH) | refuses: "git diff against 'origin/main' failed — refusing to report a clean tree" |
| `config/official-plugins.json` absent (cannot look) | refuses: "missing … — refusing to report it unchanged" |
| a file added under `config/` | names the file |
| `plugins-registry.server.ts` edited | names the file |
| `src/db/workspace.schema.ts` edited | names the file |
| `org` repointed to another GitHub org | caught, and says it is a separate change |
| manifest shrunk to 5 entries | caught as a reshape |

## Adversarial read — one false pass still present

The repo's recurring defect is a guard that announces "clean" when it could not
actually look. `check-prefix-docs.sh` was already fixed once for exactly that
(an unanchored search matched the troubleshooting section 300 lines away and
reported deleted rules as present). **A residual instance of the same defect is
still in that script.**

Six of the seven assertions are anchored to the convention bullets with `^- `.
The seventh is not:

```bash
need "give the reason — the upstream repos are not ours" 'does not control|do not control'
```

That pattern is an unanchored search of the whole document. I drove it: the
reason clause was deleted from the convention bullet ("under an org this fork
does not control" → nothing) and an unrelated troubleshooting sentence — "the
platform does not control the plugin process lifetime" — was appended at the end
of the file. The guard's response:

```
ok  give the reason — the upstream repos are not ours
docs/plugins.md: documents the oneflow convention and the legacy exception, with its reason
```

It reports the reason present, and its summary line claims "with its reason",
after the reason has been removed. This is the same bug class, in the same
script, one line away from the comment that documents the earlier fix. The
remedy is the same one already applied to its six neighbours: anchor it to the
legacy bullet, e.g. require the phrase on a line that also carries the bullet's
own text rather than anywhere in the file.

Nothing comparable was found in `check-no-config-drift.sh` — it fails closed on
all three of its "cannot look" paths, and it re-reads the manifest's `org` and
length directly rather than inferring them from an empty diff.

One narrower observation, not a false pass today: `check-no-config-drift.sh`
enumerates `plugins-registry-schema.ts` and `plugins-registry.server.ts` by name
where AC-6 says `plugins-registry*`. Those are the only two files matching that
glob right now, so the coverage is currently exact; a future third
`plugins-registry-*.ts` would fall outside the list.

## Verdict

REJECT. E2 through E9 hold up, the suppression halves are real, and the two
scripts are mostly well built. AC-1 does not hold: the feature widens one of the
two prefix gates and the contract's premise that there is only one gate is
mistaken. Either the scanner is widened to match (an `sdk/**` change with a
publish and a pin sweep behind it), or AC-1 and the docs are rewritten to claim
only what shipped — that the id validator accepts the new names while the
scanner does not yet. That choice belongs to a human, and this feature's Gate 2
signature line stays empty until it is made.

## Iterations

- **Round 1 (2026-07-26, commit 5975bb4)** — first verification. All nine evals
  executed; all nine commands exited zero. E1 recorded as failed on the
  criterion: the scanner in `sdk/tongflow/scan.py` filters plugin directories by
  a tongflow-only prefix, so an oneflow-* plugin installs and is never
  registered — demonstrated with byte-identical fixtures under two directory
  names against the real scanner. Five regex/message mutations and fifteen
  script failure branches were driven in a scratch clone; every one was caught.
  One residual false pass found in `check-prefix-docs.sh`: the "give the reason"
  assertion is an unanchored whole-file search and reports the reason present
  when it has been deleted from the convention bullet and the phrase merely
  occurs elsewhere.
