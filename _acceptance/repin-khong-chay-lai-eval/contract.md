---
schema_version: 1
feature: Làm độ trôi eval sau re-pin tính được và bắt được
slug: repin-khong-chay-lai-eval
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, acceptance]
status: signed-off
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

**AC-6 — `check` in TÁM con số độc lập, và số "tính được" phải > 0 trên kho thật.**
Given trên kho hôm nay cả 33 dòng repin đều thiếu `prev_sha`, nên nhánh chính của hàng
rào **chưa từng chạy trên dữ liệu thật**,
When chạy `check` sau khi vòng này ghi ít nhất một dòng repin bằng chế độ `write`,
Then đầu ra ghim **tám** số: hồ sơ đã quét · dòng repin đọc được · **dòng tính được
(> 0)** · dòng ông bà · eval bị nuốt · chạy lại nhưng ĐỎ · chạy lại không rõ kết quả ·
**eval không kết luận được**. (Tiêu đề và thân AC này từng nói NĂM rồi sáu trong khi lệnh
in tám — không ô đo nào so con số ấy, nên cả ba đều sai được cùng lúc; số từ viết bằng CHỮ
nằm ngoài tầm của AC-14, xem Known limits.) Bốn số đầu tiên tôi định in đều thoả bởi một
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
When chạy `teeth` với **hai mươi mốt** ca có tên — `healthy` · `nuot-eval` · `da-chay-lai` ·
`ong-ba` · `khong-khai-paths` · `paths-thu-muc-tran` · `paths-glob` ·
`write-thieu-verified-commit` · `plan-tap-id` · `plan-them-mot-file` ·
`write-thieu-suites` · `write-lan-do` · `write-prev-bang-sha` · `diem-vao-duong-dan-la` ·
`write-giu-dong-cu` · `chay-lai-do` · `log-hong` · `newlines-thieu-prev` ·
`so-khop-lech` · `so-khop-rong` · `san-tinh-duoc`,
Then mỗi ca in `CASE <tên>: PASS`, ca đỏ nêu đích danh id eval, và dòng chốt **đếm đúng
số ca đã chạy**. Sáu ca là **đối chứng dương** (mong xanh) — `da-chay-lai` phân biệt "bắt
được việc nuốt" với "đỏ mọi thứ"; `khong-khai-paths` phân biệt "hạng mục không kết luận
được" với "nuốt"; hai ca `plan` phân biệt một bộ giao đúng với một bộ giao trả **cả tập**.
Lượt `--case` lẻ in `PARTIAL: n/21`, không in `OK:`; tên ca lạ → thoát 2. Dòng chốt
ĐẾM lúc chạy thay vì mang một chuỗi viết tay, và `TOTAL` đếm từ danh sách `KNOWN` thay
vì được gõ tay — vòng 3 bắt được dòng chốt khai «7 đối chứng dương + 11 phép phá» trong
khi thực tế là 6 + 12, và `TOTAL=18` không thể bắt vì nó nói CÓ BAO NHIÊU ca chứ không
nói ca THUỘC LOẠI NÀO. Và các ca
ĐỌC không còn chấm trên một dòng repin do chính bộ răng `printf` ra: chúng gọi chế độ
`write` thật (`repin_written`), nên bộ ghi và bộ đọc được chứng minh là đồng ý về MỘT
vật, thay vì về hai niềm tin độc lập — vòng 2 cho thấy niềm tin ấy sai được theo cách
phá dữ liệu. `repin_line` viết tay chỉ còn sống cho hình dạng bộ ghi KHÔNG tạo ra được
theo thiết kế: dòng ông bà không `prev_sha`.

**AC-10 — `write` TỪ CHỐI ba dạng đầu vào bịa, thay vì ghi một dòng repin đẹp mặt.**
Given chính chế độ `write` là thứ duy nhất sinh ra dòng repin mới, nên một dòng nó ghi ra
được cả hai bên đọc — lưới trước-merge và hàng rào này — coi là **bằng chứng một lượt lane
xanh**,
When gọi `write` mà (a) không truyền `suites_json`, (b) truyền một mảng có phần tử khác 0,
hoặc (c) `prev_sha` bằng đúng `sha` sắp ghim,
Then nó thoát khác 0 và nêu lý do, KHÔNG ghi dòng nào. Ba phép từ chối, ba lỗ khác nhau:
(a) một mặc định `[0,0,0,0]` biến chữ "lane đã xanh" thành thứ máy tự khai — không ai
chạy lane mà dòng vẫn nói đã chạy; (b) nghi thức re-pin nói rõ lane đỏ thì **dừng**, nên
ghi dòng cho một lane đỏ là ký mù đúng nghĩa; (c) `prev_sha == sha` nghĩa là
`verified_commit` đã bị đổi TRƯỚC khi gọi `write`, và dòng sinh ra khi ấy có delta rỗng —
`plan` không bao giờ tìm ra eval nào bị chạm, nên hàng rào **xanh vì không nhìn thấy gì**,
đúng cái hình dạng vòng này tồn tại để diệt.

**AC-11 — Điểm vào không bao giờ im lặng thoát 0.**
Given lõi vừa là thư viện (`teeth` gọi `pathMatches` qua `--input-type=module`) vừa là
chương trình, nên nó phải tự nhận ra mình đang chạy ở vai nào,
When chạy nó như chương trình từ một đường dẫn có dấu cách và nằm dưới một symlink (trên
macOS `/tmp` là symlink tới `/private/tmp`) với một mode không tồn tại,
Then nó in `usage:` và thoát khác 0. Phép so cũ dùng `import.meta.url` với `process.argv[1]`
nguyên văn: `import.meta.url` đã phân giải symlink còn `argv[1]` giữ chuỗi người gõ, nên hai
bên lệch nhau và nhánh "chạy như chương trình" **không chạy gì cả** — thoát 0, không in gì.
Một hàng rào thoát 0 mà không đo gì là ca xấu nhất trong ba vòng của phiên này.

**AC-12 — Run-log có ĐÚNG MỘT cửa; không bên đọc hay ghi nào tự khoan lỗ.**
Given vòng 2 đẻ ra ba lỗ HIGH riêng biệt cùng một gốc — mỗi chế độ tự mang dung sai
riêng cho dữ liệu nó không đọc được: `parseJsonl` biến dòng hỏng thành `null` rồi lọc
đi, `newlines` làm `catch { continue }`, và bộ ghi `appendFileSync` giả định một dấu
xuống dòng nó chưa bao giờ kiểm,
When mọi chế độ đọc hoặc ghi run-log,
Then chúng đi qua một cửa duy nhất, và cửa ấy: (a) **đếm** dòng không đọc được rồi
**DỪNG** nêu đích danh hồ sơ, chứ không lọc bỏ — một dòng repin hỏng và một dòng repin
vắng trông y hệt nhau; (b) ghi có **chốt xuống dòng**, vì `appendFileSync` lên một file
không kết thúc bằng `\n` hàn dòng mới vào dòng cũ và **cả hai** biến mất khỏi mọi bên
đọc trong kho (`pre-merge-check.sh`, `recheck-evidence.cjs` cùng `JSON.parse` những dòng
ấy); (c) sau khi ghi thì **đọc lại và tự đối chiếu** — số dòng đọc được phải tăng đúng 1
và số dòng hỏng phải không đổi, nếu không thì DỪNG. Khoản (c) là **đai an toàn, KHÔNG
có ô đo nào đòi nó**: một khi (b) đã tại chỗ thì (c) đúng theo cấu trúc và không
fixture nào làm nó nổ được — thay `if` của nó bằng `if (false)` vẫn để cả 21 ca xanh
(đo 03/09). Nó tồn tại để bắt một lỗi TƯƠNG LAI trong bộ ghi, và điều đó được khai
thẳng ở đây thay vì để một ô đo nhận công. Đo trước khi siết: 1669 dòng
run-log trong kho, **0** không đọc được — nên phép từ chối chỉ nổ khi có hư hỏng thật.
Tái hiện được lỗ này trước khi vá: `check` in `dong repin: 0 … OK` và thoát 0 sau khi
chính bộ ghi vừa phá mất dòng xuất xứ duy nhất.

**AC-13 — Một lần chạy lại ĐỎ không phải là độ phủ.**
Given bộ đếm cũ dựng bảng "đã chạy lại" từ `o.kind === "eval" && o.eval && o.sha` mà
không hề đọc `exit_code`,
When một eval bị pin chạm được chạy lại,
Then chỉ `exit_code === 0` mới tính là phủ; một số khác 0 vào hạng **«chạy lại nhưng
ĐỎ»**, còn thiếu/`null` vào hạng **«chạy lại không rõ kết quả»** (`null` chính là hình
dạng mà luật tool-kill quy định cho lệnh bị công cụ giết — dòng tồn tại nhưng không
chứng minh gì). Cả ba hạng có tên riêng trong dòng tổng kết và hai hạng sau đều làm
hàng rào đỏ. Không có luật này thì chạy lại rồi TRƯỢT vẫn thoả hàng rào — ca ồn ào nhất
mà nó tồn tại để bắt lại thành ca nó ban phước. Đo 02/09: cả 63 dòng `kind=eval` thật
trong kho đều mang `exit_code: 0`, nên phép siết không tốn gì trên dữ liệu thật.

**AC-14 — Con số nói về bộ răng phải suy ra từ bộ răng.**
Given `expected` của mỗi ô đo là thứ người chấm đối chiếu đầu ra thật với, nên một con
số trong đó mà lệnh không bao giờ in ra được biến phép chấm thành phép đoán,
When bộ răng đổi số ca,
Then mọi `PARTIAL: n/N` và `OK: n/N ca` trong `evals.yaml` phải mang đúng `N` ấy, kiểm
bằng một chế độ riêng; và chế độ ấy **TỪ CHỐI khi quét được KHÔNG con số nào**, vì một
bộ quét không khớp gì sẽ in một lượt sạch — đúng hình dạng «xanh trên không có gì».
Không phải luật giả định: lần chạy ĐẦU TIÊN của chế độ này trên kho thật đã ĐỎ, bắt hai
`PARTIAL: 1/14` còn sót sau khi bộ răng lên 18 ca. Cùng lớp với AC-8: ở đó là thành
phần dòng chốt, ở đây là con số trong văn bản hợp đồng đo — cả hai đều là số viết tay
không có gì buộc vào vật chúng mô tả.

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
lỗ đó; AC-6 mang thêm điều kiện `> 0` để chính ô đo không thoả được bằng một script trơ. Từ vòng 4, điều kiện ấy được **ÉP** bằng cờ `--min-computable 1` chứ không chỉ được in — vòng 3 bắt được bản cũ in số 0 rồi thoát 0.

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

- **Known limit (chốt tại Cổng Bằng chứng 03/09):** lệnh dựng ứng dụng gán biến môi
  trường nội dòng nên cần vỏ lệnh kiểu Unix; người đóng góp dùng Windows làm đúng danh
  sách kiểm bắt buộc sẽ không dựng được, trong khi lượt kiểm tự động chạy trên Linux
  vẫn báo ổn. Chấp nhận và ghi lại thay vì sửa ở vòng này.
