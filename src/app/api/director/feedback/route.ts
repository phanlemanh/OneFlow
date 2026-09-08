import { type NextRequest, NextResponse } from "next/server";
import type { PatchRejection } from "@/lib/director/events/director-events";
import { patchOutcome } from "@/lib/director/events/director-events.server";

/**
 * HTTP status per rejection reason. Typed as a `Record` over the full
 * `PatchRejection` union so adding a reason without a status is a compile
 * error rather than a silent fallthrough — same discipline as the main
 * Director route's `STATUS_BY_CODE`.
 */
const STATUS_BY_REJECTION: Record<PatchRejection, number> = {
    UNKNOWN_RUN: 404,
    ALREADY_PATCHED: 409,
    INVALID_OUTCOME: 400,
};

/**
 * POST /api/director/feedback
 *
 * The client reports what the user did with a staged plan: accepted it,
 * replaced the canvas with it, or threw it away. The server already wrote the
 * `generated` row; this closes it.
 *
 * One-way and single-shot by design — see `decidePatch`. This endpoint is an
 * unauthenticated write into the pool that later personalisation reads from,
 * so "a run may leave `generated` once" is the rule that keeps the resulting
 * counts measured rather than attacker-chosen.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {
                error: {
                    code: "INVALID_OUTCOME",
                    message: "Request body must be valid JSON",
                },
            },
            { status: 400 },
        );
    }

    const runId = (body as { runId?: unknown } | null)?.runId;
    if (typeof runId !== "string" || runId.length === 0) {
        return NextResponse.json(
            {
                error: {
                    code: "INVALID_OUTCOME",
                    message: "runId is required and must be a string",
                },
            },
            { status: 400 },
        );
    }

    const decision = await patchOutcome(
        runId,
        (body as { outcome?: unknown }).outcome,
    );

    if (!decision.allowed) {
        return NextResponse.json(
            {
                error: {
                    code: decision.reason,
                    message: messageFor(decision.reason),
                },
            },
            { status: STATUS_BY_REJECTION[decision.reason] },
        );
    }
    return NextResponse.json({ runId, outcome: decision.kind });
}

function messageFor(reason: PatchRejection): string {
    switch (reason) {
        case "UNKNOWN_RUN":
            return "No Director run with that runId";
        case "ALREADY_PATCHED":
            return "That run already has an outcome; outcomes are recorded once";
        case "INVALID_OUTCOME":
            return "outcome must be one of staged, accepted, replaced, discarded";
    }
}
