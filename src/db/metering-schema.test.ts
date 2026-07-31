import {
    mkdirSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { describe, expect, it } from "vitest";

/**
 * Metering columns (plan item 0.2) — schema and migration guarantees.
 *
 * These run the real drizzle migrator against a real sqlite file, because the
 * risk this feature carries is not "does the TypeScript compile" but "does an
 * existing user database survive the upgrade".
 */

const MIGRATIONS_DIR = join(process.cwd(), "drizzle");
const NEW_COLUMNS = ["duration_ms", "cost_usd", "gpu_type"] as const;

type JournalEntry = { idx: number; when: number; tag: string };
type Journal = { version: string; dialect: string; entries: JournalEntry[] };

function readJournal(dir: string): Journal {
    return JSON.parse(
        readFileSync(join(dir, "meta", "_journal.json"), "utf8"),
    ) as Journal;
}

/** Migration files that introduce the metering columns. */
function migrationsMentioningMetering(): string[] {
    return readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith(".sql"))
        .filter((f) =>
            NEW_COLUMNS.some((c) =>
                readFileSync(join(MIGRATIONS_DIR, f), "utf8").includes(c),
            ),
        );
}

/**
 * Build a migrations folder containing only the entries up to `upToIdx`, so a
 * database can be created at an older migration level and then upgraded — the
 * only faithful way to test the upgrade path.
 */
function trimmedMigrationsDir(upToIdx: number): string {
    const dir = mkdtempSync(join(tmpdir(), "oneflow-mig-"));
    mkdirSync(join(dir, "meta"), { recursive: true });
    const journal = readJournal(MIGRATIONS_DIR);
    const kept = journal.entries.filter((e) => e.idx <= upToIdx);
    for (const entry of kept) {
        writeFileSync(
            join(dir, `${entry.tag}.sql`),
            readFileSync(join(MIGRATIONS_DIR, `${entry.tag}.sql`), "utf8"),
        );
    }
    writeFileSync(
        join(dir, "meta", "_journal.json"),
        JSON.stringify({ ...journal, entries: kept }),
    );
    return dir;
}

function openDb(file: string) {
    const sqlite = new Database(file);
    return { sqlite, db: drizzle(sqlite) };
}

function tableInfo(sqlite: Database.Database, table: string) {
    return sqlite.prepare(`PRAGMA table_info(${table})`).all() as {
        name: string;
        type: string;
        notnull: number;
    }[];
}

describe("metering migration shape (AC-1)", () => {
    it("introduces the three columns in exactly one migration", () => {
        expect(migrationsMentioningMetering()).toHaveLength(1);
    });

    it("is purely additive — three ADDs, no DROP, no RENAME", () => {
        const [file] = migrationsMentioningMetering();
        const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");

        const statements = sql
            .split("--> statement-breakpoint")
            .map((s) => s.trim())
            .filter(Boolean);

        expect(statements).toHaveLength(3);
        for (const stmt of statements) {
            expect(stmt).toMatch(/^ALTER TABLE `tasks` ADD /);
        }

        // The suppression half: a migration that drops or renames an existing
        // column would silently destroy live task history.
        expect(sql).not.toMatch(/\bDROP\b/i);
        expect(sql).not.toMatch(/\bRENAME\b/i);

        expect(sql).toContain("ADD `duration_ms` integer");
        expect(sql).toContain("ADD `cost_usd` real");
        expect(sql).toContain("ADD `gpu_type` text");
    });
});

describe("fresh database (AC-3)", () => {
    it("declares all three columns nullable with the intended types", () => {
        const dir = mkdtempSync(join(tmpdir(), "oneflow-fresh-"));
        const { sqlite, db } = openDb(join(dir, "test.db"));
        migrate(db, { migrationsFolder: MIGRATIONS_DIR });

        const byName = new Map(
            tableInfo(sqlite, "tasks").map((c) => [c.name, c]),
        );

        for (const col of NEW_COLUMNS) {
            expect(byName.has(col), `missing column ${col}`).toBe(true);
            // notnull=0 → nullable. "Not measured" has to be representable.
            expect(byName.get(col)?.notnull).toBe(0);
        }
        // SQLite type affinity is case-insensitive; normalise before comparing.
        const typeOf = (c: string) => byName.get(c)?.type.toLowerCase();
        expect(typeOf("duration_ms")).toBe("integer");
        expect(typeOf("cost_usd")).toBe("real");
        expect(typeOf("gpu_type")).toBe("text");

        sqlite.close();
    });
});

describe("upgrading an existing database (AC-2)", () => {
    it("adds the columns without disturbing pre-existing rows", () => {
        const dir = mkdtempSync(join(tmpdir(), "oneflow-upgrade-"));
        const file = join(dir, "test.db");

        // 1. Create a database at the migration level that shipped before this
        //    feature, and put a task row in it.
        const older = trimmedMigrationsDir(1);
        const first = openDb(file);
        migrate(first.db, { migrationsFolder: older });
        first.sqlite
            .prepare(
                "INSERT INTO tasks (id, node_id, feature, plugin_id, prompt, status, progress, created_at, updated_at) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .run(
                "task-legacy-1",
                "node-1",
                "image-gen",
                "tongflow-modal-z-image",
                '{"text":"a cat"}',
                "completed",
                100,
                1700000000,
                1700000000,
            );
        expect(
            tableInfo(first.sqlite, "tasks").map((c) => c.name),
        ).not.toContain("duration_ms");
        first.sqlite.close();

        // 2. Upgrade with the full migration set.
        const upgraded = openDb(file);
        migrate(upgraded.db, { migrationsFolder: MIGRATIONS_DIR });

        const row = upgraded.sqlite
            .prepare("SELECT * FROM tasks WHERE id = ?")
            .get("task-legacy-1") as Record<string, unknown>;

        expect(row.status).toBe("completed");
        expect(row.prompt).toBe('{"text":"a cat"}');
        expect(row.plugin_id).toBe("tongflow-modal-z-image");
        // Historical rows were never measured — they must read as unknown,
        // not as zero.
        for (const col of NEW_COLUMNS) {
            expect(
                row[col],
                `${col} should be NULL for legacy rows`,
            ).toBeNull();
        }

        upgraded.sqlite.close();
    });
});

const CACHE_COLUMNS = ["cache_calls_total", "cache_calls_cached"] as const;

describe("cache counters", () => {
    it("declares both cache counter columns nullable integers on a fresh database", () => {
        const dir = mkdtempSync(join(tmpdir(), "oneflow-cache-cols-"));
        const { sqlite, db } = openDb(join(dir, "test.db"));
        migrate(db, { migrationsFolder: MIGRATIONS_DIR });

        const byName = new Map(
            tableInfo(sqlite, "tasks").map((c) => [c.name, c]),
        );

        for (const col of CACHE_COLUMNS) {
            expect(byName.has(col), `missing column ${col}`).toBe(true);
            // notnull=0 → nullable. NULL must stay distinguishable from a
            // measured 0 (older engine, cache off, reuse="off").
            expect(byName.get(col)?.notnull).toBe(0);
            expect(byName.get(col)?.type.toLowerCase()).toBe("integer");
        }

        sqlite.close();
    });
});
