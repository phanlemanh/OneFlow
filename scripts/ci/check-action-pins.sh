#!/usr/bin/env bash
# AC-1: the bump reached every site.
#
# This is the failure mode that actually happens with a multi-site action bump:
# you miss one, the missed site keeps working on the old major, and nothing ever
# tells you. So this asserts a floor on every pin AND that the expected number of
# sites is still there — otherwise "no site below v7" would also pass on a file
# where someone deleted the step instead of bumping it.
set -euo pipefail

WF_DIR=".github/workflows"
EXPECTED_CHECKOUT_SITES=7
EXPECTED_LOGIN_SITES=1

if [ ! -d "$WF_DIR" ]; then
    echo "no ${WF_DIR} directory — refusing to report pins clean" >&2
    exit 2
fi

fail=0

# $1 = action path, $2 = minimum major, $3 = expected site count
check_action() {
    local action="$1" floor="$2" want_sites="$3"
    local lines count=0

    # grep exits 1 on no match; an absent action is a failure here, not a pass.
    lines="$(grep -rhoE "${action}@v[0-9]+" "$WF_DIR" || true)"
    if [ -z "$lines" ]; then
        echo "FAIL ${action}: not pinned anywhere under ${WF_DIR}" >&2
        fail=1
        return
    fi

    while IFS= read -r pin; do
        count=$((count + 1))
        local major="${pin##*@v}"
        if [ "$major" -lt "$floor" ]; then
            echo "FAIL ${action}: found ${pin}, below the required v${floor}" >&2
            fail=1
        fi
    done <<<"$lines"

    if [ "$count" -ne "$want_sites" ]; then
        echo "FAIL ${action}: expected ${want_sites} pinned site(s), found ${count}" >&2
        echo "     a site was added or removed — re-read the contract before changing this number" >&2
        fail=1
        return
    fi

    echo "ok ${action}: ${count} site(s), all >= v${floor}"
}

check_action "actions/checkout" 7 "$EXPECTED_CHECKOUT_SITES"
check_action "docker/login-action" 4 "$EXPECTED_LOGIN_SITES"

if [ "$fail" -ne 0 ]; then
    exit 1
fi

echo "action pins: at or above the contracted floor at every site"
