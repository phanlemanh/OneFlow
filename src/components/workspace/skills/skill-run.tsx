"use client";

import {
    CircleAlert,
    CircleCheck,
    CircleDashed,
    Download,
    LoaderCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type {
    SkillOutputView,
    SkillStepStatus,
    SkillStepView,
} from "./skill-view";

const STEP_ICON: Record<SkillStepStatus, React.ReactNode> = {
    pending: (
        <CircleDashed
            aria-hidden="true"
            className="h-5 w-5 text-muted-foreground"
        />
    ),
    running: (
        <LoaderCircle
            aria-hidden="true"
            className="h-5 w-5 animate-spin text-primary"
        />
    ),
    done: <CircleCheck aria-hidden="true" className="h-5 w-5 text-primary" />,
    failed: (
        <CircleAlert aria-hidden="true" className="h-5 w-5 text-destructive" />
    ),
};

function StepList({
    skillId,
    steps,
}: {
    skillId: string;
    steps: SkillStepView[];
}) {
    const t = useTranslations("Skills");
    return (
        <ol className="flex flex-col gap-2">
            {steps.map((step) => (
                <li
                    key={step.nodeId}
                    data-step-status={step.status}
                    className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
                >
                    {STEP_ICON[step.status]}
                    <span className="flex-1 text-sm text-foreground">
                        {t(`skills.${skillId}.steps.${step.slot}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {t(`step.${step.status}`)}
                    </span>
                </li>
            ))}
        </ol>
    );
}

/** Progress screen while a run is in flight. */
export function SkillRunStatus({
    skillId,
    steps,
}: {
    skillId: string;
    steps: SkillStepView[];
}) {
    const t = useTranslations("Skills");
    const name = t(`skills.${skillId}.name`);
    return (
        <div className="flex flex-col gap-4" aria-live="polite">
            <h2 className="text-lg font-semibold text-foreground">
                {t("progressTitle", { name })}
            </h2>
            <StepList skillId={skillId} steps={steps} />
            <p className="text-sm text-muted-foreground">
                {t("keepRunningHint")}
            </p>
        </div>
    );
}

interface SkillResultProps {
    skillId: string;
    outcome: "done" | "failed";
    steps: SkillStepView[];
    outputs: SkillOutputView[];
    onViewPlan: () => void;
    onNewRun: () => void;
    onRerun: () => void;
    onBackToForm: () => void;
}

/** Result screen: outputs on success, a product-language failure otherwise. */
export function SkillResult({
    skillId,
    outcome,
    steps,
    outputs,
    onViewPlan,
    onNewRun,
    onRerun,
    onBackToForm,
}: SkillResultProps) {
    const t = useTranslations("Skills");
    const name = t(`skills.${skillId}.name`);

    if (outcome === "failed") {
        const failed = steps.find((s) => s.status === "failed");
        return (
            <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-foreground">
                    {t("failedTitle", { name })}
                </h2>
                <p
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-foreground"
                >
                    {t("failedBody", {
                        step: failed
                            ? t(`skills.${skillId}.steps.${failed.slot}`)
                            : "",
                    })}
                </p>
                <StepList skillId={skillId} steps={steps} />
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={onRerun}>{t("rerun")}</Button>
                    <Button variant="outline" onClick={onBackToForm}>
                        {t("backToForm")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-foreground">
                {t("resultTitle", { name })}
            </h2>
            <ul className="flex flex-col gap-4">
                {outputs.map((output) => {
                    const label = t(
                        `skills.${skillId}.outputs.${output.key}.label`,
                    );
                    return (
                        <li
                            key={output.key}
                            data-output={output.key}
                            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
                        >
                            <span className="text-sm font-medium text-foreground">
                                {label}
                            </span>
                            {output.values.map((value, i) => (
                                <OutputItem
                                    key={value}
                                    kind={output.kind}
                                    value={value}
                                    label={
                                        output.values.length > 1
                                            ? `${label} ${i + 1}`
                                            : label
                                    }
                                    downloadLabel={t("download")}
                                />
                            ))}
                        </li>
                    );
                })}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={onViewPlan}>{t("viewPlan")}</Button>
                <Button variant="outline" onClick={onNewRun}>
                    {t("newRun")}
                </Button>
            </div>
        </div>
    );
}

function OutputItem({
    kind,
    value,
    label,
    downloadLabel,
}: {
    kind: SkillOutputView["kind"];
    value: string;
    label: string;
    downloadLabel: string;
}) {
    if (kind === "text") {
        return <p className="text-sm text-foreground">{value}</p>;
    }
    return (
        <div className="flex flex-col gap-2">
            {kind === "video" && (
                <video
                    controls
                    preload="metadata"
                    src={value}
                    aria-label={label}
                    className="w-full rounded-lg bg-muted"
                />
            )}
            {kind === "audio" && (
                <audio
                    controls
                    preload="metadata"
                    src={value}
                    aria-label={label}
                    className="w-full"
                />
            )}
            {kind === "image" && (
                <img src={value} alt={label} className="w-full rounded-lg" />
            )}
            <Button asChild variant="ghost" size="sm" className="self-start">
                <a
                    href={value}
                    download
                    aria-label={`${downloadLabel} — ${label}`}
                >
                    <Download aria-hidden="true" />
                    {downloadLabel}
                </a>
            </Button>
        </div>
    );
}
