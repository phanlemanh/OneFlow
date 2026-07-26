/**
 * Word Error Rate for Vietnamese transcripts.
 *
 * The measuring stick for Gate G0's "can Whisper handle Vietnamese livestream
 * audio" question, so its normalisation choices matter more than its code:
 *
 * - Diacritics are PRESERVED. `khong` is not `không`. Stripping them would make
 *   the scorer blind to the exact failure the product promises to avoid.
 * - Unicode is folded to NFC first, because Vietnamese can be written
 *   precomposed (`ế`) or decomposed (`e` + combining marks). Without this the
 *   report shows errors a human comparing the two files cannot see.
 * - Case and punctuation are dropped — separate quality axes from word accuracy.
 * - Numbers are NOT converted. `120000` and `một trăm hai mươi nghìn` score as
 *   errors, and those errors are also reported separately so a human can judge
 *   them. A half-built converter would silently certify a mis-transcribed price.
 */

/** Errors are attributed to this many categories of edit. */
export interface WerCounts {
    substitutions: number;
    deletions: number;
    insertions: number;
    /** Edits where either side's token contains a digit — see the note above. */
    digitTokenErrors: number;
}

export interface WerResult extends WerCounts {
    /** (S + D + I) / reference word count. */
    wer: number;
    refWords: number;
}

export interface ClipInput {
    name: string;
    ref: string;
    /** null when the hypothesis file is absent — reported, never averaged away. */
    hyp: string | null;
}

export interface CorpusReport {
    perClip: (WerResult & { name: string })[];
    aggregate: WerResult;
    /** Clip names whose hypothesis was missing. Non-empty means the run failed. */
    missing: string[];
}

const PUNCTUATION = /[\p{P}\p{S}]/gu;
const HAS_DIGIT = /\p{Nd}/u;

/**
 * Split into comparable words. Everything this does is deliberate — see the
 * module docstring for why each step is or is not applied.
 */
export function tokenize(text: string): string[] {
    return text
        .normalize("NFC")
        .toLowerCase()
        .replace(PUNCTUATION, "")
        .split(/\s+/)
        .filter((t) => t.length > 0);
}

type Op = "match" | "sub" | "del" | "ins";

/** Levenshtein over words, with a backtrace so each edit can be attributed. */
function align(
    ref: string[],
    hyp: string[],
): { op: Op; r?: string; h?: string }[] {
    const n = ref.length;
    const m = hyp.length;
    const d: number[][] = Array.from({ length: n + 1 }, () =>
        new Array<number>(m + 1).fill(0),
    );
    for (let i = 0; i <= n; i++) d[i][0] = i;
    for (let j = 0; j <= m; j++) d[0][j] = j;

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
            d[i][j] = Math.min(
                d[i - 1][j] + 1, // deletion
                d[i][j - 1] + 1, // insertion
                d[i - 1][j - 1] + cost,
            );
        }
    }

    const ops: { op: Op; r?: string; h?: string }[] = [];
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
        if (i > 0 && j > 0) {
            const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
            if (d[i][j] === d[i - 1][j - 1] + cost) {
                ops.push({
                    op: cost === 0 ? "match" : "sub",
                    r: ref[i - 1],
                    h: hyp[j - 1],
                });
                i--;
                j--;
                continue;
            }
        }
        if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
            ops.push({ op: "del", r: ref[i - 1] });
            i--;
            continue;
        }
        ops.push({ op: "ins", h: hyp[j - 1] });
        j--;
    }
    return ops.reverse();
}

export function scoreTranscript(ref: string, hyp: string): WerResult {
    const refTokens = tokenize(ref);
    const hypTokens = tokenize(hyp);

    if (refTokens.length === 0) {
        throw new Error(
            "Reference transcript is empty — WER is undefined with no reference words.",
        );
    }

    const counts: WerCounts = {
        substitutions: 0,
        deletions: 0,
        insertions: 0,
        digitTokenErrors: 0,
    };

    for (const step of align(refTokens, hypTokens)) {
        if (step.op === "match") continue;
        if (step.op === "sub") counts.substitutions++;
        else if (step.op === "del") counts.deletions++;
        else counts.insertions++;

        const touchesDigit =
            (step.r != null && HAS_DIGIT.test(step.r)) ||
            (step.h != null && HAS_DIGIT.test(step.h));
        if (touchesDigit) counts.digitTokenErrors++;
    }

    const errors = counts.substitutions + counts.deletions + counts.insertions;
    return {
        ...counts,
        refWords: refTokens.length,
        wer: errors / refTokens.length,
    };
}

/**
 * Score a whole corpus. The aggregate is corpus-level — total errors over total
 * reference words — not the mean of per-clip rates, so a long clip counts for
 * what it is.
 */
export function scoreCorpus(clips: ClipInput[]): CorpusReport {
    const perClip: (WerResult & { name: string })[] = [];
    const missing: string[] = [];

    for (const clip of clips) {
        if (clip.hyp === null) {
            missing.push(clip.name);
            continue;
        }
        perClip.push({
            name: clip.name,
            ...scoreTranscript(clip.ref, clip.hyp),
        });
    }

    const sum = (pick: (r: WerResult) => number) =>
        perClip.reduce((acc, r) => acc + pick(r), 0);

    const refWords = sum((r) => r.refWords);
    const substitutions = sum((r) => r.substitutions);
    const deletions = sum((r) => r.deletions);
    const insertions = sum((r) => r.insertions);
    const digitTokenErrors = sum((r) => r.digitTokenErrors);
    const errors = substitutions + deletions + insertions;

    return {
        perClip,
        missing,
        aggregate: {
            substitutions,
            deletions,
            insertions,
            digitTokenErrors,
            refWords,
            wer: refWords === 0 ? 0 : errors / refWords,
        },
    };
}
