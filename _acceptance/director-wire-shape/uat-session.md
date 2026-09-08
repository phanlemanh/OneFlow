---
schema_version: 1
slug: director-wire-shape
feature: Nền trạng thái Director — wire trả plan, director_events, body versioned (gói D0 của ADR-0013)
owner: Manh
stage: held
verdict: release
decided_by: Phan Le Manh
decided_at: 2026-09-08T08:13:32Z
---

# Phiên nghiệm thu — director-wire-shape (Cổng Giá trị)

**Cờ vàng khi mở phiên:** không có `stranger-drive.md` trong hồ sơ — vòng này chưa
chạy Lái-thử Người-lạ. Theo luật của skill, điều kiện «sản phẩm thật đã chạy để người
dự bấm được» lẽ ra vào phiên bằng **lời khai**. Phiên này thay lời khai bằng một ván
lái thật: máy tự dựng dev server và tự bấm 5 lượt trên sản phẩm thật (bảng số đo bên
dưới). Đó **không phải** Lái-thử Người-lạ — máy biết trước câu trả lời mong muốn, nên
nó chứng minh *đường dây chạy*, không chứng minh *người lạ hiểu được*. Ghi ở đây để
người ký biết mình đang tin vào cái gì.

**Giết ở cổng này là THÀNH CÔNG của quy trình** — câu trả lời mua bằng giá một vòng
dựng, không phải thất bại của người làm.

## Ngưỡng đã khai tại Cổng Đáng (CHÉP NGUYÊN VĂN — cấm sửa sau khi thấy số)

*(ĐÃ KÝ 2026-08-26 bởi phanlemanh@gmail.com; căn cứ là số đo EVAL-0/EVAL-3 ở mục trên.)*

- **Câu hỏi phép đo trả lời:** sau gói này, mỗi lượt Director có để lại đủ dấu vết để tính
  3 thước đo của `director-v2` mà KHÔNG đổi hành vi người dùng thấy?
- **SỐNG** — tất cả phải đúng:
  1. Client hiện tại chạy nguyên trạng, không sửa một dòng phía client.
  2. `pnpm test` xanh; số expect bị sửa **bằng 0** (gói này chỉ THÊM, không đổi hành vi cũ).
  3. Phép thử migrator-thật pass trên bản sao db người dùng cũ (tiền lệ `metering-schema.test.ts`).
  4. Chạy lại golden set 30 prompt: ghi đủ **30 row** `kind=generated`; tỉ lệ row mồ côi
     (không được vá outcome) **< 10%**.
  5. Tỉ lệ thành công **không tụt dưới 86,7%** — mốc EVAL-0 trên cùng `frozen-config.json`.
- **CHẾT** — bất kỳ điều nào:
  1. Buộc phải ĐỔI (không phải thêm) một trường response đang có → phá hợp đồng client.
  2. Migration không sống trên db cũ.
  3. Ghi event làm độ trễ p95 tăng quá **10%** so với mốc 75,1s.
- **Timebox:** 10 ngày làm việc kể từ khi ký. Quá hạn mà chưa qua được SỐNG → dừng, trình lại
  Cổng 0 với phạm vi hẹp hơn (chỉ hạng mục 1 + 2, bỏ body versioned).

- **Ngưỡng UAT chốt cùng lúc ký:** người vận hành gõ 5 prompt tiếng Việt bất kỳ trong panel
  Director, mỗi lượt nhận đúng kết quả như trước khi đổi (không có gì mới hiện ra trên UI),
  và sau đó `SELECT count(*) FROM director_events` trả về ≥ 5. Nghĩa là: **người dùng không
  thấy gì thay đổi, nhưng máy đã bắt đầu nhớ.**

## Người dự

| Tên | Vai | Đại diện cho ai |
|---|---|---|
| | | |

## Chấm kín (thu TRƯỚC mọi thảo luận chung)

| Người | Điểm/nhận xét kín | Sẽ gửi cho khách nào, khi nào |
|---|---|---|
| | | |

## Thảo luận sau khi đã chấm

## Số đo thật đặt cạnh ngưỡng

*(Máy đo 08/09 trên `main` @ 500dc98, dev server cổng 50804, db thật `data/tongflow.db`.
Chấm kín và verdict vẫn là việc của người — máy chỉ dọn bàn.)*

| Thước | Ngưỡng đã khai | Số đo được | SỐNG/CHẾT |
|---|---|---|---|
| SỐNG-1 client nguyên trạng | không sửa một dòng phía client | `dws-old-client-unaffected.sh` exit 0 — «name/description/nodes/edges unchanged; new fields are additive». Nhưng vòng 4 CÓ sửa `director-prompt.tsx` (4 chỗ) theo lệnh nâng phạm vi của owner tại Cổng 2 — sửa để vá đường ghi kết cục, không phải để chạy được wire mới | CẦN NGƯỜI ĐỌC |
| SỐNG-2 `pnpm test` xanh | xanh; số expect bị sửa = 0 | 86 file pass · 970 test pass · 5 skip · exit 0. `dws-expect-count.sh`: 240 expect() trong test cũ, **không đổi** | SỐNG |
| SỐNG-3 migrator trên db cũ | pass trên bản sao db người dùng cũ | Đo trên db THẬT, không phải fixture: `data/tongflow.db` (4 bảng, chạm lần cuối 02/09) tự chạy migration lúc khởi động → `director_events` + 2 index sinh ra, **52 task cũ còn nguyên** | SỐNG |
| SỐNG-4 golden 30 prompt | 30 row `kind=generated`; mồ côi < 10% | Bộ golden 30: **CHƯA ĐO** — `frozen-config.json` đã lỗi thời, không tái lập (E14a, nợ có tên). Vế mồ côi đo được trên 5 lượt thật: **0/5 = 0%** | MỘT NỬA CHƯA ĐO |
| SỐNG-5 tỉ lệ thành công | không tụt dưới 86,7% | CHƯA ĐO — cùng đường đo với bộ golden. Quan sát rời: 5/5 lượt sinh được kế hoạch chạy được | CHƯA ĐO |
| CHẾT-1 đổi trường response cũ | đổi = chết | Không đổi trường nào; payload thêm `planJson`, `runId`, `dslVersion` theo lối cộng thêm | KHÔNG CHẾT |
| CHẾT-2 migration không sống trên db cũ | không sống = chết | Xem SỐNG-3 — sống | KHÔNG CHẾT |
| CHẾT-3 p95 tăng quá 10% so với 75,1s | tăng quá = chết | CHƯA ĐO — cần bộ golden. Quan sát rời: 5 lượt mất ~20–45s mỗi lượt, không có lượt nào chạm 75s | CHƯA ĐO |
| **Ngưỡng Cổng 0** | 5 prompt tiếng Việt, UI không có gì mới, `count(*) director_events` ≥ 5 | **5 prompt, 5 row, 0 mồ côi.** UI: không một phần tử mới nào hiện ra — panel và hộp thoại «Replace current canvas?» y hệt trước | **SỐNG** |

### Chi tiết 5 lượt (bảng `director_events` sau phiên)

| id | run_id | kind | attempts | plan_json | prompt |
|---|---|---|---|---|---|
| 1 | 931b5910 | discarded | 1 | 668 B | tạo một ảnh phong cảnh núi rồi biến nó thành video ngắn |
| 2 | 173b8e9d | replaced | 1 | 456 B | viết một đoạn lời thoại ngắn rồi đọc thành giọng nói |
| 3 | f92089d1 | discarded | 2 | 536 B | tách một video thành các cảnh rồi ghép lại theo thứ tự ngược |
| 4 | 1455cb1b | replaced | 1 | 748 B | lấy một ảnh chân dung rồi dựng thành mô hình ba chiều |
| 5 | 0ccdc319 | discarded | 2 | 910 B | ghép nhạc nền vào một đoạn video rồi xuất bản cuối |

**Ba nhánh giao diện đều chứng minh sống, đúng chỗ E14b hoãn lại:**

- *Đang treo thì không ghi* — mỗi lượt, lúc hộp thoại mở, row vẫn là `generated`. Lượt vá
  duy nhất chưa bị tiêu.
- *Bấm Replace → đúng một `replaced`* — nút xác nhận của Radix cũng là nút đóng, nên trước
  vòng 4 nó bắn hai kết cục cho một cú bấm. Nay một.
- *Bấm Cancel và bấm Escape → đúng một `discarded`* mỗi lượt.
- Đối chứng ở tầng mạng: **4 POST `/api/director` xong ↔ 4 POST `/api/director/feedback`**,
  không thừa không thiếu; lượt thứ 5 khớp nốt sau khi đóng.
- Nhánh thứ tư (canvas rỗng → `accepted`) không dựng được trong phiên này vì canvas luôn có
  node; nó chỉ có bằng chứng ở tầng test đơn vị (E16 ca 5).

## Quyết định Cổng Giá trị

- **verdict = release** (Phan Le Manh, 2026-09-08). Căn cứ, theo thứ tự sức nặng:
  1. **Ngưỡng Cổng 0 đạt trọn.** 5 prompt tiếng Việt → 5 row, 0 mồ côi, và không một phần
     tử giao diện mới nào hiện ra. Đúng câu đã khai lúc ký: *người dùng không thấy gì thay
     đổi, nhưng máy đã bắt đầu nhớ.*
  2. **Cả hai ngưỡng CHẾT đo được đều không chạm.** Không trường response nào bị đổi;
     migration sống trên db người dùng thật với 52 task còn nguyên.
  3. **Chỗ E14b hoãn lại nay có bằng chứng sống.** Ba nhánh giao diện ghi đúng một kết cục,
     đối chứng ở tầng mạng khớp một-một.
- **Nợ có tên mà chữ ký này chấp nhận:** bộ golden 30 prompt chưa tái lập được
  (`frozen-config.json` lỗi thời), nên **SỐNG-5** (tỉ lệ ≥ 86,7%) và **CHẾT-3** (p95 so mốc
  75,1s) đi ra khỏi phiên **KHÔNG CÓ SỐ**. Người ký biết và vẫn giao. Ai dựng lại cấu hình
  ghim thì đo nốt hai thước ấy; tới lúc đó chúng là lỗ hổng đã khai, không phải lỗ hổng bị
  quên.
- **Cờ vàng giữ nguyên trong hồ sơ:** không có Lái-thử Người-lạ, và khối «Chấm kín» trống —
  phiên này không mời người dự. Ván lái là máy tự bấm, chứng minh đường dây chạy chứ không
  chứng minh người lạ hiểu được.
- Bước kế: nghi thức phát hành của repo. Gói D0 đã ở trên `main` (PR #111, merge `a512214`);
  không có installer hay bản phát hành nào cần cắt cho gói này, nên «giao rộng» ở đây nghĩa
  là hạng mục đóng và làn D mở tiếp sang D1/D2/D4 theo ADR-0013.
