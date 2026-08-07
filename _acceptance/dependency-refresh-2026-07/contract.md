---
schema_version: 1
feature: Dependency refresh — five pending dependabot updates
slug: dependency-refresh-2026-07
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, sdk]
status: verified
approved_by: Manh
approved_at: 2026-07-26
time_human_minutes: {gate1: 0, gate2: 0}
# The merge commit that carried this feature into main (PR #16). Every eval here
# asks about THIS pull request; scripts/acceptance/own-range.sh turns this into
# the commit range and commit set they ask over, so re-running on a later branch
# still grades this feature's own diff. See _acceptance/gate-scope-anchors/.
landed_merge: 4d89b58
---

# Acceptance Contract: dependency-refresh-2026-07

## Context

Five dependabot PRs (#3–#7) had been open since before the repo went public,
their CI red for a billing reason rather than a code one. They are combined
here into one change: merging them singly would have cost five CI rounds and
five acceptance re-pins, since each touches a file outside the T1 globs and so
invalidates every feature's pin on its own.

A dependency bump has no acceptance criteria of its own — its correctness *is*
the standing suite. That is exactly why it still belongs in the gate: the risk
is real (a bad bump breaks the product silently), and the record is cheap
(the evals are checks that already exist). This contract exists to leave a
dated, machine-verified statement that the product still works on the new
dependency set, and to satisfy the backstop honestly rather than by widening
`t1_skip_globs` until routine maintenance stops being checked.

No major bumps: react 19.2.1→19.2.8, next 15.5.19→15.5.21, drizzle-orm
0.44.5→0.45.2, better-sqlite3 12.2.0→12.11.1, biome 2.2.4→2.5.5, the rest
minor or patch. The three GitHub Actions bumps are majors but touch only
`docker-publish.yml`.

Source input: prompt (merge the five pending dependabot PRs)

## Criteria

- AC-1: Given the merged manifests, When `package.json` is read, Then it carries both dependabot groups — production and development — and still declares the repo's own scripts (`hooks:install`, `sdk:publish`, `gen:abi`), which a careless lockfile resolution could have dropped.
- AC-2: Given the two npm groups conflicted in `pnpm-lock.yaml`, When the lockfile is checked, Then it resolves cleanly against the merged manifest — it was regenerated from that manifest, never hand-merged.
- AC-3: Given biome moved 2.2.4 → 2.5.5, When `pnpm lint:check` runs, Then it passes with no warnings, including on `src/app/globals.css`, whose Tailwind at-rules the stricter CSS parser rejects unless `css.parser.tailwindDirectives` is declared.
- AC-4: Given the whole test suite, When `pnpm test` runs, Then all 197 tests pass on the new dependency set.
- AC-5: Given the SDK is unaffected by the JS bumps, When `cd sdk && pytest` runs, Then all 66 tests pass.
- AC-6: Given `next` and `react` moved, When `pnpm build && pnpm typecheck` runs, Then both succeed.
- AC-7: Given `drizzle-orm` and `better-sqlite3` both moved — the two bumps most able to break silently — When the COGS selftest runs, Then it passes, exercising the drizzle migrator and a real sqlite file end to end rather than only compiling against them.
- AC-8: Given biome 2.5.5's new `useOptionalChain` rule, When the diff is inspected, Then **no file under `src/lib/abi/**` or `src/app/api/**` is modified** — its autofix reached into T3 paths, and adopting a lint rule across critical code is its own change with its own contract, not a passenger in a version bump.

## Coverage

- Trục **lớp phụ thuộc**: production npm (AC-1, AC-4, AC-6, AC-7) | development npm (AC-1, AC-3) | GitHub Actions (không có eval — chỉ chạm `docker-publish.yml`, workflow không chạy trong CI của PR này; ghi ở Out of scope).
- Trục **rủi ro theo gói**: build/render (`next`, `react` — AC-6) | dữ liệu (`drizzle-orm`, `better-sqlite3` — AC-7, chạy migrator thật) | công cụ (`biome` — AC-3). [thước CE: ba nhóm này là toàn bộ gói có thể phá sản phẩm mà compile vẫn qua]
- Trục **toàn vẹn manifest**: cả hai nhóm có mặt | script của repo không bị mất khi giải xung đột lockfile (AC-1, AC-2).
- Trục **giữ phạm vi**: không rò thay đổi vào T3 (AC-8) — nửa "không được kích hoạt" của chính vụ này.

## Out of scope

- **Nâng ba action của GitHub** (`docker/build-push-action`, `actions/cache`, `docker/setup-qemu-action`) chỉ chạm `docker-publish.yml` — workflow không chạy trong CI của PR này, nên không có eval nào phủ được. Sẽ được kiểm chứng ở lần build Docker kế tiếp.
- **Áp dụng luật `useOptionalChain`.** Đã kiểm 11 vị trí và xác nhận tương đương, nhưng chúng nằm trong T3; việc áp dụng thuộc về một thay đổi riêng có contract riêng. Luật tạm tắt.
- **Kiểm thử runtime.** Cây kiểm tra chứng minh biên dịch, kiểu và test — không chứng minh hành vi lúc chạy của `next` hay `@xyflow/react` mới trên canvas thật.
- **Các phụ thuộc chưa được dependabot đụng tới.**

## Notes

- `pnpm-lock.yaml` xung đột giữa hai nhóm npm là điều đương nhiên; `package.json` tự merge sạch vì hai nhóm nằm ở hai section khác nhau. Lockfile được **tái sinh** từ manifest đã hợp nhất, không giải tay — giải tay một lockfile là cách chắc chắn nhất để tạo ra một cây phụ thuộc không ai tái lập được.
- `biome migrate` lo phần `$schema` và `recommended` → `preset`; không sửa tay.
- Không có bề mặt web UI mới → bỏ qua eval design theo SKILL 2b.
