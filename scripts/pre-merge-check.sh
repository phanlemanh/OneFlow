#!/usr/bin/env bash
# pre-merge-check.sh — CI gate for the Acceptance-Gate Kit.
#
# Usage: pre-merge-check.sh [repo_root] [--slug <slug>]... [--base <ref>] [--no-t1-escape]
#
# --no-t1-escape: turn off ONLY the T1-escape backstop for push-event runs
# (commits landing directly on the main branch have no PR premise); every other
# rule still runs, and the run prints a NOT ENFORCED marker plus a declared-off
# ledger line so the off state is visible, never silent.
#
# --base <ref> (or env PRE_MERGE_BASE): the PR base for the T1-escape
# backstop — changed files matching risk_tiers.t3_paths, or falling outside
# t1_skip_globs, require the PR to carry _acceptance/<slug>/ artifacts.
# Without a base the backstop is skipped with a NOTE (wire it in CI, e.g.
# GitHub Actions: --base "origin/$GITHUB_BASE_REF").
#
# For every feature in _acceptance/ whose contract has status
# implemented|verified|signed-off and risk_tier T2|T3:
#   - Gate 1 was recorded: approved_by non-empty, or gate1_skipped: true
#     (the audited escape hatch — NOTEd, not blocked)
#   - evidence-report.md must exist
#   - overall verdict must be PASS
#   - the PASS was actually gated: bypass_used not true (unless a human
#     recorded bypass_ack) and enforcement_mode not off (warn only warns)
#   - human_signoff must be non-empty
#   - the evidence is not STALE: when the report carries verified_commit
#     (the tree the verifier actually ran on), no non-gate file — outside
#     _acceptance/ and not matching risk_tiers.t1_skip_globs — may have
#     changed since that commit (committed or in the working tree). A report
#     without verified_commit (older template) only gets a NOTE.
#   - (recheck: strict) the committed evidence still passes the gate's own
#     L1/L2/L3 bar, re-checked via scripts/recheck-evidence.js + lib/evidence-core.js
#     (the same core the hook runs) — catches a report hand-edited after the
#     write-time hook, or written under ACCEPTANCE_GATE_BYPASS. Default `warn`
#     only advises (so legacy reports from older templates don't block adopters);
#     `off` skips it. Set `recheck: strict` in _acceptance/config.yaml to enforce.
# Exits 1 listing violations; 0 when clean. T1 and draft/approved
# (pre-implementation) features are out of scope.
set -u

# Đếm vi phạm — khởi tạo NGAY ĐẦU, trước mọi khối có thể tăng nó. Bản trước khởi
# tạo mãi ở giữa file trong khi khối kiểm config phía trên đã `violations+1`:
# dưới `set -u` đó là lỗi shell CHÍ MẠNG, script chết giữa chừng và thoát 0 —
# một typo trong config.yaml giết TOÀN BỘ cổng (signoff, verdict, staleness,
# bypass, T1-escape) mà CI vẫn xanh. Đúng thứ false-green kit sinh ra để chặn.
violations=0
# Bật khi lưới giữ-chỗ nổ ít nhất một lần; dùng để in ĐÚNG MỘT dòng cảnh báo
# về phạm vi hẹp của chính lưới đó ở cuối lần chạy.
NARROW_NET_SEEN=""

# CI evidence re-checker shipped alongside this script (needs ../lib/evidence-core.js).
HERE="$(cd "$(dirname "$0")" && pwd)"
RECHECK="$HERE/recheck-evidence.js"

ROOT="."
SLUGS=()
# PRE_MERGE_BASE set-nhưng-RỖNG khác với không-set: không-set là bỏ-qua-có-tín-
# hiệu hợp lệ (NOTE + declared-off), còn set-rỗng nghĩa là CI ĐÃ nối dây phạm
# vi mà dây đứt (biến chưa có giá trị, command substitution chết im). Rơi về
# nhánh skip là khai-rồi-mà-như-không-khai — cùng lớp với --base thiếu giá trị.
# CHỈ ghi CỜ ở đây, phán SAU vòng parse: cờ --base tường minh override env theo
# convention chung, nên env-rỗng chỉ đáng nổ khi giá trị rỗng đó THẬT SỰ được
# dùng (không có --base) — bản đầu nổ trước vòng parse làm
# `PRE_MERGE_BASE="" ... --base <ref thật>` đỏ oan kèm gợi ý sửa trỏ sai chỗ
# (S4 round 8 của gap-probe bắt được, kèm repro).
PMB_SET_EMPTY=0
[ "${PRE_MERGE_BASE+x}" = "x" ] && [ -z "$PRE_MERGE_BASE" ] && PMB_SET_EMPTY=1
BASE="${PRE_MERGE_BASE:-}"
# Răng T1-escape bật mặc định. Opt-OUT chứ không phải opt-in `--pr`: acceptance-init
# đang dạy consumer truyền đúng `--base`, nên opt-in sẽ làm răng tắt IM LẶNG trên
# mọi repo tiêu thụ đang chạy — biến một sửa lỗi thành lỗ fail-open hàng loạt.
T1_ESCAPE=1
while [ $# -gt 0 ]; do
  case "$1" in
    --slug)
      [ $# -ge 2 ] || { echo "pre-merge-check: --slug requires a value" >&2; exit 2; }
      case "$2" in -*) echo "pre-merge-check: --slug requires a value (got option $2)" >&2; exit 2 ;; esac
      # Giá trị RỖNG cùng lớp với thiếu giá trị: lọc theo slug rỗng thì không
      # thư mục nào khớp, mọi slug bị bỏ qua mà vẫn `clean` — khai-lọc-rỗng
      # phải nổ to (nợ chip 33ca1add, cùng doctrine với --base rỗng bên dưới).
      [ -n "$2" ] || { echo "pre-merge-check: --slug requires a value (got empty string — a CI variable is unset or a command substitution failed)" >&2; exit 2; }
      SLUGS+=("$2"); shift 2 ;;
    --base)
      [ $# -ge 2 ] || { echo "pre-merge-check: --base requires a value" >&2; exit 2; }
      # Quên giá trị thì `--base --no-t1-escape` nuốt cờ kế làm ref: base không
      # bao giờ resolve, răng T1-escape lẫn gap-probe cùng bỏ qua, script in
      # `clean` và thoát 0. Chốt `-*` ở trên chỉ phủ positional, không phủ GIÁ TRỊ.
      case "$2" in -*) echo "pre-merge-check: --base requires a value (got option $2)" >&2; exit 2 ;; esac
      # Giá trị RỖNG — kiểu CI `--base "$VAR"` với VAR unset, hoặc
      # `--base "$(git rev-parse ...)"` mà lệnh con chết im dưới bash -e của
      # GithubActions. Bản cũ rơi về nhánh "no PR base given": gap-probe lẫn
      # T1-escape cùng declared-off và repo sạch thoát 0 — operator ĐÃ khai
      # phạm vi mà cổng chạy như không khai. Doctrine ADR 0004/0006: đã khai
      # thì không xác định được phạm vi là exit 2, không phải skip.
      [ -n "$2" ] || { echo "pre-merge-check: --base requires a value (got empty string — a CI variable is unset or a command substitution failed; drop --base entirely to run without a diff scope)" >&2; exit 2; }
      BASE="$2"; shift 2 ;;
    --no-t1-escape)
      # Không nhận tham số — `reason` là hằng, giữ ranh giới "không thêm cờ nào khác".
      T1_ESCAPE=0; shift ;;
    -*)
      # `-*` chứ không phải `--*`: một gạch cũng là lỗi gõ, và bản chỉ bắt hai
      # gạch để lọt `-no-t1-escape` y nguyên. Nuốt cờ lạ vào ROOT là fail-open
      # chí tử — ROOT sai → không thấy _acceptance/ → thoát 0 mà KHÔNG chạy
      # luật nào. Từ khi kit dạy consumer chép tay cờ vào CI, một lỗi gõ là đủ.
      echo "pre-merge-check: unknown option $1" >&2; exit 2 ;;
    *)
      # Positional thứ hai cũng là lỗi gõ (vd `pre-merge-check.sh . extra` âm
      # thầm đổi ROOT sang `extra`), và ROOT không tồn tại thì phải nổ chứ
      # không được đi tiếp để rơi vào nhánh "nothing to check".
      [ -n "${ROOT_SET:-}" ] && { echo "pre-merge-check: unexpected argument $1" >&2; exit 2; }
      [ -d "$1" ] || { echo "pre-merge-check: root not a directory: $1" >&2; exit 2; }
      ROOT="$1"; ROOT_SET=1; shift ;;
  esac
done

# Phán quyết env-rỗng (cờ ghi ở đầu file): tới đây BASE còn rỗng nghĩa là không
# có --base nào override — giá trị đứt dây của CI sắp được DÙNG thật, nổ to.
if [ "$PMB_SET_EMPTY" -eq 1 ] && [ -z "$BASE" ]; then
  echo "pre-merge-check: PRE_MERGE_BASE is set but empty — a CI variable expansion failed (unset it to run without a diff scope, or give a real ref via PRE_MERGE_BASE or --base)" >&2
  exit 2
fi

# ─── Sổ luật-đã-chạy (rules ledger) ─────────────────────────────────────────
# `clean` phải được CHỨNG MINH, không phải mặc định: mọi khối luật ghi sổ qua
# ledger_mark; điểm nghẽn trước kết luận so EXPECTED với sổ HAI CHIỀU. Lệch =
# lỗi NỘI TẠI của cổng -> exit 2, không phải violation của feature. EXPECTED
# là danh sách ĐÓNG, CỐ ĐỊNH, không phụ thuộc config — thêm khối luật mới
# PHẢI thêm tên vào đây (suite P48 + RL7a canh hai chiều bằng máy).
LEDGER_EXPECTED="per-slug gap-probe t1-escape"
# set -- xoá positional params — hợp lệ vì đứng SAU vòng parse args ở trên.
set -- $LEDGER_EXPECTED
LEDGER_K=$#
LEDGER_ENABLED=1
LEDGER_RAN=""; LEDGER_OFF=""; LEDGER_RAN_N=0; LEDGER_OFF_N=0
ledger_mark() { # <ran|declared-off> <tên>
  [ "$LEDGER_ENABLED" -eq 1 ] || return 0
  case "$1" in
    ran)          LEDGER_RAN="${LEDGER_RAN}${2} "; LEDGER_RAN_N=$((LEDGER_RAN_N+1)) ;;
    declared-off) LEDGER_OFF="${LEDGER_OFF}${2} "; LEDGER_OFF_N=$((LEDGER_OFF_N+1)) ;;
  esac
  echo "$1 $2"
}
ledger_count() { # <tên> — số lần tên xuất hiện trong sổ. Thuần bash có chủ
  # đích: chokepoint không được phụ thuộc binary ngoài, vì trạng thái
  # node-vắng (AC-12) phải đi qua nó mà không tự phá sổ.
  local c=0 w
  for w in $LEDGER_RAN $LEDGER_OFF; do [ "$w" = "$1" ] && c=$((c+1)); done
  echo "$c"
}

# lib dùng chung — CÙNG file mà scripts/gate-card.js require. pre-merge chỉ còn
# đọc config, xác định phạm vi diff, in ấn và đếm; LUẬT nằm trong lib. Bản awk
# cũ đã lệch thật: một dòng JSON hỏng mở được van thoát ở bash trong khi thẻ
# Cổng 1 loại nó (AC-13). Parity giữ bằng comment là parity không có răng.
GP_LIB="$(cd "$(dirname "$0")/.." 2>/dev/null && pwd)/lib/gap-probe.js"

ACC="$ROOT/_acceptance"
if [ ! -d "$ACC" ]; then
  # Có --slug nghĩa là operator KHAI một bộ lọc — không có gì để lọc thì phải
  # nổ, không phải "nothing to check" xanh (cùng lớp bộ-lọc-khai-mà-rỗng dưới).
  if [ ${#SLUGS[@]} -gt 0 ]; then
    echo "pre-merge-check: --slug given but no _acceptance/ under $ROOT — a declared filter with nothing to filter must not green the gate" >&2
    exit 2
  fi
  echo "pre-merge-check: no _acceptance/ — nothing to check"; exit 0
fi
# Bộ lọc --slug khai một tên KHÔNG khớp thư mục nào = cùng hình dạng với giá
# trị rỗng (chip 33ca1add) mà round 9 chỉ ra tôi quét sót: vòng per-slug bỏ qua
# mọi thư mục, không luật nào soi feature nào, sổ vẫn ghi `ran per-slug` (đếm
# thư mục TRƯỚC bộ lọc) và script in `clean` — một slug gõ sai trong CI làm
# cổng xanh vĩnh viễn. Lọc theo tên thư mục nên kiểm tra tương đương là -d.
if [ ${#SLUGS[@]} -gt 0 ]; then
  for _s in "${SLUGS[@]}"; do
    # Vòng lặp per-slug so BẰNG với `basename` của thư mục, nên giá trị chứa
    # `/` hay là `.`/`..` KHÔNG BAO GIỜ khớp basename nào — nhưng lại qua được
    # phép thử -d bên dưới (`feat-x/`, `.`, `..` đều là "thư mục có thật").
    # Round 7 bắt đúng lỗ này trong guard vừa thêm: kiểm phải cùng ngữ nghĩa
    # với bộ lọc thật, không phải một phép thử gần giống.
    case "$_s" in
      */*|.|..)
        echo "pre-merge-check: --slug $_s is not a plain slug name (slashes, . and .. can never match a slug directory basename — a declared filter that matches nothing must not green the gate)" >&2
        exit 2 ;;
    esac
    [ -d "$ACC/$_s" ] || { echo "pre-merge-check: --slug $_s matches no directory under _acceptance/ (typo? a declared filter that matches nothing must not green the gate)" >&2; exit 2; }
  done
fi

# Which tiers need a signed report before merge — from consumer config when
# present (signoff.required_for), defaulting to T2+T3.
REQUIRED_FOR="T2 T3"
# Mode luật gap-probe. Mặc định `advisory`: bỏ qua phản biện phải THẤY ĐƯỢC,
# nhưng bật kit lên không được chặn merge của repo chưa kịp làm quen. `off` là
# im hoàn toàn; `required` là chặn.
GAP_PROBE_MODE="advisory"
# Committed-evidence re-check mode: strict (block) | warn (advise, default) | off.
# Default warn so adopting the re-check never blocks merges over reports written by
# an OLDER evidence template — a repo opts into strict once its reports meet the bar.
RECHECK_MODE="warn"
# t1_skip_globs (newline-separated): file changes matching these — or living
# under _acceptance/ — do not stale the evidence (docs and gate artifacts).
# t3_paths: critical paths — the T1-escape backstop flags them hardest.
T1_GLOBS=""
T3_PATHS=""
# Human-signoff provenance knobs (signoff.*): require_human_commit demands the
# signature land in its own human-fields-only commit; agent_authors is an
# email-glob blocklist for the signoff commit's author.
REQ_HUMAN_COMMIT=""
AGENT_AUTHORS=""
if [ -f "$ACC/config.yaml" ]; then
  cfg_req="$(sed -n 's/^[[:space:]]*required_for:[[:space:]]*//p' "$ACC/config.yaml" | head -1 | sed 's/[[:space:]]*#.*$//')"
  [ -n "$cfg_req" ] && REQUIRED_FOR="$cfg_req"
  # `enforcement` là khoá DUY NHẤT mà hook (write-time) và pre-merge (merge
  # boundary) CÙNG đọc, nên nó là chỗ duy nhất hai parser có thể bất đồng — và
  # mọi bất đồng đều cùng một hình dạng fail-open: hook giữ `strict` (enforce
  # đầy đủ, không ai nghi ngờ) trong khi sổ ở pre-merge tắt IM LẶNG.
  #
  # Vì thế grep dưới đây nhân bản TRỌN VẸN regex của hook
  # (`/^enforcement\s*:\s*(strict|warn|off)\s*(?:#.*)?$/m`) theo TỪNG chiều,
  # thay vì chuẩn hoá giá trị rồi so — hai round vá kiểu chuẩn-hoá đều để hở
  # một chiều (round 1: hoa/thường; round 2: nháy; round 3 review vẫn bắt được
  # chiều space-trước-dấu-hai-chấm và dòng-trùng-khoá). Các chiều:
  #   - `[[:space:]]*` quanh dấu `:` = `\s*` của hook (cả tab);
  #   - token đúng chữ thường, không nháy — `OFF`/`"off"` trượt Ở CẢ HAI BÊN;
  #   - đuôi chỉ được khoảng trắng + chú thích `#` — khớp `\s*(?:#.*)?$`;
  #   - NHIỀU dòng cùng khoá: hook match dòng ĐẦU TIÊN thoả trọn pattern (dòng
  #     giá-trị-rác không thoả nên bị nhảy qua) — grep + head -1 cho đúng thế.
  # Bảng parity RL11c đo cả hai bên trên CÙNG chuỗi; regex hook đọc từ nguồn.
  # Các khoá còn lại (`gap_probe`, `recheck`, ...) chỉ pre-merge đọc, độ rộng
  # khác nhau ở đó KHÔNG tạo bất đồng hai lớp.
  cfg_enf="$(grep -E '^enforcement[[:space:]]*:[[:space:]]*(strict|warn|off)[[:space:]]*(#.*)?$' "$ACC/config.yaml" \
    | head -1 | sed -e 's/^enforcement[[:space:]]*:[[:space:]]*//' -e 's/[[:space:]]*#.*$//' -e 's/[[:space:]]*$//')"
  # off là off toàn cục (tiền lệ hook) — sổ luật tắt theo, không dòng nào
  # (AC-11); warn/strict/không-khớp đều GIỮ sổ bật.
  case "$cfg_enf" in off) LEDGER_ENABLED=0 ;; esac
  cfg_gp="$(sed -n 's/^[[:space:]]*gap_probe:[[:space:]]*//p' "$ACC/config.yaml" | head -1 \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//' -e 's/[[:space:]]*$//' \
    | tr '[:upper:]' '[:lower:]')"
  if [ -n "$cfg_gp" ]; then
    case "$cfg_gp" in
      required|advisory|off) GAP_PROBE_MODE="$cfg_gp" ;;
      *)
        # KHÔNG âm thầm rơi về mặc định: một cổng tự tắt vì sai chính tả đúng là
        # false-green mà luật này sinh ra để chặn.
        echo "VIOLATION [config]: gap_probe: \"$cfg_gp\" không phải mode hợp lệ — dùng required | advisory | off (khoá vắng = advisory)"
        violations=$((violations+1))
        # KHÔNG rơi về advisory: cổng đã chặn bằng VIOLATION trên, nên chạy luật
        # gap-probe theo một mode ĐOÁN chỉ tạo tín hiệu sai. "Cảnh báo rồi vẫn
        # advisory" là fail-open có tiếng động — vẫn là fail-open (AC-11 v3-r2).
        GAP_PROBE_MODE="off" ;;
    esac
  fi
  cfg_rc="$(sed -n 's/^[[:space:]]*recheck:[[:space:]]*//p' "$ACC/config.yaml" | head -1 | sed 's/[[:space:]]*#.*$//')"
  case "$cfg_rc" in strict|warn|off) RECHECK_MODE="$cfg_rc" ;; esac
  T1_GLOBS="$(sed -n '/^  t1_skip_globs:/,/^  [a-zA-Z0-9_-]*:/p' "$ACC/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//" -e 's/[[:space:]]*$//')"
  T3_PATHS="$(sed -n '/^  t3_paths:/,/^  [a-zA-Z0-9_-]*:/p' "$ACC/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//" -e 's/[[:space:]]*$//')"
  REQ_HUMAN_COMMIT="$(sed -n 's/^[[:space:]]*require_human_commit:[[:space:]]*//p' "$ACC/config.yaml" | head -1 | sed 's/[[:space:]]*#.*$//' | tr '[:upper:]' '[:lower:]')"
  AGENT_AUTHORS="$(sed -n '/^  agent_authors:/,/^  [a-zA-Z0-9_-]*:/p' "$ACC/config.yaml" \
    | sed -n 's/^[[:space:]]*-[[:space:]]*//p' \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'\$//" -e 's/[[:space:]]*$//')"
fi
if [ "$RECHECK_MODE" = "warn" ]; then
  # A disabled backstop must be impossible to miss: in warn mode a report
  # hand-edited AFTER the write-time hook only produces a NOTE — it does not
  # block the merge.
  echo "WARNING: committed-evidence re-check is ADVISORY ONLY (recheck: warn) — a hand-edited PASS report will NOT block merge. Set 'recheck: strict' in _acceptance/config.yaml to enforce the backstop."
fi

fm_field() { # <file> <key> — first frontmatter-style "key: value" line, normalized:
  # trailing #-comments, surrounding quotes, and trailing whitespace stripped
  # (mirrors the hook's tolerance for quotes/comments on these lines).
  sed -n "s/^${2}:[[:space:]]*//p" "$1" | head -1 \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//' -e 's/[[:space:]]*$//'
}

front_field() { # <file> <key> — read <key> from the LEADING --- frontmatter block only
  # (tolerates leading blank lines; a body excerpt cannot poison the read, and a
  # report with NO leading frontmatter yields empty for every field — so verdict
  # reads empty and the feature is rejected rather than trusted).
  awk '!f && NF==0 {next} !f && /^---[[:space:]]*$/ {f=1; next} !f {exit} /^---[[:space:]]*$/ {exit} {print}' "$1" \
    | sed -n "s/^${2}:[[:space:]]*//p" | head -1 \
    | sed -e 's/[[:space:]]*#.*$//' -e 's/^["'"'"']//' -e 's/["'"'"']$//' -e 's/[[:space:]]*$//'
}

claims_released() { # <dir> — 0 iff thư mục TỰ NHẬN đã qua cổng.
  # Đọc bằng fm_field (BẤT KỲ dòng nào) chứ không front_field (chỉ frontmatter
  # dẫn đầu) là CỐ Ý: đây là bộ DÒ, doctrine là rộng-khi-dò/chặt-khi-nhận. Một
  # fence hỏng hoặc lệch không được phép mua lấy sự vô hình — đó đúng là thứ
  # đang cần bắt. Mọi chốt CHẤP NHẬN bên dưới vẫn dùng front_field như cũ.
  if [ -f "$1/evidence-report.md" ] \
     && [ "$(fm_field "$1/evidence-report.md" verdict)" = "PASS" ]; then
    return 0
  fi
  # Nhánh contract là thứ bản vá cục bộ của repo tiêu thụ KHÔNG có, nên nó bỏ
  # sót ca "khai signed-off mà không có evidence nào".
  if [ -f "$1/contract.md" ]; then
    case "$(fm_field "$1/contract.md" status)" in
      implemented|verified|signed-off) return 0 ;;
    esac
  fi
  return 1
}

placeholder_signoff() { # <chuỗi> — 0 iff chữ ký khớp một mẫu giữ-chỗ đã biết.
  # ĐÂY LÀ LUẬT CHỮ KÝ DUY NHẤT còn lại (ngoài chốt rỗng). Không có lớp dự
  # phòng nào phía sau: `signoff.approvers` KHÔNG được cổng đọc kể từ 1.24.0 —
  # bốn bản vá cố khớp chữ ký với allowlist đều hỏng theo một hình dạng YAML
  # hợp lệ mới, nên cả lớp bị gỡ (xem contract của premerge-unjudged-pass).
  #
  # PHẠM VI THẬT, đo được, đừng mô tả rộng hơn: khớp TIỀN TỐ với đúng 8 từ khoá
  # + 4 ký hiệu dưới đây. Mọi thứ khác ĐỀU QUA — kể cả giữ-chỗ tiếng Anh không
  # nằm trong bảng (`FIXME`, `placeholder`, `LGTM`), lời cộc lốc (`ok`, `yes`,
  # `x`, `.`), và mọi giữ-chỗ viết bằng ngôn ngữ khác (`chờ Manh gật`).
  # Khớp theo TIỀN TỐ vì chữ ký thật dẫn đầu bằng tên. LC_ALL=C để `tr` không
  # chết trên UTF-8.
  case "$(printf '%s' "$1" | LC_ALL=C tr '[:upper:]' '[:lower:]')" in
    '>'|'|'|'-') return 0 ;;
    '<'*) return 0 ;;                       # template chưa điền: "<name> <date>"
    pending*|tbd*|todo*|n/a*|none|unsigned*|waiting*) return 0 ;;
  esac
  return 1
}


# Mọi đường mà luật gap-probe KHÔNG chạy được đều đi qua ĐÂY. Một hàm, một
# marker, một chỗ quyết định mode — vì kênh "NOTE rồi exit 0" đã giết contract
# v1 (ledger d-114) và suýt giết v3 (gap-probe P0-2). Ở `required`, không cưỡng
# chế được nghĩa là KHÔNG cho merge: cổng không tự hạ chuẩn khi nó đang mù.
GP_NOT_ENFORCED=0
gap_probe_not_enforced() { # <lý do>
  [ "$GAP_PROBE_MODE" = "off" ] && return 0
  [ "$GP_NOT_ENFORCED" -eq 1 ] && return 0   # AC-16: ĐÚNG một dòng marker
  GP_NOT_ENFORCED=1
  echo "GAP-PROBE: NOT ENFORCED reason=$1"
  if [ "$GAP_PROBE_MODE" = "required" ]; then
    echo "VIOLATION [gap-probe]: mode required nhưng luật không cưỡng chế được — $1. Sửa nguyên nhân, hoặc hạ gap_probe xuống advisory nếu chấp nhận merge mà không có phản biện."
    violations=$((violations+1))
  else
    echo "NOTE: gap-probe không cưỡng chế được — $1 (advisory, không chặn merge)."
  fi
}

# Cùng khuôn gap_probe_not_enforced: một hàm, một marker, một chỗ quyết định.
# Hai chuỗi là HẰNG — CI grep được, và suite so bằng `grep -F` nên không ai tự
# viết cả đề lẫn đáp án. Tắt im lặng là thứ luật này sinh ra để chặn.
T1_ESCAPE_OFF=0
t1_escape_not_enforced() {
  [ "$T1_ESCAPE_OFF" -eq 1 ] && return 0
  T1_ESCAPE_OFF=1
  ledger_mark declared-off t1-escape
  echo "T1-ESCAPE: NOT ENFORCED reason=push-event-no-pr-premise"
  # Marker trên là cho MÁY (CI grep). Dòng dưới là cho NGƯỜI: một người chưa
  # đọc kit phải biết LỚP NÀO tắt, VÌ SAO, và rủi ro cụ thể là gì.
  echo "NOTE: lớp đang tắt là răng T1-escape — luật đòi mọi thay đổi chạm code quan trọng phải kèm thư mục _acceptance/<slug>/ (hồ sơ nghiệm thu). Nó chỉ có nghĩa khi so một PR với nhánh đích; lần chạy này là commit đẩy thẳng nhánh chính, nơi commit hạ tầng (đóng gói bản phát hành, đồng bộ bản sao) theo thiết kế không kèm hồ sơ nào."
  echo "NOTE: rủi ro khi tắt — nếu một thay đổi chạm code quan trọng lọt vào lần chạy này, nó sẽ KHÔNG bị chặn vì thiếu hồ sơ nghiệm thu. Các luật khác vẫn chạy đủ (phản biện context sạch, chữ ký người, bằng chứng hết hạn). Muốn bật lại: bỏ cờ --no-t1-escape."
}

match_globs() { # <path> <newline-separated globs> — 0 iff any glob matches
  while IFS= read -r g; do
    [ -n "$g" ] || continue
    # unquoted $g on purpose: case PATTERN matching (globs never fs-expand here)
    case "$1" in $g) return 0 ;; esac
  done <<GLOBS
$2
GLOBS
  return 1
}

feature_scope() { # <evals.yaml> — union of declared globs on stdout; rc 0 only
  # when EVERY eval declares a usable `paths`. `paths` was introduced as a
  # carry-forward performance knob, where under-declaring is safe; here it gates
  # correctness, so anything less than a complete, parseable declaration falls
  # back to whole-tree rather than to a narrower scope.
  #
  # This is a grep-based parser, not a YAML parser — it cannot afford to guess.
  # Six rounds in a row each patched one bad FORM of the same construct while
  # a sibling form of that same construct survived (fixed-literal indentation,
  # then a whitespace class, then multi-line arrays, then the first `]`, then
  # a key-name alphabet that still let a quoted, spaced, or colon-bearing key
  # through), because "reject the forms I thought of" can never enumerate
  # every form. This version instead whitelists exactly what is understood —
  # for BOTH the key and the value — and refuses everything else by
  # construction:
  #
  #   <EI>  <simple-key>: ["glob", "glob", ...][optional trailing # comment]
  #
  # anchored at both ends of the physical line, where EI is the derived
  # eval-item indent, <simple-key> matches `[A-Za-z_][A-Za-z0-9_-]*` — no
  # quotes, no embedded space, no embedded colon (enforced up front by the
  # key-grammar check below, on EVERY line at eval-key indentation, not just
  # `paths:` lines) — and, when that key is `paths`, each glob is a
  # double-quoted string with no `"` inside it. A `]`, `,`, or `#` inside a
  # quoted glob is harmless BECAUSE the whole line matched this grammar
  # first — only then is the true closing `]` known, and globs are pulled out
  # as quoted spans, never by splitting on `,` or `]`. Everything else is
  # refused, not guessed at: a quoted, spaced, or colon-bearing key, an empty
  # key, a list item at eval-key indent, multi-line arrays, single- or
  # un-quoted items, nested arrays, `paths: []`, `paths:` with no value,
  # block scalars, or any trailing content after `]` that is not a `#`
  # comment. A wider whole-tree fallback is always safe, a narrower wrong
  # scope never is.
  f="$1"
  [ -f "$f" ] || return 1

  # Derive the eval-item indentation from the FIRST "- id:" line, LITERALLY
  # (the exact leading whitespace captured, not a whitespace class) — every
  # pattern below is anchored to this exact string.
  ei="$(grep -m1 '^[[:space:]]*- id:' "$f" 2>/dev/null | sed 's/- id:.*$//')"

  # Indentation consistency: every "- id:" line (loosely matched, any leading
  # whitespace) must equal EI exactly. If some drift to a different
  # indentation (odd space count, or a literal tab alongside spaces), this
  # parser cannot read the file reliably — return non-zero rather than guess.
  loose_n="$(grep -c '^[[:space:]]*- id:' "$f" 2>/dev/null || true)"
  exact_n="$(grep -c "^${ei}- id:" "$f" 2>/dev/null || true)"
  loose_n="${loose_n:-0}"
  exact_n="${exact_n:-0}"
  [ "$loose_n" -eq "$exact_n" ] || return 1

  n_evals="$exact_n"
  [ "$n_evals" -gt 0 ] || return 1

  # Eval-key line shape: every line indented to EXACTLY the eval-key
  # indentation (EI plus two literal spaces — the column a `- ` marker lines
  # sibling keys up with) must be a simple, unquoted `key:` —
  # `[A-Za-z_][A-Za-z0-9_-]*:`. The key name is deliberately NOT enumerated
  # as "the key names I expect" (kebab-case `expected-output:`, digit-suffixed
  # `note2:`, etc. are all legal); what is refused is any key shape this
  # line-based parser cannot read reliably at all: a quoted key
  # (`"note: x":`), a key with an embedded colon (`"note: x":` again — the
  # colon inside the quotes, not just the one ending it), a key with a
  # space (`my key:`), an empty key (`: `), or a list item sitting at this
  # same indent (`- foo:`). None of those are things this parser can
  # disambiguate from a real key, so the whole file is refused rather than
  # guessed at. Loose vs strict counts at the SAME indentation (mirroring the
  # "- id:" indentation check above) catch every one of them: a line
  # matching the loose "something non-blank sits here" selector that does
  # NOT also match the strict key grammar means this file has a line this
  # parser cannot read.
  key_loose_n="$(grep -c "^${ei}  [^[:space:]]" "$f" 2>/dev/null || true)"
  key_strict_n="$(grep -Ec "^${ei}  [A-Za-z_][A-Za-z0-9_-]*:" "$f" 2>/dev/null || true)"
  key_loose_n="${key_loose_n:-0}"
  key_strict_n="${key_strict_n:-0}"
  [ "$key_loose_n" -eq "$key_strict_n" ] || return 1

  # This parser cannot read YAML block scalars. A `|`/`>` indicator as the
  # VALUE of ANY eval-level key (EI plus two spaces) means the following
  # lines are opaque prose that can look like anything, including a decoy
  # `paths:` line — refuse rather than let that prose feed either counter
  # below. Because the check above has already proven every eval-key-indent
  # line is a simple `<key>:`, the value begins immediately after THAT key's
  # single colon — so this is expressed in the SAME key grammar rather than a
  # fresh, unconstrained `[^:]*` that would anchor on the wrong colon when a
  # key contains one of its own (the exact bypass this round closes: a key
  # like `"note: x":` has an embedded colon, and `[^:]*` stops at the first
  # one, landing mid-key instead of at the key's true end).
  #
  # The indicator must be followed by nothing but an optional YAML
  # chomping/indent suffix (`-`, `+`, a digit) and then end-of-line or a
  # trailing comment, anchoring it to be the START of the value — a
  # legitimate single-line value that merely CONTAINS `|` or `>` later on —
  # e.g. `expected: "exit 0; a > b"` — has its own first non-space character
  # (here `"`) right after the colon, never matches, and is left alone.
  if grep -E -q "^${ei}  [A-Za-z_][A-Za-z0-9_-]*:[[:space:]]*[|>][-+0-9]*[[:space:]]*(#.*)?\$" "$f" 2>/dev/null; then
    return 1
  fi

  # Declarations: ONE pattern, anchored at both `^` and `$` of the physical
  # line, drives both the counter and the extractor below, so they cannot
  # disagree. Requiring the closing `]` (and nothing but an optional comment)
  # on the SAME line is what rules out a multi-line array — a `paths: [`
  # opening a line whose globs continue on following lines simply fails to
  # match this pattern at all, so it falls short of n_evals and the function
  # refuses. Each item must be `"..."` (double-quoted, no embedded `"`); a
  # single-quoted, unquoted, or nested-array item likewise fails to match. A
  # `paths:` whose value is not exactly this shape (e.g. `paths: []`,
  # `paths:` with no value, `paths: >`) is not a declaration at all: it can
  # never count toward completeness while contributing zero globs. A stray
  # feature-level top-level `paths:` key (indented differently, not under any
  # eval) is excluded by the same exact-indentation anchor.
  #
  # The grammar permits optional whitespace right inside the brackets
  # (`[ "a" ]`) and an optional trailing comma before the close (`["a",]`) —
  # both unremarkable YAML a maintainer would expect to work — while every
  # other refusal (single-line only, double-quoted only, no nested arrays, no
  # trailing non-comment suffix) stays exactly as strict.
  paths_re="^${ei}  paths:[[:space:]]*\\[[[:space:]]*\"[^\"]*\"(,[[:space:]]*\"[^\"]*\")*,?[[:space:]]*\\][[:space:]]*(#.*)?\$"
  n_paths="$(grep -E -c "$paths_re" "$f" 2>/dev/null || true)"
  n_paths="${n_paths:-0}"
  [ "$n_evals" -eq "$n_paths" ] || return 1

  # A TOTAL is not completeness. Two `paths:` lines under one eval and none
  # under another balance this count exactly, so the union is built from a
  # PARTIAL declaration while the undeclared eval's implicit whole-tree scope
  # is silently dropped — the precise AC-4 failure mode this function exists to
  # refuse, reachable by a copy-paste duplicate line. Everything above proves
  # the file's SHAPE; this proves the shape is distributed one-per-eval.
  #
  # Walk the file once, tracking whether an eval item is currently OPEN, and
  # require each open item to close having seen exactly one `paths:` line.
  #
  # "Nearest `- id:` above" is NOT ownership — it never asks whether the paths
  # line is still INSIDE that eval. Any `paths:` key sitting at the eval-key
  # column anywhere below the last `- id:` (a trailing `misc:`/`sub:` mapping,
  # say) is attributed to the final eval: owners come out distinct, the total
  # balances, and a file where one eval declares nothing reads as COMPLETE
  # while a stranger's globs join the union. Same AC-4 failure mode as the
  # duplicate key, same dangerous direction (narrower than truth).
  #
  # What closes an item is a line that is neither blank, nor a comment, nor
  # indented to the eval-key column — i.e. a dedent out of the item. A
  # paths-grammar line found while NO item is open is a stray declaration this
  # parser cannot attribute, and is refused outright.
  #
  # $paths_re reaches awk through the environment, not -v: awk expands escape
  # sequences in -v assignments, which would eat the `\[` and `\]` of the
  # grammar and silently widen the pattern. Passing the same regex, not a
  # second copy of it, is the point — this function's history is six rounds of
  # one construct's forms drifting apart, and a duplicated grammar is how that
  # drift starts.
  PMC_EI="$ei" PMC_PATHS_RE="$paths_re" awk '
    BEGIN {
      ei = ENVIRON["PMC_EI"]; re = ENVIRON["PMC_PATHS_RE"]
      idpfx = ei "- id:"; idlen = length(idpfx)
      keypfx = ei "  ";   keylen = length(keypfx)
      open = 0; n = 0; bad = 0
    }
    substr($0, 1, idlen) == idpfx {
      if (open && n != 1) bad = 1
      open = 1; n = 0; next
    }
    /^[[:space:]]*$/ { next }
    /^[[:space:]]*#/ { next }
    substr($0, 1, keylen) == keypfx {
      if ($0 ~ re) { if (open) n++; else bad = 1 }
      next
    }
    { if (open) { if (n != 1) bad = 1; open = 0 } }
    END { if (open && n != 1) bad = 1; exit (bad ? 1 : 0) }
  ' "$f" || return 1

  # Extract by pulling the quoted spans out of each matched line's array
  # body, never by splitting on `,` or `]` — those characters are meaningless
  # once they can appear inside a glob. Because the whole line already proved
  # it matches the grammar above, the prefix up to the array's `[` and the
  # suffix from the array's `]` (plus optional trailing comment) can be
  # stripped safely, leaving only the array body to scan for `"..."` spans.
  decls="$(grep -E "$paths_re" "$f" 2>/dev/null || true)"
  globs=""
  n_lines=0
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    n_lines=$((n_lines + 1))
    body="$(printf '%s\n' "$line" \
      | sed -E "s/^${ei}  paths:[[:space:]]*\[//" \
      | sed -E 's/\][[:space:]]*(#.*)?$//')"
    line_globs="$(printf '%s\n' "$body" | grep -o '"[^"]*"' | sed -e 's/^"//' -e 's/"$//')"
    # The grammar guarantees at least one item per matched line; if
    # extraction still comes up empty, the counter and extractor have
    # silently diverged — refuse rather than emit a union short of the truth.
    [ -n "$line_globs" ] || return 1
    globs="${globs}${line_globs}
"
  done <<DECLS
$decls
DECLS
  [ "$n_lines" -eq "$n_paths" ] || return 1

  globs="$(printf '%s\n' "$globs" \
    | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' \
    | grep -v '^$' | sort -u)"
  # An empty array parses to zero globs (never matched by this grammar, but
  # kept as a last-resort guard). A zero-glob scope matches nothing, which
  # would read as "never stale" — treat it as not declared.
  [ -n "$globs" ] || return 1
  printf '%s\n' "$globs"
  return 0
}

gated_coverage() { # <changed-list> — the newline-separated changed-file list
  # (already BASE_SHA...HEAD, computed ONCE above the feature loop) filtered
  # down to gated files: excludes _acceptance/** and anything matching
  # T1_GLOBS. This is the COVERAGE SET a declaration's `paths` must cover, and
  # it is shared by the "is the coverage set even non-empty" check and
  # scope_gaps() below — both need the identical filter, and computing it once
  # here (rather than once per feature, or via a second git invocation) is
  # what removes a `git diff` call per feature.
  printf '%s\n' "$1" | while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in _acceptance/*|*/_acceptance/*) continue ;; esac
    match_globs "$f" "$T1_GLOBS" && continue
    printf '%s\n' "$f"
  done
}

scope_gaps() { # <gated-coverage-list> <scope-globs> — gated-coverage files
  # (see gated_coverage() above) the union misses. COVERAGE SET is
  # BASE_SHA...HEAD (per PR), never the per-feature verified_commit range:
  # cross-checking a merged feature against its own range spans every
  # unrelated merge since sign-off, so no honest declaration ever covers it
  # and narrow scope would be refused forever.
  printf '%s\n' "$1" | while IFS= read -r f; do
    [ -n "$f" ] || continue
    match_globs "$f" "$2" || printf '%s\n' "$f"
  done
}

scope_has_any_match() { # <root> <scope-globs> — rc 0 iff at least one file
  # tracked by git matches the union; rc 1 otherwise. A declared union that
  # matches NO file in the repository is a typo or a stale/renamed path, not a
  # scope — and unlike scope_gaps() above (which only runs the moment this
  # feature's own _acceptance/<slug>/ changes, and can pass VACUOUSLY when
  # that PR's coverage set happens to be empty), this must hold independent of
  # any PR diff: a match-nothing glob accepted once at declaration time would
  # otherwise filter out every real change forever, on every later PR, silently.
  #
  # Uses match_globs() — the same `case`-pattern matcher scope_gaps()/
  # stale_files() use — rather than handing globs to `git ls-files` as
  # pathspecs, whose `*` semantics differ from shell `case` globbing.
  #
  # `--full-name` is load-bearing, not cosmetic. Plain `git -C <root> ls-files`
  # prints paths relative to <root>, but every OTHER consumer of these same
  # globs — stale_files(), gated_coverage(), scope_gaps() — matches against
  # `git diff --name-only`, whose paths are relative to the GIT TOP-LEVEL. The
  # two namespaces coincide only when $ROOT is the git root. In the monorepo
  # layout this script explicitly supports (pkg/_acceptance/, see the comment
  # in the feature loop below), they diverge: ls-files says `src/a.txt` where
  # diff says `pkg/src/a.txt`. Without --full-name a $ROOT-relative
  # declaration passes this guard (it matches ls-files) and then filters out
  # every real change in stale_files (which never sees that spelling) — the
  # feature is never reported stale again, silently, on every later PR. That
  # is precisely the fail-open this function exists to close, so it must ask
  # the question in the same namespace the answer is used in.
  #
  # The two EXEMPTIONS below are load-bearing for the same reason --full-name is,
  # and were the fifth variant of this family (fail-open, HIGH), left open by
  # stale-scope-by-paths with an explicit "do not patch this piecemeal".
  # stale_files() drops gate artifacts and t1_skip_globs BEFORE it applies scope,
  # so those files are not in the universe any answer is ever drawn from. Asking
  # about them here — where the question is "could this union ever report
  # anything?" — makes a wholly honest declaration like paths: ["docs/**"] pass,
  # and then filter out every real change forever, on every later PR, silently.
  # The filter must therefore be identical in both places: same exclusions, same
  # order, same matcher.
  #
  # Any doubt (git missing, not a repo, ls-files unusable) is "cannot verify"
  # and returns rc 1 — refuse narrow scope, same as every other doubt in this
  # function. Stops at the first match rather than scanning every tracked file.
  command -v git >/dev/null 2>&1 || return 1
  git -C "$1" rev-parse --git-dir >/dev/null 2>&1 || return 1
  # `-c core.quotePath=false` for the same reason stale_files() sets it, and it
  # is part of "the same namespace" this function exists to enforce: quotePath
  # defaults ON, so ls-files spells a non-ASCII path "src/caf\303\251.ts" while
  # diff --name-only (which stale_files reads, with the setting off) spells it
  # src/café.ts. Without this the two disagree about a file BOTH can see, and a
  # declaration whose only match is such a path gets narrow scope refused —
  # fail-closed, so not a hole, but the header above claims the two ask in one
  # namespace and that claim has to be true. A path that STILL arrives quoted
  # despite the setting simply does not match, which keeps the doubt on the
  # refuse-narrow-scope side.
  git -c core.quotePath=false -C "$1" ls-files --full-name 2>/dev/null | {
    hit=1
    while IFS= read -r f; do
      [ -n "$f" ] || continue
      case "$f" in _acceptance/*|*/_acceptance/*) continue ;; esac
      match_globs "$f" "$T1_GLOBS" && continue
      if match_globs "$f" "$2"; then
        hit=0
        break
      fi
    done
    exit "$hit"
  }
}

stale_files() { # <root> <commit> [scope-globs] — gated files changed since
  # <commit> (incl. working tree). Gate artifacts (_acceptance/) and
  # t1_skip_globs never count. With a non-empty third argument, only files
  # matching it count: that is the STALENESS SET narrowed to what the feature's
  # evals declare they exercise. Untracked files are invisible to git diff — CI
  # runs on a committed tree, so that is moot there.
  #
  # `-c core.quotePath=false` disables git's default quoting/octal-escaping of
  # non-ASCII and control-byte paths (core.quotePath defaults on) — without
  # it, a path like café.txt arrives as the literal string
  # "caf\303\251.txt", which can never match a plain-ASCII glob. Before
  # `scope` existed that only meant the whole-tree set carried the quoted
  # string (a safe over-report); scoping inverts that into a silent
  # under-refusal, dropping the file from a narrow staleness set entirely. Any
  # path that STILL arrives quoted despite the setting (a literal `"` or a
  # backslash escape the setting cannot unquote) is treated as stale
  # unconditionally, bypassing the scope filter — a name this parser cannot
  # read cleanly is exactly the doubt the governing rule (any ambiguity keeps
  # whole-tree staleness) exists for.
  scope="${3:-}"
  git -c core.quotePath=false -C "$1" diff --name-only "$2" -- 2>/dev/null | while IFS= read -r f; do
    case "$f" in _acceptance/*|*/_acceptance/*) continue ;; esac
    match_globs "$f" "$T1_GLOBS" && continue
    case "$f" in \"*) printf '%s\n' "$f"; continue ;; esac
    if [ -n "$scope" ]; then
      match_globs "$f" "$scope" || continue
    fi
    printf '%s\n' "$f"
  done
}

slug_acceptance_touched() { # <slug> — rc 0 iff the shared $ALL_CHANGED list
  # (BASE_SHA...HEAD, set once above the feature loop) contains any path under
  # _acceptance/<slug>/. The prefix "_acceptance/$1/" is QUOTED in the `case`
  # pattern below, so it is matched literally — only the trailing unquoted `*`
  # is a wildcard — which is what keeps a slug containing a glob/regex
  # metacharacter (e.g. "a.b") from spuriously matching a sibling slug
  # ("axb"). Reads $ALL_CHANGED instead of a second per-feature git diff call.
  #
  # BOTH spellings, for the same reason scope_has_any_match() needs
  # --full-name: `git diff --name-only` prints paths relative to the git
  # TOP-LEVEL, not $ROOT. In the pkg/_acceptance/ monorepo layout this script
  # supports, the top-level-anchored prefix alone never matches, so this
  # function always returned 1, the `elif slug_acceptance_touched` branch never
  # ran, and the declaration was never cross-checked against the PR's gated
  # diff — narrow scope granted unchecked, AC-5 and AC-7 dead in that layout.
  # slug_in_diff() below already accepts both; this is the same list read
  # through a stricter prefix, so it must accept both too.
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in "_acceptance/$1/"*|*"/_acceptance/$1/"*) return 0 ;; esac
  done <<CHANGEDLIST
$ALL_CHANGED
CHANGEDLIST
  return 1
}

# config.yaml 2-space lint: every kit parser (hook resolveConfigKey, the sed/awk
# here) is line/indent based — a TAB or odd indent silently breaks config:
# resolution (verifier refs stop resolving, executors vanish). Fail loudly instead.
if [ -f "$ACC/config.yaml" ]; then
  cfg_lint="$(awk '
    /\t/ { printf "line %d: TAB character\n", NR; next }
    /^[ ]*[^ #]/ {
      n = match($0, /[^ ]/) - 1
      if (n % 2 == 1) printf "line %d: odd indentation (%d spaces)\n", NR, n
    }
  ' "$ACC/config.yaml")"
  if [ -n "$cfg_lint" ]; then
    echo "VIOLATION [config]: _acceptance/config.yaml breaks the 2-space line schema (kit parsers are indent-based; use scripts/config-patch.mjs for programmatic writes):"
    printf '%s\n' "$cfg_lint" | head -5 | sed 's/^/    /'
    violations=$((violations+1))
  fi
fi

# ─── PR diff scope (hoisted) ───────────────────────────────────────────────
# Phần này trước đây chỉ được tính ở CUỐI file, trong khối T1-escape — nên mọi
# luật nằm trong vòng lặp per-slug đều không nhìn thấy diff. Luật gap-probe cần
# nó (chỉ xét slug có file trong PR), nên hoist lên đây; T1-escape bên dưới DÙNG
# LẠI ba biến này thay vì tính lại. Thông điệp giữ NGUYÊN VĂN để nội dung và thứ
# tự output không đổi.
#
# Two variable sets, ONE `git diff`. The kit ships DIFF_READY/DIFF_FILES for
# gap-probe and the T1-escape backstop; the paths-scoping feature adds
# BASE_SHA/ALL_CHANGED/COVERAGE_OK/GATED_COVERAGE for the per-feature scope
# cross-check. They describe the same BASE_SHA...HEAD range, so they are filled
# from a single query below and move together — DIFF_READY==COVERAGE_OK and
# DIFF_FILES==ALL_CHANGED at every exit of this block. Keeping two names rather
# than collapsing them keeps both upstream and local call sites readable.
DIFF_READY=0
DIFF_FILES=""
DIFF_SKIP_NOTE=""
BASE_SHA=""
ALL_CHANGED=""
COVERAGE_OK=0
GATED_COVERAGE=""
if [ -z "$BASE" ]; then
  DIFF_SKIP_NOTE="no PR base given (pass --base <ref> or set PRE_MERGE_BASE; GitHub Actions: --base \"origin/\$GITHUB_BASE_REF\")"
elif ! command -v git >/dev/null 2>&1 || ! git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  # Tới nhánh này là base ĐÃ KHAI (nhánh -z ở trên bắt trường hợp không khai)
  # mà git không dùng được — không phải git repo, hoặc rev-parse bị chặn (CI
  # container hay gặp safe.directory). Bản cũ hạ về DIFF_SKIP_NOTE: gap-probe
  # lẫn T1-escape cùng declared-off và repo sạch thoát 0, ngược cả câu README
  # 'base đã khai mà không resolve được là exit 2 ở MỌI repo' (round 9 bắt).
  # Cùng doctrine với nhánh ref-không-resolve ngay dưới: đã khai thì mù là nổ.
  echo "VIOLATION [scope]: base \"$BASE\" đã khai nhưng git không dùng được trên $ROOT (không phải git repo, hoặc rev-parse bị chặn — CI container kiểm safe.directory). Phạm vi diff KHÔNG xác định được mà bạn đã yêu cầu nó; sửa môi trường git, hoặc bỏ hẳn --base nếu thật sự muốn chạy không phạm vi."
  exit 2
else
  BASE_SHA="$(git -C "$ROOT" rev-parse --quiet --verify "$BASE^{commit}" 2>/dev/null || true)"
  [ -z "$BASE_SHA" ] && BASE_SHA="$(git -C "$ROOT" rev-parse --quiet --verify "origin/$BASE^{commit}" 2>/dev/null || true)"
  if [ -z "$BASE_SHA" ]; then
    # KHÁC với "không truyền base": ở đây người vận hành ĐÃ yêu cầu một phạm vi
    # mà máy không tính được (ref gõ sai, nhánh đã xoá, clone shallow). Hạ về
    # bỏ-qua-rồi-clean là fail-open — cùng doctrine ADR 0004.
    # stdout như MỌI dòng VIOLATION khác (config/gap-probe/PR/ledger/per-slug)
    # — bản đầu >&2 làm CI nào chỉ grep stdout nhận exit 2 trần không lý do.
    echo "VIOLATION [scope]: base \"$BASE\" không resolve được trong clone này — phạm vi diff KHÔNG xác định được, mà bạn đã yêu cầu nó. Sửa ref (CI: fetch-depth: 0 + đúng base_ref), hoặc bỏ hẳn --base nếu thật sự muốn chạy không phạm vi."
    exit 2
  else
    # `rev-parse --verify` mới chỉ chứng minh OBJECT tồn tại. `git diff A...HEAD`
    # vẫn rc=128 + stdout rỗng khi KHÔNG có merge-base (clone shallow/grafted,
    # lịch sử rời nhau, base bị force-push). Nuốt rc ở đây là tai hoạ: script
    # tin phạm vi "đã biết và RỖNG" → gap-probe không bao giờ nổ, T1-escape
    # không thấy gì, NOTE bỏ-qua không in, và guard fail-closed của CI (grep
    # "skipped") bị vượt luôn. Mù thì phải KHAI là mù.
    #
    # `-c core.quotePath=false` comes from the paths-scoping feature: without
    # it a non-ASCII path arrives octal-escaped ("caf\303\251.txt") and can
    # never match a plain-ASCII glob, which silently drops it from a NARROW
    # staleness set. Over-reporting was harmless before scoping existed; under
    # scoping it inverts into a silent under-refusal, so the setting is load-
    # bearing here and merely harmless for the kit's own consumers.
    if ALL_CHANGED="$(git -c core.quotePath=false -C "$ROOT" diff --name-only "$BASE_SHA...HEAD" -- 2>/dev/null)"; then
      COVERAGE_OK=1
      GATED_COVERAGE="$(gated_coverage "$ALL_CHANGED")"
      DIFF_FILES="$ALL_CHANGED"
      DIFF_READY=1
    else
      ALL_CHANGED=""
      DIFF_FILES=""
      DIFF_SKIP_NOTE="git diff \"$BASE\"...HEAD failed (no merge base? shallow/grafted clone, unrelated history, force-pushed base)"
    fi
  fi
fi

# 0 iff PR đổi ít nhất một file dưới _acceptance/<slug>/. NEO `^` là bắt buộc:
# fixture ở tests/.../_acceptance/<slug>/ KHÔNG phải artifact của slug đó — glob
# chưa neo chính là lỗ README đang ghi cho khối T1-escape bên dưới.
# 0 iff PR đổi ít nhất một file dưới _acceptance/<slug>/.
# Path của `git diff` LUÔN tương đối với git top-level, KHÔNG phải với $ROOT —
# nên chỉ neo `^` là giả định ROOT == git root, và repo có `_acceptance/` nằm
# sâu (monorepo: pkg/_acceptance/) sẽ thấy luật TẮT im lặng. Dùng đúng idiom mà
# stale_files() và khối T1-escape trong file này vẫn dùng: chấp cả hai hình
# dạng. Vẫn chặn được fixture rác vì đòi khớp trọn `_acceptance/<slug>/`.
slug_in_diff() { # <slug>
  [ "$DIFF_READY" -eq 1 ] || return 1
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in
      _acceptance/"$1"/*|*/_acceptance/"$1"/*) return 0 ;;
    esac
  done <<SLUGDIFF
$DIFF_FILES
SLUGDIFF
  return 1
}

# AC-12 nửa sau: không có base thì luật không xác định được phạm vi, nên bỏ qua
# — nhưng bỏ qua phải THẤY ĐƯỢC (cùng lối với răng T1-escape bên dưới).
if [ "$GAP_PROBE_MODE" != "off" ] && [ "$DIFF_READY" -eq 0 ]; then
  gap_probe_not_enforced "$DIFF_SKIP_NOTE (luật chỉ xét slug có file trong diff PR)"
fi

# per-slug: hai đường dẫn độc lập về lexical — vòng đếm dưới đây dùng biến
# _sd, vòng luật thật dùng dir. Tiêm hỏng một vòng thì con số lệch và điểm
# nghẽn từ chối kết luận (AC-9: bắt cả biến thể CHƯA nghĩ ra).
SLUG_SEEN=0; SLUG_EXPECTED_N=0
for _sd in "$ACC"/*/; do [ -d "$_sd" ] && SLUG_EXPECTED_N=$((SLUG_EXPECTED_N+1)); done
GP_SCOPE_N=0; GP_RAN=0

for dir in "$ACC"/*/; do
  [ -d "$dir" ] || continue
  SLUG_SEEN=$((SLUG_SEEN+1))
  slug="$(basename "$dir")"
  if [ ${#SLUGS[@]} -gt 0 ]; then
    found=0
    for s in "${SLUGS[@]}"; do [ "$s" = "$slug" ] && found=1; done
    [ $found -eq 1 ] || continue
  fi
  # Mỗi `continue` dưới đây loại thư mục khỏi cổng HOÀN TOÀN. Im lặng đó đúng
  # với scaffold bỏ hoang, nhưng một thư mục TỰ KHAI đã phát hành mà vô hình là
  # một PASS chưa ai phán cưỡi CI xanh (incident 2026-07-20 #255 ở repo tiêu thụ).
  contract="$dir/contract.md"
  if [ ! -f "$contract" ]; then
    if claims_released "$dir"; then
      echo "VIOLATION [$slug]: no contract.md — slug invisible to the gate, yet it claims release (evidence-report.md declares verdict PASS). An unjudged PASS would ride CI green. Add contract.md with frontmatter status + risk_tier so the gate can judge it."
      violations=$((violations+1))
    fi
    continue
  fi

  tier="$(fm_field "$contract" risk_tier)"
  status="$(fm_field "$contract" status)"

  # Thiếu field ≠ khai báo → bị flag. Field CÓ mặt nhưng ngoài phạm vi (status
  # draft/approved, tier ngoài required_for) LÀ khai báo → vẫn im lặng đúng
  # thiết kế, xử ở hai `case` ngay dưới.
  if [ -z "$tier" ] || [ -z "$status" ]; then
    if claims_released "$dir"; then
      if   [ -z "$tier" ] && [ -z "$status" ]; then uj_missing="status nor risk_tier"
      elif [ -z "$tier" ];                     then uj_missing="risk_tier"
      else                                          uj_missing="status"
      fi
      echo "VIOLATION [$slug]: contract has no $uj_missing — slug invisible to the gate, yet it claims release. Add the missing frontmatter to $slug/contract.md so the gate can judge it."
      violations=$((violations+1))
    fi
    continue
  fi
  case "$REQUIRED_FOR" in *"$tier"*) ;; *) continue ;; esac
  case "$status" in implemented|verified|signed-off) ;; *) continue ;; esac

  # Gate 1 must have been recorded BEFORE any post-approval status: a contract
  # that reached implemented+ with an empty approved_by jumped the gate. The
  # explicit user skip (gate1_skipped: true) is tolerated but NOTEd (audit).
  approved_by="$(front_field "$contract" approved_by)"
  g1skip="$(front_field "$contract" gate1_skipped | tr '[:upper:]' '[:lower:]')"
  if [ -z "$approved_by" ]; then
    case "$g1skip" in
      true|1|yes)
        echo "NOTE [$slug]: gate1_skipped: true — user explicitly skipped Gate 1 (approved_by empty tolerated, audit trail)" ;;
      *)
        echo "VIOLATION [$slug]: status=$status but approved_by is empty and gate1_skipped is not true — Gate 1 approval was never recorded (contract skipped the gate)"
        violations=$((violations+1)); continue ;;
    esac
  fi

  # Cross-layer pairing teeth (wave 2): a gated feature whose contract tags a
  # criterion (cross-layer) MUST pair it with >=1 eval declaring
  # layer: backend-effect in evals.yaml — otherwise this merge would ride on
  # UI-only evidence for a UI→API→backend path. Write-time stays advisory
  # (lint W4); this is the merge-boundary backstop for every runtime.
  # Fail-open: evals.yaml missing → NOTE, never a block.
  # `## Criteria` runs until the next H1/H2 — a `### nhóm phụ` inside it is
  # content, not a boundary. Exiting on any heading truncated the scan and every
  # AC after the first sub-heading went untagged (teeth silently off).
  xl_acs="$(awk '/^#/ && !/^###/ {insec=0} tolower($0) ~ /^##[[:space:]]+criteria/{insec=1; next} insec && tolower($0) ~ /^[[:space:]]*[-*].*\(cross-layer\)/ { if (match($0, /AC-[0-9]+/)) print substr($0, RSTART, RLENGTH) }' "$contract" | sort -u)"
  if [ -n "$xl_acs" ]; then
    if [ ! -f "${dir}evals.yaml" ]; then
      echo "NOTE [$slug]: cross-layer criteria declared but no evals.yaml — pairing unverifiable (fail-open)"
    else
      # Buffer per eval block then flush: `layer:` may appear BEFORE `criterion:`
      # in a hand-written evals.yaml — printing at layer-time would miss those.
      # A YAML mapping key REQUIRES whitespace (or EOL) after its colon — that
      # alone separates `- id: E1` (opens a block) from a `paths:` glob like
      # `- api:v2/**` (a list item, colon glued to the value). Do NOT whitelist
      # key names here: a block opening on an unlisted key would fail to flush,
      # leaking the previous block's `layer:` onto it — false-green, the exact
      # failure these teeth exist to stop. Open wide, discriminate on syntax.
      xl_paired="$(awk '
        function flush() { if (lay=="backend-effect" && crit!="") print crit }
        tolower($0) ~ /^[[:space:]]*-[[:space:]]*[a-z_]+:([[:space:]]|$)/ { flush(); crit=""; lay="" }
        tolower($0) ~ /^[[:space:]]*(-[[:space:]]*)?criterion:[[:space:]]*/ {v=$0; sub(/^[^:]*:[[:space:]]*/,"",v); gsub(/["'\'']/,"",v); sub(/[[:space:]]+#.*$/,"",v); sub(/[[:space:]]+$/,"",v); crit=v}
        tolower($0) ~ /^[[:space:]]*(-[[:space:]]*)?layer:[[:space:]]*/ {v=tolower($0); sub(/^[^:]*:[[:space:]]*/,"",v); gsub(/["'\'']/,"",v); sub(/[[:space:]]+#.*$/,"",v); sub(/[[:space:]]+$/,"",v); lay=v}
        END { flush() }
      ' "${dir}evals.yaml" | sort -u)"
      while IFS= read -r xac; do
        [ -n "$xac" ] || continue
        if ! printf '%s\n' "$xl_paired" | grep -qx "$xac"; then
          echo "VIOLATION [$slug]: $xac is tagged (cross-layer) but no eval of it declares layer: backend-effect — a cross-layer criterion would merge on UI-only evidence; add the paired test/script eval, or untag it with the human's signoff at Gate 1"
          violations=$((violations+1))
        fi
      done <<XLACS
$xl_acs
XLACS
    fi
  fi

  # Counter scope NẰM NGOÀI khối luật bên dưới và cố ý khác lexical (off không
  # nháy kép): tiêm vô hiệu khối thì counter vẫn đếm, sổ lệch, chokepoint bắt.
  [ "$GAP_PROBE_MODE" != off ] && slug_in_diff "$slug" && GP_SCOPE_N=$((GP_SCOPE_N+1))

  # ─── Gap-probe presence (phản biện context sạch) ─────────────────────────
  # Vị trí có chủ đích: SAU hai bước lọc `REQUIRED_FOR` và `status implemented+`
  # phía trên, nên AC-4 (T1) và AC-10 (draft/approved) đúng theo CẤU TRÚC chứ
  # không nhờ một nhánh if riêng. Chỉ xét slug có file trong diff PR: quét cả
  # `_acceptance/` khiến repo có lịch sử nhận hàng chục VIOLATION không liên
  # quan diff ở PR đầu tiên rồi tắt luật (Cổng 1 2026-07-26, ledger d-116).
  if [ "$GAP_PROBE_MODE" != "off" ] && slug_in_diff "$slug"; then
    gp_fix='Chạy bước S1#7 (phản biện context sạch) để sinh gap-probe.md, HOẶC ghi vào decisions.jsonl một entry {"id":"d-<UTC>-<rand>","type":"descope","stage":"S1","at":"<ISO>","decision":"bỏ gap-probe — <lý do>","impact":"đổi lại không có phản biện context sạch trước duyệt"}'
    # front_field CHỈ đọc khối --- ĐẦU file: một dòng `verdict:` nằm trong thân
    # bài (vd trích trong bảng finding) không được tính, và `touch` file rỗng cho
    # chuỗi rỗng nên rơi vào nhánh "thiếu". Đó là chốt chống bypass.
    gp_line=""
    if [ -f "$GP_LIB" ] && command -v node >/dev/null 2>&1; then
      gp_line="$(node "$GP_LIB" classify "$dir" 2>/dev/null || true)"
    fi
    if [ -z "$gp_line" ]; then
      if ! command -v node >/dev/null 2>&1; then
        gap_probe_not_enforced "không có \`node\` trên máy chạy pre-merge"
      elif [ ! -f "$GP_LIB" ]; then
        gap_probe_not_enforced "thiếu $GP_LIB (mang cổng vào repo phải copy CẢ lib/)"
      else
        gap_probe_not_enforced "node lib/gap-probe.js classify thất bại trên $slug"
      fi
    else
      GP_RAN=1
      gp_outcome="${gp_line%%	*}"
      gp_id="${gp_line#*	}"
      case "$gp_outcome" in
        ok) : ;;
        probe-failed)
          echo "NOTE [$slug]: gap-probe verdict là probe-failed — phản biện KHÔNG chạy được. Merge lúc này nghĩa là merge mà chưa có phản biện context sạch; chạy lại S1#7 nếu muốn có, hoặc chấp nhận rủi ro đó." ;;
        descoped)
          echo "NOTE [$slug]: phản biện context sạch đã được BỎ có chủ đích theo ledger $gp_id — quyết định có dấu vết, không phải sơ suất." ;;
        *)
          if [ "$GAP_PROBE_MODE" = "required" ]; then
            echo "VIOLATION [$slug]: chưa qua phản biện context sạch (gap-probe) — không có gap-probe.md hợp lệ và ledger không có entry descope. $gp_fix"
            violations=$((violations+1))
          else
            echo "NOTE [$slug]: chưa qua phản biện context sạch (gap-probe) — advisory, không chặn merge. $gp_fix"
          fi ;;
      esac
    fi
  fi

  report="$dir/evidence-report.md"
  if [ ! -f "$report" ]; then
    echo "VIOLATION [$slug]: status=$status but no evidence-report.md"
    violations=$((violations+1)); continue
  fi
  # Read report fields from the leading frontmatter ONLY — same scope as the
  # provenance reads below, so a no-fence/offset-fence report can't pass verdict
  # while its provenance reads empty (would otherwise let a bypassed PASS slip).
  verdict="$(front_field "$report" verdict)"
  signoff="$(front_field "$report" human_signoff)"
  if [ "$verdict" != "PASS" ]; then
    echo "VIOLATION [$slug]: verdict=$verdict (must be PASS to merge)"
    violations=$((violations+1)); continue
  fi
  bypass="$(front_field "$report" bypass_used | tr '[:upper:]' '[:lower:]')"
  ack="$(front_field "$report" bypass_ack)"
  case "$bypass" in true|1|yes)
    if [ -n "$ack" ]; then
      echo "NOTE [$slug]: bypass_used=$bypass acknowledged (bypass_ack: $ack) — released with audit trail"
    else
      echo "VIOLATION [$slug]: bypass_used=$bypass — PASS produced with the gate bypassed (ACCEPTANCE_GATE_BYPASS); re-verify without bypass, or record bypass_ack: <name> <date> to consciously release"
      violations=$((violations+1)); continue
    fi ;;
  esac
  enf="$(front_field "$report" enforcement_mode | tr '[:upper:]' '[:lower:]')"
  case "$enf" in
    off) echo "VIOLATION [$slug]: enforcement_mode=off — gate did nothing at write time; re-verify under enforcement: strict before merge"
      violations=$((violations+1)); continue ;;
    warn) echo "WARNING [$slug]: enforcement_mode=warn — gate only warned (not blocked) when this PASS was written; evidence present but not hard-enforced" ;;
  esac
  if [ -z "$signoff" ]; then
    echo "VIOLATION [$slug]: verdict PASS but human_signoff is empty (Gate 2 pending)"
    violations=$((violations+1)); continue
  fi
  # THỨ TỰ CÓ RĂNG: chốt rỗng ngay trên chạy TRƯỚC. Gộp hai chốt cho gọn sẽ làm
  # chuỗi rỗng không khớp mẫu lưới-đen nào rồi rơi ra `clean` — hồi quy fail-open
  # trên một luật đang bảo vệ.
  #
  # human_signoff trước 1.24.0 chỉ bị kiểm KHÁC-RỖNG, nên "PENDING — chờ Manh
  # gật" thoả và cổng in "signed off by PENDING". Đó KHÔNG phải đường tấn công
  # mà là đường đi bộ bình thường: người duyệt mở file định ký, gõ một dòng giữ
  # chỗ, commit đúng nghi thức human-fields-only. Và require_human_commit không
  # cứu được — nó kiểm AI commit và commit đó chạm dòng nào, không kiểm nội
  # dung có phải một cái tên.
  #
  # PHẠM VI ĐÃ RÚT (2026-07-29, sau BỐN lần thử): chốt này CHỈ so chuỗi trên
  # chính chữ ký — không đọc `signoff.approvers`, không phân tích YAML nào. Bốn
  # bản vá liên tiếp cố khớp chữ ký với allowlist đều hỏng theo một hình dạng
  # YAML hợp lệ MỚI (khoá trần / indent 2 / ngang cột / chú thích đuôi / dấu
  # phẩy trong nháy / flow mapping / space trước dấu hai chấm), ba lần kèm hồi
  # quy chặn nhầm người duyệt thật. Không gian hình dạng YAML hợp lệ là vô hạn
  # còn mỗi bản vá chỉ đóng được tập mình nghĩ ra — nên lớp đó bị GỠ HẲN thay
  # vì vá lần năm. Đánh đổi đã khai: giữ-chỗ viết bằng ngôn ngữ ngoài bảng dưới
  # vẫn lọt (xem "Đã biết là không bắt được" trong contract).
  if placeholder_signoff "$signoff"; then
    echo "VIOLATION [$slug]: human_signoff \"$signoff\" is a placeholder, not a signature — it names no approver, so Gate 2 is still pending. Replace it with the approver's name + date once they actually sign."
    violations=$((violations+1))
    # Nói THẲNG giới hạn của chính luật vừa nổ, đúng lúc người vận hành đang
    # sửa dòng đó. Không có câu này, cách sửa rẻ nhất là đổi "PENDING" thành
    # một cách nói khác — và cổng sẽ xanh, vì lưới chỉ khớp một bảng tiền tố
    # ngắn cố định. Một dòng cho cả lần chạy, in ở cuối (xem NARROW_NET_SEEN).
    NARROW_NET_SEEN=1
    continue
  fi
  # Human-signoff provenance: the signature is text in an AI-writable file —
  # the git history of the commit that INTRODUCED it is the only
  # machine-checkable attribution. Standard flow: verify commits the
  # machine-written report first; the reviewer lands the signature in its own
  # commit touching only human-owned lines (human_signoff / human_override /
  # verdict upgrade / bypass_ack). Comment-only and blank +/- lines tolerated.
  if [ "$REQ_HUMAN_COMMIT" = "true" ] || [ -n "$AGENT_AUTHORS" ]; then
    if ! command -v git >/dev/null 2>&1 || ! git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
      echo "NOTE [$slug]: signoff provenance unverifiable — $ROOT is not a git repo here (signoff.require_human_commit/agent_authors set)"
    else
      rel_report="${report#"$ROOT"/}"
      sign_commit="$(git -C "$ROOT" log --format=%H -S"human_signoff: $signoff" -- "$rel_report" 2>/dev/null | head -1)"
      [ -z "$sign_commit" ] && sign_commit="$(git -C "$ROOT" log --format=%H -S"$signoff" -- "$rel_report" 2>/dev/null | head -1)"
      if [ -z "$sign_commit" ]; then
        if [ "$REQ_HUMAN_COMMIT" = "true" ]; then
          echo "VIOLATION [$slug]: human_signoff present but not found in any commit of $rel_report — the reviewer must COMMIT the signoff themselves (signoff.require_human_commit)"
          violations=$((violations+1)); continue
        fi
      else
        if [ -n "$AGENT_AUTHORS" ]; then
          author="$(git -C "$ROOT" log -1 --format=%ae "$sign_commit" 2>/dev/null)"
          hit=""
          while IFS= read -r g; do
            [ -n "$g" ] || continue
            case "$author" in $g) hit="$g" ;; esac
          done <<GLOBS2
$AGENT_AUTHORS
GLOBS2
          if [ -n "$hit" ]; then
            echo "VIOLATION [$slug]: signoff commit $sign_commit authored by \"$author\" — matches signoff.agent_authors blocklist ($hit); Gate 2 must be signed by a human identity"
            violations=$((violations+1)); continue
          fi
        fi
        if [ "$REQ_HUMAN_COMMIT" = "true" ]; then
          nonhuman="$(git -C "$ROOT" show --format= --unified=0 "$sign_commit" -- "$rel_report" 2>/dev/null \
            | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)' \
            | grep -vE '^[+-][[:space:]]*((human_signoff|human_override|verdict|bypass_ack)[[:space:]]*:|#|$)')"
          if [ -n "$nonhuman" ]; then
            echo "VIOLATION [$slug]: the commit introducing human_signoff ($sign_commit) also edits the report body — the Gate-2 signature must land in its own human-fields-only commit (signoff.require_human_commit). Offending lines:"
            printf '%s\n' "$nonhuman" | head -5 | sed 's/^/    /'
            violations=$((violations+1)); continue
          fi
        fi
      fi
    fi
  fi
  # Stale-evidence check: the PASS certifies the tree at verified_commit. Any
  # non-gate file changed since then (committed or working tree) means the code
  # being merged is NOT the code that was verified — re-verify, don't ride old
  # evidence. Reports without the field (older template) and clones where the
  # commit is unreachable (rebase/squash/shallow fetch) only get a NOTE.
  vc="$(front_field "$report" verified_commit)"
  if [ -z "$vc" ]; then
    echo "NOTE [$slug]: report has no verified_commit (older template) — evidence is not pinned to a commit; code drift since verify is NOT machine-checked. Re-verify to pin."
  elif ! command -v git >/dev/null 2>&1 || ! git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
    echo "NOTE [$slug]: verified_commit present but $ROOT is not a git repo here — staleness unverifiable"
  elif ! git -C "$ROOT" rev-parse --quiet --verify "$vc^{commit}" >/dev/null 2>&1; then
    echo "NOTE [$slug]: verified_commit $vc not found in this clone (rebase/squash or shallow fetch?) — staleness unverifiable; re-verify to re-pin"
  else
    # feature_scope's non-zero return means "not declared" (partial/malformed/
    # absent paths) — the normal fallback path, not an error, so it must not
    # abort the script or leak stderr; scope simply stays empty (whole-tree).
    scope=""
    if scope="$(feature_scope "$dir/evals.yaml")"; then :; else scope=""; fi
    # A feature earns narrow scope only when its declaration is CHECKED against
    # this PR's own gated diff (the coverage set, BASE_SHA...HEAD) — and that
    # check only runs at the one moment the declaration is new or changed: when
    # this feature's own _acceptance/<slug>/ is part of the PR diff. Without a
    # usable coverage set (BASE_SHA unresolvable, OR resolvable but its `git
    # diff` could not be computed — COVERAGE_OK!=1 covers both) there is
    # nothing to check the declaration against at all, so "cannot cross-check"
    # must unconditionally fall back to whole-tree — never read as
    # "declaration covers everything". This only speaks up for a feature that
    # actually HAD a scope to refuse (the outer `[ -n "$scope" ]`); an
    # undeclared feature (scope already empty) stays completely silent here,
    # same as before.
    if [ -n "$scope" ]; then
      if [ "$COVERAGE_OK" -ne 1 ]; then
        if [ -z "$BASE_SHA" ]; then
          echo "NOTE [$slug]: no usable PR base (BASE_SHA empty) — declared eval paths cannot be cross-checked against this PR's gated diff; narrow staleness scope refused, whole-tree applied"
        else
          echo "NOTE [$slug]: this PR's gated diff could not be computed (git diff \"$BASE_SHA...HEAD\" failed) — declared eval paths cannot be cross-checked against this PR's gated diff; narrow staleness scope refused, whole-tree applied"
        fi
        scope=""
      # A literal-prefix `case` match against the shared $ALL_CHANGED list (see
      # slug_acceptance_touched() below), not a grep regex: unlike a regex
      # over `git diff --name-only` output, a quoted case-pattern prefix
      # cannot have its directory boundary defeated by a slug containing a
      # regex metacharacter (e.g. slug "a.b" matching an unrelated
      # "_acceptance/axb/" via the "." wildcard) — the prefix segment is
      # quoted, so only the trailing unquoted `*` acts as a wildcard. So "fx"
      # still never matches "fx-extra".
      elif slug_acceptance_touched "$slug"; then
        # This feature's own _acceptance/<slug>/ IS part of the PR diff — the
        # declaration is new or changed, so this is the one moment the
        # cross-check must run. An EMPTY gated coverage set (this PR touches
        # nothing gated besides its own _acceptance/<slug>/) is the exact
        # defect this branch exists to close: scope_gaps() over an empty list
        # returns no gaps, which used to read as "declaration checked out
        # fine" when there was in fact NOTHING to check it against — the same
        # class of doubt as "no usable base" above, and the governing rule
        # says doubt keeps whole-tree, never narrow-on-a-guess.
        if [ -z "$GATED_COVERAGE" ]; then
          echo "NOTE [$slug]: this PR's gated coverage set is empty (only _acceptance/$slug/ changed) — nothing to cross-check declared eval paths against; narrow staleness scope refused, whole-tree applied"
          scope=""
        else
          gaps="$(scope_gaps "$GATED_COVERAGE" "$scope")"
          if [ -n "$gaps" ]; then
            echo "NOTE [$slug]: declared eval paths do not cover this PR's gated diff — narrow staleness scope refused, whole-tree applied. Not covered:"
            printf '%s\n' "$gaps" | head -10 | sed 's/^/    /'
            scope=""
          fi
        fi
      fi
    fi
    # A declared union that matches no tracked file at all is a typo or a
    # rotted/renamed path, not a scope. This is deliberately OUTSIDE the
    # cross-check branch above and applies whenever scope is still non-empty
    # here, regardless of whether that cross-check ran: the cross-check only
    # fires the moment this feature's own _acceptance/<slug>/ is part of the
    # PR diff, i.e. when the declaration is new or changed. A PR that
    # introduces a match-nothing declaration while touching only its own gate
    # artifacts has an EMPTY coverage set, so the cross-check passes
    # vacuously and narrow scope is granted; every later PR that changes real
    # code without touching this feature's _acceptance/<slug>/ then skips the
    # cross-check entirely, and stale_files scoped to a match-nothing glob
    # filters out every real change forever. Governing rule: narrow scope is
    # never granted on a guess — a scope that provably matches nothing
    # tracked in the repo is exactly that. Silent for an undeclared feature:
    # scope is already empty there, so this guard never fires (AC-3).
    if [ -n "$scope" ] && ! scope_has_any_match "$ROOT" "$scope"; then
      echo "NOTE [$slug]: declared eval paths match no gated file in the repository (a typo, a stale path, or a union every match of which is _acceptance/** or t1-exempt — none of which staleness can ever report) — narrow staleness scope refused, whole-tree applied. Declare a glob pointing at code this feature's evals actually exercise."
      scope=""
    fi
    stale="$(stale_files "$ROOT" "$vc" "$scope")"
    # A granted narrow scope is the only path that WEAKENS the gate (it can
    # only shrink the staleness set stale_files reports), and until now it was
    # the only path with no output at all — leaving "this feature is genuinely
    # unaffected" indistinguishable from "this feature's declaration has
    # drifted and no longer names the code this PR touched". Announce it, and
    # say explicitly when the narrowing suppressed a change whole-tree would
    # have reported. Every refusal branch above already clears scope back to
    # "", so this only fires when scope survived all three checks; an
    # undeclared feature never sets scope in the first place and stays silent
    # (the golden baseline pins this for the seven undeclared features).
    if [ -n "$scope" ]; then
      wide="$(stale_files "$ROOT" "$vc")"
      n_wide="$(printf '%s' "$wide" | grep -c . || true)"
      n_narrow="$(printf '%s' "$stale" | grep -c . || true)"
      suppressed=$((n_wide - n_narrow))
      msg="NOTE [$slug]: narrow staleness scope applied ($(printf '%s' "$scope" | tr '\n' ' ' | sed 's/[[:space:]]*$//'))"
      [ "$suppressed" -gt 0 ] && msg="$msg — suppressed $suppressed whole-tree change(s)"
      echo "$msg"
    fi
    if [ -n "$stale" ]; then
      echo "VIOLATION [$slug]: evidence is stale — code changed after verify (verified_commit $vc); re-run verify before merge. Changed:"
      printf '%s\n' "$stale" | head -10 | sed 's/^/    /'
      violations=$((violations+1)); continue
    fi
  fi
  # run-log presence: the re-check below reconciles report run_ids against
  # _acceptance/<slug>/run-log.jsonl (machine-written at verify). A missing log
  # (older verify flow) is tolerated but must be visible.
  if [ ! -f "$dir/run-log.jsonl" ]; then
    echo "NOTE [$slug]: no run-log.jsonl (older verify flow) — run_id provenance is not machine-logged; report run_ids are unreconciled. Re-verify to generate the log."
  fi
  # observed (schema v2): older reports with screenshot evidence never faced the
  # inspected-frames bar — tolerated, but must be visible.
  sv="$(front_field "$report" schema_version)"
  case "$sv" in (*[!0-9]*|'') sv=1 ;; esac
  if [ "$sv" -lt 2 ] \
     && grep -qiE '^[[:space:]]*screenshot[[:space:]]*[:=]' "$report" \
     && ! grep -qiE '^[[:space:]]*observed[[:space:]]*[:=]' "$report"; then
    echo "NOTE [$slug]: schema v$sv report has screenshot evidence without observed: — frame inspection was not machine-enforced for this report. Re-verify with template v2 to enforce."
  fi
  # network truth (wave 1, advisory): a claim-bearing network_observed (clean /
  # app-fail) must have its dump file on disk — vocab without evidence is NOTEd,
  # never blocked (nothing network-related is hook-enforced until schema v3).
  net_missing=0
  while IFS= read -r eid; do
    [ -n "$eid" ] || continue
    [ -f "$dir/evidence/${eid}-network.txt" ] || net_missing=$((net_missing+1))
  done <<NETIDS
$(awk 'tolower($0) ~ /^[[:space:]]*-[[:space:]]*eval:/ {id=$NF} tolower($0) ~ /^[[:space:]]*network_observed[[:space:]]*[:=][[:space:]]*["'\''"]?(clean|app-fail)($|[^a-z-])/ {print id}' "$report")
NETIDS
  if [ "$net_missing" -gt 0 ]; then
    echo "NOTE [$slug]: $net_missing network_observed claim(s) (clean/app-fail) with no evidence/E{id}-network.txt on disk — vocab without a dump file (advisory until schema v3)"
  fi
  # Re-verify the COMMITTED evidence with the same core the hook runs — catches a
  # report hand-edited after the write-time hook, or written under bypass.
  if [ "$RECHECK_MODE" != off ]; then
    if [ -f "$RECHECK" ] && command -v node >/dev/null 2>&1; then
      recheck_out="$(node "$RECHECK" "$report" 2>&1)"; rc=$?
      if [ "$rc" -eq 1 ]; then
        if [ "$RECHECK_MODE" = strict ]; then label="VIOLATION"; else label="NOTE"; fi
        echo "$label [$slug]: committed evidence fails re-check (recheck: $RECHECK_MODE):"
        printf '%s\n' "$recheck_out" | sed 's/^/    /'
        if [ "$RECHECK_MODE" = strict ]; then violations=$((violations+1)); continue; fi
      elif [ "$rc" -ne 0 ]; then
        echo "NOTE [$slug]: evidence re-check unavailable (exit $rc) — ${recheck_out:-skipped}"
      fi
    else
      echo "NOTE [$slug]: evidence re-check not vendored (recheck-evidence.js/node missing) — committed-evidence bar NOT enforced"
    fi
  fi
  echo "OK [$slug]: $verdict, signed off by $signoff"
done

# per-slug chỉ được ghi `ran` khi vòng lặp nhìn thấy ĐÚNG số thư mục mà phép
# đếm độc lập nhìn thấy.
[ "$SLUG_SEEN" -eq "$SLUG_EXPECTED_N" ] && ledger_mark ran per-slug

# gap-probe ghi sổ ở ĐÚNG MỘT chỗ, sau khi đã biết trọn lịch sử lần chạy. Bản
# trước mark từ HAI nơi độc lập — `declared-off` trong gap_probe_not_enforced()
# và `ran` trong vòng lặp — nên một lần chạy mà classifier thành công ở slug này
# và thất bại ở slug kia ghi CẢ HAI tên: chokepoint đếm 2 rồi exit 2, biến một
# suy giảm advisory (theo thiết kế chỉ NOTE, không chặn) thành chặn cứng, VÀ
# nuốt luôn dòng tổng kết violation thật của lần chạy đó — người đọc nhận đúng
# lời khuyên SAI ("không phải lỗi của bạn, báo maintainer").
# Thứ tự dưới đây là thứ tự trung thực: một lần chạy chỉ cưỡng chế được MỘT
# PHẦN thì khai là `declared-off`, không phải `ran`.
if [ "$GAP_PROBE_MODE" = "off" ]; then
  ledger_mark declared-off gap-probe          # tắt CÓ khai báo qua config (AC-3)
elif [ "$GP_NOT_ENFORCED" -eq 1 ]; then
  ledger_mark declared-off gap-probe          # mọi đường *_not_enforced (AC-12)
elif [ "$GP_RAN" -eq 1 ] || [ "$GP_SCOPE_N" -eq 0 ]; then
  # chạy thật ít nhất một slug, HOẶC vũ trang mà scope rỗng = đã làm trọn việc
  ledger_mark ran gap-probe
fi
# Còn lại (scope KHÔNG rỗng, không chạy, không khai tắt) = khối bị trượt qua:
# cố ý KHÔNG mark để chokepoint bắt (AC-2/AC-9).

# ── T1-escape backstop (PR-level) ────────────────────────────────────────────
# T1 is self-declared at Phase 0 from EXPECTED paths — nothing stops a "docs
# typo" PR from also touching src/billing/. With a PR base: changed files
# matching t3_paths — or falling outside t1_skip_globs — require the PR to
# carry _acceptance/<slug>/ artifacts. (Under the stale-evidence rule every
# gated PR re-verifies, so its diff always includes gate artifacts.) There is
# no path→slug mapping, so "carries artifacts" means any _acceptance/ change;
# the per-slug checks above judge their quality.
# Reuses the shared diff computed once above the feature loop (same
# BASE_SHA...HEAD range) instead of a second `git diff` here. Both variable
# sets are filled from that single query, so $DIFF_FILES and the scope
# cross-check's $ALL_CHANGED are the same list; DIFF_READY and COVERAGE_OK
# likewise move together.
if [ "$T1_ESCAPE" -eq 0 ]; then
  t1_escape_not_enforced
elif [ "$DIFF_READY" -eq 0 ]; then
  echo "NOTE: T1-escape backstop skipped — $DIFF_SKIP_NOTE"
  # AC-3: thiếu --base là tắt CÓ khai báo (bỏ-qua-có-tín-hiệu, hành vi cũ).
  ledger_mark declared-off t1-escape
else
  changed="$DIFF_FILES"
  gate_touched=0; t3_hits=""; nont1_hits=""
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    case "$f" in _acceptance/*|*/_acceptance/*) gate_touched=1; continue ;; esac
    if [ -n "$T3_PATHS" ] && match_globs "$f" "$T3_PATHS"; then
      t3_hits="${t3_hits}${f}"$'\n'
    elif ! match_globs "$f" "$T1_GLOBS"; then
      nont1_hits="${nont1_hits}${f}"$'\n'
    fi
  done <<CHANGED
$changed
CHANGED
  if [ "$gate_touched" -eq 0 ]; then
    if [ -n "$t3_hits" ]; then
      echo "VIOLATION [PR]: T3 paths (t3_paths) changed but the PR carries NO _acceptance/<slug>/ artifacts — critical code changed without the gate. Changed:"
      printf '%s' "$t3_hits" | head -10 | sed 's/^/    /'
      violations=$((violations+1))
    elif [ -n "$nont1_hits" ]; then
      echo "VIOLATION [PR]: non-T1 files changed (outside t1_skip_globs) but the PR carries NO _acceptance/<slug>/ artifacts — declare T1 honestly (t1_skip_globs) or run the gate. Changed:"
      printf '%s' "$nont1_hits" | head -10 | sed 's/^/    /'
      violations=$((violations+1))
    fi
  fi
  ledger_mark ran t1-escape
fi

# AC-16 vế sau: dòng tổng kết PHẢI khai là luật đã tắt. Một marker lẻ giữa hàng
# chục dòng output là thứ người đọc lướt qua; khai ở dòng cuối thì không.
[ "$GP_NOT_ENFORCED" -eq 1 ] && echo "pre-merge-check: gap-probe: KHÔNG cưỡng chế trong lần chạy này (xem dòng marker NOT ENFORCED ở trên)"
[ "$T1_ESCAPE_OFF" -eq 1 ] && echo "pre-merge-check: T1-escape: KHÔNG cưỡng chế trong lần chạy này (xem dòng marker NOT ENFORCED ở trên)"

# ─── Điểm nghẽn sổ luật: `clean` phải được chứng minh (AC-2/AC-5/AC-7) ──────
if [ "$LEDGER_ENABLED" -eq 1 ]; then
  ledger_bad=0
  for _n in $LEDGER_EXPECTED; do
    _c="$(ledger_count "$_n")"
    if [ "$_c" -eq 0 ]; then
      echo "VIOLATION [ledger]: luật $_n không chạy và không khai tắt"
      ledger_bad=1
    elif [ "$_c" -gt 1 ]; then
      echo "VIOLATION [ledger]: luật $_n ghi sổ $_c lần — trạng thái sổ không nhất quán"
      ledger_bad=1
    fi
  done
  for _w in $LEDGER_RAN $LEDGER_OFF; do
    case " $LEDGER_EXPECTED " in
      *" $_w "*) ;;
      *) echo "VIOLATION [ledger]: tên lạ $_w — cập nhật EXPECTED"; ledger_bad=1 ;;
    esac
  done
  # k lấy từ LEDGER_K (đếm EXPECTED lúc khai báo) — TUYỆT ĐỐI không n+m: in
  # tổng tự cộng là tautology không bao giờ hiển thị lệch được (AC-5).
  echo "pre-merge-check: rules ran=$LEDGER_RAN_N declared-off=$LEDGER_OFF_N expected=$LEDGER_K"
  if [ "$ledger_bad" -eq 1 ]; then
    echo "NOTE: VIOLATION [ledger] là lỗi NỘI TẠI của cổng pre-merge (một khối luật bị trượt qua hoặc sổ lệch) — KHÔNG phải lỗi trong thay đổi của bạn. Bước kế tiếp: báo maintainer của kit kèm TOÀN BỘ output lần chạy này; đừng sửa feature của bạn để né nó."
    exit 2
  fi
fi

if [ -n "$NARROW_NET_SEEN" ]; then
  echo "NOTE: the placeholder net that just fired matches a SHORT FIXED prefix list — pending, tbd, todo, n/a, none, unsigned, waiting, a bare > | or -, and an unfilled <...> template. NOTHING else. A holding note phrased any other way (\"FIXME\", \"LGTM\", \"ok\", or one written in another language) passes this gate. Rewording the line is NOT a fix; put a real approver name + date there."
fi

if [ "$violations" -gt 0 ]; then
  echo "pre-merge-check: $violations violation(s) — merge blocked"
  exit 1
fi
echo "pre-merge-check: clean"
exit 0
