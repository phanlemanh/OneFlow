import type { MediaCard } from "@/lib/media-library/types";

/**
 * What the node is showing right now.
 *
 * Kept in its own module — free of React and of the network — so the rule that
 * matters most here can be measured directly: a thin shelf ("the library has
 * nothing that fits") must never be worded like a failure ("the service is
 * broken"). Those are different facts and they send the user to different
 * actions.
 */
export type Outcome =
    | { kind: "idle" }
    | { kind: "searching" }
    /**
     * Carries the result set it was launched from, so the list stays on screen
     * with the chosen card disabled instead of vanishing mid-import — which is
     * both what the approved prototype shows and the only way `busyId` on the
     * card list is reachable in production.
     */
    | {
          kind: "importing";
          cardId: string;
          cards: MediaCard[];
          candidates: number;
          warnings: string[];
      }
    | {
          kind: "results";
          cards: MediaCard[];
          candidates: number;
          warnings: string[];
      }
    | { kind: "failure"; code: string; message: string }
    | { kind: "missing-config"; missing: string[]; message: string };

export type OutcomeMessageKey =
    | "idle"
    | "searching"
    | "importing"
    | "results"
    | "thinShelf"
    | "error"
    | "missingConfig";

export function outcomeMessageKey(outcome: Outcome): OutcomeMessageKey {
    switch (outcome.kind) {
        case "idle":
            return "idle";
        case "searching":
            return "searching";
        case "importing":
            return "importing";
        case "missing-config":
            return "missingConfig";
        case "failure":
            return "error";
        case "results":
            return outcome.cards.length === 0 ? "thinShelf" : "results";
    }
}

/**
 * The library answers 200 with `warnings: ["embedding_unavailable"]` when the
 * intent embedding failed: the rows came back UNRANKED, ordered by specificity
 * alone. A 200 with that warning is not the same quality of answer as a clean
 * 200, and the node has to say so.
 */
/**
 * What a failing response means, read from the STATUS when the body cannot be
 * parsed.
 *
 * The routes answer JSON, but anything in front of them — a dev-server error
 * page, a proxy — answers HTML. Parsing first and treating a parse failure as
 * "could not reach the library" turned a full disk into a network problem and
 * sent the user to check a key that was fine.
 */
const STATUS_TO_CODE: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "AUTH_REJECTED",
    403: "MISSING_SCOPE",
    404: "NOT_FOUND",
    409: "VERSION_MISMATCH",
    500: "LOCAL_FAILURE",
    501: "NOT_IMPLEMENTED",
    502: "UPSTREAM_ERROR",
};

export function codeForStatus(status: number): string {
    return STATUS_TO_CODE[status] ?? "UPSTREAM_ERROR";
}

/** The failure codes the boundary can produce, as i18n sub-keys. */
const FAILURE_KEYS = new Set([
    "AUTH_REJECTED",
    "MISSING_SCOPE",
    "BAD_REQUEST",
    "NOT_FOUND",
    "NOT_IMPLEMENTED",
    "VERSION_MISMATCH",
    "BAD_RESPONSE",
    "NETWORK_ERROR",
    "UPSTREAM_ERROR",
    "LOCAL_FAILURE",
]);

/**
 * Which translated sentence a failure code maps to.
 *
 * The server's own message is Vietnamese and belongs in logs; rendering it in
 * the node would hand en/ja/ko/zh users Vietnamese inside an otherwise
 * translated surface. The code is the machine-readable half and is what the UI
 * keys off. An unrecognised code falls back to the generic line rather than
 * inventing one.
 */
export function failureMessageKey(code: string): string {
    return FAILURE_KEYS.has(code) ? `failure.${code}` : "error";
}

export function isUnranked(outcome: Outcome): boolean {
    return (
        outcome.kind === "results" &&
        outcome.warnings.includes("embedding_unavailable")
    );
}
