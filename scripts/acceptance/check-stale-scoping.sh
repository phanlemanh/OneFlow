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

KNOWN_CASES="in-scope out-of-scope partial under-declared malformed indent-drift merged-halves two-bases suppression announce mutation case-completeness guard-not-exempt no-kill-switch"

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

# mk_pair_fixture <dir> <slug1> <slug2>
# Two independently narrow-scoped features (paths cover src/covered/** only)
# sharing ONE repo — for guards that assert one feature's cross-check cannot
# be tripped by a change confined to the OTHER feature's artifacts (regex-slug
# confusion, trailing-slash anchoring).
#
# Deliberately does NOT bind its first parameter to a variable named "d" —
# callers that already hold their own fixture dir in "$d" (with a
# `trap 'rm -rf "$d"' RETURN` registered against it) would have that trap
# silently retargeted to whatever this function's "d" is reassigned to,
# since the trap's "$d" is expanded at RETURN time, not at registration time.
mk_pair_fixture() {
  pf_dir="$1"; s1="$2"; s2="$3"
  mkdir -p "$pf_dir/_acceptance/$s1" "$pf_dir/_acceptance/$s2" "$pf_dir/src/covered" "$pf_dir/src/uncovered"
  cat > "$pf_dir/_acceptance/config.yaml" <<CFG
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
  for s in "$s1" "$s2"; do
    cat > "$pf_dir/_acceptance/$s/contract.md" <<CON
---
schema_version: 1
feature: fixture
slug: $s
risk_tier: T2
status: signed-off
approved_by: Fixture
---
# Acceptance Contract: $s
CON
    cat > "$pf_dir/_acceptance/$s/evals.yaml" <<EV
schema_version: 1
feature_slug: $s
evals:
  - id: E1
    criterion: AC-1
    executor: test
    cmd: config:executors.test.unit
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    executor: test
    cmd: config:executors.test.unit
    paths: ["src/covered/**"]
EV
    echo '{}' > "$pf_dir/_acceptance/$s/run-log.jsonl"
  done
  (
    cd "$pf_dir"
    git init -q .
    git config user.email fixture@example.com
    git config user.name Fixture
    echo seed > src/covered/seed.txt
    echo seed > src/uncovered/seed.txt
    git add -A
    git commit -q -m "fixture base"
  )
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
  #
  # Reuse match_globs() from the gate instead of hand-rolling a second glob
  # matcher: `case` pattern semantics differ between shells, and a private
  # copy would silently drift from what the gate actually does. Extracting
  # only the function body (not sourcing/executing the whole gate script,
  # which has side effects and calls exit) keeps this guard tested against
  # the exact matcher the gate ships.
  match_globs_src="$(sed -n '/^match_globs()/,/^}/p' "$GATE")"
  [ -n "$match_globs_src" ] || fail guard-not-exempt "could not extract match_globs() from $GATE"
  eval "$match_globs_src"

  globs="$(sed -n '/^  t1_skip_globs:/,/^  [a-zA-Z0-9_-]*:/p' "$ROOT/_acceptance/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//")"
  [ -n "$globs" ] || fail guard-not-exempt "could not read t1_skip_globs"

  self="scripts/acceptance/check-stale-scoping.sh"
  if match_globs "$self" "$globs"; then
    fail guard-not-exempt "$self is exempt via a t1_skip_globs entry"
  fi
  # Sanity: the matcher must actually match something, or the check above
  # proves nothing. A path that IS exempt has to be seen as exempt.
  known_exempt="scripts/pre-merge-check.sh"
  if ! match_globs "$known_exempt" "$globs"; then
    fail guard-not-exempt "matcher matched nothing — check is vacuous"
  fi
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

case_indent_drift() {
  # E-indent-drift: an eval whose leading whitespace drifts from the canonical
  # 2/4-space indent (an ordinary typo, or a literal tab) must not become
  # invisible to BOTH feature_scope() counters at once — that lets n_evals and
  # n_paths coincide by accident, feature_scope returns 0 ("complete"), and the
  # drifted eval's total absence of a `paths` declaration goes unnoticed.
  #
  # Reuse feature_scope() from the gate instead of hand-rolling a second
  # parser, the same way case_guard_not_exempt reuses match_globs(): a private
  # copy would silently drift from what the gate actually does. Extracting
  # only the function body (not sourcing/executing the whole gate script,
  # which has side effects and calls exit) keeps this guard tested against the
  # exact parser the gate ships.
  feature_scope_src="$(sed -n '/^feature_scope()/,/^}/p' "$GATE")"
  [ -n "$feature_scope_src" ] || fail indent-drift "could not extract feature_scope() from $GATE"
  eval "$feature_scope_src"

  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN

  # Space-drift variant: E1 canonically indented and declares paths; E2
  # drifted to a 3-space "- id:" / "criterion:" pair and declares none.
  cat > "$d/space-drift.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
   - id: E2
     criterion: AC-2
YAML
  out="$(feature_scope "$d/space-drift.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "space-drifted eval was invisible to both counters — feature_scope returned 0 (globs: $out)"

  # Tab-drift variant: same shape, drifted line prefixed with a literal tab
  # instead of an odd space count.
  printf 'schema_version: 1\nfeature_slug: fx\nevals:\n  - id: E1\n    paths: ["src/covered/**"]\n\t- id: E2\n\tcriterion: AC-2\n' \
    > "$d/tab-drift.yaml"
  out="$(feature_scope "$d/tab-drift.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "tab-drifted eval was invisible to both counters — feature_scope returned 0 (globs: $out)"

  # Block-scalar decoy: E2 declares no `paths`, but its `expected: |` block
  # scalar contains a prose line that reads "paths: [...]" at the SAME
  # indentation an eval-level declaration would use. A parser that counts
  # `paths:` occurrences without excluding block-scalar bodies mistakes that
  # prose for a declaration and folds its glob into the union.
  cat > "$d/block-scalar-decoy.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    expected: |
    exit 0; decoy prose at eval-key indentation:
    paths: ["src/decoy/**"]
    must not be read as a declaration
YAML
  out="$(feature_scope "$d/block-scalar-decoy.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "block-scalar decoy 'paths:' prose was counted as a declaration — feature_scope returned 0 (globs: $out)"

  # Top-level-key decoy: a feature-level `paths:` key that is a sibling of
  # `evals:` (not under any eval item) must not be counted toward
  # completeness or joined into the union — E2 below declares no `paths` of
  # its own.
  cat > "$d/toplevel-key-decoy.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
paths: ["src/decoy/**"]
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
YAML
  out="$(feature_scope "$d/toplevel-key-decoy.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "feature-level top-level 'paths:' key was counted as an eval declaration — feature_scope returned 0 (globs: $out)"

  # Multi-line array: E2's `paths:` opens a bracket array but its globs
  # continue on following lines, closing on a THIRD line. A line-based
  # extractor cannot read continuation lines, so a parser that counts this
  # opening line toward completeness (matching only the prefix, not
  # requiring the closing `]` on the same line) reaches a false "complete"
  # reading while contributing zero globs for E2 — the exact defect this
  # case guards against regressing.
  cat > "$d/multiline-array.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    paths: [
      "src/extra/**",
      "src/more/**"
    ]
YAML
  out="$(feature_scope "$d/multiline-array.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "multi-line 'paths:' array was counted as a complete declaration — feature_scope returned 0 (globs: $out)"

  # Same shape, but the multi-line array is the ONLY eval in the file — this
  # used to return non-zero already, but for the wrong reason (the union
  # came out empty, tripping the LAST-resort "zero globs" check). Assert the
  # actual completeness check (n_evals vs n_paths) is what refuses it, not
  # an accidental empty union: a file with a real second declared eval whose
  # globs happened to overlap would otherwise slip through.
  cat > "$d/multiline-array-only.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: [
      "src/extra/**",
      "src/more/**"
    ]
YAML
  out="$(feature_scope "$d/multiline-array-only.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "multi-line 'paths:' array as the only eval was counted as a complete declaration — feature_scope returned 0 (globs: $out)"

  # Trailing inline comment: `paths: [...] # note` must yield the clean glob
  # with the comment stripped, not a garbage glob with "# note" appended.
  # This is the success-path counterpart to the two cases above: the file IS
  # a complete, single-line declaration, so feature_scope must accept it
  # (rc 0) and the emitted union must contain no "#" fragment.
  cat > "$d/trailing-comment.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"] # note
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/trailing-comment.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "single-line 'paths:' array with a trailing comment was refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -q '#' \
    && fail indent-drift "trailing comment leaked into the emitted glob union: $out"
  printf '%s\n' "$out" | grep -qx 'src/covered/\*\*' \
    || fail indent-drift "expected clean glob 'src/covered/**' missing from union: $out"

  # Bracket-class glob: a glob containing `]` (from a character class like
  # `foo[0-9]`) must survive intact — this is the defect that shipped four
  # rounds in a row: `[^]]*` (or any bracket-splitting extractor) stops at the
  # FIRST `]`, truncating the glob and dropping every sibling after it.
  cat > "$d/bracket-glob.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/foo[0-9]/**", "src/bar/**"]
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/bracket-glob.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "bracket-class glob declaration was refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -qx 'src/foo\[0-9\]/\*\*' \
    || fail indent-drift "bracket-class glob truncated or missing from union: $out"
  printf '%s\n' "$out" | grep -qx 'src/bar/\*\*' \
    || fail indent-drift "sibling glob after a bracket-class glob was dropped from union: $out"

  # Single-quoted items: not the accepted grammar — refused, not tolerated.
  cat > "$d/single-quoted.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ['src/a/**']
YAML
  out="$(feature_scope "$d/single-quoted.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "single-quoted paths items were accepted — feature_scope returned 0 (globs: $out)"

  # Nested array: not the accepted grammar — refused, not tolerated.
  cat > "$d/nested-array.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: [["a"], "b"]
YAML
  out="$(feature_scope "$d/nested-array.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "nested array paths was accepted — feature_scope returned 0 (globs: $out)"

  # Trailing non-comment suffix: anything after `]` that is not a `#`
  # comment must be refused, not silently ignored.
  cat > "$d/trailing-junk.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["a"] junk
YAML
  out="$(feature_scope "$d/trailing-junk.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "trailing non-comment suffix after ']' was accepted — feature_scope returned 0 (globs: $out)"

  # Hyphenated-key block-scalar decoy: a key-name allow-list (e.g.
  # `[a-zA-Z_]*:`) never matches `expected-output:`, so its block-scalar body
  # is read as ordinary content and a decoy `paths:` line inside it is
  # mistaken for a real declaration. The guard must refuse the whole file
  # structurally (by "value starts with `|`/`>`"), regardless of the key
  # spelling.
  cat > "$d/hyphen-key-block-scalar.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    expected-output: |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/hyphen-key-block-scalar.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "hyphenated-key ('expected-output:') block-scalar decoy was not refused — feature_scope returned 0 (globs: $out)"

  # Digit-suffixed-key variant of the same bypass: `note2:` is equally
  # outside any letter-only allow-list.
  cat > "$d/digit-key-block-scalar.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    note2: |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/digit-key-block-scalar.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "digit-suffixed-key ('note2:') block-scalar decoy was not refused — feature_scope returned 0 (globs: $out)"

  # Single-line value containing `>` after the colon, but NOT as the first
  # character of the value: must NOT be refused. This is the other direction
  # of the same check — the block-scalar guard must key off the indicator
  # being the START of the value, not merely present somewhere on the line.
  cat > "$d/value-contains-gt.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    expected: "exit 0; a > b"
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/value-contains-gt.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "a single-line value merely containing '>' after the colon was wrongly refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -qx 'src/covered/\*\*' \
    || fail indent-drift "expected glob 'src/covered/**' missing from union: $out"
  printf '%s\n' "$out" | grep -qx 'src/more/\*\*' \
    || fail indent-drift "expected glob 'src/more/**' missing from union: $out"

  # Colon-in-key decoy (the live Critical this round closes): a quoted key
  # whose OWN text contains a colon (`"note: x":`) defeats an extractor that
  # anchors the block-scalar guard on the FIRST colon in the line — it lands
  # mid-key instead of at the key's true end, reads the rest of the line as
  # if it were the value, and never recognizes the `|` that follows as a
  # block-scalar indicator. The prose beneath it (including a decoy
  # `paths:` line) then leaks straight into either counter.
  cat > "$d/colon-in-key.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
  - id: E2
    "note: x": |
    decoy:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/colon-in-key.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "colon-in-key decoy ('\"note: x\":') was not refused — feature_scope returned 0 (globs: $out)"

  # Quoted key: not a shape this line-based parser can read reliably (is the
  # key `expected`, or is the key `"expected"` — a different string?) — must
  # be refused structurally, not tolerated as if unquoting were free.
  cat > "$d/quoted-key.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
  - id: E2
    "expected": |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/quoted-key.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "quoted key ('\"expected\":') was not refused — feature_scope returned 0 (globs: $out)"

  # Key with an embedded space: `my key: |` is not `[A-Za-z_][A-Za-z0-9_-]*:`
  # and must be refused rather than treated as some normalized key name.
  cat > "$d/space-in-key.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    paths: ["src/covered/**"]
  - id: E2
    my key: |
    decoy prose:
    paths: ["src/decoy/**"]
YAML
  out="$(feature_scope "$d/space-in-key.yaml")"; rc=$?
  [ "$rc" -ne 0 ] \
    || fail indent-drift "key with an embedded space ('my key:') was not refused — feature_scope returned 0 (globs: $out)"

  # Hyphenated key with a single-line (non-block-scalar) value: must NOT be
  # refused. This is the positive counterpart to the key-grammar checks
  # above — a legal, ordinary eval-level key that merely happens to be
  # kebab-case, with every eval in the file declaring real `paths`, must
  # still be accepted and its `paths` still joined into the union.
  cat > "$d/hyphen-key-singleline.yaml" <<'YAML'
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    extra-note: "hello"
    paths: ["src/covered/**"]
  - id: E2
    criterion: AC-2
    paths: ["src/more/**"]
YAML
  out="$(feature_scope "$d/hyphen-key-singleline.yaml")"; rc=$?
  [ "$rc" -eq 0 ] \
    || fail indent-drift "hyphenated key with a single-line value ('extra-note: \"hello\"') was wrongly refused — feature_scope returned $rc"
  printf '%s\n' "$out" | grep -qx 'src/covered/\*\*' \
    || fail indent-drift "expected glob 'src/covered/**' missing from union: $out"
  printf '%s\n' "$out" | grep -qx 'src/more/\*\*' \
    || fail indent-drift "expected glob 'src/more/**' missing from union: $out"

  pass indent-drift
}

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
  #
  # The report is committed on its own, and --base is taken AFTER that commit
  # (not at the same commit the report's own verified_commit points to), so
  # this feature's _acceptance/fx/ is NOT part of the PR diff the Task-6
  # cross-check inspects (case_merged_halves' "half A" shape). That isolates
  # what this case exists to prove — an out-of-declared-scope change alone
  # does not stale the feature — from the cross-check, which is a separate
  # concern exercised by case_under_declared / case_merged_halves / case_two_bases.
  d="$(mktemp -d)"; trap 'rm -rf "$d"' RETURN
  mk_fixture "$d" fx narrow
  vc="$(git -C "$d" rev-parse HEAD)"
  write_report "$d" fx "$vc"
  ( cd "$d" && git add -A && git commit -q -m report )
  base="$(git -C "$d" rev-parse HEAD)"
  ( cd "$d" && echo drift > src/uncovered/new.txt && git add -A && git commit -q -m drift )
  out="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$out" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    && fail out-of-scope "out-of-union change still staled the feature: $out"
  printf '%s\n' "$out" | grep -q 'OK \[fx\]' \
    || fail out-of-scope "feature not reported OK: $out"
  # No over-refusal (Task 6): "narrow" mode's paths ("src/covered/**") DO
  # match a tracked file (src/covered/seed.txt, seeded by mk_fixture) — the
  # match-nothing guard must not misfire on a legitimately-matching
  # declaration and fall back to whole-tree scope.
  printf '%s\n' "$out" | grep -q 'match no tracked file' \
    && fail out-of-scope "match-nothing guard wrongly refused a declaration whose globs DO match a tracked file: $out"
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
  # Match the cross-check's OWN wording ("do not cover"), not a bare
  # "uncovered" substring — half A's own drift file lives under
  # src/uncovered/, so a path-name match would misfire on that filename
  # inside the (unrelated) T1-escape PR-level NOTE/VIOLATION, not on
  # whether the cross-check itself actually ran.
  printf '%s\n' "$outA" | grep -qi 'do not cover' \
    && fail merged-halves "half A: cross-check ran despite artifacts absent from the PR diff: $outA"
  # Half B: same feature, artifacts IN the PR diff → cross-check runs.
  ( cd "$d" && echo touched >> _acceptance/fx/run-log.jsonl && git add -A && git commit -q -m "artifact touch" )
  outB="$(bash "$GATE" "$d" --base "$base" 2>&1)"
  printf '%s\n' "$outB" | grep -qi 'do not cover' \
    || fail merged-halves "half B: cross-check did not run with artifacts in the PR diff: $outB"

  # Half C: no PR base at all. There is no coverage set to cross-check the
  # declaration against — an empty BASE_SHA must NEVER be read as
  # "declaration covers everything"; it must fall back to whole-tree
  # staleness (the working tree still carries the Half-A drift file, which
  # sits outside this feature's declared "narrow" scope) rather than
  # silently reporting OK.
  outC="$(bash "$GATE" "$d" 2>&1)"
  printf '%s\n' "$outC" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail merged-halves "half C: no PR base did not fall back to whole-tree staleness: $outC"
  printf '%s\n' "$outC" | grep -q 'OK \[fx\]' \
    && fail merged-halves "half C: no PR base wrongly reported OK: $outC"

  # Half D: same as Half C but with an UNRESOLVABLE --base — must fail closed
  # exactly like the missing-base case, not be treated any more permissively
  # just because a ref string was supplied.
  outD="$(bash "$GATE" "$d" --base bogus-ref-xyz-does-not-exist 2>&1)"
  printf '%s\n' "$outD" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail merged-halves "half D: unresolvable PR base did not fall back to whole-tree staleness: $outD"
  printf '%s\n' "$outD" | grep -q 'OK \[fx\]' \
    && fail merged-halves "half D: unresolvable PR base wrongly reported OK: $outD"

  # Half E / regex-slug isolation: two features whose slugs are
  # regex-metacharacter look-alikes — "a.b" (where "." is a wildcard) and
  # "axb" (a string the wildcard would match against) — share one repo.
  # Touching only axb's artifacts must not trip a.b's cross-check: a slug
  # interpolated unescaped into a grep PATTERN lets "." match any character,
  # so "^_acceptance/a.b/" would also match "_acceptance/axb/". A git
  # pathspec is a literal path, not a pattern, and cannot be confused this way.
  e="$(mktemp -d)"
  mk_pair_fixture "$e" a.b axb
  evc="$(git -C "$e" rev-parse HEAD)"
  write_report "$e" a.b "$evc"
  write_report "$e" axb "$evc"
  ( cd "$e" && git add -A && git commit -q -m report )
  ebase="$(git -C "$e" rev-parse HEAD)"
  # The PR touches only axb's artifacts, plus a code change outside declared
  # scope so the cross-check — if it wrongly ran for a.b too — would have
  # something to flag as "not covered".
  ( cd "$e" && echo touched >> _acceptance/axb/run-log.jsonl && echo drift > src/uncovered/new.txt \
      && git add -A && git commit -q -m "pr touches axb only" )
  outE="$(bash "$GATE" "$e" --base "$ebase" 2>&1)"
  rm -rf "$e"
  printf '%s\n' "$outE" | grep -q 'NOTE \[a\.b\]: declared eval paths' \
    && fail merged-halves "regex-slug: touching only axb's artifacts tripped a.b's cross-check: $outE"
  printf '%s\n' "$outE" | grep -q 'OK \[a\.b\]' \
    || fail merged-halves "regex-slug: a.b was not reported OK despite its own artifacts being untouched: $outE"
  printf '%s\n' "$outE" | grep -q 'NOTE \[axb\]: declared eval paths' \
    || fail merged-halves "regex-slug: axb's own cross-check did not run: $outE"

  # Half F / trailing-slash anchoring: "fx" vs "fx-extra" — the anchoring the
  # old grep pattern relied on (`^_acceptance/$slug/`, trailing slash) must
  # still hold now that the check uses a pathspec instead. Touching only
  # fx-extra's artifacts must not trip fx's cross-check.
  g="$(mktemp -d)"
  mk_pair_fixture "$g" fx fx-extra
  gvc="$(git -C "$g" rev-parse HEAD)"
  write_report "$g" fx "$gvc"
  write_report "$g" fx-extra "$gvc"
  ( cd "$g" && git add -A && git commit -q -m report )
  gbase="$(git -C "$g" rev-parse HEAD)"
  ( cd "$g" && echo touched >> _acceptance/fx-extra/run-log.jsonl && echo drift > src/uncovered/new.txt \
      && git add -A && git commit -q -m "pr touches fx-extra only" )
  outF="$(bash "$GATE" "$g" --base "$gbase" 2>&1)"
  rm -rf "$g"
  printf '%s\n' "$outF" | grep -q 'NOTE \[fx\]: declared eval paths' \
    && fail merged-halves "trailing-slash: touching only fx-extra's artifacts tripped fx's cross-check: $outF"
  printf '%s\n' "$outF" | grep -q 'OK \[fx\]' \
    || fail merged-halves "trailing-slash: fx was not reported OK despite its own artifacts being untouched: $outF"
  printf '%s\n' "$outF" | grep -q 'NOTE \[fx-extra\]: declared eval paths' \
    || fail merged-halves "trailing-slash: fx-extra's own cross-check did not run: $outF"

  # Half G / vacuous cross-check (Task 6 finding): a declaration whose globs
  # match NO tracked file must never earn narrow scope permanently just
  # because the PR that introduces it happens to touch nothing but its own
  # _acceptance/<slug>/ — an empty coverage set makes scope_gaps() pass
  # VACUOUSLY (nothing in the diff to flag as "not covered"), so without a
  # separate match-nothing check the declaration is accepted once and then
  # silently hides every future change forever, because every later PR that
  # changes real code without touching _acceptance/<slug>/ skips the
  # cross-check entirely and stale_files() scoped to a match-nothing glob
  # filters the real change straight out.
  h="$(mktemp -d)"
  mkdir -p "$h/src/covered"
  (
    cd "$h"
    git init -q .
    git config user.email fixture@example.com
    git config user.name Fixture
    mkdir -p _acceptance
    cat > _acceptance/config.yaml <<CFG
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
    echo seed > src/covered/seed.txt
    git add -A
    git commit -q -m "repo base, no feature yet"
  )
  hbase0="$(git -C "$h" rev-parse HEAD)"
  mkdir -p "$h/_acceptance/fx"
  cat > "$h/_acceptance/fx/contract.md" <<CON
---
schema_version: 1
feature: fixture
slug: fx
risk_tier: T2
status: signed-off
approved_by: Fixture
---
# Acceptance Contract: fx
CON
  # Match-nothing declaration: "nonexistent-dir/**" cannot match anything
  # tracked in this fixture repo (only src/covered/** and _acceptance/** exist).
  cat > "$h/_acceptance/fx/evals.yaml" <<YAML
schema_version: 1
feature_slug: fx
evals:
  - id: E1
    criterion: AC-1
    executor: test
    cmd: config:executors.test.unit
    paths: ["nonexistent-dir/**"]
  - id: E2
    criterion: AC-2
    executor: test
    cmd: config:executors.test.unit
    paths: ["nonexistent-dir/**"]
YAML
  echo '{}' > "$h/_acceptance/fx/run-log.jsonl"
  ( cd "$h" && git add -A && git commit -q -m "introduce fx with match-nothing paths" )
  hvc="$(git -C "$h" rev-parse HEAD)"
  write_report "$h" fx "$hvc"
  ( cd "$h" && git add -A && git commit -q -m "evidence report" )
  hpr1="$(git -C "$h" rev-parse HEAD)"

  # PR1: base is BEFORE fx existed at all — the coverage set (hbase0...HEAD)
  # is only _acceptance/fx/* (excluded from scope_gaps by construction), so
  # it is empty and the cross-check passes vacuously. This mirrors the
  # reported repro exactly: "a PR touching only the feature's own
  # _acceptance/<slug>/ → OK [fx]".
  outG1="$(bash "$GATE" "$h" --base "$hbase0" 2>&1)"
  printf '%s\n' "$outG1" | grep -q 'OK \[fx\]' \
    || fail merged-halves "vacuous-pass setup: PR introducing a match-nothing declaration was not reported OK: $outG1"

  # PR2: real code change, feature artifacts UNTOUCHED — the cross-check does
  # not even run here (declaration unchanged since hpr1), so only a guard
  # that applies regardless of whether the cross-check ran can catch this.
  ( cd "$h" && echo drift > src/covered/new.txt && git add -A && git commit -q -m "real code change" )
  outG2="$(bash "$GATE" "$h" --base "$hpr1" 2>&1)"
  rm -rf "$h"
  printf '%s\n' "$outG2" | grep -q 'VIOLATION \[fx\]: evidence is stale' \
    || fail merged-halves "match-nothing declaration hid a later real code change from staleness: $outG2"
  printf '%s\n' "$outG2" | grep -q 'src/covered/new.txt' \
    || fail merged-halves "match-nothing declaration: stale file not named: $outG2"

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
