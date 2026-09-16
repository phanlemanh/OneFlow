# Skill system v1 — thiết kế

- **Ngày:** 2026-09-16 · **Hồ sơ:** [`_acceptance/skill-system-v1/`](../../../_acceptance/skill-system-v1/contract.md) · **Hàng kế hoạch:** B5 (★, T3)
- **Nguồn:** [ADR-0002](../../adr/0002-skill-template-orchestrator.md) · thiết kế lát cắt [§3.1 dòng B5](2026-09-04-lat-cat-chung-minh-design.md) · [khảo sát Director §3](../../strategy/research-director-truong-ky-2026-08.md) · cơ hội [`skill-1-footage-kho-clip`](../../../_acceptance/skill-1-footage-kho-clip/opportunity.md) (U2 «một nút»)

> **Định nghĩa bắt buộc (ADR-0013, rủi ro đặt tên):** trong OneFlow, *skill* là một **quy trình
> đóng gói chạy trên engine** — một đồ thị node có sẵn cộng một bảng tham số — **không phải**
> gói hướng dẫn `SKILL.md` của thị trường agent.

## 1. Vấn đề

Hôm nay muốn ra một kết quả, người dùng phải tự dựng đồ thị trên canvas: kéo node, nối cạnh,
chọn plugin, điền ô. Skill #1 của lát cắt (B7, footage → kho clip 9:16) cần 6–7 node — không
người bán hàng nào tự nối được. ADR-0002 đã chốt lời giải: **skill = template ExecutableWorkflow
+ manifest tham số, orchestrator TS ở tầng app, engine giữ nguyên DAG một lượt.** B5 dựng cái
khung đó và chứng minh nó là khung thật bằng một skill thứ hai thêm vào mà không sửa engine.

B5 **không** giao Skill #1 (đó là B7) và **không** cho Director sinh instance (B8).

## 2. Hình dạng

```
src/lib/skills/
  types.ts                 SkillManifest, SkillParam, SkillOutput, SkillTemplate
  registry.ts              danh sách skill đã đăng ký + kiểm toàn vẹn (AC-1)
  params.ts                kiểm tham số → lỗi có mã, theo từng tham số (AC-2)
  instantiate.ts           template + tham số + plugin mặc định → instance (AC-3)
  run.server.ts            nộp lượt chạy, gom kết quả (AC-5, AC-7)
  cat-canh-video/          skill thật thứ nhất  — 1 node split-video (pyscenedetect)
    manifest.ts
    template.json
    sample-params.json     bộ tham số mẫu mà phép đo lặp qua — sống cạnh skill, không trong tệp test
  tach-tieng-video/        skill thứ hai (bằng chứng nền tảng) — 2 node ffmpeg
    manifest.ts
    template.json
    sample-params.json
src/app/api/skills/
  route.ts                 GET  danh sách skill + trạng thái plugin
  [id]/run/route.ts        POST nộp lượt chạy
  runs/[taskId]/route.ts   GET  trạng thái + kết quả đã gom
  runs/[taskId]/plan/route.ts  GET  đồ thị instance cho «xem/sửa kế hoạch»
src/lib/task/runner.ts     thêm nhánh feature === "skill" (tầng app, KHÔNG phải engine)
src/components/workspace/skills/   ngăn skill: danh sách · biểu mẫu · tiến trình · kết quả
scripts/skills/build-template.ts   dựng template.json từ đồ thị bằng exporter thật
```

### 2.1 Manifest (v1)

| Trường | Kiểu | Luật |
|---|---|---|
| `id` | kebab-case ≤ 64 | trùng tên thư mục |
| `version` | semver 3 số | lần chạy ghi version; đổi code giữa lúc nộp và lúc chạy → lỗi có tên |
| `requires` | `NodeSlot[]` | bằng đúng tập slot của template — không thừa, không thiếu |
| `params[]` | `{key, type, required, default?, min?, max?, options?, target}` | `type ∈ text · number · enum · video · image · audio`; `min/max` chỉ cho `number`, `options` chỉ cho `enum`; `target` = `{kind:"input", name}` (nút dữ liệu đầu vào) hoặc `{kind:"config", nodeId, field}` (ô cấu hình của một node) |
| `outputs[]` | `{key, type, from}` | `from` = tên một `WorkflowOutput` của template |
| `sideEffects` | mảng rỗng ở v1 | khai từ v1 để skill sau (ingest ngược media-library) không buộc bump major |

Tên, mô tả, nhãn tham số là **khoá i18n** `Skills.<id>.*` — không chép chữ vào manifest.
Mô tả theo khuôn thị trường «làm gì + khi nào dùng» vì B8 sẽ chọn skill bằng khớp mô tả.

### 2.2 Template

`template.json` = `{ originalFlow: {nodes, edges}, executable }`. **Cả hai sinh bằng exporter
thật** (`scripts/skills/build-template.ts`, đăng ký node ABI như các test exporter đang làm),
không viết tay. Phép kiểm toàn vẹn chạy lại exporter trên `originalFlow` và đòi kết quả khớp
`executable` (bỏ `exportedAt`) — template không trôi khỏi canvas được.

### 2.3 Instantiate — một hàm thuần

`instantiate(manifest, template, params, slotDefaultPlugin)`:

1. Sao sâu template; **template gốc không đổi** (so trước/sau).
2. Mỗi tham số ghi **cùng một giá trị vào hai chỗ**: `executable` (`dataNodes[].staticData`
   cho `input`, `bindings[field] = {kind:"config", value}` cho `config`) và `originalFlow`
   (`node.data` mà canvas đọc).
3. Mỗi node thay `pluginId` bằng plugin mặc định đã cài của slot (cùng nguồn Director đang dùng,
   `vocabulary.server.ts`). Slot không có plugin cài → lỗi `PLUGIN_NOT_INSTALLED` liệt kê slot.

**Canvas = headless do cấu tạo:** phép đo chạy exporter thật trên `instance.originalFlow` và đòi
khớp `instance.executable`, cho MỌI skill đã đăng ký × bộ tham số mẫu. «Xem/sửa kế hoạch» mở
đúng đồ thị mà engine đã chạy.

Đã loại: gọi exporter ngay phía server lúc instantiate. Exporter đọc registry node toàn cục
(`node-registry.ts`, một `Map` theo nodeId) — hai lượt đồng thời có cùng id node sẽ ghi đè
nhau. Ghi-hai-chỗ + phép đo tương đương cho cùng bảo đảm mà không có tranh chấp đó.

### 2.4 Chạy — không thêm bảng, không thêm cột

- `params.ts` xuất tập mã lý do ĐÓNG `SKILL_PARAM_REASONS = [required, type, range, option, unknown]`; máy chủ chỉ trả mã, giao diện dịch mã qua `Skills.invalid.<mã>` — không chuỗi máy chủ nào hiện thẳng cho người dùng.
- `POST /api/skills/<id>/run` → kiểm tham số → instantiate (để bắt thiếu plugin sớm) → giới hạn
  3 lượt đồng thời như `/api/workflow/execute` → chèn `tasks`: `feature:"skill"`,
  `plugin_id:""`, `prompt = {skillId, skillVersion, params}` — **chỉ trường nghiệp vụ**, không
  nhét executable hay routing vào `prompt` (luật wire shape của CLAUDE.md). Trả `{taskId}`.
- Client mở `GET /api/task/wait?taskId=` như mọi task. `runner.ts` thêm nhánh `skill`: đọc
  `prompt`, **instantiate lại** (hàm thuần, tất định) rồi gọi `executeWorkflowViaEngine` có sẵn.
  `skillVersion` lệch với registry → `WORKFLOW_FAILED` mã `SKILL_VERSION_CHANGED`.
- `GET /api/skills/runs/<taskId>` → `{status, skillId, steps, outputs, error}`. `steps` = một phần
  tử `{nodeId, slot, status}` cho mỗi node của instance: `pending`/`running` khi task chưa xong,
  `done` khi xong; khi lỗi, node có tên trong `tasks.error.failures[].nodeId` (engine đã ghi sẵn,
  `error-envelope.ts`) mang `failed`. `outputs` đổi tên cổng engine thành `key` của manifest. Task
  không phải skill → 404.
- Trong lúc chạy, ngăn cập nhật từng bước từ sự kiện SSE có sẵn `NODE_STARTED` / `NODE_COMPLETED`
  / `NODE_FAILED` (mang `nodeId`); mở lại ngăn sau khi tải lại trang thì đọc `steps` từ route trên.
- `GET /api/skills` → danh sách skill, mỗi skill kèm `missingSlots` = các slot trong `requires` không
  có plugin nào cài (đọc registry plugin thật). Giao diện hiện tên BƯỚC của slot đó
  (`Skills.skills.<id>.steps.<slot>`), không hiện tên slot hay id plugin.
- `GET /api/skills/runs/<taskId>/plan` → `{nodes, edges, name}` của instance.

Đã loại: tạo một hàng `workflows` cho mỗi lượt. Nó làm đầy danh sách «Quy trình» của người
dùng bằng bản sao mỗi lần bấm, và buộc một cột provenance mới (`src/db/**`, migration + phép
thử migrator trên DB cũ). Không có hàng workflow, «xem/sửa kế hoạch» dán đồ thị lên canvas
**chưa lưu** — đúng cách Director đang làm; người lưu thì nó thành quy trình thường.

### 2.5 Hai skill

| Skill | Node | Tham số | Vì sao |
|---|---|---|---|
| `cat-canh-video` — Cắt cảnh video | split-video | `video` (input) · `do-nhay` (number → config `threshold`) | bước đầu của Skill #1 (B7); phủ đích `config` |
| `tach-tieng-video` — Tách tiếng khỏi video | extract-audio · remove-video-audio | `video` (input) | **bằng chứng nền tảng:** thêm trong commit riêng chỉ chạm thư mục của nó, một dòng registry, i18n; tại commit cha, khung (registry · instantiate · runner) đã xanh khi chưa có skill này, và không tệp khung nào nhắc id hay slot riêng của nó |

Cả hai chạy trên plugin cục bộ (`oneflow-api-pyscenedetect`, `oneflow-api-ffmpeg`) — không cần
khoá API, không cần Modal.

## 3. Đo ở đâu

Lượt đo chạy trên **không gian riêng**: `TONGFLOW_DATA_DIR` và `TONGFLOW_PLUGINS_DIR` trỏ thư
mục tạm của lượt, máy chủ dev của **cây này** ở một cổng trống (cổng 3000 có thể là máy chủ của
repo khác — gặp 13/09 và lại gặp 16/09). Không phép đo nào đọc hay ghi `data/` của người dùng.
Mục `## Tiền đề` của hợp đồng liệt kê từng trạng thái phép đo giả định và lệnh đặt/trả.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: nút «Skill» ở thanh trái canvas → ngăn skill mở danh sách → chọn skill → biểu mẫu tham số (tải video lên) → «Chạy» → tiến trình → kết quả (xem/tải từng đầu ra) (điểm ra: đóng ngăn, hoặc «Xem/sửa kế hoạch»)
- Biên: skill thiếu plugin cài → thẻ skill mang nhãn «Cần cài plugin cho bước: …» và không mở biểu mẫu chạy được; đang có 3 lượt chạy → báo bận, giữ nguyên tham số đã điền
- Lỗi & quay lại: tham số sai (máy chủ trả) → ô đó đỏ kèm câu lý do, giữ các ô khác · lượt chạy lỗi → màn kết quả báo lỗi bằng lời sản phẩm + «Chạy lại» (giữ tham số) · «Quay lại» ở mọi bước về bước trước, không mất giá trị đã điền

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách skill | chọn việc muốn làm | nút «Skill» / biểu mẫu |
| Biểu mẫu tham số | điền đủ đầu vào để chạy | danh sách / tiến trình |
| Tiến trình | cho biết lượt đang chạy tới đâu | biểu mẫu / kết quả |
| Kết quả | nhận đầu ra | tiến trình / đóng ngăn hoặc canvas |
| Xác nhận thay canvas | không mất đồ thị đang có ngoài ý muốn | kết quả / canvas |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danhsach-mac-dinh | Danh sách skill | thẻ skill: tên + mô tả «làm gì · khi nào dùng» | chọn một skill |
| ST-danhsach-thieu-plugin | Danh sách skill | thẻ mờ + nhãn «Cần cài plugin cho bước: <tên bước>» | mở quản lý plugin / chọn skill khác |
| ST-danhsach-dang-tai | Danh sách skill | khung xương ba thẻ | chờ |
| ST-bieumau-chua-du | Biểu mẫu tham số | ô bắt buộc có dấu *, «Chạy» vô hiệu | điền |
| ST-bieumau-dang-tai-len | Biểu mẫu tham số | thanh tải video + tên tệp, «Chạy» vô hiệu | chờ / huỷ tải |
| ST-bieumau-loi-tham-so | Biểu mẫu tham số | ô sai viền đỏ + câu lý do dịch từ mã máy chủ trả | sửa ô |
| ST-bieumau-ban | Biểu mẫu tham số | thông báo «Đang có 3 lượt chạy — chờ một lượt xong» | chờ / thử lại |
| ST-chay-dang-chay | Tiến trình | tên skill + từng bước (node) với trạng thái | chờ / đóng ngăn (lượt vẫn chạy) |
| ST-ketqua-xong | Kết quả | từng đầu ra theo nhãn manifest: video/âm thanh phát được + tải về | tải / «Xem/sửa kế hoạch» / chạy lượt mới |
| ST-ketqua-loi | Kết quả | câu lỗi bằng lời sản phẩm + bước hỏng | «Chạy lại» / «Quay lại biểu mẫu» |
| ST-kehoach-xac-nhan | Xác nhận thay canvas | «Canvas đang có đồ thị — thay bằng kế hoạch của skill?» | Thay / Huỷ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô `number` nhận số trong khoảng manifest khai; ngoài khoảng → lỗi tại ô trước khi gửi
- Tải video dùng `/api/upload` có sẵn; «Chạy» chỉ bật khi mọi ô bắt buộc có giá trị và không còn tệp đang tải
- Đóng ngăn giữa lúc chạy không huỷ lượt; mở lại ngăn thấy lượt gần nhất
- Phím: Esc đóng ngăn; focus vào ô đầu tiên khi mở biểu mẫu
- Khổ hẹp (375): ngăn chiếm trọn chiều ngang

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Sheet, Button, Input, Select, Label, Tooltip, AlertDialog (`components/ui`) | dùng | shadcn sẵn trong repo |
| Nút «Skill» ở thanh trái | ghép | cùng lớp nút của Workflow/Task/Portfolio trong `workspace-left-nav.tsx` |
| SkillList · SkillForm · SkillRunStatus · SkillResult | tạo | chưa có gì tương đương; ghép từ primitive trên, sống ở `components/workspace/skills/` |
| Xác nhận thay canvas | ghép | cùng khuôn AlertDialog Director đang dùng trong `director-prompt.tsx` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hai khuôn khả dĩ (wizard · danh-sách-chi-tiết). Không có công cụ tra mẫu thị trường trong phiên → nấc (ii). Chọn danh-sách-chi-tiết vì bước đầu là CHỌN trong nhiều skill (số skill sẽ tăng ở B7, Phase 3), còn biểu mẫu → tiến trình → kết quả chỉ là chi tiết của một skill; wizard ép một đường tuyến tính cho màn danh sách vốn là màn quay lại nhiều lần. Đối chiếu khuôn ngành cùng loại: thư viện template của n8n và ComfyUI đều mở từ danh sách rồi đi vào chi tiết của một template.
<!-- UX-SPEC-TEMPLATE>>> -->

## 4. Ngoài phạm vi v1

Ẩn canvas làm mặc định (màn chính là nút skill) · Director sinh instance (B8) · fan-out/ma trận/
judge · hook `estimate` chi phí · bảng `skills` cho skill người dùng tự tạo · phân phối skill qua
host template · Skill #1 thật (B7) · phép thử cache-key của D3 (không đổi `DirectorPlanSchema`
ở vòng này — chuyển sang B8).
