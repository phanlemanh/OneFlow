/**
 * The eight shapes a read of the key store can come back in.
 *
 * Named, and shared by five test files, because every assertion in this feature
 * reports WHICH shape it was looking at. "expected 1 to be 0" with no shape
 * name costs a debugging round — and the whole point of this dossier is that
 * four of these shapes were being handled as though they were the store-broken
 * one. Three more joined later — 401, 403, and a 503 that carries no code —
 * because the second dossier found the same collapse one level up: every
 * non-2xx inherited the heaviest name available.
 *
 * `network` throws rather than returning a Response: a dropped connection is
 * not a status code, and the reader has to survive `fetch` itself rejecting.
 */
export const READ_FAILURES: ReadonlyArray<readonly [string, () => Response]> = [
    [
        "503",
        () =>
            new Response(
                JSON.stringify({
                    error: "unreadable",
                    code: "ENV_STORE_UNREADABLE",
                }),
                { status: 503 },
            ),
    ],
    [
        "500",
        () => new Response(JSON.stringify({ error: "boom" }), { status: 500 }),
    ],
    [
        "502-html",
        () =>
            new Response("<html><body>502 Bad Gateway</body></html>", {
                status: 502,
                headers: { "content-type": "text/html" },
            }),
    ],
    [
        "shape",
        () => new Response(JSON.stringify({ env: [1, 2, 3] }), { status: 200 }),
    ],
    [
        "network",
        () => {
            throw new TypeError("fetch failed");
        },
    ],
    [
        "401",
        () =>
            new Response(JSON.stringify({ error: "unauthorized" }), {
                status: 401,
            }),
    ],
    [
        "403",
        () =>
            new Response(JSON.stringify({ error: "forbidden" }), {
                status: 403,
            }),
    ],
    [
        // The negative half of the positive signal: 503 ALONE never means the
        // store is broken. A proxy sends 503 too, and it has never heard of this
        // store. Only 503 AND the code the store puts in its own body counts.
        "503-no-code",
        () => new Response(JSON.stringify({ error: "nope" }), { status: 503 }),
    ],
];

/** A healthy read. The positive control every refusal test needs. */
export const healthyRead = (
    env: Record<string, string> = { OPENAI_API_KEY: "sk-1" },
) => new Response(JSON.stringify({ env, pluginEnv: [] }), { status: 200 });
