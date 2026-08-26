import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * AC-6 — the ledger's shape must be right from the FIRST migration.
 *
 * Asserted against the generated SQL, not against the drizzle table object: a
 * schema edit that never produced a migration would satisfy an object-based
 * check while leaving every existing database without the column. The columns
 * are listed LITERALLY here for the same reason — deriving them from the
 * schema under test makes the test self-satisfying.
 */
const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

function migrationSql(): string {
    return readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith(".sql"))
        .sort()
        .map((f) => readFileSync(path.join(MIGRATIONS_DIR, f), "utf8"))
        .join("\n");
}

const REQUIRED_COLUMNS = [
    "run_id",
    "kind",
    "ts",
    "prompt_text",
    "plan_json",
    "dsl_version",
    "canvas_was_empty",
    "attempts",
    "error_code",
    "used_memory",
    "memory_block_digest",
    "estimate_ms",
    "workflow_id",
] as const;

/** Derived measurements. NULL must stay distinguishable from a measured 0 —
 *  the same discipline `tasks.cost_usd` is held to. */
const MUST_BE_NULLABLE = [
    "plan_json",
    "canvas_was_empty",
    "attempts",
    "error_code",
    "used_memory",
    "memory_block_digest",
    "estimate_ms",
    "workflow_id",
] as const;

describe("director_events migration (AC-6)", () => {
    const sql = migrationSql();
    const createStmt = sql.slice(sql.indexOf("CREATE TABLE `director_events`"));
    const body = createStmt.slice(0, createStmt.indexOf(");"));

    it("creates the table", () => {
        expect(sql).toContain("CREATE TABLE `director_events`");
    });

    it.each(REQUIRED_COLUMNS)("has column %s", (col) => {
        expect(body).toContain(`\`${col}\``);
    });

    it.each(MUST_BE_NULLABLE)("leaves %s nullable", (col) => {
        const line = body
            .split("\n")
            .find((l) => l.includes(`\`${col}\``));
        expect(line, `column ${col} not found`).toBeDefined();
        expect(line).not.toContain("NOT NULL");
    });

    it("adds workflows.director_run_id by ALTER, never by recreating the table", () => {
        // A DROP/CREATE round-trip would take existing users' workflows with it.
        expect(sql).toContain("ALTER TABLE `workflows` ADD `director_run_id`");
        expect(sql).not.toContain("DROP TABLE `workflows`");
    });

    it("indexes run_id — the ledger is read by run, once per outcome patch", () => {
        expect(sql).toContain("`director_events_run_id_idx`");
    });
});
