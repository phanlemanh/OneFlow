import "server-only";

import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { directorEvents } from "@/db/schema";
import type { DirectorErrorCode } from "@/lib/director/director-core";
import { logger } from "@/lib/logger";
import { decidePatch, GENERATED, type PatchDecision } from "./director-events";

/** Everything the ledger records about a run that has just finished. */
export interface GeneratedEvent {
    runId: string;
    promptText: string;
    dslVersion: number;
    planJson?: string;
    attempts?: number;
    errorCode?: DirectorErrorCode;
    canvasWasEmpty?: boolean;
    usedMemory?: boolean;
    memoryBlockDigest?: string;
    estimateMs?: number;
}

/**
 * Record a finished run. Called from the route, not from the client — a tab
 * that closes mid-request would otherwise take the row with it, and a user who
 * gives up halfway is precisely the signal worth having.
 *
 * Never throws: a ledger failure must not turn a successful Director run into
 * an HTTP error the user sees. A lost row is a measurement gap; a 500 here
 * would be a regression in the product. The gap is logged so it stays visible.
 */
export async function recordGenerated(event: GeneratedEvent): Promise<void> {
    try {
        const db = await getDb();
        await db.insert(directorEvents).values({
            runId: event.runId,
            kind: GENERATED,
            promptText: event.promptText,
            dslVersion: event.dslVersion,
            planJson: event.planJson ?? null,
            attempts: event.attempts ?? null,
            errorCode: event.errorCode ?? null,
            canvasWasEmpty: event.canvasWasEmpty ?? null,
            usedMemory: event.usedMemory ?? null,
            memoryBlockDigest: event.memoryBlockDigest ?? null,
            estimateMs: event.estimateMs ?? null,
            workflowId: null,
        });
    } catch (err) {
        logger.warn("[Director] could not record run:", {
            runId: event.runId,
            error: err instanceof Error ? err.message : String(err),
        });
    }
}

/**
 * Apply a client-reported outcome to a run, once. Returns the decision so the
 * route can map it to a status code without re-deriving the rules.
 */
export async function patchOutcome(
    runId: string,
    requestedOutcome: unknown,
): Promise<PatchDecision> {
    const db = await getDb();
    const rows = await db
        .select({ id: directorEvents.id, kind: directorEvents.kind })
        .from(directorEvents)
        .where(eq(directorEvents.runId, runId))
        .limit(1);

    const current = rows[0];
    const decision = decidePatch(
        current?.kind as Parameters<typeof decidePatch>[0],
        requestedOutcome,
    );
    if (!decision.allowed || !current) return decision;

    await db
        .update(directorEvents)
        .set({ kind: decision.kind })
        .where(eq(directorEvents.id, current.id));
    return decision;
}
