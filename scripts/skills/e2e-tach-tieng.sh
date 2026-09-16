#!/usr/bin/env bash
# E8 (skill-system-v1, AC-8) — run «tach-tieng-video» end to end through the
# real app on a per-run space: upload a sample video, submit the skill, follow
# the task's SSE stream to its end, then check each manifest output is a real
# file of the right kind.
#
# Exit codes: 0 pass · 1 the product failed (message names the output) · 2 a
# precondition could not be set (message names the TD row — see luot.sh).
#
# Red half: SSV1_SAMPLE_SILENT=1 generates the sample WITHOUT an audio track.
# Measured 2026-09-16: the real extract-audio plugin then fails, so this must
# exit 1 with `run status failed` and a run view naming failedNodeIds ["a1"].
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
LUOT_SH="$ROOT/scripts/skills/luot.sh"
SKILL=tach-tieng-video

command -v ffprobe >/dev/null 2>&1 || { echo "tien de TD-6 hong: ffprobe not on PATH" >&2; exit 2; }

SET_LINE="$("$LUOT_SH" dat)"
rc=$?
[ "$rc" -eq 0 ] || exit "$rc"
eval "$SET_LINE"
trap '"$LUOT_SH" tra "$LUOT" >/dev/null 2>&1' EXIT
echo "luot: $LUOT · $BASE"

fail() {
    echo "FAIL: $1"
    [ -n "${view:-}" ] && echo "--- run view ---" && printf '%s\n' "$view"
    if [ -n "${task_id:-}" ] && [ -f "$LUOT/data/tongflow.db" ]; then
        echo "--- tasks.result ---"
        sqlite3 "$LUOT/data/tongflow.db" "select result from tasks where id='$task_id'" 2>/dev/null
    fi
    echo "--- dev.log (tail) ---"
    tail -40 "$LUOT/dev.log" 2>/dev/null
    exit 1
}

json() {
    node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const v=process.argv[1].split(".").reduce((o,k)=>o?.[k],JSON.parse(s));process.stdout.write(typeof v==="string"?v:JSON.stringify(v??null))})' "$1"
}

upload="$(curl -s -F "file=@$LUOT/mau.mp4" "$BASE/api/upload")"
file_key="$(printf '%s' "$upload" | json fileKey)"
[ -n "$file_key" ] && [ "$file_key" != "null" ] || fail "upload returned no fileKey: $upload"

submit="$(curl -s -w '\n%{http_code}' -H 'content-type: application/json' \
    -d "{\"params\":{\"video\":{\"fileKey\":\"$file_key\",\"name\":\"mau.mp4\"}}}" \
    "$BASE/api/skills/$SKILL/run")"
status_code="$(printf '%s' "$submit" | tail -1)"
body="$(printf '%s' "$submit" | sed '$d')"
[ "$status_code" = "200" ] || fail "submit returned $status_code: $body"
task_id="$(printf '%s' "$body" | json taskId)"
echo "task: $task_id"

# Opening the wait stream dispatches the task; read until a terminal event.
curl -s -N --max-time 900 "$BASE/api/task/wait?taskId=$task_id" \
    | while IFS= read -r line; do
        case "$line" in
            *WORKFLOW_COMPLETED*|*WORKFLOW_FAILED*) echo "$line"; break ;;
        esac
    done >"$LUOT/terminal.txt"
[ -s "$LUOT/terminal.txt" ] || fail "no terminal event on the task stream within 900s"

view="$(curl -s "$BASE/api/skills/runs/$task_id")"
run_status="$(printf '%s' "$view" | json status)"
[ "$run_status" = "completed" ] || fail "run status $run_status: $view"

count_streams() {
    ffprobe -v error -select_streams "$1" -show_entries stream=index -of csv=p=0 "$2" 2>/dev/null | grep -c . || true
}

checked=0
for key in tieng video-cam; do
    values="$(printf '%s' "$view" | json "outputs.$key.values")"
    first="$(printf '%s' "$values" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const a=JSON.parse(s||"[]");process.stdout.write(a[0]??"")})')"
    [ -n "$first" ] || fail "output $key: no file key in run view"
    path="$LUOT/data/uploads/$first"
    [ -f "$path" ] || fail "output $key: file missing at $path"
    [ -s "$path" ] || fail "output $key: file is empty"
    audio="$(count_streams a "$path")"
    video="$(count_streams v "$path")"
    case "$key" in
        tieng)
            [ "$audio" -ge 1 ] || fail "output tieng: no audio stream"
            [ "$video" -eq 0 ] || fail "output tieng: has a video stream"
            ;;
        video-cam)
            [ "$video" -ge 1 ] || fail "output video-cam: no video stream"
            [ "$audio" -eq 0 ] || fail "output video-cam: still has an audio stream"
            ;;
    esac
    echo "PASS output $key: $(wc -c <"$path" | tr -d ' ') bytes · audio=$audio video=$video"
    checked=$((checked + 1))
done
[ "$checked" -eq 2 ] || fail "checked $checked of 2 outputs"
echo "PASS e2e $SKILL"
