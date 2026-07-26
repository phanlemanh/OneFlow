# STATUS — OneFlow

> Trạng thái sống của repo — cập nhật cuối mỗi gói việc. Handoff giữa máy/agent đọc **file này + `_acceptance/`**, không đọc lịch sử chat.

## Hiện trạng (2026-07-27)

- **Nền tảng:** fork TongFlow (AGPL-3.0, không CLA, không dual-license — README §License). Đã rebrand OneFlow: logo pixel (`public/logo.svg`, `logo_icon.svg`), xoá COMMERCIAL-LICENSE.md/CLA.md.
- **i18n:** tiếng Việt đủ (`src/i18n/messages/vi.json`). Lưu ý `ja.json` thiếu **76 khoá** so với `en.json` — có sẵn từ upstream, chưa sửa. TTS tầng model vẫn chưa có tiếng Việt (Qwen3-TTS không hỗ trợ → kế hoạch dùng plugin ElevenLabs, P1).
- **Acceptance-Gate Kit:** đang chạy strict/strict. `main` sạch — **6 feature đã ký**. CI 5 job, gate là job thứ 5.
- **SDK:** `oneflow-sdk` **0.2.17 đã publish lên PyPI** (2026-07-26). Cài bằng `pip install oneflow-sdk`, import bằng `import tongflow` (phương án C: chỉ đổi tên distribution).
- **Chiến lược sản phẩm:** đã chốt — xem memory dự án. Ngách beachhead quyết ở G0; kiến trúc không đổi theo ngách.

## Feature đã ký (đọc `_acceptance/<slug>/` để biết chi tiết)

| Slug | Tier | Ký | Nội dung |
|---|---|---|---|
| `task-metering` | T3 | 25/07 | 3 cột metering vào `tasks`; `duration_ms` đo thật, `cost_usd`/`gpu_type` NULL có chủ đích |
| `measure-harness` | T2 | 26/07 | Bộ đo WER / MOS mù / COGS |
| `sdk-distribution-rename` | T3 | 27/07 | Distribution `oneflow-sdk`, import package giữ `tongflow` |
| `dependency-refresh-2026-07` | T2 | 26/07 | Gộp 5 PR dependabot; biome 2.5.5 |
| `ci-actions-bump` | T2 | 26/07 | checkout v7, login-action v4, dry-run guard cho docker-publish |
| `oneflow-plugin-prefix` | T3 | 27/07 | `oneflow-` là quy ước thư mục plugin, `tongflow-` legacy |

## Đang dở — bắt máy A tiếp ở đây

**Nhánh `feat/per-plugin-origin` đã push, đang chờ Gate 1.**

Contract đã viết đầy đủ (`_acceptance/per-plugin-origin/`, T2, 6 tiêu chí, 12 eval), khoá executor đã khai trong `_acceptance/config.yaml`. **Chưa viết một dòng code nào** — Gate 1 chưa được duyệt.

Vấn đề nó giải: `officialGitUrl(org, id)` dựng **mọi** remote từ một chuỗi `org` duy nhất, nên fork một plugin là phải chuyển cả 38 hoặc không cái nào. Không có trạng thái ở giữa — mà đó chính là trạng thái nguyên tắc "fork tuần tự" cần.

Hình dạng đề xuất, tương thích ngược:

```json
{
  "org": "https://github.com/tong-io",
  "plugins": [
    "tongflow-api-gemini",
    { "id": "oneflow-api-gemini", "origin": "https://github.com/phanlemanh" }
  ]
}
```

Hai thứ gộp cùng vì cùng một căn bệnh — **một luật viết ở hai chỗ**:
1. Luật dựng URL tồn tại hai bản (`official-plugins.server.ts` và `scripts/install-official-plugins.mjs`). Sửa một bên quên bên kia → CLI và app tải plugin từ **hai nơi khác nhau**, im lặng. Script sẽ chuyển sang TS dùng chung resolver (như `gen:abi`, `verify:plugins` đã chạy dưới `tsx`).
2. Manifest **không được validate** — gõ nhầm key hôm nay sẽ lặng lẽ rơi về origin mặc định và clone nhầm repo.

Để tiếp: duyệt Gate 1 → implement → verify context sạch → ký → merge (merge commit, **không squash**).

## Quyết định đã chốt (đừng mở lại)

- **Fork tuần tự, theo nhu cầu** — không mirror cả 38 plugin. Nguyên văn: *"dựa trên nguyên tắc tuần tự và phổ biến thay vì fork tất cả plugin"*.
- **Namespace dùng tài khoản cá nhân `phanlemanh`** trước mắt; lập GitHub org để sau, khi có cộng sự hoặc chốt được tên sản phẩm.
- **Tiền tố `oneflow-`** cho plugin mới; `tongflow-` vẫn cài được (38 plugin chính thức là repo upstream ở `tong-io`, ta không sở hữu).
- **Hoãn compliance luật VN** — chỉ giữ thế sẵn sàng (provenance + tham số overlay), không đưa vào pipeline. Rà lại theo quý.
- **Phạm vi kế hoạch: chỉ phát triển sản phẩm.** GTM/growth/vận hành ngoài phạm vi.
- **Luật carry-forward** (AGENTS.md): chữ ký của một feature đã merge chỉ được mang sang khi code của chính nó **chứng minh được là không đổi** và standing check xanh. Nó vừa trả công lần đầu ở PR #18 — `sdk-distribution-rename` phải verify lại và ký lại vì nhánh đó chạm `sdk/**`.

## Nợ & cảnh báo đang mở

- **`batchField` drift** — exporter TS phát (`exporter.ts:648`), engine Python **không xử lý một dòng nào**; ~30 slot dùng `batchOn()`, nên canvas fan-out N lời gọi còn engine gọi một lần với cả mảng. Là ca kiểm thử **số 1** của conformance suite, và là điều kiện tiên quyết của cache (spec §5).
- **Desktop shell trỏ `app.tongflow.com`**, artifact tên `TongFlow-*.dmg` — không phát hành desktop tới khi tách. Chờ quyết định URL cloud.
- **Token PyPI toàn tài khoản** đang nằm trong `.env` và đã hiện trong transcript phiên 26/07. **Nên thu hồi** và tạo lại loại project-scoped (`oneflow-sdk` đã tồn tại nên tuỳ chọn hẹp giờ có sẵn).
- **Ghim SDK của 38 plugin chính thức** không sửa được — repo upstream, ta không sở hữu. Sẽ tự giải khi từng plugin được fork.
- **Trùng tên "OneFlow"**: GitHub `oneflow` = OneFlow Systems Ltd; `Oneflow-Inc` = framework DL Trung Quốc, và framework đó **giữ tên `oneflow` trên PyPI**. Còn trống: `oneflow-io`, `oneflow-studio`, `oneflowhq`.
- **Hai giới hạn guard đã ghi, chưa sửa** — xem mục "Known limits" trong `_acceptance/ci-actions-bump/contract.md` và `_acceptance/oneflow-plugin-prefix/contract.md`. Đều cần contract riêng vì sửa script eval sau khi verify là bắt đầu lại vòng.
- **2 PR dependabot cũ (#1, #2) đã đóng thủ công** — commit của chúng không nằm trong PR #17 nên GitHub không tự đóng.

## Kế hoạch 24 tuần (product-only)

| Phase | Tuần | Nội dung chính | Gate |
|---|---|---|---|
| P0 Nền độc lập & số liệu | T1–4 | Fork SDK + tách desktop; 3 cột metering; bộ đo WER/TTS/COGS; spec cache | G0: số liệu đạt ngưỡng, spec cache duyệt |
| P1 Năng lực P0 | T5–10 | Cache + partial re-render; slot `compose-overlay`; `normalize-text-vi`; plugin ElevenLabs; skill system v1; KG v0 | G1: 50 clip không lỗi dấu/giá; conformance canvas↔engine pass |
| P2 Cloud & vòng dữ liệu | T11–16 | Shared deployment; Postgres + org/membership; retry/resume; metering→quota; telemetry | G2: sống sót restart; ≥25% render partial; COGS khớp ±20% |
| P3 Ma trận & R&D chặng 2 | T17–24 | Skill Nguồn→ma trận; slot `media-judge`; thống nhất batch semantics; benchmark OF-CB-1 | G3: ma trận 20 biến thể <60'; OF-CB-1 có verdict |

**Không được cắt:** cache engine + overlay.

## Hàng đợi hiện hành

| # | Việc | Trạng thái |
|---|---|---|
| 0.1a | Tiền tố `oneflow-` (2 tầng ép buộc) | ✅ **xong** — PR #18 |
| 0.1b | Publish `oneflow-sdk` lên PyPI | ✅ **xong** — 0.2.17 |
| 0.1c | Origin theo từng plugin trong manifest | 🔵 **đang dở** — `feat/per-plugin-origin`, chờ Gate 1 |
| 0.1d | Tách desktop khỏi `app.tongflow.com` | ⏸ chặn — chờ quyết định URL cloud |
| 0.2 | 3 cột metering | ✅ xong — PR #12 |
| 0.3 | Bộ đo WER/TTS-vi/COGS | ✅ script xong — PR #14. *Chạy* vẫn cần clip thật + API key + tài khoản Modal |
| 0.4 | Spec cache + partial re-render | ✅ xong — PR #11. **3 câu hỏi mở (Q1–Q3, §7) chưa chốt** |
| **1.L0** | `pluginRev` + sự kiện `node_cached` + **conformance suite TS↔Python** (ca đầu: `batchField`) | ⏭ **việc lớn kế tiếp**. Không phụ thuộc Q1–Q3 |

## Nghi thức bắt buộc (AGENTS.md)

- **Merge commit, không bao giờ squash** — squash viết lại commit mang chữ ký Cổng 2 và phá vĩnh viễn `signoff.require_human_commit`.
- **Không `--delete-branch`** khi có PR xếp chồng lên nhánh đó (đã từng làm đóng nhầm #12, #13).
- **Không trích chuỗi chữ ký vào phần văn xuôi** của evidence — nó đổi số lần xuất hiện và làm `git log -S` trỏ nhầm commit.
