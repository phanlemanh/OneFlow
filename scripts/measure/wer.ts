/**
 * Measure Whisper's Vietnamese accuracy (plan item 0.3).
 *
 *   pnpm tsx scripts/measure/wer.ts <dir> [--json]
 *
 * `<dir>` holds `<name>.ref.txt` (human transcript) and `<name>.hyp.txt`
 * (whatever the model produced). Producing the hypotheses is a separate step —
 * this scores them.
 *
 * Exits non-zero when a reference has no hypothesis, so an incomplete corpus
 * can never be reported as a passing average over the clips that happened to
 * be there.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { type ClipInput, scoreCorpus } from "../../src/lib/measure/wer";

const REF_SUFFIX = ".ref.txt";
const HYP_SUFFIX = ".hyp.txt";

function readClips(dir: string): ClipInput[] {
    const names = readdirSync(dir)
        .filter((f) => f.endsWith(REF_SUFFIX))
        .map((f) => f.slice(0, -REF_SUFFIX.length))
        .sort();

    if (names.length === 0) {
        throw new Error(`No *${REF_SUFFIX} files found in ${dir}`);
    }

    return names.map((name) => {
        let hyp: string | null = null;
        try {
            hyp = readFileSync(join(dir, `${name}${HYP_SUFFIX}`), "utf8");
        } catch {
            hyp = null;
        }
        return {
            name,
            ref: readFileSync(join(dir, `${name}${REF_SUFFIX}`), "utf8"),
            hyp,
        };
    });
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function main(): void {
    const args = process.argv.slice(2);
    const asJson = args.includes("--json");
    const dir = args.find((a) => !a.startsWith("--"));

    if (!dir) {
        console.error(
            "usage: pnpm tsx scripts/measure/wer.ts <dir> [--json]\n" +
                `  <dir> contains <name>${REF_SUFFIX} and <name>${HYP_SUFFIX} pairs`,
        );
        process.exit(2);
    }

    const report = scoreCorpus(readClips(dir));

    if (asJson) {
        console.log(JSON.stringify(report, null, 2));
    } else {
        console.log(`WER over ${report.perClip.length} clip(s) in ${dir}\n`);
        console.log("clip                      WER      sub  del  ins  digit");
        console.log("------------------------------------------------------");
        for (const clip of report.perClip) {
            console.log(
                `${clip.name.padEnd(24)}  ${pct(clip.wer).padStart(6)}  ` +
                    `${String(clip.substitutions).padStart(3)}  ` +
                    `${String(clip.deletions).padStart(3)}  ` +
                    `${String(clip.insertions).padStart(3)}  ` +
                    `${String(clip.digitTokenErrors).padStart(5)}`,
            );
        }
        const a = report.aggregate;
        console.log("------------------------------------------------------");
        console.log(
            `${"CORPUS".padEnd(24)}  ${pct(a.wer).padStart(6)}  ` +
                `${String(a.substitutions).padStart(3)}  ` +
                `${String(a.deletions).padStart(3)}  ` +
                `${String(a.insertions).padStart(3)}  ` +
                `${String(a.digitTokenErrors).padStart(5)}`,
        );
        console.log(
            `\n${a.refWords} reference words. "digit" counts edits where either ` +
                "side's token contains a digit —\nnumbers are never converted " +
                "automatically, so a price read aloud shows up here for a human to judge.",
        );
    }

    if (report.missing.length > 0) {
        console.error(
            `\nMissing ${HYP_SUFFIX} for: ${report.missing.join(", ")}\n` +
                "Refusing to report an average over an incomplete corpus.",
        );
        process.exit(1);
    }
}

main();
