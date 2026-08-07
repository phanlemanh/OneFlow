---
schema_version: 1
feature: CI-a — vitest vào CI + gỡ ghim SDK cứng của guard overlay (khử mìn hạ tầng verify)
slug: ci-vitest-sdk-pin
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, scripts, docs]
status: signed-off
approved_by: Manh
approved_at: 2026-08-05
time_human_minutes: {gate1: 10, gate2: 15}
---

# Acceptance Contract: ci-vitest-sdk-pin

## Context

Hàng đợi STATUS gọi gói này là **CI-a**. Ba việc cùng một chủ đề: **bộ đo đang
tuyên bố phủ nhiều hơn thứ nó thật sự phủ.** Không hạng mục nào thêm tính năng
sản phẩm; cả ba trả lại hiệu lực cho hạ tầng verify.

1. **413 test vitest không có job CI nào chạy.** [`ci.yml`](../../.github/workflows/ci.yml)
   có 5 job — Lint, Type Check, Build, SDK Tests (Python), Acceptance Gate — và
   không có vitest. `pnpm test` (`vitest run`) chỉ chạy khi ai đó nhớ gõ tay.
   Phát hiện từ round 6 của `conformance-l0`, ghi trong STATUS từ 29/07; mỗi
   feature mới làm nợ đắt thêm (compose-overlay vừa thêm ~66 test vào vùng
   không được CI bảo vệ).
2. **`run-overlay-plugin-tests.sh` ghi cứng `oneflow-sdk==0.2.18`.**
   [Script](../../scripts/plugins/run-overlay-plugin-tests.sh) là đường chạy của
   **13 executor key `overlay_*`** (`_acceptance/config.yaml` §191–203) — toàn bộ
   bằng chứng render của compose-overlay. Trong khi đó
   [`check-overlay-sdk-train.sh`](../../scripts/abi/check-overlay-sdk-train.sh)
   **đã** derive phiên bản từ `sdk/pyproject.toml` và bắt plugin ghim đúng bản đó.
   Hệ quả ở lần bump SDK kế (`normalize-text-vi` → 0.2.19): train guard xanh vì
   plugin ghim 0.2.19, còn 13 eval render vẫn cài 0.2.18 → **chúng chứng minh một
   tổ hợp không còn được ship**. Fail-open im lặng, đúng họ lỗi mà repo đã trả giá
   4 lần vá lẻ ở `stale-scope-by-paths`.
3. **`CLAUDE.md` §"Registering an official plugin" mô tả guard bản cũ** —
   vẫn nói `check-manifest-unmoved.sh` khẳng định "38 plain string entries", trong
   khi compose-overlay đã đổi ngữ nghĩa sang "38 chuỗi trơn + đúng 1 entry origin".
   File này được mọi agent đọc mỗi phiên, nên sai lệch ở đây lan sang mọi phiên sau.

Source input: prompt (chốt tại phiên 05/08, sau khi đối chiếu tiến độ với
[roadmap](../../docs/roadmap.md) Phase 1 + [STATUS](../../STATUS.md) hàng đợi CI-a).

**Vì sao gói này đi TRƯỚC `normalize-text-vi`:** hạng mục (2) là mìn hẹn giờ nổ
đúng vào bước kế tiếp của lộ trình — 1.3 và 1.4 đều publish SDK mới. Gỡ sau khi
bump là gỡ khi đã mất một vòng bằng chứng.

### Chi phí ký lại — BÁO GIÁ TẠI CỔNG 1 (luật per-file)

Tính bằng máy trên cây `65b5529`, không ước lượng. Diff dự kiến chạm đúng 3 file:
`.github/workflows/ci.yml` · `scripts/plugins/run-overlay-plugin-tests.sh` ·
`CLAUDE.md` (t1-exempt, không gây stale).

| Nhóm | Số | Feature | Vì sao |
|---|---|---|---|
| **Re-verify + ký lại** | **2** | `ci-actions-bump`, `compose-overlay` | Sở hữu file ta chạm: merge `8477f8a` chứa `ci.yml`; merge `7976bd8` chứa `run-overlay-plugin-tests.sh`. Giao khác rỗng → **không được carry-forward** |
| **Carry-forward re-pin** | **7** | `conformance-l0`, `dependency-refresh-2026-07`, `measure-harness`, `oneflow-plugin-prefix`, `per-plugin-origin`, `sdk-distribution-rename`, `task-metering` | Stale (6 feature khai 0 `paths` → whole-tree; `conformance-l0` có scope hẹp nhưng chứa `scripts/plugins/**`), nhưng file của chính chúng không đổi |
| **Không phải làm gì** | **6** | `cache-l1..l4`, `gate-scope-anchors`, `stale-scope-by-paths` | Scope hẹp không giao với 3 file trên — cơ chế 0.5 trả công lần nữa |

**Chi phí trội là `compose-overlay`** (27 eval, trong đó 13 eval clone-and-pytest
phụ thuộc mạng + PyPI), không phải `ci-actions-bump` như ghi chú ban đầu trong
STATUS. Con số đó phải được chấp nhận ở Cổng 1 chứ không phát hiện giữa vòng verify.

**Một điểm mờ đã biết, trình luôn:** `compose-overlay` và `gate-scope-anchors`
cùng `landed_merge: 7976bd8` (cùng hạ cánh ở PR #43), nên quy tắc "tập file sở hữu
= diff của merge commit" **không phân biệt được hai feature này**. Ở gói này nó
không đổi kết luận (`gate-scope-anchors` có scope hẹp nên không stale ngay từ đầu),
nhưng là giới hạn thật của luật ownership — ghi ở Known limits, không sửa ở đây.

## Criteria

Quy tắc chung, kế thừa `stale-scope-by-paths` và `gate-scope-anchors`: **mọi guard
mới phải chứng minh nó ĐỎ khi lỗi quay lại, không chỉ XANH khi code đúng.** Mỗi
hạng mục dưới đây vì thế có một tiêu chí "răng" đi kèm tiêu chí "dây".

- AC-1: Given `.github/workflows/ci.yml`, When kiểm cấu hình, Then tồn tại đúng
  một job chạy `pnpm test`, cùng bộ trigger với các job sẵn có (`pull_request`
  → `main` **và** `push` → `main`), dùng cùng pattern setup (pnpm action-setup +
  setup-node 24 + `pnpm install`) như 4 job hiện hữu. *Dây: test được CI chạy.*
- AC-2: Given job vitest đã cấu hình, When soi cấu hình đó, Then **không** có
  `continue-on-error`, `|| true`, `if:` khiến job bỏ qua trên pull request, hay
  bất kỳ hình thức nào làm exit code không truyền ra kết luận job. *Một job không
  thể đỏ tệ hơn không có job — repo đã ghi đúng câu này trong
  `check-no-t3-drift.sh`.*
- AC-3: Given một test cố tình hỏng được đưa vào cây (perturbation in-process,
  không commit), When chạy đúng lệnh mà job CI chạy, Then lệnh **exit khác 0**;
  gỡ perturbation → exit 0. *Răng của AC-1: chứng minh job không vacuous mà
  không cần push một commit hỏng lên `main`.*
- AC-4: Given một CI run thật của nhánh này trên GitHub, When liệt kê job của
  run đó, Then job vitest **có mặt và kết luận success**, đồng thời 5 job cũ
  (Lint · Type Check · Build · SDK Tests (Python) · Acceptance Gate) vẫn có mặt
  và success. *Dây thật, không phải dây trên giấy; đồng thời là tiêu chí
  should-NOT-break cho 5 job cũ.*
- AC-5: Given `scripts/plugins/run-overlay-plugin-tests.sh`, When kiểm nội dung,
  Then **không còn literal phiên bản SDK nào** (không `0.2.18`, không chuỗi
  `oneflow-sdk==<số>` viết cứng); phiên bản được đọc từ `sdk/pyproject.toml` —
  cùng nguồn và cùng cách đọc mà `scripts/abi/check-overlay-sdk-train.sh` đang
  dùng.
- AC-6: Given `sdk/pyproject.toml` khai một phiên bản KHÁC `0.2.18` (perturbation
  in-process trên bản sao, không đụng cây thật), When chạy script ở chế độ in ra
  spec đã giải, Then spec bám theo phiên bản mới; Given trả pyproject về nguyên
  trạng, Then spec trở lại đúng phiên bản hiện hành. *Răng của AC-5: đây chính là
  fail-open cần đóng — trước khi sửa, perturbation này KHÔNG làm đổi spec.*
- AC-7: Given biến môi trường `OVERLAY_SDK_SPEC` được đặt, When chạy script,
  Then spec đó được dùng nguyên văn, ưu tiên hơn giá trị derive. *Should-NOT-break:
  đường "CI trỏ vào wheel local trước khi bản PyPI hạ cánh" là nhu cầu có thật đã
  ghi trong comment của script; sửa mà mất nó là đổi một lỗ này lấy lỗ khác.*
- AC-8: Given cả hai script `run-overlay-plugin-tests.sh` và
  `check-overlay-sdk-train.sh`, When so cách chúng lấy phiên bản, Then chỉ có
  **một** chỗ định nghĩa luật đọc (dùng chung, hoặc một chỗ gọi chỗ kia) — không
  sinh bản sao thứ hai. *Repo đã có "bản sao luật URL thứ tư" trong nợ
  per-plugin-origin; đừng mở họ lỗi đó ở đây.*
- AC-9: Given `CLAUDE.md` §"Registering an official plugin", When đọc mô tả guard
  `check-manifest-unmoved.sh`, Then mô tả khớp ngữ nghĩa hiện hành ("38 chuỗi trơn
  dưới org mặc định + đúng 1 entry origin"), và **không còn** khẳng định
  `expected_count` = "38 plain string entries" như bản cũ; kiểm được bằng grep,
  không cần phán đoán.
- AC-10: Given nhánh này, When chạy các guard đã neo của feature khác
  (`ACCEPTANCE_SLUG=ci-actions-bump bash scripts/ci/check-workflow-drift.sh`,
  `ACCEPTANCE_SLUG=oneflow-plugin-prefix …check-no-config-drift.sh`,
  `ACCEPTANCE_SLUG=dependency-refresh-2026-07 …check-no-t3-drift.sh`), Then tất cả
  **xanh** — chúng chấm range của chính chủ, không chấm diff của nhánh này.
  *Should-NOT-fire: thêm một job vào `ci.yml` là đúng hình dạng thay đổi mà
  `check-workflow-drift.sh` từ chối; nếu nó đỏ ở đây thì neo `landed_merge` của
  `gate-scope-anchors` chưa thật sự hoạt động, và ta cần biết điều đó ngay.*
- AC-11: *(sửa lời 05/08, sửa lần hai 07/08 — xem Amendment)* Given nhánh này sau
  khi wave ký lại đã chạy, When chạy
  `bash scripts/acceptance/check-resign-wave.sh ci-vitest-sdk-pin`, Then exit 0:
  **không feature nào khác còn evidence stale**. Đó là nửa đo được của "wave đã
  khớp báo giá Cổng 1" — sóng ký lại *chính là* chuyện staleness. Chữ ký đang chờ
  của feature khác, hay verdict đang bay của feature khác, **không** thuộc câu hỏi
  này: chúng chỉ nói rằng cùng một người còn nhiều thứ phải ký. Lệch khỏi bảng báo
  giá → disclose ở Cổng 2, không âm thầm mở rộng. **Nửa sau — `pre-merge-check:
  clean` sau khi ký — là mục kiểm tay trong checklist Cổng 2, không phải eval máy.**

- AC-12: Given `_acceptance/config.yaml`, When kiểm sau thay đổi, Then **không có
  executor key `overlay_*` nào bị đổi hoặc gỡ**, và `feature_loop.suite_keys`
  giữ nguyên. *Boundary: gói này sửa cách guard tự chạy, không sửa tập guard.*

## Amendment 3 (2026-08-07 — sửa lời để lint đọc được, KHÔNG đổi ngữ nghĩa)

AC-11 mang chú thích sửa-lời dạng `- AC-11 *(sửa lời 05/08, …)*: Given …`, tức chú thích
nằm **giữa** id và dấu hai chấm. `eval-coverage-lint.js` khớp tiêu chí theo **từng dòng
vật lý** bằng `^\s*[-*]\s*(AC-\d+)\s*[:.]\s*(.+)$`, nên dòng này không khớp và AC-11 **rơi
khỏi tầm nhìn của lint hoàn toàn** — không W1, không W4, không một tiếng động nào báo là
nó bị bỏ qua. Trớ trêu: chính thói quen ghi chú amendment (do hai lần sửa lời trước đó
sinh ra) là thứ làm tiêu chí vô hình. Chú thích nay chuyển ra **sau** dấu hai chấm; chữ
nghĩa tiêu chí giữ nguyên từng byte (diff: 1 dòng, 1+/1-).

**Đo lại sau khi sửa (07/08):** AC-11 không gắn `(cross-layer)` nên W4 không áp dụng, và
việc nó hiện ra **không** sinh cảnh báo W1 mới — output của lint trên toàn `_acceptance/`
giống hệt trước và sau (7 cảnh báo W1, đều thuộc AC khác). Không có gì phải sửa thêm;
chữ ký Cổng 2 **không** cần cắt lại. Cùng đợt sửa với `compose-overlay`,
`per-plugin-origin` (cùng dạng chú thích) và `cache-l2-store` / `cache-l3-tier-b`
(dạng nhãn `(cross-layer)`, nơi W4 thật sự đã ngủ).

## Amendment 2 (2026-08-07 — nhiều feature cùng bay)

Bản sửa 05/08 làm AC-11 *đạt tới được* bằng cách tha cho chữ ký đang chờ của
**chính feature này**. Nó ngầm giả định tại một thời điểm chỉ có **một** feature
đang bay. Ngày 07/08 giả định đó vỡ: `local-cpu-plugins` mang một eval residual
cùng dạng, và hai eval khoá nhau — mỗi cái đòi cái kia phải ký xong trước. Cả hai
là eval `script`, nên `human_override` không giải phóng được; verify trên nhánh
riêng cũng không thoát, vì staleness đo từ commit **mang code**, nên cả hai buộc
phải cùng bay.

Sửa ở hai tầng. `check-gate-residual.sh` nay tha cho feature *khác* đang ở trạng
thái PASS-chờ-ký (vẫn chặn foreign stale / REJECT / thiếu report). Và AC-11 rebind
sang `check-resign-wave.sh`, guard mới hỏi đúng câu hẹp hơn mà tiêu chí này thật
sự cần: *còn feature nào mang evidence stale không*. Mỗi guard có bộ răng riêng
(13 và 7 case) chứng minh nó vẫn đỏ với đúng những gì không được tha.

Cái bị bỏ đi so với lời cũ: AC-11 không còn khẳng định mọi feature khác đã **ký
xong**. Đó không phải mất mát — nó là điều một vòng verify không bao giờ quan sát
được, và `pre-merge-check` sau chữ ký mới là chỗ khẳng định nó.

## Amendment (2026-08-05 — duyệt tại chỗ bởi Manh, sau vòng verify 2)

**AC-11 nguyên văn không thể thoả trong bất kỳ vòng verify nào** — không phải "chưa
thoả", mà bất khả về cấu trúc. Vòng 2 chứng minh bằng máy: `pre-merge-check.sh`
soi **mọi** feature trong `_acceptance/`, kể cả feature đang bay, và nó violation
ở **cả ba** trạng thái feature đó có thể ở trong lúc S4 —

1. chưa có `evidence-report.md`,
2. có report nhưng `verdict` chưa PASS,
3. `verdict: PASS` mà `human_signoff` còn rỗng (`signoff.required_for: [T2,T3]`,
   `require_human_commit: true`).

Verifier **bị cấm** điền `human_signoff`, nên trạng thái (3) là sàn không vượt được.
Vòng 1 đọc cái đỏ này thành "wave chưa chạy" — đúng lúc đó, và nó che mất bản chất;
wave chạy xong rồi thì phần còn lại lộ ra là cấu trúc.

Đây đúng họ lỗi repo đã đặt tên ở `stale-scope-by-paths` và `gate-scope-anchors`:
**hỏi câu hỏi ở một không gian, dùng câu trả lời ở không gian khác.** AC-11 hỏi về
thế giới *sau khi ký* nhưng bắt máy trả lời *trước khi ký*. Khác hai lần trước ở chỗ
nó fail **closed**, nên không có gì không an toàn lọt qua — cái mất là eval không
bao giờ xanh được.

**Sửa:** tách đôi. Nửa máy chứng minh được → [`check-gate-residual.sh`](../../scripts/acceptance/check-gate-residual.sh)
(`civ_gate_residual`): mọi feature khác phải sạch, chỉ tha đúng cái chờ-người của
slug đang bay. Không yếu đi ở chỗ quan trọng — feature nào còn stale/đỏ/thiếu chữ ký
vẫn hiện violation và guard từ chối (đã kiểm: bỏ chữ ký của `task-metering` →
guard đỏ và nêu tên nó; khôi phục → xanh). Nửa sau (`clean` sau chữ ký) chuyển thành
mục kiểm tay ở checklist Cổng 2.

**Ghi ra ngoài feature này:** mọi contract sau có AC dạng "pre-merge-check clean"
đều đâm vào đúng bức tường này. Thuộc về hàng đợi như một hạng mục riêng — giống
cách 0.6 ra đời từ Cổng 2 của 0.5.

### Đính chính báo giá Cổng 1 (phát hiện ở vòng 2)

Mục "Chi phí ký lại" trên nói *"diff dự kiến chạm đúng 3 file"*. Sai. Bản sửa đầu
tiên của đính chính này nói 10 — **cũng sai**. Con số thật ở `01ee88c` là **13 file**
ngoài `_acceptance/`: 3 file gốc + 7 guard script mới/sửa (`check-vitest-job.sh`,
`check-overlay-pin-derived.sh`, `check-manifest-doc-synced.sh`,
`check-eval-keys-intact.sh`, `check-gate-residual.sh`, `sdk-version.sh`,
`check-action-pins.sh`) + `STATUS.md`, `docs/roadmap.md` (t1-exempt) + chính
`check-gate-residual.sh` được đếm trong nhóm guard. Không file nào thuộc `t3_paths`
nên **tier T2 vẫn đúng**, và bảng 2/7/6 vẫn đúng từng tên. Sửa một con số sai bằng
một con số sai khác là đúng thứ đáng ghi lại, nên giữ cả hai lần trong văn bản.

### Known limits (trình Cổng 2)

- **Guard tha ba lớp, không phải một.** `check-gate-residual.sh` bỏ qua violation
  của chính slug đang bay khi nó thuộc `no evidence-report.md`, `verdict=REJECT`,
  hoặc `human_signoff is empty`. Cần cả ba vì E11 chạy **trước** khi report của vòng
  được ghi. Vòng 3 bắt được việc thông điệp chỉ nói "pending Gate-2 signature" trong
  cả ba ca — đã sửa để in đúng lớp nào được tha.
- **Điểm mù kế thừa từ `pre-merge-check`:** nó short-circuit theo từng feature, nên
  khi report của slug đang bay là PASS + chưa ký, nó chỉ báo đúng cái đó — kể cả khi
  `verified_commit` của chính report ấy đã cũ. Trong một vòng verify, staleness của
  chính feature này **vô hình** với E11. Hết vô hình ngay khi người ký.
- **Treadmill `t1_skip_globs` × gate tooling** (phát hiện vòng 3, thuộc hàng đợi chứ
  không thuộc gói này): `t1_skip_globs` miễn 4 đường gate-tooling **theo tên chính
  xác**, nên mọi feature acceptance hạ cánh guard thứ 5 trở đi dưới `scripts/` đều
  làm cũ lại toàn bộ pin trước đó. Chính commit amendment `01ee88c` đã tự chứng minh:
  thêm `check-gate-residual.sh` → 10 feature stale, và guard viết ra để khẳng định
  "mọi feature khác đều sạch" là file làm chúng không sạch. Cùng gốc với bẫy AC-11.
- **`sdk-version.sh` neo bằng `BASH_SOURCE`** → chỉ đúng khi source từ bash; dưới zsh
  fail **closed** và ồn ào (exit 2), không âm thầm dùng sai phiên bản. Mọi consumer
  trong repo là script `#!/usr/bin/env bash`.
- **AC-4 phủ 5/6 job.** Tiêu chí kể 6 job (gồm Acceptance Gate), lệnh eval liệt 5.
  Job Acceptance Gate đỏ trong lúc feature chưa ký là đúng thiết kế; nửa "gate job
  xanh" cần spot-check tay ở Cổng 2 sau chữ ký.
- **`compose-overlay` và `gate-scope-anchors` cùng `landed_merge: 7976bd8`** → luật
  "tập file sở hữu = diff của merge commit" không phân biệt được hai feature này.
- **Chỉ 5/15 contract có `landed_merge`** → với 10 contract còn lại không tính được
  tập file sở hữu, nên wave phải xử lý bảo thủ là re-verify. `own-range.sh` fallback
  về `merge-base(HEAD, origin/main)..HEAD`, nên nếu một trong số đó về sau có guard
  neo, nó sẽ chấm diff của nhánh khác.

## Coverage

Quét trục (morphological, preset "hạ tầng verify"; chân sản phẩm: STATUS hàng đợi
CI-a + Known limits của `compose-overlay`; chân ngành: `[NGÀNH: GitHub Actions
job semantics]` cho trigger/`continue-on-error`, `[NGÀNH: PEP 440 version
specifier]` cho dạng `oneflow-sdk==X.Y.Z`):

- **Trục hạng mục:** vitest-vào-CI | derive SDK pin | doc guard → AC-1..4, AC-5..8, AC-9
- **Trục dây↔răng** (mỗi cơ chế phải có cả hai): dây AC-1/AC-5 · răng AC-3/AC-6 ·
  dây-thật-trên-CI AC-4 — *trục này là bài học "guard suýt viết rỗng" của
  `stale-scope-by-paths`*
- **Trục should-NOT:** job không thể đỏ (AC-2) · mất đường override (AC-7) · bản
  sao luật thứ hai (AC-8) · guard feature khác đỏ oan (AC-10) · tập guard bị đổi
  (AC-12) · 5 job cũ mất/đỏ (AC-4 nửa sau)
- **Trục chi phí hệ thống:** wave ký lại đúng như báo giá (AC-11)
- Ô Later/Never có vết: đưa 13 eval `overlay_*` vào CI (**Never ở gói này** — cần
  clone + PyPI + uv, tiền lệ đã ghi trong `evals.yaml` của compose-overlay và
  `gate-scope-anchors`: eval phụ thuộc mạng chạy local trong vòng verify, không
  wire vào CI) · gộp `pnpm test` vào job Lint cho nhanh (**Never** — gộp exit code
  làm mất khả năng phân biệt lỗi, đúng bài học F1 của `stale-scope-by-paths`) ·
  chạy vitest theo shard/song song (**Later** — 413 test hiện chạy 1.2 s, tối ưu
  chưa có lý do) · cache vitest giữa run (**Later**).

## Out of scope

- **Không tái cấu trúc CI**: không đổi runner, không gộp/tách job sẵn có, không
  đụng `docker-publish.yml` hay `desktop-release.yml`.
- **Không wire eval phụ thuộc mạng vào CI** (13 eval `overlay_*`, E9/E11 của
  `gate-scope-anchors`) — giữ nguyên nghi thức "chạy local trong vòng verify".
- **Không bump SDK**, không đụng `sdk/pyproject.toml` ngoài việc ĐỌC nó (bump là
  việc của 1.3).
- **Không retire `check-manifest-unmoved.sh`** — AC-9 chỉ sửa mô tả trong docs cho
  khớp hành vi đã có, không đổi hành vi guard.
- **Không sửa các Known limits còn lại của `compose-overlay`** (nhãn enum chưa
  dịch, `mediaKind` trả `"image"`, ô nhập số không chặn khoảng ABI) — thuộc
  contract `overlay-canvas-reach`.
- **Không đụng `plugin_is_dirty` fail-open khi `git status` lỗi** (Known limit của
  `cache-l2-store`) dù cùng họ fail-open — khác surface, khác chủ sở hữu.

## Notes

- Tier T2: diff dự kiến không chạm `risk_tiers.t3_paths` (`config/tongflow.abi.json`,
  `src/generated/abi/**`, `src/lib/abi/**`, `sdk/**`, `src/db/**`,
  `src/lib/plugin-executor/**`, `src/lib/workflow/**`, `src/app/api/**`,
  `scripts/publish-tongflow-pypi.sh`). **Nếu lúc implement phải đụng `sdk/**`
  (ví dụ chọn cách chia sẻ luật đọc phiên bản qua một file trong `sdk/`), tier
  phải leo lên T3** — Phase 3 kiểm lại `git diff` thật và escalate.
- AC-8 có ít nhất hai cách hiện thực (script chung dưới `scripts/lib/`, hoặc
  `run-overlay-plugin-tests.sh` gọi hàm của `check-overlay-sdk-train.sh`).
  Chọn cách nào là việc của implementation plan; contract chỉ đòi "một luật, một chỗ".
- Nghi thức merge giữ nguyên (AGENTS.md): merge commit, không squash; chữ ký Cổng 2
  nằm ở commit riêng chỉ chứa human-owned fields (`signoff.require_human_commit: true`).
- Liên quan: [ADR-0010](../../docs/adr/0010-mainstream-infra-and-models.md) (hạ tầng
  phổ biến) không bị gói này chạm; `gate-scope-anchors` là feature làm cho AC-10 có
  thể xanh — nếu AC-10 đỏ, đó là phát hiện về feature đó, không phải về gói này.
