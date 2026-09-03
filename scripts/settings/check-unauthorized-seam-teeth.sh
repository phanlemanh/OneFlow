#!/usr/bin/env bash
#
# Proves check-unauthorized-seam.sh can go RED.
#
# A static guard that is green forever looks identical to one whose grep has a
# typo. This is the only place that tells the two apart, so it perturbs a COPY
# of the real tree five ways and asserts the exit code each time.
#
# Case 3 is the one that motivated counting occurrences instead of files: a
# second dispatch inside client.ts itself. A file-counting guard sails past it.
set -uo pipefail
cd "$(dirname "$0")/../.."

fail=0

run_case() {
    local name="$1" want="$2"
    shift 2
    local wt
    wt=$(mktemp -d)
    cp -R src scripts "$wt"/ 2>/dev/null
    ( cd "$wt" && "$@" ) >/dev/null 2>&1
    ( cd "$wt" && bash scripts/settings/check-unauthorized-seam.sh ) >"$wt/out" 2>&1
    local got=$?
    if [ "$got" -eq "$want" ]; then
        echo "ok   case '$name' exited $got"
    else
        echo "FAIL case '$name' wanted $want got $got"
        sed 's/^/       /' "$wt/out"
        fail=1
    fi
    rm -rf "$wt"
}

run_case 'real tree' 0 true

run_case 'a second dispatch site in env-client' 1 \
    sh -c 'printf "\nnew CustomEvent(\"tf:unauthorized\", { cancelable: true });\n" >> src/lib/settings/env-client.ts'

run_case 'a second dispatch inside client.ts itself' 1 \
    sh -c 'printf "\nnew CustomEvent(\"tf:unauthorized\", { cancelable: true });\n" >> src/lib/api/client.ts'

run_case 'a third caller in a component' 1 \
    sh -c 'printf "\nnotifyUnauthorized();\n" >> src/components/workspace/settings-dialog.tsx'

run_case 'emptied client.ts' 2 sh -c ': > src/lib/api/client.ts'

if [ "$fail" -eq 0 ]; then
    echo "OK: guard bites on all four perturbations and is green on the real tree"
else
    exit 1
fi
