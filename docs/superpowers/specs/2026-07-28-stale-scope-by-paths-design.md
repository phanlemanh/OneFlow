# Scope evidence staleness by declared eval paths

**Date:** 2026-07-28 · **Slug:** `stale-scope-by-paths` · **Tier:** T2

## Problem

`scripts/pre-merge-check.sh` treats a signed feature's evidence as stale when
**any** file outside `_acceptance/` and `risk_tiers.t1_skip_globs` changed since
that feature's `verified_commit`. The comparison is whole-tree, so it cannot
distinguish "code this feature's evals actually exercise changed" from
"unrelated drift".

The cost is measured, not hypothetical. PR #25 (`conformance-l0`) adds files
under `sdk/**` and `scripts/**`, and the gate reports:

```
OK [conformance-l0]: PASS, signed off by Manh 2026-07-28
VIOLATION [ci-actions-bump]: evidence is stale
VIOLATION [dependency-refresh-2026-07]: evidence is stale
VIOLATION [measure-harness]: evidence is stale
VIOLATION [oneflow-plugin-prefix]: evidence is stale
VIOLATION [per-plugin-origin]: evidence is stale
VIOLATION [sdk-distribution-rename]: evidence is stale
VIOLATION [task-metering]: evidence is stale
```

Seven features, none of which this branch touches the subject of, each demanding
a full re-verify and re-signature. Their own evidence reports document the rule
repeatedly; the double-digit round counts on `measure-harness` (14),
`task-metering` (14) and `sdk-distribution-rename` (13) are earlier instances of
the same treadmill.

## The field this reuses, and why that is dangerous

`evals.yaml` already carries per-eval `paths` — the files an eval genuinely
exercises. It was introduced for the kit's carry-forward P1 optimisation, where
it is a **performance** knob: under-declaring `paths` only causes an eval to
re-run more often than necessary, which is the safe direction.

Reusing it as a **correctness gate** inverts that. Under-declared `paths` would
let stale evidence through silently — the same field, opposite consequences when
wrong. This is the central risk of the design and the reason for the cross-check
below rather than plain trust.

The risk is already realised. `conformance-l0` is the only feature that declares
`paths` (15/15 evals), and a prototype of the cross-check against PR #25's own
diff finds six files it exercises but never declares:

```
src/hooks/use-workflow-recovery.ts                    AC-10, fixed in round 3
src/components/workspace/execution-status-line.tsx    AC-10, fixed in round 3
src/hooks/use-workflow-execution.ts                   AC-10 client layer
src/constants/task-status.ts                          AC-10 NodeStatus definition
src/lib/task/engine-events.ts                         AC-10 delegate layer
src/lib/abi/conformance.ts                            AC-6 — the adapter E7 tests
```

The last one is the sharpest: E7 declares `src/lib/abi/resolve.ts` and
`conformance.test.ts`, but not the adapter that is E7's actual subject.

## Design

### Three-tier ladder, defaulting to strict

`stale_files` gains an optional scope argument. Which tier applies is decided
per feature:

| Condition | Behaviour |
|---|---|
| `paths` declared for **every** eval **and** the union covers the PR's gated diff | narrow scope — only files matching the union stale the evidence |
| `paths` missing on any eval | whole-tree, exactly as today (silent — this is the default) |
| `paths` complete but the union does **not** cover | whole-tree **plus** a printed list of the uncovered files |

Nothing widens by accident: a feature earns narrow scope only by declaring its
coverage and having that declaration checked.

**"Gated diff"** means the changed files that `stale_files` already considers —
everything except `_acceptance/**` (gate artifacts, excluded by its own branch)
and `t1_skip_globs` (docs, branding, i18n, and the three exempt gate files). It
is the same filter, applied to the same list, so a file can never be gated for
staleness but ungated for coverage.

### Where the cross-check fires

Only for features whose `_acceptance/<slug>/` appears in the current PR's diff
(`BASE_SHA...HEAD`). That is the one moment a coverage declaration is new or
changed, so it is the moment to validate it. A previously merged feature with
complete `paths` keeps narrow scope without re-checking — it paid at landing.

The alternative considered was deriving each feature's own landing diff from
git history: walk `git log --first-parent --merges` on the base branch and take
the oldest merge whose second parent contains `verified_commit`. This was
prototyped and does work — on `per-plugin-origin` it correctly finds
`6461d2b` ("Merge pull request #20"), 41 files — and it would also validate
features that landed before this mechanism existed. It was rejected as more
machinery than the problem needs: it adds git archaeology to a POSIX `sh`
script, and it depends on the repo's never-squash policy holding for all past
history rather than only going forward. Two cheaper derivations were tried and
are recorded here because both look correct and are not:

- `merge-base(verified_commit, main)...verified_commit` yields **0 files** for a
  merged feature — `verified_commit` is already an ancestor, so the cross-check
  would pass vacuously.
- `git log --merges --ancestry-path --reverse | head -1` picks the wrong commit
  when a branch back-merged main: on `per-plugin-origin` it returns
  `Merge remote-tracking branch 'origin/main' into feat/per-plugin-origin`.

### Parsing

`paths` is written as a single-line JSON array
(`paths: ["sdk/tongflow/engine/runner.py", "sdk/tests/test_engine_batch.py"]`),
so it splits with the `sed`/`tr` idiom the file already uses for
`t1_skip_globs` and `t3_paths`. Completeness is a count comparison:
`grep -c '^  - id:'` against `grep -c '^    paths:'`.

Glob matching reuses the existing `match_globs` — one matcher, not two. That
matters because `case` pattern semantics differ between shells: a prototype
written for `zsh` silently failed to match `_acceptance/**`, and the only
defence against that class of bug is having a single matcher that the guard
exercises.

### Guard, deliberately outside the exemption

`risk_tiers.t1_skip_globs` exempts the gate tooling by **exact path**
(`scripts/pre-merge-check.sh`, `scripts/recheck-evidence.js`,
`lib/evidence-core.js`), not by directory glob. A new
`scripts/acceptance/check-stale-scoping.sh` is therefore **not** exempt, so the
gate applies to the change that alters the gate.

That placement is the point. The exemption exists so that *upgrading* the
measuring stick does not stale-invalidate signed evidence; it is not a licence
for *changing what the stick measures* to go unreviewed.

The guard builds a temporary git repo and a synthetic `_acceptance/` tree, and
proves four things:

1. A change **inside** a feature's declared `paths` **does** stale it.
2. A change **outside** does **not**.
3. A feature with incomplete `paths` keeps whole-tree behaviour.
4. A complete-but-under-declared feature falls back **and** names the uncovered
   files.

Cases 1 and 3 are the ones easy to omit and the ones that matter most: a
narrowing mechanism nobody proves still catches in-scope changes is just a
disabled gate with a better name.

## Out of scope

- **Unstaling the seven features that are red today.** They declare zero
  `paths`, so this mechanism cannot help them. Each needs its own focused PR
  that backfills `paths` — and the cross-check will force those declarations to
  be honest rather than nominal.
- **Backfilling `conformance-l0`'s six missing paths.** It stays on whole-tree
  until someone declares them, which is the intended behaviour, not a gap.
- **Deriving a merged feature's landing diff from git history.** Rejected above;
  revisit only if a feature's `paths` are edited outside its own PR often enough
  to matter.
- **Changing `recheck` (committed-evidence re-check) scoping.** A different
  mechanism with a different failure mode; untouched here.
- **Adding a separate `covers:` field.** Considered and rejected: it would make
  intent clearer but adds a second thing to hand-maintain and still does not
  self-defend against under-declaration, which the cross-check does.

## Known limits

- Backfilling an old feature must happen in a PR whose non-T1 diff is covered by
  that feature's own `paths`. A PR that mixes a backfill with unrelated code will
  have its narrow scope refused. This constraint is deliberate but will surprise
  someone.
- The cross-check validates coverage against the PR diff, not against what the
  evals truly execute. A feature could declare `paths: ["**"]` and pass while
  gaining nothing. Nothing prevents a declaration that is honest about the diff
  and still wrong about the evals; only review catches that.
- A feature whose `paths` are edited in a later PR is cross-checked against that
  PR's diff, which is not its landing diff. The safe direction (refusing narrow
  scope) is the likely outcome, but the message will be confusing.
