/**
 * End-to-end check of the blind rating commands (eval E12).
 *
 * Builds a throwaway sample tree, blinds it, fills the sheet, aggregates, and
 * asserts the properties that make the result evidence rather than opinion —
 * chiefly that nothing handed to the rater names a system.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SYSTEMS = ["elevenlabs", "vixtts"];
const SCRIPTS = ["s1", "s2", "s3"];

function run(args: string[]): string {
    return execFileSync("pnpm", ["tsx", "scripts/measure/mos.ts", ...args], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "inherit"],
    });
}

function assert(condition: boolean, message: string): void {
    if (!condition) {
        console.error(`selftest-mos: ${message}`);
        process.exit(1);
    }
}

const root = mkdtempSync(join(tmpdir(), "oneflow-mos-"));
const samples = join(root, "samples");
for (const system of SYSTEMS) {
    mkdirSync(join(samples, system), { recursive: true });
    for (const script of SCRIPTS) {
        // Stand-in for audio: the harness never decodes it.
        writeFileSync(
            join(samples, system, `${script}.mp3`),
            `${system}-${script}`,
        );
    }
}

const outDir = join(root, "blind");
run(["blind", samples, outDir]);

const sheet = readFileSync(join(outDir, "sheet.csv"), "utf8");
for (const system of SYSTEMS) {
    assert(
        !sheet.includes(system),
        `sheet.csv leaks the system name "${system}"`,
    );
}
assert(
    sheet.split("\n").filter(Boolean).length ===
        SYSTEMS.length * SCRIPTS.length + 1,
    "sheet.csv does not have one row per sample",
);

const key = JSON.parse(readFileSync(`${outDir}-key.json`, "utf8")) as Record<
    string,
    { system: string }
>;
assert(
    Object.keys(key).length === SYSTEMS.length * SCRIPTS.length,
    "key is incomplete",
);

// Fill the sheet: give one system consistently higher scores.
const ratings = Object.entries(key).map(
    ([id, entry]) => `${id},${entry.system === SYSTEMS[0] ? 5 : 3}`,
);
const ratingsPath = join(root, "ratings.csv");
writeFileSync(ratingsPath, `id,score\n${ratings.join("\n")}\n`, "utf8");

const report = run(["aggregate", ratingsPath, `${outDir}-key.json`]);
assert(
    report.includes(SYSTEMS[0]) && report.includes(SYSTEMS[1]),
    "aggregate report is missing a system",
);
assert(
    report.trim().split("\n")[2].includes(SYSTEMS[0]),
    "aggregate did not rank the higher-scoring system first",
);

console.log(report);
console.log("selftest-mos: ok");
