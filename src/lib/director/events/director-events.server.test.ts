import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * AC-5, the half decidePatch cannot see: the single-shot rule has to hold
 * against two requests that BOTH read `generated` before either writes. That
 * is exactly what a client double-fire produces (replaced + discarded from one
 * click), so the guard is measured on a real database with real interleaving,
 * not on the pure decision function.
 */
const sqlite = new Database(":memory:");
{
    const dir = path.join(process.cwd(), "drizzle");
    for (const f of readdirSync(dir)
        .filter((x) => x.endsWith(".sql"))
        .sort()) {
        for (const stmt of readFileSync(path.join(dir, f), "utf8").split(
            "--> statement-breakpoint",
        )) {
            if (stmt.trim()) sqlite.exec(stmt);
        }
    }
}

// The module under test is server-only; vitest runs it outside Next.
vi.mock("server-only", () => ({}));

vi.mock("@/db", async () => {
    const schema =
        await vi.importActual<typeof import("@/db/schema")>("@/db/schema");
    return { getDb: async () => drizzle(sqlite, { schema }), ...schema };
});

import { patchOutcome } from "./director-events.server";

function seed(runId: string): void {
    sqlite
        .prepare(
            "INSERT INTO director_events (run_id, kind, prompt_text, dsl_version) VALUES (?, 'generated', 'p', 1)",
        )
        .run(runId);
}
const kindOf = (runId: string) =>
    (
        sqlite
            .prepare("SELECT kind FROM director_events WHERE run_id = ?")
            .get(runId) as { kind: string }
    ).kind;

describe("patchOutcome — single-shot enforced in the statement (AC-5)", () => {
    beforeEach(() => {
        sqlite.exec("DELETE FROM director_events");
    });

    it("applies the first patch and refuses a second one", async () => {
        seed("r-seq");
        expect(await patchOutcome("r-seq", "accepted")).toEqual({
            allowed: true,
            kind: "accepted",
        });
        expect(await patchOutcome("r-seq", "discarded")).toEqual({
            allowed: false,
            reason: "ALREADY_PATCHED",
        });
        expect(kindOf("r-seq")).toBe("accepted");
    });

    it("lets exactly one of two racing patches through", async () => {
        // Both calls pass their SELECT before either UPDATE runs (the driver
        // is synchronous, the await boundaries are what interleave). With a
        // select-then-update the second write wins and both report success;
        // with the conditional UPDATE the loser sees zero rows changed.
        seed("r-race");
        const outcomes = await Promise.all([
            patchOutcome("r-race", "replaced"),
            patchOutcome("r-race", "discarded"),
        ]);
        expect(outcomes.filter((d) => d.allowed)).toHaveLength(1);
        expect(outcomes.filter((d) => !d.allowed)).toEqual([
            { allowed: false, reason: "ALREADY_PATCHED" },
        ]);
        const winner = outcomes.find((d) => d.allowed);
        expect(kindOf("r-race")).toBe(
            winner?.allowed ? winner.kind : "unreachable",
        );
    });

    it("still reports an unknown run before anything else", async () => {
        expect(await patchOutcome("r-none", "accepted")).toEqual({
            allowed: false,
            reason: "UNKNOWN_RUN",
        });
    });
});
