/**
 * Ops editor for the compose-overlay node: op rows (type chip + one-line
 * summary + video-only time badge), a 4-kind add-op menu, and the expanded
 * per-kind form (`OpForm`). Pure presentational — the parent owns the ops
 * array.
 */

import { Pencil, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ComposeOverlayInput } from "@/generated/abi";
import { cn } from "@/lib/utils";

import { OpForm } from "./compose-overlay-op-form";

export type OverlayOp = ComposeOverlayInput["ops"][number];
export type OverlayOpKind = OverlayOp["type"];
/** Modality connected on `in:media`; null = nothing connected yet. */
export type OverlayMediaKind = "image" | "video" | null;

const OP_KINDS = ["text", "price_tag", "logo", "safe_zone"] as const;

const KIND_LABEL_KEY: Record<OverlayOpKind, string> = {
    text: "kindText",
    price_tag: "kindPriceTag",
    logo: "kindLogo",
    safe_zone: "kindSafeZone",
};

const CHIP_LABEL_KEY: Record<OverlayOpKind, string> = {
    text: "chipText",
    price_tag: "chipPriceTag",
    logo: "chipLogo",
    safe_zone: "chipSafeZone",
};

/**
 * Defaults for a freshly added op. `safe_zone` stores `x: 0, y: 0` as inert
 * filler — the coords are required by the merged ABI ops schema but unused by
 * that kind (its form hides them).
 */
const NEW_OP: Record<OverlayOpKind, OverlayOp> = {
    text: {
        type: "text",
        x: 0.5,
        y: 0.12,
        anchor: "top-center",
        text: "",
        size: 0.05,
        color: "#FFFFFF",
        align: "center",
        max_width: 0.8,
    },
    price_tag: {
        type: "price_tag",
        x: 0.5,
        y: 0.82,
        anchor: "bottom-center",
        text: "{text}",
        size: 0.06,
        color: "#FFFFFF",
        align: "center",
        bg_color: "#E11D48",
        padding: 0.02,
        radius: 0.01,
    },
    logo: {
        type: "logo",
        x: 0.95,
        y: 0.05,
        anchor: "top-right",
        width: 0.18,
        opacity: 1,
    },
    safe_zone: {
        type: "safe_zone",
        x: 0,
        y: 0,
        preset: "tiktok-portrait",
    },
};

export interface ComposeOverlayOpsEditorProps {
    ops: OverlayOp[];
    onChange: (next: OverlayOp[]) => void;
    mediaKind: OverlayMediaKind;
    /** Whether `in:logo` currently has an upstream image connected. */
    logoConnected: boolean;
}

/* ------------------------------------------------------------------ */
/* Row summaries                                                       */
/* ------------------------------------------------------------------ */

function opSummary(
    op: OverlayOp,
    logoConnected: boolean,
    t: (key: string) => string,
): string {
    switch (op.type) {
        case "text":
            return `"${op.text ?? ""}" · ${op.x}, ${op.y}`;
        case "price_tag":
            return `"${op.text ?? ""}" · ${op.bg_color ?? ""} · ${op.x}, ${op.y}`;
        case "logo":
            return logoConnected
                ? `${t("fromLogoHandle")} · ${op.width ?? ""} · ${op.anchor ?? ""}`
                : t("logoMissingSummary");
        case "safe_zone":
            return op.preset ?? "";
        default:
            return "";
    }
}

function timeBadge(op: OverlayOp, t: (key: string) => string): string {
    if (op.start === undefined && op.end === undefined) return t("fullVideo");
    return `${op.start ?? 0}–${op.end ?? "…"}s`;
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

export function ComposeOverlayOpsEditor({
    ops,
    onChange,
    mediaKind,
    logoConnected,
}: ComposeOverlayOpsEditorProps) {
    const t = useTranslations("Workspace.nodes.composeOverlay");
    const [expanded, setExpanded] = useState<number | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const isVideo = mediaKind === "video";

    const addOp = (kind: OverlayOpKind) => {
        onChange([...ops, NEW_OP[kind]]);
        setMenuOpen(false);
    };
    const patchOp = (index: number, patch: Partial<OverlayOp>) => {
        onChange(
            ops.map((op, i) =>
                i === index ? ({ ...op, ...patch } as OverlayOp) : op,
            ),
        );
    };
    const removeOp = (index: number) => {
        onChange(ops.filter((_, i) => i !== index));
        setExpanded(null);
    };

    const showAddMenu = ops.length === 0 || menuOpen;

    return (
        <div className="space-y-2">
            {ops.length === 0 && (
                <p className="text-xs text-muted-foreground">{t("empty")}</p>
            )}

            {ops.map((op, index) => {
                const isLogoError = op.type === "logo" && !logoConnected;
                return (
                    // Ops carry no stable id; list order is their identity.
                    <div key={index} className="space-y-2">
                        <div
                            data-testid="op-row"
                            data-op-kind={op.type}
                            data-op-error={isLogoError ? "true" : "false"}
                            className={cn(
                                "flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1.5",
                                isLogoError &&
                                    "border-destructive/60 bg-destructive/10",
                            )}
                        >
                            <span
                                className={cn(
                                    "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
                                    isLogoError
                                        ? "bg-destructive/20 text-destructive"
                                        : "bg-primary/10 text-primary",
                                )}
                            >
                                {t(CHIP_LABEL_KEY[op.type])}
                            </span>
                            <span
                                className={cn(
                                    "min-w-0 flex-1 truncate text-xs",
                                    isLogoError && "text-destructive",
                                )}
                            >
                                {opSummary(op, logoConnected, t)}
                            </span>
                            {isVideo && op.type !== "safe_zone" && (
                                <span
                                    data-testid="op-time"
                                    className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                >
                                    {timeBadge(op, t)}
                                </span>
                            )}
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 shrink-0 p-0 nodrag"
                                data-testid={`op-edit-${index}`}
                                title={t("editOp")}
                                onClick={() =>
                                    setExpanded(
                                        expanded === index ? null : index,
                                    )
                                }
                            >
                                <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 shrink-0 p-0 nodrag"
                                data-testid={`op-remove-${index}`}
                                title={t("removeOp")}
                                onClick={() => removeOp(index)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>

                        {expanded === index && (
                            <OpForm
                                op={op}
                                isVideo={isVideo}
                                onPatch={(patch) => patchOp(index, patch)}
                            />
                        )}
                    </div>
                );
            })}

            {ops.length > 0 && (
                <Button
                    size="sm"
                    variant="outline"
                    className="w-full nodrag"
                    data-testid="add-op-toggle"
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <Plus className="h-3 w-3" />
                    {t("addOp")}
                </Button>
            )}

            {showAddMenu && (
                <div className="grid grid-cols-2 gap-2">
                    {OP_KINDS.map((kind) => (
                        <Button
                            key={kind}
                            size="sm"
                            variant="secondary"
                            className="nodrag"
                            data-testid={`add-op-${kind}`}
                            onClick={() => addOp(kind)}
                        >
                            <Plus className="h-3 w-3" />
                            {t(KIND_LABEL_KEY[kind])}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
