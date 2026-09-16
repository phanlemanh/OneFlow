#!/usr/bin/env bash
# Per-run space ("lượt") for skill-system-v1 measurements — sets and returns
# the preconditions TD-3..TD-8 of _acceptance/skill-system-v1/contract.md.
#
#   luot.sh dat [--chi-ffmpeg]   → prints `LUOT=<dir> PORT=<p> BASE=<url>` (eval it)
#   luot.sh tra <dir>            → stops the server it started, deletes <dir>
#
# Exit codes: 0 set/returned · 2 a precondition could not be set (the message
# names the TD row) — a wall of the measurement, never a product verdict.
#
# Nothing here touches the checkout's data/ or plugins/: both are pointed at
# the run dir. Port 3000 is never assumed to be this tree's server — it may
# belong to another repository — so the server is started on a free port and
# must prove it is THIS tree before anything measures against it.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EXPECT_ROOT="${SSV1_EXPECT_ROOT:-$ROOT}"

wall() {
    echo "tien de $1 hong: $2" >&2
    # A half-set run dir must not outlive the failure (`luot` is the caller's local).
    if [ -n "${luot:-}" ] && [ -d "$luot" ]; then
        for log in "$luot"/*.log; do
            [ -f "$log" ] && { echo "--- $(basename "$log") ---" >&2; tail -20 "$log" >&2; }
        done
        case "$luot" in */ssv1-luot.*) rm -rf "$luot" ;; esac
    fi
    exit 2
}

cmd_dat() {
    local only_ffmpeg=0
    [ "${1:-}" = "--chi-ffmpeg" ] && only_ffmpeg=1
    command -v ffmpeg >/dev/null 2>&1 || wall TD-6 "ffmpeg not on PATH"

    local luot
    luot="$(mktemp -d "${TMPDIR:-/tmp}/ssv1-luot.XXXXXX")" || wall TD-3 "mktemp failed"
    mkdir -p "$luot/data" "$luot/plugins"

    local plugins=(oneflow-api-ffmpeg)
    [ "$only_ffmpeg" -eq 0 ] && plugins+=(oneflow-api-pyscenedetect)
    (cd "$ROOT" && TONGFLOW_PLUGINS_DIR="$luot/plugins" pnpm -s plugins:install "${plugins[@]}") \
        >"$luot/install.log" 2>&1 || wall TD-4 "plugins:install failed"

    local audio=(-f lavfi -i "sine=frequency=440:duration=4")
    local map=(-map "[v]" -map 2:a)
    if [ "${SSV1_SAMPLE_SILENT:-0}" = "1" ]; then
        audio=()
        map=(-map "[v]")
    fi
    ffmpeg -loglevel error -y \
        -f lavfi -i "testsrc=size=640x360:rate=25:duration=2" \
        -f lavfi -i "color=c=red:size=640x360:rate=25:duration=2" \
        ${audio[@]+"${audio[@]}"} \
        -filter_complex "[0:v][1:v]concat=n=2:v=1:a=0[v]" \
        "${map[@]}" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest \
        "$luot/mau.mp4" >"$luot/ffmpeg.log" 2>&1 || wall TD-7 "sample video generation failed"

    local port=3140
    while lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
        port=$((port + 1))
        [ "$port" -gt 3199 ] && wall TD-8 "no free port in 3140-3199"
    done

    # Own process group so `tra` stops pnpm, next and its workers together.
    (
        cd "$ROOT" || exit 1
        exec env PORT="$port" TONGFLOW_DATA_DIR="$luot/data" TONGFLOW_PLUGINS_DIR="$luot/plugins" \
            NEXT_DIST_DIR=build pnpm dev --port "$port"
    ) >"$luot/dev.log" 2>&1 &
    local pid=$!
    echo "$pid" >"$luot/pid"
    echo "$port" >"$luot/port"

    local base="http://localhost:$port"
    local code=""
    for _ in $(seq 1 120); do
        code=$(curl -s -o /dev/null -w '%{http_code}' "$base/proto/skill-system-v1?state=danhsach-mac-dinh" || true)
        [ "$code" = "200" ] && break
        sleep 1
    done
    [ "$code" = "200" ] || { cmd_tra "$luot" >/dev/null 2>&1; wall TD-8 "server never served /proto/skill-system-v1 (last http $code)"; }

    local listener cwd
    listener=$(lsof -t -iTCP:"$port" -sTCP:LISTEN 2>/dev/null | head -1)
    cwd=$(lsof -a -p "$listener" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)
    if [ "$cwd" != "$EXPECT_ROOT" ]; then
        cmd_tra "$luot" >/dev/null 2>&1
        wall TD-8 "may chu khong phai cay nay (cwd '$cwd', expected '$EXPECT_ROOT')"
    fi

    echo "LUOT=$luot PORT=$port BASE=$base"
}

kill_tree() {
    local pid="$1" child
    for child in $(pgrep -P "$pid" 2>/dev/null); do
        kill_tree "$child"
    done
    kill -TERM "$pid" 2>/dev/null || true
}

cmd_tra() {
    local luot="${1:-}"
    [ -n "$luot" ] && [ -d "$luot" ] || { echo "usage: luot.sh tra <dir>" >&2; exit 2; }
    case "$luot" in
        */ssv1-luot.*) ;;
        *) echo "refusing to touch '$luot' (not a lượt dir)" >&2; exit 2 ;;
    esac
    [ -f "$luot/pid" ] && kill_tree "$(cat "$luot/pid")"
    if [ -f "$luot/port" ]; then
        local listener
        for listener in $(lsof -t -iTCP:"$(cat "$luot/port")" -sTCP:LISTEN 2>/dev/null); do
            # Only a server started from this tree; never someone else's.
            if lsof -a -p "$listener" -d cwd -Fn 2>/dev/null | grep -qx "n$ROOT"; then
                kill_tree "$listener"
            fi
        done
    fi
    rm -rf "$luot"
}

case "${1:-}" in
    dat) shift; cmd_dat "$@" ;;
    tra) shift; cmd_tra "$@" ;;
    *) echo "usage: luot.sh dat [--chi-ffmpeg] | luot.sh tra <dir>" >&2; exit 2 ;;
esac
