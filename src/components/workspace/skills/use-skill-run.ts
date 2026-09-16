"use client";

import { useEffect, useState } from "react";
import { NodeStatus, WorkflowStatus } from "@/constants/task-status";
import { fetchSkillRun, type SkillRunView } from "@/lib/api/skills";
import { getTaskWaitUrl } from "@/lib/task/api-url";

const TERMINAL: readonly string[] = [
    WorkflowStatus.WORKFLOW_COMPLETED,
    WorkflowStatus.WORKFLOW_FAILED,
];

const STEP_BY_EVENT: Record<string, "running" | "done" | "failed"> = {
    [NodeStatus.NODE_STARTED]: "running",
    [NodeStatus.NODE_COMPLETED]: "done",
    [NodeStatus.NODE_FAILED]: "failed",
};

function isFinished(view: SkillRunView | null): boolean {
    return view?.status === "completed" || view?.status === "failed";
}

/**
 * Track one skill run. The server's run view is the source of truth (it is
 * what a reopened panel reads); while the run is in flight, node events on
 * the task's SSE stream move individual steps forward. Opening the stream is
 * also what dispatches a pending task, same as every other task in the app.
 */
export function useSkillRun(taskId: string | null): SkillRunView | null {
    const [view, setView] = useState<SkillRunView | null>(null);

    useEffect(() => {
        if (!taskId) {
            setView(null);
            return;
        }
        let cancelled = false;
        let source: EventSource | null = null;

        const refresh = async () => {
            const res = await fetchSkillRun(taskId);
            if (!cancelled && res.status === 200) setView(res.body);
            return res.status === 200 ? res.body : null;
        };

        void (async () => {
            const first = await refresh();
            if (cancelled || isFinished(first)) return;
            source = new EventSource(getTaskWaitUrl(taskId));
            source.onmessage = (event) => {
                let message: { status?: string; nodeId?: string | null };
                try {
                    message = JSON.parse(event.data);
                } catch {
                    return;
                }
                const status = message.status ?? "";
                const next = STEP_BY_EVENT[status];
                const nodeId = message.nodeId;
                if (next && nodeId) {
                    setView((prev) =>
                        prev
                            ? {
                                  ...prev,
                                  status: "processing",
                                  steps: prev.steps.map((s) =>
                                      s.nodeId === nodeId
                                          ? { ...s, status: next }
                                          : s,
                                  ),
                              }
                            : prev,
                    );
                }
                if (TERMINAL.includes(status)) {
                    source?.close();
                    void refresh();
                }
            };
            source.onerror = () => {
                source?.close();
                void refresh();
            };
        })();

        return () => {
            cancelled = true;
            source?.close();
        };
    }, [taskId]);

    return view;
}
