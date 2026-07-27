# Corpus WER thực địa — quy trình chạy

Thư mục này là **đầu vào duy nhất còn thiếu** của điều kiện WER trong Gate G0
([lộ trình](../../docs/roadmap.md)). Bộ chấm điểm đã ship và đã ký
(`measure-harness`, 26/07); nó không sinh dữ liệu, chỉ chấm.

## Bố cục bắt buộc

Mỗi clip cần **hai** file text cùng tên gốc, đặt phẳng trong thư mục này:

```
<tên>.ref.txt   ← bản chép tay của người (sự thật)
<tên>.hyp.txt   ← bản model đoán
```

Audio gốc để ở đâu cũng được — bộ chấm không đọc audio. Xem cặp mẫu trong
[`src/lib/measure/__fixtures__/wer/`](../../src/lib/measure/__fixtures__/wer/).

**Quan trọng về số:** viết số trong `.ref.txt` đúng như người nói ra chữ hay đúng như
con số? Bộ chấm **không tự quy đổi** — nó đếm riêng `digitTokenErrors` cho mọi edit mà một
trong hai phía chứa chữ số, để người đọc tự phán. Fixture mẫu cố ý cho `199000` ở ref và
"một trăm chín chín nghìn" ở hyp, để thấy cột đó hoạt động. Giữ **một quy ước nhất quán**
xuyên corpus, và ghi lại quy ước đó ở cuối file này.

## Clip cần loại gì

Điều kiện G0 ghi "**thực địa**" — nghĩa là điều kiện thật, không phải giọng đọc studio:

- livestream bán hàng (ồn nền, nói nhanh, chen ngang)
- tour quay điện thoại (gió, vọng, khoảng cách micro thay đổi)
- đa dạng giọng vùng miền
- **phải có số và giá đọc thành lời** — đó là điểm G1 sẽ soi

Giọng TTS tổng hợp **không dùng được** cho phép đo này: nó sạch, và WER trên nó sẽ đẹp mà
vô nghĩa.

## Sinh `.hyp.txt`

Hai đường, chọn theo thứ bạn định ship:

**A — Whisper trên Modal** (đúng thứ pipeline P0 đang dùng, `tongflow-modal-whisper`):
điền `MODAL_TOKEN_ID` và `MODAL_TOKEN_SECRET` vào `.env`, cài plugin qua plugin manager
hoặc `pnpm plugins:install tongflow-modal-whisper`, chạy node `transcribe-timestamp` trên
từng clip, lưu output vào `<tên>.hyp.txt`.

**B — ElevenLabs Scribe** (API, không cần GPU): dùng `speech_to_text`. Nếu chọn đường này
thì DoD của G0 phải sửa — nó đang ghi đích danh "Whisper" — và nên có ADR ghi nhận, vì hệ
quả là Modal biến mất khỏi pipeline P0 và COGS chuyển sang giá API.

## Chấm

```bash
pnpm tsx scripts/measure/wer.ts measure/wer-corpus
```

Thêm `--json` để lấy dạng máy đọc. Bộ chấm **thoát khác 0** nếu có `.ref.txt` nào thiếu
`.hyp.txt` đi kèm — cố ý, để một corpus dở dang không bao giờ được báo cáo thành một trung
bình đẹp trên mấy clip tình cờ có mặt.

## Quy ước số của corpus này

<!-- Điền khi bắt đầu nạp clip. Ví dụ: "ref viết số bằng chữ số (199000), không viết chữ." -->

_(chưa chốt)_
