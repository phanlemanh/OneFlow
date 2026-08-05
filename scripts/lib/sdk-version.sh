#!/usr/bin/env bash
# The ONE place that knows how to read the SDK version out of sdk/pyproject.toml.
#
# Two guards need this fact: check-overlay-sdk-train.sh (does the plugin pin the
# released version?) and run-overlay-plugin-tests.sh (which SDK do the render
# evals install?). They used to answer it differently — the train guard derived
# it, the test runner hardcoded `oneflow-sdk==0.2.18` — so the next SDK bump
# would have left 13 overlay_* evals green while testing a combination nobody
# ships. One law, one file: a second copy is the failure family this repo already
# paid for (per-plugin-origin's "fourth copy of the URL rule").
#
# Source it, then call sdk_version / sdk_spec:
#   . "$(git rev-parse --show-toplevel)/scripts/lib/sdk-version.sh"
#
# SDK_VERSION_ROOT overrides the repo root. It exists so a guard can perturb a
# COPY of pyproject.toml in a temp dir and watch the derived value follow —
# proving the derivation has teeth without ever dirtying the real tree.

sdk_version() {
    local root
    root="${SDK_VERSION_ROOT:-$(git rev-parse --show-toplevel)}"
    local toml="$root/sdk/pyproject.toml"
    [ -f "$toml" ] || { echo "sdk-version: no such file: $toml" >&2; return 2; }

    local v
    v=$(grep -E '^version = ' "$toml" | head -1 | sed 's/version = "\(.*\)"/\1/')
    # An empty or unparsed value must not become `oneflow-sdk==` — that installs
    # "latest" silently, which is the same fail-open wearing different clothes.
    case "$v" in
        [0-9]*.[0-9]*) ;;
        *) echo "sdk-version: could not parse a version out of $toml (got '$v')" >&2; return 2 ;;
    esac
    printf '%s\n' "$v"
}

# The pip/uv requirement specifier the plugin lane installs.
# OVERLAY_SDK_SPEC wins: CI points at a local wheel in the window between
# "types generated" and "release on PyPI".
sdk_spec() {
    if [ -n "${OVERLAY_SDK_SPEC:-}" ]; then
        printf '%s\n' "$OVERLAY_SDK_SPEC"
        return 0
    fi
    local v
    v=$(sdk_version) || return $?
    printf 'oneflow-sdk==%s\n' "$v"
}
