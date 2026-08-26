# Research: Mở hoá OneFlow — bản đồ ghép nối thị trường (26/08/2026)

> **Phương pháp:** khảo sát đa agent (19 agent, 6 hướng nghiên cứu, vòng phản biện đối kháng,
> rà soát 34 phát hiện). Số liệu đo trực tiếp: danh mục sống AI Gateway, endpoint probe
> (phân biệt 400/404), md5/git/grep trên repo. Khảo sát này trả lời: *tận dụng gì từ
> Vercel AI SDK / AI Gateway / aisuite / DeepSeek Harness, và cắt phụ thuộc TongFlow đóng
> theo thứ tự nào.* Phần Director trường kỳ (bộ nhớ/skill) ở
> [research-director-truong-ky-2026-08.md](research-director-truong-ky-2026-08.md).

## 1. Kết luận một câu

Thị trường vừa giải xong **tầng OneFlow tốn ít code nhất** (truy cập model đa nhà cung cấp)
và **chưa hề chạm** tầng tốn nhiều code nhất (điều phối DAG đa phương thức trên canvas —
63 slot ABI, trong đó 58 slot phi-text). Chỗ dừng tay và chỗ đào sâu nằm ở hai đầu đối nghịch.

## 2. Bản đồ ghép nối — 23 mảnh, 5 phán quyết

**5 ADOPT · 4 ADAPT · 6 KEEP · 7 DROP · 1 WATCH.** Bảng đầy đủ với bằng chứng file:dòng
nằm trong hồ sơ khảo sát; các dòng quyết định:

| Mảnh | Phán quyết | Lý do ngắn |
|---|---|---|
| Director khoá cứng `claude-opus-4-8` (`director.server.ts:20`) | ADOPT gateway | `@ai-sdk/gateway` đã có sẵn bắc cầu trong node_modules; model đọc từ env-store `ONEFLOW_DIRECTOR_MODEL` |
| `messages.parse` + `zodOutputFormat` | ADOPT `Output.object` | zodOutputFormat HẠ CẤP ràng buộc (pattern/maxLength/const) thành chuỗi trong description; Output.object bảo toàn vào grammar |
| Vòng retry + compiler feedback (`director-core.ts`) | KEEP | AI SDK `maxRetries` chỉ retry lỗi transport, không bao giờ retry NoObjectGeneratedError — retry-with-feedback là tài sản riêng |
| Compiler DSL→ReactFlow (659 LOC, 102 expect) | KEEP | phần được kiểm chặt nhất, độc lập nhà cung cấp |
| Vocabulary byte-stable | KEEP | lọc động phá `sort()` và phá prefix cache — hai mục tiêu xung đột |
| Engine DAG Python (2.943 LOC) | KEEP / DROP thị trường | Workflow DevKit là orchestration bằng MÃ; engine diễn giải DỮ LIỆU — sai mô hình thực thi. dsh `workflow` tự khai "No journaling or resume" — OneFlow đi TRƯỚC |
| Cordis (nền dsh) | DROP | 164 version chưa từng có 4.0.0 stable; chính DeepSeek phải vendor + 18 sửa đổi cục bộ |
| aisuite | DROP | chỉ chat + ASR; Agents API không có trong wheel phát hành; không phủ 50 slot media |
| `generateObject` | DROP | deprecated ở AI SDK v7 |
| Dead deps `openai` + `@google/genai` | DROP | zero import; gỡ dọn luôn nhầm lẫn "repo đã có MCP" |
| `publicToolName` của dsh | ADOPT | hàm thuần ~30 dòng chống va chạm tên (pluginId, nodeSlot) — MIT vào AGPL một chiều, cần mục Third-party notices |
| Danh mục plugin không pin ref | ADAPT | mô hình ComfyUI-Manager v1 đã phải bỏ sau sự cố LLMVISION 06/2024; thêm trường `ref` (SHA) + bắt buộc `license` trong manifest |
| MCP server hoá OneFlow | WATCH | spec 2026-07-28 không có kiểu video (20/63 slot là video), không job dài trong lõi, `/api/uploads` chưa có auth |

Số liệu AI Gateway (đo 26/08): 351 model / 35 hãng (234 language, 34 video, 30 image, 26
embedding, 9 speech, 7 transcription); endpoint OpenAI-compat CÓ chat/completions,
images/generations, images/edits, embeddings, responses; KHÔNG có audio/speech,
audio/transcriptions, videos → **gateway-hoá Director không kéo theo gateway-hoá media**.
Câu hỏi treo cho ADR tương lai: [ADR-0010](../adr/0010-mainstream-infra-and-models.md) nêu
đích danh **OpenRouter** vai gateway — chọn Vercel AI Gateway là nhà cung cấp thứ hai cho
cùng vai, cần ADR giải thích hoặc đổi lựa chọn (chưa quyết).

## 3. Bề mặt phụ thuộc TongFlow đóng — thứ tự cắt (làn B)

1. **B01 — Dọn pháp lý + tháo mìn tag (T1, ngoài gate, ~1,5 ngày).** (a) Sửa
   NOTICE.md:14-16 + README.md:324-325 — hai câu "consumed unchanged from upstream" đã bị
   thực tế và chính [ADR-0008](../adr/0008-naming-and-distribution.md) phủ nhận
   (distribution `oneflow-sdk` đã publish; 74/101 file SDK đã sửa); sửa TRƯỚC lần publish
   PyPI kế tiếp. (b) FUNDING.yml / SECURITY.md / ISSUE_TEMPLATE / Discord đang **định
   tuyến hành vi** về upstream (0-day, tiền tài trợ). (c) Gỡ `desktop-release.yml` khỏi
   trigger `tags: v*` — hiện một tag `v*` đồng thời publish ảnh docker của fork VÀ
   installer tên TongFlow trỏ `app.tongflow.com`; fork 0 tag nên cửa sổ đổi tên miễn phí
   đóng ở tag đầu tiên.
2. **B02 — Quyết định provenance 3 plugin đã port (quyết định sản phẩm, nửa ngày).**
   `oneflow-modal-compose-overlay/entry.py` byte-identical với
   `tongflow-modal-ffmpeg/entry.py` (md5 trùng); cả 7 plugin đã clone đều KHÔNG có LICENSE;
   hai README fork đang gắn "AGPL-3.0" lên mã port từ nguồn không license. Ba lựa chọn:
   xin xác nhận license từ tong-io / viết lại clean-room theo `config/tongflow.abi.json` /
   gỡ repo public. Quyết định này chặn chiến lược plugin về sau (mirror vs viết mới).
   **Trạng thái: CHƯA QUYẾT.**
3. **B03 — Eval baseline Director v1** (golden set 30 prompt + cấu hình plugin đóng băng).
4. **B04 — Spike schema qua gateway** (thải bỏ được; gateway POST nguyên schema, chuẩn hoá
   server-side không quan sát được — nếu ≥2 hãng từ chối pattern/maxItems thì đổi thiết kế).
5. **B05 — director-transport-open** (đổi transport 2 file, giữ hợp đồng HTTP, cờ
   `ONEFLOW_DIRECTOR_TRANSPORT` một release; 217 expect chỉ sửa 6).
6. **B06 — Few-shot động** (đo trên v1 trước, đừng trộn biến với transport).
7. **B07 — Pin SHA 40 entry plugin + bắt buộc license trong manifest.**
8. **B08 — Hợp nhất luật URL ở engine Python** (`engine/plugins.py:28`, `__main__.py:67` —
   nợ [ADR-0007](../adr/0007-sequential-plugin-forking.md) "luật dựng URL viết đúng một
   chỗ", không phải dọn dẹp tuỳ hứng).

**Điểm chết kép chưa xử lý:** 54/63 slot chỉ có implementation ở org tong-io, clone không
pin ref; VÀ plugin Modal upstream ghim `tongflow==0.2.21` — distribution PyPI của upstream
(`tongflow-modal-ffmpeg/deploy.py:30`) — mirror repo KHÔNG giải được nhánh PyPI này.

## 4. Ghi chú quản trị

- Không CLA + inbound=outbound AGPL (CONTRIBUTING.md) = mỗi contributor ngoài là một chủ
  bản quyền có quyền phủ quyết relicense — mọi mô hình dual-license kiểu n8n/Dify bất khả
  thi; đường còn mở là mô hình ComfyUI (bán compute/dịch vụ, không bán license). Nếu còn ý
  định thương mại hoá core: dựng CLA TRƯỚC PR ngoài đầu tiên.
- Chủ đề "mở hoá" trước khảo sát này chỉ sống trong biên bản hội đồng;
  [ADR-0013](../adr/0013-director-truong-ky.md) vật chất hoá phần Director; chính sách
  curation plugin bên thứ ba (pin SHA, license bắt buộc, quét) cần ADR riêng khi làm B07.
- dsh (DeepSeek Harness): KHÔNG dùng làm nền (v0.1 RC, issue tracker tắt, PR ngoài không
  nhận, chính DeepSeek gọi nó là "nguồn cảm hứng, không phải mệnh lệnh"); đáng học kỷ luật
  "seam" (một service — nhiều provider — chọn bằng config) và hàm đặt tên chống va chạm.
  dsh KHÔNG có marketplace — danh mục JSON kiểm duyệt của OneFlow an toàn hơn, không lạc hậu hơn.
