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
    | { kind: "importing"; cardId: string }
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
export function isUnranked(outcome: Outcome): boolean {
    return (
        outcome.kind === "results" &&
        outcome.warnings.includes("embedding_unavailable")
    );
}
