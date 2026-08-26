import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";

/**
 * AC-11 — the migration must survive a database that predates this package.
 *
 * Runs the REAL migration files against a database built from the migrations
 * that existed before, with rows in it. A schema-only assertion would pass on a
 * table that was dropped and recreated empty; the row counts are what make this
 * test about *users' data* rather than about DDL.
 *
 * Precedent: metering-schema.test.ts, which exists because a migration that
 * looked correct silently rebuilt a table.
 */
const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

function migrationFiles(): string[] {
    return readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith(".sql"))
        .sort();
}

function applySql(db: Database.Database, file: string): void {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    for (const stmt of sql.split("--> statement-breakpoint")) {
        const trimmed = stmt.trim();
        if (trimmed) db.exec(trimmed);
    }
}

describe("migrator on a pre-D0 database (AC-11)", () => {
    it("keeps existing rows and adds the new surface", () => {
        const files = migrationFiles();
        const newest = files.at(-1);
        expect(newest, "no migrations found").toBeDefined();
        const older = files.slice(0, -1);
        expect(older.length, "need at least one prior migration").toBeGreaterThan(0);

        const dir = mkdtempSync(path.join(tmpdir(), "oneflow-d0-"));
        const db = new Database(path.join(dir, "old.db"));

        // 1. A database as it stood BEFORE this package.
        for (const f of older) applySql(db, f);

        // 2. With a user's workflow already in it.
        db.prepare(
            "INSERT INTO workflows (name, flow) VALUES (?, ?)",
        ).run("kế hoạch cũ của tôi", JSON.stringify({ nodes: [], edges: [] }));
        const before = db
            .prepare("SELECT count(*) AS n FROM workflows")
            .get() as { n: number };
        expect(before.n).toBe(1);

        // 3. Migrate forward.
        applySql(db, newest as string);

        // 4. The row is still there, and readable.
        const after = db
            .prepare("SELECT name, director_run_id FROM workflows")
            .all() as { name: string; director_run_id: string | null }[];
        expect(after).toHaveLength(1);
        expect(after[0].name).toBe("kế hoạch cũ của tôi");
        // A pre-existing workflow was not staged from a Director run, and must
        // stay distinguishable from one that was.
        expect(after[0].director_run_id).toBeNull();

        // 5. The new table exists and is usable.
        db.prepare(
            "INSERT INTO director_events (run_id, kind, prompt_text, dsl_version) VALUES (?,?,?,?)",
        ).run("run-1", "generated", "xin chào", 1);
        const events = db
            .prepare("SELECT run_id, attempts FROM director_events")
            .all() as { run_id: string; attempts: number | null }[];
        expect(events).toHaveLength(1);
        // Unmeasured, not zero.
        expect(events[0].attempts).toBeNull();

        db.close();
    });
});
