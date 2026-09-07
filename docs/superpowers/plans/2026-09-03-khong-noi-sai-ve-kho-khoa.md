# Không nói sai về kho khoá — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Không bề mặt nào — kể cả máy chủ — được nói sai chuyện gì đã xảy ra với kho khoá BYO.

**Architecture:** Hai lớp độc lập. Máy chủ tự kiểm tiền đề của cờ `replaceUnreadableStore` trước khi thi hành lệnh xoá (bất biến ở biên). Trình duyệt đổi từ phân loại dương-một-chiều (200+env = ok, *phần bù* = unreadable) sang dương-cả-hai-chiều: bốn trạng thái `ok | store-unreadable | unauthenticated | unavailable`, mỗi kết luận nặng phải có tín hiệu dương riêng.

**Tech Stack:** Next.js App Router · TypeScript · vitest + Testing Library · next-intl (5 locale) · axe-core qua Chrome thật · Biome.

**Spec:** `docs/superpowers/specs/2026-09-03-khong-noi-sai-ve-kho-khoa-design.md`

## Global Constraints

- **Một tệp duy nhất nêu endpoint.** `/api/settings/env` chỉ được xuất hiện trong `src/lib/settings/env-client.ts` ngoài test. Guard `scripts/settings/check-one-env-reader.sh` canh; phá là đỏ.
- **`put()` TRẢ VỀ, không NÉM.** Ba caller đọc `out.ok` rồi rẽ nhánh. Một `throw` mới rơi vào `catch` ở `abi-node-shell.tsx:253` → `phase: "invalid"` → đổ oan cho khoá người dùng. Chú thích tại dòng 152 của tệp đó nói thẳng điều này.
- **Không hex mới, không webfont.** Chỉ token của kho (`border-border`, `bg-muted/40`, `text-foreground`, `text-destructive`…). Cần token chưa có → dừng, báo, không chèn hex.
- **Không sửa `scripts/settings/check-a11y-proto.sh`** — tệp đó nằm trong `paths` của E9 thuộc hồ sơ `chong-mat-khoa-byo-giao-dien` đã ký; chạm vào là làm bằng chứng đã ký hoá ôi.
- **Chuỗi hiển thị đi qua catalogue i18n**, đủ 5 locale (`en ja ko vi zh`). Không literal trong component.
- **Mỗi phép đo mới đi kèm cặp hai chiều trên CÙNG fixture:** vật lành → xanh; phá vật thật trong bản sao → đỏ với **thông điệp ghim** (nêu tên ca/bề mặt/khoá, không chỉ mã thoát). Thiếu cặp = task chưa xong.
- **Một ô đo = một tệp test trọn vẹn.** Không ô nào dùng `-t` (`scripts/ci/check-eval-filters.mjs` tồn tại vì đúng lớp lỗi đó).
- Verify per-task theo quy ước kho: `pnpm vitest run <tệp>` · `pnpm lint:check` · `pnpm typecheck`.

---

## File Structure

| Tệp | Trách nhiệm | Task |
|---|---|---|
| `src/app/api/settings/env/route.ts` | Biên: kiểm tiền đề của cờ trước khi ghi | 1 |
| `src/app/api/settings/env/route.replace-premise.test.ts` | Đo nhánh 409 mới trên thư mục tạm thật | 1 |
| `src/lib/api/client.ts` | Xuất `notifyUnauthorized()` + hằng trần thời gian | 2, 4 |
| `src/lib/settings/env-client.ts` | Bốn trạng thái, trần 30s, timeout vào `WriteFailure` | 3, 4, 7 |
| `src/lib/settings/__fixtures__/read-failures.ts` | Chín tín hiệu, dùng chung ba tệp test | 3 |
| `src/components/settings/store-unreadable-notice.tsx` | Prop `tone` + marker component | 5 |
| `src/i18n/messages/{en,ja,ko,vi,zh}.json` | Chuỗi hai trạng thái mới | 5 |
| `src/components/workspace/settings-dialog.tsx` | Bốn trạng thái + Thử lại + đọc lại sau 409 | 6, 7 |
| `src/components/workspace/node-key-prompt.tsx` | Bốn trạng thái, 0 nút phá huỷ | 6 |
| `src/components/workspace/nodes/base/abi-node-shell.tsx` | Map `read.state` sang phase | 6 |
| `src/components/workspace/nodes/add/media-library-config-panel.tsx` | Bốn trạng thái, 0 nút phá huỷ | 6 |
| `scripts/settings/check-unauthorized-seam.sh` (+ `-teeth`) | Guard một-chỗ-định-nghĩa | 2 |
| `scripts/settings/check-a11y-read-states.sh` | Sàn tiếp cận hai trạng thái mới, cổng 3196 | 8 |
| `src/components/proto/khong-noi-sai-ve-kho-khoa-proto.tsx` | Bản mẫu (đã có từ S1-D) + component thật | 8 |

---

### Task 1: Máy chủ kiểm tiền đề của cờ

**Files:**
- Modify: `src/app/api/settings/env/route.ts:115-131`
- Create: `src/app/api/settings/env/route.replace-premise.test.ts`

**Interfaces:**
- Consumes: `readEnvStore()`, `saveEnvStore()` từ `src/lib/settings/env-store.server.ts` (đã có).
- Produces: mã lỗi `ENV_STORE_REPLACE_REFUSED` trong thân 409, kèm `state: "ok" | "absent"`. Task 7 đọc đúng chuỗi này.

**Phục vụ:** E1 · `independent: true`

- [ ] **Step 1: Viết test đỏ**

`src/app/api/settings/env/route.replace-premise.test.ts`:

```ts
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/** Ma trận toàn phần: trục A (ok | absent | unreadable) × cờ bật. Ghim hằng. */
const CASES = 3;

let dir: string;
beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "knsk-"));
    process.env.TONGFLOW_DATA_DIR = dir;
    vi.resetModules();
});

const storePath = () => join(dir, ".tongflow", "settings.json");
const sha = () =>
    createHash("sha256").update(readFileSync(storePath())).digest("hex");

const put = async (body: unknown) => {
    const { PUT } = await import("./route");
    return PUT(
        new Request("http://t/api/settings/env", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        }),
    );
};

describe(`premise of replaceUnreadableStore (${CASES} cases + race)`, () => {
    it("case ok: refuses, writes nothing, store byte-identical", async () => {
        // Fixture sinh bằng bộ GHI THẬT — không viết tay JSON theo khuôn bên đọc.
        const { saveEnvStore } = await import("@/lib/settings/env-store.server");
        await saveEnvStore({ A: "1", B: "2" });
        const before = sha();

        const res = await put({ env: {}, replaceUnreadableStore: true });
        const body = await res.json();

        expect(res.status, "case ok: expected 409 refusal").toBe(409);
        expect(body.code, "case ok: refusal must be named").toBe(
            "ENV_STORE_REPLACE_REFUSED",
        );
        expect(body.state, "case ok: refusal must report the state it saw").toBe("ok");

        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        const after = await readEnvStore();
        expect(
            after.state === "ok" ? Object.keys(after.env).length : -1,
            "case ok: keys must survive the refusal",
        ).toBe(2);
        expect(sha(), "case ok: store file must be byte-identical").toBe(before);
    });

    it("case absent: refuses and creates no file", async () => {
        const res = await put({ env: {}, replaceUnreadableStore: true });
        const body = await res.json();
        expect(res.status, "case absent: expected 409").toBe(409);
        expect(body.state, "case absent: state must be reported").toBe("absent");
        expect(existsSync(storePath()), "case absent: file must not be created").toBe(
            false,
        );
    });

    it("case unreadable: the legitimate path still works", async () => {
        const { mkdirSync, writeFileSync } = await import("node:fs");
        mkdirSync(join(dir, ".tongflow"), { recursive: true });
        writeFileSync(storePath(), "}{ not json");

        const res = await put({ env: {}, replaceUnreadableStore: true });
        expect(res.status, "case unreadable: replace must be allowed").toBe(200);

        const { readEnvStore } = await import("@/lib/settings/env-store.server");
        const after = await readEnvStore();
        expect(after.state, "case unreadable: store must now read ok").toBe("ok");
    });

    it("race: store repaired between read and write lands on the refusal", async () => {
        const { saveEnvStore } = await import("@/lib/settings/env-store.server");
        await saveEnvStore({ A: "1", B: "2" });
        const res = await put({ env: {}, replaceUnreadableStore: true });
        expect(res.status, "race: repaired store must refuse, no special rule").toBe(
            409,
        );
    });

    it("positive control: a PUT without the flag still writes", async () => {
        const res = await put({ env: { C: "3" } });
        expect(res.status, "positive control: normal write must still work").toBe(200);
    });
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `pnpm vitest run src/app/api/settings/env/route.replace-premise.test.ts`
Expected: FAIL — `case ok: expected 409 refusal` nhận 200, và `case ok: keys must survive the refusal` nhận 0.

- [ ] **Step 3: Thêm nhánh vào route**

`src/app/api/settings/env/route.ts`, ngay sau nhánh 409 hiện có:

```ts
    // The flag is a CLAIM about server-side state, so the server checks it.
    // Accepting it unverified is how a transient 401 or 502 on the client turns
    // into an empty PUT that erases a healthy store.
    if (replaceUnreadable && current.state !== "unreadable") {
        return NextResponse.json(
            {
                code: "ENV_STORE_REPLACE_REFUSED",
                state: current.state,
                error: "Kho khoá vẫn đọc được; lệnh thay kho bị từ chối, chưa ghi gì.",
            },
            { status: 409 },
        );
    }
```

- [ ] **Step 4: Chạy lại — phải xanh**

Run: `pnpm vitest run src/app/api/settings/env/route.replace-premise.test.ts`
Expected: PASS, 5 ca.

- [ ] **Step 5: Chiều đỏ — phá vật thật trong bản sao**

```bash
cp src/app/api/settings/env/route.ts /tmp/route.bak
python3 - <<'PY'
import io
p = "src/app/api/settings/env/route.ts"
s = io.open(p).read()
i = s.index('if (replaceUnreadable && current.state !== "unreadable")')
j = s.index("}\n", s.index("{ status: 409 },", i)) + 2
io.open(p, "w").write(s[:i] + s[j:])
PY
pnpm vitest run src/app/api/settings/env/route.replace-premise.test.ts
```

Expected: FAIL — `case ok: keys must survive the refusal` in `expected 0 to be 2`, và `case ok: store file must be byte-identical` in hai sha khác nhau. Không phải chỉ «expected 200 to be 409».

```bash
cp /tmp/route.bak src/app/api/settings/env/route.ts
pnpm vitest run src/app/api/settings/env/route.replace-premise.test.ts
```

- [ ] **Step 6: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/app/api/settings/env/route.ts src/app/api/settings/env/route.replace-premise.test.ts
git commit -m "feat(settings): the server checks the premise of replaceUnreadableStore"
```

---

### Task 2: Seam đăng-nhập-lại thành helper dùng chung

**Files:**
- Modify: `src/lib/api/client.ts:165-180`
- Create: `scripts/settings/check-unauthorized-seam.sh`
- Create: `scripts/settings/check-unauthorized-seam-teeth.sh`

**Interfaces:**
- Produces: `export function notifyUnauthorized(): boolean` trong `src/lib/api/client.ts` — bắn `CustomEvent("tf:unauthorized", { cancelable: true })` trên `window`, trả `true` khi vỏ đã xử (`preventDefault`). Task 3 gọi nó ở nhánh 401.

**Phục vụ:** E8, E9 (tiền đề của E3) · `independent: true`

- [ ] **Step 1: Rút helper**

`src/lib/api/client.ts`, thêm export trước hàm request:

```ts
/**
 * Fires the cancelable shell seam. Returns true when a shell handled the 401
 * itself (called `preventDefault`), so the caller suppresses its own message.
 *
 * Exported because a SECOND caller needs it — `env-client.ts`. Copying the
 * dispatch there would put the event name and the `cancelable` contract in two
 * places, which is the same "three surfaces each rolled their own" mechanism
 * that produced the defect this dossier closes.
 */
export function notifyUnauthorized(): boolean {
    if (typeof window === "undefined") return false;
    return !window.dispatchEvent(
        new CustomEvent("tf:unauthorized", { cancelable: true }),
    );
}
```

Rồi thay khối inline (dòng ~171-177) bằng:

```ts
                const handledByShell =
                    response.status === 401 && notifyUnauthorized();
```

- [ ] **Step 2: Viết guard**

`scripts/settings/check-unauthorized-seam.sh`:

```bash
#!/usr/bin/env bash
# One place defines the shell seam; two places call it.
#
# Counts OCCURRENCES, not files. A guard that counts files stays green when the
# same file dispatches the event twice — which is exactly what happens if the
# helper is added but the inline block is left behind.
set -euo pipefail
cd "$(dirname "$0")/../.."

SRC=$(find src -name '*.ts' -o -name '*.tsx' | grep -v '\.test\.' | grep -v '^src/ext/')

DEFS=$(grep -o 'new CustomEvent("tf:unauthorized"' $SRC 2>/dev/null | wc -l | tr -d ' ')
CALLERS=$(grep -l 'notifyUnauthorized(' $SRC 2>/dev/null | sort)
N_CALLERS=$(printf '%s\n' "$CALLERS" | grep -c . || true)

echo "dispatch sites: $DEFS"
printf 'callers (%s):\n%s\n' "$N_CALLERS" "$CALLERS"

if [ "$DEFS" -eq 0 ]; then
    echo "FAIL: nothing dispatches tf:unauthorized — guard has nothing to measure"
    exit 2
fi
if [ "$DEFS" -ne 1 ]; then
    echo "FAIL: expected exactly 1 dispatch site, found $DEFS"
    exit 1
fi
EXPECTED="src/lib/api/client.ts
src/lib/settings/env-client.ts"
if [ "$CALLERS" != "$EXPECTED" ]; then
    echo "FAIL: callers must be exactly the two below"
    printf 'expected:\n%s\n' "$EXPECTED"
    exit 1
fi
echo "OK: 1 dispatch site, 2 callers"
```

- [ ] **Step 3: Viết răng cho guard**

`scripts/settings/check-unauthorized-seam-teeth.sh` — năm ca trên **bản sao** cây:

```bash
#!/usr/bin/env bash
# Proves the guard can go red. A static guard that is green forever looks
# identical to one whose grep has a typo.
set -uo pipefail
cd "$(dirname "$0")/../.."
fail=0
run_case() {
    local name="$1" want="$2"; shift 2
    local wt; wt=$(mktemp -d)
    cp -R src scripts "$wt"/ 2>/dev/null
    ( cd "$wt" && "$@" ) >/dev/null 2>&1
    ( cd "$wt" && bash scripts/settings/check-unauthorized-seam.sh ) >"$wt/out" 2>&1
    local got=$?
    if [ "$got" -eq "$want" ]; then
        echo "ok   case '$name' exited $got"
    else
        echo "FAIL case '$name' wanted $want got $got"; cat "$wt/out"; fail=1
    fi
    rm -rf "$wt"
}
run_case 'real tree' 0 true
run_case 'a second dispatch site in env-client' 1 \
    sh -c 'printf "\nnew CustomEvent(\"tf:unauthorized\", {});\n" >> src/lib/settings/env-client.ts'
run_case 'a second dispatch inside client.ts itself' 1 \
    sh -c 'printf "\nnew CustomEvent(\"tf:unauthorized\", {});\n" >> src/lib/api/client.ts'
run_case 'a third caller in a component' 1 \
    sh -c 'printf "\nnotifyUnauthorized();\n" >> src/components/workspace/settings-dialog.tsx'
run_case 'emptied client.ts' 2 sh -c ': > src/lib/api/client.ts'
[ "$fail" -eq 0 ] && echo "OK: guard bites on all four perturbations" || exit 1
```

Ca `a second dispatch inside client.ts itself` là ca gap-probe F4 đòi: đếm **lần**, không đếm **tệp**.

- [ ] **Step 4: Chạy cả hai**

Run: `chmod +x scripts/settings/check-unauthorized-seam*.sh && bash scripts/settings/check-unauthorized-seam.sh`
Expected: **ĐỎ ở bước này** — `FAIL: callers must be exactly the two below`, vì `env-client.ts` chưa gọi. Đó là đúng; Task 3 làm nó xanh.

Run: `bash scripts/settings/check-unauthorized-seam-teeth.sh`
Expected: bốn ca perturbation `ok`; ca `real tree` đỏ tạm cho tới Task 3.

- [ ] **Step 5: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/lib/api/client.ts scripts/settings/check-unauthorized-seam.sh scripts/settings/check-unauthorized-seam-teeth.sh
git commit -m "refactor(api): extract notifyUnauthorized so a second caller cannot copy the seam"
```

---

### Task 3: Phân loại dương cả hai chiều

**Files:**
- Modify: `src/lib/settings/env-client.ts:33-120`
- Modify: `src/lib/settings/__fixtures__/read-failures.ts`
- Create: `src/lib/settings/env-client.taxonomy.test.ts`
- Create: `src/lib/settings/env-client.seam.test.ts`

**Interfaces:**
- Consumes: `notifyUnauthorized()` từ Task 2.
- Produces, mọi task sau dùng đúng tên này:
  - `type EnvReadState = "ok" | "store-unreadable" | "unauthenticated" | "unavailable"`
  - `type UnavailableReason = { code: "http"; status: number } | { code: "not-json" } | { code: "no-env" } | { code: "network"; detail: string } | { code: "timeout" }`
  - `type EnvClientRead = { state: "ok"; env: Record<string,string>; pluginEnv: PluginEnvDecl[] } | { state: "store-unreadable"; reason: ReadFailure } | { state: "unauthenticated" } | { state: "unavailable"; reason: UnavailableReason }`
  - `readEnvForBrowser(): Promise<EnvClientRead>` — chữ ký không đổi, union đổi.

**Phục vụ:** E2, E3 · `independent: false` (cần Task 2)

- [ ] **Step 1: Mở rộng fixture lên chín tín hiệu**

`src/lib/settings/__fixtures__/read-failures.ts` — thêm ba mục vào mảng hiện có, giữ khuôn `[tên, () => Response]`:

```ts
    ["401", () => new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 })],
    ["403", () => new Response(JSON.stringify({ error: "forbidden" }), { status: 403 })],
    ["503-no-code", () => new Response(JSON.stringify({ error: "nope" }), { status: 503 })],
```

`503-no-code` là **đối chứng dương của chiều ngược**: 503 mà thiếu `code` KHÔNG được thành `store-unreadable`. Tín hiệu dương phải đủ cả hai vế.

- [ ] **Step 2: Viết test đỏ cho taxonomy**

`src/lib/settings/env-client.taxonomy.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readEnvForBrowser } from "./env-client";

/** Chín tín hiệu đo ở đây; quá-trần đo ở env-client.timeout.test.ts. Ghim hằng. */
const SIGNALS = 9;

type Want = { state: string; code?: string };

const TABLE: ReadonlyArray<readonly [string, () => Response, Want]> = [
    ["200+env", () => new Response(JSON.stringify({ env: { A: "1" } }), { status: 200 }), { state: "ok" }],
    ["503+code", () => new Response(JSON.stringify({ code: "ENV_STORE_UNREADABLE", reason: "parse" }), { status: 503 }), { state: "store-unreadable" }],
    ["401", () => new Response("{}", { status: 401 }), { state: "unauthenticated" }],
    ["403", () => new Response("{}", { status: 403 }), { state: "unavailable", code: "http" }],
    ["500", () => new Response("{}", { status: 500 }), { state: "unavailable", code: "http" }],
    ["502-html", () => new Response("<html>bad gateway</html>", { status: 502 }), { state: "unavailable", code: "http" }],
    ["not-json", () => new Response("<html>", { status: 200 }), { state: "unavailable", code: "not-json" }],
    ["no-env", () => new Response(JSON.stringify({ env: [] }), { status: 200 }), { state: "unavailable", code: "no-env" }],
    ["network", () => { throw new TypeError("fetch failed"); }, { state: "unavailable", code: "network" }],
];

beforeEach(() => vi.restoreAllMocks());

describe(`read taxonomy — ${SIGNALS} signals, positive in both directions`, () => {
    it(`covers exactly ${SIGNALS} signals`, () => {
        expect(TABLE.length, "matrix must stay full").toBe(SIGNALS);
    });

    for (const [name, make, want] of TABLE) {
        it(`${name} -> ${want.state}`, async () => {
            vi.stubGlobal("fetch", vi.fn(async () => make()));
            const got = await readEnvForBrowser();
            expect(got.state, `signal '${name}': wrong state`).toBe(want.state);
            if (want.code) {
                expect(
                    (got as { reason?: { code?: string } }).reason?.code,
                    `signal '${name}': wrong reason code`,
                ).toBe(want.code);
            }
        });
    }

    it("503 WITHOUT the code is unavailable, not store-unreadable", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response(JSON.stringify({ error: "nope" }), { status: 503 })));
        const got = await readEnvForBrowser();
        expect(got.state, "a positive signal needs BOTH the status and the code").toBe(
            "unavailable",
        );
    });
});
```

- [ ] **Step 3: Viết test đỏ cho seam**

`src/lib/settings/env-client.seam.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readEnvForBrowser } from "./env-client";

let fired: CustomEvent[] = [];
const listener = (e: Event) => fired.push(e as CustomEvent);

beforeEach(() => {
    fired = [];
    window.addEventListener("tf:unauthorized", listener);
});
afterEach(() => {
    window.removeEventListener("tf:unauthorized", listener);
    vi.restoreAllMocks();
});

const respond = (status: number, body = "{}") =>
    vi.stubGlobal("fetch", vi.fn(async () => new Response(body, { status })));

describe("shell seam fires on 401 only", () => {
    it("401 dispatches exactly one cancelable event", async () => {
        respond(401);
        await readEnvForBrowser();
        expect(fired.length, "401: expected 1 dispatch").toBe(1);
        expect(fired[0].cancelable, "401: event must be cancelable").toBe(true);
    });

    it("403 dispatches nothing — forbidden is not unauthenticated", async () => {
        respond(403);
        await readEnvForBrowser();
        expect(fired.length, "403: expected 0 dispatches").toBe(0);
    });

    it("503+code dispatches nothing", async () => {
        respond(503, JSON.stringify({ code: "ENV_STORE_UNREADABLE" }));
        await readEnvForBrowser();
        expect(fired.length, "503: expected 0 dispatches").toBe(0);
    });

    it("env-client uses the shared helper, not an inline dispatch", async () => {
        const mod = await import("@/lib/api/client");
        const spy = vi.spyOn(mod, "notifyUnauthorized");
        respond(401);
        await readEnvForBrowser();
        expect(
            spy,
            "env-client must call the shared helper, not dispatch inline",
        ).toHaveBeenCalledTimes(1);
    });
});
```

- [ ] **Step 4: Chạy cả hai để chắc chúng đỏ**

Run: `pnpm vitest run src/lib/settings/env-client.taxonomy.test.ts src/lib/settings/env-client.seam.test.ts`
Expected: FAIL — mọi ca không phải `200+env`/`503+code` in `signal '401': wrong state` (nhận `unreadable`); seam in `401: expected 1 dispatch` nhận 0.

- [ ] **Step 5: Đổi union + phân loại**

`src/lib/settings/env-client.ts`:

```ts
import { notifyUnauthorized } from "@/lib/api/client";

export type UnavailableReason =
    | { code: "http"; status: number }
    | { code: "not-json" }
    | { code: "no-env" }
    | { code: "network"; detail: string }
    | { code: "timeout" };

export type EnvReadState =
    | "ok"
    | "store-unreadable"
    | "unauthenticated"
    | "unavailable";

/**
 * Positive in BOTH directions.
 *
 * The old gate asserted `ok` positively and let the COMPLEMENT fall into
 * "unreadable" — so a proxy 502, an expired session and a dropped connection
 * all inherited the heaviest name available, and the settings screen offered to
 * wipe the key store for each of them. Now each heavy conclusion needs its own
 * positive signal, and the complement lands on a neutral name.
 */
export type EnvClientRead =
    | { state: "ok"; env: Record<string, string>; pluginEnv: PluginEnvDecl[] }
    | { state: "store-unreadable"; reason: ReadFailure }
    | { state: "unauthenticated" }
    | { state: "unavailable"; reason: UnavailableReason };
```

Thân hàm, sau khi có `response`:

```ts
    if (response.status === 401) {
        notifyUnauthorized();
        return { state: "unauthenticated" };
    }

    let body: unknown;
    try {
        body = await response.json();
    } catch {
        return response.ok
            ? { state: "unavailable", reason: { code: "not-json" } }
            : {
                  state: "unavailable",
                  reason: { code: "http", status: response.status },
              };
    }

    // The store says its own name. 503 alone is not enough: a proxy sends 503
    // too, and it knows nothing about this store.
    if (
        response.status === 503 &&
        (body as { code?: string })?.code === "ENV_STORE_UNREADABLE"
    ) {
        return { state: "store-unreadable", reason: { code: "http", status: 503 } };
    }

    if (!response.ok) {
        return {
            state: "unavailable",
            reason: { code: "http", status: response.status },
        };
    }

    const env = (body as { env?: unknown })?.env;
    if (!env || typeof env !== "object" || Array.isArray(env)) {
        return { state: "unavailable", reason: { code: "no-env" } };
    }
    return {
        state: "ok",
        env: env as Record<string, string>,
        pluginEnv: (body as { pluginEnv?: PluginEnvDecl[] })?.pluginEnv ?? [],
    };
```

Nhánh `catch` quanh `fetch` đổi `state` thành `"unavailable"`. `saveEnvKeys` giữ nguyên điều kiện `read.state !== "ok"` — vẫn đúng cho cả bốn trạng thái.

- [ ] **Step 6: Chạy lại — phải xanh**

Run: `pnpm vitest run src/lib/settings/env-client.taxonomy.test.ts src/lib/settings/env-client.seam.test.ts`
Expected: PASS — 11 ca taxonomy + 4 ca seam.

- [ ] **Step 7: Chiều đỏ**

```bash
cp src/lib/settings/env-client.ts /tmp/ec.bak
python3 - <<'PY'
import io
p = "src/lib/settings/env-client.ts"
s = io.open(p).read()
i = s.index("if (response.status === 401)")
j = s.index("let body: unknown;")
patch = ('if (!response.ok) { return { state: "store-unreadable", '
         'reason: { code: "http", status: response.status } }; }\n\n    ')
io.open(p, "w").write(s[:i] + patch + s[j:])
PY
pnpm vitest run src/lib/settings/env-client.taxonomy.test.ts
```

Expected: FAIL — **đúng 7 ca đỏ** (mọi ca trừ `200+env` và `503+code`), mỗi dòng nêu tên tín hiệu: `signal '401': wrong state`, `signal '403': wrong state`, …

```bash
cp /tmp/ec.bak src/lib/settings/env-client.ts
bash scripts/settings/check-unauthorized-seam.sh   # nay phải OK: 2 callers
pnpm vitest run src/lib/settings/env-client.taxonomy.test.ts src/lib/settings/env-client.seam.test.ts
```

- [ ] **Step 8: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/lib/settings/env-client.ts src/lib/settings/__fixtures__/read-failures.ts src/lib/settings/env-client.taxonomy.test.ts src/lib/settings/env-client.seam.test.ts
git commit -m "feat(settings): classify reads positively in both directions"
```

---

### Task 4: Trần 30 giây cho cả đọc lẫn ghi

**Files:**
- Modify: `src/lib/settings/env-client.ts`
- Modify: `src/lib/api/client.ts` (xuất hằng)
- Create: `src/lib/settings/env-client.timeout.test.ts`

**Interfaces:**
- Consumes: `EnvClientRead`, `UnavailableReason` từ Task 3.
- Produces: `WriteFailure` thêm nhánh `{ code: "timeout" }`; `export const DEFAULT_TIMEOUT_MS = 30000` trong `client.ts`. **`put()` TRẢ VỀ, không NÉM** — xem Global Constraints.

**Phục vụ:** E4 · `independent: false` (cần Task 3)

- [ ] **Step 1: Viết test đỏ**

`src/lib/settings/env-client.timeout.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readEnvForBrowser, saveEnvKeys } from "./env-client";

const CEILING = 30_000;

beforeEach(() => {
    vi.useFakeTimers();
    // Never resolves; only the AbortController can end it.
    vi.stubGlobal(
        "fetch",
        vi.fn(
            (_url: string, init?: RequestInit) =>
                new Promise((_res, rej) => {
                    init?.signal?.addEventListener("abort", () =>
                        rej(Object.assign(new Error("aborted"), { name: "AbortError" })),
                    );
                }),
        ),
    );
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe("30s ceiling on both directions", () => {
    it("read: past the ceiling -> unavailable/timeout", async () => {
        const p = readEnvForBrowser();
        await vi.advanceTimersByTimeAsync(CEILING + 1);
        const got = await p;
        expect(got.state, "read: expected unavailable").toBe("unavailable");
        expect(
            (got as { reason: { code: string } }).reason.code,
            "read: expected timeout code",
        ).toBe("timeout");
    });

    it("write: past the ceiling RESOLVES with write-failed/timeout, never rejects", async () => {
        const p = saveEnvKeys({ A: "1" });
        await vi.advanceTimersByTimeAsync(CEILING + 1);
        const got = await p; // a throw here fails the test by rejection
        expect(got.ok, "write: expected failure outcome").toBe(false);
        expect(
            (got as { detail: { code: string } }).detail.code,
            "write: expected timeout code",
        ).toBe("timeout");
    });

    it("just under the ceiling both are still pending", async () => {
        let settled = false;
        void readEnvForBrowser().then(() => {
            settled = true;
        });
        await vi.advanceTimersByTimeAsync(CEILING - 1);
        expect(settled, "must not fire early").toBe(false);
    });

    it("node key prompt leaves verifying and does NOT reach verified", async () => {
        // gap-probe F1: AC-4 promises a SURFACE outcome, so one case mounts one.
        const { render, screen, fireEvent } = await import("@testing-library/react");
        const { AbiNodeShell } = await import(
            "@/components/workspace/nodes/base/abi-node-shell"
        );
        render(<AbiNodeShell {...keyPromptFixture()} />);
        fireEvent.change(screen.getByPlaceholderText(/sk-/), {
            target: { value: "sk-test" },
        });
        fireEvent.click(screen.getByRole("button", { name: /Lưu/ }));
        await vi.advanceTimersByTimeAsync(CEILING + 1);
        expect(
            screen.queryByText(/Đang kiểm/),
            "must not stay in verifying",
        ).toBeNull();
        expect(
            screen.queryByText(/Khoá đã dùng được/),
            "must not claim verified after a timeout",
        ).toBeNull();
    });
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `pnpm vitest run src/lib/settings/env-client.timeout.test.ts`
Expected: FAIL — ba ca đầu treo tới trần 5 s của vitest, in `Test timed out in 5000ms`.

- [ ] **Step 3: Thêm trần**

`src/lib/api/client.ts`:

```ts
export const DEFAULT_TIMEOUT_MS = 30000;
```

rồi thay literal `timeout = 30000` bằng `timeout = DEFAULT_TIMEOUT_MS`.

`src/lib/settings/env-client.ts`:

```ts
import { DEFAULT_TIMEOUT_MS, notifyUnauthorized } from "@/lib/api/client";

async function fetchWithCeiling(
    input: string,
    init: RequestInit,
): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

const isAbort = (cause: unknown) =>
    cause instanceof Error && cause.name === "AbortError";
```

`readEnvForBrowser` catch:

```ts
    } catch (cause) {
        return isAbort(cause)
            ? { state: "unavailable", reason: { code: "timeout" } }
            : {
                  state: "unavailable",
                  reason: { code: "network", detail: describeCause(cause) },
              };
    }
```

`put()` catch — **return, không throw**:

```ts
    } catch (cause) {
        return {
            ok: false,
            reason: "write-failed",
            detail: isAbort(cause)
                ? { code: "timeout" }
                : { code: "network", detail: describeCause(cause) },
        };
    }
```

`WriteFailure` thêm `| { code: "timeout" }`. Cả hai lối gọi `fetch` đổi sang `fetchWithCeiling`.

- [ ] **Step 4: Chạy lại — phải xanh**

Run: `pnpm vitest run src/lib/settings/env-client.timeout.test.ts`
Expected: PASS, 4 ca.

- [ ] **Step 5: Chiều đỏ**

```bash
cp src/lib/settings/env-client.ts /tmp/ec2.bak
python3 - <<'PY'
import io
p = "src/lib/settings/env-client.ts"
s = io.open(p).read()
s = s.replace(
    "return await fetch(input, { ...init, signal: controller.signal });",
    "return await fetch(input, init);",
)
io.open(p, "w").write(s)
PY
pnpm vitest run src/lib/settings/env-client.timeout.test.ts
```

Expected: FAIL — ca `write: past the ceiling RESOLVES…` treo, vitest in `Test timed out in 5000ms` kèm đúng tên ca đó.

Lượt hai — đổi return thành throw:

```bash
cp /tmp/ec2.bak src/lib/settings/env-client.ts
python3 - <<'PY'
import io
p = "src/lib/settings/env-client.ts"
s = io.open(p).read()
i = s.index('detail: isAbort(cause)')
j = s.index('};', i) + 2
io.open(p, "w").write(s[:s.rindex("return {", 0, i)] + 'throw cause;\n' + s[j:])
PY
pnpm vitest run src/lib/settings/env-client.timeout.test.ts
```

Expected: FAIL — ca `node key prompt leaves verifying…` in `must not claim verified after a timeout` **hoặc** ca `write:` reject; ném lỗi rơi vào `catch` của `abi-node-shell:253` và hiện thành `phase: "invalid"` — đúng cái Global Constraints cấm.

```bash
cp /tmp/ec2.bak src/lib/settings/env-client.ts
pnpm vitest run src/lib/settings/env-client.timeout.test.ts
```

- [ ] **Step 6: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/lib/settings/env-client.ts src/lib/api/client.ts src/lib/settings/env-client.timeout.test.ts
git commit -m "feat(settings): a 30s ceiling on both the read and the write"
```

---

### Task 5: Tấm thông báo hai giọng + chuỗi năm thứ tiếng

**Files:**
- Modify: `src/components/settings/store-unreadable-notice.tsx`
- Modify: `src/i18n/messages/en.json`, `ja.json`, `ko.json`, `vi.json`, `zh.json`
- Create: `src/components/workspace/store-read-states-i18n.test.tsx`

**Interfaces:**
- Produces:
  - `type NoticeTone = "destructive" | "quiet"`
  - `StoreUnreadableNotice` thêm `tone?: NoticeTone` (mặc định `"destructive"`), `icon?: LucideIcon` (mặc định `ShieldAlert`), `testId?: string` (mặc định `"store-unreadable-notice"`).
  - Root luôn mang `data-proto-component="store-unreadable-notice"`.
  - Khoá i18n mới: `Settings.unauthenticated.{title,unchanged,retry}`, `Settings.unavailable.{title,unchanged,retry,reason}`, và cặp tương ứng dưới `Workspace.`.

**Phục vụ:** E11, E12 (tiền đề của E5, E13) · `independent: true`

- [ ] **Step 1: Thêm khoá vào năm locale**

`src/i18n/messages/en.json`, dưới `Settings`:

```json
    "unauthenticated": {
      "title": "Your session has expired",
      "unchanged": "Nothing has been changed.",
      "retry": "Try again"
    },
    "unavailable": {
      "title": "Cannot reach the key server",
      "unchanged": "Nothing has been changed.",
      "retry": "Try again",
      "reason": "The request got no answer ({code})."
    },
```

Lặp cùng cấu trúc dưới `Workspace`. Bốn locale còn lại dịch tương ứng — `vi` PHẢI khác `en` từng chuỗi (E11 khẳng định đúng quan hệ đó).

- [ ] **Step 2: Viết test đỏ**

`src/components/workspace/store-read-states-i18n.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";
import { StoreUnreadableNotice } from "@/components/settings/store-unreadable-notice";
import en from "@/i18n/messages/en.json";
import vi from "@/i18n/messages/vi.json";

const MESSAGES = { en, vi } as const;
const STATES = ["unauthenticated", "unavailable"] as const;
const KEYS = ["title", "unchanged", "retry"] as const;

function show(locale: keyof typeof MESSAGES, state: (typeof STATES)[number]) {
    const m = MESSAGES[locale].Settings[state];
    render(
        <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
            <StoreUnreadableNotice
                tone="quiet"
                reason="x"
                labels={{ title: m.title, unchanged: m.unchanged }}
                testId={`${state}-notice`}
            >
                <button type="button">{m.retry}</button>
            </StoreUnreadableNotice>
        </NextIntlClientProvider>,
    );
    return m;
}

describe("copy comes from the catalogue, per locale", () => {
    for (const state of STATES) {
        for (const key of KEYS) {
            it(`${state}.${key}: en renders en and differs from vi`, () => {
                const m = show("en", state);
                expect(
                    screen.getByText(m[key]),
                    `key Settings.${state}.${key} must render its en value`,
                ).toBeTruthy();
                expect(
                    m[key],
                    `key Settings.${state}.${key} must differ between en and vi`,
                ).not.toBe(MESSAGES.vi.Settings[state][key]);
            });
        }
    }
});
```

- [ ] **Step 3: Chạy để chắc nó đỏ**

Run: `pnpm vitest run src/components/workspace/store-read-states-i18n.test.tsx`
Expected: FAIL — `StoreUnreadableNotice` chưa nhận `tone`/`testId`; TypeScript và render đều đỏ.

- [ ] **Step 4: Thêm prop tone + marker**

`src/components/settings/store-unreadable-notice.tsx`:

```tsx
export type NoticeTone = "destructive" | "quiet";

const TONE = {
    destructive: {
        frame: "border-destructive/50 bg-destructive/5",
        icon: "text-destructive",
    },
    /**
     * A transient failure is not a broken store. Red says "danger, something is
     * wrong with your data"; a 30-second timeout is neither. Colour has to carry
     * the same taxonomy the words carry — this dossier's invariant applied to
     * the visual channel.
     */
    quiet: { frame: "border-border bg-muted/40", icon: "text-muted-foreground" },
} as const;
```

Thân component nhận `tone = "destructive"`, `icon: Icon = ShieldAlert`, `testId = "store-unreadable-notice"`; root:

```tsx
        <section
            role="alert"
            data-testid={testId}
            data-proto-component="store-unreadable-notice"
            className={cn(
                "space-y-2 rounded-md border p-4",
                TONE[tone].frame,
                className,
            )}
        >
```

Icon dùng `TONE[tone].icon`. Hai dòng chữ giữ `text-foreground` — lý do tương phản đã đo ở hồ sơ trước vẫn đúng cho cả hai giọng.

- [ ] **Step 5: Chạy lại — phải xanh**

Run: `pnpm vitest run src/components/workspace/store-read-states-i18n.test.tsx src/i18n/locale-parity.test.ts`
Expected: PASS — 6 ca i18n, và parity vẫn xanh với tập đóng băng không lớn lên.

- [ ] **Step 6: Chiều đỏ**

```bash
cp src/components/settings/store-unreadable-notice.tsx /tmp/n.bak
python3 - <<'PY'
import io
p = "src/components/settings/store-unreadable-notice.tsx"
s = io.open(p).read()
io.open(p, "w").write(s.replace("{labels.title}", '{"Không đọc được kho khoá đã lưu"}'))
PY
pnpm vitest run src/components/workspace/store-read-states-i18n.test.tsx
```

Expected: FAIL — hai ca đỏ, mỗi ca in `key Settings.unauthenticated.title must render its en value`.

```bash
cp /tmp/n.bak src/components/settings/store-unreadable-notice.tsx
```

- [ ] **Step 7: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/settings/store-unreadable-notice.tsx src/i18n/messages src/components/workspace/store-read-states-i18n.test.tsx
git commit -m "feat(settings): a quiet tone for transient read failures, in five locales"
```

---

### Task 6: Ba bề mặt × bốn trạng thái

**Files:**
- Modify: `src/components/workspace/settings-dialog.tsx:324, 365-375, 502-524`
- Modify: `src/components/workspace/node-key-prompt.tsx:32-50, 100-120`
- Modify: `src/components/workspace/nodes/base/abi-node-shell.tsx:187-260`
- Modify: `src/components/workspace/nodes/add/media-library-config-panel.tsx:55-95`
- Create: `src/components/workspace/store-read-states.test.tsx`
- Create: `src/components/workspace/store-read-states-retry.test.tsx`

**Interfaces:**
- Consumes: `EnvClientRead`, `EnvReadState` (Task 3); `StoreUnreadableNotice` với `tone`/`testId` (Task 5).
- Produces: `KeyPromptState` thêm `{ phase: "unauthenticated" }` và `{ phase: "unavailable"; reason: UnavailableReason }`. `testId` theo state: `store-unreadable-notice` · `unauthenticated-notice` · `unavailable-notice`.

**Phục vụ:** E5, E6, E10 · `independent: false` (cần Task 3 và Task 5)

- [ ] **Step 1: Viết test ma trận đỏ**

`src/components/workspace/store-read-states.test.tsx`:

```tsx
const SURFACES = ["settings", "node-key-prompt", "ml-panel"] as const;
const STATES = ["ok", "store-unreadable", "unauthenticated", "unavailable"] as const;
const CELLS = 12;

it(`covers exactly ${CELLS} cells`, () => {
    expect(SURFACES.length * STATES.length, "matrix must stay full").toBe(CELLS);
});

for (const surface of SURFACES) {
    for (const state of STATES) {
        it(`${surface} × ${state}`, async () => {
            await mount(surface, state);

            const wipe = screen.queryAllByRole("button", {
                name: /Thay kho|Replace the key store/i,
            });
            const expectWipe =
                surface === "settings" && state === "store-unreadable" ? 1 : 0;
            expect(wipe.length, `${surface} × ${state}: wipe buttons`).toBe(expectWipe);

            const retry = screen.queryAllByRole("button", {
                name: /Thử lại|Try again/i,
            });
            expect(retry.length, `${surface} × ${state}: retry buttons`).toBe(
                state === "ok" ? 0 : 1,
            );

            if (state !== "ok") {
                expect(
                    screen.getByTestId(`${state}-notice`),
                    `${surface} × ${state}: notice testid`,
                ).toBeTruthy();
            }

            const puts = (globalThis.fetch as Mock).mock.calls.filter(
                (c) => c[1]?.method === "PUT",
            );
            expect(puts.length, `${surface} × ${state}: PUT count`).toBe(0);
        });
    }
}

// Quan hệ chuỗi, locale ghim tường minh (gap-probe F2).
for (const locale of ["en", "vi"] as const) {
    for (const state of ["unauthenticated", "unavailable"] as const) {
        it(`${locale} × ${state}: title is the state's own key`, async () => {
            await mount("settings", state, locale);
            const own = MESSAGES[locale].Settings[state].title;
            const old = MESSAGES[locale].Settings.storeUnreadable.title;
            expect(
                screen.getByText(own),
                `${locale}/${state}: must use its own key`,
            ).toBeTruthy();
            expect(
                own,
                `${locale}/${state}: must not reuse storeUnreadable.title`,
            ).not.toBe(old);
        });
    }
}
```

- [ ] **Step 2: Viết test Thử lại đỏ**

`src/components/workspace/store-read-states-retry.test.tsx` — bốn ca, mỗi ca đếm lời gọi chứ không đếm nhãn:

```tsx
it("retry calls the reader exactly once", async () => {
    const read = vi
        .fn()
        .mockResolvedValue({ state: "unavailable", reason: { code: "timeout" } });
    await mount("settings", "unavailable", "vi", read);
    read.mockClear();
    fireEvent.click(screen.getByRole("button", { name: /Thử lại/ }));
    await waitFor(() =>
        expect(read, "retry: expected 1 read").toHaveBeenCalledTimes(1),
    );
});

it("double click still reads once, and the button is disabled while reading", async () => {
    const read = vi.fn(() => new Promise(() => {})); // never settles
    await mount("settings", "unavailable", "vi", read);
    read.mockClear();
    const btn = screen.getByRole("button", { name: /Thử lại/ });
    act(() => {
        fireEvent.click(btn);
        fireEvent.click(btn);
    });
    expect(read, "retry: expected 1 read, got 2").toHaveBeenCalledTimes(1);
    expect(btn, "retry: button must be disabled while reading").toBeDisabled();
});

it("a retry that succeeds returns the form", async () => {
    /* read → ok { env: { A: "1" } }; assert input value 1 and 0 notices */
});

it("a retry that returns 401 swaps the notice testid", async () => {
    /* read → unauthenticated; assert getByTestId("unauthenticated-notice") */
});
```

Ba bề mặt × ca đầu = ba lượt; hai ca cuối chạy trên màn Cài đặt.

- [ ] **Step 3: Chạy để chắc chúng đỏ**

Run: `pnpm vitest run src/components/workspace/store-read-states.test.tsx src/components/workspace/store-read-states-retry.test.tsx`
Expected: FAIL — mọi ô `unauthenticated`/`unavailable` in `… : notice testid` không tìm thấy; mọi ô không-ok in `retry buttons` nhận 0.

- [ ] **Step 4: Sửa ba bề mặt**

`settings-dialog.tsx` — `blocked` đổi từ `ReadFailure | null` sang `Exclude<EnvClientRead, { state: "ok" }> | null`; nhánh render chọn `tone`, `testId`, nhãn và children theo `blocked.state`; nút phá huỷ **chỉ** render khi `blocked.state === "store-unreadable"`; thêm nút Thử lại gọi lại `fetchEnv` với cờ `busy`.

`node-key-prompt.tsx` — `KeyPromptState` thêm hai phase; nhánh render dùng cùng component với `tone="quiet"`, `testId` theo phase, children là Thử lại (+ link Cài đặt chỉ ở `store-unreadable`).

`abi-node-shell.tsx` — nơi map `read.state` sang phase, thêm hai nhánh mới; **không** đụng nhánh `writeFailed`.

`media-library-config-panel.tsx` — `blocked` cùng kiểu, cùng ba nhánh, không nút phá huỷ.

- [ ] **Step 5: Chạy lại — phải xanh**

Run: `pnpm vitest run src/components/workspace/store-read-states.test.tsx src/components/workspace/store-read-states-retry.test.tsx`
Expected: PASS — 12 ô + 1 ca đếm + 4 ca chuỗi + 4 ca Thử lại.

- [ ] **Step 6: Chiều đỏ, hai lượt**

```bash
cp src/components/workspace/node-key-prompt.tsx /tmp/kp.bak
# gỡ điều kiện bề-mặt-là-Cài-đặt: thêm nút phá huỷ vào node prompt
pnpm vitest run src/components/workspace/store-read-states.test.tsx
```

Expected: FAIL — **đúng 2 ca** (`node-key-prompt × store-unreadable`, `ml-panel × store-unreadable`), mỗi ca in `… : wipe buttons` expected 0 got 1.

```bash
cp /tmp/kp.bak src/components/workspace/node-key-prompt.tsx
python3 - <<'PY'
import io
p = "src/components/workspace/settings-dialog.tsx"
s = io.open(p).read()
io.open(p, "w").write(s.replace('t("unauthenticated.title")', 't("storeUnreadable.title")'))
PY
pnpm vitest run src/components/workspace/store-read-states.test.tsx
```

Expected: FAIL — 2 ca chuỗi đỏ, in `en/unauthenticated: must use its own key`.

Khôi phục rồi chạy lại cả hai tệp.

- [ ] **Step 7: Guard một-bộ-đọc vẫn xanh**

Run: `bash scripts/settings/check-one-env-reader.sh`
Expected: `OK: the key endpoint has exactly one non-test caller`.

- [ ] **Step 8: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/workspace src/components/settings
git commit -m "feat(workspace): three surfaces tell four read states apart"
```

---

### Task 7: Đọc lại khi máy chủ từ chối lệnh xoá

**Files:**
- Modify: `src/lib/settings/env-client.ts` (nhận diện `ENV_STORE_REPLACE_REFUSED`)
- Modify: `src/components/workspace/settings-dialog.tsx:385-400`
- Create: `src/components/workspace/settings-dialog.replace-refused.test.tsx`

**Interfaces:**
- Consumes: mã `ENV_STORE_REPLACE_REFUSED` từ Task 1; `readEnvForBrowser` từ Task 3.
- Produces: `SaveOutcome` thêm `{ ok: false; reason: "replace-refused" }`.

**Phục vụ:** E7 · `independent: false` (cần Task 1, 3, 6)

- [ ] **Step 1: Viết test đỏ**

```tsx
it("a refusal makes the screen re-read, not show an error", async () => {
    const calls: string[] = [];
    stubFetchSequence(
        [
            ["GET", 503, { code: "ENV_STORE_UNREADABLE" }],
            ["PUT", 409, { code: "ENV_STORE_REPLACE_REFUSED", state: "ok" }],
            ["GET", 200, { env: { A: "1" } }],
        ],
        calls,
    );

    await openSettings();
    fireEvent.click(screen.getByRole("button", { name: /Thay kho/ }));
    fireEvent.click(screen.getByRole("button", { name: /Tôi hiểu/ }));

    await waitFor(() =>
        expect(screen.getByDisplayValue("1"), "form must show the key").toBeTruthy(),
    );
    expect(calls, "expected GET after the refused PUT").toEqual(["GET", "PUT", "GET"]);
    expect(screen.queryAllByRole("alert").length, "no error card").toBe(0);
});

it("positive control: a 200 replace empties the form as before", async () => {
    /* GET 503 → PUT 200 → assert empty form, 0 notices, exactly 1 PUT */
});
```

- [ ] **Step 2: Chạy để chắc nó đỏ**

Run: `pnpm vitest run src/components/workspace/settings-dialog.replace-refused.test.tsx`
Expected: FAIL — `expected GET after the refused PUT` nhận `["GET","PUT"]`, và một `role="alert"` xuất hiện.

- [ ] **Step 3: Nhận diện mã mới rồi đọc lại**

`env-client.ts`, trong `put()` nhánh 409 — phân biệt hai mã:

```ts
        if (response.status === 409) {
            const body = await response.json().catch(() => ({}));
            if ((body as { code?: string }).code === "ENV_STORE_REPLACE_REFUSED") {
                return { ok: false, reason: "replace-refused" };
            }
            return {
                ok: false,
                reason: "store-unreadable",
                detail: { code: "http", status: 409 },
            };
        }
```

`settings-dialog.tsx`, sau `confirmReplace`:

```ts
            const out = await replaceUnreadableStore();
            if (!out.ok && out.reason === "replace-refused") {
                // The server just said our premise was wrong. The honest move is
                // to re-check the premise, not to report an error about a fault
                // that does not exist.
                await fetchEnv();
                return;
            }
```

- [ ] **Step 4: Chạy lại — phải xanh**

Run: `pnpm vitest run src/components/workspace/settings-dialog.replace-refused.test.tsx`
Expected: PASS, 2 ca.

- [ ] **Step 5: Chiều đỏ**

```bash
cp src/components/workspace/settings-dialog.tsx /tmp/sd.bak
python3 - <<'PY'
import io
p = "src/components/workspace/settings-dialog.tsx"
s = io.open(p).read()
io.open(p, "w").write(s.replace("await fetchEnv();\n                return;", "return;"))
PY
pnpm vitest run src/components/workspace/settings-dialog.replace-refused.test.tsx
```

Expected: FAIL — `expected GET after the refused PUT` in `["GET","PUT"]`.

```bash
cp /tmp/sd.bak src/components/workspace/settings-dialog.tsx
```

- [ ] **Step 6: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/workspace/settings-dialog.tsx src/lib/settings/env-client.ts src/components/workspace/settings-dialog.replace-refused.test.tsx
git commit -m "feat(settings): a refused wipe re-reads instead of reporting an error"
```

---

### Task 8: Sàn tiếp cận cho hai trạng thái mới

**Files:**
- Modify: `src/components/proto/khong-noi-sai-ve-kho-khoa-proto.tsx`
- Create: `scripts/settings/check-a11y-read-states.sh`

**Interfaces:**
- Consumes: `StoreUnreadableNotice` với `tone` + `data-proto-component` (Task 5).
- Produces: 4 trang bản mẫu = 2 state × 2 giao diện, mỗi trang mang `data-proto-state` và `data-proto-component`.

**Phục vụ:** E13 · `independent: false` (cần Task 5)

- [ ] **Step 1: Bản mẫu dùng component THẬT**

Trong proto, xoá `QuietNotice` cục bộ và thay bằng `StoreUnreadableNotice` với `tone="quiet"`, `icon={LogIn}` / `icon={WifiOff}`, `testId` theo state. Đây là điều gap-probe F5 đòi: bản mẫu phải mount chính component sẽ ship, không phải bản chép tay.

- [ ] **Step 2: Viết wrapper**

`scripts/settings/check-a11y-read-states.sh` — chép khuôn từ `check-a11y-proto.sh` **sang tệp mới**, đổi ba hằng và thêm vòng đọc lại:

```bash
PORT="${KNSK_A11Y_PORT:-3196}"
STATES=(settings-unauthenticated settings-unavailable)
NEXT_DIST_DIR=build/knsk-a11y pnpm dev --port "$PORT" >/dev/null 2>&1 &
```

Vòng đọc lại, sau mỗi lượt tải trang:

```bash
    got_state=$(printf '%s' "$html" | sed -n 's/.*data-proto-state="\([^"]*\)".*/\1/p' | head -1)
    [ "$got_state" = "$state" ] || {
        echo "FAIL: rendered state '$got_state', asked for '$state'"; exit 1; }
    printf '%s' "$html" | grep -q 'data-proto-component="store-unreadable-notice"' || {
        echo "FAIL: component marker missing on page $url"; exit 1; }
```

- [ ] **Step 3: Chạy**

Run: `chmod +x scripts/settings/check-a11y-read-states.sh && bash scripts/settings/check-a11y-read-states.sh`
Expected: `4/4 pages scanned AND 4/4 rendered the state AND the theme they were asked for`, 0 vi phạm `critical`/`serious`.

- [ ] **Step 4: Chiều đỏ, hai lượt**

```bash
cp scripts/settings/check-a11y-read-states.sh /tmp/a.bak
python3 - <<'PY'
import io
p = "scripts/settings/check-a11y-read-states.sh"
s = io.open(p).read()
io.open(p, "w").write(s.replace("settings-unavailable", "settings-khong-ton-tai"))
PY
bash scripts/settings/check-a11y-read-states.sh
```

Expected: FAIL — `rendered state 'unknown:settings-khong-ton-tai', asked for 'settings-khong-ton-tai'`, **từ vòng đọc lại**, không phải từ axe.

```bash
cp /tmp/a.bak scripts/settings/check-a11y-read-states.sh
cp src/components/proto/khong-noi-sai-ve-kho-khoa-proto.tsx /tmp/p.bak
# thay import component bằng markup inline có aria đầy đủ
bash scripts/settings/check-a11y-read-states.sh
```

Expected: FAIL — `component marker missing on page …`.

Khôi phục cả hai rồi chạy lại.

- [ ] **Step 5: Commit**

```bash
pnpm lint:check && pnpm typecheck
git add src/components/proto scripts/settings/check-a11y-read-states.sh
git commit -m "test(settings): an a11y floor for the two new read states, on the real component"
```

---

## Thứ tự và song song

```
Task 1 (server)      ──┐
Task 2 (seam helper) ──┼── độc lập, chạy song song được
Task 5 (tone + i18n) ──┘
                        │
Task 3 (taxonomy)  ← cần 2
                        │
Task 4 (ceiling)   ← cần 3
Task 6 (3 bề mặt)  ← cần 3, 5
Task 8 (a11y)      ← cần 5
                        │
Task 7 (đọc lại)   ← cần 1, 3, 6
```

Ba task `independent: true` (1, 2, 5) gom được vào một lượt `execute-parallel`. Năm task còn lại tuần tự theo mũi tên.

Lưu ý thứ tự: guard của Task 2 **đỏ có chủ ý** cho tới khi Task 3 thêm caller thứ hai. Đó là trạng thái trung gian đã biết, không phải hồi quy.

## Ô đo ↔ task

| Ô | Task | Ô | Task |
|---|---|---|---|
| E1 | 1 | E2 | 3 |
| E3 | 2 + 3 | E4 | 4 |
| E5 | 6 | E6 | 6 |
| E7 | 7 | E8 | 2 |
| E9 | 2 | E10 | 6 (chạy lại guard cũ) |
| E11 | 5 | E12 | 5 |
| E13 | 8 | | |

Mười ba ô, tám task, không ô nào không có chủ.
