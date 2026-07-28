---
schema_version: 1
feature: Conformance L0 — pluginRev, node_cached contract, TS↔Python conformance suite
slug: conformance-l0
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [engine, plugins, workflow]
status: implemented
approved_by: Manh
approved_at: 2026-07-28
time_human_minutes: {gate1: 0, gate2: 0}
---

# Acceptance Contract: conformance-l0

## Context

The product's whole economic claim is *"sửa miễn phí — sinh mới mới tính tiền"*.
That claim is a cache, and the [cache spec](../../docs/spec/prd/engine-cache-partial-rerender.md)
§5 makes one thing a precondition rather than a nicety: **the cache must not be
enabled while two definitions of the same operation disagree.** Reusing an
artifact produced under semantics A to serve a call carrying semantics B returns
a wrong answer silently — the worst failure mode in this family.

The disagreement is real and measured. The canvas fans a node out into N plugin
calls when its ABI spec declares a `batchField`
([`resolve.ts:326-335`](../../src/lib/abi/resolve.ts)); the exporter faithfully
emits that field onto every ExecutableNode
([`exporter.ts:648`](../../src/lib/workflow/exporter.ts)); and the engine reads it
nowhere — `grep batch sdk/tongflow/engine/*.py` returns nothing. About 30 slots
use `batchOn()`, so for those slots the canvas issues N calls and the engine
issues one call holding the whole array.

One correction to the spec's framing, established by reading the code: workflows
do **not** have two runtimes. TypeScript delegates every workflow to the Python
engine ([`runner.ts:118`](../../src/lib/task/runner.ts)). What differ are two
*definitions of one operation*. That makes the suite far cheaper than the spec
assumed — no second workflow runner is needed on the TS side, only a normalized
view of the fan-out each side performs.

L0 therefore ships four things, none of which needs a cache store to exist:
record `pluginRev`, fix the `node_cached` event contract and its plumbing, make
the engine's fan-out match the canvas, and stand up the conformance suite that
keeps them matched. Design: [2026-07-28-conformance-l0-design.md](../../docs/superpowers/specs/2026-07-28-conformance-l0-design.md).

**Normalized call-log** (referenced by AC-6, AC-7, AC-3) means `[{slot, input}]`
where `input` carries **every business field the ABI declares for that slot** —
not only the batch field — and where exactly three per-run groups are dropped
(`_tongflow`, `taskId`, routing keys `outputs`/`level`/`dependencies`); keys are
sorted lexicographically; an asset renders as `{"__asset": "<sha256 of bytes>"}`,
never base64 and never a `file_key`, which the two sides materialize differently
by design; and a field with no value is omitted rather than written as `null`.
Spelling this out is load-bearing: with the comparison scope left implicit, two
adapters written by one author converge on whatever narrow subset makes them
agree, and the suite goes green while blind to the drift it exists to catch.

## Criteria

- AC-1: Given an ExecutableNode whose `batchField` is `f` and whose resolved input has `f = [a, b, c]`, When the workflow runs through the Python engine, Then the plugin is invoked exactly **3** times and invocation *i* receives `input[f] = items[i]` as a **scalar** — never a one-element array — with every other input field identical across the three calls.
- AC-2: Given an ExecutableNode whose `batchField` resolves to an empty array, When the workflow runs through the engine, Then the plugin is invoked **zero** times — matching `buildPrompts`, which returns `[]` — and the node completes without error, rather than invoking once with an empty array; a non-array batch value likewise yields zero calls.
- AC-3: Given a baseline call-log captured **before** `runner.py` is touched — the recording invoker run over the non-batch fixtures, committed to the repo — When the same fixtures run after the fan-out change lands, Then the resulting call-log equals that baseline **field for field** (an empty diff, not merely the same call count), and the pre-existing engine suite (`sdk/tests/test_engine.py` and siblings) passes with no edits to those files. *"Identical to today's behaviour" becomes unverifiable the moment today's behaviour is gone: a copy/normalize step introduced alongside fan-out can drop `None` keys or change a field's type while still issuing exactly one call.*
- AC-4: Given a node that fanned out into N calls, each returning values for the same output `sourceField`, When the engine projects that node's output, Then `output_views[nodeId][sourceField].values` is the concatenation of all N results' values **in batch order** (call 0's values first), with the route's `nodeType`, `dataField` and `expandEach` preserved — so a downstream consumer of a 5-item batch sees 5 values, not 1.
- AC-5: Given a three-node workflow whose middle node fans out into 3 calls, When the workflow runs to completion, Then the third node's resolved input contains **all 3** upstream values, proving the merge reaches consumers through `data_node_state` rather than living only in `output_views`.
- AC-6: Given the fixtures under `sdk/tests/conformance/fixtures/`, When the TypeScript side (vitest, via `buildPrompts`) and the Python side (pytest, via `run_workflow` with a recording invoker) each produce a normalized call-log as defined in Context, Then both sides' logs equal the expected log committed in the fixture, for all four cases: `batch-basic`, `batch-empty`, `no-batch`, `batch-collect`.
- AC-7: Given the conformance suite is green, When a mutation guard perturbs one side in-process with no working-tree edits, Then the suite reports failure for **both** perturbation kinds — (a) changing the number of calls one side makes, and (b) adding or removing a single business field **other than** the batch field on one side — and reverting each perturbation returns the suite to green. *Kind (b) is what proves the call-log's comparison scope is real; a guard exercising only (a) leaves the suite free to be comparing a narrow subset nobody notices until a plugin default drifts.*
- AC-8: Given a plugin installed through the TypeScript installer's own code path (isomorphic-git) into a temporary plugins directory, When the **Python scanner** — the only producer of the registry manifest — runs over that directory, Then the registry entry carries `pluginRev` equal to the full 40-character `git rev-parse HEAD` of that checkout, and the same holds for a plugin the engine cloned itself. *The manifest has exactly one producer, so "TypeScript resolves the same sha" proves nothing about what lands in the manifest — and the app-install path is the common one.*
- AC-9: Given the scanner encounters a plugin directory that is **not** a git checkout (hand-copied, as dev environments do), When the scan runs, Then the entry omits `pluginRev` and the scan succeeds; **but** given a directory that **is** a git checkout whose rev read fails, Then the scan reports a named error rather than silently omitting the field; and a registry JSON produced before this feature existed (no `pluginRev` anywhere) still parses against the zod schema. *Collapsing the two no-rev states is how a real failure disguises itself as a valid configuration.*
- AC-10: Given the engine emits `{type: "node_cached", nodeId, feature, label, fingerprint, tier}`, When that event travels engine → `engine-delegate.server.ts` → the serialized SSE payload → the client-side parser, Then the value the client parser yields still carries `fingerprint` and `tier`; and when an unrecognized event type arrives instead, Then **no** notification is produced, nothing throws, and the stream stays alive. *Verifying only the delegate leaves two places that can swallow the event — the SSE event union and the parser's default branch — and both would surface at L2, precisely when this decision was supposed to have already paid off.*
- AC-11: Given a three-node workflow whose middle node has a `batchField` resolving to an **empty** array, When the workflow runs to completion, Then `output_views[middleNodeId][sourceField]` exists with `values == []` and route metadata taken from the route itself, the third node resolves its params to an empty list, and the run finishes successfully. *AC-2 checks the middle node makes zero calls and does not fail — but the middle node is not where an empty batch detonates: building the view from `results[0]` raises `IndexError`, and skipping the node leaves `output_views` without the key so the third node fails on lookup.*

## Coverage

Scanned with `morphological-scan` (Zwicky 4×4) before these criteria were written;
one further cell was surfaced afterwards by the clean-context gap-probe.

- Trục A — thành phần giao nộp: engine fan-out · gộp kết quả · conformance harness · `pluginRev` · `node_cached` — [CE: spec cache §6 lát L0](../../docs/spec/prd/engine-cache-partial-rerender.md), bốn hạng mục liệt kê ở đó cộng hạng mục thứ năm mà quét lộ ra
- Trục B — mặt kiểm: hành vi đúng · biên/rỗng · chống hồi quy im lặng · chứng minh thước đo không mù — [CE: spec cache §8](../../docs/spec/prd/engine-cache-partial-rerender.md) phác tiêu chí nghiệm thu, cộng bài học mutation-test của `per-plugin-origin`
- Ô quét lộ ra, suýt sót: A(gộp kết quả) × B(hành vi đúng) → AC-4, AC-5 — canvas không gặp bài toán này vì mỗi prompt là một task riêng, nên nhìn từ phía canvas sẽ không bao giờ thấy
- Ô gap-probe lộ ra, scan ban đầu bỏ trống: A(gộp kết quả) × B(biên/rỗng) → AC-11 — batch rỗng nổ ở node hạ nguồn chứ không ở node có batch
- Ô có nghĩa nhưng cắt khỏi L0: A(`pluginRev`) × B(chống hồi quy) — đưa rev vào khoá cache thuộc L1 vì cần `digest_form()`; lý do đầy đủ ở Out of scope

## Out of scope

- **`digest_form()`, `node_fingerprint()`, cache store, blob dedupe** — lát L1 và L2 của spec cache. L0 cố ý không đọc/ghi cache ở đâu cả.
- **Đưa `pluginRev` vào khoá cache** — L1. L0 chỉ ghi nhận giá trị; dùng nó là việc của lát sau, và trộn vào đây sẽ kéo cả test vector fingerprint sang.
- **Phát `node_cached` thật từ một lần trúng cache** — không thể ở L0 (chưa có cache để trúng). L0 chốt hợp đồng + đường ống; L2 cắm nguồn phát vào.
- **Đưa batch về orchestrator để xoá drift tận gốc** — Phase 3 của [roadmap](../../docs/roadmap.md). L0 làm hai phía *khớp nhau*; hợp nhất về một chỗ là việc sau.
- **Q1–Q3 của spec cache** (§7: content-addressed `file_key`, chia sẻ cache desktop↔cloud, cửa sổ sống tầng B) — không câu nào chặn L0.
- **Song song hoá `executionLevels`** — engine vẫn duyệt tuần tự như hiện nay.
- **Chạy plugin thật trong suite** — CI sẽ phải clone plugin và dựng venv mỗi lần; ngữ nghĩa fan-out là thứ cần kiểm, plugin tính ra gì thì không.

## Known limits

- Suite kiểm **ngữ nghĩa fan-out**, không kiểm mọi khác biệt TS↔Python. Các trục lệch khác (ép kiểu, thứ tự trường, xử lý null ở tầng sâu hơn call-log) chưa có ca — thêm khi gặp.
- Fixture viết tay. Đó là chủ ý (golden sinh tự động thì regenerate là cách rẻ nhất để giấu drift), nhưng đổi lại thêm ca mới tốn công hơn.
