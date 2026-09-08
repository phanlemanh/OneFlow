import type { OutcomeKind } from "@/lib/director/events/director-events";

/**
 * Tell the server what the user did with a staged plan.
 *
 * Fire-and-forget on purpose. The ledger exists to measure the product, and a
 * measurement must never be able to degrade the thing it measures: a failed
 * report is a gap in the data, whereas an awaited request would put network
 * latency between the user's click and the canvas updating, and a thrown one
 * would turn "you accepted a plan" into an error toast.
 *
 * The server already wrote the `generated` row before responding, so a lost
 * report leaves an orphan — countable, and the reason the contract sets an
 * orphan-rate threshold rather than assuming this always lands.
 */
export function reportOutcome(
    runId: string | undefined,
    outcome: OutcomeKind,
    // Injected so tests do not need a DOM fetch, and so a caller can swap it.
    fetchImpl: typeof fetch = globalThis.fetch,
): void {
    // A response from before this package has no runId. Reporting without one
    // would be a write the server must reject; skip it at the source.
    if (!runId) return;

    void fetchImpl("/api/director/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ runId, outcome }),
        // The user may navigate away immediately after clicking; keepalive
        // lets the report survive the unload that a plain fetch would lose.
        keepalive: true,
    }).catch(() => {
        // Deliberately silent. See the doc comment: a measurement gap must not
        // become a user-visible failure.
    });
}
