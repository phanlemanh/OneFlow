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

## Sinh `.hyp.txt` — đo cả bốn đường

[ADR-0010](../../docs/adr/0010-mainstream-infra-and-models.md) đặt ưu tiên vào hạ tầng và
model **phổ biến**, với Modal là một lựa chọn chứ không phải nền tảng. Nên phép đo này không
chọn sẵn một nhà cung cấp — nó **xếp hạng** chúng trên cùng bộ clip.

Chạy cùng corpus qua từng đường, lưu vào **thư mục con riêng** để so được:

```
measure/wer-corpus/
  *.ref.txt              ← bản chép tay, dùng chung cho mọi đường
  apimart/*.hyp.txt
  openai/*.hyp.txt
  scribe/*.hyp.txt
  modal/*.hyp.txt        ← chỉ khi còn cân nhắc ship bản GPU
```

Bộ chấm đọc một thư mục phẳng, nên để chấm từng đường thì copy `*.ref.txt` vào thư mục con
đó rồi trỏ script vào đấy.

| Đường | Cần gì | Ghi chú |
|---|---|---|
| **APIMart Whisper** | key APIMart | `tongflow-api-apimart` — vị trí 5 trong manifest, gateway có model picker |
| **OpenAI Whisper** | `OPENAI_API_KEY` | giá minh bạch nhất để quy ra COGS |
| **ElevenLabs Scribe** | key ElevenLabs | không phải Whisper — đối chứng khác họ mô hình |
| **Modal Whisper** | `MODAL_TOKEN_ID` + `MODAL_TOKEN_SECRET` | `tongflow-modal-whisper`, README thượng nguồn gọi là *"(alternative)"* |

**"Whisper" không phải một thứ.** `whisper-1` của OpenAI, bản Whisper mà APIMart phục vụ, và
bản mà `deploy.py` của plugin Modal ghim có thể khác trọng số và khác tham số giải mã
(VAD, beam, chunking). Cùng họ, khác kết quả — và khác nhiều nhất đúng ở chỗ ta cần: tiếng
Việt trong tiếng ồn. Đó là lý do đo cả bốn thay vì tin vào cái tên.

**Cần kiểm trước khi thiết kế bước cắt:** API audio thường có giới hạn kích thước file, nên
clip livestream dài phải chia nhỏ — và cắt ở đâu thì ảnh hưởng WER ngay tại mép cắt. Tra tài
liệu hiện hành của từng nhà cung cấp; đừng tin số nhớ được.

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
