# Đăng ký fork `oneflow-api-openai` vào manifest chính thức

**Ngày:** 2026-09-01 · **Slug:** `dang-ky-fork-openai` · **Hạng:** T2

## 1. Vì sao có việc này

OpenAI khai tử `whisper-1`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe` và
`gpt-4o-transcribe-diarize` ngày **26/08/2026**; tắt hẳn **26/02/2027**. Bốn model
đó chính là **toàn bộ** danh sách `transcribe` của `tongflow-api-openai`, và
`transcribe-timestamp` chỉ có mỗi `whisper-1`. Nghĩa là plugin OpenAI của kho sẽ
hỏng hoàn toàn ở đường phiên âm trong vòng sáu tháng.

Sửa nó tại chỗ là bất khả: `tong-io` trả `push=false` cho tài khoản đang đăng nhập
trên máy này. [ADR-0007](../../adr/0007-sequential-plugin-forking.md) định nghĩa
đúng tình huống này — fork **từng plugin, khi phải sửa nó** — nên đây không phải
một cuộc di cư, mà là cái thứ tư trong một chính sách đã có.

Fork đã dựng ngoài kho: <https://github.com/phanlemanh/oneflow-api-openai>.
Việc còn lại, và là **toàn bộ phạm vi hồ sơ này**, là làm cho kho biết đến nó.

## 2. Điều đã làm rồi (commit `b96ef5b`)

Hồ sơ này dựng **sau** phần lớn code — nói thẳng ở Cổng 1, không giả vờ ngược lại.

| # | File | Đổi gì |
|---|---|---|
| ① | `config/official-plugins.json` | chuỗi trần `tongflow-api-openai` → `{"id":"oneflow-api-openai","origin":"https://github.com/phanlemanh"}`; còn 35 chuỗi + 4 origin |
| ② | `scripts/plugins/check-manifest-unmoved.sh` | `EXPECTED_IDS` thêm id mới; 36→35; 3→4 |
| ③ | `public/plugins/oneflow-api-openai.svg` | mới (bản sao icon cũ) |
| ④⑤⑥ | `README.md`, `docs/README_ZH.md`, `docs/README_JA.md` | một mục danh sách plugin chính thức |

## 3. Điều phép đo phát hiện là CÒN THIẾU

Chạy các hàng rào có sẵn của kho trên commit đó:

```
check-manifest-unmoved       exit=0
check-manifest-guard-teeth   exit=0
check-manifest-doc-synced    exit=1  ← FAIL: CLAUDE.md không nêu con số 35
check-prefix-docs            exit=0
unit_official_manifest       exit=0  (59 ca)
```

`check-manifest-doc-synced.sh` không hardcode số 35 — nó **grep con số ra khỏi chính
hàng rào mà nó canh** (`strings.length !== ([0-9]+)`) rồi đòi `CLAUDE.md` phát biểu
đúng con số đó. Tôi sửa hàng rào mà quên `CLAUDE.md:64`, vốn tự gọi mình là "A fourth
coupled constant". Thước tự suy kỳ vọng từ vật nên nó bắt được ngay.

Đó là **lỗ thứ nhất**, và nó đã có thước.

## 4. Lỗ thứ hai: ba README không ai canh

`CLAUDE.md` viết nguyên văn: *"The READMEs are hand-maintained and silently drift."*
Đúng như vậy — không hàng rào nào buộc danh sách plugin chính thức trong ba README
khớp với manifest. Tôi vừa sửa ba file đó **bằng tay**, nên hồ sơ này không có cách
nào chứng minh chúng đúng ngoài việc tôi nói vậy.

Danh sách trong README có hình dạng máy-đọc-được:

```
- [<id>](https://github.com/<org>/<id>) — <mô tả>
```

Cả `id` lẫn `org` đều nằm trong dòng, nên khớp được với manifest: mục chuỗi trần
phải trỏ org mặc định, mục object phải trỏ org của chính `origin` nó khai.

**Đây là phần code MỚI duy nhất của hồ sơ.** Nó nằm dưới `scripts/plugins/**` —
vùng vốn đã phải re-pin ở vòng này — nên không kéo thêm một re-pin nào.

## 5. Điều CỐ Ý không làm

- **Icon.** `public/plugins/` thiếu icon cho **ba trong bốn** fork
  (`oneflow-api-ffmpeg`, `oneflow-api-pyscenedetect`, `oneflow-modal-compose-overlay`).
  Icon-tồn-tại **không phải bất biến của kho này**, nên dựng thước cho nó là bịa ra
  một luật rồi làm CI đỏ vì ba lỗi có sẵn không thuộc việc này.
- **Thứ tự mục trong README.** Kiểm tập-hợp + org là phần chịu lực; kiểm thứ tự
  tuyệt đối qua ba nhóm (API / Local / GPU) thì giòn mà không mua thêm gì.
- **Bộ quét thấy plugin trên đĩa.** `plugins/` gitignored, populated lúc chạy — CI
  không có nó. Đo được trên máy này, **không** đo được ở chốt chặn; nên nó không
  thành một AC. Số đo tay có ghi trong hồ sơ, không giả vờ là thước.
- **Tham chiếu lịch sử.** Bốn file ngoài `_acceptance/` còn nhắc `tongflow-api-openai`:
  hai là fixture test, hai là tài liệu quá khứ (`sdk/README.md` nêu nó làm *ví dụ đặt
  tên*, một plan tháng 8). Chúng là ghi chép, không phải đăng ký — sửa chúng là làm
  giả lịch sử. Loại trừ **có tên**, không loại trừ bằng cách lờ đi.
- **Hàng rào chặn model đã khai tử.** Đáng làm, là việc riêng.

## 6. Kèm theo: re-pin `conformance-l0`

Chạm `scripts/plugins/**` làm bằng chứng của hồ sơ `conformance-l0` thành ôi. Xử lý
bằng nghi thức re-pin một lượt lane, không đụng chữ ký người.

## 7. Đặc tả UX

Không có. Feature không chạm surface web-UI nào — manifest JSON, shell script, và văn
xuôi tài liệu. Bỏ bằng entry `descope` có tên trong sổ quyết định.
