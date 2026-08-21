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
nằm **ngoài cây mã** — bản 0.2.21 có trên PyPI, và repo plugin đã pin nó. Cả hai là hành động
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
- AC-11: (cross-layer) Given `normalize-text-vi` nằm trong `TIER_A_SLOTS` và một workflow
  2-node (fake plugin tầng B → normalize-text-vi fake tầng A) chạy qua engine, When chạy lần
  2 không đổi gì, Then full hit — 0 lời gọi plugin; When chỉ đổi chuỗi `text` vào, Then node
  tầng B **không** chạy lại và `normalize-text-vi` chạy lại; và guard allowlist hai chiều
  (pinned list + slot tồn tại trong ABI) vẫn xanh sau khi thêm slot.
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
  **0.2.21** (số **derive** từ `pyproject.toml`, không ghi cứng trong script guard; ROOT suy
  từ vị trí script chứ không từ cwd), `vietnormalizer==0.2.3` khai trong `dependencies` với
  pin chính xác; nhánh **trực tuyến** — 0.2.21 đã publish lên PyPI, bản publish chứa
  `NormalizeTextViInput/Output` + `NORMALIZE_TEXT_VI`, repo plugin pin `oneflow-sdk==0.2.21`.
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
