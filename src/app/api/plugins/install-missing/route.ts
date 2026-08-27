import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import {
    exampleRequirementIds,
    installMissingForExample,
} from "@/lib/onboarding/install-missing.server";

export const runtime = "nodejs";

/**
 * POST /api/plugins/install-missing
 *
 * Installs every plugin the bundled example needs in ONE call. No body: the
 * set comes from the shipped `example.json`, not from the client, so a stale
 * or tampered page cannot narrow what "prepare" means (AC-5). Each install
 * already rescans the registry, so the response arriving means the registry
 * answer is current — no restart (AC-6).
 */
export async function POST() {
    try {
        const ids = await exampleRequirementIds();
        const result = await installMissingForExample(ids);
        const status = result.failed.length > 0 ? 502 : 200;
        return NextResponse.json(result, {
            status,
            headers: { "Cache-Control": "no-store" },
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        logger.error("[onboarding] install-missing failed:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
