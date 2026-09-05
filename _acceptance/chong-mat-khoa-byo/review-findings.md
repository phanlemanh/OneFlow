## Trong hợp đồng

- **Deep-equality promises asserted with toMatchObject in the route tests**
  file: `src/app/api/settings/env/route.unreadable.test.ts:98`
  severity: low
  AC: AC-7
  detail: Line 98 asserts `toMatchObject({ env: { NEW: "v" } })` for AC-7's round trip and line 62 asserts `toMatchObject({ env: {} })` for the absent case. `toMatchObject` is containment, so both stay green if the handler returns extra keys alongside — and "no key I did not write is present, none I wrote is missing" is the whole promise of a feature about keys being silently lost. `toEqual` is the assertion these two cases actually claim. Already logged in review-findings.md as medium/known-limits and not yet changed in the tree.
  source: conventions

- **Assert "trường có mặt" thay vì quan hệ giá trị (hình dạng 3): toMatchObject({ env: {} }) là assertion RỖNG**
  file: `src/app/api/settings/env/route.unreadable.test.ts:62`
  severity: medium
  AC: AC-5
  detail: E5 trong _acceptance/chong-mat-khoa-byo/evals.yaml hứa "kho CHƯA CÓ → GET trả 200 với env deep-equal {}". Assert thực tế là `await expect(res.json()).resolves.toMatchObject({ env: {} })`. Với Vitest/Jest, `toMatchObject` chỉ kiểm các khoá CÓ trong object kỳ vọng; object kỳ vọng rỗng nên vế `env` không bị ràng buộc gì cả — nó chỉ chứng minh "body có trường env và env là object". Đã đo trực tiếp trong cây này: `expect({ env: { A: "1" }, pluginEnv: [] }).toMatchObject({ env: {} })` PASS. Nghĩa là một GET trả về `env` đầy khoá ở trạng thái absent vẫn xanh, đúng thứ mà lời hứa "deep-equal {}" định chặn. Sửa hình dạng: dùng `toEqual` cho `env` (ví dụ `expect((await res.json()).env).toEqual({})`).
  source: measurement

- **So-gương hai lần chạy, không có đối chứng dương ghim giá trị thật (hình dạng 4): ca "cờ bị bỏ qua khi kho lành" vẫn xanh khi PUT KHÔNG ghi gì**
  file: `src/app/api/settings/env/route.unreadable.test.ts:120`
  severity: medium
  AC: AC-8
  detail: Ba assert của ca này (dòng 118 `flagged.status === plain.status`, 119 `flagged body toEqual plainBody`, 120 `disk sau === plainDisk`) đều là so SÁNH GIỮA HAI LẦN CHẠY, không lần nào ghim giá trị tuyệt đối phải có trên đĩa (`{"A":"2"}`). Cả hai vế có thể cùng sai giống hệt nhau. Điều này càng đáng kể vì route vừa đổi sang ECHO body thay vì đọc lại kho (`return NextResponse.json({ env, verdicts })` trong route.ts), nên body cũng không chứng minh được đã ghi. Đã mutation-test trong chính cây này: xoá dòng `await saveEnvStore(env);` khỏi src/app/api/settings/env/route.ts rồi chạy `vitest -t "is ignored when the store is healthy"` → 1 passed. Một handler không ghi gì cả vẫn qua được ca này, trong khi header file tuyên "assertions are about bytes on disk" và E8 tuyên "PUT ghi được" (vế đó chỉ còn được đo bằng mock trong route.test.ts). Thiếu một assert dương kiểu `expect(readFileSync(store(),"utf8")).toBe('{"A":"2"}')` (hoặc JSON.parse deep-equal).
  source: measurement

- **Assert "có mặt" thay vì quan hệ THAY THẾ (hình dạng 3): toMatchObject không phân biệt overwrite với merge**
  file: `src/app/api/settings/env/route.unreadable.test.ts:98`
  severity: low
  AC: AC-7
  detail: Tên ca là "overwrites only when the caller asks for it by name" và E7 hứa "GET ngay sau đó trả 200 với env deep-equal map vừa ghi". Assert thực tế `toMatchObject({ env: { NEW: "v" } })` chỉ kiểm khoá NEW có mặt với giá trị "v"; nó xanh y nguyên nếu `env` là `{ NEW: "v", <khoá sót lại khác> }`. Tức là chính quan hệ được hứa — GHI ĐÈ (kho sau bằng đúng map gửi lên), không phải hợp nhất — không nằm trong phép đo. Cùng nguyên nhân với dòng 62; đổi sang so bằng `toEqual` trên `env` là đủ.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Node key input still merges onto a failed GET and PUTs the whole map**
  Người dùng thấy gì: Gõ khoá mới vào ô cài đặt của một node có thể vô tình xoá mất các khoá khác đã lưu trước đó nếu lần đọc kho khoá ngay trước đó bị lỗi, thay vì báo lỗi và giữ nguyên dữ liệu cũ.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hardcoded Vietnamese error strings in an API route, plus internal enum leak**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh, Nhật, Hàn hoặc Trung sẽ thấy thông báo lỗi kho khoá hiện bằng tiếng Việt kèm mã kỹ thuật khó hiểu, thay vì một lời giải thích rõ ràng bằng ngôn ngữ họ đang dùng.
  file: `src/app/api/settings/env/route.ts`
  severity: medium
  Đề xuất: new-contract

- **readEnvStore swallows the original error in all four catches and logs nothing**
  Người dùng thấy gì: Khi kho khoá gặp sự cố, đội vận hành không có đủ nhật ký kỹ thuật để biết chính xác nguyên nhân (quyền truy cập, đĩa hỏng, v.v.), khiến việc chẩn đoán và xử lý sự cố về sau chậm hơn.
  file: `src/lib/settings/env-store.server.ts`
  severity: medium
  Đề xuất: known-limits

- **PUT echoes the request map instead of the persisted map**
  Người dùng thấy gì: Sau khi lưu một khoá có khoảng trắng thừa trong tên, màn hình có thể tạm thời hiển thị đúng như đã gõ thay vì đúng như đã lưu trên đĩa (đã tự cắt khoảng trắng), cho đến khi tải lại trang.
  file: `src/app/api/settings/env/route.ts`
  severity: low
  Đề xuất: known-limits

- **Root-guarded test branches return early instead of skipping, producing a green that asserts nothing**
  Người dùng thấy gì: Nếu ai đó chạy bộ kiểm thử với quyền quản trị hệ thống, một phần các phép kiểm tra về lỗi quyền truy cập kho khoá sẽ tự động bỏ qua mà báo cáo vẫn hiện xanh, nên lỗi thật ở phần đó có thể không được phát hiện.
  file: `src/lib/settings/env-store.server.test.ts`
  severity: low
  Đề xuất: known-limits

- **PUT echoes the request map instead of what saveEnvStore actually persisted**
  Người dùng thấy gì: Sau khi lưu khoá có khoảng trắng thừa hoặc trùng tên (kể cả khoảng trắng) trong tên, phản hồi ngay lúc đó có thể không khớp với những gì thực sự nằm trên đĩa, khiến màn hình tạm thời hiển thị dữ liệu không đúng cho tới khi tải lại.
  file: `src/app/api/settings/env/route.ts`
  severity: medium
  Đề xuất: known-limits

- **Store with non-string values is reported state:"ok" and the next save silently deletes those entries**
  Người dùng thấy gì: Nếu một khoá trong kho bị lưu sai định dạng (ví dụ giá trị không phải chuỗi văn bản), màn hình sẽ hiển thị kho như bình thường mà không báo lỗi gì, nhưng lần lưu tiếp theo sẽ âm thầm xoá mất khoá đó khỏi đĩa.
  file: `src/lib/settings/env-store.server.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).