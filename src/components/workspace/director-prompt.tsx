"use client";

/**
 * Director prompt panel: intent in, workflow graph out (Gate 1).
 * A successful `/api/director` response is applied through the exact same
 * path as the bundled example loader in workspace.tsx — parseWorkflowImportJson
 * followed by the four useFlow setters. This component never triggers
 * execution; it only stages a graph on the canvas for the user to review.
 */
import { useReactFlow } from "@xyflow/react";
import { Sparkles, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    type ChangeEvent,
    type KeyboardEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
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

/** Client-side ceiling on a Director request: two attempts against a
 * thinking-enabled model can legitimately run for minutes, but an upstream
 * stall must still leave the user a way out. */
const REQUEST_TIMEOUT_MS = 3 * 60 * 1000;

export default function DirectorPrompt() {
    const t = useTranslations("Director");
    const { fitView } = useReactFlow();
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<Status>("ready");
    // The vendored PromptInput clears its textarea on every submit, whether
    // the request succeeds or fails. We keep the real draft here instead so a
    // failed request never loses what the user typed; PromptInputTextarea is
    // driven from this state and only cleared where clearing is correct.
    const [draft, setDraft] = useState("");
    // Result awaiting confirm-replace because the canvas already has nodes.
    const [pending, setPending] = useState<DirectorSuccess | null>(null);
    // In-flight request's controller, so the X button / Escape can cancel it
    // instead of being disabled for the whole request (Fix 3).
    const abortControllerRef = useRef<AbortController | null>(null);
    // True only while the current abort was requested by the user (X /
    // Escape) rather than the request timeout — distinguishes a silent,
    // user-initiated cancel from a timeout or a genuine network failure,
    // both of which must still surface the UPSTREAM_ERROR toast.
    const userAbortedRef = useRef(false);
    // Bumped every time `apply` commits a new graph to the canvas. The
    // compiler lays generated nodes out at a fixed {x: 0, y: 0}-rooted grid,
    // unrelated to wherever the user last left the viewport, so an applied
    // graph must be reframed or it can land entirely off-screen.
    const [appliedAt, setAppliedAt] = useState(0);

    // Frame the freshly applied graph, but only once React has committed the
    // new nodes that setNodes/setEdges below just pushed into the store —
    // fitView() itself waits for React Flow to finish measuring every node
    // (its internal fitViewQueued flag resolves once nodesInitialized), but
    // calling it must still happen after this component's own render for the
    // new appliedAt value has committed, not synchronously inside `apply`.
    useEffect(() => {
        if (appliedAt === 0) return;
        void fitView({ padding: 0.2, duration: 400 });
    }, [appliedAt, fitView]);

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
                setAppliedAt((n) => n + 1);
                toast.success(t("applied"));
                setPending(null);
                setOpen(false);
                setDraft("");
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
            userAbortedRef.current = false;
            const controller = new AbortController();
            abortControllerRef.current = controller;
            const timeoutId = setTimeout(
                () => controller.abort(),
                REQUEST_TIMEOUT_MS,
            );
            try {
                const res = await fetch("/api/director", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ prompt }),
                    signal: controller.signal,
                });

                let json: DirectorSuccess | DirectorErrorBody;
                try {
                    json = await res.json();
                } catch {
                    // A user-requested abort can land here too (mid-body-read
                    // after the response headers already arrived) — stay
                    // silent for that case, same as the outer catch below.
                    if (userAbortedRef.current) return;
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
                // Fetch itself rejects (AbortError) for both a user cancel
                // and the timeout above; only the user-cancel case is
                // silent — `close()` already reset status/UI for it. A
                // timeout or a genuine network failure still needs the
                // toast.
                if (userAbortedRef.current) return;
                showErrorToast({ message: t("errors.UPSTREAM_ERROR") });
                setStatus("error");
            } finally {
                clearTimeout(timeoutId);
                if (abortControllerRef.current === controller) {
                    abortControllerRef.current = null;
                }
            }
        },
        [apply, t],
    );

    const close = useCallback(() => {
        if (status === "submitted") {
            userAbortedRef.current = true;
            abortControllerRef.current?.abort();
            setStatus("ready");
        }
        setOpen(false);
    }, [status]);

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "Escape") close();
        },
        [close],
    );

    const handleDraftChange = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => setDraft(e.target.value),
        [],
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
                                value={draft}
                                onChange={handleDraftChange}
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
                        onClick={() => {
                            // Clear a stale error indicator from a prior session.
                            setStatus("ready");
                            setOpen(true);
                        }}
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
