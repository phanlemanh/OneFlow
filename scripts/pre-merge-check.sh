#!/usr/bin/env bash
# pre-merge-check.sh — CI gate for the Acceptance-Gate Kit.
#
# Usage: pre-merge-check.sh [repo_root] [--slug <slug>]... [--base <ref>]
#
# --base <ref> (or env PRE_MERGE_BASE): the PR base for the T1-escape
# backstop — changed files matching risk_tiers.t3_paths, or falling outside
# t1_skip_globs, require the PR to carry _acceptance/<slug>/ artifacts.
# Without a base the backstop is skipped with a NOTE (wire it in CI, e.g.
# GitHub Actions: --base "origin/$GITHUB_BASE_REF").
#
# For every feature in _acceptance/ whose contract has status
# implemented|verified|signed-off and risk_tier T2|T3:
#   - Gate 1 was recorded: approved_by non-empty, or gate1_skipped: true
#     (the audited escape hatch — NOTEd, not blocked)
#   - evidence-report.md must exist
#   - overall verdict must be PASS
#   - the PASS was actually gated: bypass_used not true (unless a human
#     recorded bypass_ack) and enforcement_mode not off (warn only warns)
#   - human_signoff must be non-empty
#   - the evidence is not STALE: when the report carries verified_commit
#     (the tree the verifier actually ran on), no non-gate file — outside
#     _acceptance/ and not matching risk_tiers.t1_skip_globs — may have
#     changed since that commit (committed or in the working tree). A report
#     without verified_commit (older template) only gets a NOTE.
#   - (recheck: strict) the committed evidence still passes the gate's own
#     L1/L2/L3 bar, re-checked via scripts/recheck-evidence.js + lib/evidence-core.js
#     (the same core the hook runs) — catches a report hand-edited after the
#     write-time hook, or written under ACCEPTANCE_GATE_BYPASS. Default `warn`
#     only advises (so legacy reports from older templates don't block adopters);
#     `off` skips it. Set `recheck: strict` in _acceptance/config.yaml to enforce.
# Exits 1 listing violations; 0 when clean. T1 and draft/approved
# (pre-implementation) features are out of scope.
set -u

# CI evidence re-checker shipped alongside this script (needs ../lib/evidence-core.js).
HERE="$(cd "$(dirname "$0")" && pwd)"
RECHECK="$HERE/recheck-evidence.js"

ROOT="."
SLUGS=()
BASE="${PRE_MERGE_BASE:-}"
while [ $# -gt 0 ]; do
  case "$1" in
    --slug)
      [ $# -ge 2 ] || { echo "pre-merge-check: --slug requires a value" >&2; exit 2; }
      SLUGS+=("$2"); shift 2 ;;
    --base)
      [ $# -ge 2 ] || { echo "pre-merge-check: --base requires a value" >&2; exit 2; }
      BASE="$2"; shift 2 ;;
    *) ROOT="$1"; shift ;;
  esac
done

ACC="$ROOT/_acceptance"
[ -d "$ACC" ] || { echo "pre-merge-check: no _acceptance/ — nothing to check"; exit 0; }

# Which tiers need a signed report before merge — from consumer config when
# present (signoff.required_for), defaulting to T2+T3.
REQUIRED_FOR="T2 T3"
# Committed-evidence re-check mode: strict (block) | warn (advise, default) | off.
# Default warn so adopting the re-check never blocks merges over reports written by
# an OLDER evidence template — a repo opts into strict once its reports meet the bar.
RECHECK_MODE="warn"
# t1_skip_globs (newline-separated): file changes matching these — or living
# under _acceptance/ — do not stale the evidence (docs and gate artifacts).
# t3_paths: critical paths — the T1-escape backstop flags them hardest.
T1_GLOBS=""
T3_PATHS=""
# Human-signoff provenance knobs (signoff.*): require_human_commit demands the
# signature land in its own human-fields-only commit; agent_authors is an
# email-glob blocklist for the signoff commit's author.
REQ_HUMAN_COMMIT=""
AGENT_AUTHORS=""
if [ -f "$ACC/config.yaml" ]; then
  cfg_req="$(sed -n 's/^[[:space:]]*required_for:[[:space:]]*//p' "$ACC/config.yaml" | head -1 | sed 's/[[:space:]]*#.*$//')"
  [ -n "$cfg_req" ] && REQUIRED_FOR="$cfg_req"
  cfg_rc="$(sed -n 's/^[[:space:]]*recheck:[[:space:]]*//p' "$ACC/config.yaml" | head -1 | sed 's/[[:space:]]*#.*$//')"
  case "$cfg_rc" in strict|warn|off) RECHECK_MODE="$cfg_rc" ;; esac
  T1_GLOBS="$(sed -n '/^  t1_skip_globs:/,/^  [a-zA-Z0-9_-]*:/p' "$ACC/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//" -e 's/[[:space:]]*$//')"
  T3_PATHS="$(sed -n '/^  t3_paths:/,/^  [a-zA-Z0-9_-]*:/p' "$ACC/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//" -e 's/[[:space:]]*$//')"
  REQ_HUMAN_COMMIT="$(sed -n 's/^[[:space:]]*require_human_commit:[[:space:]]*//p' "$ACC/config.yaml" | head -1 | sed 's/[[:space:]]*#.*$//' | tr '[:upper:]' '[:lower:]')"
  AGENT_AUTHORS="$(sed -n '/^  agent_authors:/,/^  [a-zA-Z0-9_-]*:/p' "$ACC/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//" -e 's/[[:space:]]*$//')"
fi
if [ "$RECHECK_MODE" = "warn" ]; then
  # A disabled backstop must be impossible to miss: in warn mode a report
  # hand-edited AFTER the write-time hook only produces a NOTE — it does not
  # block the merge.
  echo "WARNING: committed-evidence re-check is ADVISORY ONLY (recheck: warn) — a hand-edited PASS report will NOT block merge. Set 'recheck: strict' in _acceptance/config.yaml to enforce the backstop."
fi

fm_field() { # <file> <key> — first frontmatter-style "key: value" line, normalized:
  # trailing #-comments, surrounding quotes, and trailing whitespace stripped
  # (mirrors the hook's tolerance for quotes/comments on these lines).
  sed -n "s/^${2}:[[:space:]]*//p" "$1" | head -1 \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//' -e 's/[[:space:]]*$//'
}

front_field() { # <file> <key> — read <key> from the LEADING --- frontmatter block only
  # (tolerates leading blank lines; a body excerpt cannot poison the read, and a
  # report with NO leading frontmatter yields empty for every field — so verdict
  # reads empty and the feature is rejected rather than trusted).
  awk '!f && NF==0 {next} !f && /^---[[:space:]]*$/ {f=1; next} !f {exit} /^---[[:space:]]*$/ {exit} {print}' "$1" \
    | sed -n "s/^${2}:[[:space:]]*//p" | head -1 \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//' -e 's/[[:space:]]*$//'
}

match_globs() { # <path> <newline-separated globs> — 0 iff any glob matches
  while IFS= read -r g; do
    [ -n "$g" ] || continue
    # unquoted $g on purpose: case PATTERN matching (globs never fs-expand here)
    case "$1" in $g) return 0 ;; esac
  done <<GLOBS
$2
GLOBS
  return 1
}

feature_scope() { # <evals.yaml> — union of declared globs on stdout; rc 0 only
  # when EVERY eval declares a usable `paths`. `paths` was introduced as a
  # carry-forward performance knob, where under-declaring is safe; here it gates
  # correctness, so anything less than a complete, parseable declaration falls
  # back to whole-tree rather than to a narrower scope.
  #
  # This is a grep-based parser, not a YAML parser — it cannot afford to guess.
  # Six rounds in a row each patched one bad FORM of the same construct while
  # a sibling form of that same construct survived (fixed-literal indentation,
  # then a whitespace class, then multi-line arrays, then the first `]`, then
  # a key-name alphabet that still let a quoted, spaced, or colon-bearing key
  # through), because "reject the forms I thought of" can never enumerate
  # every form. This version instead whitelists exactly what is understood —
  # for BOTH the key and the value — and refuses everything else by
  # construction:
  #
  #   <EI>  <simple-key>: ["glob", "glob", ...][optional trailing # comment]
  #
  # anchored at both ends of the physical line, where EI is the derived
  # eval-item indent, <simple-key> matches `[A-Za-z_][A-Za-z0-9_-]*` — no
  # quotes, no embedded space, no embedded colon (enforced up front by the
  # key-grammar check below, on EVERY line at eval-key indentation, not just
  # `paths:` lines) — and, when that key is `paths`, each glob is a
  # double-quoted string with no `"` inside it. A `]`, `,`, or `#` inside a
  # quoted glob is harmless BECAUSE the whole line matched this grammar
  # first — only then is the true closing `]` known, and globs are pulled out
  # as quoted spans, never by splitting on `,` or `]`. Everything else is
  # refused, not guessed at: a quoted, spaced, or colon-bearing key, an empty
  # key, a list item at eval-key indent, multi-line arrays, single- or
  # un-quoted items, nested arrays, `paths: []`, `paths:` with no value,
  # block scalars, or any trailing content after `]` that is not a `#`
  # comment. A wider whole-tree fallback is always safe, a narrower wrong
  # scope never is.
  f="$1"
  [ -f "$f" ] || return 1

  # Derive the eval-item indentation from the FIRST "- id:" line, LITERALLY
  # (the exact leading whitespace captured, not a whitespace class) — every
  # pattern below is anchored to this exact string.
  ei="$(grep -m1 '^[[:space:]]*- id:' "$f" 2>/dev/null | sed 's/- id:.*$//')"

  # Indentation consistency: every "- id:" line (loosely matched, any leading
  # whitespace) must equal EI exactly. If some drift to a different
  # indentation (odd space count, or a literal tab alongside spaces), this
  # parser cannot read the file reliably — return non-zero rather than guess.
  loose_n="$(grep -c '^[[:space:]]*- id:' "$f" 2>/dev/null || true)"
  exact_n="$(grep -c "^${ei}- id:" "$f" 2>/dev/null || true)"
  loose_n="${loose_n:-0}"
  exact_n="${exact_n:-0}"
  [ "$loose_n" -eq "$exact_n" ] || return 1

  n_evals="$exact_n"
  [ "$n_evals" -gt 0 ] || return 1

  # Eval-key line shape: every line indented to EXACTLY the eval-key
  # indentation (EI plus two literal spaces — the column a `- ` marker lines
  # sibling keys up with) must be a simple, unquoted `key:` —
  # `[A-Za-z_][A-Za-z0-9_-]*:`. The key name is deliberately NOT enumerated
  # as "the key names I expect" (kebab-case `expected-output:`, digit-suffixed
  # `note2:`, etc. are all legal); what is refused is any key shape this
  # line-based parser cannot read reliably at all: a quoted key
  # (`"note: x":`), a key with an embedded colon (`"note: x":` again — the
  # colon inside the quotes, not just the one ending it), a key with a
  # space (`my key:`), an empty key (`: `), or a list item sitting at this
  # same indent (`- foo:`). None of those are things this parser can
  # disambiguate from a real key, so the whole file is refused rather than
  # guessed at. Loose vs strict counts at the SAME indentation (mirroring the
  # "- id:" indentation check above) catch every one of them: a line
  # matching the loose "something non-blank sits here" selector that does
  # NOT also match the strict key grammar means this file has a line this
  # parser cannot read.
  key_loose_n="$(grep -c "^${ei}  [^[:space:]]" "$f" 2>/dev/null || true)"
  key_strict_n="$(grep -Ec "^${ei}  [A-Za-z_][A-Za-z0-9_-]*:" "$f" 2>/dev/null || true)"
  key_loose_n="${key_loose_n:-0}"
  key_strict_n="${key_strict_n:-0}"
  [ "$key_loose_n" -eq "$key_strict_n" ] || return 1

  # This parser cannot read YAML block scalars. A `|`/`>` indicator as the
  # VALUE of ANY eval-level key (EI plus two spaces) means the following
  # lines are opaque prose that can look like anything, including a decoy
  # `paths:` line — refuse rather than let that prose feed either counter
  # below. Because the check above has already proven every eval-key-indent
  # line is a simple `<key>:`, the value begins immediately after THAT key's
  # single colon — so this is expressed in the SAME key grammar rather than a
  # fresh, unconstrained `[^:]*` that would anchor on the wrong colon when a
  # key contains one of its own (the exact bypass this round closes: a key
  # like `"note: x":` has an embedded colon, and `[^:]*` stops at the first
  # one, landing mid-key instead of at the key's true end).
  #
  # The indicator must be followed by nothing but an optional YAML
  # chomping/indent suffix (`-`, `+`, a digit) and then end-of-line or a
  # trailing comment, anchoring it to be the START of the value — a
  # legitimate single-line value that merely CONTAINS `|` or `>` later on —
  # e.g. `expected: "exit 0; a > b"` — has its own first non-space character
  # (here `"`) right after the colon, never matches, and is left alone.
  if grep -E -q "^${ei}  [A-Za-z_][A-Za-z0-9_-]*:[[:space:]]*[|>][-+0-9]*[[:space:]]*(#.*)?\$" "$f" 2>/dev/null; then
    return 1
  fi

  # Declarations: ONE pattern, anchored at both `^` and `$` of the physical
  # line, drives both the counter and the extractor below, so they cannot
  # disagree. Requiring the closing `]` (and nothing but an optional comment)
  # on the SAME line is what rules out a multi-line array — a `paths: [`
  # opening a line whose globs continue on following lines simply fails to
  # match this pattern at all, so it falls short of n_evals and the function
  # refuses. Each item must be `"..."` (double-quoted, no embedded `"`); a
  # single-quoted, unquoted, or nested-array item likewise fails to match. A
  # `paths:` whose value is not exactly this shape (e.g. `paths: []`,
  # `paths:` with no value, `paths: >`) is not a declaration at all: it can
  # never count toward completeness while contributing zero globs. A stray
  # feature-level top-level `paths:` key (indented differently, not under any
  # eval) is excluded by the same exact-indentation anchor.
  #
  # The grammar permits optional whitespace right inside the brackets
  # (`[ "a" ]`) and an optional trailing comma before the close (`["a",]`) —
  # both unremarkable YAML a maintainer would expect to work — while every
  # other refusal (single-line only, double-quoted only, no nested arrays, no
  # trailing non-comment suffix) stays exactly as strict.
  paths_re="^${ei}  paths:[[:space:]]*\\[[[:space:]]*\"[^\"]*\"(,[[:space:]]*\"[^\"]*\")*,?[[:space:]]*\\][[:space:]]*(#.*)?\$"
  n_paths="$(grep -E -c "$paths_re" "$f" 2>/dev/null || true)"
  n_paths="${n_paths:-0}"
  [ "$n_evals" -eq "$n_paths" ] || return 1

  # Extract by pulling the quoted spans out of each matched line's array
  # body, never by splitting on `,` or `]` — those characters are meaningless
  # once they can appear inside a glob. Because the whole line already proved
  # it matches the grammar above, the prefix up to the array's `[` and the
  # suffix from the array's `]` (plus optional trailing comment) can be
  # stripped safely, leaving only the array body to scan for `"..."` spans.
  decls="$(grep -E "$paths_re" "$f" 2>/dev/null || true)"
  globs=""
  n_lines=0
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    n_lines=$((n_lines + 1))
    body="$(printf '%s\n' "$line" \
      | sed -E "s/^${ei}  paths:[[:space:]]*\[//" \
      | sed -E 's/\][[:space:]]*(#.*)?$//')"
    line_globs="$(printf '%s\n' "$body" | grep -o '"[^"]*"' | sed -e 's/^"//' -e 's/"$//')"
    # The grammar guarantees at least one item per matched line; if
    # extraction still comes up empty, the counter and extractor have
    # silently diverged — refuse rather than emit a union short of the truth.
    [ -n "$line_globs" ] || return 1
    globs="${globs}${line_globs}
"
  done <<DECLS
$decls
DECLS
  [ "$n_lines" -eq "$n_paths" ] || return 1

  globs="$(printf '%s\n' "$globs" \
    | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
    | grep -v '^$' | sort -u)"
  # An empty array parses to zero globs (never matched by this grammar, but
  # kept as a last-resort guard). A zero-glob scope matches nothing, which
  # would read as "never stale" — treat it as not declared.
  [ -n "$globs" ] || return 1
  printf '%s\n' "$globs"
  return 0
}

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

scope_has_any_match() { # <root> <scope-globs> — rc 0 iff at least one file
  # tracked by git matches the union; rc 1 otherwise. A declared union that
  # matches NO file in the repository is a typo or a stale/renamed path, not a
  # scope — and unlike scope_gaps() above (which only runs the moment this
  # feature's own _acceptance/<slug>/ changes, and can pass VACUOUSLY when
  # that PR's coverage set happens to be empty), this must hold independent of
  # any PR diff: a match-nothing glob accepted once at declaration time would
  # otherwise filter out every real change forever, on every later PR, silently.
  #
  # Uses match_globs() — the same `case`-pattern matcher scope_gaps()/
  # stale_files() use — rather than handing globs to `git ls-files` as
  # pathspecs, whose `*` semantics differ from shell `case` globbing.
  #
  # Any doubt (git missing, not a repo, ls-files unusable) is "cannot verify"
  # and returns rc 1 — refuse narrow scope, same as every other doubt in this
  # function. Stops at the first match rather than scanning every tracked file.
  command -v git >/dev/null 2>&1 || return 1
  git -C "$1" rev-parse --git-dir >/dev/null 2>&1 || return 1
  git -C "$1" ls-files 2>/dev/null | {
    hit=1
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      if match_globs "$f" "$2"; then
        hit=0
        break
      fi
    done
    exit "$hit"
  }
}

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

violations=0

# config.yaml 2-space lint: every kit parser (hook resolveConfigKey, the sed/awk
# here) is line/indent based — a TAB or odd indent silently breaks config:
# resolution (verifier refs stop resolving, executors vanish). Fail loudly instead.
if [ -f "$ACC/config.yaml" ]; then
  cfg_lint="$(awk '
    /\t/ { printf "line %d: TAB character\n", NR; next }
    /^[ ]*[^ #]/ {
      n = match($0, /[^ ]/) - 1
      if (n % 2 == 1) printf "line %d: odd indentation (%d spaces)\n", NR, n
    }
  ' "$ACC/config.yaml")"
  if [ -n "$cfg_lint" ]; then
    echo "VIOLATION [config]: _acceptance/config.yaml breaks the 2-space line schema (kit parsers are indent-based; use scripts/config-patch.mjs for programmatic writes):"
    printf '%s\n' "$cfg_lint" | head -5 | sed 's/^/    /'
    violations=$((violations+1))
  fi
fi

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

for dir in "$ACC"/*/; do
  [ -d "$dir" ] || continue
  slug="$(basename "$dir")"
  if [ ${#SLUGS[@]} -gt 0 ]; then
    found=0
    for s in "${SLUGS[@]}"; do [ "$s" = "$slug" ] && found=1; done
    [ $found -eq 1 ] || continue
  fi
  contract="$dir/contract.md"
  [ -f "$contract" ] || continue

  tier="$(fm_field "$contract" risk_tier)"
  status="$(fm_field "$contract" status)"

  [ -n "$tier" ] || continue
  case "$REQUIRED_FOR" in *"$tier"*) ;; *) continue ;; esac
  case "$status" in implemented|verified|signed-off) ;; *) continue ;; esac

  # Gate 1 must have been recorded BEFORE any post-approval status: a contract
  # that reached implemented+ with an empty approved_by jumped the gate. The
  # explicit user skip (gate1_skipped: true) is tolerated but NOTEd (audit).
  approved_by="$(front_field "$contract" approved_by)"
  g1skip="$(front_field "$contract" gate1_skipped | tr '[:upper:]' '[:lower:]')"
  if [ -z "$approved_by" ]; then
    case "$g1skip" in
      true|1|yes)
        echo "NOTE [$slug]: gate1_skipped: true — user explicitly skipped Gate 1 (approved_by empty tolerated, audit trail)" ;;
      *)
        echo "VIOLATION [$slug]: status=$status but approved_by is empty and gate1_skipped is not true — Gate 1 approval was never recorded (contract skipped the gate)"
        violations=$((violations+1)); continue ;;
    esac
  fi

  report="$dir/evidence-report.md"
  if [ ! -f "$report" ]; then
    echo "VIOLATION [$slug]: status=$status but no evidence-report.md"
    violations=$((violations+1)); continue
  fi
  # Read report fields from the leading frontmatter ONLY — same scope as the
  # provenance reads below, so a no-fence/offset-fence report can't pass verdict
  # while its provenance reads empty (would otherwise let a bypassed PASS slip).
  verdict="$(front_field "$report" verdict)"
  signoff="$(front_field "$report" human_signoff)"
  if [ "$verdict" != "PASS" ]; then
    echo "VIOLATION [$slug]: verdict=$verdict (must be PASS to merge)"
    violations=$((violations+1)); continue
  fi
  bypass="$(front_field "$report" bypass_used | tr '[:upper:]' '[:lower:]')"
  ack="$(front_field "$report" bypass_ack)"
  case "$bypass" in true|1|yes)
    if [ -n "$ack" ]; then
      echo "NOTE [$slug]: bypass_used=$bypass acknowledged (bypass_ack: $ack) — released with audit trail"
    else
      echo "VIOLATION [$slug]: bypass_used=$bypass — PASS produced with the gate bypassed (ACCEPTANCE_GATE_BYPASS); re-verify without bypass, or record bypass_ack: <name> <date> to consciously release"
      violations=$((violations+1)); continue
    fi ;;
  esac
  enf="$(front_field "$report" enforcement_mode | tr '[:upper:]' '[:lower:]')"
  case "$enf" in
    off) echo "VIOLATION [$slug]: enforcement_mode=off — gate did nothing at write time; re-verify under enforcement: strict before merge"
      violations=$((violations+1)); continue ;;
    warn) echo "WARNING [$slug]: enforcement_mode=warn — gate only warned (not blocked) when this PASS was written; evidence present but not hard-enforced" ;;
  esac
  if [ -z "$signoff" ]; then
    echo "VIOLATION [$slug]: verdict PASS but human_signoff is empty (Gate 2 pending)"
    violations=$((violations+1)); continue
  fi
  # Human-signoff provenance: the signature is text in an AI-writable file —
  # the git history of the commit that INTRODUCED it is the only
  # machine-checkable attribution. Standard flow: verify commits the
  # machine-written report first; the reviewer lands the signature in its own
  # commit touching only human-owned lines (human_signoff / human_override /
  # verdict upgrade / bypass_ack). Comment-only and blank +/- lines tolerated.
  if [ "$REQ_HUMAN_COMMIT" = "true" ] || [ -n "$AGENT_AUTHORS" ]; then
    if ! command -v git >/dev/null 2>&1 || ! git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
      echo "NOTE [$slug]: signoff provenance unverifiable — $ROOT is not a git repo here (signoff.require_human_commit/agent_authors set)"
    else
      rel_report="${report#"$ROOT"/}"
      sign_commit="$(git -C "$ROOT" log --format=%H -S"human_signoff: $signoff" -- "$rel_report" 2>/dev/null | head -1)"
      [ -z "$sign_commit" ] && sign_commit="$(git -C "$ROOT" log --format=%H -S"$signoff" -- "$rel_report" 2>/dev/null | head -1)"
      if [ -z "$sign_commit" ]; then
        if [ "$REQ_HUMAN_COMMIT" = "true" ]; then
          echo "VIOLATION [$slug]: human_signoff present but not found in any commit of $rel_report — the reviewer must COMMIT the signoff themselves (signoff.require_human_commit)"
          violations=$((violations+1)); continue
        fi
      else
        if [ -n "$AGENT_AUTHORS" ]; then
          author="$(git -C "$ROOT" log -1 --format=%ae "$sign_commit" 2>/dev/null)"
          hit=""
          while IFS= read -r g; do
            [ -n "$g" ] || continue
            case "$author" in $g) hit="$g" ;; esac
          done <<GLOBS2
$AGENT_AUTHORS
GLOBS2
          if [ -n "$hit" ]; then
            echo "VIOLATION [$slug]: signoff commit $sign_commit authored by \"$author\" — matches signoff.agent_authors blocklist ($hit); Gate 2 must be signed by a human identity"
            violations=$((violations+1)); continue
          fi
        fi
        if [ "$REQ_HUMAN_COMMIT" = "true" ]; then
          nonhuman="$(git -C "$ROOT" show --format= --unified=0 "$sign_commit" -- "$rel_report" 2>/dev/null \
            | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' \
            | grep -vE '^[+-][[:space:]]*((human_signoff|human_override|verdict|bypass_ack)[[:space:]]*:|#|$)')"
          if [ -n "$nonhuman" ]; then
            echo "VIOLATION [$slug]: the commit introducing human_signoff ($sign_commit) also edits the report body — the Gate-2 signature must land in its own human-fields-only commit (signoff.require_human_commit). Offending lines:"
            printf '%s\n' "$nonhuman" | head -5 | sed 's/^/    /'
            violations=$((violations+1)); continue
          fi
        fi
      fi
    fi
  fi
  # Stale-evidence check: the PASS certifies the tree at verified_commit. Any
  # non-gate file changed since then (committed or working tree) means the code
  # being merged is NOT the code that was verified — re-verify, don't ride old
  # evidence. Reports without the field (older template) and clones where the
  # commit is unreachable (rebase/squash/shallow fetch) only get a NOTE.
  vc="$(front_field "$report" verified_commit)"
  if [ -z "$vc" ]; then
    echo "NOTE [$slug]: report has no verified_commit (older template) — evidence is not pinned to a commit; code drift since verify is NOT machine-checked. Re-verify to pin."
  elif ! command -v git >/dev/null 2>&1 || ! git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
    echo "NOTE [$slug]: verified_commit present but $ROOT is not a git repo here — staleness unverifiable"
  elif ! git -C "$ROOT" rev-parse --quiet --verify "$vc^{commit}" >/dev/null 2>&1; then
    echo "NOTE [$slug]: verified_commit $vc not found in this clone (rebase/squash or shallow fetch?) — staleness unverifiable; re-verify to re-pin"
  else
    # feature_scope's non-zero return means "not declared" (partial/malformed/
    # absent paths) — the normal fallback path, not an error, so it must not
    # abort the script or leak stderr; scope simply stays empty (whole-tree).
    scope=""
    if scope="$(feature_scope "$dir/evals.yaml")"; then :; else scope=""; fi
    # A feature earns narrow scope only when its declaration is CHECKED against
    # this PR's own gated diff (the coverage set, BASE_SHA...HEAD) — and that
    # check only runs at the one moment the declaration is new or changed: when
    # this feature's own _acceptance/<slug>/ is part of the PR diff. Without a
    # resolvable BASE_SHA there is no coverage set to check against at all, so
    # "cannot cross-check" must unconditionally fall back to whole-tree — an
    # empty/unresolvable BASE_SHA is never read as "declaration covers
    # everything". This only speaks up for a feature that actually HAD a scope
    # to refuse (the outer `[ -n "$scope" ]`); an undeclared feature (scope
    # already empty) stays completely silent here, same as before.
    if [ -n "$scope" ]; then
      if [ -z "$BASE_SHA" ]; then
        echo "NOTE [$slug]: no usable PR base (BASE_SHA empty) — declared eval paths cannot be cross-checked against this PR's gated diff; narrow staleness scope refused, whole-tree applied"
        scope=""
      # A pathspec is a literal path, not a pattern: unlike a grep regex over
      # `git diff --name-only` output, "_acceptance/$slug" cannot have its
      # directory boundary defeated by a slug containing a regex metacharacter
      # (e.g. slug "a.b" matching an unrelated "_acceptance/axb/" via the "."
      # wildcard). Git itself anchors this at the path-segment boundary, so
      # "fx" still never matches "fx-extra".
      elif [ -n "$(git -C "$ROOT" diff --name-only "$BASE_SHA...HEAD" -- "_acceptance/$slug" 2>/dev/null)" ]; then
        gaps="$(scope_gaps "$ROOT" "$BASE_SHA" "$scope")"
        if [ -n "$gaps" ]; then
          echo "NOTE [$slug]: declared eval paths do not cover this PR's gated diff — narrow staleness scope refused, whole-tree applied. Not covered:"
          printf '%s\n' "$gaps" | head -10 | sed 's/^/    /'
          scope=""
        fi
      fi
    fi
    # A declared union that matches no tracked file at all is a typo or a
    # rotted/renamed path, not a scope. This is deliberately OUTSIDE the
    # cross-check branch above and applies whenever scope is still non-empty
    # here, regardless of whether that cross-check ran: the cross-check only
    # fires the moment this feature's own _acceptance/<slug>/ is part of the
    # PR diff, i.e. when the declaration is new or changed. A PR that
    # introduces a match-nothing declaration while touching only its own gate
    # artifacts has an EMPTY coverage set, so the cross-check passes
    # vacuously and narrow scope is granted; every later PR that changes real
    # code without touching this feature's _acceptance/<slug>/ then skips the
    # cross-check entirely, and stale_files scoped to a match-nothing glob
    # filters out every real change forever. Governing rule: narrow scope is
    # never granted on a guess — a scope that provably matches nothing
    # tracked in the repo is exactly that. Silent for an undeclared feature:
    # scope is already empty there, so this guard never fires (AC-3).
    if [ -n "$scope" ] && ! scope_has_any_match "$ROOT" "$scope"; then
      echo "NOTE [$slug]: declared eval paths match no tracked file in the repository — treating the declaration as a typo/stale path; narrow staleness scope refused, whole-tree applied"
      scope=""
    fi
    stale="$(stale_files "$ROOT" "$vc" "$scope")"
    if [ -n "$stale" ]; then
      echo "VIOLATION [$slug]: evidence is stale — code changed after verify (verified_commit $vc); re-run verify before merge. Changed:"
      printf '%s\n' "$stale" | head -10 | sed 's/^/    /'
      violations=$((violations+1)); continue
    fi
  fi
  # run-log presence: the re-check below reconciles report run_ids against
  # _acceptance/<slug>/run-log.jsonl (machine-written at verify). A missing log
  # (older verify flow) is tolerated but must be visible.
  if [ ! -f "$dir/run-log.jsonl" ]; then
    echo "NOTE [$slug]: no run-log.jsonl (older verify flow) — run_id provenance is not machine-logged; report run_ids are unreconciled. Re-verify to generate the log."
  fi
  # observed (schema v2): older reports with screenshot evidence never faced the
  # inspected-frames bar — tolerated, but must be visible.
  sv="$(front_field "$report" schema_version)"
  case "$sv" in (*[!0-9]*|'') sv=1 ;; esac
  if [ "$sv" -lt 2 ] \
     && grep -qiE '^[[:space:]]*screenshot[[:space:]]*[:=]' "$report" \
     && ! grep -qiE '^[[:space:]]*observed[[:space:]]*[:=]' "$report"; then
    echo "NOTE [$slug]: schema v$sv report has screenshot evidence without observed: — frame inspection was not machine-enforced for this report. Re-verify with template v2 to enforce."
  fi
  # Re-verify the COMMITTED evidence with the same core the hook runs — catches a
  # report hand-edited after the write-time hook, or written under bypass.
  if [ "$RECHECK_MODE" != off ]; then
    if [ -f "$RECHECK" ] && command -v node >/dev/null 2>&1; then
      recheck_out="$(node "$RECHECK" "$report" 2>&1)"; rc=$?
      if [ "$rc" -eq 1 ]; then
        if [ "$RECHECK_MODE" = strict ]; then label="VIOLATION"; else label="NOTE"; fi
        echo "$label [$slug]: committed evidence fails re-check (recheck: $RECHECK_MODE):"
        printf '%s\n' "$recheck_out" | sed 's/^/    /'
        if [ "$RECHECK_MODE" = strict ]; then violations=$((violations+1)); continue; fi
      elif [ "$rc" -ne 0 ]; then
        echo "NOTE [$slug]: evidence re-check unavailable (exit $rc) — ${recheck_out:-skipped}"
      fi
    else
      echo "NOTE [$slug]: evidence re-check not vendored (recheck-evidence.js/node missing) — committed-evidence bar NOT enforced"
    fi
  fi
  echo "OK [$slug]: $verdict, signed off by $signoff"
done

# ── T1-escape backstop (PR-level) ────────────────────────────────────────────
# T1 is self-declared at Phase 0 from EXPECTED paths — nothing stops a "docs
# typo" PR from also touching src/billing/. With a PR base: changed files
# matching t3_paths — or falling outside t1_skip_globs — require the PR to
# carry _acceptance/<slug>/ artifacts. (Under the stale-evidence rule every
# gated PR re-verifies, so its diff always includes gate artifacts.) There is
# no path→slug mapping, so "carries artifacts" means any _acceptance/ change;
# the per-slug checks above judge their quality.
if [ -z "$BASE_SHA" ]; then
  echo "NOTE: $BASE_NOTE"
else
  changed="$(git -C "$ROOT" diff --name-only "$BASE_SHA...HEAD" -- 2>/dev/null)"
  gate_touched=0; t3_hits=""; nont1_hits=""
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in _acceptance/*|*/_acceptance/*) gate_touched=1; continue ;; esac
    if [ -n "$T3_PATHS" ] && match_globs "$f" "$T3_PATHS"; then
      t3_hits="${t3_hits}${f}"$'\n'
    elif ! match_globs "$f" "$T1_GLOBS"; then
      nont1_hits="${nont1_hits}${f}"$'\n'
    fi
  done <<CHANGED
$changed
CHANGED
  if [ "$gate_touched" -eq 0 ]; then
    if [ -n "$t3_hits" ]; then
      echo "VIOLATION [PR]: T3 paths (t3_paths) changed but the PR carries NO _acceptance/<slug>/ artifacts — critical code changed without the gate. Changed:"
      printf '%s' "$t3_hits" | head -10 | sed 's/^/    /'
      violations=$((violations+1))
    elif [ -n "$nont1_hits" ]; then
      echo "VIOLATION [PR]: non-T1 files changed (outside t1_skip_globs) but the PR carries NO _acceptance/<slug>/ artifacts — declare T1 honestly (t1_skip_globs) or run the gate. Changed:"
      printf '%s' "$nont1_hits" | head -10 | sed 's/^/    /'
      violations=$((violations+1))
    fi
  fi
fi

if [ "$violations" -gt 0 ]; then
  echo "pre-merge-check: $violations violation(s) — merge blocked"
  exit 1
fi
echo "pre-merge-check: clean"
exit 0
