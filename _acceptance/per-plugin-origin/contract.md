---
schema_version: 1
feature: Per-plugin origin in the official manifest
slug: per-plugin-origin
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [plugins]
status: verified
approved_by: Manh
approved_at: 2026-07-27
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: per-plugin-origin

## Context

Manh's rule for this fork is that plugins get forked **sequentially and by need**
— *"dựa trên nguyên tắc tuần tự và phổ biến thay vì fork tất cả plugin"*. Today
that is not merely unscheduled, it is **structurally impossible**:

```ts
officialGitUrl(org, id) → `${org}/${id}.git`
```

One `org` string builds every remote in
[`config/official-plugins.json`](../../config/official-plugins.json). Fork one
plugin and you must move all 38 or none. There is no state in between, which is
exactly the state the rule asks for.

So an entry gains an optional origin of its own. A forked plugin points at our
namespace; the other 37 keep pointing upstream; nothing moves until there is a
reason to move it.

Two things this also fixes, both of which are the same disease this codebase
keeps producing — **one rule written in two places**:

- The URL rule exists twice: once in `official-plugins.server.ts` and again in
  [`scripts/install-official-plugins.mjs`](../../scripts/install-official-plugins.mjs),
  which re-implements `` `${ORG}/${id}.git` ``. Adding per-plugin origin to one
  and not the other would make the CLI installer and the in-app manager fetch
  from **different places**. The script becomes TypeScript and imports the same
  resolver, matching how `gen:abi` and `verify:plugins` already run under `tsx`.
- Nothing today validates the manifest. A typo'd key would silently fall back to
  the default origin and clone the wrong repository.

The top-level `org` stays exactly as it is and keeps meaning "default origin for
entries that do not override it". This change adds a capability; it moves no
plugin. The org-name decision is untouched and stays open.

Source input: prompt (bắt đầu (a) luôn)

## Criteria

- AC-1: Given all 38 entries are plain strings today, When the manifest is loaded, Then every id resolves to the top-level `org` and the id list and its **order** are unchanged — order decides which plugin a slot preselects, so a reshuffle is a silent behaviour change.
- AC-2: Given an entry written as `{"id": "x", "origin": "https://github.com/phanlemanh"}`, When the manifest is loaded, Then `x` resolves to exactly `https://github.com/phanlemanh/x.git` and **every other id still resolves to the default** — `origin` is a base URL carrying the same meaning as `org`, not a finished clone URL, so the id and `.git` are still appended. An object entry that omits `origin` (`{"id": "x"}`) is **valid** and falls back to the default `org`.
- AC-3: Given the URL rule has three consumers — the in-app manager, the CLI installer, and the update checker, which today calls `checkPluginUpdate(manifest.org, id)` for every installed plugin — When each builds a remote for the same id, Then all three produce the **same URL from the same resolver** — no second copy of the rule survives this change, and a plugin that overrides its origin must not be update-checked against the default one.
- AC-4: Given a malformed entry (unknown key, missing `id`, non-string `origin`, empty string, duplicate id), When the manifest is loaded, Then loading **fails with a message naming the offending entry** — a typo must not silently clone from the default origin.
- AC-5: Given an origin that is not an `http(s)` URL (`git@github.com:x`, `../etc`, `javascript:`), When the manifest is loaded, Then it is rejected — an origin is a clone target, and the installer already refuses non-http(s) remotes for custom URLs.
- AC-6 *(amended 2026-08-03 — first fork landed; see Amendment)*: Given this change is a
  capability and not a migration, When the shipped manifest is inspected, Then **no plugin
  that existed at sign-off has been repointed**: all 38 original entries are still plain
  strings under the same default org. The guard `check-manifest-unmoved.sh` enforces exactly
  that, now in its second edition — it additionally requires the one origin entry the
  capability was built for (`oneflow-modal-compose-overlay` → `https://github.com/phanlemanh`,
  landed by the compose-overlay feature). The two guards from `oneflow-plugin-prefix` stay green.

## Coverage

- Trục **hình dạng entry**: chuỗi (AC-1) | đối tượng có `origin` (AC-2) | hỏng (AC-4, AC-5).
- Trục **hình dạng entry** (bổ sung sau gap-probe): object thiếu `origin` — hợp lệ, rơi về mặc định (AC-2).
- Trục **người tiêu thụ**: quản lý trong app (AC-3) | trình cài đặt CLI (AC-3) | kiểm tra cập nhật (AC-3, nêu đích danh sau gap-probe). [thước CE: ba đường đều dựng URL; một đường lệch là tải plugin từ nơi khác mà không ai biết]
- Trục **thứ tự & danh tính**: thứ tự id giữ nguyên (AC-1) | id trùng bị bắt (AC-4).
- Trục **giữ phạm vi**: manifest xuất xưởng không đổi (AC-6) — nửa "không được kích hoạt".

## Out of scope

- **Thực sự fork một plugin nào đó.** Đây là cơ chế; lần fork đầu là một thay đổi riêng, khi có lý do thật.
- **Đổi `org` mặc định** sang namespace của ta. Hai guard của `oneflow-plugin-prefix` khẳng định nó vẫn là `tong-io`, và chúng phải tiếp tục xanh — đổi org là quyết định chuỗi cung ứng, phải có contract riêng.
- **Lập GitHub org.** Manh đã chốt dùng namespace cá nhân `phanlemanh` trước mắt; việc lập org để sau, khi có cộng sự hoặc khi chốt được tên sản phẩm.
- **Hiển thị origin trên UI.** Phản hồi API giữ nguyên hình dạng (`org` là mặc định), nên đây không phải thay đổi T3 ở `src/app/api/**`.
- **Ghim revision cho plugin.** Manifest vẫn bám nhánh mặc định của mỗi repo; thêm `ref` là việc khác.

## Known limits

Found by the S4 reviews, recorded rather than fixed because closing them would
change files outside this feature's approved scope.

- **An installed plugin whose entry moves origin is refused, not migrated.**
  Both install paths detect the mismatch (through `sameGitRemote`, so a
  cosmetic URL difference such as a hand-clone without the `.git` suffix is not
  misread) and fail with instructions to uninstall and reinstall. Automatic
  migration was implemented twice and withdrawn twice: fast-forwarding in place
  produced silent wrong states across three review rounds, and
  delete-then-re-clone turned a failed clone into an uninstall. The root cause
  is that this behaviour has no acceptance criterion here — AC-6 guarantees the
  shipped manifest cannot produce the state — so the automatic path belongs to
  the first real fork's contract, with its own AC and an eval that exercises a
  real git fixture.

- **The plugin manager's "open repo" link ignores a per-entry origin.**
  `listOfficialPlugins()` returns only the default `org`, and
  `plugins-dialog.tsx` renders `${org}/${p.id}`. Once an entry carries its own
  `origin`, the app would clone and update-check against the fork while the
  visible link still points upstream. Fixing it means returning a resolved
  origin (or a `repoUrl`) per plugin, which changes the API response shape —
  explicitly listed under Out of scope above, and `src/app/api/**` is a T3 path,
  so it would raise this feature's tier past what Gate 1 approved. It cannot be
  wrong today: AC-6 guarantees the shipped manifest is still 38 plain strings.
  The first real fork must land with this fix, in its own contract.

- **Three LOW items from the round-8 review, recorded as debt.**
  `requireHttpUrl` still admits a query, fragment, or userinfo in a base URL
  (`https://github.com/org#readme` builds a malformed remote later instead of
  failing at load with the entry named); the CLI refusal message says
  `Delete plugins/<id>` where the checkout actually lives under
  `TONGFLOW_PLUGINS_DIR` when that is set; and `remoteIsAhead`'s bare catch
  converts any traversal error into "update available" without logging it.
  All three are one-place fixes in files this feature owns, left unfixed only
  to keep the round-8 evidence pin valid; they belong to the same cleanup
  contract as the `assertSafeGitUrl` item below.

- **`assertSafeGitUrl` is laxer than the manifest boundary.** The manifest now
  refuses whitespace and control characters and returns the parsed URL, while
  the custom-git-URL path — which takes its input straight from the
  `POST /api/plugins/install` body — still only tests `^https?://` after a
  `trim()`. The fully trusted, PR-reviewed config file is therefore validated
  more strictly than the fully untrusted request body, which inverts the usual
  ordering. Routing it through the shared predicate would collapse both to one
  rule; that touches `src/app/api/**`'s caller and belongs with the UI fix.
- **`remoteIsAhead`'s catch is broader than its comment.** The comment says the
  catch handles "the remote commit is not in the local object store", but
  `isDescendent` returns false rather than throwing in that case, so the normal
  path already covers it. What the catch actually swallows is genuine
  repository breakage during traversal, reported as "update available". The
  behaviour is defensible — a broken checkout should not silently read as up to
  date — but the comment describes the wrong reason.
- **The SDK engine keeps a fourth copy of the URL rule.**
  `sdk/tongflow/engine/plugins.py` hardcodes its own `DEFAULT_ORG` and rebuilds
  the remote in `_git_url_for`. It never reads `config/official-plugins.json`,
  so the standalone engine's preflight would clone a forked plugin from
  upstream. AC-3 covers the three consumers inside this app; unifying the Python
  engine means touching `sdk/**`, which is a T3 path and belongs to its own
  contract. `check-single-url-rule.sh` now states its scan scope instead of
  claiming the rule exists in exactly one place repo-wide.
- **`check-manifest-unmoved.sh` is a snapshot, not a standing invariant.** It
  asserts exactly 38 plain string entries, which is precisely what AC-6 demands
  of *this* change. It will therefore go red on the PR that registers a 39th
  plugin, or on the first real fork — both of which are intended future work.
  The coupling is now called out in CLAUDE.md's "Registering an official plugin"
  checklist so that failure arrives with an explanation attached.

## Amendment (2026-08-03 — first fork landed, prescribed by CLAUDE.md)

AC-6's original wording froze the manifest at "38 plain string entries". CLAUDE.md's
"Registering an official plugin" section always described that count as **a snapshot of this
PR, not a standing invariant**, and told the next registrant to *"bump `expected_count` (or
retire the guard once the first fork lands)"*. The first fork landed with `compose-overlay`
(approved by Manh at its Gate 1, 2026-08-03): the manifest now carries 38 plain strings **plus
one origin entry**. AC-6's intent — *this capability repoints no existing plugin* — is
unchanged and still enforced; only the count wording is updated so the criterion describes the
guard that actually runs.

## Notes

- `org` là **URL gốc**, không phải tên tổ chức — GitHub đối xử với namespace cá nhân và tổ chức như nhau khi clone (đã kiểm bằng `git ls-remote` trên chính repo này).
- Bộ chuẩn hoá là hàm thuần, nhận JSON đã parse và trả về hình dạng đã chuẩn hoá, nên test được trực tiếp mà không cần chạm đĩa.
- Không có bề mặt web UI mới → bỏ qua eval design theo SKILL 2b.
