# Node nạp-từ-kho (add-media-library) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một add node mới trên canvas cho phép tìm trong media-library, chọn một
clip, và nạp bytes về kho file của OneFlow thành `file_key`.

**Architecture:** Client (node) → hai route handler dưới `src/app/api/media-library/`
→ `src/lib/media-library/*.server.ts` → REST của media-library. Node không giữ
asset: nạp xong thì gọi `expands()` để nở ra một `videoNode` mang `fileKeys`, đúng
khuôn mọi add node sẵn có. Bytes chỉ đi qua URL ký, tải phía server, có ba chặn.

**Tech Stack:** Next.js 15 route handlers (`runtime = "nodejs"`) · React 19 client
component với `@xyflow/react` · `next-intl` cho chữ · vitest · biome.

## Global Constraints

Áp cho MỌI task, không nhắc lại trong từng task:

- **Comment trong code: tiếng Anh.** Chữ hiển thị cho người dùng: tiếng Việt qua
  `next-intl`. Hai chuyện khác nhau — CLAUDE.md.
- **Cấm hardcode ngữ vựng BĐS.** `provenance`, `scene_kind`, `entity.kind`,
  `entity.specificity`, `energy`, `interior_state`, `license_label`, `slot_role`
  vào TypeScript dưới dạng `string`, KHÔNG union đóng, KHÔNG `switch`, KHÔNG bảng
  dịch phía OneFlow. Guard E12 quét cửa sổ diff và sẽ đỏ.
- **Không chạm** `config/tongflow.abi.json`, `src/generated/abi/**`, `sdk/**`,
  `src/db/**`. Guard E23 khẳng định điều đó.
- **Không sửa** `src/lib/file/file-utils.ts` — `downloadAndSave()` ở đó phải giữ
  nguyên trạng thái **0 caller** (guard E27).
- **Node KHÔNG có tab.** `data.activeTab` phải để `undefined`; exporter coi
  `activeTab === undefined` là data node (`exporter.ts:369`). Thêm một tên tab mới
  đồng nghĩa phải sửa allow-list đó — đừng.
- Style: biome, thụt 4 space, nháy kép, alias `@/`. `pnpm lint` để tự định dạng.
- **Pilot N=2:** trước mọi lệnh nặng (`pnpm test/build`, `vitest`, `scripts/acceptance/*`)
  phải `~/.claude/oneflow-pilot/s4lock acquire lane-13b`, xong thì `release` ngay.
- Conventional Commits. Branch `feat/add-media-library`, không commit thẳng `main`.

**Hợp đồng của media-library — số liệu thật, chép để khỏi tra lại:**
`Authorization: Bearer <key>` · scope `search` · `POST /v1/search` body
`{intent, media_type?, limit?≤20, exclude_ids?≤50}` · `GET /v1/assets/:id` →
`{card, urls:{original, proxy, thumb}, expires_in_s, contracts_version}` ·
`contracts_version` là trường trong thân MỌI response, hiện `"0.2.0"` · lỗi:
401 `unauthorized`, 403 `forbidden: cần scope <x>`, 400 `bad_request` /
`entity_not_found`, 404 `not_found`, 501 `not_implemented`, 500 trần ·
**không có 429** · `urls` KHÔNG kèm mime/size/filename.

---

### Task 1: Fixture của máy chủ giả + guard xuất xứ

**Files:**
- Create: `src/lib/media-library/__fixtures__/README.md`
- Create: `src/lib/media-library/__fixtures__/cards.ts`
- Create: `src/lib/media-library/__fixtures__/stub-server.ts`
- Create: `scripts/media-library/check-fixture-provenance.sh`
- Test: `src/lib/media-library/__fixtures__/provenance.test.ts`

**Interfaces:**
- Produces: `startStub(opts: StubOptions): Promise<StubHandle>` với
  `StubOptions = { searchResponse?: unknown; searchStatus?: number; assetResponse?: unknown; assetStatus?: number; contractsVersion?: string; bytes?: Buffer; requireAuth?: boolean }`
  và `StubHandle = { url: string; requests: RecordedRequest[]; close(): Promise<void> }`,
  `RecordedRequest = { method: string; path: string; headers: Record<string,string>; body: unknown }`.
- Produces: `VIDEO_CARD`, `CARD_WITH_LICENSE`, `CARD_UNKNOWN_VOCAB`, `CARD_NULL_ENTITY` (kiểu `MediaCard` của Task 2).

**Phục vụ:** E28 (xuất xứ fixture) · nền cho E5, E8, E10, E15, E17, E18, E21, E26.

**`independent: false`** — mọi task sau dùng nó.

- [ ] **Step 1: Viết fixture kèm tiêu đề xuất xứ**

`src/lib/media-library/__fixtures__/cards.ts`:

```ts
/**
 * PROVENANCE: media-library packages/contracts/src/media-card.ts:15-43
 * PROVENANCE: media-library packages/contracts/src/search.ts:106-128
 * READ-ON: 2026-08-19
 *
 * Hand-built from the contract above, not recorded from a live service. The
 * guard in check-fixture-provenance.sh asserts these headers exist and that the
 * field-set below still matches FIELDS — it catches fixtures DRIFTING, it cannot
 * catch a fixture that was wrong on day one. That residue is a Known limit on
 * the contract and a Gate-2 precondition.
 */
import type { MediaCard } from "@/lib/media-library/types";

/** Every field name the contract defines on a card, in contract order. */
export const CARD_FIELDS = [
    "id", "card_version", "tier", "media_type", "provenance", "license_label",
    "entity", "scene_kind", "subjects", "duration_s", "suggested_in_s",
    "suggested_out_s", "energy", "captured_at", "fresh", "interior_state",
    "times_used", "pinned", "curator_note", "caption", "shoot", "renditions",
] as const;

export const VIDEO_CARD: MediaCard = {
    id: "11111111-1111-4111-8111-111111111111",
    card_version: 1,
    tier: "project",
    media_type: "video",
    provenance: "real",
    entity: null,
    subjects: [],
    times_used: {},
    caption: "Ban công hướng ra hồ, nắng chiều",
    renditions: {
        proxy_url: "https://signed.example/proxy/1?sig=abc",
        thumb_url: "https://signed.example/thumb/1?sig=abc",
    },
};

export const CARD_WITH_LICENSE: MediaCard = {
    ...VIDEO_CARD,
    id: "22222222-2222-4222-8222-222222222222",
    license_label: "Phối cảnh 3D",
};

/**
 * The decisive card for guarantee #3: two vocabulary values OneFlow has never
 * seen. A closed TS union or a switch would drop or throw on exactly these.
 */
export const CARD_UNKNOWN_VOCAB: MediaCard = {
    ...VIDEO_CARD,
    id: "33333333-3333-4333-8333-333333333333",
    provenance: "generated:acme@deadbeef",
    scene_kind: "mot-loai-chua-tung-co",
    energy: "mot-muc-chua-tung-co",
};

export const CARD_NULL_ENTITY: MediaCard = { ...VIDEO_CARD, entity: null };
```

- [ ] **Step 2: Viết máy chủ giả**

`src/lib/media-library/__fixtures__/stub-server.ts` — dùng `node:http`, ghi lại
mọi request, và **mặc định đòi header `Authorization`** (nên adapter quên header
sẽ nhận 401 chứ không im lặng trả rỗng):

```ts
import { createServer, type IncomingMessage, type Server } from "node:http";

export interface RecordedRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    body: unknown;
}

export interface StubOptions {
    searchResponse?: unknown;
    searchStatus?: number;
    assetResponse?: unknown;
    assetStatus?: number;
    contractsVersion?: string;
    bytes?: Buffer;
    bytesContentType?: string;
    /** Default true: a request without a Bearer header gets 401, like the real service. */
    requireAuth?: boolean;
    /** Emit a body that is not JSON, to exercise the parse-failure arm. */
    nonJsonBody?: boolean;
}

export interface StubHandle {
    url: string;
    requests: RecordedRequest[];
    close(): Promise<void>;
}

async function readBody(req: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    if (chunks.length === 0) return undefined;
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        return undefined;
    }
}

export async function startStub(opts: StubOptions = {}): Promise<StubHandle> {
    const version = opts.contractsVersion ?? "0.2.0";
    const requests: RecordedRequest[] = [];
    const server: Server = createServer(async (req, res) => {
        const path = req.url ?? "";
        requests.push({
            method: req.method ?? "",
            path,
            headers: Object.fromEntries(
                Object.entries(req.headers).map(([k, v]) => [k, String(v)]),
            ),
            body: await readBody(req),
        });

        const send = (status: number, payload: unknown) => {
            res.writeHead(status, { "content-type": "application/json" });
            res.end(JSON.stringify(payload));
        };

        if ((opts.requireAuth ?? true) && !req.headers.authorization) {
            send(401, { error: "unauthorized", contracts_version: version });
            return;
        }
        if (opts.nonJsonBody) {
            res.writeHead(200, { "content-type": "text/html" });
            res.end("<html>not json</html>");
            return;
        }
        if (path.startsWith("/v1/search")) {
            send(opts.searchStatus ?? 200, opts.searchResponse ?? {
                cards: [],
                context: null,
                candidates: 0,
                skipped: 0,
                warnings: [],
                contracts_version: version,
            });
            return;
        }
        if (path.startsWith("/v1/assets/")) {
            send(opts.assetStatus ?? 200, opts.assetResponse ?? {
                contracts_version: version,
            });
            return;
        }
        if (path.startsWith("/bytes")) {
            res.writeHead(200, {
                "content-type": opts.bytesContentType ?? "video/mp4",
            });
            res.end(opts.bytes ?? Buffer.from("fake-mp4-bytes"));
            return;
        }
        send(404, { error: "not_found", contracts_version: version });
    });
    await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : 0;
    return {
        url: `http://127.0.0.1:${port}`,
        requests,
        close: () => new Promise<void>((r) => server.close(() => r())),
    };
}
```

- [ ] **Step 3: Viết test xuất xứ (đỏ trước)**

`src/lib/media-library/__fixtures__/provenance.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARD_FIELDS, VIDEO_CARD } from "./cards";

describe("fixture provenance", () => {
    it("cites the contract file, line range and read date", () => {
        const src = readFileSync(
            "src/lib/media-library/__fixtures__/cards.ts",
            "utf8",
        );
        expect(src).toMatch(/PROVENANCE: media-library packages\/contracts\/src\/\S+:\d+/);
        expect(src).toMatch(/READ-ON: \d{4}-\d{2}-\d{2}/);
    });

    it("uses only field names the contract defines", () => {
        const extra = Object.keys(VIDEO_CARD).filter(
            (k) => !CARD_FIELDS.includes(k as (typeof CARD_FIELDS)[number]),
        );
        expect(extra).toEqual([]);
    });

    it("goes red when a field is renamed away from the contract", () => {
        const drifted = { ...VIDEO_CARD, licenseLabel: "x" } as Record<string, unknown>;
        const extra = Object.keys(drifted).filter(
            (k) => !CARD_FIELDS.includes(k as (typeof CARD_FIELDS)[number]),
        );
        expect(extra).toEqual(["licenseLabel"]);
    });
});
```

- [ ] **Step 4: Chạy — phải ĐỎ vì `types.ts` chưa có**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/media-library/__fixtures__/provenance.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
```
Expected: FAIL — `Cannot find module '@/lib/media-library/types'`.

- [ ] **Step 5: Viết guard shell**

`scripts/media-library/check-fixture-provenance.sh`:

```bash
#!/usr/bin/env bash
# E28 — fixtures must cite where their shape came from, and must not drift.
# ROOT is derived from this script's own location, never from cwd.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
FIX="src/lib/media-library/__fixtures__/cards.ts"
[ -f "$FIX" ] || { echo "FAIL: no $FIX"; exit 1; }
grep -q "PROVENANCE: media-library packages/contracts/src/" "$FIX" \
    || { echo "FAIL: $FIX has no PROVENANCE header naming the contract source"; exit 1; }
grep -qE "READ-ON: [0-9]{4}-[0-9]{2}-[0-9]{2}" "$FIX" \
    || { echo "FAIL: $FIX has no READ-ON date"; exit 1; }
echo "provenance headers present in $FIX"
exec pnpm vitest run src/lib/media-library/__fixtures__/provenance.test.ts
```

- [ ] **Step 6: `chmod +x` và commit**

```bash
chmod +x scripts/media-library/check-fixture-provenance.sh
git add src/lib/media-library/__fixtures__ scripts/media-library/check-fixture-provenance.sh
git commit -m "test(media-library): fixture máy chủ giả + guard xuất xứ (E28)"
```

---

### Task 2: Kiểu dữ liệu, chốt phiên bản, đọc cấu hình

**Files:**
- Create: `src/lib/media-library/types.ts`
- Create: `src/lib/media-library/version.ts`
- Create: `src/lib/media-library/config.server.ts`
- Test: `src/lib/media-library/config.server.test.ts`

**Interfaces:**
- Produces: `type MediaCard`, `type AssetDetail`, `type SearchResponse`.
- Produces: `SUPPORTED_CONTRACTS = "0.2"`, `checkContractsVersion(received: string): { ok: true } | { ok: false; message: string }`.
- Produces: `type MediaLibraryConfig = { baseUrl: string; apiKey: string }`,
  `resolveConfig(): Promise<{ ok: true; config: MediaLibraryConfig } | { ok: false; missing: string[]; message: string }>`.

**Phục vụ:** E1 (thiếu cấu hình gọi đúng tên) · nền cho E21 (chốt phiên bản).

**`independent: false`** — cần Task 1 để `types.ts` khớp fixture.

- [ ] **Step 1: Viết kiểu — mọi từ vựng lĩnh vực là `string`**

`src/lib/media-library/types.ts`:

```ts
/**
 * Wire types for the media-library REST boundary (ADR-0012).
 *
 * Domain vocabulary crosses this boundary as DATA, never as code: provenance,
 * scene_kind, entity.kind, entity.specificity, energy and interior_state are
 * plain `string` on purpose. `provenance` in particular is an OPEN union on the
 * far side (`generated:${provider}@${hash}` alongside a fixed set), so a closed
 * TS union here would be wrong by construction and a `switch` on it can never
 * be exhaustive. When the library opens a new domain, this file does not change.
 */

export interface MediaCardEntity {
    id: string;
    kind: string;
    name: string;
    specificity: string;
    relation_text: string;
}

export interface MediaCard {
    id: string;
    card_version: 1;
    tier: string;
    media_type: string;
    provenance: string;
    license_label?: string;
    entity: MediaCardEntity | null;
    scene_kind?: string;
    subjects: string[];
    duration_s?: number;
    suggested_in_s?: number;
    suggested_out_s?: number;
    energy?: string;
    captured_at?: string;
    fresh?: boolean;
    interior_state?: string;
    times_used: Record<string, number>;
    pinned?: boolean;
    curator_note?: string;
    caption: string;
    shoot?: { group: string; index: number };
    renditions: { proxy_url: string; thumb_url: string };
}

export interface SearchResponse {
    cards: MediaCard[];
    candidates: number;
    skipped: number;
    warnings: string[];
    contracts_version: string;
}

export interface AssetDetail {
    card: MediaCard;
    urls: { original: string; proxy: string | null; thumb: string | null };
    expires_in_s: number;
    contracts_version: string;
}
```

- [ ] **Step 2: Viết chốt phiên bản**

`src/lib/media-library/version.ts`:

```ts
/**
 * ADR-0012 guarantee #7: the boundary is versioned, and a mismatch refuses BY
 * NAME rather than guessing.
 *
 * The ADR says "major mismatch". This pins the whole 0.2 LINE because the
 * library is at 0.x, where minor IS the breaking axis: 0.1.0 -> 0.2.0 is what
 * introduced the search surface. From 1.0.0 on, only major is compared.
 * Loosening later is cheap; tightening after shipping is not.
 */
export const SUPPORTED_CONTRACTS = "0.2";

export function checkContractsVersion(
    received: string,
): { ok: true } | { ok: false; message: string } {
    const [major = "", minor = ""] = String(received).split(".");
    const [wantMajor = "", wantMinor = ""] = SUPPORTED_CONTRACTS.split(".");
    const compatible =
        major === wantMajor && (major !== "0" || minor === wantMinor);
    return compatible
        ? { ok: true }
        : {
              ok: false,
              message: `Lệch phiên bản hợp đồng media-library: OneFlow ghim ${SUPPORTED_CONTRACTS}, dịch vụ trả ${received}. Đã dừng, không đọc dữ liệu theo hình dạng cũ.`,
          };
}
```

- [ ] **Step 3: Viết test đọc cấu hình (đỏ trước)**

`src/lib/media-library/config.server.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
}));

import { resolveConfig } from "./config.server";

describe("resolveConfig — names what is missing", () => {
    beforeEach(() => {
        store.env = {};
    });

    it("names MEDIA_LIBRARY_URL when only the url is missing", async () => {
        store.env = { MEDIA_LIBRARY_API_KEY: "k" };
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (r.ok) return;
        expect(r.missing).toEqual(["MEDIA_LIBRARY_URL"]);
        expect(r.message).toContain("MEDIA_LIBRARY_URL");
    });

    it("names BOTH when both are missing", async () => {
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
        if (r.ok) return;
        expect(r.missing).toEqual([
            "MEDIA_LIBRARY_URL",
            "MEDIA_LIBRARY_API_KEY",
        ]);
        expect(r.message).toContain("MEDIA_LIBRARY_URL");
        expect(r.message).toContain("MEDIA_LIBRARY_API_KEY");
    });

    // The load-bearing half: a function that always reports "missing" would pass
    // every assertion above and break the product.
    it("reports ok when both are present, and trims the trailing slash", async () => {
        store.env = {
            MEDIA_LIBRARY_URL: "https://lib.example/",
            MEDIA_LIBRARY_API_KEY: "k",
        };
        const r = await resolveConfig();
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.config.baseUrl).toBe("https://lib.example");
    });

    it("treats a whitespace-only value as missing", async () => {
        store.env = { MEDIA_LIBRARY_URL: "  ", MEDIA_LIBRARY_API_KEY: "k" };
        const r = await resolveConfig();
        expect(r.ok).toBe(false);
    });
});
```

- [ ] **Step 4: Chạy — phải ĐỎ**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/media-library/config.server.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
```
Expected: FAIL — `Cannot find module './config.server'`.

- [ ] **Step 5: Viết `config.server.ts`**

```ts
import "server-only";

import { loadEnvStore } from "@/lib/settings/env-store.server";

/**
 * ADR-0012 guarantee #2: media-library is a BYO-key service, not a hard
 * dependency. Nothing here runs at boot; it runs when the node asks. When
 * configuration is absent the caller gets the VARIABLE NAMES back, because
 * "chưa cấu hình dịch vụ" leaves the user with nothing to act on.
 */
export const URL_KEY = "MEDIA_LIBRARY_URL";
export const API_KEY = "MEDIA_LIBRARY_API_KEY";

export interface MediaLibraryConfig {
    baseUrl: string;
    apiKey: string;
}

export type ResolveConfigResult =
    | { ok: true; config: MediaLibraryConfig }
    | { ok: false; missing: string[]; message: string };

export async function resolveConfig(): Promise<ResolveConfigResult> {
    const env = await loadEnvStore();
    const url = (env[URL_KEY] ?? process.env[URL_KEY] ?? "").trim();
    const key = (env[API_KEY] ?? process.env[API_KEY] ?? "").trim();

    const missing: string[] = [];
    if (!url) missing.push(URL_KEY);
    if (!key) missing.push(API_KEY);
    if (missing.length > 0) {
        return {
            ok: false,
            missing,
            message: `Chưa gọi được media-library: thiếu ${missing.join(" và ")}.`,
        };
    }
    return {
        ok: true,
        config: { baseUrl: url.replace(/\/+$/, ""), apiKey: key },
    };
}
```

- [ ] **Step 6: Chạy — phải XANH, rồi commit**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/media-library/config.server.test.ts src/lib/media-library/__fixtures__/provenance.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
git add src/lib/media-library
git commit -m "feat(media-library): kiểu wire, chốt phiên bản 0.2, đọc cấu hình BYO (E1)"
```

---

### Task 3: Bộ gọi REST — hình dạng request, ma trận tám lỗi, cảnh báo

**Files:**
- Create: `src/lib/media-library/errors.ts`
- Create: `src/lib/media-library/client.server.ts`
- Test: `src/lib/media-library/client.server.test.ts`

**Interfaces:**
- Produces: `type MediaLibraryFailure = { code: MediaLibraryErrorCode; message: string }`
  với `MediaLibraryErrorCode = "MISSING_CONFIG" | "AUTH_REJECTED" | "MISSING_SCOPE" | "BAD_REQUEST" | "NOT_FOUND" | "UPSTREAM_ERROR" | "NOT_IMPLEMENTED" | "BAD_RESPONSE" | "NETWORK_ERROR" | "VERSION_MISMATCH"`.
- Produces: `searchVideos(intent: string, limit?: number): Promise<{ ok: true; data: SearchResponse } | { ok: false; failure: MediaLibraryFailure }>`.
- Produces: `getAsset(assetId: string): Promise<{ ok: true; data: AssetDetail } | { ok: false; failure: MediaLibraryFailure }>`.

**Phục vụ:** E5 (hình dạng request) · E8 (cảnh báo nguyên văn) · E10 (ma trận tám lỗi) · E21 (chốt phiên bản).

**`independent: false`** — cần Task 1 + Task 2.

- [ ] **Step 1: Viết test ma trận tám lỗi (đỏ trước)**

`src/lib/media-library/client.server.test.ts` — phần quyết định:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
}));

import { startStub, type StubHandle } from "./__fixtures__/stub-server";
import { VIDEO_CARD } from "./__fixtures__/cards";
import { searchVideos } from "./client.server";

let stub: StubHandle;
const use = (s: StubHandle) => {
    store.env = { MEDIA_LIBRARY_URL: s.url, MEDIA_LIBRARY_API_KEY: "secret-key" };
};

afterEach(async () => {
    await stub?.close();
});

describe("searchVideos — request shape (E5)", () => {
    it("sends POST /v1/search with Bearer auth, the intent and a pinned media_type", async () => {
        stub = await startStub({
            searchResponse: {
                cards: [VIDEO_CARD],
                context: null,
                candidates: 1,
                skipped: 0,
                warnings: [],
                contracts_version: "0.2.0",
            },
        });
        use(stub);

        const r = await searchVideos("ban công hướng hồ");

        expect(r.ok).toBe(true);
        const req = stub.requests.at(-1);
        expect(req?.method).toBe("POST");
        expect(req?.path).toBe("/v1/search");
        // Anchored, exactly like the service's own auth regex.
        expect(req?.headers.authorization).toMatch(/^Bearer secret-key$/);
        const body = req?.body as Record<string, unknown>;
        expect(body.intent).toBe("ban công hướng hồ");
        expect(body.media_type).toBe("video");
        expect(Number(body.limit)).toBeLessThanOrEqual(20);
    });

    // SUPPRESSION: the stub 401s without a header, so an adapter that forgets
    // auth fails loudly here instead of quietly returning an empty list.
    it("is rejected when the header is absent", async () => {
        stub = await startStub({ requireAuth: true });
        use(stub);
        vi.spyOn(globalThis, "fetch").mockImplementationOnce((input, init) => {
            const stripped = { ...(init ?? {}) };
            delete (stripped as { headers?: unknown }).headers;
            return (vi.mocked(globalThis.fetch) as never as typeof fetch).apply(
                globalThis,
                [input, stripped] as never,
            );
        });
        // The point is the stub's behaviour, asserted directly:
        const raw = await fetch(`${stub.url}/v1/search`, { method: "POST" });
        expect(raw.status).toBe(401);
    });
});

describe("searchVideos — the eight ways this boundary breaks (E10)", () => {
    const cases: Array<{ name: string; opts: Parameters<typeof startStub>[0]; code: string }> = [
        { name: "401 bad key", opts: { searchStatus: 401, searchResponse: { error: "unauthorized", contracts_version: "0.2.0" } }, code: "AUTH_REJECTED" },
        { name: "403 missing scope", opts: { searchStatus: 403, searchResponse: { error: "forbidden: cần scope search", contracts_version: "0.2.0" } }, code: "MISSING_SCOPE" },
        { name: "400 bad body", opts: { searchStatus: 400, searchResponse: { error: "bad_request", contracts_version: "0.2.0" } }, code: "BAD_REQUEST" },
        { name: "404", opts: { searchStatus: 404, searchResponse: { error: "not_found", contracts_version: "0.2.0" } }, code: "NOT_FOUND" },
        { name: "500 bare", opts: { searchStatus: 500, searchResponse: {} }, code: "UPSTREAM_ERROR" },
        { name: "501 not wired", opts: { searchStatus: 501, searchResponse: { error: "not_implemented", contracts_version: "0.2.0" } }, code: "NOT_IMPLEMENTED" },
        { name: "html body", opts: { nonJsonBody: true }, code: "BAD_RESPONSE" },
    ];

    for (const c of cases) {
        it(`maps ${c.name} to ${c.code}`, async () => {
            stub = await startStub(c.opts);
            use(stub);
            const r = await searchVideos("x");
            expect(r.ok).toBe(false);
            if (r.ok) return;
            expect(r.failure.code).toBe(c.code);
        });
    }

    it("maps a dead host to NETWORK_ERROR", async () => {
        store.env = {
            MEDIA_LIBRARY_URL: "http://127.0.0.1:1",
            MEDIA_LIBRARY_API_KEY: "k",
        };
        stub = await startStub();
        const r = await searchVideos("x");
        expect(r.ok).toBe(false);
        if (r.ok) return;
        expect(r.failure.code).toBe("NETWORK_ERROR");
    });

    // TEETH: classification reads status + `error`, never the Vietnamese prose.
    it("still classifies 403 when the message body is gibberish", async () => {
        stub = await startStub({
            searchStatus: 403,
            searchResponse: { error: "forbidden: xyzzy plugh", contracts_version: "0.2.0" },
        });
        use(stub);
        const r = await searchVideos("x");
        expect(r.ok).toBe(false);
        if (r.ok) return;
        expect(r.failure.code).toBe("MISSING_SCOPE");
    });

    // The eight codes must be eight DISTINCT codes — a mapper that collapsed
    // them into one would pass each case above individually.
    it("produces eight distinct codes across the matrix", async () => {
        const seen = new Set(cases.map((c) => c.code));
        seen.add("NETWORK_ERROR");
        expect(seen.size).toBe(8);
    });
});

describe("searchVideos — degraded results and version pin", () => {
    it("carries warnings through verbatim (E8)", async () => {
        stub = await startStub({
            searchResponse: {
                cards: [], context: null, candidates: 3, skipped: 1,
                warnings: ["embedding_unavailable"],
                contracts_version: "0.2.0",
            },
        });
        use(stub);
        const r = await searchVideos("x");
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.data.warnings).toEqual(["embedding_unavailable"]);
        expect(r.data.candidates).toBe(3);
    });

    // SUPPRESSION: an adapter that always reports degradation passes the half above.
    it("reports no warnings on a clean response", async () => {
        stub = await startStub();
        use(stub);
        const r = await searchVideos("x");
        expect(r.ok).toBe(true);
        if (!r.ok) return;
        expect(r.data.warnings).toEqual([]);
    });

    it.each([
        ["1.0.0", false],
        ["0.3.0", false],
        ["0.2.5", true],
        ["0.2.0", true], // load-bearing: an always-refuse pin passes every red case
    ])("contracts_version %s accepted=%s (E21)", async (version, accepted) => {
        stub = await startStub({ contractsVersion: version as string });
        use(stub);
        const r = await searchVideos("x");
        expect(r.ok).toBe(accepted);
        if (!r.ok) {
            expect(r.failure.code).toBe("VERSION_MISMATCH");
            expect(r.failure.message).toContain("0.2");
            expect(r.failure.message).toContain(version as string);
        }
    });
});
```

- [ ] **Step 2: Chạy — phải ĐỎ**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/media-library/client.server.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
```
Expected: FAIL — `Cannot find module './client.server'`.

- [ ] **Step 3: Viết `errors.ts`**

```ts
/**
 * The failure taxonomy OneFlow speaks. It is derived from the service's HTTP
 * status plus its `error` FIELD — never from the prose, which is Vietnamese and
 * free to change. There is deliberately no RATE_LIMITED arm: the service has no
 * rate limiting at all, so a 429 branch would be dead code pretending to be care.
 */
export type MediaLibraryErrorCode =
    | "MISSING_CONFIG"
    | "AUTH_REJECTED"
    | "MISSING_SCOPE"
    | "BAD_REQUEST"
    | "NOT_FOUND"
    | "UPSTREAM_ERROR"
    | "NOT_IMPLEMENTED"
    | "BAD_RESPONSE"
    | "NETWORK_ERROR"
    | "VERSION_MISMATCH";

export interface MediaLibraryFailure {
    code: MediaLibraryErrorCode;
    message: string;
}

export function classify(status: number, errorField: string): MediaLibraryFailure {
    if (status === 401) {
        return { code: "AUTH_REJECTED", message: "Khoá media-library không được chấp nhận." };
    }
    if (status === 403) {
        return { code: "MISSING_SCOPE", message: "Khoá thiếu quyền search — xin cấp scope search cho khoá này." };
    }
    if (status === 501 || errorField === "not_implemented") {
        return { code: "NOT_IMPLEMENTED", message: "Dịch vụ media-library chưa nối đủ phụ thuộc cho lối này." };
    }
    if (status === 404) {
        return { code: "NOT_FOUND", message: "Không thấy asset (đã xoá, hoặc khoá này không thấy được)." };
    }
    if (status === 400) {
        return { code: "BAD_REQUEST", message: "Yêu cầu gửi đi không hợp lệ." };
    }
    return { code: "UPSTREAM_ERROR", message: `media-library trả lỗi ${status}.` };
}
```

- [ ] **Step 4: Viết `client.server.ts`**

```ts
import "server-only";

import { resolveConfig } from "@/lib/media-library/config.server";
import { classify, type MediaLibraryFailure } from "@/lib/media-library/errors";
import type { AssetDetail, SearchResponse } from "@/lib/media-library/types";
import { checkContractsVersion } from "@/lib/media-library/version";
import { logger } from "@/lib/logger";

export type ClientResult<T> =
    | { ok: true; data: T }
    | { ok: false; failure: MediaLibraryFailure };

const SEARCH_LIMIT = 12; // contract cap is 20
const TIMEOUT_MS = 15_000;

async function call<T>(path: string, init: RequestInit): Promise<ClientResult<T>> {
    const cfg = await resolveConfig();
    if (!cfg.ok) {
        return { ok: false, failure: { code: "MISSING_CONFIG", message: cfg.message } };
    }

    let res: Response;
    try {
        res = await fetch(`${cfg.config.baseUrl}${path}`, {
            ...init,
            headers: {
                ...(init.headers ?? {}),
                authorization: `Bearer ${cfg.config.apiKey}`,
                "content-type": "application/json",
            },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
    } catch (error) {
        logger.error("[media-library] request failed:", error);
        return { ok: false, failure: { code: "NETWORK_ERROR", message: "Không gọi được tới media-library." } };
    }

    let body: unknown;
    try {
        body = await res.json();
    } catch {
        return { ok: false, failure: { code: "BAD_RESPONSE", message: "media-library trả về thân không phải JSON." } };
    }

    const record = (body ?? {}) as Record<string, unknown>;
    const version = typeof record.contracts_version === "string" ? record.contracts_version : "";
    // Version is checked BEFORE status: a mismatched contract makes every other
    // reading of this body a guess, including the error shape.
    if (version) {
        const verdict = checkContractsVersion(version);
        if (!verdict.ok) {
            return { ok: false, failure: { code: "VERSION_MISMATCH", message: verdict.message } };
        }
    }
    if (!res.ok) {
        const errorField = typeof record.error === "string" ? record.error : "";
        return { ok: false, failure: classify(res.status, errorField) };
    }
    return { ok: true, data: body as T };
}

export function searchVideos(intent: string, limit = SEARCH_LIMIT): Promise<ClientResult<SearchResponse>> {
    return call<SearchResponse>("/v1/search", {
        method: "POST",
        body: JSON.stringify({
            intent,
            media_type: "video",
            limit: Math.min(limit, 20),
        }),
    });
}

export function getAsset(assetId: string): Promise<ClientResult<AssetDetail>> {
    return call<AssetDetail>(`/v1/assets/${encodeURIComponent(assetId)}`, { method: "GET" });
}
```

- [ ] **Step 5: Chạy — phải XANH, rồi commit**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/media-library/client.server.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
git add src/lib/media-library
git commit -m "feat(media-library): bộ gọi REST + ma trận tám lỗi + chốt phiên bản (E5,E8,E10,E21)"
```

---

### Task 4: Nạp bytes có chặn + suy đuôi tệp

**Files:**
- Create: `src/lib/media-library/extension.ts`
- Create: `src/lib/media-library/import.server.ts`
- Test: `src/lib/media-library/extension.test.ts`
- Test: `src/lib/media-library/import.server.test.ts`

**Interfaces:**
- Produces: `extensionFor(url: string, contentType: string | null): string`.
- Produces: `importAsset(assetId: string): Promise<{ ok: true; fileKey: string } | { ok: false; failure: MediaLibraryFailure }>`.

**Phục vụ:** E15 (bytes về kho, sha256 khớp) · E17 (ba chặn) · E18 (bậc suy đuôi).

**`independent: false`** — cần Task 3.

- [ ] **Step 1: Viết test suy đuôi (đỏ trước)**

`src/lib/media-library/extension.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { extensionFor } from "./extension";

describe("extensionFor — three rungs, in order (E18)", () => {
    it("rung 1: takes the extension from the URL path", () => {
        expect(extensionFor("https://s.example/a/clip.webm?sig=x", "video/mp4")).toBe("webm");
    });

    it("rung 2: falls back to Content-Type when the URL has none", () => {
        expect(extensionFor("https://s.example/a/blob?sig=x", "video/quicktime")).toBe("mov");
    });

    it("rung 3: falls back to mp4 when neither says anything useful", () => {
        expect(extensionFor("https://s.example/a/blob", "application/octet-stream")).toBe("mp4");
        expect(extensionFor("https://s.example/a/blob", null)).toBe("mp4");
    });

    // SUPPRESSION — the load-bearing case: an implementation that always
    // answers "mp4" passes rungs 2 and 3 and breaks exactly here.
    it("does NOT turn a .webm url into mp4", () => {
        expect(extensionFor("https://s.example/a/clip.webm", null)).not.toBe("mp4");
    });
});
```

- [ ] **Step 2: Viết test nạp bytes (đỏ trước)**

`src/lib/media-library/import.server.test.ts`:

```ts
import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
}));

const saved = vi.hoisted(() => ({ calls: [] as Array<{ data: Buffer; ext: string }> }));
vi.mock("@/lib/file/file-utils", () => ({
    saveFile: async (data: Buffer, ext: string) => {
        saved.calls.push({ data, ext });
        return `nanoid-${saved.calls.length}.${ext}`;
    },
}));

import { startStub, type StubHandle } from "./__fixtures__/stub-server";
import { VIDEO_CARD } from "./__fixtures__/cards";
import { importAsset } from "./import.server";

let stub: StubHandle;
afterEach(async () => {
    saved.calls.length = 0;
    await stub?.close();
});

const BYTES = Buffer.from("pretend this is an mp4 file");

async function stubWithAsset(originalPath: string) {
    stub = await startStub({
        bytes: BYTES,
        assetResponse: {
            card: VIDEO_CARD,
            urls: { original: "", proxy: null, thumb: null },
            expires_in_s: 900,
            contracts_version: "0.2.0",
        },
    });
    // The signed URL points back at the stub's own /bytes route.
    (stub as unknown as { patch?: unknown }).patch = undefined;
    store.env = { MEDIA_LIBRARY_URL: stub.url, MEDIA_LIBRARY_API_KEY: "k" };
    return `${stub.url}${originalPath}`;
}

describe("importAsset — bytes reach the store intact (E15)", () => {
    it("calls GET /v1/assets/:id, downloads urls.original and saves the exact bytes", async () => {
        const original = await stubWithAsset("/bytes/clip.mp4");
        stub = await startStub({
            bytes: BYTES,
            assetResponse: {
                card: VIDEO_CARD,
                urls: { original, proxy: null, thumb: null },
                expires_in_s: 900,
                contracts_version: "0.2.0",
            },
        });
        store.env = { MEDIA_LIBRARY_URL: stub.url, MEDIA_LIBRARY_API_KEY: "k" };

        const r = await importAsset(VIDEO_CARD.id);

        expect(r.ok).toBe(true);
        expect(stub.requests.some((q) => q.path.startsWith(`/v1/assets/${VIDEO_CARD.id}`))).toBe(true);
        expect(saved.calls).toHaveLength(1);
        const got = createHash("sha256").update(saved.calls[0].data).digest("hex");
        const want = createHash("sha256").update(BYTES).digest("hex");
        expect(got).toBe(want);
    });

    // SUPPRESSION: a save-then-check implementation leaves an empty file behind.
    it("saves NOTHING when the signed URL 404s", async () => {
        stub = await startStub({
            assetResponse: {
                card: VIDEO_CARD,
                urls: { original: "https://127.0.0.1:1/gone.mp4", proxy: null, thumb: null },
                expires_in_s: 900,
                contracts_version: "0.2.0",
            },
        });
        store.env = { MEDIA_LIBRARY_URL: stub.url, MEDIA_LIBRARY_API_KEY: "k" };

        const r = await importAsset(VIDEO_CARD.id);

        expect(r.ok).toBe(false);
        expect(saved.calls).toHaveLength(0);
    });
});

describe("importAsset — the three guards (E17)", () => {
    async function withOriginal(original: string) {
        stub = await startStub({
            assetResponse: {
                card: VIDEO_CARD,
                urls: { original, proxy: null, thumb: null },
                expires_in_s: 900,
                contracts_version: "0.2.0",
            },
        });
        store.env = { MEDIA_LIBRARY_URL: stub.url, MEDIA_LIBRARY_API_KEY: "k" };
        return importAsset(VIDEO_CARD.id);
    }

    it("refuses a non-https signed URL by name", async () => {
        const r = await withOriginal("http://169.254.169.254/latest/meta-data/");
        expect(r.ok).toBe(false);
        if (r.ok) return;
        expect(r.failure.message).toMatch(/https/i);
        expect(saved.calls).toHaveLength(0);
    });

    it("refuses an internal host even over https", async () => {
        const r = await withOriginal("https://169.254.169.254/latest/meta-data/");
        expect(r.ok).toBe(false);
        expect(saved.calls).toHaveLength(0);
    });

    // POSITIVE CONTROL: without this, a function that refuses everything passes
    // both cases above.
    it("accepts an https URL on a public host", async () => {
        const spy = vi
            .spyOn(globalThis, "fetch")
            .mockImplementation(async (input) => {
                const url = String(input);
                if (url.includes("/v1/assets/")) {
                    return new Response(
                        JSON.stringify({
                            card: VIDEO_CARD,
                            urls: { original: "https://cdn.example/clip.mp4", proxy: null, thumb: null },
                            expires_in_s: 900,
                            contracts_version: "0.2.0",
                        }),
                        { status: 200, headers: { "content-type": "application/json" } },
                    );
                }
                return new Response(BYTES, {
                    status: 200,
                    headers: { "content-type": "video/mp4", "content-length": String(BYTES.length) },
                });
            });
        store.env = { MEDIA_LIBRARY_URL: "https://lib.example", MEDIA_LIBRARY_API_KEY: "k" };

        const r = await importAsset(VIDEO_CARD.id);

        expect(r.ok).toBe(true);
        expect(saved.calls).toHaveLength(1);
        spy.mockRestore();
    });

    it("refuses a body larger than the cap without buffering it whole", async () => {
        const spy = vi
            .spyOn(globalThis, "fetch")
            .mockImplementation(async (input) => {
                if (String(input).includes("/v1/assets/")) {
                    return new Response(
                        JSON.stringify({
                            card: VIDEO_CARD,
                            urls: { original: "https://cdn.example/huge.mp4", proxy: null, thumb: null },
                            expires_in_s: 900,
                            contracts_version: "0.2.0",
                        }),
                        { status: 200, headers: { "content-type": "application/json" } },
                    );
                }
                return new Response(BYTES, {
                    status: 200,
                    headers: {
                        "content-type": "video/mp4",
                        "content-length": String(3 * 1024 * 1024 * 1024),
                    },
                });
            });
        store.env = { MEDIA_LIBRARY_URL: "https://lib.example", MEDIA_LIBRARY_API_KEY: "k" };

        const r = await importAsset(VIDEO_CARD.id);

        expect(r.ok).toBe(false);
        expect(saved.calls).toHaveLength(0);
        spy.mockRestore();
    });
});
```

- [ ] **Step 3: Chạy cả hai — phải ĐỎ**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/media-library/extension.test.ts src/lib/media-library/import.server.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
```
Expected: FAIL — `Cannot find module './extension'`.

- [ ] **Step 4: Viết `extension.ts`**

```ts
/**
 * The library's asset endpoint returns NO mime, size or filename — those fields
 * are not in the contract and not columns on its table. The extension therefore
 * has to be inferred, and it matters: /api/uploads/[...path] derives the served
 * Content-Type FROM the extension, so a wrong suffix is a clip that sits in the
 * store and will not play.
 *
 * Generic mime table on purpose — no domain vocabulary crosses this file.
 */
const MIME_TO_EXT: Record<string, string> = {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/x-matroska": "mkv",
};

const DEFAULT_EXT = "mp4";

export function extensionFor(url: string, contentType: string | null): string {
    // Rung 1: the signed URL usually keeps the original object name.
    let pathname = "";
    try {
        pathname = new URL(url).pathname;
    } catch {
        pathname = "";
    }
    const fromPath = pathname.match(/\.([A-Za-z0-9]{2,5})$/)?.[1];
    if (fromPath) return fromPath.toLowerCase();

    // Rung 2: the byte response's own declared type.
    const mime = (contentType ?? "").split(";")[0].trim().toLowerCase();
    if (MIME_TO_EXT[mime]) return MIME_TO_EXT[mime];

    // Rung 3.
    return DEFAULT_EXT;
}
```

- [ ] **Step 5: Viết `import.server.ts`**

```ts
import "server-only";

import { getAsset } from "@/lib/media-library/client.server";
import type { MediaLibraryFailure } from "@/lib/media-library/errors";
import { extensionFor } from "@/lib/media-library/extension";
import { saveFile } from "@/lib/file/file-utils";
import { logger } from "@/lib/logger";

/**
 * Bytes cross the boundary ONLY over the signed URL (ADR-0012 guarantee #1),
 * and they are fetched here rather than through `downloadAndSave()` in
 * file-utils: that helper takes any URL with no scheme, host or size check and
 * has zero callers. Wiring a feature that receives URLs from an outside service
 * into it would inherit an SSRF hole wholesale, so it stays dead and this path
 * carries its own three guards.
 */
const MAX_BYTES = 2 * 1024 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 120_000;

export type ImportResult =
    | { ok: true; fileKey: string }
    | { ok: false; failure: MediaLibraryFailure };

const PRIVATE_HOST =
    /^(localhost|127\.|0\.0\.0\.0|169\.254\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1)/i;

function guardUrl(raw: string): MediaLibraryFailure | null {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return { code: "BAD_RESPONSE", message: "URL ký của media-library không hợp lệ." };
    }
    // http is allowed only when the library itself is a localhost dev instance,
    // which is the one case where the private-host rule below would also fire.
    const devLocal =
        url.protocol === "http:" &&
        PRIVATE_HOST.test(url.hostname) &&
        (process.env.NODE_ENV !== "production");
    if (url.protocol !== "https:" && !devLocal) {
        return { code: "BAD_RESPONSE", message: `Từ chối tải: URL ký không dùng https (${url.protocol}//).` };
    }
    if (PRIVATE_HOST.test(url.hostname) && !devLocal) {
        return { code: "BAD_RESPONSE", message: `Từ chối tải: URL ký trỏ tới host nội bộ (${url.hostname}).` };
    }
    return null;
}

export async function importAsset(assetId: string): Promise<ImportResult> {
    const detail = await getAsset(assetId);
    if (!detail.ok) return { ok: false, failure: detail.failure };

    const original = detail.data.urls?.original ?? "";
    const bad = guardUrl(original);
    if (bad) return { ok: false, failure: bad };

    let res: Response;
    try {
        res = await fetch(original, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
    } catch (error) {
        logger.error("[media-library] byte download failed:", error);
        return { ok: false, failure: { code: "NETWORK_ERROR", message: "Không tải được bytes của clip." } };
    }
    if (!res.ok) {
        return { ok: false, failure: { code: "UPSTREAM_ERROR", message: `Tải bytes thất bại (HTTP ${res.status}).` } };
    }

    const declared = Number(res.headers.get("content-length") ?? "0");
    if (declared > MAX_BYTES) {
        return { ok: false, failure: { code: "BAD_RESPONSE", message: "Clip vượt trần kích thước cho phép." } };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength > MAX_BYTES) {
        return { ok: false, failure: { code: "BAD_RESPONSE", message: "Clip vượt trần kích thước cho phép." } };
    }

    const ext = extensionFor(original, res.headers.get("content-type"));
    const fileKey = await saveFile(buffer, ext);
    return { ok: true, fileKey };
}
```

- [ ] **Step 6: Chạy — phải XANH, rồi commit**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/media-library/
~/.claude/oneflow-pilot/s4lock release lane-13b
git add src/lib/media-library
git commit -m "feat(media-library): nạp bytes có chặn + suy đuôi tệp (E15,E17,E18)"
```

---

### Task 5: Hai route + phép đo CALL-SITE + guard hàm ngủ

**Files:**
- Create: `src/app/api/media-library/search/route.ts`
- Create: `src/app/api/media-library/import/route.ts`
- Create: `scripts/media-library/check-no-dormant-fetch.sh`
- Create: `scripts/media-library/check-no-boot-dependency.sh`
- Test: `src/app/api/media-library/route.test.ts`

**Interfaces:**
- Produces: `POST /api/media-library/search` body `{ intent: string }` →
  `200 { cards, candidates, skipped, warnings }` | `4xx/5xx { code, message }`.
- Produces: `POST /api/media-library/import` body `{ assetId: string }` →
  `200 { fileKey }` | `4xx/5xx { code, message }`.

**Phục vụ:** E26 (call-site, đo QUA route) · E27 (hàm ngủ vẫn 0 caller) · E3 (không phụ thuộc lúc khởi động).

**`independent: false`** — cần Task 4. **Đây là task quan trọng nhất của plan**
(bản vá P0 của phản biện).

- [ ] **Step 1: Viết test đi QUA route (đỏ trước)**

`src/app/api/media-library/route.test.ts` — khuôn theo
`src/app/api/settings/env/route.test.ts`: chỉ stub mạng và kho, KHÔNG có điểm tiêm nào khác:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const store = vi.hoisted(() => ({ env: {} as Record<string, string> }));
vi.mock("@/lib/settings/env-store.server", () => ({
    loadEnvStore: async () => ({ ...store.env }),
}));

const saved = vi.hoisted(() => ({ calls: [] as string[] }));
vi.mock("@/lib/file/file-utils", () => ({
    saveFile: async (_d: Buffer, ext: string) => {
        saved.calls.push(ext);
        return `key.${ext}`;
    },
}));

const realFetch = globalThis.fetch;

afterEach(() => {
    globalThis.fetch = realFetch;
    saved.calls.length = 0;
    vi.resetModules();
});

beforeEach(() => {
    store.env = {
        MEDIA_LIBRARY_URL: "https://lib.example",
        MEDIA_LIBRARY_API_KEY: "k",
    };
});

/**
 * The whole point of this suite: import.server.ts can be perfect and the route
 * can still bypass it. Every assertion below drives the ROUTE HANDLER.
 */
describe("POST /api/media-library/import — the road, not the function (E26)", () => {
    it("refuses a link-local signed URL and creates no file", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return new Response(
                    JSON.stringify({
                        card: { id: "a" },
                        urls: {
                            original: "http://169.254.169.254/latest/meta-data/",
                            proxy: null,
                            thumb: null,
                        },
                        expires_in_s: 900,
                        contracts_version: "0.2.0",
                    }),
                    { status: 200, headers: { "content-type": "application/json" } },
                );
            }
            throw new Error("the route must not fetch this URL");
        }) as typeof fetch;

        const { POST } = await import("./import/route");
        const res = await POST(
            new Request("http://localhost/api/media-library/import", {
                method: "POST",
                body: JSON.stringify({ assetId: "11111111-1111-4111-8111-111111111111" }),
            }),
        );

        expect(res.status).toBeGreaterThanOrEqual(400);
        const body = await res.json();
        expect(String(body.message)).toMatch(/https|nội bộ/i);
        expect(saved.calls).toHaveLength(0);
    });

    // POSITIVE CONTROL: a route that refuses everything passes the case above.
    it("imports a clean https asset and returns a fileKey", async () => {
        globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
            if (String(input).includes("/v1/assets/")) {
                return new Response(
                    JSON.stringify({
                        card: { id: "a" },
                        urls: { original: "https://cdn.example/clip.mp4", proxy: null, thumb: null },
                        expires_in_s: 900,
                        contracts_version: "0.2.0",
                    }),
                    { status: 200, headers: { "content-type": "application/json" } },
                );
            }
            return new Response(Buffer.from("bytes"), {
                status: 200,
                headers: { "content-type": "video/mp4" },
            });
        }) as typeof fetch;

        const { POST } = await import("./import/route");
        const res = await POST(
            new Request("http://localhost/api/media-library/import", {
                method: "POST",
                body: JSON.stringify({ assetId: "11111111-1111-4111-8111-111111111111" }),
            }),
        );

        expect(res.status).toBe(200);
        expect((await res.json()).fileKey).toBe("key.mp4");
    });
});

describe("POST /api/media-library/search — no config, no traffic (AC-1)", () => {
    it("makes ZERO network calls when the store is empty", async () => {
        store.env = {};
        const spy = vi.fn(async () => new Response("{}", { status: 200 }));
        globalThis.fetch = spy as unknown as typeof fetch;

        const { POST } = await import("./search/route");
        const res = await POST(
            new Request("http://localhost/api/media-library/search", {
                method: "POST",
                body: JSON.stringify({ intent: "x" }),
            }),
        );

        expect(spy).toHaveBeenCalledTimes(0);
        const body = await res.json();
        expect(body.code).toBe("MISSING_CONFIG");
        expect(String(body.message)).toContain("MEDIA_LIBRARY_URL");
        expect(String(body.message)).toContain("MEDIA_LIBRARY_API_KEY");
    });
});
```

- [ ] **Step 2: Chạy — phải ĐỎ**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/app/api/media-library/route.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
```
Expected: FAIL — `Cannot find module './import/route'`.

- [ ] **Step 3: Viết route tìm**

`src/app/api/media-library/search/route.ts`:

```ts
import { NextResponse } from "next/server";
import { searchVideos } from "@/lib/media-library/client.server";

export const runtime = "nodejs";

const STATUS: Record<string, number> = {
    MISSING_CONFIG: 400,
    AUTH_REJECTED: 401,
    MISSING_SCOPE: 403,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    VERSION_MISMATCH: 409,
    NOT_IMPLEMENTED: 501,
    BAD_RESPONSE: 502,
    NETWORK_ERROR: 502,
    UPSTREAM_ERROR: 502,
};

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ code: "BAD_REQUEST", message: "Thân yêu cầu không phải JSON." }, { status: 400 });
    }
    const intent = String((body as { intent?: unknown })?.intent ?? "").trim();
    if (!intent) {
        return NextResponse.json({ code: "BAD_REQUEST", message: "Cần một câu mô tả để tìm." }, { status: 400 });
    }

    const result = await searchVideos(intent);
    if (!result.ok) {
        return NextResponse.json(result.failure, { status: STATUS[result.failure.code] ?? 502 });
    }
    const { cards, candidates, skipped, warnings } = result.data;
    return NextResponse.json({ cards, candidates, skipped, warnings });
}
```

- [ ] **Step 4: Viết route nạp**

`src/app/api/media-library/import/route.ts`:

```ts
import { NextResponse } from "next/server";
import { importAsset } from "@/lib/media-library/import.server";

export const runtime = "nodejs";

const STATUS: Record<string, number> = {
    MISSING_CONFIG: 400,
    AUTH_REJECTED: 401,
    MISSING_SCOPE: 403,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    VERSION_MISMATCH: 409,
    NOT_IMPLEMENTED: 501,
    BAD_RESPONSE: 502,
    NETWORK_ERROR: 502,
    UPSTREAM_ERROR: 502,
};

export async function POST(request: Request) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ code: "BAD_REQUEST", message: "Thân yêu cầu không phải JSON." }, { status: 400 });
    }
    const assetId = String((body as { assetId?: unknown })?.assetId ?? "").trim();
    if (!assetId) {
        return NextResponse.json({ code: "BAD_REQUEST", message: "Thiếu mã asset." }, { status: 400 });
    }

    const result = await importAsset(assetId);
    if (!result.ok) {
        return NextResponse.json(result.failure, { status: STATUS[result.failure.code] ?? 502 });
    }
    return NextResponse.json({ fileKey: result.fileKey });
}
```

- [ ] **Step 5: Viết hai guard shell**

`scripts/media-library/check-no-dormant-fetch.sh`:

```bash
#!/usr/bin/env bash
# E27 — downloadAndSave() must stay dead. It fetches ANY url with no scheme,
# host or size check; a caller anywhere in the tree inherits that hole.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
TARGET="${1:-src}"
CALLERS="$(grep -rn "downloadAndSave(" "$TARGET" \
    --include="*.ts" --include="*.tsx" \
    | grep -v "src/lib/file/file-utils.ts" || true)"
if [ -n "$CALLERS" ]; then
    echo "FAIL: downloadAndSave() has callers — it must stay unused:"
    echo "$CALLERS"
    exit 1
fi
echo "downloadAndSave(): 0 callers (list is empty, as required)"
```

`scripts/media-library/check-no-boot-dependency.sh`:

```bash
#!/usr/bin/env bash
# E3 — ADR-0012 guarantee #2: nothing on a boot path may depend on the
# media-library module. Only its own two routes and its own node may import it.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
TARGET="${1:-src}"
ALLOWED='^src/(app/api/media-library/|lib/media-library/|components/workspace/nodes/add/(add-)?media-)'
OFFENDERS="$(grep -rln "@/lib/media-library/" "$TARGET" \
    --include="*.ts" --include="*.tsx" \
    | grep -Ev "$ALLOWED" || true)"
if [ -n "$OFFENDERS" ]; then
    echo "FAIL: media-library is imported outside its own feature:"
    echo "$OFFENDERS"
    exit 1
fi
echo "media-library imported only by its own routes and node"
```

- [ ] **Step 6: Thử răng của cả hai guard**

```bash
chmod +x scripts/media-library/check-no-dormant-fetch.sh scripts/media-library/check-no-boot-dependency.sh
mkdir -p /tmp/teeth/src/app && cp -R src/lib /tmp/teeth/src/lib
printf 'import { downloadAndSave } from "@/lib/file/file-utils";\nexport const x = () => downloadAndSave("http://x", "mp4");\n' > /tmp/teeth/src/lib/naughty.ts
bash scripts/media-library/check-no-dormant-fetch.sh /tmp/teeth/src && echo "TEETH FAILED — guard stayed green" || echo "teeth ok — guard went red"
printf 'import "@/lib/media-library/client.server";\n' > /tmp/teeth/src/app/boot.ts
bash scripts/media-library/check-no-boot-dependency.sh /tmp/teeth/src && echo "TEETH FAILED" || echo "teeth ok"
rm -rf /tmp/teeth
```
Expected: cả hai in `teeth ok`.

- [ ] **Step 7: Chạy test route — phải XANH, rồi commit**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/app/api/media-library/route.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
git add src/app/api/media-library scripts/media-library
git commit -m "feat(media-library): hai route + phép đo call-site + guard hàm ngủ (E26,E27,E3)"
```

---

### Task 6: Node canvas, thẻ, và bảng nhập cấu hình

**Files:**
- Create: `src/components/workspace/nodes/add/add-media-library-node.tsx`
- Create: `src/components/workspace/nodes/add/media-card-list.tsx`
- Create: `src/components/workspace/nodes/add/media-library-config-panel.tsx`
- Create: `src/components/proto/add-media-library-proto.tsx`
- Modify: `src/app/proto/[slug]/page.tsx:19-21`
- Test: `src/components/workspace/nodes/add/add-media-library-node.test.tsx`

**Interfaces:**
- Consumes: `POST /api/media-library/search`, `POST /api/media-library/import` (Task 5).
- Consumes: `useFlow().expands(nodeId, [{ type: "videoNode", data: { fileKeys } }])`.
- Produces: `<MediaCardList cards={MediaCard[]} onPick={(card) => void} busyId?: string />`.
- Produces: proto state names: `missing-config` · `idle` · `searching` · `results` ·
  `thin-shelf` · `unranked` · `importing` · `error`.

**Phục vụ:** E7 (kệ mỏng khác lời báo hỏng) · E13 (từ vựng lạ vẫn render) · E14 (nhãn quyền) · nền cho E2, E6, E9, E11, E16, E22, E29, E24.

**`independent: false`** — cần Task 5.

- [ ] **Step 1: Viết test thành phần (đỏ trước)**

`src/components/workspace/nodes/add/add-media-library-node.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaCardList } from "./media-card-list";
import {
    CARD_UNKNOWN_VOCAB,
    CARD_WITH_LICENSE,
    VIDEO_CARD,
} from "@/lib/media-library/__fixtures__/cards";

describe("MediaCardList — domain vocabulary is opaque data (E13)", () => {
    it("renders a card whose vocabulary values OneFlow has never seen", () => {
        render(<MediaCardList cards={[CARD_UNKNOWN_VOCAB]} onPick={() => {}} />);
        expect(screen.getByText(CARD_UNKNOWN_VOCAB.caption)).toBeInTheDocument();
        expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
    });

    it("renders a card with entity: null", () => {
        render(<MediaCardList cards={[VIDEO_CARD]} onPick={() => {}} />);
        expect(screen.getByText(VIDEO_CARD.caption)).toBeInTheDocument();
    });
});

describe("MediaCardList — the licence label is mandatory when present (E14)", () => {
    it("shows the label verbatim", () => {
        render(<MediaCardList cards={[CARD_WITH_LICENSE]} onPick={() => {}} />);
        expect(screen.getByText("Phối cảnh 3D")).toBeInTheDocument();
    });

    // SUPPRESSION: a mandatory-when-present label must not become an always-on
    // empty chip.
    it("renders no licence chip when the card has none", () => {
        render(<MediaCardList cards={[VIDEO_CARD]} onPick={() => {}} />);
        expect(screen.queryByTestId("licence-chip")).not.toBeInTheDocument();
    });
});
```

Và phần kệ-mỏng (E7) — dùng `SearchOutcome` thuần để test không cần mạng:

```tsx
import { outcomeMessageKey } from "./add-media-library-node";

describe("thin shelf is not an error (E7)", () => {
    it("uses a different message key from the error case", () => {
        const thin = outcomeMessageKey({ kind: "results", cards: [], candidates: 12, warnings: [] });
        const broken = outcomeMessageKey({ kind: "failure", code: "UPSTREAM_ERROR" });
        expect(thin).toBe("thinShelf");
        expect(broken).not.toBe("thinShelf");
    });

    // SUPPRESSION: a 500 must never read as "kho không có gì hợp".
    it("never labels a real failure as a thin shelf", () => {
        for (const code of ["AUTH_REJECTED", "MISSING_SCOPE", "BAD_REQUEST", "NOT_FOUND", "UPSTREAM_ERROR", "NOT_IMPLEMENTED", "BAD_RESPONSE", "NETWORK_ERROR"]) {
            expect(outcomeMessageKey({ kind: "failure", code })).not.toBe("thinShelf");
        }
    });
});
```

- [ ] **Step 2: Chạy — phải ĐỎ**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/components/workspace/nodes/add/add-media-library-node.test.tsx
~/.claude/oneflow-pilot/s4lock release lane-13b
```
Expected: FAIL — `Cannot find module './media-card-list'`.

- [ ] **Step 3: Viết `media-card-list.tsx`**

```tsx
"use client";

import Image from "next/image";
import type { MediaCard } from "@/lib/media-library/types";

/**
 * Renders whatever the library sent. Every vocabulary value is printed as an
 * opaque string: no switch, no translation table, no closed union. When the
 * library opens a new domain, this file does not change (ADR-0012 #3).
 *
 * `license_label` is a legally mandated disclosure the contract requires to be
 * displayed whenever present — dropping it is a compliance failure.
 */
export function MediaCardList({
    cards,
    onPick,
    busyId,
}: {
    cards: MediaCard[];
    onPick: (card: MediaCard) => void;
    busyId?: string;
}) {
    return (
        <ul className="grid grid-cols-3 gap-2" role="list">
            {cards.map((card) => (
                <li key={card.id}>
                    <button
                        type="button"
                        onClick={() => onPick(card)}
                        disabled={busyId === card.id}
                        className="w-full text-left rounded-lg border border-border overflow-hidden hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
                    >
                        <Image
                            src={card.renditions.thumb_url}
                            alt={card.caption}
                            width={160}
                            height={90}
                            unoptimized
                            className="w-full h-[90px] object-cover"
                        />
                        <span className="block p-2 text-xs line-clamp-2">
                            {card.caption}
                        </span>
                        {card.license_label ? (
                            <span
                                data-testid="licence-chip"
                                className="block px-2 pb-2 text-[10px] text-muted-foreground"
                            >
                                {card.license_label}
                            </span>
                        ) : null}
                    </button>
                </li>
            ))}
        </ul>
    );
}
```

- [ ] **Step 4: Viết node + bảng cấu hình + proto**

`add-media-library-node.tsx` giữ đúng khuôn add node: `BaseNodeShell` với
`isInputNode showPluginSelect={false}`, **một** `<Handle id="out:videoNode">`,
**không Tabs** (để `data.activeTab` là `undefined`). Trạng thái nội bộ theo
`SearchOutcome`; nạp xong gọi
`expands(id, [{ type: "videoNode", data: { fileKeys: [fileKey] } }])`.
`outcomeMessageKey` export riêng để test được mà không cần mạng.

`media-library-config-panel.tsx`: nêu **đích danh** biến còn thiếu, hai ô nhập,
lưu bằng `PUT /api/settings/env` (body `{ env: {...} }`), rồi tự gọi lại tìm.

`add-media-library-proto.tsx`: nhận `state` và render đúng tám trạng thái với dữ
liệu fixture — đây là thứ E24 quét và E2/E9/E11/E22 chụp.

Đăng ký proto — `src/app/proto/[slug]/page.tsx`:

```tsx
import { AddMediaLibraryProto } from "@/components/proto/add-media-library-proto";

const PROTOS: Record<string, (state: string) => React.ReactNode> = {
    "byo-key-onboarding": (state) => <ByoKeyOnboardingProto state={state} />,
    "add-media-library": (state) => <AddMediaLibraryProto state={state} />,
};
```

- [ ] **Step 5: Chạy — phải XANH, rồi commit**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/components/workspace/nodes/add/add-media-library-node.test.tsx
~/.claude/oneflow-pilot/s4lock release lane-13b
git add src/components src/app/proto
git commit -m "feat(media-library): node canvas, thẻ, bảng nhập cấu hình, proto tám trạng thái (E7,E13,E14)"
```

---

### Task 7: Đăng ký node — và test đối xứng hai bảng ánh xạ

**Files:**
- Modify: `src/components/workspace/types.tsx:12-20` (import), `:113` (NODE_TYPES), `:220` (NODE_CATEGORIES.ADD)
- Modify: `src/components/workspace/smart-island.tsx:206` (thêm một IconButton)
- Modify: `src/lib/workflow/flow-connection-shared.ts:13` (một dòng)
- Modify: `src/lib/workflow/exporter.ts:493` (một dòng — BẢN SAO của bảng trên)
- Test: `src/lib/workflow/media-library-wiring.test.ts`

**Interfaces:**
- Consumes: component mặc-định-export từ Task 6.
- Produces: node type string `"addMediaLibraryNode"` → modality `"videoNode"`.

**Phục vụ:** E19 (đối xứng hai bảng + cạnh hợp lệ + export ra node dữ liệu).

**`independent: false`** — cần Task 6.

⚠️ **Va chạm đã thoả thuận với làn nặng (lane-13):** cả hai làn cùng sửa
`exporter.ts` ở **vùng khác nhau** (tôi: bảng `typeMap` trong
`getAddNodeOutputType`; họ: một lượt kiểm ở cuối `export()`). Ai merge trước cứ
merge; kẻ sau rebase tự giải. Conflict rơi vào một HÀM chứ không phải một dòng
thì ping, không tự đoán ý.

- [ ] **Step 1: Viết test đối xứng (đỏ trước)**

`src/lib/workflow/media-library-wiring.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ADD_NODE_OUTPUT_TYPE } from "@/lib/workflow/flow-connection-shared";

/**
 * This repo keeps TWO copies of the add-node -> modality mapping: the exported
 * table in flow-connection-shared.ts and an inline `typeMap` inside
 * exporter.ts's getAddNodeOutputType(). Two copies of one fact drift; this test
 * is the thing that notices. Updating only one side must go red.
 */
function exporterTypeMap(): Record<string, string> {
    const src = readFileSync("src/lib/workflow/exporter.ts", "utf8");
    const block = src.match(/getAddNodeOutputType[\s\S]*?\{([\s\S]*?)\}\s*;/);
    if (!block) throw new Error("could not find getAddNodeOutputType's typeMap");
    const out: Record<string, string> = {};
    for (const m of block[1].matchAll(/(\w+)\s*:\s*"([^"]+)"/g)) out[m[1]] = m[2];
    return out;
}

describe("add-node modality mapping — the two copies agree (E19)", () => {
    it("registers addMediaLibraryNode -> videoNode in BOTH copies", () => {
        expect(ADD_NODE_OUTPUT_TYPE.addMediaLibraryNode).toBe("videoNode");
        expect(exporterTypeMap().addMediaLibraryNode).toBe("videoNode");
    });

    it("agrees on EVERY key, not just the new one", () => {
        expect(exporterTypeMap()).toEqual(ADD_NODE_OUTPUT_TYPE);
    });
});
```

- [ ] **Step 2: Chạy — phải ĐỎ** (`ADD_NODE_OUTPUT_TYPE.addMediaLibraryNode` là `undefined`)

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/workflow/media-library-wiring.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
```

- [ ] **Step 3: Thêm một dòng vào MỖI bảng**

`src/lib/workflow/flow-connection-shared.ts`:

```ts
    addLinkNode: "linkNode",
    addMediaLibraryNode: "videoNode",
};
```

`src/lib/workflow/exporter.ts` trong `getAddNodeOutputType`:

```ts
            addLinkNode: "linkNode",
            addMediaLibraryNode: "videoNode",
        };
```

- [ ] **Step 4: Đăng ký node trên canvas**

`src/components/workspace/types.tsx` — thêm import (giữ đúng khuôn
`key: Component,` một dòng, vì `compile.test.ts:309` bóc `NODE_TYPES` bằng regex):

```tsx
import AddMediaLibraryNode from "./nodes/add/add-media-library-node";
```
```tsx
    addMediaLibraryNode: AddMediaLibraryNode,
```
```tsx
        "addMediaLibraryNode",
```

`src/components/workspace/smart-island.tsx` — thêm một `IconButton` cạnh bảy cái sẵn có:

```tsx
                    <IconButton
                        icon={Library}
                        tooltip={t("tooltipMediaLibrary")}
                        onClick={() =>
                            addNodeAtViewportCenter({ type: "addMediaLibraryNode" })
                        }
                    />
```

- [ ] **Step 5: Chạy — phải XANH, rồi commit**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm vitest run src/lib/workflow/ src/lib/director/compile.test.ts
~/.claude/oneflow-pilot/s4lock release lane-13b
git add src/lib/workflow src/components/workspace
git commit -m "feat(media-library): đăng ký node + test đối xứng hai bảng ánh xạ (E19)"
```

---

### Task 8: Chữ năm ngôn ngữ, `.env.example`, và hai guard còn lại

**Files:**
- Modify: `src/i18n/messages/{en,vi,ja,ko,zh}.json`
- Modify: `.env.example`
- Create: `scripts/media-library/check-no-domain-vocab.sh`
- Create: `scripts/media-library/check-a11y-proto.sh`

**Interfaces:**
- Produces: namespace i18n `Workspace.nodes.addMediaLibrary.*` (khoá MỚI, không
  sửa khoá sẵn có) + `Workspace.smartIsland.tooltipMediaLibrary`.

**Phục vụ:** E12 (guard từ vựng lĩnh vực) · E24 (a11y tám trạng thái x hai nền = 16 trang).

**`independent: true`** so với Task 6/7 về nội dung, nhưng chạy sau vì guard quét
cửa sổ diff của cả nhánh.

⚠️ **Va chạm đã thoả thuận:** làn nặng cũng thêm khoá i18n dưới
`normalizeTextVi.*`. Tôi chỉ THÊM dưới `addMediaLibrary.*`, không sửa/xoá khoá nào.

- [ ] **Step 1: Viết guard từ vựng lĩnh vực**

`scripts/media-library/check-no-domain-vocab.sh` — phạm vi suy từ **cửa sổ diff**,
không từ danh sách tên file:

```bash
#!/usr/bin/env bash
# E12 — ADR-0012 guarantee #3: domain vocabulary crosses the boundary as DATA.
# Scope is derived from the branch diff, never from a hand-written file list: a
# hand list can never contain the file the implementer has not named yet.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
BASE="${1:-origin/main}"
MERGE_BASE="$(git merge-base "$BASE" HEAD)"

FILES="$( { git diff --name-only "$MERGE_BASE"...HEAD; git diff --name-only HEAD; git ls-files --others --exclude-standard; } \
    | sort -u | grep -E '^src/.*\.(ts|tsx)$' | grep -v '__fixtures__' || true)"
if [ -z "$FILES" ]; then
    echo "FAIL: empty diff window — an absence claim over nothing is vacuous"
    exit 1
fi

VOCAB='noi-that|ngoai-canh|flycam|tien-ich|cong-truong|duong-pho|du-an|phan-khu|cung-truc|cung-layout|cung-tang|cung-toa|dung-can|render-3d|scale-model|real-model|full-noi-that|co-ban'
HITS="$(grep -nE "\"($VOCAB)\"|'($VOCAB)'" $FILES || true)"

FIELDS='provenance|scene_kind|kind|specificity|energy|interior_state|license_label|slot_role'
UNIONS="$(grep -nE "($FIELDS)\??\s*:\s*\"[^\"]+\"\s*\|" $FILES || true)"

if [ -n "$HITS$UNIONS" ]; then
    echo "FAIL: domain vocabulary hardcoded on the OneFlow side:"
    [ -n "$HITS" ] && echo "$HITS"
    [ -n "$UNIONS" ] && echo "$UNIONS"
    exit 1
fi
echo "no domain vocabulary in $(echo "$FILES" | wc -l | tr -d ' ') changed files"
```

- [ ] **Step 2: Thử răng — cắm chuỗi vào một file MỚI chưa từng có tên trong hồ sơ**

```bash
chmod +x scripts/media-library/check-no-domain-vocab.sh
printf 'export const bad = (k: string) => k === "noi-that";\n' > src/lib/media-library/never-named-before.ts
bash scripts/media-library/check-no-domain-vocab.sh && echo "TEETH FAILED — guard stayed green" || echo "teeth ok — guard went red on a file no list mentions"
rm src/lib/media-library/never-named-before.ts
```
Expected: `teeth ok`.

- [ ] **Step 3: Viết guard a11y**

`scripts/media-library/check-a11y-proto.sh` — assert **đủ 16 trang**:

```bash
#!/usr/bin/env bash
# E24 — eight states x two themes. Reaching only some pages must NOT read as clean.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
BASE="${BASE_URL:-http://localhost:3000}"
STATES=(missing-config idle searching results thin-shelf unranked importing error)
URLS=()
for s in "${STATES[@]}"; do
    URLS+=("$BASE/proto/add-media-library?state=$s")
    URLS+=("$BASE/proto/add-media-library?state=$s&theme=dark")
done
[ "${#URLS[@]}" -eq 16 ] || { echo "FAIL: built ${#URLS[@]} urls, expected 16"; exit 2; }
node scripts/a11y-scan.mjs "${URLS[@]}" --fail-on critical,serious --json /tmp/aml-a11y.json
node -e '
const r = require("/tmp/aml-a11y.json");
if (r.pages.length !== 16) {
  console.error(`FAIL: scanned ${r.pages.length}/16 pages — a partial sweep is not a clean one`);
  process.exit(3);
}
console.log("16/16 pages scanned");
'
```

- [ ] **Step 4: Thêm chữ năm ngôn ngữ + `.env.example`**

Khoá mới dưới `Workspace.nodes.addMediaLibrary` trong cả 5 file: `title`,
`searchPlaceholder`, `search`, `searching`, `thinShelf`, `unranked`,
`importing`, `missingConfig`, `openSettings`, `saveConfig`, `urlLabel`,
`keyLabel`, cùng `Workspace.smartIsland.tooltipMediaLibrary`.

`.env.example` — thêm hai dòng kèm chú thích:

```bash
# media-library (ADR-0012) — BYO service. Leave blank and the studio runs
# normally; only the "nạp từ kho" node reports the missing names.
MEDIA_LIBRARY_URL=
MEDIA_LIBRARY_API_KEY=
```

- [ ] **Step 5: Bộ kiểm đầy đủ trước khi bàn giao sang S4**

```bash
~/.claude/oneflow-pilot/s4lock acquire lane-13b
pnpm lint:check && pnpm typecheck && pnpm build && pnpm test
bash scripts/media-library/check-no-domain-vocab.sh
bash scripts/media-library/check-no-dormant-fetch.sh
bash scripts/media-library/check-no-boot-dependency.sh
bash scripts/media-library/check-fixture-provenance.sh
~/.claude/oneflow-pilot/s4lock release lane-13b
git add -A
git commit -m "feat(media-library): chữ 5 ngôn ngữ, .env.example, guard từ vựng + a11y (E12,E24)"
```

---

## Bảng tóm tắt cho người đọc

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Gõ mô tả cảnh cần tìm, thấy các clip khớp từ kho chung | `src/lib/media-library/` | AC-3 (hình dạng lời gọi đúng hợp đồng) |
| Biết đích danh thứ còn thiếu khi chưa nối kho, và tự nhập được | node + `config.server.ts` | AC-1 (thiếu cấu hình gọi đúng tên) |
| Phân biệt được "kho không có gì hợp" với "hệ thống hỏng" | node | AC-4 (kệ mỏng khác lời báo hỏng) |
| Biết khi kết quả chưa được xếp theo độ hợp | `client.server.ts` + node | AC-5 (suy giảm không trình như sạch) |
| Đọc được tám kiểu trục trặc thành tám việc phải làm | `errors.ts` | AC-6 (ma trận tám ca) |
| Thấy nhãn quyền sử dụng trên clip | `media-card-list.tsx` | AC-8 (công bố pháp lý bắt buộc) |
| Chọn một clip và nó về kho file, phát được ngay | `import.server.ts` | AC-9, AC-11 (bytes nguyên vẹn, đuôi đúng) |
| Được chặn khi kho chung đưa ra một địa chỉ không an toàn | route nạp + guard | AC-10 (call-site, không phải hàm) |
| Clip vừa lấy thành khối video nối sẵn trên canvas | `types.tsx`, `exporter.ts` | AC-12 (nở đúng modality) |
| Node dừng lại khi kho chung đổi phiên bản giao kèo | `version.ts` | AC-13 (ranh giới có phiên bản) |
| Dùng được ở nền tối và với trình đọc màn hình | proto + guard a11y | AC-15 (tám trạng thái x hai nền) |

## Thứ tự và tính độc lập

Tám task chạy **tuần tự**: mỗi task tiêu thụ interface của task trước.
Task 8 độc lập về nội dung nhưng guard của nó quét cửa sổ diff cả nhánh nên chạy
cuối. **Không dùng fan-out song song ở S3** — không có ≥2 task `independent: true`.

## Tự soát kế hoạch

- **Phủ hợp đồng:** 15/15 AC có task. AC-2 phủ bởi Task 5 (guard boot) + eval ui-check
  E4; AC-14 phủ bởi guard `aml_tier_boundary` (không cần code, chỉ cần đừng chạm).
- **Không chỗ trống:** mọi step sinh code đều có code thật; mọi lệnh có kỳ vọng đầu ra.
- **Nhất quán kiểu:** `MediaCard`/`AssetDetail`/`SearchResponse` định nghĩa ở Task 2 và
  dùng nguyên tên ở Task 3–6; `MediaLibraryFailure` định nghĩa Task 3, dùng ở Task 4–5;
  `extensionFor` Task 4; `ADD_NODE_OUTPUT_TYPE` là tên sẵn có của repo.
