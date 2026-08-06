#!/usr/bin/env bash
# ci-vitest-sdk-pin (CI-a) — guards for AC-5..AC-8.
#
# Usage: check-overlay-pin-derived.sh <shape|teeth|override|single-impl>
#
# One sub-command per criterion, never one shared exit code: a suite that
# answers four questions through a single status cannot say WHICH half broke
# (stale-scope-by-paths lesson F1).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
# This guard reads the version the same way everyone else does. Re-deriving it
# here with its own grep would make the guard the second copy of the law it
# forbids — single-impl caught exactly that on the first run.
. scripts/lib/sdk-version.sh

RUNNER=scripts/plugins/run-overlay-plugin-tests.sh
TRAIN=scripts/abi/check-overlay-sdk-train.sh
LIB=scripts/lib/sdk-version.sh
MODE="${1:?usage: check-overlay-pin-derived.sh <shape|teeth|override|single-impl>}"

fail() { echo "FAIL: $*" >&2; exit 1; }

# Ask the runner what it WOULD install, without cloning or hitting the network.
resolved_spec() { bash "$RUNNER" --print-spec; }

case "$MODE" in
shape)
    # AC-5: no version literal survives, and the derived value is the one in pyproject.
    [ -f "$RUNNER" ] || fail "missing $RUNNER"
    if grep -nE 'oneflow-sdk==[0-9]' "$RUNNER"; then
        fail "$RUNNER still carries a hardcoded version specifier (lines above)"
    fi
    # Catch a bare literal too: a stray 0.2.18 anywhere in the file is the same bug
    # wearing a different shape.
    if grep -nE '[0-9]+\.[0-9]+\.[0-9]+' "$RUNNER" | grep -v '^\s*#'; then
        fail "$RUNNER still carries a version-looking literal outside comments"
    fi
    expected=$(sdk_version)
    got=$(OVERLAY_SDK_SPEC= resolved_spec)
    [ "$got" = "oneflow-sdk==$expected" ] \
        || fail "resolved spec '$got' != 'oneflow-sdk==$expected' from sdk/pyproject.toml"

    # --- The half this guard was missing, and it cost 13 dead evals ---
    #
    # --print-spec returns BEFORE the runner cds into the cloned plugin repo, so
    # asking it here proves only that the derivation works from the oneflow root.
    # The production path derives AFTER that cd. Round-1 of the compose-overlay
    # re-verification found the derivation blew up there while every civ_pin_*
    # eval stayed green — the guard measured the side door.
    #
    # (a) Static: the spec must be computed before the cd, in file order.
    spec_line=$(grep -nE '^SDK_SPEC=' "$RUNNER" | head -1 | cut -d: -f1)
    cd_line=$(grep -nE '^cd "\$CACHE_DIR"' "$RUNNER" | head -1 | cut -d: -f1)
    [ -n "$spec_line" ] && [ -n "$cd_line" ] \
        || fail "could not locate the SDK_SPEC assignment and the cd in $RUNNER"
    [ "$spec_line" -lt "$cd_line" ] \
        || fail "$RUNNER computes SDK_SPEC (line $spec_line) AFTER cd into the clone (line $cd_line) — the derivation will resolve against the plugin repo and every render eval dies"

    # (b) Dynamic: the derivation must survive being called from inside a
    # DIFFERENT git repo, which is exactly what the cd creates.
    other=$(mktemp -d)
    ( cd "$other" && git init -q . && mkdir -p sdk )
    runner_abs="$PWD/$RUNNER"
    from_elsewhere=$( cd "$other" && OVERLAY_SDK_SPEC= bash "$runner_abs" --print-spec 2>&1 ) || true
    rm -rf "$other"
    [ "$from_elsewhere" = "oneflow-sdk==$expected" ] \
        || fail "called from inside another git repo the runner resolved '$from_elsewhere' instead of 'oneflow-sdk==$expected' — the root is being read at call time, not pinned"

    echo "OK: no literal pin; resolves oneflow-sdk==$expected before the cd (line $spec_line < $cd_line) and from inside a foreign git repo"
    ;;

teeth)
    # AC-6: the derivation must FOLLOW pyproject, not merely agree with it today.
    # Perturb a COPY in a temp root; the real tree is never touched.
    current=$(sdk_version)
    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    mkdir -p "$tmp/sdk"
    # A version that is deliberately NOT the current one, and not 0.2.18 either —
    # so a runner that kept the old literal cannot pass by coincidence.
    fake="9.9.9"
    sed "s/^version = .*/version = \"$fake\"/" sdk/pyproject.toml >"$tmp/sdk/pyproject.toml"

    perturbed=$(SDK_VERSION_ROOT="$tmp" OVERLAY_SDK_SPEC= resolved_spec)
    [ "$perturbed" = "oneflow-sdk==$fake" ] \
        || fail "perturbed pyproject says $fake but runner resolved '$perturbed' — the pin does not follow pyproject (this is the fail-open CI-a exists to close)"

    restored=$(OVERLAY_SDK_SPEC= resolved_spec)
    [ "$restored" = "oneflow-sdk==$current" ] \
        || fail "after perturbation the runner resolved '$restored', expected 'oneflow-sdk==$current'"
    echo "OK: perturbed pyproject ($fake) moved the spec; real tree still resolves $current"
    ;;

override)
    # AC-7: the local-wheel escape hatch still wins over the derived value.
    got=$(OVERLAY_SDK_SPEC="oneflow-sdk @ file:///tmp/does-not-exist.whl" resolved_spec)
    [ "$got" = "oneflow-sdk @ file:///tmp/does-not-exist.whl" ] \
        || fail "OVERLAY_SDK_SPEC was ignored; runner resolved '$got'"
    echo "OK: OVERLAY_SDK_SPEC takes precedence over the derived pin"
    ;;

single-impl)
    # AC-8: exactly one definition of the parsing law, and both consumers use it.
    [ -f "$LIB" ] || fail "missing $LIB — the shared law must live in one file"
    # The parsing expression may appear only inside the shared lib. Guards that
    # merely *call* it are fine; a second copy of the sed/grep pair is not.
    copies=$(grep -rlE "grep -E '\^version = '" scripts/ --include='*.sh' | grep -v "^$LIB$" || true)
    if [ -n "$copies" ]; then
        fail "second copy of the version-parsing law in: $copies"
    fi
    for consumer in "$RUNNER" "$TRAIN"; do
        grep -q 'scripts/lib/sdk-version.sh' "$consumer" \
            || fail "$consumer does not source the shared $LIB"
    done
    echo "OK: one parsing law in $LIB; both $RUNNER and $TRAIN source it"
    ;;

*)
    fail "unknown mode '$MODE' (shape|teeth|override|single-impl)"
    ;;
esac
