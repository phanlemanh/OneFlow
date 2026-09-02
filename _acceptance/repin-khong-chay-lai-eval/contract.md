---
schema_version: 1
feature: Làm độ trôi eval sau re-pin tính được và bắt được
slug: repin-khong-chay-lai-eval
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, acceptance]
status: implemented
approved_by:
gate1_skipped: true
veto_state: mo
veto_opened_at: 2026-09-02T13:39:48Z
design_doc: docs/superpowers/specs/2026-09-02-repin-khong-chay-lai-eval-design.md
---

# Acceptance Contract: repin-khong-chay-lai-eval

Re-pin chạy lại bộ lệnh máy rồi dời `verified_commit`, nhưng không chạy lại ô đo nào —
33/33 dòng repin mang đúng năm khoá, không có chỗ cho kết quả eval. Nên một hồ sơ **đã
ký** có thể tuyên một đầu ra mà lệnh của nó không còn sinh ra, và không thước nào đỏ.
Việc này không sửa nghi thức (nó thuộc kit, kho không sở hữu) mà **làm việc bỏ qua nó
hiện ra**.

## Acceptance criteria

**AC-1 — Kho tự sở hữu đường GHI dòng repin, và nó ghi `prev_sha`.**
Given nghi thức re-pin sống trong SKILL của gói `feature-loop` mà kho **không sở hữu**,
nên nếu chỉ đọc thì không dòng repin mới nào có `prev_sha` và hàng rào **trơ vĩnh viễn**,
When chạy chế độ `write` với slug và sha mới,
Then nó append một dòng repin hợp khuôn **kèm `prev_sha`** lấy từ `verified_commit`
đang có của hồ sơ đó, và từ chối (thoát khác 0, nêu lý do) khi `verified_commit` vắng
hoặc không phân giải được. Đây là AC chịu lực nhất: thiếu nó thì mọi AC còn lại đo một
hàng rào không bao giờ nổ.

**AC-2 — Dòng repin MỚI phải có `prev_sha`; dòng cũ đi đường ông bà.**
Given 33 dòng repin lịch sử không có trường ấy,
When so `run-log.jsonl` của mọi hồ sơ với bản ở `origin/main` và xét các dòng repin
**mới thêm**,
Then mỗi dòng mới phải có `prev_sha`; dòng đã tồn tại ở base **không** bị đòi. Luật
**delta**, cùng khuôn với chế độ `orphans` của hàng rào icon: đòi tuyệt đối là làm CI
đỏ vì 33 dòng lịch sử.

**AC-3 — Luật khớp `paths` được ĐỊNH NGHĨA và đo ở cả bốn hình dạng.**
Given `paths` trong kho hiện có bốn hình dạng — đường dẫn trần (`README.md`) · glob
(`scripts/**`) · **thư mục trần** (`_acceptance`, chính evals của hồ sơ này dùng) · và
tiền tố có `*`,
When một file trong diff được đối chiếu với một mục `paths`,
Then luật là: **khớp nếu file bằng đúng mục, hoặc nằm trong cây con của mục, hoặc khớp
glob của mục** — và cả bốn hình dạng phải có ca **chạm** lẫn ca **không chạm**. Không
định nghĩa thì `_acceptance` chỉ khớp đúng chuỗi ấy, mọi mục kiểu thư mục thành
**không bao giờ bị chạm**, và hàng rào under-report ở đúng lớp hồ sơ đông nhất.

**AC-4 — Bộ hoạch định trả về ĐÚNG TẬP id, không phải một con số.**
Given một hồ sơ fixture có tên với tập eval biết trước và một cặp sha biết trước,
When chạy chế độ `plan`,
Then nó in **BA tập id**: bị chạm · không bị chạm · **không kết luận được** (eval không
khai `paths`) — so bằng phép so tập chứ không phải chuỗi-có-mặt. Ba chứ không hai: đo
02/09 cho thấy **145/502** eval trong hồ sơ đã ký không khai `paths`, và luật an toàn
"không khai thì luôn bị chạm" — đúng khi một vòng verify quyết chạy lại gì — làm hàng
rào này nuốt cả 145 ô ấy ở **mọi** lần ghim, vĩnh viễn. Một phán quyết luôn nổ thì không
nói gì. Gộp chúng vào "bị chạm" là một phán quyết sai; gộp vào "không chạm" là một loại
trừ im lặng; hạng mục có tên kèm số là **dữ liệu**. Thêm một file vào diff phải làm **đúng một** id chuyển
từ tập sau sang tập trước. Chỉ đếm số thì một bộ giao trả về *cả tập* cũng in đúng con
số ấy.

**AC-5 — Hàng rào ĐỎ khi một repin nuốt mất một eval bị chạm.**
Given một dòng repin có `prev_sha`, và giữa hai sha có file chạm `paths` của eval X,
When chạy chế độ `check` mà run-log **không** có bản ghi chạy lại X mang cùng `run_id`,
Then hàng rào **đỏ** và nêu đích danh slug, `run_id`, và từng id eval bị nuốt.

"Đã chạy lại" nghĩa là run-log của hồ sơ có một dòng `{"kind":"eval","eval":<id>,
"sha":<X>}` với `X` **bằng sha của lần ghim hoặc là hậu duệ của nó** — KHÔNG phải "cùng
`run_id` với lần ghim". Luật chặt hơn ấy không thoả được một cách trung thực cho một lần
ghim đã xảy ra: cách duy nhất làm nó xanh là ghi một lượt chạy dưới một `run_id` cũ, tức
bịa xuất xứ. Câu hỏi thật sự là "ô này đã được đo lại SAU thay đổi chưa", và câu ấy trả
lời được bằng cách chạy nó thật bây giờ. Hình dạng và đường dẫn khai ở đây **trước khi
viết mã**, vì một bộ đọc tra sai chỗ vẫn làm mọi fixture tự dựng xanh.

**AC-6 — `check` in NĂM con số độc lập, và số "tính được" phải > 0 trên kho thật.**
Given trên kho hôm nay cả 33 dòng repin đều thiếu `prev_sha`, nên nhánh chính của hàng
rào **chưa từng chạy trên dữ liệu thật**,
When chạy `check` sau khi vòng này ghi ít nhất một dòng repin bằng chế độ `write`,
Then đầu ra ghim **sáu** số: hồ sơ đã quét · dòng repin đọc được · **dòng tính được
(> 0)** · dòng ông bà · eval bị nuốt · **eval không kết luận được**. Bốn số đầu tiên tôi định in đều thoả bởi một
script chỉ đếm dòng rồi xếp tất cả vào nhánh ông bà — con số thứ ba là thứ phân biệt
"phát hiện `prev_sha` chạy đúng" với "phát hiện `prev_sha` là no-op".

**AC-7 — Bên đọc dòng repin không hỏng vì trường mới, đo trên CÂY THẬT.**
Given `recheck-evidence.cjs` và `pre-merge-check.sh` đều parse dòng repin,
When chạy `pre-merge-check.sh . --base origin/main` hai lượt — một trước, một sau khi
thêm `prev_sha` vào một dòng,
Then đầu ra hai lượt **giống nhau từng byte**. Đo quan hệ trước/sau trên cây thật, không
phải "cả hai chấp nhận" trên kho dùng-rồi-bỏ. Đối chứng dương chứng minh phép thử thấy
được đỏ: **bỏ khoá `sha`** khỏi dòng repin phải làm cả hai bên đọc đỏ.

**AC-8 — Hàng rào có răng, ma trận ca có tên.**
Given một kho git dùng-rồi-bỏ,
When chạy `teeth` với **mười** ca có tên — `healthy` · `nuot-eval` · `da-chay-lai` ·
`ong-ba` · `khong-khai-paths` · `paths-thu-muc-tran` · `paths-glob` ·
`write-thieu-verified-commit` · `plan-tap-id` · `plan-them-mot-file`,
Then mỗi ca in `CASE <tên>: PASS`, ca đỏ nêu đích danh id eval, và dòng chốt **đếm đúng
số ca đã chạy**. Sáu ca là **đối chứng dương** (mong xanh) — `da-chay-lai` phân biệt "bắt
được việc nuốt" với "đỏ mọi thứ"; `khong-khai-paths` phân biệt "hạng mục không kết luận
được" với "nuốt"; hai ca `plan` phân biệt một bộ giao đúng với một bộ giao trả **cả tập**.
Lượt `--case` lẻ in `PARTIAL: n/10`, không in `OK:`; tên ca lạ → thoát 2.

**AC-9 — Nhánh này không để hồ sơ nào khác mang bằng chứng ôi.**
Given chạm vùng gated làm **3** hồ sơ hoá ôi (đo 02/09 bằng mô phỏng ở ba thư mục),
When chạy `check-resign-wave.sh repin-khong-chay-lai-eval origin/main`,
Then không hồ sơ đã ký nào khác còn mang bằng chứng có trước code của nhánh này.

## Coverage

Quét trên câu hỏi **"độ trôi sau re-pin trốn được ở đâu?"**

- **Trục A — nơi thông tin mất:** dòng repin (không có sha cũ) · khai `paths` của eval
  (thiếu thì không loại trừ được) · run-log (không có bản ghi chạy lại) · văn bản đầu
  ra trong báo cáo đã ký.
  *[CE: đo 02/09 — 33/33 dòng repin mang đúng năm khoá; 357/502 eval khai `paths`;
  `recheck-evidence.cjs` 0 lần `execSync`.]*
- **Trục B — kiểu trôi:** eval bị chạm mà không chạy lại · eval không khai `paths`
  (an toàn nhưng đắt) · repin không có `prev_sha` (không tính được).
  *[CE: ca đã xảy ra thật — `dang-ky-fork-openai` E5, `7/7` → `9/9`, re-pin ba lần.]*
- **Trục C — ai phát hiện:** hàng rào có sẵn (**không cái nào**) · hàng rào mới · người
  đọc review.
  *[CE: `check-resign-wave` so sha nên xanh; `recheck-evidence` chỉ đọc file; lỗ này do
  một hội đồng review tìm ra, không do thước nào.]*

**Ô Core → AC:** A-dòng-repin × ai-GHI → AC-1 (đường ghi) và AC-2 (dòng mới phải có) ·
A-khai-paths × luật-khớp → AC-3 · B-không-khai-paths → AC-4 · A-run-log ×
B-không-chạy-lại → AC-5 · B-không-prev_sha → AC-6 (đếm ông bà **và** đòi số tính được
> 0) · A-bên-đọc → AC-7 · C-hàng-rào-mới → AC-8 · re-pin → AC-9.

**Phản biện context sạch đã dịch chuyển bảng này, và nó là dịch chuyển lớn.** Bản quét
đầu chỉ hỏi "đọc được gì" và bỏ sót ô **ai GHI**. Hệ quả nếu không sửa: nghi thức ghim
nằm trong kit, kho chỉ đọc, nên không dòng repin mới nào có `prev_sha` và hàng rào
**trơ vĩnh viễn** — số ông bà 33→34→35, số tính được đứng 0, và câu "co lại theo thời
gian" mà tôi viết vào cả design lẫn AC sai **từ ngày merge**. AC-1 và AC-2 sinh ra từ
lỗ đó; AC-6 mang thêm điều kiện `> 0` để chính ô đo không thoả được bằng một script trơ.

**Ô cắt, có lý do:** A-văn-bản-đầu-ra × B-khác-nội-dung — so đầu ra đã ghi với một lượt
chạy tươi đòi **chạy lại** eval, mà việc này cố ý không tự chạy lại (xem Out of scope).
Hàng rào chỉ bắt *việc bỏ qua*, không tự làm thay.

## Out of scope

- **Tự chạy lại eval.** Hàng rào bắt việc bỏ qua; ai chạy lại và khi nào là quyết định
  của người ghim. Một hàng rào tự chạy 40 eval là một vòng verify đội lốt.
- **Dọn 40 ô đang nợ.** Chúng đi đường ông bà, co lại ở lần re-pin kế của từng hồ sơ;
  mẫu 8 ô cho thấy 0 đỏ nên chưa cháy.
- **Sửa nghi thức re-pin trong kit.** Kho không sở hữu gói `feature-loop`. Đường ghi
  phía kho (AC-1) **không** thay nghi thức: nó là một cách gõ dòng repin đúng hơn cách
  gõ tay hiện nay, và kit vẫn ghi được dòng của nó — dòng thiếu `prev_sha` chỉ rơi vào
  đường ông bà, không vi phạm.
- **Quyết "đầu ra khác thì làm gì".** Hàng rào đỏ và nêu tên; cập nhật bằng chứng đã ký
  hay mở vòng mới là việc của người.
- **Nối hàng rào vào `ci.yml` ở vòng này.** Vòng trước vừa thêm bốn step; thêm nữa
  ngay là chồng thay đổi lên một job vừa đổi. Để lần sau, khai ở Known limits.

## Đường đo

| Ngưỡng ở `opportunity.md` | Số từ đâu | AC nào bảo đảm |
|---|---|---|
| Re-pin chạm `paths` của eval đã ký thì **tự chạy lại đúng eval đó** | không đo được ở vòng này — hàng rào **bắt** việc bỏ qua, không tự chạy | AC-5 (bắt) — vế "tự chạy lại" **CHƯA ĐO**, khai rõ chứ không giấu |
| Dựng lại đúng ca đã xảy ra (bộ răng 7→9 rồi re-pin) | ca `nuot-eval` của bộ răng dựng đúng hình dạng ấy trên kho dùng-rồi-bỏ | AC-8 |
| CHẾT: re-pin hoá đắt tới mức phải bỏ qua | hàng rào không chạy eval nào nên chi phí ~0 | AC-5 (thiết kế), AC-6 (in số để thấy) |
| **Hàng rào có bao giờ nổ được không** — thêm sau phản biện | số "dòng tính được" trên kho thật, phải > 0 | AC-1 (đường ghi) + AC-6 (`> 0`) |

Ngưỡng thứ nhất là **ô CHƯA ĐO** của Cổng Giá trị: vòng này cố ý dừng ở "bắt được",
không làm "tự chạy lại". Khai ở đây thay vì để Cổng Giá trị đọc một bảng trống.

## Notes
