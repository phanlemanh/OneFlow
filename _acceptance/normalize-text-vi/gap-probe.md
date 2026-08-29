---
slug: normalize-text-vi
at: 2026-08-19T14:52:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

# Phản biện context sạch — normalize-text-vi

Một lượt, context sạch, chỉ đọc 4 artifact + bài học xuyên feature (claim-scan). Người phản
biện không đọc mã repo — mã của tính năng này chưa tồn tại. Cả 5 finding đều **đã sửa
artifact ngay**, không finding nào đẩy sang `human-gate1`.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Không AC nào đo **vỏ plugin** — cùng lớp lỗi `[cache-l4-eviction#F1]` (hàm đúng, quên chỗ gọi). Coverage sót hẳn trục "ai thực thi slot" | Hàm SDK hoàn hảo, corpus xanh 100%; vỏ viết `return NormalizeTextViOutput(success=True, text=input.text)` — quên gọi hàm. E11a dùng fake plugin nên không chạm vỏ thật, E12a chỉ so shape input. Cả 24 eval xanh, TTS vẫn đọc sai giá | AC mới + cặp eval gọi slot method thật qua `@node_slot`, so với hằng số corpus dùng chung, kèm spy chứng minh hàm SDK được gọi đúng một lần | **fixed:** gộp AC-13+AC-14 cũ thành AC-13 (đăng ký + release train) để lấy chỗ; **AC-14 mới** = round-trip vỏ plugin; thêm E17a/E17b + 2 khoá executor; Coverage thêm trục "ai thực thi slot" |
| P0 | evals | E2/E3/E4 tuyên quét cả một LỚP biến thể đọc tiếng Việt nhưng không ma trận toàn phần, không ghim số phần tử corpus, không chặn corpus được dán từ output thư viện — `[scan-with-block-imports#F1]`, `[byo-key-onboarding#F2]` | Implementer chạy thư viện trên 8 chuỗi rồi dán kết quả làm kỳ vọng; "mốt" chỉ có ở `21`, "lăm" chỉ ở `15`. Thư viện đọc `41` → "bốn mươi một" và `125.000` → "…hai mươi năm nghìn" — sai đúng cái Gate G1 gọi là sai số giá. E2 xanh vì corpus không có hai ô đó | Ma trận toàn phần khai trước: {linh, lẻ, mốt, lăm, mươi/mười} × {chục 20..90, trăm, nghìn, triệu, tỷ}; `len(CORPUS) == literal`; ô trống → đỏ kèm tên ô | **fixed:** AC-2 viết lại quanh ma trận toàn phần; E2/E3/E4 đổi `expected` sang ma trận + literal count + chiều đỏ nêu tên ô |
| P1 | contract | AC-10 đóng băng "họ TTS" thành 4 slot, không có đối chiếu hai chiều với ABI — trong khi chính hồ sơ này đã dùng khuôn hai chiều cho `TIER_A_SLOTS` (E11b) | Hạng mục 1.4 thêm slot TTS ElevenLabs vào ABI. Guard không biết slot mới → workflow ElevenLabs thiếu normalize vẫn export trót lọt, audio giao khách đọc sai giá. E10a/E10b vẫn xanh vì chúng kiểm đúng 4 slot cũ | E10c derive tập họ-TTS từ ABI theo tiêu chí khai ở design §5, assert hai chiều với hằng số trong guard; chiều đỏ nêu tên slot chưa khai | **fixed:** AC-10 thêm mệnh đề hai chiều + mệnh đề đối chứng âm workflow nhạc; thêm E10c + khoá `unit_tts_family_matches_abi` |
| P1 | contract | AC-14 cũ đòi "đã publish lên PyPI" + "repo plugin đã pin" — hai sự kiện ngoài cây mã, cần mạng và credential — mà không khai tiền đề nào; đúng loại đã tiêu một vòng verify ở `[d-20260819T094531Z-18612]` | S4 chạy trước khi publish (publish là hành động người, không đảo ngược). Eval đỏ vì hạ tầng; hồ sơ trông như trượt nghiệm thu dù mọi thứ trong kho đúng. Người ký Cổng 1 mà không thấy tiền đề là ký một hợp đồng không thể xanh trong một vòng | Tách `E14a` ngoại tuyến (version khớp, pin chính xác, số derive từ pyproject, ROOT suy từ vị trí script) + `E14b` trực tuyến; khai tiền đề trong Context | **fixed:** Context thêm mục "Tiền đề của vòng verify"; E14 → E14a/E14b + 2 khoá executor; trình tự đúng ghi rõ: Cổng 2 ký → publish → chạy lại E14b |
| P2 | contract | AC-8 gom NFC/NFD + emoji/URL + chuỗi dài vào một mệnh đề "theo chính sách khai trong corpus" — chính sách đó chưa tồn tại, nên tiêu chí tự tham chiếu. Dạng Unicode là nửa "không lỗi dấu" của Gate G1 và không có chốt | Chuỗi vào ở dạng NFD (copy từ web/macOS). Từ điển khớp `TP.HCM` nhưng trượt `P.Bến Nghé`; đầu ra lẫn hai dạng. Fixture gõ trong cùng môi trường nên cũng NFD → so-từng-ký-tự vẫn xanh; AC-6 chỉ cấm chữ số nên cũng xanh; TTS đọc lỗi dấu | AC-8 chốt "đầu ra luôn NFC"; E8 thêm hai assert QUAN HỆ: `is_normalized('NFC', out)` toàn corpus, và `normalize(NFD(x)) == normalize(NFC(x))` byte-identical | **fixed:** AC-8 viết lại với chốt NFC + ngưỡng "≥ 10.000 ký tự" thay cho "rất dài"; E8 thêm hai assert quan hệ + chiều đỏ |

## Cross-check của người phản biện (tóm tắt)

- **(a)** Không AC nào thiếu eval, không eval nào mồ côi. Bắt được số đếm ở dòng comment đầu
  `evals.yaml` lệch thực tế — đã sửa (nay 26 eval).
- **(b)** Hai mệnh đề không đo được đã bị siết: "chính sách khai trong corpus" (→ chốt NFC),
  "chuỗi rất dài" (→ ngưỡng 10.000 ký tự).
- **(c)** Bốn trục Coverage phủ đủ; **sót hẳn một trục** — "ai thực thi slot" — đã thêm.
- **(d)** Ba tiêu chí `(cross-layer)` đặt nhãn đúng vị trí (sau dấu hai chấm) và đều có cặp
  eval với nửa `layer: backend-effect`; nay là bốn (AC-14 mới cũng cross-layer).
- **(e)** Hợp đồng theo đúng khuôn `compose-overlay` đã ship; các chokepoint CLAUDE.md đều
  đã nạp. Một quy định **không** ghim ở AC nào: ràng buộc id plugin
  `^(one|tong)flow-(modal|api)-<name>$` — người phản biện đánh giá rủi ro thấp vì
  `oneflow-api-normalize-text-vi` hợp lệ, không nâng thành finding. **Giữ nguyên đánh giá đó.**
- **(f)** Lớp đo-lường: sau khi sửa, không còn assertion âm tính đứng một mình (E6a/E6b,
  E10a/E10b, E11a/E11b, E17a/E17b đều thành cặp), không còn eval tuyên-quét-lớp mà thiếu ma
  trận, và hai script guard mới đã bị ghim yêu cầu **ROOT suy từ vị trí script** thay vì cwd
  (`[scan-with-block-imports#F2]`).

*Một lượt, không re-probe (luật one-pass) — phần mã còn ba round S4 để bắt.*
