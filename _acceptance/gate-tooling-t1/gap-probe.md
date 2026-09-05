---
slug: gate-tooling-t1
at: 2026-08-28T03:00:00Z
verdict: findings
p0: 4
p1: 5
p2: 1
---

# Gap probe: gate-tooling-t1

Clean-context critic, artifacts only (contract + evals + evidence của hồ sơ này,
contract + ledger của hồ sơ anh em, `config.yaml`), không đọc guard, không đọc
`pre-merge-check.sh`, không đọc diff. Một lượt, chạy SAU vòng verify 1 và TRƯỚC
Cổng 2 — muộn hơn vị trí chuẩn (S1#7), ghi rõ để người sau không tưởng nó đã
chặn được thiết kế từ đầu.

Phần **Kiểm chứng của orchestrator** ở cuối là bắt buộc đọc kèm: hai finding đã
được đo lại trên cây thật, một cái nặng hơn bản critic viết và một cái sai một phần.

## Cross-checks

- **AC without eval:** none — AC-1→E1, AC-2→E2+E3, AC-3→E4, AC-4→E5, AC-5→E6,
  AC-6→E7, AC-7→E8, AC-8→E9, AC-9→E10, AC-10→E11, AC-11→E12, AC-12→E13. 12/12
  có ít nhất một eval; 12 eval máy dùng 12 executor key khác nhau.
- **GWT not measurable as written:** AC-1 (không nói cổng chạy với BASE nào),
  AC-5 (tập `--case` do chính vật bị đo tự khai, không sàn), AC-9 ("diff RỖNG"
  không nói dựng bằng cách nào; là khẳng định một-thời-điểm chứ không phải bất
  biến), AC-11 ("mang `landed_merge`" — không nói giá trị phải là gì), AC-12
  (mệnh đề Then không thể sai).
- **Coverage axis without AC:** **có ô trống.** Trục A giá trị thứ tư — "khai đủ
  nhưng union rỗng nghĩa" — không AC, không eval, và cũng không nằm trong Out of
  scope. Trục C hai giá trị `_acceptance/**` và `t1_skip_globs` do AC-8 của hồ sơ
  anh em giữ. Trục B và D đủ.
- **Eval that cannot fail:** E8 và E11 khẳng định một sự VẮNG MẶT mà không
  artifact nào buộc phải có chứng dương gieo sẵn. E10 KHÔNG thuộc ca này (tập
  staleness là `verified_commit...HEAD`, khác rỗng cho 9 feature khai).
- **Shared exit code:** **không tái diễn** — 12 eval máy, 12 key, không hai tiêu
  chí nào ké chung một lệnh. Biến thể ngược chiều: E6 là khối GỘP chạy lại các
  case của E2/E3/E4/E5/E7 cộng ~12 case nữa; toàn bộ AC-5 nằm sau đúng một exit
  code — chỗ P0-3 vào.
- **Amendment integrity:** amendment giữ nguyên nội dung khẳng định đúng như nó
  tự nói, và lý do bỏ con số cứng là đúng. Nhưng nó **nới theo một chiều không
  được thừa nhận**: tập case nay do vật bị đo tự khai, hôm nay rộng ra (17 > 14),
  ngày mai có thể tự hẹp lại mà vẫn xanh. Không ghi người duyệt, không bản ghi
  ledger, `approved_at` không phân biệt bản trước và sau sửa.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0-1 | contract (AC-1) + evals (E1, E10) | Context nêu HAI thứ chặn việc sửa guard: (i) làm cũ pin đã ký, (ii) nổ `VIOLATION [PR]` t1-escape. AC-1 chỉ đo (ii). Không tiêu chí nào nói một PR thật sự đổi `scripts/acceptance/**` thì MERGE ĐƯỢC — tức không sinh violation lớp staleness nào | `measure-harness` và `task-metering` khai union chứa `scripts/**`. Fork sau khi THU HẸP không bỏ qua feature khai-đủ ngoài diff nữa — nó cấp scope hẹp — nên guard edit rơi ĐÚNG vào union và làm chúng stale, theo đúng AC-4/E5. E1 không thấy vì chỉ đếm dòng t1-escape trên fixture; E10 không thể thấy vì chạy diff RỖNG. Người ký thấy 13/13 xanh và đọc "0.8 đã đóng", còn PR sửa guard kế tiếp vẫn phải re-pin — treadmill tụt xuống một tầng | Thêm AC + case fixture cho ca "PR chỉ đổi guard, có mang artifact" mà Then đòi TỔNG số `VIOLATION` mọi lớp = 0, chạy trên fixture có feature khai union phủ `scripts/**` | **đã đo lại, xem bên dưới — nặng hơn: 3 slug, không phải 2.** Xử lý: thu hẹp phạm vi hồ sơ (Amendment 2) + nợ chuyển sang contract kế |
| P0-2 | contract (Out of scope #1) + evals (E1) | Ranh giới nặng nhất — "KHÔNG được thêm `scripts/acceptance/**` vào `t1_skip_globs`" — chỉ sống trong văn xuôi; critic không thấy AC nào đọc `t1_skip_globs` thật, và evidence của E1 in "non-T1 in the **fixture config**" | Implementer thêm `scripts/acceptance/**` vào `t1_skip_globs` → PR chỉ-guard hoá T1 → không cổng nào chạy → AC-1 thoả rỗng, AC-11 của hồ sơ anh em bị vô hiệu, 13/13 vẫn xanh | AC riêng chấm trên `_acceptance/config.yaml` THẬT, key executor riêng, không ké E6 | **SAI MỘT PHẦN — xem kiểm chứng.** Lõi còn lại (bảo vệ nằm trong bó E6, bị P0-3 gỡ được) vẫn open |
| P0-3 | contract (Amendment) + evals (E6) | Amendment đổi AC-5 sang "MỌI `--case` mà chính guard khai trong `KNOWN_CASES`" và không đặt SÀN. Phép đo lấy phạm vi từ chính vật bị đo. `expected` của E6 không đòi tập đó khác rỗng, không đòi khớp tập case thực sự cài, không đòi không được co lại | Gỡ `guard-not-exempt` và `no-kill-switch` khỏi `KNOWN_CASES` kèm gỡ hai key `config.yaml` → lớp anti-vacuous "N cases, config wires the same N" vẫn cân → E6 xanh với 15 case. AC-11 và AC-13 của hồ sơ anh em mất chỗ quan sát ở HEAD, và P0-2 mở khoá. Người ký thấy "all N cases pass", không có cách nào biết N vừa nhỏ đi | (a) `KNOWN_CASES` phải khớp tập case guard THỰC SỰ cài (đỏ khi lệch hai chiều); (b) tập case không được CO so với danh sách tại commit đã ký gần nhất — một dòng ghim đơn điệu, không phải con số | open — chuyển contract kế |
| P0-4 | contract (AC-11) + evals (E12) | AC-11 chỉ đòi "mang `landed_merge`"; E12 nâng lên "phân giải được". Cả hai không đòi giá trị ĐÚNG: không đòi là merge commit, không đòi reachable từ remote-tracking ref, không đòi khác nhau giữa 4 slug | Một giá trị chép nhầm thành tip nhánh feature — `rev-parse` phân giải sạch, E12 xanh 4/4. `own-range.sh` chấm feature đó trên khoảng SAI, âm thầm, mãi mãi. Tệ hơn ca "SHA ma" mà chính `expected` của E12 nêu, vì ca đó còn tụt về fallback. Ledger anh em đã có tiền lệ `d-20260729T070519Z-3336` kèm preflight reachable — bài học không được mang sang | Then của AC-11 đòi: (a) reachable từ `origin/main`, (b) có ≥2 cha, (c) chứa `verified_commit` trong cây con `^2`, (d) đôi một khác nhau | open — **dữ liệu hiện tại đã soi tay và sạch**, xem kiểm chứng |
| P1-1 | contract (Coverage trục A) | Giá trị "khai đủ nhưng union rỗng nghĩa" có CE nhưng không AC, không eval, không nằm trong Out of scope. Đúng lỗi fail-open HIGH mà Cổng 2 hồ sơ anh em hoãn sang contract riêng (`d-20260729T095807Z-19845`) | Người duyệt đọc Coverage thấy trục A đủ bốn giá trị và hiểu bốn ô đều có chỗ đứng, trong khi ô thứ tư là fail-open đang ship. Hồ sơ này THU HẸP fork nên feature khai-đủ ngoài diff chuyển sang được cấp scope hẹp — đúng nhánh ô này sống. E3 chỉ đòi có dòng `narrow staleness scope applied`, mà scope rỗng nghĩa cũng in đúng dòng đó | KHÔNG vá ở đây (lật ledger). Thêm gạch đầu dòng vào Out of scope nêu đích danh ô A4 + trỏ bản ghi ledger | **đã xử lý ở Amendment 2** |
| P1-2 | evals (E8, E11) | Hai eval khẳng định VẮNG MẶT, không `expected` nào đòi chứng dương gieo sẵn. Lớp anti-vacuous chỉ chứng minh "cây tồn tại", không chứng minh bộ dò còn dò được | Một lần đổi tên (kit vendor đặt `check-stale-golden.cjs`, hoặc pattern grep E11 rơi một nhánh) khiến cả hai không phát hiện được gì và exit 0 vĩnh viễn. Công dụng AC-7 tự khai — "guard hồi quy để ba mảnh không bò lại qua một lần vendor kit" — bốc hơi đúng lúc cần | Mỗi eval thêm nửa gieo-dương trên bản copy tạm, đúng khuôn AC-8/E9 đã dùng cho fork | open — chuyển contract kế |
| P1-3 | contract (AC-10) + evals (E11) | AC-10 đòi "không còn khẳng định nào", tức ÉP SỬA TẠI CHỖ một bản ghi ledger đã ký. Không AC nào nói cách hợp lệ là append một bản ghi thay thế, không AC nào định nghĩa văn quá khứ kèm đính chính có tính là "khẳng định" không | Hai chiều đều hỏng. Lỏng: một khẳng định MỚI thì hiện tại viết trong cùng đoạn có sẵn đính chính vẫn lọt. Chặt: ai đó siết grep, E11 đỏ trên cây KHÔNG đổi, và cách sửa rẻ nhất là xoá tiếp lịch sử — eval thưởng cho việc bào mòn ledger | Then đổi sang: bản ghi cũ GIỮ NGUYÊN, có bản ghi mới `type: correction` + `supersedes: <id>`; E11 chấm "record mới có mặt" chứ không chấm "câu cũ biến mất" | open — chuyển contract kế |
| P1-4 | contract (AC-12) + evals (E13) | Then của AC-12 thoả bằng chính hành vi trả lời — không thể đỏ. Không AC/eval nào bắt kết quả hạ cánh ở đâu: không đòi ghi ledger, không đòi thực thi, không đòi mở hồ sơ kế | Judge trả PASS kèm khuyến nghị rất cụ thể (BỎ KHAI, kèm phép đo 72/81 file vẫn rơi vào union, tiết kiệm 0 vòng). Hồ sơ đóng, khuyến nghị không có nơi hạ cánh. Sáu tuần sau union `scripts/**` vẫn nguyên — chính thứ chặn đường hợp lệ ở P0-1. Một khuyến nghị đúng bị mất vì tiêu chí sinh ra nó không đòi gì hơn một đoạn văn | Then đòi hướng đã chọn được ghi thành bản ghi `decisions.jsonl` trong chính wave này; eval chấm sự tồn tại bản ghi | **đã xử lý** — bản ghi `d-20260828T032000Z-ac12` |
| P1-5 | contract (frontmatter + Amendment) | Amendment viết sau Cổng 1 và sau verify 1 nhưng không dòng người duyệt, không bản ghi ledger, frontmatter vẫn `approved_at: 2026-08-27` không phân biệt trước/sau sửa | Người ký đọc frontmatter thấy "Manh đã duyệt 27/08" và không có tín hiệu nào cho biết AC-5 đang chấm KHÔNG PHẢI AC-5 đã duyệt ở Cổng 1. Với hồ sơ mà Notes tự cảnh báo "6 tiêu chí mô tả công việc đã code xong", đây đúng chỗ không được mơ hồ | Thêm dòng người + ngày vào tiêu đề Amendment, thêm `amended_at` vào frontmatter, một bản ghi ledger cho lần sửa | **đã xử lý** — Amendment 1 nay ghi người duyệt; `amended_at` có trong frontmatter |
| P2-1 | contract (AC-2) | AC-2 dùng "tập staleness của nó" mà không nêu hai commit. Hồ sơ anh em định nghĩa rõ và AC-4 ở đây có nói "sau `verified_commit`", nên đọc liền mạch thì không mơ hồ | Không có kịch bản fail cụ thể — hai base đã ghim ở chỗ khác, E5 là nửa should-fire chốt đúng base | Thêm `verified_commit...HEAD` vào AC-2 | open — chuyển contract kế |

Không finding nào lật quyết định đã ghi trong `_acceptance/stale-scope-by-paths/decisions.jsonl`.
P1-1 chạm gần nhất và cố ý dừng lại: nó **giữ nguyên** `d-20260729T095807Z-19845` và
chỉ đòi khai ô đó vào Out of scope cho khớp. P0-2 củng cố `d-20260728T100003Z-9046`,
P0-4 nối dài bài học của `d-20260729T070519Z-3336`, và P1-3 bảo vệ tính bất biến của
chính `d-20260805T190000Z-31447` thay vì viết lại nó.

## Kiểm chứng của orchestrator — 2026-08-28

Critic chạy mù code theo thiết kế. Ba finding được đo lại trên cây thật trước khi
trình người ký; kết quả không giống hệt bản critic viết, và chênh lệch ghi ở đây
thay vì sửa lén vào bảng trên.

**P0-1 — ĐÚNG, và NẶNG HƠN.** Dựng đúng ca critic mô tả (PR chỉ sửa
`scripts/acceptance/check-golden-dead-code-absent.sh`, có mang artifact
`_acceptance/gate-tooling-t1/run-log.jsonl`), chạy cổng với base thật:

- `VIOLATION [PR]` t1-escape: **không nổ** — AC-1 đúng như nó khẳng định
- `VIOLATION [measure-harness]: evidence is stale` — **nổ**
- `VIOLATION [task-metering]: evidence is stale` — **nổ**
- `VIOLATION [stale-scope-by-paths]: evidence is stale` — **nổ**

Critic nêu hai slug; thực tế **ba**. Nó không đọc được `evals.yaml` của
`stale-scope-by-paths` (ngoài danh sách artifact được phép) nên không biết feature
đó khai chính `scripts/acceptance/**` + `scripts/pre-merge-check.sh`. Union của
`measure-harness` và `task-metering` chứa `scripts/**` — đã xác minh trực tiếp.

**P0-2 — SAI MỘT PHẦN.** `case_guard_not_exempt` ĐỌC `$ROOT/_acceptance/config.yaml`
— config THẬT, không phải fixture — nên ranh giới "guard không được tự miễn trừ"
CÓ được máy canh ở HEAD. Critic không được đọc guard nên không thấy. Lõi lo ngại
còn nguyên: bảo vệ đó nằm trong bó E6 (một exit code cho 17 case), nên P0-3 gỡ được
nó, và evidence của E1 vẫn nên nói rõ nó chấm trên config fixture.

**P0-4 — lỗ hổng RĂNG có thật, DỮ LIỆU hiện tại SẠCH.** Soi tay bốn giá trị:

| landed_merge | merge thật (`^2`) | reachable từ `origin/main` |
|---|---|---|
| `99a75ad` `fa8ffea` `84e93e1` `f335135` | cả bốn | cả bốn, khác nhau đôi một 4/4 |

Nên E12 nay xanh vì dữ liệu đúng, không phải vì guard chặt. Bốn vế Then mà critic
đề xuất vẫn cần, và chuyển sang contract kế.
