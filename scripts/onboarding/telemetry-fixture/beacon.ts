/**
 * TEETH FIXTURE for check-no-telemetry-sinks.sh — never imported by the app.
 *
 * Three real transport shapes the scan must go red on. If the guard stays
 * green against this directory it is not looking at anything, and its green
 * on the real tree proves nothing (measure-birth rule: a measure is not done
 * until it has been seen red on a broken object).
 */

export function leakByBeacon(events: unknown): void {
    navigator.sendBeacon("https://example.com/t", JSON.stringify(events));
}

export async function leakByFetch(step: string): Promise<void> {
    await fetch("https://collect.example.com/funnel", {
        method: "POST",
        body: JSON.stringify({ step }),
    });
}
