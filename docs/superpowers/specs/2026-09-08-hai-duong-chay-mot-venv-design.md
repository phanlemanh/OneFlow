# Hai đường chạy, một venv — thiết kế

**Slug:** `hai-duong-chay-mot-venv` · **Hạng:** T3 (`sdk/**`) · **Dòng kế hoạch:** B4
**Ngày:** 2026-09-08 · **Nhánh:** `feat/hai-duong-chay-mot-venv`

## Vấn đề

Hai runtime cùng ghi vào **một đường dẫn** `data/.tongflow/plugin-venv`, với hai
ý nghĩa loại trừ nhau.

Bên TypeScript ([`plugin-python-env.server.ts:37`](../../../src/lib/plugins/plugin-python-env.server.ts))
coi nó là **thư mục chứa nhiều venv con**, một venv mỗi plugin — bố cục ADR-0011
đặt ra ngày 07/08 để hai plugin không tranh nhau phiên bản thư viện. Nó có
`removeLegacySharedVenv()` dò `pyvenv.cfg` **ngay tại gốc** để nhận ra venv chung
đời cũ rồi `rm -rf` cả gốc.

Bên engine Python ([`sdk/tongflow/engine/plugins.py:99`](../../../sdk/tongflow/engine/plugins.py))
dựng **một venv chung ngay tại đường dẫn ấy** — tức đặt một `pyvenv.cfg` vào đúng
chỗ bên kia coi là dấu hiệu của xác cần dọn.

Kết quả: chạy engine headless một lần trên máy có plugin đã cấp phát, lần sau app
cấp phát bất kỳ plugin nào là **xoá sạch mọi venv per-plugin**. Engine lại dựng
venv chung. Hai bên phá nhau, và bên thua không kêu.

Chú thích `# --- shared venv (mirrors plugin-python-env.server.ts)` ở dòng 95
chính là lời hứa đã bị phá — và là bằng chứng rằng thoả thuận bằng chú thích
không giữ được hai bản cài đặt khỏi trôi.

Hai lớp lỗi phụ đi kèm, cùng họ "hỏng mà không kêu":

- `except Exception: log(...); return sys.executable` (dòng 235) — người gọi bảo
  "hãy cấp phát", việc cấp phát hỏng, máy trả về interpreter môi trường và chạy
  plugin với bất kỳ gói nào tình cờ import được.
- `_ensure_shared_venv` ghim `pip install <dist>==<phiên bản của chính gói đang chạy>`.
  Mỗi lần kho bump version mà chưa publish — cửa sổ tồn tại ở **mọi** lần phát
  hành — lệnh ấy không giải được, ném lỗi, và cái `except` trên nuốt gọn.

## Quét không gian tiêu chí (morphological scan)

**Chân sản phẩm:** `[SUY-TỪ-REPO: CLAUDE.md]` — mô hình plugin hợp nhất, mỗi
plugin là một tiến trình con; ADR-0011 đặt máy người dùng làm nền thi hành mặc
định nên phụ thuộc nặng nằm ở đây thay vì trong ảnh Modal.
`[SUY-TỪ-REPO: src/lib/plugins/plugin-python-env.server.ts]` — lý do cô lập
được viết thẳng trong header: venv chung là chỗ cho xung đột phiên bản mà
`pip check` chỉ *cảnh báo*, bên thua bị đè im lặng và lỗi hiện ra lúc chạy dưới
dạng hành vi sai chứ không phải lúc cài dưới dạng lỗi.

**Chân ngành:** `[NGÀNH: pipx]` — pipx tồn tại chính vì lớp lỗi này: mỗi ứng
dụng một venv riêng, không bao giờ chung, và thư mục gốc của nó là thư mục
*chứa* các venv chứ không phải một venv. `[NGÀNH: pnpm node_modules]` — bên TS
của chính kho này đã theo mô hình cô lập per-package; dòng roadmap "như TS" là
đối chiếu ấy.

Preset `test-matrix` không khớp: trục của nó (surface, role, trạng thái dữ liệu,
mạng) là trục của một sản phẩm web nhiều phía. Bài toán này là lỗi hạ tầng giữa
hai runtime, nên dựng trục từ đầu theo B1.

### Trục

- **A · Ai đang ghi vào thư mục venv:** chỉ engine Python (headless) | chỉ app
  TypeScript (người bấm nút) | **cả hai lần lượt trên cùng máy** | chưa ai.
  *Độc lập:* đổi ai ghi không ép đổi trạng thái đĩa trước đó.
  [thước CE: lịch sử nội bộ — `removeLegacySharedVenv` tồn tại vì đúng lớp lỗi này
  đã xảy ra ngày 06–07/08; `[NGÀNH: pipx]`]
- **B · Trạng thái đĩa trước khi chạy:** trống | venv chung đời cũ (`pyvenv.cfg`
  ngay tại gốc) | venv per-plugin đúng bố cục | hỗn hợp (per-plugin + `pyvenv.cfg`
  lạc ở gốc).
  *Độc lập:* trạng thái đĩa là kết quả của lịch sử, không của người ghi hiện tại.
  [thước CE: bốn trạng thái là đóng — `pyvenv.cfg` có hoặc không, thư mục con có
  hoặc không]
- **C · Đường lấy SDK:** chạy từ checkout (có `pyproject.toml` ở `SDK_ROOT`) |
  chạy từ site-packages | phiên bản kho > PyPI (cửa sổ phát hành).
  *Độc lập:* trực giao với A và B.
  [thước CE: chú thích dòng 175 của `plugins.py` khai đúng hai đường; đường thứ
  ba là cửa sổ giữa hai lần]
- **D · Kết cục khi cấp phát trục trặc:** trơn tru | `python -m venv` hỏng |
  `pip install` hỏng | `auto_install=False` (người gọi tự khai không cấp phát).
  *Độc lập:* cách hỏng không phụ thuộc ai gọi hay đĩa đang ra sao.
  [thước CE: ba nhánh `raise` sẵn có trong `_ensure_shared_venv` /
  `_ensure_plugin_requirements`, cộng nhánh `not auto_install`]

### Cross-cutting áp mọi ô Core

- **Id plugin không an toàn** — id đến từ tên thư mục trên đĩa rồi bị nối vào
  đường dẫn. Bên TS đã có `venvDirFor` chặn; bên Python chưa.
- **Hai bên trôi khỏi nhau về hằng đường dẫn** — chính là lỗi gốc, và là lý do
  guard tồn tại.

### Core

1. **A=engine × B=trống** — dựng venv per-plugin, gốc không có `pyvenv.cfg`. → AC-1
2. **A=engine × B=venv chung đời cũ** — dọn rồi dựng lại per-plugin. → AC-2
3. **A=cả hai lần lượt × B=per-plugin đã có** — app không xoá mất venv nào.
   Đây là ô sinh ra cả dòng B4. → AC-3
4. **Cross-cutting hằng đường dẫn** — guard đỏ khi hai bên lệch. → AC-4
5. **C=checkout** — cài SDK từ `SDK_ROOT`. → AC-5
6. **C=site-packages** — giữ nguyên ghim `<dist>==<version>`. → AC-6
7. **D=pip hỏng** — ném lỗi có tên, không trả `sys.executable`. → AC-7
8. **D=`auto_install=False`** — vẫn trả `sys.executable`, chế độ giữ nguyên. → AC-8
9. **A=engine, nhiều plugin** — mỗi plugin chạy bằng interpreter của chính nó. → AC-9
10. **Cross-cutting id không an toàn** — từ chối, không tạo thư mục ngoài gốc. → AC-10

Mười ô Core trên một không gian danh nghĩa 4×4×3×4 = 192, phần lớn vô nghĩa
(vd "chưa ai ghi × venv per-plugin đã có"). Vượt 50 ca nên cắt theo pairwise:
mỗi cặp giá trị mang lỗi xuất hiện ít nhất một lần.

### Later

- **B=hỗn hợp × A=app** — trạng thái sau khi engine cũ chạy đè lên bố cục mới.
  AC-3 phủ chiều nguy hiểm (app xoá nhầm); chiều còn lại là dọn dẹp một lần.
- **D=`python -m venv` hỏng** — cùng lớp với D=pip hỏng, cùng một `raise`; AC-7
  đo lớp ấy.
- **Đo thời gian cài lần đầu** — cô lập đổi lấy một bản SDK mỗi venv; giá đã
  được ADR-0011 chấp nhận từ 07/08, không mở lại ở gói này.

### Never

- **Chia sẻ một venv có khoá phiên bản** — chính là thứ ADR-0011 bỏ; `pip check`
  chỉ cảnh báo nên xung đột vẫn im.
- **Đưa bố cục ra file khai báo cho cả hai runtime đọc** — sạch về nguyên lý
  nhưng thêm một vật lúc chạy trên bề mặt T3, cho hai đoạn đường dẫn. YAGNI.

## Thiết kế

### Bố cục thư mục LÀ hợp đồng

`data/.tongflow/plugin-venv/` là **thư mục chứa các venv**, một venv mỗi plugin,
không bao giờ tự nó là một venv. Cả hai runtime ghi bố cục ấy; một guard ghim để
chúng không trôi khỏi nhau lần nữa.

### Bên TypeScript: không sửa gì

Nó đã đúng từ 07/08 — per-plugin, `venvDirFor` validate id, `removeLegacySharedVenv`
dọn di trú. Sau khi engine thôi cắm `pyvenv.cfg` vào gốc, hàm dọn ấy trở lại đúng
vai ban đầu: di trú một lần cho người dùng trước 07/08. Giữ nguyên.

### Bên Python — năm thay đổi trong `sdk/tongflow/engine/plugins.py`

**Tách đường dẫn.** `_venv_dir(data_dir)` thành `_venv_root(data_dir)` và
`_venv_dir(root, plugin_id)` = `root/<plugin_id>`, kèm validate id đúng luật bên
TS (`^[a-zA-Z0-9._-]+$`, không bắt đầu bằng dấu chấm).

**Dọn venv chung đời cũ.** `_remove_legacy_shared_venv(root)`: thấy `pyvenv.cfg`
ngay tại gốc thì xoá cả gốc. Đối xứng với bên TS, và bắt buộc — thiếu nó thì venv
chung đời cũ vẫn nằm đó, bên TS vẫn `rm -rf`, vòng phá nhau chưa đóng.

**Một venv mỗi plugin.** `_ensure_shared_venv` thành `_ensure_venv_for(plugin_id, …)`;
marker `sdk.version` theo từng venv thay vì theo gốc.

**Rẽ nhánh đường lấy SDK.** `SDK_ROOT/pyproject.toml` tồn tại → `pip install <SDK_ROOT>`;
không → `pip install <dist>==<version>` như cũ. Đóng cửa sổ phát hành mà không
mất đường site-packages mà chú thích dòng 175 lo.

**Interpreter theo plugin.** `prepare_python_env` đổi kiểu trả về từ `str` sang
`dict[str, str]` (plugin_id → interpreter). `runner.py:527` đổi `python=python`
thành `python=pythons[plugin_id]` — chỗ gọi đã có sẵn `plugin_id`, nên thay đổi
cục bộ. Nhánh `auto_install=False` trả dict với cùng `sys.executable` cho mọi
plugin: chế độ giữ nguyên nghĩa.

`except Exception` ở dòng 235 **biến mất**. Cấp phát hỏng thì ném lỗi có tên.

### Guard buộc hằng số

Một script đọc hằng đường dẫn ở **cả hai** file và đỏ khi lệch, cộng đỏ khi một
trong hai bên đánh mất bước dọn venv đời cũ. Đúng một guard, có răng ngay từ đầu.

Đây là mẫu **coupled constants** CLAUDE.md đã ghi và kho đã có tiền lệ
(`check-manifest-unmoved.sh`, `check-live-docs-manifest-synced.sh`). Nó **không**
phải "guard canh guard" — nó không canh một phép đo, nó ghim một hằng số giữa hai
bản cài đặt. Ranh giới ấy mỏng, nên giữ đúng một tầng, không đẻ thêm.

## Quyết định phạm vi (owner chốt 08/09)

- **Chỉ sửa va chạm trong kho.** Không publish SDK, không bump phiên bản, không
  chạm bốn kho plugin. Cả ba thành nợ có tên.
- **Chỉ bỏ fallback im lặng** (dòng 235). Giữ `auto_install=False` — đó là chế độ
  người gọi tự khai, có tài liệu (`sdk/README.md:30`), và bộ test của SDK dùng nó
  (`tests/test_engine.py:364`). Bỏ nó là breaking change của gói đã trên PyPI.
- **Không bump phiên bản, và đóng luôn cửa sổ drift** bằng nhánh checkout ở trên.

## Nợ có tên

- Bản vá engine chưa tới tay người `pip install` cho tới khi có một chuyến phát
  hành SDK. PyPI đang ở 0.2.23, khớp kho.
- Bốn plugin đã cài vẫn ghim `oneflow-sdk==0.2.18` trong kho riêng của chúng;
  `plugins/` bị gitignore nên không eval nào trong kho này đo được.
- Ai đang có venv chung sẽ mất một lần cài lại SDK cho mỗi plugin ở lần chạy đầu
  sau nâng cấp — cùng cái giá bên TS đã áp từ 07/08.

## Dòng roadmap lệch ở ba chỗ, ghi lại để lần sau đọc không nhầm

- "SDK 0.2.20" — viết 04/09; PyPI đã có tới 0.2.23 qua việc khác. Không còn là
  việc của B4.
- "bump pin bốn plugin" — `plugins/` bị gitignore; đó là bốn kho riêng, không
  phải sửa trong kho này.
- "bỏ hai `return sys.executable`" — hai dòng ấy khác bản chất; chỉ một trong hai
  là lớp lỗi B4 đóng.
