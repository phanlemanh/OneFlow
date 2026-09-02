---
schema_version: 1
feature: Nối hai thước tài-liệu-sống ↔ manifest vào CI
slug: noi-thuoc-tai-lieu-vao-ci
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, config]
status: verified
approved_by:
veto_state: mo
veto_opened_at: 2026-09-02T01:48:14Z
design_doc: docs/superpowers/specs/2026-09-01-noi-thuoc-tai-lieu-vao-ci-design.md
---

# Acceptance Contract: noi-thuoc-tai-lieu-vao-ci

Hai thước do `dang-ky-fork-openai` dựng ra chỉ chạy trong lượt verify của chính hồ sơ
ấy — 0 tham chiếu trong `ci.yml`. Ký xong là ba README trở lại đúng trạng thái mà
tiêu chí đẻ ra chúng tồn tại để chấm dứt. Việc này cắm điện cho chúng, bằng cách **mở
rộng bộ đo CI-wiring có sẵn** chứ không dựng bộ mới.

## Acceptance criteria

**AC-1 — Bốn step chạy hai thước, nằm trong job sẵn có.**
Given job `acceptance-gate` trong `.github/workflows/ci.yml`,
When đọc khối job đó theo thụt đầu dòng (không theo tên step, để đổi tên không giấu
được),
Then có step chạy `check-live-docs-manifest-synced.sh` ở **cả ba** chế độ `readme` ·
`claude` · `orphans`, và một step chạy `check-live-docs-manifest-teeth.sh`; job vẫn
giữ `fetch-depth: 0` mà chế độ `orphans` cần.

**AC-2 — Không gì nuốt mã thoát của chúng.**
Given cùng khối job đó,
When quét từng dòng của khối job,
Then không dòng nào mang `continue-on-error`, `|| true`, hay `set +e`. Một thước không
thể đỏ còn tệ hơn không có thước: nó báo cáo một sự an toàn nó không cung cấp.

**Điểm mù khai thẳng, và nó là điểm mù CÓ THẬT.** Đây là phép quét ba chuỗi, không phải
phép đo quan hệ. `ci.yml` không khai `shell:` nên `run:` chạy `bash -e` **không có
`pipefail`** (đo 01/09) — vậy `… synced.sh readme | tee /tmp/out` **nuốt mã thoát** mà
không chứa chuỗi cấm nào, và tiêu chí này vẫn xanh.

Vòng 1 và vòng 2 của hồ sơ này đã thử đóng điểm mù ấy bằng một chế độ tự viết
(`exit-propagates`: thay script bằng stub rồi chạy chuỗi rút được). **Rút ở vòng 3.** Nó
rỗng ba lần theo ba cơ chế khác nhau — thiếu đối chứng dương · thừa kế `pipefail` từ
`set -euo pipefail` của chính file đo · và một bất biến đếm **hằng-đúng** (mỗi needle
tăng đúng một trong hai biến nên `kê == đo + bỏ qua` không bao giờ sai được). Ba cơ chế
khác nhau, cùng một lớp lỗi, hai vòng liên tiếp: theo `STOP-PATCHING-CLAUSE` đó là dấu
hiệu khuôn giải sai, và owner chọn thu phạm vi (02/09).

Ghi ra thay vì lấp: một điểm mù có tên đọc được là dữ liệu; một chế độ tự-viết-liên-tục-
rỗng là một thước biết nói dối — đúng thứ hồ sơ này đi chữa.

**AC-3 — Bốn step CHẠY trên pull request, không chỉ có mặt trong file.**
Given `if:` có thể làm một step im lặng không chạy trên PR,
When kiểm điều kiện chạy của job và của từng step mới,
Then không step nào bị chặn khỏi pull request. Đây là nửa mà việc-đọc-nội-dung-file
không bao giờ phủ được, và chính là trạng thái 0-tham-chiếu mà hồ sơ này đi đóng.

**AC-4 — Lệnh RÚT TỪ `ci.yml` thật sự xanh trên cây lành và đỏ trên cây đã phá.**
Given hai chế độ phá được trong cây thăm dò (`readme`, `claude`),
When rút chuỗi lệnh ra khỏi `ci.yml` rồi chạy chính chuỗi đó — lần một trên kho thật,
lần hai trên bản sao đã bị xoá một mục README và bị cắm một id lạ vào `CLAUDE.md`,
Then lần một **exit 0** và lần hai **exit khác 0**.

**Vế xanh chạy trên KHO THẬT cho CẢ BỐN chuỗi mới, kể cả `orphans` và bộ răng.** Đây là
chỗ bản đầu của hợp đồng này hỏng: `orphans` lẽ ra vào CI với **0 lượt thực thi** trong
toàn hồ sơ — E1/E2/E3 chỉ đọc YAML, và nó nằm ngoài phép phá. Kho thật CÓ `.git` nên vế
xanh chạy được; điều bị từ chối là `git init` cho cây thăm dò, không phải chạy trên kho
thật. Một chuỗi sai cú pháp (`--mode orphans` thay vì positional) bị bắt tại đây, không
phải trên `main`.

Assert trên chuỗi RÚT ĐƯỢC, không trên tên script trong YAML: đọc YAML là đo chỉ dẫn,
chạy lệnh mới là đo hành vi.

**AC-5 — Hai chế độ KHÔNG phá được phải hiện tên và lý do, không biến mất im lặng.**
Given chế độ `orphans` gọi `git show <base>:…` nên không chạy được trong cây thăm dò
không-phải-kho-git, và bộ răng thì vế đỏ của nó chính là nó,
When chạy chế độ `teeth` của bộ đo CI-wiring,
Then đầu ra **nêu đích danh** hai lệnh bị bỏ qua kèm lý do từng cái, và in **ba con số
literal**: `KÊ=7` · `PHÁ=5` · `BỎ QUA=2`. Và chính chế độ ấy **thoát khác 0** khi
`kê ≠ phá + |bỏ qua|` — biến bất biến đếm thành phép đo chứ không phải lời bình. Không
có con số thì "quên viết phép phá cho một needle" và "cố ý bỏ qua một needle" cho cùng
một đầu ra xanh. Bỏ qua có tên là dữ liệu; bỏ qua im lặng là một thước nói dối.

**AC-6 — Chế độ `readme` bắt được mục trùng có org sai.**
Given một README liệt kê cùng một plugin **hai lần** — id ấy **đã có trong manifest**,
nên **tập id và số đếm KHÔNG đổi** — dòng sau đúng org, dòng trước sai org,
When chạy chế độ `readme`,
Then nó **đỏ**, và thông điệp `FAIL:` nêu đích danh **id**, **tên file**, và **org sai**.
Ba điều kiện của fixture là bắt buộc: nếu id trùng làm số đếm nhảy 39 → 40 thì thước có
thể đỏ vì *lệch số đếm* chứ không vì *sai org*, và lỗ thật vẫn nguyên trong khi hồ sơ
tuyên đã đóng.

**Đối chứng dương, và nó đi NGƯỢC đề nghị của phản biện:** cùng plugin liệt kê hai lần
với org **đúng** phải **XANH**. Phản biện đề nghị coi mọi mục trùng là lỗi; đo 01/09 bác
điều đó — mỗi README **đã** nêu ba plugin hai lần một cách hợp lệ, một lần ở danh mục
*Official plugins* và một lần ở ví dụ *Quickstart → Install plugins*. Cấm trùng là làm CI
đỏ trên tài liệu **đúng**. Nên luật là: **giữ mọi dòng, kiểm org TỪNG dòng, so tập id
bằng tập phân biệt** — không khử trùng (mất dòng sai), không cấm trùng (cấm cách viết
hợp lệ). Trước bản vá, bộ đọc dựng
`new Map(rows...)` nên khử trùng theo id: dòng sai org bị nuốt lặng và thước vẫn xanh
— thước nói dối về đúng thứ nó canh, và nối một thước như vậy vào CI là nhân bản lời
nói dối lên mọi PR.

**AC-7 — Bộ răng của thước có ca cho lỗ đó, và một ca giữ nó khỏi sửa quá tay.**
Given bộ răng đang có 7 ca,
When chạy đầy đủ,
Then có **9** dòng `CASE <tên>: PASS` và dòng chốt đếm đúng `9/9` — hai ca mới là
`readme-trung-sai-org` (phải ĐỎ, thông điệp nêu **id**, **tên file**, **org sai**) và
`readme-trung-org-dung` (phải **XANH**, giữ bản vá khỏi biến thành lệnh cấm trùng).
Lượt `--case` lẻ vẫn in `PARTIAL: n/9` và không in dòng `OK:`.

**Ca `readme-trung-sai-org` phải được chứng minh trên VẬT HỎNG LẤY TỪ LỊCH SỬ** — bản
guard ở commit trước bản vá, lấy bằng `git show` — chứ không phải trên một bản mô phỏng
gõ tay. Đo 01/09: bản gõ tay của tôi giữ dòng **đầu**, còn lỗi thật giữ dòng **cuối**;
hai hành vi ngược nhau, và ca vẫn "PASS" trên bản mô phỏng sai. Trên vật hỏng thật nó
đỏ đúng như phải thế.

**AC-9 — Bốn step không làm guard đếm-checkout của kho khác đỏ.**
Given `scripts/ci/check-action-pins.sh` khẳng định `EXPECTED_CHECKOUT_SITES=8`, và
thiết kế §4 nêu chính con số ấy làm lý do thêm STEP chứ không thêm JOB,
When chạy chế độ `job-count` của bộ đo CI-wiring **và** `check-action-pins.sh` trên cây
**sau** thay đổi,
Then cả hai xanh. Không ô nào khác chạy hai thứ này sau khi `ci.yml` bị sửa, mà `ci.yml`
chính là vật `conformance-l0` canh — một step mới cần `actions/setup-node` riêng là đủ
làm một guard không liên quan đỏ trên `main`.

**AC-8 — Nhánh này không để hồ sơ nào khác mang bằng chứng ôi.**
Given chạm `.github/workflows/ci.yml` làm **hai** hồ sơ đã ký hoá ôi (`conformance-l0`,
`dang-ky-fork-openai`) — đo bằng mô phỏng, không suy luận,
When chạy `check-resign-wave.sh noi-thuoc-tai-lieu-vao-ci origin/main`,
Then không hồ sơ đã ký nào khác còn mang bằng chứng có trước code của nhánh này.

## Coverage

Quét hình thái trên câu hỏi **"một thước có thể im lặng không canh bằng những cách
nào?"** — trục lấy thẳng từ năm chế độ mà bộ đo CI-wiring có sẵn đã dựng, nên đây là
trục đã được một feature trước kiểm chứng chứ không phải tôi bịa.

- **Trục A — cách một thước ngừng canh:** không có trong file · có nhưng bị làm mềm
  (`|| true`) · có nhưng không chạy trên PR (`if:`) · có và chạy nhưng **rỗng** (không
  bao giờ đỏ được) · có và chạy nhưng **nói dối** (đỏ sai chỗ / nuốt lặng một lớp đầu
  vào).
  *[CE: năm chế độ của `scripts/ci/check-gate-guards-job.sh` — `shape` ·
  `no-softening` · `reachable` · `teeth` · `job-count` — mỗi chế độ đóng đúng một giá
  trị của trục này, và header của nó ghi vì sao từng cái tồn tại.]*
- **Trục B — thứ bị canh:** ba README · `CLAUDE.md` · thư mục icon.
  *[CE: ba chế độ của chính thước đang được cắm điện.]*
- **Trục C — cây chạy phép đo:** kho thật · bản sao thăm dò (không phải kho git).
  *[CE: khối `PERTURB` của bộ đo có sẵn, và phép đo 01/09 rằng `orphans` cần `git`.]*

**Ô Core → AC:** A-không-có-trong-file → AC-1 · A-bị-làm-mềm → AC-2 · A-không-chạy →
AC-3 · A-rỗng → AC-4 · A-nói-dối → AC-6/AC-7 · C-cây-thăm-dò-thiếu-git → AC-5 ·
re-pin → AC-8.

**Ô cắt, có lý do:** B-thư-mục-icon × A-rỗng — chế độ `orphans` là khẳng định chưa
từng đỏ, và phá nó cho tử tế cần nó nhận một thư mục để quét. Đó là chất lượng của
thước, không phải việc cắm điện; AC-5 chỉ đòi lỗ ấy **hiện tên**, không đòi lấp.

## Out of scope

- Ba lỗ còn lại của hai thước: `orphans` chưa từng đỏ · đối chứng dương chỉ phủ chế độ
  `readme` · hai chú thích nói sai số ("Four such files" trong khi đo thật là ba, và
  "a 37th plain string" sau khi số đếm hạ 36→35).
- Nối hai thước vào `feature_loop.suite_keys` — CI là chỗ chặn merge; suite key là
  chuyện của mỗi lượt verify, và thêm vào đó làm mọi hồ sơ khác chạy chậm hơn.
- Màn hình không cảnh báo gì về vòng đời model.
- Gộp bốn step thành một để tiết kiệm dòng YAML — làm needle mất tính địa-chỉ-hoá.

## Đường đo

Hồ sơ cơ hội khai ba ngưỡng, đều còn tiền tố `[đề xuất]` (owner chưa gỡ). Đường đo
trong vòng này:

| Ngưỡng ở `opportunity.md` | Số từ đâu | AC nào bảo đảm |
|---|---|---|
| Một PR làm README lệch manifest bị chặn **mà không ai gõ tay** | chuỗi lệnh rút từ `ci.yml` chạy trên cây đã phá | AC-3 (chạy trên PR) + AC-4 (đỏ thật) |
| Bật xong CI **không** đỏ vì nợ có sẵn ở `main` | chạy ba chế độ trên cây `origin/main` — đã đo 01/09, cả ba xanh | AC-4 vế xanh |
| Vẫn phải gõ tay mới biết lệch = CHẾT | 0 tham chiếu trong `ci.yml` là trạng thái trước; AC-1 đảo nó | AC-1 |

Ngưỡng "quan sát trên chính GitHub Actions" **không** có đường đo trong vòng này: nó
chỉ đo được sau khi PR chạy thật. Đó là ô CHƯA ĐO của Cổng Giá trị, khai ở đây chứ
không giấu.

## Notes

- **Điểm mù của AC-2, đã khai trong chính tiêu chí:** phép quét ba chuỗi cấm không bắt
  được một step nuốt mã thoát qua đường ống (`| tee`), vì `run:` chạy `bash -e` không có
  `pipefail`. Chế độ tự viết để đóng lỗ ấy bị rút ở vòng 3 sau ba lần rỗng.
- **`orphans` vẫn là khẳng định chưa từng đỏ** (kế thừa từ `dang-ky-fork-openai`): ca phá
  của nó cần chế độ ấy nhận một thư mục để quét.
- **Cách rút lệnh chưa khẳng định "đúng MỘT dòng".** `teeth` dùng `… | tail -1`, `shape`
  dùng `grep -q`. Chú thích trong `ci.yml` nêu rõ vì sao bốn step phải tách rời — một
  dòng gộp `a && b` làm mọi needle giải về cùng một dòng — nhưng tính chất ấy chỉ sống
  trong văn xuôi. Bản vá là một dòng mỗi chỗ rút (`n=$(… | wc -l); [ "$n" -eq 1 ] || fail`).
- **`pnpm build` nay mang gán biến môi trường kiểu POSIX** (`NODE_OPTIONS=… next build`),
  không chạy trên `cmd.exe`/PowerShell. Đo trước khi sửa: lệnh ấy chỉ được gọi ở
  `ci.yml` (ubuntu) và máy dev; `desktop-release.yml` không gọi nó. Có lập trình viên
  Windows chạy cục bộ thì phải đổi sang `cross-env`.
- **Hai chỗ trôi kế thừa, chưa sửa:** đối chứng dương của bộ răng chỉ phủ chế độ `readme`;
  nhãn ca 5 của bộ răng manifest có sẵn còn ghi "a 37th plain string" sau khi số đếm hạ
  36→35.
