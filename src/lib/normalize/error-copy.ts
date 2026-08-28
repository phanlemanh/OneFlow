/**
 * The ONE place a `normalize-text-vi` refusal code becomes a sentence.
 *
 * The reader returns a stable machine code plus the tokens that stopped it; the
 * human sentence lives in `src/i18n/messages/*.json` and is rendered in the
 * viewer's locale. This mirrors what the exporter warning already does
 * (`use-export-warning-toast.ts`), and it exists because the SDK used to return
 * a Vietnamese sentence that went straight to the canvas for every locale — a
 * zh/ja/ko/en user read Vietnamese (AC-6).
 *
 * The code set is mirrored from the SDK rather than imported, because the SDK is
 * Python. A test asserts the two sets match, so a code added on one side without
 * the other is red rather than a message nobody can render.
 */

export const NORMALIZE_ERROR_CODES = [
    "EMPTY_INPUT",
    "RESIDUAL_TOKENS",
    "MONEY_UNIT_LOST",
] as const;

export type NormalizeErrorCode = (typeof NORMALIZE_ERROR_CODES)[number];

function isNormalizeErrorCode(value: unknown): value is NormalizeErrorCode {
    return (
        typeof value === "string" &&
        (NORMALIZE_ERROR_CODES as readonly string[]).includes(value)
    );
}

/**
 * The refusal carried by a slot output, or null when this failure is about
 * something else.
 *
 * Reads the OUTPUT object rather than parsing the error sentence: the sentence
 * is a log artefact and its wording is not a contract, while `code` is.
 */
export function normalizeRefusalFrom(output: unknown): {
    code: NormalizeErrorCode;
    tokens: string;
} | null {
    if (typeof output !== "object" || output === null) return null;
    const record = output as Record<string, unknown>;
    if (!isNormalizeErrorCode(record.code)) return null;

    // `residual` is a list of the exact tokens that stopped the reading. Joined
    // here, not in the catalogue, so every locale gets the same separator and no
    // translation can drop the list by omitting a placeholder.
    const residual = Array.isArray(record.residual)
        ? record.residual.filter((t): t is string => typeof t === "string")
        : [];
    return { code: record.code, tokens: residual.join(", ") };
}

/**
 * The refusal carried by a task-failure SSE payload, or null.
 *
 * There are two producers and they emit DIFFERENT shapes, which is the whole
 * reason this lives in one named function with its own test rather than inline
 * at the toast:
 *
 * - a single-node task (`runner.ts`) passes the slot output itself as `data`,
 *   so the refusal is at the TOP LEVEL;
 * - a workflow task (`engine-delegate.server.ts`) passes
 *   `{status, outputs, errors, failures}` where `outputs` is an OBJECT keyed by
 *   node id (`SSEMessageData.outputs?: Record<string, unknown>`) — not an array.
 *
 * Reading only one of the two, or treating `outputs` as a list, silently
 * disables the whole localized-refusal path: every failure falls through to the
 * SDK's Vietnamese sentence, which is the defect AC-6 exists to close.
 */
export function normalizeRefusalFromTaskData(data: unknown): {
    code: NormalizeErrorCode;
    tokens: string;
} | null {
    const direct = normalizeRefusalFrom(data);
    if (direct) return direct;

    if (typeof data !== "object" || data === null) return null;
    const outputs = (data as Record<string, unknown>).outputs;
    if (typeof outputs !== "object" || outputs === null) return null;

    for (const nodeOutput of Object.values(outputs)) {
        const found = normalizeRefusalFrom(nodeOutput);
        if (found) return found;
    }
    return null;
}
