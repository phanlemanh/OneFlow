# ADR-0010: Ưu tiên hạ tầng và model phổ biến; đa dạng lựa chọn thay vì một nền duy nhất

- **Ngày:** 2026-07-27 · **Trạng thái:** Chấp nhận (quyết định của founder)
- **Nguồn:** founder, 27/07/2026. Hệ quả trực tiếp của niềm tin nền số 1 trong
  [tầm nhìn](../strategy/vision.md) — *"model đang commoditize; giá trị bền dồn về tầng
  workflow và tầng dữ liệu"*.
- **Quan hệ:** **sửa đổi** [ADR-0005](0005-managed-cloud-default.md) ở đúng một điểm cơ chế
  (xem "Hệ quả"). Không đảo chiều quyết định managed-cloud-mặc-định của ADR đó.

## Bối cảnh

Thượng nguồn TongFlow được xây quanh Modal: **31 trong 38** plugin chính thức là
`tongflow-modal-*`, chỉ 7 là `tongflow-api-*`. Ngay cả phiên âm — thứ mọi nhà cung cấp lớn
đều bán qua API — cũng có một plugin GPU riêng, và README ghi bản API là *"(alternative)"*.

OneFlow đã fork và đi hướng riêng. Kế thừa mặc định đó là kế thừa một ràng buộc không thuộc
về tầm nhìn này:

- **Mâu thuẫn với niềm tin nền.** Nếu model là hàng hoá phổ thông thì khoá vào một nền tính
  toán là rủi ro thuần tuý, không mua lại được lợi thế nào ở tầng workflow hay tầng dữ liệu —
  đúng hai tầng mà tầm nhìn nói giá trị dồn về.
- **Mâu thuẫn với luận điểm chống nhốt.** Sản phẩm hứa "dữ liệu thuộc về người dùng, export
  được, self-host được". Một người tự host mà buộc phải có tài khoản Modal thì lời hứa đó
  mỏng đi đáng kể.
- **Chi phí vận hành thật.** GPU worker kéo theo cold start, quản lý workspace, và một hoá
  đơn phải chia cho từng node để tính COGS. Đường API đổi thứ đó lấy một con số trên mỗi lần
  gọi.

## Quyết định

- **Thứ tự ưu tiên khi chọn nhà cung cấp cho một slot ABI:**
  1. **API phổ biến** — nhà cung cấp mà người dùng đã biết tên và đã có tài khoản
     (OpenAI, Google/Gemini, Anthropic, ElevenLabs, OpenRouter với vai gateway).
  2. **GPU/self-host** khi năng lực đó không mua được qua API, hoặc khi kinh tế đơn vị ở
     quy mô đã đo được nghiêng hẳn về nó.
- **Đa dạng là tính năng, không phải nợ.** Mỗi slot nên có **nhiều hơn một** hiện thực khả
  dụng để người dùng chọn trong picker per-node. Kiến trúc đã sẵn sàng cho điều này — ABI là
  hợp đồng, plugin là hiện thực — nên chi phí là chọn lựa, không phải xây mới.
- **Modal là một lựa chọn, không phải nền tảng.** Plugin `tongflow-modal-*` vẫn cài được và
  vẫn hỗ trợ; chúng thôi giữ vai mặc định cho những slot có đường API tương đương.
- **Áp dụng ngay cho phiên âm:** slot `transcribe-timestamp` mặc định đi đường API
  (`tongflow-api-apimart` hoặc plugin OpenAI trực tiếp); `tongflow-modal-whisper` là phương
  án thay thế — đúng như README thượng nguồn vốn đã mô tả.

## Hệ quả

- **Sửa đổi [ADR-0005](0005-managed-cloud-default.md):** ADR đó ghi cơ chế managed cloud là
  *"Modal workspace gộp + key phía server"*. Phần **managed là mặc định, người dùng cuối
  không thấy key** giữ nguyên. Phần **Modal là nền tính toán** không còn là giả định — nền
  đó là bất kỳ tập nhà cung cấp nào rẻ và phổ biến ở thời điểm ấy, Modal chỉ khi cần GPU.
- **Đổi cách đo WER ở G0.** Thay vì đo một bản Whisper, đo **các đường phổ biến** trên cùng
  bộ clip: APIMart Whisper · OpenAI Whisper · ElevenLabs Scribe · (Modal Whisper nếu còn cân
  nhắc ship). Cùng một công, và biến "giữ hay bỏ Modal khỏi P0" từ phỏng đoán thành số.
  DoD của G0 ghi đích danh "Whisper" — đọc theo ADR này là *"bản Whisper sẽ ship"*, không
  phải riêng bản GPU.
- **Rủi ro chấp nhận:** phụ thuộc API là phụ thuộc giá và điều khoản của bên thứ ba, và
  đường API thường không cho tinh chỉnh sâu (VAD, beam, chunking) như tự host. Đổi lại là
  không có hạ tầng phải trông, và người dùng dùng nhà cung cấp họ đã tin.
- **Không hồi tố.** Không có đợt di trú plugin nào được kích hoạt bởi ADR này; nó chi phối
  **lựa chọn mặc định** và **việc chọn nhà cung cấp cho slot mới**. Việc fork plugin vẫn
  tuần tự theo nhu cầu ([ADR-0007](0007-sequential-plugin-forking.md)).
