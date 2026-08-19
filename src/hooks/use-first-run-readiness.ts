"use client";

import { useEffect, useState } from "react";
import type { FirstRunState } from "@/components/workspace/first-run-strip";
import { usePluginsRegistry } from "@/hooks/use-plugins-registry";
import {
    missingPluginIds,
    readExampleRequirements,
} from "@/lib/onboarding/example-requirements";

/**
 * Whether this workspace has ever completed the bundled example.
 *
 * Stored, not derived: the strip is guidance and must not reappear after the
 * user has already been through it. This is a single boolean about THIS
 * browser's own state — it is never sent anywhere (AC-12).
 */
export const EXAMPLE_COMPLETED_KEY = "oneflow.firstRun.exampleCompleted";

/** Human label for a slot, used when a plugin ships no display name. */
const SLOT_LABELS: Readonly<Record<string, string>> = {
    "split-video": "Tách cảnh video",
    "concat-videos": "Cắt ghép video",
};

const FALLBACK_CAPABILITY = "Một bộ xử lý video";

export type ReadinessInput = {
    workflow: unknown;
    installedIds: readonly string[];
    /** pluginId → display name from the plugin's own manifest. */
    pluginNames: Readonly<Record<string, string>>;
    exampleCompleted: boolean;
};

/**
 * The strip's state, or `null` for "render nothing".
 *
 * Pure so the decision can be tested without a browser, a registry or a clock.
 */
export function computeReadiness(input: ReadinessInput): FirstRunState | null {
    if (input.exampleCompleted) return null;

    const reqs = readExampleRequirements(input.workflow);
    if (reqs.length === 0) return null;

    const missing = missingPluginIds(reqs, input.installedIds);
    if (missing.length === 0) return { phase: "ready" };

    // Ids never cross this boundary: the strip's prop is `capabilities`, and
    // translating a plugin into words is this layer's job, not the view's.
    const capabilities = missing.map((id) => {
        const named = input.pluginNames[id];
        if (named) return named;
        const req = reqs.find((r) => r.pluginId === id);
        return (req && SLOT_LABELS[req.feature]) || FALLBACK_CAPABILITY;
    });

    return { phase: "missing-plugins", capabilities, downloadMb: 0 };
}

export function useFirstRunReadiness(): FirstRunState | null {
    // The registry already has a deduplicating store of its own; fetching it a
    // second time here would race the copy the rest of the canvas reads.
    const { registry } = usePluginsRegistry();
    const [workflow, setWorkflow] = useState<unknown>(null);
    const [exampleCompleted, setExampleCompleted] = useState(true);

    useEffect(() => {
        // localStorage is read once, in an effect, because it does not exist
        // during the server render. Starting from `true` means the strip is
        // absent until we positively know it is a first run — the wrong way to
        // be wrong is to flash guidance at someone who already finished.
        setExampleCompleted(
            localStorage.getItem(EXAMPLE_COMPLETED_KEY) === "1",
        );
    }, []);

    useEffect(() => {
        let cancelled = false;
        void fetch("/example.json")
            .then((res) => (res.ok ? res.json() : null))
            .then((json) => {
                if (!cancelled) setWorkflow(json);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    if (!registry || !workflow) return null;

    return computeReadiness({
        workflow,
        installedIds: Object.keys(registry.plugins),
        pluginNames: Object.fromEntries(
            Object.entries(registry.plugins).flatMap(([id, meta]) =>
                meta.name ? [[id, meta.name] as const] : [],
            ),
        ),
        exampleCompleted,
    });
}
