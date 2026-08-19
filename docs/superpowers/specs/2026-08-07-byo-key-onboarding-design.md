# byo-key-onboarding — thiết kế

- **Ngày:** 2026-08-07 · **Tier:** T3 · **Làn design:** D1 (CT1 bật, CT2 tắt)
- **Nguồn:** [ADR-0011](../../adr/0011-local-first-execution.md) mục "Điều kiện đảo chiều";
  roadmap gọi hạng mục này là **S4**. Trong tài liệu này "S4" luôn có nghĩa là stage VERIFY của
  feature-loop; hạng mục roadmap gọi bằng slug `byo-key-onboarding`.

## Vấn đề

ADR-0011 chốt BYO key là mặc định và ghi thẳng rủi ro đã chấp nhận: ICP đã chọn (seller VN) phần
lớn *"không có thẻ quốc tế, không biết Modal là gì"*. Nó cũng chốt một điều kiện đảo chiều
falsifiable: **≥ 1/3 người dùng đại diện không tự hoàn tất bước nhập key ⇒ tier managed quay lại
làm mặc định và ADR-0011 bị supersede.**

Để phép đo đó trả lời đúng câu hỏi, người dùng phải **đến được** bước nhập key. Hôm nay họ không
đến được, và không phải vì một rào — vì bốn:

| # | Tường | Hiện trạng |
|---|---|---|
| 1 | Tìm ra plugin manager | app không ship plugin nào; không gì chỉ đường |
| 2 | Cài plugin (clone GitHub) | `plugins-dialog.tsx` có, nhưng không ai dẫn tới |
| 3 | Chờ dựng venv Python | mất phút; người dùng không biết đang chờ gì |
| 4 | Nhập key | `settings-dialog.tsx` có, không ai dẫn tới |

Và tường thứ năm, nặng nhất, nằm trước cả bốn cái trên: **ví dụ mặc định đòi tài khoản Modal.**
`public/example.json` dùng `tongflow-modal-z-image`, `tongflow-modal-flux2-klein9b`,
`tongflow-modal-ltx` — cả ba đòi `MODAL_TOKEN_*`. Màn chào mừng đang yêu cầu đúng thứ ADR nói
người dùng không có.

**Hệ quả cho phép đo:** chạy phiên nghiệm thu hôm nay thì phần lớn người rớt ở tường 1–3, và ta
sẽ không bao giờ thu được dữ liệu về tường 4. Con số thu được sẽ mang nhãn "BYO-key thất bại"
trong khi thứ thất bại là "không tìm được chỗ cài plugin". Sửa phễu là **điều kiện tiên quyết để
điều kiện đảo chiều của ADR-0011 có nghĩa**.

## Đối chiếu ngành (outside view)

Hai sản phẩm cùng loại, tra và xác minh chứ không nhớ mang máng:

**ComfyUI + ComfyUI-Manager** — công cụ AI node-graph local-first, cùng hình dạng OneFlow.
Mở workflow thiếu node → hiện thông báo liệt kê node thiếu **ngay lúc load**; nút *"Install
Missing Custom Nodes"* **tự dò và cài mọi node workflow cần**; sau đó **phải restart + refresh**.
([docs.comfy.org](https://docs.comfy.org/installation/install_custom_node) ·
[earngenix](https://www.earngenix.com/tutorials/install-missing-nodes-comfyui) ·
[wonderfullauncher](https://wonderfullauncher.com/docs/comfyui-workflow-missing-nodes))

**n8n** — self-hosted, BYO credential, cùng hình dạng bài toán key. Credential tạo **inline ngay
từ dropdown trên node** thay vì đi tìm trong settings; và n8n **test credential lúc lưu** để xác
nhận nó dùng được. ([n8n docs — create and edit credentials](https://docs.n8n.io/build/understand-workflows/create-and-edit-credentials)
· [n8n docs — credentials](https://docs.n8n.io/credentials/))

Ba điều rút ra, hai trong đó không có trong bản thiết kế đầu:

1. **Phát hiện lúc load, không đợi Run.** ComfyUI cho biết thiếu gì trước khi người dùng bấm bất
   cứ nút nào. Thiết kế này làm theo.
2. **Test key lúc lưu.** *(mới)* Bản đầu để người dùng phát hiện key sai ở lần Run — tức thêm một
   vòng thất bại. Kano: đây là must-be, không ai nói ra nhưng thiếu là hỏng.
3. **Form key đi tới node, không phải người đi tới settings.** *(mới)* Mạnh hơn deep-link.

Một điểm OneFlow **hơn** ComfyUI và phải giữ: `/api/plugins/install` clone xong thì **rescan
registry ngay**, không cần restart. Tường #2.5 của ComfyUI không tồn tại ở đây — AC-4 giữ nó.

## Quét không gian AC (morphological scan)

Chân sản phẩm: [`docs/strategy/vision.md`](../../strategy/vision.md) + ADR-0011 (ICP seller VN).
Chân ngành: ComfyUI-Manager, n8n (đã nêu tên, đã tra).

**Trục A — tường trong phễu:** tìm-plugin | cài-plugin | dựng-môi-trường | nhập-key | chạy-xong
[thước CE: ngành ComfyUI-Manager phủ ba tường đầu; n8n phủ tường key]

**Trục B — kết cục một bước:** xong | đang-chờ | hỏng-tự-sửa-được | hỏng-cần-người | bỏ-giữa-chừng
[thước CE: SP — enum `TaskStatus` trong repo; ngành n8n — test-on-save tách "lưu được" khỏi "dùng được"]

**Trục C — thời điểm phát hiện:** lúc load workflow | trước khi chạy | lúc chạy | không bao giờ
[thước CE: ngành ComfyUI — phát hiện lúc load là chuẩn của loại này]

**Trục D — bề mặt mang tin:** dải first-run | node trên canvas | toast | settings dialog | plugin dialog
[thước CE: SP — các surface đã tồn tại; ngành n8n — form credential nằm TRÊN node]

Tích Descartes 5×5×4×5 = 500 ô, vượt xa ngưỡng liệt kê hết, nên quét theo lát cắt của trục A.
Core giữ ở 15 ô (~3%).

## Thiết kế

### Hình dạng

Một **điều phối viên first-run** trả lời đúng một câu — *"máy này chạy được ví dụ mặc định
chưa?"* — với ba trạng thái `preparing / ready / blocked`, render thành **dải trạng thái không
chặn** phía trên canvas. Canvas vẫn tương tác được; không modal.

Nguyên tắc xuyên suốt: **giao giá trị trước, đòi trả giá sau.** Người dùng phải thấy một kết quả
thật trước khi bị yêu cầu nhập bất cứ key nào.

### Thành phần

| File | Việc |
|---|---|
| `public/example.json` + `public/example-assets/` | workflow LOCAL không key + video mẫu đóng gói. **Cảnh báo (gap-probe P1-3):** video mẫu là INPUT nhưng trông y hệt một OUTPUT — một Run hỏng lặng vẫn để nó trên màn hình và đọc như thành công. AC-2 và E22 tồn tại để chặn đúng nhầm lẫn này |
| `src/lib/onboarding/example-requirements.ts` | đọc workflow → danh sách slot/plugin nó cần |
| `src/hooks/use-first-run-readiness.ts` | đối chiếu yêu cầu với registry → preparing/ready/blocked |
| `src/components/workspace/first-run-strip.tsx` | dải trạng thái + nút hành động |
| `src/lib/onboarding/failure-actions.ts` | phân loại lỗi task → hành động đúng loại |
| `src/components/workspace/node-key-prompt.tsx` | form nhập key ngay trên node đang thiếu key |
| `src/lib/onboarding/key-verify.ts` | **seam xác minh key** — hỏi thứ key mở khoá, không kiểm định dạng |

**Sửa:** `workspace.tsx` (mount strip) · `task-failure-toaster.tsx` (gắn hành động) · node shell
(trạng thái "cần key") · `src/lib/plugin-executor/**` + `plugin-python-env.server.ts` (phát sự
kiện tiến độ dựng môi trường).

**Không đụng:** `/api/plugins/install` · `config/tongflow.abi.json` · `sdk/**`.

**Đính chính blast radius (gap-probe P0-1).** Bản đầu xếp `env-store.server.ts` và
`/api/settings/env` vào "không đụng", trong khi AC-10 đòi xác minh key lúc lưu — mâu thuẫn đó
đẩy người implement sang đường ít kháng cự nhất: kiểm **định dạng** key ngay trong component UI,
đủ để eval xanh và đủ để ship một key hết hạn được báo là "hoạt động". Đường lưu key giữ nguyên;
cái thêm vào là `key-verify.ts`, và `/api/settings/env` **có thể** phải mở một nhánh xác minh —
ghi ra đây để Cổng 1 duyệt đúng bán kính, không phát hiện ở giữa S3.

### Luồng

1. Mở lần đầu → preload example như hiện nay → hook đối chiếu yêu cầu của workflow với registry
2. Thiếu plugin → strip: *"Ví dụ này cần bộ xử lý video (~N MB) — [Chuẩn bị OneFlow]"*.
   **Một nút, không tự cài ngầm.** Hoạt động mạng + ghi đĩa lặng lẽ ngay lần mở đầu bào mòn đúng
   niềm tin sản phẩm này đang bán; và một nút hiện hữu thì **quan sát được** trong phiên nghiệm thu.
3. Bấm → `POST /api/plugins/install` → strip "đang cài…" → registry rescan (không restart)
4. Run → executor phát sự kiện tiến độ thật: `clone → tạo venv → cài SDK → cài requirements`
5. Xong → kết quả hiện trên canvas. **Chưa key nào được yêu cầu tới đây.**
6. Người dùng chạm node AI → node hiện "cần key" + form nhập ngay tại chỗ → lưu → **test ngay**

### Tiến độ dựng môi trường (lý do feature là T3)

`ensurePluginPython` hôm nay chỉ `logger.info` bốn mốc đó ra server log. Thiết kế phát chúng
thành sự kiện tới client qua đường SSE task đã có. Việc này chạm `src/lib/plugin-executor/**` —
một `t3_paths` — nên feature là **T3**, có Cổng 1.5 duyệt plan và mọi mục judgment cần người phán.

Phương án rẻ hơn (chỉ báo trước "lần đầu mất vài phút") đã được cân nhắc và **bị loại**: thanh
tiến độ giả là một lời hứa chứ không phải sự thật đang diễn ra, và với một chờ đợi dài tới vài
phút thì khác biệt giữa "đang cài dependency thứ 3" và "im lặng" chính là khác biệt giữa "chờ
tiếp" và "tưởng treo, tắt app".

### Đường phục hồi

Phân loại lỗi task thành ba loại và gắn hành động đúng loại:

| Loại lỗi | Hành động trên toast + trên node |
|---|---|
| thiếu plugin cho slot | mở plugin manager **đã lọc sẵn** plugin cần |
| thiếu / sai key | mở form key **ngay trên node** (không nhảy đi đâu) |
| khác | giữ nguyên hành vi hiện tại — chỉ hiện message |

### Sinh dữ liệu cho phép đo — không telemetry

Không thêm bất kỳ đo đạc nào. Điều kiện đảo chiều đo bằng **phiên quan sát tay**, nên yêu cầu
thiết kế là mỗi tường có **trạng thái nhìn thấy được từ ngoài** để người điều phối chấm:

| Tường | Mốc quan sát được |
|---|---|
| 1–2 | strip hiện, nhãn đổi theo giai đoạn |
| 3 | bốn mốc tiến độ thật |
| 4 | nhãn "cần key" trên node; tiến độ `setCount/total` sẵn có trong settings |
| 5 | kết quả hiện trên canvas |

Không telemetry còn là một ràng buộc **dương**: niềm tin nền #5 của tầm nhìn là dữ liệu thuộc về
người dùng; gắn tracker vào đúng feature tồn tại để chứng minh điều đó sẽ tự mâu thuẫn.

### Kiểm thử

Unit cho `example-requirements` (workflow → danh sách plugin) và `failure-actions` (message →
loại hành động). Sự kiện tiến độ kiểm bằng test ở tầng executor với một plugin giả.

**Không** giả lập "người mới có tự qua được không" bằng E2E. Đó chính là phiên nghiệm thu, và một
màu xanh E2E ở đây sẽ trả lời sai câu hỏi mà ADR-0011 đặt ra.

## Chi phí đã đo, không ước lượng

Sóng re-sign đo bằng máy trước khi duyệt (nhánh probe chạm đúng tập file dự kiến, rồi vứt):
**11 feature** phải verify lại và ký lại — `ci-actions-bump`, `ci-vitest-sdk-pin`,
`compose-overlay`, `conformance-l0`, `dependency-refresh-2026-07`, `local-cpu-plugins`,
`measure-harness`, `oneflow-plugin-prefix`, `per-plugin-origin`, `sdk-distribution-rename`,
`task-metering`.

`measure-harness` và `task-metering` vừa khai `paths` ở PR #52 và **vẫn** stale — đúng, vì `paths`
của chúng gồm `src/**` và feature này sửa `src/**`. PR đó miễn nhiễm cho chúng khỏi thay đổi
*ngoài* `src/**`, không bao giờ hứa nhiều hơn.

## Ngoài phạm vi

- **Telemetry mọi dạng.** Số liệu đảo chiều lấy từ phiên quan sát tay.
- **Thay đổi cách lưu key** — `env-store.server.ts` và `/api/settings/env` giữ nguyên.
- **Tier managed / màn hình thanh toán.** ADR-0011 đặt nó là tier, không phải mặc định; dựng nó ở
  đây là hiện thực hoá trước cái mà điều kiện đảo chiều còn chưa phán.
- **Đa ngôn ngữ cho nội dung onboarding mới** ngoài các locale repo đã có.
- **Wizard chặn nhiều bước.** Bị loại: bắt trả giá trước khi giao giá trị, ngược đúng thứ tự mà
  ADR-0011 cần chứng minh.
- **Sửa desktop app thành app chạy server tại máy** — hạng mục riêng (roadmap S5).
