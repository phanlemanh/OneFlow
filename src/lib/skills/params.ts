import type { SkillManifest, SkillParam, SkillParamValue } from "./types";

export const SKILL_PARAM_REASONS = [
    "required",
    "type",
    "range",
    "option",
    "unknown",
] as const;
export type SkillParamReason = (typeof SKILL_PARAM_REASONS)[number];

export type ParamValidation =
    | { ok: true; params: Record<string, SkillParamValue> }
    | { ok: false; errors: { param: string; reason: SkillParamReason }[] };

function isFileValue(v: unknown): v is { fileKey: string; name: string } {
    return (
        typeof v === "object" &&
        v !== null &&
        typeof (v as { fileKey?: unknown }).fileKey === "string" &&
        (v as { fileKey: string }).fileKey.trim() !== "" &&
        typeof (v as { name?: unknown }).name === "string"
    );
}

function check(p: SkillParam, v: unknown): SkillParamReason | null {
    switch (p.type) {
        case "video":
        case "image":
        case "audio":
            return isFileValue(v) ? null : "type";
        case "text":
            return typeof v === "string" ? null : "type";
        case "number":
            if (typeof v !== "number" || !Number.isFinite(v)) return "type";
            if (
                (p.min !== undefined && v < p.min) ||
                (p.max !== undefined && v > p.max)
            )
                return "range";
            return null;
        case "enum":
            if (typeof v !== "string") return "type";
            return (p.options ?? []).includes(v) ? null : "option";
    }
}

export function validateParams(
    manifest: SkillManifest,
    raw: unknown,
): ParamValidation {
    const input =
        typeof raw === "object" && raw !== null && !Array.isArray(raw)
            ? (raw as Record<string, unknown>)
            : {};
    const errors: { param: string; reason: SkillParamReason }[] = [];
    const params: Record<string, SkillParamValue> = {};
    const known = new Set(manifest.params.map((p) => p.key));
    for (const key of Object.keys(input)) {
        if (!known.has(key)) errors.push({ param: key, reason: "unknown" });
    }
    for (const p of manifest.params) {
        const present = input[p.key] !== undefined && input[p.key] !== "";
        if (!present) {
            if (p.default !== undefined) params[p.key] = p.default;
            else if (p.required)
                errors.push({ param: p.key, reason: "required" });
            continue;
        }
        const reason = check(p, input[p.key]);
        if (reason) errors.push({ param: p.key, reason });
        else params[p.key] = input[p.key] as SkillParamValue;
    }
    return errors.length > 0 ? { ok: false, errors } : { ok: true, params };
}
