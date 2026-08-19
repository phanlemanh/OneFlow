## Trong hợp đồng

- **Recovery buttons dispatch an event no code listens to**
  file: `src/components/workspace/task-failure-toaster.tsx:25`
  severity: high
  AC: AC-11
  detail: recoveryControl() renders a button ('Cài plugin <id>' / 'Nhập khoá <key>') whose onClick calls emitRecovery(), dispatching ONBOARDING_RECOVERY_EVENT — and then the toast dismisses itself. `grep -rn ONBOARDING_RECOVERY_EVENT src` shows the toaster is the ONLY file referencing the event: neither the plugin manager nor the node key prompt registers a listener, despite the module's own doc comment claiming 'the surface that owns the destination listens for it'. Clicking the recovery control therefore does nothing except close the toast — exactly the 'looks like help and ends somewhere useless' outcome that src/lib/onboarding/failure-actions.ts's header says must never ship, and it defeats the branch's own AC ('match the recovery action to the failure cause', commit 77d65ee).
  source: conventions

- **A key with no prober is reported to the user as invalid**
  file: `src/lib/onboarding/key-verify.ts:27`
  severity: medium
  AC: AC-10
  detail: verifyKey returns { works: false, detail: 'Chưa kiểm tra được khoá... (no prober)' } for every env key not in PROBES — and PROBES contains only OPENAI_API_KEY. useNodeKeyGate in abi-node-shell.tsx maps any works:false verdict to the 'invalid' phase, so saving a perfectly valid key for any other provider (any *_API_KEY a plugin declares) shows 'Khoá chưa dùng được' with aria-invalid and destructive styling, even though the key was saved and will work at run time. 'Could not verify' and 'provider rejected' are different verdicts; conflating them produces a false negative that contradicts the feature's own AC-10 rationale ('saved has to mean usable') in the opposite direction — usable now reads as unusable.
  source: conventions

- **Recovery button on failure toast dispatches an event with no listener, then dismisses the toast**
  file: `src/components/workspace/task-failure-toaster.tsx:21`
  severity: high
  AC: AC-11
  detail: recoveryControl() wires the toast's action to emitRecovery(), which dispatches ONBOARDING_RECOVERY_EVENT ("onboarding-recovery-action") on window. A repo-wide grep finds zero addEventListener for this event or its string literal — the doc comment says "the plugin manager listens for install-plugin, the node's key prompt for enter-key", but neither listener exists. Worse, error-toast.tsx's action handler calls toast.dismiss(toastId) right after onClick, so pressing "Cài plugin …" / "Nhập khoá …" silently does nothing AND permanently removes the error message (toasts have Infinity duration and are deduped by task id, so it will not reappear). The user takes the offered recovery exit and ends up with no plugin manager, no key form, and no error.
  source: bugs

- **Valid keys for any provider without a prober are reported as "invalid" by the node key prompt**
  file: `src/lib/onboarding/key-verify.ts:29`
  severity: high
  AC: AC-10
  detail: verifyKey() returns { works: false, detail: "… (no prober)" } when PROBES has no entry for the env key — and PROBES contains only OPENAI_API_KEY. The sole consumer (abi-node-shell.tsx save(), via PUT /api/settings/env verdicts) maps works:false straight to phase "invalid" ("Khoá chưa dùng được"). The gate's own trigger patterns (ENV_KEY_PATTERN matches *_API_KEY/*_KEY/*_TOKEN/*_SECRET; failure-actions.ts explicitly recognises "Set ANTHROPIC_API_KEY in Settings") produce prompts for many non-OpenAI keys, so in nearly every flow except OpenAI a user who pastes a correct key is told it does not work — even though it was saved and the next run would succeed. "Could not verify" is conflated with "provider rejected"; the KeyVerdict type has no unknown/unverifiable state.
  source: bugs

- **Re-saving an unchanged key value yields no verdict, which the UI renders as "invalid"**
  file: `src/app/api/settings/env/route.ts:35`
  severity: high
  AC: AC-10
  detail: verifyChangedKeys() only probes keys where next[key] !== previous[key]. If the user retries with the exact value already stored (e.g. after a transient network error left the prompt in "invalid", or they paste the same key twice), the PUT returns no verdict for that key. abi-node-shell.tsx:108 maps the missing verdict to { works:false, detail:"Máy chủ không trả về kết quả kiểm tra khoá." } → phase "invalid". So even a correct OPENAI_API_KEY that was already saved can never be shown as verified on retry — the prompt is stuck reporting failure for a working key.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hardcoded Vietnamese UI strings bypass the repo's next-intl i18n system**
  Người dùng thấy gì: People using the app in English, Japanese, Korean, or Chinese will still see some error and label text show up in Vietnamese instead of their own language.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: high
  Đề xuất: known-limits

- **key-verify.ts does secret-bearing network I/O without the .server.ts convention**
  Người dùng thấy gì: There is a risk that a future change could accidentally cause a user's saved key to be sent out from their own browser rather than checked only from the server, which could expose the key.
  file: `src/lib/onboarding/key-verify.ts`
  severity: medium
  Đề xuất: known-limits

- **saveAndVerifyKey read-modify-writes the entire env map without concurrency protection**
  Người dùng thấy gì: If a user saves two different keys at almost the same time, one of the saved keys can silently vanish.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: low
  Đề xuất: known-limits

- **example.json fetch rejection is unhandled**
  Người dùng thấy gì: If the starter example can't be loaded, such as on first launch with no network, the first-run guidance just fails to appear with nothing shown to explain why.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: low
  Đề xuất: known-limits

- **saveAndVerifyKey ignores GET failure and can silently wipe every other stored env key**
  Người dùng thấy gì: If loading the current settings fails at just the wrong moment, saving one key can silently erase every other key the user had already set up.
  file: `src/components/workspace/nodes/base/abi-node-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **installMissingForExample swallows the install error entirely — cause is neither logged nor returned**
  Người dùng thấy gì: When the one-click example setup fails, there is no record anywhere of why it failed, making it hard for anyone to help the user recover.
  file: `src/lib/onboarding/install-missing.server.ts`
  severity: medium
  Đề xuất: known-limits

- **example.json fetch chain has no rejection handler — unhandled promise rejection, strip silently absent**
  Người dùng thấy gì: If the starter example can't be loaded, the first-run guidance just silently fails to appear, with no indication to the user or anyone helping them why it's missing.
  file: `src/hooks/use-first-run-readiness.ts`
  severity: low
  Đề xuất: known-limits

- **Key verification probes have no timeout — a hung provider stalls every env-settings save**
  Người dùng thấy gì: If the key-checking service is slow or unreachable, saving any API key can hang indefinitely with no way to cancel or get feedback.
  file: `src/lib/onboarding/key-verify.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 2 — Fixture viết tay đúng khuôn bên đọc, không round-trip từ writer: hai chuỗi lỗi không tồn tại producer nào**
  Người dùng thấy gì: The automated check meant to prove failure messages get routed to the right recovery action was written to match itself rather than real failure messages, so a real mismatch could ship without being caught.
  file: `src/lib/onboarding/failure-actions.test.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 4 — Assertion âm-tính-một-mình: executor E17 không bao giờ chạy nửa RED (teeth fixture chết)**
  Người dùng thấy gì: The automatic safeguard meant to catch any future leak of usage-tracking data to a server has never actually been proven to work, so such a leak could happen without being caught.
  file: `scripts/onboarding/check-no-telemetry-sinks.sh`
  severity: high
  Đề xuất: known-limits

- **Shape 4 — Assertion âm-tính-một-mình: test fallback label chỉ phủ định prefix, không ghim nhãn dương**
  Người dùng thấy gì: The check on the fallback plugin name shown to users doesn't confirm that name is actually readable text, so a broken or blank label could pass unnoticed.
  file: `src/hooks/use-first-run-readiness.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 — Assert thứ tự chuỗi sự kiện trong khi lời hứa là QUAN HỆ milestone ↔ công việc đã hoàn thành**
  Người dùng thấy gì: The check on setup-progress messages only confirms they appear in the right order, not that each one is announced only after the real work it describes has actually finished.
  file: `src/lib/plugin-executor/provisioning-events.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 — Quét a11y âm-tính không có đối chứng dương rằng component đo có mặt trên trang**
  Người dùng thấy gì: The accessibility check that is supposed to scan the onboarding screens doesn't confirm those screens actually appear on the page being scanned, so a broken or blank page could still be reported as passing.
  file: `scripts/onboarding/check-a11y-proto.sh`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

⚠ Cụm ngoài vùng phủ: 2/18 lỗi rơi vào file không bộ đo nào phủ (scripts/onboarding/check-no-telemetry-sinks.sh, scripts/onboarding/check-a11y-proto.sh) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
