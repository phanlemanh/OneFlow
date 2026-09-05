---
schema_version: 2
feature_slug: roadmap-drift-guard
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: be5426e3199bac5febf168f1607a9f456b5b7dcc
human_signoff: Manh 2026-08-27
---

# Evidence Report: roadmap-drift-guard

Vòng 5 chạy trên cây **đã merge `main`** (`f69d4d6`) cộng bản vá sổ cái `eb17794`.
Bằng chứng vòng 4 được ký ở `65949db`; sau đó `main` nhận PR #75 (`PRODUCT-MAP.md`)
và PR #76 (**xoá** `scripts/acceptance/check-stale-golden.sh`), mà CI checkout kết
quả **merge**, nên bằng chứng đã ký hết hạn với những file hồ sơ này không sở hữu.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E11 | AC-4 | script | PASS |

## Evidence

- eval: E8
  run_id: roadmap-drift-guard-r5-e8-20260827T102602Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_drift_green
  verified_at: 2026-08-27T10:26:02Z
  output: |
    → kiểm tra trôi giữa docs/roadmap.md, docs/adr/ và _acceptance/
       sổ cái: 22 hạng mục đã ký, 22 dòng trong sổ
    ✅ docs/roadmap.md khớp với docs/adr/ và _acceptance/ — không có trôi.
  # `expected` đòi hai số BẰNG NHAU và dòng đếm có mặt: 22 = 22, khác 0.
  # Kiểm độc lập (không qua guard): quét `_acceptance/*/contract.md` cho
  # `status: signed-off` được 22 slug; quét backtick trong khối
  # `roadmap-ledger:start/end` được 22 slug; `diff` hai tập → TRÙNG KHỚP HOÀN TOÀN,
  # không chỉ trùng số lượng. `roadmap-drift-guard` có mặt ở cả hai tập.

- eval: E1
  run_id: roadmap-drift-guard-r5-e1-20260827T102602Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_adr_uncited
  verified_at: 2026-08-27T10:26:02Z
  output: |
    → răng: case adr-uncited
      ✓ CASE adr-uncited: PASS
  # Dựng lại nhiễu bằng tay (bản sao vứt đi, không có .git) để kiểm nửa "id KÈM
  # TIÊU ĐỀ" của AC-1 chứ không tin mã thoát: thông điệp in đủ
  # `ADR-0099 không được nhắc lần nào trong docs/roadmap.md — "ADR-0011: Máy của
  # người dùng là nền thực thi mặc định; managed cloud là tier"` — tiêu đề khác rỗng.

- eval: E2
  run_id: roadmap-drift-guard-r5-e2-20260827T102602Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_bare
  verified_at: 2026-08-27T10:26:02Z
  output: |
    → răng: case superseded-bare
      ✓ CASE superseded-bare: PASS
  # Dựng lại bằng tay cả ba nửa `expected` nêu:
  #   (1) thông điệp khớp `viện dẫn ADR-0005 (đã bị ADR-0011 thay thế)`;
  #   (2) trích dẫn khối phạm lỗi khác rỗng, đo được ĐÚNG 110 ký tự (≤ 110);
  #   (3) kiểm A VẪN XANH trong nhiễu này — đếm `A/adr-coverage` trong output
  #       được 0, và guard chỉ ra ĐÚNG MỘT phát hiện, thuộc kiểm B.

- eval: E3
  run_id: roadmap-drift-guard-r5-e3-20260827T102602Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_superseded_paired
  verified_at: 2026-08-27T10:26:02Z
  output: |
    → răng: case superseded-paired
      ✓ CASE superseded-paired: PASS
  # Nửa suppression của AC-2: case đòi nửa ĐỎ giữ trước (`guard_is_red || return 1`)
  # rồi mới nêu tên ADR thay thế vào cùng khối và đòi guard XANH — nên một guard
  # nổ vô điều kiện không qua được, và một guard kêu cả khi đã sửa đúng cũng không.

- eval: E4
  run_id: roadmap-drift-guard-r5-e4-20260827T102602Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_missing
  verified_at: 2026-08-27T10:26:02Z
  output: |
    → răng: case ledger-missing
      ✓ CASE ledger-missing: PASS
  # `expected` đòi gọi ĐÚNG TÊN `local-cpu-plugins` kèm cụm
  # `chưa được phân loại trong sổ cái`; cả hai khẳng định nằm trong thân case
  # (`out_has`), chạy trên output đã bắt của guard chứ không phải output vứt đi.

- eval: E5
  run_id: roadmap-drift-guard-r5-e5-20260827T102603Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_stale
  verified_at: 2026-08-27T10:26:03Z
  output: |
    → răng: case ledger-stale
      ✓ CASE ledger-stale: PASS
  # Chiều ngược của E4: đòi tên `a-feature-that-never-shipped` kèm cụm
  # `không còn ở trạng thái ký`.

- eval: E6
  run_id: roadmap-drift-guard-r5-e6-20260827T102615Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_historical
  verified_at: 2026-08-27T10:26:15Z
  output: |
    → răng: case historical-244cb0b
      ✓ CASE historical-244cb0b: PASS
  # Vá fail-closed của vòng 4 còn nguyên tác dụng: kiểm được cả mã thoát của
  # `git show` lẫn kích thước file. Kiểm tay: `git show 244cb0b:docs/roadmap.md`
  # phân giải, dài 8.516 byte — Given dựng được thật, không phải file rỗng.
  # Chạy tay guard trên chính cây lịch sử đó cho thấy nó đỏ vì ĐÚNG cú trôi mà
  # AC-6 neo vào: ADR-0011 và ADR-0012 không được nhắc, khối Phase 2 viện dẫn
  # ADR-0005 mà không nêu ADR-0011, và chưa có khối sổ cái nào.

- eval: E7
  run_id: roadmap-drift-guard-r5-e7-20260827T102615Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_case_isolation
  verified_at: 2026-08-27T10:26:15Z
  output: |
    → răng: case case-isolation
      ✓ CASE case-isolation: PASS
  # Ba nửa của `expected`, kiểm tay từng nửa ngoài harness:
  #   (a) chín case anh em được gọi riêng, mỗi lần gọi in ĐÚNG MỘT token nhãn
  #       của chính nó (`grep -c … -eq 1`, không phải `grep -q`);
  #   (b) `--case khong-ton-tai` bị TỪ CHỐI ồn ào, thoát khác 0 và in đủ danh
  #       sách mười case hợp lệ — không lặng lẽ thoát sạch;
  #   (c) `--selftest-fail` thoát khác 0 và in token nhãn hỏng của case selftest,
  #       chứng minh bộ răng CÓ THỂ báo hỏng. `--list` không lộ cờ này, và nó
  #       nằm ngoài mảng CASES nên không làm bẩn lần chạy thật.

- eval: E9
  run_id: roadmap-drift-guard-r5-e9-20260827T102615Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_supersede_source_single
  verified_at: 2026-08-27T10:26:15Z
  output: |
    → răng: case supersede-source-single
      ✓ CASE supersede-source-single: PASS
  # Case giữ baseline xanh trước, rồi thêm MỘT dòng thay-thế mới vào bảng
  # `docs/adr/README.md` của bản sao và đòi guard nhận ra quan hệ mới mà không
  # sửa gì trong guard — chốt chặn chống nguồn-sự-thật-thứ-hai của AC-9.

- eval: E11
  run_id: roadmap-drift-guard-r5-e11-20260827T102615Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.roadmap_teeth_ledger_paired
  verified_at: 2026-08-27T10:26:15Z
  output: |
    → răng: case ledger-paired
      ✓ CASE ledger-paired: PASS
  # Nửa KHÔNG-nổ của cặp đếm hai chiều AC-4/AC-5: một slug vừa ở `status:
  # signed-off` vừa có dòng trong sổ cái phải giữ kiểm C im lặng.

## Bản vá sổ cái có trung thực không

Đây là câu hỏi riêng của vòng 5, vì chính hành vi **ký hồ sơ này** đã đặt
`_acceptance/roadmap-drift-guard/contract.md` sang `status: signed-off`, và kiểm C
đòi mọi hồ sơ đã ký phải được phân loại trong khối `roadmap-ledger`. Guard bắt được
đúng cú ký của chính nó. Kiểm bốn cách, không cách nào dựa vào lời khai của guard:

1. **Diff thuần cộng thêm.** `git diff 0819d09 eb17794 -- docs/roadmap.md` chỉ có
   **một dòng thêm** — dòng sổ cái cho `roadmap-drift-guard`. Không dòng nào bị xoá,
   marker `roadmap-ledger:start/end` không đổi (vẫn ở dòng 167 và 194).
2. **Không hồ sơ nào bị lật trạng thái.** `git diff 0819d09 HEAD -- '_acceptance/*/contract.md'`
   trả về **rỗng** — không contract nào đổi `status` để né kiểm C.
3. **Hai tập trùng khớp phần tử, không chỉ trùng số.** Quét độc lập cho 22 slug đã ký
   và 22 slug trong sổ; `diff` hai danh sách đã sắp xếp → không lệch dòng nào.
4. **Ba đường bịt miệng đều ĐỎ** (dựng trên bản sao vứt đi, loại `.git`):
   gỡ dòng vừa thêm → guard tố `roadmap-drift-guard` chưa được phân loại;
   lật `status` hồ sơ này khỏi `signed-off` mà giữ dòng sổ → guard tố sổ cái còn
   dòng cho hồ sơ không còn ở trạng thái ký; xoá marker `roadmap-ledger:start` →
   guard tố không tìm thấy khối sổ cái. Không có đường nào về xanh ngoài đường
   phân loại thật.

Kết luận: bản vá **trung thực**. Nó thêm đúng thứ kiểm C đòi, không nới guard,
không sửa marker, không hạ trạng thái hồ sơ nào.

## `check-stale-golden.sh` bị xoá — có gì phụ thuộc không

PR #76 xoá `scripts/acceptance/check-stale-golden.sh` và fixture
`scripts/acceptance/fixtures/baseline-gate-output.txt`, đồng thời gỡ khoá
`executors.script.stale_scoping_golden` khỏi `_acceptance/config.yaml`. Quét toàn kho
(trừ `.git`, `node_modules`) cho `stale-golden` / `stale_golden` / `baseline-gate-output`:

- **Không** eval nào của hồ sơ này tham chiếu tới nó — mười khoá `roadmap_*` trong
  `_acceptance/config.yaml` (dòng 298–307) chỉ trỏ vào `scripts/roadmap/`.
- **Không** khoá `executors` nào còn sót lại trỏ vào file đã xoá.
- **Không** script nào trong `scripts/` gọi nó.
- Những chỗ còn nhắc tên đều là **hồ sơ lịch sử, không phải đường thực thi**: hai
  file kế hoạch trong `docs/superpowers/plans/`, `STATUS.md` mục 0.8 (chính là chỗ
  ghi nhận việc xoá), và các `contract.md` / `decisions.jsonl` / `usage-report.md` /
  `evidence-report.md` của `stale-scope-by-paths` và `gate-scope-anchors`.

Ngoài ra `main` thêm `PRODUCT-MAP.md` vào `risk_tiers.t1_skip_globs`; điều đó không
chạm gì của hồ sơ này, và `scripts/roadmap/**` **không** nằm trong danh sách miễn
trừ (đúng như mục Notes của hợp đồng đòi).

## Lỗ đường rìa MỚI (ngoài hợp đồng — không làm rớt eval nào)

Vòng nào cũng lòi một lỗ; vòng 5 lòi hai, cả hai nằm ở phần lõi
`roadmap-drift.mjs`, cả hai tái hiện được trên bản sao vứt đi.

**N-1 — kiểm B lặng lẽ hoá no-op khi bảng `docs/adr/README.md` thôi phân giải
được quan hệ "thay thế".** Cùng họ fail-open với giới hạn đã chấp nhận ("lõi in ✅
khi `docs/adr/` không còn file ADR đánh số nào") nhưng ở **đường mã khác**: không
phải lúc liệt kê thư mục ADR, mà lúc **đọc bảng chỉ mục**. Hai phép thử, cả hai giữ
nguyên cú trôi thật (khối viện dẫn ADR-0005 đã bị gỡ tên ADR-0011):

- đổi từ ngữ trong bảng, `thay thế` → `thế chỗ` (một cú biên tập bình thường trên
  một file hợp đồng tự khai là *hand-maintained*): guard in
  `✅ … không có trôi` và thoát sạch;
- giữ nguyên từ ngữ nhưng bỏ liên kết markdown cột id, `[0005](…)` → `ADR-0005`:
  cũng in `✅` và thoát sạch.

`supersededBy` rỗng thì vòng lặp kiểm B chạy 0 lần, và một kiểm chạy 0 lần trông y
hệt một kiểm đã qua. Không case nào trong bộ răng khẳng định bản đồ quan hệ khác
rỗng — E9 chứng minh guard **đọc** bảng, không chứng minh guard **để ý khi bảng
câm**. Vá rẻ: đòi `supersededBy.size > 0` (kho này có quan hệ thật), hoặc thêm một
case răng lật đúng hai đột biến trên. **Không có AC nào phủ chiều này**, nên đây là
ghi nhận cho Cổng 2, không phải hồ sơ đỏ.

**N-2 — kiểm C chứng minh "được NHẮC", không phải "được PHÂN LOẠI".** Tập
`inLedger` gom **mọi** token backtick chữ thường trong khối sổ cái, không riêng ô
đầu của một dòng bảng. Thay dòng bảng thật bằng một chú thích HTML
`<!-- todo: xep \`roadmap-drift-guard\` sau -->` đặt trong khối: guard vẫn đếm
`22 hạng mục đã ký, 22 dòng trong sổ` và in `✅`. AC-4 dùng chữ "phân loại", còn
thứ máy đo được chỉ là sự xuất hiện của tên. Vá rẻ: neo regex vào ô đầu của dòng
bảng (`^\|\s*\`slug\``). Mức độ: thấp — đường tấn công là người tự viết chú thích
trong khối, không phải bàn tay thứ ba.

## Known limits

Bốn mục đã được chấp nhận ở các vòng trước, mang nguyên sang đây (KHÔNG phải phát
hiện mới):

1. **E6 khẳng định guard đỏ, không khẳng định đỏ VÌ SAO.** `case_historical_244cb0b`
   chỉ đòi `guard_is_red`; một hồi quy làm guard đỏ vì lý do khác vẫn giữ case xanh.
   (Vòng 5 chạy tay để nhìn: nó đang đỏ vì đúng cú trôi ADR-0005/0011 — nhưng đó là
   quan sát của người kiểm, không phải khẳng định của eval.)
2. **Lõi in ✅ khi `docs/adr/` không còn file ADR đánh số nào** — kiểm A và B lặng
   lẽ hoá no-op. (Xem N-1: cùng họ, đường mã khác.)
3. **`--case X --list` không chạy case nào** — `--list` được xử trước trong vòng
   lặp CLI, in danh sách rồi thoát sạch.
4. **Lặp `--case` im lặng giữ giá trị cuối** — `--case a --case b` chạy `b`, không
   báo gì.

Thêm hai giới hạn môi trường, không vá được bằng code trong nhánh này:

5. **`baseline: n-a` cho cả mười eval.** `git merge-base origin/main HEAD` là
   `37c174c`, và `scripts/roadmap/` **không tồn tại** ở đó — không chạy được A/B để
   biết eval có phân biệt hay không. Xác nhận lại ở vòng 5 bằng `git ls-tree`.
6. **E6 phụ thuộc `git show 244cb0b`.** Trên clone nông case ĐỎ (fail-closed, vá
   vòng 4) chứ không giả xanh — nhưng nó vẫn là phụ thuộc môi trường.

## Ngoài hợp đồng

- **Đoạn văn quanh sổ cái nay lệch số so với bảng.** Dòng dẫn nhập ghi
  "**21 hạng mục** trên `main` @ `621a30d` (19/08)" — ghim vào một commit nên đọc
  vẫn được — nhưng đoạn ngay dưới bảng ghi "13/21 hạng mục đã ký là năng lực sản
  phẩm, 8/21 là hạ tầng" trong khi bảng nay có **22** dòng. Guard không đo văn xuôi
  nên không AC nào phủ chuyện này và không eval nào rớt; ghi ra vì chính bản vá
  `eb17794` sinh ra độ lệch, và người ký có thể muốn sửa hai con số cùng lúc.
- **Không nối vào CI** (đúng mục Out of scope của hợp đồng): guard chỉ chạy theo
  yêu cầu. Nối dây là PR riêng kèm bump số site trong `scripts/ci/check-action-pins.sh`.
- **Bốn trang HTML trong `docs/assets/`** vẫn không được phủ, đúng như hợp đồng khai.

## Analyst

n-a — `scripts/roadmap/` không có mặt trên merge-base `37c174c`, nên không eval nào
chạy được trên cây diffBase. Không kết luận được eval nào phân-biệt hay không.

## Variance

none — mười eval đều tất định (`runs: 1`), không eval nào chạm nhà cung cấp LLM.
Mười lần chạy vòng 5 đồng nhất với mười lần chạy vòng 4 ở `65949db`.

## Iterations

- Round 1: PASS 11/11, nhưng người kiểm chỉ ba chỗ **bộ eval yếu hơn hợp đồng** (răng
  chỉ đo đỏ/xanh, E10 không chạy thật qua `pnpm`, AC-7 đọc được hai nghĩa) → sửa hợp
  đồng + siết răng.
- Round 2: PASS 11/11, đóng cả ba điểm vòng 1, nhưng lòi **hai lỗ fail-open thật** ở
  `check-roadmap-alias-cited.sh` (quét-rỗng vẫn xanh; tự nhận diện bằng khớp tên file).
- Round 3: PASS 11/11, đóng bốn điểm vòng 2, lại lòi **hai lỗ đường rìa mới** ở đúng
  file đó — hai alias cùng trỏ một file gây đệ quy đo được 78 tiến trình trong 60 giây.
- Round 4: **thu hẹp phạm vi** — cắt AC-10/E10 và guard alias sang hồ sơ riêng
  `roadmap-alias-guard`, vá nốt lỗ fail-open của E6. PASS 10/10 ở `65949db`; chủ hồ
  sơ ký.
- Round 5 (vòng này): **`main` dịch chuyển sau khi ký** — nhận PR #75 (`PRODUCT-MAP.md`)
  và PR #76 (xoá `scripts/acceptance/check-stale-golden.sh`), mà CI checkout kết quả
  **merge**, nên bằng chứng đã ký hết hạn với những file hồ sơ này không sở hữu. Merge
  `main` vào làm **5 trong 10 eval đỏ**, và đỏ vì một lý do có thật chứ không phải vì
  cái ghim cũ: chính hành vi ký đã đặt `contract.md` của hồ sơ này sang
  `status: signed-off`, mà kiểm C đòi mọi hồ sơ đã ký phải được phân loại trong khối
  `roadmap-ledger` — guard bắt được đúng cú ký của chính nó. `eb17794` thêm dòng sổ
  cái; vòng 5 chạy lại độc lập trên cây đã merge: **PASS 10/10**, sổ cái 22 = 22.

## Gate 2 checklist (human)

- [ ] Đọc bảng + soi 1–2 khối bằng chứng
- [ ] Đọc mục **Bản vá sổ cái có trung thực không** — đây là câu hỏi riêng của vòng 5
- [ ] Quyết định chữ ký: chữ ký vòng 4 được ký ở `65949db`, **không** phải commit này.
      Người kiểm vòng 5 CỐ Ý để trống `human_signoff`; việc chữ ký cũ có mang sang cây
      đã merge hay không là quyết định của chủ hồ sơ, không phải của máy.
- [ ] Cân hai lỗ mới N-1 / N-2 ở mục **Lỗ đường rìa MỚI** — cả hai ngoài hợp đồng,
      cả hai tái hiện được, không lỗ nào làm rớt eval. Chọn: vá trong nhánh này, mở
      hồ sơ tiếp, hay ghi vào Known limits.
- [ ] Cân hai con số văn xuôi lệch với bảng sổ cái (mục **Ngoài hợp đồng**)
- [x] Điền `human_signoff` trong frontmatter

### Re-pin lần 1 — 31/08/2026, do `cong-tu-canh-minh` vá lỗ trùng dòng của chính guard này

run_id: repin-ctcm-20260831T142000Z
sha: edd4fa9a86ae54bac66fb43f5fdfa779a0e1fb0d · suites: 8 lệnh exit 0

Gói `cong-tu-canh-minh` chạm ba file trong phạm vi đã khai của hồ sơ này:
`scripts/roadmap/roadmap-drift.mjs` (thêm luật cấm hai dòng cùng slug),
`scripts/roadmap/check-roadmap-guard-teeth.sh` (thêm ca `ledger-duplicate`),
`scripts/roadmap/check-roadmap-fresh.sh` (gỡ chú thích "chưa cắm vào CI" nay đã
sai, và cho nó từ chối tham số lạ thay vì bỏ qua lặng lẽ).

**Làn máy chạy TRONG PHIÊN, không phải bởi một agent ngữ cảnh sạch.** Owner chốt
làn máy thuần cho vòng này (31/08); nghi thức chuẩn gọi một agent tươi. Đây là
một lệch có khai, không phải một bước bị bỏ: tám lệnh là tám lệnh đã khai trong
`feature_loop.suite_keys`, chạy tại đúng sha ghi trên, mã thoát ở
`scratchpad/lane-*.log` của phiên.

### Re-pin lần 2 — 04/09/2026, do `lat-cat-chung-minh` thêm bốn guard dưới `scripts/roadmap/**` và một khối mới trong `docs/roadmap.md`

run_id: repin-lcm-20260904T103744Z
sha: c2f028ced724e6ba78f91744edee4c319029af41 · suites: 8 lệnh exit 0

Mười ô đo của hồ sơ này đều bị chạm theo chế độ `plan` (10/10 khai `paths`, 312 file đổi so với
mốc cũ), nên cả mười được **chạy lại** chứ không chỉ dời mốc — đúng luật `repin-khong-chay-lai-eval`
ký 03/09. Cả mười exit 0. Làn máy chạy bằng một phiên tươi, tuần tự tám lệnh tại `c2f028c`.

### Re-pin lần 3 — 04/09/2026, do `lat-cat-chung-minh` sửa tiếp bốn guard dưới `scripts/roadmap/**` sau vòng S4 thứ nhất

run_id: repin-lcm-20260904T151500Z
sha: b5be36486c9e8d53db889b19fe15239f72e01320 · suites: 8 lệnh exit 0

Mốc cũ `c2f028c` do chính hồ sơ này ghim ở lần 2, rồi bốn commit sau đó lại chạm
`scripts/roadmap/**` — vá lỗ fail-open của F1, thêm ca răng thứ 16, đổi mẫu số của bộ răng sang
độ dài mảng, và đổi phép đo AC-13 từ phép grep sang phép giải. Không commit nào chạm
`roadmap-drift.mjs` hay `check-roadmap-fresh.sh`, tức mã của gói này không đổi; staleness ở đây là
theo GLOB, không theo hành vi.

Cả mười ô đo được **chạy lại** chứ không chỉ dời mốc — luật `repin-khong-chay-lai-eval` ký 03/09.
Cả mười exit 0. Làn máy do một phiên tươi chạy tuần tự tám lệnh tại `b5be364`, cây sạch trước và
sau. Lần này re-pin là việc CUỐI trước vòng verify: lần 2 ghim xong rồi còn commit tiếp vào đúng
vùng vừa ghim, nên mốc ấy hỏng ngay trong ngày.

### Re-pin lần 4 — 05/09/2026, do `lat-cat-chung-minh` sửa tiếp `scripts/roadmap/**` qua bốn vòng S4

run_id: repin-lcm-20260905T064500Z
sha: 99b7c61d1c6711ade7242cd008fd2f07111649b8 · suites: 8 lệnh exit 0

Mốc lần 3 (`b5be364`) hỏng vì ba commit sau đó lại chạm `scripts/roadmap/**`: F5 buộc một hồ sơ
park phải niêm yết và mang chữ ký, ba chỗ ghim hằng số trong bộ kiểm tài liệu đổi thành quan hệ
tính trên cây, và F3 thôi đòi riêng `park` sau khi nó và F5 chặn nhau. Mã của gói này không đổi —
không commit nào chạm `roadmap-drift.mjs` hay `check-roadmap-fresh.sh`; staleness ở đây theo GLOB,
không theo hành vi.

Cả mười ô đo được **chạy lại** chứ không chỉ dời mốc — luật `repin-khong-chay-lai-eval` ký 03/09.
Cả mười exit 0, kèm tám lệnh làn máy.

Ghi thêm vì nó là bài học chứ không phải thủ tục: **làn đo đầu tiên của lần này đã bị BỎ.** Cả 18
mã thoát đều 0, nhưng phiên điều phối ghi thẻ Cổng 2 và trang bằng chứng vào cùng cây GIỮA LÚC đo,
nên những số ấy không thuộc về commit định ghim. Chính phiên tươi phát hiện, bằng cách so mtime ba
file với thời điểm chạy từng lệnh. Ba file ấy nằm ngoài mọi `paths` của hồ sơ này nên kết quả gần
như chắc không đổi — nhưng một mốc ghim là lời khai «cây tại commit này đã được đo», và khai thế
khi cây có file chưa commit là khai sai. Làn ghi ở đây là làn thứ hai, chạy trên cây sạch tại
`99b7c61`, sạch cả trước lẫn sau.

### Re-pin lần 5 — 05/09/2026, do `lat-cat-chung-minh` sửa tiếp `scripts/roadmap/**` sau khi ký Cổng 2

run_id: repin-lcm-20260905T093000Z
sha: be5426e3199bac5febf168f1607a9f456b5b7dcc · suites: 8 lệnh exit 0

Mốc lần 4 (`99b7c61`) hỏng vì việc KÝ kéo theo một dây sửa: hồ sơ thành cái thứ 37 được ký nên
tài liệu, sổ cái và bản đồ phải theo, và ba ca răng ghim con số của hôm trước đỏ thật ngay hôm ấy —
nên chúng phải đổi sang đọc giá trị từ cây. Mã của gói này vẫn không đổi; staleness theo GLOB.

Cả mười ô đo chạy lại, cả mười exit 0, kèm tám lệnh làn máy. Cây sạch trước và sau, HEAD không đổi.
Lần này phiên điều phối KHÔNG ghi gì trong lúc đo — lần 4 đã hỏng đúng vì thế.
