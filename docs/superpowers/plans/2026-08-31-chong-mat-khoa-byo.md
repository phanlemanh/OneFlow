# Chống mất khoá BYO — kế hoạch thực thi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kho khoá BYO phân biệt được "chưa có khoá" với "không đọc được khoá", và từ chối ghi đè ở trạng thái thứ hai thay vì xoá sạch khoá cũ trong im lặng.

**Architecture:** Một bộ đọc duy nhất (`readEnvStore`) trả union ba trạng thái, ép mọi nơi gọi phải quyết bằng trình biên dịch. Seam lưu trữ đổi *hợp đồng* mà giữ *chữ ký*, nên bản `src/ext/` của vỏ cloud không vỡ build. `loadEnvStore` giữ tên, thành lớp mỏng khoan dung cho nhóm Đọc-để-chạy — nhờ vậy quyết định "không chặn lượt chạy nào" là một dòng mã có chú thích, không phải một điều phải nhớ.

**Tech Stack:** TypeScript · Next.js App Router (route handlers) · vitest + @testing-library/react · next-intl · Biome.

**Spec:** [`docs/superpowers/specs/2026-08-31-chong-mat-khoa-byo-design.md`](../specs/2026-08-31-chong-mat-khoa-byo-design.md)
**Hợp đồng:** [`_acceptance/chong-mat-khoa-byo/contract.md`](../../../_acceptance/chong-mat-khoa-byo/contract.md) — 14 AC / 18 eval, đã duyệt Cổng 1 ngày 31/08.

## Global Constraints

- **Comment trong mã: tiếng Anh only** (luật `CLAUDE.md`).
- **CẤM mock seam lưu trữ.** Test đặt `process.env.TONGFLOW_DATA_DIR` trỏ một thư mục tạm THẬT; `vitest.config.ts` đã alias `@ext → src/ext-default`. Chú thích trong chính file đó ghi lại vì sao: *"which is how the AC-9 round trip ended up asserting against a mock."*
- **Tên file test phải khớp ĐÚNG 12 khoá executor đã khai** trong `_acceptance/config.yaml` (`unit_byo_*`). Đổi tên file = eval trỏ vào hư không.
- **Mọi phép đo mới cần cặp hai chiều trên CÙNG fixture** (`MEASURE-BIRTH-CLAUSE`): vật lành → xanh; phá vật thật trong bản sao → đỏ với **thông điệp ghim** (tên ca/bất biến, không chỉ exit code). Task nào viết test thì verify của task đó **phải chứa lượt phá-thử**.
- **KHÔNG tạo file mới dưới `scripts/acceptance/**`** — đo được là kéo thêm `gate-tooling-t1` và `stale-scope-by-paths` vào wave re-pin.
- **Bản mẫu và script a11y ĐÃ commit** (`src/components/proto/chong-mat-khoa-byo-proto.tsx`, `scripts/settings/check-a11y-proto.sh`). Không dựng lại.
- **`ja.json` đang thiếu 76 khoá** so với 4 locale kia (đo 31/08: 987 vs 1063). Phép đo i18n của gói việc này cố ý **hẹp theo tập file**, đừng nới thành toàn repo.
- **Cờ trên PUT tên là `replaceUnreadableStore`**, không phải `force`.
- Mã lỗi máy-đọc-được duy nhất: **`ENV_STORE_UNREADABLE`**.

## File Structure

| File | Trách nhiệm | Task |
|---|---|---|
| `src/ext-default/settings-store.ts` | *Modify* — `null` chỉ cho ENOENT, lỗi khác ném | 1 |
| `src/lib/settings/env-store.server.ts` | *Modify* — `readEnvStore` union; `loadEnvStore` thành lớp mỏng | 2 |
| `src/lib/settings/env-store.server.test.ts` | *Create* — E1–E4 | 1, 2 |
| `src/app/api/settings/env/route.ts` | *Modify* — GET 503; PUT 409 + cờ | 3, 4 |
| `src/app/api/settings/env/route.unreadable.test.ts` | *Create* — E5, E6, E7 | 3, 4 |
| `src/app/api/settings/env/route.test.ts` | *Modify* — E8 không hồi quy | 4 |
| `src/lib/media-library/config.server.ts` | *Modify* — trạng thái thứ ba | 5 |
| `src/lib/media-library/config.server.test.ts` | *Modify* — E9 | 5 |
| `src/i18n/messages/{en,ja,ko,vi,zh}.json` | *Modify* — chuỗi mới | 6 |
| `src/i18n/locale-parity.test.ts` | *Create* — E16 | 6 |
| `src/components/workspace/settings-dialog.tsx` | *Modify* — trạng thái kho-hỏng + thoát + xác nhận | 7 |
| `src/components/workspace/settings-dialog.test.tsx` | *Create* — E10, E12 | 7 |
| `src/components/workspace/nodes/add/media-library-config-panel.tsx` | *Modify* — từ chối lưu | 8 |
| `src/components/workspace/nodes/base/abi-node-shell.tsx` | *Modify* — từ chối lưu, **và đưa chuỗi qua i18n** | 8 |
| `…/media-library-config-panel.test.tsx`, `…/abi-node-shell.test.tsx` | *Create* — E14 | 8 |

> **Một cái bẫy đã đo, task 8 phải xử:** `abi-node-shell.tsx` hôm nay **không dùng `useTranslations`** — nó ghi cứng tiếng Việt (`Không lưu được khoá (HTTP ${res.status})`). Nếu thêm chuỗi cứng nữa vào đó thì phép đo E16 (quét lời gọi `t("...")`) **không thấy**, và AC-13 xanh rỗng đúng lớp lỗi mà Cổng 1 vừa vá ba lần. Task 8 vì thế **bắt buộc** đưa chuỗi mới của file này qua i18n.

---

### Task 1: Seam phân biệt "chưa có" với "không đọc được"

**Files:**
- Modify: `src/ext-default/settings-store.ts:20-27`
- Test: `src/i18n/../lib/settings/env-store.server.test.ts` → chính xác: `src/lib/settings/env-store.server.test.ts` (tạo mới)

**Phục vụ:** E1 (AC-1). **independent:** `false` — Task 2 dựa lên hợp đồng mới của hàm này.

**Interfaces:**
- Produces: `readSettingsBlob(): Promise<string | null>` — chữ ký KHÔNG đổi. Hợp đồng mới: `null` ⟺ chưa có blob; mọi lỗi khác **ném nguyên lỗi gốc** (giữ `.code`).

- [ ] **Step 1: Viết bài kiểm trượt**

```ts
// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

let dir: string;
beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "byo-seam-"));
    process.env.TONGFLOW_DATA_DIR = dir;
});
afterEach(() => {
    chmodSync(path.join(dir, "settings.json"), 0o600);
    rmSync(dir, { recursive: true, force: true });
    delete process.env.TONGFLOW_DATA_DIR;
});

describe("seam: absent vs unreadable", () => {
    it("returns null when the blob has never been written", async () => {
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).resolves.toBeNull();
    });

    it("throws with the original errno when the file cannot be read", async () => {
        const file = path.join(dir, "settings.json");
        writeFileSync(file, '{"A":"1"}', "utf8");
        chmodSync(file, 0o000);
        if (process.getuid?.() === 0) {
            // chmod cannot lock root out; say so instead of passing silently.
            console.warn("SKIP EACCES branch: running as root");
            return;
        }
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).rejects.toMatchObject({ code: "EACCES" });
    });

    it("throws EISDIR when the path is a directory", async () => {
        mkdirSync(path.join(dir, "settings.json"));
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).rejects.toMatchObject({ code: "EISDIR" });
    });
});
```

- [ ] **Step 2: Chạy để chắc nó TRƯỢT**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts -t 'seam'`
Expected: FAIL — hai ca ném hiện đang trả `null` (mã hôm nay nuốt hết).

- [ ] **Step 3: Sửa seam**

```ts
/** Raw settings blob for the current scope, or null when absent. */
export async function readSettingsBlob(): Promise<string | null> {
    try {
        return readFileSync(await storeFile(), "utf8");
    } catch (error) {
        // ENOENT is the ONLY shape that means "nothing stored yet". Every
        // other errno is a store we cannot read, and collapsing it to null
        // here is what let a single unreadable file masquerade as an empty
        // one all the way up to the write path.
        if ((error as NodeJS.ErrnoException)?.code === "ENOENT") return null;
        throw error;
    }
}
```

- [ ] **Step 4: Chạy lại — phải XANH**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts -t 'seam'`
Expected: PASS (3 ca; ca EACCES tự bỏ qua có thông báo khi chạy dưới uid 0).

- [ ] **Step 5: Lượt PHÁ-THỬ (bắt buộc — MEASURE-BIRTH-CLAUSE)**

Tạm khôi phục `catch { return null; }` cũ, chạy lại lệnh trên.
Expected: FAIL, và thông điệp nêu đúng `EACCES` / `EISDIR` — không phải chỉ exit khác 0. Rồi hoàn nguyên bản sửa.

- [ ] **Step 6: Commit**

```bash
git add src/ext-default/settings-store.ts src/lib/settings/env-store.server.test.ts
git commit -m "fix(settings): seam chi tra null khi chua co blob, con lai nem"
```

---

### Task 2: Bộ đọc ba trạng thái, và lớp khoan dung có chú thích

**Files:**
- Modify: `src/lib/settings/env-store.server.ts:23-42`
- Test: `src/lib/settings/env-store.server.test.ts` (bổ sung)

**Phục vụ:** E2 (AC-2), E3 (AC-3), E4 (AC-4). **independent:** `false` — cần Task 1.

**Interfaces:**
- Consumes: `readSettingsBlob()` với hợp đồng mới của Task 1.
- Produces:
  ```ts
  export type EnvStoreReadReason = "io" | "decode" | "parse" | "shape";
  export type EnvStoreRead =
      | { state: "ok"; env: EnvStore }
      | { state: "absent" }
      | { state: "unreadable"; reason: EnvStoreReadReason };
  export async function readEnvStore(): Promise<EnvStoreRead>;
  export async function loadEnvStore(): Promise<EnvStore>; // chữ ký KHÔNG đổi
  ```

- [ ] **Step 1: Viết bài kiểm trượt**

```ts
describe("readEnvStore: ok vs absent", () => {
    it("returns the stored map verbatim", async () => {
        writeFileSync(path.join(dir, "settings.json"), '{"A":"1","B":"2"}', "utf8");
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        expect(await readEnvStore()).toEqual({ state: "ok", env: { A: "1", B: "2" } });
    });

    it("says absent — not unreadable — when nothing was ever stored", async () => {
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        // Suppression half: a reader that always says "unreadable" passes the
        // case above and is exactly the bug this asserts against.
        expect(await readEnvStore()).toEqual({ state: "absent" });
    });
});

describe("readEnvStore: unreadable matrix", () => {
    // Full matrix: one assertion per cause, and the reasons must be distinct.
    const CAUSES: ReadonlyArray<[string, string, EnvStoreReadReason]> = [
        ["parse", "{oops", "parse"],
        ["shape (valid JSON, wrong shape)", "[1,2,3]", "shape"],
    ];
    it.each(CAUSES)("%s reads as unreadable", async (_label, blob, reason) => {
        writeFileSync(path.join(dir, "settings.json"), blob, "utf8");
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        expect(await readEnvStore()).toEqual({ state: "unreadable", reason });
    });

    it("io: an unreadable file reads as unreadable", async () => {
        const file = path.join(dir, "settings.json");
        writeFileSync(file, '{"A":"1"}', "utf8");
        chmodSync(file, 0o000);
        if (process.getuid?.() === 0) { console.warn("SKIP io branch: root"); return; }
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        expect(await readEnvStore()).toEqual({ state: "unreadable", reason: "io" });
    });

    it("decode: a codec failure reads as unreadable", async () => {
        writeFileSync(path.join(dir, "settings.json"), "ciphertext", "utf8");
        vi.doMock("@ext/settings-codec", () => ({
            encodeEnvStore: async (s: string) => s,
            decodeEnvStore: async () => { throw new Error("bad key"); },
        }));
        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        expect(await readEnvStore()).toEqual({ state: "unreadable", reason: "decode" });
        vi.doUnmock("@ext/settings-codec");
    });

    it("the four reasons are distinct", () => {
        expect(new Set(["io", "decode", "parse", "shape"]).size).toBe(4);
    });
});

describe("loadEnvStore stays tolerant", () => {
    it("never throws and returns {} for every non-ok state", async () => {
        // Proves owner decision 2: an unreadable store must not block a run.
        writeFileSync(path.join(dir, "settings.json"), "[1,2,3]", "utf8");
        const { loadEnvStore } = await import("@/lib/settings/env-store.server");
        await expect(loadEnvStore()).resolves.toEqual({});
    });
});
```

- [ ] **Step 2: Chạy để chắc nó TRƯỢT**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts -t 'readEnvStore'`
Expected: FAIL — `readEnvStore` chưa tồn tại.

- [ ] **Step 3: Cài đặt**

```ts
export type EnvStoreReadReason = "io" | "decode" | "parse" | "shape";

export type EnvStoreRead =
    | { state: "ok"; env: EnvStore }
    | { state: "absent" }
    | { state: "unreadable"; reason: EnvStoreReadReason };

function coerce(parsed: unknown): EnvStore | null {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const out: EnvStore = {};
    for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof k === "string" && k.trim() && typeof v === "string") out[k] = v;
    }
    return out;
}

/**
 * The one reader. Callers must decide what "unreadable" means for them — the
 * compiler will not let a new call site forget the third state, which is the
 * whole point: the previous single-shape reader let every caller inherit
 * "treat a broken store as an empty one" without ever choosing it.
 */
export async function readEnvStore(): Promise<EnvStoreRead> {
    let raw: string | null;
    try {
        raw = await readSettingsBlob();
    } catch {
        return { state: "unreadable", reason: "io" };
    }
    if (raw == null) return { state: "absent" };

    let decoded: string;
    try {
        decoded = await decodeEnvStore(raw);
    } catch {
        return { state: "unreadable", reason: "decode" };
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(decoded);
    } catch {
        return { state: "unreadable", reason: "parse" };
    }

    const env = coerce(parsed);
    // Valid JSON of the wrong shape is a corrupt store, not an empty one.
    // This branch used to return {} and was the quietest of the three swallows.
    if (env == null) return { state: "unreadable", reason: "shape" };
    return { state: "ok", env };
}

/**
 * Tolerant reader for the RUN path (`withStoredEnv`, the director).
 *
 * Owner decision 2 (31/08): an unreadable store must NOT block a run — a
 * broken settings file would otherwise stop even local nodes that need no key
 * at all, turning a small fault into a total outage. So this collapses both
 * `absent` and `unreadable` to `{}`, deliberately, in one place with a name.
 * The write path and the display path use `readEnvStore` instead.
 */
export async function loadEnvStore(): Promise<EnvStore> {
    const read = await readEnvStore();
    return read.state === "ok" ? read.env : {};
}
```

- [ ] **Step 4: Chạy — phải XANH**

Run: `pnpm vitest run src/lib/settings/env-store.server.test.ts` (cả 3 nhóm) rồi `pnpm typecheck`
Expected: PASS + typecheck sạch.

- [ ] **Step 5: Lượt PHÁ-THỬ (ba lượt, mỗi lượt một nhánh)**

1. Đổi nhánh `absent` thành `unreadable` → nhóm `ok vs absent` phải đỏ, thông điệp chứa `absent`.
2. Cho `coerce` trả `{}` thay vì `null` ở ca sai hình dạng → ca `shape` phải đỏ nêu chữ `shape`.
3. Cho `loadEnvStore` ném ở ca `io` → nhóm `stays tolerant` phải đỏ.

Hoàn nguyên cả ba sau khi xác nhận.

- [ ] **Step 6: Commit**

```bash
git add src/lib/settings/env-store.server.ts src/lib/settings/env-store.server.test.ts
git commit -m "feat(settings): readEnvStore tra ba trang thai, loadEnvStore thanh lop khoan dung"
```

---

### Task 3: GET nói ra khi kho hỏng

**Files:**
- Modify: `src/app/api/settings/env/route.ts:1-23`
- Test: `src/app/api/settings/env/route.unreadable.test.ts` (tạo mới)

**Phục vụ:** E5 (AC-5), E10 dùng chung file test cho nửa server. **independent:** `false` — cần Task 2.

**Interfaces:**
- Consumes: `readEnvStore()` từ Task 2.
- Produces: `GET` trả `503` `{ error: string, code: "ENV_STORE_UNREADABLE" }` khi hỏng; `200` `{ env, pluginEnv }` khi `ok`/`absent`.

- [ ] **Step 1: Viết bài kiểm trượt**

```ts
// @vitest-environment node
import { describe, expect, it } from "vitest";

describe("GET /api/settings/env", () => {
    it("answers 503 with a machine-readable code when the store is unreadable", async () => {
        writeFileSync(path.join(dir, "settings.json"), "[1,2,3]", "utf8");
        const { GET } = await import("@/app/api/settings/env/route");
        const res = await GET();
        expect(res.status).toBe(503);
        await expect(res.json()).resolves.toMatchObject({
            code: "ENV_STORE_UNREADABLE",
        });
    });

    it("still answers 200 with an empty map when nothing is stored", async () => {
        // Suppression half: a route that always 503s passes the case above.
        const { GET } = await import("@/app/api/settings/env/route");
        const res = await GET();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toMatchObject({ env: {} });
    });
});
```

- [ ] **Step 2: Chạy để chắc nó TRƯỢT**

Run: `pnpm vitest run src/app/api/settings/env/route.unreadable.test.ts -t 'GET'`
Expected: FAIL — hôm nay ca hỏng trả 200.

- [ ] **Step 3: Cài đặt**

```ts
export const ENV_STORE_UNREADABLE = "ENV_STORE_UNREADABLE" as const;

export async function GET() {
    const read = await readEnvStore();
    if (read.state === "unreadable") {
        // 503, not 500: the store is a dependency in a bad state, not a bug in
        // this handler. The code is what lets the client tell "no keys yet"
        // from "cannot read your keys" — the distinction the UI needs before
        // it dares offer a save button.
        return NextResponse.json(
            {
                error: `Không đọc được kho khoá đã lưu (${read.reason}).`,
                code: ENV_STORE_UNREADABLE,
            },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }
    return NextResponse.json(
        {
            env: read.state === "ok" ? read.env : {},
            pluginEnv: loadPluginEnvDecls(),
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}
```

- [ ] **Step 4: Chạy — XANH**

Run: `pnpm vitest run src/app/api/settings/env/route.unreadable.test.ts -t 'GET'`

- [ ] **Step 5: PHÁ-THỬ** — trả 200 ở ca hỏng → eval phải đỏ nêu chữ `503`. Hoàn nguyên.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/settings/env/route.ts src/app/api/settings/env/route.unreadable.test.ts
git commit -m "feat(api): GET settings/env tra 503 khi kho khoa khong doc duoc"
```

---

### Task 4: PUT từ chối, và giữ nguyên đĩa

**Files:**
- Modify: `src/app/api/settings/env/route.ts:63-95`
- Test: `src/app/api/settings/env/route.unreadable.test.ts` (bổ sung), `src/app/api/settings/env/route.test.ts` (bổ sung)

**Phục vụ:** E6 (AC-6 — **trọng tâm**), E7 (AC-7), E8 (AC-8). **independent:** `false` — cùng file với Task 3.

**Interfaces:**
- Produces: body PUT nhận thêm `replaceUnreadableStore?: boolean`. Kho `unreadable` + không cờ → `409` `{ error, code: "ENV_STORE_UNREADABLE" }`, **không ghi**. Có cờ → ghi đè, `200`. Kho lành → cờ bị bỏ qua.

- [ ] **Step 1: Viết bài kiểm trượt**

```ts
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const sha = (p: string) => createHash("sha256").update(readFileSync(p)).digest("hex");

describe("PUT refuses and leaves the blob", () => {
    it("answers 409 and does not touch a single byte on disk", async () => {
        const file = path.join(dir, "settings.json");
        writeFileSync(file, "[1,2,3]", "utf8"); // unreadable: valid JSON, wrong shape
        const before = sha(file);

        const { PUT } = await import("@/app/api/settings/env/route");
        const res = await PUT(new NextRequest("http://x/api/settings/env", {
            method: "PUT",
            body: JSON.stringify({ env: { NEW: "value" } }),
        }));

        expect(res.status).toBe(409);
        // Both halves matter: a route that answers 409 and writes anyway would
        // pass the first. This is the measurement `git config` passes — it
        // refuses AND leaves the old file intact.
        expect(sha(file)).toBe(before);
    });
});

describe("PUT replaceUnreadableStore", () => {
    it("overwrites when the caller says so explicitly", async () => {
        writeFileSync(path.join(dir, "settings.json"), "[1,2,3]", "utf8");
        const { PUT, GET } = await import("@/app/api/settings/env/route");
        const res = await PUT(new NextRequest("http://x/api/settings/env", {
            method: "PUT",
            body: JSON.stringify({ env: { NEW: "v" }, replaceUnreadableStore: true }),
        }));
        expect(res.status).toBe(200);
        const after = await GET();
        expect(after.status).toBe(200);
        await expect(after.json()).resolves.toMatchObject({ env: { NEW: "v" } });
    });
});
```

Và trong `route.test.ts` (không hồi quy):

```ts
it("ignores the flag when the store is healthy", async () => {
    // The flag names a CONDITION, not a mode: with a readable store it must
    // not become a second write path.
    writeFileSync(path.join(dir, "settings.json"), '{"A":"1"}', "utf8");
    const { PUT } = await import("@/app/api/settings/env/route");
    const plain = await PUT(req({ env: { A: "2" } }));
    const flagged = await PUT(req({ env: { A: "2" }, replaceUnreadableStore: true }));
    expect(flagged.status).toBe(plain.status);
    await expect(flagged.json()).resolves.toEqual(await plain.json());
});
```

- [ ] **Step 2: Chạy để chắc nó TRƯỢT**

Run: `pnpm vitest run src/app/api/settings/env/route.unreadable.test.ts -t 'refuses and leaves the blob'`
Expected: FAIL — hôm nay PUT ghi đè và trả 200; sha đổi.

- [ ] **Step 3: Cài đặt** (chèn ngay trước `const previous = await loadEnvStore();`)

```ts
    const replaceUnreadable =
        (body as { replaceUnreadableStore?: unknown })?.replaceUnreadableStore === true;

    const current = await readEnvStore();
    if (current.state === "unreadable" && !replaceUnreadable) {
        // 409, and nothing is written. The caller asked to replace a store we
        // cannot read, which means it cannot know what it is replacing; the
        // only safe answer is to refuse and leave the bytes alone.
        return NextResponse.json(
            {
                error: `Không đọc được kho khoá đã lưu (${current.reason}); chưa ghi gì.`,
                code: ENV_STORE_UNREADABLE,
            },
            { status: 409 },
        );
    }

    const previous = current.state === "ok" ? current.env : {};
    await saveEnvStore(env);
    const verdicts = await verifyChangedKeys(previous, env, requested);
    return NextResponse.json({ env, verdicts });
```

> Lưu ý: dòng cuối trả `env` vừa ghi thay vì đọc lại — đọc lại ngay sau khi ghi là một lần I/O thừa và, sau Task 1, là một chỗ có thể ném.

- [ ] **Step 4: Chạy — XANH**

Run: `pnpm vitest run src/app/api/settings/env/route.unreadable.test.ts src/app/api/settings/env/route.test.ts` rồi `pnpm typecheck`

- [ ] **Step 5: PHÁ-THỬ** — bỏ khối 409 → E6 phải đỏ và thông điệp nêu **sha256 lệch**, không chỉ nêu status. Hoàn nguyên.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/settings/env/route.ts src/app/api/settings/env/route.unreadable.test.ts src/app/api/settings/env/route.test.ts
git commit -m "feat(api): PUT settings/env tu choi ghi de kho hong, giu nguyen dia"
```

---

### Task 5: Kho hỏng không còn mời nhập lại khoá

**Files:**
- Modify: `src/lib/media-library/config.server.ts:19-42`
- Test: `src/lib/media-library/config.server.test.ts` (bổ sung)

**Phục vụ:** E9 (AC-9). **independent:** `true` so với Task 3/4 (khác file), nhưng cần Task 2.

**Interfaces:**
- Produces: `ResolveConfigResult` thêm nhánh thứ ba:
  ```ts
  | { ok: false; unreadable: true; code: "ENV_STORE_UNREADABLE"; message: string }
  ```

- [ ] **Step 1: Viết bài kiểm trượt**

```ts
describe("resolveConfig: unreadable store", () => {
    it("reports an unreadable store with its own code", async () => {
        writeFileSync(path.join(dir, "settings.json"), "[1,2,3]", "utf8");
        const { resolveConfig } = await import("@/lib/media-library/config.server");
        const r = await resolveConfig();
        expect(r).toMatchObject({ ok: false, code: "ENV_STORE_UNREADABLE" });
        // The dangerous sentence, pinned: an unreadable store must never send
        // the user back to re-enter keys — that path is how the keys are lost.
        expect((r as { message: string }).message).not.toMatch(/nhập lại|nhập khoá|enter.*key/i);
    });

    it("still names the missing variables when the store is merely empty", async () => {
        // Positive control: collapsing both cases into one message would pass
        // the assertion above and break the behaviour add-media-library AC-1 owns.
        const { resolveConfig } = await import("@/lib/media-library/config.server");
        const r = await resolveConfig();
        expect(r).toMatchObject({ ok: false });
        expect((r as { message: string }).message).toContain("MEDIA_LIBRARY_URL");
        expect(r).not.toHaveProperty("code");
    });
});
```

- [ ] **Step 2: Chạy để chắc nó TRƯỢT** — `pnpm vitest run src/lib/media-library/config.server.test.ts -t 'unreadable'`

- [ ] **Step 3: Cài đặt**

```ts
export type ResolveConfigResult =
    | { ok: true; config: MediaLibraryConfig }
    | { ok: false; missing: string[]; message: string }
    | { ok: false; unreadable: true; code: "ENV_STORE_UNREADABLE"; message: string };

export async function resolveConfig(): Promise<ResolveConfigResult> {
    const read = await readEnvStore();
    if (read.state === "unreadable") {
        // Deliberately does NOT invite the user to re-enter keys: their keys
        // may still be there, and re-entering is exactly the path that
        // overwrites them.
        return {
            ok: false,
            unreadable: true,
            code: "ENV_STORE_UNREADABLE",
            message:
                "Không đọc được kho khoá đã lưu, nên chưa gọi được media-library. Mở Cài đặt để xử lý.",
        };
    }
    const env = read.state === "ok" ? read.env : {};
    // …phần còn lại giữ nguyên như hôm nay…
}
```

- [ ] **Step 4: XANH** — `pnpm vitest run src/lib/media-library/config.server.test.ts` + `pnpm typecheck`
- [ ] **Step 5: PHÁ-THỬ** — cho ca hỏng trả `message: "…vui lòng nhập lại hai khoá"` → phải đỏ nêu chữ `nhập lại`. Hoàn nguyên.
- [ ] **Step 6: Commit**

```bash
git add src/lib/media-library/config.server.ts src/lib/media-library/config.server.test.ts
git commit -m "feat(media-library): phan biet kho khoa hong voi thieu khoa"
```

---

### Task 6: Câu chữ, đủ năm thứ tiếng — và phép đo không thể trốn

**Files:**
- Modify: `src/i18n/messages/en.json`, `ja.json`, `ko.json`, `vi.json`, `zh.json` (nhóm `Settings`)
- Create: `src/i18n/locale-parity.test.ts`

**Phục vụ:** E16 (AC-13). **independent:** `true`. **Phải xong trước Task 7 và 8.**

**Interfaces:**
- Produces (nhóm `Settings`): `storeUnreadableTitle`, `storeUnreadableBody`, `storeUnreadableReasonLabel`, `dropStore`, `dropStoreConfirmTitle`, `dropStoreConfirmBody`, `dropStoreConfirmOk`, `cancel`, `openSettingsHint`, `saveBlockedUnreadable`.

- [ ] **Step 1: Viết bài kiểm trượt**

```ts
// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const LOCALES = ["en", "ja", "ko", "vi", "zh"] as const;
// Files this change set makes user-visible copy from. The key list is DERIVED
// from these writers, not hand-listed: a hand-listed constant cannot go red on
// the day someone adds a t() call and forgets to translate it.
const WRITERS = [
    "src/components/workspace/settings-dialog.tsx",
    "src/components/workspace/nodes/add/media-library-config-panel.tsx",
    "src/components/workspace/nodes/base/abi-node-shell.tsx",
];

function keysUsedBy(file: string): string[] {
    const src = readFileSync(file, "utf8");
    return [...src.matchAll(/\bt\(\s*"([A-Za-z0-9_.]+)"/g)].map((m) => m[1]);
}
const dig = (o: unknown, p: string) =>
    p.split(".").reduce<unknown>((a, k) => (a as Record<string, unknown>)?.[k], o);

describe("locale parity for this change set", () => {
    const bundles = Object.fromEntries(
        LOCALES.map((l) => [l, JSON.parse(readFileSync(`src/i18n/messages/${l}.json`, "utf8"))]),
    );
    const used = [...new Set(WRITERS.flatMap(keysUsedBy))];

    it("finds at least one key to check", () => {
        expect(used.length).toBeGreaterThan(0);
    });

    it.each(LOCALES)("%s has every key these screens use", (loc) => {
        const missing = used.filter((k) => typeof dig(bundles[loc], `Settings.${k}`) !== "string");
        expect(missing, `thiếu khoá ở ${loc}.json: ${missing.join(", ")}`).toEqual([]);
    });

    it.each(LOCALES.filter((l) => l !== "en"))("%s is not a copy of the English string", (loc) => {
        const copied = used.filter(
            (k) => dig(bundles[loc], `Settings.${k}`) === dig(bundles.en, `Settings.${k}`),
        );
        expect(copied, `chưa dịch ở ${loc}.json: ${copied.join(", ")}`).toEqual([]);
    });
});
```

- [ ] **Step 2: Chạy — TRƯỢT** (`pnpm vitest run src/i18n/locale-parity.test.ts`), vì các file writer chưa có khoá mới.
- [ ] **Step 3: Thêm khoá vào cả 5 tệp.** Bản tiếng Việt (nguồn chuẩn, lấy nguyên văn từ bản mẫu đã duyệt Cổng 1):

```json
"storeUnreadableTitle": "Không đọc được kho khoá đã lưu",
"storeUnreadableBody": "Chưa có gì bị thay đổi. Các khoá đang lưu vẫn nằm nguyên trên máy, nhưng ứng dụng không giải được nội dung của tệp nên chưa hiện ra được.",
"storeUnreadableReasonLabel": "Lý do kỹ thuật",
"dropStore": "Bỏ kho cũ và nhập lại",
"dropStoreConfirmTitle": "Bỏ toàn bộ kho khoá đang lưu?",
"dropStoreConfirmBody": "Mọi khoá đang lưu sẽ mất và không khôi phục được. Sau khi bỏ, bạn phải nhập lại từng khoá của từng nhà cung cấp.",
"dropStoreConfirmOk": "Bỏ và nhập lại",
"cancel": "Huỷ",
"openSettingsHint": "Mở Cài đặt để xử lý",
"saveBlockedUnreadable": "Không đọc được kho khoá đang lưu nên chưa thể lưu thêm khoá nào."
```

- [ ] **Step 4: XANH** — `pnpm vitest run src/i18n/locale-parity.test.ts`
- [ ] **Step 5: PHÁ-THỬ (hai chiều)**
  1. Xoá `dropStore` khỏi `ja.json` → đỏ, thông điệp nêu đích danh khoá + tệp.
  2. Thêm `t("khoaChuaDich")` vào `settings-dialog.tsx` mà không thêm vào tệp nào → **phải đỏ**. Chiều này là lý do phép đo rút danh sách từ mã thay vì từ một hằng.
  Hoàn nguyên cả hai.
- [ ] **Step 6: Commit**

```bash
git add src/i18n/messages/*.json src/i18n/locale-parity.test.ts
git commit -m "feat(i18n): cau chu cho trang thai kho khoa hong, du 5 locale"
```

---

### Task 7: Màn Cài đặt — thay form, tắt Lưu, một đường thoát có xác nhận

**Files:**
- Modify: `src/components/workspace/settings-dialog.tsx:287-380`
- Test: `src/components/workspace/settings-dialog.test.tsx` (tạo mới)

**Phục vụ:** E10 (AC-10), E12 (AC-11). **independent:** `true` so với Task 8. Cần Task 3 + Task 6.

**Interfaces:**
- Consumes: `GET` 503 + `code` (Task 3); khoá i18n (Task 6).
- Produces: state nội bộ `storeUnreadable: boolean`; nút thoát gửi `PUT { env, replaceUnreadableStore: true }`.

- [ ] **Step 1: Viết bài kiểm trượt** (đây là ô mà phản biện Cổng 1 bắt được là đang thiếu)

```tsx
// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(cleanup);

describe("settings dialog: unreadable store", () => {
    it("replaces the key form, keeps Save mounted but disabled, offers one way out", async () => {
        stubFetch({ status: 503, body: { code: "ENV_STORE_UNREADABLE" } });
        renderOpenDialog();
        await waitFor(() => screen.getByText(/không đọc được kho khoá/i));

        expect(screen.queryAllByRole("textbox")).toHaveLength(0);
        const save = screen.getByRole("button", { name: /^lưu$/i });
        expect(save).toBeDisabled();
        expect(screen.getAllByRole("button", { name: /bỏ kho cũ/i })).toHaveLength(1);
        expect(screen.getByText(/chưa có gì bị thay đổi/i)).toBeTruthy();
    });

    it("shows the normal form when the store is merely empty", async () => {
        // Positive control: a dialog that always reports a broken store passes
        // every assertion above.
        stubFetch({ status: 200, body: { env: {}, pluginEnv: [] } });
        renderOpenDialog();
        await waitFor(() => expect(screen.queryByText(/không đọc được/i)).toBeNull());
        expect(screen.getByRole("button", { name: /^lưu$/i })).not.toBeDisabled();
    });
});

describe("settings dialog: escape hatch", () => {
    it("sends exactly one flagged PUT and no un-flagged one", async () => {
        const calls = stubFetch({ status: 503, body: { code: "ENV_STORE_UNREADABLE" } });
        renderOpenDialog();
        await waitFor(() => screen.getByRole("button", { name: /bỏ kho cũ/i }));
        fireEvent.click(screen.getByRole("button", { name: /bỏ kho cũ/i }));
        expect(screen.getByText(/không khôi phục được/i)).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: /bỏ và nhập lại/i }));

        await waitFor(() => {
            const puts = calls.filter((c) => c.method === "PUT");
            expect(puts).toHaveLength(1);
            expect(JSON.parse(puts[0].body).replaceUnreadableStore).toBe(true);
        });
    });
});
```

- [ ] **Step 2: Chạy — TRƯỢT** (`pnpm vitest run src/components/workspace/settings-dialog.test.tsx -t 'unreadable store'`)
- [ ] **Step 3: Cài đặt** — trong `fetchEnv`, phân biệt 503; render tấm lỗi thay cho form; nút Lưu `disabled={storeUnreadable}`; `AlertDialog` cho bước xác nhận; nút xác nhận gọi `apiPut` với `replaceUnreadableStore: true`. Dùng lại `buttonVariants({ variant: "destructive" })` cho `AlertDialogAction` — **không chép tay chuỗi class**, vì bản chép tay đánh rơi hai nhánh dark-mode và vòng tiêu điểm (đã đo ở phiên design-pass).
- [ ] **Step 4: XANH** — `pnpm vitest run src/components/workspace/settings-dialog.test.tsx` + `pnpm typecheck`
- [ ] **Step 5: PHÁ-THỬ (hai lượt)** — (a) để `fetchEnv` nuốt lỗi như hôm nay → nhóm `unreadable store` đỏ nêu chữ *form rỗng khi 503*; (b) cho màn gửi một PUT thường trước PUT có cờ → nhóm `escape hatch` đỏ nêu **số lời gọi đếm được**. Hoàn nguyên.
- [ ] **Step 6: Commit**

```bash
git add src/components/workspace/settings-dialog.tsx src/components/workspace/settings-dialog.test.tsx
git commit -m "feat(settings): man Cai dat hien trang thai kho hong va duong thoat co xac nhan"
```

---

### Task 8: Hai bảng nhỏ trên bản vẽ — từ chối, và tuyệt đối không có nút xoá kho

**Files:**
- Modify: `src/components/workspace/nodes/add/media-library-config-panel.tsx:40-80`
- Modify: `src/components/workspace/nodes/base/abi-node-shell.tsx:104-130` — **kèm đưa chuỗi qua `useTranslations`**
- Test: `…/media-library-config-panel.test.tsx`, `…/abi-node-shell.test.tsx` (tạo mới)

**Phục vụ:** E14 (AC-12). **independent:** `true` so với Task 7. Cần Task 3 + Task 6.

- [ ] **Step 1: Viết bài kiểm trượt**

```tsx
// @vitest-environment jsdom
const PANELS = [
    ["media-library config panel", renderMediaLibraryPanel],
    ["abi node key field", renderAbiKeyField],
] as const;

describe("node panels: unreadable store", () => {
    it.each(PANELS)("%s sends no PUT at all", async (_name, mount) => {
        const calls = stubFetch({ status: 503, body: { code: "ENV_STORE_UNREADABLE" } });
        mount();
        fireEvent.click(await screen.findByRole("button", { name: /lưu/i }));
        await waitFor(() => expect(screen.getByText(/không đọc được kho khoá/i)).toBeTruthy());
        expect(calls.filter((c) => c.method === "PUT")).toHaveLength(0);
    });

    it.each(PANELS)("%s offers no way to drop the store", async (_name, mount) => {
        stubFetch({ status: 503, body: { code: "ENV_STORE_UNREADABLE" } });
        mount();
        await screen.findByText(/không đọc được kho khoá/i);
        // Owner decision 3: that button belongs to the settings screen alone.
        expect(screen.queryAllByRole("button", { name: /bỏ kho cũ|nhập lại|thoát/i })).toHaveLength(0);
    });
});
```

Đối chứng dương nằm ở Task 7 (`settings-dialog` phải có **đúng 1** nút đó) — hai phép đo đọc chung một truy vấn, nên một truy vấn sai chính tả không thể cho 0 ở mọi nơi.

- [ ] **Step 2: TRƯỢT** — `abi-node-shell` hôm nay không kiểm cả `loaded.ok`, nên nó sẽ gửi PUT.
- [ ] **Step 3: Cài đặt** — cả hai panel kiểm `res.status === 503` (hoặc `!res.ok`) trước khi merge; hiện `t("saveBlockedUnreadable")` + lối `t("openSettingsHint")`; nút Lưu tắt. Trong `abi-node-shell`, thêm `const t = useTranslations("Settings")` và **chuyển chuỗi ghi cứng hiện có** (`Không lưu được khoá (HTTP …)`) sang khoá i18n cùng lượt — nếu để chuỗi cứng, phép đo E16 quét `t("…")` sẽ không thấy và AC-13 xanh rỗng.
- [ ] **Step 4: XANH** — `pnpm vitest run src/components/workspace/nodes/add/media-library-config-panel.test.tsx src/components/workspace/nodes/base/abi-node-shell.test.tsx` + `pnpm typecheck` + `pnpm vitest run src/i18n/locale-parity.test.ts`
- [ ] **Step 5: PHÁ-THỬ (hai lượt)** — (a) gỡ chốt chặn ở `abi-node-shell` → đỏ, **nêu đích danh panel** đã gửi PUT; (b) cắm một nút "Bỏ kho cũ" vào một panel → đỏ, nêu đích danh panel. Hoàn nguyên.
- [ ] **Step 6: Commit**

```bash
git add src/components/workspace/nodes/add/media-library-config-panel.tsx src/components/workspace/nodes/base/abi-node-shell.tsx src/components/workspace/nodes/add/media-library-config-panel.test.tsx src/components/workspace/nodes/base/abi-node-shell.test.tsx
git commit -m "feat(workspace): hai panel node tu choi luu khi kho khoa hong"
```

---

### Task 9: Bản mẫu phải còn nói thật về bản đã dựng

**Files:**
- Modify (nếu lệch): `src/components/proto/chong-mat-khoa-byo-proto.tsx`

**Phục vụ:** E17, E18 (AC-14). **independent:** `false` — chạy sau Task 7 và 8.

**Vì sao task này tồn tại:** AC-14 đo **bản mẫu**, còn AC-10/11/12 đo **component thật**. Nếu hai bên trôi khỏi nhau thì phép đo tiếp cận đang đo một màn không ai dùng — đúng lớp lỗi mà cả Cổng 1 dành để bắt.

- [ ] **Step 1: Đối chiếu ba trạng thái bản mẫu với UI vừa dựng** — câu chữ (nay đã đi qua i18n), thứ tự nút, trạng thái tắt của Lưu, và việc hai panel không có nút thoát.
- [ ] **Step 2: Sửa bản mẫu cho khớp**, nếu lệch. Bản mẫu dùng hằng `COPY` riêng có chủ ý (nó là fixture), nhưng **nội dung** phải khớp bản tiếng Việt trong `vi.json`.
- [ ] **Step 3: Chạy phép đo tiếp cận thật**

Run: `bash scripts/settings/check-a11y-proto.sh`
Expected: `verdict: PASS`, `blocking: 0`, 6 trang.

- [ ] **Step 4: Chạy trọn bộ máy của repo**

Run: `bash scripts/acceptance/preflight-verify-env.sh && pnpm lint:check && pnpm typecheck && pnpm build && pnpm test`

- [ ] **Step 5: Commit**

```bash
git add src/components/proto/chong-mat-khoa-byo-proto.tsx _acceptance/chong-mat-khoa-byo/evidence/design-pass/a11y.json
git commit -m "chore(proto): dong bo ban mau voi UI da dung"
```

---

## Thứ tự và chỗ chạy song song được

```
Task 1 ──► Task 2 ──┬──► Task 3 ──► Task 4 ──┐
                    │                         ├──► Task 7 ──┐
                    ├──► Task 5 (song song)   │             ├──► Task 9
                    │                         ├──► Task 8 ──┘
Task 6 (song song từ đầu) ───────────────────┘
```

- **Task 5** và **Task 6** chạy song song được với nhánh chính (`independent: true`).
- **Task 7** và **Task 8** song song được với nhau (khác file), nhưng cả hai cần Task 3 + Task 6.
- Task 3 và 4 **không** song song được với nhau: cùng sửa `route.ts`.

## Tự soi lại kế hoạch

**Phủ hợp đồng:** 14/14 AC có task — AC-1→T1 · AC-2,3,4→T2 · AC-5→T3 · AC-6,7,8→T4 · AC-9→T5 · AC-10,11→T7 · AC-12→T8 · AC-13→T6 · AC-14→T9.

**Quét chỗ trống:** không có "TBD"/"xử lý lỗi phù hợp"/"viết test cho phần trên" — mọi bước có mã thật hoặc lệnh thật.

**Nhất quán kiểu:** `EnvStoreRead` / `EnvStoreReadReason` định nghĩa ở Task 2 và dùng đúng tên đó ở Task 3, 4, 5. Cờ tên `replaceUnreadableStore` ở cả Task 4 và Task 7. Mã lỗi `ENV_STORE_UNREADABLE` xuất hiện ở Task 3, 4, 5, 7, 8 — cùng một chuỗi.

**Một chỗ kế hoạch phải nói ra:** Task 4 đổi dòng trả về của PUT từ `env: await loadEnvStore()` sang `env` vừa ghi. Đây là thay đổi hành vi nhỏ nằm ngoài mọi AC — nó tiết kiệm một lượt I/O và bỏ một chỗ có thể ném sau Task 1, nhưng nếu `saveEnvStore` từng lọc bớt khoá thì response sẽ khác trước. E8 (không hồi quy) là ô canh chỗ này.
