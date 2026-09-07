import "server-only";

import { and, eq } from "drizzle-orm";
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

    // The single-shot rule must live in the statement, not in the read above:
    // two requests for the same runId can both observe `generated` at the
    // await boundary, and a plain `WHERE id = ?` would let the second one
    // overwrite the first. Only a row STILL `generated` takes the patch; zero
    // rows changed means someone else got there first (S4 round-1, AC-5).
    const result = await db
        .update(directorEvents)
        .set({ kind: decision.kind })
        .where(
            and(
                eq(directorEvents.id, current.id),
                eq(directorEvents.kind, GENERATED),
            ),
        );
    if (rowsChanged(result) === 0) {
        return { allowed: false, reason: "ALREADY_PATCHED" };
    }
    return decision;
}

/**
 * Rows a write touched, across the two sqlite drivers this app runs on
 * (better-sqlite3 reports `changes`, libsql `rowsAffected`). Unknown shape →
 * undefined, and the caller keeps the pre-existing behaviour rather than
 * inventing a rejection the driver never reported.
 */
function rowsChanged(result: unknown): number | undefined {
    if (typeof result !== "object" || result === null) return undefined;
    const r = result as { changes?: unknown; rowsAffected?: unknown };
    if (typeof r.changes === "number") return r.changes;
    if (typeof r.rowsAffected === "number") return r.rowsAffected;
    return undefined;
}
