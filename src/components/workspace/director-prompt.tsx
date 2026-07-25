"use client";

/**
 * Director prompt panel: intent in, workflow graph out (Gate 1).
 * A successful `/api/director` response is applied through the exact same
 * path as the bundled example loader in workspace.tsx — parseWorkflowImportJson
 * followed by the four useFlow setters. This component never triggers
 * execution; it only stages a graph on the canvas for the user to review.
 */
import { Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useCallback, useState } from "react";
import toast from "react-hot-toast";
import {
    PromptInput,
    PromptInputSubmit,
    PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/components/ui/error-toast";
import { useFlow } from "@/hooks/use-flow";
import type { DirectorErrorCode } from "@/lib/director/director-core";
import { logger } from "@/lib/logger";
import { parseWorkflowImportJson } from "@/lib/workflow/exporter";

interface DirectorSuccess {
    name: string;
    description: string;
    nodes: unknown[];
    edges: unknown[];
}

interface DirectorErrorBody {
    error: { code: DirectorErrorCode; message: string; details?: unknown };
}

/** Subset of AI Elements' ChatStatus this panel actually produces. */
type Status = "ready" | "submitted" | "error";

export default function DirectorPrompt() {
    const t = useTranslations("Director");
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<Status>("ready");
    // Result awaiting confirm-replace because the canvas already has nodes.
    const [pending, setPending] = useState<DirectorSuccess | null>(null);

    const apply = useCallback(
        (result: DirectorSuccess) => {
            try {
                const parsed = parseWorkflowImportJson(result);
                const flow = useFlow.getState();
                flow.setNodes(parsed.nodes);
                flow.setEdges(parsed.edges);
                if (parsed.name) flow.setWorkflowName(parsed.name);
                if (parsed.description) {
                    flow.setWorkflowDescription(parsed.description);
                }
                toast.success(t("applied"));
                setPending(null);
                setOpen(false);
            } catch (e) {
                logger.error("Failed to apply Director workflow:", e);
                showErrorToast({ message: t("errors.PLAN_INVALID") });
                setPending(null);
            }
        },
        [t],
    );

    const submit = useCallback(
        async (text: string) => {
            const prompt = text.trim();
            if (!prompt) return;
            setStatus("submitted");
            try {
                const res = await fetch("/api/director", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ prompt }),
                });

                let json: DirectorSuccess | DirectorErrorBody;
                try {
                    json = await res.json();
                } catch {
                    showErrorToast({ message: t("errors.UPSTREAM_ERROR") });
                    setStatus("error");
                    return;
                }

                if (!res.ok || "error" in json) {
                    const code =
                        "error" in json ? json.error.code : "UPSTREAM_ERROR";
                    showErrorToast({ message: t(`errors.${code}`) });
                    setStatus("error");
                    return;
                }

                setStatus("ready");
                if (useFlow.getState().nodes.length > 0) {
                    setPending(json);
                } else {
                    apply(json);
                }
            } catch {
                showErrorToast({ message: t("errors.UPSTREAM_ERROR") });
                setStatus("error");
            }
        },
        [apply, t],
    );

    const close = useCallback(() => {
        if (status === "submitted") return;
        setOpen(false);
    }, [status]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Escape") close();
        },
        [close],
    );

    return (
        <>
            <div
                className="absolute left-1/2 top-5 z-10 -translate-x-1/2"
                onKeyDown={handleKeyDown}
            >
                {open ? (
                    <div className="w-[560px] rounded-xl border bg-background shadow-lg">
                        <div className="flex items-center justify-between px-3 pt-2">
                            <span className="flex items-center gap-1.5 text-sm font-medium">
                                <Sparkles className="h-4 w-4" />
                                {t("open")}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={close}
                                disabled={status === "submitted"}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <PromptInput
                            onSubmit={(message, event) => {
                                event.preventDefault();
                                void submit(message.text);
                            }}
                        >
                            <PromptInputTextarea
                                placeholder={t("placeholder")}
                                disabled={status === "submitted"}
                            />
                            <PromptInputSubmit
                                status={status}
                                disabled={status === "submitted"}
                            />
                        </PromptInput>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-1.5 rounded-full shadow"
                        onClick={() => setOpen(true)}
                    >
                        <Sparkles className="h-4 w-4" />
                        {t("open")}
                    </Button>
                )}
            </div>

            <AlertDialog
                open={pending !== null}
                onOpenChange={(v) => {
                    if (!v) setPending(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("replaceTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("replaceDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            {t("replaceCancel")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pending) apply(pending);
                            }}
                        >
                            {t("replaceConfirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
