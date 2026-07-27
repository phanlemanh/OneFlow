# Biên bản Hội đồng thẩm định tầm nhìn & kiến trúc OneFlow

> **Tài liệu bất biến** — biên bản gốc của hội đồng 9 phiên chạy ngày 27/07/2026
> (5 giám khảo độc lập → 3 phiên chất vấn → 1 soát điểm mù), thẩm định trên chính
> codebase OneFlow. Không sửa file này; quyết định rút ra được vật chất hoá tại `docs/adr/`.
>
> Kết luận chung: 5/5 giám khảo **viable-with-changes**; 3/3 chất vấn **solvable**; không blocker.

## Phần I — Năm giám khảo độc lập

### Giám khảo 1 — Kiến trúc hệ thống

*Lăng kính:* Kiến trúc sư hệ thống — thẩm định trên code thật: ABI, Director, exporter, engine Python, DB schema, scope layer.

**Verdict:** `viable-with-changes` — Tầm nhìn 8/10 · Kiến trúc 6/10 · Mở rộng 6/10 · Khả thi 7/10 · Khác biệt 7/10

**Điểm mạnh:**
- Contract ABI enforce compile-time là thật, không phải slideware: sourceSpec là single source of truth, compiler Director dùng đúng resolveSpec của app, có test chống drift (node-feature-registry.test.ts) — nền typed vững cho 61 slot.
- Engine tách khỏi app đúng cách: ExecutableWorkflow là execution plan tự chứa, tongflow.engine chạy độc lập — đây là điểm bám lý tưởng để thêm cache/orchestration mà không đụng UI.
- FieldBinding là discriminated union + WorkflowInput đã có sẵn — thêm kind:"entity" cho Universe KG là mở rộng tự nhiên, không đập nền; node overlay/TTS Việt chỉ là thêm slot + plugin trên đường ray có sẵn.
- Scope layer (per-user data dir qua @ext/scope) đã trừu tượng hoá tenant — cloud shell cắm vào không xâm lấn codebase OSS.

**Rủi ro:**
- **[critical]** Luận điểm kinh tế trung tâm — re-render từng phần — chưa tồn tại trong engine
  - *Vì sao:* runner.py chạy tuần tự toàn bộ executionLevels, không cache, không content-addressing (file_key theo taskId, không theo hash), không dirty-tracking. Mọi skill chạy headless qua engine đều re-render từ đầu — đúng vết thương của đối thủ mà OneFlow định vị để giải. Hiện chỉ có re-run thủ công từng node trên canvas, không phải cơ chế.
- **[critical]** Hai runtime ngữ nghĩa (canvas TS + engine Python) đã drift thật và sẽ drift tiếp
  - *Vì sao:* Bằng chứng trong repo: exporter emit batchField (exporter.ts:648) nhưng engine không có một dòng batch nào — fan-out chạy trên canvas, biến mất khi chạy headless. Mỗi tính năng chiến lược (entity binding, cache, judge loop) phải code 2 lần và đồng bộ qua PyPI release + bump pin của 38 plugin; CLAUDE.md tự thừa nhận version drift là recurring bug.
- **[major]** Universe KG dùng chung cho team/agency gãy ở tầng storage trước khi gãy ở tầng graph
  - *Vì sao:* Multi-tenant hiện tại = mỗi user một file SQLite riêng (users/<id>/). Không có shared DB, không có khái niệm org/team/ACL — chia sẻ Product/Brand entity giữa thành viên đồng nghĩa merge file SQLite. Khẩu hiệu "vũ trụ của bạn là dữ liệu của bạn" chạy tốt cho 1 người, chưa có đường đi cho agency.
- **[major]** Không có chỗ ghi provenance/versioning — retrofit sau sẽ rất đau
  - *Vì sao:* workflows.executable là snapshot denormalized nhúng cứng bindings + rawConfig + originalFlow; tasks.prompt chỉ chứa business fields; materials.taskId là text không FK. "Generation nào dùng entity phiên bản nào" và "dữ liệu ROAS gắn vào provenance" không có cột nào để sống — mà đây là chính moat dữ liệu được tuyên bố.
- **[major]** Skill không thể là subgraph thuần — judge loop nằm ngoài khả năng biểu diễn của engine
  - *Vì sao:* Engine là DAG một lượt (CYCLE là compile error), không conditional/loop; Director DSL flat (text|gen, max 60 step). "Sinh N → tự chấm → chọn best" bắt buộc cần tầng orchestration mới phía trên engine, hiện chưa có thiết kế — nguy cơ nhét vào Director DSL và làm hỏng cả compiler lẫn skill.

**Thay đổi bắt buộc:**
- Thêm cache content-addressed vào engine TRƯỚC khi ship skill headless đầu tiên: hash(pluginId + model + slot + params đã resolve + hash file input) → file_key; node trùng hash thì skip. Vị trí: sdk/tongflow/engine/runner.py + store.py. Đây là điều kiện tiên quyết của luận điểm kinh tế, không phải tối ưu về sau.
- Chốt "một engine": hoặc canvas gọi Python engine cho từng node, hoặc dựng conformance suite chạy cùng fixture qua cả hai đường và fail CI khi lệch — fix batchField drift làm test case đầu tiên.
- Thiết kế provenance vào wire shape ngay: FieldBinding thêm kind:"entity" (TS + bindings.py trong cùng một SDK release), tasks thêm cột entity_refs [{entityId, version}], materials.taskId thành FK thật — trước khi có generation nào đáng ghi vết.
- Định nghĩa skill = ExecutableWorkflow template + manifest tham số (map vào WorkflowInput) + orchestrator TS tầng app đảm nhiệm fan-out/judge/chọn-best. KHÔNG mở rộng Director DSL thành ngôn ngữ điều khiển — Director chỉ sinh instance của skill.
- Trước chặng agency: tách metadata (workflows/tasks/materials/KG) sang shared Postgres (Drizzle đã trừu tượng driver), giữ per-user chỉ cho uploads; KG entity đi kèm bảng org/membership ngay từ schema đầu tiên dù chưa bật tính năng team.

**Đánh giá khả năng mở rộng:**

Hai chiều mở rộng có độ khó rất khác nhau. Chiều "thêm năng lực" (slot mới, plugin mới, modality mới): rất tốt — ABI-first + codegen 2 chiều + registry sourceSpec có test chống drift; overlay deterministic hay TTS Việt chỉ là thêm slot + plugin trên đường ray sẵn có. KG 5 entity trong SQLite nodes/edges đủ cho chặng 1 và cả chặng 2 nếu làm schema-first như ABI (JSON schema entity → codegen TS/Python) — điểm gãy của SQLite không phải scale mà là collaboration đa người dùng. Chiều "đổi ngữ nghĩa thực thi" (entity binding, cache, batch, loop): yếu — mọi thay đổi phải đi qua 2 runtime + 1 SDK release PyPI + bump pin 38 plugin, và batchField đã chứng minh drift xảy ra âm thầm không có gate nào bắt. Director DSL không có construct composition nên thêm skill mới không đập nền CHỈ KHI skill sống ở tầng orchestration mới; nếu cố nhét vào DSL thì mỗi skill mới là một lần sửa compiler. Kết luận: nền đủ tốt để tiến hoá, nhưng phải trả nợ "một engine" và "provenance trong wire shape" trước khi xây tầng 2-3, nếu không mỗi tầng mới nhân đôi chi phí đồng bộ.

**Câu hỏi sát thủ:** *Khi seller đổi giá 99K thành 89K trong ma trận 200 video đã render, cơ chế nào trong engine xác định chính xác tập node phải chạy lại và tái dùng phần còn lại — và hôm nay cơ chế đó nằm ở file nào?*

### Giám khảo 2 — GTM & thị trường seller VN

*Lăng kính:* Người mua & thị trường — seller TikTok Shop/Shopee VN, agency performance nhỏ, và kinh tế đơn vị của họ (so với editor 5tr/tháng, CapCut miễn phí, Topview đã có TTS tiếng Việt)

**Verdict:** `viable-with-changes` — Tầm nhìn 7/10 · Kiến trúc 6/10 · Mở rộng 7/10 · Khả thi 5/10 · Khác biệt 6/10

**Điểm mạnh:**
- Wedge livestream→kho clip đánh trúng hành vi thật: seller VN live hàng giờ mỗi ngày, footage có sẵn, không rủi ro AI vẽ sai sản phẩm — demo bằng chính hàng của họ là demo mạnh nhất.
- Re-render từng phần đánh thẳng vào vết thương ngành đã có bằng chứng (user Higgsfield/Topview than mỗi lần sửa là trả tiền lại từ đầu) — với seller ads, sửa giá mà không sinh lại video là giá trị đo được bằng tiền.
- Overlay giá/chữ deterministic là giá trị cực dễ hiểu với người mua: giá sai một số 0 là chết chiến dịch; không đối thủ nào cam kết được điều này.
- Cửa sổ thị trường có thật: Topview dạt khỏi e-com ads, cả ba đối thủ đều hộp đen + credit anxiety, SEA localization nông — và cả ba pivot cùng hướng xác nhận nhu cầu.

**Rủi ro:**
- **[critical]** BYO API key / self-host là bất khả thi với ICP: seller VN phần lớn không có thẻ quốc tế, không biết Modal là gì, không tự deploy GPU worker. Buộc phải làm managed hosting → bạn ôm chi phí GPU/API → phải meter usage → 'không credit anxiety' sụp đổ, và bạn thành một Topview nhỏ hơn với ít vốn hơn.
  - *Vì sao:* Toàn bộ luận điểm kinh tế ('nhiều vòng thử hơn trên mỗi đồng') dựa trên BYO key, nhưng người được hưởng luận điểm đó không phải là người bấm nút mua. Kiến trúc phục vụ dev, ICP là seller — gãy ngay ở bước thanh toán đầu tiên.
- **[critical]** Điểm mù CapCut: miễn phí, của ByteDance, cắm sẵn vào TikTok Shop, có auto-caption tiếng Việt và template commerce. Mọi seller VN mặc định dùng nó; chiến lược không nhắc đến nó một chữ nào.
  - *Vì sao:* Đối thủ thật của tool 500k/tháng không phải Higgsfield 5B — mà là tool 0 đồng nằm sẵn trong workflow đăng TikTok. Không có câu trả lời 'vì sao trả tiền thay vì CapCut' thì mọi phễu đều rò.
- **[major]** P0 (TTS tiếng Việt) là tính năng Topview đã ship (giọng Thảo/Ngọc); điểm khác biệt thật nằm ở P1 overlay engine — thứ chưa tồn tại trong repo (đã kiểm: 0/61 node là compositing/typography). Nếu Topview quay lại giữ wedge e-com SEA trước khi P1 xong, cửa sổ đóng.
  - *Vì sao:* Bán bằng tính năng đối thủ đã có nghĩa là ra trận bằng bảng giá, không phải sản phẩm; lộ trình đặt phần khác biệt sau phần bắt kịp.
- **[major]** Kinh tế hỗ trợ: ICP cần cầm tay (Zalo support, UI tiếng Việt, template sẵn), trong khi surface hiện tại là canvas graph. Ở giá 300-500k/tháng (ước lượng), một segment cần hand-holding sẽ ăn hết margin và kéo công ty thành dịch vụ trá hình SaaS.
  - *Vì sao:* Nghịch lý UX chưa có lời giải cụ thể: 'skill là sản phẩm' mới là khẩu hiệu, chưa có mô tả onboarding 5 phút không cần founder ngồi cạnh.
- **[minor]** Lịch sale đôi là chiến dịch marketing tốt nhưng là engine giữ chân tưởng tượng: chỉ 6-8 sự kiện/năm. Retention thật của seller TikTok là guồng nội dung hàng ngày (10-30 video/ngày cho một shop chạy ads nghiêm túc — ước lượng).
  - *Vì sao:* Nếu xây roadmap P2 quanh sale đôi thay vì quanh khối lượng nội dung hàng tuần, sẽ tối ưu nhầm vòng lặp.

**Thay đổi bắt buộc:**
- Tách hai tier ngay từ đầu: tier seller là cloud managed, key gộp phía server, thanh toán Momo/ZaloPay/chuyển khoản, giá gói ~299-499k/tháng (ước lượng, phải test); BYO key/self-host chỉ là tier agency/pro 1.5-3tr/tháng. Chấp nhận meter usage ở tier seller và định vị lại: 'rẻ hơn mỗi vòng sửa' thay vì 'không credit'.
- Kéo overlay/typography engine từ P1 lên P0, gắn chặt vào wedge livestream: deliverable là clip + phụ đề tiếng Việt có dấu chuẩn + khung giá — không ship clip trần. Phụ đề sai dấu một lần là mất niềm tin cả segment.
- Giấu graph mặc định: surface là ~6 nút skill + kết quả; graph chỉ mở qua 'xem/sửa kế hoạch'. Đặt metric cứng: nếu >30% user phải mở graph để hoàn thành job cơ bản thì UX fail và phải làm lại.
- Chuẩn hoá demo 10 phút: dán link/video livestream 2 giờ → nhận 15 clip có phụ đề + khung giá, xếp hạng theo hook. Mang demo này đi Facebook group seller, Zalo group, KOC dạy nghề; tuyển 10 editor/agency nhỏ làm design partner — editor 5tr/tháng là power user đầu tiên cần chiêu mộ, không phải nạn nhân cần thay thế.
- Trước khi viết thêm code hạ tầng (KG, agent): benchmark mù 20 video thật của 5 seller VN, so trực diện OneFlow vs CapCut vs Topview trên 3 tiêu chí (giá đọc được đúng? đúng SKU? phụ đề dấu chuẩn?) và ghi lại ai thắng ở đâu.

**Đánh giá khả năng mở rộng:**

Nền mở rộng tốt về mặt kỹ thuật-thị trường: schema-first + versioned entity (tối đa 5 loại, SQLite/Drizzle) đúng triết lý ABI, nên mở thị trường mới (Thái/Indo) chỉ là thêm plugin TTS + adapter crawler + bộ skill template — không đập nền; hai chặng dùng chung một schema (Product/Brand → Character/Location) là thiết kế có chủ đích và hợp lý. Ba điểm cần canh: (1) schema entity đừng thiết kế trước cho chặng 2 (continuity, Shot NỐI TIẾP Shot) rồi bắt seller-phase gánh độ phức tạp đó — hãy để chặng 1 chỉ dùng 2-3 loại thực thể và migrate sau; (2) mỗi marketplace mới là một crawler phải bảo trì liên tục (Shopee chống bot mạnh, không có API chính thức) — chi phí mở rộng nằm ở vận hành, không ở schema; (3) skill mới phụ thuộc QA judge loop dùng model describe — chi phí chấm điểm tăng tuyến tính theo số bản sinh ra, cần trần chi phí per-skill trước khi fan-out ma trận ads thành mặc định.

**Câu hỏi sát thủ:** *Khi seller VN không có thẻ quốc tế và không thể tự cầm Modal/API key — ai trả chi phí GPU cho từng video của họ, và nếu câu trả lời là 'chúng tôi hosting rồi thu theo gói', thì điểm khác biệt kinh tế của bạn so với Topview (đã có TTS tiếng Việt, đã có URL→ad, đã có 5 triệu user) còn lại đúng một dòng nào?*

### Giám khảo 3 — AI engineering

*Lăng kính:* Kỹ sư AI/ML production — đã đọc src/lib/director (compile.ts, director-core.ts, safe-slots.ts, dsl.ts), tầng thực thi (engine-delegate.server.ts, sdk/tongflow/engine/runner.py), ABI 61 slot và danh sách 38 plugin; chấm trên bằng chứng repo, không chấm trên slide.

**Verdict:** `viable-with-changes` — Tầm nhìn 7/10 · Kiến trúc 7/10 · Mở rộng 7/10 · Khả thi 5/10 · Khác biệt 7/10

**Điểm mạnh:**
- Tầng Director/compile đạt chất lượng production hiếm thấy: compiler tất định DSL→graph với 10 mã lỗi typed, phân loại field derive từ registry dùng chung (safe-slots exclusion rỗng, được test bảo vệ), core inject được để test — nền móng thật cho narrow agent, không phải prompt-glue.
- Contract ABI compile-time (gen TS + Pydantic, không validate runtime) giữ 61 slot × 38 plugin nhất quán với chi phí thấp — thêm slot judge/overlay/TTS là thay đổi schema-first rẻ và an toàn.
- ABI đã có seed + executionLevels song song theo tầng: fan-out ma trận và reproducibility (tiền đề của cache key) map tự nhiên vào exporter hiện có.
- Wedge đánh trúng vết thương có tài liệu của cả 3 đối thủ (hộp đen, re-render trả tiền lại từ đầu, credit anxiety), và repo đã có đủ primitive cho P0 livestream→clip (scenedetect, whisper, drop-video, ffmpeg).

**Rủi ro:**
- **[critical]** "Re-render từng phần" — tiền đề kinh tế trung tâm — chưa tồn tại: sdk/tongflow/engine/runner.py không có cache, không dirty-tracking, không chạy subgraph, không resume; chỉ có bấm tay từng node trên canvas.
  - *Vì sao:* Mọi vòng lặp của skill/agent phải trả lại toàn bộ graph GPU → pitch "nhiều vòng thử hơn trên mỗi đồng" gãy ngay tại engine; retrofit cache vào lõi thực thi sau khi skill đã xây đè lên sẽ đắt gấp nhiều lần làm bây giờ.
- **[major]** QA judge xây trên describe-slot sai hình dạng: image-describe nhận 1 ảnh, trả text tự do — so cặp anchor-vs-output (đúng SKU?) không biểu diễn được trong graph; FPR của VLM trên nhãn/logo/giá stylized cỡ 10–25%.
  - *Vì sao:* Judge làm gatekeeper tự động sẽ hoặc giao hàng lỗi (FP) hoặc regen vô hạn đốt GPU (FN); parse prose LLM làm điểm số là brittle — thiếu slot judge structured-output là lỗ hổng ABI, không phải lỗ hổng prompt.
- **[major]** Trần consistency của stack open-weights (LTX2 distilled, fastwan, wan-animate) chưa được benchmark mà chặng 2 (10–20 shot giữ nhân vật) đã được hứa; Director→agent còn thiếu kênh phản hồi thực thi và provenance step↔node (compile.ts vứt map step.id→nodeId).
  - *Vì sao:* Model distilled tốc độ là nhóm yếu nhất về identity retention; KG anchor vô giá trị nếu generation không tôn trọng được anchor — rủi ro xây một database của những lời hứa model không giữ nổi; và agent không thể "nhìn kết quả→sửa→chạy lại từ bước X" khi không truy ngược được bước ra node.
- **[major]** Độ bền orchestration: lõi thực thi là subprocess Python spawn mỗi run + SSE emitter in-memory, không retry/timeout/resume; job GPU nhiều phút, cold start Modal 1–3 phút mỗi lần scale, chi phí thật của ma trận 20 video/tuần (fan-out ×3) ước 360–1.200 USD/tháng so với editor ~190 USD/tháng.
  - *Vì sao:* Server restart giữa chừng = mất run — không chấp nhận được cho agent loop production; và kinh tế "rẻ hơn editor" chưa được đo, trong khi fan-out×judge nhân chi phí đúng vào tầng đắt nhất.
- **[minor]** TTS self-host tiếng Việt dính mìn license: viXTTS kế thừa Coqui CPML (cấm thương mại), nhiều checkpoint F5-TTS Việt dính CC-BY-NC; và chưa ai giải bài chuẩn hoá đọc số/giá tiếng Việt ("1.299.000đ") trước TTS.
  - *Vì sao:* Tránh được bằng ElevenLabs P0, nhưng đọc sai giá trong video ads là lỗi giết sản phẩm — cần node text-normalization tất định bất kể engine nào, và tuyến self-host chỉ được mở khi có checkpoint sạch license.

**Thay đổi bắt buộc:**
- Xây partial re-render vào tongflow.engine TRƯỚC khi làm skill/agent: cache output node theo hash(inputs, params, pluginId, model, seed, plugin version) + dirty propagation + API "chạy từ node X"; đo lại chi phí ma trận trước/sau để chốt luận điểm kinh tế.
- Thêm slot ABI `media-judge` structured-output (nhận anchors[] + candidate, trả JSON điểm theo tiêu chí + evidence); gán nhãn ≥200 ads VN thật để đo FPR từng tiêu chí; chỉ nâng judge từ ranker lên auto-gate khi FPR <5%/tiêu chí — trước đó bản chọn cuối là người, trên canvas hộp trắng.
- Lưu provenance step.id→nodeId vào node data lúc compile, ghi cost/duration/kết quả từng node vào tasks, và mở entry point replan đưa lỗi thực thi + output judge vào vòng turns của director-core (scaffolding retry đã có sẵn — mở rộng nó vượt khỏi compile issues); skill v1 = graph đông cứng + tham số typed, agent chỉ chọn và điền.
- Chạy benchmark consistency trên chính stack của mình trước mọi cam kết chặng 2: kịch bản cố định 10–20 shot, 2–3 nhân vật + 1 sản phẩm, đo ArcFace identity sim, CLIP-I/DINO so anchor, OCR chữ trên nhãn, MOS người thật, có ngưỡng đạt/trượt công bố; chặng 1 áp giáo lý "pixel sản phẩm không bao giờ được sinh lại" (matting + composite tất định là đường mặc định của mọi skill).
- TTS P0 = plugin ElevenLabs API + node chuẩn hoá văn bản tiếng Việt tất định (số/giá/ngày→chữ) đứng trước mọi TTS; loại viXTTS và mọi checkpoint NC khỏi tuyến thương mại; đồng thời công bố hoá đơn Modal đo thật của một ma trận 20 video (có/không warm-batching) làm số go/no-go.

**Đánh giá khả năng mở rộng:**

Chiều ngang rất tốt: ABI-first + codegen làm thêm slot mới (judge, overlay, TTS) rẻ và an toàn; safe-slots derived-not-authored là mẫu kỷ luật đúng; KG khởi đầu SQLite/Drizzle ≤5 loại thực thể versioned là khiêm tốn hợp lý. Nhưng chiều dọc có hai vết nứt: (1) DSL v1 không có primitive cho sub-workflow/loop/điều kiện — skill kèm vòng QA không biểu diễn được trong plan, buộc phải có tầng orchestration bên trên mà hiện chưa được thiết kế, dễ thành accretion; (2) mọi nâng cấp xuyên suốt (cache, subgraph run, durability, multi-tenant) đều chạm vào một lõi thực thi Python duy nhất — thứ càng khó sửa khi skill/agent đã xây đè lên. Schema hiện chưa có khái niệm team/tenant/thị trường; thêm sau được nhưng phải thêm trước khi KG provenance đóng băng hình dạng dữ liệu.

**Câu hỏi sát thủ:** *Hoá đơn Modal đo thật của một ma trận 20 video/tuần (fan-out ×3 + judge) là bao nhiêu khi engine hôm nay chưa có cache hay chạy-lại-từng-phần — và nếu con số đó không thắng nổi editor 5 triệu/tháng thì toàn bộ luận điểm kinh tế còn lại gì?*

### Giám khảo 4 — Mô hình kinh doanh & moat

*Lăng kính:* Nhà đầu tư/operator khó tính về mô hình kinh doanh: AGPL monetization, moat thật, kinh tế BYO-key, khả năng bị copy, và con số chứng minh thesis

**Verdict:** `viable-with-changes` — Tầm nhìn 7/10 · Kiến trúc 8/10 · Mở rộng 6/10 · Khả thi 5/10 · Khác biệt 7/10

**Điểm mạnh:**
- Kinh tế re-render từng phần đánh đúng innovator's dilemma của đối thủ: Higgsfield/Arcads/Topview sống bằng credit trên mỗi lần render, nên họ KHÔNG THỂ copy 'sửa giá chỉ chạy lại node overlay' mà không tự phá doanh thu — đây là khác biệt cấu trúc, không phải feature.
- Nền kỹ thuật có thật, đã verify trong repo: 61 slot ABI enforce compile-time, 38 plugin, Director compile prompt→DSL→graph (src/lib/director/compile.ts) — wedge xây trên năng lực sẵn có, không phải slide.
- Neo định giá sắc: đối thủ thật là editor 5tr/tháng (~200 USD) — mọi thông điệp và pricing có mốc so sánh cụ thể, hiếm startup AI nào có.
- Kỷ luật scope ở Universe KG: 5 loại thực thể, SQLite/Drizzle, schema-first, không graph DB ngày 1 — tránh đúng cái bẫy over-engineering giết chết các dự án 'knowledge graph'.

**Rủi ro:**
- **[critical]** Chưa có đơn vị thu tiền: BYO API key + AGPL + cam kết portable nghĩa là mọi lớp giá trị (code, compute, data) đều được tặng miễn phí — revenue per user hiện bằng 0 theo thiết kế.
  - *Vì sao:* AGPL Section 13 buộc công bố mã managed cloud → bất kỳ hosting shop VN nào cũng clone được dịch vụ; không dual-license được vì copyright thuộc tong-io; không ăn margin usage vì BYO-key. Đường khả thi duy nhất là bán workspace có bộ nhớ (KG hosted + team + ROAS import + QA quota) theo seat — nhưng nó chưa được thiết kế, chưa được định giá, và codebase chưa có multi-tenant để bán. Sản phẩm tốt + doanh thu 0 là kịch bản mặc định nếu không sửa ngay.
- **[critical]** Nút thắt upstream trên toàn chuỗi cung ứng: SDK PyPI 'tongflow', 38 plugin repo (org github.com/tong-io), và cả app.tongflow.com mà desktop shell đang trỏ vào — đều thuộc upstream, đã verify trong NOTICE.md, official-plugins.json và desktop/README.md.
  - *Vì sao:* Wedge P0/P1 (TTS tiếng Việt, node overlay) đòi sửa ABI → cần publish model Pydantic mới lên PyPI → OneFlow không sở hữu tên gói. Nghĩa là gãy ngay ở bước wedge ĐẦU TIÊN: hoặc fork SDK dưới tên mới (phá tuyên bố NOTICE, gánh maintenance vĩnh viễn), hoặc xin upstream merge (phụ thuộc thiện chí đối thủ tiềm năng). Upstream chỉ cần đổi hướng repo plugin là supply chain đứt.
- **[major]** Mâu thuẫn asset gravity vs 'vũ trụ của bạn là dữ liệu của bạn': switching cost không tồn tại nếu chính mình quảng cáo export chuẩn — Topview/Higgsfield viết importer cho một schema SQLite 5 entity trong vài tuần.
  - *Vì sao:* Gravity thật chỉ còn lại ở thứ KHÔNG export được ý nghĩa: lịch sử provenance + ROAS gắn phiên bản thực thể chỉ có giá trị khi có runtime thực thi lại được nó. Nếu không chủ động biến schema thành chuẩn mở mà mình là runtime tốt nhất (chiến lược Obsidian), 'portable' chỉ là marketing tự bắn vào moat.
- **[major]** P0 TTS tiếng Việt không phải khoảng trống độc quyền: Topview đã có giọng Việt thật (Thảo, Ngọc) và URL-to-ad tốt nhất thị trường, Arcads có ElevenLabs 30+ ngôn ngữ.
  - *Vì sao:* Nếu ship TTS-vi trước và một mình, OneFlow ra mắt bằng tính năng đối thủ 14M USD đã có. Thứ cả 3 KHÔNG có là overlay chữ/giá/logo deterministic (tiếng Việt có dấu) + re-render từng phần — tức P1 mới là wedge thật, P0 chỉ là điều kiện cần.
- **[minor]** Vòng lặp ROAS cold-start: import CSV không tạo data moat; moat dữ liệu chỉ bắt đầu khi có hàng nghìn creative gắn performance qua Marketing API — cần app approval TikTok và volume user mà 6 tháng đầu chưa có.
  - *Vì sao:* Xếp ROAS loop là moat bền nhất trên lý thuyết nhưng yếu nhất về trình tự thời gian: nó là moat năm 2, không phải năm 1. Nếu pitch nó như moat hiện tại thì thẩm định kỹ sẽ lộ.

**Thay đổi bắt buộc:**
- Định nghĩa đơn vị thu tiền TRƯỚC khi code P1: self-host solo miễn phí vĩnh viễn; Cloud trả phí theo workspace (KG hosted, team, ROAS import, QA judge quota) — công bố bảng giá neo vào mốc 1/3 chi phí editor 5tr/tháng, và thiết kế multi-tenant vào schema DB ngay từ đầu thay vì retrofit.
- Giải nút thắt upstream trong 30 ngày: quyết định fork SDK dưới tên PyPI mới + mirror toàn bộ plugin repos về org riêng, hoặc ký thoả thuận maintainer với tong-io; đồng thời tách desktop shell khỏi app.tongflow.com — hiện đang chạy trên hạ tầng của người khác.
- Đảo trình tự wedge: ship overlay/typography deterministic (P1) đồng thời với TTS-vi, demo 'đổi giá 9.9→10.10 trong 30 giây không re-render video' làm thông điệp ra mắt — vì đó là thứ duy nhất cả 3 đối thủ không có và không dám copy.
- Giải mâu thuẫn portable-vs-gravity bằng chiến lược format-owner: publish spec KG mở + exporter/importer chính chủ, monetize runtime tốt nhất cho format đó — biến 'portable' từ lỗ hổng moat thành công cụ chiếm chuẩn.
- Instrument telemetry (opt-in) từ ngày 1 cho 2 số chứng minh thesis: tỷ lệ % render là partial re-render, và chi phí trên mỗi ad được duyệt so với baseline editor — mục tiêu 6 tháng: ≥30 team trả phí, W4 retention ≥40%, ≥25% render là partial, chi phí/ad duyệt ≤1/3 baseline.

**Đánh giá khả năng mở rộng:**

Nền schema-first (ABI JSON → codegen TS + Pydantic, enforce compile-time) là đúng bài để thêm slot/skill/thực thể mà không đập nền — KG 5 entity versioned mở rộng sang Character/Location cho chặng 2 TVC là tiến hoá tự nhiên trên cùng schema. Nhưng có 3 nút thắt đã verify: (1) MỌI mở rộng ABI phải đi qua gói PyPI tongflow mà OneFlow không sở hữu — chokepoint nằm ngoài tầm kiểm soát, chặn đứng cả TTS-vi lẫn overlay node; (2) chưa có multi-tenant/team trong src/db/ — thêm team, marketplace, hay pricing theo workspace là thay đổi nền tảng chứ không phải mở rộng, càng để muộn càng đắt; (3) 'Skill' chưa tồn tại như first-class artifact — Director hiện compile prompt→DSL một lần, chưa có format đóng gói template + tham số + QA loop, nghĩa là marketplace skill (đường monetize sạch nhất dưới AGPL, vì skill là data chứ không phải derivative work) chưa có móng. Điểm 6/10: triết lý đúng, nhưng hai trong ba trục mở rộng quan trọng nhất về mặt kinh doanh đang bị chặn.

**Câu hỏi sát thủ:** *Khách hàng trả tiền cho CHÍNH XÁC cái gì mà họ không thể tự có bằng cách self-host miễn phí bản AGPL với API key của chính họ — và ARPU đó nhân với bao nhiêu seller VN thì ra một doanh nghiệp đáng làm, khi trần giá bị neo bởi editor 5 triệu/tháng?*

### Giám khảo 5 — Chiến lược cạnh tranh

*Lăng kính:* Chiến lược gia cạnh tranh — đóng vai CEO Topview / Higgsfield / Arcads để đo cửa sổ thời gian thật và nước cờ khó copy về cấu trúc

**Verdict:** `viable-with-changes` — Tầm nhìn 8/10 · Kiến trúc 7/10 · Mở rộng 7/10 · Khả thi 6/10 · Khác biệt 6/10

**Điểm mạnh:**
- Wedge đánh trúng vết thương P&L của cả ngành: re-render trả tiền lại từ đầu + credit anxiety. Higgsfield/Topview/Arcads đều sống bằng đốt credit — copy "sửa giá chỉ chạy lại node overlay" là tự ăn thịt doanh thu của chính họ. Đây là khác biệt kinh tế, không phải khác biệt tính năng, nên khó theo nhất.
- Topview — đối thủ nguy hiểm nhất (đã có TTS Thảo/Ngọc + URL-to-ad TikTok Shop) — đang tự rời wedge: dạt sang Drama Studio đánh Nhật, không GTM SEA, không Shopee chính thức. Cửa sổ VN e-com mở là do đối thủ mất tập trung, và OneFlow đọc đúng điều đó.
- Nền graph có thật trong code, không phải slide-ware: 61 slot compile-time contract, mỗi node là một task độc lập, Director đã compile prompt→graph. Khoảng cách từ đây đến "skill + agent hộp trắng" là lắp ráp, không phải phát minh.
- Deterministic typography + product-lock là gap cả ba đối thủ thừa nhận công khai (Arcads tự nhận cần "prompt gymnastics", Higgsfield không có typography, Topview avatar-centric). Với aggregator model-first, fix nó nghĩa là thêm cả một tầng compositing ngoài model — đi ngược DNA sản phẩm của họ.

**Rủi ro:**
- **[critical]** ICP là seller không biết code, nhưng sản phẩm hôm nay đòi tự deploy Modal worker + dán token + BYO API key. Topview onboard bằng "dán URL sản phẩm" trong 60 giây.
  - *Vì sao:* Gãy ngay ở phút đầu funnel: seller TikTok Shop bỏ trước khi thấy giá trị. Mọi ưu thế re-render/typography vô nghĩa nếu người mua không qua nổi bước cài đặt. Đây là điểm Topview đè OneFlow mà không cần làm gì thêm.
- **[critical]** AGPL tự mời clone nội địa: một team VN có thể fork chính repo này, host lên với GTM địa phương tốt hơn, và cạnh tranh bằng đúng các wedge P0/P1.
  - *Vì sao:* License mở nghĩa là moat KHÔNG THỂ là tính năng hay code — mọi thứ ship ra là public. Nếu moat thật (dữ liệu Universe + ROAS provenance) chưa tích luỹ kịp, OneFlow thua chính bản sao của mình ở trận GTM.
- **[major]** Topview quay lại đè trong 1–2 quý: sản phẩm họ đã đủ (TTS Việt thật, URL-to-ad tốt nhất, fidelity tốt nhất), chỉ thiếu quyết định GTM — local pricing, Shopee crawl, kênh agency VN.
  - *Vì sao:* Chi phí biên để họ tái nhập cực thấp vì feature đã tồn tại; rào duy nhất là attention (đang mải Drama Studio) và mô hình credit bị ghét (Trustpilot 2.9). Nếu OneFlow gây tiếng vang trước khi có moat dữ liệu, tiếng vang đó chính là tín hiệu gọi họ quay lại.
- **[major]** Thứ khó copy nhất — vòng lặp ROAS gắn vào provenance của entity graph — lại nằm ở P2, sau cùng.
  - *Vì sao:* Dữ liệu hiệu quả theo phiên bản thực thể là tài sản compound theo thời gian, không fast-follower nào backfill được. Xếp nó P2 nghĩa là trong 9–12 tháng đầu OneFlow chỉ cạnh tranh bằng tính năng — trận đấu mà bên ít vốn nhất luôn thua.
- **[minor]** Frontier model (Sora2/Veo3.1 thế hệ sau) render chữ và số ngày càng chuẩn — wedge typography deterministic co lại theo thời gian.
  - *Vì sao:* Trong 12–24 tháng model có thể vẽ giá "gần đúng", nhưng ads cần đúng tuyệt đối (sai giá = vi phạm), nên nhu cầu deterministic còn lâu mới chết — song nó sẽ rớt từ "độc quyền" xuống "bảo hiểm", không gánh nổi định vị một mình.

**Thay đổi bắt buộc:**
- Ship hosted tier "dán link là chạy" (managed Modal + API key phía sau, tính phí hạ tầng minh bạch) TRƯỚC khi go-to-market với seller; giữ self-host/BYO-key làm tầng power-user và vũ khí truyền thông chống credit anxiety.
- Dịch toàn bộ định vị sang ngôn ngữ tiền của seller: "đổi giá không tốn tiền render lại", "giá không bao giờ sai một con số", "kịp giờ vàng 9.9". Xoá từ "graph", "hộp trắng", "knowledge graph" khỏi mọi material bán hàng — đó là ngôn ngữ kỹ sư, người mua không nghe thấy gì.
- Kéo vòng lặp metrics (import CSV TikTok Ads → gắn ROAS vào provenance) từ P2 lên chạy song song P1 — thu dữ liệu từ seller đầu tiên. Đây là tài sản duy nhất không clone được bằng fork AGPL và là thứ duy nhất Topview không thể mang theo khi quay lại.
- Đặt deadline cứng theo cửa sổ cạnh tranh: 100+ seller VN active dùng TTS Việt + livestream→clip trước tháng thứ 6; overlay + ma trận ads chạy thật trước mùa sale cuối năm; sở hữu khoảnh khắc "đổi giá re-render một phần" của Tết 2027. Miss mốc nào là cửa hẹp lại tương ứng.
- Xây moat chống fork một cách chủ động: multi-tenant/team sớm để giữ agency (khách khó rời hơn seller lẻ), cộng đồng plugin chính thức có curation, và biến "dữ liệu Universe portable, không Soul ID" thành cam kết marketing công khai — buộc mọi clone phải đấu trên sân dữ liệu chứ không phải sân code.

**Đánh giá khả năng mở rộng:**

Khá, nhờ triết lý schema-first: ABI + codegen hai chiều (TS/Pydantic) làm thêm slot, plugin, skill mới rẻ và an toàn compile-time; skill = template trên graph nên thêm skill không đụng nền; KG 5 loại thực thể versioned với một schema cho cả hai chặng (seller → TVC) là thiết kế mở rộng đúng. Mở thị trường mới (Thái, Indo) chủ yếu là thêm plugin TTS locale + luật ads — config, không đập nền. Hai điểm trừ: (1) ABI 61 slot là contract chung với upstream TongFlow — thêm slot ads-specific (overlay, publish, metrics) là tách dòng vĩnh viễn, mất khả năng kéo upstream, cần quyết định fork-hẳn có ý thức; (2) hoàn toàn chưa có multi-tenant/team trong schema DB — mở lên agency không phải \"mở rộng\" mà là đại tu nền, nên phải trả nợ này sớm chứ không để đến lúc cần.

**Câu hỏi sát thủ:** *Nếu ngày mai một team Việt Nam fork chính repo AGPL này, host lên với onboarding \"dán link là chạy\" và GTM địa phương tốt hơn — OneFlow còn lại đúng thứ gì trong tay mà họ không thể copy trong 6 tháng?*

## Phần II — Ba phiên chất vấn

### Chất vấn 1 — AGPL & mô hình kinh doanh

*Chủ đề:* Fork AGPL không thể dual-license — mô hình kinh doanh nào thật sự khả thi và bền cho OneFlow

**Phán quyết:** `solvable`

**Phân tích:**

**Dữ kiện đã kiểm chứng trong repo.** (1) `LICENSE` là AGPL-3.0 nguyên bản; `CONTRIBUTING.md` tự tuyên bố: "This fork cannot offer a commercial license — the dual-licensing option belongs to the upstream copyright holder, tong-io/tongflow". (2) `NOTICE.md` xác nhận fork tiêu thụ nguyên trạng SDK PyPI `tongflow` và toàn bộ plugin từ upstream — "this fork does not rename, fork, or republish them"; `sdk/pyproject.toml` ghi `license = "AGPL-3.0-only"`, Repository trỏ về github.com/tong-io. (3) `src/lib/plugins/official-plugins.server.ts` git-clone plugin lúc runtime từ org trong `config/official-plugins.json` (hiện là tong-io) — nhưng lưu ý: field `org` là CONFIG, đổi mirror chỉ là sửa một dòng + tự host repo. (4) `desktop/README.md` dòng 4: desktop shell load thẳng **https://app.tongflow.com** — sản phẩm desktop của OneFlow hôm nay đang phục vụ SaaS của upstream. (5) `src/db/workspace.schema.ts` chỉ có 3 bảng workflows/tasks/materials, SQLite per-user — chưa có bất kỳ khái niệm org/team/billing nào. (6) Tồn dư: `CLAUDE.md` vẫn tham chiếu `CLA.md` nhưng file này KHÔNG tồn tại — inbound=outbound thuần AGPL, nghĩa là mọi contribution cộng đồng vĩnh viễn khoá cửa relicense về sau. Đây là ràng buộc một chiều không đảo ngược được, nhưng cũng là tài sản niềm tin nếu chọn đúng mô hình.

**Pháp lý — Section 13 KHÔNG cấm thu tiền.** Nghĩa vụ §13 chỉ kích hoạt khi (a) có sửa đổi VÀ (b) user tương tác qua mạng; nghĩa vụ là cung cấp Corresponding Source *của bản sửa đổi* miễn phí — không hề cấm thu phí dịch vụ hosting, và không với tay sang các chương trình TÁCH RỜI giao tiếp arm's-length qua network API (xem [Reading AGPL — kemitchell](https://writing.kemitchell.com/2021/01/24/Reading-AGPL), [opensource.com về corresponding source](https://opensource.com/article/17/1/providing-corresponding-source-agplv3-license), [FOSSA phỏng vấn Heather Meeker](https://fossa.com/blog/oss-license-compliance-expert-heather-meeker-agpl/)). Ranh giới open-core hợp pháp trên fork của người khác vì thế rất rõ: KHÔNG được giữ kín bất cứ thứ gì link/import vào code AGPL (module trong app Next.js, plugin import SDK AGPL rồi distribute); ĐƯỢC giữ kín (i) service độc lập giao tiếp HTTP — control plane billing/ROAS/judge-quota/KG-sync, hoặc service TTS-vi/overlay đứng sau một plugin AGPL mỏng — chính là pattern các API plugin (Gemini/OpenAI) đang dùng sẵn, model phía sau chưa bao giờ phải AGPL; (ii) DATA: skill = ExecutableWorkflow template + manifest JSON là dữ liệu, không phải derivative work — bán được theo license nội dung thương mại (đồng ý với giám khảo business-moat: "skill là data"); (iii) thương hiệu — AGPL không license trademark.

**Tiền lệ chứng minh cấu hình y hệt sống được.** Nextcloud là fork AGPL của ownCloud, không CLA, không open-core, 100% AGPL — monetize bằng enterprise subscription (support/SLA/maintenance, ~€68/user/năm) và vượt cả upstream ([Nextcloud FAQ](https://nextcloud.com/faq/), [itsfoss so sánh](https://itsfoss.com/nextcloud-vs-owncloud/)). Plausible/Discourse/Ghost bán managed hosting trên code copyleft mà ai cũng self-host miễn phí được. Cho ICP của OneFlow điều này còn đúng hơn: giám khảo gtm-seller đã chỉ ra chí mạng — seller VN không có thẻ quốc tế, không biết Modal là gì — tức là "self-host miễn phí" với họ là quyền lý thuyết không thể thực thi. Code public không làm mất khách hàng không thể chạy code.

**Đối chiếu với các giám khảo.** ĐỒNG Ý với business-moat rằng "revenue per user = 0 theo thiết kế" nếu giữ nguyên BYO-key làm mặt tiền, và nút thắt upstream là thật (mọi slot ABI mới cho overlay/TTS-vi cần publish Pydantic model mới mà OneFlow không sở hữu tên gói PyPI — gãy ngay wedge đầu tiên). BÁC MỘT PHẦN kết luận "hosting shop VN nào cũng clone được dịch vụ": clone được CODE, không clone được kênh thanh toán Momo/ZaloPay đã tích hợp, cộng đồng seller, thư viện skill cập nhật theo mùa sale, dữ liệu ROAS-provenance tích luỹ, và nhãn hiệu. Quan trọng hơn — AGPL cắt HAI chiều: mọi clone VN cũng bị buộc công bố sửa đổi của họ (copyleft), không ai out-feature ai trong bí mật trên cùng codebase; trận đấu bị đẩy sang GTM/brand/data, nơi đi trước 2 quý là lợi thế thật (trả lời killer question của canh-tranh). BÁC MỘT PHẦN gtm-seller "meter usage → thành Topview nhỏ hơn": bán theo workspace/tháng + fair-use quota chứ không bán theo render thì định vị chống credit-anxiety vẫn đứng — NHƯNG chỉ đứng được nếu partial re-render tồn tại để COGS không ăn thịt subscription, tức phát hiện của kien-truc/ai-eng (engine chưa có cache, `runner.py` chạy lại toàn bộ) không chỉ là nợ kỹ thuật mà là ĐIỀU KIỆN SỐNG CÒN của chính mô hình kinh doanh: không có cache thì managed cloud lỗ theo từng vòng sửa.

**Kết luận:** không phải blocker. Dual-license đóng vĩnh viễn, nhưng mô hình khả thi và có tiền lệ là: managed cloud workspace (subscription, thanh toán nội địa) + control plane độc quyền tách rời qua API (ROAS loop, judge quota, KG hosted, TTS-vi/overlay service) + marketplace skill dạng data + trademark, trong khi toàn bộ app AGPL công bố nguồn theo §13 và coi đó là marketing minh bạch thay vì rủi ro. Điều kiện đi kèm: phải giải nút thắt SDK/PyPI và tách desktop khỏi app.tongflow.com — hai việc AGPL hoàn toàn cho phép, chỉ tốn công.

**Lời giải:**

Solvable với mô hình 4 lớp "Nextcloud + control-plane": (1) Toàn bộ app + engine giữ AGPL, công bố Corresponding Source của bản cloud một cách chủ động — code là commodity, không phải moat. (2) Đơn vị thu tiền là WORKSPACE trên managed cloud: subscription tháng theo gói (neo ~1/3 chi phí editor 5tr), thanh toán Momo/ZaloPay, fair-use quota — không bán credit theo render; điều kiện sống còn là xây cache/partial re-render vào engine trước khi mở cloud vì nó quyết định COGS. (3) Giá trị độc quyền hợp pháp nằm ở: các service tách rời giao tiếp HTTP (billing, ROAS import + provenance, judge quota, KG sync, TTS-vi/overlay service sau plugin AGPL mỏng — đúng pattern API-plugin sẵn có), thư viện skill/template bán như data với license thương mại, và nhãn hiệu OneFlow. (4) Giải chuỗi cung ứng: fork SDK sang tên PyPI riêng + mirror plugin repos (đổi field `org` trong config), tách desktop khỏi app.tongflow.com. Self-host BYO-key giữ làm tier power-user/agency và vũ khí truyền thông "không nhốt dữ liệu" — không phải mặt tiền bán hàng cho seller.

**Hành động:**
- Chốt đơn vị thu tiền trước khi code P1: bảng giá workspace cloud theo tháng (không meter per-render), thanh toán nội địa, kèm quyết định kiến trúc 2 tầng — data plane AGPL công bố nguồn, control plane độc quyền chỉ được là service tách rời qua HTTP, cấm import code AGPL vào phần đóng.
- Fork SDK sang tên PyPI riêng (vd oneflow-sdk) và mirror 38 plugin repos về org GitHub riêng — sửa field org trong config/official-plugins.json (đã là config, không phải hardcode) và cập nhật NOTICE.md; đây là điều kiện tiên quyết của mọi slot ABI mới (overlay, TTS-vi).
- Tách desktop shell khỏi https://app.tongflow.com (desktop/README.md dòng 4) — hiện đang chạy trên hạ tầng upstream; chỉ phát hành lại khi trỏ về cloud của mình.
- Đăng ký nhãn hiệu OneFlow tại VN (kiểm tra xung đột với framework OneFlow của oneflow.org) — trademark là tài sản duy nhất AGPL không buộc chia sẻ và là rào cản thật với clone nội địa.
- Xây partial re-render cache vào sdk/tongflow/engine/runner.py TRƯỚC khi mở managed cloud — không phải vì pitch mà vì COGS: không có cache thì mô hình subscription lỗ theo từng vòng sửa của user.
- Dọn tồn dư pháp lý: xoá tham chiếu CLA.md khỏi CLAUDE.md (file không tồn tại, mâu thuẫn với posture inbound=outbound trong CONTRIBUTING.md) và dựng quy trình công bố Corresponding Source đồng bộ với prod trước user trả phí đầu tiên.

### Chất vấn 2 — Nghịch lý hạ tầng seller

*Chủ đề:* ICP seller không rành kỹ thuật vs kiến trúc Modal self-deploy + BYO API key: đường dung hoà đúng, chi phí thật cho 20 video/tuần, và số phận thông điệp "không credit anxiety"

**Phán quyết:** `solvable`

**Phân tích:**

#### 1. Hiện trạng trong code — mâu thuẫn là thật, nhưng seam đã có sẵn

Đã xác minh trực tiếp trong repo:
- `/Users/manhphan/dev/oneflow/.env.example`: để chạy được sản phẩm cần MODAL_TOKEN_ID/SECRET + OPENROUTER + GEMINI + OPENAI + ANTHROPIC key. Với seller TikTok Shop, mỗi key là một cửa tử funnel (đăng ký dịch vụ tiếng Anh, phần lớn cần thẻ quốc tế).
- `/Users/manhphan/dev/oneflow/src/lib/plugin-executor/runners/generic.ts` (dòng 59–72): mỗi scope (user) có `TONGFLOW_MODAL_CACHE_DIR` riêng — tức **mỗi user tự deploy 31 Modal plugin vào tài khoản Modal của riêng họ**. Kiến trúc mặc định biến mỗi seller thành một DevOps: cold start 1–3 phút cho từng loại node, không chia sẻ warm pool với ai.
- `/Users/manhphan/dev/oneflow/src/lib/settings/env-store.server.ts` + `/Users/manhphan/dev/oneflow/src/lib/runtime/scope.server.ts`: seam BYOK per-user và tenant-scoping đã tồn tại (cloud shell mã hoá key qua `@ext/settings-codec`) — móng cho managed tier ĐÃ có. Nhưng grep toàn bộ `src/`: **0 kết quả** cho billing/metering/quota/credit/stripe; bảng `tasks` trong `/Users/manhphan/dev/oneflow/src/db/workspace.schema.ts` không có cột cost/duration. Managed tier chạy được về kỹ thuật (app.tongflow.com là bằng chứng) nhưng **không có đơn vị đo tiền nào** — đồng ý hoàn toàn với giám khảo business-moat.

#### 2. Mổ xẻ 3 đường

**Đường C — BYO nguyên trạng: chết ở funnel, nhưng chết vì UX chứ không vì tiền.** Đồng ý cả 5 giám khảo rằng seller không qua nổi bước cài đặt. Nhưng cần nói thêm điều không giám khảo nào chỉ ra: Modal Starter **miễn phí $30 credit/tháng** — đủ chạy TOÀN BỘ wedge P0 livestream cho một seller (xem mục 3: COGS ~$3–6/tháng). BYO không đắt; nó chỉ bất khả tiếp cận. Hệ quả chiến lược: BYO không phải thứ cần vứt — nó là van xả niềm tin và tier power-user, đúng như gtm-seller đề xuất.

**Đường B — API-plugins-only cho seller: BÁC BỎ làm đường tổng quát.** Số liệu kiểm chứng 7/2026: Seedance qua BytePlus ~**$1.87–2.50/clip 5s 1080p**, fal.ai $0.682/giây. Một video ads 25–30s = 5–6 clip → $9–15/video chỉ riêng phần sinh; 20 video/tuần (~87/tháng) ×3 biến thể fan-out = **$800–3.900/tháng** — thua editor 5tr (~$190) ngay vòng gửi xe, và COGS này còn TỆ hơn mô hình credit của đối thủ. Trong khi self-host open-weights (fastwan/LTX2-distilled) trên Modal H100 ($3.95/h, tính theo giây): clip 5s render 30–90 giây GPU ≈ **$0.03–0.10** — chênh **20–70 lần**. Kết luận cấu trúc: kho 31 Modal plugin open-weights chính là **lợi thế COGS duy nhất** cho phép OneFlow định giá dưới Topview/Arcads; API-only là tự vứt lợi thế đó. API plugins chỉ đúng chỗ ở hai lớp: **TTS** (ElevenLabs Flash v2.5 CÓ tiếng Việt từ 2024 — 32 ngôn ngữ, 0.5 credit/ký tự; 87 video ×~600 ký tự ≈ 52k ký tự ≈ 26k credits, lọt trong gói Creator $22, giá sỉ ~$2–5/seller/tháng) và **LLM text** (OpenRouter free/DeepSeek). Điều này cũng vá đúng rủi ro license viXTTS/Coqui CPML mà ai-eng nêu.

**Đường A — managed cloud mặc định + BYO cho pro/agency: ĐÚNG, nhưng thiếu một quyết định kiến trúc mà chưa giám khảo nào gọi tên.** Managed tier KHÔNG ĐƯỢC tái dùng mô hình per-user deploy hiện tại trong `generic.ts`. Phải là **MỘT Modal workspace của OneFlow, deploy một lần, warm pool chia sẻ cho mọi tenant**: cold start amortize theo tổng traffic, GPU utilization tăng, và đây chính là chỗ dải ước phí $360–1.200/tháng của ai-eng (đúng cho kiến trúc hiện tại: per-user deploy, không cache) rơi về $60–250/tháng. Ràng buộc vận hành mới: Modal Team plan $250/tháng + usage, trần **50 GPU concurrent** — đủ cho vài trăm seller wedge P0 nhưng ma trận fan-out của vài chục seller đồng thời sẽ chạm trần → cần hàng đợi ưu tiên ngay trong thiết kế, và Enterprise plan khi scale.

#### 3. Chi phí thật cho 1 seller 20 video/tuần (~87 video/tháng) — phải tách theo loại việc, vì "video" không đồng nhất

**(a) Wedge P0 livestream→clip (deterministic — sản phẩm chủ lực):** 2 phiên live 2h/tuần → scenedetect CPU ~$0.05–0.15/phiên; whisper large-v3 INT8 chạy ~20–30x realtime → 2h audio ≈ 4–6 phút trên A10G $1.10/h ≈ $0.10/phiên; drop-video ~$0.05–0.30; ffmpeg + overlay CPU vài cent. **Tổng ≈ $0.30–0.70/phiên → $3–6/tháng cho 80–160 clip.** Cộng TTS sỉ $2–5 → **COGS ≈ $5–11/seller/tháng**. Gói 299–499k VND ($12–20) cho tier này có margin gộp 40–65% — hoàn toàn nuôi được, và quan trọng hơn: COGS gần như KHÔNG co giãn theo số lần SỬA (sửa = CPU cents) → tier này bán **flat, không credit** một cách trung thực.

**(b) Gen-video matrix (self-host open-weights trên shared workspace):** $0.15–0.60/video 25–30s → 87 video ×3 biến thể ≈ $40–160/tháng; cộng judge loop + retry + cold start còn lại → thực tế **$60–250/tháng**. Tier này BẮT BUỘC meter theo "lượt sinh mới" (gói 990k–1.5tr với N lượt) — nhưng SỬA vẫn free.

**(c) BYO/agency:** compute về máy/tài khoản họ, OneFlow thu 1.5–3tr phí phần mềm/workspace.

→ **Bác một nửa luận điểm gtm-seller "managed = thành Topview nhỏ hơn":** sai ở tầng cost structure. Topview COGS = gen-video inference cho MỌI video; OneFlow wedge P0 COGS = transcode+ASR (~$0.05/video, rẻ hơn ~200 lần). Managed không tự động kéo theo credit model — nó chỉ thành credit model nếu sản phẩm chủ lực là gen-video. **Chọn wedge quyết định mô hình giá, không phải chọn hosting.**

#### 4. Thông điệp "không credit anxiety": viết lại, không vứt

Nguyên văn "không credit" chết ở managed tier — nhưng phiên bản trung thực còn MẠNH hơn: (1) **"Sửa là miễn phí"** — đổi giá, đổi phụ đề, re-render một phần: unlimited mọi gói, khả thi vì deterministic ops ≈ 0 đồng; đây là đòn đối thủ không copy được về cấu trúc (đồng ý business-moat: credit-per-render là DNA doanh thu của họ). (2) **"Sinh mới giá niêm yết sát hạ tầng, lượt không hết hạn"** — đánh thẳng vết Trustpilot 2.9 của Topview (credit hết hạn). (3) **"Không bị nhốt"** — BYO/self-host tier là bằng chứng sống cho mọi nghi ngờ về giá.

**Cảnh báo trình tự (điểm nghẽn liên-giám-khảo):** cả ba câu trên chỉ trung thực khi partial re-render TỒN TẠI trong engine — mà kien-truc và ai-eng đã chứng minh `runner.py` hiện chưa có cache/dirty-tracking. Ship managed tier TRƯỚC khi có cache nghĩa là OneFlow tự móc túi trả re-render toàn phần cho mọi lần "sửa miễn phí" — COGS phồng 5–10x, chết bằng chính thông điệp của mình. Cache content-addressed không chỉ là điều kiện của luận điểm kỹ thuật; nó là **điều kiện của bảng giá**.

Sources: [Modal Pricing](https://modal.com/pricing), [Modal Pricing 2026 — CostBench](https://costbench.com/software/ai-gpu-cloud/modal/), [Modal Pricing Explained — Beam](https://www.beam.cloud/blog/modal-pricing-explained), [ElevenLabs Pricing 2026 — Flexprice](https://flexprice.io/blog/elevenlabs-pricing-breakdown), [ElevenLabs hỗ trợ tiếng Việt](https://x.com/elevenlabsio/status/1818339438885278049), [ElevenLabs Models](https://elevenlabs.io/docs/overview/models), [Seedance 2.0 API Pricing — NxCode](https://www.nxcode.io/resources/news/seedance-2-0-api-guide-pricing-setup-2026), [Seedance trên fal.ai](https://fal.ai/models/bytedance/seedance-2.0/text-to-video), [faster-whisper benchmark — GigaGPU](https://gigagpu.com/whisper-vs-faster-whisper-speed/)

**Lời giải:**

Chọn Đường A có cấu trúc — "managed mặc định, BYO là tier chứ không phải kiến trúc": (1) **Tier Seller** (mặc định, cloud managed): shared Modal workspace của OneFlow + key gộp phía server, flat 299–499k VND/tháng, phạm vi = wedge livestream→clip + overlay giá/phụ đề + TTS ElevenLabs tiếng Việt, SỬA UNLIMITED, thanh toán Momo/ZaloPay/chuyển khoản — margin gộp 40–65% trên COGS đo được $5–11/seller/tháng. (2) **Tier Growth**: mở gen-video matrix, meter theo "lượt sinh mới" (990k–1.5tr, N lượt không hết hạn trong kỳ), sửa vẫn free — chạy trên open-weights self-host của OneFlow, KHÔNG bao giờ route gen-video qua API bên thứ ba cho tier trả gói (đắt hơn 20–70 lần). (3) **Tier Pro/Agency** (1.5–3tr): BYO Modal/API key + self-host — kiến trúc per-user deploy hiện tại sống nguyên vẹn ở đây, đồng thời là bằng chứng "không bị nhốt". Đường B (API-only) bị bác làm đường tổng quát, chỉ giữ cho TTS + LLM text. Thông điệp thay "không credit anxiety" bằng bộ ba trung thực: "Sửa miễn phí — Sinh mới giá niêm yết, lượt không hết hạn — Không bị nhốt (tự host được)". Điều kiện tiên quyết bất khả nhượng theo trình tự: cache content-addressed trong engine → chế độ shared-deployment trong runner → metering tối thiểu (cost/duration per task + quota per workspace) → cổng thanh toán VN → rồi mới GA tier Seller.

**Hành động:**
- Đo hoá đơn Modal thật trong 2 tuần: chạy trọn pipeline P0 (2h livestream → 20 clip có phụ đề) và 1 ma trận 20 video gen trên MỘT workspace Modal duy nhất, ghi cost theo từng node — chốt COGS thực trước khi in bất kỳ bảng giá nào (trả lời đúng killer question của ai-eng).
- Thêm cột cost_usd, duration_ms, gpu_type vào bảng tasks (/Users/manhphan/dev/oneflow/src/db/workspace.schema.ts) và ghi từ plugin runner — móng metering ~1-2 ngày công, đồng thời là móng provenance mà kien-truc đòi.
- Thiết kế 'shared deployment mode' cho managed tier: flag runtime để bỏ TONGFLOW_MODAL_CACHE_DIR per-scope trong /Users/manhphan/dev/oneflow/src/lib/plugin-executor/runners/generic.ts, dùng deploy chung + secret chung của workspace OneFlow, kèm hàng đợi ưu tiên vì trần 50 GPU concurrent của Modal Team plan.
- Xây cache content-addressed trong sdk/tongflow/engine (hash pluginId + params + hash file input → skip node trùng) và đặt nó làm điều kiện chặn GA của tier Seller — vì 'sửa miễn phí' không có cache là tự đốt COGS 5-10x.
- Ship plugin TTS ElevenLabs Flash v2.5 (có tiếng Việt) + node chuẩn hoá số/giá tiếng Việt tất định đứng trước mọi TTS; mua theo plan sỉ, hạch toán $2-5/seller/tháng vào COGS gói; loại viXTTS/checkpoint NC khỏi tuyến thương mại.
- Viết lại messaging và test giá: bỏ tuyệt đối hoá 'không credit', thay bằng 'Sửa miễn phí — Sinh mới giá niêm yết — Không bị nhốt'; validate bảng giá 299/499/990k với 10 seller/editor design partner qua demo livestream→15 clip trong 10 phút.

### Chất vấn 3 — Trần kỹ thuật consistency

*Chủ đề:* Trần consistency 10–20 shot: Universe KG + anchor + QA judge trên stack plugin hiện tại — benchmark bắt buộc và go/no-go cho chặng 2 (TVC/drama)

**Phán quyết:** `solvable`

**Phân tích:**

TRẢ LỜI THẲNG CÂU HỎI: Không — Universe KG + anchor + QA judge TỰ THÂN không đủ giữ nhân vật photoreal nhất quán qua 10–20 shot trên stack hiện tại, vì KG chỉ là nơi LƯU tham chiếu; sự nhất quán được quyết định ở tầng conditioning của model, và tầng đó trong repo hôm nay chỉ có đúng 3 cơ chế + 1 lối thoát closed-model. Nhưng đây là vấn đề giải được bằng đo lường + tái phạm vi, không phải blocker, vì chặng 1 (seller) hầu như không phụ thuộc trần này.

BẰNG CHỨNG ĐÃ XÁC MINH TRONG REPO (đọc trực tiếp, không suy đoán):

1) Cơ chế identity thực sự tồn tại — 3 đường mở + 1 đường đóng:
- Multi-ref keyframe: slot image-fusion (text + images[Asset]) do FLUX.2-klein-9B-KV implement (/Users/manhphan/dev/oneflow/plugins/tongflow-modal-flux2-klein9b/deploy.py — "multi-reference edit... reference images flow through KV cache"), cộng Gemini/OpenAI/agnes API. Đây là đường anchor→keyframe khả dĩ nhất.
- Keyframe-chained continuity: get-first-frame/get-last-frame (ffmpeg plugin) + slot image-image-gen-video (first+last frame) trên LTX-2.3-22B-distilled (/Users/manhphan/dev/oneflow/plugins/tongflow-modal-ltx/deploy.py:55-86). Primitive nối shot CÓ SẴN — điểm này các giám khảo chưa ai ghi nhận đủ.
- Reenactment/replacement: Wan2.2-Animate-14B fp8 + lightx2v 6-step distill (/Users/manhphan/dev/oneflow/plugins/tongflow-modal-wan-animate/deploy.py) và SCAIL-2 14B (/Users/manhphan/dev/oneflow/plugins/tongflow-modal-scail2/deploy.py) — identity đến từ FOOTAGE THẬT, không từ model sinh. Đây là đường TVC ít rủi ro nhất mà chiến lược đang bỏ quên.
- Lối thoát closed-model MÀ CÁC GIÁM KHẢO BỎ SÓT: plugin tongflow-api-bytedance là Doubao Seedance 2.0 mini qua Volcengine Ark, và slot images-gen-video của nó là "Free multi-image reference fusion: every image is a Seedance multimodal reference" (/Users/manhphan/dev/oneflow/plugins/tongflow-api-bytedance/entry.py:53,311). Nghĩa là OneFlow đã có sẵn trong repo đúng cái model mà Higgsfield aggregate. Giám khảo ai-eng nói "trần của stack open-weights chưa benchmark" — đúng nhưng thiếu: trần KHÔNG chỉ là open-weights, có arm API để so ceiling ngay.

2) Điểm yếu đã xác nhận (đồng tình với ai-eng, có thêm bằng chứng):
- Judge sai hình dạng: image-describe/image-gen-text/video-gen-text đều nhận đúng MỘT media, trả text tự do (config/tongflow.abi.json; gemma4 + sensenova-vision + agnes là các implementer). Không có slot nào nhận anchors[]+candidate, không structured output. Xác nhận 100% luận điểm ai-eng. Tuy nhiên: cho GIAI ĐOẠN BENCHMARK, hack ghép lưới anchor|candidate bằng ffmpeg ngoài product + image-describe là đủ — benchmark KHÔNG bị chặn bởi lỗ hổng ABI này.
- Engine không biểu diễn được loop sinh-chấm-chọn: runner.py chạy tuần tự executionLevels, không cache/resume (đã grep: 0 kết quả cache/dirty/resume trong sdk/tongflow/engine/), CYCLE là compile error (src/lib/director/compile.ts:88,623), batchField được exporter emit (src/lib/workflow/exporter.ts:648) nhưng engine Python không có một dòng batch nào — drift kien-truc nêu là THẬT. Hệ quả cho chủ đề của tôi: judge loop trong product chưa chạy được, NHƯNG benchmark chạy bằng script orchestration NGOÀI engine thì không phụ thuộc gì — không có cớ trì hoãn đo lường chờ trả nợ engine.
- fastwan (Wan2.1-1.3B QAD, 3 step, T2V-only, trần 5s — deploy.py:3-5,49) hoàn toàn vô dụng cho consistency; mọi ước lượng trần dựa trên nó là nhiễu. Bernini 1.3B tương tự.
- Không có LoRA-train slot: không có đường "khoá identity bằng huấn luyện" — nhưng LTX plugin đã nạp IC-LoRA LipDub (deploy.py:84-86), chứng minh đường ray load LoRA tồn tại; thiếu là bước TRAIN, không phải bước dùng.
- Universe KG chưa tồn tại một dòng nào trong src/db/ (đã grep entity/universe: 0 kết quả) — mọi tranh luận về KG là tranh luận về thiết kế tương lai, và vì thế thứ tự đúng là ĐO TRƯỚC, THIẾT KẾ SCHEMA SAU.

3) ĐÁNH GIÁ TRẦN THEO PHÂN KHÚC (đây là chỗ tôi tách khỏi cách đặt câu hỏi gộp của đề bài — "nhân vật/sản phẩm" không phải một trần duy nhất):
- Sản phẩm (rigid object, nhãn tiếng Việt): trần CAO và đạt được NGAY — sam3 matting + composite deterministic + OCR kiểm chứng (paddle/unlimited-ocr có sẵn trong repo làm metric engine). Giáo lý "pixel sản phẩm không bao giờ được sinh lại" của ai-eng là đúng và khả thi hôm nay. Trong video, product-lock chỉ giữ được ở keyframe và drift trong shot — chấp nhận được cho ads ngắn 5–10s.
- Nhân vật stylized/mascot: trần TRUNG BÌNH-KHÁ — dung sai người xem cao, CLIP-I/DINO đo được, keyframe-first pipeline nhiều khả năng qua.
- Nhân vật photoreal sinh hoàn toàn qua 10–20 shot: trần THẤP-CHƯA BIẾT trên đường mở (LTX distilled + FLUX Klein 9B là các bản distill/nhỏ — nhóm yếu nhất về identity retention, ai-eng đúng), CHƯA BIẾT-KHẢ QUAN trên arm Seedance 2.0. Chưa ai trong 5 giám khảo lẫn team có SỐ — và đó chính là tội lớn nhất: cam kết chặng 2 đang đứng trên một biến chưa đo trong khi chi phí đo chỉ ~1000 USD và 5 tuần.
- Nhân vật = người thật (KOL/actor của seller) qua wan-animate/SCAIL-2: trần CAO — identity từ footage. Đường này biến "TVC có nhân vật nhất quán" từ bài toán model thành bài toán quay 1 buổi footage gốc.

4) VỀ QA JUDGE: đồng tình với ai-eng rằng FPR 10–25% của VLM trên nhãn/giá stylized làm auto-gate bất khả thi hôm nay; bổ sung: benchmark dưới đây tự sinh ra bộ nhãn người (human labels) làm ground truth để ĐO FPR của judge — tức một công đôi việc: đo trần model VÀ calibrate judge cùng lúc. Judge khởi điểm là RANKER (xếp hạng cho người chọn), chỉ thăng cấp auto-gate khi FPR<5%/tiêu chí.

5) BẤT ĐỒNG với cách xếp của một số giám khảo: business-moat và kien-truc coi KG là hạng mục cần "thiết kế provenance ngay". Với riêng câu hỏi consistency, tôi đảo thứ tự: nếu benchmark cho NO-GO photoreal thì nửa schema Character/Location/continuity KHÔNG ĐƯỢC PHÉP xây (đồng ý với gtm-seller: chặng 1 chỉ cần 2–3 entity), và mọi công thiết kế trước đó là lãng phí đã tránh được. KG là điều kiện CẦN (nơi lưu anchor versioned + provenance để QA lặp lại được), tuyệt đối không phải điều kiện ĐỦ — "database of promises models can't keep" của ai-eng là frame đúng và benchmark này chính là phép thử của nó.

**Lời giải:**

PHÁN QUYẾT: Solvable — với điều kiện cứng là chạy benchmark TRƯỚC mọi cam kết chặng 2 và trước mọi dòng schema KG cho Character/Location. Thiết kế cụ thể:

BENCHMARK OF-CB-1 (OneFlow Consistency Bench):
• Nội dung: 3 kịch bản cố định × 12–20 shot; 3 loại chủ thể tách riêng: (a) người photoreal VN, (b) mascot stylized, (c) product-only nhãn tiếng Việt có dấu + giá. 1 lần đổi trang phục giữa kịch bản (test entity versioned). Anchor: bảng 5 góc/nhân vật (image-fusion sinh, người duyệt); sản phẩm dùng ảnh chụp thật.
• 5 arm: A=text-only (đối chứng); B=keyframe-first (image-fusion→LTX-2.3 I2V); C=keyframe-chained (B + get-last-frame→image-image-gen-video); D=Seedance 2.0 multi-ref (images-gen-video, plugin bytedance có sẵn); E=wan-animate/SCAIL-2 replace trên footage thật. Mỗi arm × 5 seed.
• Metric & ngưỡng ĐẠT (sample 1fps): Photoreal: ArcFace cosine vs anchor — mean ≥0.50, min per-shot ≥0.35, độ lệch chuẩn cross-shot ≤0.06. Stylized: CLIP-I ≥0.80 và DINOv2 ≥0.65. Sản phẩm: OCR exact-match ≥95% trên frame nhãn ≥40px (dùng paddle/unlimited-ocr trong repo), ΔE màu brand ≤5, DINO crop-sim vùng matting ≥0.70. Attribute persistence (tóc/đồ/phụ kiện) ≥90% qua checklist VLM có người kiểm 20%. Human MOS: ≥80% forced-choice "cùng một người" trên cặp shot, 5 rater. Ghi hoá đơn Modal + API thật per-arm per-shot (trả luôn câu hỏi kinh tế của ai-eng).
• PASS một segment = ≥2/3 kịch bản đạt toàn bộ ngưỡng ở ít nhất một arm. Nhãn người của MOS đồng thời dùng đo FPR/FNR judge VLM.

GO/NO-GO CHẶNG 2:
• GO photoreal: arm mở (B/C) pass → chặng 2 giữ nguyên lộ trình, xây Character/Location vào KG.
• GO-hybrid: chỉ arm D pass → chặng 2 chạy trên Seedance/closed key; BẮT BUỘC sửa narrative "self-host/không phụ thuộc" thành "open path cho 90% pipeline, closed key cho hero shots" — trung thực hoặc bị thẩm định bóc.
• GO-stylized: chỉ mascot pass → chặng 2 pivot sang drama/quảng cáo stylized-animated (thị trường TikTok có thật), photoreal hoãn.
• NO-GO: photoreal + stylized đều trượt → chặng 2 lùi 12–18 tháng, mở lại chỉ khi (i) ship plugin lora-train per-character (LTX đã có đường ray load LoRA) và re-test pass, hoặc (ii) thế hệ open model mới pass OF-CB-1. KG đóng băng ở 2–3 entity chặng 1 (Product/Brand/Voice).

SỬA TẦM NHÌN (mọi kịch bản trừ GO photoreal): tháo lời hứa "giữ nhân vật 10–20 shot" thành 3 cơ chế theo mức rủi ro tăng dần — (1) product pixel không bao giờ sinh lại (deterministic, bán được ngay); (2) identity người thật từ footage + reenactment (bán được cho TVC ngay, không phụ thuộc trần model sinh); (3) identity sinh hoàn toàn (chỉ hứa sau khi benchmark pass). KG định vị lại là tầng anchor + provenance làm QA lặp lại được — điều kiện cần, không phải cơ chế tạo consistency. Chi phí đo: ≤1.000 USD + 5 tuần (2–3 tuần build script orchestration NGOÀI engine — không chờ cache/loop/batch của engine; 1–2 tuần chạy + gán nhãn).

**Hành động:**
- Tuần 1-5: build và chạy OF-CB-1 bằng script Python đứng ngoài engine (gọi thẳng plugin qua sdk/tongflow/engine/invoker.py), 5 arm × 3 segment × 5 seed, budget 1.000 USD — quyết định go/no-go chặng 2 bằng số, trước mọi dòng schema KG Character/Location
- Prototype arm E ngay trong benchmark: wan-animate/SCAIL-2 replace trên footage KOL/seller thật (/Users/manhphan/dev/oneflow/plugins/tongflow-modal-wan-animate/deploy.py) — mở đường TVC không phụ thuộc trần model sinh và biến nó thành lời hứa chặng 2 mặc định
- Dùng nhãn người từ MOS của benchmark để đo FPR/FNR judge VLM per-tiêu-chí; sau đó mới thêm slot ABI media-judge (anchors[]+candidate→JSON điểm) vào config/tongflow.abi.json; judge chỉ là ranker cho tới khi FPR<5%
- Giới hạn KG chặng 1 = Product/Brand/Voice (2-3 entity, SQLite/Drizzle); Character/Location và ràng buộc continuity chỉ vào schema sau khi OF-CB-1 cho GO
- Nếu NO-GO photoreal: scope plugin lora-train per-character trên Modal làm điều kiện mở lại chặng 2 (đường ray load LoRA đã tồn tại: LIPDUB_IC_LORA tại /Users/manhphan/dev/oneflow/plugins/tongflow-modal-ltx/deploy.py:84-86)
- Công bố công khai bộ ngưỡng + kết quả OF-CB-1 (kể cả khi trượt) làm tài sản marketing hộp-trắng — đối thủ hộp đen không dám công bố số consistency của chính họ

## Phần III — Soát điểm mù (completeness critic)

- **Pháp lý quảng cáo & dán nhãn nội dung AI tại Việt Nam — luật ĐÃ có hiệu lực, không phải rủi ro tương lai**
  - Từ 01/01/2026 (trước 'hôm nay' 7/2026), ba luật đã hiệu lực mà không giám khảo nào nhắc một chữ: Luật sửa đổi Luật Quảng cáo 2025 (siết trách nhiệm người chuyển tải quảng cáo/KOL, quảng cáo TPCN/mỹ phẩm — đúng ngành hàng chủ lực của seller TikTok Shop); Luật Công nghiệp Công nghệ số (nội dung do AI tạo phải mang dấu hiệu nhận dạng); Luật Bảo vệ dữ liệu cá nhân (giọng nói = dữ liệu sinh trắc, cần consent riêng cho voice clone). Đối chiếu repo: grep toàn bộ src/ không có một dòng labeling/disclosure nào, và năng lực watermark duy nhất trong ABI là slot remove_watermark (config/tongflow.abi.json:2288) — sản phẩm hiện đi NGƯỢC chiều nghĩa vụ pháp lý. Điều này đổi quyết định hai chiều: node 'dán nhãn AI + kiểm claim TPCN' có thể phải chen vào P0 (không phải P2), hoặc trở thành moat khác biệt thật sự mà Topview/Higgsfield không làm cho thị trường VN; ngược lại, bỏ qua nó thì managed tier gánh trách nhiệm pháp lý trực tiếp.
- **Bản quyền và quyền nhân thân nằm NGAY TRONG pipeline P0 — nhạc nền livestream, hình ảnh người thứ ba, likeness khi face-replace**
  - Wedge chủ lực livestream→kho clip có một khuyết tật pháp lý chưa ai chạm: livestream seller VN hầu như luôn có nhạc nền không license — scenedetect+drop-video cắt clip là 'đóng gói' luôn phần nhạc vi phạm vào video ADS (TikTok bắt buộc Commercial Music Library cho nội dung thương mại; Content ID quét tự động). Nghĩa là kiến trúc P0 phải có quyết định sản phẩm ngay: strip audio + thay TTS/nhạc licensed làm mặc định — một node và một chính sách chưa có trong thiết kế. Tương tự: người qua đường/nhân viên trong footage (Điều 32 BLDS về quyền hình ảnh), wan-animate/SCAIL-2 thay mặt người thật = deepfake likeness cần consent flow. Phiên chất vấn consistency còn đề xuất arm E (reenactment trên footage KOL) làm lời hứa mặc định của chặng 2 — tức đặt cược to hơn nữa vào đúng vùng chưa có khung consent nào.
- **Managed cloud = xưởng sản xuất scam ads tiềm năng — an toàn thương hiệu, KYC, và trách nhiệm liên đới**
  - Bộ công cụ của OneFlow (voice clone + lip-sync + face replace + overlay giá + fan-out hàng loạt) trùng khít với đồ nghề của ngành quảng cáo lừa đảo đang bùng nổ ở VN (giả bác sĩ, giả người nổi tiếng bán TPCN 'nhà tôi ba đời'). Ở tier BYO-key thì đó là việc của user; nhưng ngay khi chuyển sang managed cloud (điều cả hội đồng đồng thuận là bắt buộc), mọi video render trên hạ tầng và API key của OneFlow — kéo theo nghĩa vụ moderation, KYC seller, quy trình gỡ, và rủi ro Momo/ZaloPay từ chối merchant ngành rủi ro cao. Chi phí này KHÔNG có trong mô hình COGS $5-11/seller của phiên chất vấn infra-paradox, và một scandal 'công cụ này làm video giả bác sĩ' đủ giết thương hiệu trước khi có moat dữ liệu. Slot remove_watermark còn nằm trong ABI là một mồi lửa truyền thông.
- **Đội ngũ & nguồn lực thực thi — hội đồng kê đơn cho một tổ chức không tồn tại**
  - Bằng chứng repo: toàn bộ phần fork là 37 commit của MỘT tác giả duy nhất; không có dấu hiệu team thứ hai. Trong khi tổng required_changes của 5 giám khảo + 3 phiên chất vấn cộng dồn thành nhiều engineer-năm: cache content-addressed trong engine, conformance suite 2 runtime, multi-tenant Postgres, fork SDK + mirror 38 plugin repos, tách desktop, shared-deployment mode + hàng đợi GPU, metering + cổng thanh toán VN, overlay engine, benchmark OF-CB-1, plugin ElevenLabs, cộng GTM 100+ seller active trong 6 tháng kèm support Zalo cầm tay. Không ai hỏi ba câu quyết định nhất: bao nhiêu người, runway bao lâu, và với nguồn lực đó thì thứ tự cắt bỏ là gì. Đây là biến duy nhất có thể lật 'viable-with-changes' của cả 5 giám khảo thành 'không khả thi nếu không cắt 80% phạm vi hoặc gọi vốn/tuyển người' — mọi deadline cạnh tranh (Tết 2027, cửa sổ Topview 1-2 quý) đều vô nghĩa nếu không qua được phép chia cho số người thực thi.
- **Rủi ro nền tảng TikTok từ BÊN TRONG: Symphony, chính sách synthetic media, và ROAS moat nằm sau cổng duyệt của chính ByteDance**
  - gtm-seller đã nêu CapCut nhưng cả hội đồng bỏ sót đối thủ platform-native nguy hiểm hơn: TikTok Symphony — bộ AI creative (URL→ad, avatar, dịch đa ngôn ngữ) MIỄN PHÍ ngay trong Ads Manager, phân phối bằng chính phễu mà seller bắt buộc phải đi qua. Chưa ai đánh giá: (a) chính sách synthetic media của TikTok bắt buộc disclosure — cộng hưởng với luật VN ở trên; (b) chính sách chống 'mass-produced/unoriginal content' — ma trận fan-out hook×format×giá chính là mẫu hình dễ bị quét ban ad account, tức wedge P1 có thể policy-adverse ở quy mô; (c) moat bền nhất theo hội đồng (vòng lặp ROAS qua Marketing API) phụ thuộc app approval của TikTok — nghĩa là tài sản chiến lược số 1 nằm sau cánh cổng do công ty mẹ của đối thủ trực tiếp (CapCut/Symphony) kiểm soát, có thể đóng bằng một thay đổi điều khoản. Kế hoạch cần phương án B cho attribution (first-party tracking, mã giảm giá) mà hiện chưa ai vẽ.
- **Chất lượng thật của chính P0 chưa được benchmark — độ chính xác Whisper tiếng Việt trên audio livestream**
  - Hội đồng áp kỷ luật đo lường rất nặng cho chặng 2 (OF-CB-1, 5 arm, ngưỡng ArcFace/OCR/MOS) nhưng để lọt biến số gần nhất: toàn bộ lời hứa 'phụ đề tiếng Việt dấu chuẩn' của wedge P0 đứng trên WER của Whisper với audio livestream VN — môi trường tệ nhất có thể (nhạc nền, chồng tiếng, tiếng địa phương, tên sản phẩm lai tiếng Anh, dãy số giá đọc nhanh). ai-eng chỉ lo chuẩn hoá số cho chiều TTS, không ai đòi đo chiều ASR. Nếu WER thực tế 15-25% trên footage thật thì mọi clip đều cần người sửa phụ đề — deliverable P0 âm thầm biến thành bán-thủ-công, phá luôn COGS $3-6/tháng và margin 40-65% mà phiên chất vấn infra-paradox đã dựng bảng giá lên trên. Nghịch lý trình tự: mốc xa nhất được đo kỹ nhất, mốc gần nhất — nơi công ty sống chết 6 tháng đầu — chưa có một con số nào.

**Thiên kiến hệ thống của cả hội đồng:**

Hiệu ứng đèn đường lấy repo làm ranh giới của thực tại: cả 5 giám khảo lẫn 3 phiên chất vấn đều tự hào 'chấm trên bằng chứng code, không chấm trên slide' — và chính phương pháp đó tạo ra điểm mù chung. Mọi thứ grep được (runner.py thiếu cache, batchField drift, schema thiếu multi-tenant) bị soi đến từng dòng; mọi rủi ro sống NGOÀI codebase — luật đã có hiệu lực, quyền nhân thân, nhạc bản quyền trong footage, chính sách nền tảng, lạm dụng, và nhất là con người thực thi — nhận đúng 0 phút thảo luận. Hệ quả kép: (1) hội đồng mặc định bài toán quyết định là bài toán kiến trúc-kinh tế, trong khi với một sản phẩm QUẢNG CÁO ở thị trường có quản lý, biến quyết định thường là định chế (luật, nền tảng, trách nhiệm pháp lý); (2) cả 8 lượt thẩm định đều kê đơn cho một tổ chức giả định đủ người — cộng dồn nhiều engineer-năm việc 'bắt buộc trước khi ship' mà không ai kiểm phép chia cho đội ngũ thật (37 commit, 1 tác giả). Một hội đồng toàn kỹ sư và chiến lược gia sản phẩm sẽ luôn tìm thấy nợ kỹ thuật và cửa sổ cạnh tranh; không ai trong phòng có phản xạ của luật sư, trust-and-safety, hay CFO — và ba chiếc ghế trống đó chứa những rủi ro duy nhất mà 'sửa code' không giải được.
