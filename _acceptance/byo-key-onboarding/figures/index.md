# Hình tại điểm quyết định — Cổng 1.5 (duyệt kế hoạch)

Kê từ `docs/superpowers/plans/2026-08-07-byo-key-onboarding.md` + 2 entry sổ quyết định giai đoạn S2 chưa niêm.

| Điểm | Đếm | Hình |
|---|---|---|
| Dòng sự kiện dựng môi trường — phát `started`+`completed` hay chỉ `completed` | 3 bước nối tiếp × 2 pha, 2 nhánh rẽ → **vượt N5** | `su-kien-dung-moi-truong.html` |
| Thứ tự và tính độc lập của 8 task | chuỗi 3 bước nối tiếp + 4 nhánh song song + 1 điểm hội tụ → **vượt N5** | `thu-tu-task.html` |
| Hook readiness dùng lại kho registry sẵn có (`d-20260807T094500Z-6127`) | 1 bước, 0 nhánh → dưới ngưỡng: 1 | — |

---

## Đề bài hình 1 — `su-kien-dung-moi-truong.html`

- Loại: sơ đồ so sánh hai phương án cạnh nhau (two-column comparison / timeline).
- Nút: ba bước thật `create-venv` → `install-sdk` → `install-requirements`, mỗi bước là một khối thời gian có độ dài (bước đầu dài nhất).
- Cột trái «Phương án A — hai pha»: mỗi bước phát `started` ở đầu khối và `completed` ở cuối khối. Dưới trục vẽ băng «màn hình nói gì»: có chữ ngay từ giây đầu.
- Cột phải «Phương án B — chỉ completed»: chỉ phát ở cuối mỗi khối. Băng «màn hình nói gì» có một khoảng TRỐNG dài từ giây 0 tới lúc bước 1 xong — đây là điểm cả hình tồn tại để cho thấy.
- Nhãn bằng chữ tiếng Việt, không dùng mã sự kiện làm nhãn chính.
- Ghi chú chân hình: bước bị bỏ qua thì không phát gì ở cả hai phương án.
- AC liên quan: AC-7 (không sự kiện nào khai việc chưa xong), AC-8 (màn hình luôn có thứ đúng-sự-thật để nói khi chờ).

## Đề bài hình 2 — `thu-tu-task.html`

- Loại: đồ thị phụ thuộc (DAG), chảy từ trái sang phải.
- Nút: 8 task, nhãn bằng chữ ngắn tiếng Việt kèm số task.
- Cạnh: chuỗi bắt buộc 1 → 2 → 3; bốn task 4, 5, 6, 7 không có cạnh vào, chạy song song với chuỗi trên; task 8 nhận cạnh từ 2, 3, 4, 5.
- Phân biệt rõ bằng thị giác: nhóm bắt buộc-tuần-tự và nhóm chạy-song-song.
- Đánh dấu task 4 là task chạm đường t3 duy nhất (`runners/generic.ts`).
- AC liên quan: toàn bộ — đây là bản đồ thi công, không phải một tiêu chí riêng.
