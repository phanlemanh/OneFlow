---
schema_version: 1
feature: Skill system v1 — manifest tham số, template, orchestrator v1, ngăn skill và xem/sửa kế hoạch; skill thứ hai không đụng engine
slug: skill-system-v1
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-16-skill-system-v1-design.md
approved_by: Mạnh
approved_at: 2026-09-16
---

# Acceptance Contract: skill-system-v1

## Context

Người dùng OneFlow hôm nay phải tự nối node trên canvas để ra một kết quả; Skill #1 của lát cắt cần 6–7 node mà người bán hàng không tự nối được. Vòng này dựng khung skill của ADR-0002: một skill là template đồ thị + bảng tham số, người dùng bấm một nút, điền tham số, nhận kết quả, và chỉ khi muốn mới mở đồ thị trên canvas. Hai skill chạy trên plugin cục bộ đi kèm; skill thứ hai là bằng chứng rằng thêm skill không cần sửa engine, compiler hay exporter.

Source input: docs/roadmap.md khối plan-freeze dòng B5 · docs/adr/0002-skill-template-orchestrator.md · docs/superpowers/specs/2026-09-04-lat-cat-chung-minh-design.md §3.1

## Vật trước vòng

- Ở nhánh gốc: không — 31199f494256800600524248ecd247ab53359060 (`origin/main` không có `src/lib/skills/`, không route `src/app/api/skills/`, không commit nào chạm đường đó)
- Ở prod: chưa đo (kho không có đích triển khai)
- Giá trị mới tới người dùng: bấm một nút, điền video, nhận kết quả của một quy trình nhiều node mà không phải tự dựng đồ thị. [máy đề xuất — người gạch ở Cổng 1]

## Tiền đề

Không phải tiêu chí. Mỗi dòng là một trạng thái của app mà eval GIẢ ĐỊNH đã có, kèm lệnh của repo để đặt và trả. «Lượt» = thư mục tạm riêng của một lượt đo; không dòng nào chạm `data/` hay `plugins/` của người dùng.

- TD-1 · `.env` có mặt, mọi khoá API rỗng — hai skill không cần khoá · đặt: `cp .env.example .env` · trả: không cần (tệp gitignored)
- TD-2 · `node_modules` lành, không trỏ worktree tạm đã xoá · kiểm: `bash scripts/acceptance/preflight-verify-env.sh` · đặt: `pnpm install --frozen-lockfile` · trả: không cần
- TD-3 · thư mục dữ liệu của lượt: SQLite + uploads riêng, schema đã migrate · đặt: `TONGFLOW_DATA_DIR=<lượt>/data` (app migrate khi mở DB lần đầu) · trả: `rm -rf <lượt>`
- TD-4b · lượt chỉ cài plugin ffmpeg (để thấy skill thiếu plugin trên máy chủ thật) · đặt: `TONGFLOW_PLUGINS_DIR=<lượt>/plugins pnpm plugins:install oneflow-api-ffmpeg` · trả: `rm -rf <lượt>` · chưa dry-run riêng — là tập con của TD-4 đã đứng
- TD-4 · hai plugin cục bộ đã cài vào thư mục plugin của lượt · đặt: `TONGFLOW_PLUGINS_DIR=<lượt>/plugins pnpm plugins:install oneflow-api-ffmpeg oneflow-api-pyscenedetect` · trả: `rm -rf <lượt>`
- TD-5 · venv của từng plugin dựng được (python ≥ 3.10; SDK cài từ `sdk/` của cây, không từ PyPI) · đặt: lần chạy đầu của engine qua `ensurePluginPython` (`src/lib/plugins/plugin-python-env.server.ts`) trong `TONGFLOW_DATA_DIR` của lượt · trả: `rm -rf <lượt>` · dry-run 16/09: đứng (python3.13; `pip check` sạch cả hai plugin). Rủi ro có tên: hai plugin dựng song song cùng ghi `sdk/build/` — E8 dựng tuần tự
- TD-6 · ffmpeg chạy được cho plugin ffmpeg · kiểm: `ffmpeg -version` hoặc `FFMPEG_BIN` · đặt: ngoài repo (cài hệ thống) · trả: không cần
- TD-7 · tệp video mẫu có tiếng và ≥ 2 cảnh trong thư mục lượt · đặt: `bash scripts/skills/luot.sh dat` (sinh bằng ffmpeg lavfi: testsrc 2 s + color 2 s + sine; script ra đời ở S3, lệnh đã chạy tay ở dry-run) · trả: `bash scripts/skills/luot.sh tra` · dry-run 16/09: đứng (1 video + 1 audio, 4 s; PySceneDetect thấy 2 cảnh)
- TD-8 · máy chủ dev của CÂY NÀY, cổng trống, trỏ dữ liệu + plugin của lượt · đặt: `PORT=<p> TONGFLOW_DATA_DIR=<lượt>/data TONGFLOW_PLUGINS_DIR=<lượt>/plugins NEXT_DIST_DIR=build pnpm dev` · nhận diện cây — CẢ HAI phải đúng, sai một là exit 2: (1) `curl -s -o /dev/null -w '%{http_code}' localhost:<p>/proto/skill-system-v1` = 200 (slug chỉ nhánh này có) và (2) thư mục làm việc của tiến trình đang nghe cổng (`lsof -a -p $(lsof -t -iTCP:<p> -sTCP:LISTEN) -d cwd -Fn`) = gốc worktree · trả: dừng nhóm tiến trình của lệnh đặt · dry-run 16/09: một phần — (1) trả 404 vì proto chưa có lúc chạy (nay đã có), proto slug của `main` không phân biệt được cây; (2) đúng. Xử tại S1: thêm vế (2)
- TD-9 · Chrome cho chụp khung · kiểm/đặt: `pnpm ui:capture <url> <out.png>` (đọc `CHROME_PATH`) · trả: không cần
- TD-10 · `uv` trên PATH cho suite khoá `executors.test.sdk_pytest` · kiểm: `command -v uv` · đặt: ngoài repo (`brew install uv`) · trả: không cần · dry-run 16/09: KHÔNG đứng — không có `uv` ở PATH, `~/.local/bin`, `~/.cargo/bin`, `/opt/homebrew/bin`. Xử tại S1 bằng giới hạn có tên: máy không tự cài phần mềm hệ thống. Không cài thì ô suite `sdk_pytest` thoát 127, workflow S4 xếp 127 vào hạ tầng hỏng (`INFRA_EXITS`) nên MỌI lượt S4 dừng BLOCKED — vòng không tới được Cổng 2. Quyết ở Cổng 1: người chạy `brew install uv` trước S4 (máy khuyên), hoặc chỉ định bỏ khoá `sdk_pytest` khỏi suite của vòng này (vòng không chạm `sdk/`, AC-12) — sửa khoá suite ở S4 là một nhát «thước:»

## Criteria

- AC-1: Given mọi skill trong registry, When phép kiểm toàn vẹn chạy, Then mỗi skill có `id` trùng tên thư mục, `version` semver, `requires` bằng đúng tập slot của template, mọi `target` của tham số trỏ tới một nút dữ liệu đầu vào hoặc một ô cấu hình có thật của template, mọi `outputs[].from` là một cổng ra có thật, và chạy exporter thật trên `originalFlow` ra đúng `executable` đã lưu; phá từng luật trên một bản sao làm phép kiểm đỏ và nêu tên luật + tên skill.
- AC-2: Given một skill có tham số bắt buộc, When `POST /api/skills/<id>/run` gửi thiếu tham số bắt buộc, sai kiểu, giá trị enum hay số ngoài khoảng, hoặc một khoá lạ, Then máy chủ trả 400 mã `SKILL_PARAMS_INVALID` liệt kê từng tham số kèm mã lý do thuộc tập đóng `required · type · range · option · unknown` (xuất từ `params.ts`), và bảng `tasks` không thêm hàng nào; đối chứng: tham số hợp lệ với plugin đủ trả 200 và thêm đúng một hàng.
- AC-3: Given một template và bộ tham số hợp lệ, When instantiate chạy, Then template gốc không đổi, mỗi giá trị tham số xuất hiện ở cả `executable` lẫn `originalFlow`, mỗi node mang plugin mặc định đã cài của slot, và chạy exporter thật trên `instance.originalFlow` ra đúng `instance.executable` (bỏ `exportedAt`) — cho MỌI skill đã đăng ký.
- AC-4: Given một slot của skill không có plugin nào cài, hoặc id skill không tồn tại, hoặc đang có 3 lượt chạy, When nộp lượt chạy, Then máy chủ trả lần lượt 400 `PLUGIN_NOT_INSTALLED` kèm tên slot, 404, 429 `CONCURRENT_TASK_LIMIT_EXCEEDED`, và không thêm hàng `tasks`.
- AC-5: Given tham số hợp lệ và plugin đủ, When nộp lượt chạy, Then máy chủ trả `{taskId}` và hàng `tasks` tương ứng có `feature = "skill"`, `plugin_id` rỗng, `prompt` chỉ gồm `skillId`, `skillVersion`, `params` — không executable, không routing.
- AC-6: Given một task skill đang chờ, When client mở `/api/task/wait` cho task đó, Then runner instantiate lại từ `prompt` và giao cho engine delegate đúng executable của instance; nếu `skillVersion` trong `prompt` khác version đang đăng ký thì task kết thúc `failed` với mã `SKILL_VERSION_CHANGED` mà không gọi engine.
- AC-7: Given một task skill, When `GET /api/skills/runs/<taskId>`, Then trả trạng thái và `steps` — một phần tử `{nodeId, slot, status}` cho mỗi node của instance; khi xong, mọi bước `done` và `outputs` mang đúng các `key` của manifest với file key của engine; khi lỗi, bước có `nodeId` trong `tasks.error.failures` mang `failed`; task không phải skill hoặc không tồn tại trả 404.
- AC-8: Given không gian lượt có hai plugin cục bộ đã cài và video mẫu có tiếng, When chạy `tach-tieng-video` từ đầu tới cuối qua API thật, Then task kết thúc `completed` và mỗi đầu ra của manifest trỏ một tệp tồn tại, dung lượng > 0, đúng loại (âm thanh / video không tiếng).
- AC-9: Given canvas đang mở, When người dùng bấm nút «Skill» ở thanh trái, Then ngăn skill liệt kê hai skill với tên và mô tả tiếng Việt; skill có slot không plugin nào cài (theo registry plugin thật qua `GET /api/skills`) mang nhãn «Cần cài plugin cho bước: <tên bước>» và không chạy được; chọn một skill hiện biểu mẫu sinh từ manifest với ô bắt buộc có dấu và nút «Chạy» chỉ bật khi đủ. (cross-layer)
- AC-10: Given một lượt chạy đã nộp từ ngăn skill, When lượt đi qua đang chạy → xong hoặc → lỗi, Then ngăn hiện tiến trình theo từng bước (từ sự kiện SSE `NODE_*` khi đang mở, từ `steps` của `GET /api/skills/runs/<taskId>` khi mở lại), rồi kết quả với từng đầu ra theo nhãn manifest xem/tải được, hoặc câu lỗi bằng lời sản phẩm nêu tên bước hỏng kèm «Chạy lại» giữ nguyên tham số. (cross-layer)
- AC-11: Given màn kết quả của một lượt, When bấm «Xem/sửa kế hoạch», Then canvas nhận đồ thị của instance với giá trị tham số hiển thị trong node; canvas đang có đồ thị thì hỏi xác nhận trước, và «Huỷ» để canvas nguyên như cũ. (cross-layer)
- AC-12: Given commit thêm skill `tach-tieng-video`, When đối chiếu các đường dẫn commit đó chạm, Then chỉ gồm `src/lib/skills/tach-tieng-video/**`, đúng một dòng thêm trong `src/lib/skills/registry.ts`, và `src/i18n/messages/**` — không dòng nào trong `src/lib/workflow/**`, `src/lib/director/**`, `src/lib/task/**`, `src/app/api/**`, `sdk/**`; tại commit cha của commit đó, phép kiểm toàn vẹn và instantiate xanh với registry chưa có skill thứ hai; tại HEAD, không tệp nào ngoài `src/lib/skills/tach-tieng-video/` và i18n nhắc chuỗi `tach-tieng-video`, `extract-audio`, `remove-video-audio` trong `src/lib/skills/*.ts`, `src/lib/task/**`, `src/app/api/**`, `src/lib/workflow/**`; một bản sao có thêm một đường ngoài danh sách, hoặc một nhánh theo id skill trong runner ở commit trước, làm phép đối chiếu đỏ và nêu đường dẫn đó.
- AC-13: Given ngăn skill ở mọi trạng thái trong bảng trạng thái của thiết kế, When người bán hàng không rành kỹ thuật đọc, Then tên, mô tả, nhãn, thông báo lỗi nói bằng lời sản phẩm, không lộ từ nội bộ (slot, plugin id, ABI, executable, taskId). (judgment)

## Coverage

Quét bằng morphological-scan (preset test-matrix, trục tự dựng theo B1). Chân sản phẩm: [SUY-TỪ-REPO: docs/adr/0002-skill-template-orchestrator.md] + [SUY-TỪ-REPO: docs/strategy/research-director-truong-ky-2026-08.md]. Chân ngành: [NGÀNH: thư viện template n8n · ComfyUI templates] — chọn template từ danh sách, điền đầu vào, chạy, mở đồ thị bên dưới.

- Trục A — chặng vòng đời skill: định nghĩa · liệt kê · tham số hoá · khởi chạy · điều phối tới engine · gom kết quả · xem/sửa kế hoạch · mở rộng thêm skill [thước CE: ADR-0002 §Quyết định + dòng B5 của thiết kế lát cắt]
- Trục B — lớp: thư viện thuần (`src/lib/skills`) · API (`src/app/api/skills`) · runner/engine · giao diện [thước CE: CLAUDE.md §Directory conventions + t3_paths của config]
- Trục C — kết cục: suôn sẻ · đầu vào sai · thiếu plugin · bận · không tồn tại · lỗi lúc chạy · code đổi giữa nộp và chạy [thước CE: mã lỗi hiện có của `/api/workflow/execute` + `DirectorErrorCode`]
- Trục D — skill: skill thật thứ nhất · skill thứ hai (bằng chứng nền tảng) [thước CE: dòng B5 «skill thứ hai giả lập không đụng engine»]
- Core → AC: A·định nghĩa → AC-1 · A·tham số hoá × C·đầu vào sai → AC-2 · A·tham số hoá × B·thư viện → AC-3 · C·thiếu plugin/bận/không tồn tại → AC-4 · A·khởi chạy × B·API → AC-5 · A·điều phối × C·code đổi → AC-6 · A·gom → AC-7 · D·thật × B·engine → AC-8 · A·liệt kê/tham số hoá × B·UI → AC-9 · A·gom × C·lỗi lúc chạy × B·UI → AC-10 · A·xem/sửa → AC-11 · A·mở rộng × D·thứ hai → AC-12 · B·UI lời → AC-13
- Later: skill thứ nhất chạy thật đầu-cuối (`cat-canh-video` cần opencv qua pyscenedetect — AC-8 đo trên skill thứ hai, `cat-canh-video` đo tới AC-3) · huỷ lượt đang chạy từ ngăn · lịch sử nhiều lượt trong ngăn
- Never: fan-out/ma trận/judge (ADR-0002 để cho orchestrator các vòng sau) · skill làm một bước trong DSL Director (lằn ranh đỏ 5 của ADR-0013)
- [GIẢ ĐỊNH] người bán hàng vào skill từ thanh trái của canvas là đủ cho v1 — ẩn canvas làm mặc định để sau (entry d-20260916T115020Z-3 trong decisions.jsonl)

## Out of scope

- Ẩn canvas làm màn mặc định — v1 vào skill từ thanh trái canvas.
- Director sinh instance skill từ prompt (B8) và phép thử cache-key của D3 đi kèm nó.
- Skill #1 thật footage → kho clip 9:16 (B7).
- Fan-out, ma trận biến thể, vòng judge, chọn-best trong orchestrator.
- Hook `estimate` chi phí trong manifest.
- Bảng `skills` cho skill người dùng tự tạo; phân phối skill qua host template.
- Huỷ một lượt skill đang chạy từ ngăn skill (dùng đường dừng task có sẵn).
- Cột provenance skill trên `workflows` hay `tasks` — lượt skill nhận diện qua `tasks.feature = "skill"` và `prompt.skillId`.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Hồ sơ không có `opportunity.md` riêng: theo thiết kế lát cắt (§5, 04/09), hợp đồng B5 trỏ về cơ hội `_acceptance/skill-1-footage-kho-clip/opportunity.md` — ngưỡng U2 «một nút» đo tại Cổng Giá trị của cơ hội đó (B10), không đo ở vòng này.
- ADR-0002 · ADR-0013 lằn ranh đỏ 5 (skill là whole-plan, không mở DSL).
- Vòng T3: trần 4 lượt S4 (CLAUDE.md, quyết định owner 08/09).

**Known limits — người ký nhận tại Cổng 2 (17/09/2026, Mạnh).** Mười bảy mục ngoài hợp đồng
dưới đây ship như hiện trạng; chi tiết từng mục ở `review-findings.md`:

- Đóng rồi mở lại ngăn Skill khi lượt đang chạy làm lượt đó chạy lại lần nữa, vì luồng chờ mở lại không kèm cờ nối lại (hai phát hiện trùng gốc, mức cao).
- Luật đích tham số chỉ từ chối trường được nối bằng cạnh; trường mang giá trị cố định hay đầu vào của cả quy trình vẫn bị ghi đè lặng.
- Ca đối chứng trường nối bằng cạnh không đổi binding độc lập với tên trường, nên quan hệ trường với binding chưa được đo.
- Ma trận đích tham số vẫn khai ba thành viên và tự đếm chính hằng của nó, trong khi luật nay có lý do thứ tư.
- Máy khách skill không đi qua máy khách API chung; phản hồi lỗi hoặc không phải JSON làm biểu mẫu đứng im không báo gì.
- Phản hồi gửi lượt chạy không có thân JSON làm hỏng bước bắt đầu chạy, người dùng không thấy gì.
- Giới hạn số lượt chạy cùng lúc được chép lại thay vì dùng chung với tuyến chạy workflow.
- Lượt chạy thất bại có thể đánh dấu «đã xong» cho bước chưa từng chạy hoặc lỗi không mang mã bước.
- Tải tệp lên thất bại chỉ ghi log; ô chọn tệp lặng lẽ về trống.
- Màn theo dõi có thể kẹt ở «đang chạy» vì chỉ làm mới một lần, không thử lại.
- Tải danh sách skill thất bại cho ra danh sách trống hoặc khung chờ không dừng.
- Kết quả engine của bước tách cảnh trong E10 là dữ liệu gõ tay theo khuôn bên đọc.
- Các bước của lượt chạy chỉ được đếm và kiểm tập khoá, chưa đối chiếu với node của bản dựng.
- Nút «Huỷ» khi mở kế hoạch lên canvas chỉ được kiểm danh sách mã node, chưa kiểm cạnh, vị trí và tham số.
- Bước dựng bản skill lặng lẽ bỏ qua tham số không có trong giá trị mẫu, nên phép đo không phủ tham số đó.
- Kịch bản đầu cuối kiểm đầu ra theo danh sách gõ tay, không đọc từ manifest.

Mục đầu tiên gộp hai phát hiện cùng gốc (Ngoài-4 và Ngoài-7), nên danh sách có mười sáu gạch cho mười bảy mục.
