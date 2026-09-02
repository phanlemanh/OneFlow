---
schema_version: 1
slug: noi-thuoc-tai-lieu-vao-ci
feature: Hai thước tài-liệu-sống ↔ manifest chỉ chạy trong lượt verify của hồ sơ đẻ ra chúng
owner: Manh
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

# Cơ hội: hàng rào chỉ canh trong lúc có người nhìn

## Vấn đề & ai gặp

`dang-ky-fork-openai` (ký 01/09) dựng hai thước để lấp một lỗ `CLAUDE.md` **tự thú**:

> *"The READMEs are hand-maintained and silently drift."*

Chúng lấp thật — nhưng chỉ trong đúng lượt verify của hồ sơ đẻ ra chúng. Đo trên
HEAD 01/09, `check-live-docs-manifest-synced.sh` và bộ răng của nó được nhắc ở đúng
ba chỗ:

| Nơi | Vai |
|---|---|
| `_acceptance/config.yaml:619-623` | bốn khoá `dkfo_*`, chỉ chạy khi hồ sơ ấy được chấm |
| `CLAUDE.md` | văn xuôi khai ràng buộc, không phải phép chạy |
| chính bộ răng | tự gọi lại mình |

**Không dòng nào trong `.github/workflows/ci.yml`.** Không có trong
`feature_loop.suite_keys`. Không có trong `package.json`. Nghĩa là từ giây phút hồ sơ
được ký, ba README quay lại **đúng trạng thái mà AC-4 sinh ra để chấm dứt**.

Người gặp: người mở PR tiếp theo chạm manifest — họ tin có hàng rào, và không có.
Và **agent** đọc `CLAUDE.md` đầu phiên, vốn được bảo là ràng buộc thứ năm đã có thước.

## Bằng chứng: kho đã chẩn đúng bệnh này rồi, bằng chữ

`.github/workflows/ci.yml:135-141` nói về hai guard trước — lộ trình và bản đồ sản
phẩm — rằng chúng *"ran only when somebody typed them (zero references in this file,
measured 31/08), and both had already let real drift through."* Cách chữa lần đó là
thêm hai step vào job `Acceptance Gate` sẵn có. Đây là **cùng một bệnh, cùng một
phương thuốc, cách nhau một ngày** — nên đây không phải giả thuyết, là tái phát.

Lệnh đo lại: `git grep -c "check-live-docs-manifest" .github/workflows/ci.yml`

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Hai thước cắm thẳng vào job `Acceptance Gate` được, không cần bước dựng mới | phải thêm bước cài, việc phình | job đó đã có `fetch-depth: 0` (chế độ `orphans` cần) và node; thước chỉ dùng bash + `node -e` + `git`, không cần pnpm | **Đã thử — đúng**, đo 01/09 |
| 2 | Ba README ở `main` hiện đang KHỚP manifest, nên bật thước không làm CI đỏ ngay | bật xong CI đỏ vì nợ có sẵn, phải dọn trước | chạy chế độ `readme` trên cây `origin/main` | **Đã thử — đúng** (01/09): `OK: 3 READMEs each list exactly the 39 plugins…` |
| 3 | `CLAUDE.md` ở `main` khớp tập id origin, nên chế độ `claude` không đỏ ngay | như trên | chạy chế độ `claude` trên cây `origin/main` | **Đã thử — đúng** (01/09): `OK: CLAUDE.md lists exactly the 3 origin ids…` |
| 4 | Bật thước KHÔNG làm hồ sơ đã ký nào phải ký lại | mỗi lần bật kéo theo một đợt re-pin | mô phỏng: chạm `ci.yml`, chạy `check-resign-wave`, đếm | **Đã thử — SAI** (01/09): **2 hồ sơ hoá ôi** — `conformance-l0` và `dang-ky-fork-openai` |

**Cả bốn đã thử ngay khi dựng hồ sơ này** (01/09) — rẻ hơn nhiều so với đoán:

- (1) (2) (3) đúng: hai thước cắm thẳng được, và **không** đỏ vì nợ có sẵn ở `main`.
  Job `Acceptance Gate` đã sẵn `fetch-depth: 0` và node; thước chỉ cần bash + `node -e`
  + `git`, không cần pnpm. Việc này rẻ hơn tôi tưởng.
- (4) **SAI, và đây là cái giá thật của việc**: chạm `.github/workflows/ci.yml` làm
  **hai** hồ sơ đã ký hoá ôi. Đo bằng mô phỏng, không bằng suy luận — phép đo đầu của
  tôi (`grep -l ".github" _acceptance/*/evidence-report.md`) trả về **năm** hồ sơ và
  là **dương tính giả**: chúng chỉ *nhắc* `.github` trong văn xuôi. `.github/**` không
  nằm trong phạm vi hẹp của hồ sơ nào, nhưng hồ sơ không khai phạm vi hẹp thì dùng
  phạm vi mặc định, và `.github/**` không được miễn T1.

  Giá cụ thể: **một lượt lane máy (8 suite, ~10-15 phút) + hai dòng chữ ký re-pin**.
  Không phải hai lượt lane — nghi thức re-pin là một lane cho N hồ sơ. Và lane ấy phải
  là việc **cuối cùng** trước lượt verify, sau mọi commit chạm vùng bị ghim.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: `[đề xuất]` Sau khi bật, một PR làm ba README lệch manifest có bị chặn **mà không cần ai gõ tay** không?
- Kết quả nào là SỐNG: `[đề xuất]` Một PR thử nghiệm cố ý xoá một mục README làm job `Acceptance Gate` **đỏ**, và thông điệp nêu đích danh id lẫn tên file — quan sát trên chính GitHub Actions, không phải trên máy.
- Kết quả nào là CHẾT: `[đề xuất]` Bật xong CI đỏ vì nợ có sẵn ở `main` mà không ai gây ra, hoặc bật xong vẫn phải gõ tay mới biết lệch.
- Timebox: `[đề xuất]` một buổi. Vượt là dấu hiệu việc này đã hoá thành "sửa hàng rào" chứ không còn là "cắm điện cho hàng rào".

## Ghi chú phạm vi

**Đây là việc nội bộ của bộ công cụ, không có người dùng cuối.** Người ký Cổng Đáng
hoàn toàn có thể thay cả khối ngưỡng trên bằng một dòng `Không đo được — <lý do>`;
khuôn cho phép, và ngưỡng đề xuất ở trên là ngưỡng **kỹ thuật** chứ không phải ngưỡng
giá trị. Tôi để dạng `[đề xuất]` vì phép thử "PR thử nghiệm bị chặn thật trên
Actions" là quan sát được và rẻ, nên nó vẫn mua được điều gì đó.

**Bốn lỗ đã biết của chính hai thước** (ghi trong Known limits của
[`dang-ky-fork-openai`](../dang-ky-fork-openai/contract.md), owner chấp nhận tại Cổng 2
ngày 01/09). Chúng KHÔNG tự động thuộc hồ sơ này — người ký quyết đưa vào hay tách ra:

1. Chế độ `orphans` là khẳng định **chưa từng đỏ**: ca phá của nó bị rút vì nó ghi vật
   thăm dò vào cây thật, trong khi bộ điều phối verify chạy các ô máy song song. Phá nó
   cho tử tế cần chế độ ấy nhận một thư mục để quét.
2. Chế độ `readme` khử trùng theo id (`new Map(rows...)`): một README liệt kê cùng
   plugin hai lần thì dòng sai nguồn bị **nuốt lặng**. Đây là lỗ có hại thật — người
   dùng có thể bị dẫn tới một nguồn plugin không chính thức.
3. Đối chứng dương chỉ phủ chế độ `readme`; nhánh `claude` có ca đỏ mà không có ca xanh.
4. Chú thích trong thước còn ghi "Four such files" (đo thật: **ba**), và nhãn ca 5 của
   bộ răng manifest có sẵn còn ghi "a 37th plain string" sau khi số đếm hạ 36 → 35.

Ý kiến của tôi, không phải quyết định: **(2) đáng gộp vào hồ sơ này** vì nó là lỗ khiến
thước nói dối về đúng thứ nó canh; (1) (3) (4) tách ra được.

**Ngoài phạm vi mọi hướng:** màn hình không cảnh báo gì về vòng đời model — lái-thử
người-lạ 01/09 tìm ra, và đó là đề tài của `dang-ky-fork-openai` chứ không phải của
việc cắm điện này. Nó xứng đáng hồ sơ riêng.
