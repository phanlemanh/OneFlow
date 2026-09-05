# Thiết kế: slot/node `normalize-text-vi` — đọc số, giá, ngày thành chữ trước khi TTS

*2026-08-19 · Hạng mục **1.3** của [lộ trình](../../roadmap.md) · hạng **T3** · làn NẶNG của
[pilot dây chuyền N=2](2026-08-19-pilot-day-chuyen-n2.md).*

## 1 · Vì sao

Gate G1 của lộ trình treo trên một câu: *"50 clip liên tiếp không lỗi dấu / **không sai số
giá**"*. Hôm nay OneFlow không có chỗ nào biến `1.999.000₫` thành *"một triệu chín trăm chín
mươi chín nghìn đồng"*. Hợp đồng `compose-overlay` đã ship viết thẳng ranh giới đó vào văn
bản — *"node không bao giờ format lại số/chuỗi (format là việc của `normalize-text-vi`
thượng nguồn)"* ([contract compose-overlay, mục Criteria](../../../_acceptance/compose-overlay/contract.md)).
Slot này là chỗ trống mà câu đó trỏ tới.

Người đọc số sai không phải người dùng — là **TTS**. ABI đã có bốn slot TTS
(`text-gen-speech-preset`, `text-gen-speech-clone`, `text-gen-speech-instruct`,
`text-audio-gen-speech`); [ADR-0009](../../adr/0009-tts-vi-eleven-v3.md) chốt chặng 1 dùng
ElevenLabs `eleven_v3`. Một model TTS đọc `85m2` hay `19/8/2026` theo cách nào là **không
khai được và không kiểm được** — nó nằm trong hộp đen của nhà cung cấp và đổi khi họ đổi
model. Chuẩn hoá **trước** TTS chuyển một biến ngẫu nhiên ngoài tầm với thành một hàm tất
định có golden corpus trong kho. Đó là toàn bộ lý do slot này tồn tại, và cũng là lý do nó
**bắt buộc đứng trước TTS**, không phải "nên".

## 2 · Hình dạng — slot là bản sao cấu trúc của `gen-text`

```json
{
  "nodeSlot": "normalize-text-vi",
  "inputs":  { "type": "object", "required": ["text"],
               "properties": { "text": { "type": "string", "minLength": 1 } },
               "additionalProperties": false },
  "outputs": { "type": "object", "required": ["success"],
               "properties": { "success": { "type": "boolean" },
                               "error":   { "type": "string" },
                               "text":    { "type": "string" } },
               "additionalProperties": false }
}
```

Không knob nào khác. Theo [ABI hygiene](../../../CLAUDE.md): một khái niệm một knob, và
**cái gì chỉ một plugin cần thì không vào ABI** — mức nghiêm ngặt, bộ từ điển viết tắt,
codec chữ số đều là hằng số/CSV trong plugin, không phải trường ABI. Slot này do đó không
mở bề mặt hợp đồng mới: nó trùng khuôn `gen-text` từng ký tự (`{text}` → `{success, error,
text}`), nên codegen TS/Python không sinh khái niệm mới nào.

Node UI khai `sourceSpec` **`{ text: textBatch() }`** — đúng cái mà cả bốn node TTS đang
dùng ([`node-feature-registry.ts`](../../../src/lib/abi/node-feature-registry.ts)). Lý do
là cơ học chứ không phải thẩm mỹ: scalar `text` mặc định bị `classifyInputField` xếp thành
**config** (ô nhập trong node), không phải handle; và chỉ `textBatch()` mới giữ nguyên
fan-out một-lời-gọi-mỗi-chuỗi của chuỗi `split-text → normalize-text-vi → TTS`. Chọn
`textScalarManual()` sẽ cho gõ tay được nhưng phá fan-out — đánh đổi sai chỗ, vì node này
sinh ra để nằm giữa dây chuyền chứ không phải để gõ tay.

## 3 · Logic chuẩn hoá sống ở đâu — quyết định load-bearing

Ba phương án. Khác biệt thật nằm ở **chỗ golden corpus chạy**, không ở chỗ code nằm.

| | Nơi đặt logic | Corpus chạy ở đâu | Giá |
|---|---|---|---|
| **A** | Repo plugin riêng (khuôn `compose-overlay`) | Guard clone-and-pytest, cần mạng | Corpus vô hình với CI của kho này; mỗi vòng verify tốn một lượt clone |
| **B** ✅ | `sdk/tongflow/text/normalize_vi.py`, plugin là vỏ ~20 dòng | `sdk/tests/` — chạy trong suite `sdk_pytest` **mỗi vòng**, không mạng | SDK thêm một dep MIT zero-dependency |
| **B'** | Như B nhưng tự viết luật từ đầu, không thư viện | như B | ~400 dòng luật tiếng Việt tự nuôi, tự sinh bug |

**Chọn B.** `compose-overlay` đặt logic ở repo plugin vì render **cần** Pillow + ffmpeg +
font — thứ không thể sống trong SDK. Chuẩn hoá văn bản là hàm thuần, không dep nặng, nên lý
do đẩy nó ra ngoài biến mất, còn cái giá thì ở lại: corpus nằm ngoài kho nghĩa là mỗi lần
sửa luật đọc số phải qua một vòng mạng mới biết đỏ hay xanh. Đặt trong SDK thì `pnpm test`
của chính kho này bắt được, và [engine headless](../../../sdk/tongflow/engine/) cùng skill
#1 (hạng mục 1.6) về sau gọi thẳng được, không cần vòng plugin.

**Thư viện: `vietnormalizer==0.2.3`** ([PyPI](https://pypi.org/project/vietnormalizer/),
[GitHub](https://github.com/nghimestudio/vietnormalizer)) — MIT, phát hành 2026-02-25,
**zero-dependency** (chỉ stdlib), dữ liệu đóng gói sẵn không tải model, pipeline 19 bước
tất định, 102 sao, có `test_normalizer.py`. Phủ sẵn: số nguyên/thập phân/số lớn, ngày giờ
và **khoảng**, tiền VND + USD, phần trăm và khoảng phần trăm, số thứ tự, **số điện thoại
đọc từng chữ số**, đơn vị đo, viết tắt qua CSV tự khai, nhận diện từ tiếng Việt để không
phiên âm bậy.

Hai ứng viên bị loại, có lý do ghi lại để khỏi bàn lại:

- **`vinorm` 2.0.7** — thư viện tiếng Việt được biết đến nhiều nhất (NVIDIA NeMo
  text-processing dùng chính nó cho tiếng Việt), nhưng license là *"Free for non-commercial
  use (AILAB)"*. OneFlow là AGPL-3.0 và là sản phẩm thương mại → **không dùng được**, không
  phải chuyện khẩu vị. Bản viết lại `pyvinorm` thừa hưởng cùng câu hỏi nguồn gốc.
- **`soe-vinorm` 0.3.2** (MIT, 2025-10-17) — mạnh hơn về nhận diện (CRF sequence tagger +
  mạng nơ-ron cho viết tắt, 18 loại NSW) nhưng **cần tải trọng số từ HuggingFace**. Với một
  slot mà lý do tồn tại là *tất định*, đổi một hàm thuần lấy một lần tải model + một thư mục
  cache là đi ngược đề bài, và nó phá luôn local-first (máy không mạng thì node chết).

### Đo thật thư viện, 19/08 — không phải giả định

Chạy `vietnormalizer==0.2.3` trên đúng bộ chuỗi của nghề (BĐS + bán hàng) trước khi mời ký.
Kết quả quyết định nội dung lớp tiền/hậu xử lý:

| Vào | Ra | |
|---|---|---|
| `41 căn hộ` | bốn mươi **mốt** căn hộ | ✅ |
| `125.000 đồng` | một trăm hai mươi **lăm** nghìn đồng | ✅ |
| `105 m2` | một trăm **lẻ** năm mét vuông | ✅ |
| `85m2` · `21 tầng` · `15 phút` | tám mươi lăm mét vuông · hai mươi mốt tầng · mười lăm phút | ✅ |
| `0901234567` | không chín không một hai ba bốn năm sáu bảy | ✅ |
| `19/8/2026` · `14:30` | ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu · mười bốn giờ ba mươi phút | ✅ |
| `giá 5/3` | giá năm tháng ba | ✅ đúng chốt |
| `1.500` | một nghìn năm trăm | ✅ đúng chốt |
| `50.000đ` | năm mươi nghìn **đồng** | ✅ |
| **`1.999.000₫`** | **một triệu chín trăm chín mươi chín nghìn** | ❌ **nuốt mất "đồng"** — ký hiệu `₫` (U+20AB) không được hiểu, trong khi `đ` thì được |
| `khoảng 10-15 triệu` | khoảng mười**-**mười lăm triệu | ❌ để nguyên dấu gạch, không đọc thành "đến" |
| `TP.HCM` | tê pê**.**hát xê em | ❌ đánh vần từng chữ cái, giữ dấu chấm |
| `Q.7` · `P.Bến Nghé` | q.bảy · p.bến nghé | ❌ không bung viết tắt |
| `Căn hộ đẹp…` | **c**ăn hộ đẹp… | ⚠️ hạ toàn bộ về chữ thường |

Ba hệ quả, đều đã vào tiêu chí:

1. **Bốn biến thể đọc riêng của tiếng Việt — `mốt`, `lăm`, `lẻ`, `mươi` — thư viện làm đúng
   cả bốn.** Ma trận toàn phần mà phản biện đòi (F2) vẫn giữ: nó không còn để bắt lỗi hôm nay
   mà để bắt lỗi *ngày thư viện nâng phiên bản*.
2. **Ô đắt nhất lại là ô hỏng.** `₫` bị nuốt nghĩa là đúng chuỗi giá phổ biến nhất trên
   overlay BĐS đi vào TTS mà mất luôn đơn vị tiền — và bất biến "không còn chữ số" **vẫn
   xanh**, vì lỗi ở đây là *mất chữ*, không phải *sót số*. Nên hậu kiểm phải có thêm một
   luật quan hệ: đầu vào có dấu hiệu tiền (`₫`/`đ`/`VNĐ`/`VND`) thì đầu ra **phải** có từ
   chỉ tiền tương ứng.
3. **Lớp tiền xử lý không phải phần tuỳ chọn.** Nó gánh: đổi `₫` → `đ`, đổi dấu gạch giữa
   hai số thành "đến", bung từ điển hành chính (`TP.HCM`, `Q.<n>`, `P.<tên>`). Không có nó
   thì ba dòng ❌ ở trên đi thẳng vào tai người xem.

Và một đính chính cho tiêu chí biên: thư viện **hạ chữ thường toàn bộ**, nên "văn bản thuần
chữ ra y nguyên" theo nghĩa byte là **sai**. Chốt lại: ra y nguyên **trừ** dạng chữ — đây là
chuẩn hoá cho máy đọc, chữ hoa không mang thông tin âm thanh.

Kiến trúc ba lớp trong SDK:

```
input.text
  → tiền xử lý OneFlow   (từ điển viết tắt ngành: TP.HCM, Q.7, P.Bến Nghé, m², BĐS…)
  → vietnormalizer 0.2.3 (pinned; pipeline 19 bước)
  → hậu kiểm OneFlow     (còn sót chữ số / ký hiệu tiền / % → success:false + liệt kê token)
```

**Thư viện vào SDK theo đường nào:** khai thẳng trong `dependencies` của
`sdk/pyproject.toml` (bên cạnh `pydantic`, `typing_extensions`), **pin chính xác**
`vietnormalizer==0.2.3` chứ không `>=`. Pin lỏng trong một thư viện là thói quen đúng ở nơi
khác nhưng sai ở đây: lời hứa của slot này là *tất định*, và một bản vá của thư viện đọc
khác đi một chuỗi là đúng thứ ta cam kết sẽ không xảy ra. Phương án thay thế — để nó thành
extra (`oneflow-sdk[text]`) cho 39 plugin còn lại khỏi gánh — bị loại vì đổi một gói pure
Python nhỏ lấy một khái niệm cài đặt mới mà mọi tác giả plugin phải biết, và một kiểu
`ImportError` khó đọc khi quên extra. License: SDK là AGPL-3.0-only, thư viện là MIT — chiều
này tương thích.

Hệ quả vận hành phải sửa cùng lúc: khoá `executors.test.sdk_pytest` trong
`_acceptance/config.yaml` chạy **toàn bộ** suite SDK bằng `uv --no-project` với danh sách
`--with` khai tay, nên nó phải có `--with vietnormalizer` — nếu không, mọi feature khác cũng
đỏ vì lỗi thu thập test, chẳng liên quan gì tới feature đang verify.

Lớp hậu kiểm là chỗ đắt giá nhất của thiết kế: nó biến "thư viện đọc đúng không" — câu hỏi
không kiểm hết được — thành một **bất biến máy kiểm được**: *đầu ra đi vào TTS không được
còn chữ số*. Thư viện có tiến hoá hay thay thế thì bất biến ấy không đổi.

## 4 · Chính sách mơ hồ — khai trước, không để thư viện quyết ngầm

README của `vietnormalizer` **không** ghi nó xử lý các ca mơ hồ ra sao. Đây là chỗ một
"thư viện tất định" vẫn đọc sai mà không ai biết. Ba ca dưới đây được **khai thành hằng số
sản phẩm** và ghim bằng corpus vàng; thư viện đọc khác thì lớp tiền/hậu xử lý của ta ép lại.

| Chuỗi | Đọc kiểu A | Đọc kiểu B | Chốt | Vì sao |
|---|---|---|---|---|
| `5/3` | ngày 5 tháng 3 | năm phần ba | **ngày tháng** | Nội dung BĐS/bán hàng nói ngày, không nói phân số |
| `1.500` | một nghìn năm trăm | một phẩy năm | **nghìn** | Dấu chấm là phân cách nghìn theo quy ước VN |
| `10-15` | mười đến mười lăm | mười trừ mười lăm | **khoảng** | Dấu gạch giữa hai số trong văn nói là khoảng |

Ca không quyết được (`3/4` vừa là ngày vừa là ba phần tư trong cùng một câu) **không** được
đoán: hậu kiểm cho qua theo chốt trên, và ca thật gặp trong dogfood đưa ngược vào corpus.

## 5 · Cưỡng chế "đứng trước TTS"

Lộ trình viết *"bắt buộc đứng trước TTS trong **mọi template**"*. Template chưa tồn tại —
skill system v1 là hạng mục **1.5**, chưa làm. Nên câu đó hôm nay chỉ cưỡng chế được ở một
chỗ: [`WorkflowExporter.export()`](../../../src/lib/workflow/exporter.ts) — nơi mọi workflow
(Director sinh hay người nối tay) đều đi qua trước khi chạy. Lượt kiểm: với mỗi
`ExecutableNode` có `feature` thuộc họ TTS, truy ngược `dependencies` tìm
`normalize-text-vi`; không thấy → vi phạm.

**"Họ TTS" phải là danh sách trắng tường minh bốn slot**, không phải luật suy đoán:

```
text-gen-speech-preset · text-gen-speech-clone · text-gen-speech-instruct · text-audio-gen-speech
```

Hai luật suy đoán tưởng chừng hợp lý đều **sai** trên chính ABI hôm nay. *"Có `text` vào và
`audio` ra"* bắt trúng thêm sáu slot nhạc — `gen-music`, `music-repaint`, `music-cover`,
`music-lego`, `music-complete`, `separate-sound` — nơi trường `text` là **lời mô tả cho model**
("nhạc lofi buồn", "tiếng chó sủa"), không phải chữ để đọc thành tiếng; bắt chúng đứng sau
normalize là vô nghĩa và làm gãy workflow nhạc. *"Tên slot chứa `speech`"* thì bắt nhầm
`speech-text-gen-video` và `speech-video-gen-video` — hai slot **tiêu thụ** giọng nói chứ
không sinh ra nó. Danh sách trắng cứng, và phép đo phải có **đối chứng âm**: một workflow
nhạc không có normalize thượng nguồn vẫn phải export sạch.

Hai mức, cần owner chốt (xem thẻ Cổng 1):

- **Chặn** — export ném lỗi, nêu đúng node nào thiếu và phải chèn gì. Đúng chữ "bắt buộc",
  nhưng làm gãy workflow TTS người dùng đang chạy hôm nay bằng `tongflow-modal-qwen3tts`.
- **Cảnh báo** — export vẫn ra, đính `issues[]`. Không gãy gì, nhưng "bắt buộc" thành
  "khuyến nghị", và cái sai lại rơi vào âm thanh giao cho khách.

Đề nghị: **chặn**, vì đây đúng là lớp lỗi mà Gate G1 đo, và mức nghiêm ngặt là một hằng số
lật lại được trong một dòng. Cưỡng chế ở tầng template để lại cho 1.5 — ghi descope.

## 6 · Cache Tier A

Slot tất định, không model, không seed → đúng khuôn Tier A như `compose-overlay`. Thêm vào
`TIER_A_SLOTS` ([`sdk/tongflow/engine/node_cache.py`](../../../sdk/tongflow/engine/node_cache.py))
và danh sách ghim trong `sdk/tests/test_node_cache.py`. Lợi: kịch bản "đổi giá 200 video"
không chạy lại chuỗi chuẩn hoá. Giá: ba hồ sơ họ cache (`cache-l2-store`, `cache-l3-tier-b`,
`cache-l4-eviction`) phải **ký lại** — bằng nghi thức re-pin một-lượt-lane của kit, không
phải ký tay từng cái.

## 7 · Hoá đơn ký lại — báo giá ngay tại Cổng 1

Theo luật per-file, đụng các chokepoint sau kéo hồ sơ khác ký lại:

| Đụng | Kéo theo |
|---|---|
| `config/tongflow.abi.json` + `src/generated/abi/**` + `sdk/tongflow/models/**` + `node_slots.py` | `conformance-l0` + họ cache (fingerprint đọc ABI digest) |
| `node_cache.py` (TIER_A_SLOTS) + `test_node_cache.py` (danh sách ghim) | `cache-l2-store`, `cache-l3-tier-b`, `cache-l4-eviction` |
| `scripts/plugins/check-manifest-unmoved.sh` (36 chuỗi + **3** → **4** entry origin) | `per-plugin-origin` |
| `src/lib/workflow/exporter.ts` | hồ sơ nào có eval đọc exporter — đối chiếu lúc S4 |

Dự kiến **~5 chữ ký lại**, cùng hình dạng với `compose-overlay`.

## 8 · Ranh giới với làn 13b (pilot N=2)

`src/lib/workflow/exporter.ts` là file cả hai làn chạm: làn 13b thêm một dòng vào bảng
`getAddNodeOutputType()`, làn này thêm một hàm + một lượt kiểm ở cuối `export()`. Khác vùng,
đã khai và chốt qua SendMessage: ai merge trước cứ merge, kẻ sau rebase tự giải; conflict
rơi vào một hàm chứ không phải một dòng thì kẻ sau ping.

## 9 · Ngoài phạm vi

- Cưỡng chế ở tầng template/skill (chờ 1.5) — hôm nay không có template để cưỡng chế.
- Chuẩn hoá cho ngôn ngữ khác `vi` — slot khai rõ `-vi` trong tên; ngôn ngữ khác là slot riêng.
- Đọc số theo giọng vùng miền (Nam/Bắc: "hai mươi mốt" ↔ "hai mươi một") — hằng số plugin
  nếu cần, không phải trường ABI.
- Sửa văn phong/chính tả/dấu câu cho hay hơn — đây là chuẩn hoá tất định, không phải LLM.
- Node kéo-thả để xem trước kết quả từng token — v1 chạy rồi xem output.
