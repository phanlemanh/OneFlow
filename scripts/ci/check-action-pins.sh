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
    local lines count=0 below=0

    # Must be a real `uses:` step, not any occurrence of the string, and exactly
    # ONE pin per line. Two earlier versions of this leaked: counting bare text
    # let `# was: actions/checkout@v7` stand in for a deleted step, and then
    # extracting with grep -o counted every occurrence on a line, so a trailing
    # `# mirrors actions/checkout@v7 in ci.yml` paid for a site deleted
    # elsewhere. sed takes the token immediately after `uses:` and nothing else,
    # so a comment anywhere on the line is inert.
    lines="$(grep -rhE "^[[:space:]]*(-[[:space:]]+)?uses:[[:space:]]*${action}@v[0-9]+([[:space:]]|#|$)" "$WF_DIR" \
        | sed -E "s|^[[:space:]]*(-[[:space:]]+)?uses:[[:space:]]*([^[:space:]#]+).*|\\2|" \
        | grep -xE "${action}@v[0-9]+" || true)"
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
            below=$((below + 1))
        fi
    done <<<"$lines"

    if [ "$count" -ne "$want_sites" ]; then
        echo "FAIL ${action}: expected ${want_sites} pinned site(s), found ${count}" >&2
        echo "     a site was added or removed — re-read the contract before changing this number" >&2
        fail=1
        return
    fi

    if [ "$below" -ne 0 ]; then
        # Don't follow a FAIL with a line claiming the action is fine.
        echo "-- ${action}: ${count} site(s), ${below} below v${floor}"
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
