# Stale-scope-by-paths Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `scripts/pre-merge-check.sh` scope evidence staleness to the files a feature's evals declare, so a PR touching `sdk/**` stops staling seven signed features whose subject it never goes near.

**Architecture:** Two new functions in the existing POSIX-`sh` gate script — `feature_scope` (parse `paths` from a feature's `evals.yaml`, return globs only when every eval declares one) and `scope_gaps` (list coverage-set files the union misses) — plus a scope argument on the existing `stale_files`. A new guard under `scripts/acceptance/` builds throwaway git repos and drives the gate through every case, and perturbs a **temp copy** of the gate to prove the mechanism is not vacuous.

**Tech Stack:** POSIX `sh` / `bash` (`set -u`, no bashisms beyond arrays already present), `git`, `sed`/`awk`/`grep`. No new dependencies — the gate must run on a bare CI runner.

## Global Constraints

- **Two bases, never interchanged.** Staleness set = gated files in `<feature>.verified_commit...HEAD`. Coverage set = gated files in `BASE_SHA...HEAD`. Copied verbatim from the contract's Context; conflating them is the failure AC-12 exists to catch.
- **"Gated"** = a changed file **not** under `_acceptance/**` and **not** matching `risk_tiers.t1_skip_globs`. One filter, applied to both sets.
- **Reuse `match_globs`.** Do not write a second glob matcher. `case` pattern semantics differ between shells — a `zsh` prototype silently failed to match `_acceptance/**`.
- **No perturbation knob in the shipped script.** Mutations live only in the guard's temp copy (AC-13).
- **Comments in code: English only** (CLAUDE.md).
- **Default to strict.** Every ambiguous or unparseable state falls back to whole-tree, never to narrow scope.
- **Guard path must stay outside `t1_skip_globs`** — `scripts/acceptance/**` is not exempt and must not be added to the exemption.

## File structure

| File | Responsibility |
|---|---|
| `scripts/pre-merge-check.sh` (modify) | `feature_scope`, `scope_gaps`, scope arg on `stale_files`, hoisted `BASE_SHA`, announce line |
| `scripts/acceptance/check-stale-scoping.sh` (create) | Case-dispatched fixture guard + temp-copy mutation |
| `scripts/acceptance/check-stale-golden.sh` (create) | Byte-compare the gate's output for undeclared features against a committed baseline |
| `scripts/acceptance/check-stale-real-repo.sh` (create) | Run the gate on this repo at two pinned SHAs, assert the six uncovered files |
| `scripts/acceptance/fixtures/baseline-gate-output.txt` (create) | Golden output captured **before** the gate is touched |

All tasks touch one of the two scripts, so every task is `independent: false` — no parallel execution.

---

### Task 1: Capture the golden baseline before touching the gate

**Files:**
- Create: `scripts/acceptance/check-stale-golden.sh`
- Create: `scripts/acceptance/fixtures/baseline-gate-output.txt`

**Interfaces:**
- Consumes: nothing.
- Produces: `scripts/acceptance/fixtures/baseline-gate-output.txt` — the gate's per-feature lines for the seven features that declare no `paths`, captured at a commit that predates any edit to `pre-merge-check.sh`.

**`independent: false`** · **serves E3 (AC-3)**

**This task MUST land before Task 3.** "Identical to today's behaviour" becomes unverifiable the moment today's behaviour is gone. The same constraint bit `conformance-l0` (its AC-3 required a pre-change capture) and it is a hard ordering constraint, not a preference.

**Step order inside this task is also load-bearing.** On this branch every changed file so far is `_acceptance/**` or `docs/**` — all `t1_skip_globs` — so the gate is currently **clean** and the staleness path never executes. A baseline captured now would pin seven `OK` lines and could not catch a regression in the very code Tasks 3–7 change. So the gated file lands **first** (it is what makes staleness fire), and the capture happens after it — with the gate itself still untouched, which is the invariant that actually matters.

- [ ] **Step 1: Write the golden comparator and commit it — this is the gated file**

Write `scripts/acceptance/check-stale-golden.sh` exactly as in Step 2 below, then:

```bash
mkdir -p scripts/acceptance/fixtures
chmod +x scripts/acceptance/check-stale-golden.sh
git add scripts/acceptance/check-stale-golden.sh
git commit -m "test(acceptance): golden comparator for undeclared-feature gate output"
```

Verify the gate now reports the seven as stale — `scripts/acceptance/**` matches no `t1_skip_globs` entry, so it is gated and predates none of their `verified_commit` pins:

```bash
bash scripts/pre-merge-check.sh --base main 2>&1 | grep -c 'evidence is stale'
```
Expected: `7`. If it prints `0`, the file was not committed (untracked files are invisible to `git diff`, which `stale_files` documents) — commit it and re-check before capturing anything.

- [ ] **Step 2: Capture the baseline from the still-untouched gate**

```bash
bash scripts/pre-merge-check.sh --base main 2>&1 \
  | grep -E '^(VIOLATION|OK|NOTE) \[(ci-actions-bump|dependency-refresh-2026-07|measure-harness|oneflow-plugin-prefix|per-plugin-origin|sdk-distribution-rename|task-metering)\]' \
  | sed -E 's/verified_commit [0-9a-f]{40}/verified_commit <SHA>/' \
  | sort > scripts/acceptance/fixtures/baseline-gate-output.txt
wc -l scripts/acceptance/fixtures/baseline-gate-output.txt
```

Expected: 7 lines, one per feature, each starting `VIOLATION [<slug>]: evidence is stale`.
The `sed` normalises the SHA because `verified_commit` values move when those features are re-verified later; the *behaviour* being pinned is the message and the set of features, not the SHA.

- [ ] **Step 2b: The golden comparator, for reference (written in Step 1)**

```bash
cat > scripts/acceptance/check-stale-golden.sh <<'EOF'
#!/usr/bin/env bash
# E3 / AC-3: the seven features that declare no `paths` must keep exactly
# today's behaviour. Byte-compare, not a count: a new output line or a reworded
# message is a behaviour change for anyone reading the gate, and a count check
# would wave both through.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
GOLDEN="$HERE/fixtures/baseline-gate-output.txt"
UNDECLARED='ci-actions-bump|dependency-refresh-2026-07|measure-harness|oneflow-plugin-prefix|per-plugin-origin|sdk-distribution-rename|task-metering'

[ -f "$GOLDEN" ] || { echo "FAIL: golden baseline missing: $GOLDEN"; exit 1; }

actual="$(bash "$ROOT/scripts/pre-merge-check.sh" "$ROOT" --base main 2>&1 \
  | grep -E "^(VIOLATION|OK|NOTE) \[($UNDECLARED)\]" \
  | sed -E 's/verified_commit [0-9a-f]{40}/verified_commit <SHA>/' \
  | sort)"

if [ "$actual" = "$(cat "$GOLDEN")" ]; then
  echo "OK: undeclared features keep byte-identical gate output"
  exit 0
fi
echo "FAIL: gate output changed for features that declare no paths"
diff <(cat "$GOLDEN") <(printf '%s\n' "$actual") || true
exit 1
EOF
chmod +x scripts/acceptance/check-stale-golden.sh
```

- [ ] **Step 3: Run it — must pass against the untouched gate**

Run: `bash scripts/acceptance/check-stale-golden.sh`
Expected: `OK: undeclared features keep byte-identical gate output`, exit 0.

- [ ] **Step 4: Commit the fixture, recording that the capture predates any gate edit**

```bash
git add scripts/acceptance/fixtures/baseline-gate-output.txt
git commit -m "test(acceptance): capture gate output baseline before scoping change

Captured while pre-merge-check.sh is still untouched. AC-3 asks that the seven
features declaring no paths keep exactly today's behaviour, and that is
unverifiable once today's behaviour is gone. Byte-compare rather than a
violation count: a reworded message is a behaviour change for whoever reads the
gate output."
```

---

### Task 2: Guard skeleton with the three cases that need no gate change

**Files:**
- Create: `scripts/acceptance/check-stale-scoping.sh`

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `check-stale-scoping.sh --case <name>`, exit 0 on pass and non-zero on fail, printing `CASE <name>: PASS` or `CASE <name>: FAIL <reason>`. Case names: `in-scope`, `out-of-scope`, `partial`, `under-declared`, `malformed`, `merged-halves`, `two-bases`, `suppression`, `announce`, `mutation`, `case-completeness`, `guard-not-exempt`, `no-kill-switch`. Later tasks add case bodies; the dispatcher and `KNOWN_CASES` list are defined here.
- Produces: shell function `mk_fixture <dir> <slug> <paths-mode>` used by Tasks 4–7.

**`independent: false`** · **serves E10 (AC-9), E11 (AC-11), E13 (AC-13)**

- [ ] **Step 1: Write the guard with dispatcher, fixture builder, and the three self-contained cases**

```bash
cat > scripts/acceptance/check-stale-scoping.sh <<'GUARD'
#!/usr/bin/env bash
# Guard for the paths-scoped staleness mechanism in pre-merge-check.sh.
#
# Lives under scripts/acceptance/ on purpose: risk_tiers.t1_skip_globs exempts
# the gate tooling by EXACT path, so this file is gated and the gate applies to
# the change that alters the gate (AC-11).
#
# One case per criterion, each with its own exit code. Nine criteria behind one
# command would mean a case that was never implemented looks identical to a case
# that passed.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
GATE="$ROOT/scripts/pre-merge-check.sh"

KNOWN_CASES="in-scope out-of-scope partial under-declared malformed merged-halves two-bases suppression announce mutation case-completeness guard-not-exempt no-kill-switch"

# Perturbation knob names. Referenced here and asserted ABSENT from the shipped
# gate by the no-kill-switch case: an env var in the gate itself would be a
# production kill switch (set it, every declared feature gets a match-nothing
# scope, the gate exits clean).
KNOB_NO_MATCH="STALE_SCOPE_FORCE_NO_MATCH"
KNOB_ALWAYS_COMPLETE="STALE_SCOPE_FORCE_COMPLETE"

pass() { echo "CASE $1: PASS"; }
fail() { echo "CASE $1: FAIL $2"; exit 1; }

# mk_fixture <dir> <slug> <paths-mode>
# Builds a throwaway git repo with one signed feature. paths-mode:
#   all      — every eval declares paths covering src/covered/**
#   none     — no eval declares paths
#   partial  — first eval declares, second does not
#   empty    — every eval declares `paths: []`
#   narrow   — every eval declares paths that do NOT cover src/uncovered/**
mk_fixture() {
  d="$1"; slug="$2"; mode="$3"
  mkdir -p "$d/_acceptance/$slug" "$d/src/covered" "$d/src/uncovered" "$d/docs"
  cat > "$d/_acceptance/config.yaml" <<CFG
schema_version: 1
enforcement: strict
recheck: off
executors:
  test:
    unit: "true"
risk_tiers:
  t1_skip_globs:
    - "docs/**"
    - "**/*.md"
    - "_acceptance/**"
  t3_paths:
    - "src/critical/**"
signoff:
  required_for: [T2, T3]
CFG
  cat > "$d/_acceptance/$slug/contract.md" <<CON
---
schema_version: 1
feature: fixture
slug: $slug
risk_tier: T2
status: signed-off
approved_by: Fixture
---
# Acceptance Contract: $slug
CON
  case "$mode" in
    none)    p1=""; p2="" ;;
    partial) p1='    paths: ["src/covered/**"]'; p2="" ;;
    empty)   p1='    paths: []'; p2='    paths: []' ;;
    narrow)  p1='    paths: ["src/covered/**"]'; p2='    paths: ["src/covered/**"]' ;;
    all|*)   p1='    paths: ["src/covered/**"]'; p2='    paths: ["src/covered/**", "src/uncovered/**"]' ;;
  esac
  {
    echo "schema_version: 1"
    echo "feature_slug: $slug"
    echo "evals:"
    echo "  - id: E1"
    echo "    criterion: AC-1"
    echo "    executor: test"
    echo "    cmd: config:executors.test.unit"
    [ -n "$p1" ] && echo "$p1"
    echo "  - id: E2"
    echo "    criterion: AC-2"
    echo "    executor: test"
    echo "    cmd: config:executors.test.unit"
    [ -n "$p2" ] && echo "$p2"
  } > "$d/_acceptance/$slug/evals.yaml"
  echo '{}' > "$d/_acceptance/$slug/run-log.jsonl"
  (
    cd "$d"
    git init -q .
    git config user.email fixture@example.com
    git config user.name Fixture
    echo seed > src/covered/seed.txt
    echo seed > src/uncovered/seed.txt
    git add -A
    git commit -q -m "fixture base"
  )
}

# write_report <dir> <slug> <verified_commit>
write_report() {
  cat > "$1/_acceptance/$2/evidence-report.md" <<REP
---
schema_version: 2
feature_slug: $2
verdict: PASS
failed_evals: []
verified_by: fixture
enforcement_mode: strict
bypass_used: false
verified_commit: $3
human_signoff: Fixture 2026-07-28
---
# Evidence Report: $2
REP
}

case_case_completeness() {
  # E10: a case that was never implemented must be loud, not absent. Every name
  # in KNOWN_CASES must dispatch to a function that exists.
  missing=""
  for c in $KNOWN_CASES; do
    fn="case_$(printf '%s' "$c" | tr '-' '_')"
    command -v "$fn" >/dev/null 2>&1 || missing="$missing $c"
  done
  [ -z "$missing" ] || fail case-completeness "unimplemented cases:$missing"
  # And an unknown case name must be rejected rather than silently succeeding.
  if bash "$0" --case definitely-not-a-case >/dev/null 2>&1; then
    fail case-completeness "unknown case name exited 0"
  fi
  pass case-completeness
}

case_guard_not_exempt() {
  # E11 / AC-11: this guard's own path must match NO glob in t1_skip_globs, or
  # the gate would exempt the change that alters the gate.
  globs="$(sed -n '/^  t1_skip_globs:/,/^  [a-zA-Z0-9_-]*:/p' "$ROOT/_acceptance/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//")"
  [ -n "$globs" ] || fail guard-not-exempt "could not read t1_skip_globs"
  self="scripts/acceptance/check-stale-scoping.sh"
  hit=""
  while IFS= read -r g; do
    [ -n "$g" ] || continue
    case "$self" in $g) hit="$g" ;; esac
  done <<GLOBS
$globs
GLOBS
  [ -z "$hit" ] || fail guard-not-exempt "$self is exempt via \"$hit\""
  # Sanity: the matcher must actually match something, or the loop above proves
  # nothing. A path that IS exempt has to be seen as exempt.
  known_exempt="scripts/pre-merge-check.sh"; hit2=""
  while IFS= read -r g; do
    [ -n "$g" ] || continue
    case "$known_exempt" in $g) hit2="$g" ;; esac
  done <<GLOBS2
$globs
GLOBS2
  [ -n "$hit2" ] || fail guard-not-exempt "matcher matched nothing — check is vacuous"
  pass guard-not-exempt
}

case_no_kill_switch() {
  # E13 / AC-13: the perturbation knobs must exist only in this guard's temp
  # copy, never in the shipped gate.
  for k in "$KNOB_NO_MATCH" "$KNOB_ALWAYS_COMPLETE"; do
    if grep -q "$k" "$GATE"; then
      fail no-kill-switch "shipped gate references perturbation knob $k"
    fi
  done
  pass no-kill-switch
}

usage() { echo "usage: $0 --case <$(echo "$KNOWN_CASES" | tr ' ' '|')>" >&2; exit 2; }

CASE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --case) [ $# -ge 2 ] || usage; CASE="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[ -n "$CASE" ] || usage

known=0
for c in $KNOWN_CASES; do [ "$c" = "$CASE" ] && known=1; done
[ "$known" -eq 1 ] || { echo "unknown case: $CASE" >&2; exit 2; }

"case_$(printf '%s' "$CASE" | tr '-' '_')"
GUARD
chmod +x scripts/acceptance/check-stale-scoping.sh
```

- [ ] **Step 2: Run the three implemented cases — they must pass now**

Run:
```bash
bash scripts/acceptance/check-stale-scoping.sh --case guard-not-exempt
bash scripts/acceptance/check-stale-scoping.sh --case no-kill-switch
```
Expected: `CASE guard-not-exempt: PASS` and `CASE no-kill-switch: PASS`, exit 0 each.

- [ ] **Step 3: Run case-completeness — it must FAIL, naming the ten unimplemented cases**

Run: `bash scripts/acceptance/check-stale-scoping.sh --case case-completeness`
Expected: exit 1, `CASE case-completeness: FAIL unimplemented cases: in-scope out-of-scope partial under-declared malformed merged-halves two-bases suppression announce mutation`

This is the RED that proves the case list is enforced. It stays red until Task 8 lands the last case body — that is intended and is why E10 is verified at the end.

- [ ] **Step 4: Commit**

```bash
git add scripts/acceptance/check-stale-scoping.sh
git commit -m "test(acceptance): guard skeleton for paths-scoped staleness

Case dispatcher plus the three cases that need no gate change: the guard's own
path must not be exempt from the gate it guards, the shipped gate must carry no
perturbation knob, and every name in KNOWN_CASES must dispatch to a function
that exists. The last one is deliberately red until the final case body lands —
a case that was never implemented has to be loud rather than absent."
```

---

### Task 3: Hoist BASE_SHA above the feature loop

**Files:**
- Modify: `scripts/pre-merge-check.sh` — resolve `BASE_SHA` before `for dir in "$ACC"/*/` (currently line 155); the T1-escape backstop (currently line ~336) consumes the hoisted value instead of resolving its own.

**Interfaces:**
- Consumes: nothing.
- Produces: shell variable `BASE_SHA` — the resolved base commit, or empty when no base was given or it does not resolve. Available inside the feature loop for the coverage set. Tasks 5–7 read it.

**`independent: false`** · **serves E3 (AC-3, regression only)**

Pure refactor: no behaviour change. The coverage set is per-PR and needed *inside* the loop, but `BASE_SHA` is resolved after it — so without this hoist the cross-check has nothing to compare against.

- [ ] **Step 1: Run the golden check first, to prove it is green before the refactor**

Run: `bash scripts/acceptance/check-stale-golden.sh`
Expected: `OK: undeclared features keep byte-identical gate output`, exit 0.

- [ ] **Step 2: Insert the hoisted resolution immediately before the feature loop**

Insert directly above `for dir in "$ACC"/*/; do`:

```bash
# BASE_SHA is resolved here rather than at the T1-escape backstop below because
# the coverage set (BASE_SHA...HEAD, per PR) is needed inside the feature loop
# for the paths cross-check. Empty means "no usable base": every consumer must
# then fall back to the strict behaviour, never to narrow scope.
BASE_SHA=""
BASE_NOTE=""
if [ -z "$BASE" ]; then
  BASE_NOTE="T1-escape backstop skipped — no PR base given (pass --base <ref> or set PRE_MERGE_BASE; GitHub Actions: --base \"origin/\$GITHUB_BASE_REF\")"
elif ! command -v git >/dev/null 2>&1 || ! git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  BASE_NOTE="T1-escape backstop skipped — $ROOT is not a git repo here"
else
  BASE_SHA="$(git -C "$ROOT" rev-parse --quiet --verify "$BASE^{commit}" 2>/dev/null || true)"
  [ -z "$BASE_SHA" ] && BASE_SHA="$(git -C "$ROOT" rev-parse --quiet --verify "origin/$BASE^{commit}" 2>/dev/null || true)"
  [ -z "$BASE_SHA" ] && BASE_NOTE="T1-escape backstop skipped — base \"$BASE\" not resolvable in this clone"
fi
```

- [ ] **Step 3: Replace the backstop's own resolution with the hoisted value**

Replace the backstop's `if [ -z "$BASE" ]; then ... else BASE_SHA=... fi` preamble with:

```bash
if [ -z "$BASE_SHA" ]; then
  echo "NOTE: $BASE_NOTE"
else
```

Keep the body (`changed=`, the `while` loop, the two VIOLATION branches) exactly as it is, and keep its closing `fi`.

- [ ] **Step 4: Verify no behaviour change**

Run:
```bash
bash scripts/acceptance/check-stale-golden.sh
bash scripts/pre-merge-check.sh --base main 2>&1 | tail -3
```
Expected: golden `OK`; final line still `pre-merge-check: 7 violation(s) — merge blocked`.

Then confirm the no-base path still NOTEs exactly once:
```bash
bash scripts/pre-merge-check.sh 2>&1 | grep -c 'T1-escape backstop skipped'
```
Expected: `1`.

- [ ] **Step 5: Commit**

```bash
git add scripts/pre-merge-check.sh
git commit -m "refactor(gate): resolve BASE_SHA before the feature loop

The coverage set for the paths cross-check is per-PR (BASE_SHA...HEAD) and is
needed inside the per-feature loop, but BASE_SHA was resolved after it. No
behaviour change: the golden baseline for undeclared features is byte-identical
and the no-base path still emits exactly one NOTE."
```

---

### Task 4: Parse declared paths, with completeness and malformed handling

**Files:**
- Modify: `scripts/pre-merge-check.sh` — add `feature_scope` after `match_globs` (currently line ~132)
- Modify: `scripts/acceptance/check-stale-scoping.sh` — add `case_partial`, `case_malformed`

**Interfaces:**
- Consumes: `match_globs` (existing), `mk_fixture`/`write_report` from Task 2.
- Produces: `feature_scope <evals.yaml>` — prints the newline-separated union of declared globs on stdout and returns 0 **only** when every eval declares a usable `paths`; prints nothing and returns 1 otherwise (no `paths`, partial, empty array, or zero parsed globs). Tasks 5–7 call it.

**`independent: false`** · **serves E4 (AC-4), E6 (AC-6)**

- [ ] **Step 1: Write the failing cases**

Add to `check-stale-scoping.sh` above `usage()`:

```bash
case_partial() {
  # E4 / AC-4: paths on some evals but not all is the state a half-finished
  # backfill leaves behind. Scoping by a partial list is worse than not scoping.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx partial
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail partial "partial declaration did not fall back to whole-tree: $out"
  printf '%s\n' "$out" | grep -q 'narrow scope' \
    && fail partial "partial declaration was granted narrow scope"
  pass partial
}

case_malformed() {
  # E6 / AC-6: `paths: []` must read as not-declared. Read as "declared with an
  # empty scope" it matches nothing, i.e. never stale — the worst misreading.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx empty
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail malformed "empty paths array did not fall back to whole-tree: $out"
  pass malformed
}
```

- [ ] **Step 2: Run both — they must fail for the right reason**

Run: `bash scripts/acceptance/check-stale-scoping.sh --case malformed`
Expected: exit 1 with `CASE malformed: FAIL empty paths array did not fall back to whole-tree: ...`.

At this point the gate has no scoping at all, so it already reports stale — meaning `malformed` may pass vacuously. Confirm the case is meaningful by checking `partial` first: it must also pass for the same vacuous reason. **Both cases are therefore verified again at the end of Task 5**, once narrow scope exists and a wrong parse can actually grant it. Note this in the commit message.

- [ ] **Step 3: Implement `feature_scope`**

Insert after `match_globs`:

```bash
feature_scope() { # <evals.yaml> — union of declared globs on stdout; rc 0 only
  # when EVERY eval declares a usable `paths`. `paths` was introduced as a
  # carry-forward performance knob, where under-declaring is safe; here it gates
  # correctness, so anything less than a complete, parseable declaration falls
  # back to whole-tree rather than to a narrower scope.
  f="$1"
  [ -f "$f" ] || return 1
  n_evals="$(grep -c '^  - id:' "$f" 2>/dev/null || echo 0)"
  n_paths="$(grep -c '^    paths:' "$f" 2>/dev/null || echo 0)"
  [ "$n_evals" -gt 0 ] || return 1
  [ "$n_evals" -eq "$n_paths" ] || return 1
  globs="$(sed -n 's/^    paths:[[:space:]]*\[//p' "$f" \
    | tr -d '"]' | tr ',' '\n' \
    | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
    | grep -v '^$' | sort -u)"
  # An empty array parses to zero globs. A zero-glob scope matches nothing,
  # which would read as "never stale" — treat it as not declared.
  [ -n "$globs" ] || return 1
  printf '%s\n' "$globs"
  return 0
}
```

- [ ] **Step 4: Verify the parser directly**

Run:
```bash
bash -c 'source <(sed -n "/^match_globs()/,/^}/p;/^feature_scope()/,/^}/p" scripts/pre-merge-check.sh); feature_scope _acceptance/conformance-l0/evals.yaml | wc -l; feature_scope _acceptance/task-metering/evals.yaml; echo "rc=$?"'
```
Expected: `17` then no output and `rc=1`.

- [ ] **Step 5: Commit**

```bash
git add scripts/pre-merge-check.sh scripts/acceptance/check-stale-scoping.sh
git commit -m "feat(gate): parse declared eval paths, complete-or-nothing

feature_scope returns a glob union only when every eval declares a usable
paths; no paths, a partial declaration, an empty array and a value parsing to
zero globs all return non-zero so the caller keeps whole-tree staleness. A
zero-glob scope would match nothing and read as never-stale, which is the most
dangerous available misreading of this field.

The partial and malformed guard cases still pass vacuously at this commit — the
gate has no narrow scope yet — and are re-verified once Task 5 lands it."
```

---

### Task 5: Apply narrow scope to the staleness set

**Files:**
- Modify: `scripts/pre-merge-check.sh` — scope argument on `stale_files`, wire at the staleness check (currently line ~281)
- Modify: `scripts/acceptance/check-stale-scoping.sh` — add `case_in_scope`, `case_out_of_scope`, `case_suppression`

**Interfaces:**
- Consumes: `feature_scope` (Task 4), `BASE_SHA` (Task 3).
- Produces: `stale_files <root> <commit> [scope-globs]` — when the third argument is non-empty, only changed gated files matching it are printed. Tasks 6–7 rely on this signature.

**`independent: false`** · **serves E1 (AC-1), E2 (AC-2), E8 (AC-8)**

- [ ] **Step 1: Write the three failing cases**

```bash
case_in_scope() {
  # E1 / AC-1: THE load-bearing case. Narrow scope must still catch a change
  # inside the declared union — a mechanism degraded into "never stale" passes
  # every other criterion in this guard.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx all
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/covered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail in-scope "in-union change did NOT stale the feature: $out"
  pass in-scope
}

case_out_of_scope() {
  # E2 / AC-2: the behaviour the feature exists to produce.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail out-of-scope "out-of-union change still staled the feature: $out"
  printf '%s\n' "$out" | grep -q 'OK \[fx\]' \
    || fail out-of-scope "feature not reported OK: $out"
  pass out-of-scope
}

case_suppression() {
  # E8 / AC-8: the pre-existing exclusions must survive refactoring the
  # function that applies them — for declared and undeclared features alike.
  for mode in all none; do
    d="$(mktemp -d)"
    mk_fixture "$d" fx "$mode"
    vc="$(git -C "$d" rev-parse HEAD)"
    write_report "$d" fx "$vc"
    ( cd "$d" && echo x > docs/note.md && echo y >> _acceptance/fx/run-log.jsonl && git add -A && git commit -q -m docs )
    out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
    if printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale'; then
      rm -rf "$d"; fail suppression "docs/_acceptance-only change staled a $mode-paths feature: $out"
    fi
    rm -rf "$d"
  done
  pass suppression
}
```

- [ ] **Step 2: Run `out-of-scope` — must FAIL (no scoping yet)**

Run: `bash scripts/acceptance/check-stale-scoping.sh --case out-of-scope`
Expected: exit 1, `CASE out-of-scope: FAIL out-of-union change still staled the feature: ...`

- [ ] **Step 3: Add the scope argument to `stale_files`**

Replace `stale_files` with:

```bash
stale_files() { # <root> <commit> [scope-globs] — gated files changed since
  # <commit> (incl. working tree). Gate artifacts (_acceptance/) and
  # t1_skip_globs never count. With a non-empty third argument, only files
  # matching it count: that is the STALENESS SET narrowed to what the feature's
  # evals declare they exercise. Untracked files are invisible to git diff — CI
  # runs on a committed tree, so that is moot there.
  scope="${3:-}"
  git -C "$1" diff --name-only "$2" -- 2>/dev/null | while IFS= read -r f; do
    case "$f" in _acceptance/*|*/_acceptance/*) continue ;; esac
    match_globs "$f" "$T1_GLOBS" && continue
    if [ -n "$scope" ]; then
      match_globs "$f" "$scope" || continue
    fi
    printf '%s\n' "$f"
  done
}
```

- [ ] **Step 4: Wire it at the staleness check**

Replace `stale="$(stale_files "$ROOT" "$vc")"` with:

```bash
    scope=""
    if scope="$(feature_scope "$dir/evals.yaml")"; then :; else scope=""; fi
    stale="$(stale_files "$ROOT" "$vc" "$scope")"
```

- [ ] **Step 5: Run all five cases plus the golden check**

Run:
```bash
for c in in-scope out-of-scope suppression partial malformed; do
  bash scripts/acceptance/check-stale-scoping.sh --case "$c" || echo "FAILED: $c"
done
bash scripts/acceptance/check-stale-golden.sh
```
Expected: five `CASE <name>: PASS` lines, then golden `OK`. `partial` and `malformed` are now non-vacuous — a wrong parse would grant narrow scope and they would fail.

- [ ] **Step 6: Commit**

```bash
git add scripts/pre-merge-check.sh scripts/acceptance/check-stale-scoping.sh
git commit -m "feat(gate): scope the staleness set to declared eval paths

stale_files takes an optional scope; when a feature declares paths on every
eval, only changed files matching that union stale its evidence. in-scope is
the load-bearing case: narrowing must not become never-stale, and that failure
mode passes every other criterion. partial and malformed are no longer vacuous
now that a wrong parse could actually grant narrow scope."
```

---

### Task 6: Coverage cross-check against the PR's own diff

**Files:**
- Modify: `scripts/pre-merge-check.sh` — add `scope_gaps` after `feature_scope`; gate narrow scope on it
- Modify: `scripts/acceptance/check-stale-scoping.sh` — add `case_under_declared`, `case_merged_halves`, `case_two_bases`

**Interfaces:**
- Consumes: `feature_scope`, `stale_files` with scope, `BASE_SHA`.
- Produces: `scope_gaps <root> <base_sha> <scope-globs>` — prints coverage-set files the union does **not** match; empty output means the declaration covers the PR.

**`independent: false`** · **serves E5 (AC-5), E7 (AC-7), E12 (AC-12)**

- [ ] **Step 1: Write the three failing cases**

```bash
case_under_declared() {
  # E5 / AC-5: complete paths that miss part of the COVERAGE SET, with the
  # feature's artifacts in the PR diff → refuse narrow scope and NAME the files.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx narrow
  base="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$base"
  ( cd "$d" && echo drift > src/uncovered/new.txt \
      && echo touched >> _acceptance/fx/run-log.jsonl \
      && git add -A && git commit -q -m "pr" )
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m "repin" )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'src/uncovered/new.txt' \
    || fail under-declared "uncovered file not named in output: $out"
  printf '%s\n' "$out" | grep -qi 'not covered\|uncovered' \
    || fail under-declared "no under-declaration message: $out"
  pass under-declared
}

case_merged_halves() {
  # E7 / AC-7: cross-check fires only when the declaration is new or changed.
  # Half A: artifacts NOT in the PR diff → narrow scope, no cross-check.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m report )
  base="$(git -C "$d" rev-parse HEAD)"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m "code only" )
  outA="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$outA" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail merged-halves "half A: narrow scope was not granted: $outA"
  printf '%s\n' "$outA" | grep -qi 'uncovered' \
    && fail merged-halves "half A: cross-check ran despite artifacts absent from the PR diff: $outA"
  # Half B: same feature, artifacts IN the PR diff → cross-check runs.
  ( cd "$d" && echo touched >> _acceptance/fx/run-log.jsonl && git add -A && git commit -q -m "artifact touch" )
  outB="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$outB" | grep -qi 'uncovered' \
    || fail merged-halves "half B: cross-check did not run with artifacts in the PR diff: $outB"
  pass merged-halves
}

case_two_bases() {
  # E12 / AC-12: the fixture that tells the two ranges apart. paths cover the
  # COVERAGE SET but NOT everything changed since verified_commit. Cross-checked
  # against the per-feature range instead, no honest declaration ever covers it
  # and narrow scope is refused for every merged feature forever.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m report )
  # Unrelated history AFTER verified_commit and BEFORE the PR base.
  ( cd "$d" && echo old > src/uncovered/unrelated.txt && git add -A && git commit -q -m "unrelated merge" )
  base="$(git -C "$d" rev-parse HEAD)"
  # The PR itself touches only covered code plus the feature's artifacts.
  ( cd "$d" && echo new > src/covered/pr.txt \
      && echo touched >> _acceptance/fx/run-log.jsonl \
      && git add -A && git commit -q -m pr )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'src/uncovered/unrelated.txt' \
    && fail two-bases "cross-check used the per-feature range, not the coverage set: $out"
  printf '%s\n' "$out" | grep -qi 'uncovered' \
    && fail two-bases "narrow scope refused although the coverage set is covered: $out"
  pass two-bases
}
```

- [ ] **Step 2: Run `two-bases` — must FAIL (no cross-check yet)**

Run: `bash scripts/acceptance/check-stale-scoping.sh --case two-bases`
Expected: exit 1. With no cross-check the run reports stale on `src/covered/pr.txt`, which the case reads as a refusal.

- [ ] **Step 3: Implement `scope_gaps`**

Insert after `feature_scope`:

```bash
scope_gaps() { # <root> <base_sha> <scope-globs> — coverage-set files the union
  # misses. COVERAGE SET is BASE_SHA...HEAD (per PR), never the per-feature
  # verified_commit range: cross-checking a merged feature against its own range
  # spans every unrelated merge since sign-off, so no honest declaration ever
  # covers it and narrow scope would be refused forever.
  git -C "$1" diff --name-only "$2...HEAD" -- 2>/dev/null | while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in _acceptance/*|*/_acceptance/*) continue ;; esac
    match_globs "$f" "$T1_GLOBS" && continue
    match_globs "$f" "$3" || printf '%s\n' "$f"
  done
}
```

- [ ] **Step 4: Gate narrow scope on the cross-check**

Replace the Task 5 wiring with:

```bash
    scope=""
    if scope="$(feature_scope "$dir/evals.yaml")"; then :; else scope=""; fi
    if [ -n "$scope" ] && [ -n "$BASE_SHA" ] \
       && git -C "$ROOT" diff --name-only "$BASE_SHA...HEAD" -- 2>/dev/null \
          | grep -q "^_acceptance/$slug/"; then
      gaps="$(scope_gaps "$ROOT" "$BASE_SHA" "$scope")"
      if [ -n "$gaps" ]; then
        echo "NOTE [$slug]: declared eval paths do not cover this PR's gated diff — narrow staleness scope refused, whole-tree applied. Not covered:"
        printf '%s\n' "$gaps" | head -10 | sed 's/^/    /'
        scope=""
      fi
    fi
    stale="$(stale_files "$ROOT" "$vc" "$scope")"
```

- [ ] **Step 5: Run every case implemented so far, plus golden**

Run:
```bash
for c in in-scope out-of-scope partial under-declared malformed merged-halves two-bases suppression; do
  bash scripts/acceptance/check-stale-scoping.sh --case "$c" || echo "FAILED: $c"
done
bash scripts/acceptance/check-stale-golden.sh
```
Expected: eight `PASS` lines, then golden `OK`. No `FAILED:` lines.

- [ ] **Step 6: Commit**

```bash
git add scripts/pre-merge-check.sh scripts/acceptance/check-stale-scoping.sh
git commit -m "feat(gate): cross-check declared paths against the PR's gated diff

A feature earns narrow scope only when its declaration is checked, and the check
runs at the one moment the declaration is new or changed: when its own
_acceptance/<slug>/ is in the PR diff. Uncovered files are named, because a
silent refusal is unfixable.

The coverage set is BASE_SHA...HEAD, deliberately not the per-feature
verified_commit range. Read as one range the mechanism refuses narrow scope for
every merged feature forever while every fixture stays green, since in a
synthetic repo the two ranges coincide — the two-bases case exists to be red on
that reading."
```

---

### Task 7: Announce a granted narrow scope

**Files:**
- Modify: `scripts/pre-merge-check.sh` — print one line when narrow scope applies
- Modify: `scripts/acceptance/check-stale-scoping.sh` — add `case_announce`

**Interfaces:**
- Consumes: `scope`, `stale_files` with and without scope.
- Produces: output line `NOTE [<slug>]: narrow staleness scope applied (<globs>)`, extended with `— suppressed N whole-tree change(s)` when narrowing changed the answer.

**`independent: false`** · **serves E15 (AC-14)**

- [ ] **Step 1: Write the failing case**

```bash
case_announce() {
  # E15 / AC-14: a granted narrow scope is the ONLY path that weakens the gate,
  # and was the only one with no output — leaving "genuinely unaffected" and
  # "declaration has drifted" indistinguishable to a reviewer.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$vc" 2>&1)"
  printf '%s\n' "$out" | grep -q 'narrow staleness scope applied' \
    || fail announce "no announcement for a granted narrow scope: $out"
  printf '%s\n' "$out" | grep -q 'suppressed' \
    || fail announce "announcement does not say the narrowing suppressed a whole-tree change: $out"
  # Third clause: an undeclared feature must stay silent, or AC-3 breaks.
  d2="$(mktemp -d)"
  mk_fixture "$d2" fx none
  vc2="$(git -C "$d2" rev-parse HEAD)"
  write_report "$d2" fx "$vc2"
  ( cd "$d2" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out2="$(bash "$GATE" "$d2" --base "$vc2" 2>&1)"
  if printf '%s\n' "$out2" | grep -q 'narrow staleness scope applied'; then
    rm -rf "$d2"; fail announce "undeclared feature produced an announcement: $out2"
  fi
  rm -rf "$d2"
  pass announce
}
```

- [ ] **Step 2: Run it — must FAIL**

Run: `bash scripts/acceptance/check-stale-scoping.sh --case announce`
Expected: exit 1, `CASE announce: FAIL no announcement for a granted narrow scope: ...`

- [ ] **Step 3: Implement the announcement**

Replace the `stale="$(stale_files "$ROOT" "$vc" "$scope")"` line with:

```bash
    stale="$(stale_files "$ROOT" "$vc" "$scope")"
    if [ -n "$scope" ]; then
      wide="$(stale_files "$ROOT" "$vc")"
      n_wide="$(printf '%s' "$wide" | grep -c . || true)"
      n_narrow="$(printf '%s' "$stale" | grep -c . || true)"
      suppressed=$((n_wide - n_narrow))
      msg="NOTE [$slug]: narrow staleness scope applied ($(printf '%s' "$scope" | tr '\n' ' ' | sed 's/[[:space:]]*$//'))"
      [ "$suppressed" -gt 0 ] && msg="$msg — suppressed $suppressed whole-tree change(s)"
      echo "$msg"
    fi
```

- [ ] **Step 4: Run the case and the golden check**

Run:
```bash
bash scripts/acceptance/check-stale-scoping.sh --case announce
bash scripts/acceptance/check-stale-golden.sh
```
Expected: `CASE announce: PASS`, then golden `OK` — the golden proves the new line does not appear for the seven undeclared features.

- [ ] **Step 5: Commit**

```bash
git add scripts/pre-merge-check.sh scripts/acceptance/check-stale-scoping.sh
git commit -m "feat(gate): announce a granted narrow scope and what it suppressed

A successful narrow scope is the only path that weakens the gate and it was the
only path with no output, so a reviewer could not tell 'this feature is
genuinely unaffected' from 'this feature's declaration has drifted and no longer
names the code the PR touched'. Undeclared features stay silent, which the
golden baseline enforces."
```

---

### Task 8: Mutation guard via a temp copy of the gate

**Files:**
- Modify: `scripts/acceptance/check-stale-scoping.sh` — add `case_mutation`

**Interfaces:**
- Consumes: everything above; patches a copy of `pre-merge-check.sh` in a temp dir.
- Produces: nothing consumed later. Completes `KNOWN_CASES`, so `case-completeness` turns green.

**`independent: false`** · **serves E9 (AC-9), and finally E10 (AC-9)**

- [ ] **Step 1: Write the mutation case**

```bash
case_mutation() {
  # E9 / AC-9: two mutations, each applied to a TEMP COPY of the gate — the
  # working tree is never edited and the shipped gate carries no knob (AC-13).
  # (a) narrow scope forced to match nothing → mechanism becomes "never stale"
  # (b) completeness forced to always pass → mechanism becomes blind trust
  work="$(mktemp -d)"; trap 'rm -rf "$work"' RETURN
  cp "$GATE" "$work/gate.sh"
  cp -R "$(dirname "$GATE")/recheck-evidence.js" "$work/" 2>/dev/null || true

  run_case_with() { # <gate-path> <fixture-mode> <drift-path> — echo gate output
    gd="$(mktemp -d)"
    mk_fixture "$gd" fx "$2"
    v="$(git -C "$gd" rev-parse HEAD)"
    write_report "$gd" fx "$v"
    ( cd "$gd" && echo drift > "$3" && git add -A && git commit -q -m drift )
    bash "$1" "$gd" --base "$v" 2>&1
    rm -rf "$gd"
  }

  # Baseline: unpatched copy must behave like the real gate on the in-scope case.
  base_out="$(run_case_with "$work/gate.sh" all src/covered/new.txt)"
  printf '%s\n' "$base_out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "temp copy does not reproduce the real gate: $base_out"

  # (a) force narrow scope to match nothing.
  sed 's/      match_globs "\$f" "\$scope" || continue/      continue/' \
    "$work/gate.sh" > "$work/gate_a.sh"
  cmp -s "$work/gate.sh" "$work/gate_a.sh" \
    && fail mutation "perturbation (a) patched nothing — the sed target moved"
  a_out="$(run_case_with "$work/gate_a.sh" all src/covered/new.txt)"
  printf '%s\n' "$a_out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail mutation "perturbation (a) did not go RED — in-scope changes are not actually caught"

  # (b) force the completeness test to always pass.
  sed 's/  \[ "\$n_evals" -eq "\$n_paths" \] || return 1/  :/' \
    "$work/gate.sh" > "$work/gate_b.sh"
  cmp -s "$work/gate.sh" "$work/gate_b.sh" \
    && fail mutation "perturbation (b) patched nothing — the sed target moved"
  b_out="$(run_case_with "$work/gate_b.sh" partial src/uncovered/new.txt)"
  printf '%s\n' "$b_out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "perturbation (b) did not go RED — a partial declaration is trusted"

  # Revert: the unpatched copy is green again on both shapes.
  r1="$(run_case_with "$work/gate.sh" all src/covered/new.txt)"
  printf '%s\n' "$r1" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "revert: in-scope change no longer caught"
  r2="$(run_case_with "$work/gate.sh" partial src/uncovered/new.txt)"
  printf '%s\n' "$r2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail mutation "revert: partial declaration no longer falls back"
  pass mutation
}
```

The `cmp -s` assertions matter: a `sed` whose target text has moved patches nothing, the "mutation" runs the unmodified gate, and the case passes while proving nothing.

- [ ] **Step 2: Run the mutation case**

Run: `bash scripts/acceptance/check-stale-scoping.sh --case mutation`
Expected: `CASE mutation: PASS`, exit 0.

- [ ] **Step 3: Run case-completeness — now GREEN**

Run: `bash scripts/acceptance/check-stale-scoping.sh --case case-completeness`
Expected: `CASE case-completeness: PASS`, exit 0 (all thirteen case functions exist, unknown names still exit non-zero).

- [ ] **Step 4: Run every case and the golden check**

Run:
```bash
for c in in-scope out-of-scope partial under-declared malformed merged-halves two-bases suppression announce mutation case-completeness guard-not-exempt no-kill-switch; do
  bash scripts/acceptance/check-stale-scoping.sh --case "$c" || echo "FAILED: $c"
done
bash scripts/acceptance/check-stale-golden.sh
```
Expected: thirteen passing lines, golden `OK`, no `FAILED:`.

- [ ] **Step 5: Commit**

```bash
git add scripts/acceptance/check-stale-scoping.sh
git commit -m "test(acceptance): mutation guard proving the scoping is not vacuous

Both perturbations are applied to a temp copy of the gate, so the working tree
is never edited and no knob ships in pre-merge-check.sh. Forcing narrow scope to
match nothing must go red, or in-scope changes are not actually caught; forcing
the completeness test to pass must go red, or a partial declaration is trusted.
Each perturbation asserts the patch changed the file — a sed whose target moved
would run the unmodified gate and pass while proving nothing."
```

---

### Task 9: Real-repo check at pinned SHAs

**Files:**
- Create: `scripts/acceptance/check-stale-real-repo.sh`

**Interfaces:**
- Consumes: the finished mechanism.
- Produces: nothing consumed later.

**`independent: false`** · **serves E14 (AC-10)**

Fixtures can be written to agree with the implementation. This pins the mechanism against a declaration written by someone who did not know the rule existed. Both refs are literal SHAs so merging PR #25, rebasing, or adding a file to the branch cannot move the answer.

- [ ] **Step 1: Write the check**

```bash
cat > scripts/acceptance/check-stale-real-repo.sh <<'EOF'
#!/usr/bin/env bash
# E14 / AC-10: run the finished gate against THIS repo at two pinned SHAs and
# assert conformance-l0 — the only feature that declares paths, written before
# this rule existed — is refused narrow scope for exactly six files.
#
# Refs are literal SHAs, not branch names: merging PR #25 or adding one src/**
# file to the branch would otherwise move the answer and redden a correct
# implementation.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
BASE_SHA=336944d68a7bc7fe6da281a8c6eaf24d105703a2
HEAD_SHA=5986bb27b8aa2200e74f44c729be8782264d137d

EXPECTED="src/components/workspace/execution-status-line.tsx
src/constants/task-status.ts
src/hooks/use-workflow-execution.ts
src/hooks/use-workflow-recovery.ts
src/lib/abi/conformance.ts
src/lib/task/engine-events.ts"

for sha in "$BASE_SHA" "$HEAD_SHA"; do
  git -C "$ROOT" rev-parse --quiet --verify "$sha^{commit}" >/dev/null 2>&1 \
    || { echo "FAIL: pinned commit $sha not in this clone (shallow fetch or rewritten history)"; exit 1; }
done

work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
git -C "$ROOT" worktree add -q --detach "$work" "$HEAD_SHA" \
  || { echo "FAIL: could not create worktree at $HEAD_SHA"; exit 1; }

out="$(bash "$work/scripts/pre-merge-check.sh" "$work" --base "$BASE_SHA" 2>&1)"
git -C "$ROOT" worktree remove --force "$work" >/dev/null 2>&1 || true

# The cross-check must have FIRED — a pass with no cross-check is vacuous.
printf '%s\n' "$out" | grep -q 'NOTE \[conformance-l0\]: declared eval paths do not cover' \
  || { echo "FAIL: cross-check did not fire for conformance-l0"; printf '%s\n' "$out"; exit 1; }

actual="$(printf '%s\n' "$out" \
  | sed -n '/NOTE \[conformance-l0\]: declared eval paths do not cover/,/^[A-Z]/p' \
  | sed -n 's/^    //p' | sort)"

[ -n "$actual" ] || { echo "FAIL: uncovered list is empty"; exit 1; }

if [ "$actual" = "$(printf '%s\n' "$EXPECTED" | sort)" ]; then
  echo "OK: conformance-l0 refused narrow scope for exactly the six declared-but-missing files"
  exit 0
fi
echo "FAIL: uncovered list is not the expected exact set"
diff <(printf '%s\n' "$EXPECTED" | sort) <(printf '%s\n' "$actual") || true
exit 1
EOF
chmod +x scripts/acceptance/check-stale-real-repo.sh
```

- [ ] **Step 2: Run it**

Run: `bash scripts/acceptance/check-stale-real-repo.sh`
Expected: `OK: conformance-l0 refused narrow scope for exactly the six declared-but-missing files`, exit 0.

If the list has seven entries, a gated file was added to the branch after `5986bb2`. Do **not** loosen the comparison to a subset — that deletes the only eval anchoring the mechanism to a real declaration. Re-pin `HEAD_SHA` and update all three copies of the six-file list together: the script (`scripts/acceptance/check-stale-real-repo.sh`), E14's text (`_acceptance/stale-scope-by-paths/evals.yaml`), and contract AC-10 (`_acceptance/stale-scope-by-paths/contract.md`).

- [ ] **Step 3: Full sweep**

Run:
```bash
for c in in-scope out-of-scope partial under-declared malformed merged-halves two-bases suppression announce mutation case-completeness guard-not-exempt no-kill-switch; do
  bash scripts/acceptance/check-stale-scoping.sh --case "$c" || echo "FAILED: $c"
done
bash scripts/acceptance/check-stale-golden.sh
bash scripts/acceptance/check-stale-real-repo.sh
bash scripts/pre-merge-check.sh --base main 2>&1 | tail -2
```
Expected: thirteen passes, golden `OK`, real-repo `OK`, and the gate's own final line still reporting the seven pre-existing violations.

- [ ] **Step 4: Commit and mark the contract implemented**

```bash
git add scripts/acceptance/check-stale-real-repo.sh
git commit -m "test(acceptance): pin the mechanism against the real repo

conformance-l0 is the only feature that declares paths, and it was written
before this rule existed — so it is the one place a declaration is not shaped by
the implementation. Both refs are literal SHAs: merging PR #25 or adding one
src/** file to the branch would otherwise move the answer and redden a correct
implementation."
```

Then set `_acceptance/stale-scope-by-paths/contract.md` frontmatter to `status: implemented` and commit that separately. Do **not** run the evals — grading is S4's job, and the doer is not the grader.

---

## Self-review

**Spec coverage.** Every contract AC maps to a task: AC-1 → T5, AC-2 → T5, AC-3 → T1 (+ regression in T3/T5/T7), AC-4 → T4, AC-5 → T6, AC-6 → T4, AC-7 → T6, AC-8 → T5, AC-9 → T8, AC-10 → T9, AC-11 → T2, AC-12 → T6, AC-13 → T2, AC-14 → T7. Every eval E1–E15 has a task that makes its command exist and pass.

**Placeholder scan.** No TBD/TODO. Every code step carries the actual shell. Every run step names the command and the expected output.

**Type consistency.** `feature_scope <evals.yaml>` (T4) is called with `"$dir/evals.yaml"` in T5/T6. `stale_files <root> <commit> [scope]` (T5) is called with three arguments in T5/T6/T7 and two in T7's `wide=` line. `scope_gaps <root> <base_sha> <scope>` (T6) is called with three. `BASE_SHA`/`BASE_NOTE` (T3) are read in T6 and the backstop. `mk_fixture <dir> <slug> <mode>` and `write_report <dir> <slug> <commit>` (T2) keep their signatures in T4–T8. Case function names are `case_<name with - → _>` throughout, matching the dispatcher.

**Ordering constraints, not preferences.** Task 1 before Task 3 (the golden baseline must be captured from an untouched gate). Task 3 before Task 6 (`BASE_SHA` must exist inside the loop). Task 4 before Task 5 (`feature_scope` before it is wired). Task 8 last among guard tasks (it completes `KNOWN_CASES`, turning `case-completeness` green).

**Known vacuity, handled.** Tasks 4's `partial` and `malformed` cases pass vacuously at their own commit — there is no narrow scope yet to grant wrongly — and are explicitly re-verified in Task 5 Step 5. This is written into Task 4's commit message so a reader does not mistake the early green for proof.
