"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    type FirstRunState,
    FirstRunStrip,
    type FirstRunStripLabels,
    type ProvisioningMilestone,
} from "@/components/workspace/first-run-strip";
import {
    EXAMPLE_COMPLETED_KEY,
    useFirstRunReadiness,
} from "@/hooks/use-first-run-readiness";
import { useTaskStore } from "@/hooks/use-task";
import type {
    ProvisioningEvent,
    ProvisioningStep,
} from "@/lib/plugin-executor/provisioning-events";
import { SSE_TASK_MESSAGE_EVENT } from "@/lib/task/sse-events";
import type { SSEMessage } from "@/types/sse";

/**
 * Wires the presentational strip to the product:
 *
 * - readiness (missing plugins / ready) comes from `useFirstRunReadiness`;
 * - provisioning milestones arrive on the SSE task-event bus — each label
 *   shown is one the EXECUTOR emitted for work that actually happened, never
 *   a timer (AC-7); the last reached milestone stays on screen with its own
 *   elapsed counter, so a minutes-long wait is distinguishable from a hang
 *   (AC-8);
 * - a completed workflow run marks `EXAMPLE_COMPLETED_KEY`, after which the
 *   strip never renders again (AC-3). Failure marks nothing: a failed run
 *   must not read as success (AC-2).
 *
 * The strip stays guidance, never a gate: this container renders in a
 * pointer-events-none wrapper above a canvas that keeps working (AC-13).
 */

const STEP_TO_MILESTONE: Readonly<
    Record<ProvisioningStep, ProvisioningMilestone>
> = {
    "create-venv": "creating-venv",
    "install-sdk": "installing-sdk",
    "install-requirements": "installing-requirements",
};

const TERMINAL_STATUSES = new Set(["COMPLETED", "FAILED", "CANCELLED"]);

function readProvisioningEvent(message: SSEMessage): ProvisioningEvent | null {
    const raw = message.data?.provisioning;
    if (!raw || typeof raw !== "object") return null;
    const step = (raw as { step?: unknown }).step;
    if (typeof step !== "string" || !(step in STEP_TO_MILESTONE)) return null;
    return raw as ProvisioningEvent;
}

export function FirstRunStripContainer() {
    const t = useTranslations("Workspace.firstRun");
    const readiness = useFirstRunReadiness();
    const workflowStatus = useTaskStore((s) => s.workflowExecutionStatus);

    // Transient phases layered over readiness. `dismissed` flips once the
    // example completes, so the strip vanishes without waiting for a reload.
    const [override, setOverride] = useState<FirstRunState | null>(null);
    const [dismissed, setDismissed] = useState(false);
    const provisioningStartRef = useRef<number | null>(null);
    const [elapsedSec, setElapsedSec] = useState(0);

    // Provisioning milestones from the task stream.
    useEffect(() => {
        const onMessage = (event: Event) => {
            const message = (event as CustomEvent<SSEMessage>).detail;
            const provisioning = readProvisioningEvent(message);
            if (provisioning) {
                if (provisioningStartRef.current === null) {
                    provisioningStartRef.current = Date.now();
                    setElapsedSec(0);
                }
                setOverride({
                    phase: "provisioning",
                    milestone: STEP_TO_MILESTONE[provisioning.step],
                    elapsedSec: Math.round(
                        (Date.now() - provisioningStartRef.current) / 1000,
                    ),
                });
                return;
            }
            if (TERMINAL_STATUSES.has(String(message.status))) {
                provisioningStartRef.current = null;
                setOverride((current) =>
                    current?.phase === "provisioning" ? null : current,
                );
            }
        };
        window.addEventListener(SSE_TASK_MESSAGE_EVENT, onMessage);
        return () =>
            window.removeEventListener(SSE_TASK_MESSAGE_EVENT, onMessage);
    }, []);

    // The elapsed counter ticks while provisioning is on screen. It counts a
    // fact (time since the first real milestone), not progress.
    useEffect(() => {
        if (override?.phase !== "provisioning") return;
        const timer = setInterval(() => {
            const start = provisioningStartRef.current;
            if (start === null) return;
            setElapsedSec(Math.round((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(timer);
    }, [override?.phase]);

    // A completed run is the one exit that retires the strip for good.
    useEffect(() => {
        if (workflowStatus !== "completed") return;
        if (dismissed || readiness === null) return;
        localStorage.setItem(EXAMPLE_COMPLETED_KEY, "1");
        setDismissed(true);
    }, [workflowStatus, dismissed, readiness]);

    const handlePrepare = useCallback(() => {
        // Wired in the install task: one press hands the WHOLE missing set to
        // the server in a single call.
    }, []);

    const labels = useMemo<FirstRunStripLabels>(
        () => ({
            missingTitle: (count, mb) =>
                mb > 0
                    ? t("missingTitleWithSize", { count, mb })
                    : t("missingTitle", { count }),
            missingBody: (capabilities) => capabilities.join(" · "),
            prepare: t("prepare"),
            installing: (done, total) => t("installing", { done, total }),
            milestone: {
                "creating-venv": t("milestoneCreatingVenv"),
                "installing-sdk": t("milestoneInstallingSdk"),
                "installing-requirements": t("milestoneInstallingRequirements"),
            },
            elapsed: (sec) => t("elapsed", { sec }),
            ready: t("ready"),
            blocked: t("blocked"),
            retry: t("retry"),
        }),
        [t],
    );

    // `readiness === null` means "not a first run" — and that verdict gates
    // every transient phase too: provisioning of some later plugin must not
    // resurrect onboarding guidance (AC-3).
    if (dismissed || readiness === null) return null;

    const state: FirstRunState =
        override?.phase === "provisioning"
            ? { ...override, elapsedSec }
            : (override ?? readiness);

    return (
        <FirstRunStrip
            state={state}
            labels={labels}
            onPrepare={handlePrepare}
            onRetry={handlePrepare}
        />
    );
}
