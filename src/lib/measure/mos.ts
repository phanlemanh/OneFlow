/**
 * Blind rating harness for Vietnamese TTS candidates.
 *
 * A rating that shows the rater which system produced a sample is not evidence,
 * so blinding is a property of the data structure here, not a convention the
 * operator is trusted to follow: the sheet carries opaque ids and shuffled
 * order, and the id→system key is a separate artefact the sheet never contains.
 *
 * Aggregation refuses bad input rather than dropping it. A mean quietly
 * computed over the ratings that happened to parse is the failure mode this
 * exists to prevent.
 */

export interface Sample {
    system: string;
    scriptId: string;
    /** Path to the audio, as given by the operator. Never enters the sheet. */
    file: string;
}

export interface SheetEntry {
    id: string;
    /** Name to store the audio under. Carries no system information. */
    blindFile: string;
}

export interface KeyEntry {
    system: string;
    scriptId: string;
    sourceFile: string;
}

export interface BlindSheet {
    entries: SheetEntry[];
    key: Record<string, KeyEntry>;
}

export interface Rating {
    id: string;
    /** Mean opinion score, 1–5. */
    score: number;
}

export interface SystemStats {
    system: string;
    n: number;
    mean: number;
    /** Sample standard deviation; null when n < 2, where it is undefined. */
    sd: number | null;
    /** Half-width of the 95% interval; null when sd is. */
    ci95: number | null;
}

function extension(file: string): string {
    const base = file.slice(file.lastIndexOf("/") + 1);
    const dot = base.lastIndexOf(".");
    return dot <= 0 ? "" : base.slice(dot);
}

/** Fisher-Yates. `rng` is injected so tests get a deterministic shuffle. */
function shuffled<T>(items: T[], rng: () => number): T[] {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

/**
 * Build a blind sheet plus its key. Ids are assigned AFTER shuffling, so the id
 * order reveals nothing about input order, and the blind filename is derived
 * from the id alone — an operator copying `sourceFile` to `blindFile` cannot
 * leak the system through a path.
 */
export function makeBlindSheet(
    samples: Sample[],
    rng: () => number = Math.random,
): BlindSheet {
    const entries: SheetEntry[] = [];
    const key: Record<string, KeyEntry> = {};

    shuffled(samples, rng).forEach((sample, index) => {
        const id = `S${String(index + 1).padStart(3, "0")}`;
        entries.push({ id, blindFile: `${id}${extension(sample.file)}` });
        key[id] = {
            system: sample.system,
            scriptId: sample.scriptId,
            sourceFile: sample.file,
        };
    });

    return { entries, key };
}

const MIN_SCORE = 1;
const MAX_SCORE = 5;

/**
 * Mean opinion score per system, with the spread. A mean without n and a
 * confidence interval invites deciding on noise — especially at the 5-script
 * scale this harness is built for.
 */
export function aggregateMos(
    ratings: Rating[],
    key: Record<string, KeyEntry>,
): SystemStats[] {
    const bySystem = new Map<string, number[]>();

    for (const rating of ratings) {
        const entry = key[rating.id];
        if (!entry) {
            throw new Error(
                `Rating references unknown id "${rating.id}" — the sheet and key do not match.`,
            );
        }
        if (
            !Number.isFinite(rating.score) ||
            rating.score < MIN_SCORE ||
            rating.score > MAX_SCORE
        ) {
            throw new Error(
                `Rating for "${rating.id}" is ${rating.score}, outside the ${MIN_SCORE}-${MAX_SCORE} MOS range.`,
            );
        }
        const scores = bySystem.get(entry.system) ?? [];
        scores.push(rating.score);
        bySystem.set(entry.system, scores);
    }

    return [...bySystem.entries()]
        .map(([system, scores]) => {
            const n = scores.length;
            const mean = scores.reduce((a, b) => a + b, 0) / n;
            if (n < 2) {
                return { system, n, mean, sd: null, ci95: null };
            }
            const variance =
                scores.reduce((acc, s) => acc + (s - mean) ** 2, 0) / (n - 1);
            const sd = Math.sqrt(variance);
            return { system, n, mean, sd, ci95: 1.96 * (sd / Math.sqrt(n)) };
        })
        .sort((a, b) => b.mean - a.mean);
}
