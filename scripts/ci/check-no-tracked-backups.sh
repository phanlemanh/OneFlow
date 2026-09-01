#!/usr/bin/env bash
# No editor or tool backup file may be tracked by git.
#
# Why this exists: `_acceptance/config.yaml.bak` was committed by accident on
# 2026-09-01. It was not inert. `_acceptance/config.yaml` is what the acceptance
# kit reads to resolve `config:executors.*` refs, and the backup was a 757-line
# shadow of it whose three `dkfo_*` executors still pointed at guard scripts that
# had been renamed out of existence. A reader landing on the wrong copy resolves
# to dead commands. Two tools in this repo produce these files as a side effect --
# `config-patch.mjs --write` and the `sed -i.bak` idiom -- so the shape recurs.
#
# `.gitignore` carries `*.bak`, but ignore rules do nothing for a file already
# tracked, and `git add -f` (or `git add -A` before the rule existed) walks past
# them. This asserts the tracked set, which is the thing that actually ships.
#
# Modes: check (default) | teeth

set -uo pipefail
ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
MODE="${1:-check}"
PATTERN='\.(bak|orig|rej|swp|tmp)$|~$'

run_check() {
    local root="$1" hits
    hits="$(git -C "$root" ls-files | grep -E "$PATTERN" || true)"
    local n; n="$(printf '%s' "$hits" | grep -c . || true)"
    echo "tracked files scanned: $(git -C "$root" ls-files | wc -l | tr -d ' ') · backup-shaped: $n"
    if [ "$n" -ne 0 ]; then
        echo "FAIL: git tracks $n backup file(s); .gitignore cannot help once a file is tracked:" >&2
        printf '%s\n' "$hits" | sed 's/^/    /' >&2
        return 1
    fi
    echo "OK: no backup-shaped file is tracked"
}

case "$MODE" in
check)
    run_check "$ROOT"
    ;;
teeth)
    # Red direction on a throwaway repo, so the assertion never depends on this
    # tree being dirty. Positive control first: an empty repo must pass, or a
    # guard that is simply always-red would "prove" the negative case too.
    W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
    git -C "$W" init -q; git -C "$W" config user.email t@t; git -C "$W" config user.name t
    echo hi > "$W/real.txt"; git -C "$W" add real.txt
    if ! out="$(run_check "$W" 2>&1)"; then
        echo "CASE healthy: FAIL — clean repo should pass"; printf '%s\n' "$out" | sed 's/^/    /'; exit 1
    fi
    echo "CASE healthy: PASS"
    echo x > "$W/config.yaml.bak"; git -C "$W" add -f config.yaml.bak
    if out="$(run_check "$W" 2>&1)"; then
        echo "CASE co-file-bak: FAIL — guard stayed green with a tracked .bak"; exit 1
    fi
    if ! printf '%s\n' "$out" | grep -q '^FAIL:.*config\.yaml\.bak\|config\.yaml\.bak'; then
        echo "CASE co-file-bak: FAIL — went red but never named the file"; printf '%s\n' "$out" | sed 's/^/    /'; exit 1
    fi
    echo "CASE co-file-bak: PASS"
    echo "OK: 2/2 ca — thuoc xanh tren repo sach, do va neu ten file khi co .bak bi theo doi"
    ;;
*) echo "usage: $(basename "$0") check|teeth" >&2; exit 2 ;;
esac
