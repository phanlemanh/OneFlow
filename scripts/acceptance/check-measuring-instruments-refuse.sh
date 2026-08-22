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
port=8${RANDOM:0:3}
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
# CLASS, not case. Thirteen executor keys derive the same pin; the finding
# named one, and patching only that one is the exact mistake this feature made
# twice already with the range-unit list.
#
# The first version of this check asserted "no line uses the inline form" plus
# "at least one line uses the guarded form" — a point case wearing a class
# claim, since twelve keys could be unguarded in some OTHER spelling and it
# would still pass (S4 round 6 finding). It now walks EVERY executor line that
# names the engine and requires the guard on each one, and reports the count it
# actually checked so a silent drop to zero lines cannot read as success.
engine_lines="$(grep -n 'vietnormalizer' _acceptance/config.yaml \
    | grep -vE '^[0-9]+: *#' \
    | grep -E 'uv run|--with' || true)"
checked=0
while IFS= read -r line; do
    [ -z "$line" ] && continue
    checked=$((checked + 1))
    case "$line" in
        *'${pin:?'*) ;;
        *) fail "executor key derives the pin with NO guard:
$line" ;;
    esac
done <<<"$engine_lines"

[ "$checked" -ge 10 ] || fail \
    "only $checked executor keys naming the engine were found — the measurement lost
its subject; this is not a clean config (12 keys measured on 2026-08-22)"
echo "  (checked $checked executor keys; each must carry the \${pin:?…} guard)"

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
