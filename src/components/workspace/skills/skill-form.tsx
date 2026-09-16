"use client";

import { ArrowLeft, FileVideo, Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    canRun,
    isFileParam,
    isFileValue,
    type SkillParamErrors,
    type SkillParamValue,
    type SkillParamValues,
    type SkillParamView,
    type SkillUploadView,
} from "./skill-view";

interface SkillFormProps {
    skillId: string;
    params: SkillParamView[];
    values: SkillParamValues;
    errors: SkillParamErrors;
    upload: SkillUploadView | null;
    /** Max concurrent runs, set when the server refused the run as busy. */
    busyMax: number | null;
    onChange: (key: string, value: SkillParamValue) => void;
    onPickFile: (key: string, file: File) => void;
    onCancelUpload: () => void;
    onRun: () => void;
    onBack: () => void;
}

const ACCEPT = { video: "video/*", image: "image/*", audio: "audio/*" };

/** Parameter form generated from a skill manifest. */
export function SkillForm({
    skillId,
    params,
    values,
    errors,
    upload,
    busyMax,
    onChange,
    onPickFile,
    onCancelUpload,
    onRun,
    onBack,
}: SkillFormProps) {
    const t = useTranslations("Skills");
    const baseId = useId();
    const ready = canRun(params, values, upload);
    // Focus lands on the first rejected field when the server refused the
    // params; otherwise on the first field.
    const focusKey =
        params.find((p) => errors[p.key])?.key ?? params[0]?.key ?? null;

    return (
        <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
                e.preventDefault();
                if (ready) onRun();
            }}
        >
            <div>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="-ml-2"
                    onClick={onBack}
                >
                    <ArrowLeft aria-hidden="true" />
                    {t("back")}
                </Button>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                    {t(`skills.${skillId}.name`)}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t(`skills.${skillId}.description`)}
                </p>
            </div>

            {params.map((param) => {
                const id = `${baseId}-${param.key}`;
                const hintId = `${id}-hint`;
                const errorId = `${id}-error`;
                const label = t(`skills.${skillId}.params.${param.key}.label`);
                const hint = t(`skills.${skillId}.params.${param.key}.hint`);
                const reason = errors[param.key];
                const value = values[param.key];
                const describedBy = reason ? `${hintId} ${errorId}` : hintId;
                return (
                    <div
                        key={param.key}
                        className="flex flex-col gap-2"
                        data-param={param.key}
                    >
                        <Label htmlFor={id}>
                            {label}
                            {param.required && (
                                <span className="text-destructive">
                                    <span aria-hidden="true">*</span>
                                    <span className="sr-only">
                                        {` (${t("required")})`}
                                    </span>
                                </span>
                            )}
                        </Label>
                        {isFileParam(param.type) ? (
                            <FileField
                                id={id}
                                accept={ACCEPT[param.type]}
                                chooseLabel={t(
                                    param.type === "video"
                                        ? "chooseVideo"
                                        : param.type === "image"
                                          ? "chooseImage"
                                          : "chooseAudio",
                                )}
                                replaceLabel={t("replaceFile")}
                                value={isFileValue(value) ? value : null}
                                uploading={
                                    upload?.paramKey === param.key
                                        ? upload
                                        : null
                                }
                                uploadingLabel={
                                    upload?.paramKey === param.key
                                        ? t("uploading", {
                                              name: upload.name,
                                              percent: upload.percent,
                                          })
                                        : ""
                                }
                                cancelLabel={t("cancelUpload")}
                                invalid={Boolean(reason)}
                                describedBy={describedBy}
                                autoFocus={param.key === focusKey}
                                onPick={(file) => onPickFile(param.key, file)}
                                onCancel={onCancelUpload}
                            />
                        ) : param.type === "enum" ? (
                            <Select
                                value={typeof value === "string" ? value : ""}
                                onValueChange={(v) => onChange(param.key, v)}
                            >
                                <SelectTrigger
                                    id={id}
                                    aria-invalid={Boolean(reason)}
                                    aria-describedby={describedBy}
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {(param.options ?? []).map((opt) => (
                                        <SelectItem key={opt} value={opt}>
                                            {t(
                                                `skills.${skillId}.params.${param.key}.options.${opt}`,
                                            )}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                id={id}
                                type={
                                    param.type === "number" ? "number" : "text"
                                }
                                inputMode={
                                    param.type === "number"
                                        ? "decimal"
                                        : undefined
                                }
                                min={param.min}
                                max={param.max}
                                step={param.step}
                                autoFocus={param.key === focusKey}
                                aria-invalid={Boolean(reason)}
                                aria-describedby={describedBy}
                                value={
                                    value === undefined || isFileValue(value)
                                        ? ""
                                        : String(value)
                                }
                                onChange={(e) =>
                                    onChange(
                                        param.key,
                                        param.type === "number"
                                            ? e.target.value === ""
                                                ? undefined
                                                : Number(e.target.value)
                                            : e.target.value,
                                    )
                                }
                            />
                        )}
                        <p
                            id={hintId}
                            className="text-xs text-muted-foreground"
                        >
                            {hint}
                        </p>
                        {reason && (
                            <p
                                id={errorId}
                                role="alert"
                                className="text-sm text-destructive"
                            >
                                {t(`invalid.${reason}`, {
                                    min: param.min ?? "",
                                    max: param.max ?? "",
                                })}
                            </p>
                        )}
                    </div>
                );
            })}

            {busyMax !== null && (
                <p
                    role="status"
                    className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground"
                >
                    {t("busy", { max: busyMax })}
                </p>
            )}

            <Button type="submit" disabled={!ready} className="w-full">
                {t("run")}
            </Button>
        </form>
    );
}

interface FileFieldProps {
    id: string;
    accept: string;
    chooseLabel: string;
    replaceLabel: string;
    value: { fileKey: string; name: string } | null;
    uploading: SkillUploadView | null;
    uploadingLabel: string;
    cancelLabel: string;
    invalid: boolean;
    describedBy: string;
    autoFocus: boolean;
    onPick: (file: File) => void;
    onCancel: () => void;
}

function FileField({
    id,
    accept,
    chooseLabel,
    replaceLabel,
    value,
    uploading,
    uploadingLabel,
    cancelLabel,
    invalid,
    describedBy,
    autoFocus,
    onPick,
    onCancel,
}: FileFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    if (uploading) {
        return (
            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <p className="text-sm text-foreground">{uploadingLabel}</p>
                <Progress
                    value={uploading.percent}
                    aria-label={uploadingLabel}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-start"
                    onClick={onCancel}
                >
                    {cancelLabel}
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <input
                ref={inputRef}
                id={id}
                type="file"
                accept={accept}
                className="sr-only"
                aria-invalid={invalid}
                aria-describedby={describedBy}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onPick(file);
                    e.target.value = "";
                }}
            />
            <Button
                type="button"
                variant="outline"
                autoFocus={autoFocus}
                onClick={() => inputRef.current?.click()}
                aria-invalid={invalid}
            >
                <Upload aria-hidden="true" />
                {value ? replaceLabel : chooseLabel}
            </Button>
            {value && (
                <span className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
                    <FileVideo
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                    />
                    <span className="truncate">{value.name}</span>
                </span>
            )}
        </div>
    );
}
