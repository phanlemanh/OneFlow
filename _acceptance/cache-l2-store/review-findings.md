## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **engineOptionsFor lets assetOptions silently override tenant/data_dir, contradicting its own stated invariant**
  Người dùng thấy gì: If a future change happens to name one of its internal settings 'tenant' or 'data_dir', it could silently override which customer or storage location a request is scoped to, and nothing today would catch that happening.
  file: `src/lib/task/engine-delegate.server.ts`
  severity: medium
  Đề xuất: known-limits

- **NodeCache.get/put swallow every exception with zero diagnostics**
  Người dùng thấy gì: When the cache storage is broken (for example after a permissions change), the app keeps working normally, but nobody is told the cache stopped working — a persistently broken cache looks identical to a normal slow run, so the problem can go unnoticed indefinitely.
  file: `sdk/tongflow/engine/node_cache.py`
  severity: low
  Đề xuất: known-limits

- **plugin_is_dirty fails open when `git status` exits non-zero, enabling stale cache entries under a clean rev**
  Người dùng thấy gì: In a rare situation where the app can't fully check whether a plugin's code was edited, it may wrongly treat the plugin as unchanged — so after that plugin is updated, the app could keep quietly serving results computed with the old version.
  file: `sdk/tongflow/engine/node_cache.py`
  severity: medium
  Đề xuất: known-limits

- **Stale L2 contract comment: `node_cached` event is declared as emitted by L2 but never emitted**
  Người dùng thấy gì: An internal engineering note describes a cache-hit signal that the software doesn't actually send; anything built expecting that signal would wait for it forever, though this doesn't change what end users see or experience today.
  file: `sdk/tongflow/engine/runner.py`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
