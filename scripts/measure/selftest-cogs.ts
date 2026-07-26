/**
 * End-to-end check of the COGS command (eval E16).
 *
 * Builds two throwaway databases — one migrated, one deliberately stuck at the
 * pre-metering schema — and asserts the command reports against the first and
 * refuses the second with a readable message instead of a raw SQL error.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const MIGRATIONS = join(process.cwd(), "drizzle");

function runCogs(args: string[]): { stdout: string; code: number } {
    try {
        const stdout = execFileSync(
            "pnpm",
            ["tsx", "scripts/measure/cogs.ts", ...args],
            { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
        );
        return { stdout, code: 0 };
    } catch (e) {
        const err = e as { status?: number; stdout?: string; stderr?: string };
        return {
            stdout: `${err.stdout ?? ""}${err.stderr ?? ""}`,
            code: err.status ?? 1,
        };
    }
}

function assert(condition: boolean, message: string): void {
    if (!condition) {
        console.error(`selftest-cogs: ${message}`);
        process.exit(1);
    }
}

const root = mkdtempSync(join(tmpdir(), "oneflow-cogs-"));

// --- a migrated database with a mix of measured and unmeasured rows ---------
const goodPath = join(root, "good.db");
const good = new Database(goodPath);
migrate(drizzle(good), { migrationsFolder: MIGRATIONS });

const insert = good.prepare(
    "INSERT INTO tasks (id, node_id, feature, plugin_id, prompt, status, progress, duration_ms, created_at, updated_at)" +
        " VALUES (?, ?, ?, ?, '{}', ?, 100, ?, 1700000000, 1700000000)",
);
insert.run("t1", "n1", "image-gen", "modal-z-image", "completed", 4000);
insert.run("t2", "n2", "image-gen", "modal-z-image", "completed", 6000);
insert.run("t3", "n3", "image-gen", "modal-z-image", "failed", 1000);
// Unmeasured: history from before metering.
insert.run("t4", "n4", "image-gen", "modal-z-image", "completed", null);
insert.run("t5", "n5", "gen-text", "api-openrouter", "completed", 500);
good.close();

const plain = runCogs(["--db", goodPath]);
assert(
    plain.code === 0,
    `expected success against a migrated database, got ${plain.code}`,
);
assert(
    plain.stdout.includes("modal-z-image"),
    "report is missing the heaviest plugin",
);
assert(
    !plain.stdout.includes("$"),
    "reported a cost figure without a rate table — the tool must never invent a price",
);
assert(
    plain.stdout.includes("no measured duration"),
    "did not surface the unmeasured row",
);

// --- the same database, now with rates supplied ----------------------------
const ratesPath = join(root, "rates.json");
writeFileSync(ratesPath, JSON.stringify({ "modal-z-image": 0.001 }), "utf8");
const priced = runCogs(["--db", goodPath, "--rates", ratesPath]);
assert(priced.code === 0, "rated run failed");
assert(priced.stdout.includes("$"), "rated run reported no cost");

// --- a database that predates the metering columns -------------------------
const oldPath = join(root, "old.db");
const old = new Database(oldPath);
old.exec(
    "CREATE TABLE tasks (id text PRIMARY KEY, node_id text, feature text, plugin_id text," +
        " prompt text, status text, progress integer)",
);
old.close();

const stale = runCogs(["--db", oldPath]);
assert(stale.code !== 0, "a pre-metering database should fail the run");
assert(
    stale.stdout.includes("predates task metering"),
    "pre-metering failure was not explained in plain language",
);
assert(
    !/SQLITE_ERROR|no such column/i.test(stale.stdout),
    "leaked a raw SQL error instead of a readable message",
);

console.log(plain.stdout);
console.log("selftest-cogs: ok");
