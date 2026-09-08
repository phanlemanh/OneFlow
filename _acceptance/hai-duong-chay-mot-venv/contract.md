---
schema_version: 1
feature: Hai đường chạy, một venv — engine Python dùng venv per-plugin như bên TypeScript, thôi nuốt lỗi cấp phát
slug: hai-duong-chay-mot-venv
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [sdk]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-08
design_doc: docs/superpowers/specs/2026-09-08-hai-duong-chay-mot-venv-design.md
---

# Acceptance Contract: hai-duong-chay-mot-venv

## Context

Hai runtime cùng ghi vào **một đường dẫn** `data/.tongflow/plugin-venv` với hai ý
nghĩa loại trừ nhau.

Bên TypeScript ([`plugin-python-env.server.ts:37`](../../src/lib/plugins/plugin-python-env.server.ts))
coi nó là thư mục **chứa nhiều venv con**, một venv mỗi plugin — bố cục ADR-0011
đặt ra 07/08. Nó dò `pyvenv.cfg` ngay tại gốc để nhận ra venv chung đời cũ rồi
`rm -rf` cả gốc.

Bên engine Python ([`sdk/tongflow/engine/plugins.py:99`](../../sdk/tongflow/engine/plugins.py))
dựng **một venv chung ngay tại đường dẫn ấy**, tức đặt `pyvenv.cfg` vào đúng chỗ
bên kia coi là dấu hiệu của xác cần dọn.

Chạy engine headless một lần trên máy có plugin đã cấp phát, lần sau app cấp phát
bất kỳ plugin nào là xoá sạch mọi venv per-plugin. Engine lại dựng venv chung.
Hai bên phá nhau, và bên thua không kêu.

Hai lớp lỗi phụ cùng họ "hỏng mà không kêu": `except Exception → return sys.executable`
(dòng 235) biến cấp phát hỏng thành chạy bằng interpreter môi trường; và
`pip install <dist>==<phiên bản của gói đang chạy>` không giải được trong cửa sổ
giữa bump-version và publish — cửa sổ tồn tại ở mọi lần phát hành.

Thiết kế đầy đủ, gồm quét không gian tiêu chí: [`docs/superpowers/specs/2026-09-08-hai-duong-chay-mot-venv-design.md`](../../docs/superpowers/specs/2026-09-08-hai-duong-chay-mot-venv-design.md).

## Criteria

### A. Bố cục thư mục là hợp đồng chung

- AC-1: Given engine chạy với `auto_install=True` và hai plugin, When cấp phát xong,
  Then `data/.tongflow/plugin-venv/<plugin_id>/` tồn tại và là một venv thật (có
  `pyvenv.cfg` bên trong) cho **từng** plugin, và **gốc** `plugin-venv/` KHÔNG chứa
  `pyvenv.cfg`.
- AC-2: Given gốc `plugin-venv/` đang là một venv chung đời cũ (`pyvenv.cfg` nằm ngay
  tại gốc), When engine cấp phát, Then venv chung ấy bị xoá và các venv per-plugin
  được dựng lại — không có nhánh nào để lại `pyvenv.cfg` ở gốc.
- AC-3: **(cross-layer)** Given engine đã cấp phát xong theo bố cục per-plugin, When bên
  TypeScript chạy `ensurePluginPython` cho bất kỳ plugin nào, Then mọi thư mục venv
  per-plugin đã có **còn nguyên** — `removeLegacySharedVenv` không tìm thấy gì để xoá.
  Đây là ô sinh ra cả dòng B4: trước gói này nó xoá sạch.
- AC-4: Given hằng đường dẫn được khai ở cả hai phía, When một phía đổi đoạn đường dẫn
  hoặc đánh mất bước dọn venv đời cũ, Then guard ghim hằng số trả về khác 0 và gọi tên
  phía bị lệch.

### B. Đường lấy SDK

- AC-5: Given engine đang chạy từ checkout của kho (`SDK_ROOT/pyproject.toml` tồn tại),
  When dựng venv cho một plugin, Then lệnh cài SDK trỏ vào `SDK_ROOT`, không phải
  `<dist>==<version>` từ PyPI.
- AC-6: Given engine đang chạy từ site-packages (không có `SDK_ROOT/pyproject.toml`),
  When dựng venv cho một plugin, Then lệnh cài SDK vẫn ghim `<dist>==<version>` như
  trước gói này — đường mà chú thích dòng 175 bảo vệ không mất.

### C. Hỏng thì kêu

- AC-7: Given `auto_install=True` và việc cấp phát venv trục trặc (`pip install` trả
  khác 0), When `prepare_python_env` chạy, Then nó **ném lỗi** mang tên nguyên nhân và
  **không** trả về `sys.executable`. Riêng khi nguyên nhân là phiên bản đang chạy không
  có trên chỉ mục PyPI, thông điệp phải **chỉ ra hai lối** — chạy từ checkout, hoặc
  publish bản ấy — vì đó là cửa sổ phát hành, và trước gói này nó âm thầm chạy tiếp.
- AC-8: Given người gọi khai `auto_install=False`, When `prepare_python_env` chạy, Then
  nó trả về `sys.executable` cho mọi plugin và không cấp phát gì — chế độ có tài liệu
  (`sdk/README.md:30`) và bộ test SDK đang dùng (`tests/test_engine.py:364`) giữ nguyên
  nghĩa.

### D. Interpreter theo plugin

- AC-9: Given hai plugin đã cấp phát, When engine chạy một workflow chạm cả hai, Then
  mỗi plugin được gọi bằng interpreter trong venv **của chính nó** — `prepare_python_env`
  trả ánh xạ `plugin_id → interpreter` và `runner` tra ánh xạ ấy theo node.

### E. Biên đường dẫn

- AC-10: Given một id plugin không an toàn (chứa dấu phân cách, hoặc bắt đầu bằng dấu
  chấm, hoặc rỗng), When engine tính thư mục venv cho nó, Then nó **từ chối** bằng lỗi
  có tên và không tạo thư mục nào ngoài gốc — đúng luật bên TS đã ép ở `venvDirFor`.

### F. Nâng phạm vi tại Cổng 2 vòng 2, rồi thu lại sau vòng 4

Vòng 2 thêm ba tiêu chí vì hai tiêu chí về bố cục khi ấy được *khẳng định* chứ
chưa được *chứng minh*. Sau vòng cuối, owner rút hai trong ba (09/09): bằng chứng
cho thấy chính chúng là phép đo không có răng, và ký chúng là ký hai dòng nói
dối. Lý do đo được ghi ở `## Out of scope`.

Tiêu chí còn lại dưới đây ở lại, vì chiều đỏ của nó đã đo tận tay: đổi
`venvDirFor` thêm một đoạn tiền tố thì ô đo đỏ và in cả hai đường dẫn.

- AC-12: **(cross-layer)** Given manifest bố cục venv, When hai runtime đọc nó, Then nó
  **biểu diễn được** ánh xạ id → thư mục — `relative_dir` lấy từ hàm tính đường dẫn
  chứ không lấy lại từ tên thư mục đã quan sát — và ca thử bên TypeScript **gọi
  `venvDirFor`** để dựng cây thay vì nối chuỗi thẳng. Chiều đỏ phải bắt được: đổi
  `venvDirFor` thêm một đoạn tiền tố thì ô đo đỏ. Trước vòng 3, bên sinh lấy cả
  `plugin_id` lẫn `relative_dir` từ cùng một `p.name` nên ánh xạ lệch là điều
  **không biểu diễn được**, và bên đọc chưa từng chạm hàm nắm ánh xạ ấy.

## Trần vòng verify (khai TRƯỚC khi vòng chạy, CLAUDE.md mục 6)

Hồ sơ T3 → **tối đa 4 vòng S4**. Vòng thứ tư, nếu tới, được khai là "vòng cuối"
trong hồ sơ **trước** khi dispatch. Finding sống sót vòng cuối thành nợ có tên:
trong hợp đồng → mục Amendment của file này; ngoài hợp đồng → Known limits ở
`## Notes`. Không có vòng thứ năm để vá phép đo.

Vòng kết thúc BLOCKED vì hạ tầng (agent chết, lệnh đỏ chỉ dưới tải song song)
không tính là vòng review: chạy lại gọn trên cùng HEAD, mang theo mọi eval đã xanh.

Lý do khai ở đây thay vì để mặc định: gói `mo-hoa-b01` tốn 8 vòng, bốn vòng cuối
chỉ vá phép đo của phép đo. Chính hồ sơ này chọn phương án guard, tức mở thêm một
bề mặt dễ sinh vòng xoáy ấy.

### Vòng 4 là VÒNG CUỐI — khai 09/09 trước khi dispatch

Owner chọn lối «ship với giới hạn đã biết» sau khi luật chặn xoáy được áp ở vòng 3
(hai vòng sửa cùng sinh lớp FAIL-OPEN). Vòng 4 sửa **đúng một khuyết điểm**: khẳng
định AC-11 trong guard tự tắt khi `ci.yml` vắng. Kèm một ca răng cho chính đường ấy,
và đối chiếu lại `expected` của E5/E8 cho khớp phép đo thật.

Mọi finding sống sót vòng 4 thành **nợ có tên**: trong hợp đồng → mục Amendment
dưới đây; ngoài hợp đồng → Known limits ở `## Notes`. **Không có vòng thứ năm.**

### Lượt phát biểu lại — owner cho phép 09/09, KHÔNG phải vòng review thứ năm

Sau khi rút AC-11 và AC-13, `evidence-report.md` mang `verdict: REJECT` nhắm vào
hai tiêu chí không còn tồn tại, và `evals.yaml` đổi nên bằng chứng ôi theo luật
staleness. Owner cho phép **một** lượt chạy nữa trên **đúng cây này** — mã sản
phẩm không đổi một byte kể từ `ec9849c` — để có báo cáo khớp hợp đồng đã rút.

**Ràng buộc cứng của lượt này, khai trước khi chạy:** mọi finding **ngoài hợp
đồng** đi thẳng vào Known limits. **Không nâng phạm vi lần nào nữa.** Finding
**trong hợp đồng** nếu có thì hồ sơ trả về làn sửa và owner quyết lại từ đầu —
nhưng không có lượt phát biểu lại thứ hai.

## Coverage

Quét bằng `morphological-scan`, trục dựng từ đầu (preset `test-matrix` không khớp:
trục của nó là trục sản phẩm web nhiều phía, bài toán này là lỗi hạ tầng giữa hai
runtime). Chi tiết trong design doc.

| Trục | Giá trị | Thước CE |
|---|---|---|
| A · ai ghi vào thư mục venv | engine \| app TS \| **cả hai lần lượt** \| chưa ai | lịch sử nội bộ: `removeLegacySharedVenv` tồn tại vì lớp lỗi này đã xảy ra 06–07/08 · `[NGÀNH: pipx]` |
| B · trạng thái đĩa trước khi chạy | trống \| venv chung đời cũ \| per-plugin \| hỗn hợp | bốn trạng thái đóng: `pyvenv.cfg` có/không × thư mục con có/không |
| C · đường lấy SDK | checkout (AC-5) \| site-packages (AC-6) \| **kho > PyPI, chạy từ site-packages** (AC-7, vế thông điệp) | chú thích `plugins.py:175` khai đúng hai đường; đường ba là cửa sổ giữa hai lần |
| D · kết cục khi trục trặc | trơn tru \| `venv` hỏng \| `pip` hỏng \| `auto_install=False` | ba nhánh `raise` sẵn có + nhánh `not auto_install` |

Bốn trục, đọc nhanh:

- **Ai ghi vào thư mục venv** — engine Python · app TypeScript · **cả hai lần lượt trên
  cùng máy** (ô sinh ra lỗi) · chưa ai. Thước: `removeLegacySharedVenv` tồn tại vì lớp
  lỗi này đã xảy ra 06–07/08, cộng chuẩn ngành `pipx` (mỗi ứng dụng một venv).
- **Trạng thái đĩa trước khi chạy** — trống · venv chung đời cũ · per-plugin đúng bố cục ·
  hỗn hợp. Thước: bốn trạng thái là đóng, `pyvenv.cfg` có/không × thư mục con có/không.
- **Đường lấy SDK** — chạy trong checkout (AC-5) · chạy từ site-packages (AC-6) · phiên
  bản kho lớn hơn PyPI trong cửa sổ phát hành (AC-7, vế thông điệp). Thước: chú thích
  `plugins.py:175` khai đúng hai đường; đường thứ ba là cửa sổ giữa hai lần.
- **Kết cục khi cấp phát trục trặc** — trơn tru · `venv` hỏng · `pip` hỏng ·
  `auto_install=False`. Thước: ba nhánh `raise` sẵn có cộng nhánh `not auto_install`.
- **Cross-cutting áp mọi ô Core** — id plugin không an toàn (AC-10); hai bên trôi khỏi
  nhau về hằng đường dẫn (AC-4).

Cross-cutting áp mọi ô Core: id plugin không an toàn (AC-10); hai bên trôi khỏi nhau
về hằng đường dẫn (AC-4).

Không gian danh nghĩa 4×4×3×4 = 192 ô, phần lớn vô nghĩa. Vượt 50 nên cắt theo
pairwise: mười ô Core phủ mọi cặp giá trị mang lỗi ít nhất một lần.

Giá trị thứ ba của trục C từng không có AC. Nó **đổi hành vi**: chạy engine từ một
bản site-packages chưa publish, trước gói này thì `except` nuốt lỗi rồi chạy tiếp bằng
interpreter môi trường, sau gói này thì dừng cứng. Không ai quyết đổi ấy — nên nó vào
AC-7 dưới dạng yêu cầu về thông điệp, chứ không im lặng đi qua.

Không có dòng `[GIẢ ĐỊNH]` nào cần người gạch: cả bốn trục đều truy được từ mã có
thật trong kho hoặc từ chân ngành có tên.

## Out of scope

- **Publish SDK lên PyPI.** Owner chốt 08/09: gói này chỉ sửa va chạm trong kho. Bản
  vá engine vì thế chưa tới tay người `pip install` — nợ có tên ở `## Notes`.
- **Bump phiên bản SDK.** Không bump, để phiên bản kho khớp PyPI (0.2.23) và lệnh
  ghim vẫn giải được.
- **Bump pin `oneflow-sdk` của bốn plugin.** `plugins/` bị gitignore; đó là bốn kho
  riêng, không eval nào trong kho này đo được.
- **Bỏ nhánh `auto_install=False`.** Owner chốt 08/09: chỉ bỏ fallback im lặng. Bỏ
  nhánh này là breaking change của gói đã trên PyPI.
- **Đưa bố cục ra file khai báo cho cả hai runtime đọc.** Sạch về nguyên lý nhưng
  thêm một vật lúc chạy trên bề mặt T3, cho hai đoạn đường dẫn. YAGNI.
- **Rút khỏi phạm vi sau vòng 4 (09/09): lời hứa lệnh kiểm chạy trong CI.** Vòng cuối đo
  được: chú thích hoá hai step trong `ci.yml` bằng `#` thì guard vẫn in OK và thoát
  0, vì nó `grep` file thô chứ không lọc theo dòng `run:` của một step thật. Đó là
  lần thứ ba của lớp fail-open trong hồ sơ này. Hai step **vẫn ở lại** trong
  `ci.yml` như một thay đổi thường, và khẳng định trong guard vẫn ở lại như một
  lớp phòng hờ — nhưng nó **không còn là tiêu chí nghiệm thu**, vì nó không đo
  được điều nó tuyên. Kho đã có cách đúng ở `scripts/ci/check-gate-guards-job.sh`
  (strip về dòng `run:` trước khi khớp); dùng nó là việc của một hồ sơ khác.
- **Rút khỏi phạm vi sau vòng 4 (09/09): lời hứa guard canh được chú thích đầu module.**
  Ba chỗ chú thích **đã sửa và ở lại**. Điều bị rút là lời hứa rằng guard canh
  được nó: guard chỉ cấm một cụm chữ, không hề đối chứng dương rằng mô tả đúng
  còn đó — khẳng định âm-tính-một-mình, đúng lớp lỗi hồ sơ này khai là kẻ thù.
- **Đo thời gian cài lần đầu.** Cô lập đổi lấy một bản SDK mỗi venv; giá ấy ADR-0011
  đã chấp nhận từ 07/08, không mở lại ở đây.

## Notes

Nợ có tên, người ký chấp nhận cùng gói:

- Bản vá engine chưa tới tay người `pip install` cho tới một chuyến phát hành SDK sau.
- Bốn plugin đã cài vẫn ghim `oneflow-sdk==0.2.18` trong kho riêng của chúng.
- Ai đang có venv chung mất một lần cài lại SDK cho mỗi plugin ở lần chạy đầu sau
  nâng cấp — cùng cái giá bên TS đã áp từ 07/08.

Dòng B4 của roadmap lệch ba chỗ so với hiện trạng, ghi lại để lần sau đọc không nhầm:
"SDK 0.2.20" đã xảy ra qua việc khác (PyPI ở 0.2.23); "bump pin bốn plugin" không phải
việc trong kho này; "bỏ hai `return sys.executable`" gộp hai dòng khác bản chất, chỉ
một trong hai là lớp lỗi gói này đóng.
