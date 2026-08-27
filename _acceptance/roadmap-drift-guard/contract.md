---
schema_version: 1
feature: Guard chống trôi docs/roadmap.md — ba kiểm A/B/C, răng tách theo case, nối pnpm roadmap:check
slug: roadmap-drift-guard
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [scripts, docs]
status: implemented
approved_by: Manh
approved_at: 2026-08-27
---

# Acceptance Contract: roadmap-drift-guard

## Context

[`docs/roadmap.md`](../../docs/roadmap.md) tự khai một luật cập nhật về chính nó — *"cập nhật
file này mỗi lần qua gate, không cập nhật theo tuần"* — và luật đó chưa có răng. Kiểu hỏng nó
mời gọi không phải "lộ trình hơi cũ", mà **"lộ trình vẫn lập luận từ một quyết định repo đã
đảo chiều"**.

Đo được, không phải giả định: ADR-0011 (05/08) đặt máy người dùng làm nền thực thi mặc định,
nhưng suốt hai tuần khối Phase 2 vẫn viện dẫn nửa "managed-cloud là mặc định" của ADR-0005
như thể nó còn hiệu lực. Hai file đều **tự** nhất quán; chỉ có **cặp** là sai — nên không có
lần đọc đơn lẻ nào phát hiện ra.

Hướng trôi có lý do cơ học, không phải do ai lười: `STATUS.md` cập nhật mỗi gói việc (áp lực
cao), lộ trình chỉ cập nhật ở gate (áp lực thấp). Một cú đảo chiều chiến lược rơi vào giữa
hai gate sẽ lọt qua đúng cái khe đó.

Source input: prompt (phiên 2026-08-27) + header tự-tài-liệu-hoá của
[`check-roadmap-fresh.sh`](../../scripts/roadmap/check-roadmap-fresh.sh) ·
PR [#74](https://github.com/phanlemanh/OneFlow/pull/74) (đang draft, chặn bởi chính cổng này).

**Trạng thái thi công khi viết hợp đồng — khai thẳng.** Ba script đã tồn tại từ `ce91889`
(19/08) và chạy xanh; hai alias `package.json` vừa thêm ở `ae05730`. Đây là hồ sơ **viết
sau thi công**, đúng cái anti-pattern kit cảnh báo ("criteria mold themselves to what was
built"). Hai đối trọng, ghi ra để Cổng 1 cân chứ không để bào chữa: (1) AC dưới đây suy ra
từ **cú trôi có thật 05/08–19/08**, không suy ra từ hành vi hiện tại của script — AC-6 khoá
vào đúng `main @ 244cb0b`; (2) AC-7 đòi một thứ script **chưa có**, nên bộ AC này không thể
pass bằng cách đứng yên.

## Criteria

- AC-1: Given một file ADR trong `docs/adr/` mà `docs/roadmap.md` không nhắc lần nào, When
  chạy `pnpm roadmap:check`, Then guard thoát khác 0 và in id ADR đó kèm tiêu đề của nó.
- AC-2: Given một khối trong lộ trình viện dẫn ADR đã bị một ADR sau thay thế, mà **không**
  nêu tên ADR thay nó trong cùng khối, When chạy guard, Then thoát khác 0, nêu cả id cũ, id
  thay thế, và trích 110 ký tự đầu của khối phạm lỗi.
- AC-3: Given cùng một khối **có** nêu tên ADR thay thế bên cạnh id đã bị thay, When chạy
  guard, Then kiểm B **KHÔNG** nổ cho khối đó (nửa suppression của AC-2 — một guard kêu cả
  khi đã sửa đúng là guard người ta học cách bỏ qua).
- AC-4: Given một `_acceptance/<slug>/contract.md` ở `status: signed-off` mà slug đó vắng
  trong khối `roadmap-ledger:start/end`, When chạy guard, Then thoát khác 0 và gọi tên slug.
- AC-5: Given sổ cái còn một dòng cho slug **không còn** ở trạng thái ký, When chạy guard,
  Then thoát khác 0 và gọi tên slug đó (chiều ngược của AC-4 — sổ cái phình ra cũng là trôi).
- AC-6: Given `docs/roadmap.md` đúng như nó đứng trên `main @ 244cb0b` — cú trôi ADR-0005/0011
  có thật, không phải nhiễu bịa, When chạy guard trên cây đó, Then thoát khác 0.
- AC-7: Given bộ răng, When chạy từng nhiễu riêng lẻ bằng `--case <tên>`, Then **mỗi nhiễu có một lần gọi riêng và mã thoát của lần gọi đó chỉ nói về nó** —
  case đạt thoát 0, case hỏng thoát khác 0 — kèm đúng một token nhãn `CASE <tên>: PASS`
  của riêng nó. Đây KHÔNG có nghĩa mỗi case một giá trị số khác nhau (làm rõ vòng 2,
  sau khi người kiểm vòng 1 chỉ ra câu cũ đọc được hai nghĩa); sáu nhiễu nấp sau một mã
  thoát là sáu tiêu chí gộp thành một, và một case chưa từng được cài trông y hệt một case đã
  qua.
- AC-8: Given cây sạch đúng như trên `main`, When chạy `pnpm roadmap:check`, Then thoát 0 —
  không báo động giả. Không có tiêu chí này thì mọi tiêu chí ĐỎ ở trên đều thoả được bằng một
  guard `exit 1` vô điều kiện.
- AC-9: Given quan hệ "thay thế" chỉ được khai ở bảng trong `docs/adr/README.md`, When thêm
  một dòng thay-thế mới vào bảng đó, Then guard nhận ra quan hệ mới **mà không sửa gì trong
  guard** — không có nguồn sự thật thứ hai.
- AC-10: Given một checkout sạch, When gõ `pnpm roadmap:check` và `pnpm roadmap:teeth` từ gốc
  repo, Then cả hai phân giải và chạy — ba chỗ đang viện dẫn hai lệnh này (header của cả hai
  script, và trang `docs/assets/oneflow-roadmap-status.html`) trở thành đúng.

## Coverage

Quét trục theo `morphological-scan`; thước CE là nguồn đối chiếu cho từng trục.

- Trục **nguồn sự thật**: `docs/adr/` | `_acceptance/*/contract.md` | `docs/roadmap.md` |
  `docs/assets/*.html` [thước CE: guard đọc ba cái đầu — cái thứ tư KHÔNG phủ, xem Out of scope]
- Trục **hướng lệch**: thiếu-ở-roadmap (AC-1, AC-4) | thừa-ở-roadmap (AC-5) | trích-dẫn-quá-hạn (AC-2)
- Trục **phán quyết**: ĐỎ đúng (AC-1/2/4/5/6) | XANH đúng (AC-3, AC-8) | ĐỎ oan [thước CE: AC-8 là
  chốt chặn duy nhất; nhiễu 0 của răng đo đúng chiều này]
- Trục **đường gọi**: alias `pnpm` (AC-10) | gọi thẳng `bash scripts/roadmap/...` | trong CI
  [thước CE: nhánh CI nằm ngoài phạm vi, xem Out of scope]
- Trục **hạt phán quyết**: một mã thoát cho cả bộ | một mã thoát cho mỗi case (AC-7)
  [thước CE: bài học đã trả giá ở `stale-scope-by-paths`, ghi trong `_acceptance/config.yaml` ~dòng 310]

## Out of scope

- **Không nối vào CI.** `scripts/ci/check-action-pins.sh` đếm *số site* pin `actions/checkout`
  (6 hôm nay) chứ không đặt sàn, nên bất kỳ PR nào thêm một job CI đều làm guard **đó** đỏ vì
  lý do không liên quan tới chính nó — đúng cái bẫy CLAUDE.md đã ghi cho manifest guard. Nối
  dây là PR hai-file riêng, kèm bump số site.
- **Không phủ bốn trang HTML** trong `docs/assets/`. Chúng trôi độc lập và đã trôi thật: trang
  `oneflow-roadmap-status.html` bảo người đọc chạy `pnpm roadmap:check` suốt tám ngày trong khi
  lệnh đó chưa tồn tại. Guard này không bắt được lớp đó.
- **Không kiểm `STATUS.md` ↔ lộ trình.** Hai file trả lời hai câu khác nhau (*đang ở đâu* vs
  *sẽ đi đâu*); ép chúng khớp nhau là ép sai chiều.
- **Không phán xét lộ trình đúng hay sai.** Guard chỉ đo tính nhất quán nội bộ giữa ba nguồn
  máy đọc được. Một lộ trình nhất quán mà sai chiến lược vẫn xanh — đó là việc của người.
- **Không tự sửa.** Guard chỉ tố cáo và thoát khác 0; không có chế độ `--fix`.

> Out of scope = scope-truth (Cổng 1 duyệt mục này).

## Notes

- Guard KHÔNG được nằm trong `t1_skip_globs`. Danh sách miễn trừ đó dành riêng cho **thước đo
  mua ngoài** (vendored kit), với lý do hẹp: nâng cấp thước không được làm ôi thiu bằng chứng
  đã ký. Guard này không chia sẻ lý do đó, và tiền lệ trong repo (`check-manifest-unmoved.sh`
  vào cùng hồ sơ `per-plugin-origin` như AC-6) là guard đi qua cổng, không đi vòng.
- Quan hệ ADR đọc từ bảng `docs/adr/README.md` — chỉ mục vốn đã hand-maintained. AC-9 khoá
  tính chất này lại để lần sửa sau không lén dựng danh sách thứ hai bên trong guard.
- Thi công còn thiếu đúng một việc để bộ eval chạy được: tách `--case` trong
  `check-roadmap-guard-teeth.sh` (AC-7) và khai 8 khoá `executors.script.roadmap_*` tương ứng
  trong `_acceptance/config.yaml`. Mọi khoá `config:` trong `evals.yaml` hôm nay **chưa tồn
  tại** — chúng hạ cánh trong lúc thi công, đúng khuôn `stale-scope-by-paths` đã dùng.

## Amendment — 2026-08-27 (sau Cổng 1, trong lúc thi công)

- **Thêm alias thứ ba `pnpm roadmap:check-alias`.** AC-10 gọi tên hai lệnh; thi công đẻ
  thêm một guard mới (`check-roadmap-alias-cited.sh`, executor của E10) và guard đó cần
  đường gọi riêng. E10 vốn quét **mọi** chuỗi khớp `pnpm roadmap:*` nên alias thứ ba nằm
  trong phạm vi eval sẵn có, không nới tiêu chí. Ghi ra đây vì AC-10 gọi tên hai lệnh chứ
  không phải "hai lệnh trở lên".
- **Lần chạy đầu của E10 ĐỎ, và đỏ đúng.** Header của chính guard mới viện dẫn
  `pnpm roadmap:check-alias` trước khi `package.json` khai nó — tức guard bắt được đúng
  lớp lỗi nó sinh ra để bắt, trên chính tác giả nó, ở lần chạy đầu tiên.
- **Bộ răng đi từ 6 lên 10 case.** Ba case mới là nửa KHÔNG-nổ (`superseded-paired`,
  `ledger-paired`, `supersede-source-single`) cộng `case-isolation`. Đã kiểm bằng ba đột
  biến trên bản sao — xem `decisions.jsonl`.

## Amendment — 2026-08-27 vòng 2 (sau verify vòng 1)

Người kiểm context sạch cho verdict PASS 11/11 nhưng nêu ba chỗ **bộ eval yếu hơn chính
hợp đồng nó chứng minh**. Cả ba đã vá; đây là lý do vòng 1 bị thay chứ không phải bổ sung.

- **Bộ răng nay khẳng định NỘI DUNG thông điệp, không chỉ đỏ/xanh.** Trước đó mọi case
  chạy guard với output vứt đi, nên nửa "in id kèm tiêu đề" (AC-1) và "trích 110 ký tự"
  (AC-2) không ai giữ. Nay `adr-uncited` đòi `— "<tiêu đề>"` không rỗng; `superseded-bare`
  đòi trích dẫn có thật và **≤ 110 ký tự**; `ledger-missing` / `ledger-stale` đòi gọi đúng
  tên slug; `clean` đòi dòng đếm sổ cái có mặt, hai số bằng nhau và khác 0.
  Kiểm bằng ba đột biến **chỉ làm nghèo thông điệp, không đổi hành vi đỏ/xanh**: cả ba
  trước khi vá đều XANH, sau khi vá đều ĐỎ.
- **E10 nay chạy thật qua `pnpm`.** Trước đó nó chỉ đọc khai báo `package.json` và kiểm
  file tồn tại, trong khi AC-10 nói "phân giải **và chạy**" — một alias trỏ đúng file
  nhưng chết lúc chạy (shebang hỏng, thiếu quyền, pnpm không phân giải nổi tên) vẫn qua
  sạch. Nửa (b) loại chính alias của nó khỏi vòng lặp, cùng lý do `case-isolation` phải
  loại chính nó. Kiểm bằng đột biến M-D: alias khai đúng + trỏ đúng file + **chạy hỏng**
  → nửa (a) xanh, nửa (b) đỏ.
- **AC-7 chốt nghĩa.** "Mỗi nhiễu sở hữu một mã thoát riêng" đọc được hai nghĩa; nay nói
  thẳng là *một lần gọi riêng cho mỗi case*, không phải *mỗi case một giá trị số khác nhau*.
  Người kiểm vòng 1 đọc đúng nghĩa này, nhưng câu chữ không được phép dựa vào may mắn đó.
