---
schema_version: 1
slug: staleness-ho-so-thieu-paths
feature: Chốt chặn có thể đang bỏ qua kiểm bằng chứng lỗi thời cho hồ sơ khai thiếu paths
owner: Manh
stage: decided
decision: park
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---


# Cơ hội: chốt chặn có thể đang bỏ qua kiểm bằng chứng lỗi thời

## Việc gì đang sai

Chốt chặn trước-merge (`scripts/pre-merge-check.sh`) có nhiệm vụ chặn merge khi
mã đổi sau lần verify — buộc hồ sơ đóng dấu lại. Đo được 31/08: nó **im lặng
hoàn toàn** với một hồ sơ đáng lẽ phải bị bắt.

## Bằng chứng đo được, không phải suy luận

Trong PR của `cong-tu-canh-minh`:

| Quan sát | Giá trị |
|---|---|
| PR đổi file | `.github/workflows/ci.yml` |
| `ci-vitest-sdk-pin` khai file đó trong `paths` | E1, E2, E3, E10 |
| Mốc verify của nó | `91da1a4e32ce3da92f5ab52d3a43d8b2aeb1a507` |
| Mốc đó là tổ tiên của HEAD? | **có** (kiểm bằng `git merge-base --is-ancestor`) |
| File có trong `git diff --name-only 91da1a4e...HEAD`? | **có** |
| Cổng báo gì? | `OK [ci-vitest-sdk-pin]: PASS` — **không VIOLATION, không cả một dòng NOTE** |

Hồ sơ đối chứng cùng lượt chạy: `roadmap-drift-guard` in NOTE về phạm vi hẹp rồi
VIOLATION đúng ba file `scripts/roadmap/*` mà PR chạm. Nên luật staleness **có**
chạy — chỉ là không chạy cho hồ sơ kia.

## Giả thuyết (CHƯA kiểm chứng)

Khác biệt duy nhất quan sát được: `ci-vitest-sdk-pin` có hai ô đo khai
`paths: null` (E4, E11); `roadmap-drift-guard` khai đủ ở mọi ô. Giả thuyết: hồ sơ
khai thiếu `paths` bị **bỏ qua hoàn toàn** thay vì rơi về phạm vi toàn cây.

Đây mới là giả thuyết. Cách kiểm dứt điểm: sửa một ký tự trong
`scripts/ci/check-vitest-job.sh` (file **chỉ** hồ sơ đó khai, không miễn T1),
commit, chạy lại cổng, xem có VIOLATION không.

## Vì sao đáng làm

Nếu đúng là fail-open thì mọi hồ sơ khai thiếu `paths` **không bao giờ bị đòi
đóng dấu lại** — bằng chứng cũ đi qua cổng vô hạn, và cổng báo xanh trong khi
không kiểm gì. Đây đúng lớp lỗi mà `cong-tu-canh-minh` vừa đóng ở chỗ khác:
một bộ kiểm im lặng còn tệ hơn một bộ kiểm không có.

## Ngưỡng nghiệm thu sơ bộ

- Đếm được **bao nhiêu / 29 hồ sơ** có ít nhất một ô đo khai `paths: null`.
- Phép thử hai chiều: cây lành → cổng xanh; đổi một file mà một hồ sơ khai
  `paths` → cổng ĐỎ nêu đích danh hồ sơ đó, **kể cả** khi hồ sơ có ô khai thiếu.

## Vì sao KHÔNG sửa trong hồ sơ gốc

`pre-merge-check.sh` là chốt chặn CI. Sửa mà chưa đo xong sẽ chặn nhầm mọi PR.
Nó cũng nằm trong `t1_skip_globs`, nên chạm nó là một quyết định phạm vi riêng.

## Cổng 0 — 04/09

- **decision = park.** Căn cứ: khối kế hoạch lát cắt chứng minh (docs/roadmap.md) đóng băng việc mở hạng mục mới; hồ sơ này không nằm trên đường ★. Mở lại khi gỡ băng, hoặc qua bảng Ngoại lệ với lý do có tên.
