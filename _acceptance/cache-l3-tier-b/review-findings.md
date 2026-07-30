# Review findings — cache-l3-tier-b (S4 round 1, PASS)

## Trong hợp đồng

Không có. 15/15 eval PASS ngay vòng 1; 0 finding nào bị quy về một tiêu chí đã ký (`inContract: false` cho cả hai).

## Ngoài hợp đồng — người quyết ở Gate 2

Hai finding low, đều là quy ước nội bộ chứ không phải hành vi cache; scope-triage đề xuất Known limits cho cả hai.

- **`test_node_cache.py` vượt trần 800 dòng của quy ước code-style (1101 dòng)**
  Người dùng thấy gì: Không đổi bất kỳ hành vi cache nào bạn dựa vào; chỉ làm file test dài hơn ngưỡng nội bộ của team, có thể khiến kỹ sư bảo trì sau này chậm hơn một chút. Bộ test tầng B tự chứa (fixture riêng) nên tách sang `test_node_cache_tier_b.py` là sạch — nhưng 15 executor key trong `_acceptance/config.yaml` ghim pytest node-id theo path, tách là phải sửa key cùng commit, nên hoãn sang L4 thay vì đổi bằng chứng sau khi verify.
  file: `sdk/tests/test_node_cache.py`
  severity: low
  Đề xuất: known-limits

- **Comment của `DESCOPED_GENERATIVE_SLOTS` nói "ABI drift guard nằm bên dưới" nhưng guard thật nằm trong test suite**
  Người dùng thấy gì: Một comment nội bộ trỏ sai chỗ; không ảnh hưởng hành vi nào, chỉ có thể làm người đọc code sau này mất vài phút. Guard tự nó tồn tại và xanh (`test_tier_lists_are_disjoint_and_pinned`); sửa một dòng comment sau khi verify sẽ làm bằng chứng stale nên ghi lại đây, sửa ở lát kế.
  file: `sdk/tongflow/engine/node_cache.py`
  severity: low
  Đề xuất: known-limits
