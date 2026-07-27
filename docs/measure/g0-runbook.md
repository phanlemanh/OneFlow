# Runbook vận hành bộ đo — mở khoá Gate G0

> **Vì sao có file này.** Contract của `measure-harness` cố ý loại phần vận hành khỏi phạm vi:
> *"việc chạy phiên âm cần Modal và clip thật, thuộc về lúc vận hành bộ đo chứ không phải lúc
> xây nó"*. Bộ đo đã ký từ 26/07 và chưa chạy lần nào — khoảng trống chính là file này.
>
> Phân vai: [roadmap.md](../roadmap.md) = *G0 đòi gì*; file này = *làm thế nào để trả lời*;
> [STATUS.md](../../STATUS.md) = *đang ở đâu*.

## §0 — Chốt vạch đỗ (chặn mọi thứ còn lại)

G0 hiện phát biểu bằng chữ, không bằng số:

> *"WER ≤ ngưỡng phụ đề bán tự động · MOS TTS-vi đạt ngưỡng chấp nhận · COGS/render trong
> khung mô hình 3 tier"*

Không có số thì **kể cả khi đủ dữ liệu, G0 vẫn không phán được**. Biên bản hội đồng đã tự nêu
nghịch lý này: chặng 2 (còn ~17 tuần) đo bằng ArcFace ≥0.50 / OCR ≥95% / MOS ≥80%, còn G0 —
mốc quyết định 6 tháng đầu — *"chưa có một con số nào"*.

Ba đề xuất dưới đây **cần chữ ký của Manh trước khi đo**, vì chốt vạch sau khi thấy số liệu là
tự đánh mất tính khách quan của gate.

### 0.1 WER — đề xuất hai phần

| Thước | Đề xuất | Căn cứ |
|---|---|---|
| **WER toàn corpus** | **≤ 10%** | Hội đồng cảnh báo vùng **15–25%** là vùng chết: mọi clip cần người sửa → P0 thành bán-thủ-công → phá COGS $3–6 và margin 40–65%. Vạch phải nằm rõ dưới mép đó. |
| **Lỗi token chứa chữ số, trên các câu có giá** | **= 0** | Niềm tin nền #3: *"chữ và giá không được phép sinh ra"*. `wer.ts` đã tách riêng cột `digit` đúng cho mục đích này. Một con số sai là chết chiến dịch — không có ngưỡng "chấp nhận được". |

Ý nghĩa của phần thứ hai: **WER tổng có thể đạt mà G0 vẫn trượt** nếu sai số ở chỗ có giá tiền.
Đó là hành vi mong muốn, không phải khắt khe thừa.

*Nếu trượt:* roadmap đã ghi sẵn lối rẽ — *"wedge chuyển sang phụ đề có bước sửa tay (đổi thiết
kế skill, không đổi lộ trình)"*.

### 0.2 MOS TTS-vi — đề xuất

| Thước | Đề xuất |
|---|---|
| Điểm trung bình hệ thắng | **≥ 4.0 / 5** |
| Cỡ mẫu | **≥ 5 rater × 5 script**, báo cáo kèm khoảng tin cậy 95% |
| Điều kiện phụ | Hệ thắng phải đọc **đúng 100%** số/giá đã qua `normalize-text-vi` — cùng lý do §0.1 |

Ghi chú của harness: với n = 5 script, CI 95% dùng xấp xỉ chuẩn là **ước lượng thô** — luôn đọc
kèm n, đừng đọc trần điểm trung bình.

### 0.3 COGS — đã có số, chỉ cần trích ra

Khác hai cái trên, "khung 3 tier" **đã được định lượng** trong biên bản hội đồng:

| Tier | Giá | COGS mục tiêu | Margin |
|---|---|---|---|
| Seller (mặc định, managed) | 299–499k VND/tháng | **$5–11/seller/tháng** | 40–65% |
| Growth | 990k–1.5tr | meter theo "lượt sinh mới" | — |
| Pro/Agency | 1.5–3tr | BYO key | — |

→ **Vạch đỗ G0: COGS đo được ≤ $11/seller/tháng** ở khối lượng wedge P0, và ma trận 20 video
nằm trong khung đó.

---

## §1 — Đường WER

**Cần từ người:** clip livestream tiếng Việt thật + **bản chép tay của người**.

Hội đồng mô tả đúng môi trường phải đo, đừng đo dễ hơn: *"nhạc nền, chồng tiếng, tiếng địa
phương, tên sản phẩm lai tiếng Anh, dãy số giá đọc nhanh"*. Đo trên audio phòng thu là tự lừa.

**Đề xuất cỡ mẫu tối thiểu:** 10 clip × 60–90 giây, mỗi clip có ít nhất một lần đọc giá.

### Các bước

1. **Gom clip** → `measure/wer/` (thư mục ngoài repo hoặc gitignored — đây là dữ liệu thật).
2. **Chép tay** mỗi clip thành `<tên>.ref.txt`. Đây là lao động người, không tự động hoá được —
   nó *là* chuẩn để chấm máy.
3. **Sinh hypothesis** `<tên>.hyp.txt` bằng Whisper qua plugin `tongflow-modal-whisper`
   (cần Modal). Đối chứng thêm `tongflow-modal-qwen3asr` nếu muốn so hai ASR.
4. **Chấm:**

```bash
pnpm tsx scripts/measure/wer.ts measure/wer
```

Script **từ chối báo trung bình** khi thiếu `.hyp.txt` của bất kỳ clip nào (exit ≠ 0) — cố ý,
để một corpus dở dang không đội lốt kết quả đạt.

Xuất JSON để lưu vào báo cáo: thêm `--json`.

---

## §2 — Đường MOS

**Cần từ người:** API key nhà cung cấp TTS + **người nghe chấm mù**.

Lưu ý sắp xếp: OneFlow **chưa có** đường TTS tiếng Việt trong app (Qwen3-TTS không hỗ trợ; plugin
ElevenLabs là hạng mục **P1 #4**, tức sau G0). Nên mẫu MOS sinh **trực tiếp qua API nhà cung cấp**,
không qua OneFlow — đúng như contract đã ghi.

### Các bước

1. **Chọn ≥2 hệ** để so (ví dụ ElevenLabs vs một hệ khác) và **5 kịch bản** có số/giá tiếng Việt.
2. **Sinh mẫu** → `measure/mos-samples/<system>/<scriptId>.<ext>`
3. **Làm mù** — sinh gói cho người chấm, khoá đáp án ghi ra file **tách rời**:

```bash
pnpm tsx scripts/measure/mos.ts blind measure/mos-samples measure/mos-sheet
```

Giao **`measure/mos-sheet/`** cho người chấm. Khoá nằm ở `measure/mos-sheet-key.json` —
tách vật lý có chủ đích, đưa thư mục đi không thể lộ đáp án.

4. **Tổng hợp** sau khi thu phiếu:

```bash
pnpm tsx scripts/measure/mos.ts aggregate measure/ratings.csv measure/mos-sheet-key.json
```

Điểm ngoài thang 1–5 hoặc trỏ id lạ sẽ **báo lỗi to**, không bị lặng lẽ bỏ qua.

---

## §3 — Đường COGS

**Cần từ người:** tài khoản Modal + **một hoá đơn thật**.

`cogs.ts` đọc cột `duration_ms` do hạng mục 0.2 tạo, gộp theo `plugin_id × feature`. Nó **không
bịa giá**: không có `--rates` thì không báo con số tiền nào — cùng lý do cột `cost_usd` để NULL.

### Các bước

1. **Chạy thật** ma trận 20 video qua pipeline P0 (cần plugin đã cài + Modal). Mỗi task ghi
   `duration_ms` vào `data/tongflow.db`.
2. **Nhận hoá đơn Modal**, suy ra bảng giá `{"<pluginId>": <usdPerSecond>}` → `measure/rates.json`.
3. **Quy chi phí:**

```bash
pnpm tsx scripts/measure/cogs.ts --rates measure/rates.json --json
```

**Trạng thái hôm nay:** DB có **0 task**. Đường này chưa bắt đầu được cho tới khi có plugin cài
và Modal chạy.

---

## §4 — Chốt ngách

Điều kiện thứ năm của G0, thuần tuý là quyết định kinh doanh: **seller e-commerce** hay
**môi giới BĐS**.

Roadmap đã giới hạn hệ quả để quyết định này rẻ: *"chỉ đổi bộ thực thể KG và nguồn input skill
P0, không đổi kiến trúc hay lộ trình"*.

| Ngách | Bộ 3 thực thể KG v0 | Nguồn input skill #1 |
|---|---|---|
| Seller e-commerce | Product / Brand / Voice | Livestream, link sản phẩm |
| Môi giới BĐS | Project / Listing / Broker | Tour quay điện thoại |

---

## §5 — Danh sách cần bạn giao

Sắp theo thứ tự chặn: mục 1 chặn tất cả, mục 2–4 chạy song song được.

| # | Thứ cần | Ai làm được | Chặn gì |
|---|---|---|---|
| 1 | **Duyệt 3 vạch đỗ ở §0** | Chỉ Manh | Toàn bộ G0 — không có vạch thì không phán được |
| 2 | 10 clip livestream VN + **bản chép tay** | Chỉ người | WER |
| 3 | Tài khoản Modal + token vào `.env` | Chỉ Manh (mình không được nhập credential) | WER (hyp), COGS |
| 4 | API key TTS + **≥5 người nghe chấm mù** | Chỉ Manh | MOS |
| 5 | Hoá đơn Modal thật | Chỉ Manh | COGS (bảng giá) |
| 6 | **Chốt ngách** | Chỉ Manh | KG v0, skill #1 |

Mọi thứ khác đã sẵn: script đã ký, đã test, và các lệnh ở trên chạy được ngay khi có đầu vào.
