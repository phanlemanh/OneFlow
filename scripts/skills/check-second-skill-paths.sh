#!/usr/bin/env bash
# E16 (skill-system-v1, AC-12) — adding the second skill needed no change to
# the frame. Three named halves, each prints PASS/FAIL with its detail:
#
#   paths          the commit that ADDED src/lib/skills/tach-tieng-video/manifest.ts
#                  touches only that skill's dir, src/i18n/messages/*, and
#                  src/lib/skills/registry.ts with exactly one added line
#   frame-before   at that commit's PARENT (a temp worktree), the frame's own
#                  tests are green without the second skill
#   no-special     at HEAD, no product file of the frame names the second skill
#                  or its slots (tests, registry.ts and test-support excluded —
#                  registry.ts is counted by `paths`)
#
#   --teeth        builds throwaway repos with known-bad histories and requires
#                  `paths` and `no-special` to go red on each, naming the path;
#                  `frame-before` needs the full app and is not re-run there.
#
# Exit: 0 all halves pass · 1 a half failed · 2 the history is not measurable
# (the adding commit is missing or ambiguous).
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SKILL=tach-tieng-video
MANIFEST="src/lib/skills/$SKILL/manifest.ts"
SPECIAL='tach-tieng-video|tachTiengVideo|extract-audio|remove-video-audio'

adding_commit() {
    git -C "$1" log --diff-filter=A --format=%H -- "$MANIFEST"
}

half_paths() {
    local repo="$1" commits count c bad=0 numstat added removed line
    commits="$(adding_commit "$repo")"
    count=$(printf '%s' "$commits" | grep -c . || true)
    if [ "$count" -ne 1 ]; then
        echo "FAIL paths: found $count commits adding $MANIFEST"
        return 2
    fi
    c="$commits"
    while IFS= read -r path; do
        [ -z "$path" ] && continue
        case "$path" in
            "src/lib/skills/$SKILL/"*|src/i18n/messages/*|src/lib/skills/registry.ts) ;;
            *) echo "FAIL paths: commit ${c:0:8} touches $path"; bad=1 ;;
        esac
    done < <(git -C "$repo" show --name-only --format= "$c")
    numstat="$(git -C "$repo" show --numstat --format= "$c" -- src/lib/skills/registry.ts)"
    added=$(printf '%s' "$numstat" | awk '{print $1}')
    removed=$(printf '%s' "$numstat" | awk '{print $2}')
    if [ "${added:-0}" != "1" ] || [ "${removed:-0}" != "0" ]; then
        echo "FAIL paths: registry.ts +${added:-0} -${removed:-0} in ${c:0:8}, expected +1 -0"
        bad=1
    else
        line="$(git -C "$repo" show --format= "$c" -- src/lib/skills/registry.ts | grep '^+[^+]')"
        case "$line" in
            *"./$SKILL"*) ;;
            *) echo "FAIL paths: registry.ts added line does not import ./$SKILL: $line"; bad=1 ;;
        esac
    fi
    [ "$bad" -eq 0 ] && echo "PASS paths: ${c:0:8} touches only the skill dir, i18n and one registry line"
    return "$bad"
}

half_no_special() {
    local repo="$1" hits
    hits="$(git -C "$repo" grep -n -E "$SPECIAL" HEAD -- \
        ':(glob)src/lib/skills/*.ts' 'src/lib/task' 'src/app/api' 'src/lib/workflow' \
        ':!*.test.ts' ':!*.test.tsx' ':!src/lib/skills/registry.ts' ':!src/lib/skills/test-support' 2>/dev/null)"
    if [ -n "$hits" ]; then
        printf '%s\n' "$hits" | sed 's/^HEAD:/FAIL no-special: /'
        return 1
    fi
    echo "PASS no-special: no frame file names the second skill or its slots"
}

half_frame_before() {
    local c wt rc
    c="$(adding_commit "$ROOT")"
    wt="$(mktemp -d "${TMPDIR:-/tmp}/ssv1-frame.XXXXXX")"
    git -C "$ROOT" worktree add --detach "$wt" "$c^" >/dev/null 2>&1 || {
        echo "FAIL frame-before: could not check out ${c:0:8}^"
        rm -rf "$wt"
        return 1
    }
    # Same lockfile at the parent → reuse this tree's install instead of a
    # network install; a different lockfile means the parent is not comparable.
    if ! cmp -s "$ROOT/pnpm-lock.yaml" "$wt/pnpm-lock.yaml"; then
        echo "FAIL frame-before: lockfile differs at ${c:0:8}^ — cannot reuse node_modules"
        git -C "$ROOT" worktree remove --force "$wt" >/dev/null 2>&1
        return 1
    fi
    ln -s "$ROOT/node_modules" "$wt/node_modules"
    (cd "$wt" && "$ROOT/node_modules/.bin/vitest" run \
        src/lib/skills/registry.test.ts src/lib/skills/instantiate.test.ts \
        src/lib/task/runner-skill.test.ts >"$wt.log" 2>&1)
    rc=$?
    git -C "$ROOT" worktree remove --force "$wt" >/dev/null 2>&1
    if [ "$rc" -ne 0 ]; then
        echo "FAIL frame-before: frame tests red at ${c:0:8}^ (exit $rc)"
        tail -20 "$wt.log"
        rm -f "$wt.log"
        return 1
    fi
    rm -f "$wt.log"
    echo "PASS frame-before: registry, instantiate and runner tests green at ${c:0:8}^ without $SKILL"
}

run_all() {
    local fail=0 rc
    half_paths "$ROOT"; rc=$?
    [ "$rc" -eq 2 ] && exit 2
    [ "$rc" -ne 0 ] && fail=1
    half_frame_before || fail=1
    half_no_special "$ROOT" || fail=1
    exit "$fail"
}

# ---------- teeth ----------
make_repo() {
    local r
    r="$(mktemp -d "${TMPDIR:-/tmp}/ssv1-teeth.XXXXXX")"
    git -C "$r" init -q
    git -C "$r" config user.email teeth@example.invalid
    git -C "$r" config user.name teeth
    mkdir -p "$r/src/lib/skills/cat-canh-video" "$r/src/lib/task" "$r/src/lib/workflow" "$r/src/i18n/messages"
    echo 'export { skill as catCanhVideo } from "./cat-canh-video";' >"$r/src/lib/skills/registry.ts"
    echo 'export const x = 1;' >"$r/src/lib/task/runner.ts"
    echo 'export const y = 1;' >"$r/src/lib/workflow/exporter.ts"
    echo '{}' >"$r/src/i18n/messages/vi.json"
    git -C "$r" add -A && git -C "$r" commit -qm frame
    printf '%s' "$r"
}

add_skill_commit() {
    local r="$1" registry_lines="$2" extra="$3"
    mkdir -p "$r/src/lib/skills/$SKILL"
    # A real manifest names its own id and slots: the clean case must still
    # pass, which is what proves no-special does not scan the skill's own dir.
    printf 'export const manifest = { id: "%s", requires: ["extract-audio"] };\n' "$SKILL" >"$r/$MANIFEST"
    for _ in $(seq 1 "$registry_lines"); do
        echo "export { skill as tachTiengVideo } from \"./$SKILL\";" >>"$r/src/lib/skills/registry.ts"
    done
    [ -n "$extra" ] && echo "// $extra" >>"$r/$extra"
    git -C "$r" add -A && git -C "$r" commit -qm "add $SKILL"
}

expect_case() {
    local name="$1" half="$2" want="$3" needle="$4" out rc
    out="$($half "$REPO" 2>&1)"; rc=$?
    if [ "$want" = pass ] && [ "$rc" -eq 0 ]; then
        echo "  ok   $name"
    elif [ "$want" = fail ] && [ "$rc" -ne 0 ] && printf '%s' "$out" | grep -qF "$needle"; then
        echo "  ok   $name (red: $(printf '%s' "$out" | grep -F "$needle" | head -1))"
    else
        echo "  MISS $name — wanted $want${needle:+ with '$needle'}, got exit $rc: $out"
        TEETH_FAIL=1
    fi
    rm -rf "$REPO"
}

run_teeth() {
    TEETH_FAIL=0
    REPO="$(make_repo)"; add_skill_commit "$REPO" 1 ""
    expect_case "clean history: paths" half_paths pass ""
    REPO="$(make_repo)"; add_skill_commit "$REPO" 1 ""
    expect_case "clean history: no-special" half_no_special pass ""
    REPO="$(make_repo)"; add_skill_commit "$REPO" 1 "src/lib/workflow/exporter.ts"
    expect_case "skill commit also edits the exporter" half_paths fail "touches src/lib/workflow/exporter.ts"
    REPO="$(make_repo)"; add_skill_commit "$REPO" 2 ""
    expect_case "skill commit adds two registry lines" half_paths fail "registry.ts +2 -0"
    REPO="$(make_repo)"
    echo 'if (skillId === "tach-tieng-video") { /* special */ }' >>"$REPO/src/lib/task/runner.ts"
    git -C "$REPO" add -A && git -C "$REPO" commit -qm "prepare runner"
    add_skill_commit "$REPO" 1 ""
    expect_case "parent commit adds a runner branch for the skill" half_no_special fail "src/lib/task/runner.ts"
    echo "  note frame-before is not re-run here (needs the full app); it runs in the plain mode"
    [ "$TEETH_FAIL" -eq 0 ] && echo "TEETH PASS 5/5" || echo "TEETH FAIL"
    exit "$TEETH_FAIL"
}

case "${1:-}" in
    --teeth) run_teeth ;;
    "") run_all ;;
    *) echo "usage: check-second-skill-paths.sh [--teeth]" >&2; exit 2 ;;
esac
