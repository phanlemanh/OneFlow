/**
 * View models of the skill panel.
 *
 * The panel's components are presentational: they receive these shapes and
 * callbacks, never fetch. The clickable prototype feeds them fixtures; the
 * shipped panel feeds them from `/api/skills` and the task SSE stream. Keeping
 * one set of props for both is what lets Gate 1 judge the markup that ships.
 */

export type SkillParamType =
    | "text"
    | "number"
    | "enum"
    | "video"
    | "image"
    | "audio";

export type SkillFileParamType = Extract<
    SkillParamType,
    "video" | "image" | "audio"
>;

export interface SkillCardView {
    id: string;
    /**
     * Slots in the manifest's `requires` that no installed plugin serves. The
     * panel names the STEP of each slot, never the slot or a plugin id.
     */
    missingSlots: string[];
}

export interface SkillParamView {
    key: string;
    type: SkillParamType;
    required: boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
}

export interface SkillFileValue {
    fileKey: string;
    name: string;
}

export type SkillParamValue = string | number | SkillFileValue | undefined;

export type SkillParamValues = Record<string, SkillParamValue>;

/** Reason codes returned by the server for one rejected parameter. */
export type SkillParamReason =
    | "required"
    | "type"
    | "range"
    | "option"
    | "unknown";

export type SkillParamErrors = Record<string, SkillParamReason>;

export interface SkillUploadView {
    paramKey: string;
    name: string;
    percent: number;
}

export type SkillStepStatus = "pending" | "running" | "done" | "failed";

export interface SkillStepView {
    nodeId: string;
    /** The node's slot; the label comes from `Skills.skills.<id>.steps.<slot>`. */
    slot: string;
    status: SkillStepStatus;
}

export type SkillOutputKind = "video" | "audio" | "image" | "text";

export interface SkillOutputView {
    key: string;
    kind: SkillOutputKind;
    /** Download/play URLs (`/api/uploads/<fileKey>`), or text values for `text`. */
    values: string[];
}

export function isFileParam(type: SkillParamType): type is SkillFileParamType {
    return type === "video" || type === "image" || type === "audio";
}

export function isFileValue(value: SkillParamValue): value is SkillFileValue {
    return typeof value === "object" && value !== null && "fileKey" in value;
}

/** True when every required parameter has a value and no upload is in flight. */
export function canRun(
    params: SkillParamView[],
    values: SkillParamValues,
    upload: SkillUploadView | null,
): boolean {
    if (upload) return false;
    return params.every((p) => {
        if (!p.required) return true;
        const v = values[p.key];
        if (v === undefined) return false;
        if (typeof v === "string") return v.trim().length > 0;
        return true;
    });
}
