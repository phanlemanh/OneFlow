#!/usr/bin/env bash
#
# preflight-verify-env.sh — machine-run preflight for one verify round.
#
# WHY THIS IS A SCRIPT AND NOT A PARAGRAPH
# STATUS.md "§Bẫy đã biết" has recorded the agk-baseline node_modules hazard —
# together with its safe fix — since 2026-07-28 (commit 3ad98c8, found with
# `git log -S'frozen-lockfile' -- STATUS.md`; do not cite a line number, they
# drift). Three verify rounds of `chong-doc-sai-em-ru` still read the resulting
# red cells as code regressions. The defect being fixed here IS "written down
# and never read", so adding another sentence for humans would reproduce it.
# This runs on the machine, every round, and prints the classification itself.
#
# CONTRACT
#   exit 0  no recorded hazard is active — this round's red cells are real signal
#   exit 1  a hazard is active — every pnpm/node red cell this round is SUSPECT
#
# It never invokes pnpm and never resolves anything through node_modules, so it
# still runs on the exact broken tree it is meant to diagnose.
#
# HOW IT IS WIRED (repo-local on purpose)
# Declared as `executors.script.preflight_env` and listed in
# `feature_loop.suite_keys` in _acceptance/config.yaml. The kit skill resolves
# suite_keys into the workflow's `suiteCommands` (feature-loop SKILL.md, step
# "suiteCommands = resolve list feature_loop.suite_keys"), so every verify round
# runs it. The kit's own workflow file lives in the plugin cache and would be
# lost on upgrade; config.yaml and this script are in the repo.
#
# ADDING A TRAP
# One `check_*` function + one call in `main`. Only add traps a machine can
# decide on its own; a trap needing human judgement does not belong here.

set -uo pipefail

REPO_ROOT="${1:-}"
if [ -z "$REPO_ROOT" ]; then
  REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
fi
cd "$REPO_ROOT" 2>/dev/null || {
  echo "preflight-verify-env: không vào được repo root '$REPO_ROOT'"
  exit 1
}

MODULES_YAML="node_modules/.modules.yaml"
FAILED=0

pass() { printf '[PASS] %-20s %s\n' "$1" "$2"; }
fail() { printf '[FAIL] %-20s %s\n' "$1" "$2"; FAILED=1; }

# Reads one scalar out of node_modules/.modules.yaml. pnpm writes that file as
# JSON despite the .yaml suffix, and older pnpm wrote real YAML, so the quotes
# and the trailing comma are both optional in the pattern.
read_modules_field() {
  sed -n "s/^[[:space:]]*\"\{0,1\}$1\"\{0,1\}[[:space:]]*:[[:space:]]*\"\{0,1\}\([^\",]*\)\"\{0,1\},\{0,1\}[[:space:]]*$/\1/p" \
    "$MODULES_YAML" 2>/dev/null | head -1
}

# TRAP: the kit's A/B baseline agent builds a throwaway worktree under
# $(mktemp -d)/agk-baseline and running pnpm against it rewrites THIS tree's
# bookkeeping to point at that directory. The temp directory is then deleted, so
# every later pnpm command dies in its dependency check
# (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY, exit 1) on a code tree that is
# entirely green.
#
# Two rules learned the expensive way, do not regress them:
#  - Never judge by the SHAPE of the path. The real broken value is RELATIVE
#    ("../../../../../private/var/folders/.../agk-baseline/node_modules/.pnpm"),
#    so "relative = healthy, absolute = broken" yields a false negative on a
#    tree that is already dead. Resolve the path and test that it exists.
#  - Never count entries under node_modules/.pnpm. A broken tree still holds all
#    474 of them; only the bookkeeping file was overwritten.
check_pnpm_virtual_store() {
  if [ ! -d node_modules ]; then
    fail pnpm-virtual-store "không có node_modules/ — deps chưa cài ở cây này"
    return
  fi
  if [ ! -f "$MODULES_YAML" ]; then
    fail pnpm-virtual-store "thiếu $MODULES_YAML — sổ sách pnpm không còn"
    return
  fi

  local vsd resolved
  vsd="$(read_modules_field virtualStoreDir)"
  if [ -z "$vsd" ]; then
    fail pnpm-virtual-store "$MODULES_YAML không khai virtualStoreDir — không đọc được sổ sách"
    return
  fi

  case "$vsd" in
    /*) resolved="$vsd" ;;
    *)  resolved="node_modules/$vsd" ;;
  esac

  if [ -d "$resolved" ]; then
    pass pnpm-virtual-store "virtualStoreDir=\"$vsd\" giải ra thư mục CÓ thật"
  else
    fail pnpm-virtual-store "virtualStoreDir=\"$vsd\" giải ra đường KHÔNG tồn tại"
  fi
}

# Independent tell, cheap and specific: the temp worktree may still exist on
# disk (so the check above passes) while the bookkeeping still points out of
# this tree. Naming the kit's own directory keeps the diagnosis unambiguous.
check_pnpm_foreign_worktree() {
  if [ ! -f "$MODULES_YAML" ]; then
    return
  fi
  if grep -q 'agk-baseline' "$MODULES_YAML"; then
    fail pnpm-foreign-tree "$MODULES_YAML trỏ vào worktree baseline của kit (agk-baseline)"
  else
    pass pnpm-foreign-tree "sổ sách không nhắc worktree lạ (agk-baseline)"
  fi
}

# The symptom STATUS.md actually recorded: top-level entries under node_modules
# become symlinks into the deleted temp store. Catches a corrupted tree whose
# bookkeeping file was restored but whose links were not.
check_pnpm_live_links() {
  if [ ! -d node_modules ]; then
    return
  fi
  local dangling=0 example="" total=0 p
  for p in node_modules/* node_modules/@*/*; do
    [ -e "$p" ] && { total=$((total + 1)); continue; }
    [ -L "$p" ] || continue
    dangling=$((dangling + 1))
    [ -z "$example" ] && example="$p"
  done
  if [ "$dangling" -eq 0 ]; then
    pass pnpm-live-links "$total liên kết node_modules cấp 1 đều giải được"
  else
    fail pnpm-live-links "$dangling liên kết node_modules cấp 1 bị treo (vd $example)"
  fi
}

main() {
  echo "preflight-verify-env: repo=$REPO_ROOT — bẫy đã ghi ở STATUS.md §Bẫy đã biết"
  check_pnpm_virtual_store
  check_pnpm_foreign_worktree
  check_pnpm_live_links

  if [ "$FAILED" -eq 0 ]; then
    echo "VERDICT: GREEN — không bẫy hạ tầng nào đang hoạt động. Ô đỏ của lệnh pnpm/node vòng này là tín hiệu THẬT, đọc như hồi quy."
    return 0
  fi

  # Kept last so it survives a truncated output tail: the verifier agent
  # captures only the final ~10 lines of each command.
  cat <<'EOF'
VERDICT: RED — cây node_modules của repo này đang hỏng. Đây là bẫy "agent baseline của kit phá node_modules cây gốc", ghi ở STATUS.md §Bẫy đã biết từ commit 3ad98c8 (28/07/2026).
=> MỌI ô đỏ của lệnh chạy qua pnpm/node trong vòng verify này là NGHI NGỜ (hạ tầng), KHÔNG được đọc là hồi quy của mã.
=> Gỡ:  CI=true pnpm install --frozen-lockfile  — rồi đối chiếu  shasum -a 1 pnpm-lock.yaml  trước/sau để chắc lockfile không đổi.
=> TUYỆT ĐỐI không chạy `pnpm install` trần: lockfile đã commit có importer packages/proprietary không tồn tại trong repo public, install trần có thể prune và ghi lại nó.
=> Gỡ xong thì chạy LẠI vòng verify. Bằng chứng của vòng này không dùng được.
EOF
  return 1
}

main
