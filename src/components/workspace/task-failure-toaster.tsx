"use client";

import { useEffect, useRef } from "react";
import type { ErrorToastAction } from "@/components/ui/error-toast";
import { showErrorToast } from "@/components/ui/error-toast";
import { TaskStatus, WorkflowStatus } from "@/constants/task-status";
import { getClientTranslator } from "@/i18n/client";
import { normalizeRefusalFrom } from "@/lib/normalize/error-copy";
import type { FailureAction } from "@/lib/onboarding/failure-actions";
import { classifyFailure } from "@/lib/onboarding/failure-actions";
import type { SerializedWorkflowFailure } from "@/lib/task/error-envelope";
import { buildTaskErrorDetail } from "@/lib/task/error-format";
import { taskErrorFromSSE } from "@/lib/task/sse-error";
import { SSE_TASK_MESSAGE_EVENT } from "@/lib/task/sse-events";
import type { SSEMessage } from "@/types/sse";

/**
 * Fired when the user takes the recovery exit offered on a failed task. The
 * surface that owns the destination listens for it: the plugin manager for
 * `install-plugin`, the node's key prompt for `enter-key`. Never fired for
 * `kind: "none"` — an unrecognised failure gets no control at all.
 */
export const ONBOARDING_RECOVERY_EVENT = "onboarding-recovery-action";

export type OnboardingRecoveryDetail = Exclude<FailureAction, { kind: "none" }>;

function emitRecovery(detail: OnboardingRecoveryDetail) {
    window.dispatchEvent(
        new CustomEvent<OnboardingRecoveryDetail>(ONBOARDING_RECOVERY_EVENT, {
            detail,
        }),
    );
}

/**
 * The failure's cause decides the control. `none` returns undefined, which
 * leaves the toast exactly as it is today: the plain message, no button.
 */
function recoveryControl(action: FailureAction): ErrorToastAction | undefined {
    switch (action.kind) {
        case "install-plugin":
            return {
                label: `Cài plugin ${action.pluginId}`,
                onClick: () => emitRecovery(action),
            };
        case "enter-key":
            return {
                label: `Nhập khoá ${action.envKey}`,
                onClick: () => emitRecovery(action),
            };
        case "none":
            return undefined;
    }
}

/**
 * Global listener that surfaces every task / workflow failure as a persistent
 * error toast. All SSE sources (single-task, workflow, recovery) dispatch the
 * same `SSE_TASK_MESSAGE_EVENT`, so one listener covers them all. Deduped by
 * task id so a workflow with several failing nodes still toasts only once;
 * the record is cleared on the next start so a re-run can toast again.
 */
export function TaskFailureToaster() {
    const toastedRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        const t = getClientTranslator("Workspace.toast");
        // The reader-refusal catalogue: one bucket, one key per stable code.
        const tNormalize = getClientTranslator(
            "Workspace.nodes.normalizeErrors.normalizeTextVi",
        );

        const handle = (event: CustomEvent<SSEMessage>) => {
            const message = event.detail;
            const taskId = message.id;

            if (
                message.status === WorkflowStatus.WORKFLOW_STARTED ||
                message.status === TaskStatus.PENDING ||
                message.status === TaskStatus.RUNNING
            ) {
                toastedRef.current.delete(taskId);
                return;
            }

            if (
                message.status !== WorkflowStatus.WORKFLOW_FAILED &&
                message.status !== TaskStatus.FAILED
            ) {
                return;
            }

            if (toastedRef.current.has(taskId)) return;
            toastedRef.current.add(taskId);

            const data = message.data;
            const errorText = taskErrorFromSSE(message);

            // A reader refusal carries a stable code, so the sentence the user
            // reads comes from their own locale catalogue rather than from the
            // SDK's Vietnamese `error` string (AC-6 of chống-đọc-sai-êm-ru).
            // Read off the OUTPUTS, never by matching the sentence: the wording
            // is a log artefact, the code is the contract.
            const outputs = Array.isArray(data?.outputs)
                ? (data.outputs as unknown[])
                : [];
            const refusal = outputs
                .map(normalizeRefusalFrom)
                .find((found) => found !== null);
            if (refusal) {
                showErrorToast({
                    title: t("taskFailed"),
                    message: tNormalize(refusal.code, {
                        tokens: refusal.tokens,
                    }),
                    id: `task-failed:${taskId}`,
                });
                return;
            }
            const detail = buildTaskErrorDetail({
                message: errorText,
                errors: data?.errors as string[] | undefined,
                failures: data?.failures as
                    | SerializedWorkflowFailure[]
                    | undefined,
            });

            // With an error message: "Task failed" headline + the message.
            // Without one: just the "Task failed" message, no redundant title.
            // The message also decides which recovery exit to offer, if any.
            showErrorToast({
                title: errorText ? t("taskFailed") : undefined,
                message: errorText || t("taskFailed"),
                detail,
                action: recoveryControl(classifyFailure(errorText ?? "")),
                id: `task-failed:${taskId}`,
            });
        };

        window.addEventListener(
            SSE_TASK_MESSAGE_EVENT,
            handle as EventListener,
        );
        return () => {
            window.removeEventListener(
                SSE_TASK_MESSAGE_EVENT,
                handle as EventListener,
            );
        };
    }, []);

    return null;
}
