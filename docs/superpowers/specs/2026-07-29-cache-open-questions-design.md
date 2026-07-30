# Thiết kế — chốt Q1–Q3 của spec cache, và amendment cho D3/D7/§8

> Đóng ba câu hỏi mở ở §7 của [spec cache](../../spec/prd/engine-cache-partial-rerender.md).
> Tài liệu tự chứa: người đọc không cần lịch sử chat để sửa spec và bắt đầu lát L1.
>
> **Quyết định bởi:** Manh, 2026-07-29 · **Chặn:** hạng mục 1.1 (cache engine hạ cánh
> trong `sdk/tongflow/engine/`) — không bắt đầu L2 khi ba câu này còn mở.

## 1. Vì sao ba câu này phải chốt trước L2

Lát L1 (`digest_form()` + `node_fingerprint()`) không đọc ghi cache nên không phụ thuộc
Q1–Q3. Lát **L2 thì có**: nó dựng store trên đĩa, và cả ba câu đều quyết định hình dạng
của thứ nó dựng — khoá phạm vi nào, thư mục nằm ở đâu, ai dọn.

Chốt sau khi đã viết L2 là viết lại L2.

Một câu hỏi thứ tư nổi lên trong lúc chốt và hoá ra quyết định luôn hai câu kia, nên nó
đứng đầu tài liệu này.

## 2. Câu hỏi Q0 phát sinh — biên giới của tầng A

**Câu hỏi:** tầng A (slot tất định) có được dùng chung **chéo tenant** không?

D3 như đang viết trả lời là *có*: "Toàn hệ thống, dedupe chéo workflow/người dùng… càng
chia sẻ càng lợi". Câu đó đọc như một quyết định hiệu năng. Nó không phải.

`transcribe` là slot tất định → tầng A → dùng chung toàn hệ thống. Nghĩa là tenant B
upload đúng bytes audio mà tenant A đã xử lý sẽ nhận **bản chép của A**, tức thì và
không tốn gì. Nội dung không lộ thêm gì (cùng input tất định thì cùng output), nhưng cơ
chế là một **existence oracle**: có bytes trong tay là biết được người khác đã xử lý
đúng bytes đó chưa. Với một studio quảng cáo, "đối thủ đã chạy clip này chưa" là thông
tin có giá — và suy ra được qua độ trễ hoặc qua hoá đơn, không cần đọc nội dung.

Nó cũng đi ngược **niềm tin nền số 5** của [vision.md](../../strategy/vision.md) —
*"Dữ liệu thuộc về người dùng"* — và làm rỗng một nửa của **R3**.

### Quyết định Q0 — tầng A khoá theo tenant

**Tầng A không dùng chung chéo tenant.** Phạm vi của nó thu từ "toàn hệ thống" về
**"trong một tenant, chéo workflow"**.

Cái mất: dedupe chéo người dùng cho các node rẻ-nhưng-chạy-liên-tục. Cái mất đó **chưa
có số liệu nào chứng minh là đáng giá**, trong khi kịch bản tham chiếu của spec (§4 —
đổi giá 200 video) là dedupe **trong một tenant**, không cần chéo.

Cái được: existence oracle biến mất, R3 đóng gọn cho cả hai tầng, và Q2 tự trả lời.

### Hai tầng vẫn còn lý do tồn tại

Sau Q0, cả A và B đều khoá theo tenant, nên phải nói rõ vì sao không gộp làm một:

- **Tầng A** — trong tenant, **chéo workflow**. Đúng ngữ nghĩa: `extract-audio` của cùng
  một file cho cùng một kết quả bất kể nó nằm trong workflow nào.
- **Tầng B** — trong tenant, **trong một workflow**. Tái dùng ảnh sinh của workflow X
  sang workflow Y là **sai ngữ nghĩa**, không phải chuyện bảo mật: cache này là *"input
  không đổi → dùng lại đúng cái bạn đã tạo ra"*, và "cái bạn đã tạo ra" gắn với ngữ cảnh
  sáng tạo mà nó sinh ra trong đó.

Khác biệt giữa hai tầng vì thế không còn là biên giới bảo mật (giờ cả hai đều là tenant)
mà là **độ rộng ngữ nghĩa**. D3 phải nói lại theo trục đó.

## 3. Q1 — có gộp `store.py:59/94` thành nội-dung-địa-chỉ không?

**Quyết định: KHÔNG.** Nội-dung-địa-chỉ chỉ sống trong blob store của cache (D6). Store
của lần chạy giữ nguyên UUID.

### Các đường đã cân nhắc

| Đường | Nội dung | Vì sao không chọn |
|---|---|---|
| **A ⭐** | Giữ UUID ở run store; sha256 chỉ trong `node-cache/blobs/` | — (chọn) |
| B | Content-address cả `MemoryStore` và `DiskStore` | Vướng cả 4 lý do dưới |
| C | Chỉ `DiskStore` | Rẻ hơn B nhưng làm ba store lệch nhau nhiều hơn, đúng thứ §5 cảnh báo |

### Bốn lý do, xếp theo sức nặng

1. **Không thể làm đồng nhất.** `HttpStore.put` nhận `file_key` **do host cấp**
   ([`store.py:161`](../../../sdk/tongflow/engine/store.py)) — engine không quyết được
   hình dạng của nó. Content-address cho Memory/Disk mà không làm được cho Http nghĩa là
   ba store bất đồng về ý nghĩa của `file_key`. Đó chính là loại lỗi **hai định nghĩa cho
   một thao tác** mà 1.L0 vừa tốn bốn vòng verify để giết, và §5 của spec đã đặt tên.

2. **UUID đang gánh vai trò quyền sở hữu, không chỉ là tên.** Hai lần chạy sinh ra bytes
   giống hệt nhau mà trỏ chung một path thì bên nào dọn trước sẽ phá bên kia. UUID cho
   mỗi lần chạy một vòng đời độc lập; sha256 gộp chúng lại và biến việc dọn dẹp thành bài
   toán đếm tham chiếu — thứ hiện không có và không đáng có ở tầng này.

3. **Phần lợi đã thu rồi.** D6 đã nội-dung-địa-chỉ blob **trong** cache. Câu *"200 video
   khác nhau chỉ khác overlay vẫn chia sẻ mọi blob nguồn"* đã đúng mà không cần đụng vào
   store. Q1 chỉ thêm dedupe cho output **không được cache** — phần dư, không phải phần
   chính.

4. **Giá cao và trải rộng.** `file_key` là **wire/persistence shape**; CLAUDE.md xếp nó
   vào nhóm chokepoint. Đổi nó là chạm canvas, `/api/uploads`, đường desktop delegation,
   và hợp đồng với host của `HttpStore`. Đổi một chokepoint t3 để lấy phần dư ở lý do 3,
   với con số chưa ai đo, là sai thứ tự.

**Điều kiện mở lại:** có số đo cho thấy output trùng lặp *ngoài cache* là chi phí thật
(dung lượng hoặc thời gian). Không có số thì không mở.

## 4. Q2 — cache dùng chung giữa desktop và cloud?

**Quyết định: KHÔNG.** Và sau Q0 nó là **hệ quả**, không còn là phán đoán.

Tầng A đã khoá theo tenant, nên desktop và cloud không còn biên giới chung nào để chia sẻ
qua. Desktop tự nó là một tenant cục bộ: cache nằm trên ổ đĩa người dùng, dưới `data_dir`
của họ. Cloud là store của tenant. Không có đường nào nối hai cái đó mà không phá Q0.

Điều này khớp [ADR-0005](../../adr/0005-managed-cloud-default.md) (managed cloud mặc
định) mà không mâu thuẫn: mặc định là *nơi chạy*, không phải *nơi chia sẻ cache*.

## 5. Q3 — cửa sổ sống của tầng B

**Quyết định: LRU theo dung lượng, một cơ chế thu hồi duy nhất cho cả hai tầng**, cộng
một API purge best-effort.

### Vì sao không giữ đề xuất cũ

Spec đề xuất "theo vòng đời workflow, dọn khi workflow bị xoá". Vấn đề: **engine không
biết workflow bị xoá.** Nó stateless theo từng run; vòng đời workflow nằm ở app (canvas,
và Postgres từ P2). Đề xuất đó mô tả một cái hook chưa tồn tại, và một hook luôn trượt
được (app crash, ai đó xoá thẳng trong DB) thì vẫn phải có lưới đỡ phía dưới.

Nên lưới đỡ là cơ chế **chính**, không phải cơ chế dự phòng.

### Cơ chế

- **Trần dung lượng cấu hình được, LRU khi vượt** — mặc định 20GB, dùng chung cho cả tầng
  A và B (R2 đã đặt việc này ở L4; đây chỉ là chốt rằng nó là cơ chế *duy nhất*).
- **`purge(tenant, workflow_id)`** — app gọi khi xoá workflow. **Best-effort.**
- **Purge không bao giờ là điều kiện đúng-sai.** Cache mất entry thì tốn GPU-giây, không
  sai kết quả — đây là hệ quả trực tiếp của tiêu chí "xoá thư mục cache → kết quả không
  đổi, chỉ chậm hơn" đã có ở §8.

**Không thêm TTL.** Hai cơ chế thu hồi song song thì khi cache "mất" phải điều tra xem
cái nào đã ăn, và TTL hết hạn giữa một phiên sửa bài là đúng lúc người dùng cần cache
nhất.

## 6. Amendment — bốn chỗ trong spec phải sửa theo

Ba quyết định trên đụng vào thân spec, không chỉ vào §7. Bỏ sót phần này thì spec tự mâu
thuẫn và người đọc sau sẽ tin phần cũ.

### A. D3 — cột "Phạm vi" của tầng A

| | Đang viết | Phải thành |
|---|---|---|
| Tầng A | "Toàn hệ thống, dedupe chéo workflow/người dùng" | **"Trong tenant, chéo workflow"** |
| Tầng B | "Chỉ trong phạm vi workflow + tenant" | giữ nguyên |

Kèm một đoạn ghi vì sao đổi (§2 của tài liệu này), để lần sau không ai "tối ưu" nó ngược
trở lại như một cải tiến hiệu năng.

Câu *"Tầng A thì càng chia sẻ càng lợi"* phải bỏ — nó là tiền đề của quyết định cũ.

### B. D7 — `reuse_scope` trở thành bắt buộc, và fail-closed

Hiện `reuse_scope=None` và chỉ phục vụ tầng B. Sau Q0, **cả hai tầng** đều cần scope.

```python
run_workflow(
    workflow, inputs,
    reuse="auto",
    reuse_scope=None,   # (tenant, workflowId) — thiếu thì TẮT cache, không rơi về dùng chung
    ...
)
```

**Không có scope → tắt cache hoàn toàn**, cả A lẫn B. Đây là điểm fail-closed quan trọng
nhất của cả gói: nếu thiếu scope mà âm thầm rơi về "dùng chung" thì một lỗi cấu hình ở
cloud sẽ khôi phục lại đúng existence oracle mà Q0 vừa đóng — và khôi phục **im lặng**.

Desktop cấp scope tenant cục bộ, nên đường self-host không mất cache vì luật này.

### C. §8 — tiêu chí nghiệm thu phải phủ cả hai tầng

Đang viết: *"Hai tenant cùng input ở slot **bất định** → không dùng chung kết quả."*

Phải thành hai dòng:

- Hai tenant cùng input ở slot **bất định** → không dùng chung kết quả.
- Hai tenant cùng input ở slot **tất định** → **cũng không** dùng chung kết quả.

Dòng thứ hai là thứ chứng minh Q0. Thiếu nó thì quyết định hôm nay không có gì canh.

Thêm hai tiêu chí nữa sinh từ Q3 và D7:

- Gọi `run_workflow` **không có `reuse_scope`** → không entry nào được đọc và không entry
  nào được ghi (fail-closed, chứ không phải "dùng chung").
- `purge(tenant, workflowId)` xoá entry tầng B của đúng workflow đó và **không** chạm
  workflow khác cùng tenant; chạy purge hai lần không lỗi.

### D. R3 — ghi lại cách đóng

R3 hiện là *"Tầng B **phải** khoá theo `(tenant, workflowId)`; tầng A chỉ chứa kết quả
tất định"*. Vế sau không còn là lời giải: tất định không có nghĩa là chia sẻ được. Sửa
thành: **cả hai tầng khoá theo tenant; tính tất định chỉ quyết định độ rộng *trong* một
tenant**, kèm một dòng nêu existence oracle là thứ đã bị đóng, để rủi ro không tái sinh
dưới dạng một tối ưu hoá.

## 7. Ảnh hưởng tới lộ trình lát

| Lát | Có đổi không |
|---|---|
| L1 — `digest_form()` + `node_fingerprint()` | **Không.** Không đọc ghi cache nên không chạm Q1–Q3 |
| L2 — store cache + blob dedupe + D5, tầng A | **Có.** Tầng A nay khoá theo tenant; đường thư mục phải mang scope; fail-closed khi thiếu scope |
| L3 — tầng B | Không đổi về cơ chế; kế thừa luật scope của L2 |
| L4 — eviction + `reuse=` + telemetry | **Có.** LRU là cơ chế thu hồi duy nhất (không TTL), và `purge()` thuộc lát này |

Không lát nào bị thêm hay bớt. Q1 = KHÔNG nghĩa là L2 không phải đụng `store.py`.

## 8. Những gì tài liệu này KHÔNG quyết

- **Q1–Q3 của spec chỉ là ba câu ở §7.** Các rủi ro R1–R6 đã có lời giải từ trước và
  không mở lại ở đây.
- **Bảng giá / hạn mức.** Metering → gating là hạng mục P2 (roadmap), ngoài phạm vi.
- **Cache có chia sẻ giữa các tenant trong cùng một tổ chức không.** Câu này chỉ có nghĩa
  khi schema org/membership hạ cánh ở P2. Lúc đó "tenant" cần định nghĩa chính xác; hiện
  nay đọc là ranh giới cô lập nhỏ nhất mà hệ thống có.
- **Đếm tham chiếu cho blob của cache.** LRU theo dung lượng đủ cho L4; đếm tham chiếu chỉ
  cần khi có số đo nói LRU đang xoá nhầm thứ đang được dùng.

---

**Người viết:** Claude (phiên 2026-07-29) · **Quyết định:** Manh 2026-07-29 ·
**Kế tiếp:** sửa spec theo §6, rồi lát L1.
