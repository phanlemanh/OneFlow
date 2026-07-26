/**
 * Per-node cost attribution from the tasks ledger (plan item 0.3).
 *
 *   pnpm tsx scripts/measure/cogs.ts [--db <path>] [--rates <file>] [--json]
 *
 * Reads the `duration_ms` column that item 0.2 added and groups measured plugin
 * time by plugin and slot — the key needed to split a Modal invoice across
 * nodes.
 *
 * Without `--rates` it reports no cost figure at all. Rates come from a real
 * invoice, supplied as `{"<pluginId>": <usdPerSecond>}`; the tool applies what
 * it is given and invents nothing, for the same reason the `cost_usd` column
 * is left NULL.
 */

import { readFileSync } from "node:fs";

import Database from "better-sqlite3";

import {
    aggregateCogs,
    type RateTable,
    type TaskRow,
} from "../../src/lib/measure/cogs";

const DEFAULT_DB = "./data/tongflow.db";
const DEFAULT_STATUSES = ["completed", "failed"];

function flag(args: string[], name: string): string | undefined {
    const i = args.indexOf(name);
    return i === -1 ? undefined : args[i + 1];
}

function assertMeteringColumns(db: Database.Database): void {
    const columns = db.prepare("PRAGMA table_info(tasks)").all() as {
        name: string;
    }[];
    if (columns.length === 0) {
        throw new Error(
            "No `tasks` table — is this a OneFlow workspace database?",
        );
    }
    if (!columns.some((c) => c.name === "duration_ms")) {
        throw new Error(
            "This database predates task metering (no `duration_ms` column).\n" +
                "Open it once with the app to apply migrations, then re-run.",
        );
    }
}

const ms = (n: number) => `${(n / 1000).toFixed(1)}s`;

function main(): void {
    const args = process.argv.slice(2);
    const dbPath = flag(args, "--db") ?? DEFAULT_DB;
    const ratesPath = flag(args, "--rates");
    const statuses = (flag(args, "--status") ?? DEFAULT_STATUSES.join(","))
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    let db: Database.Database;
    try {
        db = new Database(dbPath, { readonly: true, fileMustExist: true });
    } catch {
        console.error(`Cannot open database: ${dbPath}`);
        process.exit(1);
        return;
    }

    try {
        assertMeteringColumns(db);
    } catch (e) {
        console.error(e instanceof Error ? e.message : String(e));
        process.exit(1);
        return;
    }

    const placeholders = statuses.map(() => "?").join(",");
    const rows = db
        .prepare(
            `SELECT plugin_id AS pluginId, feature, duration_ms AS durationMs
             FROM tasks WHERE status IN (${placeholders})`,
        )
        .all(...statuses) as TaskRow[];

    const rates = ratesPath
        ? (JSON.parse(readFileSync(ratesPath, "utf8")) as RateTable)
        : undefined;
    const groups = aggregateCogs(rows, rates);

    if (args.includes("--json")) {
        console.log(JSON.stringify({ dbPath, statuses, groups }, null, 2));
        return;
    }

    console.log(
        `Plugin time from ${dbPath} (status: ${statuses.join(", ")}) — ${rows.length} task(s)\n`,
    );
    const costCol = rates ? "     cost" : "";
    console.log(
        `plugin / slot                              n  meas  unmeas    total   median      p95${costCol}`,
    );
    console.log("-".repeat(rates ? 100 : 91));
    for (const g of groups) {
        const label = `${g.pluginId} / ${g.feature}`;
        const cost =
            g.costUsd === undefined
                ? rates
                    ? "        -"
                    : ""
                : `  $${g.costUsd.toFixed(2)}`.padStart(9);
        console.log(
            `${label.slice(0, 40).padEnd(40)}  ${String(g.count).padStart(3)}  ` +
                `${String(g.measured).padStart(4)}  ${String(g.unmeasured).padStart(6)}  ` +
                `${ms(g.totalDurationMs).padStart(7)}  ` +
                `${(g.medianMs === null ? "-" : ms(g.medianMs)).padStart(7)}  ` +
                `${(g.p95Ms === null ? "-" : ms(g.p95Ms)).padStart(7)}${cost}`,
        );
    }

    const unmeasured = groups.reduce((a, g) => a + g.unmeasured, 0);
    if (unmeasured > 0) {
        console.log(
            `\n${unmeasured} task(s) have no measured duration — history from before metering, or ` +
                "aborted runs.\nThey are counted but kept out of the statistics rather than averaged as zero.",
        );
    }
    if (!rates) {
        console.log(
            "\nNo --rates supplied, so no cost is reported. Pass a rate table derived from a real " +
                'invoice:\n  {"<pluginId>": <usdPerSecond>}',
        );
    }
}

main();
