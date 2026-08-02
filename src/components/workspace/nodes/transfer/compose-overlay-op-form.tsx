/**
 * Expanded per-kind form for a single compose-overlay op (design state 4).
 * Time (start/end) inputs render only when the connected media is a video.
 */

import { useTranslations } from "next-intl";
import type { ChangeEvent, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { OverlayOp } from "./compose-overlay-ops-editor";

const ANCHORS = [
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
] as const;

const ALIGNS = ["left", "center", "right"] as const;
const SAFE_ZONE_PRESETS = ["tiktok-portrait", "custom"] as const;

/* ------------------------------------------------------------------ */
/* Small form controls                                                 */
/* ------------------------------------------------------------------ */

interface FieldProps {
    label: string;
    children: ReactNode;
}

const Field = ({ label, children }: FieldProps) => (
    <div className="min-w-0 flex-1 space-y-1">
        <Label className="text-[10px] leading-tight text-muted-foreground">
            {label}
        </Label>
        {children}
    </div>
);

interface NumberFieldProps {
    label: string;
    value: number | undefined;
    onChange: (value: number | undefined) => void;
    step?: number;
    testId?: string;
}

const NumberField = ({
    label,
    value,
    onChange,
    step = 0.01,
    testId,
}: NumberFieldProps) => (
    <Field label={label}>
        <Input
            type="number"
            step={step}
            className="h-7 px-2 text-xs nodrag"
            data-testid={testId}
            value={value ?? ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const raw = e.target.value;
                onChange(raw === "" ? undefined : Number(raw));
            }}
        />
    </Field>
);

interface SelectFieldProps {
    label: string;
    value: string | undefined;
    options: readonly string[];
    onChange: (value: string) => void;
    testId?: string;
}

const SelectField = ({
    label,
    value,
    options,
    onChange,
    testId,
}: SelectFieldProps) => (
    <Field label={label}>
        <select
            className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs nodrag"
            data-testid={testId}
            value={value ?? ""}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                onChange(e.target.value)
            }
        >
            {options.map((opt) => (
                <option key={opt} value={opt}>
                    {opt}
                </option>
            ))}
        </select>
    </Field>
);

interface ColorFieldProps {
    label: string;
    value: string | undefined;
    onChange: (value: string) => void;
}

const ColorField = ({ label, value, onChange }: ColorFieldProps) => (
    <Field label={label}>
        <div className="flex items-center gap-1.5">
            <span
                className="h-5 w-5 shrink-0 rounded border border-input"
                style={{ backgroundColor: value || "transparent" }}
            />
            <Input
                type="text"
                className="h-7 px-2 text-xs nodrag"
                value={value ?? ""}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                }
            />
        </div>
    </Field>
);

/* ------------------------------------------------------------------ */
/* Per-kind form                                                       */
/* ------------------------------------------------------------------ */

export interface OpFormProps {
    op: OverlayOp;
    isVideo: boolean;
    onPatch: (patch: Partial<OverlayOp>) => void;
}

export function OpForm({ op, isVideo, onPatch }: OpFormProps) {
    const t = useTranslations("Workspace.nodes.composeOverlay");

    const timeRow = isVideo ? (
        <div className="flex gap-2">
            <NumberField
                label={t("startLabel")}
                value={op.start}
                step={0.1}
                testId="op-start"
                onChange={(v) => onPatch({ start: v })}
            />
            <NumberField
                label={t("endLabel")}
                value={op.end}
                step={0.1}
                testId="op-end"
                onChange={(v) => onPatch({ end: v })}
            />
        </div>
    ) : null;

    const coordsRow = (
        <div className="flex gap-2">
            <NumberField
                label={t("xLabel")}
                value={op.x}
                onChange={(v) => onPatch({ x: v ?? 0 })}
            />
            <NumberField
                label={t("yLabel")}
                value={op.y}
                onChange={(v) => onPatch({ y: v ?? 0 })}
            />
        </div>
    );

    const anchorField = (
        <SelectField
            label={t("anchorLabel")}
            value={op.anchor}
            options={ANCHORS}
            onChange={(v) => onPatch({ anchor: v as OverlayOp["anchor"] })}
        />
    );

    return (
        <div className="space-y-2 rounded-md border border-border bg-muted/20 p-2">
            {(op.type === "text" || op.type === "price_tag") && (
                <>
                    <Field label={t("contentLabel")}>
                        <Textarea
                            className="min-h-14 text-xs nodrag"
                            data-testid="op-text-content"
                            value={op.text ?? ""}
                            onChange={(e) => onPatch({ text: e.target.value })}
                        />
                    </Field>
                    {coordsRow}
                    <div className="flex gap-2">
                        {anchorField}
                        <NumberField
                            label={t("sizeLabel")}
                            value={op.size}
                            onChange={(v) => onPatch({ size: v })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <ColorField
                            label={t("colorLabel")}
                            value={op.color}
                            onChange={(v) => onPatch({ color: v })}
                        />
                        <SelectField
                            label={t("alignLabel")}
                            value={op.align}
                            options={ALIGNS}
                            onChange={(v) =>
                                onPatch({ align: v as OverlayOp["align"] })
                            }
                        />
                    </div>
                    <div className="flex gap-2">
                        <NumberField
                            label={t("maxWidthLabel")}
                            value={op.max_width}
                            onChange={(v) => onPatch({ max_width: v })}
                        />
                        {op.type === "price_tag" ? (
                            <ColorField
                                label={t("bgColorLabel")}
                                value={op.bg_color}
                                onChange={(v) => onPatch({ bg_color: v })}
                            />
                        ) : (
                            <div className="flex-1" />
                        )}
                    </div>
                    {op.type === "price_tag" && (
                        <div className="flex gap-2">
                            <NumberField
                                label={t("paddingLabel")}
                                value={op.padding}
                                onChange={(v) => onPatch({ padding: v })}
                            />
                            <NumberField
                                label={t("radiusLabel")}
                                value={op.radius}
                                onChange={(v) => onPatch({ radius: v })}
                            />
                        </div>
                    )}
                    {timeRow}
                </>
            )}

            {op.type === "logo" && (
                <>
                    <p className="text-[10px] text-muted-foreground">
                        {t("logoFromHandleHint")}
                    </p>
                    {coordsRow}
                    <div className="flex gap-2">
                        {anchorField}
                        <NumberField
                            label={t("widthLabel")}
                            value={op.width}
                            onChange={(v) => onPatch({ width: v })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <NumberField
                            label={t("opacityLabel")}
                            value={op.opacity}
                            onChange={(v) => onPatch({ opacity: v })}
                        />
                        <div className="flex-1" />
                    </div>
                    {timeRow}
                </>
            )}

            {op.type === "safe_zone" && (
                // x/y are hidden: safe_zone stores x:0 / y:0 as inert filler
                // required by the merged ABI ops schema (see NEW_OP defaults).
                <>
                    <SelectField
                        label={t("presetLabel")}
                        value={op.preset}
                        options={SAFE_ZONE_PRESETS}
                        onChange={(v) =>
                            onPatch({ preset: v as OverlayOp["preset"] })
                        }
                    />
                    <div className="flex gap-2">
                        <NumberField
                            label={t("topLabel")}
                            value={op.top}
                            onChange={(v) => onPatch({ top: v })}
                        />
                        <NumberField
                            label={t("bottomLabel")}
                            value={op.bottom}
                            onChange={(v) => onPatch({ bottom: v })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <NumberField
                            label={t("leftLabel")}
                            value={op.left}
                            onChange={(v) => onPatch({ left: v })}
                        />
                        <NumberField
                            label={t("rightLabel")}
                            value={op.right}
                            onChange={(v) => onPatch({ right: v })}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
