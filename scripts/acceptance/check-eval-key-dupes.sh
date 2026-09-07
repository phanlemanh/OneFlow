#!/usr/bin/env bash
# Guard: no eval block in _acceptance/**/evals.yaml may carry the same key twice.
#
# Why it exists: the YAML loaders in use keep the LAST duplicate and say nothing. It
# already had a consequence -- the SIGNED dossier noi-thuoc-tai-lieu-vao-ci carried
# `expected` twice inside its E2 block, so signed evidence described a measurement that
# had been withdrawn.
#
# Read RAW, on purpose. Using the parser that swallows the key to catch the key being
# swallowed is circular, and "this guard calls no YAML parser" is a structural property
# the teeth suite pins, so that a later "simplification" back onto a loader cannot pass.
#
# Usage: check-eval-key-dupes.sh [--teeth [--case <ten>]]
set -uo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
SELF="${BASH_SOURCE[0]}"
# Script-global on purpose: the EXIT trap fires AFTER teeth() returns, so a `local W`
# is already gone by then -- under `set -u` that made the trap die on an unbound
# variable and the temp dir survived every run, while the suite still printed OK.
W=""

fail() { echo "FAIL: $*" >&2; exit 1; }

# One evals.yaml -> one line per duplicate. Block boundary: a list item (`- id:` shape).
# Keys counted are ONLY those at the item's own key indent; anything deeper belongs to a
# nested mapping or -- far more often here -- to the body of a `>-` block scalar, where
# lines like "paths: ..." are prose. Counting those would redden every healthy dossier,
# which is the failure mode the khoa-trong-khoi-van case owns.
scan_file() {
    awk -v F="$1" '
        # Anchor the file:line prefix on the LAST occurrence, not the first: that is the
        # line a reader deletes, and the one an editor jumps to. The first occurrence is
        # named in the text, because "which one survived" is the whole question -- the
        # loader keeps the last, so the FIRST is the wording that silently vanished.
        function flush_item(   k) {
            for (k in seen)
                if (seen[k] > 1)
                    printf "%s:%d: khoa \047%s\047 lap %d lan (lan dau o dong %d, ban nay nuot no) trong khoi bat dau dong %d\n", F, last[k], k, seen[k], first[k], item_line
            delete seen; delete first; delete last
        }
        {
            line = $0
            if (line ~ /^[[:space:]]*#/) next
            if (line ~ /^[[:space:]]*-[[:space:]]+[A-Za-z_][A-Za-z0-9_]*:/) {
                flush_item()
                item_line = NR
                match(line, /^[[:space:]]*-[[:space:]]+/); key_indent = RLENGTH
                sub(/^[[:space:]]*-[[:space:]]+/, "", line)
                in_item = 1
            } else if (in_item) {
                if (line ~ /^[[:space:]]*$/) next
                match(line, /^[[:space:]]*/)
                if (RLENGTH < key_indent) { flush_item(); in_item = 0; next }
                if (RLENGTH != key_indent) next
                sub(/^[[:space:]]*/, "", line)
            } else next
            if (line !~ /^[A-Za-z_][A-Za-z0-9_]*:/) next
            k = line; sub(/:.*$/, "", k)
            seen[k]++
            last[k] = NR
            if (seen[k] == 1) first[k] = NR
        }
        END { flush_item() }
    ' "$1"
}

scan_repo() {
    local files n=0 bad=0 out
    files=$(find "$ROOT/_acceptance" -name evals.yaml -type f 2>/dev/null | sort)
    # A scanner that matched NOTHING prints a clean sweep otherwise -- the exact shape
    # this dossier exists to close.
    [ -n "$files" ] || fail "khong tim thay tep evals.yaml nao duoi $ROOT/_acceptance — phep quet nay dang do KHONG GI, chu khong phai dang bao sach"
    while IFS= read -r f; do
        n=$((n + 1))
        out="$(scan_file "$f")"
        if [ -n "$out" ]; then
            printf '%s\n' "$out" | sed "s|^$ROOT/||" >&2
            bad=$((bad + $(printf '%s\n' "$out" | wc -l | tr -d ' ')))
        fi
    done <<< "$files"
    echo "tep evals.yaml da quet: $n | khoa lap: $bad"
    [ "$bad" -eq 0 ] || exit 1
    echo "OK: khong khoi eval nao mang mot khoa hai lan"
}

KNOWN="khoa-trung-co-that khoa-trung-neu-dich-danh khoa-trong-khoi-van"
TOTAL=$(printf '%s\n' $KNOWN | wc -w | tr -d ' ')

teeth() {
    local ONLY="${1:-}" RAN=0 FAILED=0 out rc ok n parser_pat
    if [ -n "$ONLY" ] && ! printf '%s\n' $KNOWN | grep -qx "$ONLY"; then
        echo "unknown case: $ONLY (known: $KNOWN)" >&2; exit 2
    fi
    W="$(mktemp -d)"; trap '[ -n "${W:-}" ] && rm -rf "$W"' EXIT
    run() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }

    # The dossier that actually happened, reduced: `expected` twice inside one block.
    dossier_dup() {
        rm -rf "$W/r"; mkdir -p "$W/r/_acceptance/demo"
        cat > "$W/r/_acceptance/demo/evals.yaml" <<'YAML'
evals:
  - id: E2
    executor: script
    expected: >-
      cau dau tien
    evidence_required: [run_id]
    expected: >-
      cau thu hai — nuot mat cau tren
YAML
    }

    if run khoa-trung-co-that; then
        RAN=$((RAN + 1)); dossier_dup
        out="$(ROOT="$W/r" bash "$SELF" 2>&1)"; rc=$?
        if [ "$rc" -eq 0 ]; then
            echo "CASE khoa-trung-co-that: FAIL — mong do, nhung thoat 0"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1
        else echo "CASE khoa-trung-co-that: PASS"; fi
    fi

    if run khoa-trung-neu-dich-danh; then
        RAN=$((RAN + 1)); dossier_dup
        out="$(ROOT="$W/r" bash "$SELF" 2>&1)"; rc=$?
        ok=1
        # Dossier, key, line number. A message that only says "there is a duplicate" sends
        # the reader hunting through every evals.yaml in the repo.
        # Four needles: dossier, key, the line to delete, and the line that got swallowed.
        for n in "_acceptance/demo/evals.yaml" "expected" ":7:" "lan dau o dong 4"; do
            printf '%s\n' "$out" | grep -qF -- "$n" || {
                echo "CASE khoa-trung-neu-dich-danh: FAIL — dau ra khong neu '$n'"
                printf '%s\n' "$out" | sed 's/^/    /'; ok=0; break; }
        done
        # The structural half, and the reason the pattern is ASSEMBLED at runtime rather
        # than written out: a literal pattern would appear in this file, so the guard
        # would match itself and this case could never pass. Splitting the token means the
        # source contains no contiguous occurrence, while the pattern still does.
        parser_pat="$(printf '%s' 'safe' '_load')|$(printf '%s' 'yaml' '.load')|$(printf '%s' 'js-' 'yaml')|$(printf '%s' 'import ' 'yaml')"
        if [ "$ok" -eq 1 ] && grep -qE "$parser_pat" "$SELF"; then
            echo "CASE khoa-trung-neu-dich-danh: FAIL — hang rao dang dung mot bo doc YAML; no phai doc tho"; ok=0
        fi
        if [ "$ok" -eq 1 ]; then echo "CASE khoa-trung-neu-dich-danh: PASS"; else FAILED=1; fi
    fi

    # The positive control. Every `expected: >-` body in this repo is prose containing
    # lines like "paths: ..." and "cmd: ...". A scanner that counts those as keys reddens
    # every healthy dossier -- over-firing is the failure mode this case owns, and without
    # it a guard that simply calls everything a duplicate would pass the two cases above.
    if run khoa-trong-khoi-van; then
        RAN=$((RAN + 1)); rm -rf "$W/r"; mkdir -p "$W/r/_acceptance/demo"
        cat > "$W/r/_acceptance/demo/evals.yaml" <<'YAML'
evals:
  - id: E1
    executor: script
    paths: ["src/**"]
    expected: >-
      exit 0. O nay doi truong `paths: ["src/**"]` va truong
      `expected: >-` duoc neu nguyen van trong van xuoi, hai lan:
      expected: lan hai nam trong than khoi van, khong phai mot khoa.
    evidence_required: [run_id]
YAML
        out="$(ROOT="$W/r" bash "$SELF" 2>&1)"; rc=$?
        if [ "$rc" -ne 0 ]; then
            echo "CASE khoa-trong-khoi-van: FAIL — mong xanh, thoat $rc"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1
        else echo "CASE khoa-trong-khoi-van: PASS"; fi
    fi

    [ "$FAILED" -eq 0 ] || { echo "FAIL: it nhat mot ca khong xu su nhu doi hoi" >&2; exit 1; }
    if [ -n "$ONLY" ]; then
        echo "PARTIAL: $RAN/$TOTAL ca da chay — khong tuyen gi ve $((TOTAL - RAN)) ca chua chay"; exit 0
    fi
    [ "$RAN" -eq "$TOTAL" ] || fail "chi $RAN/$TOTAL ca chay ma khong khai --case"
    echo "OK: $RAN/$TOTAL ca"
}

case "${1:-}" in
"") scan_repo ;;
--teeth)
    case "${2:-}" in
    "") teeth "" ;;
    --case) [ -n "${3:-}" ] || fail "--case can mot ten ca"; [ "$#" -le 3 ] || fail "thua doi so: ${*:4}"; teeth "$3" ;;
    *) fail "doi so la '${2}' — chi nhan '--case <ten>'" ;;
    esac
    ;;
*) echo "usage: $(basename "$0") [--teeth [--case <ten>]]" >&2; exit 2 ;;
esac
