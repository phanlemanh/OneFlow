/**
 * Blind rating harness for Vietnamese TTS candidates (plan item 0.3).
 *
 *   pnpm tsx scripts/measure/mos.ts blind <samplesDir> <outDir>
 *   pnpm tsx scripts/measure/mos.ts aggregate <ratings.csv> <key.json>
 *
 * `<samplesDir>` is laid out `<system>/<scriptId>.<ext>`. Generating the audio
 * needs the vendors' API keys and is the operator's step; this handles the part
 * that is easy to get wrong — hiding which system made which sample, and
 * reporting the spread rather than a bare mean.
 *
 * `blind` writes the rater's package into `<outDir>` and the answer key beside
 * it as `<outDir>-key.json`. The separation is physical on purpose: handing
 * over the directory cannot leak the key.
 */

import {
    copyFileSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from "node:fs";
import { join } from "node:path";

import {
    aggregateMos,
    type KeyEntry,
    makeBlindSheet,
    type Rating,
    type Sample,
} from "../../src/lib/measure/mos";

function collectSamples(root: string): Sample[] {
    const samples: Sample[] = [];
    for (const system of readdirSync(root).sort()) {
        const dir = join(root, system);
        if (!statSync(dir).isDirectory()) continue;
        for (const file of readdirSync(dir).sort()) {
            const dot = file.lastIndexOf(".");
            samples.push({
                system,
                scriptId: dot > 0 ? file.slice(0, dot) : file,
                file: join(dir, file),
            });
        }
    }
    if (samples.length === 0) {
        throw new Error(
            `No samples found under ${root}/<system>/<scriptId>.<ext>`,
        );
    }
    return samples;
}

function runBlind(samplesDir: string, outDir: string): void {
    const { entries, key } = makeBlindSheet(collectSamples(samplesDir));

    mkdirSync(outDir, { recursive: true });
    for (const entry of entries) {
        copyFileSync(key[entry.id].sourceFile, join(outDir, entry.blindFile));
    }

    // The rater fills the score column. Nothing here names a system.
    const sheet = [
        "id,file,score",
        ...entries.map((e) => `${e.id},${e.blindFile},`),
    ];
    writeFileSync(join(outDir, "sheet.csv"), `${sheet.join("\n")}\n`, "utf8");

    const keyPath = `${outDir}-key.json`;
    writeFileSync(keyPath, `${JSON.stringify(key, null, 2)}\n`, "utf8");

    console.log(
        `Wrote ${entries.length} blinded samples + sheet.csv to ${outDir}`,
    );
    console.log(`Answer key: ${keyPath}  (keep this away from the rater)`);
}

function parseRatings(csvPath: string): Rating[] {
    const lines = readFileSync(csvPath, "utf8")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const rows = lines[0].toLowerCase().startsWith("id,")
        ? lines.slice(1)
        : lines;
    return rows.map((line) => {
        const cells = line.split(",");
        const id = cells[0].trim();
        const raw = cells[cells.length - 1].trim();
        if (raw === "") {
            throw new Error(
                `Rating for "${id}" is blank — the sheet is incomplete.`,
            );
        }
        return { id, score: Number(raw) };
    });
}

function runAggregate(ratingsPath: string, keyPath: string): void {
    const key = JSON.parse(readFileSync(keyPath, "utf8")) as Record<
        string,
        KeyEntry
    >;
    const stats = aggregateMos(parseRatings(ratingsPath), key);

    console.log("system                    n     MOS     sd      95% CI");
    console.log("-----------------------------------------------------");
    for (const s of stats) {
        const sd = s.sd === null ? "  n/a" : s.sd.toFixed(2).padStart(5);
        const ci =
            s.ci95 === null ? "     n/a" : `±${s.ci95.toFixed(2)}`.padStart(8);
        console.log(
            `${s.system.padEnd(24)} ${String(s.n).padStart(2)}  ` +
                `${s.mean.toFixed(2).padStart(5)}  ${sd}  ${ci}`,
        );
    }
    console.log(
        "\nAt this sample size the interval is wide by construction — read n before the mean.",
    );
}

function main(): void {
    const [command, ...rest] = process.argv.slice(2);

    if (command === "blind" && rest.length === 2) {
        runBlind(rest[0], rest[1]);
        return;
    }
    if (command === "aggregate" && rest.length === 2) {
        runAggregate(rest[0], rest[1]);
        return;
    }

    console.error(
        "usage:\n" +
            "  pnpm tsx scripts/measure/mos.ts blind <samplesDir> <outDir>\n" +
            "  pnpm tsx scripts/measure/mos.ts aggregate <ratings.csv> <key.json>",
    );
    process.exit(2);
}

main();
