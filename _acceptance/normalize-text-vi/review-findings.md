## Trong hợp đồng

### Ambiguity guard matches only space/tab while the currency rewrite matches any whitespace — addresses are silently spoken as prices with ok=True
file: `sdk/tongflow/text/normalize_vi.py:150`
severity: high
AC: AC-6
detail: `_AMBIGUOUS_D` anchors on `[ \t]*` / `[ \t]+`, but the two rules it is supposed to veto — `_SPACED_DONG` (`(?<=\d)\s+(?i:đ)\b`) and `_MONEY` (`(?<=\d)\s*(?i:đ)\b`) — use `\s`. Any separator that is not a plain space or tab therefore fires the money rewrite while the refusal never triggers.

Measured on this branch (regex layer, stub normalizer):
```
'Số 5 Đ.\nLê Lợi'   -> pre='Số 5 đồng.\nLê Lợi'   ambig=False, has_money=True
'Số 5 Đ.\xa0Lê Lợi' -> pre='Số 5 đồng.\xa0Lê Lợi' ambig=False, has_money=True
'Số 5 Đ.Lê Lợi'     -> pre='Số 5 đồng.Lê Lợi'     ambig=False, has_money=True
'Nhà 12 Đ\xa0Trần Phú' -> pre='Nhà 12 đồng\xa0Trần Phú' ambig=False
```
versus the covered form `'Số 5 Đ. Lê Lợi'` -> `ambig=True` (correctly refused).

Downstream both guards stay green exactly as the module comment describes: no digit survives the library pass so `_RESIDUAL` is empty, and the money-loss relation finds the very "đồng" the rewrite just injected, so it confirms itself. Result is `ok=True` on a street address read aloud as a price — the defect class this whole rule family exists to close.

The leaking inputs are the same two rows `CORPUS_AMBIGUOUS_D` pins ("Số 5 Đ. Lê Lợi", "Nhà 12 Đ Trần Phú"), only with a newline, NBSP, or no space instead of a plain space. Multi-line scripts and NBSP-bearing copy-pasted web copy are ordinary input for a TTS node. This is not covered by contract.md's Known limits.

Fix: make the separator class in `_AMBIGUOUS_D` the same one the rewrite uses (`\s`, and allow zero-width for the glued case), or make all three rules share one separator constant the way `_MAGNITUDE_WORDS` is shared.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **has_money() docstring documents an address-abbreviation strip that no longer exists**
  Người dùng thấy gì: Một ghi chú kỹ thuật trong mã mô tả sai một bước xử lý đã bị xoá; người dùng không thấy khác biệt trong kết quả đọc số hôm nay, nhưng một người phát triển sau này có thể tin nhầm vào một đảm bảo không có thật và bỏ sót lỗi thật.
  file: `sdk/tongflow/text/normalize_vi.py:239`
  severity: medium
  Đề xuất: known-limits

- **24-line rationale JSDoc in exporter.ts is orphaned onto MUSIC_SLOTS**
  Người dùng thấy gì: Một đoạn giải thích dài về lý do cảnh báo hoạt động như hiện tại bị gắn nhầm chỗ trong mã nguồn, khiến người bảo trì sau này khó tìm thấy nó khi cần sửa cảnh báo liên quan; không ảnh hưởng đến trải nghiệm người dùng hiện tại.
  file: `src/lib/workflow/exporter.ts:52`
  severity: medium
  Đề xuất: known-limits

- **Manifest guard comments contradict the post-withdrawal state they were re-cut for**
  Người dùng thấy gì: Chú thích trong công cụ kiểm tra nội bộ ghi sai số liệu so với thực tế sau khi một plugin bị rút khỏi danh sách chính thức; không ảnh hưởng gì tới người dùng sản phẩm, chỉ có thể gây nhầm lẫn cho người bảo trì sau này.
  file: `scripts/plugins/check-manifest-guard-teeth.sh:54`
  severity: low
  Đề xuất: known-limits

- **has_money() docstring documents an address-stripping step the function does not perform**
  Người dùng thấy gì: Một ghi chú kỹ thuật mô tả sai bước xử lý địa chỉ bên trong mã; trường hợp cụ thể được nêu vẫn đang bị từ chối đúng như mong đợi nên người dùng chưa bị ảnh hưởng, nhưng ghi chú sai có thể khiến người sau lầm tưởng vấn đề đã được xử lý toàn diện khi thực ra chưa.
  file: `sdk/tongflow/text/normalize_vi.py:239`
  severity: medium
  Đề xuất: known-limits

- **reader_pin() cannot parse a tab-separated pin its own regex accepts — guard and plugin test run die with exit 2**
  Người dùng thấy gì: Một công cụ kiểm tra nội bộ dùng lúc phát hành có thể báo lỗi nếu tệp cấu hình dùng ký tự tab thay vì dấu cách quanh phiên bản thư viện đã ghim; đây là sự cố trong quy trình phát triển/phát hành, không phải điều người dùng cuối gặp phải khi dùng tính năng đọc số.
  file: `scripts/lib/sdk-version.sh:105`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture conformance viết tay đúng khuôn bên đọc, không round-trip từ exporter**
  Người dùng thấy gì: Bài kiểm tra so sánh hai đường xử lý (giao diện và máy chủ) đang dùng dữ liệu mẫu viết sẵn thay vì lấy trực tiếp từ luồng xuất thật; điều này đã được ghi nhận là giới hạn đã biết — một thay đổi sai ở khâu xuất workflow trong tương lai có thể không bị bài kiểm này phát hiện, dù tính năng vẫn hoạt động đúng hôm nay.
  file: `sdk/tests/conformance/fixtures/normalize-text-vi.json:9`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — CORPUS_AMBIGUOUS_D tuyên LỚP nhưng chỉ có điểm-case, không ma trận viết-trước**
  Người dùng thấy gì: Bộ ví dụ kiểm tra cho tình huống địa chỉ/giá dễ nhầm lẫn được chọn thủ công thay vì phủ đầy đủ theo hệ thống; điều này không làm sai kết quả hôm nay nhưng nghĩa là một biến thể mới của tình huống nhầm lẫn này có thể lọt qua mà không có bài kiểm nào bắt được.
  file: `sdk/tests/test_normalize_vi.py:311`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — E18 khai quét LỚP 13 khoá, executor chỉ với tới 9**
  Người dùng thấy gì: Tài liệu nội bộ mô tả phạm vi kiểm tra an toàn lớn hơn thực tế công cụ đang chạy; công cụ vẫn đang kiểm đúng những cấu hình quan trọng theo đúng con số đã được xác nhận là chính xác, đây chỉ là sai lệch trong ghi chép nội bộ, không ảnh hưởng người dùng.
  file: `_acceptance/normalize-text-vi/evals.yaml:185`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có — không có finding nào với unverified=true trong round này)

⚠ Cụm ngoài vùng phủ: 2/9 lỗi rơi vào file không bộ đo nào phủ (scripts/lib/sdk-version.sh, _acceptance/normalize-text-vi/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.