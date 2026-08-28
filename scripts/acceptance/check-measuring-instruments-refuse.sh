#!/usr/bin/env bash
# E18 — the MEASURING INSTRUMENTS must refuse when they cannot measure.
#
# Every expensive defect in this feature had the same shape: an instrument that
# produced a clean-looking result while measuring nothing. A capture written in
# the fallback locale, a shared executor whose version pin silently resolved to
# the empty string. Both were found by a human reading the code, because
# nothing anywhere went red. This script is the red.
#
# Two claims, both about refusal:
#   1. ui-capture REFUSES to write, and removes any stale frame, when the page
#      renders in a locale other than the one --lang asked for — even if the
#      --require string is present (a product name is locale-independent).
#   2. the shared sdk_pytest executor fails with ONE legible line when the
#      vietnormalizer pin cannot be derived from sdk/pyproject.toml, instead of
#      passing an empty --with that swallows the next argument.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
tmp="$(mktemp -d)"
# Port chosen by the OS, not by slicing $RANDOM. The first version built one as
# `8${RANDOM:0:3}`, which yields a PRIVILEGED port whenever $RANDOM is short
# (RANDOM=7 → port 87) and collides freely when ~45 verification agents run at
# once. It failed that way in round 8 — "could not start the static server" —
# so the measurement went red for a reason that has nothing to do with what it
# measures. A measurement that can fail for unrelated reasons reports noise as
# a finding.
port="$(python3 -c "import socket
s = socket.socket()
s.bind((\"127.0.0.1\", 0))
print(s.getsockname()[1])
s.close()")"
server_pid=""
cleanup() {
    if [ -n "$server_pid" ]; then
        kill "$server_pid" 2>/dev/null || true
        # ...and reap it, so the shell does not print a job-control notice on
        # stderr after the OK line. Evidence output must be exactly what the
        # script chose to say.
        wait "$server_pid" 2>/dev/null || true
    fi
    rm -rf "$tmp"
}
trap cleanup EXIT

fail() { echo "FAIL: $*"; exit 1; }

# ---------------------------------------------------------------- claim 1 ---
mkdir -p "$tmp/pages"
printf '<!doctype html><html lang="vi"><body><h1>OneFlow</h1></body></html>' > "$tmp/pages/vi.html"
printf '<!doctype html><html lang="en"><body><h1>OneFlow</h1></body></html>' > "$tmp/pages/en.html"
( cd "$tmp/pages" && python3 -m http.server "$port" >/dev/null 2>&1 ) &
server_pid=$!
for _ in $(seq 1 30); do
    curl -sf "http://localhost:$port/vi.html" >/dev/null 2>&1 && break
    sleep 0.2
done
curl -sf "http://localhost:$port/vi.html" >/dev/null 2>&1 || fail "could not start the static server this measurement needs"

shot="$tmp/shot.png"
capture() {
    node scripts/ui-capture.mjs --url "http://localhost:$port/$1" --out "$shot" \
        --lang vi --require 'OneFlow' 2>&1 || true
}

rm -f "$shot"
capture vi.html >/dev/null
[ -f "$shot" ] || fail "the capture refused a page in the REQUESTED locale — the measurement blocks itself"

# The stale frame from the good run is deliberately left in place: refusing to
# write is not enough if the previous frame survives to be filed as evidence.
out="$(capture en.html)"
grep -q 'REFUSED' <<<"$out" \
    || fail "a wrong-locale page (lang=en, --lang vi) was NOT refused: $out"
[ -f "$shot" ] \
    && fail "refused, but the stale frame survived — a later run would file it as evidence"

# ---------------------------------------------------------------- claim 2 ---
# CLASS, not case — and the class must be selected by a property of the
# SUBJECT, never by the property being measured.
#
# Three shapes of this check, two of them unsound:
#   v1 "no line uses the inline form" + "at least one uses the guard" — a point
#      case wearing a class claim (S4 round 6).
#   v2 every line matching `grep vietnormalizer`. After the derivation moved
#      into scripts/lib/sdk-version.sh, the only occurrence of that word on an
#      executor line is INSIDE the guard message this check looks for — so a key
#      that loses its guard also loses the word, is never selected, and is never
#      flagged. The check could not go red on the regression it claims to catch
#      (S4 round 11); the old red-direction proof passed only because that
#      particular break happened to put the word back.
#   v3 every `sdk_pytest*` key — sound selector, wrong set: 61 keys match and 49
#      of them never install the engine.
#
# What actually defines the class: the key runs a test that NEEDS the reading
# engine. Read off the TEST FILE, which cannot be changed by editing the guard.
needs_engine_lines=""
while IFS= read -r line; do
    [ -z "$line" ] && continue
    # Files AND directories: `tests/conformance` is a real target and matching
    # only `*.py` dropped it into the "whole suite" branch below, flagging a key
    # that never touches the reader (caught while making this selector sound).
    paths="$(printf '%s' "$line" | grep -oE 'tests/[A-Za-z0-9_/]+(\.py)?' || true)"
    if [ -z "$paths" ]; then
        # No explicit target = runs the whole SDK suite, which includes the reader.
        needs_engine_lines="$needs_engine_lines$line
"
        continue
    fi
    # `-k <expr>` narrows a directory target to a subset. Without reading it, a
    # key that runs `tests/conformance -k compose_overlay` looks like it needs
    # the reader merely because a SIBLING file in that directory does.
    kexpr="$(printf '%s' "$line" | grep -oE '\-k [A-Za-z0-9_]+' | sed 's/^-k //' || true)"
    if [ -n "$kexpr" ]; then
        case "$kexpr" in
            *normalize*) ;;
            *) continue ;;
        esac
    fi
    for f in $paths; do
        # IMPORTS the reader — not merely mentions it. Measured 2026-08-25:
        # only tests/test_normalize_vi.py imports the module. A conformance
        # FIXTURE named normalize-text-vi.json and a TIER_A assertion naming the
        # slot as a string both mention it without needing the engine, and
        # matching on the name pulled two unrelated features' keys in.
        if [ -e "sdk/$f" ] && grep -rq 'tongflow\.text\.normalize_vi' "sdk/$f"; then
            needs_engine_lines="$needs_engine_lines$line
"
            break
        fi
    done
done <<<"$(grep -nE '^[[:space:]]+sdk_pytest[a-z_]*:' _acceptance/config.yaml || true)"

checked=0
while IFS= read -r line; do
    [ -z "$line" ] && continue
    checked=$((checked + 1))
    case "$line" in
        *'${pin:?'*) ;;
        *) fail "executor key runs a test that needs the reading engine but derives the pin with NO guard:
$line" ;;
    esac
done <<<"$needs_engine_lines"

# Floor = the count measured when this selector was made sound. Its job is to
# catch the selector going BLIND, not to pin an exact number: extra guards on
# keys that do not need the engine are harmless and do not fail this check.
[ "$checked" -ge 9 ] || fail \
    "only $checked executor keys were found to need the reading engine — the
measurement lost its subject; this is not a clean config (9 measured 2026-08-25)"
echo "  (checked $checked executor keys whose tests need the engine; each must carry the \${pin:?…} guard)"

# The derivation is exercised through the ONE file that owns it, using the
# SDK_VERSION_ROOT override that scripts/lib/sdk-version.sh documents for
# exactly this: point it at a perturbed COPY and watch the derived value follow,
# without ever dirtying the real tree.
. "$ROOT/scripts/lib/sdk-version.sh"

mkdir -p "$tmp/root/sdk"
grep -v 'vietnormalizer' sdk/pyproject.toml > "$tmp/root/sdk/pyproject.toml"
set +e
msg="$(SDK_VERSION_ROOT="$tmp/root" reader_pin 2>&1)"
code=$?
set -e
[ "$code" -eq 0 ] && fail "the derivation succeeded with the pin line removed — --with would swallow the next argument"
grep -qi 'pin' <<<"$msg" \
    || fail "the error does not mention the pin, so a reader cannot trace the cause: $msg"

# ...and it must still succeed on the real tree, in the canonical form.
real="$(reader_pin)" || fail "the pin derivation failed on the real tree — this measurement would block every feature"
case "$real" in
    vietnormalizer==[0-9]*.[0-9]*) ;;
    *) fail "the derivation returned an unexpected shape: $real" ;;
esac

# Tolerance the tight dialect did not have: a formatter putting spaces around
# `==` must not make the pin invisible (that was the drift between the two
# copies this consolidated).
mkdir -p "$tmp/spaced/sdk"
sed 's/"vietnormalizer==/"vietnormalizer == /' sdk/pyproject.toml > "$tmp/spaced/sdk/pyproject.toml"
spaced="$(SDK_VERSION_ROOT="$tmp/spaced" reader_pin)" \
    || fail "spaces around == blinded the derivation — the dialect drift this consolidation removed"
[ "$spaced" = "$real" ] \
    || fail "the spaced pin derived a different value: $spaced vs $real"

echo "OK: capture refuses a wrong locale and clears the stale frame · shared executor reports a legible pin error"
