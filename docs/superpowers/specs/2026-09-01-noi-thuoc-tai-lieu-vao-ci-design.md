# Nối hai thước tài-liệu-sống ↔ manifest vào CI

**Ngày:** 2026-09-01 · **Slug:** `noi-thuoc-tai-lieu-vao-ci` · **Hạng:** T2

## 1. Việc

`dang-ky-fork-openai` dựng `check-live-docs-manifest-synced.sh` (ba chế độ) và bộ
răng của nó, để lấp một lỗ `CLAUDE.md` tự thú: *"The READMEs are hand-maintained
and silently drift."* Nhưng chúng chỉ được nối vào bốn khoá `dkfo_*` của chính hồ sơ
ấy — **0 tham chiếu** trong `ci.yml`, `feature_loop.suite_keys`, `package.json`.
Ký xong là ba README trở lại không ai canh.

Kho đã chẩn đúng bệnh này ngày 31/08 cho hai guard trước (`ci.yml:135-141`) và chữa
bằng cách thêm step vào job `Acceptance Gate` sẵn có. Đây là cùng bệnh, cùng thuốc.

## 2. Khuôn: mở rộng bộ đo có sẵn, KHÔNG dựng bộ mới

`scripts/ci/check-gate-guards-job.sh` (333 dòng) đã giải trọn bài "guard có thật sự
chạy trong CI không" cho ba guard trước, với năm chế độ. Nguyên tắc trong header của
nó là thứ đáng giá nhất:

> *"READ THE COMMAND OUT OF THE YAML AND RUN IT rather than asserting the YAML
> contains a script name. Reading YAML measures instructions; running the extracted
> command measures behaviour."*

Bốn chế độ (`shape` · `no-softening` · `reachable` · `job-count`) **lặp theo mảng**
`GUARD_NEEDLES`. Thêm hai needle là chúng phủ luôn, không viết thêm dòng đo nào.

Đây là lời giải đúng của bài này. Ba vòng verify của hồ sơ trước đã chứng minh: mỗi
lần dựng thêm cặp thước+răng mới lại sinh đúng lớp lỗi đang đi chữa.

## 3. Ràng buộc thật: chế độ `teeth` chỉ phá được một nửa

`teeth` **không** hoàn toàn theo dữ liệu. Nó rút lệnh ra khỏi `ci.yml` theo needle
(dữ liệu), nhưng khối phá cây là **viết cứng** cho ba guard cũ, và cây thăm dò là
một thư mục `mktemp` chép file — **không phải kho git**.

Hệ quả, đo được chứ không suy:

| Chế độ | Cây thăm dò phá được không | Vì sao |
|---|---|---|
| `readme` | **được** | chỉ đọc ba README + manifest; chép vào là phá được |
| `claude` | **được** | chỉ đọc `CLAUDE.md` + manifest |
| `orphans` | **KHÔNG** | gọi `git show <base>:…` và `git ls-tree`; cây thăm dò không có `.git` |
| bộ răng | **KHÔNG** | vế đỏ của nó *chính là nó*; phá nó để chứng minh nó biết đỏ là vòng tròn |

Hai chế độ không phá được vẫn **được nối vào CI** và vẫn được `shape` ·
`no-softening` · `reachable` phủ. Chúng chỉ nằm ngoài `teeth`, và điều đó phải
**hiện trong đầu ra** — một danh sách `TEETH_SKIP` có tên kèm lý do, in ra mỗi lượt
chạy. Bỏ im lặng là đúng lớp lỗi mà chính bộ đo ấy tồn tại để chặn.

## 4. Bốn step, không phải một

Một step gộp `readme && claude && orphans` thì needle nào cũng khớp cùng một dòng
`run:`, và bộ rút dùng `tail -1` nên sẽ lấy nhầm. Tách mỗi chế độ một step làm từng
needle **địa chỉ hoá được**, và trả giá đúng ba dòng YAML.

`job-count` của bộ đo cũ đã ghim lý do không được thêm JOB mới: `check-action-pins.sh`
khẳng định `EXPECTED_CHECKOUT_SITES=8`, một job mới thành cái thứ chín và làm một guard
không liên quan đỏ.

## 5. Gộp thêm một lỗ, vì nó là lỗ về đúng thứ thước đang canh

Chế độ `readme` dựng `new Map(rows.map(...))` nên **khử trùng theo id**: một README
liệt kê cùng plugin hai lần, dòng sau đúng org, thì dòng trước sai org **bị nuốt
lặng**. Thước vẫn xanh. Người dùng có thể bị dẫn tới một nguồn plugin không chính
thức mà không thước nào đỏ.

Đây là lỗ khiến thước **nói dối về chính thứ nó canh** — nối một thước như vậy vào
CI là nhân bản lời nói dối lên mọi PR. Nên nó vào phạm vi, kèm một ca trong bộ răng
đã có (7 → 8 ca), không phải một bộ răng mới.

## 6. Cái giá đã đo

Chạm `.github/workflows/ci.yml` làm **hai** hồ sơ đã ký hoá ôi: `conformance-l0` và
`dang-ky-fork-openai`. Đo bằng mô phỏng. Nên vòng này kèm một sự kiện re-pin —
**một** lượt lane, hai chữ ký — và lane ấy là việc **cuối cùng** trước lượt verify.

## 7. Cố ý không làm

- Ba lỗ còn lại của hai thước (chế độ `orphans` chưa từng đỏ · đối chứng dương chỉ
  phủ `readme` · hai chú thích nói sai số). Chúng là chất lượng của thước, không phải
  việc cắm điện.
- Màn hình không cảnh báo gì về vòng đời model — đề tài của hồ sơ khác.

## 8. Đặc tả UX

Không có. Feature không chạm surface web-UI nào.
