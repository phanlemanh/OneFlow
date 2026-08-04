## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Op-form number inputs carry no bounds, dropping the only boundary check on ABI-declared ranges**
  Người dùng thấy gì: Nhap so ngoai pham vi hop le (vi du toa do, do mo, kich thuoc) cho lop phu co the khong bi chan, khien ket qua xu ly bi sai hoac loi ma khong co canh bao truoc.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  Đề xuất: new-contract

- **CLAUDE.md still documents the retired first edition of check-manifest-unmoved.sh**
  Người dùng thấy gì: Tai lieu huong dan noi bo dang mo ta mot quy tac kiem tra da loi thoi, co the khien nguoi dong gop sau nay lam theo huong dan sai va khong biet thao tac cua ho se lam hong mot kiem tra tu dong.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  Đề xuất: known-limits

- **ABI requires x/y on every op kind, forcing meaningless filler for safe_zone**
  Người dùng thấy gì: Voi mot so kieu vung phu, he thong buoc phai gui kem toa do khong co y nghia thuc; dieu nay khong gay loi hien thi ngay cho nguoi dung nhung khien du lieu luu tru kho phan biet toa do that voi gia tri gia.
  file: `config/tongflow.abi.json`
  Đề xuất: known-limits

- **Refused edge swap is a silent no-op with no user feedback**
  Người dùng thấy gì: Khi nguoi dung co gang doi huong mot ket noi khong hop le, thao tac chi lang le bi huy va giao dien tu tra ve trang thai cu ma khong giai thich ly do, khien nguoi dung boi roi khong biet vi sao thao tac khong co tac dung.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

- **compose-overlay: {text} placeholder has no missing-upstream guard, unlike the parallel logo case**
  Người dùng thấy gì: Neu nguoi dung them nhan gia vao lop phu nhung quen noi nguon van ban, he thong van cho phep bam chay ma khong canh bao truoc — ket qua co the sai hoac loi chi duoc phat hien sau khi da ton mot luot xu ly tra phi.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  Đề xuất: new-contract

- **producibleOutputTypes filters outputs by accepted INPUT types and can drop the slot's real primary output**
  Người dùng thấy gì: Day la rui ro tiem an cho cac tinh nang tuong lai chua ton tai — voi cau hinh node hien tai, nguoi dung khong bi anh huong, nhung neu sau nay co node moi dau ra khong trung voi dau vao chap nhan, node do co the bi an sai chuc nang khoi nguoi dung.
  file: `src/lib/abi/resolve.ts`
  Đề xuất: known-limits

- **Inline edge-target swap is refused with a bare return — no user feedback**
  Người dùng thấy gì: Khi nguoi dung chon mot dich ket noi khac trong danh sach tha xuong, lua chon co the lang le bi tu choi va tu bat ve gia tri cu ma khong co thong bao, khien nguoi dung khong hieu vi sao lua chon cua minh khong duoc ap dung.
  file: `src/components/workspace/edges/custom-edge.tsx`
  Đề xuất: known-limits

