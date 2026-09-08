# HANDOFF — gói D0 `director-wire-shape` (26/08/2026)

> Đọc file này + [`contract.md`](contract.md) + [`opportunity.md`](opportunity.md) là đủ để
> tiếp tục. Không cần lịch sử chat.

## 1. Đang ở đâu

**Cổng 0 ✅ ký · Cổng 1 ✅ ký · Cổng 2 ⬜ chưa.**
`contract.md` `status: implemented` — từ đây cổng acceptance **nhìn thấy** ô này.

Chạy `bash scripts/pre-merge-check.sh --base main` cho **đúng 1 vi phạm**:

```
VIOLATION [director-wire-shape]: status=implemented but no evidence-report.md
```

Đó là trạng thái ĐÚNG, không phải lỗi: cổng chặn merge cho tới khi Cổng 2 sinh bằng chứng.
21 tính năng đã ký khác đều PASS.

⚠️ **Luôn truyền `--base`.** Thiếu nó, cổng in *"no usable PR base — whole-tree applied"* và
cho 22 vi phạm giả, nêu cả file không hề bị sửa. Đó là fail-safe đúng nhưng tín hiệu vô dụng.

## 2. Bốn nhánh, chưa nhánh nào push

| Nhánh | HEAD | +main | Nội dung |
|---|---|---|---|
| `feat/director-wire-shape` | `668f876` | +10 | **Gói D0** — nhánh làm việc chính |
| `docs/director-lane-d` | `c4246c9` | +5 | ADR-0013 + research + hồ sơ (D0 cắt từ đây) |
| `b01/open-source-rebrand` | `9798e23` | +4 | Gói mở hoá B01, độc lập, sẵn sàng duyệt |
| `feat/normalize-text-vi` | — | — | **Của phiên khác**, không đụng |

`feat/director-wire-shape` **chứa trọn** `docs/director-lane-d` — merge nhánh D0 là mang cả ADR,
research, hồ sơ và code về `main` trong một PR. Đúng khuôn acceptance-gate: hợp đồng + code đi cùng.

**Thứ tự merge đã thống nhất với phiên `normalize-text-vi`:** B01 trước, rồi nhánh họ.
Lý do: B01 tắt trigger tag `v*` của `desktop-release.yml` — vào `main` trước thì mọi tag sau đó
có hành vi nhất quán; ngược lại sẽ có khoảng thời gian tag vẫn sinh installer tên TongFlow.

## 3. Worktree

| Đường dẫn | Nhánh | Ghi chú |
|---|---|---|
| `/private/tmp/oneflow-d0-wt` | `feat/director-wire-shape` | **có `node_modules`** + `plugins/` (7) + `.env` |
| `/private/tmp/oneflow-docs-wt` | `docs/director-lane-d` | không deps |
| `/private/tmp/oneflow-b01-wt` | `b01/open-source-rebrand` | không deps |
| `/Users/manh-macmini/dev/oneflow` | `feat/normalize-text-vi` | **cây chung — của phiên khác** |

Cả bốn đều sạch (`git status` rỗng).

**Luật phối hợp đã thống nhất với phiên kia — giữ nguyên:**
- Cổng 3000 và `.next/` là tài nguyên **độc chiếm**: nhắn trước, nhắn khi xong.
- Nhánh/worktree của người khác cũng vậy.
- Mọi `git add`/`git commit` trong cây chung phải nêu đường dẫn tường minh.
  (Hai lần công việc bị nuốt vào commit của nhau vì `git add -A` và `git commit` trần.)

## 4. Việc tiếp theo — Cổng 2

### 4a. Chạy E14b (cần NGƯỜI, không tự động hoá được)

```bash
cd /private/tmp/oneflow-d0-wt && pnpm dev      # nhắn phiên kia trước, cổng 3000 là chung
```

Trong UI, mở panel Director, gõ 5 prompt tiếng Việt và đi qua **cả ba** nhánh:
1. canvas **rỗng** → áp dụng ngay (`accepted`)
2. canvas **có node** → bấm xác nhận (`replaced`)
3. canvas **có node** → **Escape** hoặc bấm ra ngoài (`discarded`) ← *dễ sót nhất, nó đi qua
   `onOpenChange` chứ không qua riêng nút Cancel*

Rồi kiểm:

```bash
node -e "const D=require('better-sqlite3');const db=new D('data/tongflow.db',{readonly:true});
console.log(db.prepare(\"SELECT kind,count(*) n FROM director_events GROUP BY kind\").all())"
```

**Đạt khi:** tỉ lệ row còn ở `generated` < 10%, và có mặt đủ `accepted` + `replaced` + `discarded`.

### 4b. Viết `evidence-report.md`

15 eval; 14 đã có bằng chứng, chờ E14b. Xem khuôn ở `_acceptance/byo-key-onboarding/`.

### 4c. Vòng verify S4 đa-agent

Người kiểm **mọi** judgment item (E14a, E14b).

## 5. Bằng chứng đã có

| File | Nội dung |
|---|---|
| `evidence/baseline-2026-08-26.md` + `.json` | EVAL-0 — mốc Director v1: **26/30 (86,7%)**, p95 75,1s |
| `evidence/eval3-schema-acceptance-2026-08-26.md` | EVAL-3 — schema qua **4/4 hãng** sau bản sửa 1 dòng |
| `evidence/e14-2026-08-26.md` + `e14-d0-2026-08-26.json` | E14 trên D0 — **29/30 (96,7%)**, không hồi quy |
| `golden/` | golden set 30 prompt + 6 script đo, tái lập được |
| `decisions.jsonl` | 14 quyết định thực sự đã lấy |

## 6. Số quan trọng nhất mà gói này mở khoá

```
attempts=1   57  (91,9%)
attempts=2    5  ( 8,1%)
```

EVAL-0 phải **ước lượng** con số này theo độ trễ và đoán **33,3%**. Số đo thật là **8,1%** —
ước lượng cũ **sai gấp bốn lần**. Mọi đề xuất tăng `MAX_ATTEMPTS` dựa trên nó đều đứng trên nền sai.
Đây chính là lý do gói D0 tồn tại.

## 7. BỐN CÁI BẪY — đọc trước khi đo lại

1. **Bộ đo sẽ tự dừng nếu `plugins/` lệch `frozen-config.json`** (thoát mã 2). Đừng gỡ guard này.
   Lần chạy E14 đầu cho **30/30 (100%)** trong worktree mới — hiện vật, vì `plugins/` rỗng nên
   vocabulary rỗng, Director chỉ sinh được step `text`, và plan toàn text thì luôn compile.
   Hợp đồng **đã cảnh báo đúng điều đó** và phép đo vẫn lọt: bộ đo *in* cấu hình mà không *kiểm*.
2. **`director_events` là append-only.** Không reset giữa các lần chạy. Mọi ngưỡng phải hỏi
   **phần tăng thêm**, không hỏi tổng. (Ngưỡng gốc `count(*) == 30` sai vì lý do này; đo thật 62.)
3. **Script không đo được tỉ lệ mồ côi.** `run-baseline.mjs` gọi thẳng `/api/director`; chỉ UI
   gọi `/api/director/feedback`. Script luôn cho 100% mồ côi dù hiện thực đúng hay sai.
4. **Hai loại guard cần hai phép thử khác nhau:**
   - guard *phát hiện thay đổi* → chạy trên nhánh trước gói, phải **ĐỎ**
   - guard *bất biến* → xanh cả hai nhánh là **ĐÚNG**; chứng minh bằng **chèn vi phạm**
   Trộn lẫn sẽ kết luận nhầm rằng guard hỏng. (`dws-no-prompt-in-prod-log`,
   `dws-expect-count` thuộc loại bất biến.)

## 8. Điều kiện đi kèm chưa làm

`src/lib/director/dsl.ts:46` — đổi `z.discriminatedUnion("kind", …)` → `z.union([…])`.

EVAL-3 chứng minh `oneOf` bị **OpenAI từ chối qua mọi đường**, `anyOf` được cả 4 hãng nhận.
Chi phí gần 0: một chỗ dùng, không test nào tham chiếu, `Extract<DirectorStep,{kind:…}>` giữ nguyên.
**Phải đi cùng gói đổi transport** (`director-transport-open`, làn B05) — tách ra là để lại mìn.

## 9. Câu hỏi còn treo cho owner

1. **Vercel AI Gateway hay OpenRouter?** [ADR-0010](../../docs/adr/0010-mainstream-infra-and-models.md)
   nêu đích danh OpenRouter vai gateway, và repo đã có `OPENROUTER_API_KEY`. Chọn Vercel là nhà
   cung cấp thứ hai cho cùng vai → cần ADR giải thích, hoặc đổi lựa chọn.
2. **B02 — provenance ba plugin đã port.** Chưa quyết. `oneflow-modal-compose-overlay/entry.py`
   **byte-identical** với `tongflow-modal-ffmpeg/entry.py` (md5 trùng), và cả 7 plugin đều
   **không có LICENSE**. Hai README fork còn ghi "AGPL-3.0". Chi tiết:
   `docs/strategy/research-mo-hoa-2026-08.md` §3.
3. **`stage` của opportunity card** sau khi Cổng 0 GO — repo chưa có tiền lệ, để nguyên `discovery`.
4. **Điểm chết chưa xử lý:** plugin Modal upstream ghim `tongflow==0.2.21` — distribution PyPI
   của upstream. Mirror repo **không** giải được nhánh này.
