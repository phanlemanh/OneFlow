---
schema_version: 2
feature_slug: add-media-library
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 129928a906a4b1b80ad79b8f89e556ec0414b680
human_signoff: Phan Le Manh 2026-08-29
---

# Evidence Report: add-media-library

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | ui-check | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-2 | ui-check | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-3 | ui-check | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | ui-check | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | ui-check | PASS |
| E12 | AC-7 | script | PASS |
| E13 | AC-7 | test | PASS |
| E14 | AC-8 | test | PASS |
| E15 | AC-9 | test | PASS |
| E16 | AC-9 | ui-check | PASS |
| E17 | AC-10 | test | PASS |
| E18 | AC-11 | test | PASS |
| E19 | AC-12 | test | PASS |
| E20 | AC-12 | ui-check | PASS |
| E21 | AC-13 | test | PASS |
| E22 | AC-13 | ui-check | PASS |
| E23 | AC-14 | script | PASS |
| E24 | AC-15 | script | PASS |
| E25 | AC-15 | judgment | PASS |
| E26 | AC-10 | test | PASS |
| E27 | AC-10 | script | PASS |
| E28 | AC-3 | script | PASS |
| E29 | AC-1 | ui-check | PASS |

## Evidence

(General repo-wide checks not tied to any single eval id also passed this round — `bash scripts/acceptance/preflight-verify-env.sh`, `pnpm build && pnpm typecheck`, `pnpm lint:check`, `pnpm test`, `cd sdk && pytest`, `pnpm verify:plugins`, `pnpm gen:abi` diff-check — all exit 0. They are regression guards, not per-eval evidence, so they carry no `eval:` block below.)

- eval: E1
  run_id: minted-add-media-library-E1-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_config
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E2
  run_id: E2
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-add-media-library-E3-r9
  exit_code: 0
  verifier: config:executors.script.aml_no_boot_dependency
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-add-media-library-E4-r8
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-add-media-library-E5-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-add-media-library-E6-r8
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-add-media-library-E7-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-add-media-library-E8-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E9
  run_id: E9
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-add-media-library-E10-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-add-media-library-E11-r8
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-add-media-library-E12-r9
  exit_code: 0
  verifier: config:executors.script.aml_no_domain_vocab
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-add-media-library-E13-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-add-media-library-E14-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_node
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-add-media-library-E15-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_import
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E16
  run_id: E16-ui-check-verify
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E17
  run_id: minted-add-media-library-E17-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_import
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E18
  run_id: minted-add-media-library-E18-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_ext
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E19
  run_id: minted-add-media-library-E19-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_wiring
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E20
  run_id: minted-add-media-library-E20-r8
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E21
  run_id: minted-add-media-library-E21-r9
  exit_code: 0
  verifier: config:executors.test.unit_aml_client
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E22
  run_id: minted-add-media-library-E22-r8
  exit_code: 0
  verifier: scripts/ui-capture.mjs
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E23
  run_id: minted-add-media-library-E23-r9
  exit_code: 0
  verifier: config:executors.script.aml_tier_boundary
  verified_at: 2026-08-29T12:55:00Z
  carried_from_round: 9
  note: carry-forward tu round 9 — delta khong cham paths cua eval

- eval: E24
  run_id: minted-add-media-library-E24-r10
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.aml_a11y_proto
  verified_at: 2026-08-29T13:15:00Z
  output: |
    "verdict": "PASS"
    20/20 pages scanned AND 20/20 rendered the state AND the theme they were asked for

<!-- <<<JUDGMENT-BLOCK-TEMPLATE -->
- eval: E25
  judged_by: (không hội đồng nào họp được — eval không khai `inputs` nên không lăng kính nào có căn cứ bỏ phiếu; vòng 8 trả UNCERTAIN, không phiếu. Người quyết thay ở Cổng 2.)
  verdict: PASS-WITH-LIMIT
  rationale: |
    Owner xem lại mười lăm khung SAU KHI vòng 8 sinh lại chúng (13:45–13:49 giờ máy 29/08), và sau khi được trình ba sự thật về chính bộ bằng chứng — trình TRƯỚC chữ ký, không phải sau:
    (1) 6/9 khung ui là bản mô phỏng `/proto/add-media-library?state=…`; chỉ E4, E20, E29 là sản phẩm thật. Lượt đo cuối xác nhận độc lập theo đường khác: sáu ui-check khẳng định trên HẰNG viết cứng trong file prototype, không phải câu node thật render qua `t()`.
    (2) Khung E16-step2 — băng xanh "Đã nạp xong. Clip nằm trong kho file của bạn…" kèm thẻ "Node video mới trên canvas / file_key: …" — KHÔNG tồn tại trong sản phẩm. Kiểm bốn chỗ độc lập: hợp `Outcome` không có nhánh `imported`; sau khi nạp node gọi `expands(...)` rồi `setOutcome({kind:"idle"})`; không khoá `imported` trong cả năm file ngôn ngữ; `outcomeMessageKey` trả `"idle"`, một khoá không được render ở đâu cả — nó chỉ dùng để so với `thinShelf`.
    (3) Chặng sau-khi-nạp trong sản phẩm: node trở về một ô tìm kiếm trống. Phản hồi thật duy nhất là node video hiện trên canvas, và KHÔNG khung nào trong bộ bằng chứng này chụp được điều đó — E20 chụp chính node "Nạp từ kho" ở trạng thái rỗng.
    Phán quyết: ĐẠT cho tám chặng — chưa-cấu-hình, lối thoát tại chỗ hỏng, đang-tìm, có-kết-quả, kệ-mỏng, chưa-xếp-theo-nghĩa, đang-nạp, lệch-phiên-bản: mỗi chặng đọc khác các chặng kia, và kết quả suy giảm không bao giờ trình y hệt kết quả sạch. Chặng sau-khi-nạp: KHÔNG ĐẠT, khai rõ trong `contract.md` thay vì để chữ ký phủ lên nó.
  required_evidence:
    - (một khung của chặng sau-khi-nạp chụp trên canvas THẬT — chưa có; là lý do chặng đó khai KHÔNG ĐẠT)
  human_override: Owner 2026-08-29
  carried_from_round: null
  note: |
    KHÔNG carry-forward. Chữ ký E25 vòng 5 (bộ ảnh 20/08) KHÔNG còn hiệu lực: vòng 8 đã sinh lại 14/15 khung, và bản sửa locale của vòng 7 đổi đúng câu trong khung `missing-config` — một trong các khung E25 chấm. Đây là chữ ký MỚI trên bộ ảnh MỚI.
<!-- JUDGMENT-BLOCK-TEMPLATE>>> -->

## Known limits

Hai mươi ba giới hạn có tên nằm trong `contract.md`, mục **Known limits** — đọc ở
đó, không tóm tắt ở đây, vì người ký phải gặp chúng trên cùng trang với chỗ ký.
Ba đợt: đóng băng sau vòng 8 (11 mục), lane máy thuần (12 mục), lượt đo lại E24
(3 mục nặng nhất được nêu tên đầy đủ + 14 mục gộp). Ba thứ nặng nhất còn mở khi
phát hành:

- **SSRF mù trên đường API** — `call()` không đặt `redirect`, nên tấm chắn
  `url-safety.ts` chỉ áp cho đường tải byte. Bất biến "một nơi duy nhất quyết
  định" bị gãy; mức độ có giới hạn (fetch gỡ `Authorization` khi chuyển hướng
  khác origin; `contracts_version` chặn đường đọc ngược).
- **Trạng thái `imported` đã thiết kế, quét a11y, duyệt — nhưng chưa vào sản
  phẩm.** Guard proto không thể đỏ vì nó, vì nó chỉ đo proto.
- **`.mkv` nhập được mà không phát được**, và chính phép đo lẽ ra bắt được nó
  (E18/AC-11) chỉ phủ 2/4 đuôi — phần tử bị bỏ đúng là lỗi.

## Ngoài hợp đồng

Một lỗi **mất dữ liệu** tách hẳn khỏi hồ sơ này vì đo được là **nợ sẵn của
`main`**: `loadEnvStore()` nuốt mọi lỗi rồi trả `{}` với HTTP 200, nên không bên
gọi nào phân biệt được "kho rỗng" với "kho đọc không nổi"; `PUT` thay nguyên bản
đồ. Lưu một khoá BYO có thể xoá sạch mọi khoá còn lại, không một thông báo nào.
`git diff main...HEAD` trên `env-store.server.ts` và route của nó **rỗng**, và
`abi-node-shell.tsx:110` trên `main` làm cùng thao tác PUT mà không có tấm chắn
nào — bảng cấu hình của nhánh này là bên gọi cẩn thận hơn, không phải bên gây ra.
Đã tách thành việc riêng.

## Analyst

Không đo lại baseline lượt này (`runBaseline: false` — quyết định của owner
28/08, ghi trong `STATUS.md`: agent baseline ghi đè `node_modules/.modules.yaml`
của cây chính và sinh ô đỏ giả).

## Variance

Không eval nào khai `runs > 1`.

## Iterations

Vòng 1–6 (19–20/08): xem `run-log.jsonl`. Hồ sơ đạt PENDING-JUDGMENT ở vòng 4 và
được owner ký E25 ở vòng 5 trên bộ ảnh **của lúc đó**.

**Hồ sơ mở lại 29/08.** Trong chín ngày, `main` trôi **219 commit** qua đúng vùng
`src/**` và `sdk/**` mà hợp đồng khai — 37 file của `main` rơi vào phạm vi khai
báo. Bằng chứng 20/08 vì thế mô tả một cây **không còn tồn tại**, và cổng chặn
đúng chỗ. Owner chọn tái nghiệm thu toàn phần.

**Vòng 7.** Hai lỗi nặng, cùng một nguyên nhân: nhánh 2xx của `pick()` là đường
duy nhất đọc phản hồi mà không kiểm, vì **không gì lái được node trong bộ kiểm**.
`.json()` không bọc lỗi rơi vào nhánh mạng ở ngoài, và `String(body.fileKey)` biến
khoá vắng thành chuỗi `"undefined"`. Cùng lúc, bảng chưa-cấu-hình truyền thẳng câu
tiếng Việt của máy chủ ra mặt người dùng mọi locale. Hai ô đỏ của vòng đều là
**eval đo cái máy nó chạy trên đó**, không đo mã.

**Vòng 8.** 29/29 eval PASS. Ô đỏ duy nhất, `pnpm lint:check`, có nguyên nhân
thật: dòng `+` trong diff Biome là `"exclude"` — **một dòng không ai chạm vào**,
tức file bị công cụ ghi lại chứ không phải người sửa. Next ghi đè `tsconfig.json`
mỗi khi thư mục dist đang chạy chưa nằm trong `include`. Lệnh suite chạy song song
nên lint lấy mẫu **trong** cửa sổ đó; khôi phục lúc thoát không bao giờ đóng được
cửa sổ mà tiến trình khác đang đọc. Sửa tận gốc: `include` khai sẵn mọi thư mục
dist. Đo trên cả ba, sha1 không đổi; ĐỎ tái lập bằng cách bỏ hai dòng đó ra.
Vòng 8 cũng bắt đúng phép đo locale vừa viết ở vòng 7: nó khớp **regex trên văn
bản nguồn** — đo chỉ dẫn, không đo đầu ra. Đã thay bằng phép đo dựng node thật.

**Owner đóng băng sau vòng 8.** Lý do đo được: lớp phép đo hội tụ (29/29), lớp
phản biện thì không — vòng 7 ra 2 phát hiện nặng, vòng 8 ra 4. Điều lệ ngừng-vá
kích hoạt: phát hiện nặng số một của vòng 8 (payload kiểm một tầng) **đúng lớp
lỗi** với thứ vừa sửa ở vòng 7, chỉ thấp hơn một tầng.

**Lane máy thuần (vòng 9).** Chạy lại 19 eval máy + 7 lệnh suite tại HEAD; **9
eval ui-check GÁNH sang từ vòng 8** — không mã giao diện nào đổi sau `5a181df`, đo
bằng `git diff`, và chín agent trình duyệt là nguồn nhiễu lane này sinh ra để
tránh. Verdict **PASS**, không ô nào đỏ. Lớp phản biện vẫn chạy (args của kit
không có cờ tắt) và ra thêm 13 phát hiện. Một cái được sửa vì nó **phá dữ liệu**:
`trap` của guard a11y chạy `git checkout -- tsconfig.json`, xoá mọi sửa đổi chưa
commit của người chạy — và thứ nó phòng thủ đã không còn tồn tại.

**Lượt đo lại E24 (vòng 10, lượt này).** Delta là **đúng một file**, và file đó là
dụng cụ đo của E24, nên chỉ E24 chạy lại bằng agent tươi; 27 eval còn lại gánh.
20/20 trang qua axe-core trong Chrome thật, không vi phạm critical/serious. Bảy
lệnh suite xanh. Verdict **PASS**. Thêm **17** phát hiện. Cộng ba lượt:
**12 → 13 → 17**, không giảm lần thứ ba.

**Vì sao hồ sơ đóng dù còn 23 giới hạn.** Bằng chứng để ký, theo chính bộ kit này,
là *exit code từng eval + giới hạn khai rõ + chữ ký người* — **không phải** "hội
đồng hết ý kiến". Đầu ra ba lượt phản biện không bị vứt: nó thành 23 giới hạn có
tên, hai hợp đồng con, và một lỗi mất dữ liệu tách hẳn ra ngoài vì đo được là nợ
sẵn của `main`. Chúng chỉ không được phép **quyết định**.
