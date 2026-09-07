# Kế hoạch — chống đọc sai êm ru

> Hợp đồng: [`_acceptance/chong-doc-sai-em-ru/contract.md`](../../../_acceptance/chong-doc-sai-em-ru/contract.md) (T3, `approved` 2026-08-27)
> Thiết kế: [`2026-08-27-chong-doc-sai-em-ru-design.md`](../specs/2026-08-27-chong-doc-sai-em-ru-design.md)
> Thứ tự thực thi: **B → A → C** (sổ quyết định `d-20260827T124432Z-63417`)

## ⚠ Một chốt chặn phát hiện lúc lập kế hoạch — cần owner quyết trước khi vào S3

**AC-7 (bộ chọn có mục "Tiếng Việt") có thể chưa làm được ở nhánh này.**

Đo được: danh mục ngôn ngữ ở [`language-select.tsx:13`](../../../src/components/workspace/nodes/base/language-select.tsx) **không phải danh sách giao diện tự do** — comment của chính file ghi *"Qwen3-TTS `language` parameter values"*. Slot TTS duy nhất đang có plugin là `tongflow-modal-qwen3tts`; ABI khai `language: {"type":"string"}` nên **ABI không chặn**, nhưng model có nói được tiếng Việt hay không là chuyện của plugin, và cây plugin đó không có trên máy này để kiểm.

Lộ trình đặt tiếng Việt ở **hạng mục 1.4 — "Plugin TTS ElevenLabs (tiếng Việt)"**, tức *sau* hồ sơ này.

| ngả | hệ quả |
|---|---|
| **(a) Hoãn AC-7 sang 1.4**, giữ AC-12 (AC-12 không phụ thuộc AC-7) | Hồ sơ này giao 11/12 tiêu chí; AC-7 thành hợp đồng con của 1.4 — nơi nó có nghĩa thật |
| **(b) Làm AC-7 ngay**, thêm mục gọi tới Qwen3-TTS | Nếu model không đọc được tiếng Việt thì đây là **thất bại theo chiều mở** kiểu mới: người dùng chọn được một thứ sinh ra tiếng sai — đúng lớp lỗi hợp đồng này lập ra để chặn |
| **(c) Làm AC-7 nhưng kiểm trước** | Thêm một bước S3: hỏi plugin `tongflow-modal-qwen3tts` xem có nhận `language: "Vietnamese"` không; có thì làm (b), không thì tự động thành (a) |

**Ngả kế hoạch này khuyên: (c)** — một bước kiểm rẻ đứng trước, và nó tự quyết giữa (a) và (b) bằng số thay vì bằng phán đoán. Bước T0 dưới đây là bước đó.

Nếu owner chọn (a) ngay: bỏ T0, T12, T13 và ghi entry `descope` có tên cho AC-7 + AC-12 (AC-12 vẫn làm được, chỉ mất ca âm "khi plugin có mặt trở lại").

---

## Bảng kế hoạch — người dùng thấy gì khác

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| *(chưa thấy gì — bước dò)* Máy biết chắc giọng đọc có nói được tiếng Việt không | `plugins/` (đọc), không sửa file nào | T0 — chốt ngả cho AC-7 |
| Thước đo tự nói ô nào còn trống, thay vì đợi người soi ra | `scripts/acceptance/check-measuring-instruments-refuse.sh` | AC-8 (phép đo không tự chọn chủ thể) |
| Thêm một mục từ điển viết tắt là phải thêm ca đo, không quên được | `sdk/tests/test_normalize_vi.py` | AC-5 (mọi mục có ca dương + âm) |
| Bộ ca họ nhập nhằng tự lộ ô trống | `sdk/tests/test_normalize_vi.py` | AC-11 (bảng khai-trước 20 ô) |
| Câu "Giá 5 – 10 triệu" đọc đủ chữ "đến" như bản gạch thường | `sdk/tongflow/text/normalize_vi.py` | AC-1 (gạch kiểu chữ) |
| Số điện thoại và mã đơn thôi bị đọc thành khoảng, không mất chữ số | `sdk/tongflow/text/normalize_vi.py` | AC-3 (số-gạch-số khác khoảng) |
| Ngày kiểu Mỹ bị từ chối thay vì đọc mất mất một nửa | `sdk/tongflow/text/normalize_vi.py` | AC-9 (ngày không parse được) |
| Giá "50.000 đ/kg" bị chặn thay vì đọc sót dấu gạch chéo | `sdk/tongflow/text/normalize_vi.py` | AC-10 (gạch chéo còn sót) |
| Tên thương hiệu thôi bị băm, đọc hai lần ra một kết quả | `sdk/tongflow/text/normalize_vi.py` | AC-4 (token La-tinh) |
| Câu có địa chỉ web không còn bị đọc cụt mà vẫn báo thành công | `sdk/tongflow/text/normalize_vi.py` | AC-2 (URL) |
| Bộ đọc trả mã lỗi ổn định thay vì câu tiếng Việt cứng | `sdk/tongflow/text/normalize_vi.py` | AC-6 (nửa SDK) |
| Người dùng giao diện Anh/Nhật/Hàn/Trung đọc được câu lỗi bằng tiếng của mình | `src/i18n/messages/*.json`, `src/lib/task/` | AC-6 (nửa mặt người) |
| Bộ chọn giọng đọc có mục "Tiếng Việt" | `src/components/workspace/nodes/base/language-select.tsx` | AC-7 *(phụ thuộc T0)* |
| Lưu luồng thôi hiện cảnh báo bảo thêm node không ai cài được | `src/hooks/use-export-warning-toast.ts` | AC-12 (cảnh báo khả thi) |

## Danh sách việc

### T0 — Dò: giọng đọc có nói được tiếng Việt không *(chốt ngả AC-7)*
- **Files:** không sửa; đọc `plugins/`, ABI, tài liệu plugin
- **Verify:** ghi kết quả vào sổ quyết định — có/không kèm căn cứ
- **Phục vụ:** quyết định thực thi, không phục vụ tiêu chí nào
- **independent:** false *(mọi việc nhóm C phụ thuộc kết quả)*

### Nhóm B — sức khoẻ bộ đo (làm trước, để nhóm A được đo bằng thước có răng)

### T1 — Thước đo chọn chủ thể theo cấu trúc
- **Files:** `scripts/acceptance/check-measuring-instruments-refuse.sh`
- **Verify:** `bash scripts/acceptance/check-measuring-instruments-refuse.sh` — và **lượt phá-thử**: gỡ mỏ neo `${pin:?}` khỏi một khoá bất kỳ trong bản sao config → phải đỏ **nêu đúng tên khoá đó**
- **Phục vụ:** E1 (AC-8) · **independent:** true

### T2 — Bảng khai-trước cho họ nhập nhằng (20 ô)
- **Files:** `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_ambiguous`; phá-thử: xoá một ô khỏi ma trận → đỏ **nêu đúng tên ô**
- **Phục vụ:** E2 (AC-11) · **independent:** true

### T3 — Phủ từ điển: chủ thể suy từ chính từ điển
- **Files:** `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_identifiers`; phá-thử: thêm một mục từ điển mà không thêm ca → đỏ **nêu đúng tên mục**
- **Phục vụ:** E3 (AC-5) · **independent:** true

### Nhóm A — lỗ hổng lớp ký tự

### T4 — Hằng lớp ký tự gạch dùng chung + ma trận 9 ô
- **Files:** `sdk/tongflow/text/normalize_vi.py`, `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_typographic_dash`; phá-thử: bỏ một ký tự khỏi hằng → đỏ nêu đúng ô (ký tự, vai). Ca âm `ki-lô-mét` phải xanh
- **Phục vụ:** E4 (AC-1) · **independent:** false *(cùng file với T5–T8)*

### T5 — Số-gạch-số khác khoảng: quan hệ bảo toàn chữ số
- **Files:** `sdk/tongflow/text/normalize_vi.py`, `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_range_shapes`; **gỡ đồng thời** ba ca khỏi `CORPUS_RANGE_NEGATIVE_KNOWN_LIMIT` và gỡ phép đo tự-đỏ-khi-giới-hạn-lành
- **Phục vụ:** E5 (AC-3) · **independent:** false

### T6 — Ngày không parse được thì từ chối
- **Files:** `sdk/tongflow/text/normalize_vi.py`, `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_datetime`; ca âm bắt buộc: `ngày 19/8/2026` vẫn đọc đúng
- **Phục vụ:** E6 (AC-9) · **independent:** false

### T7 — Gạch chéo còn sót trong ĐẦU RA
- **Files:** `sdk/tongflow/text/normalize_vi.py`, `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_residual_fail`; ca âm bắt buộc: `100km/h` **không** được đỏ
- **Phục vụ:** E7 (AC-10) · **independent:** false

### T8 — Token La-tinh giữ nguyên + URL
- **Files:** `sdk/tongflow/text/normalize_vi.py`, `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_idempotent` và `sdk_pytest_normalize_edges`; **gỡ đồng thời** `VNDirect` khỏi `IDEMPOTENCE_EXCLUDED`
- **Phục vụ:** E8 (AC-4), E9 (AC-2) · **independent:** false

### Nhóm C — mặt người dùng

### T9 — SDK trả mã lỗi ổn định
- **Files:** `sdk/tongflow/text/normalize_vi.py`, `sdk/tests/test_normalize_vi.py`
- **Verify:** khoá `sdk_pytest_normalize_error_codes`; assert tập mã khớp **hai chiều** với tập mã sinh từ code
- **Phục vụ:** E10 (AC-6) · **independent:** false *(sau T4–T8, cùng file)*

### T10 — Năm file ngôn ngữ + dây render
- **Files:** `src/i18n/messages/*.json` (5 locale), `src/lib/task/`, `src/components/workspace/nodes/base/abi-node-shell.tsx`
- **Verify:** khoá `normalize_registration_synced`; phá-thử: xoá khoá một mã ở một locale → đỏ nêu đúng locale + mã
- **Phục vụ:** E11 (AC-6) · **independent:** false *(sau T9)*

### T11 — Phép đo câu lỗi THẬT ở locale ≠ vi
- **Files:** `src/lib/task/normalize-error-render.test.ts` *(mới)*
- **Verify:** khoá `unit_normalize_error_i18n_render`; phá-thử: nối lại `result.error` vào chỗ hiển thị → đỏ nêu đúng mã + locale
- **Phục vụ:** E15 (AC-6) · **independent:** false *(sau T10)*

### T12 — Mục "Tiếng Việt" trong bộ chọn *(chỉ khi T0 cho phép)*
- **Files:** `src/components/workspace/nodes/base/language-select.tsx`, `src/i18n/messages/*.json`
- **Verify:** E12 (ảnh chụp hai trạng thái, kiểm xuất xứ) + E13 (hội đồng soi ảnh)
- **Phục vụ:** AC-7 · **independent:** true

### T13 — Cảnh báo chỉ hiện khi làm được
- **Files:** `src/lib/workflow/exporter.ts`, `src/hooks/use-export-warning-toast.ts`, `src/hooks/use-export-warning-toast.test.ts` *(mới)*
- **Verify:** khoá `unit_tts_order_violation` (lõi) **và** `unit_tts_warning_call_site` (chỗ gọi); phá-thử: ghim map rỗng ở chỗ gọi → đỏ nêu đúng tên đường gọi
- **Phục vụ:** E14, E16 (AC-12) · **independent:** true

## Nhóm chạy song song được

`T1` · `T2` · `T3` · `T12` · `T13` — khác file, khác bề mặt. T4–T11 nối đuôi vì cùng chạm `normalize_vi.py` / `test_normalize_vi.py`.

## Quy ước kiểm của kho — thắng mặc định của skill con

Mỗi việc verify bằng **khoá `config:` đã khai**, không gõ lệnh thẳng. Mỗi phép đo mới đi kèm **lượt phá-thử** ngay trong bước verify của chính việc đó — việc chưa có lượt phá-thử là việc **chưa xong**.

## Rủi ro

| rủi ro | dấu hiệu sớm | cách chặn |
|---|---|---|
| AC-7 fail-open nếu giọng đọc không nói được tiếng Việt | T0 trả "không" | T0 tự chuyển sang ngả (a) |
| T5/T8 gỡ giới hạn cũ mà quên gỡ phép đo tự-đỏ | test tự-đỏ đỏ sau khi vá | gỡ **cùng lượt**, đã ghi trong bước verify |
| Vá theo ca thay vì theo lớp (bài học 21 vòng) | vòng sửa thứ hai lại sinh lỗi cùng lớp | điều khoản dừng-vá: dừng, trình ba đường |
| Nhóm B đổi khuôn làm bằng chứng cũ hoá cũ | lưới trước-merge báo stale | gom T1–T3 vào một vòng, re-pin một lượt |
