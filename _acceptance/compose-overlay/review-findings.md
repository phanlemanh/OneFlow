## Trong hợp đồng

_Không có phát hiện nào ánh xạ được vào AC vòng này._

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **compose-overlay node placed in transfer/ (1→1) though it is an N→1 compose node — contradicts CLAUDE.md directory convention and the repo's own README**
  Người dùng thấy gì: Vi tri luu node trong ma nguon khong khop quy uoc noi bo cua du an; nguoi dung cuoi khong bi anh huong truc tiep, nhung viec bao tri/tim kiem code ve sau co the kho hon.
  file: `src/components/workspace/nodes/transfer/compose-overlay.tsx`
  severity: high
  Đề xuất: known-limits

- **Fifth consumer of the widened-handle rule left unconverted: Director safe-slot filter still tests only the primary nodeType**
  Người dùng thấy gì: Neu sau nay mot slot ghep noi dung khai bao uu tien nhan video truoc anh, tinh nang do co the bien mat hoan toan khoi goi y tu dong cua tro ly dung workflow ma khong co canh bao nao cho nguoi dung.
  file: `src/lib/director/vocabulary.ts`
  severity: medium
  Đề xuất: known-limits

- **CLAUDE.md §"Registering an official plugin" is now stale — it documents a guard shape that no longer exists**
  Người dùng thấy gì: Tai lieu huong dan noi bo mo ta sai cach hoat dong hien tai cua mot co che kiem tra; khong anh huong truc tiep nguoi dung cuoi nhung co the khien nguoi them plugin moi sau nay lam theo huong dan da loi thoi.
  file: `CLAUDE.md`
  severity: medium
  Đề xuất: known-limits

- **SDK version hardcoded in run-overlay-plugin-tests.sh while the sibling guard derives it from pyproject.toml**
  Người dùng thấy gì: Khi SDK duoc nang len phien ban moi, bo kiem thu plugin overlay co the van bao 'dat' du dang kiem tra bang phien ban SDK cu, khien nguoi doc bao cao lam tuong ban moi da duoc xac nhan hoat dong tot.
  file: `scripts/plugins/run-overlay-plugin-tests.sh`
  severity: medium
  Đề xuất: known-limits

- **Vendor-specific preset name added to the cross-plugin ABI contract**
  Người dùng thấy gì: Mot ten cau hinh dinh dang danh rieng cho mot nen tang ben thu ba duoc dua vao hop dong du lieu dung chung cho moi plugin tuong lai, co the gay kho khan neu sau nay co plugin khac can tuan thu cung hop dong ma khong dung dinh dang do.
  file: `config/tongflow.abi.json`
  severity: low
  Đề xuất: known-limits

- **Op-form uses a raw <select> with untranslated ABI enum labels, bypassing the shared UI Select component**
  Người dùng thấy gì: Nguoi dung giao dien tieng Viet/Trung/Nhat/Han se thay mot so lua chon trong form dan chu/logo hien thi bang tieng Anh thay vi duoc dich, lam trai nghiem khong nhat quan.
  file: `src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx`
  severity: low
  Đề xuất: known-limits

- **Dead shell variables after the manifest-guard rewrite duplicate constants the inlined node script hardcodes**
  Người dùng thấy gì: Khong anh huong nguoi dung cuoi; day la mot chi tiet thua trong script noi bo co the gay nham lan cho nguoi bao tri sau nay.
  file: `scripts/plugins/check-manifest-unmoved.sh`
  severity: low
  Đề xuất: known-limits

- **Director compiles every compose-overlay step to an imageNode output, even when the media is a video**
  Người dùng thấy gì: Khi tro ly tu dong ghep chu/logo len mot video, ket qua co the bi gan nham la anh tinh, khien du lieu video dau ra bi bo trong va cac buoc xu ly video tiep theo co the bi tu choi ket noi mot cach kho hieu.
  file: `src/lib/director/compile.ts`
  severity: high
  Đề xuất: known-limits

- **vocabulary.hasUnsatisfiableRequiredInput is the one consumer of the widened-handle rule the refactor missed**
  Người dùng thấy gì: Neu sau nay mot slot ghep noi dung khai bao uu tien nhan video truoc anh, tinh nang do co the bien mat khoi goi y tu dong cua tro ly dung workflow ma khong co canh bao nao cho nguoi dung.
  file: `src/lib/director/vocabulary.ts`
  severity: medium
  Đề xuất: known-limits

- **Director always emits a compose-overlay node with no `ops`, and nothing reports it**
  Người dùng thấy gì: Khi tro ly tu dong tao san mot node dan chu/logo/khung gia, node do co the xuat hien tren canvas o trang thai khong the chay duoc va khong he giai thich ly do, khien nguoi dung phai tu mo de sua.
  file: `src/lib/director/compile.ts`
  severity: medium
  Đề xuất: new-contract

- **Inline edge-handle swap aborts silently with no user feedback**
  Người dùng thấy gì: Khi nguoi dung co doi mot ket noi anh/video sang mot diem nhan khong tuong thich, thao tac chi lang le khong co gi xay ra ma khong co bat ky thong bao giai thich nao, khien nguoi dung tuong ung dung bi treo hoac thao tac bi loi.
  file: `src/components/workspace/edges/custom-edge.tsx`
  severity: medium
  Đề xuất: known-limits

- **Conformance data-URL materialization keys off the resolved path, not the ABI $ref, so it can diverge from the Python side it mirrors**
  Người dùng thấy gì: Khong anh huong nguoi dung cuoi; day la rui ro trong bo kiem thu noi bo dung de doi chieu hai he thong, co the khien ket qua kiem thu tu dong bao sai (dat gia hoac truot gia) ma khong tac dong toi san pham thuc te.
  file: `src/lib/abi/conformance.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

_Không có._

⚠ Cụm ngoài vùng phủ: 4/12 lỗi rơi vào file không bộ đo nào phủ (CLAUDE.md, scripts/plugins/run-overlay-plugin-tests.sh, src/components/workspace/nodes/transfer/compose-overlay-op-form.tsx, src/lib/abi/conformance.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.