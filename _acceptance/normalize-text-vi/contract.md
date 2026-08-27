---
schema_version: 1
feature: normalize-text-vi — slot đọc số/giá/ngày thành chữ tiếng Việt, bắt buộc đứng trước TTS (Phase 1.3)
slug: normalize-text-vi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [abi, sdk, web-ui, plugin, docs]
status: implemented
approved_by: Manh
approved_at: 2026-08-19
---

# Acceptance Contract: normalize-text-vi

## Context

Hạng mục Phase 1.3 của [lộ trình](../../docs/roadmap.md) — hạng mục kế tiếp trong hàng thực
thi. Gate G1 đo bằng câu *"50 clip liên tiếp không lỗi dấu / **không sai số giá**"*; nửa sau
của câu đó hôm nay không có ai chịu trách nhiệm. Hợp đồng `compose-overlay` đã ship trỏ
thẳng vào chỗ trống này: *"node không bao giờ format lại số/chuỗi (format là việc của
`normalize-text-vi` thượng nguồn)"*.

Thiết kế: [2026-08-19-normalize-text-vi-design.md](../../docs/superpowers/specs/2026-08-19-normalize-text-vi-design.md).

Quyết định định hình (chờ duyệt Cổng 1): logic sống trong **SDK** (`sdk/tongflow/text/`),
plugin `oneflow-api-normalize-text-vi` là vỏ mỏng · engine là **`vietnormalizer==0.2.3`**
(MIT, zero-dependency, không tải model) bọc giữa lớp tiền xử lý từ điển ngành và lớp **hậu
kiểm không-còn-chữ-số** · slot vào `TIER_A_SLOTS` · cưỡng chế thứ tự trước TTS ở
`WorkflowExporter.export()` ở mức **chặn**.

**Ranh giới thư viện:** `vinorm` 2.0.7 — thư viện tiếng Việt phổ biến nhất, NVIDIA NeMo dùng
cho tiếng Việt — bị **loại vì license** (*"Free for non-commercial use (AILAB)"*, không tương
thích sản phẩm thương mại AGPL-3.0). `soe-vinorm` bị loại vì cần tải trọng số HuggingFace,
đi ngược cả tính tất định lẫn local-first ([ADR-0011](../../docs/adr/0011-local-first-execution.md)).

**Tiền đề của vòng verify** *(khai sau phản biện context sạch — F4)*: hai mệnh đề của AC-13
nằm **ngoài cây mã** — bản 0.2.23 có trên PyPI, và repo plugin đã pin nó. Cả hai là hành động
**người** (publish cần TWINE credential; pin là một commit ở repo khác) và **không đảo ngược**
(đã publish lên PyPI thì không rút lại được). Vì vậy: `E14a` (ngoại tuyến) chạy mọi vòng;
`E14b` (trực tuyến) chỉ có nghĩa **sau khi owner đã ký cho phép publish**. Vòng S4 chạy trước
mốc đó sẽ thấy `E14b` đỏ vì hạ tầng chứ không vì mã — đúng loại đã tiêu một vòng verify của
`byo-key-onboarding` — nên trình tự đúng là: Cổng 2 ký → publish → chạy lại `E14b`.

**Chi phí ký lại, báo giá NGAY tại Cổng 1** (luật per-file): đụng `config/tongflow.abi.json`
+ `src/generated/abi/**` + `sdk/tongflow/models/**` + `node_slots.py` → `conformance-l0` và họ
cache ký lại (fingerprint đọc ABI digest); đụng `node_cache.py` (TIER_A_SLOTS) +
`test_node_cache.py` (danh sách ghim) → `cache-l2-store`, `cache-l3-tier-b`, `cache-l4-eviction`
ký lại; đụng `check-manifest-unmoved.sh` (3 → 4 entry origin) → `per-plugin-origin` ký lại.
Dự kiến **~5 chữ ký lại**, cùng hình dạng với `compose-overlay`.

## Criteria

Quy tắc chung: mọi tiêu chí đọc-thành-chữ đo bằng **corpus vàng trong `sdk/tests/`** (bảng
vào → ra, phiên bản thư viện ghim trong `sdk/pyproject.toml`); "verbatim" nghĩa là từng ký
tự. Corpus là bề mặt nghiệm thu — thư viện đọc khác chốt của ta thì lớp tiền/hậu xử lý của
ta ép lại, không sửa corpus cho khớp thư viện.

- AC-1: Given ABI có slot `normalize-text-vi` đúng thiết kế (inputs `text` required; outputs
  `success` required + `error`/`text`; không knob nào khác), When chạy trọn codegen train
  (`pnpm gen:abi` → `gen_models.py` → `gen_node_slots.py`), Then không drift: generated TS,
  bản copy `sdk/tongflow/_data/tongflow.abi.json`, `models/normalize_text_vi.py`,
  `node_slots.py` đều đã commit khớp (`git diff --exit-code`). *Generators không tự chạy
  chuỗi — quên một bước là SDK lệch ABI im lặng.*
- AC-2: Given corpus vàng các chuỗi **số và tiền**
  được tổ chức thành **ma trận toàn phần khai TRƯỚC trong file test** — trục biến thể đọc
  {`linh`, `lẻ`, `mốt`, `lăm`, `mươi` vs `mười`} × trục vị trí {hàng chục sau 20…90, hàng
  trăm, nghìn, triệu, tỷ} — When chuẩn hoá, Then mỗi ô ma trận có ít nhất một ca và đầu ra
  khớp corpus **từng ký tự**; số phần tử corpus được assert bằng một **literal** trong file
  test, và ô trống làm phép đo đỏ kèm tên ô. Bắt buộc có ca **`1.999.000₫`** và đầu ra của nó
  phải **giữ được từ chỉ tiền** ("… nghìn đồng"). *Nửa "không sai số giá" của Gate G1. Đo thật
  19/08 (thiết kế §3): thư viện làm ĐÚNG cả bốn biến thể `mốt`/`lăm`/`lẻ`/`mươi`, nên ma trận
  không phải để bắt lỗi hôm nay mà để bắt lỗi ngày nâng phiên bản thư viện — nhưng nó **nuốt
  mất "đồng"** khi gặp ký hiệu `₫` (chỉ hiểu `đ`), đúng chuỗi giá phổ biến nhất trên overlay
  BĐS, nên lớp tiền xử lý phải đổi `₫` → `đ` trước khi giao cho thư viện. Tiêu chí này viết
  lại sau phản biện context sạch — F2.*
- AC-3: Given corpus vàng **thời gian** (ngày `19/8/2026` và `19-08-2026`, tháng/năm rời,
  giờ phút `14:30`, khoảng ngày `25-26/12`), When chuẩn hoá, Then đầu ra khớp corpus từng ký
  tự và đọc theo trật tự ngày-tháng-năm của tiếng Việt.
- AC-4: Given corpus vàng **định danh và đơn vị** (số điện thoại `0901234567`, `m²`, `km/h`,
  `kg`, viết tắt ngành `TP.HCM`, `Q.7`, `P.Bến Nghé`), When chuẩn hoá, Then số điện thoại đọc
  **từng chữ số** (không đọc thành số lượng), đơn vị và viết tắt bung theo từ điển ngành khai
  trong kho — `TP.HCM` → "thành phố hồ chí minh", `Q.7` → "quận bảy", `P.Bến Nghé` →
  "phường bến nghé", và **không còn dấu chấm viết tắt nào sót lại**. *Đo thật 19/08: thư viện
  một mình đọc `TP.HCM` thành "tê pê.hát xê em" và để nguyên `q.bảy` — ba dòng này là việc của
  từ điển ngành trong kho, không phải của thư viện. Nội dung BĐS/bán hàng gọi tên chỗ và diện
  tích ở mọi câu.*
- AC-5: Given ba chuỗi mơ hồ `5/3`, `1.500`, `10-15`, When chuẩn hoá, Then đọc đúng chốt đã
  khai trong hợp đồng — **ngày tháng**, **nghìn**, **khoảng** (`10-15` → "mười **đến** mười
  lăm", không còn dấu gạch) — và chốt đó là hằng số tất định, không phụ thuộc ngữ cảnh câu.
  Chốt **khoảng** áp cả khi hai đầu mang hậu tố đơn vị: `5%-10%` (kể cả có khoảng trắng
  quanh dấu gạch) và `1.000₫-2.000₫` đọc "… **đến** …", không bao giờ thành "trừ"/"âm".
  *(nâng phạm vi tại Cổng 2, owner 2026-08-21 — đo thật: `5%-10%` từng đọc "năm phần
  trămâm mười phần trăm" với ok=True, đúng lớp lỗi "không sai số giá" của Gate G1.)*
  **Lớp, không phải danh sách** *(amendment 2026-08-21, Cổng 2 vòng 4)*: "hậu tố đơn vị"
  nghĩa là **mọi** cách viết đơn vị — ký hiệu (`%`, `₫`), viết tắt (`đ`) hay **từ đầy đủ**
  (`triệu`, `tỷ`, `kg`, `người`) — và corpus đo bằng **ma trận {kiểu đơn vị} × {dính, có
  khoảng trắng}** khai trước, mỗi ô có ca hoặc được kê là cố-ý-bỏ kèm lý do. Lý do siết
  chữ: hai vòng liền bản vá chỉ thêm đúng phần tử vừa lộ (`5%-10%`, rồi `1.000 đ-2.000 đ`)
  nên corpus lớn theo **ca** trong khi tiêu chí viết theo **lớp** — đo thật ở vòng 4:
  `5 triệu - 10 triệu` → "năm triệu mười triệu", `5 tỷ - 10 tỷ`, `5kg-10kg`,
  `5 người - 10 người`, tất cả mất chữ "đến" với `ok=True`. Luật nay neo vào **số**, không
  vào danh sách đơn vị.
  *Đo thật 19/08: hai chốt đầu thư viện đã làm đúng; chốt thứ ba nó để nguyên dấu gạch
  ("mười-mười lăm"), nên phần "đến" là việc của lớp tiền xử lý. Im lặng nhận mặc định của
  thư viện là nhận một hành vi không ai khai.*
- AC-6: Given một chuỗi mà lớp chuẩn hoá **không đọc hết** (còn chữ số ASCII, ký hiệu tiền,
  `%`, hoặc dấu gạch giữa hai số trong đầu ra), When chạy, Then `success:false` + `error`
  **liệt kê đúng các token còn sót**; Given chuỗi đọc hết, Then `success:true`, đầu ra **không
  chứa ký tự `0-9`**, và — luật **quan hệ**, không phải luật vắng mặt — đầu vào có dấu hiệu
  tiền (`₫`, `đ`, `VNĐ`, `VND`) thì đầu ra **phải chứa từ chỉ tiền tương ứng**. Dấu hiệu `đ`
  tính cả dạng **có khoảng trắng** (`500 đ`) và dạng đó phải đọc được thành "… đồng" chứ
  không bị từ chối. *(nâng phạm vi tại Cổng 2, owner 2026-08-21 — trước đó `has_money`
  nhận dạng này là tiền nhưng không lớp nào đọc nó, nên mọi giá viết cách đều ok=False.)*
  Dấu hiệu `đ`/`đồng` tính **cả chữ HOA** *(amendment 2026-08-21, Cổng 2 vòng 4)*: `Giá 500 Đ`
  và `GIÁ 1.999.000 Đ/THÁNG` phải đọc ra chữ tiền. Đo thật ở vòng 4: ba lớp cùng trượt một
  lúc — `has_money` trả False nên luật quan hệ không chạy, tiền xử lý không viết lại, hậu
  kiểm không bắt chữ tiền trơ — nên `ok=True` với đầu ra "giá năm trăm đ". Hai mỏ neo anh em
  (`VNĐ`/`VND`) vốn đã phủ chữ hoa từ đầu.
  *Bất biến máy kiểm được thay cho câu hỏi không kiểm hết được "thư viện đọc đúng không".
  Vế quan hệ là bắt buộc vì đo thật 19/08 cho thấy lỗi đắt nhất là **mất chữ**, không phải
  **sót số**: `1.999.000₫` ra "một triệu chín trăm chín mươi chín nghìn" — không còn chữ số
  nào, bất biến vắng-mặt vẫn xanh, mà giá đọc lên đã mất đơn vị tiền.*
- AC-7: Given cùng một chuỗi vào, When chạy **2 lần** trong cùng môi trường pin, Then đầu ra
  byte-identical; và Given đầu ra của lần chuẩn hoá thứ nhất đem chuẩn hoá lần nữa, Then
  **không đổi** (idempotence). *Điều kiện vào cửa Tier A, và điều kiện để node đứng trong dây
  chuyền chạy lại nhiều lần mà không trôi.*
- AC-8: Given các chuỗi **biên** — rỗng/chỉ khoảng
  trắng · văn bản thuần chữ không có số · chuỗi ≥ 10.000 ký tự · emoji/URL/email lẫn trong
  câu · cùng một câu tiếng Việt ở **hai dạng Unicode NFC và NFD** — When chuẩn hoá, Then:
  rỗng (kể cả chuỗi chỉ khoảng trắng — thư viện tự nó trả về chuỗi rỗng không báo lỗi, nên
  đây là việc của vỏ ta) → `success:false` + error rõ; **văn bản thuần chữ ra y nguyên trừ
  dạng chữ** — nội dung không đổi một ký tự, nhưng đầu ra ở chữ thường, vì chữ hoa không mang
  thông tin âm thanh và thư viện hạ chữ thường toàn bộ (đo thật 19/08); không sửa chính tả,
  không đổi dấu câu; **đầu ra LUÔN ở dạng NFC** trên toàn corpus; và
  `normalize(NFD(x)) == normalize(NFC(x))` **byte-identical** với mọi ca corpus có dấu.
  **Văn xuôi không số không bị từ chối vì dấu câu** *(amendment 2026-08-21, Cổng 2 vòng 4)*:
  `Ghi chú:Xem thêm` — thiếu dấu cách sau dấu hai chấm, lỗi gõ thường gặp — phải `ok=True`.
  Luật bắt dấu hai chấm sống sót nay là luật **quan hệ vào↔ra** (đầu vào có `số:số` VÀ đầu
  ra còn dấu hai chấm dính giữa hai CHỮ), không còn là luật hình dạng trên riêng đầu ra:
  bản hình-dạng không phân biệt được đồng hồ bị đọc hỏng với văn xuôi thiếu dấu cách, nên
  nó chặn cả dây TTS trên câu không có lấy một chữ số.
  *Chốt dạng Unicode là nửa "không lỗi dấu" của Gate G1: chuỗi copy từ web/macOS hay ở dạng
  NFD, và nếu fixture cũng gõ trong cùng môi trường thì phép so-từng-ký-tự vẫn xanh trong khi
  TTS nhận chuỗi lẫn dạng — không phép đo nào đỏ nếu chỉ yêu cầu "không crash". Tiêu chí này
  viết lại sau phản biện context sạch — F5.*
- AC-9: Given node `normalize-text-vi` mount trên canvas, When render node và export, Then
  handles đúng từ ABI (`in:text`, `out:text`); `sourceSpec` là `{ text: textBatch() }` nên
  fan-out một-lời-gọi-mỗi-chuỗi **giống hệt** các node TTS; exporter phát `ExecutableNode` có
  `pluginId` top-level và `prompt` chỉ chứa business field — không `bindings`/`paramMappings`
  viết tay.
- AC-10: (cross-layer) Given một workflow có node TTS mà **không** có `normalize-text-vi` nào
  trên đường phụ thuộc thượng nguồn, When export, Then export **thành công kèm cảnh báo**
  máy-đọc-được (`warnings[]` mang code + đúng id node vi phạm) và UI hiện thông điệp i18n
  nêu việc phải làm — không chặn. *(hạ mức từ chặn xuống cảnh báo theo quyết định owner
  2026-08-20, supersedes entry Cổng 1 — xem `d-20260820T091500Z-9098`: node chưa vào được
  picker nên mức chặn hồi tố làm hỏng mọi workflow TTS đã lưu; điều kiện nâng lại thành
  chặn ghi trong entry.)* Given workflow có `normalize-text-vi` đứng trước TTS
  (kể cả cách hai node), Then export ra bình thường, `warnings` rỗng — lượt kiểm không đỏ oan;
  Given một workflow **nhạc** (`gen-music`, `music-repaint`, `music-cover`, `music-lego`,
  `music-complete`, `separate-sound`) không có normalize thượng nguồn, Then export vẫn sạch —
  trường `text` của các slot đó là lời mô tả cho model, không phải chữ để đọc thành tiếng.
  *(sửa sau phản biện context sạch — F3)* Và Given danh sách "họ TTS" ghim trong guard, When
  đối chiếu **hai chiều** với ABI theo tiêu chí khai ở thiết kế §5, Then không lệch — thêm
  một slot TTS vào ABI mà quên khai vào guard phải làm phép đo đỏ kèm tên slot. *Hạng mục 1.4
  sắp thêm slot TTS ElevenLabs; danh sách trắng đóng băng im lặng biến "bắt buộc" thành
  "bắt buộc với bốn slot cũ".*
- AC-11: (cross-layer) (amendment 2026-08-21, Cổng 2 vòng 5 — **rút khỏi Tier A**) Given
  `normalize-text-vi` **KHÔNG** nằm trong `TIER_A_SLOTS` và một workflow 2-node (fake plugin
  tầng B → normalize-text-vi) chạy qua engine, When chạy lần 2 không đổi gì, Then node tầng B
  **trúng cache** (0 lời gọi) còn reader chạy lại đúng một lần, và đầu ra không đổi; When chỉ
  đổi chuỗi `text` vào, Then node tầng B vẫn **không** chạy lại; và guard allowlist ghim slot
  ở trạng thái **vắng mặt** kèm điều kiện vào lại.
  **Vì sao rút** *(đo được, không phải suy đoán)*: khoá cache Tier-A chỉ mang `sdk_major()`,
  cắt còn MAJOR.MINOR — `0.2.19`, `0.2.22`, `0.2.23`, `0.2.24` đều băm thành `"0.2"`. Mọi
  slot Tier-A khác tính toán bên trong repo plugin của nó nên `pluginRev` theo dõi được đúng
  mã sinh ra giá trị; `normalize-text-vi` là slot Tier-A **đầu tiên** có thuật toán nằm trong
  chính SDK. Hệ quả đo được: **bốn** bản vá reader ship trong một ngày (0.2.20 → 0.2.23)
  không làm mất hiệu lực một mục cache nào — người dùng từng gặp `"Giá 500 Đ"` đọc sai sẽ
  nhận lại đúng bản sai đó, `ok=True`, không đỏ ở đâu. Đúng lớp "sai số giá êm ru" mà Gate G1
  tồn tại để chặn.
  **Cái giá đã chọn:** reader chạy lại mỗi lượt. Chấp nhận được vì nó là hàm thuần CPU trên
  một chuỗi — không gọi model, không I/O; phần đắt tiền (sinh nội dung tầng B) vẫn được cache
  nguyên vẹn, và đó mới là thứ AC-11 thực sự bảo vệ. LOẠI phương án đưa danh tính reader vào
  vân tay ở vòng này: nó chạm `fingerprint.py` — đường cache dùng chung — nên kéo theo
  `cache-l2-store` / `cache-l3-tier-b` / `cache-l4-eviction` ký lại.
  **Điều kiện vào lại Tier A:** vân tay mang được danh tính reader (SDK version đầy đủ, hoặc
  digest của `tongflow/text/` cộng pin `vietnormalizer`). Ghim bằng test, không bằng văn xuôi.
- AC-12: (cross-layer) Given fixture workflow chứa `normalize-text-vi` chạy qua **cả hai**
  đường canvas-TS và engine-Python (conformance suite L0), When so kết quả, Then hai runtime
  không lệch: cùng số lời gọi, cùng shape input tới plugin (scalar `text` mỗi lời gọi, không
  batch fan-out nhầm tầng).
- AC-13: Given plugin đã đăng ký official, When kiểm đồng bộ, Then
  `config/official-plugins.json` có entry `{"id": "oneflow-api-normalize-text-vi", "origin":
  "https://github.com/phanlemanh"}` — **entry origin thứ tư**; `check-manifest-unmoved.sh`
  cập nhật đúng ngữ nghĩa mới (36 chuỗi trơn + **4** entry origin, id set có tên mới) và
  `check-manifest-guard-teeth.sh` vẫn chứng minh guard còn răng **mà không phải sửa** (phép
  nhiễu số 2 của nó đẩy thêm một entry lên trên mốc thật, nên nó tự đúng khi mốc là 4);
  **cả 3 README** (EN/ZH/JA) có plugin trong danh sách + **một dòng MỚI** trong ma trận năng
  lực dưới `Transform → Text` — hôm nay mục đó chỉ có đúng một dòng *"Generate / rewrite"*,
  nên đây là **thêm hàng**, không phải lật ⬜ → ✅ của hàng có sẵn; i18n keys node đủ **5**
  locale (en/vi/ja/ko/zh) dưới namespace `normalizeTextVi.*`.
  Cùng tiêu chí này, **release train** *(gộp từ AC-14 cũ; tách đôi phép đo theo F4)*: nhánh
  **ngoại tuyến** — `sdk/pyproject.toml` và `sdk/tongflow/__init__.py` cùng phiên bản
  **0.2.23** (số **derive** từ `pyproject.toml`, không ghi cứng trong script guard; ROOT suy
  từ vị trí script chứ không từ cwd), `vietnormalizer==0.2.3` khai trong `dependencies` với
  pin chính xác; nhánh **trực tuyến** — 0.2.23 đã publish lên PyPI, bản publish chứa
  `NormalizeTextViInput/Output` + `NORMALIZE_TEXT_VI`, repo plugin pin `oneflow-sdk==0.2.23`.
  *Trình tự cứng: publish SDK trước khi plugin pin — xem tiền đề ở mục Context.*
- AC-14: (cross-layer) *(thêm sau phản biện context sạch — F1)* Given slot method THẬT của
  plugin `oneflow-api-normalize-text-vi` (không phải fake handler của test cache), When gọi
  qua `@node_slot` với `{"text": "<một dòng corpus>"}`, Then trả `success:true` và `text`
  khớp **đúng dòng corpus đó** (so với hằng số corpus dùng chung, không viết lại kỳ vọng tại
  chỗ), và hàm SDK được gọi **đúng một lần** — vỏ không được tự cài lại logic; Given hàm SDK
  ném, Then vỏ trả `success:false` + error ghim thông điệp, không để lộ traceback.
  *Đây là lớp lỗi đã cắn hồ sơ `cache-l4-eviction`: hàm viết đúng, quên chỗ gọi, mọi eval
  unit-level vẫn xanh. Ở đây nó còn tệ hơn — E11a chạy fake plugin nên không chạm vỏ thật, và
  một vỏ viết `return NormalizeTextViOutput(success=True, text=input.text)` sẽ để cả 24 eval
  xanh trong khi TTS vẫn đọc sai giá.*
- AC-15: (judgment) (amendment 2026-08-21, Cổng 2 vòng 3 — tách vế so sánh) Given node
  `normalize-text-vi` trên canvas dev server, When soi capture HTML + screenshot theo ngôn
  ngữ thiết kế workspace hiện có, Then node "nhìn như người nhà" của các node transfer sẵn
  có (shell, spacing, trạng thái rỗng/đang chạy/lỗi), thông điệp lỗi của AC-6 đọc được bằng
  tiếng người ("chưa đọc được: 3/4, ~") chứ không phải dump kỹ thuật, và đạt sàn P0 design
  gate.
  **Tách vế so sánh (amendment):** hai vòng verify đầu đều trả `E16` UNCERTAIN vì cùng một
  lý do công cụ — câu hỏi bắt so với `denoise-audio` / `remove-subtitle` trong khi trang
  proto `/proto/[slug]` chỉ dựng được node của chính feature này, nên panel không bao giờ
  có ảnh đối chứng để so. Từ vòng 3: `E16` chỉ chấm phần **hai ảnh cho thấy** (node hợp
  khuôn `AbiNodeShell`, không có gì phá ngôn ngữ thiết kế nhìn thấy ngay trên ảnh); vế
  **so sánh với node transfer khác** chuyển sang checklist Cổng 2 của owner — T3 vốn bắt
  buộc owner tự xác nhận mọi mục judgment và điền `human_override`, nên vế này về đúng tay
  người chứ không mất. Phương án đã LOẠI: thêm hai node đối chứng vào trang proto (thêm mã
  ở vòng cuối chỉ để nuôi một hội đồng, và phải chụp lại từ đầu).

## Coverage

Từ morphological scan 19/08 (preset test-matrix + entity-feature; chân sản phẩm: roadmap
Gate G1 + PRD cache + hợp đồng `compose-overlay` `[SP]`; chân ngành có tên, tra 19/08:
`[NGÀNH: vietnormalizer 0.2.3]` danh mục tính năng NSW, `[NGÀNH: soe-vinorm 0.3.2]` phân loại
18 loại non-standard word, `[NGÀNH: NVIDIA NeMo text-processing]` khuôn WFST chuẩn hoá TTS,
`[NGÀNH: vinorm 2.0.7 / AILAB]` bộ luật tiếng Việt tham chiếu — chỉ đối chiếu, **không dùng
code** vì license):

- **Trục lớp giao phó** ABI+codegen | logic chuẩn hoá (SDK) | node UI | cache Tier A |
  cưỡng chế thứ tự | đăng ký/release — [CE: checklist cross-layer CLAUDE.md + hợp đồng
  compose-overlay đã ship] → AC-1, 2–8, 9, 11, 10, 13–14
- **Trục lớp token phải đọc** số thuần (nguyên/thập phân/âm/phần trăm) | tiền tệ | thời gian
  (ngày/giờ/khoảng) | định danh đọc từng chữ số | đơn vị & viết tắt | phi-số giữ nguyên —
  [CE: ngành vietnormalizer + soe-vinorm 18 NSW] → AC-2, 2, 3, 4, 4, 8
- **Trục trạng thái chuỗi vào** rỗng/trắng | điển hình | biên (dài, emoji/URL/email, NFC/NFD)
  | **mơ hồ** | đã-chuẩn-hoá-rồi | không đọc được — [CE: preset test-matrix + bảng trap của
  thiết kế §4] → AC-8, 2–4, 8, 5, 7, 6
- **Trục vị trí trong dây chuyền** đứng một mình | đúng luật trước TTS | vi phạm | workflow
  nhạc (đối chứng âm) | chạy lại lần 2 | hai runtime — [CE: PRD cache §4 + conformance L0 +
  câu "bắt buộc đứng trước TTS" của roadmap 1.3] → AC-9, 10, 10, 10, 11, 12
- **Trục ai thực thi slot** *(thêm sau phản biện context sạch — F1; scan lần đầu sót trục
  này)* hàm trong SDK | vỏ plugin thật | fake handler của test cache | plugin-executor —
  [CE: hồ sơ `cache-l4-eviction` (hàm đúng, quên chỗ gọi) + khuôn `@node_slot` của CLAUDE.md]
  → AC-2–8, **AC-14**, AC-11, AC-9
- Cross-cutting mọi ô Core: tất định byte-identical + idempotence (AC-7) · bất biến
  không-còn-chữ-số (AC-6) · dấu tiếng Việt đúng ở mọi ca đọc
- Ô Later/Never có vết: giọng vùng miền Nam/Bắc (Later — hằng số plugin khi dogfood đòi) ·
  ngôn ngữ khác `vi` (Never — slot riêng, tên slot đã khai `-vi`) · sửa chính tả/văn phong
  (Never — đây là hàm tất định, không phải LLM) · đọc số La Mã (Later — chưa gặp trong nội
  dung BĐS/bán hàng) · chuẩn hoá **ngược** chữ → số (Never — không ai cần) · cưỡng chế ở
  tầng template (Later — chờ 1.5, không có template để cưỡng chế hôm nay) · xem trước
  từng token trên node (Later — v1 chạy rồi xem output).

## Out of scope

- Cưỡng chế thứ tự ở tầng template/skill — skill system v1 là hạng mục 1.5, chưa có template
  nào tồn tại để cưỡng chế.
- Chuẩn hoá cho ngôn ngữ khác tiếng Việt — tên slot đã khai `-vi`; ngôn ngữ khác là slot riêng.
- Sửa chính tả, dấu câu, văn phong — slot này là hàm tất định; việc "viết cho hay" thuộc về
  `gen-text` (LLM).
- Plugin TTS ElevenLabs (hạng mục 1.4) — slot này chỉ giao chuỗi đã đọc được; ai đọc thành
  tiếng là chuyện của hạng mục sau.
- Đọc số theo giọng vùng miền — nếu cần thì là hằng số plugin, không phải trường ABI
  ([ABI hygiene](../../CLAUDE.md)).

- AC-16: (cross-layer) *(nâng phạm vi tại Cổng 2 vòng 5, owner 2026-08-22)* Given hai
  **dụng cụ đo** của chính hồ sơ này — lượt chụp màn hình và phép suy phiên bản engine
  dùng chung cho mọi executor — When chúng không đo được thứ chúng nói đang đo, Then
  chúng **từ chối**, chứ không cho ra kết quả trông sạch. Cụ thể: lượt chụp ghi ảnh khi
  trang đúng ngôn ngữ đã yêu cầu, và **từ chối ghi + xoá khung cũ** khi trang trả về ngôn
  ngữ khác, kể cả khi chuỗi `--require` vẫn có mặt (tên sản phẩm không phụ thuộc ngôn ngữ);
  **không** khoá executor nào còn suy pin bằng thay-thẳng, vì dạng đó cho ra chuỗi rỗng và
  `--with` nuốt tham số kế tiếp, làm mọi tính năng khác đỏ oan bằng một lỗi không chỉ về
  đâu. Đo theo **lớp 13 khoá**, không theo khoá vừa lộ.
  *Lý do nâng phạm vi thay vì ghi Known limits: mọi lỗi đắt nhất của tính năng này đều
  cùng hình dạng — một dụng cụ cho ra kết quả trông sạch trong khi không đo gì. Khung
  chụp sai locale, thư viện không ghim, assert bị chặn bởi chính verdict nó đo, ma trận
  chỉ có trục dương, khoá cache không phân biệt nổi phiên bản reader. Cả năm đều do người
  đọc mã tìm ra, vì không chỗ nào đỏ. AC này là chỗ đỏ đó.*

## Sửa đổi vòng 5 (2026-08-22)

- **AC-6 — chữ tiền sau TỪ ĐƠN VỊ LỚN.** Dấu hiệu tiền tính cả dạng `<số> <đơn vị lớn> đ`
  (`5 tỷ đ`, `500 triệu đ`). Đo thật vòng 5: cả ba lớp cùng trượt vì đều neo vào **chữ số**
  ngay bên trái chữ `đ`, nên `ok=True` với đầu ra "giá năm tỷ đ" — mất hẳn chữ tiền. Nay
  neo vào một hằng số dùng chung `{nghìn, ngàn, triệu, tỷ, tỉ}`, đo bằng ma trận
  {đơn vị} × {dính, có khoảng trắng}.
- **AC-5 — số viết chuẩn Việt Nam có phần thập phân.** `3.000.000,00 đ` từng đọc thành
  "ba triệu" **sai bậc** ("ba.không.không" với dấu chấm nghìn, "ba trăm triệu" khi bỏ chấm)
  — `ok=True` cả hai đường vì không còn chữ số nào sót lại. Chốt đọc: phần lẻ **toàn số 0
  thì bỏ** (`3.000.000,00 đ` → "ba triệu đồng"), phần lẻ khác 0 đọc "phẩy <chữ số>"; chỉ
  nhận **một hoặc hai** chữ số thập phân, vì ba chữ số lẫn với dấu ngăn nghìn kiểu Anh.
  Đo bằng ma trận {có chấm nghìn, không chấm} × {không phần lẻ, phần lẻ 0, phần lẻ khác 0}
  kèm ba ca ÂM (chuỗi phiên bản, ngày, giá nghìn trơn) mà luật không được ăn.
- **AC-9 — phép đo đăng ký đi qua đường mount thật.** Phép đo cũ tự gọi hàm đăng ký với
  tham số tự viết rồi đọc lại chính nó, nên chỉ chứng minh sổ đăng ký lưu được thứ mình
  vừa nhét vào; xoá lệnh ghi ở đường sản xuất mà nó vẫn xanh. Nay nó mount node thật và
  chờ sổ đăng ký được điền — đã chứng minh đỏ khi vô hiệu lệnh ghi.
- **Vùng phủ:** bốn `paths` viết kiểu thư mục (`sdk/tongflow/text/` …) vô hình với phép
  đếm vùng phủ, vì phép đó khớp chuỗi chính xác — nên chính file bộ đọc bị báo "ngoài vùng
  phủ". Nay viết dạng `.../**`.

## Sửa đổi vòng 6 (2026-08-22)

- **AC-6 — `Đ.` là Đường, không phải đồng.** Bản vá vòng 4 mở dấu tiền `đ` thành không phân
  biệt hoa thường, và kéo theo mọi địa chỉ mang `Đ.`/`Đ` vào luật tiền: đo thật
  `Số 5 Đ. Lê Lợi` → "số năm **đồng**. lê lợi" với `ok=True`. Hai lớp canh đều mù đúng theo
  thiết kế — hậu kiểm không còn chữ số nào để bắt, luật quan hệ thì thấy đúng chữ "đồng" vừa
  bị tiêm vào nên tự xác nhận mình. Vá ở **từ điển viết tắt địa chỉ** (nơi `Q.`, `P.`, `TP.`
  đã sống) chứ không phải ở luật tiền, vì lớp đó chạy trước và tiêu thụ dạng địa chỉ trước
  khi luật tiền kịp thấy. `has_money` cũng bỏ dạng địa chỉ trước khi soi.
- **AC-7 — phép quét tất định phải phủ MỌI bộ đã khai.** `ALL_CORPUS` tự xưng "toàn bộ
  corpus" nhưng chỉ gom 4 trong 11 bộ; mọi ma trận thêm ở vòng 4–6 nằm ngoài phép quét trong
  khi tiêu đề vẫn tuyên phủ hết. Nay gom đủ, và có phép đo tự đỏ khi ai đó thêm bộ mới mà
  không ghi danh.
- **AC-16 — đo TỪNG khoá, không đếm ≥1.** Bản đầu của E18 khẳng định "không dòng nào dùng
  dạng thay thẳng" cộng "có ít nhất một dòng dùng mỏ neo" — điểm-case khoác áo lớp. Nay đi
  qua từng khoá executor nhắc engine, và báo số khoá đã soi để trường hợp tụt về 0 không đọc
  thành thành công.

## Sửa đổi vòng 7 (2026-08-22)

- **AC-6 — mã ISO tiền không phân biệt hoa thường.** `VND`/`VNĐ` là hai mỏ neo cuối còn
  phân biệt hoa thường, nên với chữ thường **luật quan hệ tắt hẳn** (`has_money` trả False).
  Đo thật: ba trong bốn cách viết vẫn đọc đúng — nhưng chỉ nhờ thư viện tình cờ xử được, không
  nhờ mỏ neo nào; ca thứ tư `Giá 2 triệu vnđ` → "giá hai triệu **vnđ**" với `ok=True`. Hạng
  của lỗi là **hàng rào bị vô hiệu trên cả một lớp**, không phải "vài ca sai".
- **AC-10 — cảnh báo thu hẹp về luồng tiếng Việt** *(owner 2026-08-22)*. Cảnh báo "thiếu bước
  đọc-thành-chữ trước giọng đọc" trước đây bắn cho **mọi** node giọng đọc ở **mọi** ngôn ngữ,
  trên cả ba bề mặt và không tắt được — nên người dựng luồng tiếng Anh/Trung/Nhật/Hàn bị bảo
  chèn một node đọc số **tiếng Việt**. Nay im lặng khi node giọng đọc **khai** một ngôn ngữ
  khác. Phát biểu là "khai ngôn ngữ khác", **không** phải "khai tiếng Việt": trường `language`
  là tuỳ chọn và phần lớn luồng tiếng Việt không đụng tới nó, nên đọc "chưa khai" thành
  "không phải tiếng Việt" sẽ âm thầm bỏ bảo vệ đúng nhóm người cần nó. Không cần đổi ABI: ba
  trong bốn slot đã có sẵn `language`; slot thứ tư không có nên luôn tính là chưa rõ.

## Sửa đổi vòng 8 (2026-08-22)

- **AC-10 — sửa lại việc thu hẹp của vòng 7.** Bản thu hẹp trước tắt cảnh báo cho **mọi**
  node `text-gen-speech-preset`, vì node đó tự ghi `language` lúc mount từ giọng mặc định
  ("Chinese"), và danh mục giọng **không có giọng tiếng Việt nào**. Người dùng chưa hề chọn
  gì. Nay chỉ những slot mà `language` là **khai báo của người dùng** (`clone`, `instruct`)
  mới được thu hẹp; slot preset nằm trong `SPEAKER_DERIVED_LANGUAGE_SLOTS` và **luôn cảnh
  báo**. Khai trong ABI là điều kiện cần, không phải điều kiện đủ.
  *Ghi rõ vì sao lọt: chữ ký vòng 7 dựa trên báo cáo của máy rằng "3/4 slot đã có trường
  `language`" — đúng về ABI, nhưng chưa ai kiểm **giá trị thực tế chạy vào đó**. Phép đo lúc
  ấy luôn tự đặt `language`, chưa lần nào đi qua đường mount. Nay có ca đo chạy đúng đường đó,
  và lý do loại trừ được ghim bằng hai khẳng định về danh mục giọng, nên nếu ai thêm giọng
  tiếng Việt thì phép đo đỏ và buộc xem lại — thay vì lý do mục nát êm ru trong một comment.*

## Sửa đổi vòng 9 (2026-08-25) — GỠ việc thu hẹp cảnh báo

- **AC-10 trở lại KHÔNG điều kiện.** Hai lần thu hẹp (vòng 7, vòng 8) đều **thất bại theo
  chiều mở** trên chính luồng chúng phải bảo vệ, và cả hai lần bộ kiểm vẫn xanh. Nguyên nhân
  gốc, đo được ở vòng 9: **sản phẩm không có chỗ nào để người dùng khai tiếng Việt.** Danh mục
  `LanguageSelect` có 11 mục — Auto, Chinese, English, Japanese, Korean, German, French,
  Russian, Portuguese, Spanish, Italian — **không có tiếng Việt**; danh mục giọng preset chỉ
  Trung/Anh/Nhật/Hàn. Mặc định plugin là `"Auto"` cho clone và `"Chinese"` cho preset/instruct.
  `"Auto"` nghĩa là *tự dò ngôn ngữ của văn bản* — đúng ca tiếng Việt — nhưng mọi luật lọc đọc
  nó thành "đã khai ngôn ngữ khác" rồi im lặng.
  *Không tồn tại tín hiệu để thu hẹp cho đúng, nên luật thu hẹp bị gỡ hẳn. Ồn ào vì cảnh báo
  cho luồng không phải tiếng Việt là cái giá RẺ HƠN: nó nhìn thấy được, còn một cảnh báo bị
  tắt thì không.*
- **Điều kiện mở lại:** danh mục có mục tiếng Việt **và** phép đo lấy giá trị từ **danh mục
  sản phẩm** thay vì từ chuỗi viết tay. Cả hai vế đã ghim bằng phép đo: thêm mục tiếng Việt là
  test đỏ, dựng lại luật thu hẹp là 44 ô đỏ (11 ngôn ngữ × 4 slot).
  *Bài học ghi thành cơ chế, không ghi thành lời nhắc: `LANGUAGES` nay được export để bộ kiểm
  rút giá trị từ đúng thứ người dùng bấm. Cả hai lần hỏng trước đều xanh vì phép đo tự gõ
  chuỗi ngôn ngữ và chưa lần nào dùng `"Auto"`.*

## Sửa đổi vòng 11 (2026-08-25)

- **AC-6 — `Đ` trần trước từ viết hoa nay TỪ CHỐI, không đoán.** Luật `STREET_PATTERN` thêm ở
  vòng 6 nhận cả dạng **không dấu chấm**, nên `Giá 1.999.000 Đ Bao gồm VAT` đọc thành
  "…nghìn **đường** bao gồm…" với `ok=True`, và `has_money` trả False nên luật quan hệ mất-chữ-tiền
  **tắt luôn**. Đo thật; hồi quy do chính bản vá vòng 6, mà comment lúc đó chỉ khai giới hạn cho
  chữ VIẾT HOA TOÀN BỘ.
  *Đo được rằng hai ca **không tách được bằng hình dạng**: `Nhà 12 Đ Trần Phú` (địa chỉ) và
  `Chỉ 500 Đ Thôi` (giá) giống hệt nhau — số, khoảng trắng, `Đ`, khoảng trắng, từ viết hoa.
  Nên: dạng **có dấu chấm** (`Đ.`/`đ.`) vẫn đọc "đường" vì `Đ.` không bao giờ là dấu tiền; dạng
  **trần** thành `residual` và `ok=False`. Đây là nguyên tắc của hợp đồng follow-up áp cho một ca
  hợp đồng gốc đã sở hữu: giữa từ chối và đọc sai, chọn từ chối — câu bị chặn thì người dùng thấy,
  giá đọc thành tên đường thì không.*
  **Đánh đổi khai rõ:** `Nhà 12 Đ Trần Phú` trước đây đọc đúng thành "đường", nay bị từ chối.

- **AC-16 — phép đo không được chọn chủ thể bằng thứ nó đang đo.** `E18` tuyên soi cả lớp khoá
  executor, nhưng chọn chủ thể bằng `grep 'vietnormalizer'` — mà sau khi gộp nguồn về
  `scripts/lib/sdk-version.sh`, từ đó **chỉ còn nằm trong chính thông điệp mỏ neo** nó đi kiểm.
  Khoá nào mất mỏ neo cũng mất luôn từ khoá nên không bị soi: phép đo **không thể đỏ** trên đúng
  hồi quy nó tuyên bắt. Chiều đỏ cũ "qua" chỉ vì cách phá tình cờ để lại từ đó.
  *Nay chọn theo **bài kiểm có import bộ đọc thật** — tính chất của chủ thể, không đổi được bằng
  cách sửa mỏ neo. Quá trình làm cho bộ chọn đúng lộ ra ba lần chọn sai liên tiếp: theo tên khoá
  (61 khoá, thừa 49), theo tên file bỏ sót thư mục, theo tên slot kéo nhầm hai tính năng khác.
  Số thật là **9 khoá**, không phải 12 như từng tuyên — "12" chưa bao giờ đúng lớp.*

## Sửa đổi vòng 13 (2026-08-26) — GỠ HẲN luật đường

- **AC-6 — cả họ `<số|đơn vị lớn> đ[.] <từ>` nay TỪ CHỐI, không đoán.** Ba luật liên tiếp thử
  tách "giá" khỏi "địa chỉ", mỗi luật dựa trên một tín hiệu hoá ra không tồn tại: **chữ hoa**
  (vòng 6), **dấu chấm** (vòng 11), **chữ hoa sau dấu chấm** (vòng 13). Dấu chấm là bài học sắc
  nhất — nó là **dấu kết câu** cũng thường như dấu viết tắt.
  *Đo thật ở vòng 13, đều `ok=True`: `Giá 500 đ. Bao gồm VAT` → "giá năm trăm **đường** bao
  gồm…", `Tổng cộng 1.999.000 đ. Thanh toán khi nhận hàng` → "…nghìn **đường** thanh toán…";
  và chiều ngược lại `Số 5 đ. lê lợi` (tên đường viết thường) → "số năm **đồng**. lê lợi".*
  Tiếng Việt dùng **đúng cùng một hình dạng** cho giá và cho địa chỉ; chỉ **nghĩa** mới tách
  được. Nên bộ đọc từ chối cả họ.
- **Vẫn đọc bình thường** khi không có gì phía sau làm dấu tiền nhập nhằng: kết chuỗi
  (`Giá 500 Đ`), trước dấu phẩy (`2 tỷ đ, view sông`), trước dấu gạch chéo (`Đ/THÁNG`), hoặc
  viết đủ chữ (`125.000 ĐỒNG`, `2 triệu vnđ`).
- **Đánh đổi khai rõ:** `Số 5 Đ. Lê Lợi` trước đọc đúng thành "đường", nay bị từ chối. Đó là
  giá đã khai để không còn ca nào đọc sai. Địa chỉ không phải đầu vào chính của slot này; giá
  thì có.

## Sửa đổi vòng 15 (2026-08-26)

- **AC-6 — tập đơn vị lớn thiếu "trăm" và "chục".** Hai từ rất thông dụng vắng mặt khỏi hằng
  dùng chung, nên **cả ba lớp cùng trượt**: tiền xử lý không viết lại, `has_money` trả False
  nên luật quan hệ không chạy, và luật nhập nhằng cũng không khớp. Đo thật: `Giá 5 trăm đ` →
  "giá năm trăm **đ**" với `ok=True`, tức ký hiệu tiền đi thẳng tới giọng đọc dưới dạng chữ cái
  trơ. Đúng lớp lỗi mà chính hằng này ra đời để đóng ở vòng 5, chỉ khác phần tử.

## Sửa đổi vòng 15b (2026-08-26) — RÚT plugin khỏi danh sách chính thức

- **AC-13 đảo chiều: plugin phải VẮNG mặt trong manifest.** Kho mà `origin` trỏ tới —
  `github.com/phanlemanh/oneflow-api-normalize-text-vi` — **không tồn tại công khai**; ba kho
  anh em đều phân giải được, riêng kho này 404. Nghĩa là plugin **không cài được ở bất kỳ máy
  nào khác**, và link trong ba README là link chết.
  *Điều đáng sợ hơn: hai guard của chính tính năng này vẫn XANH, vì trên máy phát triển có một
  thư mục `plugins/` cục bộ không theo dõi git — và guard đó tự khai bằng chứng chống lại mình
  bằng dòng `plugin_commit_sha: local-tree-not-a-repo`, tức bằng chứng không trỏ tới bản sửa
  đổi nào. Mười lăm vòng với 27 ô đều xanh không phát hiện được, vì bộ đo hỏi "mã có làm đúng
  thứ hồ sơ nói không" chứ không hỏi "thứ này có tồn tại ngoài máy tôi không".*
  Guard nay **ghim trạng thái đã rút**: đăng ký lại mà chưa xuất bản kho thì đỏ. Ô năng lực
  trong ba README hạ từ ✅ xuống ⬜ — năng lực chưa có mặt khi chưa plugin chính thức nào mang nó.
  **Đổi lại:** node vẫn chạy được qua Director trên máy đã cài plugin; hồ sơ không còn tuyên
  nó là plugin chính thức.

## Sửa đổi vòng 17 (2026-08-26)

- **AC-5 — dãy số ngăn bằng dấu phẩy không phải số thập phân.** Luật phẩy thập phân viết ở
  vòng 4 (cho giá `1.999.000,50`) bắn trên **mọi** cặp `số,số`, nên một liệt kê bình thường
  thành chuỗi thập phân với `ok=True`. Đo thật: `Chọn đáp án 1,2,3` → "một **phẩy** hai **phẩy**
  ba"; `Ngày 1,2 tháng 3` → "ngày một phẩy **ngày** hai tháng ba". Không chữ số, dấu tiền hay
  token nhập nhằng nào sót nên **mọi lớp canh im lặng**.
  *Nay bắt cả **chuỗi** (`\d+(,\d+){2,}`) trước khi luật thập phân kịp thấy — chặn theo bên
  phải một dấu phẩy là không đủ, dấu cuối của `1,2,3` vẫn lọt ("một, hai **phẩy** ba").*
  **Giới hạn khai rõ:** một dấu phẩy đơn (`Bước 1,2`) vẫn đọc là thập phân — nó thật sự nhập
  nhằng, và nghiêng về thập phân giữ nguyên mọi cách đọc giá, thứ slot này sinh ra để phục vụ.

## Known limits
- **THU PHẠM VI dấu phẩy** *(owner chọn đường "thu phạm vi" 2026-08-27, sau khi vòng 18 lại
  sinh đúng lớp lỗi của vòng 17)*. Reader nay khai một BẢNG các dạng dấu phẩy nó đọc được, và
  **TỪ CHỐI** hai dạng còn lại thay vì đoán: dãy mà mọi nhóm đều đúng ba chữ số
  (`1,000,000` · `100,200,300` — dấu nghìn kiểu Anh và liệt kê viết giống hệt nhau) và một
  nhóm từ ba chữ số trở lên (`1,000` · `3,14159`). Đổi lại: `Giá 1,000 VND` trước đây đọc
  ĐÚNG — nhưng đúng do thư viện đoán, không do luật nào bảo đảm — nay bị từ chối. Phần lẻ có
  số 0 đứng đầu đọc đúng trở lại (`7,05%` → "bảy phẩy không năm"; trước đó ra "bảy phẩy năm",
  tức 7,5%). *(đường (a) — kiểm nghĩa bằng cách đọc ngược đầu ra thành số rồi so với số đầu
  vào — để lại thành hợp đồng follow-up)*
- **Ô E17a/E17b đo trên cây plugin CỤC BỘ, không phải bản đã xuất bản.** Kho công khai chưa
  tồn tại nên phép đo không trỏ được tới bản sửa đổi nào — chính nó khai
  `plugin_commit_sha: local-tree-not-a-repo`. Bằng chứng này **không tái lập được** ở máy khác.
  *(mở lại khi kho được xuất bản — hợp đồng follow-up)*
- **Ngày viết kiểu Mỹ hoặc ngày không tồn tại** (`ngày 12/25/2026`, `ngày 32/8/2026`) đọc sai và
  **mất một thành phần của ngày**, vẫn `ok=True`. Chữ "ngày" bị xoá trước mọi token khớp hình
  dạng ngày, dựa vào giả định thư viện sẽ thêm lại — chỉ đúng khi nó parse được. Ngày Việt hợp
  lệ vẫn đọc đúng. *(owner triage 2026-08-26 → hợp đồng follow-up AC-9)*
- **Dấu gạch chéo còn sót không bị tính là chưa-đọc-được**: `Giá 50.000 đ/kg` → "…đồng**/kg**",
  `Lãi 5%/năm` → "…phần trăm**/năm**", `ok=True`. Đây cũng là cơ chế khiến mục trên im lặng —
  thứ thư viện bỏ lại là `/`, không phải chữ số, nên hậu kiểm mù. *(→ follow-up AC-10)*
- **Cảnh báo thiếu bước đọc-thành-chữ có thể tắt nhầm** ở đồ thị mà node giọng đọc nhận cả
  audio lẫn text: phép dò tổ tiên không xét cổng vào, nên reader nằm trên nhánh audio cũng dập
  cảnh báo cho nhánh text. *(owner triage 2026-08-26)*
- **Thông điệp của ba script canh còn tiếng Việt** trong khi các script anh em đều tiếng Anh —
  chỉ hiện cho lập trình viên khi chạy kiểm nội bộ, không lên sản phẩm. *(→ PR dọn dẹp)*
- **Bài kiểm đối chiếu giao diện ↔ máy chủ dùng dữ liệu mẫu viết tay**, không rút từ luồng xuất
  thật; nếu cách luồng thật gửi dữ liệu đổi, bài kiểm này vẫn xanh. *(owner triage 2026-08-26)*
- **Tên thương hiệu chữ La-tinh viết hoa lẫn bị băm** *(owner 2026-08-22: khai giới hạn, mở
  hợp đồng sau)*. Thư viện đọc `VNDirect` thành "ndi re", rồi đọc lại lần nữa thành "di re" —
  sai ngay từ lần đầu và **vi phạm AC-7** (idempotent). Phạm vi đo được: đúng token đó;
  `VNDS` không sao. Phép đo thương hiệu cũ chỉ khẳng định "không có chữ đồng" nên nó xanh suốt
  trong khi tên riêng bị băm. Khai bằng `IDEMPOTENCE_EXCLUDED` có tên + lý do, kèm một phép đo
  **tự đỏ nếu giới hạn này lành** mà hợp đồng chưa cập nhật. Vá đúng cần cơ chế giữ chỗ quanh
  lời gọi thư viện — là tính năng riêng, thuộc hợp đồng **"chống đọc sai êm ru"**.
 (chốt ở Cổng 2 vòng 3, owner 2026-08-21)

Ba lỗi đọc dưới đây là **thật, đo được**, và được owner chốt là **không sửa trong vòng
này** — mở hợp đồng riêng. Chúng nằm ngoài chữ của AC-2…AC-8 nhưng cùng một lớp với chúng:
*đọc sai nội dung mà vẫn `ok=True`*. Ghi ở đây để tính năng ship với rủi ro **có tên**, không
phải rủi ro ngầm.

- **Câu có URL bị nuốt, `ok=True` với chuỗi rỗng hoặc cụt.** Thư viện pin xoá thẳng URL và
  lớp hậu kiểm chỉ soi *token còn sót* + *mất từ chỉ tiền*, nên xoá sạch nội dung thoả cả hai.
  Đo: `normalize_vi('https://tongflow.com/gia')` → `ok=True, text=''`;
  `'Xem tại https://tongflow.com/gia'` → `text='xem tại'`. Hậu quả: TTS đọc một câu rỗng
  hoặc cụt trong khi cả workflow báo thành công. *Hướng đóng: luật quan hệ cùng hình dạng
  với luật tiền — vào không rỗng thì ra không được rỗng.*
- **`_RANGE` ăn mọi `số-gạch-số`, không chỉ khoảng giá.** `ISO 2026-08-19` →
  "…hai mươi sáu **đến** tám **đến** mười chín"; `0901-234-567` → đọc thành ba số đếm **và
  mất số 0 đầu** (cùng số viết liền thì đọc đúng từng chữ số). Cả hai `ok=True`, và hậu kiểm
  không thể bắt vì chữ số đã biến mất thật.
- **Corpus AC-4 tuyên quét lớp từ điển nhưng chỉ có điểm-case.** 6/11 mục
  (`TPHCM`, `TP.HN`, `CMND`, `CCCD`, `BĐS`, `TT.`) và đơn vị `kg`, dạng `m²` không có ca nào
  — xoá mục đó khỏi từ điển thì mọi test vẫn xanh, nên chiều đỏ mà `E4` tự khai chỉ đúng với
  5/11 mục. *Đây là lỗ của phép đo, không phải của mã.*

**Đã sửa ngay tại Cổng 2 vòng 3 (không để lại):** dải giá **viết cách** mất chữ "đến"
(`1.000 đ-2.000 đ`, `1.000 ₫ - 2.000 ₫`, `1.000 đồng - 2.000 đồng` đều `ok=True`) — lỗi do
chính bản vá nâng-phạm-vi ở Cổng 2 vòng 2 gây ra: `_SPACED_DONG` chạy trước `_RANGE` nên phá
mất mỏ neo `đ`. Nằm đúng giao của AC-5 ("kể cả có khoảng trắng quanh dấu gạch") và AC-6
("dấu hiệu `đ` tính cả dạng có khoảng trắng"), nên là **trong** hợp đồng.

**Giới hạn của trang proto, không phải của node:** `/proto/[slug]` mount `ReactFlow` mà không
nạp `@xyflow/react/dist/style.css`, nên handle và edge **có trong DOM nhưng vô hình trong
ảnh** — đó là toàn bộ lý do `E16` trả UNCERTAIN/FAIL hai vòng liền. Đã vá bằng một dòng
import ở component proto; bằng chứng trước/sau ở `evidence/gate2-e16/`.

## Luật dừng vòng verify (khai TRƯỚC vòng 5, owner 2026-08-21)

Bốn vòng đã chạy; hai vòng gần nhất đều **0 eval đỏ, 0 lệnh đỏ, 0 BLOCKED** — phần "mã có
làm đúng thứ hồ sơ nói không" đã hội tụ. Cái chưa hội tụ là **lằn review**: mỗi vòng, người
soát context-sạch trên gần-cùng-một-cây vẫn tìm ra ~2 ca đọc-biên mới, vì không gian đầu vào
của một bộ đọc tiếng Việt là vô hạn thực tế. Đó là một bộ **sinh**, không phải một hàng đợi
cạn dần — nên điều kiện dừng phải do người đặt, không thể chờ nó tự hết.

**Luật cho vòng 5 và về sau:**

- Finding chỉ ra **một mệnh đề AC đang bị vi phạm** → sửa trong vòng, như từ trước tới nay.
- Finding chỉ ra **một ca đọc-biên MỚI chưa AC nào hứa** → **không** mở vòng mới: ghi vào
  hợp đồng follow-up **"chống đọc sai êm ru"** (đã có sẵn hai mục từ vòng 3: URL nuốt câu ·
  `_RANGE` ăn mọi `số-gạch-số`), owner quyết bằng triage tại Cổng 2.
- Finding về **phép đo** (corpus tuyên lớp mà chỉ có điểm-case, test không đo thứ nó tên) →
  sửa trong vòng: đây là loại lỗi làm mọi vòng sau mất giá trị.

Lý do viết luật này ra: nếu không, mỗi vòng verify vừa là phép đo vừa là nguồn phạm vi mới,
và vòng lặp không có đáy — đo được ở chính hồ sơ này: hợp đồng đã nhận 2 lần nâng phạm vi và
6 amendment trong ba ngày, nên "finding trong hợp đồng" ở vòng sau một phần là hệ quả của
chữ vừa viết ở vòng trước, chứ không phải sản phẩm tệ đi.
