# Pilot dây chuyền N=2 — đợt 3 đo M1/M2 của Acceptance Gate Kit, chạy trên OneFlow

*2026-08-19 · Trạng thái: **CHỜ 3 CHỮ KÝ CỦA OWNER** (mục §5). Đây là spec
thử nghiệm vận hành, không phải feature — không mở hồ sơ `_acceptance/` riêng;
kết quả ghi vào STATUS.md + một findings gửi về kit. Nguồn:
kit `docs/research/2026-08-13-doi-chieu-graph-engineering-mo-nhieu-vong-song-song.md`
(khuôn + ngưỡng khai trước) · kit `docs/findings/2026-08-19-so-do-van-hanh-n2-oneflow.md`
(số baseline) · kit `docs/research/2026-08-19-anthropic-nen-song-song-doi-chieu-phan-quyet.md`
(tính năng nền, trạng thái thật).*

## 1 · Đề bài và vì sao N=2, không phải 3

Ý định owner: tăng tốc ra sản phẩm bằng nhiều feature-loop đồng thời. Kit đã
khai ngưỡng **trước khi thấy số** (13/08): *đo M1 trên 2 vòng thật — M1 ≤ 2
thì mới tăng N*. Điều kiện vào của chính kit đã thoả (đợt 2 `veto-co-dau-vet`
signed-off 14/08; OneFlow chạy kit 2.2.0). Bản nháp đầu của pilot đề xuất 3
làn — **sửa về 2** để tôn trọng ngưỡng đã khai: làn thứ ba chỉ mở khi M1 của
lần đo này ≤ 2.

## 2 · Hai làn của lần đo

| Làn | Feature | Vì sao ghép được |
|---|---|---|
| Nặng | **1.3 `normalize-text-vi`** — ABI + SDK 0.2.19 + plugin + node | Một mình trên tàu ABI; là hạng mục ưu tiên 1 của roadmap |
| Nhẹ | **1.3b node nạp-từ-kho** (ADR-0012 giai đoạn A) | Không ABI, file mới `nodes/add/` — paths rời hoàn toàn với 1.3 |

Làn 3 dự bị (mở khi M1 ≤ 2): nợ i18n form key của `byo-key-onboarding`.
Hàng sau: S3 (chờ 1.3 publish SDK — tiền đề TWINE, xem §4) · nợ 0/N · 0.8.

## 3 · Luật vận hành trong lần đo (v2)

1. **WIP = 2**, mỗi loop một phiên + worktree riêng, đề bài tự-đủ.
2. **Phân vùng khai trước** (nghi thức đã cho 0 va chạm ngày 19/08): mỗi làn
   khai file-paths · cổng mạng · nhu cầu CPU **trước khi chạm cây**, trao đổi
   qua SendMessage; đụng vùng ngoài khai = dừng và đàm phán, không tự chạm.
3. **Token S4 duy nhất, cưỡng chế bằng máy**: lockfile có thời hạn + hook
   `PreToolUse` chặn lệnh chạy eval khi chưa cầm lock — không thoả thuận mồm.
   (Lý do: 3 vòng đỏ-oan-vì-tải ngày 19/08; M1 phải đo chi phí người, không
   đo nhiễu tải.)
4. **Token S5 duy nhất**: merge nối đuôi; **kẻ merge sau rebase + tự chạy
   re-pin carry-forward**; thứ tự merge = thứ tự hoàn thành (hợp lệ vì paths
   rời).
5. **Kẻ chạm serializer đi một mình trong khúc của nó**: tàu ABI/SDK (1.3),
   guard manifest, `t1_skip_globs`/`config.yaml`.
6. **Cửa sổ ký**: owner ký theo lần ngồi, ≤ 3 cổng/lần; hàng chờ ký > 3 thì
   không mở loop mới (WIP co theo hàng chờ, không phải hằng số).
7. **Làn vỡ thì park**: nhả token + nhả serializer, giữ nhánh, không tính vào
   WIP; phá-phân-vùng phải đàm phán lại, có vết.
8. **Trần 4 ngày/loop** — quá thì cắt lát (tiền lệ: cache L0→L4).

## 4 · Tiền đề vận hành — làm TRƯỚC giờ nổ máy

- [ ] **Khôi phục TWINE credentials** trong `.env` (đang comment; `tong-io`
  là account riêng) — thiếu là S3 và mọi thứ sau 1.3 đứng hình.
- [ ] **G0-⓪: ký ngưỡng số** ([g0-runbook §0](../../measure/g0-runbook.md),
  ~30′) — để tăng tốc *sản phẩm*, không chỉ tăng tốc nhà máy.
- [ ] Dựng lockfile + hook `PreToolUse` cho token S4 (≤ 1 giờ, thử được chiều
  đỏ: lệnh eval bị chặn khi lock vắng).

## 5 · Vạch ký trước — owner ký TRƯỚC khi chạy, không chỉnh sau

| # | Vạch | Ngưỡng |
|---|---|---|
| V1 | **M1** — số lần chặn owner mỗi vòng (thước của kit, đã khai 13/08) | **≤ 2** thì mới được mở làn 3 |
| V2 | Vòng verify đỏ-oan-vì-tải | **= 0** (token S4 làm đúng việc) |
| V3 | Hoá đơn re-sign tại Gate 2 mỗi làn | = bản khai Gate 1 + carry-forward, **0 re-verify chéo** |
| V4 | Tổng phút-người-ký mỗi feature | Không tăng so với trung bình các loop đơn gần nhất |

Trượt ≥ 2/4 → quay về tuần tự, ghi kết quả vào STATUS + findings về kit —
thí nghiệm thất bại được ghi cũng là tài sản.

**Ba chữ ký cần từ owner:** (i) luật §3 · (ii) hai làn §2 + bốn vạch §5 ·
(iii) cam kết cửa sổ ký (1–2 lần ngồi/ngày, mỗi lần kèm 15′ cho một mục làn A
của G0).

## 6 · Kết quả ghi ở đâu

- STATUS.md: một mục «pilot dây chuyền N=2» với 4 số V1–V4 đo được.
- Kit `docs/findings/`: một findings ngày kết thúc — vì đây là **đợt 3 đo
  M1/M2** mà PRODUCT-MAP của kit đang chờ; luật nào chứng minh giá trị thì
  owner quyết đường thăng cấp vào GUIDE/kit ở release sau (khi đó
  media-library thừa hưởng tự động).
- AGENTS.md của OneFlow: CHỈ sau khi pilot đạt — nghi thức thành văn, không
  thành văn trước khi có số.
