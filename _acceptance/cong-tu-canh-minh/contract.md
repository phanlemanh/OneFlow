---
schema_version: 1
feature: Cổng tự canh mình — hai guard vào CI, và suite verify thôi tự đốt vòng
slug: cong-tu-canh-minh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, docs]
status: approved
design_doc: docs/superpowers/specs/2026-08-31-cong-tu-canh-minh-design.md
approved_by: Phan Le Manh
approved_at: 2026-08-31
---

# Acceptance Contract: cong-tu-canh-minh

## Context

Hạ tầng của chính cổng nghiệm thu hỏng **âm thầm**, hai mặt cùng một gốc.

**Guard có răng nhưng không được cắm điện.** `scripts/roadmap/check-roadmap-fresh.sh` và
`product-map.mjs --check` không có trong [`ci.yml`](../../.github/workflows/ci.yml) — đo
31/08: **0 tham chiếu**. `PRODUCT-MAP.md` đã trôi 4 slug (ghi *22 việc* khi có 26 hồ sơ
ký) mà không ai biết.

**Suite verify tự đốt vòng.** Đo trên bốn vòng S4 của `chong-mat-khoa-byo`: vòng 2 mất
trắng **20.1 phút / 47 agent / 0 tín hiệu** vì suite key gộp `pnpm build && pnpm typecheck`
bị công cụ giết ở 322s (chạy đơn lẻ xanh 2.1 phút), cộng một wrapper a11y chạy `pnpm dev`
trần nên tranh `.next` với chính suite key build chạy song song.

**Và guard lộ trình hiện có bị mù một chỗ.** Đo hôm nay: sổ cái **có một dòng trùng thật**
(`normalize-text-vi`, hai dòng hai ngày) trong khi guard báo xanh — nó so *tập* slug bên
trong khối marker. Đưa một guard có lỗ vào CI còn tệ hơn không đưa, vì từ đó nó *trông
như* đã được canh.

**Khuôn đã có của repo cho "vật sinh phải khớp nguồn" là sinh-lại-rồi-so**
(`gen_abi_clean = pnpm gen:abi && git diff --exit-code …`), cùng khuôn với `gofmt -l` /
`terraform fmt -check` *(nêu tên; không đo được tại máy này)*. Hồ sơ này **lệch khuôn có
chủ ý**: bộ sinh `product-map.mjs` không nằm trong repo, nên sinh-lại đòi vendor — mà
vendor để lại hai thước đo cho cùng một thứ. Ta khẳng định **bất biến** thay vì sinh lại.

## Criteria

### A. Bộ kiểm bản đồ sản phẩm

- AC-1: Given một slug có `status: signed-off` trong `_acceptance/<slug>/contract.md` mà
  **không** xuất hiện trong khối `## Đã giao` của `PRODUCT-MAP.md`, When chạy
  `scripts/ci/check-product-map.mjs`, Then nó thoát khác 0 và thông điệp **nêu đích danh
  slug còn thiếu** (chuỗi chứa đúng tên slug, không phải câu chung "bản đồ lệch").
- AC-2: Given số trong nút mermaid `Đã giao<br/>N việc` khác số slug đã ký, When chạy bộ
  kiểm, Then nó thoát khác 0 và thông điệp **nêu CẢ HAI con số** (số ghi trong bản đồ và
  số đếm được từ hồ sơ), để người đọc biết lệch bao nhiêu và về phía nào.
- AC-3: Given khối `## Đang cân nhắc cơ hội` và nút mermaid của nó, When chạy bộ kiểm,
  Then chúng khớp số thư mục `_acceptance/*/` có `opportunity.md` mà **không** có
  `contract.md`; lệch thì đỏ nêu cả hai số.
- AC-4: Given `PRODUCT-MAP.md` vắng, hoặc còn đó nhưng **không tìm thấy** khối cần đọc
  (đổi tiêu đề, nút mermaid đổi dạng), When chạy bộ kiểm, Then nó thoát khác 0 và nói rõ
  **vật nào không đọc được** — tuyệt đối không thoát 0. Một bộ kiểm không tìm thấy vật cần
  kiểm thì chưa kiểm gì cả; xanh ở đây là lời nói dối tệ hơn im lặng.

- AC-11: Given khối `## Đã giao` có một mục `` (`slug`) `` mà `_acceptance/<slug>/` **không
  tồn tại**, hoặc tồn tại nhưng `status` **khác** `signed-off` (bị rút, bị hạ về draft),
  When chạy bộ kiểm, Then nó đỏ nêu đích danh slug thừa. Và **ba số phải bằng nhau trong
  MỘT khẳng định**: số mục trong khối === số hồ sơ đã ký === số trong nút mermaid. Chiều
  này bỏ trống ở bản nháp đầu: AC-1 chỉ soi chiều "hồ sơ → bản đồ", nên một hồ sơ **bị
  rút** để lại mục cũ trên bản đồ mà bộ kiểm vẫn xanh. Repo này đã rút một hồ sơ một lần
  (`normalize-text-vi`, 26/08).
- AC-12: Given thư mục `_acceptance/*/` bất kỳ, When bộ kiểm phân loại nguồn, Then **mọi**
  thư mục rơi vào đúng một trong **bốn ô đóng**: đã ký · status khác · chỉ có
  `opportunity.md` · **không phân loại được**. Ô thứ tư — thiếu cả hai file, frontmatter
  không parse được, hoặc `status` ngoài tập đóng (`"signed-off"` có nháy, `Signed-off` hoa
  đầu) — là **ĐỎ nêu tên thư mục**, không phải bỏ qua im lặng. Không có ô này thì một hồ sơ
  có frontmatter lệch bị xếp thầm vào "chưa ký": nó rơi khỏi tập cần-có-mặt, số đếm vẫn
  khớp, và **toàn bộ bộ kiểm xanh trong khi bản đồ thiếu đúng hồ sơ đó** — một lỗ
  fail-OPEN nằm ngay trong bộ kiểm được bán là fail-closed.

### B. Vá lỗ mù của guard lộ trình

- AC-5: Given sổ cái lộ trình có **hai dòng cùng một slug**, When chạy
  `scripts/roadmap/check-roadmap-fresh.sh`, Then nó đỏ và nêu đích danh slug bị trùng —
  hôm nay nó xanh trong tình huống đó. Và dòng trùng đang tồn tại (`normalize-text-vi`)
  được dọn trong cùng lượt: không dọn thì CI đỏ ngay khi gói này hạ cánh.

### C. Cắm điện vào CI

- AC-6: Given một PR có sổ cái hoặc bản đồ lệch, When CI chạy, Then job `Acceptance Gate`
  **đỏ**. Đo bằng cách chạy đúng lệnh mà job chạy, trên cây lành và trên cây đã phá —
  **không** assert bằng cách đọc YAML của workflow, vì đọc YAML là đo *chỉ dẫn*, không đo
  *hành vi*.
- AC-13: Given khối job và chính workflow, When kiểm khả-năng-chạy, Then step guard và job
  `acceptance-gate` **không mang `if:` nào**, không nằm sau `needs:` một job có điều kiện,
  và trigger `pull_request` **không có `paths`/`paths-ignore`** loại trừ `PRODUCT-MAP.md`,
  `docs/roadmap.md` hay `_acceptance/**`. Không có tiêu chí này thì một dòng
  `if: github.ref == 'refs/heads/main'` làm AC-6 và AC-7 xanh sạch trong khi guard **không
  bao giờ chạy trên PR** — tức đúng nguyên trạng 0-tham-chiếu mà hồ sơ này sinh ra để đóng.
- AC-7: Given gói việc này đã hạ cánh, When CI chạy trên một PR bình thường, Then vẫn
  đúng **6 job** (không thêm job mới), VÀ định nghĩa của **năm job còn lại deep-equal** với
  chính chúng ở merge-base — so bằng bộ phân tích YAML, không so chuỗi thô. Đếm job và so
  tên không nói gì về thân job: gắn `continue-on-error: true` vào `lint` cho "đỡ ồn" thì
  vẫn 6 job, vẫn đúng năm cái tên, mà một job đã bị làm mềm.

### D. Suite verify thôi tự đốt vòng

- AC-8: Given `_acceptance/config.yaml`, When đọc `feature_loop.suite_keys`, Then nó liệt
  kê `executors.test.build` và `executors.test.typecheck` **rời nhau** và **không** còn
  `executors.test.build_typecheck`; VÀ `executors.test.build_typecheck` **vẫn tồn tại**
  trong `executors` — bảy hồ sơ đã ký tham chiếu nó, xoá là làm hỏng bảy bộ bằng chứng.
- AC-9: Given `scripts/onboarding/check-a11y-proto.sh`, When nó dựng dev server, Then nó
  đặt `NEXT_DIST_DIR` riêng thay vì dùng `.next` mặc định. ĐỐI CHỨNG DƯƠNG:
  `scripts/media-library/check-a11y-proto.sh` vốn đã đúng và phải **vẫn** đúng — một phép
  đo chỉ nhìn một file sẽ không phân biệt được "đã sửa" với "đọc nhầm file".

### E. Cắt ngang

- AC-10: Given mỗi bộ kiểm mới hoặc mỗi luật mới thêm vào bộ kiểm cũ, When chạy nó trên
  vật LÀNH rồi trên bản sao đã PHÁ, Then vật lành cho xanh và bản phá cho đỏ **kèm thông
  điệp ghim nêu đích danh vật lệch** — không chỉ exit khác 0. Một phép đo chưa từng đỏ
  không phân biệt được "vật lành" với "thước chưa bao giờ chạy".

## Coverage

Quét bằng `morphological-scan` (tự dựng trục — không preset nào khớp), hộp
**vật được canh × kiểu trôi × nơi chạy** = 4 × 5 × 2 = 40 ô; quét theo lát cắt trục A.

Trục *"nguồn gây trôi"* (ký hồ sơ mới · rút hồ sơ · sửa tay file sinh) **bị loại có lý
do**: cả ba đẻ ra cùng một tập kiểu trôi, tức không đổi độc lập được ⇒ không phải trục.
Nó sụp vào trục B.

- **Trục A — vật được canh:** bản đồ sản phẩm | sổ cái lộ trình | suite key | wrapper a11y.
  *Thước CE:* bản kê **đóng** — đúng bốn vật mà hai mặt của gói việc chạm
  `[SUY-TỪ-REPO: .github/workflows/ci.yml, _acceptance/config.yaml, scripts/roadmap/, scripts/*/check-a11y-proto.sh]`.
- **Trục B — kiểu trôi:** thiếu mục | thừa mục | **trùng mục** | số đếm sai | vật
  vắng/không đọc được. *Thước CE:* lịch sử trôi THẬT của chính repo — bản đồ thiếu 4 slug
  và số 22/26 sai (đo 31/08), sổ cái **đang có** dòng trùng `normalize-text-vi` trong khi
  guard xanh (đo 31/08). Ô "trùng mục" vào Core CHÍNH VÌ phép đo này, không phải vì suy luận.
  **Sửa sau phản biện context sạch (31/08):** ô **"thừa mục"** được Coverage khai là phủ
  nhưng KHÔNG có AC nào — AC-1 chỉ soi chiều "hồ sơ → bản đồ". Đúng lớp lỗi "giá trị trục
  không có AC mà Coverage vẫn khai phủ". Nay là AC-11.
- **Trục D — phía được canh:** bản đồ (đích) | hồ sơ `_acceptance/*/` (nguồn). *Thước CE:*
  một phép so hai vế thì fail-closed phải áp CẢ HAI vế. Trục này **sinh ra từ phản biện**:
  bản nháp đầu chỉ có AC-4 canh phía bản đồ, phía nguồn không bất biến nào — một frontmatter
  lệch bị xếp thầm vào "chưa ký", số đếm vẫn khớp, cả bộ kiểm xanh. Nay là AC-12.
- **Trục C — nơi chạy:** máy dev (gõ tay) | CI (tự động). *Thước CE:* `grep -c` trên
  `ci.yml` → 0 tham chiếu tới cả hai guard; đó là toàn bộ lỗ hổng gói việc này đóng.
- *[NGÀNH: `gofmt -l` · `terraform fmt -check`]* — khuôn ngành cho "vật sinh phải khớp
  nguồn" là **sinh-lại-rồi-so**, trùng khuôn `gen_abi_clean` sẵn có của repo.
  **[GIẢ ĐỊNH] — không đo được tại máy này:** cả hai công cụ chưa cài, nên tên có mà số
  thì không. Ảnh hưởng: lập luận "ta lệch khuôn ngành có chủ ý" đứng trên tên gọi chứ
  chưa đứng trên phép đo. **Đây là dòng cần người gạch tại Cổng 1.**

**Ô Core 13/52 (25%)** *(hộp nở khi trục D sinh ra ở phản biện)* — trên ngưỡng 20% có chủ ý: bốn ô "fail-closed" (AC-4), "không hồi
quy" (AC-7), "đối chứng dương" (AC-9) và "cặp hai chiều" (AC-10) là **nửa đàn áp** của
chính các ô thành công, không gộp vào được. Ba ô thêm sau phản biện (AC-11 thừa mục,
AC-12 fail-closed phía nguồn, AC-13 khả-năng-chạy) đều là lỗ **có kịch bản fail cụ thể**,
không phải wishlist. Đã cắt bằng hợp nhất ô, không bằng bỏ ô.

## Out of scope

- **Guard soi con số văn xuôi ngoài khối ledger** — văn xuôi `docs/roadmap.md` ghi
  *"21 hạng mục"* và *"14/23 … 9/23"* trong khi sổ có 28 dòng. Đây là lỗ **thứ hai** của
  guard lộ trình, khác lỗ trùng-dòng ở AC-5: văn xuôi tự do khó ghim thành bất biến máy
  đọc được. Đáng hợp đồng riêng, không nhét vào đây.
- **`landed_merge` thiếu ở 18/29 contract** — backfill siêu dữ liệu hàng loạt, khác gốc
  với "cắm điện cho guard".
- **Văn bản tiếng Việt trong file vendor của kit (hạng mục 0.7)** — là quyết định chính
  sách của owner (xin upstream dịch, hay ghi ngoại lệ vendor vào CLAUDE.md), không phải
  việc mã. Sửa tay file vendor thì lần bump kit sau ghi đè.
- **Vendor `product-map.mjs` vào repo** — loại ở quyết định 1 của owner: thêm file vendored
  thứ tư, và repo này đã ghi rằng bản vendored đóng băng rồi trôi thành fork so với cache
  plugin, để lại hai thước đo cho cùng một thứ.
- **Sinh lại bản đồ trong CI** — bất khả nếu không vendor; đó chính là lý do chọn khẳng
  định bất biến.
- **Thêm job CI mới cho hai guard** — job `Acceptance Gate` đã có `fetch-depth: 0` và
  Node 24, tức đã trả xong chi phí dựng; job mới là trả lại lần nữa cho ~20 giây setup.

## Notes

- **Không đụng `executors.test.build_typecheck`.** Bảy hồ sơ đã ký treo trên nó:
  `dependency-refresh-2026-07`, `per-plugin-origin`, `oneflow-plugin-prefix`,
  `measure-harness`, `pnpm-build-approvals`, `task-metering`, `sdk-distribution-rename`.
  Gói này chỉ đổi `feature_loop.suite_keys` — cái quyết định lệnh nào chạy mỗi vòng verify.
- **Chỗ đặt bộ kiểm mới chọn theo giá re-pin, không theo thói quen.** `scripts/ci/` = 0
  re-pin · `scripts/roadmap/` = 1 · `scripts/acceptance/` = 2. Cùng một file, ba mức giá.
- **Giá phải trả của gói này: 3 re-pin** — `ci-vitest-sdk-pin` (khai `.github/**` và
  `_acceptance/config.yaml`), `normalize-text-vi` (khai `_acceptance/config.yaml`),
  `roadmap-drift-guard` (khai `scripts/roadmap/**` và `docs/roadmap.md`). Bản nháp đầu
  của hồ sơ này ghi **1**; con số đúng chỉ ra khi đối chiếu `paths` của cả 29 hồ sơ với
  tám file thật sự chạm. Không tránh được: đưa guard vào CI *là* chạm `.github/`, vá lỗ mù
  *là* chạm `scripts/roadmap/`.
