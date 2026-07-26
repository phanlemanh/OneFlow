---
schema_version: 1
feature: CI actions bump — actions/checkout 4→7, docker/login-action 3→4
slug: ci-actions-bump
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci]
status: implemented
approved_by: Manh
approved_at: 2026-07-26
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: ci-actions-bump

## Context

The two dependabot PRs left open after #16: `actions/checkout` 4→7 (#1) and
`docker/login-action` 3→4 (#2). They were held back deliberately. `checkout` is
used at **five** sites across all three workflows — including the
`acceptance-gate` job, whose `fetch-depth: 0` is what lets `pre-merge-check.sh`
diff against the PR base at all. A major bump of the action the gate stands on
is not a passenger in a dependency sweep.

Upstream delta, read from the action manifests rather than the release prose:
**every input default is byte-identical between v4 and v7** — `fetch-depth: 1`,
`persist-credentials: true`, `submodules: false`, and the rest. Two real
changes exist. The runtime moved `node20` → `node24` (v5.0.0), which is why the
bump needs a runner ≥ 2.327.1; GitHub-hosted runners are past that. And v7.0.0
added `allow-unsafe-pr-checkout` (default `false`), which blocks checking out a
fork PR **under `pull_request_target` and `workflow_run`**. This repo triggers
on `pull_request`, `push`, tag pushes and `workflow_dispatch` — none of the
affected events — so the new default cannot change what gets checked out here.

`docker/login-action@v4` is the same story in miniature: Node 24 default
runtime, ESM internals, no input removed.

## The verification problem this contract exists to solve

#16 shipped three action majors with **no eval covering them**, and said so:
"they get proved at the next such build." That debt is the reason this contract
is worth writing. `ci.yml` is self-covering — this PR's own CI runs `checkout`
v7 five times, and if v7 broke `fetch-depth: 0` the Acceptance Gate job fails
on this very PR. But `docker-publish.yml` and `desktop-release.yml` never run
in a PR, so nothing here proves them.

`desktop-release.yml` is already dispatchable as a dry run — installers land in
Actions artifacts, no release is cut. `docker-publish.yml` is not: its
`workflow_dispatch` path **pushes** to a public GHCR namespace. So this change
adds a dry-run guard to `docker-publish.yml`, mirroring the convention its
sibling workflow already documents. That is a behaviour change beyond a version
bump and is declared here rather than smuggled in: without it, the only way to
exercise these actions is to publish an artifact nobody asked for, and the
workflow stays permanently unverifiable — which is exactly the hole #16 left.

Source input: prompt (gộp #1 và #2 vào một contract CI actions bump)

## Criteria

- AC-1: Given `checkout` is pinned at five separate sites across three workflow files, When the workflows are scanned, Then **no `actions/checkout@v` below 7 and no `docker/login-action@v` below 4 remain anywhere** — a partial bump is the real failure mode here, because the sites left behind keep working and so never report themselves.
- AC-2: Given this PR's own CI runs `checkout@v7` five times, When the `Acceptance Gate` job runs, Then it passes — proving `fetch-depth: 0` still produces a history deep enough for `pre-merge-check.sh` to diff against the base, on the very action version being adopted.
- AC-3: Given `Lint`, `Type Check`, `Build` and `SDK Tests` each check out under v7, When CI runs, Then all four pass, showing the node24 runtime change breaks no existing job.
- AC-4: Given `docker-publish.yml` cannot be exercised without publishing, When its `workflow_dispatch` path is inspected, Then it builds **without pushing** — `push:` is false for a manual run and true only for a tag — so the workflow becomes provable on demand instead of only at release time.
- AC-5: Given the dry-run guard, When `docker-publish.yml` is dispatched on this branch, Then the run succeeds through `docker/login-action@v4` and `docker/build-push-action@v7` and produces an image for `linux/amd64,linux/arm64` — covering PR #2 and retiring the qemu-v4 / build-push-v7 debt #16 recorded.
- AC-6: Given the dry run must not publish, When that dispatched run finishes, Then **no new tag appears in the GHCR package** for this repository — the suppression half of AC-4.
- AC-7: Given `desktop-release.yml` uses `checkout@v7` and `cache@v6` on macOS and Windows runners, When it is dispatched (dry run), Then both matrix legs pass their existing installer sanity check and upload artifacts, with no GitHub Release created — covering the cache-v6 debt from #16 on the two runner OSes `ci.yml` never touches.
- AC-8: Given a version bump must not carry behaviour with it, When the workflow diff against `main` is inspected, Then **every changed line outside the declared `docker-publish.yml` dry-run guard is a `uses:` pin** — no job, trigger, permission or input is altered under cover of the bump.

## Coverage

- Trục **action được nâng**: `actions/checkout` (AC-1, AC-2, AC-3, AC-5, AC-7) | `docker/login-action` (AC-1, AC-5).
- Trục **workflow**: `ci.yml` (AC-2, AC-3 — tự phủ) | `docker-publish.yml` (AC-4, AC-5, AC-6) | `desktop-release.yml` (AC-7).
- Trục **runner OS**: ubuntu (AC-2, AC-3, AC-5) | macOS 14 + Windows (AC-7). [thước CE: node24 là thay đổi runtime, nên phải chạy trên cả ba OS chứ không chỉ ubuntu]
- Trục **giữ phạm vi**: không đổi hành vi ngoài guard đã khai (AC-8) | không xuất bản gì (AC-6) — hai nửa "không được kích hoạt".
- Trục **nợ từ #16**: qemu v4 + build-push v7 (AC-5) | cache v6 (AC-7). Contract này trả hết phần nợ đó.

## Out of scope

- **Các action chưa được dependabot đụng tới** — `pnpm/action-setup@v4`, `actions/setup-node@v4`, `actions/setup-python@v5`, `actions/upload-artifact@v4`, `docker/setup-buildx-action@v3`, `docker/metadata-action@v5`, `dtolnay/rust-toolchain@stable`. Không nâng kèm.
- **Hành vi `allow-unsafe-pr-checkout`.** Repo không dùng `pull_request_target` hay `workflow_run`, nên không có cách nào kiểm chứng mặc định mới ở đây. Đọc từ manifest, không chạy được.
- **Đường tag thật của cả hai workflow.** Dry run chứng minh build và login; nó không chứng minh `gh release` upload, việc lật draft sang public, hay push GHCR thật. Những thứ đó vẫn chỉ được chứng minh ở lần cắt release kế tiếp.
- **Thương hiệu trong `desktop-release.yml`** (`app.tongflow.com`, `TongFlow-mac-universal.dmg`) — thuộc nửa sau hạng mục 0.1, đang chờ quyết định về URL cloud.

## Notes

- Mọi input default của `checkout` **giống hệt nhau giữa v4 và v7** — đọc trực tiếp từ `action.yml` của hai tag, không tin diễn giải trong release notes. Delta thật chỉ có hai: `node20`→`node24` và input mới `allow-unsafe-pr-checkout`.
- Dry run của `docker-publish` vẫn giữ bước login: đó chính là eval cho PR #2. Đăng nhập registry không phải là xuất bản.
- Build cross-arch dưới emulation vốn chậm ở lần đầu; `cache-to: type=gha,mode=max` giữ nguyên, nên lần dry run này còn làm nóng cache cho lần release thật.
- Không có bề mặt web UI → bỏ qua eval design theo SKILL 2b.
