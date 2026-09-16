"use client";

import { FolderOpen, Sparkles, Workflow, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { SkillForm } from "@/components/workspace/skills/skill-form";
import { SkillList } from "@/components/workspace/skills/skill-list";
import { SkillReplaceConfirm } from "@/components/workspace/skills/skill-replace-confirm";
import {
    SkillResult,
    SkillRunStatus,
} from "@/components/workspace/skills/skill-run";
import type {
    SkillCardView,
    SkillParamView,
    SkillStepView,
} from "@/components/workspace/skills/skill-view";

/**
 * Prototype for the skill panel (skill-system-v1).
 *
 * Context rung: `static-frame` — a static mock of the canvas chrome (left nav
 * with the new Skill button, an empty board) around the REAL panel components
 * that will ship, held open in the real Sheet primitive. The shipped panel
 * lives in `workspace-left-nav.tsx`, whose React Flow stores are exactly what
 * this harness precedes.
 *
 * Fixtures only. No fetch, no upload, no write path. One `state` per row of
 * the state table in the design doc (§Đặc tả UX 3).
 */

export const SKILL_PROTO_STATES = [
    "danhsach-mac-dinh",
    "danhsach-thieu-plugin",
    "danhsach-dang-tai",
    "bieumau-chua-du",
    "bieumau-dang-tai-len",
    "bieumau-loi-tham-so",
    "bieumau-ban",
    "chay-dang-chay",
    "ketqua-xong",
    "ketqua-loi",
    "kehoach-xac-nhan",
] as const;

const ALL_READY: SkillCardView[] = [
    { id: "cat-canh-video", missingSlots: [] },
    { id: "tach-tieng-video", missingSlots: [] },
];

const ONE_BLOCKED: SkillCardView[] = [
    { id: "cat-canh-video", missingSlots: ["split-video"] },
    { id: "tach-tieng-video", missingSlots: [] },
];

const CAT_CANH_PARAMS: SkillParamView[] = [
    { key: "video", type: "video", required: true },
    {
        key: "do-nhay",
        type: "number",
        required: false,
        min: 5,
        max: 60,
        step: 1,
    },
];

const TACH_TIENG_PARAMS: SkillParamView[] = [
    { key: "video", type: "video", required: true },
];

const VIDEO = { fileKey: "proto/tour-can-ho.mp4", name: "tour-can-ho.mp4" };

const STEPS_RUNNING: SkillStepView[] = [
    { nodeId: "n1", slot: "extract-audio", status: "done" },
    { nodeId: "n2", slot: "remove-video-audio", status: "running" },
];

const STEPS_DONE: SkillStepView[] = [
    { nodeId: "n1", slot: "extract-audio", status: "done" },
    { nodeId: "n2", slot: "remove-video-audio", status: "done" },
];

const STEPS_FAILED: SkillStepView[] = [
    { nodeId: "n1", slot: "extract-audio", status: "done" },
    { nodeId: "n2", slot: "remove-video-audio", status: "failed" },
];

const noop = () => {};

function Screen({ state }: { state: string }) {
    switch (state) {
        case "danhsach-mac-dinh":
            return (
                <SkillList
                    skills={ALL_READY}
                    loading={false}
                    onSelect={noop}
                    onOpenPlugins={noop}
                />
            );
        case "danhsach-thieu-plugin":
            return (
                <SkillList
                    skills={ONE_BLOCKED}
                    loading={false}
                    onSelect={noop}
                    onOpenPlugins={noop}
                />
            );
        case "danhsach-dang-tai":
            return (
                <SkillList
                    skills={[]}
                    loading={true}
                    onSelect={noop}
                    onOpenPlugins={noop}
                />
            );
        case "bieumau-chua-du":
            return (
                <SkillForm
                    skillId="cat-canh-video"
                    params={CAT_CANH_PARAMS}
                    values={{ "do-nhay": 27 }}
                    errors={{}}
                    upload={null}
                    busyMax={null}
                    onChange={noop}
                    onPickFile={noop}
                    onCancelUpload={noop}
                    onRun={noop}
                    onBack={noop}
                />
            );
        case "bieumau-dang-tai-len":
            return (
                <SkillForm
                    skillId="tach-tieng-video"
                    params={TACH_TIENG_PARAMS}
                    values={{}}
                    errors={{}}
                    upload={{
                        paramKey: "video",
                        name: VIDEO.name,
                        percent: 42,
                    }}
                    busyMax={null}
                    onChange={noop}
                    onPickFile={noop}
                    onCancelUpload={noop}
                    onRun={noop}
                    onBack={noop}
                />
            );
        case "bieumau-loi-tham-so":
            return (
                <SkillForm
                    skillId="cat-canh-video"
                    params={CAT_CANH_PARAMS}
                    values={{ video: VIDEO, "do-nhay": 90 }}
                    errors={{ "do-nhay": "range" }}
                    upload={null}
                    busyMax={null}
                    onChange={noop}
                    onPickFile={noop}
                    onCancelUpload={noop}
                    onRun={noop}
                    onBack={noop}
                />
            );
        case "bieumau-ban":
            return (
                <SkillForm
                    skillId="tach-tieng-video"
                    params={TACH_TIENG_PARAMS}
                    values={{ video: VIDEO }}
                    errors={{}}
                    upload={null}
                    busyMax={3}
                    onChange={noop}
                    onPickFile={noop}
                    onCancelUpload={noop}
                    onRun={noop}
                    onBack={noop}
                />
            );
        case "chay-dang-chay":
            return (
                <SkillRunStatus
                    skillId="tach-tieng-video"
                    steps={STEPS_RUNNING}
                />
            );
        case "ketqua-xong":
        case "kehoach-xac-nhan":
            return (
                <SkillResult
                    skillId="tach-tieng-video"
                    outcome="done"
                    steps={STEPS_DONE}
                    outputs={[
                        {
                            key: "tieng",
                            kind: "audio",
                            values: ["/api/uploads/proto/tieng.mp3"],
                        },
                        {
                            key: "video-cam",
                            kind: "video",
                            values: ["/api/uploads/proto/video-cam.mp4"],
                        },
                    ]}
                    onViewPlan={noop}
                    onNewRun={noop}
                    onRerun={noop}
                    onBackToForm={noop}
                />
            );
        case "ketqua-loi":
            return (
                <SkillResult
                    skillId="tach-tieng-video"
                    outcome="failed"
                    steps={STEPS_FAILED}
                    outputs={[]}
                    onViewPlan={noop}
                    onNewRun={noop}
                    onRerun={noop}
                    onBackToForm={noop}
                />
            );
        default:
            return <p>{`unknown:${state}`}</p>;
    }
}

const NAV_BTN =
    "h-10 w-10 rounded-xl bg-white border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200";

export function SkillSystemV1Proto({ state }: { state: string }) {
    const t = useTranslations("Skills");
    const known = (SKILL_PROTO_STATES as readonly string[]).includes(state);
    const resolved = known ? state : `unknown:${state}`;

    return (
        <div
            data-proto-state={resolved}
            className="relative min-h-screen bg-muted/40"
        >
            {/* Static canvas chrome: the page's own heading lives in the panel. */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className={NAV_BTN}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    <Workflow className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={NAV_BTN}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    <Zap className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={NAV_BTN}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    <FolderOpen className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className={`${NAV_BTN} ring-2 ring-primary`}
                    tabIndex={-1}
                    aria-hidden="true"
                >
                    <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                </Button>
            </div>

            <Sheet open modal={false}>
                <SheetContent
                    side="left"
                    className="w-full overflow-y-auto sm:max-w-md"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <SheetHeader>
                        <SheetTitle asChild>
                            <h1 className="text-xl font-semibold text-foreground">
                                {t("title")}
                            </h1>
                        </SheetTitle>
                        <SheetDescription>{t("subtitle")}</SheetDescription>
                    </SheetHeader>
                    <div className="px-4 pb-6">
                        {known ? <Screen state={state} /> : <p>{resolved}</p>}
                    </div>
                </SheetContent>
            </Sheet>

            <SkillReplaceConfirm
                open={state === "kehoach-xac-nhan"}
                onReplace={noop}
                onCancel={noop}
            />
        </div>
    );
}
