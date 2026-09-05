# Lát cắt chứng minh — kế hoạch hợp nhất, luật đóng băng và guard

- **Ngày:** 2026-09-04 · **Chủ:** Phan Le Manh · **Trạng thái:** bản thiết kế đã duyệt từng phần trong phiên, chờ owner đọc lại toàn văn
- **Slug hồ sơ:** `lat-cat-chung-minh` (T2) · **Nhánh:** `feat/lat-cat-chung-minh`
- **Nguồn:** phiên điều tra toàn repo 04/09 (36 hồ sơ đã ký, 7 nhánh chưa về `main`, 4 nguồn kế hoạch trôi khỏi nhau), [vision.md](../../strategy/vision.md), [roadmap.md](../../roadmap.md), [STATUS.md](../../../STATUS.md), ADR-0002, ADR-0010, ADR-0011, ADR-0012, và bản nháp ADR Director trường kỳ trên nhánh `feat/director-wire-shape`

## 1. Vì sao có tài liệu này

Phiên điều tra 04/09 đo được ba việc:

1. **Cỗ máy đã có, sản phẩm chưa có.** Cache 1.1, overlay 1.2, plugin local S2, BYO key S4, transcribe qua API (fork OpenAI 01/09) đều đã ký — nhưng không skill nào, không nút bấm nào đứng trên cỗ máy đó. Người dùng phải tự nối 6–7 node và cần tài khoản Modal cho đúng một mắt xích.
2. **Bốn nguồn kế hoạch kể bốn chuyện.** `docs/roadmap.md` (sẽ đi đâu), `STATUS.md` (đang ở đâu — đề ngày 17/08, ghi 17 hồ sơ trong khi thực tế 36), `_acceptance/*/contract.md` (đã ký gì), và 7 nhánh git chưa merge (đã làm gì mà chưa hạ cánh). Trong 15 hồ sơ ký từ 27/08, 7 là hạ tầng quy trình.
3. **Hạng mục mới mở nhanh hơn hạng mục đóng.** Hơn một chục hồ sơ/nợ được đặt tên trong các Cổng 2 rồi không ai mở (liệt kê đủ ở §3.4); 3 hồ sơ nháp sống trên nhánh; một ADR đã chấp nhận (26/08) chưa về `main`.

Owner quyết (04/09): **tái định hình mục tiêu từ Định vị/Tầm nhìn, gom mọi thứ thành một kế hoạch thực hiện, và đóng băng việc mở hạng mục mới cho tới khi kế hoạch đạt ngưỡng.**

## 2. Định vị → trụ cột → lát cắt

| Tầng | Nội dung | Thay đổi được? |
|---|---|---|
| **Định vị** | OneFlow là **công cụ nền tảng đa mục đích cho sáng tạo**; thế mạnh hướng đến: *studio quảng cáo AI có bộ nhớ*, tối ưu cho mọi nhu cầu sáng tạo, làm thiết kế đơn giản, **tiếp cận được với bất kỳ ai** | Bất biến (đổi = ADR mới) |
| **Trụ cột** | ① footage thật trước generative · ② dữ liệu **và thực thi** thuộc về người dùng · ③ sửa rẻ gần bằng không · ④ chữ và giá vẽ tất định · ⑤ tiếp cận được với bất kỳ ai (một nút, tự cài, tự nhập key) · ⑥ bộ nhớ — uỷ quyền media-library, *ngoài kế hoạch này* | Ít đổi |
| **Lát cắt** | Skill #1 "Footage → kho clip 9:16" là **lát cắt chứng minh đầu tiên** — một *instance* trên nền tảng, không phải sản phẩm. Thay bằng skill khác thì kế hoạch không đổi hình | Thay đổi được |

Định vị ở tầng 1 **chưa có trong vision.md** (bản 07/2026 viết "Chặng 1 — seller / nhà quảng cáo trực tiếp"). Kế hoạch này ghi nó vào vision.md như một đoạn bổ sung (§8.1) để tầm nhìn và kế hoạch không thành hai nguồn sự thật.

### 2.1 Mục tiêu một câu

> Trước **11.11.2026**, **nền tảng** OneFlow chứng minh được năm trụ cột bằng **một lát cắt end-to-end** chạy trên máy của người dùng đại diện — lát cắt đầu tiên là Skill #1 — với mọi con số nằm trong repo.

### 2.2 "Dùng được" định nghĩa bằng tám ô đo

Đây là ngưỡng của Cổng Giá trị (phiên UAT), gắn vào trụ cột chứ không vào tính năng.

| Ô | Tiêu chí | Trụ cột | Nguồn ngưỡng |
|---|---|---|---|
| U1 | Cài từ README trên máy trắng (macOS), tự nhập được key, ≤ 30 phút, không hỏi ai; ≥ 2/3 người dùng đại diện tự nhập được key | ⑤ | ADR-0011 điều kiện đảo chiều |
| U2 | Một nút → chạy trọn; canvas chỉ lộ khi bấm "xem/sửa kế hoạch" | ⑤ | ADR-0002 |
| U3 | WER ≤ 10% trên corpus thực địa · lỗi token chữ số trên câu có giá = 0 | ④ | g0-runbook §0.1 — **chờ owner ký** (A1) |
| U4 | 50 clip liên tiếp không lỗi dấu, không sai số giá trên overlay | ④ | Gate G1 |
| U5 | Đổi giá → chỉ overlay + merge chạy lại, đọc từ hai cột `cache_calls_*` của bảng `tasks` | ③ | Gate G1 |
| U6 | Chạy headless qua engine cho kết quả giống canvas (conformance) | nền tảng: một cỗ máy, nhiều giao diện | Gate G1 |
| U7 | COGS ≤ $11/seller/tháng ở khối lượng wedge | bền chi phí | g0-runbook §0.3 (A1) |
| U8 | Không cần tài khoản Modal | ② | ADR-0011 |

**Cố ý không làm trong kế hoạch này:** bộ nhớ/KG (1.7), TTS (1.4), Skill #2, judge, trí nhớ Director (D1–D4), desktop app (S5), Phase 2–3. Chốt ngách (A2) **không chặn việc xây** — chuỗi Skill #1 trung tính theo ngách — nó chỉ chặn *mẫu khung giá* và *chọn người dùng cho UAT*.

## 3. Khối kế hoạch

Mọi dòng dưới đây sẽ vào khối máy-đọc của `docs/roadmap.md` (§5.1) với sáu cột `#`, `★`, hạng mục (rút gọn cho vừa ô), `slug`, trạng thái, ghi chú; các cột cỡ/tier/vì-sao ở bảng này chỉ để duyệt. **★** = đường tới hạn của lát cắt — phải 100% ✅ để gỡ băng. Thứ tự làn B là thứ tự thực thi (*tuần tự tàn nhẫn*, một hồ sơ mở tại một thời điểm). Tier theo `t3_paths` hiện hành: `config/tongflow.abi.json`, `src/generated/abi/**`, `src/lib/abi/**`, `sdk/**`, `src/db/**`, `src/lib/plugin-executor/**`, `src/lib/workflow/**`, `src/app/api/**`, `scripts/publish-tongflow-pypi.sh`.

### 3.1 Làn B — máy, theo thứ tự thực thi

| # | ★ | Hạng mục | slug | Cỡ | Tier | Vì sao ★ |
|---|---|---|---|---|---|---|
| B1 | ★ | Hồ sơ này: khối kế hoạch + luật đóng băng + guard; viết lại STATUS.md; đoạn định vị vào vision.md; sửa dòng S3 và dòng 211 của roadmap; park 3 cơ hội; **mở cơ hội `skill-1-footage-kho-clip` ở `discovery` với U1–U8 mang `[đề xuất]`**. Vòng nội bộ: ngưỡng khai *Không đo được*, không có UAT riêng. *Hạng mục mới cuối cùng được nhận* | `lat-cat-chung-minh` | S | T2 | không có nó thì không có mẫu số |
| B2 | ★ | Hạ cánh `b01/open-source-rebrand` (4 commit, 13 file: README ×3, NOTICE, SECURITY, CONTRIBUTING, CLAUDE.md, `.github/*`, `desktop-release.yml`, `docker-compose.yml` → `ghcr.io/phanlemanh/oneflow`). Chạm `.github/**` và `docker-compose.yml` nên **không phải T1** — cần hồ sơ. **Code có trước hợp đồng → làn prototype của kit:** cơ hội khai `prototype.base_commit` + `disposition: keep` + bảng nợ kế thừa (Path · Giữ/Dựng lại · Chạm t3_paths?). Merge lại `main` trước vì CLAUDE.md đã đổi 5 lần sau 26/08 | `mo-hoa-b01` | XS–S | T2 | U1 — đường cài đặt từ README phải trỏ đúng bản |
| B3 | ★ | Hạ cánh D0 `director-wire-shape`: hồ sơ đã `status: implemented` → feature-loop **resume thẳng S4 VERIFY** (15 eval + E14b), soi Gate 1.5 (T3) đã qua chưa; Cổng 2; mang ADR Director trường kỳ về `main` (`docs/adr/0013-*`), thêm mục "Làn D" vào roadmap; `director-v2` (D1/D2/D4) → park | `director-wire-shape` | M | T3 (`src/db/**`) | U2 — "xem/sửa kế hoạch" cần plan rời được server |
| B4 | ★ | Engine dùng venv per-plugin như TS (`sdk/tongflow/engine/plugins.py:99` hiện dựng venv chung ngay tại root mà `plugin-python-env.server.ts:37` coi là root chứa nhiều venv con → `removeLegacySharedVenv()` xoá sạch); bỏ hai `return sys.executable` (dòng 227, 235); SDK 0.2.20; bump pin 4 plugin | `hai-duong-chay-mot-venv` | M | T3 (`sdk/**`) + train SDK | U6 chạy headless qua engine trên cùng máy sẽ kích vụ xoá venv |
| B5 | ★ | Skill system v1 (1.5, ADR-0002): `src/lib/skills/` — manifest tham số (gộp D3), template ExecutableWorkflow, orchestrator v1 (instantiate → submit → gom kết quả; chưa judge/ma trận), nút skill + màn kết quả + "xem/sửa kế hoạch" mở canvas. **Bằng chứng nền tảng:** thêm một skill thứ hai giả lập (2 node) chỉ bằng manifest + template, không sửa dòng nào trong engine/compiler/exporter | `skill-system-v1` | L | T3 (`src/app/api/**`) | U2; nền tảng |
| B6 | ★ | Port `oneflow-modal-compose-overlay` → `oneflow-api-compose-overlay` (Pillow + ffmpeg, cùng slot, đổi entry manifest như S2, guard đếm + 3 README + bullet CLAUDE.md); **kèm đường 9:16**: preset `tiktok-portrait` vẽ lên canvas 1080×1920 (pad/crop giữa). Quyết định owner 04/09: port thay vì giữ Modal; canvas trong plugin thay vì slot ABI `reframe-video` | `overlay-chay-local` | M | T2 | U8 — mắt Modal duy nhất còn lại; U3/U4 cần khung 9:16 |
| B7 | ★ | Skill #1 (1.6): template nạp-từ-kho/upload → split-video → transcribe-timestamp → drop-video → [bỏ tiếng, tuỳ chọn] → compose-overlay (phụ đề + khung giá) → gom; tham số: giá, tên, ngôn ngữ, preset; test conformance headless | `skill-1-footage-kho-clip` | L | T3 (`src/lib/workflow/**`) | U2–U6 |
| B8 | ★ | Director sinh instance: prompt → chọn skill + điền tham số (ADR-0002). **Được phép hạ xuống Should tại mốc 09/10** theo §6.3 | `director-sinh-instance` | M | T3 (`src/app/api/**`) | vế "agent là giao diện" |
| B9 | ★ | Đo G0-WER trên corpus qua `oneflow-api-openai`; đo G1: 50 clip liên tiếp (U4), đổi giá → chỉ overlay chạy lại (U5), headless = canvas (U6); **bộ đo COGS đọc giá từ ảnh chụp catalog AI Gateway** commit trong `measure/` (§7); số vào `measure/` | `do-g0-g1-lat-cat` | M | T2 | U3–U7 |
| B10 | ★ | **Cổng Giá trị của cơ hội `skill-1-footage-kho-clip`** — phiên UAT (`uat-session` của kit) với 3–5 người dùng đại diện trên máy trắng; phán quyết release/iterate/kill ghi `verdict` vào cơ hội ấy; đo luôn điều kiện đảo chiều ADR-0011. Không phải hồ sơ riêng; U2/U8 do B5/B6/B8 tạo ra nhưng **đo tại đây** — lát cắt là *một* bằng chứng | — | S + lịch | — | U1, U7 |

### 3.2 Làn A — chỉ owner làm được

| # | ★ | Việc | Hạn |
|---|---|---|---|
| A1 | ★ | **Ký Cổng Đáng của cơ hội `skill-1-footage-kho-clip`**: gỡ tiền tố `[đề xuất]` ở U1–U8 và ba số G0 (WER ≤ 10% · lỗi chữ số trên câu có giá = 0 · COGS ≤ $11, g0-runbook §0), điền `decision: build`, `decided_by`, `decided_at` — 30 phút, **trước mọi phép đo**. Guard kiểm được dòng này qua ghi chú `kiểm: opportunity:skill-1-footage-kho-clip` (không còn tin theo lời) | tuần T5 (≤ 06/09) |
| A2 | ★ | Chốt ngách (seller e-com ↔ BĐS) — chặn mẫu khung giá + chọn người UAT | T8 (≤ 27/09) |
| A3 | ★ | Corpus: ≥ 10 clip × 60–90 s thực địa, mỗi clip có một lần đọc giá, + bản chép tay → `measure/wer-corpus/` (~3–4 giờ công) | T9 (≤ 04/10) |
| A4 | ★ | Một lượt chạy thật + hoá đơn (COGS) | ngay khi B7 chạy được (T11) |
| A5 | ★ | Tuyển 3–5 người dùng đại diện cho UAT | T13 (≤ 01/11) |
| A6 | | Thu hồi token PyPI toàn tài khoản → project-scoped (bảo mật, 10 phút) — **trước B4** | T6 |
| A7 | ★ | Tạo repo public `phanlemanh/oneflow-api-compose-overlay` (máy làm được bằng `gh` nếu owner cho phép lúc đó) — **trước B6** | T8 |

### 3.3 Should — chỉ làm khi một vòng verify đang chờ, hoặc chờ làn A

| Hạng mục | slug | Ghi chú |
|---|---|---|
| Hạ cánh `fix/t1-escape-doi-hoi-artifact-ho-so` (2 commit, code sẵn) | `t1-escape-doi-hoi-artifact-ho-so` | vá lỗ cổng tự tắt khi PR chạm `_acceptance/` — đáng có *trong lúc* merge nhiều hồ sơ; code có trước hợp đồng → làn prototype `disposition: keep` + bảng nợ kế thừa |
| Đăng ký plugin `normalize-text-vi` (đóng lỗ 1.3) | `dang-ky-plugin-normalize-text-vi` | điều kiện: repo plugin phải tồn tại công khai — lý do rút 26/08 |
| Ingest ngược về media-library (giai đoạn B, ADR-0012) | `ingest-nguoc-media-library` | ứng viên "iterate" sau UAT |

### 3.4 Xếp lại sau (`park`) — có tên, không biến mất

| slug / tên | vì sao đông lạnh | nhánh |
|---|---|---|
| `director-v2` | D1/D2/D4 sau lát cắt; D0 hạ cánh ở B3 | `feat/director-wire-shape` chứa hồ sơ |
| `timeline-view` | cơ hội chưa điền, không trên đường ★ | — |
| `staleness-ho-so-thieu-paths` | lỗ cổng đo được 31/08, giả thuyết chưa kiểm; giảm nhẹ: mọi hồ sơ của kế hoạch này khai đủ `paths` | — |
| `roadmap-alias-guard` | nháp 10 AC / 9 eval, gate tooling | `chore/roadmap-alias-guard` |
| `bo-phan-loai-token` | nháp, phục vụ đường TTS (không trong lát cắt) | `draft/bo-phan-loai-token` |
| `ci-recheck-all` | nháp 8 AC / 10 eval, gate tooling | `chore/acceptance-ci-recheck-all` |
| `scan-parse-failure-semantics` | có HANDOFF.md sẵn trong `_acceptance/scan-scope-diagnostics/`, gate tooling | — |
| `overlay-canvas-reach` (1.2b) | form node overlay — có thể vô nghĩa khi skill ẩn canvas | — |
| 1.1-L1b (`mime`/`filename` vào digest) | transcribe không nằm trong allowlist tầng A; G1 U5 sẽ lộ nếu thành vấn đề | — |
| 1.1-L2b (`file_key_base` cho desktop) | desktop là S5 (park) | — |
| 0.7 (English-only vs văn bản vendor) · 0.8 (a)(c) | gate tooling | — |
| 2 hợp đồng con của `add-media-library` (kiểm payload ở biên; 6 lỗ thủng bộ đo) | không trên đường ★ | — |
| `cost_usd`/`gpu_type` (DoD 0.2 còn 1/3) | COGS G0 đo bằng hoá đơn + ảnh chụp giá | — |
| trần 3 lượt đồng thời nửa vời (`/api/task/create` không gọi `checkConcurrentTaskLimit`) | không trên đường ★ | — |
| desktop 0.1d / S5 · ja.json 76 khoá · gói nợ fork (URL thứ tư trong `engine/plugins.py`, di trú origin, 3 LOW) · 1.4 TTS · 1.7 KG · S6 | ngoài lát cắt | — |
| `oneflow-api-vercel-gateway` | **điều kiện mở:** STT của gateway ra khỏi beta **và** Phase 2 mục 4 (metering → gating) bắt đầu, **hoặc** UAT cho thấy U1 trượt vì nhập nhiều key | — |
| hàng rào chặn model đã khai tử (từ `dang-ky-fork-openai`) | có thể đọc trường `deprecated_at` từ catalog công khai của gateway thay vì bảng tay | — |

Ba nhánh nháp giữ nguyên trên ổ: không merge, không xoá.

### 3.5 Phép tính gỡ băng

★ = 10 (B1–B10) + 6 (A1, A2, A3, A4, A5, A7) = **16**. Không ★ = A6 + 3 Should = 4. **Mẫu số 20**. Ngoại lệ mở giữa lúc băng **cộng vào mẫu số**.

**Gỡ băng** khi **16/16 ★ ✅ và ≥ 17/20 ✅ (85%)** — tức toàn bộ ★ cộng ít nhất một dòng không ★. Đóng nợ rẻ không kéo tỉ lệ lên nếu lát cắt chưa qua UAT.

## 4. Luật đóng băng

**Đóng băng phạm vi, không đóng băng định vị.** Từ khi B1 merge tới khi gỡ băng: không `_acceptance/<slug>/` nào được mở ở trạng thái làm việc (contract chưa ký, hoặc cơ hội đang khám phá / quyết build) nếu slug không thuộc khối kế hoạch, danh sách park, hoặc bảng ngoại lệ. Định vị và trụ cột không thuộc phạm vi đóng băng; muốn đổi lát cắt giữa chừng thì đi đường ngoại lệ với lý do `chặn-★`, hoặc tái hoạch ở mốc 09/10.

**Ngoại lệ** chỉ nhận ba lý do có tên: `mất-dữ-liệu` · `bảo-mật` · `chặn-★`. Mỗi ngoại lệ là một dòng trong bảng "Ngoại lệ" với slug, lý do, ngày, ai quyết; nó tính vào mẫu số nên mở ngoại lệ là tự kéo tỉ lệ xuống.

**Băng chỉ đóng ở cửa merge.** Không chặn tạo nhánh, không đọc `docs/superpowers/plans/`, không đụng `scripts/pre-merge-check.sh` (đường vendor). Nháp trên nhánh vẫn tự do.

## 5. Vật mang luật và guard

### 5.1 Khối máy-đọc trong `docs/roadmap.md`

Nằm dưới mục mới `## Kế hoạch lát cắt chứng minh (04/09 → 08/11)`, giữa hai marker:

```
<!-- plan-freeze:start -->
plan: lat-cat-chung-minh · opened: 2026-09-04 · unlock: star=100% AND total>=85% · checkpoint: 2026-10-09
| # | ★ | Hạng mục | slug | Trạng thái | Ghi chú |
|---|---|---|---|---|---|
| B1 | ★ | Hồ sơ kế hoạch + đóng băng + guard | lat-cat-chung-minh | ⬜ | |
| A1 | ★ | Ký ngưỡng G0 | — | ⬜ | làn A |
…
**Xếp lại sau**
| slug | vì sao đông lạnh | nhánh |
|---|---|---|
…
**Ngoại lệ mở giữa lúc băng**
| slug | lý do | ngày | ai quyết |
|---|---|---|---|
<!-- plan-freeze:end -->
```

Luật hình thức (guard ép):

- Dòng header: các cặp `khoá: giá trị` ngăn bằng ` · `. Khoá bắt buộc: `plan`, `opened`, `unlock`, `checkpoint`. Khoá tuỳ chọn: `checkpoint_done: YYYY-MM-DD` (đã tái hoạch), `closed: YYYY-MM-DD` (kế hoạch kết thúc — guard in NOTE và thoát 0, không đọc bảng nữa).
- Ba bảng theo thứ tự cố định; hai bảng sau mở đầu bằng dòng in đậm `**Xếp lại sau**` và `**Ngoại lệ mở giữa lúc băng**`.
- Cột `slug`: `—` hoặc khớp `^[a-z0-9][a-z0-9-]*$`. **Không** dùng nháy ngược cho slug trong ô mô tả — slug đặt ở cột riêng.
- Cột `★`: `★` hoặc rỗng. Cột `Trạng thái`: chỉ `⬜` (chưa bắt đầu), `◐` (đang làm — hồ sơ đã mở, chưa ký), `✅` (xong — hồ sơ đã ký, hoặc việc làn A đã hoàn tất).
- Bảng "Xếp lại sau", cột 1: nếu khớp dạng slug thì guard kiểm (F3); nếu không (ví dụ `1.1-L1b`, `0.7`, một cụm mô tả) thì là **nhãn**, guard bỏ qua — để nợ chưa có slug vẫn được ghi tên mà không làm khối hỏng.
- Không nhắc mã số ADR chưa có trên `main` (guard sổ cái quét mọi `ADR-dddd` trong file); ADR Director trường kỳ chỉ được nhắc bằng số sau khi B3 hạ cánh.

Khối này **không** nằm trong khối `roadmap-ledger`, nên `roadmap-drift.mjs` (chỉ đọc slug giữa hai marker ledger) không sinh "hồ sơ ma" từ slug chưa tồn tại.

### 5.2 Guard `scripts/roadmap/check-plan-freeze.mjs`

Node builtins thuần (job `Acceptance Gate` không có `pnpm install`), cùng thư mục và cùng cách parse tay như `roadmap-drift.mjs`. Biến môi trường `PLAN_FREEZE_TODAY=YYYY-MM-DD` ghi đè ngày hôm nay (để eval mốc thời gian tất định); `PLAN_FREEZE_ROOT` ghi đè gốc cây (để teeth chạy trên bản sao).

Đọc: khối plan-freeze trong `docs/roadmap.md`; mọi thư mục `_acceptance/<slug>/` (bỏ `config.yaml`, `README.md`); trong mỗi thư mục: `contract.md` frontmatter `status`, `opportunity.md` frontmatter `stage` và `decision`.

Định nghĩa "ô đang mở": có `contract.md` với `status` ∉ {`signed-off`}; **hoặc** không có `contract.md` mà có `opportunity.md` với `stage: discovery`, hoặc `decision` ∈ {`build`, `iterate`}. Định nghĩa "ô đã park": `opportunity.md` có `decision: park`.

| Mã | Đỏ khi | Thông điệp |
|---|---|---|
| **F1** ô mới ngoài kế hoạch | một ô đang mở có slug ∉ (bảng kế hoạch ∪ bảng park ∪ bảng ngoại lệ) **và** chưa gỡ băng | `VIOLATION [plan-freeze] <slug> mở ngoài kế hoạch — thêm vào Ngoại lệ với lý do có tên, hoặc park` |
| **F2** ✅ nói dối | dòng có slug đánh ✅ mà `_acceptance/<slug>/contract.md` không `signed-off` (hoặc không tồn tại) | `VIOLATION [plan-freeze] <#> ✅ nhưng hồ sơ <slug> chưa ký`. Dòng slug `—` được **tin theo lời**; guard in danh sách các dòng đó mỗi lần chạy |
| **F3** park không thật | cột 1 bảng park có dạng slug, **có** thư mục trên cây, mà `opportunity.md` không mang `decision: park` (nhãn không dạng slug bị bỏ qua) | `VIOLATION [plan-freeze] <slug> khai park mà hồ sơ chưa park` |
| **F4** ngoại lệ trần | lý do ∉ {`mất-dữ-liệu`, `bảo-mật`, `chặn-★`}, hoặc thiếu ngày / ai quyết | `VIOLATION [plan-freeze] ngoại lệ <slug> không có lý do có tên` |
| **F0** khối hỏng | thiếu marker, thiếu khoá header, cột không đúng, trạng thái lạ, slug sai dạng | `VIOLATION [plan-freeze] khối kế hoạch không đọc được: <lý do>` — fail-closed |

Mỗi lần chạy, kể cả xanh, in một dòng tỉ lệ: `plan-freeze: ★ 9/16 · tổng 11/20 (55%) · còn băng`. Tỉ lệ tính trên bảng kế hoạch + bảng ngoại lệ; bảng park không tính.

**Gỡ băng** = mọi dòng ★ ✅ **và** (số ✅ / tổng dòng) ≥ 0.85 → in `plan-freeze: GỠ BĂNG ★ 16/16 · tổng 18/20` và F1 tắt (F0, F2, F3, F4 vẫn chạy).

**Mốc tái hoạch** (`checkpoint`): sau ngày đó mà chưa có `checkpoint_done` → **NOTE**, không đỏ: `NOTE [plan-freeze] đã qua mốc tái hoạch 2026-10-09 — xem §6.3 của spec`. Máy nhắc, không quyết thay người.

Mã thoát: 0 khi không VIOLATION; 1 khi có. NOTE không đổi mã thoát.

### 5.3 Chứng minh răng — `scripts/roadmap/check-plan-freeze-teeth.sh`

Cùng khuôn với `check-roadmap-guard-teeth.sh`: sao chép `docs/roadmap.md` + `_acceptance/` vào thư mục tạm, chạy guard với `PLAN_FREEZE_ROOT` trỏ vào đó, làm hỏng **sáu** cách, mỗi cách guard phải thoát 1 với đúng mã (ca 5 là chiều ngược, phải xanh):

1. Thêm `_acceptance/la/contract.md` với `status: draft` — không ở bảng nào → F1.
2. Đánh ✅ dòng B5 (`skill-system-v1`) khi hồ sơ chưa ký → F2.
3. Xoá `decision: park` khỏi `_acceptance/timeline-view/opportunity.md` → F3.
4. Thêm ngoại lệ với lý do `tiện` → F4.
5. **Chiều ngược:** đánh ✅ đủ 16 ★ và ≥ 17/20, với `_acceptance/<slug>/contract.md` giả `status: signed-off` cho mọi slug ★ → guard in `GỠ BĂNG`, mã thoát 0, **và** ca 1 chạy lại trên bản này phải xanh (F1 đã tắt).

6. Xoá marker `plan-freeze:end` → F0 (fail-closed).

Ca 5 chứng minh băng *tan được*. Kịch bản ghi rõ ca nào **không** đỏ theo thiết kế (NOTE mốc thời gian) để không ai coi NOTE là hỏng.

### 5.4 Đấu dây

| File | Việc |
|---|---|
| `.github/workflows/ci.yml` | step `Plan freeze` trong job `Acceptance Gate`, cạnh `Roadmap ledger freshness`: `node scripts/roadmap/check-plan-freeze.mjs` |
| `scripts/ci/check-gate-guards-job.sh` | thêm `check-plan-freeze.mjs` vào hằng số danh sách guard (dòng 40–41 hiện có hai tên) — **không thêm thì chính guard này đỏ** |
| `_acceptance/config.yaml` | `executors.script.plan_freeze: "node scripts/roadmap/check-plan-freeze.mjs"` + một dòng trong `feature_loop.suite_keys` — để **mọi vòng verify local** chạy nó (cổng local hiện không chạy guard sổ cái; PR #96 lên CI mới đỏ) |
| `scripts/roadmap/check-plan-freeze-teeth.sh` | chạy trong `Acceptance Gate` ngay sau guard, cùng khuôn `check-roadmap-guard-teeth.sh` |

## 6. Làn A, mốc thời gian, tái hoạch

**Neo lịch.** Lộ trình không ghi ngày T1, nhưng ba mốc nó nêu (9.9 ∈ T6 · 11.11 ∈ T15 · 12.12 ∈ T20) chỉ khớp nếu **T1 = tuần 03/08/2026**. Hôm nay là T5. Kế hoạch chạy **T5 → T14** (04/09 → 08/11).

### 6.1 Lịch tuần

| Tuần | Ngày | Làn B | Làn A |
|---|---|---|---|
| T5–T6 | 04–13/09 | B1 · B2 · bắt đầu B3 | **A1** (30′) · A6 (10′) · ký Cổng 1 + 2 của B1, B2 |
| T7 | 14–20/09 | B3 xong · B4 (venv + SDK 0.2.20) | ký cổng |
| T8 | 21–27/09 | B5 (nửa đầu) | **A2** ngách · **A7** repo public |
| T9 | 28/09–04/10 | B5 xong · B6 overlay local + 9:16 | **A3** corpus |
| T10 | 05–11/10 | B7 (nửa đầu) · **📍 tái hoạch 09/10** | quyết định §6.3 |
| T11 | 12–18/10 | B7 xong · B9 (WER, COGS) | **A4** lượt chạy thật + hoá đơn |
| T12 | 19–25/10 | B8 · B9 (G1) | ký cổng |
| T13 | 26/10–01/11 | **đệm** (tiền lệ: compose-overlay mất 12 vòng verify) | **A5** tuyển người dùng |
| T14 | 02–08/11 | B10 phiên UAT · phán quyết | 2 giờ ngồi phiên UAT |

Nhịp làn A ngoài mốc: 1–2 chữ ký cổng mỗi tuần, ~15–30 phút mỗi chữ ký; B5/B7/B8 là T3 nên thêm Cổng 1.5 duyệt plan. Tổng công làn A ước **13–16 giờ**, dồn vào T5, T9, T14.

### 6.2 Ba mốc đồng bộ

- **M1 · T5 — vạch trước số.** A1 ký ngưỡng *trước khi* có phép đo nào; không có A1 thì mọi số đo sau mất tính khách quan.
- **M2 · T9 — corpus về, ngách chốt.** A2 + A3 → B9 đo WER thật → G0 phán được ba trong bốn điều kiện (⓪ ① ③); ② chờ B7.
- **M3 · T13–T14 — người thật, máy trắng.** A4 + A5 + B9 hội tụ vào B10. Phiên UAT đồng thời đo điều kiện đảo chiều ADR-0011 (≥ 1/3 không tự nhập được key → managed quay lại làm mặc định — thành hạng mục đầu tiên sau gỡ băng, không mở giữa chừng).

### 6.3 Luật tái hoạch 09/10 — viết trước, không cãi sau

| Tình huống đo được ngày 09/10 | Quyết định định sẵn |
|---|---|
| B5 chưa ký | B8 hạ xuống Should (bỏ ★, giữ dòng); mục tiêu dời 11.11 → 12.12 (T20), UAT ≤ 05/12; ghi `checkpoint_done` |
| B5 ký, B7 chưa bắt đầu | giữ 11.11, bỏ tuần đệm T13 |
| A3 corpus chưa về | B9 đo trên clip tự quay, đánh dấu *tạm* — U3 vẫn "chưa đo thực địa", B9 **không** ✅ |
| A2 ngách chưa chốt | B7 dùng mẫu khung giá seller mặc định; UAT tuyển theo ngách mặc định |

**Băng không tan nếu làn A không về.** Guard tính ★ gồm A1–A5, A7; máy không bịa được chữ ký ngưỡng hay hoá đơn. Tỉ lệ in ra mỗi lần CI chạy là bảng điều khiển duy nhất.

## 7. Vercel AI Gateway — đánh giá và quyết định (04/09)

Đo từ `GET https://ai-gateway.vercel.sh/v1/models` (công khai, không cần xác thực) và docs chính thức ngày 04/09:

- **Catalog 369 model:** 247 language · 36 video · 31 image · 26 embedding · 9 STT · 9 TTS · 6 realtime · 5 rerank. STT có whisper-1, gpt-4o(-mini)-transcribe, gemini-3.5-transcribe, grok-stt, fish-audio (free, có timestamp). **ElevenLabs không có** → 1.4 (ADR-0009) vẫn gọi trực tiếp. Video có wan/seedance/kling/veo/minimax — phủ gần hết S6.
- **Giá:** 0% markup, 0 phí nền, kể cả BYOK. Free $5/tháng cho tập con model, giới hạn tốc độ theo model. BYOK chỉ ở paid tier; request BYOK lỗi thì gateway tự chuyển sang key hệ thống và trừ credit.
- **Dữ liệu:** gateway không giữ prompt/audio sau request. ZDR per-request chỉ Pro/Enterprise; **cả 9 model STT đều `zdr: none`** — không có đường không-lưu-trữ cho audio dù đi đường nào.
- **Python:** OpenAI/Anthropic SDK đổi `base_url`. STT **không** đi qua đường OpenAI-compat; gọi `POST /v4/ai/transcription-model` với audio base64 trong JSON (không multipart). Docs ghi STT *"in beta, access rolling out gradually — transcription models may not appear in the catalog yet for your team"*.
- **Cost/request:** `GET /v1/generation?id=gen_…` trả `total_cost`, tokens, provider, latency; `GET /v1/report` không mở cho Hobby.
- **COGS lát cắt** (STT là mắt xích trả tiền duy nhất; split/overlay/ffmpeg local = $0): whisper-1 $0.006/phút theo catalog (gpt-4o-transcribe tính theo token audio, ≈ cùng mức theo giá niêm yết OpenAI) → 4 live × 60′ = **$1.44/tháng**, 12 × 60′ = $4.32, 30 × 60′ = $10.80; gpt-4o-mini-transcribe một nửa; grok-stt $0.0017/phút. Director (sonnet-4.6, 5k in / 1k out) $0.03/lượt. Ở khối lượng wedge COGS ≈ **$2–5/seller/tháng**, dưới ngưỡng $11 với biên rộng — rủi ro của lát cắt nằm ở WER và lịch, không ở chi phí.

**Quyết định:**

1. **Không đưa gateway vào đường ★.** `oneflow-api-openai` giữ nguyên cho B7. Lý do: STT đang beta rollout dần; "một key" không rẻ hơn cho người dùng đại diện (BYOK đòi mua credit; không BYOK thì phải mở tài khoản Vercel + thẻ); ElevenLabs vắng; gateway không thêm cũng không gỡ rủi ro dữ liệu của audio.
2. **B9 dùng ảnh chụp catalog làm bảng giá máy-đọc** cho bộ đo COGS: commit JSON snapshot `/v1/models` (chỉ các model dùng trong lát cắt) vào `measure/`, không đọc live để bằng chứng không trôi. Không cần tài khoản Vercel.
3. **Park `oneflow-api-vercel-gateway`** (một plugin cho transcribe + gen-text + image-gen + video-gen qua một key) với điều kiện mở ghi ở §3.4.
4. **Park** hàng rào "chặn model đã khai tử" với gợi ý đọc `deprecated_at` từ catalog công khai.

Hai điều chưa kiểm được vì cần key của owner (30 phút, không chặn kế hoạch): `/v4/ai/transcription-model` có nhận `providerOptions` để trả word-timestamp không; STT beta đã bật cho team chưa.

## 8. Bàn giao và tài liệu — B1 chạm những gì

### 8.1 `docs/strategy/vision.md` (T1)

Thêm mục **"Định vị — bổ sung 04/09"** ngay sau "Một câu", nội dung ba tầng của §2 (định vị bất biến → trụ cột ít đổi → lát cắt thay đổi được) và một câu: *tính năng là bằng chứng của nền tảng, không phải định nghĩa của nó*. Không sửa các mục còn lại.

### 8.2 `docs/roadmap.md` (T1)

- Mục mới `## Kế hoạch lát cắt chứng minh (04/09 → 08/11)` với khối §5.1, đặt sau Phase 1 và trước Phase 2.
- Dòng **S3**: 🔴 → *✅ de facto 01/09 qua fork `oneflow-api-openai` (dang-ky-fork-openai) — máy dev quét được cả hai slot transcribe, 0 lỗi; còn kiểm chứng end-to-end trong lát cắt (B7)*.
- Dòng **1.5** và **1.6**: thêm *"→ B5 / B7 trong khối kế hoạch"*.
- Dòng 211 (ngoài khối ledger) viết lại theo 36 hồ sơ, tách hai cách đọc: **16/36** hạng mục trên lộ trình · **5/36** sửa lỗi sản phẩm ngoài lộ trình (bốn hồ sơ kho khoá + fork OpenAI) · **15/36** hạ tầng quy trình và CI; và câu: *trong 15 hồ sơ ký từ 27/08, 7 là hạ tầng quy trình — chính xu hướng mà khối kế hoạch chặn*. Không dùng nháy ngược trong đoạn này.
- **Không** thêm mục "Làn D" và không nhắc số ADR Director — việc của B3.

### 8.3 `STATUS.md` (T1)

- "Hiện trạng": ngày 04/09; 36 hồ sơ đã ký; 4 plugin đang cài trên máy dev (`oneflow-api-ffmpeg`, `oneflow-api-openai`, `oneflow-api-pyscenedetect`, `oneflow-modal-compose-overlay`); 7 nhánh chưa về `main`; guard sổ cái xanh 36/36.
- "Đang dở" và "Hàng đợi hiện hành": **thay bằng một con trỏ** vào khối kế hoạch — không lặp bảng (tránh hai nguồn sự thật, đúng nguyên tắc STATUS.md đã tự đặt cho phần lộ trình).
- "Nợ & cảnh báo": giữ, mỗi dòng gắn nhãn *trong kế hoạch (B?)* / *park* / *đã sửa*.
- "Nghi thức bắt buộc": thêm **phân vùng phiên** — trước khi chạm `docs/roadmap.md`, `STATUS.md`, `_acceptance/**`, `PRODUCT-MAP.md`: `ListAgents`, nhắn phiên peer, đợi xác nhận; nhắn trước khi checkout đổi HEAD (đo được 04/09: HEAD dời dưới chân một phiên đang đọc).

### 8.4 Hồ sơ và bản đồ

- `_acceptance/lat-cat-chung-minh/`: `opportunity.md` (vòng nội bộ — ngưỡng khai một dòng *Không đo được — việc nội bộ của bộ công cụ*; `decision: build`), `contract.md` (T2, không có section Đường đo), `evals.yaml`, `decisions.jsonl` (kèm entry `descope` mở đầu `"bỏ đặc-tả-UX — …"` theo luật kit 2.8.0 cho feature không chạm UI), `gap-probe.md` (phản biện context sạch, dispatch đồng bộ, 6 input), sau đó `evidence-report.md`.
- `_acceptance/skill-1-footage-kho-clip/opportunity.md`: **cơ hội của lát cắt**, mở ở `stage: discovery` với tám ô U + ba số G0 mang tiền tố `[đề xuất]`; A1 = owner ký Cổng Đáng; B10 = Cổng Giá trị của chính nó. Hợp đồng B5/B6/B8 trỏ về cơ hội này trong Notes thay vì khai ngưỡng riêng.
- `_acceptance/{director-v2, timeline-view, staleness-ho-so-thieu-paths}/opportunity.md`: `stage: decided`, `decision: park`. **`decided_by` / `decided_at` là trường người** — owner commit ba dòng đó trong một commit chỉ-trường-người, cùng nghi thức với chữ ký Cổng 2.
- `PRODUCT-MAP.md`: sinh lại bằng generator của kit (3 ô "Đang cân nhắc" → "Xếp lại sau"); `scripts/ci/check-product-map.mjs` phải xanh.

### 8.5 Hình dạng bàn giao sau B1

Một phiên mới — người hay máy — đọc ba thứ theo thứ tự: `STATUS.md` (5 phút, *đang ở đâu*) → khối kế hoạch trong `docs/roadmap.md` (*làm gì tiếp, tỉ lệ bao nhiêu*) → `_acceptance/lat-cat-chung-minh/` (*luật*). Không cần lịch sử chat.

## 9. Hồ sơ `lat-cat-chung-minh` — tiêu chí dự kiến

Tier **T2** (chạm `scripts/roadmap/**`, `scripts/ci/**`, `.github/workflows/ci.yml`, `_acceptance/config.yaml`; không chạm `t3_paths`). Bề mặt: `cli`, `docs`.

- AC-1: Given `docs/roadmap.md` có khối plan-freeze, When guard đọc, Then đếm được đúng **20 dòng**, **16 ★**, 3 bảng, và header đủ bốn khoá.
- AC-2: Given một `_acceptance/<slug>/` mới ở trạng thái mở với slug ngoài ba bảng, When guard chạy trước gỡ băng, Then thoát 1 với `VIOLATION [plan-freeze] <slug> mở ngoài kế hoạch`.
- AC-3: Given một dòng có slug đánh ✅ mà contract chưa `signed-off`, When guard chạy, Then thoát 1 với mã F2; và Given dòng slug `—` đánh ✅, Then không đỏ nhưng dòng đó xuất hiện trong danh sách "tin theo lời".
- AC-4: Given một slug ở bảng park có thư mục mà `opportunity.md` không `decision: park`, When guard chạy, Then thoát 1 với mã F3.
- AC-5: Given một dòng ngoại lệ với lý do ngoài ba giá trị hoặc thiếu ngày/ai quyết, When guard chạy, Then thoát 1 với mã F4.
- AC-6: Given mọi dòng ★ ✅ và ≥ 85% dòng ✅ (contract của mọi slug ★ `signed-off`), When guard chạy, Then in `GỠ BĂNG` và một ô mới ngoài kế hoạch **không** còn làm guard đỏ.
- AC-7: Given `PLAN_FREEZE_TODAY` sau `checkpoint` và không có `checkpoint_done`, When guard chạy, Then in NOTE mốc tái hoạch và **mã thoát không đổi**.
- AC-8: Given khối thiếu marker, thiếu khoá header, hoặc có trạng thái ngoài `⬜ ◐ ✅`, When guard chạy, Then thoát 1 với mã F0 (fail-closed).
- AC-9: Given `.github/workflows/ci.yml`, `scripts/ci/check-gate-guards-job.sh`, `_acceptance/config.yaml`, When chạy `check-gate-guards-job.sh` ở các mode `shape`, `reachable`, `suite-keys`, Then guard mới được nhận diện là một step có tên trong job `Acceptance Gate` và là một suite key.
- AC-10: Given `check-plan-freeze-teeth.sh`, When chạy, Then cả 13 case xanh (sáu ca phá đỏ đúng mã, ca chiều ngược AC-6 xanh, ca NOTE cố ý không đỏ), mỗi case một mã thoát; tên lạ bị từ chối exit 2.
- AC-14: Given dòng A1 mang ghi chú `kiểm: opportunity:skill-1-footage-kho-clip` và đánh ✅ trong khi cơ hội ấy chưa có `decision` hoặc `decided_by`, When guard chạy, Then thoát 1 với mã F2 nêu đúng slug cơ hội; Given cơ hội đã ký Cổng Đáng, Then A1 ✅ được nhận và không nằm trong "tin theo lời".
- AC-11: Given ba cơ hội `director-v2`, `timeline-view`, `staleness-ho-so-thieu-paths` mang `decision: park` và `PRODUCT-MAP.md` sinh lại, When chạy `node scripts/ci/check-product-map.mjs`, Then xanh và bản đồ ghi 3 việc ở "Xếp lại sau".
- AC-12: Given STATUS.md, vision.md, roadmap.md sau B1, When chạy `bash scripts/roadmap/check-roadmap-fresh.sh` và grep các con số (36 hồ sơ, ngày 04/09, đoạn định vị, dòng S3, dòng 211 không có nháy ngược), Then tất cả khớp.
- AC-13: Given guard và teeth, When grep `import`/`require` và chạy guard trong một thư mục tạm **không có `node_modules`**, Then chỉ dùng `node:` builtins và vẫn chạy được.

Evals dự kiến: 12 `script` (fixture theo khuôn `check-roadmap-guard-teeth.sh`, ngày giả qua `PLAN_FREEZE_TODAY`) + 1 `judgment` (ngôn ngữ mặt người của thông điệp guard theo luật N1–N6 của kit). Không `ui-check`.

**Ngoài phạm vi B1:** hạ cánh D0, b01, các hồ sơ B4–B10; sửa `scripts/pre-merge-check.sh`; chặn nhánh/plan; phân loại lại cột "Vị trí trên lộ trình" của sổ cái; mục "Làn D" trong roadmap.

## 10. Rủi ro và giả định

| # | Rủi ro | Giảm nhẹ |
|---|---|---|
| R1 | Vòng verify phình (tiền lệ compose-overlay 12 vòng) | `paths` hẹp, một hồ sơ mở tại một thời điểm, `runBaseline` tắt, T13 đệm |
| R2 | B4 cần publish SDK — TWINE đang bị comment, token PyPI toàn tài khoản | A6 trước B4; publish thử TestPyPI ở T6 |
| R3 | B6 cần repo plugin public mới; `normalize-text-vi` từng bị rút vì repo không public | A7 ★ trước B6 |
| R4 | Model `gpt-transcribe` đổi tiếp — danh sách model nằm ngoài repo | B7 conformance + UAT bắt; hàng rào khai tử ở park |
| R5 | UAT trên máy trắng không có media-library | Skill #1 nhận cả upload lẫn nạp-từ-kho; U1 không đòi library |
| R6 | B5/B7/B8 là T3 → Cổng 1.5 | +1 giờ làn A, đã tính |
| R7 | Hai phiên một cây (đo 04/09) | nghi thức phân vùng vào STATUS.md |
| R8 | b01 xung đột CLAUDE.md (5 lần sửa bullet manifest sau 26/08) | B2 merge `main` vào nhánh trước; giữ bullet ids theo `main` |
| R9 | Guard sổ cái quét mọi `ADR-dddd` — nhắc ADR chưa có trên `main` có thể đỏ | B1 không nhắc số ADR Director; B3 làm |
| R10 | Kit đang chạy là **2.8.0** (đo 04/09 qua `installed_plugins.json`), plugin cache giữ sáu bản; đọc nhầm bản cũ là chuyện đã xảy ra trong phiên này | mọi đường dẫn plugin qua `resolve-plugin.mjs`; STATUS.md ghi cả hai tầng phiên bản |

Giả định đã nêu: T1 = tuần 03/08/2026; từ vựng kit `stage: discovery|decided|archived`, `decision: build|iterate|park|kill` (kit 2.7.0); `scripts/ci/check-gate-guards-job.sh` giữ danh sách guard bằng hằng số; job `Acceptance Gate` không cài `node_modules`.

## 11. Quyết định owner trong phiên 04/09 (sổ ghi)

1. Bàn giao = outcome **một tính năng dùng được** cho người dùng (không phải chỉ handoff giữa phiên).
2. Tính năng = **Skill #1 đúng nghĩa** (nút bấm, canvas ẩn, skill system 1.5) — không phải workflow mẫu, không phải tính năng nhỏ hơn.
3. Làn Director: **hạ cánh D0, đóng băng phần còn lại**; D3 gộp vào thiết kế 1.5.
4. Luật đóng băng **có răng**, guard trong job `Acceptance Gate`.
5. Hình dạng kế hoạch: **A — một đường ★, hai làn, ba mốc**.
6. Giữ hai quyết định kỹ thuật: port overlay về local; 9:16 bằng canvas trong plugin overlay.
7. Giữ T13 làm tuần đệm.
8. Định vị ba tầng (nền tảng đa mục đích, tiếp cận được với bất kỳ ai) ghi vào vision.md; hồ sơ đổi tên `mot-tinh-nang-dung-duoc` → `lat-cat-chung-minh`.
9. Vercel AI Gateway: ba chỉnh ở §7 — không vào đường ★, ảnh chụp giá cho B9, park plugin gateway với điều kiện mở.
10. Thực thi theo nếp Acceptance-Gate Kit (feature-loop 2.8.0): S1 sinh contract + evals + gap-probe **trước** Gate 1, plan là S2; hồ sơ này **xin chữ ký Gate 1 thật** thay vì đường tự-đi-tiếp của T2, vì nó là luật ràng buộc chính owner.
11. Năm chỉnh plan lớn theo kit: A1 = Cổng Đáng của cơ hội `skill-1-footage-kho-clip`; B10 = Cổng Giá trị của cơ hội ấy; B2 và S1 đi làn prototype keep; B1 khai *Không đo được*; B3 resume S4.
12. Cơ hội duy nhất mang ngưỡng của lát cắt là `skill-1-footage-kho-clip`; B5/B6/B8 là đường B trỏ về nó.
