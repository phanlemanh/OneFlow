"use client";

import { ChevronRight, PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { SkillCardView } from "./skill-view";

interface SkillListProps {
    skills: SkillCardView[];
    loading: boolean;
    onSelect: (skillId: string) => void;
    onOpenPlugins: () => void;
}

/** First screen of the skill panel: one card per registered skill. */
export function SkillList({
    skills,
    loading,
    onSelect,
    onOpenPlugins,
}: SkillListProps) {
    const t = useTranslations("Skills");

    if (loading) {
        return (
            <div className="space-y-3" aria-busy="true">
                <span className="sr-only">{t("loadingList")}</span>
                {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <ul className="space-y-3">
            {skills.map((skill) => {
                const blocked = skill.missingSlots.length > 0;
                const name = t(`skills.${skill.id}.name`);
                return (
                    <li key={skill.id}>
                        <div
                            data-testid={`skill-card-${skill.id}`}
                            data-blocked={blocked || undefined}
                            className="rounded-xl border border-border bg-card p-4"
                        >
                            <button
                                type="button"
                                disabled={blocked}
                                onClick={() => onSelect(skill.id)}
                                className="flex w-full items-start gap-3 text-left disabled:cursor-not-allowed"
                            >
                                <span className="min-w-0 flex-1">
                                    <span
                                        className={
                                            blocked
                                                ? "block font-medium text-muted-foreground"
                                                : "block font-medium text-foreground"
                                        }
                                    >
                                        {name}
                                    </span>
                                    <span className="mt-1 block text-sm text-muted-foreground">
                                        {t(`skills.${skill.id}.description`)}
                                    </span>
                                </span>
                                {!blocked && (
                                    <ChevronRight
                                        aria-hidden="true"
                                        className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                                    />
                                )}
                            </button>
                            {blocked && (
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary">
                                        <PackageOpen aria-hidden="true" />
                                        {t("missingPlugin", {
                                            steps: skill.missingSlots
                                                .map((slot) =>
                                                    t(
                                                        `skills.${skill.id}.steps.${slot}`,
                                                    ),
                                                )
                                                .join(", "),
                                        })}
                                    </Badge>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto px-0"
                                        onClick={onOpenPlugins}
                                    >
                                        {t("openPlugins")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
