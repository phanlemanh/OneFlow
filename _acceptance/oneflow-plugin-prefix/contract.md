---
schema_version: 1
feature: Plugin directory prefix — accept oneflow-*, keep tongflow-* installable
slug: oneflow-plugin-prefix
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [plugins, sdk]
status: implemented
approved_by: Manh
approved_at: 2026-07-26
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: oneflow-plugin-prefix

## Context

Item 0.1's second half, prefix decision only: **`oneflow` becomes the naming
convention for plugin directories.**

The obvious reading — "reject anything not `oneflow-*`" — cannot ship today, and
the reason is worth stating rather than discovering later.
[`config/official-plugins.json`](../../config/official-plugins.json) points at
`https://github.com/tong-io` and lists **38 upstream repos we do not own**, all
named `tongflow-*`. The install path derives the directory id from the git repo
basename ([`plugins-install.server.ts`](../../src/lib/plugins/plugins-install.server.ts)),
so cloning `tong-io/tongflow-api-gemini` can only ever produce the directory
`tongflow-api-gemini`. A regex that admits `oneflow-*` alone would reject every
official plugin the product ships with.

Mirroring those 38 repos under our own org is the move that makes the tightening
possible — and the org name is still undecided, so it is not available now.

So the prefix becomes `oneflow`, and `tongflow` becomes **legacy-but-accepted**:
new plugins are named `oneflow-*`, the official upstream set keeps installing,
and the fork keeps the one property that makes a fork worth using — it can still
consume everything upstream publishes. Tightening to `oneflow`-only is queued
behind the org decision and named in Out of scope.

The prefix is enforced in **two** places, and the first draft of this contract
claimed there was one. See the amendment below.

Source input: prompt (Đổi tiền tố thư mục sang oneflow)

## Criteria

- AC-1: Given a custom git URL whose repo is named `oneflow-modal-foo` or `oneflow-api-foo`, When it is installed, Then the id validator accepts it.
- AC-7: Given two plugin directories identical byte for byte except for their `oneflow-` / `tongflow-` prefix, When the real scanner reads them, Then **both register and their registry records are identical apart from the directory path** — this is what "works end to end" means, and it is what the first draft of this contract failed to check.
- AC-2: Given the 38 official plugins are named `tongflow-*` in `official-plugins.json` and live in an org we do not control, When any of them is installed, Then the validator still accepts it — the fork does not lose the ability to install upstream plugins.
- AC-3: Given a directory name outside both conventions (`foo-modal-bar`, `oneflow-gpu-x`, `oneflowmodal-x`, uppercase), When it is validated, Then it is rejected — widening the prefix must not widen anything else, and the runner segment stays `modal|api` with no hardware token.
- AC-4: Given the error message names the accepted conventions, When a rejection is raised, Then it names **`oneflow-`** first and marks `tongflow-` as legacy — a developer reading the error learns which one to use for new work.
- AC-5: Given `docs/plugins.md` documents the convention the scanner enforces, When it is read, Then it states `oneflow-api-…` / `oneflow-modal-…` as the convention and records that `tongflow-*` stays installable for the upstream official set, with the reason.
- AC-6: Given a version bump must not carry behaviour, When the diff is inspected, Then **no file under `config/`, `src/lib/plugins/plugins-registry*`, or `src/db/**` changes** — the official manifest still points where it pointed, and this change touches validation and docs only.

## Amendment — the contract was wrong (post-Gate 1, 2026-07-26)

The Context above originally asserted: *"The regex is the whole surface: it is
the only place the prefix is enforced. The scanner does not filter by name."*
**Both sentences were false**, and a fresh-context verifier rejected the feature
on it rather than passing eight green evals.

The scanner is not TypeScript. [`plugins-scanner.server.ts`](../../src/lib/plugins/plugins-scanner.server.ts)
shells out to `python3 -m tongflow`, so the real scanner is
[`sdk/tongflow/scan.py`](../../sdk/tongflow/scan.py), whose `_detect_runner`
gates on `startswith("tongflow-")` in **five** places — before it reads the
directory's contents at all. Two byte-identical plugins, run through it:

```
registered plugins : []
error : oneflow-modal-foo  -> unknown pluginId prefix
error : tongflow-modal-foo -> no @node_slot methods found   (cleared the gate)
```

So widening only the installer's regex would let an `oneflow-*` plugin **install
and then never register** — a node reporting "no implementation" with no way to
fix it. That is worse than refusing the install, which is why the TypeScript half
was never merged on its own.

Consequences, all accepted deliberately:

- **Risk tier T2 → T3.** `sdk/**` is a `t3_paths` entry. The tier follows the
  code, not the size of the change.
- **AC-1 was too weak** — it asked whether the validator accepts a name, which
  was true while the feature was broken. AC-7 asks the question that has teeth.
- **No PyPI republish is required for this to work.** Verified rather than
  assumed: the scanner runs the in-repo SDK — `PYTHONPATH` is set to
  `resourcesDir()/sdk`, and importing `tongflow` under that path resolves to
  `sdk/tongflow/__init__.py`. Republishing matters for plugin authors' own
  environments and is queued, not blocking.

## Coverage

- Trục **tiền tố**: `oneflow-` (AC-1) | `tongflow-` legacy (AC-2) | không thuộc cả hai (AC-3).
- Trục **phần còn lại của quy ước**: runner `modal|api` (AC-3) | chữ thường (AC-3) | không mã hoá phần cứng (AC-3). [thước CE: mở rộng tiền tố là thay đổi duy nhất; mọi ràng buộc khác phải đứng yên]
- Trục **người đọc**: lập trình viên gặp lỗi (AC-4) | lập trình viên đọc tài liệu (AC-5).
- Trục **giữ phạm vi**: manifest chính thức không đổi (AC-6) — nửa "không được kích hoạt".
- Trục **tầng ép buộc**: trình cài đặt TypeScript (AC-1…AC-4) | scanner Python (AC-7). [thước CE: hai tầng độc lập; vá một tầng là dựng bẫy, và bản nháp đầu của contract này đã suýt làm đúng thế]

## Out of scope

- **Republish SDK lên PyPI.** Scanner nạp SDK trong repo nên app chạy đúng ngay; bản trên PyPI chỉ ảnh hưởng môi trường của người viết plugin. Xếp hàng riêng.
- **Siết về chỉ `oneflow-*`.** Phụ thuộc vào việc mirror 38 repo sang org của ta, mà tên org chưa được chốt. Đây là bước kế tiếp, không phải bước này.
- **Đổi `org` trong `official-plugins.json`** và mirror repo — cùng lý do.
- **Đổi tên plugin đã cài sẵn trên đĩa.** Thư mục `plugins/` bị gitignore và sinh ra lúc chạy; không có migration nào ở đây.
- **URL cloud của desktop shell** (`app.tongflow.com`) và tên artifact `TongFlow-*.dmg` — phần còn lại của 0.1, vẫn chờ quyết định.
- **Các tham chiếu `tongflow-*` mang tính lịch sử** trong `CHANGELOG.md` — đó là bản ghi những gì đã xảy ra, không phải cấu hình. Viết lại là làm sai lịch sử.

## Known limits of the guards (recorded at Gate 2, not criteria)

Three verification rounds. Round 1 **rejected** the feature on its own contract's
false premise; rounds 2 and 3 each found real defects in the guards rather than
in the change. One residual remains, recorded rather than fixed:

- **`check-prefix-docs.sh`'s "give the reason" assertion is line-anchored, not
  bullet-anchored.** Deleting the reason from the legacy bullet and reintroducing
  the same sentence as a two-space-indented continuation elsewhere in the file
  still reports the docs correct. Round 2's version matched the phrase *anywhere*,
  which an ordinary doc quoting `scan.py` would have recreated by accident; that
  path is closed, and what is left needs someone to do it on purpose. AC-5 was
  verified by reading §3 directly, independent of the guard.

Fixing it means editing an eval script after verification, which restarts the
round. Queued, with the same disposition `ci-actions-bump` used for its two.

## Notes

- Tiền tố được ép ở **hai** tầng — `PLUGIN_ID_RE` của trình cài đặt và `_detect_runner` của scanner. (Dòng ghi chú cũ ở đây từng khẳng định chỉ có một tầng; nó là chính câu bị bác bỏ trong mục Amendment, và vẫn nằm lại đây như một sự thật hiện hành cho tới khi verifier vòng 2 chỉ ra. Một điều đã rút lại thì phải rút ở mọi chỗ nó được viết.)
- Tiền tố đã thôi chọn backend từ trước (`docs/plugins.md` §5); nó là **nhãn**, nên `pluginDisplayName` cũng phải cắt cả hai dạng — nếu không, hai plugin song sinh hiện hai nhãn khác nhau và tiền tố lại thành một khác biệt nhìn thấy được.
- README (ba ngôn ngữ) liệt kê 38 plugin chính thức theo tên upstream — chúng vẫn đúng, vì repo upstream vẫn tên đó. Không đụng.
- Không có bề mặt web UI mới → bỏ qua eval design theo SKILL 2b.
