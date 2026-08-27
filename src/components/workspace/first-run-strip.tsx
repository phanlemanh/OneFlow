"use client";

import { AlertTriangle, Check, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * First-run guidance strip.
 *
 * Presentational only: every piece of state arrives as a prop. The readiness
 * hook, the install call and the provisioning event stream all land in
 * implementation — keeping this component pure is what lets the design-pass
 * prototype render all six states from fixtures without a server.
 *
 * Never a gate: the strip sits above the canvas and the canvas stays fully
 * interactive behind it (AC-13). No modal, no overlay, no focus trap.
 *
 * The strip speaks in CAPABILITIES ("scene splitting"), never in plugin ids.
 * A package name is the developer's word for the thing; the person this
 * onboarding exists for has no idea what ffmpeg is, and a line of ids reads to
 * them as noise rather than as information. Resolving a slot to its human label
 * is the caller's job, which is why this component takes the labels already
 * resolved.
 */

/** The milestones the executor emits while building a plugin's environment. */
export type ProvisioningMilestone =
    | "creating-venv"
    | "installing-sdk"
    | "installing-requirements";

export type FirstRunState =
    | { phase: "missing-plugins"; capabilities: string[]; downloadMb: number }
    | { phase: "installing"; capabilities: string[]; installed: number }
    | {
          phase: "provisioning";
          milestone: ProvisioningMilestone;
          elapsedSec: number;
      }
    | { phase: "ready" }
    /**
     * `reason` is read aloud to a first-run seller, so it carries the same ban
     * the rest of this surface carries: no implementation nouns. Not just
     * plugin ids — "GitHub", "venv", "pip", "registry" and their kin are all
     * words this audience does not have. Say what failed in product terms
     * ("không tải được công cụ về máy") and what to check; the retry control
     * next to it already supplies the next move.
     */
    | { phase: "blocked"; reason: string; retryable: boolean };

export interface FirstRunStripProps {
    state: FirstRunState;
    labels: FirstRunStripLabels;
    onPrepare?: () => void;
    onRetry?: () => void;
}

export interface FirstRunStripLabels {
    missingTitle: (count: number, mb: number) => string;
    missingBody: (capabilities: string[]) => string;
    prepare: string;
    installing: (done: number, total: number) => string;
    milestone: Record<ProvisioningMilestone, string>;
    elapsed: (sec: number) => string;
    ready: string;
    blocked: string;
    retry: string;
}

/**
 * Milestones in the order the executor reaches them. Rendered as a trail so the
 * steps already completed stay visible — a bare spinner cannot be told apart
 * from a hang, and this wait runs for minutes (AC-8).
 */
const MILESTONE_ORDER: ProvisioningMilestone[] = [
    "creating-venv",
    "installing-sdk",
    "installing-requirements",
];

export function FirstRunStrip({
    state,
    labels,
    onPrepare,
    onRetry,
}: FirstRunStripProps) {
    return (
        <output
            aria-live="polite"
            className={cn(
                "pointer-events-auto flex w-full max-w-3xl gap-3",
                // Stacks when the viewport is narrow. NOT a mobile affordance —
                // OneFlow is a desktop canvas and small screens are out of scope.
                // This is for a narrowed desktop window (split screen, a docked
                // panel), where a single row truncated the title and the whole
                // capability list, leaving a button with no stated reason to
                // press it. `truncate` fails silently: it keeps the layout tidy
                // while deleting the very information AC-4 requires.
                "flex-col items-stretch sm:flex-row sm:items-center",
                // Semantic surface tokens, not raw palette colours. Pairing
                // `text-muted-foreground` with `dark:bg-gray-800` put a foreground
                // tuned for --card on a lighter, blue-tinted surface: axe measured
                // 2.98:1 in dark. --card/--card-foreground move together.
                "rounded-lg border bg-card text-card-foreground px-4 py-3 shadow-sm",
            )}
        >
            {state.phase === "missing-plugins" ? (
                <>
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                            {labels.missingTitle(
                                state.capabilities.length,
                                state.downloadMb,
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {labels.missingBody(state.capabilities)}
                        </p>
                    </div>
                    <Button
                        size="sm"
                        className="w-full shrink-0 sm:w-auto"
                        onClick={onPrepare}
                    >
                        {labels.prepare}
                    </Button>
                </>
            ) : null}

            {state.phase === "installing" ? (
                <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    <p className="min-w-0 flex-1 truncate text-sm">
                        {labels.installing(
                            state.installed,
                            state.capabilities.length,
                        )}
                    </p>
                </>
            ) : null}

            {state.phase === "provisioning" ? (
                <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                            {MILESTONE_ORDER.map((m) => {
                                const reached =
                                    MILESTONE_ORDER.indexOf(m) <=
                                    MILESTONE_ORDER.indexOf(state.milestone);
                                const current = m === state.milestone;
                                return (
                                    <li
                                        key={m}
                                        aria-current={
                                            current ? "step" : undefined
                                        }
                                        className={cn(
                                            "flex items-center gap-1",
                                            current && "font-medium",
                                            // No opacity dimming: muted-
                                            // foreground at 60% measured
                                            // 2.29:1 on white and 3.31:1 on
                                            // the dark surface. Reached-ness
                                            // is already carried by the check
                                            // icon and the weight of the
                                            // current step, which are stronger
                                            // signals than fading text anyway.
                                            reached
                                                ? "text-foreground"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {reached && !current ? (
                                            <Check className="h-3 w-3" />
                                        ) : null}
                                        {labels.milestone[m]}
                                    </li>
                                );
                            })}
                        </ol>
                        <p className="text-xs text-muted-foreground">
                            {labels.elapsed(state.elapsedSec)}
                        </p>
                    </div>
                </>
            ) : null}

            {state.phase === "ready" ? (
                <>
                    <Check className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="min-w-0 flex-1 truncate text-sm">
                        {labels.ready}
                    </p>
                </>
            ) : null}

            {state.phase === "blocked" ? (
                <>
                    <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{labels.blocked}</p>
                        <p className="text-xs text-muted-foreground">
                            {state.reason}
                        </p>
                    </div>
                    {state.retryable ? (
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full shrink-0 sm:w-auto"
                            onClick={onRetry}
                        >
                            {labels.retry}
                        </Button>
                    ) : null}
                </>
            ) : null}
        </output>
    );
}
