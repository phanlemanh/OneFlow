## Trong hợp đồng

### E11's expected output quotes a stdout line check-product-map.mjs never prints
- file: `_acceptance/lat-cat-chung-minh/evals.yaml:120`
- severity: medium
- source: conventions
- AC: AC-11

E11 expects `stdout checker in \`xếp lại sau: 3 hồ sơ, 3 mục trên bản đồ, nút mermaid 3\``. The `<n> hồ sơ, <n> mục trên bản đồ, nút mermaid <n>` shape is only produced by checkBucket's failure message and by the two legacy summary lines ("đã giao", "cơ hội"). The parked bucket is only ever printed by the new summary line added at scripts/ci/check-product-map.mjs:325, whose actual green output is `   chờ phiên nghiệm thu: 1 · đang làm: 1 · xếp lại sau: 3 · chờ duyệt phạm vi: 0`. As written the eval's expected string can only be satisfied by a FAIL message, so a verifier matching it literally either fails a green run or passes on a red one.

Rationale for in-contract mapping: E11 là phép đo trực tiếp của AC-11 (bucket 'Xếp lại sau' = 3); chuỗi expected không khớp đầu ra thật làm hỏng chính phép đo của AC-11.

### Eval E11 pins an output line check-product-map.mjs never prints
- file: `_acceptance/lat-cat-chung-minh/evals.yaml:120`
- severity: medium
- source: bugs
- AC: AC-11

E11's `expected` requires stdout to contain `xếp lại sau: 3 hồ sơ, 3 mục trên bản đồ, nút mermaid 3`. The checker prints no such line — the parked count only appears in the compact summary at check-product-map.mjs:325-327:

    chờ phiên nghiệm thu: 1 · đang làm: 1 · xếp lại sau: 3 · chờ duyệt phạm vi: 0

The "N hồ sơ, N mục trên bản đồ, nút mermaid N" wording exists only for the `đã giao` and `cơ hội` lines (lines 319-324). Ran the exact `lcm_wiring`-style command (`node scripts/ci/check-product-map.mjs && bash scripts/ci/check-product-map-teeth.sh --case parked-opportunity`) and confirmed the string is absent while exit is 0. A verifier matching the quoted evidence will fail E11 for a working implementation (or, worse, pass it without looking).

Rationale for in-contract mapping: Cùng phép đo E11 của AC-11 — chuỗi expected trích dẫn một dòng stdout mà checker không in ra, làm hỏng chính phép đo của AC-11.

### Assertion âm-tính-một-mình (hình dạng 4): AC-13 "chỉ dùng node: builtins" chỉ có một grep âm, và vế "chạy không cần node_modules" là một khẳng định rỗng
- file: `scripts/roadmap/check-plan-freeze-teeth.sh:323`
- severity: high
- source: measurement
- AC: AC-13

case_builtins_only (dòng 322-330) đo lời hứa "guard chỉ import builtins" bằng ĐÚNG MỘT grep âm: `grep -E '^\s*import .* from ["']' "$guard" | grep -vE 'from ["']node:'` — nếu grep không khớp gì thì case xanh. Không có đối chứng dương ở đâu trong file (không ca nào chèn một import không-builtin vào bản sao guard để chứng minh grep này biết đỏ), trong khi mọi phán quyết khác của file đều được ghép cặp hai chiều rất kỹ. Blind spot cụ thể và khớp với cách Biome format repo này: import xuống dòng (`import {\n  a,\n} from "yaml";`) không có dòng nào bắt đầu bằng `import ... from`, nên grep thứ nhất trượt hoàn toàn → xanh; tương tự `import "polyfill";` (side-effect), `await import(...)`, `require(...)`.

Vế còn lại của AC-13 ("chạy guard trong thư mục không có node_modules") được đo ở case_clean dòng 114 bằng `[ ! -e "$tmp/t/node_modules" ]` — khẳng định này không thể phát hiện import không-builtin: guard_capture chạy `(cd "$tmp/t" && node "$guard")` với $guard = đường dẫn THẬT trong repo, và Node phân giải specifier trần từ thư mục của chính module, không từ cwd. Đã đo trực tiếp trên máy này: một .mjs đặt tại scripts/roadmap/ import `clsx`, chạy với cwd là mktemp trống, vẫn resolve thành công (rc=0). Nên assert "cwd không có node_modules" là true cho mọi guard, kể cả guard phụ thuộc node_modules. Tổng lại: AC-13 không có phép đo nào có thể đỏ khi bị vi phạm.

Rationale for in-contract mapping: AC-13 tự đặt phương pháp đo là 'grep import' và 'chạy trong thư mục không node_modules'; finding chứng minh ngay chính phương pháp đó có điểm mù hiện tại nên không xác nhận được điều AC-13 hứa.

### Assert chuỗi có mặt trong khi chuỗi đó KHÔNG có trong đầu ra (hình dạng 3): expected của E11 trích một dòng stdout mà check-product-map.mjs không hề in
- file: `_acceptance/lat-cat-chung-minh/evals.yaml:114`
- severity: high
- source: measurement
- AC: AC-11

E11 (AC-11) khai expected: "stdout checker in `xếp lại sau: 3 hồ sơ, 3 mục trên bản đồ, nút mermaid 3`". Chạy thật `node scripts/ci/check-product-map.mjs` trên cây HEAD in ra:

    đã giao: 35 hồ sơ ký, 35 mục trên bản đồ, nút mermaid 35
    cơ hội: 1 hồ sơ, 1 mục trên bản đồ, nút mermaid 1
    chờ phiên nghiệm thu: 1 · đang làm: 1 · xếp lại sau: 3 · chờ duyệt phạm vi: 0

Dòng mới thêm ở check-product-map.mjs (cuối file, khối console.log thứ ba) chỉ in MỘT con số cho "xếp lại sau", không in "mục trên bản đồ" lẫn "nút mermaid". Quan hệ ba giá trị mà expected mô tả có được checkBucket kiểm trong bụng nó, nhưng không lộ ra stdout, nên phép đo E11 tụt xuống chỉ còn mã thoát: người/agent xác minh không thể đối chiếu expected với evidence, và nếu đối chiếu đúng theo chữ thì E11 fail dù checker lành.

Rationale for in-contract mapping: Cùng phép đo E11 của AC-11 (hình dạng 3) — expected trích một dòng checker không in ra, làm hỏng chính phép đo của AC-11.

### Tuyên quét LỚP nhưng chỉ có một điểm-case (hình dạng 5): AC-8 liệt kê BỐN kiểu F0 fail-closed, răng chỉ có ca thiếu marker
- file: `_acceptance/lat-cat-chung-minh/evals.yaml:83`
- severity: medium
- source: measurement
- AC: AC-8

AC-8 (contract.md) phát biểu một lớp: "Given khối thiếu marker, thiếu khoá header, sai số cột, HOẶC trạng thái ngoài ⬜ ◐ ✅, When guard chạy, Then thoát 1 với mã F0" — bốn phần tử. E8 và mảng CASES của scripts/roadmap/check-plan-freeze-teeth.sh (dòng 25-41) chỉ có một ca duy nhất chạm lớp này: `khoi-hong` (case_khoi_hong, dòng 118, xoá marker `plan-freeze:end`). Không có ca nào xoá một khoá header (guard die "header thiếu khoá"), không có ca nào làm lệch số cột (die "có N cột, cần M"), không có ca nào đặt trạng thái ngoài ⬜ ◐ ✅ (die "trạng thái ... ngoài"). Ba nhánh die() đó của check-plan-freeze.mjs chưa từng được chạy bởi bất kỳ phép đo nào trong hồ sơ, tức chúng có thể viết sai (regex, thông điệp, hoặc thoát 0) mà 15/15 case vẫn xanh. Số assert (1) ≠ số phần tử của lớp (4).

Rationale for in-contract mapping: AC-8 khai bốn kiểu lỗi fail-closed (thiếu marker/thiếu khoá/sai cột/sai trạng thái) nhưng răng chỉ có một case (thiếu marker) chạm lớp này, nên phép đo của chính AC-8 chưa phủ hết AC đó.

### Số ca do chính mảng tự khai (hình dạng 5): 'răng: 15/15' và 'răng tài liệu: 5/5' in ra $pass/$pass nên không bao giờ tố được một ca bị xoá
- file: `scripts/roadmap/check-plan-freeze-teeth.sh:401`
- severity: medium
- source: measurement
- AC: AC-10

Dòng 401 in `✅ răng: $pass/$pass case` (tương tự check-plan-docs-teeth.sh dòng 153: `✅ răng tài liệu: $pass/$pass case`). Mẫu số lấy từ chính số ca vừa chạy, mà số ca lấy từ mảng CASES — nên nó không thể lệch: xoá một ca khỏi CASES thì bản in thành `14/14`, mã thoát vẫn 0, CI vẫn xanh, và ca `case-isolation` (lặp trên chính CASES, dòng 452 trở đi) cũng tự co theo. Con số 15 mà AC-10/E10 (evals.yaml dòng 105) và 5 mà E15 (dòng 160) hứa chỉ tồn tại trong văn xuôi expected, không có phép khẳng định máy nào ghim nó — cùng lớp lỗi mà repo đã phải dựng hàng rào riêng cho `vitest -t` (chốt 33 ô trong CI, PR #90) và cho manifest plugin (guard ghim số entry).

Rationale for in-contract mapping: AC-10 hứa '15/15 case xanh' như một con số có ý nghĩa; cách in $pass/$pass khiến con số này luôn đúng bằng cấu trúc chứ không do đo độc lập, nên chính phép xác nhận mà AC-10 dựa vào không thể phát hiện khi số ca thực tế đã ít hơn 15.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **check-product-map.mjs re-implements the generator's classifier but omits 3+ of its branches — it will go red on a correctly generated map**
  Người dùng thấy gì: Bản đồ sản phẩm có thể hiển thị sai trạng thái của một số hồ sơ ngay sau khi hồ sơ đó được ký duyệt hoặc đổi trạng thái, khiến bước kiểm tra tự động báo lỗi nhầm dù bản đồ không thực sự sai.
  file: `scripts/ci/check-product-map.mjs`
  severity: high
  Đề xuất: new-contract

- **Evidence pin of roadmap-drift-guard is stale — pre-merge-check.sh blocks the merge**
  Người dùng thấy gì: Bằng chứng đã ký của một hạng mục khác trong hệ thống bị coi là lỗi thời do có thay đổi liên quan phát sinh sau khi kiểm tra, có thể tạm thời chặn việc gộp nhánh cho tới khi được xác nhận lại.
  file: `_acceptance/roadmap-drift-guard/evidence-report.md`
  severity: high
  Đề xuất: known-limits

- **Three opportunities record a Cổng Đáng decision with no decider and no date, and no guard can ever notice**
  Người dùng thấy gì: Ba mục cơ hội đã được gác lại nhưng chưa ghi rõ ai và khi nào ra quyết định; việc bổ sung thông tin này đã được để dành cho một bước riêng sau, nên hiện chưa có gì tự động nhắc nếu bị bỏ sót.
  file: `_acceptance/timeline-view/opportunity.md`
  severity: low
  Đề xuất: known-limits

- **check-plan-docs.sh aborts the whole run with no FAIL line when the contract glob matches nothing**
  Người dùng thấy gì: Khi thư mục hồ sơ trống hoặc đường dẫn cấu hình không đúng, công cụ kiểm tra tài liệu lộ trình dừng đột ngột mà không báo rõ lý do, khiến người xem khó phân biệt giữa 'có sai lệch thật' và 'công cụ bị lỗi'.
  file: `scripts/roadmap/check-plan-docs.sh`
  severity: low
  Đề xuất: known-limits

- **check-plan-freeze F1 fails open on opportunity-only dossiers — a broken or unknown `stage` reads as "nothing there"**
  Người dùng thấy gì: Một thư mục làm việc mới mở ngoài kế hoạch có thể lọt qua việc kiểm tra đóng băng nếu tệp mô tả cơ hội của nó bị ghi sai định dạng hoặc dùng giá trị không chuẩn, khiến hạng mục ngoài kế hoạch không bị chặn lại như mong muốn.
  file: `scripts/roadmap/check-plan-freeze.mjs`
  severity: high
  Đề xuất: new-contract

- **check-product-map: the `draft` / "Chờ duyệt phạm vi" bucket is classified but never asserted against the map**
  Người dùng thấy gì: Khi một hồ sơ đang ở trạng thái chờ duyệt phạm vi, công cụ so khớp bản đồ sản phẩm không phát hiện được sai lệch giữa bản đồ và thực tế, dù bản đồ có thể đang hiển thị sai.
  file: `scripts/ci/check-product-map.mjs`
  severity: high
  Đề xuất: new-contract

- **check-plan-docs.sh aborts with no diagnostic when no contract is signed (pipefail on grep-with-no-match)**
  Người dùng thấy gì: Nếu chưa có hồ sơ nào được ký duyệt, công cụ kiểm tra tài liệu lộ trình dừng đột ngột và không báo lỗi rõ ràng, thay vì chỉ ra đúng chỗ cần sửa.
  file: `scripts/roadmap/check-plan-docs.sh`
  severity: medium
  Đề xuất: known-limits

- **check-product-map bins every non-park opportunity decision (e.g. `kill`) into "Đang cân nhắc cơ hội"**
  Người dùng thấy gì: Một cơ hội đã bị từ chối hoặc mới bắt đầu có thể khiến công cụ kiểm tra bản đồ sản phẩm báo lỗi sai vị trí ở mọi lần kiểm tra, dù thực chất không có gì sai.
  file: `scripts/ci/check-product-map.mjs`
  severity: medium
  Đề xuất: new-contract

- **Assert chuỗi có mặt trong khi lời hứa là quan hệ với cây (hình dạng 3): '16/36' bị ghim làm hằng chuỗi ngay trong guard vừa được viết để KHÔNG grep hằng số**
  Người dùng thấy gì: Một đoạn văn bản trong tài liệu lộ trình ghi cứng một tỉ lệ số thay vì tính lại từ số hồ sơ hiện có, nên khi số hồ sơ thay đổi, đoạn văn có thể hiển thị con số cũ mà không ai được cảnh báo.
  file: `scripts/roadmap/check-plan-docs.sh`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA (hình dạng 1): check-plan-suite-key.sh chỉ khẳng định tên khoá nằm trong danh sách, không khẳng định khoá ấy trỏ tới lệnh nào**
  Người dùng thấy gì: Một công cụ kiểm tra cấu hình nội bộ chỉ xác nhận tên mục cấu hình có được khai báo, mà không xác nhận mục đó còn trỏ tới đúng nơi cần chạy — nên đổi tên hoặc xoá nhầm phần phía sau có thể không bị phát hiện ở bước này.
  file: `scripts/roadmap/check-plan-suite-key.sh`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/16 lỗi rơi vào file không bộ đo nào phủ (_acceptance/roadmap-drift-guard/evidence-report.md, _acceptance/lat-cat-chung-minh/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
