import { beforeEach, describe, expect, it, vi } from "vitest";
import { readEnvForBrowser } from "./env-client";

/**
 * Positive in BOTH directions.
 *
 * The old gate asserted `ok` positively and let the COMPLEMENT fall into
 * "unreadable". So a proxy 502, an expired session and a dropped connection all
 * inherited the heaviest name the reader had — and the settings screen offered
 * to wipe the key store for each of them.
 *
 * Now each heavy conclusion needs its own positive signal, and the complement
 * lands on a neutral name. This matrix is what makes that checkable: nine
 * signals, one row each, count pinned. A collapsed classifier cannot pass it,
 * because seven rows would have to move at once.
 *
 * Nine here; the tenth signal — the 30s ceiling — is measured in
 * env-client.timeout.test.ts, where fake timers live.
 */
const SIGNALS = 9;

type Want = { state: string; code?: string };

const TABLE: ReadonlyArray<readonly [string, () => Response, Want]> = [
    [
        "200+env",
        () =>
            new Response(JSON.stringify({ env: { A: "1" } }), { status: 200 }),
        { state: "ok" },
    ],
    [
        "503+code",
        () =>
            new Response(
                JSON.stringify({
                    code: "ENV_STORE_UNREADABLE",
                    reason: "parse",
                }),
                { status: 503 },
            ),
        { state: "store-unreadable" },
    ],
    [
        "401",
        () => new Response("{}", { status: 401 }),
        { state: "unauthenticated" },
    ],
    [
        "403",
        () => new Response("{}", { status: 403 }),
        { state: "unavailable", code: "http" },
    ],
    [
        "500",
        () => new Response("{}", { status: 500 }),
        { state: "unavailable", code: "http" },
    ],
    [
        "502-html",
        () => new Response("<html>bad gateway</html>", { status: 502 }),
        { state: "unavailable", code: "http" },
    ],
    [
        "not-json",
        () => new Response("<html>", { status: 200 }),
        { state: "unavailable", code: "not-json" },
    ],
    [
        "no-env",
        () => new Response(JSON.stringify({ env: [1, 2] }), { status: 200 }),
        { state: "unavailable", code: "no-env" },
    ],
    [
        "network",
        () => {
            throw new TypeError("fetch failed");
        },
        { state: "unavailable", code: "network" },
    ],
];

beforeEach(() => {
    vi.restoreAllMocks();
});

const stub = (make: () => Response) =>
    vi.stubGlobal(
        "fetch",
        vi.fn(async () => make()),
    );

describe(`read taxonomy — ${SIGNALS} signals, positive in both directions`, () => {
    it(`covers exactly ${SIGNALS} signals`, () => {
        expect(TABLE.length, "matrix must stay full").toBe(SIGNALS);
    });

    for (const [name, make, want] of TABLE) {
        it(`${name} -> ${want.state}`, async () => {
            stub(make);
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
        // The negative half of the positive signal. A gate that tests only the
        // status re-opens the door this whole matrix exists to close.
        stub(
            () =>
                new Response(JSON.stringify({ error: "nope" }), {
                    status: 503,
                }),
        );
        const got = await readEnvForBrowser();
        expect(
            got.state,
            "a positive signal needs BOTH the status and the code",
        ).toBe("unavailable");
    });
});
