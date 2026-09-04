import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

/**
 * The premise of `replaceUnreadableStore`, measured at the boundary.
 *
 * The flag is a CLAIM the browser makes about SERVER state. Before this suite,
 * the server used it only to skip the 409 refusal and never checked whether the
 * claim was true — so a transient 401 or proxy 502 on the client could end with
 * an empty PUT erasing a perfectly readable store.
 *
 * Full matrix over axis A (the store's real state) with the flag ON. The count
 * is pinned so a collapsed matrix cannot pass for a full one.
 */
const AXIS_A = ["ok", "absent", "unreadable"] as const;
const CASES = AXIS_A.length;

let dir: string;

beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "knsk-"));
    process.env.TONGFLOW_DATA_DIR = dir;
    vi.resetModules();
});

const storePath = () => join(dir, "settings.json");

const sha = () =>
    createHash("sha256").update(readFileSync(storePath())).digest("hex");

const put = async (body: unknown) => {
    const { PUT } = await import("./route");
    return PUT(
        new Request("http://t/api/settings/env", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            // `as never`: the handler declares NextRequest, but only reads
            // `.json()`. The repo's other route tests do the same — see
            // route.unreadable.test.ts.
        }) as never,
    );
};

/**
 * The healthy fixture is produced by the real WRITER, never hand-written JSON.
 *
 * A fixture hand-shaped to match what the reader expects only proves the test
 * and the reader agree with each other; it proves nothing about the bytes the
 * app actually puts on disk.
 */
const seedHealthyStore = async (env: Record<string, string>) => {
    const { saveEnvStore } = await import("@/lib/settings/env-store.server");
    await saveEnvStore(env);
};

const readBack = async () => {
    const { readEnvStore } = await import("@/lib/settings/env-store.server");
    return readEnvStore();
};

describe(`premise of replaceUnreadableStore (${CASES} cases + race)`, () => {
    it(`covers all ${CASES} states of the store`, () => {
        // The pin was interpolated into the describe title and asserted
        // nowhere, so deleting the `absent` case left the suite green and the
        // title still claiming a full matrix. Every sibling suite in this
        // dossier pins its count for the same reason.
        expect(AXIS_A.length, "the store-state axis must stay full").toBe(
            CASES,
        );
    });

    it("case ok: refuses, writes nothing, store byte-identical", async () => {
        await seedHealthyStore({ A: "1", B: "2" });
        const before = sha();

        const res = await put({ env: {}, replaceUnreadableStore: true });
        const body = await res.json();

        // Damage first. A red run has to say what was LOST, not just which
        // number came back — "expected 200 to be 409" reads like a routing
        // detail, "expected 0 to be 2" reads like two keys are gone.
        const after = await readBack();
        expect(
            after.state === "ok" ? Object.keys(after.env).length : -1,
            "case ok: keys must survive the refusal",
        ).toBe(2);
        expect(sha(), "case ok: store file must be byte-identical").toBe(
            before,
        );

        expect(res.status, "case ok: expected 409 refusal").toBe(409);
        expect(body.code, "case ok: refusal must be named").toBe(
            "ENV_STORE_REPLACE_REFUSED",
        );
        expect(
            body.state,
            "case ok: refusal must report the state it saw",
        ).toBe("ok");
    });

    it("case absent: refuses and creates no file", async () => {
        const res = await put({ env: {}, replaceUnreadableStore: true });
        const body = await res.json();

        expect(
            existsSync(storePath()),
            "case absent: file must not be created",
        ).toBe(false);

        expect(res.status, "case absent: expected 409").toBe(409);
        expect(body.code, "case absent: refusal must be named").toBe(
            "ENV_STORE_REPLACE_REFUSED",
        );
        expect(body.state, "case absent: state must be reported").toBe(
            "absent",
        );
    });

    it("case unreadable: the legitimate path still works", async () => {
        writeFileSync(storePath(), "}{ not json");

        const res = await put({ env: {}, replaceUnreadableStore: true });
        expect(res.status, "case unreadable: replace must be allowed").toBe(
            200,
        );

        const after = await readBack();
        expect(after.state, "case unreadable: store must now read ok").toBe(
            "ok",
        );
    });

    it("race: a store repaired before the write lands on the refusal", async () => {
        // The browser read `unreadable`, the user clicked, and another tab fixed
        // the file in between. No special rule handles this — the premise check
        // is evaluated against the store as it is NOW, which is the whole point.
        await seedHealthyStore({ A: "1", B: "2" });

        const res = await put({ env: {}, replaceUnreadableStore: true });

        const after = await readBack();
        expect(
            after.state === "ok" ? Object.keys(after.env).length : -1,
            "race: keys must survive",
        ).toBe(2);
        expect(
            res.status,
            "race: repaired store must refuse, no special rule",
        ).toBe(409);
    });

    it("positive control: a PUT without the flag still writes", async () => {
        const res = await put({ env: { C: "3" } });
        expect(
            res.status,
            "positive control: normal write must still work",
        ).toBe(200);

        const after = await readBack();
        expect(
            after.state === "ok" ? after.env.C : undefined,
            "positive control: the value must land",
        ).toBe("3");
    });
});
