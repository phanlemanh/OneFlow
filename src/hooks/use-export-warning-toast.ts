"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { useNodePluginIds } from "@/hooks/use-plugins-registry";
import type { ExecutableWorkflow } from "@/lib/workflow/executable-workflow";
import {
    NORMALIZE_SLOT,
    WORKFLOW_TTS_NEEDS_NORMALIZE,
} from "@/lib/workflow/exporter";

const WARNING_TOAST_DURATION_MS = 6000;

/**
 * Render export-time policy warnings as localized toasts.
 *
 * The exporter emits machine-readable codes only; the sentence the user reads
 * is rendered here, in their locale. This is the ONE place a warning code maps
 * to copy — the first version inlined the same loop in both export surfaces,
 * so every future code would have had to be added twice or the surfaces would
 * drift (S4 round 1 finding).
 */
export function useExportWarningToasts(): (
    executable: ExecutableWorkflow,
) => void {
    const tToast = useTranslations("Workspace.toast");
    // Can the user DO what the warning asks? The exporter states a fact about
    // the graph and stays pure; whether that fact is worth interrupting someone
    // over depends on the plugin registry, which only this layer can see.
    //
    // Measured 2026-08-28: the reader's plugin is absent from the official
    // manifest (its origin repo does not exist publicly, so
    // check-normalize-registration.sh asserts the absence), and the node is in
    // no picker. The warning therefore fired on EVERY save, export and run of
    // every existing speech workflow, telling the user to insert a node that no
    // machine can install — advice with no possible action behind it.
    const readerPlugins = useNodePluginIds(NORMALIZE_SLOT);
    const readerInstalled = readerPlugins.length > 0;
    // Memoized so callers can list it in their own dependency arrays without
    // re-creating memos every render (S4 round 2 finding).
    return useCallback(
        (executable) => {
            for (const warning of executable.warnings ?? []) {
                if (warning.code === WORKFLOW_TTS_NEEDS_NORMALIZE) {
                    // Silent, not softened: a warning whose remedy cannot be
                    // performed is noise, and noise trains people to dismiss
                    // the ones that can.
                    if (!readerInstalled) continue;
                    toast(
                        tToast("ttsNeedsNormalize", {
                            nodes: warning.nodeIds.join(", "),
                        }),
                        { icon: "⚠️", duration: WARNING_TOAST_DURATION_MS },
                    );
                }
            }
        },
        [tToast, readerInstalled],
    );
}
