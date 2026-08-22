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
#
# The default root is resolved ONCE, when this file is sourced, and never again.
# Resolving it per call reads whatever repo the caller has since cd'd into:
# run-overlay-plugin-tests.sh cds into the cloned plugin repo before installing,
# so a call-time `git rev-parse --show-toplevel` returned the PLUGIN root, found
# no sdk/pyproject.toml, and killed all 13 render evals under `set -e`. The
# clean-context re-verification of compose-overlay caught it; this line is the
# fix for the whole class, not just that one call site.
#
# Anchored to THIS FILE's location, not to the caller's cwd and not to
# `git rev-parse`: the repo root is two levels above scripts/lib/. A cwd-derived
# root is wrong from inside the plugin clone; a git-derived one is wrong from
# inside any other repo. The file's own path is neither.
_SDK_VERSION_DEFAULT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

sdk_version() {
    local root
    root="${SDK_VERSION_ROOT:-$_SDK_VERSION_DEFAULT_ROOT}"
    [ -n "$root" ] || { echo "sdk-version: no repo root resolved at source time" >&2; return 2; }
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

# The reading ENGINE's requirement specifier, derived from the same file for the
# same reason. normalize-text-vi pins vietnormalizer exactly, because a patch
# release there changes how a number is spoken.
#
# Added 2026-08-22 after a review found the derivation re-implemented in three
# scripts and twelve config keys, in two incompatible regex dialects — a pin
# written `vietnormalizer == 0.2.3` matched in one and not the other. This
# file's own header calls that "the failure family this repo already paid for";
# the second copy had simply been written anyway (S4 round 7 finding).
reader_pin() {
    local root
    root="${SDK_VERSION_ROOT:-$_SDK_VERSION_DEFAULT_ROOT}"
    [ -n "$root" ] || { echo "sdk-version: no repo root resolved at source time" >&2; return 2; }
    local toml="$root/sdk/pyproject.toml"
    [ -f "$toml" ] || { echo "sdk-version: no such file: $toml" >&2; return 2; }

    # Tolerant of the whitespace a formatter may introduce around `==`, then
    # re-emitted in the canonical form. Matching only the tight spelling is how
    # one dialect went silently blind while its sibling still matched.
    local v
    v=$(grep -oE '"vietnormalizer[[:space:]]*==[[:space:]]*[0-9]+(\.[0-9]+)+"' "$toml" \
        | head -1 | tr -d '" ' | sed 's/vietnormalizer==//')
    case "$v" in
        [0-9]*.[0-9]*) ;;
        *) echo "sdk-version: could not parse a vietnormalizer pin out of $toml (got '$v')" >&2; return 2 ;;
    esac
    printf 'vietnormalizer==%s\n' "$v"
}
