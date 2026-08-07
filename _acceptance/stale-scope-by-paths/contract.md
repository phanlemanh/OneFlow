---
schema_version: 1
feature: Scope evidence staleness by declared eval paths
slug: stale-scope-by-paths
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: verified
approved_by: Manh
approved_at: 2026-07-28
time_human_minutes: {gate1: 10, gate2: 15}
---

# Acceptance Contract: stale-scope-by-paths

## Context

`scripts/pre-merge-check.sh` marks a signed feature's evidence stale when **any**
file outside `_acceptance/` and `t1_skip_globs` changed since that feature's
`verified_commit`. The comparison is whole-tree, so it cannot tell "code this
feature's evals exercise changed" from "unrelated drift".

Measured, not hypothetical: PR #25 (`conformance-l0`) adds files under `sdk/**`
and `scripts/**`, and the gate reports `OK [conformance-l0]` alongside seven
VIOLATIONs — `ci-actions-bump`, `dependency-refresh-2026-07`, `measure-harness`,
`oneflow-plugin-prefix`, `per-plugin-origin`, `sdk-distribution-rename`,
`task-metering` — none of whose subject the branch touches. The double-digit
round counts on `measure-harness` (14), `task-metering` (14) and
`sdk-distribution-rename` (13) are earlier payments of the same treadmill.

`evals.yaml` already declares per-eval `paths`. **That field was introduced as a
performance knob** for the kit's carry-forward P1: under-declaring it only makes
an eval re-run more often, which is the safe direction. Promoting it to a
correctness gate inverts the failure mode — under-declared `paths` would let
stale evidence through in silence. This is the design's central risk, and the
reason the mechanism cross-checks a declaration instead of trusting it.

The risk is already realised in the only feature that declares `paths`
(`conformance-l0`, 15/15 evals): a prototype of the cross-check against PR #25's
own diff names six files it exercises but never declares — including
`src/lib/abi/conformance.ts`, the adapter that eval E7 exists to test.

Design: [2026-07-28-stale-scope-by-paths-design.md](../../docs/superpowers/specs/2026-07-28-stale-scope-by-paths-design.md).

**"Gated"** below means what `stale_files` already considers: a changed file
except those under `_acceptance/**` or matching `t1_skip_globs`. Coverage and
staleness apply the same filter, or a file could be gated for one and not the
other.

**Two bases, never interchanged.** The filter is shared; the commit range is not,
and conflating them is the single most expensive mistake available here:

- **Staleness set** — gated files changed in `<feature>.verified_commit...HEAD`.
  Per feature. This is the set narrow scope is applied to.
- **Coverage set** — gated files changed in `BASE_SHA...HEAD`. Per PR, the same
  range the existing T1-escape backstop already computes. This is the set the
  cross-check requires `paths` to cover.

Read as one range, the feature delivers nothing: cross-checking a merged
feature's `paths` against its own `verified_commit...HEAD` spans every unrelated
merge since sign-off, so no honest declaration ever covers it and narrow scope is
refused forever — while every fixture eval stays green, because in a synthetic
repo the two ranges coincide. AC-12 exists to make that reading red.

## Criteria

- AC-1: Given a feature whose every eval declares `paths` and whose union covers the coverage set, When a file in its **staleness set** matches that union, Then the feature is still reported stale. *Without this the whole mechanism can degrade into "never stale" and every other criterion stays green — a disabled gate with a better name.*
- AC-2: Given the same feature, When every file in its **staleness set** falls **outside** that union, Then the feature is **not** reported stale and the check exits without a violation for it. *This is the behaviour the feature exists to produce.*
- AC-3: Given a feature with `paths` on **no** eval — the state all seven currently-red features are in — When the check runs, Then it reports exactly what it reports today: whole-tree staleness, with no new output line and no narrow scope. *The seven must not be silently un-staled by a mechanism they never opted into.*
- AC-4: Given a feature with `paths` on **some but not all** evals, When the check runs, Then it is treated as not-declared and falls back to whole-tree. *Partial declaration is the state a half-finished backfill leaves behind; reading it as "narrow" would scope by an incomplete list.*
- AC-5: Given a feature whose every eval declares `paths` but whose union does **not** cover the **coverage set**, and whose `_acceptance/<slug>/` is in the PR diff, When the check runs, Then narrow scope is refused, whole-tree applies, **and** every uncovered file of the coverage set is printed by name. *Silence here is the failure this contract is built around; naming the files is what makes an under-declaration fixable instead of mysterious.*
- AC-6: Given `paths` present but unusable — empty array, or a value that parses to no globs — When the check runs, Then the feature is treated as not-declared (whole-tree), never as "declared with an empty scope". *An empty scope matches nothing, which would read as "never stale" — the most dangerous possible misreading.*
- AC-7: Given a feature already merged whose `_acceptance/<slug>/` is **not** in the PR diff, When its `paths` are complete, Then it gets narrow scope **without** a cross-check against the coverage set; and given its `_acceptance/<slug>/` **is** in the PR diff, Then the cross-check does run. *The cross-check gates a declaration at the moment it is new or changed; running it against an unrelated PR's diff would refuse every merged feature forever.*
- AC-8: Given a change to `_acceptance/**` or to any `t1_skip_globs` path and nothing else, When the check runs, Then both sets are empty and no feature is reported stale, for declared and undeclared features alike. *Regression guard: the existing exclusions must survive the refactor of the function that applies them.*
- AC-9: Given the guard copies the gate script into a temporary directory and patches **that copy** — narrow scope forced to match nothing, and the completeness test forced to always pass — When the guard runs, Then it reports failure for **both** perturbations, and reverting each returns it to green. The working tree is never edited and the shipped script carries no perturbation switch (AC-13). *A guard that only exercises the happy path certifies nothing; these are the two mutations that turn the mechanism into a no-op and into blind trust respectively.*
- AC-10: Given the repo's own `_acceptance/` tree, When the check runs with `BASE_SHA` and `HEAD` pinned to the two literal SHAs recorded in eval E14 rather than to branch names, Then the cross-check is shown to have fired, the uncovered list is non-empty, and it is exactly this set of six: `src/hooks/use-workflow-recovery.ts`, `src/components/workspace/execution-status-line.tsx`, `src/hooks/use-workflow-execution.ts`, `src/constants/task-status.ts`, `src/lib/task/engine-events.ts`, `src/lib/abi/conformance.ts`. *Fixtures can be written to agree with the implementation; this pins the mechanism against the real repo, where the declaration was written by someone who did not know this rule existed.*
- AC-11: Given `risk_tiers.t1_skip_globs` in `_acceptance/config.yaml`, When the guard script's own path is tested against it, Then it does **not** match — the gate applies to the change that alters the gate. *The exemption exists so upgrading the measuring stick does not stale signed evidence; it is not a licence for changing what the stick measures to go unreviewed.*

- AC-12: Given a fixture repo where a feature's `verified_commit...HEAD` and the PR's `BASE_SHA...HEAD` deliberately differ — the feature signed off several unrelated commits ago — and whose `paths` cover the coverage set but **not** everything changed since its `verified_commit`, When the check runs, Then the cross-check passes and narrow scope is granted. *This is the fixture that tells the two ranges apart; with one range the implementation refuses narrow scope for every merged feature while all other fixtures stay green.*
- AC-13: Given `scripts/pre-merge-check.sh` as shipped at HEAD, When it is scanned for the guard's perturbation knobs by name, Then none is present. *"In-process mutation" implemented as an env var in the shipped gate is a production kill switch: set it and every declared feature gets a match-nothing scope and the gate exits clean. AC-9 would require that switch to exist; this forbids it existing anywhere but the guard's temp copy.*
- AC-14: Given a feature granted narrow scope, When the check runs, Then it prints one line naming that feature and the globs that scoped it; and when the narrow scope suppressed a staleness that whole-tree would have reported, Then the line says so explicitly; and given an undeclared feature, Then no such line is printed. *A successful narrow scope is the only path that weakens the gate, and it was the only path with no mandated output — leaving "F is genuinely unaffected" and "F's declaration has drifted" indistinguishable to a reviewer. The third clause keeps AC-3's silence intact.*

## Amendment (2026-08-05 — duyệt tại chỗ bởi Manh, phát hiện từ wave của `ci-vitest-sdk-pin`)

**E3 (`stale_scoping_golden`) bị descope.** Golden của nó đóng băng **phán quyết
staleness** của 7 feature khai 0 `paths`, chứ không phải **hành vi scoping** mà AC-3
nói tới. Hệ quả: nó không có trạng thái ổn định nào.

- Để nguyên → đỏ sau **mọi** wave re-pin thành công, vì ghim 7 feature đó xong thì
  gate in `OK [slug]` thay cho `VIOLATION [slug]` — 7 dòng lật cùng lúc.
- Regen về 7 dòng `OK` → đỏ ở nhánh sau, khi 7 feature đó stale trở lại.

Đo được chứ không phải lập luận: trên cùng một cây, `exit 0` trước khi wave ghim và
`exit 1` sau khi ghim; cả hai lần đều có dòng trong `run-log.jsonl`. 15 guard anh em
vẫn xanh ở cả hai trạng thái — chỉ E3 nhạy với trạng thái pin.

Đây là tầng thứ hai của đúng lỗi mà `ci-vitest-sdk-pin` vừa sửa ở tầng trên (golden
nuốt dòng NOTE gap-probe phụ thuộc diff). Cùng một hình dạng: **cổng đóng băng một
thứ phụ thuộc hoàn cảnh và gọi nó là bất biến.**

**Khoảng hở, đo lại chính xác sau vòng verify.** Bản đầu của Amendment này viết
"không eval nào còn khẳng định thẳng ca khai 0 `paths`" — **nói quá**. Vòng verify
context sạch đọc lại harness và chỉ ra **E15 (`announce`, AC-14) dựng fixture
zero-`paths` thật** (`mk_committed_report_fixture "$d2" fx none`, mode `none` = không
eval nào khai `paths`), làm bẩn một file gated, rồi khẳng định trực tiếp rằng gate
**không** in dòng `narrow staleness scope applied` cho nó. E8 (`suppression`) cũng
chạy fixture mode `none`, nhưng chỉ ở chiều phủ định.

AC-3 có ba mệnh đề. Sau descope:

| Mệnh đề | Trạng thái |
|---|---|
| (b) không thêm dòng output mới | ✅ E15 khẳng định thẳng trên fixture zero-`paths` |
| (c) không được cấp narrow scope | ✅ E15, cùng chỗ |
| (a) vẫn bị báo `VIOLATION … evidence is stale` khi có thay đổi gated | ❌ **không eval nào khẳng định** |

E4 khẳng định (a) cho ca *khai một phần*, E6 cho `paths: []` — cả hai là "coi như
không khai", không phải ca khai-0-dòng theo nghĩa đen.

Vòng verify cũng kiểm hành vi thật vẫn nguyên: dựng lại fixture `none` của E15 kèm một
thay đổi gated → gate in `VIOLATION [fx]: evidence is stale …` và không có dòng
narrow-scope. Cả ba mệnh đề đúng, chỉ (a) là **không được khẳng định**, không phải bị hỏng.

**Vá rẻ hơn nhiều so với ước tính ban đầu:** một dòng `grep -q 'VIOLATION \[fx\]:
evidence is stale'` thêm vào `$d2` sẵn có trong `case_announce` — fixture đã nằm đó
rồi, không cần dựng case `undeclared` mới. Vẫn để cho contract kế (chạm `scripts/**`
là kích lại treadmill staleness), nhưng giá thật là một dòng.

**Việc kế tiếp (hàng đợi, không thuộc contract này):** thêm case fixture `undeclared`
vào [`check-stale-scoping.sh`](../../scripts/acceptance/check-stale-scoping.sh), dựng
trên git fixture như 14 case anh em, nên miễn nhiễm trạng thái pin của repo thật —
đó là khác biệt khiến nó ổn định còn golden thì không.

[`check-stale-golden.sh`](../../scripts/acceptance/check-stale-golden.sh) và fixture
của nó **giữ nguyên trên cây**: xoá là chạm `scripts/**`, kích lại treadmill staleness
cho toàn bộ pin vừa ghim. Chúng là code chết cho tới khi contract kế dọn — ghi ở đây
để người sau không tưởng đó là guard đang có hiệu lực.

## Coverage

Scanned with `morphological-scan` (test-matrix preset, axes rebuilt from first
principles — the preset's surface/actor/data/env axes describe a product feature,
not a shell gate). Space is 5 × 3 × 5 = 75 cells, so pairwise by slices of axis A
rather than the full Cartesian product.

- **Trục A — trạng thái khai báo:** không khai · một phần · đủ & phủ · đủ & thiếu phủ · sai cú pháp — [CE: nội bộ, `stale_files` hiện tại + 7 VIOLATION thật + prototype 6 file uncovered]
- **Trục B — vị trí feature vs PR:** đang landing · đã merge, artifact ngoài diff · đã merge, artifact trong diff — [CE: nội bộ, lịch sử 8 workspace `_acceptance/`]
- **Trục C — loại file đổi:** trong `paths` · ngoài `paths` nhưng gated · `_acceptance/**` · `t1_skip_globs` · chỉ working-tree — [CE: nội bộ, các nhánh `case` sẵn có trong `stale_files`]
- **Chân ngành** — [NGÀNH: GitHub Actions `paths:` filters + required status checks] là đối chiếu sát nhất và cũng là cảnh báo: ở đó một job bị path-filter loại báo "skipped" mà **vẫn thoả** required check, tức declared-path scoping cho qua trong im lặng. AC-5, AC-6 và AC-9 sinh ra từ ô này. [NGÀNH: Nx `affected`, Bazel] đại diện hướng ngược — suy affected từ đồ thị phụ thuộc thay vì glob khai tay; mạnh hơn nhưng đòi build graph, ngoài tầm một script `sh` (xem Out of scope).
- **Ô quét lộ ra, suýt sót:** A(đủ & phủ) × B(đang landing) × C(trong `paths`) → **AC-1**. Nhìn từ phía "làm cho nó đừng stale nữa" thì ô này vô hình, mà thiếu nó thì cơ chế hỏng thành "không bao giờ stale" vẫn xanh hết.
- **Ô cắt khỏi phạm vi:** A(bất kỳ) × B(bất kỳ) × C(chỉ working-tree) — `git diff` không thấy file untracked và CI luôn chạy trên cây đã commit; hành vi hiện tại đã ghi chú điều này và không đổi.

## Out of scope

- **Gỡ đỏ cho 7 feature hiện tại.** Chúng khai 0 `paths`, nên cơ chế này không giúp được. Mỗi feature cần một PR gọn riêng để backfill — và PR đó phải mang theo code gated mà `paths` của chính nó phủ, vì một PR chỉ khai báo (không đụng gì gated khác) không còn gì để cross-check đối chiếu và bị từ chối scope hẹp thẳng thừng (xem "Known limits").
- **Backfill 6 `paths` thiếu của `conformance-l0`.** Nó giữ whole-tree tới khi ai đó khai — đó là hành vi đúng theo AC-10, không phải lỗ hổng.
- **Suy diff-lúc-landing từ lịch sử git** (`--first-parent`, tìm merge cũ nhất mà `^2` chứa `verified_commit`). Đã prototype và **chạy đúng** — trên `per-plugin-origin` tìm ra `6461d2b`, 41 file — nhưng loại vì thêm khảo cổ git vào script `sh` và phụ thuộc luật never-squash đúng cho **toàn bộ lịch sử cũ** chứ không chỉ từ nay. Lý do đầy đủ ở design doc.
- **Suy affected từ đồ thị phụ thuộc** (hướng Nx/Bazel). Đúng hơn về bản chất, nhưng cần dựng graph cho cả TS và Python — một feature riêng, không phải một nhánh của cái này.
- **Đổi scoping của `recheck`** (committed-evidence re-check). Cơ chế khác, chế độ lỗi khác.
- **Thêm trường `covers:` riêng.** Đã cân nhắc: rõ ý định hơn nhưng thêm một thứ khai tay và **vẫn** không tự chống under-declare, thứ mà cross-check làm được.

## Known limits

- Backfill cho feature cũ phải nằm trong PR mà gated diff được `paths` của chính nó phủ. PR trộn backfill với code khác sẽ bị từ chối scope hẹp. Ràng buộc cố ý, nhưng sẽ làm ai đó bất ngờ.
- **Cross-check chỉ chạy ở thời điểm khai báo mới xuất hiện hoặc bị sửa** (khi `_acceptance/<slug>/` nằm trong PR diff). Không PR nào sau đó kiểm lại. Phần dư này lớn hơn "khai báo trôi dần theo thời gian", và cần nói thẳng vì nó là giới hạn của chính cam kết trung tâm:

  **Một khai báo có thể có hiệu lực mà chưa từng được cross-check lần nào.** Bản vá cho lỗ "PR chỉ khai báo" từ chối scope hẹp khi coverage set rỗng — nhưng *từ chối* không có nghĩa là *chặn merge*. Nếu PR đó vẫn merge, PR kế tiếp không đụng `_acceptance/<slug>/` nữa, nên cross-check không chạy, và khai báo chưa từng kiểm ấy được dùng để thu hẹp bình thường. Tái hiện được:

  ```
  PR1 (chỉ chạm _acceptance/fx/)  → NOTE: coverage set rỗng, từ chối scope hẹp → OK
  PR2 (code thật ở src/real/**)   → NOTE: narrow scope applied — suppressed 1  → OK
  ```

  `src/real/**` chưa bao giờ nằm trong `paths` và chưa bao giờ bị đối chiếu, nhưng bị che từ PR2 trở đi.

  Đây là hệ quả trực tiếp của AC-7, không phải lỗi cài đặt: nếu cross-check chạy ở mọi PR thì `paths` của một feature đã merge không bao giờ phủ diff của PR không liên quan, nên scope hẹp bị từ chối cho MỌI feature đã merge và tính năng thành vô dụng. Thứ đóng được lỗ này là **thủ tục** (PR backfill phải mang theo code gated mà `paths` của nó phủ — xem Out of scope), không phải cơ chế. Ai bỏ qua thủ tục đó vẫn qua được.

  Trường hợp nhẹ hơn cùng gốc: một khai báo trung thực lúc viết trôi dần khi codebase phình ra quanh nó (thư mục mới, file mới ngoài `paths`), không PR nào chạm lại `_acceptance/<slug>/` để kích hoạt cross-check.
- Cross-check đối chiếu `paths` với **diff của PR**, không với thứ eval thật sự chạy. Khai `paths: ["**"]` sẽ pass mà chẳng thu hẹp gì. Không cơ chế nào chặn một khai báo trung thực với diff nhưng sai với eval — chỗ đó chỉ review bắt được.
- Feature bị sửa `paths` ở một PR muộn hơn sẽ được cross-check với diff của PR đó, không phải diff lúc landing. Kết quả gần như chắc chắn là từ chối scope hẹp (hướng an toàn), nhưng thông báo sẽ gây bối rối.

### Quyết ở Cổng 2 (2026-07-29) — chuyển sang contract riêng

Ba vòng verify tìm ra **5 lỗi fail-open cùng một họ**, và không lỗi nào bị eval bắt (16/16 xanh ở cả bốn trạng thái code). Bốn lỗi đã sửa trong feature này; phần còn lại human quyết tách ra:

- **Scope toàn glob t1-exempt thì vĩnh viễn rỗng (HIGH).** `scope_has_any_match()` hỏi trên TOÀN cây tracked, còn `stale_files()` trả lời trên cây ĐÃ LỌC (bỏ `_acceptance/**` + `t1_skip_globs`) *trước* khi áp scope. Một feature khai `paths: ["docs/**"]` hoàn toàn thành thật vẫn được cấp scope hẹp rồi lọc sạch mọi thay đổi đáng báo, mãi mãi. → **contract riêng**, gộp cùng chiều còn thiếu bên dưới. KHÔNG vá lẻ: bốn lần vá lẻ trước đều lòi ra biến thể kế tiếp.
- **Chiều còn thiếu của hợp đồng này:** không AC nào nói về *ngữ nghĩa không gian tên đường dẫn* và *coverage-set*. Các AC hiện có chỉ mô tả hành vi (thu hẹp đúng / từ chối đúng / im lặng đúng). Contract mới phải mở đúng trục đó, có eval cho cả 5 biến thể đã biết.
- **Tiếng Việt trong code và thông điệp CI (HIGH).** ~265 dòng + ≥14 thông điệp `VIOLATION`/`NOTE`, đến từ bump vendor kit 1.24.0 (`896b17e`), trong repo có luật English-only không ngoại lệ. Sửa tay sẽ bị ghi đè ở lần bump sau → **contract riêng**, và việc thật là quyết định chính sách: xin upstream dịch, hay ghi ngoại lệ vendor vào CLAUDE.md/CONTRIBUTING.md.

Chấp nhận và ghi nhận ở đây (không tách contract):

- `biome.json` nằm trong `t1_skip_globs` với lý do tự mâu thuẫn: `executors.test.lint` LÀ một executor, và `files.includes` của biome quyết định lint soi những gì — nên đổi file này CÓ thể làm bằng chứng lint mất hiệu lực.
- E14 vẫn ghim vào SHA chỉ tồn tại trên `feat/conformance-l0`. Nhánh đó bị rebase hoặc xoá sau merge là E14 đỏ vĩnh viễn, vì lý do không liên quan tới cơ chế đang đo.
- awk ghép cặp cross-layer dùng bảng chữ cái `[a-z_]+` cho key mở khối, làm `layer:` của eval trước rò sang eval sau.
- 16 executor mới trong `config.yaml` không đặt trong ngoặc kép như 20 executor cũ; resolver cắt mọi thứ sau `#` có khoảng trắng đứng trước, nên giá trị không ngoặc kép chỉ cách một ký tự `#` là bị cắt âm thầm.
