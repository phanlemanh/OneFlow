# Review Findings: hai-duong-chay-mot-venv (round 2)

## Trong hợp đồng

(Không có finding nào khớp một AC cụ thể trong vòng này — toàn bộ finding còn sống đều nằm ngoài phạm vi đã duyệt ở Cổng 1.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **New pinning guard pair is not wired into ci.yml — it only runs when someone types it**
  Người dùng thấy gì: The new check that stops the two runtimes' file paths from silently drifting apart does not run automatically on new changes — it only catches a problem if someone remembers to run it by hand, so a future change could quietly break this feature again.
  file: `scripts/plugins/check-venv-layout-pinned.sh:1`
  severity: high
  Đề xuất: known-limits

- **The cross-runtime layout fixture pins nothing — neither side compares the id → directory mapping**
  Người dùng thấy gì: The automated test meant to prove the two halves of the app agree on where each plugin's files live doesn't actually check that agreement — so a future change that breaks this connection could ship without any test catching it.
  file: `src/lib/plugins/plugin-python-env.test.ts:176`
  severity: high
  Đề xuất: known-limits

- **The two runtimes write the same venv but use different cache-marker names, so neither sees the other's work**
  Người dùng thấy gì: The two parts of the app that share one setup folder per plugin don't recognize each other's completed setup work, so they may keep redoing it — or, less visibly, one side could silently overwrite the other's version with no warning shown to you.
  file: `sdk/tongflow/engine/plugins.py:258`
  severity: medium
  Đề xuất: known-limits

- **Per-plugin serialization is now in-process only, while two processes provision the same venv**
  Người dùng thấy gì: If both parts of the app happen to prepare the same plugin at the exact same time, they can corrupt each other's setup work with no error message, and that plugin could stop working until it's reset.
  file: `sdk/tongflow/engine/plugins.py:250`
  severity: medium
  Đề xuất: known-limits

- **Module docstring and section header still describe the removed shared-venv model**
  Người dùng thấy gì: An internal note describing how this part of the app is organized was not updated after the design changed. This does not affect what you see or use, but could confuse whoever works on it next.
  file: `sdk/tongflow/engine/plugins.py:4`
  severity: low
  Đề xuất: known-limits

- **Cả hai runtime chỉ dùng chung một venv root khi scope rỗng — bản cloud vẫn tách đôi, và guard mới không thấy được**
  Người dùng thấy gì: In a multi-user cloud setup, the two parts of the app that are supposed to share one setup folder per plugin actually end up writing to two separate folders — so this fix doesn't fully apply there, and each user could end up with duplicate, wasted setup work.
  file: `sdk/tongflow/engine/plugins.py:108`
  severity: medium
  Đề xuất: new-contract

- **Guard ghim bố cục venv (và răng của nó) không được nối vào CI — sau khi ký, drift không có gì bắt**
  Người dùng thấy gì: The new check that stops the two runtimes' file paths from silently drifting apart does not run automatically on new changes — it only catches a problem if someone remembers to run it by hand, so a future change could quietly break this feature again.
  file: `scripts/plugins/check-venv-layout-pinned.sh:1`
  severity: medium
  Đề xuất: known-limits

- **Hai runtime dùng chung một venv nhưng marker cache rời nhau — mỗi bên đè SDK bên kia tưởng đang có (đã ghi ở review-findings, nhắc lại để không rơi)**
  Người dùng thấy gì: The two parts of the app that share one setup folder per plugin don't recognize each other's completed setup work, so they may keep redoing it — or, less visibly, one side could silently overwrite the other's version with no warning shown to you.
  file: `sdk/tongflow/engine/plugins.py:249`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: ô đo E3b chạy một ca mà hàm dưới đo tự thoát sớm, không đối chứng dương trong cùng lệnh**
  Người dùng thấy gì: The automated check meant to confirm that old, no-longer-needed setup files get cleaned up properly doesn't actually verify the cleanup happens — it would still pass even if that cleanup code were deleted entirely, so a real regression here could ship undetected.
  file: `src/lib/plugins/plugin-python-env.test.ts:205`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).