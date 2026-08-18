# Design — bộ quét plugin đọc import theo ranh giới phạm vi

- **Ngày:** 2026-08-18 · **Slug:** `scan-with-block-imports` · **Hạng:** T3 (chạm `sdk/**`)
- **Nguồn:** phiên gỡ lỗi 18/08 sau khi `pnpm plugins:install` cài đủ 39 plugin mà
  `compose-overlay` vẫn không có ai phục vụ.

## Vấn đề

Người dùng cài đúng danh sách plugin chính thức, mở app, kéo node dán chữ/giá/logo ra
bàn làm việc — bấm chạy thì không có gì xảy ra. Registry báo slot `compose-overlay`
không có plugin nào phục vụ, kèm một câu nói sai chỗ:

```
oneflow-modal-compose-overlay/entry.py:1: no @node_slot(NodeSlots.XXX) methods found
```

Plugin viết hoàn toàn đúng chuẩn: `deploy.py` có `@deploy` trên class, có
`@node_slot(NodeSlots.COMPOSE_OVERLAY)` trên method, có `TONGFLOW_DEFAULT_SLOTS`.

## Nguyên nhân, đã chứng minh bằng phép thử một biến

`_collect_models_roots` (`sdk/tongflow/_ast_utils.py:37-49`) thu tập tên được bind từ
`tongflow.models`. Bộ đi cây của nó gọi tên từng loại khối và **chỉ biết `ast.Try`**:

```python
def walk_body(body):
    for node in body:
        take_import_stmt(node)
        if isinstance(node, ast.Try):      # <- chỉ try, không with/if/for/while/match
            ...
```

Plugin đặt import theo đúng thành ngữ chuẩn của Modal:

```python
with image.imports():
    from tongflow.models.compose_overlay import ComposeOverlayInput, ComposeOverlayOutput
```

Nên `ComposeOverlayInput` không vào tập hợp lệ → `looks_like_sdk_model_type` trả
`False` → method bị `continue` → `methods_by_slot` rỗng.

Phép thử: chép `deploy.py`, nhấc đúng hai dòng import lên cấp module, không đổi gì
khác, parse lại bằng chính SDK trong repo:

```
NGUYÊN BẢN (import trong with image.imports()) ->  slots: {}
THỬ: import ở cấp module                       ->  slots: {'COMPOSE_OVERLAY': 'compose_overlay'}
```

## Hai lớp lỗi, không phải một

**Lớp 1 — liệt-kê-loại-khối thay vì ranh-giới-phạm-vi.** Danh sách loại khối không bao
giờ đủ: hôm nay thiếu `with`, mai ai đó viết `if TYPE_CHECKING:` là thiếu tiếp.

**Lớp 2 — hỏng đóng nhưng đổ lỗi sai file.** Method mang `@node_slot` bị loại vì chú
thích kiểu được `continue` **lặng** ở cả hai bên đọc (`scan.py:159-167`,
`parse_deploy.py:62-78`), không ghi lý do nào. Người vận hành nhận một câu nói về
`entry.py` trong khi thủ phạm nằm ở `deploy.py`, cách đó một khối `with`. Chính lớp
này biến một lỗi hai dòng thành một phiên gỡ lỗi.

## Quyết định

### 1. Bộ đọc import đổi sang ranh giới phạm vi

Duyệt mọi node con, **không** chui vào `FunctionDef` / `AsyncFunctionDef` / `ClassDef`.
Luật một dòng: *một câu import gắn tên vào phạm vi module ở mọi khối; chỉ hàm và class
mới mở phạm vi mới.* Không còn danh sách loại khối phải nuôi.

Đây đúng là luật phạm vi của chính Python — `symtable` của CPython hiện thực nó, và mọi
bộ đọc tĩnh nghiêm túc (pyflakes dựng cây phạm vi để báo tên chưa định nghĩa; pyright và
mypy xử lý riêng `if TYPE_CHECKING:` chính vì import điều kiện vẫn bind ở phạm vi module)
đều theo. Ta đang đi từ một xấp xỉ thủ công về đúng luật của ngôn ngữ.

Chân âm giữ cho bản vá khỏi thành "nhận tất": import nằm trong `def`/`class` **không**
được tính — tên đó cục bộ thật.

### 2. Chẩn đoán nói tên lý do

Luật một câu: **method mang `@node_slot` mà không được đăng ký thì phải nói vì sao.**
Ba lý do có thật hôm nay: thiếu chú thích kiểu · chú thích không phải model của SDK ·
thiếu tham số.

Lý do sinh ở **một chỗ duy nhất** trong `_ast_utils.py`: lõi trả `(hợp lệ, lý do)`, giữ
thêm một vỏ bool cho caller cũ. Hai bên đọc chỉ tiêu thụ. Đặt lý do ở mỗi bên đọc thì
hai cách diễn đạt sẽ trôi khỏi nhau — đúng lớp lỗi repo đã trả giá vài lần
(bốn bản sao luật URL, hai bản luật SDK-pin).

### 3. Phạm vi phát hành: không kèm

`runners/generic.ts:54-57` và `plugins-scanner.server.ts:20` đều đặt `sdk/` của repo lên
**đầu** `PYTHONPATH`; comment ở `plugin-python-env.server.ts:211` nói thẳng *"Live SDK
code still comes via PYTHONPATH in the runner."* Nên mã SDK trong repo che bản đã cài,
ở cả đường quét lẫn đường chạy `entry.py`. Sửa repo là thông cả hai — không publish
PyPI, không bump ghim plugin, không dựng lại venv.

Đánh đổi đã nhận: bản `oneflow-sdk` 0.2.18 trên PyPI vẫn mang lỗi này. Chấp nhận được
vì hiện chưa có người tiêu thụ SDK nào ngoài chính repo; lần phát hành kế tiếp mang
theo bản vá.

## Không đụng

- `extract_default_slots` / `extract_slot_models` giữ nguyên chỉ-đọc-cấp-module. Đó là
  thiết kế có chủ đích: hằng số không bao giờ được thực thi nên plugin khai nó vẫn
  import sạch dưới mọi bản SDK, kể cả bản cũ đã nướng vào runtime đã triển khai.
- Bản thân `compose-overlay` và mọi plugin khác. Plugin viết đúng; lỗi ở bộ đọc.
- Va chạm thư mục venv giữa đường TS và đường Python — nợ riêng, đã ghi trong STATUS.
- `tongflow-api-bytedance` khai `NodeSlots.REFS_GEN_VIDEO` không có trong ABI — lỗi
  thượng nguồn, khác gốc.

## Cách chứng minh

Theo luật khai-sinh-phép-đo của repo, mỗi thước mới đi kèm cặp hai chiều trên **cùng một
vật**: một `deploy.py` mẫu đặt import trong `with image.imports():` → xanh khi bộ đọc
đúng; hoàn nguyên đúng dòng đệ quy trong bản sao → **phải đỏ kèm thông điệp ghim tên
slot**, không chỉ mã thoát.

Trên hết là một phép đo đầu-cuối chạy bộ quét thật lên `plugins/oneflow-modal-compose-overlay/`
rồi đòi slot `compose-overlay` có người phục vụ. Đó là câu hỏi sản phẩm; các phép đo
còn lại chỉ là câu hỏi về một hàm.
