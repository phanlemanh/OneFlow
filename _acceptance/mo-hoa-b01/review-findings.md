## Trong hợp đồng

### [ĐÃ SỬA 07/09 — `b24bd89`] Teeth harness: positive control (green_control) failure is swallowed — case still reports PASS / exit 0

> **Trạng thái 07/09: ĐÓNG.** Sửa ở `b24bd89` — thêm `|| return 1` vào 25 lời gọi
> `green_control` và 5 `expect_red` nằm trong vòng lặp. Đo thêm được một bệnh thứ hai
> cùng gốc (expect_red trong `for` bị vòng sau ghi đè) và sửa luôn. Đối chứng hai chiều:
> cây lành vẫn 28/28 exit 0; với conf phá thì `image-upstream` chuyển từ «exit 0 + in PASS»
> sang «exit 1 + không in PASS». Chi tiết trong `evidence-report.md` mục Round 3.

- file: `scripts/fork/check-fork-identity-teeth.sh:315`
- severity: high
- source: bugs
- AC: AC-7

Detail: run_one invokes each case as `if "case_$name"; then` (line 315). In bash, a function executed as an `if` condition runs with `set -e` ignored for its ENTIRE body, so the `return 1` from green_control (lines 92-98) does not stop the case — the perturbation is applied anyway, the guard goes red (for the perturbation's reason on top of whatever was already red), expect_red finds its token, and the case is counted PASS. 24 of the 28 cases call `green_control` bare (e.g. lines 118, 147, 160, 240); only conf-remote-lech / suite-key-dangling / debt-table-missing use an explicit `|| { ...; return 1; }`. Reproduced: `FORK_IDENTITY_CONF=<conf with repo=ai-do/kho-khac> bash scripts/fork/check-fork-identity-teeth.sh --case image-upstream` prints `FAIL CASE image-upstream: đối chứng dương đỏ trên fixture chưa phá` on stderr yet `CASE image-upstream: PASS` on stdout, exit 0; same for `--case hit-outside`. This is exactly the borrowed-red class the file header says one-case-one-assertion exists to exclude: the `mhb_teeth_*` evals and the CI step 'Fork identity guard still has teeth' cannot distinguish 'guard caught the perturbation' from 'fixture was already red'. Mitigation today is only that the sibling CI step runs check-fork-identity.sh on the same tree. Fix: `green_control <case> || return 1` in every case (or run the case outside an `if`: `"case_$name"; rc=$?` under `set +e`).

Rationale: AC-7 đòi mọi ca của check-fork-identity-teeth.sh thật sự xanh và mỗi ca đỏ phải ghim đúng thông điệp của đúng phép kiểm nó phá; ở đây phần lớn ca báo PASS dù đối chứng dương (fixture ban đầu) đã hỏng, tức PASS giả không phản ánh đúng phép kiểm.

- **[VÒNG 5 — TRONG HỢP ĐỒNG AC-6 — ĐÃ SỬA 07/09 `40dc80c`] Class scan exempts a whole LINE, so upstream links smuggled onto an exempted line pass silently**
  Người dùng thấy gì: —
  file: `scripts/fork/check-fork-identity.sh`
  severity: high
  Đề xuất: fix — người ký chọn sửa 07/09: cắt đoạn đã miễn trừ rồi quét lại phần còn lại của dòng; ca răng `exempt-line-smuggle`; E7 ghim 29/29. Tái hiện trước sửa: exit 0; sau sửa: FAIL đúng thông điệp, exit 1.

- **[VÒNG 6 — TRONG HỢP ĐỒNG AC-6 — ĐÃ SỬA 07/09 `0d3c124`] Upstream-identity class scan is case-sensitive; mixed-case upstream links pass the guard**
  Người dùng thấy gì: —
  file: `scripts/fork/check-fork-identity.sh`
  severity: medium
  Đề xuất: fix — grep -i cho lớp quét, miễn trừ và phần còn lại của dòng; ca răng `class-mixed-case`

- **[VÒNG 6 — TRONG HỢP ĐỒNG AC-11 — ĐÃ SỬA 07/09 `0d3c124`] Hình 3 — Assert 'chuỗi có mặt' trong khi AC-11 hứa 'đúng MỘT hàng' (quan hệ đếm)**
  Người dùng thấy gì: —
  file: `scripts/fork/check-prototype-lane.sh`
  severity: medium
  Đề xuất: fix — đếm hàng, >1 đỏ «cần đúng một»; ca răng `debt-table-duplicate`

- **[VÒNG 6 — TRONG HỢP ĐỒNG AC-1 — ĐÃ SỬA 07/09 `0d3c124`] Hình 3 — AC-1 hứa chuỗi ảnh nằm TRONG lệnh docker run, guard chỉ grep chuỗi ở bất kỳ đâu trong README**
  Người dùng thấy gì: —
  file: `scripts/fork/check-fork-identity.sh`
  severity: low
  Đề xuất: fix — chuỗi ảnh phải nằm trong khối `docker run` nối dòng; ca răng `readme-image-outside-run`

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Community links redirect to GitHub Discussions, but Discussions is disabled on phanlemanh/OneFlow**
  Người dùng thấy gì: Nút liên hệ cộng đồng dẫn tới trang Thảo luận trên GitHub nhưng trang đó chưa được bật cho kho này, nên người dùng bấm vào hiện đang gặp trang báo không tồn tại.
  file: `.github/ISSUE_TEMPLATE/config.yml`
  severity: medium
  Đề xuất: known-limits

- **check-fork-identity.sh silently falls back to the real conf/allow-list when an explicit override path does not exist**
  Người dùng thấy gì: Khi ai đó cấu hình sai đường dẫn tuỳ chỉnh cho công cụ kiểm tra định danh, công cụ âm thầm chuyển sang đo dữ liệu gốc mà không báo hiệu gì, khiến kết quả kiểm tra trông có vẻ đúng dù không đo đúng thứ được yêu cầu.
  file: `scripts/fork/check-fork-identity.sh`
  severity: medium
  Đề xuất: known-limits

- **fixture() leaks temp dirs in looping cases — only the last probe of a case is cleaned**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ để sót lại một số thư mục tạm trên máy sau khi chạy; không ảnh hưởng tới phần mềm mà người dùng cuối thấy.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: wont-fix

- **Hình 3 — E10/E5 hứa QUAN HỆ (tên gói đọc từ pyproject) nhưng ca răng chỉ assert chuỗi vắng; guard ghim hằng `oneflow-sdk` vẫn qua răng**
  Người dùng thấy gì: Nếu sau này có người vô tình ghi cứng tên gói phần mềm thay vì lấy đúng từ nơi khai báo chính thức, bộ kiểm tra tự động hiện nay sẽ không phát hiện ra sai sót đó.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 — E7/E8 expected ghim những phép kiểm mà cmd không hề chạy (`--case bogus`, `--selftest-fail`, gỡ phần tử CASES → 27/27, gỡ needle khỏi GUARD_NEEDLES); verifier chỉ có thể «đạt» bằng cách đọc mã nguồn**
  Người dùng thấy gì: Một số lời hứa kiểm tra tự động trong hồ sơ nghiệm thu hiện chỉ được xác nhận bằng cách đọc mã nguồn chứ chưa thật sự được máy chạy thử, nên vài kịch bản đó thiếu bằng chứng chạy độc lập.
  file: `_acceptance/mo-hoa-b01/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (gần Hình 1) — check-suite-key.sh khẳng định «executor GỌI script» bằng phép chứa-chuỗi trên văn bản lệnh; executor chỉ NHẮC tên script vẫn xanh**
  Người dùng thấy gì: Bộ kiểm tra xác nhận một bước máy có thật sự chạy công cụ kiểm tra định danh chỉ bằng cách tìm tên công cụ đó xuất hiện trong dòng lệnh, nên một dòng lệnh chỉ nhắc tên mà không chạy thật vẫn có thể được coi là hợp lệ.
  file: `scripts/fork/check-suite-key.sh`
  severity: medium
  Đề xuất: wont-fix

- **Hình 6 (gần nhất) — răng ghim cứng định danh fork của tác giả `phanlemanh/OneFlow` ở ba ca dù đã suy REPO_RAW từ conf**
  Người dùng thấy gì: Một vài kịch bản kiểm tra nội bộ vẫn ghi cứng tên kho của tác giả thay vì đọc từ cấu hình, nên nếu chạy trên một bản sao đã đổi sang kho khác, các kịch bản đó có thể báo sai mà không phải do lỗi thật của công cụ.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: wont-fix

- **[ĐÃ SỬA 07/09 — `6cb2253`] Đổi khoá volume compose `tongflow-*` → `oneflow-*` làm người đang tự host mất sạch dữ liệu khi `git pull && docker compose up -d`**
  Người dùng thấy gì: Ai đang tự host mà kéo bản mới rồi khởi động lại sẽ thấy ứng dụng lên như bản cài mới — cơ sở dữ liệu, tệp đã tải lên, mọi khoá API nhập trong phần Cài đặt và các plugin đã cài đều biến mất, không có lỗi hay cảnh báo nào; dữ liệu thật vẫn nằm trong volume cũ không còn được gắn.
  file: `docker-compose.yml`
  severity: high
  Đề xuất: fix — người ký chọn 07/09 lối «giữ khoá volume cũ» (service vẫn `oneflow`, ba README sửa dòng `docker run -v` cho khớp). Lối `name: tongflow-data` bị loại: Compose đặt tên volume thật là `<project>_<khoá>`, `name:` trần không khớp volume cũ. Đo lại: guard PASS, răng 28/28 exit 0.

- **[VÒNG 4 — ĐÃ SỬA 07/09 `b8ca06a`] Đổi tên service compose `tongflow` → `oneflow` làm self-host cũ không lên được (container mồ côi giữ cổng 3000)**
  Người dùng thấy gì: Người tự host bản cũ khi nâng cấp lên bản mới có thể gặp lỗi cổng bị chiếm, ứng dụng mới không khởi động được trong khi bản cũ vẫn âm thầm chạy ngầm chiếm chỗ.
  file: `docker-compose.yml`
  severity: medium
  Đề xuất: known-limits
- **[VÒNG 4] Guard định danh fork đỏ trên mọi fork của contributor (đối chiếu conf ↔ remote origin)**
  Người dùng thấy gì: Người khác fork kho về tài khoản riêng của họ có thể thấy quy trình kiểm tra tự động báo lỗi ngay cả khi họ chưa làm gì sai.
  file: `scripts/fork/check-fork-identity.sh`
  severity: low
  Đề xuất: known-limits
- **[VÒNG 4] check-prototype-lane.sh ưu tiên `main` cục bộ trước `origin/main` — main cũ cho FAIL exit 1 sai thay vì exit 2**
  Người dùng thấy gì: Trên máy một số kỹ sư nội bộ, công cụ kiểm tra nhánh phát triển có thể báo sai là không hợp lệ dù thực tế vẫn hợp lệ; hệ thống kiểm tra chính thức không bị ảnh hưởng, người dùng sản phẩm không thấy tác động.
  file: `scripts/fork/check-prototype-lane.sh`
  severity: low
  Đề xuất: known-limits

- **[VÒNG 5 — sổ sách] Signed dossier whose evidence report carries no human_signoff and empty Known-limits sections — pre-merge gate misclassifies it as machine-cleared and skips the staleness rule**
  Người dùng thấy gì: Công cụ duyệt tự động có thể hiển thị hồ sơ này là 'đã xong, không cần xem lại' dù báo cáo thật sự còn thiếu chữ ký và mục ghi chú hạn chế — người xem báo cáo dễ tin nhầm mọi việc đã hoàn tất.
  file: `_acceptance/mo-hoa-b01/evidence-report.md`
  severity: high
  Đề xuất: fix ở lượt ghi evidence cuối: điền `human_signoff` và hai mục Known limits / Ngoài hợp đồng vào evidence-report từ contract và file này (lỗi bộ tổng hợp kit để hai mục rỗng)

- **[VÒNG 5] decisions.jsonl timestamps are non-monotonic — two entries carry local time with a Z suffix**
  Người dùng thấy gì: Nhật ký thời điểm phê duyệt bị ghi lệch thứ tự do nhầm múi giờ, khiến ai đọc lại sau này có thể hiểu sai trình tự các lần ký, dù kết quả phê duyệt thực tế không đổi.
  file: `_acceptance/mo-hoa-b01/decisions.jsonl`
  severity: low
  Đề xuất: known-limits — hai dòng là sử liệu, không sửa lùi; dòng mới dùng UTC thật

- **[VÒNG 5 — máy không phân loại được] Hình 3: quan hệ conf → tên ảnh (AC-1) không được đo — token đỏ của E1 bỏ phần `$IMAGE` và không ca nào đổi conf rồi đòi ảnh suy ra đổi theo**
  Người dùng thấy gì: —
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: known-limits — cùng họ hình 3 với mục #4 đã ký; không mở thêm ca răng ở vòng chốt

- **[VÒNG 5 — máy không phân loại được] Hình 3 (quan hệ chưa đo): tip của dòng `Diff: <base>...<tip>` là hằng viết tay, guard chỉ đối chiếu base, không đối chiếu tip với nhánh đang kiểm**
  Người dùng thấy gì: —
  file: `scripts/fork/check-prototype-lane.sh`
  severity: low
  Đề xuất: known-limits — guard chỉ đối chiếu base; ràng tip với HEAD là việc của lần re-pin bảng nợ kế tiếp

- **[VÒNG 6] Five `app\.tongflow\.com` exemptions pin no context, so any new hosted-service link in README/CLAUDE passes**
  Người dùng thấy gì: Neu sau nay ai them mot lien ket moi toi dich vu app.tongflow.com vao README hoac CLAUDE.md, cong cu kiem dinh danh co the khong phat hien duoc, vi mot dong mien tru cu qua rong da am tham 'bao ke' cho lien ket moi do.
  file: `scripts/fork/fork-identity-allow.txt`
  severity: medium
  Đề xuất: known-limits — người ký chấp nhận theo luật chặn xoáy: năm dòng miễn trừ `app.tongflow.com` không ghim ngữ cảnh; siết là việc của lần re-pin allow-list kế tiếp

- **[VÒNG 7] Evidence ghim cd15d1d nhưng bốn file code có cổng đổi sau đó — bằng chứng không mô tả cây đang merge**
  Người dùng thấy gì: Báo cáo bàn giao ghi mốc mã cũ hơn mã thực sự sẽ lên nhánh chính, nên người ký có thể đang duyệt trên một phiên bản không đúng với những gì thật sự được gộp.
  file: `_acceptance/mo-hoa-b01/evidence-report.md`
  severity: high
  Đề xuất: đã xử ở lượt ghi này — evidence ghim lại HEAD sau vòng 8

- **[VÒNG 7] evidence-report.md bỏ trống human_signoff + Known limits + Ngoài hợp đồng → cổng đi nhánh «xanh-sạch, KHÔNG mời ký» và bỏ qua luôn phép kiểm staleness**
  Người dùng thấy gì: Vì báo cáo bàn giao còn thiếu vài mục, hệ thống tự động bỏ qua luôn bước dò xem mã có bị đổi sau khi ký hay không, nên rủi ro tương tự finding trước không được chặn lại.
  file: `_acceptance/mo-hoa-b01/evidence-report.md`
  severity: high
  Đề xuất: đã xử ở lượt ghi này — điền `human_signoff`, Known limits và Ngoài hợp đồng vào evidence-report

- **[VÒNG 7] Dòng sổ cái roadmap ghi «bộ răng 28 ca» / «24/28 ca» trong khi CASES hiện có 32 ca**
  Người dùng thấy gì: Một dòng ghi chú trong lộ trình dự án nêu sai số lượng phép kiểm hiện có; không ảnh hưởng gì tới tính năng đang bàn giao, chỉ là tài liệu nội bộ bị lệch số.
  file: `docs/roadmap.md`
  severity: low
  Đề xuất: đã sửa ở lượt ghi này — sổ cái ghi 32 ca (28 lúc ký, 4 thêm ở vòng 5–6)

- **[VÒNG 7] Env override FORK_IDENTITY_CONF/FORK_IDENTITY_ALLOW trỏ file không tồn tại → âm thầm rơi về mặc định và PASS**
  Người dùng thấy gì: Nếu ai đó gõ sai đường dẫn tới danh sách miễn trừ khi chạy công cụ kiểm định danh, công cụ sẽ âm thầm dùng danh sách mặc định thay vì báo lỗi rõ ràng — hạn chế này đã được người phụ trách biết và chấp nhận khi ký.
  file: `scripts/fork/check-fork-identity.sh`
  severity: medium
  Đề xuất: trùng Known limit #2 đã ký — known-limits

- **[VÒNG 7] Răng gọi `fixture` lặp trong vòng for mà không dọn probe cũ — rò 19 thư mục tạm mỗi lần chạy**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ để sót vài thư mục tạm sau mỗi lần chạy; không ảnh hưởng tới người dùng cuối, chỉ tích rác nhẹ trên máy chạy kiểm tra và người phụ trách đã chấp nhận không sửa.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: trùng Known limit #3 đã ký — wont-fix

- **[VÒNG 7] `if expect_red …; then …; fi || return 1` — vế `|| return 1` chết, vòng class-matrix không dừng ở mẫu hỏng đầu tiên**
  Người dùng thấy gì: Một đoạn logic 'dừng sớm' bên trong công cụ kiểm tra nội bộ không hoạt động như dự định, nhưng kết luận đúng/sai cuối cùng của phép kiểm không đổi — không ai bên ngoài nhận thấy khác biệt.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: wont-fix — phán quyết không sai, chỉ mất ý định dừng sớm

- **[VÒNG 7] Hình 3/5 — case_clean assert đếm N=3 + một tên, trong khi E6 hứa BA dòng miễn trừ tối thiểu CÓ TÊN và vế đỏ «miễn trừ tối thiểu vắng» không có ca răng**
  Người dùng thấy gì: Công cụ kiểm định danh mới đếm đủ số dòng miễn trừ chứ chưa xác nhận đúng tên hai dòng còn lại, và chưa có phép kiểm khi danh sách miễn trừ bị thiếu — người phụ trách đã biết và để treo việc này lúc ký.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: trùng hình 5 treo — known-limits

- **[VÒNG 7] Hình 5 — E7/E8 tuyên chiều đỏ của phép đếm và của needle mà không lệnh nào trong executor chạy**
  Người dùng thấy gì: Hai phép đo mô tả trong tài liệu kiểm tra thực ra không được máy chạy thật, người thẩm định chỉ đọc mã nguồn để kết luận đạt — hạn chế này đã được ghi nhận và chấp nhận trước khi ký.
  file: `_acceptance/mo-hoa-b01/evals.yaml`
  severity: medium
  Đề xuất: trùng Known limit #5 đã ký — known-limits

- **[VÒNG 7] Hình 5 — AC-5 hứa MỖI README ba điều kiện badge, răng chỉ có điểm-case cho 2 trong 3 điều kiện**
  Người dùng thấy gì: Bộ kiểm tra tự động chưa thử đủ mọi kiểu lỗi huy hiệu có thể xảy ra ở từng bản ngôn ngữ của trang giới thiệu, nên một số kiểu lỗi huy hiệu trong tương lai có thể lọt qua mà không bị phát hiện.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: known-limits — răng badge phủ 2/3 điều kiện mỗi README

- **[VÒNG 7] Hình 6 — răng ghi cứng `phanlemanh/OneFlow` dù đã suy REPO_RAW từ conf**
  Người dùng thấy gì: Vài phép kiểm tra nội bộ vẫn giả định đúng kho gốc của tác giả thay vì đọc từ cấu hình; nếu sau này đổi sang kho khác, các phép kiểm này có thể báo lỗi sai chỗ — hạn chế đã được chấp nhận không sửa.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: trùng Known limit #7 đã ký — wont-fix

- **[VÒNG 7] Hình 3 — «docker compose up -d --build» là đường chạy được, guard đo bằng grep -F toàn file**
  Người dùng thấy gì: Cách công cụ xác minh lệnh cài đặt Docker trong tài liệu hướng dẫn có thể bị đánh lừa nếu sau này ai đó vô tình viết một câu phủ định gần đó trong README — rủi ro cho việc bảo trì tài liệu sau này, không phải lỗi ngay lúc bàn giao.
  file: `scripts/fork/check-fork-identity.sh`
  severity: low
  Đề xuất: known-limits — guard grep toàn file, không neo vào khối lệnh

- **[VÒNG 7] Hình 3 — «đúng một hàng trong bảng nợ» đếm bằng grep chuỗi trên toàn opportunity.md, không giới hạn vào bảng**
  Người dùng thấy gì: Công cụ đếm hàng trong bảng ghi nợ kỹ thuật quét toàn bộ tài liệu thay vì chỉ đúng bảng đó, nên về sau có thể không phát hiện khi một dòng bị thiếu hoặc bị lặp ở đúng nơi cần kiểm tra.
  file: `scripts/fork/check-prototype-lane.sh`
  severity: low
  Đề xuất: known-limits — đếm trên toàn opportunity.md, không giới hạn trong bảng

- **[VÒNG 8] SECURITY.md declares private vulnerability reporting as the ONLY route, but it is disabled on the repo**
  Người dùng thấy gì: Trang hướng dẫn báo lỗi bảo mật hiện chưa có kênh nào thật sự nhận được báo cáo — người phát hiện lỗ hổng sẽ không biết gửi cho ai.
  file: `SECURITY.md`
  severity: high
  Đề xuất: ĐÃ BẬT 08/09 (owner bật Private vulnerability reporting, đo qua API: enabled=true) — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Every community link now points to GitHub Discussions, which is not enabled (404)**
  Người dùng thấy gì: Bấm vào liên kết Hỏi đáp cộng đồng có thể dẫn tới một trang không tồn tại vì tính năng Thảo luận chưa được bật cho kho này.
  file: `.github/ISSUE_TEMPLATE/config.yml`
  severity: high
  Đề xuất: ĐÃ BẬT 08/09 (owner bật Discussions, đo qua API: has_discussions=true, trang trả 200; Known limit #1 hết hiệu lực) — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] New ledger row is separated from the roadmap-ledger table by a blank line — it renders outside the table**
  Người dùng thấy gì: Dòng mới thêm vào bảng lộ trình có thể hiển thị lệch định dạng, khiến người đọc tài liệu lộ trình khó nhận ra hàng mới.
  file: `docs/roadmap.md`
  severity: medium
  Đề xuất: đã sửa ở lượt ghi này — xoá dòng trống trước hàng sổ cái — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] CODE_OF_CONDUCT.md still routes enforcement reports to upstream's business@tongflow.com**
  Người dùng thấy gì: Nếu có người muốn báo cáo vi phạm quy tắc ứng xử trong cộng đồng, email liên hệ ghi trong tài liệu vẫn trỏ về tổ chức gốc thay vì đội ngũ hiện tại, nên báo cáo có thể không tới đúng người xử lý.
  file: `CODE_OF_CONDUCT.md`
  severity: medium
  Đề xuất: nợ có tên — CODE_OF_CONDUCT.md không thuộc diện miễn T1 nên sửa là evidence ôi; sửa ở lượt kế cùng việc đưa file vào FILES của guard — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Teeth suite leaks a scratch dir per extra fixture() call (measured 8 dirs / class-matrix, ~22 per full run)**
  Người dùng thấy gì: Mỗi lần chạy bộ tự kiểm tra nội bộ để sót lại vài tệp tạm không dọn dẹp trên máy — không ảnh hưởng gì tới người dùng sản phẩm.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: wont-fix — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Ledger prose says the teeth suite has 28 cases; the script declares and runs 32**
  Người dùng thấy gì: Tài liệu lộ trình ghi nhầm số lượng ca kiểm tra nội bộ (28 thay vì 32) — chỉ là sai sót mô tả, không ảnh hưởng vận hành.
  file: `docs/roadmap.md`
  severity: low
  Đề xuất: đã sửa ở lượt ghi này — sổ cái ghi 32 ca — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Hình 5 — class-matrix quét đủ 8 mẫu nhưng chỉ trên MỘT file; chiều FILES của lớp không có ma trận, gỡ file khỏi FILES răng vẫn 32/32**
  Người dùng thấy gì: Bộ tự kiểm tra nội bộ có thể không phát hiện được nếu định danh cũ của bên gốc lọt vào một vài tệp cấu hình cụ thể, dù nó vẫn bắt tốt ở phần lớn các tệp khác.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: high
  Đề xuất: known-limits — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Hình 2 — fixture tag-trigger-back viết tay đúng khuôn awk/grep của guard; trigger tags dạng flow-style hợp lệ vẫn xanh**
  Người dùng thấy gì: Bộ tự kiểm tra có thể không phát hiện được nếu ai đó vô tình bật lại chế độ phát hành theo tag phiên bản bằng một cách viết cấu hình khác kiểu thông thường.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: known-limits — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Hình 4 — E8 expected ghim token `RED của check-fork-identity.sh: ảnh container` mà không script nào in; vế đỏ của needle mới chỉ còn mã thoát + dòng tổng**
  Người dùng thấy gì: Một số phép kiểm nội bộ được xác nhận bằng cách đọc mã thay vì thật sự chạy thử, nên có thể bỏ sót lỗi thực tế trong tương lai.
  file: `_acceptance/mo-hoa-b01/evals.yaml`
  severity: medium
  Đề xuất: known-limits — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Hình 4 — nhánh đỏ `ghi công upstream mất khỏi NOTICE.md` không ca răng nào ghim; notice-attribution-gone kích cả hai FAIL nhưng chỉ ghim bánh cóc**
  Người dùng thấy gì: Khi phần ghi công tác giả gốc trong tệp NOTICE bị xoá, bộ tự kiểm tra vẫn báo lỗi đúng, nhưng thông điệp lỗi hiển thị chưa khớp sát với đúng chỗ hỏng, gây khó dò lỗi sau này.
  file: `scripts/fork/check-fork-identity.sh`
  severity: low
  Đề xuất: known-limits — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Hình 1 — check-suite-key.sh khẳng định «executor GỌI script» bằng `script not in str(cmd)`; đo chỉ dẫn, không chạy (đã ghi review-findings, wont-fix)**
  Người dùng thấy gì: Bộ kiểm tra xác nhận một bước có gọi đúng kịch bản bằng cách so khớp văn bản đơn giản, nên vẫn có thể bị đánh lừa bởi một dòng lệnh viết khéo.
  file: `scripts/fork/check-suite-key.sh`
  severity: medium
  Đề xuất: wont-fix — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Hình 5 — case_clean đếm N=3 + ghim MỘT tên trong khi E6 hứa BA dòng miễn trừ có tên «không phải một con số N» (đã ghi review-findings, chưa phân loại)**
  Người dùng thấy gì: Có ba dòng miễn trừ liên quan tới bản phát hành desktop mà bộ tự kiểm tra hiện chưa xác minh đầy đủ từng dòng — người ký đã ghi nhận đây là việc còn treo, cần được quyết định riêng ở một phiên sau.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: medium
  Đề xuất: new-contract — theo luật chặn xoáy (nợ có tên, không vòng 9)

- **[VÒNG 8] Hình 6 — răng ghim cứng `phanlemanh/OneFlow` ở ba ca dù đã đọc REPO_RAW từ conf (đã ghi review-findings, wont-fix)**
  Người dùng thấy gì: Vài ca kiểm tra nội bộ vẫn ghi cứng tên kho của tác giả thay vì tự suy ra từ cấu hình — chỉ gây ảnh hưởng nếu có người khác fork lại kho này để dùng dưới tên khác.
  file: `scripts/fork/check-fork-identity-teeth.sh`
  severity: low
  Đề xuất: wont-fix — theo luật chặn xoáy (nợ có tên, không vòng 9)

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

### Hình 5 — E6 hứa ba dòng miễn trừ tối thiểu CÓ TÊN («không phải một con số N») nhưng case_clean assert đếm N=3 + một tên; hai dòng desktop-release không được ghim, vế đỏ `miễn trừ tối thiểu vắng` không có ca răng
- file: `scripts/fork/check-fork-identity-teeth.sh:114`
- severity: medium
- source: measurement

Detail: E6 expected (evals.yaml:89-91) liệt kê ba dòng có tên: `NOTICE.md|fork of…`, `.github/workflows/desktop-release.yml|app\.tongflow\.com`, `.github/workflows/desktop-release.yml|TongFlow-(mac|win)` và nhấn «không phải một con số N». case_clean dòng 113-114 chỉ `grep -c '^miễn trừ tối thiểu:'` rồi `[ $n -eq 3 ]`, dòng 115 grep đúng MỘT tên (`NOTICE.md|`). Đã tái lập trên bản sao HEAD: đổi MIN_EXEMPT[2] trong guard (dòng 142) từ `desktop-release.yml|TongFlow-(mac|win)` sang `CLAUDE.md|app\.tongflow\.com` (một dòng allow-list khác) → `CASE clean: PASS`. Guard dòng 136-138 tự ghi «A count alone cannot tell attribution kept from something else exempted» — răng lại đo đúng bằng count. Thêm nữa: ba dòng có tên nằm trong `$probe/.out` (bị rm ở cleanup), stdout của `--case clean` chỉ có `CASE clean: PASS`, nên ô đo E6 (mhb_teeth_ratchet, config.yaml:379) cũng không quan sát được chúng. Nhánh đỏ `fail "miễn trừ tối thiểu vắng"` (guard dòng 152) không có ca nào trong CASES phá tới.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
