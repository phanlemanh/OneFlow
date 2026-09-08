/**
 * Pure rules for the Director event ledger.
 *
 * Kept free of `server-only` and of any database import so the invariants that
 * matter — which outcomes are legal, and that a run may be patched exactly
 * once — are testable without a database. The storage half lives in
 * `director-events.server.ts`.
 */

/** Written by the server before the outcome can be known. */
export const GENERATED = "generated" as const;

/** Outcomes a client may patch a generated run with, exactly once. */
export const OUTCOME_KINDS = [
    "staged",
    "accepted",
    "replaced",
    "discarded",
] as const;

export type OutcomeKind = (typeof OUTCOME_KINDS)[number];
export type EventKind = typeof GENERATED | OutcomeKind | "failed";

export function isOutcomeKind(value: unknown): value is OutcomeKind {
    return (
        typeof value === "string" &&
        (OUTCOME_KINDS as readonly string[]).includes(value)
    );
}

export type PatchRejection =
    | "UNKNOWN_RUN"
    | "ALREADY_PATCHED"
    | "INVALID_OUTCOME";

export type PatchDecision =
    | { allowed: true; kind: OutcomeKind }
    | { allowed: false; reason: PatchRejection };

/**
 * The state machine is one-way and single-shot: `generated` is the only state
 * a patch may leave, and a run may leave it once.
 *
 * This is not bookkeeping tidiness. `POST /api/director/feedback` is an
 * unauthenticated write into the pool that later personalisation reads from;
 * without the single-shot rule any caller could flip a run to `accepted`
 * repeatedly, or walk a run through every outcome, and the resulting counts
 * would be attacker-chosen rather than measured. The gate against a *bad plan*
 * entering the pool is the user's explicit accept plus the compile check; this
 * is the gate against a *replayed* one.
 */
export function decidePatch(
    currentKind: EventKind | undefined,
    requestedOutcome: unknown,
): PatchDecision {
    if (currentKind === undefined)
        return { allowed: false, reason: "UNKNOWN_RUN" };
    if (!isOutcomeKind(requestedOutcome)) {
        return { allowed: false, reason: "INVALID_OUTCOME" };
    }
    if (currentKind !== GENERATED) {
        return { allowed: false, reason: "ALREADY_PATCHED" };
    }
    return { allowed: true, kind: requestedOutcome };
}
