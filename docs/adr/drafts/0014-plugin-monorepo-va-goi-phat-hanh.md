# ADR-0014: Plugin chính thức sống trong repo OneFlow, phát hành thành gói có checksum, lõi cài sẵn trong app

- **Ngày:** 2026-10-08 · **Trạng thái:** **Nháp — chưa chấp nhận.** Chờ founder quyết ở mốc
  tái hoạch 09/10. Nằm trong `docs/adr/drafts/` thay vì `docs/adr/` vì guard trôi roadmap
  (`scripts/roadmap/roadmap-drift.mjs`, kiểm A và B) đọc mọi tệp ở cấp trên cùng của
  `docs/adr/`; xem mục "Khi chấp nhận".
- **Nguồn:** khảo sát 08/10/2026 trên `main@8a0df23` và `tong-io/tongflow@be171c9`: đo độ
  lệch hai nhánh, gọi GitHub API cho 39 repo trong manifest, đọc đường cài của app và của
  engine. Bản vẽ: [`docs/assets/oneflow-tu-chu-kien-truc.html`](../../assets/oneflow-tu-chu-kien-truc.html)
  (bản 03 là chuỗi cung ứng mà ADR này quyết).
- **Quan hệ:**
  - **thay thế** cơ chế *"fork từng plugin thành repo riêng, theo nhu cầu"* của
    [ADR-0007](../0007-sequential-plugin-forking.md). Hai luật của ADR đó **giữ nguyên**:
    luật dựng URL viết đúng một chỗ, và manifest phải được validate.
  - **sửa đổi** [ADR-0008](../0008-naming-and-distribution.md) ở đúng một điểm: namespace
    GitHub thôi là tài khoản cá nhân, chuyển sang org của OneFlow. Phần distribution
    `oneflow-sdk` và tên import `tongflow` **không đổi ở ADR này**; đổi tên import là việc
    của một ADR sau, chỉ mở khi ADR này đã thi công xong.
  - cụ thể hoá [ADR-0010](../0010-mainstream-infra-and-models.md) và
    [ADR-0011](../0011-local-first-execution.md) ở tầng phân phối: máy người dùng là nền,
    nên plugin phải tới được máy đó mà không cần git, không cần mạng cho nhóm lõi.

## Bối cảnh

ADR-0007 và ADR-0008 cùng đặt trên một giả định: *plugin `tongflow-*` của upstream tiếp tục
chạy nguyên trạng trên OneFlow*. Đo ngày 08/10, giả định đó không còn đúng.

**Upstream quyết định mã nào chạy trên máy người dùng.**

- 35/39 mục trong [`config/official-plugins.json`](../../../config/official-plugins.json)
  được clone từ tài khoản cá nhân `tong-io`, theo nhánh mặc định, không ghim commit:
  [`plugins-install.server.ts:141`](../../../src/lib/plugins/plugins-install.server.ts) gọi
  `git.clone` không truyền `ref`; [`install-official-plugins.ts:4`](../../../scripts/install-official-plugins.ts)
  ghi thẳng *"Tracks each repo's default branch (no pinned ref)"*.
- Đường engine (chạy workflow và skill) đặt cứng org upstream và bỏ qua `origin` của từng
  mục: [`sdk/tongflow/engine/__main__.py:67`](../../../sdk/tongflow/engine/__main__.py),
  [`engine/plugins.py:34`](../../../sdk/tongflow/engine/plugins.py),
  [`engine-delegate.server.ts:89`](../../../src/lib/task/engine-delegate.server.ts) không
  truyền `org` hay `plugin_git_urls`. Plugin nào chưa cài, kể cả 4 plugin của OneFlow, sẽ bị
  clone từ `tong-io/<id>.git` và trả 404.
- Hậu quả đã xảy ra, không phải giả định:
  - `tongflow-api-agnes` đã bị xoá (`git ls-remote` → *Repository not found*);
  - `tongflow-api-openrouter-free` và `tongflow-api-apimart` đã đổi tên, chỉ còn chạy nhờ
    GitHub tự chuyển hướng;
  - HEAD của `tongflow-api-bytedance` import `tongflow.models.refs_gen_video`, module không
    có trong SDK 0.2.23.

**Image GPU dựng từ SDK của upstream.** 29 plugin Modal của upstream gọi
`pip_install("tongflow==0.3.3")` (17 plugin), `==0.2.21` (11) hoặc `==0.2.20` (1). Gói PyPI
`tongflow` thuộc upstream. Image được dựng trong workspace Modal của người dùng, bằng token
và secret của họ. Câu trong `CLAUDE.md` và `docs/plugins.md` rằng mọi `deploy.py` ghim
`oneflow-sdk` là sai với cả 29 plugin này.

**Hai nhánh đã tách hẳn.** Lần cuối chung lịch sử là 24/07. Từ đó OneFlow có 1.271 commit,
upstream 261, và hai bên cùng sửa 45 tệp trong `src/`, `sdk/`, `config/`. Upstream đã dời ABI
sang `packages/tongflow/abi/` và thêm loại plugin `router`, loại bị
[`plugin-id.ts:22`](../../../src/lib/plugins/plugin-id.ts) từ chối. Theo dõi upstream bằng
cách merge không còn khả thi.

**Không repo plugin nào có giấy phép.** GitHub trả `license: null` cho cả 38 repo còn tồn tại,
gồm 34 repo của `tong-io` và 4 repo của `phanlemanh`. README của plugin upstream cũng không ghi
giấy phép. Repo không khai giấy phép mặc định là giữ mọi quyền: được xem và fork trong phạm vi
điều khoản GitHub, nhưng không có quyền sửa rồi phân phối lại. Cài sẵn vào bản app hay mirror
sang org khác đều là phân phối lại. *(Nhận định pháp lý này chưa qua luật sư.)*

**Mô hình một-repo-một-plugin không vừa sức một người.** 39 repo, mỗi lần đổi ABI phải bump pin
SDK ở hàng chục nơi, và không có cách đổi ABI, SDK và plugin trong cùng một lần kiểm.

**Hạ tầng phía máy đã sẵn.** Mỗi plugin đã có venv riêng
([`plugin-python-env.server.ts`](../../../src/lib/plugins/plugin-python-env.server.ts), từ
08/2026), và venv đã cài SDK từ resources của app chứ không từ PyPI. Thứ còn thiếu nằm ở phía
nguồn và phát hành.

## Các phương án đã cân nhắc

| | Phương án | Vì sao không chọn làm đường chính |
|---|---|---|
| A | Giữ mô hình upstream, đổi chủ: mỗi plugin một repo trên org OneFlow, git clone, ghim `rev` | Đổi chủ của vấn đề, không đổi vấn đề: vẫn 39 repo, vẫn không nguyên tử, vẫn cần git và mạng trên máy người dùng |
| B | Mỗi plugin là một wheel PyPI, cài bằng `uv` | PyPI vẫn nằm trên đường cài lúc chạy; đổi ABI vẫn phải phát hành hàng chục gói |
| **C** | **Plugin chính thức trong repo OneFlow; CI build từng plugin thành gói có sha256; app đọc một index đã ghim** | **Chọn** |
| **D** | **Cài sẵn plugin lõi trong bản phát hành app** | **Chọn, đi cùng C** |
| E | Registry hoặc marketplace đầy đủ: OCI, chữ ký, trang duyệt, tác giả ngoài | Đúng cho lúc có cộng đồng tác giả; xây bây giờ là xây trước nhu cầu. Chừa đường, không xây |

## Quyết định

1. **Nguồn.** Plugin chính thức của OneFlow sống trong repo OneFlow, mỗi plugin một thư mục
   (tên thư mục chốt lúc thi công, ví dụ `plugins-src/<id>/`; không dùng `plugins/`, vốn là
   chỗ cài lúc chạy và đang bị gitignore). **Định dạng plugin không đổi** ở ADR này:
   `tongflow.plugin.json`, `entry.py`, tuỳ chọn `deploy.py` và `download.py`. Đổi ABI, SDK
   và mọi plugin bị ảnh hưởng đi trong cùng một PR, và CI chạy conformance cho toàn bộ
   plugin trong lần đó.

2. **Phát hành.** Mỗi plugin có số phiên bản riêng, độc lập với app (tag kiểu
   `plugin/<id>@x.y.z`). CI build một gói gồm mã, `tongflow.plugin.json` và lockfile phụ
   thuộc có hash, tính sha256, rồi công bố lên nơi chứa của org. Sửa một plugin không bắt
   phải ra bản app.

3. **Plugin GPU.** CI dựng image container từ `oneflow-sdk` và đẩy lên registry container
   của org; `deploy.py` dùng image đó (ví dụ `Image.from_registry`). Không image nào còn
   `pip_install` SDK của upstream.

4. **Index.** Một tệp index (gọi tạm `registry.json`) liệt kê, cho từng plugin: `id`,
   `version`, `url`, `sha256`, dải phiên bản SDK tương thích, và nguồn (`oneflow` hay
   `ngoài`). Index đi kèm mỗi bản app và được ghim theo phiên bản app.
   `config/official-plugins.json` tiến hoá thành index này. Không giữ hai danh mục song song.

5. **Một resolver.** App và engine đọc cùng một index qua cùng một hàm; engine không còn org
   mặc định. Cài plugin gồm: tải gói, kiểm sha256, giải nén, tạo venv riêng bằng cơ chế hiện
   có. Sai checksum là từ chối cài; không có đường lùi về git clone. Máy người dùng không cần
   git. Git clone chỉ còn ở chế độ phát triển, sau một cờ rõ ràng.

6. **Cài sẵn (D).** Bản Docker, và bản desktop khi S5 hạ cánh, mang sẵn nhóm plugin lõi chạy
   tại máy hoặc qua API. Nhóm lõi khai bằng một cờ trong index. Mở app lần đầu là chạy được
   nhóm lõi mà không cần mạng để cài plugin. Plugin GPU vẫn tải theo nhu cầu.

7. **SDK.** Đường chạy không đi qua PyPI: venv cài SDK từ resources của app. Gói PyPI
   `oneflow-sdk` giữ lại cho CI và cho tác giả plugin bên ngoài.

8. **Plugin ngoài, gồm cả 35 plugin upstream.** Mục ngoài bắt buộc có `origin` và `rev`, cùng
   `sha256` khi có gói. UI gắn nhãn "nguồn ngoài". Mục ngoài **không** được cài sẵn và
   **không** được đóng gói lại. Mỗi plugin upstream rời trạng thái này theo đúng một trong ba
   đường:
   - **(a) port:** tong-io khai giấy phép cho repo đó; port vào repo OneFlow, giữ ghi công
     trong NOTICE;
   - **(b) viết lại sạch:** không đọc rồi chép mã upstream. Hợp với plugin API, thường chỉ vài
     trăm dòng bọc API, và đúng hướng ADR-0010 và ADR-0011;
   - **(c) gỡ** khỏi index.

9. **Nơi chứa là thay được.** GitHub Releases và registry container của org chỉ là chỗ để tệp.
   Tính toàn vẹn do sha256 trong index bảo đảm, nên chuyển nơi chứa (R2, S3, máy chủ riêng)
   chỉ là đổi URL trong index. Không tự host git.

10. **Org.** OneFlow lập org GitHub riêng (tên do founder chốt). Repo app, mã plugin chính
    thức và nơi chứa gói đều về org đó.

11. **Không xây marketplace (E)** cho tới khi điều kiện ở mục "Điều kiện mở lại" xảy ra.

## Thứ tự thi công

Đây là thứ tự kỹ thuật, không phải hạng mục roadmap. Đưa lên ★ hay không là việc của mốc tái
hoạch.

| Bước | Nội dung | Đổi kiến trúc? |
|---|---|---|
| 0 · cầm máu | Ghim `rev` cho mọi mục upstream; engine dùng chung resolver với app; gỡ `agnes`; sửa câu sai về pin SDK trong `CLAUDE.md` và `docs/plugins.md`; thêm tệp LICENSE (AGPL) vào 4 repo của OneFlow | Không. Làm được trước khi ADR này được chấp nhận |
| 1 · nguồn và index | Lập org; chuyển 4 plugin của OneFlow vào repo; index có sha256; resolver kiểm checksum; CI build gói | Có |
| 2 · GPU và cài sẵn | Image GPU dựng sẵn từ `oneflow-sdk`; Docker mang nhóm lõi; desktop theo S5 | Có |
| 3 · upstream | Xếp từng plugin trong 35 plugin upstream vào (a), (b) hoặc (c) | Theo từng plugin |

## Hệ quả

**Được:**

- Upstream mất hẳn vai trò lúc chạy: không đường cài nào còn trỏ `tong-io` hay PyPI `tongflow`.
- Đổi ABI nguyên tử; hết cảnh bump pin `pip_install` ở hàng chục repo.
- Chạy offline với nhóm lõi, khớp ADR-0011.
- Cùng một gói phục vụ cả máy người dùng lẫn worker của tier managed (bản vẽ 04), nên tier
  managed không cần đường phân phối thứ hai.
- Sửa được một lỗ chuỗi cung ứng: hôm nay upstream push gì, máy người dùng nhận nấy.

**Chịu:**

- Plugin không còn "push là tới": muốn tới người dùng phải phát hành. Đây là chủ đích, không
  phải tác dụng phụ.
- CI của repo app nặng thêm phần build plugin.
- Plugin mới của upstream (loại `router`, các model GPU mới) không tự chảy về; mỗi cái phải qua
  (a) hoặc (b).
- Thời gian chuyển: 35 plugin upstream nằm ở trạng thái "nguồn ngoài, đã ghim" cho tới bước 3.

**Phải sửa cùng lúc khi thi công bước 1** (các ràng buộc đang khoá mô hình cũ):

- [`check-manifest-unmoved.sh`](../../../scripts/plugins/check-manifest-unmoved.sh) đếm đúng
  35 + 4 mục và khoá `org` bằng `tong-io`;
  [`check-no-config-drift.sh`](../../../scripts/plugins/check-no-config-drift.sh) cũng khoá
  `org`. Bộ răng [`check-manifest-guard-teeth.sh`](../../../scripts/plugins/check-manifest-guard-teeth.sh)
  sẽ đỏ nếu chỉ nới guard mà không viết lại nó.
- [`check-live-docs-manifest-synced.sh`](../../../scripts/plugins/check-live-docs-manifest-synced.sh)
  ở chế độ `claude` neo vào gạch đầu dòng liệt kê id `origin` trong `CLAUDE.md`; ba README liệt
  kê plugin theo manifest.
- Mục "Registering an official plugin" và "Plugin authoring rules" trong `CLAUDE.md` mô tả mô
  hình cũ (đăng ký bằng id trong manifest, ghim SDK trong `deploy.py`) và phải viết lại.
- [`official-manifest.ts`](../../../src/lib/plugins/official-manifest.ts) là resolver hiện
  tại; nó trở thành resolver của index, không thêm resolver thứ hai.
- Quy tắc id plugin (`plugin-id.ts`, `_PLUGIN_PREFIXES` trong `sdk/tongflow/scan.py`) **không
  đổi** ở ADR này.

**Giấy phép:** plugin trong repo OneFlow theo AGPL-3.0 của repo. Gói và image phân phối ra đều
có mã nguồn tương ứng công khai trong repo (§6). Plugin port theo đường (a) giữ ghi công
tong-io.

## Điều kiện đảo chiều và mở lại

Chốt trước khi đo, cùng luật với các gate khác trong repo.

- **Tách index khỏi bản app:** nếu trong 60 ngày sau bước 2, **≥ 3 lần** người dùng bị chặn vì
  một plugin cần vá mà phải chờ ra bản app mới có index mới, thì index chuyển sang tải riêng
  (khi đó cần chữ ký cho index).
- **Tách repo plugin:** nếu thời gian CI trên `main` vượt **5 phút** trung vị trên 10 lần chạy
  liên tiếp vì phần build plugin, thì mã plugin chính thức chuyển sang repo riêng của org, giữ
  nguyên index và định dạng gói. Mốc đo 23/09/2026: lần chạy CI trên `main` dài nhất là 2 phút,
  các job chạy song song.
- **Mở lại E (marketplace):** khi có ít nhất một tác giả ngoài OneFlow muốn phát hành plugin
  qua kênh chính thức.

## Câu hỏi mở, phải chốt trước khi chấp nhận

1. **Tên org GitHub.**
2. **Mã plugin chính thức trong repo app hay một repo riêng?** ADR này chọn repo app vì đổi ABI
   được nguyên tử; điều kiện tách ở mục trên là lối thoát nếu CI nặng.
3. **Nơi chứa gói:** đề xuất GitHub Releases cho gói và registry container của org cho image GPU.
4. **Upstream: xin giấy phép hay viết lại,** và danh sách plugin nằm trên đường tới hạn của
   skill #1. Xin giấy phép là một issue công khai trên `tong-io/tongflow`; founder gửi.
5. **Ký số ngay từ đầu?** Đề xuất: chưa. Index đi kèm bản app và mang sha256 là đủ ở chặng này;
   ký số đi cùng điều kiện "tách index khỏi bản app".

## Khi chấp nhận

- Chuyển tệp này từ `docs/adr/drafts/` lên `docs/adr/0014-…md` và thêm một dòng vào mục lục
  [`docs/adr/README.md`](../README.md). Dòng đó ghi "thay thế ADR-0007 (cơ chế fork)".
- Cùng PR đó phải sửa `docs/roadmap.md`, vì guard
  [`roadmap-drift.mjs`](../../../scripts/roadmap/roadmap-drift.mjs) sẽ đỏ ở hai chỗ:
  - **A:** roadmap phải nhắc ADR-0014 ít nhất một lần;
  - **B:** mọi khối roadmap đang viện dẫn ADR-0007 phải nhắc kèm ADR-0014. Đo 08/10 có bốn
    khối: hàng S6, hạng mục 0.1, và hai dòng sổ cái `per-plugin-origin` và
    `dang-ky-fork-openai`.
- Hạt giống *"gỡ phụ thuộc thượng nguồn lúc chạy"* trong bảng «Xếp lại sau» của roadmap là
  hàng mà ADR này cụ thể hoá; mốc tái hoạch quyết nó lên ★ ra sao.
- Mục lục `docs/adr/README.md` hiện thiếu dòng cho ADR-0013. Vá cùng lúc.
