"use client";

import { useTranslations } from "next-intl";
import toast from "react-hot-toast";

import type { ExecutableWorkflow } from "@/lib/workflow/executable-workflow";
import { WORKFLOW_TTS_NEEDS_NORMALIZE } from "@/lib/workflow/exporter";

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
    return (executable) => {
        for (const warning of executable.warnings ?? []) {
            if (warning.code === WORKFLOW_TTS_NEEDS_NORMALIZE) {
                toast(
                    tToast("ttsNeedsNormalize", {
                        nodes: warning.nodeIds.join(", "),
                    }),
                    { icon: "⚠️", duration: WARNING_TOAST_DURATION_MS },
                );
            }
        }
    };
}
