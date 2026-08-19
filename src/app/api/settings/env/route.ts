import { type NextRequest, NextResponse } from "next/server";
import { type KeyVerdict, verifyKey } from "@/lib/onboarding/key-verify";
import { loadPluginEnvDecls } from "@/lib/plugins/plugin-env-manifests.server";
import {
    type EnvStore,
    loadEnvStore,
    saveEnvStore,
} from "@/lib/settings/env-store.server";

export const runtime = "nodejs";

/**
 * GET /api/settings/env
 * Returns the user-managed environment key/value map (settings.json) plus
 * the env vars declared by installed plugins (`tongflow.plugin.json`), so
 * the settings dialog gets values and declarations in one fetch.
 */
export async function GET() {
    return NextResponse.json(
        { env: await loadEnvStore(), pluginEnv: loadPluginEnvDecls() },
        { headers: { "Cache-Control": "no-store" } },
    );
}

/**
 * Asks each provider whether the key it was just handed actually works.
 * Keys whose value changed in this request are probed; `requested` keys are
 * probed even when unchanged — a re-save of the same value used to return NO
 * verdict at all, which the node prompt could only render as "invalid" (S4
 * round 1 finding). The change-detection optimisation still protects the
 * bulk settings dialog from firing one outbound call per stored key.
 */
async function verifyChangedKeys(
    previous: EnvStore,
    next: EnvStore,
    requested: readonly string[],
): Promise<Record<string, KeyVerdict>> {
    const wanted = new Set(requested);
    const toVerify = Object.keys(next).filter(
        (key) =>
            next[key] !== "" &&
            (next[key] !== previous[key] || wanted.has(key)),
    );
    const verdicts = await Promise.all(
        toVerify.map(
            async (key) => [key, await verifyKey(key, next[key])] as const,
        ),
    );
    return Object.fromEntries(verdicts);
}

/**
 * PUT /api/settings/env
 * Replaces the entire env map. Body: `{ env: Record<string,string> }`.
 * OneFlow stays platform-agnostic: it does not validate which keys are present;
 * each plugin documents the keys it needs in its own README.
 *
 * Saving is followed by verification: every key whose value changed is tested
 * against the thing it unlocks, and the verdicts come back in the response so
 * the caller states a server-derived result instead of an optimistic "saved".
 * The storage path itself is unchanged — this only adds a road to it.
 */
export async function PUT(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const raw = (body as { env?: unknown })?.env;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return NextResponse.json(
            { error: "Body must be { env: Record<string,string> }" },
            { status: 400 },
        );
    }

    const env: EnvStore = {};
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof v === "string") env[k] = v;
    }

    const requestedRaw = (body as { verify?: unknown })?.verify;
    const requested = Array.isArray(requestedRaw)
        ? requestedRaw.filter((k): k is string => typeof k === "string")
        : [];

    const previous = await loadEnvStore();
    await saveEnvStore(env);
    const verdicts = await verifyChangedKeys(previous, env, requested);
    return NextResponse.json({ env: await loadEnvStore(), verdicts });
}
