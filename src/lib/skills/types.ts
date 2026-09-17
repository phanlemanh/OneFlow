import type { NodeSlot } from "@/generated/abi";
import type { ExecutableWorkflow } from "@/lib/workflow/executable-workflow";

export type SkillFileType = "video" | "image" | "audio";
export type SkillParamType = "text" | "number" | "enum" | SkillFileType;

/** Where a parameter value lands in the template. */
export type SkillParamTarget =
    | { kind: "input"; name: string }
    | { kind: "config"; nodeId: string; field: string };

export interface SkillParam {
    key: string;
    type: SkillParamType;
    required: boolean;
    default?: string | number;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    target: SkillParamTarget;
}

export interface SkillOutput {
    key: string;
    type: "video" | "audio" | "image" | "text";
    /**
     * The node and ABI output field that produce this output. The engine
     * persists results keyed by node id (raw plugin outputs), so this is the
     * address the run view reads — not a WorkflowOutput name.
     */
    from: { nodeId: string; field: string };
}

export interface SkillManifest {
    id: string;
    version: string;
    requires: NodeSlot[];
    params: SkillParam[];
    outputs: SkillOutput[];
    /** Declared from v1 so a later ingest side effect is not a major bump. */
    sideEffects: readonly never[];
}

export interface SkillTemplate {
    originalFlow: ExecutableWorkflow["originalFlow"];
    executable: ExecutableWorkflow;
}

export interface SkillFileValue {
    fileKey: string;
    name: string;
}

export type SkillParamValue = string | number | SkillFileValue;

export interface SkillDefinition {
    manifest: SkillManifest;
    template: SkillTemplate;
    sampleParams: Record<string, SkillParamValue>;
}
