// @vitest-environment node
/**
 * The key store, measured on a REAL temp directory.
 *
 * No mock stands in for the storage seam: `vitest.config.ts` aliases
 * `@ext -> src/ext-default` and `dataDir()` reads `TONGFLOW_DATA_DIR`, so these
 * tests exercise the same file reader a plain checkout ships. That config's own
 * comment records why it has to be this way — "which is how the AC-9 round trip
 * ended up asserting against a mock".
 *
 * Every module is imported INSIDE a test via `await import(...)` because the
 * data dir is chosen per test; a top-level import would bind the first one.
 */

import { spawn } from "node:child_process";
import {
    chmodSync,
    existsSync,
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The repo-wide pattern: neutralise the server-only SENTINEL, never the
// storage seam itself.
vi.mock("server-only", () => ({}));

let dir: string;
const store = () => path.join(dir, "settings.json");
const isRoot = () => process.getuid?.() === 0;

beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "byo-store-"));
    process.env.TONGFLOW_DATA_DIR = dir;
    vi.resetModules();
});

afterEach(() => {
    // Undo the chmod 000 fixture first, or the cleanup cannot remove the file.
    if (existsSync(store())) {
        try {
            chmodSync(store(), 0o600);
        } catch {
            /* already a directory, or already writable */
        }
    }
    rmSync(dir, { recursive: true, force: true });
    delete process.env.TONGFLOW_DATA_DIR;
    vi.doUnmock("@ext/settings-codec");
});

describe("seam: absent vs unreadable", () => {
    it("returns null when the blob has never been written", async () => {
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).resolves.toBeNull();
    });

    it("throws with the original errno when the file cannot be read", async () => {
        if (isRoot()) {
            // chmod cannot lock root out. Say so — a silent skip is a green
            // that means nothing.
            console.warn("SKIP EACCES branch: running as uid 0");
            return;
        }
        writeFileSync(store(), '{"A":"1"}', "utf8");
        chmodSync(store(), 0o000);
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).rejects.toMatchObject({
            code: "EACCES",
        });
    });

    it("throws EISDIR when the path is a directory", async () => {
        mkdirSync(store());
        const { readSettingsBlob } = await import("@ext/settings-store");
        await expect(readSettingsBlob()).rejects.toMatchObject({
            code: "EISDIR",
        });
    });
});

describe("readEnvStore: ok vs absent", () => {
    it("returns the stored map verbatim", async () => {
        writeFileSync(store(), '{"A":"1","B":"2"}', "utf8");
        const { readEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(readEnvStore()).resolves.toEqual({
            state: "ok",
            env: { A: "1", B: "2" },
        });
    });

    it("says absent — not unreadable — when nothing was ever stored", async () => {
        // Suppression half: a reader that always answers "unreadable" passes
        // the unreadable matrix below and is exactly the bug this guards.
        const { readEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(readEnvStore()).resolves.toEqual({ state: "absent" });
    });
});

describe("readEnvStore: unreadable matrix", () => {
    // Full matrix over the four causes: one assertion per element, and the
    // reasons must stay distinct so a caller can tell them apart.
    const BLOB_CAUSES = [
        ["parse", "{oops", "parse"],
        ["shape", "[1,2,3]", "shape"],
        ["shape-scalar", '"just a string"', "shape"],
    ] as const;

    it.each(BLOB_CAUSES)(
        "%s reads as unreadable",
        async (_label, blob, reason) => {
            writeFileSync(store(), blob, "utf8");
            const { readEnvStore } = await import(
                "@/lib/settings/env-store.server"
            );
            await expect(readEnvStore()).resolves.toEqual({
                state: "unreadable",
                reason,
            });
        },
    );

    it("io: an unreadable file reads as unreadable", async () => {
        if (isRoot()) {
            console.warn("SKIP io branch: running as uid 0");
            return;
        }
        writeFileSync(store(), '{"A":"1"}', "utf8");
        chmodSync(store(), 0o000);
        const { readEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(readEnvStore()).resolves.toEqual({
            state: "unreadable",
            reason: "io",
        });
    });

    it("decode: a codec failure reads as unreadable", async () => {
        writeFileSync(store(), "ciphertext", "utf8");
        vi.doMock("@ext/settings-codec", () => ({
            encodeEnvStore: async (s: string) => s,
            decodeEnvStore: async () => {
                throw new Error("bad key");
            },
        }));
        const { readEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(readEnvStore()).resolves.toEqual({
            state: "unreadable",
            reason: "decode",
        });
    });

    it("keeps the four reasons distinct — read back from readEnvStore itself", async () => {
        // The first draft of this test built a Set out of THIS FILE's own
        // constants and asserted it had four members. It never imported the
        // module, so it stayed green even if readEnvStore collapsed all four
        // causes into one string — precisely the regression it was named for.
        // This drives the real function once per cause and collects what it
        // actually answers.
        const reasons: string[] = [];

        const causes: Array<[string, () => void | Promise<void>]> = [
            ["parse", () => writeFileSync(store(), "{oops", "utf8")],
            ["shape", () => writeFileSync(store(), "[1,2,3]", "utf8")],
            [
                "decode",
                () => {
                    writeFileSync(store(), "ciphertext", "utf8");
                    vi.doMock("@ext/settings-codec", () => ({
                        encodeEnvStore: async (x: string) => x,
                        decodeEnvStore: async () => {
                            throw new Error("bad key");
                        },
                    }));
                },
            ],
        ];
        if (!isRoot()) {
            causes.push([
                "io",
                () => {
                    writeFileSync(store(), '{"A":"1"}', "utf8");
                    chmodSync(store(), 0o000);
                },
            ]);
        } else {
            console.warn("SKIP io cause: running as uid 0");
        }

        for (const [, arrange] of causes) {
            rmSync(dir, { recursive: true, force: true });
            mkdirSync(dir, { recursive: true });
            vi.resetModules();
            vi.doUnmock("@ext/settings-codec");
            await arrange();
            const { readEnvStore } = await import(
                "@/lib/settings/env-store.server"
            );
            const read = await readEnvStore();
            expect(read.state).toBe("unreadable");
            if (read.state === "unreadable") reasons.push(read.reason);
        }

        // One distinct answer per cause exercised — the whole point of the
        // field. Under root the io case is skipped and the count says so.
        expect(new Set(reasons).size).toBe(causes.length);
        expect([...reasons].sort()).toEqual(
            causes.map(([name]) => name).sort(),
        );
    });
});

describe("loadEnvStore stays tolerant", () => {
    // Owner decision 2 (31/08): an unreadable store must NOT block a run.
    // These assert the RUN path keeps today's behaviour exactly.
    const CASES = [
        ["absent", null],
        ["parse", "{oops"],
        ["shape", "[1,2,3]"],
    ] as const;

    it.each(CASES)("%s: returns {} and never throws", async (_label, blob) => {
        if (blob !== null) writeFileSync(store(), blob, "utf8");
        const { loadEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(loadEnvStore()).resolves.toEqual({});
    });

    it("io: returns {} and never throws", async () => {
        if (isRoot()) {
            console.warn("SKIP io branch: running as uid 0");
            return;
        }
        writeFileSync(store(), '{"A":"1"}', "utf8");
        chmodSync(store(), 0o000);
        const { loadEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(loadEnvStore()).resolves.toEqual({});
    });

    it("decode: returns {} and never throws", async () => {
        // The class this describe claims is all six states; the first draft
        // listed five and quietly left `decode` out, so a loadEnvStore that let
        // a codec failure escape would still have gone green.
        writeFileSync(store(), "ciphertext", "utf8");
        vi.doMock("@ext/settings-codec", () => ({
            encodeEnvStore: async (x: string) => x,
            decodeEnvStore: async () => {
                throw new Error("bad key");
            },
        }));
        const { loadEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(loadEnvStore()).resolves.toEqual({});
    });

    it("ok: still returns the real map", async () => {
        // Positive control: a reader that always returns {} passes every case
        // above.
        writeFileSync(store(), '{"A":"1"}', "utf8");
        const { loadEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(loadEnvStore()).resolves.toEqual({ A: "1" });
    });
});

describe("coerceEnv decision table", () => {
    it("coerces scalars and keeps every key", async () => {
        writeFileSync(
            store(),
            JSON.stringify({
                OPENAI_API_KEY: "sk-fake",
                PORT: 8080,
                DEBUG: true,
            }),
            "utf8",
        );
        const { readEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        const read = await readEnvStore();
        // Assert the whole MAP, not one key. Measured before the fix
        // (2026-08-31): four keys vanished while the state still read "ok", so
        // a check that only looks at OPENAI_API_KEY passes on the broken
        // version too.
        expect(read).toEqual({
            state: "ok",
            env: { OPENAI_API_KEY: "sk-fake", PORT: "8080", DEBUG: "true" },
        });
    });

    it("refuses structured values instead of stringifying them", async () => {
        // Full matrix: one store per shape, three assertions for three members.
        for (const bad of [
            { NESTED: { a: 1 } },
            { LIST: [1, 2] },
            { NULLED: null },
        ]) {
            rmSync(store(), { force: true });
            writeFileSync(
                store(),
                JSON.stringify({ OPENAI_API_KEY: "sk-fake", ...bad }),
                "utf8",
            );
            vi.resetModules();
            const { readEnvStore } = await import(
                "@/lib/settings/env-store.server"
            );
            const read = await readEnvStore();
            expect(read).toEqual({ state: "unreadable", reason: "shape" });
            // The trap String(v) would spring: "[object Object]" is a garbage
            // value that looks valid — a different kind of quiet, not the end
            // of quiet.
            expect(JSON.stringify(read)).not.toContain("[object Object]");
        }
    });

    it("refuses empty keys", async () => {
        for (const key of ["", "   "]) {
            rmSync(store(), { force: true });
            writeFileSync(
                store(),
                JSON.stringify({ [key]: "x", OPENAI_API_KEY: "sk-fake" }),
                "utf8",
            );
            vi.resetModules();
            const { readEnvStore } = await import(
                "@/lib/settings/env-store.server"
            );
            expect(await readEnvStore()).toEqual({
                state: "unreadable",
                reason: "shape",
            });
        }
    });

    it("leaves an all strings untouched store exactly as it is", async () => {
        // The suppressing half. Without it, a fix that always returns
        // "unreadable", or one that rewrites every value, passes the three
        // cases above. REGION is deliberately an empty VALUE: an env var set
        // to "" is legal, only an empty KEY is not.
        const onDisk = {
            OPENAI_API_KEY: "sk-fake",
            ANTHROPIC_API_KEY: "sk-fake-2",
            REGION: "",
        };
        writeFileSync(store(), JSON.stringify(onDisk), "utf8");
        const { readEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        expect(await readEnvStore()).toEqual({ state: "ok", env: onDisk });
    });
});

describe("saveEnvStore refuses instead of filtering", () => {
    it("save refuses a bad key and leaves an existing store untouched", async () => {
        writeFileSync(
            store(),
            JSON.stringify({ OPENAI_API_KEY: "sk-fake" }),
            "utf8",
        );
        const before = readFileSync(store(), "utf8");
        const { saveEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        // The message must NAME the offending key — assert on the string, not
        // merely on "it threw".
        await expect(
            saveEnvStore({ "": "x" } as unknown as Record<string, string>),
        ).rejects.toThrow(/empty/i);
        await expect(
            saveEnvStore({ PORT: 8080 } as unknown as Record<string, string>),
        ).rejects.toThrow(/PORT/);
        // The half that matters: it threw AND it did not touch the disk.
        expect(readFileSync(store(), "utf8")).toBe(before);
    });

    it("save refuses on a machine with no store yet and leaves the directory clean", async () => {
        // "Wrote nothing" means something different here: the target must stay
        // ABSENT. The sha compare above needs the file to exist, so it cannot
        // see this case — and this is exactly where an orphaned empty
        // settings.json would turn "no store yet" into "empty store".
        expect(existsSync(store())).toBe(false);
        const { saveEnvStore } = await import(
            "@/lib/settings/env-store.server"
        );
        await expect(
            saveEnvStore({ "  ": "x" } as unknown as Record<string, string>),
        ).rejects.toThrow();
        expect(existsSync(store())).toBe(false);
        expect(readdirSync(dir)).toEqual([]);
    });

    it("empty key through PUT fails loudly and saves nothing", async () => {
        // Imports the route handler; edits NOTHING under src/app/api/**, which
        // is what keeps this package at T2.
        //
        // Why this case exists: route.ts filters by VALUE TYPE, not by key, so
        // an empty key reaches saveEnvStore and now throws. Before this change
        // the valid key was still saved. All-or-nothing is the deliberate new
        // behaviour — trading a silent drop for a loud failure.
        writeFileSync(
            store(),
            JSON.stringify({ OPENAI_API_KEY: "sk-old" }),
            "utf8",
        );
        const before = readFileSync(store(), "utf8");
        const { PUT } = await import("@/app/api/settings/env/route");
        const req = new Request("http://localhost/api/settings/env", {
            method: "PUT",
            body: JSON.stringify({
                env: { "": "x", OPENAI_API_KEY: "sk-fake" },
            }),
        });

        // The route does NOT catch, so the refusal escapes the handler as a
        // rejection rather than a 4xx Response. Both shapes satisfy the
        // contract — loud, naming the key, nothing written — and the test
        // asserts whichever actually happens instead of the one preferred.
        // Turning this into a clean 400 means editing route.ts, which is in
        // t3_paths and therefore a named out-of-scope item, not a silent gap.
        let named = false;
        try {
            // `as never` matches the pattern route.unreadable.test.ts already
            // uses: the handler declares NextRequest, and a plain Request
            // carries everything it actually reads.
            const res = await PUT(req as never);
            expect(res.status).toBeGreaterThanOrEqual(400);
            named = /empty|key/i.test(JSON.stringify(await res.json()));
        } catch (err) {
            named = /empty environment variable name/i.test(String(err));
        }
        expect(named).toBe(true);

        // All or nothing: the valid key must NOT be half-saved.
        expect(readFileSync(store(), "utf8")).toBe(before);
    });
});

describe("writeSettingsBlob is atomic", () => {
    it("no temp file is left behind, on the success path and the failure path", async () => {
        const { writeSettingsBlob } = await import("@ext/settings-store");
        await writeSettingsBlob(JSON.stringify({ A: "1" }));
        expect(readdirSync(dir).sort()).toEqual(["settings.json"]);

        // The FAILURE path is the half that is easy to forget, and it is the
        // half that leaves an orphan behind. Skipped as root, which ignores
        // mode bits — the pattern this file already uses.
        if (!isRoot()) {
            chmodSync(dir, 0o500);
            await expect(writeSettingsBlob("x".repeat(1024))).rejects.toThrow();
            chmodSync(dir, 0o700);
            expect(readdirSync(dir).sort()).toEqual(["settings.json"]);
        }
    });

    it("a concurrent reader never sees a partial file", async () => {
        // THE assertion that distinguishes the two implementations. Two rules,
        // both from the clean-context review, both load-bearing:
        //
        // 1. The reader is a SEPARATE OS PROCESS. A same-process loop cannot
        //    interleave with a synchronous write — JS will not schedule it —
        //    so it would observe only the new bytes and pass on the broken
        //    implementation too.
        // 2. The samples must STRADDLE the write: at least one old and at
        //    least one new. Not straddling is INCONCLUSIVE, not PASS —
        //    "every sample is valid" is vacuously true for a reader that ran
        //    entirely after the write.
        const OLD = JSON.stringify({ OLD: "y".repeat(1_000) });
        writeFileSync(store(), OLD, "utf8");
        const NEW = JSON.stringify({ NEW: "z".repeat(6_000_000) });

        const reader = spawn(process.execPath, [
            "-e",
            `const fs=require("node:fs");const out=[];const until=Date.now()+4000;
             while(Date.now()<until){try{out.push(fs.readFileSync(process.argv[1],"utf8").length)}catch{}}
             process.stdout.write(JSON.stringify(out));`,
            store(),
        ]);
        const collected = new Promise<string>((resolve) => {
            let buf = "";
            reader.stdout.on("data", (c) => {
                buf += String(c);
            });
            reader.on("close", () => resolve(buf));
        });

        await new Promise((r) => setTimeout(r, 150));
        const { writeSettingsBlob } = await import("@ext/settings-store");
        await writeSettingsBlob(NEW);

        const samples: number[] = JSON.parse(await collected);
        const old = samples.filter((n) => n === OLD.length).length;
        const fresh = samples.filter((n) => n === NEW.length).length;
        const partial = samples.filter(
            (n) => n !== OLD.length && n !== NEW.length,
        );
        console.log(
            `mẫu cũ=${old} mẫu mới=${fresh} tổng=${samples.length} cụt=${partial.length}`,
        );

        if (old === 0 || fresh === 0) {
            throw new Error(
                `không bắc qua được lượt ghi (cũ=${old} mới=${fresh}) — KHÔNG KẾT LUẬN ĐƯỢC, không phải đạt`,
            );
        }
        expect(
            partial.length === 0
                ? []
                : [
                      `${partial.length} mẫu cụt, độ dài ${partial.slice(0, 3)}, không khớp cũ (${OLD.length}) lẫn mới (${NEW.length})`,
                  ],
        ).toEqual([]);
    }, 20_000);
});
