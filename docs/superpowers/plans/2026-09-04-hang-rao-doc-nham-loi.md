# Hàng rào thôi đọc nhầm "không đo được" thành "không có gì sai" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bốn điểm đọc git trong `repin-eval-coverage.mjs` chuyển từ "lỗi đọc thành rỗng thành sạch" sang **từ chối lớn tiếng**; ô đo tự-quy-chiếu được **khai tường minh** và **đếm được**; và một hàng rào mới bắt khoá YAML trùng trong `_acceptance/**/evals.yaml`.

**Architecture:** Một chốt điều kiện tiên quyết ở **đầu mỗi chế độ** (không bọc lại cả chín điểm gọi `gitOk`) + biến thể `gitMust` cho hai chỗ mà thất bại chắc chắn là lỗi git thật + một cờ khai `self_referential: true` đọc từ `evals.yaml` + một script bash độc lập đọc **thô** từng dòng YAML.

**Tech Stack:** Node ESM (chỉ builtins — hàng rào phải chạy trong CI không `node_modules`), bash 3.2 (macOS), git CLI. Không thêm dependency nào.

**Spec:** `docs/superpowers/specs/2026-09-03-hang-rao-doc-nham-loi-design.md`
**Contract:** `_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/contract.md` (11 AC, T2)
**Evals:** `_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/evals.yaml` (E1…E11)

## Global Constraints

- **Comment trong mã: TIẾNG ANH** (CLAUDE.md). Chuỗi in ra cho người đọc CI giữ tiếng Việt không dấu, khớp giọng sẵn có của hai script.
- **Không thêm dependency.** `repin-eval-coverage.mjs` chỉ dùng builtins; hàng rào mới chỉ dùng bash + awk/grep.
- **MEASURE-BIRTH:** mỗi phép đo mới XONG chỉ khi có **cặp hai chiều trên cùng fixture** — vật lành → xanh; phá đúng nguồn ấy → **ĐỎ với thông điệp ghim** (tên mốc/ca/bất biến, không chỉ exit code).
- **LUẬT FIXTURE (từ `evals.yaml`):** mọi dòng repin trong fixture phải sinh bằng cách **gọi chế độ `write` thật** (`repin_written`). Ngoại lệ duy nhất: hình dạng bộ ghi không tạo ra được theo thiết kế — dòng "ông bà" không `prev_sha`, và dòng có `sha` không phải commit ở Task 2. Ca nào dùng ngoại lệ phải **nói rõ trong comment nó là ngoại lệ**.
- **`TOTAL` của bộ răng được DẪN XUẤT từ `KNOWN`**, và `so-khop-total` đối chiếu nó với mọi con số `OK: n/N ca` / `PARTIAL: n/N` viết trong `_acceptance/repin-khong-chay-lai-eval/{evals.yaml,s4-args.json}`. **Thêm ca là phải sửa các con số ấy** — hằng số ghép, không phải việc dọn dẹp.
- **Ngoài phạm vi, không chạm:** `lib/evidence-core.cjs` · `scripts/ci/check-gate-guards-job.sh` · bốn điểm gọi `gitOk` đang đúng (2 chỗ đã `die` ở dòng 279/281, 2 chỗ `merge-base --is-ancestor` fail-closed ở 292/412) · cắm hàng rào vào CI.

---

### Task 1: `newlines` từ chối mốc so sánh không phân giải được

Phục vụ **E1 (AC-1)** và **E2 (AC-2)**. `independent: false` — Task 2/4 sửa cùng tệp.

**Files:**
- Modify: `scripts/ci/repin-eval-coverage.mjs` — `modeNewlines`, dòng 484-486
- Modify: `scripts/ci/check-repin-eval-coverage.sh` — `KNOWN` (dòng 29), helper `want` (~dòng 245), thêm hai ca teeth

**Interfaces:**
- Consumes: `gitOk(...)`, `die(m)` sẵn có
- Produces: helper `want` nhận needle có tiền tố `KHONG:` = **phải KHÔNG xuất hiện** — Task 2/4 dùng lại

- [ ] **Step 1: Mở rộng helper `want` để khẳng định được sự VẮNG MẶT**

Trong `scripts/ci/check-repin-eval-coverage.sh`, thay vòng `for n in "$@"` trong `want()`:

```bash
        local n
        for n in "$@"; do
            # A needle prefixed with KHONG: asserts ABSENCE. E1's load-bearing claim is
            # not "it exits nonzero" but "it stopped BEFORE reading any file", and the
            # only observable difference is what the run did NOT print.
            if [ "${n#KHONG:}" != "$n" ]; then
                printf '%s\n' "$out" | grep -qF -- "${n#KHONG:}" \
                    && { echo "CASE $name: FAIL — dau ra CO '${n#KHONG:}' ma le ra khong duoc co"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; return; }
            else
                printf '%s\n' "$out" | grep -qF -- "$n" \
                    || { echo "CASE $name: FAIL — dau ra khong neu '$n'"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; return; }
            fi
        done
```

- [ ] **Step 2: Viết hai ca teeth ĐỎ/XANH trước khi sửa lõi**

Thêm vào `KNOWN` (dòng 29): `base-khong-phan-giai base-thieu-file`

Thêm hai khối ca, đặt cạnh ca `newlines-thieu-prev`:

```bash
    # 22. AC-1: an unresolvable base is a REFUSAL, not "every line is new". Measured
    # 2026-09-03 before the fix: 1674 lines classed as new and 25 false FAIL lines, each
    # blaming a dossier that had nothing to do with the run.
    if run base-khong-phan-giai; then
        fx '    paths: ["src/**"]
'
        repin_written "$d" "$NEW"
        out="$(core "$d" newlines refs/heads/khong-ton-tai)"; rc=$?
        # The two KHONG: needles are the whole point. Without them a version that scans
        # everything and only refuses at the end still passes: it prints the 1674 and the
        # false FAILs first, which is exactly the state this case exists to end.
        want base-khong-phan-giai red "$out" "$rc" \
            "refs/heads/khong-ton-tai" \
            "KHONG:FAIL: demo" \
            "KHONG:dong run-log moi so"
    fi

    # 23. AC-2, the positive control WITHOUT which the refusal above could be written as
    # "any empty `show` is an error" and still pass case 22. A dossier whose run-log does
    # not exist at a RESOLVABLE base is data, not damage: every line counts as new.
    if run base-thieu-file; then
        fx '    paths: ["src/**"]
'
        repin_written "$d" "$NEW"
        # OLD is the first commit; the dossier's run-log was empty there and the repin
        # line was appended after it, so "absent at base" is the real shape here.
        out="$(core "$d" newlines "$OLD")"; rc=$?
        want base-thieu-file green "$out" "$rc" "dong run-log moi so" "OK: moi dong repin moi deu mang prev_sha"
    fi
```

- [ ] **Step 3: Chạy hai ca — ca đỏ phải ĐỎ vì lý do đúng**

```bash
bash scripts/ci/check-repin-eval-coverage.sh teeth --case base-khong-phan-giai
```
Expected: `FAIL — mong do, nhung thoat 0` (lõi chưa từ chối).

```bash
bash scripts/ci/check-repin-eval-coverage.sh teeth --case base-thieu-file
```
Expected: PASS ngay. Đối chứng dương phải xanh cả **trước lẫn sau** — nó là thứ chứng minh phép sửa ở Step 4 không viết quá tay.

- [ ] **Step 4: Chốt base ở đầu `modeNewlines`**

Trong `scripts/ci/repin-eval-coverage.mjs`, đầu `modeNewlines`, ngay sau `const b = base || "origin/main";`:

```javascript
    // The precondition, checked BEFORE a single file is read. `gitOk("show", b + ":" +
    // rel)` returns null for two states that are not alike -- "the file did not exist at
    // that base" (data) and "that base does not resolve" (damage) -- and `|| ""` erases
    // the difference. Measured 2026-09-03 with a nonexistent branch: 1674 history lines
    // classed as new and 25 false FAILs, each naming an unrelated dossier; the only way
    // to know it was a false alarm was to read this file.
    // Placed here, not per-file: after this line `|| ""` below genuinely means "absent at
    // that base", which is the reading AC-2 keeps true.
    if (gitOk("rev-parse", "--verify", `${b}^{commit}`) === null)
        die(
            `moc so sanh '${b}' khong phan giai duoc — khong doc tep nao; kiem tra ten nhanh/ref roi chay lai`,
        );
```

- [ ] **Step 5: Chạy lại cả hai ca — cả hai phải PASS**

```bash
bash scripts/ci/check-repin-eval-coverage.sh teeth --case base-khong-phan-giai && bash scripts/ci/check-repin-eval-coverage.sh teeth --case base-thieu-file
```
Expected: hai dòng `CASE …: PASS`.

- [ ] **Step 6: Đo lại trên kho thật — ngưỡng 25 → 0**

```bash
node scripts/ci/repin-eval-coverage.mjs newlines refs/heads/khong-ton-tai; echo "exit=$?"
```
Expected: đúng MỘT dòng `FAIL: moc so sanh 'refs/heads/khong-ton-tai' khong phan giai duoc …`, `exit=1`, KHÔNG có dòng `dong run-log moi so`, KHÔNG có 25 dòng FAIL.

- [ ] **Step 7: Commit**

```bash
git add scripts/ci/repin-eval-coverage.mjs scripts/ci/check-repin-eval-coverage.sh && git commit -m "feat(ci): newlines tu choi moc so sanh khong phan giai duoc (AC-1, AC-2)"
```

---

### Task 2: `check` từ chối khi phép so hai mốc hoặc lượt dò clone nông thất bại

Phục vụ **E3 (AC-3)** và **E5 (AC-5)**. `independent: false`.

**Files:**
- Modify: `scripts/ci/repin-eval-coverage.mjs` — thêm `gitMust` cạnh `gitOk`; `modeCheck` dòng 361-365 (shallow) và 430-434 (diff)
- Modify: `scripts/ci/check-repin-eval-coverage.sh` — `KNOWN` + hai ca teeth

**Interfaces:**
- Consumes: `gitOk`, `die`, helper `want` có `KHONG:` từ Task 1
- Produces: `gitMust(why, ...args)` — trả stdout, `die(why)` khi git lỗi

- [ ] **Step 1: Viết hai ca teeth**

Thêm vào `KNOWN`: `diff-that-bai shallow-do-loi`

```bash
    # 24. AC-3: `git diff prev..sha` failing is a git error, not "no files changed".
    # The fixture makes it fail HONESTLY: `sha` is a blob hash. `cat-file -t` answers
    # "blob" for it -- so both validity probes above pass -- and `diff blob..commit` then
    # fails. Before the fix that failure became an empty file list, the pin counted as
    # MEASURED, and no later reader could ever discover which evals it swallowed.
    if run diff-that-bai; then
        fx '    paths: ["src/**"]
'
        blob="$(git -C "$d" hash-object -w "$d/src/a.ts")"
        # DECLARED EXCEPTION to the fixture law: `write` refuses a non-commit sha, and it
        # is right to. This case measures the READER on a line that already exists, so it
        # builds that one shape by hand -- same standing as the ong-ba line.
        repin_line "$d" "$blob" ",\"prev_sha\":\"$OLD\""
        out="$(core "$d" check)"; rc=$?
        want diff-that-bai red "$out" "$rc" "$OLD" "$blob"
    fi

    # 25. AC-5: the shallow-clone probe FAILING is not the same as it answering "false".
    # Removing .git makes every git call fail; asserting the probe's own message, plus the
    # ABSENCE of the summary line, is what proves the mode stopped THERE rather than
    # sailing on and dying somewhere later.
    if run shallow-do-loi; then
        fx '    paths: ["src/**"]
'
        repin_written "$d" "$NEW"
        rm -rf "$d/.git"
        out="$(core "$d" check)"; rc=$?
        want shallow-do-loi red "$out" "$rc" "khong do duoc kho co phai clone nong" \
            "KHONG:ho so da ky:"
    fi
```

- [ ] **Step 2: Chạy — cả hai phải ĐỎ vì lý do đúng**

```bash
bash scripts/ci/check-repin-eval-coverage.sh teeth --case diff-that-bai; bash scripts/ci/check-repin-eval-coverage.sh teeth --case shallow-do-loi
```
Expected: cả hai `FAIL — mong do, nhung thoat 0`.

- [ ] **Step 3: Thêm `gitMust`**

Ngay dưới `gitOk` trong `repin-eval-coverage.mjs`:

```javascript
// The must-variant. Used where the surrounding code has ALREADY established that the
// objects resolve, so a failure here is a real git error and not a state the guard is
// prepared for. `gitOk() || ""` at those points turned an error into "nothing changed",
// which made the pin count as measured and permanently unauditable.
const gitMust = (why, ...a) => {
    const out = gitOk(...a);
    if (out === null) die(`${why} (lenh: git ${a.join(" ")})`);
    return out;
};
```

- [ ] **Step 4: Chốt lượt dò clone nông**

Thay khối shallow (dòng 361-365) bằng:

```javascript
    // THREE states, and only two of them were handled. `gitOk` returns null when the
    // probe itself failed, null !== "true", so the mode sailed on ASSUMING a full clone
    // -- the one assumption that makes every grandfathered line look legitimate.
    const shallow = gitOk("rev-parse", "--is-shallow-repository");
    if (shallow === null)
        die(
            "khong do duoc kho co phai clone nong hay khong (lenh git that bai) — tu choi ket luan thay vi gia dinh kho day du",
        );
    if (shallow === "true")
        die(
            "kho la ban clone nong (shallow) — moi sha cu deu khong phan giai duoc nen dong repin nao cung roi vao hang ong ba va hang rao xanh ma khong do gi; fetch day du roi chay lai",
        );
```

- [ ] **Step 5: Chốt phép so hai mốc**

Thay (dòng 430-434):

```javascript
            const changed = (
                gitOk("diff", "--name-only", `${o.prev_sha}..${o.sha}`) || ""
            )
```

bằng:

```javascript
            // Both shas passed `cat-file -t` two lines above, so a failure here is a real
            // git error -- and `|| ""` read it as "no file changed", which made this pin
            // count as MEASURED with an empty touched-set. That is the one shape no later
            // reader can ever detect as a miss.
            const changed = gitMust(
                `khong so duoc hai moc cua mot dong repin: prev_sha=${o.prev_sha} sha=${o.sha}`,
                "diff",
                "--name-only",
                `${o.prev_sha}..${o.sha}`,
            )
```

- [ ] **Step 6: Chạy lại hai ca + ba đối chứng dương cũ không được đỏ theo**

```bash
bash scripts/ci/check-repin-eval-coverage.sh teeth --case diff-that-bai && bash scripts/ci/check-repin-eval-coverage.sh teeth --case shallow-do-loi && bash scripts/ci/check-repin-eval-coverage.sh teeth --case da-chay-lai && bash scripts/ci/check-repin-eval-coverage.sh teeth --case ong-ba && bash scripts/ci/check-repin-eval-coverage.sh teeth --case san-tinh-duoc
```
Expected: năm dòng PASS.

- [ ] **Step 7: Commit**

```bash
git add scripts/ci/repin-eval-coverage.mjs scripts/ci/check-repin-eval-coverage.sh && git commit -m "feat(ci): check tu choi khi diff hai moc hoac luot do shallow that bai (AC-3, AC-5)"
```

---

### Task 3: Hàng rào khoá YAML trùng trong `_acceptance/**/evals.yaml`

Phục vụ **E6 (AC-6)** và **E7 (AC-7)**. `independent: true` — tệp mới, không đụng Task 1/2/4.

**Files:**
- Create: `scripts/acceptance/check-eval-key-dupes.sh`
- Modify: `_acceptance/config.yaml` — khoá `hrdn_dupkey`
- Modify: `_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/decisions.jsonl`

**Interfaces:**
- Produces: `check-eval-key-dupes.sh` với ba chế độ — trần (quét kho), `--teeth`, `--teeth --case <ten>`; ba ca: `khoa-trung-co-that` (đỏ), `khoa-trung-neu-dich-danh` (đỏ, ghim thông điệp + khẳng định cấu trúc), `khoa-trong-khoi-van` (xanh — đối chứng dương)

- [ ] **Step 1: Viết phần quét của script**

```bash
#!/usr/bin/env bash
# Guard: no eval block in _acceptance/**/evals.yaml may carry the same key twice.
#
# Why it exists: `yaml.safe_load` keeps the LAST duplicate and says nothing. It already
# had a consequence -- the SIGNED dossier noi-thuoc-tai-lieu-vao-ci carried `expected`
# twice inside its E2 block, so signed evidence described a measurement that had been
# withdrawn.
#
# Read RAW, on purpose. Using the parser that swallows the key to catch the key being
# swallowed is circular, and "this guard calls no YAML parser" is the one structural
# property AC-7 pins so a later "simplification" back onto safe_load cannot pass.
#
# Usage: check-eval-key-dupes.sh [--teeth [--case <ten>]]
set -uo pipefail

ROOT="${ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
SELF="${BASH_SOURCE[0]}"

fail() { echo "FAIL: $*" >&2; exit 1; }

# One evals.yaml -> one line per duplicate. Block boundary: a list item (`- id:` shape).
# Keys counted are ONLY those at the item's own key indent; anything deeper belongs to a
# nested mapping or -- far more often here -- to the body of a `>-` block scalar, where
# lines like "paths: ..." are prose. Counting those reddens every healthy dossier.
scan_file() {
    awk -v F="$1" '
        function flush_item(   k) {
            for (k in seen)
                if (seen[k] > 1)
                    printf "%s:%d: khoa \047%s\047 lap %d lan trong khoi bat dau dong %d\n", F, first[k], k, seen[k], item_line
            delete seen; delete first
        }
        {
            line = $0
            if (line ~ /^[[:space:]]*#/) next
            if (line ~ /^[[:space:]]*-[[:space:]]+[A-Za-z_][A-Za-z0-9_]*:/) {
                flush_item()
                item_line = NR
                match(line, /^[[:space:]]*-[[:space:]]+/); key_indent = RLENGTH
                sub(/^[[:space:]]*-[[:space:]]+/, "", line)
                in_item = 1
            } else if (in_item) {
                if (line ~ /^[[:space:]]*$/) next
                match(line, /^[[:space:]]*/)
                if (RLENGTH < key_indent) { flush_item(); in_item = 0; next }
                if (RLENGTH != key_indent) next
                sub(/^[[:space:]]*/, "", line)
            } else next
            if (line !~ /^[A-Za-z_][A-Za-z0-9_]*:/) next
            k = line; sub(/:.*$/, "", k)
            seen[k]++
            if (seen[k] == 1) first[k] = NR
        }
        END { flush_item() }
    ' "$1"
}

scan_repo() {
    local files n=0 bad=0 out
    files=$(find "$ROOT/_acceptance" -name evals.yaml -type f 2>/dev/null | sort)
    # A scanner that matched NOTHING prints a clean sweep otherwise -- the exact shape
    # this dossier exists to close.
    [ -n "$files" ] || fail "khong tim thay tep evals.yaml nao duoi $ROOT/_acceptance — phep quet nay dang do KHONG GI, chu khong phai dang bao sach"
    while IFS= read -r f; do
        n=$((n + 1))
        out="$(scan_file "$f")"
        if [ -n "$out" ]; then
            printf '%s\n' "$out" | sed "s|^$ROOT/||" >&2
            bad=$((bad + $(printf '%s\n' "$out" | wc -l | tr -d ' ')))
        fi
    done <<< "$files"
    echo "tep evals.yaml da quet: $n | khoa lap: $bad"
    [ "$bad" -eq 0 ] || exit 1
    echo "OK: khong khoi eval nao mang mot khoa hai lan"
}
```

- [ ] **Step 2: Viết phần `--teeth` + dispatcher của cùng script**

```bash
KNOWN="khoa-trung-co-that khoa-trung-neu-dich-danh khoa-trong-khoi-van"
TOTAL=$(printf '%s\n' $KNOWN | wc -w | tr -d ' ')

teeth() {
    local ONLY="${1:-}" RAN=0 FAILED=0 W out rc ok n
    if [ -n "$ONLY" ] && ! printf '%s\n' $KNOWN | grep -qx "$ONLY"; then
        echo "unknown case: $ONLY (known: $KNOWN)" >&2; exit 2
    fi
    W="$(mktemp -d)"; trap 'rm -rf "$W"' EXIT
    run() { [ -z "$ONLY" ] || [ "$ONLY" = "$1" ]; }

    # The dossier that actually happened, reduced: `expected` twice inside one block.
    dossier_dup() {
        rm -rf "$W/r"; mkdir -p "$W/r/_acceptance/demo"
        cat > "$W/r/_acceptance/demo/evals.yaml" <<'YAML'
evals:
  - id: E2
    executor: script
    expected: >-
      cau dau tien
    evidence_required: [run_id]
    expected: >-
      cau thu hai — nuot mat cau tren
YAML
    }

    if run khoa-trung-co-that; then
        RAN=$((RAN + 1)); dossier_dup
        out="$(ROOT="$W/r" bash "$SELF" 2>&1)"; rc=$?
        if [ "$rc" -eq 0 ]; then
            echo "CASE khoa-trung-co-that: FAIL — mong do, nhung thoat 0"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1
        else echo "CASE khoa-trung-co-that: PASS"; fi
    fi

    if run khoa-trung-neu-dich-danh; then
        RAN=$((RAN + 1)); dossier_dup
        out="$(ROOT="$W/r" bash "$SELF" 2>&1)"; rc=$?
        ok=1
        # Dossier, key, line number. A message that only says "there is a duplicate"
        # sends the reader hunting through 34 files.
        for n in "_acceptance/demo/evals.yaml" "expected" ":7:"; do
            printf '%s\n' "$out" | grep -qF -- "$n" || {
                echo "CASE khoa-trung-neu-dich-danh: FAIL — dau ra khong neu '$n'"
                printf '%s\n' "$out" | sed 's/^/    /'; ok=0; break; }
        done
        # The structural half of AC-7.
        if [ "$ok" -eq 1 ] && grep -qE 'safe_load|yaml\.load|js-yaml|require..yaml' "$SELF"; then
            echo "CASE khoa-trung-neu-dich-danh: FAIL — hang rao dang dung mot bo doc YAML; no phai doc tho"; ok=0
        fi
        if [ "$ok" -eq 1 ]; then echo "CASE khoa-trung-neu-dich-danh: PASS"; else FAILED=1; fi
    fi

    # The positive control. Every `expected: >-` body in this repo is prose containing
    # lines like "paths: ..." and "cmd: ...". A scanner that counts those as keys reddens
    # every healthy dossier -- over-firing is the failure mode this case owns.
    if run khoa-trong-khoi-van; then
        RAN=$((RAN + 1)); rm -rf "$W/r"; mkdir -p "$W/r/_acceptance/demo"
        cat > "$W/r/_acceptance/demo/evals.yaml" <<'YAML'
evals:
  - id: E1
    executor: script
    paths: ["src/**"]
    expected: >-
      exit 0. O nay doi truong `paths: ["src/**"]` va truong
      `expected: >-` duoc neu nguyen van trong van xuoi, hai lan:
      expected: lan hai nam trong than khoi van, khong phai mot khoa.
    evidence_required: [run_id]
YAML
        out="$(ROOT="$W/r" bash "$SELF" 2>&1)"; rc=$?
        if [ "$rc" -ne 0 ]; then
            echo "CASE khoa-trong-khoi-van: FAIL — mong xanh, thoat $rc"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1
        else echo "CASE khoa-trong-khoi-van: PASS"; fi
    fi

    [ "$FAILED" -eq 0 ] || { echo "FAIL: it nhat mot ca khong xu su nhu doi hoi" >&2; exit 1; }
    if [ -n "$ONLY" ]; then
        echo "PARTIAL: $RAN/$TOTAL ca da chay — khong tuyen gi ve $((TOTAL - RAN)) ca chua chay"; exit 0
    fi
    [ "$RAN" -eq "$TOTAL" ] || fail "chi $RAN/$TOTAL ca chay ma khong khai --case"
    echo "OK: $RAN/$TOTAL ca"
}

case "${1:-}" in
"") scan_repo ;;
--teeth)
    case "${2:-}" in
    "") teeth "" ;;
    --case) [ -n "${3:-}" ] || fail "--case can mot ten ca"; [ "$#" -le 3 ] || fail "thua doi so: ${*:4}"; teeth "$3" ;;
    *) fail "doi so la '${2}' — chi nhan '--case <ten>'" ;;
    esac
    ;;
*) echo "usage: $(basename "$0") [--teeth [--case <ten>]]" >&2; exit 2 ;;
esac
```

- [ ] **Step 3: Chạy bộ răng — ba ca phải PASS**

```bash
chmod +x scripts/acceptance/check-eval-key-dupes.sh && bash scripts/acceptance/check-eval-key-dupes.sh --teeth
```
Expected: ba dòng `CASE …: PASS` rồi `OK: 3/3 ca`. Nếu `khoa-trong-khoi-van` đỏ → phép đọc đang đếm dòng trong thân khối văn; **sửa `awk`, KHÔNG nới ca**.

- [ ] **Step 4: Chạy trên kho thật**

```bash
bash scripts/acceptance/check-eval-key-dupes.sh
```
Expected: `tep evals.yaml da quet: <n> | khoa lap: 0` rồi `OK: …`. **Vế xanh này không chứng minh gì** (đo 03/09: 0/34 tệp có khoá lặp) — bằng chứng nằm ở Step 3.

- [ ] **Step 5: Kiểm chiều đỏ trên dữ liệu THẬT một lần**

```bash
cp _acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/evals.yaml /tmp/ev.bak && python3 -c "
import io
p='_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/evals.yaml'
s=io.open(p,encoding='utf-8').read().replace('    executor: script\n','    executor: script\n    executor: script\n',1)
io.open(p,'w',encoding='utf-8').write(s)
" && bash scripts/acceptance/check-eval-key-dupes.sh; echo "exit=$?"; cp /tmp/ev.bak _acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/evals.yaml && git diff --stat _acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/evals.yaml
```
Expected: `exit=1`, dòng đỏ nêu đúng tệp · khoá `executor` · số dòng; rồi `git diff --stat` **rỗng** (tệp đã khôi phục nguyên trạng).

- [ ] **Step 6: Nới lệnh của E6 sang bộ răng đầy đủ + ghi sổ quyết định**

```bash
python3 -c "
import io
p='_acceptance/config.yaml'
s=io.open(p,encoding='utf-8').read()
old='    hrdn_dupkey: bash scripts/acceptance/check-eval-key-dupes.sh && bash scripts/acceptance/check-eval-key-dupes.sh --teeth --case khoa-trung-co-that\n'
new='    hrdn_dupkey: bash scripts/acceptance/check-eval-key-dupes.sh && bash scripts/acceptance/check-eval-key-dupes.sh --teeth\n'
assert s.count(old)==1
io.open(p,'w',encoding='utf-8').write(s.replace(old,new))
"
```

Rồi append một dòng vào `_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/decisions.jsonl` với `id` = `d-$(date -u +%Y%m%dT%H%M%SZ)-$RANDOM`, `at` = `$(date -u +%Y-%m-%dT%H:%M:%SZ)`:

```json
{"id": "<id>", "type": "fix", "stage": "S3", "at": "<at>", "decision": "hrdn_dupkey chay BO RANG DAY DU thay vi mot ca. Phuong an bi loai: giu --case khoa-trung-co-that", "impact": "doi chung duong khoa-trong-khoi-van (chan do oan tren than khoi van) se khong co o do nao chay neu giu lenh cu — mot phep do khong chay la mot phep do khong ton tai", "serves": ["AC-6"]}
```

- [ ] **Step 7: Commit**

```bash
git add scripts/acceptance/check-eval-key-dupes.sh _acceptance/config.yaml _acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/decisions.jsonl && git commit -m "feat(acceptance): hang rao bat khoa YAML trung trong evals.yaml (AC-6, AC-7)"
```

---

### Task 4: Ô đo tự-quy-chiếu — khai tường minh, đếm được, và hoàn nguyên `paths`

Phục vụ **E8 (AC-8)**, **E9 (AC-9)**, **E10 (AC-10)**. `independent: false`.

**Files:**
- Modify: `scripts/ci/repin-eval-coverage.mjs` — `evalsOf` (dòng 169), `modeCheck` (cờ `--min-selfref`, tập loại trừ, dòng tổng kết)
- Modify: `scripts/ci/check-repin-eval-coverage.sh` — `KNOWN` + bốn ca teeth
- Modify: `_acceptance/repin-khong-chay-lai-eval/evals.yaml` — hoàn nguyên `paths` E5/E6 + khai `self_referential: true`

**Interfaces:**
- Consumes: `evalsOf(slug)` trả mảng `{id, paths}` — nay thêm `selfRef: boolean`
- Produces: cờ `--min-selfref N` **cùng hình dạng từ chối** với `--min-computable N` (đối số lạ là `die`, không `continue`); dòng tổng kết thêm hạng `tu-quy-chieu: N (<slug>/<id>,…)`

- [ ] **Step 1: Viết bốn ca teeth**

Thêm vào `KNOWN`: `tu-quy-chieu-khai tu-quy-chieu-quen-khai tu-quy-chieu-dem-giam paths-e5e6-hoan-nguyen`

```bash
    # 26. AC-8: an eval that RUNS `check` is excluded from the must-rerun set only when it
    # SAYS SO. The fixture's cmd deliberately does not contain the guard's name: a "guess
    # it from the command string" implementation -- which is disease E of this dossier's
    # own opportunity file, matching a string shape instead of a declared subject -- fails
    # right here.
    if run tu-quy-chieu-khai; then
        fx '    paths: ["src/**"]
    self_referential: true
    cmd: echo hi
'
        repin_written "$d" "$NEW"
        out="$(core "$d" check)"; rc=$?
        want tu-quy-chieu-khai green "$out" "$rc" "tu-quy-chieu: 1" "demo/E1"
    fi

    # 27. AC-10: the direction of forgetting is the whole reason this mechanism was chosen
    # over guessing. Same fixture, declaration removed -> RED.
    if run tu-quy-chieu-quen-khai; then
        fx '    paths: ["src/**"]
    cmd: echo hi
'
        repin_written "$d" "$NEW"
        out="$(core "$d" check)"; rc=$?
        want tu-quy-chieu-quen-khai red "$out" "$rc" "demo" "E1" "tu-quy-chieu: 0"
    fi

    # 28. AC-9: the bucket must carry a NUMBER that moves. A count printed but never
    # asserted is the green-on-nothing shape this dossier exists to close, so the floor
    # runs in BOTH directions on one fixture.
    if run tu-quy-chieu-dem-giam; then
        fx '    paths: ["src/**"]
    self_referential: true
    cmd: echo hi
'
        repin_written "$d" "$NEW"
        out="$(core "$d" check --min-selfref 1)"; rc=$?
        [ "$rc" -eq 0 ] || { echo "CASE tu-quy-chieu-dem-giam: FAIL — san 1 phai xanh khi co dung 1 o khai"; printf '%s\n' "$out" | sed 's/^/    /'; FAILED=1; }
        out="$(core "$d" check --min-selfref 2)"; rc=$?
        want tu-quy-chieu-dem-giam red "$out" "$rc" "tu-quy-chieu = 1" "duoi san 2"
    fi

    # 29. AC-10's second half, asserted on the REAL repo: the 2026-09-03 narrowing of
    # E5/E6 bought quiet by selling coverage. Without the revert, case 26 is green on a
    # repo that has been blinded -- the deadlock is hidden, not gone.
    if run paths-e5e6-hoan-nguyen; then
        RAN=$((RAN + 1)); N_GREEN=$((N_GREEN + 1)); miss=0
        for id in E5 E6; do
            awk -v want="  - id: $id" '$0 == want {f=1; next} /^  - id:/ {f=0} f' \
                "$ROOT/_acceptance/repin-khong-chay-lai-eval/evals.yaml" \
                | grep -qE '^[[:space:]]+-[[:space:]]+"_acceptance"[[:space:]]*$' \
                || { echo "CASE paths-e5e6-hoan-nguyen: FAIL — $id chua hoan nguyen muc _acceptance trong paths"; miss=1; }
        done
        if [ "$miss" -eq 0 ]; then echo "CASE paths-e5e6-hoan-nguyen: PASS"; else FAILED=1; fi
    fi
```

- [ ] **Step 2: Chạy — ba ca phải hỏng vì lý do đúng**

```bash
for c in tu-quy-chieu-khai tu-quy-chieu-quen-khai tu-quy-chieu-dem-giam paths-e5e6-hoan-nguyen; do bash scripts/ci/check-repin-eval-coverage.sh teeth --case "$c"; done
```
Expected: `tu-quy-chieu-khai` FAIL (chưa có cờ nên ô vẫn bị tính là nuốt) · `tu-quy-chieu-dem-giam` FAIL (`--min-selfref` chưa tồn tại → `doi so la '--min-selfref'`) · `paths-e5e6-hoan-nguyen` FAIL (chưa hoàn nguyên) · `tu-quy-chieu-quen-khai` **có thể PASS sẵn** — nó là hành vi hiện tại, và đó chính là điều nó phải giữ nguyên sau Step 3-4.

- [ ] **Step 3: Đọc cờ trong `evalsOf`**

`evalsOf` (dòng 169) là bộ đọc theo dòng, giữ item hiện hành khi gặp `- id:`. Thêm nhánh, cạnh nhánh đọc `paths`:

```javascript
        // Declared, never inferred. Recognising a self-referential eval by sniffing the
        // guard's own name out of its `cmd` is disease E of this dossier's opportunity
        // file -- matching a string shape instead of a declared subject -- and its
        // direction of forgetting is backwards: a renamed script would silently EXEMPT
        // itself. Forgetting this key leaves the eval in the must-rerun set, i.e. red.
        if (cur && /^\s+self_referential:\s*true\s*$/.test(line)) cur.selfRef = true;
```

- [ ] **Step 4: Cờ `--min-selfref`, loại trừ, đếm, in**

Trong vòng đọc đối số của `modeCheck`, thêm `--min-selfref` **theo đúng hình dạng** của `--min-computable` (nhận `--min-selfref N` và `--min-selfref=N`; token lạ vẫn `die`), khai `let minSelfRef = null;` cạnh `minComputable`.

Khai tập, trước vòng `for (const slug of slugs)`:

```javascript
    const selfRef = new Set();
```

Trong vòng, sau `const evals = evalsOf(slug);`:

```javascript
        for (const e of evals) if (e.selfRef) selfRef.add(`${slug}/${e.id}`);
```

Loại trừ, khi tính `missing`:

```javascript
            // The exemption is TOTAL and deliberately not narrowable to "only when the
            // touch came from _acceptance/**": a change to the guard's own code rebuilds
            // the same circle. The trade, stated plainly: this guard never forces a
            // re-run of its own measurement after a pin. Two named compensations -- the
            // eval still runs in EVERY verify round of its owning dossier, and a change
            // to the guard code staleness-invalidates that dossier's evidence, which
            // forces a fresh verify round. The bucket below keeps the exempt set
            // countable, so those compensations are checkable rather than promised.
            const missing = hit.filter(
                (id) =>
                    !selfRef.has(`${slug}/${id}`) && !reMeasuredSince(id, o.sha),
            );
```

Dòng tổng kết — hạng có tên **kèm tập đích danh**:

```javascript
    const selfRefList = [...selfRef].sort();
    console.log(
        `ho so da ky: ${slugs.length} | dong repin: ${repins} | tinh duoc: ${computable} | ong ba: ${grandfathered} | tu-quy-chieu: ${selfRefList.length} (${selfRefList.join(",") || "rong"}) | eval bi nuot: ${swallowed.length} | chay lai nhung DO: ${redRerun.length} | chay lai khong ro ket qua: ${mootRerun.length} | khong ket luan duoc (khong khai paths): ${inconclusive.size}`,
    );
```

Sàn, cạnh `minComputable`:

```javascript
    if (minSelfRef !== null && selfRefList.length < minSelfRef)
        die(
            `tu-quy-chieu = ${selfRefList.length}, duoi san ${minSelfRef} ma nguoi goi doi — hoac mot dong khai bi go, hoac bo doc dang tra sai khoa; luot xanh nay KHONG chung minh hang mien tru con dung tap nao`,
        );
```

- [ ] **Step 5: Hoàn nguyên `paths` E5/E6 + khai cờ**

`_acceptance/repin-khong-chay-lai-eval/evals.yaml`, E5:

```yaml
    paths:
      - "scripts/ci/check-repin-eval-coverage.sh"
      - "_acceptance"
    self_referential: true
```

E6:

```yaml
    paths:
      - "scripts/ci/check-repin-eval-coverage.sh"
      - "scripts/ci/repin-eval-coverage.mjs"
      - "_acceptance"
    self_referential: true
```

Và nối vào **cuối** `expected` của cả hai (giữ nguyên phần cũ — không xoá lịch sử):

```
      HOÀN NGUYÊN 04/09 (hồ sơ `hang-rao-doc-nham-loi-thanh-khong-co-gi`, AC-10): mục
      `_acceptance` trở lại, và bế tắc tự-quy-chiếu nay được xử bằng cờ khai
      `self_referential: true` ngay trên ô đo. Phép thu hẹp 03/09 mua yên tĩnh bằng cách
      bán độ phủ thật; không hoàn nguyên thì bế tắc chỉ đang bị giấu.
```

- [ ] **Step 6: Chạy lại bốn ca + đo trên kho thật**

```bash
for c in tu-quy-chieu-khai tu-quy-chieu-quen-khai tu-quy-chieu-dem-giam paths-e5e6-hoan-nguyen; do bash scripts/ci/check-repin-eval-coverage.sh teeth --case "$c"; done
```
Expected: bốn dòng PASS.

```bash
node scripts/ci/repin-eval-coverage.mjs check --min-selfref 5
```
Expected: exit 0, dòng tổng kết có `tu-quy-chieu: 5 (…)` liệt kê đúng E4/E9/E10 của hồ sơ này + E5/E6 của `repin-khong-chay-lai-eval`. **Số < 5 → đếm lại tập khai**, đừng hạ sàn.

- [ ] **Step 7: Commit**

```bash
git add scripts/ci/repin-eval-coverage.mjs scripts/ci/check-repin-eval-coverage.sh _acceptance/repin-khong-chay-lai-eval/evals.yaml && git commit -m "feat(ci): o do tu-quy-chieu khai tuong minh va dem duoc; hoan nguyen paths E5/E6 (AC-8, AC-9, AC-10)"
```

---

### Task 5: Hằng số ghép — `TOTAL` của bộ răng

Giữ `so-khop-total` (ô đo của hồ sơ `repin-khong-chay-lai-eval`) xanh sau khi bộ răng lớn thêm 8 ca. `independent: false` — phải sau Task 1/2/4.

**Files:**
- Modify: `_acceptance/repin-khong-chay-lai-eval/evals.yaml` — mọi `21/21`, `n/21`, và phần chữ "HAI MỐT dòng"
- Modify: `_acceptance/repin-khong-chay-lai-eval/s4-args.json` nếu tệp tồn tại

- [ ] **Step 1: Đọc `TOTAL` thật (đừng tin con số viết trong kế hoạch)**

```bash
bash scripts/ci/check-repin-eval-coverage.sh teeth --case healthy | tail -1
```
Expected: `PARTIAL: 1/<TOTAL> ca …`. Ghi lấy `<TOTAL>` (dự kiến 21 + 2 + 2 + 4 = 29).

- [ ] **Step 2: Tìm và sửa mọi con số nói về bộ răng**

```bash
grep -rn 'PARTIAL: [0-9n]*/21\|OK: 21/21 ca\|HAI MỐT dòng\|21 ca' _acceptance/repin-khong-chay-lai-eval/
```
Sửa từng chỗ sang `<TOTAL>`, **kể cả phần viết bằng chữ**.

- [ ] **Step 3: Xác nhận hằng số ghép đã khớp, và cả bộ răng còn xanh**

```bash
bash scripts/ci/check-repin-eval-coverage.sh so-khop-total && bash scripts/ci/check-repin-eval-coverage.sh teeth
```
Expected: `OK: moi con so trong ho so deu khop bo rang <TOTAL> ca` rồi `OK: <TOTAL>/<TOTAL> ca — N doi chung duong + M phep pha`.

- [ ] **Step 4: Lint + hàng rào khoá trùng trên chính các tệp vừa sửa**

```bash
pnpm lint:check && bash scripts/acceptance/check-eval-key-dupes.sh
```
Expected: cả hai xanh.

- [ ] **Step 5: Commit**

```bash
git add _acceptance/repin-khong-chay-lai-eval && git commit -m "chore(acceptance): cap nhat so ca bo rang sau khi them 8 ca"
```

---

### Task 6: Làn sóng ký lại — việc CUỐI trước S4

Phục vụ **E11 (AC-11)**. `independent: false` — **phải là commit cuối cùng**. Ghim rồi commit tiếp vào vùng đã ghim là mất trọn một vòng verify.

**Files:**
- Modify: `_acceptance/<slug hoá ôi>/run-log.jsonl` + `evidence-report.md`
- Modify: `_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/contract.md`

- [ ] **Step 1: Đo làn sóng**

```bash
bash scripts/acceptance/check-resign-wave.sh hang-rao-doc-nham-loi-thanh-khong-co-gi origin/main; echo "exit=$?"
```
Expected: hoặc `exit=0` (không hồ sơ nào ôi — bỏ qua Step 2-3), hoặc danh sách hồ sơ ôi. Đo 03/09 trên nhánh trước: chạm `scripts/acceptance/` làm **4** hồ sơ hoá ôi, nên chờ đợi hợp lý là **có** danh sách.

- [ ] **Step 2: Một lượt lane máy tươi tại HEAD**

Dispatch **1 agent tươi** chạy đủ bảy khoá của `feature_loop.suite_keys` tại HEAD, trả `{run_id, sha, suites_exit}` với `sha = git rev-parse HEAD`. **Bất kỳ suite nào exit ≠ 0 → DỪNG: KHÔNG append dòng repin, KHÔNG sửa evidence** — khắc phục nguyên nhân rồi dispatch lane MỚI (`run_id` mới). Không ký mù.

- [ ] **Step 3: Ghim từng hồ sơ bằng chính chế độ `write` (không viết tay)**

```bash
node scripts/ci/repin-eval-coverage.mjs write <slug> "$(git rev-parse HEAD)" <run_id> '[0,0,0,0,0,0,0]'
```
cho từng slug ôi — `write` tự điền `prev_sha` từ `verified_commit` cũ. Rồi với từng hồ sơ: `verified_commit` → `sha`, và append section `### Re-pin lần <N>` đúng khuôn REPIN-TEMPLATE, cite `run_id` nguyên văn. **Không đụng `human_signoff` / `human_override`.**

- [ ] **Step 4: Đo lại — và đây là chỗ Task 4 bị thử thật**

```bash
bash scripts/acceptance/check-resign-wave.sh hang-rao-doc-nham-loi-thanh-khong-co-gi origin/main && node scripts/ci/repin-eval-coverage.mjs check --min-computable 1 --min-selfref 5
```
Expected: cả hai exit 0. `check` bây giờ chạy **sau** một lần ghim vừa chạm `_acceptance/**` — đúng vòng tròn mà cờ `self_referential` phải cắt. Nó đỏ ở đây nghĩa là Task 4 chưa xong, không phải là lý do để thu hẹp `paths` lần nữa.

- [ ] **Step 5: Commit**

```bash
git add _acceptance && git commit -m "chore(acceptance): re-pin <N> ho so sau khi them file duoi scripts/acceptance (AC-11)"
```

- [ ] **Step 6: Đặt contract sang `implemented` rồi vào S4 NGAY**

```bash
python3 -c "
import io
p='_acceptance/hang-rao-doc-nham-loi-thanh-khong-co-gi/contract.md'
s=io.open(p,encoding='utf-8').read().replace('status: approved','status: implemented',1)
io.open(p,'w',encoding='utf-8').write(s)
"
```

---

## Self-Review

**1. Phủ spec:** §A → Task 1 (`newlines`) + Task 2 (`check`, hai điểm); hạng "ông bà" đã in số sẵn ở lõi nên E4 chỉ khẳng định nó, không cần sửa mã. §B → Task 4. §C → Task 3. «Cái giá đã biết» → Task 5 (hằng số ghép) + Task 6 (làn sóng ký lại). «Ngoài phạm vi» → không task nào chạm.

**2. Phủ AC:** AC-1→T1 · AC-2→T1 · AC-3→T2 · AC-4→T2 (giữ hạng `ong ba` trong dòng tổng kết) · AC-5→T2 · AC-6→T3 · AC-7→T3 · AC-8→T4 · AC-9→T4 · AC-10→T4 · AC-11→T6.

**3. Ba rủi ro khai thẳng:**
- Ca `paths-e5e6-hoan-nguyen` đọc **kho thật**, không phải fixture — cố ý: nó là khẳng định về trạng thái kho, và nó sẽ đỏ trên mọi checkout chưa có Task 4.
- Ca `shallow-do-loi` xoá `.git` của fixture nên **mọi** lệnh git hỏng; needle `KHONG:ho so da ky:` là thứ chứng minh nó dừng ở **lượt dò**, không phải chết ở đâu đó sau.
- `--min-selfref 5` là lời khai về **kho này**, không phải luật phổ quát nhét vào trong chế độ — cùng lý lẽ đã viết cho `--min-computable`.
