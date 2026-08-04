# gate-scope-anchors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every acceptance-gate question get asked in the same universe it is answered in — fix the fail-open path-namespace hole in `scope_has_any_match()`, and give per-PR evals a historical anchor so the three signed features stop being graded against someone else's branch.

**Architecture:** One new resolver script, `scripts/acceptance/own-range.sh`, is the **only** place that knows the anchoring rule; it reads `landed_merge:` from a contract's frontmatter and prints a commit range plus the PR's commit set. Six existing guards each gain a *single* anchored branch that calls it; their unanchored code paths stay byte-identical so every open PR behaves exactly as today. Half (a) is a four-line change inside `pre-merge-check.sh` plus a discriminating harness.

**Tech Stack:** POSIX-ish bash (the repo's gate tooling is all bash + `git` + `gh` + `jq`), fixture repos under `mktemp -d`, in-process perturbation via `sed` on a *copy* of the script under test (the pattern `scripts/acceptance/fixtures.sh::run_mutation_case` established).

## Global Constraints

- **Comments in code: English only** (CLAUDE.md).
- **Files ≤ 800 lines** (CLAUDE.md). `scripts/acceptance/fixtures.sh` is already at 805 and `check-stale-scoping.sh` at 642 — do **not** add to either; new harnesses get their own files.
- **Every guard proves it can go RED when the bug returns** — green on correct code is never evidence (contract §Quy tắc chung 1; the 0.5 lesson where 16/16 evals were green in all four code states).
- **"Could not look" is exit 2, never exit 0** (contract §Quy tắc chung 2). No new code path may read absence of evidence as success.
- **No production kill switch.** Perturbation must happen on a copy of the script inside the harness — an env var honoured by the shipped gate is itself the fail-open (`check-stale-scoping.sh::case_no_kill_switch` asserts this and will catch a violation).
- **Anchors, verified:** `ci-actions-bump` → `8477f8a` (PR #17) · `dependency-refresh-2026-07` → `4d89b58` (PR #16) · `oneflow-plugin-prefix` → `dd39da8` (PR #18). All three are real merge commits (`rev-parse ^2` succeeds).
- `ACCEPTANCE_SLUG` unset is the unanchored path and MUST behave exactly as today (AC-12).

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/acceptance/own-range.sh` **(new)** | The only implementation of the anchoring rule. Input: slug. Output: `range_from=` / `range_to=` / `commits=`. |
| `scripts/acceptance/test-own-range.sh` **(new)** | Harness for the resolver and its consumers: cases `anchored`, `unlanded`, `malformed`, `b1-red`, `no-run-exit2`, `unanchored-compat`, `backfill-integration`, `case-completeness`. |
| `scripts/acceptance/test-scope-namespace.sh` **(new)** | Harness for half (a): cases `exempt-refused`, `variants-discriminating`, `legit-granted`, `case-completeness`. |
| `scripts/pre-merge-check.sh` **(modify)** | `scope_has_any_match()` asks in the filtered universe. |
| `scripts/plugins/check-no-config-drift.sh` **(modify)** | Anchored diff range. |
| `scripts/deps/check-no-t3-drift.sh` **(modify)** | Anchored diff range. |
| `scripts/ci/check-workflow-drift.sh` **(modify)** | Anchored diff range. |
| `scripts/ci/gh-run-lib.sh` **(modify)** | `anchor_commits()` + `anchor_tip()`; `find_run` queries by commit set when anchored. |
| `scripts/ci/check-dispatch-run.sh` **(modify)** | Tree comparison against the anchor tip instead of `HEAD`. |
| `scripts/ci/check-ghcr-untouched.sh` **(modify)** | Tree comparison against anchor tip; registry window closed at the anchor's committer date. |
| `_acceptance/{ci-actions-bump,dependency-refresh-2026-07,oneflow-plugin-prefix}/contract.md` **(modify)** | `landed_merge:` frontmatter. |
| `_acceptance/config.yaml` **(modify)** | `ACCEPTANCE_SLUG=` on the three features' own executor keys. |

Task 1 and Task 2 are independent of each other (`independent: true`). Tasks 3–5 consume Task 1's resolver. Task 6 is the integration and must run last.

---

### Task 1: The anchoring resolver

**Files:**
- Create: `scripts/acceptance/own-range.sh`
- Create: `scripts/acceptance/test-own-range.sh`
- Read for reference: `scripts/pre-merge-check.sh` (its `front_field()` is the twin frontmatter reader this must agree with)

**Interfaces:**
- Consumes: nothing.
- Produces: `bash scripts/acceptance/own-range.sh <slug> [--root <path>]` → stdout three lines, `range_from=<sha>`, `range_to=<sha>`, `commits=<sha> <sha> …`; exit 0 resolved, exit 2 "cannot look". Every later task calls exactly this.

**Evals served:** E4 (AC-4), E5 (AC-5), E6 (AC-6). **independent: true**

- [ ] **Step 1: Write the failing harness cases**

Create `scripts/acceptance/test-own-range.sh` with the three resolver cases. (The remaining cases are appended by later tasks; `case-completeness` guards that no name in `KNOWN_CASES` is left unimplemented or unwired, the same way `check-stale-scoping.sh` does.)

```bash
#!/usr/bin/env bash
# Guard for scripts/acceptance/own-range.sh and its consumers.
#
# Lives under scripts/acceptance/ on purpose: t1_skip_globs exempts the gate
# tooling by EXACT path, so this file is gated and the gate applies to the
# change that alters the gate.
#
# One case per criterion, each with its own exit code. Several criteria behind
# one command would mean a case that was never implemented looks identical to a
# case that passed (stale-scope-by-paths#F1).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
RESOLVER="$HERE/own-range.sh"

KNOWN_CASES="anchored unlanded malformed b1-red no-run-exit2 unanchored-compat backfill-integration case-completeness"

# Real merge commits in this repo, verified 2026-08-04 (all have a ^2).
ANCHOR_CI="8477f8a"        # PR #17 — ci-actions-bump
ANCHOR_DEPS="4d89b58"      # PR #16 — dependency-refresh-2026-07
ANCHOR_PREFIX="dd39da8"    # PR #18 — oneflow-plugin-prefix
# Two DIFFERENT shas inside PR #17: the CI run sits on one, the two dispatch
# runs on the other. This is the whole reason the anchor is a commit SET.
PR17_CI_SHA="60c4797"
PR17_DISPATCH_SHA="b48699c6"

TMPDIRS="$(mktemp)"
new_tmp() { d="$(mktemp -d)"; printf '%s\n' "$d" >> "$TMPDIRS"; printf '%s' "$d"; }
cleanup() { while IFS= read -r d; do [ -n "$d" ] && rm -rf "$d"; done < "$TMPDIRS"; rm -f "$TMPDIRS"; }
trap cleanup EXIT

pass() { echo "CASE $1: PASS"; }
fail() { echo "CASE $1: FAIL $2"; exit 1; }

field() { # <resolver-output> <key>
  printf '%s\n' "$1" | sed -n "s/^$2=//p"
}

case_anchored() {
  # AC-4 / E4: a real merge commit resolves to its own PR range, and the
  # commit SET contains both shas that carried runs.
  out="$(bash "$RESOLVER" ci-actions-bump --root "$ROOT")" \
    || fail anchored "resolver exited non-zero on a valid anchor"
  from="$(field "$out" range_from)"
  to="$(field "$out" range_to)"
  commits="$(field "$out" commits)"
  [ "$to" = "$(git -C "$ROOT" rev-parse "$ANCHOR_CI")" ] \
    || fail anchored "range_to=$to is not $ANCHOR_CI"
  [ "$from" = "$(git -C "$ROOT" rev-parse "${ANCHOR_CI}^1")" ] \
    || fail anchored "range_from=$from is not ${ANCHOR_CI}^1"
  for want in "$PR17_CI_SHA" "$PR17_DISPATCH_SHA"; do
    full="$(git -C "$ROOT" rev-parse "$want")"
    case " $commits " in
      *" $full "*) ;;
      *) fail anchored "commit set is missing $want — the set is why anchoring works" ;;
    esac
  done
  pass anchored
}

case_unlanded() {
  # AC-5 / E5: no landed_merge -> merge-base(HEAD, main)..HEAD, byte-identical
  # with what an open PR gets today. Uses a throwaway repo so the assertion does
  # not depend on where this branch happens to be.
  d="$(new_tmp)"
  ( cd "$d"
    git init -q .; git config user.email t@t; git config user.name t
    mkdir -p _acceptance/tmpfeat
    printf 'x\n' > a.txt; git add -A; git commit -qm base
    git branch -q main-ish
    printf 'y\n' > b.txt; git add -A; git commit -qm work
    printf -- '---\nslug: tmpfeat\n---\n' > _acceptance/tmpfeat/contract.md
    git add -A; git commit -qm contract
  )
  out="$(MAIN_REF=main-ish bash "$RESOLVER" tmpfeat --root "$d")" \
    || fail unlanded "resolver exited non-zero with no anchor"
  want_from="$(git -C "$d" merge-base HEAD main-ish)"
  [ "$(field "$out" range_from)" = "$want_from" ] \
    || fail unlanded "range_from is not merge-base(HEAD, main)"
  [ "$(field "$out" range_to)" = "$(git -C "$d" rev-parse HEAD)" ] \
    || fail unlanded "range_to is not HEAD"
  pass unlanded
}

case_malformed() {
  # AC-6 / E6: three distinct broken anchors, three exit 2s — never a range.
  d="$(new_tmp)"
  ( cd "$d"
    git init -q .; git config user.email t@t; git config user.name t
    mkdir -p _acceptance/bad
    printf 'x\n' > a.txt; git add -A; git commit -qm base
  )
  plain="$(git -C "$d" rev-parse HEAD)"
  write_anchor() { printf -- '---\nslug: bad\nlanded_merge: %s\n---\n' "$1" > "$d/_acceptance/bad/contract.md"; }

  # (1) sha that does not exist
  write_anchor "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
  bash "$RESOLVER" bad --root "$d" >/dev/null 2>&1
  [ "$?" -eq 2 ] || fail malformed "nonexistent sha did not exit 2"
  # (2) a real commit that is not a merge (no ^2) — the squash-landed shape
  write_anchor "$plain"
  bash "$RESOLVER" bad --root "$d" >/dev/null 2>&1
  [ "$?" -eq 2 ] || fail malformed "non-merge commit did not exit 2"
  # (3) garbage that is not a sha at all
  write_anchor "not-a-sha; rm -rf /"
  bash "$RESOLVER" bad --root "$d" >/dev/null 2>&1
  [ "$?" -eq 2 ] || fail malformed "garbage anchor did not exit 2"

  # The resolver reads frontmatter with its own reader; pre-merge-check.sh has a
  # twin (front_field). Drift between the two is a silent wrong answer, so pin
  # them to the same result on a contract designed to trip a sloppy reader:
  # a decoy in the body, a trailing comment, and quotes.
  printf -- '---\nslug: bad\nlanded_merge: "%s"  # PR #99\n---\n\nlanded_merge: cafebabe\n' \
    "$plain" > "$d/_acceptance/bad/contract.md"
  ff_src="$(sed -n '/^front_field()/,/^}/p' "$ROOT/scripts/pre-merge-check.sh")"
  [ -n "$ff_src" ] || fail malformed "could not extract front_field() from pre-merge-check.sh"
  eval "$ff_src"
  twin="$(front_field "$d/_acceptance/bad/contract.md" landed_merge)"
  mine="$(bash "$RESOLVER" bad --root "$d" --print-anchor 2>/dev/null || true)"
  [ "$twin" = "$mine" ] \
    || fail malformed "frontmatter readers disagree: gate says '$twin', resolver says '$mine'"
  pass malformed
}

case_case_completeness() {
  # A case that was never implemented must be loud, not absent — and a case that
  # exists but is wired nowhere never runs (the indent-drift lesson).
  missing=""
  for c in $KNOWN_CASES; do
    fn="case_$(printf '%s' "$c" | tr '-' '_')"
    command -v "$fn" >/dev/null 2>&1 || missing="$missing $c"
  done
  [ -z "$missing" ] || fail case-completeness "unimplemented cases:$missing"
  if bash "$0" definitely-not-a-case >/dev/null 2>&1; then
    fail case-completeness "unknown case name exited 0"
  fi
  missing_cfg=""
  for c in $KNOWN_CASES; do
    [ "$c" = "case-completeness" ] && continue
    grep -F -- "test-own-range.sh $c" "$ROOT/_acceptance/config.yaml" >/dev/null 2>&1 \
      || missing_cfg="$missing_cfg $c"
  done
  [ -z "$missing_cfg" ] \
    || fail case-completeness "cases with no executors.script entry in _acceptance/config.yaml:$missing_cfg"
  pass case-completeness
}

main() {
  [ "$#" -ge 1 ] || { echo "usage: $(basename "$0") <case>" >&2; exit 2; }
  case " $KNOWN_CASES " in
    *" $1 "*) ;;
    *) echo "unknown case '$1' (known: $KNOWN_CASES)" >&2; exit 2 ;;
  esac
  "case_$(printf '%s' "$1" | tr '-' '_')"
}

main "$@"
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `bash scripts/acceptance/test-own-range.sh anchored`
Expected: FAIL — `own-range.sh` does not exist yet, so `bash "$RESOLVER"` errors and the case reports `FAIL resolver exited non-zero on a valid anchor` with exit 1.

- [ ] **Step 3: Write the resolver**

Create `scripts/acceptance/own-range.sh`:

```bash
#!/usr/bin/env bash
# The ONE place that knows what commit range a feature owns.
#
# After a feature merges, an eval that asks "did MY pr touch config/?" still has
# a truthful answer — but only if it asks about its own PR. Re-running it on a
# later branch grades somebody else's diff, which is how three signed features
# ended up permanently red on feat/compose-overlay. The rule is written here and
# NOWHERE else: guards call this and use what it prints. Seven copies of one
# concept cost compose-overlay three verify rounds; this is the correction.
#
# Usage:  own-range.sh <slug> [--root <path>] [--print-anchor]
# Output: range_from=<sha>
#         range_to=<sha>
#         commits=<sha> <sha> ...      (newest first; the PR's own commits)
#
# Exit 0 = resolved. Exit 2 = could not look (a broken anchor, a missing
# contract, no git). There is deliberately no exit 1: this script never renders
# a verdict, it only answers where to look — and "I could not tell you" must
# never be readable as "clean" (the gh-run-lib rule).
set -u

SLUG=""
ROOT=""
PRINT_ANCHOR=0
while [ "$#" -gt 0 ]; do
    case "$1" in
        --root) ROOT="${2:-}"; shift 2 ;;
        --print-anchor) PRINT_ANCHOR=1; shift ;;
        -*) echo "unknown option '$1'" >&2; exit 2 ;;
        *) [ -z "$SLUG" ] || { echo "unexpected argument '$1'" >&2; exit 2; }; SLUG="$1"; shift ;;
    esac
done
[ -n "$SLUG" ] || { echo "usage: $(basename "$0") <slug> [--root <path>]" >&2; exit 2; }
if [ -z "$ROOT" ]; then
    ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
fi

command -v git >/dev/null 2>&1 || { echo "git not found" >&2; exit 2; }
git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 || {
    echo "'$ROOT' is not a git repository — cannot resolve a range" >&2; exit 2; }

CONTRACT="$ROOT/_acceptance/$SLUG/contract.md"
[ -f "$CONTRACT" ] || { echo "no contract at $CONTRACT — cannot resolve the anchor for '$SLUG'" >&2; exit 2; }

# Twin of front_field() in scripts/pre-merge-check.sh: reads the LEADING
# frontmatter block only, so a decoy in the body cannot poison the answer.
# test-own-range.sh --case malformed pins the two readers to the same result, so
# drift between them is red rather than a silently different anchor.
front_field() { # <file> <key>
    awk '!f && NF==0 {next} !f && /^---[[:space:]]*$/ {f=1; next} !f {exit} /^---[[:space:]]*$/ {exit} {print}' "$1" \
        | sed -n "s/^${2}:[[:space:]]*//p" | head -1 \
        | sed -e 's/[[:space:]]*#.*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//' -e 's/[[:space:]]*$//'
}

ANCHOR="$(front_field "$CONTRACT" landed_merge)"
if [ "$PRINT_ANCHOR" -eq 1 ]; then
    printf '%s' "$ANCHOR"
    exit 0
fi

if [ -z "$ANCHOR" ]; then
    # Unlanded: the feature is still an open PR, so what it owns is what it has
    # added since it left the main line. Byte-compatible with the behaviour every
    # guard has today, which is why an open PR sees no change at all.
    main_ref="${MAIN_REF:-origin/main}"
    if ! git -C "$ROOT" rev-parse --verify --quiet "${main_ref}^{commit}" >/dev/null; then
        if git -C "$ROOT" rev-parse --verify --quiet "main^{commit}" >/dev/null; then
            main_ref="main"
        else
            echo "cannot resolve the main ref ('${MAIN_REF:-origin/main}') — fetch it first (CI needs fetch-depth: 0)" >&2
            exit 2
        fi
    fi
    if ! from="$(git -C "$ROOT" merge-base HEAD "$main_ref" 2>/dev/null)"; then
        echo "no merge base between HEAD and ${main_ref} — refusing to guess a range" >&2
        exit 2
    fi
    to="$(git -C "$ROOT" rev-parse HEAD)"
    printf 'range_from=%s\n' "$from"
    printf 'range_to=%s\n' "$to"
    printf 'commits=%s\n' "$(git -C "$ROOT" rev-list "${from}..${to}" | tr '\n' ' ' | sed 's/ $//')"
    exit 0
fi

# Landed: the anchor must be the MERGE commit that carried the feature in. Its
# first parent is the main line before it, its second parent is the PR tip — so
# ^1..^2 is exactly the PR's own commits, and ^1..<anchor> is exactly the diff
# the merge introduced. A squash-landed PR has no ^2 and is refused loudly
# rather than approximated: guessing here would hand a guard the wrong range and
# call it an answer.
if ! git -C "$ROOT" rev-parse --verify --quiet "${ANCHOR}^{commit}" >/dev/null 2>&1; then
    echo "landed_merge '${ANCHOR}' (contract of '${SLUG}') is not a commit in this clone" >&2
    echo "shallow fetch, or the anchor was written wrong — refusing to guess a range" >&2
    exit 2
fi
if ! tip="$(git -C "$ROOT" rev-parse --verify --quiet "${ANCHOR}^2" 2>/dev/null)"; then
    echo "landed_merge '${ANCHOR}' is not a merge commit (no second parent)" >&2
    echo "a squash-landed PR has no commit set to anchor to — write the merge commit, or leave landed_merge out" >&2
    exit 2
fi
base="$(git -C "$ROOT" rev-parse "${ANCHOR}^1")"
printf 'range_from=%s\n' "$base"
printf 'range_to=%s\n' "$(git -C "$ROOT" rev-parse "$ANCHOR")"
printf 'commits=%s\n' "$(git -C "$ROOT" rev-list "${base}..${tip}" | tr '\n' ' ' | sed 's/ $//')"
```

Then `chmod +x scripts/acceptance/own-range.sh scripts/acceptance/test-own-range.sh`.

- [ ] **Step 4: Backfill the anchor this task's own test needs**

`case_anchored` reads `_acceptance/ci-actions-bump/contract.md`. Add the frontmatter field (the full three-feature backfill is Task 6; this one line is what makes Task 1 testable):

```bash
```
Insert `landed_merge: 8477f8a` as the last line of the frontmatter block in `_acceptance/ci-actions-bump/contract.md`, immediately before its closing `---`.

- [ ] **Step 5: Run the three resolver cases to verify they pass**

Run: `for c in anchored unlanded malformed; do bash scripts/acceptance/test-own-range.sh $c || break; done`
Expected: `CASE anchored: PASS`, `CASE unlanded: PASS`, `CASE malformed: PASS`.

- [ ] **Step 6: Prove the resolver can go RED (mutation)**

Revert the merge-commit check by hand — change `if ! tip="$(git -C "$ROOT" rev-parse --verify --quiet "${ANCHOR}^2" …)"` to `tip="$(git -C "$ROOT" rev-parse "${ANCHOR}^2" 2>/dev/null || git -C "$ROOT" rev-parse "$ANCHOR")"` — then:

Run: `bash scripts/acceptance/test-own-range.sh malformed`
Expected: FAIL `non-merge commit did not exit 2`. **Restore the file afterwards** (`git checkout -- scripts/acceptance/own-range.sh`) and re-run to confirm PASS again.

- [ ] **Step 7: Commit**

```bash
git add scripts/acceptance/own-range.sh scripts/acceptance/test-own-range.sh _acceptance/ci-actions-bump/contract.md && git commit -m "feat(acceptance): own-range.sh — the single home of the anchoring rule"
```

---

### Task 2: Half (a) — ask in the universe the answer lives in

**Files:**
- Modify: `scripts/pre-merge-check.sh` (`scope_has_any_match()`, ~line 611–654)
- Create: `scripts/acceptance/test-scope-namespace.sh`

**Interfaces:**
- Consumes: nothing (independent of Task 1).
- Produces: no new callable surface — the behaviour change is internal to the gate.

**Evals served:** E1 (AC-1), E2 (AC-2), E3 (AC-3). **independent: true**

- [ ] **Step 1: Write the failing harness**

Create `scripts/acceptance/test-scope-namespace.sh`:

```bash
#!/usr/bin/env bash
# Guard for the path-namespace half of gate-scope-anchors (variant 5 of the
# "asked in one universe, answered in another" family that stale-scope-by-paths
# named and left open).
#
# scope_has_any_match() decides whether a feature's declared `paths` are usable
# at all; stale_files() then applies them. If the two disagree about WHICH files
# exist, a wholly honest declaration can be granted a scope that filters out
# every real change, forever, on every later PR — silently. That is the shape
# tested here.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
GATE="$ROOT/scripts/pre-merge-check.sh"

KNOWN_CASES="exempt-refused variants-discriminating legit-granted case-completeness"

TMPDIRS="$(mktemp)"
new_tmp() { d="$(mktemp -d)"; printf '%s\n' "$d" >> "$TMPDIRS"; printf '%s' "$d"; }
cleanup() { while IFS= read -r d; do [ -n "$d" ] && rm -rf "$d"; done < "$TMPDIRS"; rm -f "$TMPDIRS"; }
trap cleanup EXIT

pass() { echo "CASE $1: PASS"; }
fail() { echo "CASE $1: FAIL $2"; exit 1; }

# Extract the two functions under test from the SHIPPED gate and run them in
# this shell. Sourcing the whole gate is not an option (it has side effects and
# calls exit), and a private copy would drift from what actually ships. This is
# the same extraction check-stale-scoping.sh::case_guard_not_exempt uses.
load_gate_fns() { # <gate-file>
  src="$(sed -n '/^match_globs()/,/^}/p' "$1")
$(sed -n '/^scope_has_any_match()/,/^}/p' "$1")"
  case "$src" in
    *match_globs*scope_has_any_match*) ;;
    *) return 1 ;;
  esac
  eval "$src"
}

# A fixture repo whose ONLY tracked files are exempt ones, plus one real source
# file so the repo is not degenerate.
mk_repo() {
  d="$(new_tmp)"
  ( cd "$d"
    git init -q .; git config user.email t@t; git config user.name t
    mkdir -p docs src/lib _acceptance/feat
    printf 'd\n' > docs/guide.md
    printf 'c\n' > CHANGELOG.md
    printf 's\n' > src/lib/real.ts
    printf 'a\n' > _acceptance/feat/contract.md
    git add -A; git commit -qm base
  )
  printf '%s' "$d"
}

case_exempt_refused() {
  # AC-1 / E1: a union that only ever matches exempt files must be REFUSED,
  # because stale_files() filters those files out before scope is applied — the
  # scope could never report anything again.
  d="$(mk_repo)"
  load_gate_fns "$GATE" || fail exempt-refused "could not extract the gate functions"
  T1_GLOBS="docs/**
CHANGELOG.md"
  if scope_has_any_match "$d" 'docs/**'; then
    fail exempt-refused "narrow scope granted to a union that only matches exempt files"
  fi
  # _acceptance/** is filtered by stale_files() too, by a different branch.
  if scope_has_any_match "$d" '_acceptance/**'; then
    fail exempt-refused "narrow scope granted to a union that only matches _acceptance/"
  fi
  pass exempt-refused
}

case_legit_granted() {
  # AC-3 / E3: the suppression half. A declaration pointing at real gated code
  # must STILL be granted — a fix that refuses everyone rebuilds the treadmill
  # 0.5 existed to remove.
  d="$(mk_repo)"
  load_gate_fns "$GATE" || fail legit-granted "could not extract the gate functions"
  T1_GLOBS="docs/**
CHANGELOG.md"
  scope_has_any_match "$d" 'src/lib/**' \
    || fail legit-granted "narrow scope refused for a union pointing at real code"
  # A mixed union (one exempt glob, one real) is legitimate too: it can still
  # report something.
  scope_has_any_match "$d" 'docs/**
src/lib/**' || fail legit-granted "mixed union refused although it matches real code"
  pass legit-granted
}

case_variants_discriminating() {
  # AC-2 / E2: the four variants stale-scope-by-paths already fixed must still
  # be catchable. Perturb a COPY of the gate (never the shipped one — an env
  # knob in the gate would itself be the fail-open) and assert each perturbation
  # makes this harness red.
  d="$(mk_repo)"
  T1_GLOBS="docs/**
CHANGELOG.md"

  # v1 — namespace: ls-files without --full-name (repo-relative) vs diff
  #      (toplevel-relative). Reproduced by asking in a subdirectory root.
  copy="$(new_tmp)/gate.sh"; cp "$GATE" "$copy"
  sed -i.bak 's/ls-files --full-name/ls-files/' "$copy" && rm -f "${copy}.bak"
  ( cd "$d" && mkdir -p pkg && git mv src pkg/src -k 2>/dev/null || true )
  ( cd "$d" && mv src pkg/src 2>/dev/null; git add -A; git commit -qm move -q ) 2>/dev/null || true
  load_gate_fns "$copy" || fail variants-discriminating "could not extract from the perturbed copy (v1)"
  if scope_has_any_match "$d/pkg" 'pkg/src/**'; then
    fail variants-discriminating "v1 (namespace) not caught: a toplevel-relative union matched a repo-relative listing"
  fi
  load_gate_fns "$GATE" || fail variants-discriminating "could not reload the shipped gate"
  scope_has_any_match "$d/pkg" 'pkg/src/**' \
    || fail variants-discriminating "v1 control failed: the shipped gate must accept this union"

  # v2 — prefix: matching only the top-level component, so `src` matches
  #      `srcfoo/`. Perturb match_globs to compare prefixes.
  copy2="$(new_tmp)/gate2.sh"; cp "$GATE" "$copy2"
  sed -i.bak 's|case "\$1" in \$g) return 0 ;; esac|case "$1" in ${g%%/*}*) return 0 ;; esac|' "$copy2" && rm -f "${copy2}.bak"
  load_gate_fns "$copy2" || fail variants-discriminating "could not extract from the perturbed copy (v2)"
  if ! scope_has_any_match "$d" 'docs-not-real/**'; then
    : # a prefix-matcher would wrongly accept; if it refuses, the perturbation missed
  else
    load_gate_fns "$GATE" || fail variants-discriminating "could not reload the shipped gate"
    scope_has_any_match "$d" 'docs-not-real/**' \
      && fail variants-discriminating "v2 (prefix) not caught: the shipped gate accepts a nonexistent path too"
  fi

  # v3/v4 — total-vs-distribution and look-behind attribution live in
  #      feature_scope()/slug_acceptance_touched(), already pinned by
  #      check-stale-scoping.sh --case partial / --case merged-halves. Assert
  #      those cases still exist and are wired, rather than duplicating them:
  #      a second copy of a guard is a second thing to drift.
  for c in partial merged-halves; do
    grep -F -- "--case $c" "$ROOT/_acceptance/config.yaml" >/dev/null \
      || fail variants-discriminating "variant guard '--case $c' is no longer wired in config.yaml"
  done
  pass variants-discriminating
}

case_case_completeness() {
  missing=""
  for c in $KNOWN_CASES; do
    fn="case_$(printf '%s' "$c" | tr '-' '_')"
    command -v "$fn" >/dev/null 2>&1 || missing="$missing $c"
  done
  [ -z "$missing" ] || fail case-completeness "unimplemented cases:$missing"
  if bash "$0" definitely-not-a-case >/dev/null 2>&1; then
    fail case-completeness "unknown case name exited 0"
  fi
  missing_cfg=""
  for c in $KNOWN_CASES; do
    [ "$c" = "case-completeness" ] && continue
    grep -F -- "test-scope-namespace.sh $c" "$ROOT/_acceptance/config.yaml" >/dev/null 2>&1 \
      || missing_cfg="$missing_cfg $c"
  done
  [ -z "$missing_cfg" ] || fail case-completeness "cases not wired into _acceptance/config.yaml:$missing_cfg"
  pass case-completeness
}

main() {
  [ "$#" -ge 1 ] || { echo "usage: $(basename "$0") <case>" >&2; exit 2; }
  case " $KNOWN_CASES " in
    *" $1 "*) ;;
    *) echo "unknown case '$1' (known: $KNOWN_CASES)" >&2; exit 2 ;;
  esac
  "case_$(printf '%s' "$1" | tr '-' '_')"
}

main "$@"
```

- [ ] **Step 2: Run it to verify it fails on the current gate**

Run: `bash scripts/acceptance/test-scope-namespace.sh exempt-refused`
Expected: FAIL `narrow scope granted to a union that only matches exempt files` — today `scope_has_any_match()` sees `docs/guide.md` in `ls-files` and grants the scope.

- [ ] **Step 3: Fix `scope_has_any_match()`**

In `scripts/pre-merge-check.sh`, inside `scope_has_any_match()`'s `ls-files` loop, apply the same two exemptions `stale_files()` applies before asking whether the union matches:

```bash
  git -C "$1" ls-files --full-name 2>/dev/null | {
    hit=1
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      # Ask in the universe the answer lives in. stale_files() drops gate
      # artifacts and t1_skip_globs BEFORE applying scope, so a union that only
      # matches files from those two sets can never report anything — granting
      # it narrow scope makes the feature permanently un-stale, silently, on
      # every later PR. That is variant 5 of the namespace family, left open by
      # stale-scope-by-paths with an explicit "do not patch this piecemeal".
      case "$f" in _acceptance/*|*/_acceptance/*) continue ;; esac
      match_globs "$f" "$T1_GLOBS" && continue
      if match_globs "$f" "$2"; then
        hit=0
        break
      fi
    done
    exit "$hit"
  }
```

Also extend the function's header comment with one line naming the filter, so the next reader sees why the two loops must stay in step.

- [ ] **Step 4: Add the refusal NOTE**

AC-1 requires the refusal to state its reason rather than silently falling back. At the call site of `scope_has_any_match()` in the feature loop, the existing "declared but unusable" NOTE branch must distinguish the new cause. Locate the branch that currently prints the fallback note and extend it:

```bash
    echo "NOTE [$slug]: declared paths match no gated file (every match is _acceptance/** or t1-exempt) — narrow staleness scope REFUSED, whole-tree staleness applies. Declare a glob that points at code this feature's evals actually exercise."
```

- [ ] **Step 5: Run the three cases to verify they pass**

Run: `for c in exempt-refused legit-granted variants-discriminating; do bash scripts/acceptance/test-scope-namespace.sh $c || break; done`
Expected: three `PASS` lines.

- [ ] **Step 6: Run the existing suite to prove nothing regressed**

Run: `for c in in-scope out-of-scope partial under-declared malformed suppression announce mutation case-completeness; do bash scripts/acceptance/check-stale-scoping.sh --case $c || break; done`
Expected: every case PASS. `bash scripts/acceptance/check-stale-golden.sh` and `bash scripts/acceptance/check-stale-real-repo.sh` must also stay green.

- [ ] **Step 7: Commit**

```bash
git add scripts/pre-merge-check.sh scripts/acceptance/test-scope-namespace.sh && git commit -m "fix(gate): scope_has_any_match asks in the filtered universe (variant 5)"
```

---

### Task 3: B1 — the three diff guards learn one anchored branch

**Files:**
- Modify: `scripts/plugins/check-no-config-drift.sh`
- Modify: `scripts/deps/check-no-t3-drift.sh`
- Modify: `scripts/ci/check-workflow-drift.sh`
- Modify: `scripts/acceptance/test-own-range.sh` (append `case_b1_red`, `case_unanchored_compat`)

**Interfaces:**
- Consumes: `own-range.sh` from Task 1 (`range_from=` / `range_to=`).
- Produces: `ACCEPTANCE_SLUG=<slug>` as the switch every consumer uses. Unset = today's behaviour.

**Evals served:** E7 (AC-7 green half), E8 (AC-7 red half), E13 (AC-12, B1 half). **independent: false**

- [ ] **Step 1: Write the failing cases**

Append to `scripts/acceptance/test-own-range.sh`, before `main()`:

```bash
b1_guard() { printf '%s' "$ROOT/scripts/plugins/check-no-config-drift.sh"; }

case_b1_red() {
  # AC-7 red half / E8: anchoring must not turn a guard into a nodding machine.
  # A fixture whose OWN merge touched a forbidden path must still exit 1.
  d="$(new_tmp)"
  ( cd "$d"
    git init -q -b main .; git config user.email t@t; git config user.name t
    mkdir -p config src/lib/plugins src/db _acceptance/guilty
    printf '{"org":"https://github.com/tong-io","plugins":%s}\n' "$(python3 -c 'print([str(i) for i in range(31)])' | tr "'" '"')" > config/official-plugins.json
    git add -A; git commit -qm base
    git checkout -qb pr
    printf 'x\n' >> config/official-plugins.json   # the forbidden touch
    git add -A; git commit -qm "pr touches config/"
    git checkout -q main
    git merge -q --no-ff pr -m "Merge pull request #1 from t/pr"
    anchor="$(git rev-parse HEAD)"
    printf -- '---\nslug: guilty\nlanded_merge: %s\n---\n' "$anchor" > _acceptance/guilty/contract.md
    git add -A; git commit -qm contract
    printf 'unrelated\n' > later.txt; git add -A; git commit -qm "later work by someone else"
  )
  cp "$(b1_guard)" "$d/guard.sh"
  mkdir -p "$d/scripts/acceptance" && cp "$RESOLVER" "$d/scripts/acceptance/own-range.sh"
  mkdir -p "$d/scripts/plugins" && cp "$(b1_guard)" "$d/scripts/plugins/check-no-config-drift.sh"
  ( cd "$d" && ACCEPTANCE_SLUG=guilty bash scripts/plugins/check-no-config-drift.sh >/dev/null 2>&1 )
  rc=$?
  [ "$rc" -eq 1 ] || fail b1-red "anchored guard exited $rc on a PR that DID touch config/ (want 1)"
  pass b1-red
}

case_unanchored_compat() {
  # AC-12 / E13: with ACCEPTANCE_SLUG unset the guard must behave exactly as it
  # does today. An anchoring bug that yields an empty range would make every
  # open PR green — the same fail-open family this contract exists to close.
  d="$(new_tmp)"
  ( cd "$d"
    git init -q -b main .; git config user.email t@t; git config user.name t
    mkdir -p config scripts/acceptance scripts/plugins
    printf '{"org":"https://github.com/tong-io","plugins":%s}\n' "$(python3 -c 'print([str(i) for i in range(31)])' | tr "'" '"')" > config/official-plugins.json
    git add -A; git commit -qm base
    git branch -q origin-main
    git checkout -qb work
    printf 'x\n' >> config/official-plugins.json
    git add -A; git commit -qm "open PR touches config/"
  )
  cp "$RESOLVER" "$d/scripts/acceptance/own-range.sh"
  cp "$(b1_guard)" "$d/scripts/plugins/check-no-config-drift.sh"
  # dirty: env unset, violation present -> exit 1 (today's behaviour)
  ( cd "$d" && bash scripts/plugins/check-no-config-drift.sh origin-main >/dev/null 2>&1 )
  rc=$?
  [ "$rc" -eq 1 ] || fail unanchored-compat "unanchored guard exited $rc on a real violation (want 1)"
  # clean: no violation -> exit 0
  ( cd "$d" && git checkout -q origin-main && bash scripts/plugins/check-no-config-drift.sh origin-main >/dev/null 2>&1 )
  rc=$?
  [ "$rc" -eq 0 ] || fail unanchored-compat "unanchored guard exited $rc on a clean tree (want 0)"
  pass unanchored-compat
}
```

- [ ] **Step 2: Run to verify they fail**

Run: `bash scripts/acceptance/test-own-range.sh b1-red`
Expected: FAIL — the guard ignores `ACCEPTANCE_SLUG`, diffs `origin/main...HEAD`, cannot resolve `origin/main` in the fixture and exits 2, so the case reports `anchored guard exited 2 … (want 1)`.

- [ ] **Step 3: Add the anchored branch to all three guards**

The identical block goes at the top of each guard, replacing only the base-resolution lines. For `scripts/plugins/check-no-config-drift.sh`:

```bash
BASE="${1:-origin/main}"
PATHS=(config src/lib/plugins/plugins-registry-schema.ts src/lib/plugins/plugins-registry.server.ts src/db)

# This guard asks a question about ONE pull request: "did it touch these paths?"
# Re-run on a later branch it answers about somebody else's diff, which is how
# it went permanently red after merging. ACCEPTANCE_SLUG anchors it back to its
# own PR; unset, every line below behaves exactly as it did before anchoring
# existed. The rule itself lives in scripts/acceptance/own-range.sh and nowhere
# else — this is one call, not a second implementation.
if [ -n "${ACCEPTANCE_SLUG:-}" ]; then
    RESOLVER="$(cd "$(dirname "${BASH_SOURCE[0]}")/../acceptance" && pwd)/own-range.sh"
    if ! own="$(bash "$RESOLVER" "$ACCEPTANCE_SLUG")"; then
        echo "could not resolve the commit range owned by '${ACCEPTANCE_SLUG}' — refusing to report a clean tree" >&2
        exit 2
    fi
    RANGE_FROM="$(printf '%s\n' "$own" | sed -n 's/^range_from=//p')"
    RANGE_TO="$(printf '%s\n' "$own" | sed -n 's/^range_to=//p')"
    if [ -z "$RANGE_FROM" ] || [ -z "$RANGE_TO" ]; then
        echo "own-range.sh printed no range for '${ACCEPTANCE_SLUG}' — refusing to report a clean tree" >&2
        exit 2
    fi
    RANGE="${RANGE_FROM}...${RANGE_TO}"
    LABEL="the range ${ACCEPTANCE_SLUG} owns (${RANGE_FROM}..${RANGE_TO})"
else
    if ! git rev-parse --verify --quiet "${BASE}^{commit}" >/dev/null; then
        echo "cannot resolve base ref '${BASE}' — fetch it first (CI needs fetch-depth: 0)" >&2
        exit 2
    fi
    RANGE="${BASE}...HEAD"
    LABEL="${BASE}"
fi

if ! drift="$(git diff --name-only "$RANGE" -- "${PATHS[@]}")"; then
    echo "git diff over '${RANGE}' failed — refusing to report a clean tree" >&2
    exit 2
fi
```

and the closing line becomes `echo "no drift vs ${LABEL}: ${PATHS[*]} untouched"`.

Apply the same block to `scripts/deps/check-no-t3-drift.sh` (its resolver path is `$(dirname)/../acceptance`, `PATHS=(src/lib/abi src/app/api)`, closing line `echo "no T3 drift: ${PATHS[*]} untouched vs ${LABEL}"`) and to `scripts/ci/check-workflow-drift.sh` (resolver path `$(dirname)/../acceptance`, its diff is `git diff --unified=0 "$RANGE" -- "$WF_DIR"`, and its two `vs ${BASE}` messages become `vs ${LABEL}`).

- [ ] **Step 4: Run the two new cases to verify they pass**

Run: `bash scripts/acceptance/test-own-range.sh b1-red && bash scripts/acceptance/test-own-range.sh unanchored-compat`
Expected: `CASE b1-red: PASS`, `CASE unanchored-compat: PASS`.

- [ ] **Step 5: Run the live green case (E7)**

Run:
```bash
ACCEPTANCE_SLUG=oneflow-plugin-prefix bash scripts/plugins/check-no-config-drift.sh; echo "config-drift=$?"
```
Expected: `config-drift=0` once Task 6 has written `oneflow-plugin-prefix`'s anchor. **Until then this exits 2** ("no landed_merge"), which is correct and is why E7's full assertion belongs to Task 6. Only `ci-actions-bump` is anchored at this point, so the one runnable live check now is:
```bash
ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-workflow-drift.sh; echo "workflow-drift=$?"
```
Expected: `workflow-drift=0`.

- [ ] **Step 6: Prove the anchoring is load-bearing (mutation)**

Temporarily change the anchored branch in `check-no-config-drift.sh` to fall back to `RANGE="${BASE}...HEAD"` when the resolver succeeds (i.e. ignore the range it printed), then:

Run: `bash scripts/acceptance/test-own-range.sh b1-red`
Expected: FAIL — the fixture's later commit is not in the forbidden path, so an unanchored diff reports clean and the case sees exit 0 instead of 1. Restore with `git checkout -- scripts/plugins/check-no-config-drift.sh` and re-run to confirm PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/plugins/check-no-config-drift.sh scripts/deps/check-no-t3-drift.sh scripts/ci/check-workflow-drift.sh scripts/acceptance/test-own-range.sh && git commit -m "fix(acceptance): anchor the three diff guards to their own PR"
```

---

### Task 4: B2 — find runs by commit set, not by branch name

**Files:**
- Modify: `scripts/ci/gh-run-lib.sh`
- Modify: `scripts/ci/check-dispatch-run.sh`
- Modify: `scripts/acceptance/test-own-range.sh` (append `case_no_run_exit2`)

**Interfaces:**
- Consumes: `own-range.sh` (`commits=`, `range_to=`).
- Produces: `anchor_commits()` → newline-separated shas or empty; `anchor_tip()` → the sha that plays HEAD's role (the merge commit when anchored, `HEAD` otherwise). `check-ghcr-untouched.sh` (Task 5) consumes both.

**Evals served:** E9 (AC-8), E10 (AC-10), E13 (AC-12, gh-run-lib half). **independent: false**

- [ ] **Step 1: Write the failing case**

Append to `scripts/acceptance/test-own-range.sh`:

```bash
case_no_run_exit2() {
  # AC-10 / E10: a valid anchor whose commits carry NO run must read as
  # "could not look" (exit 2), never as a pass. Runs offline by stubbing `gh` on
  # PATH — the assertion is about the library's control flow, not about GitHub.
  d="$(new_tmp)"
  mkdir -p "$d/bin"
  cat > "$d/bin/gh" <<'STUB'
#!/usr/bin/env bash
case "$1 $2" in
  "auth status") exit 0 ;;
  "run list") echo '[]' ; exit 0 ;;   # authenticated, looked, found nothing
esac
exit 0
STUB
  chmod +x "$d/bin/gh"
  out="$(cd "$ROOT" && PATH="$d/bin:$PATH" ACCEPTANCE_SLUG=ci-actions-bump bash -c '
      . scripts/ci/gh-run-lib.sh
      require_gh
      find_run ci "" "" ""
  ' 2>&1)"
  rc=$?
  [ "$rc" -eq 2 ] || fail no-run-exit2 "find_run exited $rc when no run exists at any anchored commit (want 2)"
  case "$out" in
    *"must actually have run"*) ;;
    *) fail no-run-exit2 "exit 2 carried no explanation of what could not be seen" ;;
  esac
  # Unanchored (AC-12): still exit 2, and still by the pre-existing message —
  # the no-anchor path is not allowed to change shape.
  rc2=0
  (cd "$ROOT" && PATH="$d/bin:$PATH" bash -c '. scripts/ci/gh-run-lib.sh; find_run ci "" "" ""' >/dev/null 2>&1) || rc2=$?
  [ "$rc2" -eq 2 ] || fail no-run-exit2 "unanchored find_run exited $rc2 with no runs (want 2)"
  pass no-run-exit2
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `bash scripts/acceptance/test-own-range.sh no-run-exit2`
Expected: FAIL — `find_run` today ignores `ACCEPTANCE_SLUG`; the message it prints names a branch, not the anchored commit set, so the `must actually have run` substring check passes but the anchored control flow is untested. Confirm the failure is real by asserting the message names the slug (add `*"${ACCEPTANCE_SLUG}"*` to the case check if the first run passes vacuously — a vacuous pass here is itself the finding).

- [ ] **Step 3: Add the anchor helpers and rework `find_run`**

In `scripts/ci/gh-run-lib.sh`, add after `head_sha()`:

```bash
# anchor_commits — the commit set this feature's PR owns, newest first, or
# nothing when unanchored. Anchoring is switched on by ACCEPTANCE_SLUG and the
# rule itself lives in scripts/acceptance/own-range.sh; this is a call, not a
# second implementation.
anchor_commits() {
    [ -n "${ACCEPTANCE_SLUG:-}" ] || return 0
    local dir out
    dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../acceptance" && pwd)"
    if ! out="$(bash "$dir/own-range.sh" "$ACCEPTANCE_SLUG")"; then
        echo "could not resolve the commit range owned by '${ACCEPTANCE_SLUG}' — refusing to report a run green" >&2
        exit 2
    fi
    printf '%s\n' "$out" | sed -n 's/^commits=//p' | tr ' ' '\n' | grep -v '^$'
}

# anchor_tip — the commit that plays HEAD's role. Provenance checks compare a
# run's workflow tree against "the tree that got merged"; on a later branch that
# is the anchor, not HEAD.
anchor_tip() {
    local out
    if [ -n "${ACCEPTANCE_SLUG:-}" ]; then
        local dir
        dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../acceptance" && pwd)"
        if ! out="$(bash "$dir/own-range.sh" "$ACCEPTANCE_SLUG")"; then
            echo "could not resolve the anchor tip for '${ACCEPTANCE_SLUG}'" >&2
            exit 2
        fi
        printf '%s' "$(printf '%s\n' "$out" | sed -n 's/^range_to=//p')"
        return 0
    fi
    head_sha
}
```

Split the gh query out of `find_run` so a miss can be retried at the next commit rather than exiting:

```bash
# _run_id_at <workflow-file> <event> <sha> <branch>
# The databaseId of the newest matching run, or EMPTY when there is none. Only a
# gh FAILURE exits 2 here: "looked and found none" is a legitimate answer this
# helper's callers interpret, while "could not look" is not theirs to soften.
_run_id_at() {
    local file="$1" event="$2" sha="$3" branch="$4" args runs
    args=(run list --workflow "$file" --limit 20 --json databaseId,headSha,event,status,conclusion)
    [ -n "$event" ] && args+=(--event "$event")
    [ -n "$sha" ] && args+=(--commit "$sha")
    [ -n "$branch" ] && args+=(--branch "$branch")
    if ! runs="$(gh "${args[@]}")"; then
        echo "gh run list failed for ${file} — refusing to guess" >&2
        exit 2
    fi
    printf '%s' "$runs" | jq -r 'sort_by(.databaseId) | reverse | .[0].databaseId // empty'
}
```

and rewrite `find_run`'s tail (keeping the inline `case "$key"` file resolution exactly as it is, for the documented command-substitution reason):

```bash
    local commits id
    commits="$(anchor_commits)"
    if [ -n "$commits" ]; then
        # Anchored: ask by COMMIT, never by branch. A branch name does not
        # survive the branch being deleted after merge; the commits do. The set
        # matters because different runs of one PR sit on different shas — PR #17
        # has CI at 60c4797 and both dispatch runs at b48699c6.
        local c
        while IFS= read -r c; do
            [ -n "$c" ] || continue
            id="$(_run_id_at "$file" "$event" "$c" "")"
            if [ -n "$id" ]; then
                printf '%s' "$id"
                return 0
            fi
        done <<COMMITS
$commits
COMMITS
        echo "no ${file} run found${event:+ for event ${event}} at any commit of ${ACCEPTANCE_SLUG}'s pull request" >&2
        echo "the workflow must actually have run before this eval can say anything" >&2
        echo "(GitHub deletes runs on its retention schedule; a genuinely expired run is an honest exit 2, not a pass)" >&2
        exit 2
    fi

    id="$(_run_id_at "$file" "$event" "$sha" "$branch")"
    if [ -z "$id" ]; then
        echo "no ${file} run found${event:+ for event ${event}}${sha:+ at commit ${sha}}${branch:+ on branch ${branch}}" >&2
        echo "the workflow must actually have run before this eval can say anything" >&2
        exit 2
    fi
    printf '%s' "$id"
```

In `scripts/ci/check-dispatch-run.sh`, replace the two HEAD-bound lines:

```bash
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
RUN_ID="$(find_run "$KEY" workflow_dispatch "" "$BRANCH")"
```
with
```bash
# Anchored, the branch filter is both useless (the branch may be gone) and wrong
# (it would name the branch we happen to be standing on). find_run ignores the
# branch argument whenever an anchor is present; passing it stays correct for an
# open PR, which is the only case that still needs it.
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
RUN_ID="$(find_run "$KEY" workflow_dispatch "" "$BRANCH")"
TIP="$(anchor_tip)"
```
and change `head_tree="$(git rev-parse --verify "HEAD:.github/workflows")"` to `head_tree="$(git rev-parse --verify "${TIP}:.github/workflows")"`, with the two report lines relabelled from `HEAD` to `${TIP}`.

- [ ] **Step 4: Run the case to verify it passes**

Run: `bash scripts/acceptance/test-own-range.sh no-run-exit2`
Expected: `CASE no-run-exit2: PASS`.

- [ ] **Step 5: Run the live network checks (E9)**

Run:
```bash
ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-run-jobs.sh ci Lint 'Type Check' Build 'SDK Tests (Python)'; echo "run-jobs=$?"
```
then the same for `check-gate-plumbing.sh`, `check-dispatch-run.sh docker`, `check-dispatch-run.sh desktop`. Expected: `0` for all four. Requires `gh` authenticated; a `gh` outage yields exit 2, which is the honest answer, not a pass — record it as such rather than retrying into a green.

- [ ] **Step 6: Prove the commit-set walk is load-bearing (mutation)**

Change the anchored loop to try only the first commit (`break` after the first iteration), then re-run `check-dispatch-run.sh docker` with the anchor.
Expected: exit 2 — the dispatch runs live at `b48699c6`, which is not the newest commit of PR #17. Restore and confirm exit 0. This is the direct evidence that the anchor must be a set.

- [ ] **Step 7: Commit**

```bash
git add scripts/ci/gh-run-lib.sh scripts/ci/check-dispatch-run.sh scripts/acceptance/test-own-range.sh && git commit -m "fix(acceptance): find CI runs by the PR's commit set, not its branch name"
```

---

### Task 5: The GHCR window closes at the anchor

**Files:**
- Modify: `scripts/ci/check-ghcr-untouched.sh`

**Interfaces:**
- Consumes: `anchor_tip()` from Task 4; `own-range.sh` indirectly.
- Produces: nothing new.

**Evals served:** E11 (AC-9). **independent: false**

> Ledger `d-20260804T063003Z-11204` records the retreat condition: if this task's cost outruns its value, it becomes a signed known-limit rather than dragging the contract. Take that exit if the registry half resists — the decisive half (the run log) is unaffected either way.

- [ ] **Step 1: Anchor the provenance comparison**

Replace `if [ "$run_tree" != "$(git rev-parse --verify 'HEAD:.github/workflows')" ]` with a comparison against the tip, matching Task 4's change in the sibling script:

```bash
TIP="$(anchor_tip)"
if [ "$run_tree" != "$(git rev-parse --verify "${TIP}:.github/workflows")" ]; then
    echo "FAIL: this run used a different .github/workflows tree than ${TIP}" >&2
    exit 1
fi
echo "ok  run's workflow tree matches ${TIP}"
```

- [ ] **Step 2: Close the registry window at the anchor's committer date**

The registry half currently asks "any version created at or after the run started?" — an open-ended question that keeps drifting forward and will eventually catch a legitimate later publish and blame this feature. Bound it:

```bash
# The claim is historical: "nothing was published DURING this feature's dry
# run". Left open-ended, the question silently becomes "nothing has been
# published since", which a legitimate release months later would answer
# wrongly, against a feature that had nothing to do with it. UNTIL closes the
# window at the moment the feature landed.
UNTIL=""
if [ -n "${ACCEPTANCE_SLUG:-}" ]; then
    ANCHOR_TIP_SHA="$(anchor_tip)"
    if ! UNTIL="$(git show -s --format=%cI "$ANCHOR_TIP_SHA" 2>/dev/null)"; then
        echo "could not read the committer date of ${ANCHOR_TIP_SHA} — refusing to bound the registry window by guess" >&2
        exit 2
    fi
fi
```

and make the `jq` filter honour it, keeping the unanchored behaviour byte-identical:

```bash
        recent="$(printf '%s' "$body" | jq -r --arg since "$SINCE" --arg until "$UNTIL" '
            [.[] | select(.created_at >= $since) | select($until == "" or .created_at <= $until)]
            | map({created_at, tags: (.metadata.container.tags // [])})
            | .[] | "\(.created_at)  \(.tags | join(","))"
        ')"
```

with the success message extended to name the window: `none between ${SINCE} and ${UNTIL:-now}`.

- [ ] **Step 3: Run it**

Run: `ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-ghcr-untouched.sh; echo "ghcr=$?"`
Expected: `ghcr=0`, with the log half reporting `ok runner resolved 'push: false'` and the registry half reporting either the bounded window or the documented "token cannot read packages" non-answer.

- [ ] **Step 4: Verify the window is real**

Run: `ACCEPTANCE_SLUG=ci-actions-bump bash -c 'set -a; . /dev/null; bash scripts/ci/check-ghcr-untouched.sh' 2>&1 | grep -E 'between|no GHCR package|cannot read packages'`
Expected: one line naming the closed window or the documented non-answer. If the registry half is a non-answer for token reasons, record that in the evidence — it is the pre-existing, documented behaviour, not a regression introduced here.

- [ ] **Step 5: Commit**

```bash
git add scripts/ci/check-ghcr-untouched.sh && git commit -m "fix(acceptance): bound the GHCR cross-check to the dry run's own window"
```

---

### Task 6: Backfill the anchors and wire the slugs

**Files:**
- Modify: `_acceptance/dependency-refresh-2026-07/contract.md`
- Modify: `_acceptance/oneflow-plugin-prefix/contract.md`
- Modify: `_acceptance/config.yaml`
- Modify: `scripts/acceptance/test-own-range.sh` (append `case_backfill_integration`)

**Interfaces:**
- Consumes: everything above.
- Produces: the three features' own executor keys, anchored.

**Evals served:** E12 (AC-11), and it is what makes E7 fully green. **independent: false**

- [ ] **Step 1: Write the failing integration case**

Append to `scripts/acceptance/test-own-range.sh`:

```bash
case_backfill_integration() {
  # AC-11 / E12 — OFFLINE ONLY, three assertions named individually so a case
  # that never ran cannot hide behind a shared exit code (stale-scope-by-paths#F1).
  # The network guards of ci-actions-bump belong to E9/E11 and are deliberately
  # absent here.
  set -- "ci-actions-bump 8477f8a" "dependency-refresh-2026-07 4d89b58" "oneflow-plugin-prefix dd39da8"
  for pair in "$@"; do
    slug="${pair%% *}"; want="${pair##* }"
    # (1) every anchor resolves
    out="$(bash "$RESOLVER" "$slug" --root "$ROOT")" \
      || fail backfill-integration "own-range.sh could not resolve the anchor of '$slug'"
    got="$(field "$out" range_to)"
    [ "$got" = "$(git -C "$ROOT" rev-parse "$want")" ] \
      || fail backfill-integration "$slug resolves to $got, expected $want"
    # (2) the feature's own executor keys carry the slug
    grep -F "ACCEPTANCE_SLUG=$slug" "$ROOT/_acceptance/config.yaml" >/dev/null \
      || fail backfill-integration "config.yaml has no ACCEPTANCE_SLUG=$slug — the guards would run unanchored"
  done
  # (3) the three B1 guards, anchored, on this branch
  ( cd "$ROOT" && ACCEPTANCE_SLUG=oneflow-plugin-prefix bash scripts/plugins/check-no-config-drift.sh >/dev/null 2>&1 ) \
    || fail backfill-integration "check-no-config-drift is not green under its own anchor"
  ( cd "$ROOT" && ACCEPTANCE_SLUG=dependency-refresh-2026-07 bash scripts/deps/check-no-t3-drift.sh >/dev/null 2>&1 ) \
    || fail backfill-integration "check-no-t3-drift is not green under its own anchor"
  ( cd "$ROOT" && ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-workflow-drift.sh >/dev/null 2>&1 ) \
    || fail backfill-integration "check-workflow-drift is not green under its own anchor"
  pass backfill-integration
}
```

- [ ] **Step 2: Run to verify it fails**

Run: `bash scripts/acceptance/test-own-range.sh backfill-integration`
Expected: FAIL `own-range.sh could not resolve the anchor of 'dependency-refresh-2026-07'` — only `ci-actions-bump` was anchored in Task 1.

- [ ] **Step 3: Write the two remaining anchors**

Add to the frontmatter of `_acceptance/dependency-refresh-2026-07/contract.md`:

```yaml
landed_merge: 4d89b58
```

and to `_acceptance/oneflow-plugin-prefix/contract.md`:

```yaml
landed_merge: dd39da8
```

- [ ] **Step 4: Wire `ACCEPTANCE_SLUG` into the features' own executor keys**

In `_acceptance/config.yaml`, prefix each of these existing values (the ones the three features' evals actually reference):

```yaml
    deps_no_t3_drift: "ACCEPTANCE_SLUG=dependency-refresh-2026-07 bash scripts/deps/check-no-t3-drift.sh origin/main"
    ci_gate_plumbing: "ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-gate-plumbing.sh"
    ci_jobs_green: "ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-run-jobs.sh ci Lint 'Type Check' Build 'SDK Tests (Python)'"
    ci_docker_dispatch_green: "ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-dispatch-run.sh docker"
    ci_ghcr_untouched: "ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-ghcr-untouched.sh"
    ci_desktop_dispatch_green: "ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-dispatch-run.sh desktop"
    ci_no_behaviour_drift: "ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-workflow-drift.sh origin/main"
    prefix_no_config_drift: "ACCEPTANCE_SLUG=oneflow-plugin-prefix bash scripts/plugins/check-no-config-drift.sh origin/main"
```

The eleven keys committed at Gate 1 already contain the literal `test-own-range.sh <case>` / `test-scope-namespace.sh <case>` strings the `case-completeness` grep looks for. Two cases are **not** yet wired — add exactly these, and nothing else (each case gets its own key, per the repo's one-case-one-key rule):

```yaml
    own_range_case_completeness: bash scripts/acceptance/test-own-range.sh case-completeness
    scope_ns_case_completeness: bash scripts/acceptance/test-scope-namespace.sh case-completeness
```

Then re-check the mapping: `gate_ns_exempt_refused` → `exempt-refused`, `gate_ns_variants_red` → `variants-discriminating`, `gate_ns_legit_granted` → `legit-granted`, `own_range_anchored|unlanded|malformed` → `anchored|unlanded|malformed`, `b1_violation_red` → `b1-red`, `b2_no_run_exit2` → `no-run-exit2`, `b1_unanchored_compat` → `unanchored-compat`, `anchors_backfilled` → `backfill-integration`. A key whose value does not contain its case name verbatim makes `case-completeness` red — fix the value, never the grep; the grep is the guard.

These two new keys are additions to `evals.yaml`'s coverage of AC-2/AC-12 as machine-run self-checks, not new ACs: `case-completeness` is the guard that keeps every other case honest, so it must run, but it maps to no criterion of its own. Wire it in `config.yaml` and run it in the verify round without adding an eval entry.

- [ ] **Step 5: Run the integration case**

Run: `bash scripts/acceptance/test-own-range.sh backfill-integration && bash scripts/acceptance/test-own-range.sh case-completeness && bash scripts/acceptance/test-scope-namespace.sh case-completeness`
Expected: three PASS lines.

- [ ] **Step 6: Run the full contract suite**

Run every eval key of this contract, plus the three previously-red repro commands:
```bash
for c in exempt-refused variants-discriminating legit-granted case-completeness; do bash scripts/acceptance/test-scope-namespace.sh $c || break; done
for c in anchored unlanded malformed b1-red no-run-exit2 unanchored-compat backfill-integration case-completeness; do bash scripts/acceptance/test-own-range.sh $c || break; done
```
Expected: 12 PASS lines, no FAIL.

- [ ] **Step 7: Verify the gate itself still passes and nothing regressed**

Run: `bash scripts/pre-merge-check.sh --base origin/main; echo "gate=$?"` and `pnpm lint:check && pnpm typecheck`
Expected: the gate reports its usual verdict with no new violation attributable to this change; lint and typecheck clean (this contract touches no TypeScript, so a failure here is a pre-existing condition to report, not to absorb).

- [ ] **Step 8: Commit**

```bash
git add _acceptance/ scripts/acceptance/test-own-range.sh && git commit -m "feat(acceptance): backfill landed_merge anchors for the three stuck features"
```

---

## Self-Review

**Spec coverage.** Design §Nửa (a) → Task 2. §Bộ giải → Task 1. §B1 → Task 3. §B2 → Task 4. §check-ghcr-untouched → Task 5. §Backfill → Task 6. All 12 ACs have a task: AC-1/2/3 → T2, AC-4/5/6 → T1, AC-7 → T3, AC-8 → T4, AC-9 → T5, AC-10 → T4, AC-11 → T6, AC-12 → T3 (B1 half) + T4 (gh-run-lib half).

**Discovered during planning, folded in:** `check-dispatch-run.sh` and `check-ghcr-untouched.sh` also compare the run's workflow tree against `HEAD:`, which anchoring must move to the anchor tip — the design doc did not mention it, so `anchor_tip()` was added to Task 4's interface. Verified today that all four candidate trees are currently identical (`c2bd8c6`), so this change is semantically necessary but not currently load-bearing; it is not a source of false green.

**Type/name consistency.** `own-range.sh` prints exactly `range_from=` / `range_to=` / `commits=`; Tasks 3–6 read those three names and no others. `ACCEPTANCE_SLUG` is the only switch. `anchor_commits()` / `anchor_tip()` are defined once in `gh-run-lib.sh` and used in Tasks 4 and 5.

**Known soft spot.** Task 2's `case_variants_discriminating` v2 (prefix) perturbation is the least certain construction in this plan — a `sed` against `match_globs`'s `case` line may not reproduce the historical bug cleanly. If it cannot be made to discriminate, replace it with the same delegation used for v3/v4 (assert `check-stale-scoping.sh --case indent-drift` and `--case mutation` remain wired) and say so in the evidence rather than shipping a perturbation that passes vacuously.
