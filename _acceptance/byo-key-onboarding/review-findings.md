## Trong hợp đồng

- **Partial install success is reported as total failure and the registry is left stale**
  file: `src/components/workspace/first-run-strip-container.tsx:140`
  severity: medium
  AC: AC-6
  The route returns 502 whenever `result.failed.length > 0`, even if some plugins installed successfully. The client does:

  ```ts
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await refreshPluginsRegistry();
  setOverride(null);
  ```

  On a partial failure the throw skips `refreshPluginsRegistry()`, so plugins that *were* just installed remain invisible to the node pickers and to `useFirstRunReadiness` until some other code path refreshes the registry — which defeats the "no restart after install" property the feature is built around. The response body (which lists exactly what installed) is discarded and the strip claims a download failure.

- **Hình dạng 4 — assertion âm-tính-một-mình: hai nửa suppression của E9 xanh trên mảng rỗng**
  file: `src/lib/plugin-executor/provisioning-events.test.ts:80`
  severity: high
  AC: AC-7
  Test "emits NO create-venv milestone when the venv already exists" chỉ assert `expect(events.some((e) => e.step === "create-venv")).toBe(false)` (dòng 80), và test "emits no requirements milestone" chỉ assert `expect(events.some((e) => e.step === "install-requirements")).toBe(false)` (dòng 98). Không có đối chứng dương nào trong cùng lần chạy: không assert `events.length > 0`, không assert các milestone LẼ RA phải có (install-sdk / create-venv), không ghim thông điệp. Đọc src/lib/plugins/plugin-python-env.server.ts: lần gọi thứ hai rơi vào early-return cache của `ensureVenv` (`if (existsSync(py) && readMarker(pluginId, "sdk.hash") === sdkHash) return py;`, ~dòng 215) TRƯỚC mọi lệnh `onMilestone?.(...)`, và `ensurePluginRequirements` cũng return sớm vì pluginDir không có requirements.txt — nên `events` là [] theo cấu tạo, và assertion đúng một cách vô nghĩa. Tệ hơn: `ensurePluginPython` bọc toàn bộ trong try/catch và khi plugin KHÔNG khai requirements.txt thì nuốt lỗi rồi `return resolvePythonLite()` — nên một môi trường hỏng hoàn toàn (không có Python >= 3.10, thiếu thư mục resources/sdk) cũng cho events = [] và cả hai test vẫn xanh. Đây chính là nửa mà evals.yaml gọi là "SUPPRESSION half — the load-bearing one" của E9/AC-7.

- **Hình dạng 3 — assert cờ được truyền tay trong khi lời hứa là QUAN HỆ "suppression survives a reload"**
  file: `src/hooks/use-first-run-readiness.test.ts:19`
  severity: medium
  AC: AC-3
  E3 hứa: "readiness reports ready (strip suppressed) once the example has completed a run, and the suppression survives a reload". Executor duy nhất của E3 là file test này, và nó chỉ gọi hàm thuần `computeReadiness({..., exampleCompleted: true})` (dòng 19) rồi assert kết quả là null. Vế "survives a reload" là một quan hệ giữa hai file: bên GHI `localStorage.setItem(EXAMPLE_COMPLETED_KEY, "1")` (src/components/workspace/first-run-strip-container.tsx:118) và bên ĐỌC `localStorage.getItem(EXAMPLE_COMPLETED_KEY) === "1"` (src/hooks/use-first-run-readiness.ts:75). Không test nào chạm hai đầu đó — giá trị boolean được truyền tay đúng khuôn bên đọc thay vì đi vòng ghi→đọc. Kịch bản hỏng: đổi bên ghi thành `setItem(key, "true")` (hoặc bỏ hẳn effect ghi) thì mọi test vẫn xanh trong khi strip quay lại sau mỗi lần reload — đúng thứ AC-3 tồn tại để chặn.

- **Hình dạng 3 — assert lời gọi trên stub do chính test tiêm, trong khi lời hứa là quan hệ "lưu khoá ⇒ gọi ra nhà cung cấp"**
  file: `src/lib/onboarding/key-verify.test.ts:15`
  severity: medium
  AC: AC-10
  E13 hứa: "saving a key performs a real outbound verification against the thing it unlocks — asserted with a spy that the call HAPPENED". Test dòng 6-15 tự tạo `probe = vi.fn()`, truyền nó vào `verifyKey(envKey, value, probe)` rồi assert `expect(probe).toHaveBeenCalledTimes(1)` — tức chỉ chứng minh verifyKey có gọi tham số thứ ba của chính nó. Hai mắt xích thật của quan hệ không được đo ở đâu cả: (a) bảng prober mặc định `PROBES` (src/lib/onboarding/key-verify.ts:24-30, entry OPENAI_API_KEY → fetch https://api.openai.com/v1/models) không có test nào chạm — xoá entry đó thì mọi lần lưu khoá OpenAI trả về checked:false mà 5 test vẫn xanh; (b) đường LƯU (`PUT /api/settings/env` → `verifyChangedKeys` → verifyKey, src/app/api/settings/env/route.ts:25-49, 88-95) không có test nào — gỡ lời gọi verifyChangedKeys khỏi route thì E13 vẫn exit 0.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hardcoded Vietnamese UI copy bypasses next-intl in 5 new files**
  Người dùng thấy gì: Người dùng chọn ngôn ngữ khác tiếng Việt (Anh, Nhật, Hàn, Trung) vẫn thấy tiếng Việt ở toàn bộ luồng nhập khoá API và một số thông báo tiến độ cài đặt, dù phần còn lại của giao diện đã dịch đúng ngôn ngữ họ chọn.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: known-limits

- **Stray evidence/ directory committed at repo root, outside _acceptance/<slug>/evidence/**
  Người dùng thấy gì: Không ảnh hưởng trải nghiệm người dùng; đây là các tệp bằng chứng nằm sai vị trí trong mã nguồn dự án, gây lộn xộn cho người bảo trì.
  file: `evidence/E12-network.txt`
  severity: high
  Đề xuất: known-limits

- **verifyKey probe has no timeout; PUT /api/settings/env can hang indefinitely**
  Người dùng thấy gì: Nếu nhà cung cấp khoá API phản hồi chậm hoặc không phản hồi, người dùng bấm Lưu có thể phải chờ không giới hạn thời gian mà không có cách nào biết việc lưu khoá đã thất bại.
  file: `src/lib/onboarding/key-verify.ts`
  severity: high
  Đề xuất: known-limits

- **New client calls use raw fetch, bypassing src/lib/api/client.ts**
  Người dùng thấy gì: Khi nhà cung cấp khoá bị treo, ô nhập khoá tại node có thể bị kẹt vĩnh viễn ở trạng thái 'đang kiểm tra' và người dùng phải tải lại trang mới thoát ra được.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: known-limits

- **Whole-env read-modify-write from a node races the settings dialog**
  Người dùng thấy gì: Nếu người dùng mở nhiều cửa sổ cùng lúc hoặc lưu khoá từ node trong khi hộp thoại Cài đặt đang mở, một trong hai lần lưu có thể âm thầm ghi đè và làm mất khoá vừa nhập ở nơi kia.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **COPYFILE_EXCL passed as the literal 1**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp; đây là một chi tiết mã nguồn khó bảo trì, có thể gây lỗi khi sửa lại logic sao chép tệp mẫu trong tương lai.
  file: `src/lib/onboarding/seed-example-asset.server.ts`
  severity: medium
  Đề xuất: known-limits

- **install-missing route returns raw internal exception text to the client**
  Người dùng thấy gì: Khi cài plugin thất bại, thông báo lỗi hiển thị cho người dùng có thể lộ đường dẫn nội bộ của máy chủ hoặc địa chỉ kho mã nguồn, thay vì một thông báo lỗi gọn gàng.
  file: `src/app/api/plugins/install-missing/route.ts`
  severity: low
  Đề xuất: known-limits

- **example-needs-no-keys.mjs hardcodes the plugins/ directory**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối; đây là một công cụ kiểm tra nội bộ có thể báo sai kết quả khi chạy trên máy có cấu hình thư mục plugin khác mặc định.
  file: `scripts/onboarding/example-needs-no-keys.mjs`
  severity: low
  Đề xuất: known-limits

- **Key-save does a full-map replace using an unchecked GET response — can silently wipe every stored API key**
  Người dùng thấy gì: Trong một số tình huống lỗi mạng hiếm gặp khi lưu khoá, toàn bộ các khoá API khác mà người dùng đã lưu trước đó có thể bị xoá sạch mà không có cảnh báo, trong khi màn hình vẫn báo lưu thành công.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: known-limits

- **Plugin install failures are swallowed with a bare `catch {}` — cause is never logged or surfaced**
  Người dùng thấy gì: Khi cài đặt plugin thất bại, người dùng chỉ thấy thông báo chung chung mà không biết nguyên nhân thật sự (thiếu công cụ, hết dung lượng đĩa, lỗi mạng...), gây khó khăn khi cần tự khắc phục hoặc báo lỗi.
  file: `src/lib/onboarding/install-missing.server.ts`
  severity: medium
  Đề xuất: known-limits

- **`taskErrorFromSSE` treats `data.message` as an error for every SSE message, so running tasks now carry a bogus error**
  Người dùng thấy gì: Một tác vụ đang chạy bình thường đôi khi có thể bị hiển thị nhầm như thể đang gặp lỗi, dù thực chất nó chỉ đang báo tiến độ, gây nhầm lẫn cho người theo dõi tiến trình.
  file: `src/lib/task/sse-error.ts`
  severity: medium
  Đề xuất: known-limits

- **`/example.json` fetch has no rejection handler; any failure silently disables the first-run strip forever**
  Người dùng thấy gì: Nếu việc tải trước dữ liệu ví dụ gặp trục trặc mạng, dải hướng dẫn lần đầu có thể biến mất vĩnh viễn mà không có dấu hiệu hay cách khôi phục nào cho người dùng.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: medium
  Đề xuất: known-limits

- **Seeding the example asset can 500 the whole workspace page on any errno other than EEXIST/ENOENT**
  Người dùng thấy gì: Trong một số điều kiện hệ thống hiếm gặp (hết dung lượng ổ đĩa, quyền truy cập bị hạn chế), toàn bộ trang không gian làm việc có thể báo lỗi và không tải được, chỉ vì một bước chuẩn bị tài sản mẫu không quan trọng bị lỗi.
  file: `src/lib/onboarding/seed-example-asset.server.ts`
  severity: medium
  Đề xuất: known-limits

- **`EXAMPLE_COMPLETED_KEY` is set when ANY workflow completes, not the bundled example**
  Người dùng thấy gì: Người dùng tự tạo và chạy quy trình của riêng mình trước khi thử ví dụ mẫu sẽ vĩnh viễn không còn thấy dải hướng dẫn lần đầu nữa, dù họ chưa từng chạy qua ví dụ mẫu đó.
  file: `src/components/workspace/first-run-strip-container.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP trạng thái nhưng ma trận thiếu một phần tử (saved-unverified)**
  Người dùng thấy gì: Trạng thái giao diện 'đã lưu nhưng chưa xác minh' của ô nhập khoá API chưa từng được đo kiểm về độ tương phản màu và khả năng tiếp cận, nên người dùng khiếm thị hoặc dùng công cụ hỗ trợ có thể gặp khó khăn ở đúng bước này mà không ai phát hiện.
  file: `scripts/onboarding/check-a11y-proto.sh`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — assert âm tính vacuous trên mảng rỗng, không ghim nhãn dương và không chạm nhánh fallback**
  Người dùng thấy gì: Không có bằng chứng chắc chắn rằng tên hiển thị dự phòng cho một khả năng xử lý (khi plugin không đặt tên) thực sự dễ đọc đối với người dùng, vì phép kiểm tra tương ứng không thực sự đo được điều đó.
  file: `src/hooks/use-first-run-readiness.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert kiểu chuỗi của một field trong khi lời hứa là "không thực thi gì"**
  Người dùng thấy gì: Không có bằng chứng chắc chắn rằng việc đọc danh sách yêu cầu của ví dụ mẫu không âm thầm gây ra thao tác mạng hay tiến trình phụ không cần thiết, vì phép kiểm tra tương ứng không thực sự đo được điều đó.
  file: `src/lib/onboarding/example-requirements.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/21 lỗi rơi vào file không bộ đo nào phủ (evidence/E12-network.txt, scripts/onboarding/example-needs-no-keys.mjs, scripts/onboarding/check-a11y-proto.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
