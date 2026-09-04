# Review Findings: lat-cat-chung-minh (round 3)

## Trong hợp đồng

- **Hình dạng 3 — assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ (case parked-opportunity)**
  file: `scripts/ci/check-product-map-teeth.sh:175`
  severity: high
  source: measurement
  AC: AC-11

  Case `case_parked_opportunity` (dòng 168–176) hứa đo một QUAN HỆ: hồ sơ `decision: park` phải rơi vào ô "Xếp lại sau", KHÔNG phải ô "Đang cân nhắc cơ hội" (đúng câu ghi trong chính comment dòng 164–167). Nhưng phép khẳng định là hai lệnh `out_has` ĐỘC LẬP quét toàn bộ stdout: `out_has 'teeth-probe-parked'` (dòng 174) và `out_has 'Xếp lại sau'` (dòng 175). Hai chuỗi ấy không bị buộc phải nằm trên CÙNG một dòng FAIL, nên cặp slug↔ô không hề được đo.

  Đã chứng minh bằng thực nghiệm (bản sao trong scratchpad, không chạm cây thật): gỡ đúng nhánh phân loại park trong `scripts/ci/check-product-map.mjs` (`} else if (decision === "park") { out.parked.push(slug); }`, dòng 175–177) — tức tái tạo chính xác cái hồi quy case này khai là nó bắt — thì case VẪN `CASE parked-opportunity: PASS`, rc=0. Lý do: sau hồi quy, `teeth-probe-parked` xuất hiện ở dòng `FAIL cân nhắc cơ hội: ... (Đang cân nhắc cơ hội)`, còn chuỗi `Xếp lại sau` vẫn xuất hiện ở các dòng FAIL của ba hồ sơ park thật (`bản đồ còn mục ... ở "Xếp lại sau"`). Cả hai `out_has` xanh, `check_is_red` xanh.

  Đối chiếu trong cùng file: `case_count_mismatch` (dòng 143–150) đã dùng đúng khuôn chặt hơn — python đọc MỘT dòng chứa cả hai giá trị rồi kiểm quan hệ. Case mới không theo khuôn ấy.

- **Hình dạng 5 — AC-5 tuyên một LỚP hai phần tử, teeth chỉ có điểm-case (nửa "thiếu ngày/ai quyết" của F4 không có phép đo)**
  file: `scripts/roadmap/check-plan-freeze-teeth.sh:297`
  severity: high
  source: measurement
  AC: AC-5

  AC-5 trong `_acceptance/lat-cat-chung-minh/contract.md` khai một lớp HAI phần tử: «một dòng Ngoại lệ với lý do ngoài {mất-dữ-liệu, bảo-mật, chặn-★} HOẶC thiếu ngày/ai quyết → thoát 1 với mã F4». Guard cài đúng hai nhánh (`check-plan-freeze.mjs` dòng 234–235 slug sai dạng, dòng 241–242 `thiếu ngày hoặc ai quyết`).

  Teeth chỉ có MỘT ca đỏ cho F4: `case_ngoai_le_tran` (dòng 297–303), và fixture của nó là `| tien-tay | tiện | 2026-09-05 | Manh |` — ngày hợp lệ, người quyết hợp lệ, chỉ sai lý do. `add_exception_row` chỉ được gọi ở ca này và ở `case_ngoai_le_hop_le` (dòng 316, hàng hoàn toàn hợp lệ). Không ca nào dựng hàng ngoại lệ thiếu ngày, ngày sai dạng, thiếu cột «ai quyết», hay slug sai dạng.

  Đã chứng minh bằng thực nghiệm (bản sao scratchpad): xoá HẲN hai dòng 241–242 của `check-plan-freeze.mjs` rồi chạy lần lượt 17/18 case (trừ `case-isolation`, vốn chỉ gọi lại chính các case ấy) — TẤT CẢ vẫn PASS. Nửa lớp này của AC-5 hiện được chứng nhận bởi một phép đo chưa từng chạy qua nó.

  Đáng lưu ý: chính hồ sơ này đã đặt ra luật ngược lại cho AC-8 («Bốn phần tử của lớp cần bốn hình dạng đo, mỗi hình dạng khẳng định thông điệp riêng») và `case_khoi_hong` (dòng 141–179) làm đúng như thế; AC-5 không được áp cùng thước.

- **Hình dạng 4 — câu đỏ đã ghim cũng khớp dòng XANH, assertion tụt về `is_red` trần (case mat-dinh-vi)**
  file: `scripts/roadmap/check-plan-docs-teeth.sh:147`
  severity: medium
  source: measurement
  AC: AC-15

  `case_mat_dinh_vi` (dòng 137–148) xoá tiêu đề `## Định vị — bổ sung 04/09` khỏi bản sao vision.md rồi khẳng định `is_red` + `out_has 'vision.md có đoạn định vị ba tầng'` (dòng 147).

  Chuỗi được ghim ấy KHÔNG phải câu đỏ: hàm `need()` trong `scripts/roadmap/check-plan-docs.sh` (dòng 24–31) in nhãn ở CẢ HAI chiều — `OK: $3` và `FAIL: $3 — …`. Chạy `bash scripts/roadmap/check-plan-docs.sh` trên cây lành (xanh, rc=0) in đúng dòng 7: `OK: vision.md có đoạn định vị ba tầng`. Nên `out_has` ở đây thoả mãn kể cả khi guard đỏ VÌ MỘT PHÉP KIỂM KHÁC; phép đo thực tế còn lại chỉ là «script thoát khác 0», không ghim được nguyên nhân.

  Đây đúng là hình dạng mà AC-9 khoản (c) của chính hồ sơ này đặt tên và cấm («câu đỏ đã ghim phải VẮNG trên cây lành — ghim `STATUS.md đề ngày` là vô nghĩa vì guard in `OK: STATUS.md đề ngày 04/09` lúc PASS»), và `scripts/ci/check-gate-guards-job.sh` (dòng ~275–283) đã dựng hẳn một phép canh RED_TOKEN để chặn nó — nhưng phép canh ấy chỉ soi các needle trong ci.yml, không soi các case bên trong file teeth này. Các ca anh em cùng file thì ghim đúng chiều: `case_lui_ngay` ghim tiền tố `FAIL: …`, `case_nhay_nguoc` ghim `đoạn tỉ lệ có nháy ngược` (dòng xanh là `… KHÔNG có nháy ngược`, không khớp).

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **F3 và F5 mâu thuẫn: hồ sơ `decision: kill` (hoặc `stage: archived`) không có trạng thái hợp lệ nào**
  Người dùng thấy gì: Khi ai đó đóng một cơ hội bằng cách 'loại bỏ' (kill) hoặc đánh dấu là lưu trữ, hệ thống kiểm tra kế hoạch sẽ báo lỗi bất kể họ khai theo cách nào — hiện chưa có cách hợp lệ để ghi nhận việc loại bỏ một cơ hội.
  file: `scripts/roadmap/check-plan-freeze.mjs:275`
  severity: high
  Đề xuất: new-contract

- **check-product-map.mjs: bucket `draft` ("Chờ duyệt phạm vi") được phân loại nhưng KHÔNG có checkBucket — fail-open trong một checker bán là fail-closed**
  Người dùng thấy gì: Bản đồ sản phẩm có thể hiển thị sai số hồ sơ đang 'Chờ duyệt phạm vi' mà không ai được cảnh báo, vì công cụ kiểm tra tự báo 'khớp, không trôi' ngay cả khi bản đồ thật sự đã lệch.
  file: `scripts/ci/check-product-map.mjs:209`
  severity: high
  Đề xuất: known-limits

- **check-product-map.mjs chỉ ánh xạ `decision: park`; cơ hội `kill` rơi vào "Đang cân nhắc cơ hội" và làm checker đỏ SAI**
  Người dùng thấy gì: Ngay khi có người từ chối (kill) một cơ hội, công cụ kiểm tra sẽ báo lỗi sai và đòi hồ sơ đó phải xuất hiện ở mục 'đang cân nhắc' thay vì mục 'đã bác', khiến việc từ chối một cơ hội trở nên không thể làm sạch được.
  file: `scripts/ci/check-product-map.mjs:175`
  severity: medium
  Đề xuất: new-contract

- **Comment trong fixture của check-plan-freeze-teeth.sh đã lỗi thời so với chính commit cuối của branch**
  Người dùng thấy gì: Một dòng ghi chú trong file kiểm thử nói sai về tình trạng hiện tại của hệ thống, có thể khiến người đọc sau này hiểu nhầm — nhưng không ảnh hưởng đến chức năng thật của sản phẩm.
  file: `scripts/roadmap/check-plan-freeze-teeth.sh:55`
  severity: low
  Đề xuất: wont-fix

- **F3 and F5 make `decision: kill` / `stage: archived` an unsatisfiable state — the guard is red either way**
  Người dùng thấy gì: Khi ai đó đóng một cơ hội bằng cách loại bỏ (kill) hoặc đánh dấu lưu trữ, hệ thống kiểm tra kế hoạch sẽ báo lỗi bất kể sửa theo hướng nào — hiện chưa có cách hợp lệ để ghi nhận việc này.
  file: `scripts/roadmap/check-plan-freeze.mjs:309`
  severity: high
  Đề xuất: new-contract

- **A draft dossier drifts from PRODUCT-MAP.md while the checker prints "khớp, không trôi"**
  Người dùng thấy gì: Bản đồ sản phẩm có thể hiển thị sai số hồ sơ đang 'Chờ duyệt phạm vi' mà không ai được cảnh báo, vì công cụ kiểm tra tự báo mọi thứ khớp ngay cả khi thực tế đã lệch.
  file: `scripts/ci/check-product-map.mjs:209`
  severity: medium
  Đề xuất: known-limits

- **A killed opportunity is filed as "Đang cân nhắc cơ hội" — the map's "Đã bác từ khám phá" bucket is never modelled**
  Người dùng thấy gì: Ngay khi có người từ chối (kill) một cơ hội, công cụ kiểm tra sẽ báo lỗi sai, đòi hồ sơ đó phải nằm ở mục 'đang cân nhắc' thay vì mục 'đã bác' — không có cách nào ghi nhận việc từ chối mà không bị báo lỗi.
  file: `scripts/ci/check-product-map.mjs:175`
  severity: medium
  Đề xuất: new-contract

- **opportunityDecision() does not strip YAML quotes — `decision: "park"` is silently misfiled**
  Người dùng thấy gì: Nếu ai đó viết giá trị 'park' có kèm dấu ngoặc kép trong hồ sơ, công cụ kiểm tra sẽ không nhận ra và báo nhầm là thiếu hồ sơ trên bản đồ.
  file: `scripts/ci/check-product-map.mjs:134`
  severity: low
  Đề xuất: known-limits

- **check-plan-docs.sh discards the ledger guard's entire output, reporting only "guard sổ cái đỏ"**
  Người dùng thấy gì: Khi sổ cái kế hoạch có lỗi, thông báo tổng hợp chỉ hiện một dòng chung chung 'guard sổ cái đỏ' mà không nói rõ chỗ nào sai, khiến người xử lý phải tự dò lại từ đầu.
  file: `scripts/roadmap/check-plan-docs.sh:143`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).