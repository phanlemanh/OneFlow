"use client";

import type { Edge, Node } from "@xyflow/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { OnboardingRecoveryDetail } from "@/components/workspace/task-failure-toaster";
import { ONBOARDING_RECOVERY_EVENT } from "@/components/workspace/task-failure-toaster";
import { useFlow } from "@/hooks/use-flow";
import {
    fetchSkillPlan,
    fetchSkills,
    type SkillListItem,
    type SkillPlan,
    submitSkillRun,
} from "@/lib/api/skills";
import { getPresignedUploadUrl } from "@/lib/api/upload";
import { logger } from "@/lib/logger";
import { SkillForm } from "./skill-form";
import { SkillList } from "./skill-list";
import { SkillReplaceConfirm } from "./skill-replace-confirm";
import { SkillResult, SkillRunStatus } from "./skill-run";
import type {
    SkillOutputView,
    SkillParamErrors,
    SkillParamReason,
    SkillParamValue,
    SkillParamValues,
    SkillUploadView,
} from "./skill-view";
import { useSkillRun } from "./use-skill-run";

type Screen =
    | { kind: "list" }
    | { kind: "form"; skillId: string }
    | { kind: "run"; skillId: string; taskId: string };

export interface SkillLastRun {
    skillId: string;
    taskId: string;
}

interface SkillPanelProps {
    /** Close the surrounding sheet (after "view/edit plan" or opening plugins). */
    onClose: () => void;
    /** The most recent run, so reopening the panel lands back on it. */
    lastRun?: SkillLastRun | null;
    onRunStarted?: (run: SkillLastRun) => void;
}

/**
 * The skill panel: list → form → run → result. Stateful shell over the
 * presentational components; every server answer is data it branches on.
 */
export function SkillPanel({
    onClose,
    lastRun = null,
    onRunStarted,
}: SkillPanelProps) {
    const t = useTranslations("Skills");
    const [skills, setSkills] = useState<SkillListItem[] | null>(null);
    const [screen, setScreen] = useState<Screen>(
        lastRun ? { kind: "run", ...lastRun } : { kind: "list" },
    );
    const [values, setValues] = useState<Record<string, SkillParamValues>>({});
    const [errors, setErrors] = useState<SkillParamErrors>({});
    const [upload, setUpload] = useState<SkillUploadView | null>(null);
    const [busyMax, setBusyMax] = useState<number | null>(null);
    const [pendingPlan, setPendingPlan] = useState<SkillPlan | null>(null);
    const uploadToken = useRef(0);

    const loadSkills = useCallback(async () => {
        setSkills(null);
        const res = await fetchSkills();
        setSkills(res.status === 200 ? res.body.skills : []);
    }, []);

    useEffect(() => {
        void loadSkills();
    }, [loadSkills]);

    const taskId = screen.kind === "run" ? screen.taskId : null;
    const run = useSkillRun(taskId);

    const skill =
        screen.kind === "list"
            ? undefined
            : skills?.find((s) => s.id === screen.skillId);

    const setValue = (key: string, value: SkillParamValue | undefined) => {
        if (screen.kind === "list") return;
        const id = screen.skillId;
        setValues((prev) => {
            const next = { ...(prev[id] ?? {}) };
            if (value === undefined) delete next[key];
            else next[key] = value;
            return { ...prev, [id]: next };
        });
        setErrors((prev) => {
            const { [key]: _dropped, ...rest } = prev;
            return rest;
        });
    };

    const pickFile = async (key: string, file: File) => {
        const token = ++uploadToken.current;
        setUpload({ paramKey: key, name: file.name, percent: 0 });
        try {
            const res = await getPresignedUploadUrl(file);
            if (token !== uploadToken.current) return;
            setValue(key, { fileKey: res.fileKey, name: file.name });
        } catch (error) {
            logger.error("[skills] upload failed:", error);
        } finally {
            if (token === uploadToken.current) setUpload(null);
        }
    };

    const startRun = async (skillId: string) => {
        setBusyMax(null);
        const res = await submitSkillRun(skillId, values[skillId] ?? {});
        const body = res.body;
        if (res.status === 200 && "taskId" in body) {
            setScreen({ kind: "run", skillId, taskId: body.taskId });
            onRunStarted?.({ skillId, taskId: body.taskId });
            return;
        }
        if ("code" in body && body.code === "SKILL_PARAMS_INVALID") {
            // A rerun from a reopened panel has no values in memory: show the form.
            setScreen({ kind: "form", skillId });
            setErrors(
                Object.fromEntries(
                    body.errors.map((e) => [
                        e.param,
                        e.reason as SkillParamReason,
                    ]),
                ),
            );
            return;
        }
        if ("code" in body && body.code === "CONCURRENT_TASK_LIMIT_EXCEEDED") {
            setScreen({ kind: "form", skillId });
            setBusyMax(body.max);
            return;
        }
        // Missing plugin or unknown skill: the list is stale — refresh it.
        setScreen({ kind: "list" });
        void loadSkills();
    };

    const applyPlan = (plan: SkillPlan) => {
        const flow = useFlow.getState();
        flow.setNodes(plan.nodes as Node[]);
        flow.setEdges(plan.edges as Edge[]);
        // The canvas now holds a skill's plan, not a Director run's.
        flow.setDirectorRunId(null);
        if (screen.kind !== "list") {
            flow.setWorkflowName(t(`skills.${screen.skillId}.name`));
        }
        setPendingPlan(null);
        onClose();
    };

    const viewPlan = async (runTaskId: string) => {
        const res = await fetchSkillPlan(runTaskId);
        if (res.status !== 200) return;
        if (useFlow.getState().nodes.length > 0) setPendingPlan(res.body);
        else applyPlan(res.body);
    };

    const openPlugins = () => {
        onClose();
        window.dispatchEvent(
            new CustomEvent<OnboardingRecoveryDetail>(
                ONBOARDING_RECOVERY_EVENT,
                {
                    detail: { kind: "install-plugin", pluginId: "" },
                },
            ),
        );
    };

    let body: React.ReactNode;
    if (screen.kind === "list" || !skill) {
        body = (
            <SkillList
                skills={(skills ?? []).map((s) => ({
                    id: s.id,
                    missingSlots: s.missingSlots,
                }))}
                loading={skills === null}
                onSelect={(id) => {
                    setErrors({});
                    setBusyMax(null);
                    setScreen({ kind: "form", skillId: id });
                }}
                onOpenPlugins={openPlugins}
            />
        );
    } else if (screen.kind === "form") {
        body = (
            <SkillForm
                skillId={skill.id}
                params={skill.params.map((p) => ({
                    key: p.key,
                    type: p.type,
                    required: p.required,
                    min: p.min,
                    max: p.max,
                    step: p.step,
                    options: p.options,
                }))}
                values={values[skill.id] ?? {}}
                errors={errors}
                upload={upload}
                busyMax={busyMax}
                onChange={setValue}
                onPickFile={(key, file) => void pickFile(key, file)}
                onCancelUpload={() => {
                    uploadToken.current++;
                    setUpload(null);
                }}
                onRun={() => void startRun(skill.id)}
                onBack={() => setScreen({ kind: "list" })}
            />
        );
    } else if (
        !run ||
        (run.status !== "completed" && run.status !== "failed")
    ) {
        body = <SkillRunStatus skillId={skill.id} steps={run?.steps ?? []} />;
    } else {
        const outputs: SkillOutputView[] = skill.outputs.map((o) => ({
            key: o.key,
            kind: o.type,
            values: (run.outputs[o.key]?.values ?? []).map((v) =>
                o.type === "text" ? v : `/api/uploads/${v}`,
            ),
        }));
        const runTaskId = screen.taskId;
        body = (
            <SkillResult
                skillId={skill.id}
                outcome={run.status === "completed" ? "done" : "failed"}
                steps={run.steps}
                outputs={outputs}
                errorCode={run.error?.code}
                onViewPlan={() => void viewPlan(runTaskId)}
                onNewRun={() => setScreen({ kind: "form", skillId: skill.id })}
                onRerun={() => void startRun(skill.id)}
                onBackToForm={() =>
                    setScreen({ kind: "form", skillId: skill.id })
                }
            />
        );
    }

    return (
        <>
            {body}
            <SkillReplaceConfirm
                open={pendingPlan !== null}
                onReplace={() => pendingPlan && applyPlan(pendingPlan)}
                onCancel={() => setPendingPlan(null)}
            />
        </>
    );
}
