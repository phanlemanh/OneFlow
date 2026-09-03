## Trong hợp đồng

- **Bề mặt node ABI thật không được truyền onRetry — thẻ chặn ở đó không có nút Thử lại**
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:373`
  severity: high
  source: conventions
  AC: AC-5
  `ReadStateNotice` chỉ render nút Thử lại khi nhận prop `onRetry`, và tài liệu của nó khẳng định «Every non-ok cell offers a way to try again is then true by construction». `NodeKeyPrompt` cũng khai `onRetry` là «Rendered in every non-ok read state». Nhưng consumer production DUY NHẤT của `NodeKeyPrompt` là `abi-node-shell.tsx:373`, và nó KHÔNG truyền `onRetry` (chỉ truyền envKey/providerName/state/labels/value/onChange/onSave). Hệ quả: trên node ABI thật, mọi state `read-failed` (unauthenticated / unavailable / store-unreadable) hiện thẻ chặn không có lối thoát nào ngoài link Mở Cài đặt — mà link đó cũng chỉ hiện ở `store-unreadable`. Với `unauthenticated`/`unavailable`, user bị kẹt trong một thẻ không có control nào.

  Lỗ này vô hình với eval vì test dựng bề mặt thay thế: `src/components/workspace/store-read-states.test.tsx:97` định nghĩa `KeyGateSurface` cục bộ và tự truyền `onRetry={() => {}}`; `store-read-states-retry.test.tsx:193` («all three surfaces carry a retry that is a live control») render thẳng `ReadStateNotice` với `onRetry` do test bơm vào; ba ca hành vi còn lại (a/b/c/d) chỉ chạy trên `SettingsDialog`. Không ca nào chạm `abi-node-shell`. Vì vậy E6/AC-6 với lời hứa «Cả ba bề mặt (3 × ca a)» (evals.yaml:109-118) đang được chứng minh bằng stand-in, không phải bằng mã ship. Sửa tối thiểu: truyền `onRetry={keyGate.save}` (hoặc một hàm đọc lại) tại chỗ mount `NodeKeyPrompt`.

  Rationale: AC-5 đòi nút Thử lại có mặt ở cả 9 ô không-ok (3 bề mặt × 3 state); bề mặt node key prompt thiếu nút này ở cả 3 ô của nó nên AC-5 thất bại.

- **AbiNodeShell never passes onRetry — the unauthenticated/unavailable node card has no controls at all**
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx:373`
  severity: high
  source: bugs
  AC: AC-5
  abi-node-shell renders `<NodeKeyPrompt envKey … onSave={keyGate.save} />` without onRetry. ReadStateNotice renders its retry button only when onRetry is truthy (`{onRetry ? <Button…> : null}`), and NodeKeyPrompt renders the 'Open Settings' child only when `state.read.state === 'store-unreadable'`. So when saveEnvKeys fails with state 'unauthenticated' or 'unavailable' (expired session, proxy 502, 30s timeout), the node shows a blocked card with ZERO interactive elements, and useNodeKeyGate exposes no reset — the only escapes from phase 'read-failed' are a fresh FAILED task via noteTask or the ONBOARDING_RECOVERY_EVENT listener. The user is stuck. This is invisible to the suite because both store-read-states.test.tsx:105 and store-unreadable-refusal.test.tsx render NodeKeyPrompt directly with a stub onRetry={() => {}}, i.e. they measure a wiring the shipping surface does not have; it also falsifies the comment in read-state-notice.tsx that 'every non-ok cell offers a way to try again' is 'true by construction'. Fix: thread a re-read/reset out of useNodeKeyGate and pass it as onRetry.

  Rationale: Cùng khuyết tật với mục trên bằng lời văn khác: bề mặt node key prompt không có nút Thử lại ở các state không-ok mà AC-5 yêu cầu.

- **Hình dạng 4 — Assertion âm-tính-một-mình: ca "a node past the ceiling" chỉ có ba not.toBe, không đối chứng dương**
  file: `src/lib/settings/env-client.timeout.test.ts:181`
  severity: high
  source: measurement
  AC: AC-4
  Ca `it("a node past the ceiling never calls the key bad")` (dòng 152-188) chỉ khẳng định `phase` KHÔNG phải "verifying" (181), KHÔNG phải "verified" (182-184), KHÔNG phải "invalid" (185-187). Không có một khẳng định dương nào về giá trị `phase` thực sự phải là (theo cài đặt hiện tại là `read-failed`, xem abi-node-shell.tsx nhánh `"readFailed" in verdict`).

  Vì sao là hình dạng đó: tập phase là {needs-key, verifying, saved-unverified, read-failed, verified, invalid}. Ba `not.toBe` loại đúng 3 giá trị; ba giá trị còn lại (kể cả `undefined`) đều xanh. Cụ thể, nếu `useNodeKeyGate` không bao giờ chạy tới `save()` — `envKeyFromFailure` thôi khớp chuỗi "missing OPENAI_API_KEY", hoặc `save()` return sớm vì `envKey === null`, hoặc wrapper NextIntl/ReactFlow làm hook không mount — thì `phase` đứng nguyên ở "needs-key" và cả ba khẳng định vẫn đạt. Phép đo báo xanh trong khi hành vi nó mang tên (một lượt đọc treo phải đáp xuống thẻ read-failed) chưa từng xảy ra.

  Rationale: Ca này đúng ra phải chứng minh phần hành vi «node key prompt với fetch treo rời phase verifying» của AC-4, nhưng chỉ loại trừ ba giá trị mà không khẳng định phase thực sự đã đổi, nên AC-4 chưa được chứng minh bằng mã ship.

- **Hình dạng 3 — Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ state → khoá catalogue → locale (bộ đo tự nạp chuỗi rồi tự tìm lại)**
  file: `src/components/workspace/store-read-states-i18n.test.tsx:41`
  severity: high
  source: measurement
  AC: AC-9
  `show()` (dòng 32-46) render `StoreUnreadableNotice` với `labels={{title: m.title, unchanged: m.unchanged}}` và một `<button type="button">{m.retry}</button>` do CHÍNH TEST dựng (dòng 41), trong đó `m = MESSAGES[locale].Settings[state]` — test tự tra catalogue. Rồi dòng 54 khẳng định `screen.getByText(m[key])`.

  Vì sao là hình dạng đó: ca `retry` khẳng định rằng một nút do test tạo có chứa chuỗi do test truyền vào — không có dòng mã sản phẩm nào tham gia. Quan hệ thật (state → khoá → chuỗi) sống ở `ReadStateNotice` (`const key = (name) => \`${shape.group}.${name}\``, `t(key("title"))`, `t(key("retry"))` — src/components/settings/read-state-notice.tsx), và component đó KHÔNG được render ở đây. Hệ quả: trỏ `unavailable` về nhóm `storeUnreadable`, hoặc ghi cứng nhãn Thử lại trong `ReadStateNotice`, cả 6 ca vẫn xanh — mâu thuẫn trực tiếp với CHIỀU ĐỎ mà E11 khai trong evals.yaml ("ghi cứng một nhãn → đỏ nêu ĐÚNG TÊN KHOÁ"). Khẳng định thứ hai (`m[key] !== MESSAGES.vi...`) chỉ so hai tệp JSON, không dính tới render. Ngoài ra E11 khai "dưới `vi` → đúng chuỗi vi.json" nhưng `show()` chỉ từng được gọi với `"en"` (dòng 52).

  Rationale: AC-9 đòi nhãn hiển thị thực sự tra đúng khoá theo state qua component sản phẩm; ca này dựng nút và chuỗi kỳ vọng ngay trong test rồi tự so khớp, không chạm component thật nên không chứng minh được AC-9.

- **Hình dạng 5 — Ma trận khai "số ca ghim hằng = 3" nhưng hằng CASES không hề được khẳng định**
  file: `src/app/api/settings/env/route.replace-premise.test.ts:20`
  severity: low
  source: measurement
  AC: AC-1
  `const CASES = 3;` (dòng 20) chỉ được nội suy vào tiêu đề `describe` (dòng 66). Không có `expect(...).toBe(CASES)` ở bất kỳ đâu, dù docstring ngay trên nó viết "The count is pinned so a collapsed matrix cannot pass for a full one" và E1 trong evals.yaml khai "Ma trận toàn phần trục A × cờ bật, số ca ghim hằng = 3".

  Vì sao là hình dạng đó: xoá hoặc comment ca "case absent" thì suite vẫn exit 0 và vẫn in tiêu đề "premise of replaceUnreadableStore (3 cases + race)" trong khi chỉ còn đo 2 trục. Các suite anh em trong cùng diff đều có chốt thật — `env-client.taxonomy.test.ts` khẳng định `TABLE.length === SIGNALS`, `store-read-states.test.tsx` khẳng định `SURFACES.length * STATES.length === CELLS`, `store-unreadable-refusal*.test.tsx` khẳng định `EXPECTED_CASES === 16` — nên chỗ thiếu chốt này là ngoại lệ so với quy ước của chính hồ sơ, không phải quy ước.

  Rationale: AC-1 dựa trên một ma trận đủ ba ca tiền đề (ok/absent/unreadable) cộng đua; hằng số khai số ca không được khẳng định nên một ca có thể bị xoá âm thầm mà bộ đo vẫn báo đủ, làm bằng chứng cho AC-1 không đáng tin.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hook chết được đổi tên thành _tStore thay vì xoá**
  Người dùng thấy gì: Không ảnh hưởng gì tới trải nghiệm hay giao diện người dùng — đây chỉ là một đăng ký đọc chuỗi ngôn ngữ dư thừa, không còn được dùng tới, còn sót lại trong bảng cấu hình thư viện media.
  file: `src/components/workspace/nodes/add/add-media-library-node.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Mã lỗi trên dây ENV_STORE_REPLACE_REFUSED viết literal hai nơi, lệch pattern của ENV_STORE_UNREADABLE**
  Người dùng thấy gì: Hiện tại thông báo lỗi vẫn hiển thị đúng, nhưng vì mã lỗi này được viết tay ở hai nơi thay vì dùng chung một nguồn, một lần gõ sai chính tả trong tương lai có thể khiến hệ thống báo nhầm kho khoá bị hỏng trong khi kho vẫn bình thường.
  file: `src/app/api/settings/env/route.ts`
  severity: low
  Đề xuất: known-limits

- **Chuỗi i18n ghim cứng «30 giây» ở 10 chỗ, tách rời DEFAULT_TIMEOUT_MS**
  Người dùng thấy gì: Nếu sau này đội kỹ thuật đổi thời gian chờ tối đa của hệ thống, các dòng thông báo nói quá 30 giây trên màn hình có thể không được cập nhật theo, khiến người dùng đọc thấy con số sai với thời gian chờ thực tế.
  file: `src/i18n/messages/en.json`
  severity: low
  Đề xuất: known-limits

- **The 30s ceiling covers only the headers, not the response body — the hang it exists to stop still hangs**
  Người dùng thấy gì: Trong một số tình huống mạng chậm — máy chủ nhận yêu cầu nhưng không trả lời xong dữ liệu — màn hình vẫn có thể bị treo vô thời hạn thay vì tự động báo lỗi sau khoảng 30 giây như kỳ vọng.
  file: `src/lib/settings/env-client.ts`
  severity: medium
  Đề xuất: known-limits

- **401 on the write path is not classified and never fires the sign-in seam**
  Người dùng thấy gì: Nếu phiên đăng nhập hết hạn đúng lúc người dùng bấm lưu khoá, hệ thống sẽ chỉ báo lưu không thành công một cách chung chung, thay vì mời người dùng đăng nhập lại như khi đọc dữ liệu bị hết phiên.
  file: `src/lib/settings/env-client.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Ca "can cancel the event" đo cờ DOM do listener của chính test đặt, không đo quan hệ notifyUnauthorized → chặn thông báo**
  Người dùng thấy gì: Không có tác động trực tiếp nào tới người dùng ngay lúc này — đây là một khoảng hở trong cách đo kiểm nội bộ khiến đội kỹ thuật khó phát hiện sớm nếu sau này giao diện vô tình hiện thêm một thông báo lỗi trùng lặp khi phiên đăng nhập hết hạn.
  file: `src/lib/settings/env-client.seam.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
