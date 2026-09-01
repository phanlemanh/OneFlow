---
schema_version: 1
feature: Đăng ký fork oneflow-api-openai vào manifest chính thức
slug: dang-ky-fork-openai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [config, docs, ci]
status: implemented
approved_by: Phan Le Manh (mo pham vi AC-9/AC-10 tai Cong 2 vong 1, 2026-09-01)
veto_state: mo
veto_opened_at: 2026-09-01T09:10:23Z
design_doc: docs/superpowers/specs/2026-09-01-dang-ky-fork-openai-design.md
---

# Acceptance Contract: dang-ky-fork-openai

OpenAI khai tử bốn model phiên âm ngày 26/08/2026 (tắt hẳn 26/02/2027) — đúng bằng
**toàn bộ** danh sách `transcribe` của `tongflow-api-openai`. Không đẩy được vào
`tong-io` (đo: `push=false`), nên theo ADR-0007 plugin được fork sang
`phanlemanh/oneflow-api-openai`. Hồ sơ này lo **nửa trong kho**: làm cho manifest,
hàng rào và tài liệu biết đến id mới, và dựng thước cho chỗ trước nay không ai canh.

Phần lớn code đã có ở commit `b96ef5b` trước khi hồ sơ này tồn tại. Việc còn lại:
vá `CLAUDE.md` (một hàng rào có sẵn đang đỏ vì nó), và dựng hàng rào README ↔ manifest.

## Acceptance criteria

**AC-1 — Manifest mang fork đúng hình dạng.**
Given `config/official-plugins.json`,
When đọc bằng hàng rào đếm của kho,
Then nó chứa đúng **35** mục chuỗi trần dưới org mặc định **cộng 4** mục `origin`,
và tập id `origin` là `{oneflow-api-ffmpeg, oneflow-api-openai, oneflow-api-pyscenedetect, oneflow-modal-compose-overlay}`.

**AC-2 — Hàng rào không bị nới ra để cho qua.**
Given `check-manifest-unmoved.sh` sau khi sửa số đếm,
When `check-manifest-guard-teeth.sh` phá bản sao manifest sáu kiểu,
Then hàng rào **đỏ ở cả sáu**, không kiểu nào lọt.

**AC-3 — `CLAUDE.md` nói đúng điều hàng rào đang enforce.**
Given `CLAUDE.md` là thứ mọi agent đọc đầu phiên,
When `check-manifest-doc-synced.sh` rút con số ra khỏi hàng rào rồi đối chiếu,
Then đoạn văn về hàng rào nêu **35**, có mô tả nửa `origin`, và không còn bảo người đọc
sửa một biến `expected_count` đã không tồn tại. Ba mệnh đề này là **đúng bằng** điều
thước có sẵn enforce — không hơn: nó đòi CỤM TỪ `origin entr(y|ies)` chứ không đòi con
số. Tập id `origin` là việc của AC-6, đo bằng thước riêng, để không phải sửa một hàng
rào thuộc hồ sơ khác (`civ_*`) và mở lại staleness của hồ sơ đó.

**AC-4 — Ba README liệt kê đúng tập plugin của manifest, đúng org. (mới)**
Given `README.md`, `docs/README_ZH.md`, `docs/README_JA.md`,
When đối chiếu từng dòng `- [<id>](https://github.com/<org>/<id>)` với manifest,
Then tập id **bằng nhau hai chiều** với manifest ở **cả ba** README; và org trong URL
khớp theo **hình dạng mục**: mục chuỗi trần trỏ org mặc định, mục object trỏ đúng org
của `origin` nó khai.

**AC-5 — Hàng rào tài liệu có răng, theo ma trận có tên ô.**
Given một bản sao cây bị phá,
When chạy **bảy ca có tên**: `healthy` (đối chứng dương) · `readme-missing` ·
`readme-extra` · `org-sai-chuoi-tran` · `org-sai-muc-origin` · `claude-stale-id` ·
`khong-tuyen-qua`,
Then ca `healthy` **xanh** và sáu ca còn lại **đỏ khi vật hỏng**, mỗi ca nêu **đích
danh id** và **tên file** gây lỗi — và phép khớp chỉ đọc **dòng bắt đầu bằng `FAIL:`**,
không đọc toàn bộ stdout: chế độ `readme` luôn in `README.md: 39 id extracted` ở lượt
lành, nên khớp tên file trên dòng bất kỳ là thoả vô điều kiện, tức đo chuỗi-có-mặt cho
một lời hứa về quan hệ. Hai ca org bắt buộc riêng rẽ vì luật org có hai nửa. Tên ca lạ
→ thoát 2. Phạm vi khai thẳng: các ca phá chỉ chạm chế độ `readme` và `claude`;
chế độ `orphans` **không có ca đỏ** — xem Known limits.

**AC-6 — `CLAUDE.md` liệt kê đúng tập id `origin`, và phép đo chứng minh nó đã quét. (mới)**
Given đoạn văn về hàng rào trong `CLAUDE.md` viết id dưới dạng nháy ngược, **không**
theo hình dạng dòng README,
When rút id bằng bộ rút riêng cho hình dạng đó rồi đối chiếu với tập id `origin` của
manifest,
Then hai tập **bằng nhau** (bốn id, có `oneflow-api-openai`); và thước **ghim số id rút
được** trong đầu ra — vì bộ rút sai hình dạng sẽ rút 0 phần tử rồi thoát 0, tức xanh
trên vật rỗng.

**AC-7 — Nhánh này không để lại icon lạc mới.**
Given `public/plugins/` ở `origin/main` đã có sẵn **ba** file `.svg` không ứng với id
nào trong manifest (`tongflow-modal-ffmpeg`, `-pyscenedetect`, `-sensenova-u1`),
When so tập file lạc ở HEAD với tập lạc ở `origin/main`,
Then HEAD **không thêm** file lạc nào. Luật phát biểu theo **delta** chứ không theo
tuyệt đối, vì đòi 0 file lạc là làm CI đỏ vì ba lỗi có sẵn ngoài phạm vi.
Lưu ý `tongflow-api-openai.svg` **không** nằm trong ba file đó: ở base nó ứng với một
id manifest hợp lệ, chỉ trở thành lạc SAU khi nhánh này thay mục ấy — nên nó là orphan
do chính nhánh này sinh, và đã bị xoá ở S3.

**AC-8 — Nhánh này không để hồ sơ nào khác mang bằng chứng ôi.**
Given tôi chạm `scripts/plugins/**`, nằm trong phạm vi hẹp của hồ sơ `conformance-l0`,
When chạy `scripts/acceptance/check-resign-wave.sh dang-ky-fork-openai origin/main`,
Then **không hồ sơ đã ký nào khác** còn mang bằng chứng có trước code của nhánh này —
cụ thể `conformance-l0` đã re-pin đúng khuôn (dòng `kind:"repin"` trong run-log, `sha`
khớp `verified_commit` mới, `suites_exit` toàn 0), chữ ký người không bị đụng.

## Coverage

Quét hình thái (`morphological-scan`, preset entity-feature) trên câu hỏi
**"một danh tính plugin được chép ở bao nhiêu nơi, và lệch bằng những cách nào?"**

- **Trục A — nơi ghi danh tính:** manifest · hàng rào đếm · `CLAUDE.md` · ba README ·
  icon `public/plugins/` · thư mục `plugins/` trên đĩa.
  *[CE: `CLAUDE.md` §"Registering an official plugin" tự liệt kê năm nơi và gọi hàng
  rào là "a fourth coupled constant"; cộng `git grep` tìm nơi thứ sáu — thước có thật,
  không suy đoán.]*
- **Trục B — kiểu lệch:** thiếu · thừa · sai số đếm · sai hình dạng (chuỗi trần ↔
  object) · sai org · sai thứ tự.
  *[CE: `check-manifest-guard-teeth.sh` đã liệt kê sẵn sáu phép phá — bảng kiểu-lệch
  do feature trước viết ra, không phải tôi bịa.]*
- **Trục C — ai phát hiện:** hàng rào máy · bộ quét SDK lúc chạy · chỉ người đọc ·
  **không ai**.
  *[CE: chạy thật từng hàng rào trên `b96ef5b` — kết quả in trong design doc §3.]*

**Ô Core → AC:** A-manifest×B-hình-dạng → AC-1 · A-hàng-rào×C-máy → AC-2 ·
A-CLAUDE×B-số-đếm → AC-3 · A-README×{B-thiếu,B-thừa,B-org} → AC-4, răng ở AC-5 ·
A-CLAUDE×B-thừa → AC-6 · A-icon×B-thừa → AC-7 · re-pin → AC-8.

**Phản biện context sạch đã dịch chuyển bảng này.** Bản quét đầu để `public/plugins/`
và `CLAUDE.md` nằm trong Given của một AC duy nhất mà phép đo chỉ với tới bốn file văn
bản — hai ô rơi vào **C-không-ai** trong khi hợp đồng tuyên là đã phủ. Đo lại xác nhận
cả hai đều có lỗ THẬT (một orphan `.svg` do chính nhánh này để lại; `CLAUDE.md` viết id
theo hình dạng mà bộ rút không bắt được). Tách thành AC-6 và AC-7 với thước riêng.

**Ô rơi vào C-không-ai và bị cắt, có lý do:**
- *icon* — 3/4 fork đã thiếu icon, nên icon-tồn-tại **không phải bất biến của kho**;
  dựng thước cho nó là bịa luật rồi làm CI đỏ vì ba lỗi có sẵn.
- *`plugins/` trên đĩa* — gitignored, CI không có; đo được trên máy này
  (`transcribe -> ['oneflow-api-openai']`, models `['gpt-transcribe']`, 0 lỗi) nhưng
  **không** đo được ở chốt chặn. Ghi là số đo tay, không giả vờ là thước.
- *thứ tự mục README* — giòn, không chịu lực.

## Out of scope

- Nội dung của chính fork ngoài kho (danh sách model, `TONGFLOW_DEFAULT_SLOTS`) — kho
  khác, không phải vật của hồ sơ này.
- Icon **thiếu** cho `oneflow-api-ffmpeg` / `-pyscenedetect` / `-compose-overlay`, và ba
  file `.svg` **lạc** có sẵn ở `origin/main`. AC-7 chỉ đòi nhánh này không làm tập lạc
  TĂNG; dọn nợ cũ là việc riêng.
- Hàng rào chặn model đã khai tử (việc riêng, đáng làm).
- Thứ tự mục trong danh sách README.
- Bốn tham chiếu lịch sử tới `tongflow-api-openai` ngoài `_acceptance/` — giữ nguyên
  cố ý, xem AC-6.

## Notes

- **Việc-của-người ở Cổng 2 (không có thước máy):** `scripts/pre-merge-check.sh . --base
  origin/main` phải sạch trước khi gộp. Điều này **cố ý không** là một AC — kho đã đo nó
  bất khả từ trong vòng verify (`_acceptance/config.yaml:490`, AC-11 amended 05/08, Cổng 2,
  Manh): bộ kiểm vi phạm trên chính feature đang bay ở cả ba trạng thái nó có thể ở, kể cả
  một PASS mà người verify bị cấm điền chữ ký. AC-8 đo nửa với-tới-được; nửa sau chữ ký do
  người bấm merge kiểm.
- **Số đo tay, không phải thước:** trên máy này bộ quét thật trả `transcribe ->
  ['oneflow-api-openai']`, `models=['gpt-transcribe']`, 0 lỗi. `plugins/` gitignored nên CI
  không có vật để đo — ghi ra chứ không giả vờ là bằng chứng máy.

- **`orphans` mode không có chiều đỏ.** Ca `orphan-them-moi` đã bị **rút** ở vòng 3: nó
  ghi một `.svg` thăm dò vào `public/plugins/` của **cây thật**, trong khi bộ điều phối
  verify chạy các ô máy **song song** — nên ô E7 (quét đúng thư mục đó) có thể thấy vật
  thăm dò và báo `added 1`, một REJECT giả không có lỗi sản phẩm nào phía sau. Phá nó
  cho tử tế cần `orphans` nhận một thư mục để quét; đó là việc riêng. Cho tới lúc đó,
  E7 là một khẳng định **chưa từng đỏ**.
- **Hai thước mới chỉ chạy trong lúc hồ sơ này được verify.** `check-live-docs-manifest-*`
  được nối vào `dkfo_*` của riêng hồ sơ này, **không** vào `ci.yml`, **không** vào
  `feature_loop.suite_keys`. Ký xong là ba README trở lại trạng thái không ai canh —
  đúng trạng thái mà AC-4 sinh ra để chấm dứt. Kho đã chẩn đúng bệnh này ngày 31/08
  (`ci.yml` §"ran only when somebody typed them"); bản vá là thêm hai step vào job
  `Acceptance Gate` sẵn có. Cố ý để lại: thêm mã mới ở vòng 3 là đúng cái khuôn vừa
  chứng minh là không hội tụ.
- **`.gitignore` có `*.bak` nhưng không thước nào canh.** AC-9/AC-10 và
  `scripts/ci/check-no-tracked-backups.sh` đã bị **rút** ở vòng 3. File rác gây chuyện
  (`_acceptance/config.yaml.bak`) đã gỡ khỏi index và quy tắc ignore đã có, nên rủi ro
  còn lại là tái phạm qua `git add -f`.
- **Ba chỗ trôi nhỏ trong mã có sẵn, không thuộc phạm vi:**
  `check-manifest-doc-synced.sh` neo bằng `head -1` (an toàn hôm nay vì `CLAUDE.md` chỉ
  còn **một** dòng nhắc `check-manifest-unmoved` — vòng 3 đã gỡ dòng thứ hai mà chính
  tôi tạo ra); nhãn ca 5 của `check-manifest-guard-teeth.sh` vẫn ghi "a 37th plain
  string" trong khi số đếm nay là 35 nên phép phá tạo ra cái thứ 36; đối chứng dương
  của bộ răng chỉ phủ chế độ `readme`.
- **Vòng verify không hội tụ — dừng bằng quyết định người, không bằng cạn round.** Vòng
  1 và vòng 2 sinh finding **cùng lớp** (assert chuỗi-có-mặt thay cho quan hệ · tuyên
  quá số ca đã chạy · văn xuôi nói sai so với phép đo), vì mỗi vòng sửa lại viết thêm
  **mã đo**, mà mã đo chính là nơi lớp lỗi đó sống. Owner chọn **thu phạm vi** ở vòng 3
  theo `STOP-PATCHING-CLAUSE`. 13 finding của vòng 2 đi tiếp thành một hồ sơ cơ hội
  riêng, làm tử tế kèm nối CI.
