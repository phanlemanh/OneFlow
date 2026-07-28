---
schema_version: 1
feature: Scope evidence staleness by declared eval paths
slug: stale-scope-by-paths
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: approved
approved_by: Manh
approved_at: 2026-07-28
time_human_minutes: {gate1: 10, gate2: 0}
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

- **Gỡ đỏ cho 7 feature hiện tại.** Chúng khai 0 `paths`, nên cơ chế này không giúp được. Mỗi feature cần một PR gọn riêng để backfill, và cross-check sẽ ép khai đúng thay vì khai cho qua.
- **Backfill 6 `paths` thiếu của `conformance-l0`.** Nó giữ whole-tree tới khi ai đó khai — đó là hành vi đúng theo AC-10, không phải lỗ hổng.
- **Suy diff-lúc-landing từ lịch sử git** (`--first-parent`, tìm merge cũ nhất mà `^2` chứa `verified_commit`). Đã prototype và **chạy đúng** — trên `per-plugin-origin` tìm ra `6461d2b`, 41 file — nhưng loại vì thêm khảo cổ git vào script `sh` và phụ thuộc luật never-squash đúng cho **toàn bộ lịch sử cũ** chứ không chỉ từ nay. Lý do đầy đủ ở design doc.
- **Suy affected từ đồ thị phụ thuộc** (hướng Nx/Bazel). Đúng hơn về bản chất, nhưng cần dựng graph cho cả TS và Python — một feature riêng, không phải một nhánh của cái này.
- **Đổi scoping của `recheck`** (committed-evidence re-check). Cơ chế khác, chế độ lỗi khác.
- **Thêm trường `covers:` riêng.** Đã cân nhắc: rõ ý định hơn nhưng thêm một thứ khai tay và **vẫn** không tự chống under-declare, thứ mà cross-check làm được.

## Known limits

- Backfill cho feature cũ phải nằm trong PR mà gated diff được `paths` của chính nó phủ. PR trộn backfill với code khác sẽ bị từ chối scope hẹp. Ràng buộc cố ý, nhưng sẽ làm ai đó bất ngờ.
- Cross-check đối chiếu `paths` với **diff của PR**, không với thứ eval thật sự chạy. Khai `paths: ["**"]` sẽ pass mà chẳng thu hẹp gì. Không cơ chế nào chặn một khai báo trung thực với diff nhưng sai với eval — chỗ đó chỉ review bắt được.
- Feature bị sửa `paths` ở một PR muộn hơn sẽ được cross-check với diff của PR đó, không phải diff lúc landing. Kết quả gần như chắc chắn là từ chối scope hẹp (hướng an toàn), nhưng thông báo sẽ gây bối rối.
