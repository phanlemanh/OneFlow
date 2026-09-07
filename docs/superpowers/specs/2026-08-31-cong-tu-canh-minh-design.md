# Cổng tự canh mình — thiết kế

> Ngày 31/08/2026 · slug `cong-tu-canh-minh` · hạng T2
> Hợp đồng: [`_acceptance/cong-tu-canh-minh/contract.md`](../../../_acceptance/cong-tu-canh-minh/contract.md)

## 1. Vấn đề — hai mặt, một gốc

Hạ tầng của chính cổng nghiệm thu hỏng **âm thầm**.

**Mặt 1 — guard có răng nhưng không được cắm điện.**
`scripts/roadmap/check-roadmap-fresh.sh` và `product-map.mjs --check` không có trong
[`ci.yml`](../../../.github/workflows/ci.yml) — đo 31/08: **0 tham chiếu**. Hậu quả đã
xảy ra: `PRODUCT-MAP.md` trôi 4 slug (ghi *22 việc* trong khi có 26 hồ sơ đã ký) và
không ai biết, vì bộ kiểm chỉ chạy khi có người gõ tay.

**Mặt 2 — suite verify tự đốt vòng của mình.**
Đo trên bốn vòng S4 của `chong-mat-khoa-byo`:

| vòng | agent | phút | verdict |
|---|---:|---:|---|
| 1 | 49 | 17.6 | REJECT |
| **2** | **47** | **20.1** | **BLOCKED — 0 tín hiệu** |
| 3 | 37 | 14.7 | PENDING-JUDGMENT |
| 4 | 34 | 14.8 | PASS |

Vòng 2 mất trắng **28% tổng agent**, vì hai lỗi hạ tầng: suite key gộp
`pnpm build && pnpm typecheck` mất 322s rồi bị công cụ giết (exit 144, chạy đơn lẻ thì
xanh 2.1 phút), và một wrapper a11y chạy `pnpm dev` **trần** nên tranh `.next` với chính
suite key build chạy song song. Repo đã ghi đúng cơ chế đó trong chú thích khối
`dev_server` — *"only PAGES die, so the route-handler evals stay green — a broken round
that reads like a clean one"* — nhưng chưa áp cho wrapper.

## 2. Một phát hiện của quét, đáng đổi thiết kế

Guard lộ trình **đang xanh ngay lúc này**, trong khi sổ cái **có một dòng trùng thật**:

```
dòng trùng trong sổ cái: `normalize-text-vi`   (hai dòng, hai ngày khác nhau)
check-roadmap-fresh.sh : ✅ không có trôi
```

Nó so **tập** slug bên trong khối marker, nên trùng lặp vô hình. **Đưa một guard có lỗ
vào CI còn tệ hơn không đưa** — từ đó nó *trông như* đã được canh. Vá lỗ này vào phạm vi.

## 3. Quyết định của owner (31/08)

1. Bản đồ sản phẩm vào CI bằng **bộ kiểm riêng của repo**, không vendor bộ sinh của kit.
2. **Tách** suite key: `feature_loop.suite_keys` trỏ `test.build` + `test.typecheck` rời,
   **giữ nguyên** `test.build_typecheck` (7 hồ sơ đã ký tham chiếu nó).

## 4. Vì sao lệch khuôn có sẵn của repo

Repo đã có khuôn cho *"vật sinh phải khớp nguồn"*: **sinh lại rồi so** —
`gen_abi_clean = pnpm gen:abi && git diff --exit-code …`. Cùng khuôn với
`gofmt -l` và `terraform fmt -check` *(nêu tên; không đo được tại máy này — cả hai chưa cài)*.

Ta **không** dùng khuôn đó cho bản đồ, vì bộ sinh `product-map.mjs` **không nằm trong
repo** — chỉ có trong cache plugin, mà runner CI sạch thì không có. "Sinh lại" đòi vendor,
và vendor có cái giá đã ghi trong repo này: bản vendored đóng băng rồi trôi thành fork,
để lại **hai thước đo khác nhau cho cùng một thứ**.

Nên ta khẳng định **bất biến** thay vì sinh lại. Đây là chỗ lệch khuôn có chủ ý, ghi ra
để nó không trôi qua im lặng.

## 5. Ba thay đổi

### 5.1 `scripts/ci/check-product-map.mjs` — mới

Chọn `scripts/ci/` chứ không `scripts/acceptance/` hay `scripts/roadmap/` vì **giá re-pin**,
đo trên `paths` đã khai của 29 hồ sơ:

| Chỗ đặt | Hồ sơ phải re-pin |
|---|---|
| `scripts/ci/` | **0** |
| `scripts/roadmap/` | 1 (`roadmap-drift-guard`) |
| `scripts/acceptance/` | 2 (`gate-tooling-t1`, `stale-scope-by-paths`) |

Bộ kiểm khẳng định ba bất biến, đọc `_acceptance/*/contract.md` làm nguồn:

| Bất biến | Nguồn ↔ Bản đồ |
|---|---|
| mọi slug `status: signed-off` có mặt trong khối `## Đã giao` dưới dạng `` (`slug`) `` | 27 ↔ 27 |
| số trong nút mermaid `Đã giao<br/>N việc` **bằng** số slug đã ký | `N` = 27 |
| khối `## Đang cân nhắc cơ hội` + nút mermaid của nó khớp số thư mục có `opportunity.md` mà **không** có `contract.md` | 2 ↔ 2 |

**Fail-closed:** file vắng, khối không tìm thấy, nút mermaid không parse được → **đỏ có
tên**. Không bao giờ xanh im lặng — một bộ kiểm không tìm thấy vật cần kiểm chưa kiểm gì cả.

### 5.2 Hai step vào job `Acceptance Gate` sẵn có

Không thêm job. Job đó đã có `fetch-depth: 0` (guard lộ trình cần lịch sử) và Node 24 —
tức đã trả xong toàn bộ chi phí dựng; một job mới là trả lại lần nữa cho ~20 giây setup.

### 5.3 Suite key + wrapper a11y

- `feature_loop.suite_keys`: `executors.test.build_typecheck` → `executors.test.build` +
  `executors.test.typecheck`. **`build_typecheck` giữ nguyên trong `executors`** — bảy hồ
  sơ đã ký (`dependency-refresh-2026-07`, `per-plugin-origin`, `oneflow-plugin-prefix`,
  `measure-harness`, `pnpm-build-approvals`, `task-metering`, `sdk-distribution-rename`)
  tham chiếu nó; xoá là làm hỏng bảy bộ bằng chứng.
  Lợi ích: một lượt build bị công cụ giết nay chỉ làm **một** ô BLOCKED, thay vì nuốt luôn
  tín hiệu typecheck (24s) đi cùng.
- `scripts/onboarding/check-a11y-proto.sh`: thêm `NEXT_DIST_DIR` riêng, theo đúng bản
  `scripts/media-library/check-a11y-proto.sh` vốn đã đúng. Đo: bản onboarding có **0** lần
  `NEXT_DIST_DIR`, bản media-library có 1. Không hồ sơ nào khai `scripts/onboarding` trong
  `paths` → **0 re-pin**.

### 5.4 Vá lỗ trùng dòng của guard lộ trình

`roadmap-drift.mjs` so **tập** slug trong khối ledger. Thêm một khẳng định: **không dòng
nào trùng slug**. Và dọn dòng trùng đang tồn tại (`normalize-text-vi`) trong cùng lượt —
nếu không, CI đỏ ngay khi gói này hạ cánh.

## 6. Cách đo

Mọi bộ kiểm mới có **cặp hai chiều trên cùng vật** (`MEASURE-BIRTH-CLAUSE`): bản lành →
xanh; phá bản sao thật → đỏ với **thông điệp ghim nêu đích danh vật lệch** (tên slug, hai
con số), không chỉ exit khác 0.

Riêng ô CI: đo bằng cách chạy đúng lệnh mà job sẽ chạy, trên cây lành và trên cây đã phá —
không assert bằng cách đọc YAML của workflow, vì đọc YAML là đo **chỉ dẫn**, không đo
**hành vi**.

## 7. Ngoài phạm vi

- **Guard soi con số văn xuôi ngoài khối ledger** — văn xuôi ghi *"21 hạng mục"* khi sổ có
  28 dòng. Lỗ thứ hai của guard; văn xuôi tự do khó ghim, đáng hợp đồng riêng.
- **`landed_merge` thiếu ở 18/29 contract** — backfill siêu dữ liệu hàng loạt, khác gốc.
- **Văn bản tiếng Việt trong file vendor của kit (0.7)** — quyết định chính sách của owner
  (xin upstream dịch hay ghi ngoại lệ vendor), không phải việc mã.
- **Vendor `product-map.mjs`** — loại ở quyết định 1, kèm lý do hai-tầng-phiên-bản.
- **Sinh lại bản đồ trong CI** — bất khả nếu không vendor.
- **Thêm job CI mới** — job `Acceptance Gate` đã trả xong chi phí dựng.

## 8. Giá phải trả

**3 re-pin**, đo bằng cách đối chiếu `paths` đã khai của 29 hồ sơ với tám file gói này
chạm:

| Hồ sơ | Vì chạm |
|---|---|
| `ci-vitest-sdk-pin` | `.github/workflows/ci.yml` · `_acceptance/config.yaml` |
| `normalize-text-vi` | `_acceptance/config.yaml` |
| `roadmap-drift-guard` | `scripts/roadmap/**` · `docs/roadmap.md` |

Không tránh được: đưa guard vào CI *là* chạm `.github/`, và vá lỗ mù của guard lộ trình
*là* chạm `scripts/roadmap/`. Đặt bộ kiểm mới ở `scripts/ci/` đã tiết kiệm được 1–2
re-pin so với `scripts/roadmap/` hay `scripts/acceptance/`.
