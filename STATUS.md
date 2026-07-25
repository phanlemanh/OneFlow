# STATUS — OneFlow

> Trạng thái sống của repo — cập nhật cuối mỗi gói việc. Handoff giữa máy/agent đọc file này + `_acceptance/`, không đọc lịch sử chat.

## Hiện trạng (2026-07-25)

- **Nền tảng:** fork TongFlow (AGPL-3.0, không CLA, không dual-license — xem README §License). Đã rebrand OneFlow: logo pixel mới (`public/logo.svg`, `logo_icon.svg`), xoá COMMERCIAL-LICENSE.md/CLA.md, dọn tham chiếu.
- **i18n:** đã thêm tiếng Việt (`src/i18n/messages/vi.json`, 978 khoá) — cookie `NEXT_LOCALE=vi`, negotiate `vi-*`, test đủ. UI nói tiếng Việt; TTS tầng model CHƯA có tiếng Việt (Qwen3-TTS không hỗ trợ — sẽ giải bằng plugin ElevenLabs, xem kế hoạch P1).
- **Acceptance-Gate Kit:** đã cài per-repo — `_acceptance/config.yaml` (strict/strict), CI job `acceptance-gate`, vendored `scripts/pre-merge-check.sh` + `scripts/recheck-evidence.js` + `lib/evidence-core.js`, guard `.githooks/pre-push` (bật bằng `pnpm hooks:install`).
- **Chiến lược sản phẩm:** đã chốt — xem memory dự án + artifact định vị (07/2026). Ngách beachhead (seller e-commerce vs môi giới BĐS) quyết ở Gate G0 bằng phép thử kép; kiến trúc không đổi theo ngách.

## Kế hoạch — 24 tuần product-only (tóm tắt; gate = gate sản phẩm, không gate thị trường)

| Phase | Tuần | Nội dung chính | Gate |
|---|---|---|---|
| P0 Nền độc lập & số liệu | T1–4 | Fork SDK tên PyPI mới + mirror 38 plugin repos + tách desktop; 3 cột metering vào `tasks`; bộ đo WER/TTS/COGS; spec cache | G0: số liệu đạt ngưỡng, spec cache duyệt |
| P1 Năng lực P0 | T5–10 | Cache+partial re-render trong engine; slot `compose-overlay` + plugin CPU; `normalize-text-vi`; plugin ElevenLabs; skill system v1 + skill Footage→clips; KG v0 (3 entity) + provenance wire shape | G1: 50 clip không lỗi dấu/giá; conformance canvas↔engine pass |
| P2 Cloud & vòng dữ liệu | T11–16 | Shared deployment; Postgres + org/membership; retry/resume; metering→quota; telemetry; metrics CSV→provenance | G2: sống sót restart; ≥25% render partial (dogfood); COGS khớp ±20% |
| P3 Ma trận & R&D chặng 2 | T17–24 | Skill Nguồn→ma trận; slot `media-judge` (ranker, FPR đo trên 200 mẫu); thống nhất batch semantics; benchmark OF-CB-1 | G3: ma trận 20 biến thể <60'; OF-CB-1 có verdict go/no-go |

**Không được cắt:** cache engine + overlay. **Hoãn có chủ đích:** compliance luật VN (chờ nghị định — chỉ giữ thế sẵn sàng qua provenance/overlay param), GTM/growth/vận hành (ngoài phạm vi kế hoạch này).

## Hàng đợi hiện hành

| # | Việc | Trạng thái |
|---|---|---|
| 0.1 | Fork SDK + mirror plugins + tách desktop | chưa bắt đầu |
| 0.2 | 3 cột metering (`cost_usd`,`duration_ms`,`gpu_type`) vào `tasks` | chưa bắt đầu — sẵn sàng làm |
| 0.3 | Bộ đo WER/TTS-vi/COGS (script tái chạy) | chưa bắt đầu |
| 0.4 | Spec cache content-addressed + partial re-render | chưa bắt đầu — sẵn sàng làm |

## Nợ & cảnh báo đang mở

- Hai runtime (canvas TS ↔ engine Python) đã có drift thật: `batchField` (exporter.ts:648) không tồn tại phía engine — làm test case conformance đầu tiên khi đụng engine.
- Desktop shell đang trỏ `app.tongflow.com` (hạ tầng upstream) — không phát hành desktop tới khi tách (mục 0.1).
- Thứ tự merge 3 PR mở đầu: rebrand/license → i18n tiếng Việt → setup này. PR setup phải merge SAU CÙNG: nó bật job `acceptance-gate`, mà PR i18n chạm `src/i18n/client.ts` + `workspace-nav.tsx` (không thuộc T1) nên sẽ bị gate đòi artifact `_acceptance/<slug>/` nếu gate có hiệu lực trước.
