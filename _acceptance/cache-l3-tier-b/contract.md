---
schema_version: 1
feature: Cache L3 — tier B, per-workflow memo for nondeterministic slots
slug: cache-l3-tier-b
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk, api]
status: signed-off
approved_by: Manh
approved_at: 2026-07-30
time_human_minutes: {gate1: 10, gate2: 15}
---

# Acceptance Contract: cache-l3-tier-b

## Context

Tầng B đóng nốt kịch bản tham chiếu §4 của [spec cache](../../docs/spec/prd/engine-cache-partial-rerender.md): đổi giá → node overlay (tầng A) chạy lại vài giây CPU, còn **node sinh video không chạy lại** — bản nó đã sinh cho workflow này còn trong cache. Ngữ nghĩa D3 giữ nguyên: *"input không đổi → dùng lại đúng cái bạn đã tạo ra"*, không phải "cùng input → cùng output".

Thiết kế: [2026-07-30-cache-l3-tier-b-design.md](../../docs/superpowers/specs/2026-07-30-cache-l3-tier-b-design.md). Bốn quyết định định hình:

1. **`nodeId` VÀO khoá** (Manh 30/07): "cái đã tạo ra" tính theo từng node — nhân đôi node sinh ảnh phải sinh mới; đổi giá thì node gen giữ nguyên input vẫn trúng.
2. **Khoá thêm `workflowScope`** (`null` cho tầng A — mọi thành phần phát vô điều kiện, giữ bất biến L1; `"wf:<id>:node:<id>"` cho tầng B), **`KEY_SCHEMA_VERSION` 2 → 3** khi entry chỉ mới tồn tại trên máy dev.
3. **`TIER_B_SLOTS` = đúng 23 slot có núm** (`seed`/`temperature`/`top_p`), dẫn xuất một lần từ ABI rồi ghim thành hằng; nhóm sinh-nội-dung-không-núm descope có revisit.
4. **Gộp fix `plugin_is_dirty` fail-open** — Known limits của L2 đánh dấu là ứng viên sửa đầu tiên; L3 đằng nào cũng sửa `node_cache.py` nên không tốn thêm chữ ký.

**Chi phí ký lại, báo giá NGAY tại Cổng 1** (bài học L2 phát hiện muộn `conformance-l0`): L3 sửa `fingerprint.py` (→ `cache-l1-fingerprint` ký lại), `node_cache.py` + `runner.py` + `engine-delegate.server.ts` + `__main__.py` + test files (→ `cache-l2-store` ký lại; `runner.py`/`engine-delegate.server.ts` cũng thuộc sở hữu gốc của `conformance-l0` → ký lại lần nữa). Ba chữ ký kèm PR này.

## Criteria

**Kế thừa nguyên văn hai quy tắc chung của L2** (contract `cache-l2-store`, mục `## Criteria`): (1) mọi so sánh hai khoá phải ép cả hai vế là chuỗi khác `None`, 64 hex thường — ngoại lệ duy nhất là tiêu chí mà không-cacheable *là* kết quả đúng; (2) mọi tiêu chí "không cacheable" kiểm **cả hai chiều** — không đọc và không ghi.

- AC-1: Given workflow hai node `image-gen-video`(tầng B) → `concat-videos`(tầng A) đã chạy với `workflow_id` và `tenant` hợp lệ, When chạy lại y hệt cùng `data_dir`/`workflow_id`, Then invoker **0 lần** cho CẢ hai node và outputs byte-identical (chuẩn hoá duy nhất cho handle đục của store, kế thừa AC-1 của L2). *Kịch bản §4 thu nhỏ, nửa "trúng": tầng B trúng CÙNG tầng A trong một run trộn.*
- AC-2: Given workflow ở AC-1 đã ấm, When đổi một input của **node tầng A hạ nguồn** rồi chạy lại, Then node tầng B **0 lời gọi** (bản sinh được giữ) và node tầng A chạy lại đúng 1 lần. *Đây là toàn bộ mệnh đề kinh tế: sửa phần rẻ không kéo sinh lại phần đắt. Nếu khoá tầng B vô tình nuốt input của node khác (khoá theo mức workflow thay vì per-call), tiêu chí này đỏ.*
- AC-3: Given cùng tenant, cùng input, cùng `nodeId`, nhưng **`workflow_id` khác nhau**, When chạy workflow thứ hai, Then invoker **vẫn được gọi** cho slot tầng B và hai entry riêng tồn tại. *Memo theo workflow nghĩa là bản sinh của workflow này không phục vụ workflow kia — dùng chung `data_dir` là điều kiện bắt buộc của ca kiểm, như AC-9 của L2.*
- AC-4: Given một workflow có **hai node tầng B khác `nodeId`** mang input giống hệt nhau, When chạy, Then invoker được gọi cho **cả hai** và hai entry riêng tồn tại. *Quyết định nodeId-vào-khoá: nhân đôi node để mong biến thể phải sinh mới. Nếu khoá bỏ nodeId, tiêu chí này đỏ — nó là guard trực tiếp của quyết định 30/07.*
- AC-5: Given task **không có `workflow_id` dùng được** — field vắng, `None`, chuỗi rỗng, hay chỉ toàn khoảng trắng (bốn ca kiểm riêng; cổng tầng B khoá theo chuỗi KHÔNG rỗng, không theo sự hiện diện của field), When chạy hai lần một workflow chứa slot tầng B và slot tầng A, Then slot tầng B **không đọc không ghi** (cả hai chiều, cả hai lần invoker gọi đủ) còn slot tầng A **vẫn cache bình thường**. *Fail-closed có phạm vi: thiếu scope tầng B chỉ tắt tầng B — tắt cả tầng A là phạt nhầm.*
- AC-6: Given hằng số `TIER_B_SLOTS`, When kiểm nội dung, Then nó bằng đúng 23 slot có núm liệt kê trong design §3 **và** `TIER_A_SLOTS ∩ TIER_B_SLOTS = ∅` **và** nhóm sinh-nội-dung-không-núm (`gen-text`, `image-describe`, `video-describe`, `audio-describe`, `music-brief`) **không** thuộc list nào. *Một slot ở cả hai tầng là hai ngữ nghĩa cache cho một phép tính; slot descope lọt vào là mở rộng scope không qua gate.* **Và** When test đọc `config/tongflow.abi.json` lúc chạy test (không phải lúc runtime — giữ nguyên luật không-suy-lúc-chạy), Then {slot có `seed`/`temperature`/`top_p`} ⊆ `TIER_B_SLOTS` ∪ {tập descope tường minh} và giao với `TIER_A_SLOTS` rỗng. *Gap-probe P1: so hằng với literal thiết kế là tự-xác-nhận — một slot có núm bị sót lúc dẫn xuất 30/07 mà đang nằm ở TIER_A sẽ được cache chéo workflow như thể tất định; guard này biến cả ABI-thêm-slot tương lai thành test đỏ thay vì phân loại sai âm thầm.*
- AC-7: Given khoá tầng A ở v=3, When so payload với v=2, Then thành phần `workflowScope` phát **vô điều kiện** bằng `null` cho tầng A (không phải vắng field), và hai input y hệt chỉ khác tầng cho khoá khác nhau. *Giữ bất biến L1 "mọi thành phần phát vô điều kiện, không có trục absence-collision"; đồng thời chứng minh v=3 thật sự đổi khoá tầng A (invalidation có chủ đích, R6).*
- AC-8: Given thư mục plugin có `.git` nhưng `git status --porcelain` **exit khác 0** (mô phỏng index hỏng/lỗi quyền), When chạy hai lần, Then coi là **dirty** — không đọc, không ghi, invoker gọi đủ cả hai lần. *Fix fail-open gộp từ Known limits của L2: rev đọc được mà độ bẩn không biết được thì code đã-sửa bị cache dưới khoá rev-sạch — hiểm hoạ R1. Chiều fail phải khớp mọi đường lỗi khác của file: về phía tắt cache.*
- AC-9: **(cross-layer)** Given `runner.ts` xử lý task workflow có `task.workflowId`, When dựng request qua `engineOptionsFor`, Then `options.workflow_id` là chuỗi số đó; và given task không thuộc workflow nào, Then `options.workflow_id` là `null` — **không bao giờ** là chuỗi rỗng; **và** given engine nhận `options.workflow_id` qua bridge NDJSON, Then giá trị tới được `run_workflow` (kiểm qua đúng đường bridge, hai nửa đo riêng như AC-14 của L2). *Cùng lớp bug dịch-thuật vô-hình-tới-lúc-hỏng đã có tiền lệ; seam `engineOptionsFor` của L2 tái dùng nên mutation xoá dòng `workflow_id` phải làm eval TS đỏ.*
- AC-11: Given cùng `workflow_id`, cùng `nodeId`, cùng input, **khác `tenant`**, dùng chung một `data_dir`, When tenant thứ hai chạy, Then invoker **vẫn được gọi** cho slot tầng B và hai entry riêng tồn tại. *Gap-probe P0: AC-9 của L2 chỉ đo tenant ở khoá tầng A — tầng B chưa tồn tại lúc đó. Không có tiêu chí này, một implementation coi `workflowScope` là duy-nhất-toàn-cục có thể bỏ tenant khỏi nhánh tầng B, và tenant T2 nhân bản workflow giữ nguyên id sẽ nhận video T1 đã sinh — mọi eval khác vẫn xanh vì không eval nào biến thiên tenant trên slot B.*
- AC-12: Given bộ eval của **`cache-l2-store`** (toàn bộ `test_node_cache.py` + vitest `engine-delegate.test.ts`), When chạy lại trên cây L3, Then tất cả pass. *Chữ ký lại của L2 phải đứng trên bằng chứng chạy lại thật — L3 đổi cấu trúc nhánh cache trong `runner.py` nên chính các test "slot ngoài allowlist" của L2 là thứ dễ vỡ nhất.*
- AC-13: Given bộ eval của **`conformance-l0`** (batch/conformance/plugin-rev pytest + 3 file vitest + 2 script guard), When chạy lại trên cây L3, Then tất cả pass. *Cùng lý do — nó sở hữu `runner.py` và `engine-delegate.server.ts`; guard discriminating của nó là bằng chứng ngữ nghĩa fan-out không bị cache branch làm lệch.*
- AC-14: Given một node tầng B chia lô có **≥2 `call_params` giống hệt nhau** (người dùng xin N biến thể cùng prompt), When chạy, Then plugin được gọi **một lần cho mỗi call** — thứ tự call (ordinal) tham gia `workflowScope` của lời gọi tầng B trong batch. *Gap-probe P1: per-call fan-out của L2 viết cho tầng A tất định, nơi gộp call trùng là ĐÚNG; ở tầng B nó đảo ngược đúng kỳ vọng mà AC-4 bảo vệ — 4 biến thể thành 4 bản y hệt. Nhất quán với quyết định nodeId-vào-khoá: trùng input mà mong khác nhau thì phải sinh riêng. Giá đã nhận: đảo thứ tự item trong batch làm miss (đó là một lần sửa bài, chấp nhận).*
- AC-10: Given vector L1 sinh lại dưới v=3, When chạy toàn bộ `test_fingerprint.py` + `test_fingerprint_vectors.py` gồm guard AC-14 của L1 (bump 3→4 trong bản copy temp), Then tất cả pass và guard đỏ-rồi-xanh đúng chiều. *Chữ ký lại của L1 đứng trên bằng chứng chạy lại thật; AC-12/AC-13 lo hai feature còn lại — ba chữ ký, ba tiêu chí, ba exit code riêng.*

## Amendment (2026-08-07 — sửa lời để lint đọc được, KHÔNG đổi ngữ nghĩa)

AC-9 viết nhãn dạng `- AC-9 **(cross-layer)**: Given …`, tức nhãn nằm **giữa** id và dấu
hai chấm. `eval-coverage-lint.js` khớp tiêu chí theo **từng dòng vật lý** bằng
`^\s*[-*]\s*(AC-\d+)\s*[:.]\s*(.+)$`, nên dòng này không khớp và **rơi khỏi tầm nhìn của
lint hoàn toàn**: W4 — tiêu chí gắn `(cross-layer)` phải có ≥1 eval khai
`layer: backend-effect` — **chưa từng chạy** cho feature này. Nhãn nay chuyển ra **sau**
dấu hai chấm, đúng dạng `compose-overlay` (AC-11/AC-13) và `byo-key-onboarding` đang dùng.
Chữ nghĩa tiêu chí giữ nguyên từng byte; chỉ vị trí nhãn đổi (diff: 1 dòng, 1+/1-).

**Đo lại sau khi sửa (07/08):** W4 im lặng vì cặp eval **thật sự có sẵn** — E10 (AC-9)
khai `layer: backend-effect`, đúng vế "hai nửa đo riêng" mà chính AC-9 viện dẫn từ AC-14
của L2. Vậy đây là lỗ hổng **bảo vệ**, không phải lỗ hổng **bằng chứng**: evals đúng từ
đầu, chỉ là không có gì canh chúng. Bằng chứng Cổng 2 đã ký không bị ảnh hưởng và chữ ký
**không** cần cắt lại. Cùng đợt sửa với `cache-l2-store` (2 dòng) và ba hợp đồng khác có
chú thích amendment nằm sai chỗ tương tự.

## Coverage

Quét CT-S bằng trục của L2 tái dùng có điều chỉnh (L3 là thành phần khoá mới trên cùng cơ chế store, không phải cơ chế mới): **trục A — cổng cacheable tầng B** (ngoài `TIER_B_SLOTS` | thiếu `workflow_id` | dirty-detector lỗi | đủ điều kiện) → AC-5/6/8; **trục B — phạm vi chia sẻ** (cùng wf cùng node | cùng wf khác node | khác wf | khác tenant) → AC-1/4/3/11 — tenant-trên-tầng-B đo TRỰC TIẾP (AC-11), không uỷ thác cho AC-9 của L2 vốn chỉ đo tầng A; **trục C — tương tác hai tầng trong một run** (trộn A+B trúng | A đổi B giữ | B tắt A sống) → AC-1/2/5; **trục D — lược đồ khoá** (null vô điều kiện | v bump | vector) → AC-7/10. Ô "batch tầng B" có AC riêng (AC-14): gap-probe chỉ ra fan-out của L2 viết cho tầng A tất định — gộp call trùng ở tầng B đảo kỳ vọng biến thể.

## Out of scope

- **Eviction / LRU / trần dung lượng / `purge()` / `reuse=` API** — L4.
- **Nhóm sinh-nội-dung-không-núm** (`gen-text`, describes, TTS, `music-brief`) — descope có revisit trong ledger; mở là thêm dòng vào hằng số.
- **Cơ chế "ghim seed để một slot B lên tầng A"** — cần UI + ABI, lát riêng.
- **Không đụng `callog.py`, `scan.py`, `plugins.py`, `store.py`.**
- **`1.1-L2b`** (desktop asset cache) và **`1.1-L1b`** (mime/filename) giữ nguyên hàng đợi.

## Notes

- **Ba chữ ký kèm PR này** (báo giá tại Cổng 1): `cache-l1-fingerprint` (sửa `fingerprint.py`), `cache-l2-store` (sửa `node_cache.py`/`runner.py`/tests), `conformance-l0` (sửa `runner.py`/`engine-delegate.server.ts` — sở hữu gốc). Bảy feature còn lại dự kiến carry-forward theo luật per-file.
- **`image-upscale`/`video-upscale` nằm ở B dù D3 từng minh hoạ upscale-đã-ghim-seed thuộc A** — seed hiện không bị ghim ở đâu; ví dụ của D3 mô tả trạng thái tương lai có cơ chế ghim.
- **Nhóm không-núm chưa cache là tiền thật bỏ lỡ** (gen-text chạy lại khi input không đổi) — revisit sau tiếng nói người dùng đầu tiên.

## Known limits (ghi ở Cổng 2, KHÔNG phải tiêu chí)

- **Tầng B là máy sinh entry mồ côi đơn điệu (L4-a).** Mỗi lần sửa prompt của một node
  tầng B là một entry media-size mới dưới khoá mới; 5 lần sửa = 5 entry, chỉ 1 còn với
  tới được. Chưa có eviction/LRU/trần dung lượng cho tới L4 — trên máy dev điều này chỉ
  tốn đĩa, nhưng L4 phải coi orphan tầng B là dạng rác số một.
- **Kinh tế batch-ordinal (F3).** Ordinal của call trong lô tham gia `workflowScope`,
  nên CHÈN một biến thể vào ĐẦU lô làm mọi call phía sau lệch chỉ số và sinh lại từ vị
  trí đó — thêm-vào-cuối thì rẻ, chèn-vào-đầu thì đắt. Đánh đổi có chủ ý: giữ kỳ vọng
  "N biến thể là N bản khác nhau" (AC-14) quan trọng hơn tối ưu ca chèn giữa.
- **Guard ABI đọc bản copy đóng gói** (`sdk/tongflow/_data/tongflow.abi.json`), không
  đọc `config/tongflow.abi.json` gốc — hai bản được giữ đồng bộ bởi suite check
  `gen:abi` diff-clean, nhưng guard tự nó không chứng minh sự đồng bộ đó.
- **E9 không phân biệt so với baseline (có chủ ý).** Sentinel shape của
  `engineOptionsFor` có từ L2 nên E9 pass cả trên diffBase — nó là regression-guard.
  Guard PHÂN BIỆT cho wiring AC-9 là type system: `workflowId` là tham số bắt buộc của
  `executeWorkflowViaEngine` (xoá wiring = lỗi compile, đã chứng minh TS2554/TS2345),
  và `pnpm typecheck` nằm trong suite của chính round verify này. Nửa hành-vi do E10 lo.
- **`test_node_cache.py` 1101 dòng, vượt trần 800** — tách `test_node_cache_tier_b.py`
  ở L4 (15 executor key ghim node-id theo path, phải sửa cùng commit).
- **Comment `DESCOPED_GENERATIVE_SLOTS` trỏ sai chỗ guard** (guard nằm trong test suite,
  không phải "bên dưới" trong module) — sửa một dòng ở lát kế, không sửa sau verify.
