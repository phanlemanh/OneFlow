/**
 * ABI-driven node shell. Wires `useAbiExecution` to `BaseNodeShell` and
 * auto-renders `<AbiHandles>`. Node components only declare:
 *   - `feature` + (optional) `sourceSpec`
 *   - the form (passed from `useAbiForm` so the same instance feeds execution)
 *   - presentation: title / icon / executeLabel / children
 */

import { useNodeId, useStore } from "@xyflow/react";
import { type ReactNode, useCallback, useState } from "react";

import {
    type KeyPromptState,
    NodeKeyPrompt,
    type NodeKeyPromptLabels,
} from "@/components/workspace/node-key-prompt";
import type { NodeSlot } from "@/generated/abi";
import { useAbiExecution } from "@/hooks/use-abi-execution";
import type { UseAbiFormReturn } from "@/hooks/use-abi-form";
import {
    useNodePluginIds,
    usePluginsRegistryStore,
} from "@/hooks/use-plugins-registry";
import type { Task } from "@/hooks/use-task";
import type { SourceSpec } from "@/lib/abi/sources";
import type { KeyVerdict } from "@/lib/onboarding/key-verify";
import type { BaseNodeData } from "@/types/nodes";

import { AbiHandles } from "./abi-handles";
import { BaseNodeShell } from "./base-node-shell";

/* ------------------------------------------------------------------ */
/* Inline key prompt                                                   */
/* ------------------------------------------------------------------ */

/** UI copy is Vietnamese, matching the repo locale. */
const KEY_PROMPT_LABELS: NodeKeyPromptLabels = {
    needsKey: "Bước này cần một khoá API",
    describe: (providerName) =>
        `Nhập khoá của ${providerName}. Khoá được lưu trên máy bạn và được thử ngay sau khi lưu.`,
    placeholder: "Dán khoá vào đây",
    save: "Lưu và kiểm tra",
    verifying: "Đang kiểm tra khoá…",
    invalid: "Khoá chưa dùng được",
    verified: "Khoá đã dùng được",
};

/** Failure messages that mean "a key is missing or was rejected". */
const KEY_FAILURE_PATTERN =
    /(missing|invalid|unauthorized|not set|401|403|thiếu khoá|sai khoá)/i;
/** The env var such a failure names, e.g. OPENAI_API_KEY. */
const ENV_KEY_PATTERN =
    /\b([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_(?:API_KEY|KEY|TOKEN|SECRET))\b/;

/**
 * The env key a failed task is asking for, or null when the failure is about
 * something else. This reads the server's error message; it never inspects the
 * shape of a key.
 */
function envKeyFromFailure(task: Task): string | null {
    const message = task.error ?? "";
    if (!KEY_FAILURE_PATTERN.test(message)) return null;
    return ENV_KEY_PATTERN.exec(message)?.[1] ?? null;
}

/**
 * Human name of the service behind this node's active plugin. The plugin id is
 * resolved and consumed here; only `providerName: string` leaves this function,
 * so no machine id has a path into the interface.
 */
function useProviderName(feature: string): string {
    const nodeId = useNodeId();
    const pluginOptions = useNodePluginIds(feature);
    const registry = usePluginsRegistryStore((s) => s.registry);
    const fromNode = useStore((state) => {
        const data = state.nodeLookup.get(nodeId ?? "")?.data as
            | { pluginId?: string }
            | undefined;
        return typeof data?.pluginId === "string" ? data.pluginId : "";
    });
    const activeId = fromNode || pluginOptions[0] || "";
    return registry?.plugins?.[activeId]?.name?.trim() || "nhà cung cấp";
}

/**
 * Merges one key into the stored env map and returns the server's verdict for
 * it. The verdict is what the server got back from the provider — the UI never
 * declares success on its own.
 */
async function saveAndVerifyKey(
    envKey: string,
    value: string,
): Promise<KeyVerdict> {
    const loaded = await fetch("/api/settings/env", { cache: "no-store" });
    const current = (await loaded.json()) as { env?: Record<string, string> };
    const res = await fetch("/api/settings/env", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            env: { ...(current.env ?? {}), [envKey]: value },
        }),
    });
    if (!res.ok) throw new Error(`Không lưu được khoá (HTTP ${res.status}).`);
    const saved = (await res.json()) as {
        verdicts?: Record<string, KeyVerdict>;
    };
    return (
        saved.verdicts?.[envKey] ?? {
            works: false,
            detail: "Máy chủ không trả về kết quả kiểm tra khoá.",
        }
    );
}

interface NodeKeyGate {
    envKey: string | null;
    state: KeyPromptState;
    value: string;
    setValue: (value: string) => void;
    noteTask: (task: Task) => void;
    save: () => Promise<void>;
}

/**
 * Needs-key state for one node. The prompt opens in place, on the node that
 * failed; the settings dialog is never part of this sequence.
 */
function useNodeKeyGate(): NodeKeyGate {
    const [envKey, setEnvKey] = useState<string | null>(null);
    const [state, setState] = useState<KeyPromptState>({ phase: "needs-key" });
    const [value, setValue] = useState("");

    const noteTask = useCallback((task: Task) => {
        if (task.status !== "FAILED") return;
        const key = envKeyFromFailure(task);
        if (!key) return;
        setEnvKey(key);
        setState({ phase: "needs-key" });
    }, []);

    const save = useCallback(async () => {
        if (!envKey) return;
        setState({ phase: "verifying" });
        try {
            const verdict = await saveAndVerifyKey(envKey, value);
            setState(
                verdict.works
                    ? { phase: "verified" }
                    : { phase: "invalid", reason: verdict.detail },
            );
        } catch (error) {
            setState({
                phase: "invalid",
                reason: error instanceof Error ? error.message : String(error),
            });
        }
    }, [envKey, value]);

    return { envKey, state, value, setValue, noteTask, save };
}

export interface AbiNodeShellProps<F extends NodeSlot> {
    feature: F;
    sourceSpec?: SourceSpec<F>;
    form: UseAbiFormReturn<F>;

    // ---- Chrome ----
    title?: string;
    icon?: ReactNode;
    headerActions?: ReactNode;

    // ---- Execute button ----
    executeLabel?: string;
    executeIcon?: ReactNode;
    /** Force-disable execute (e.g. required upstream not connected yet). */
    executeDisabled?: boolean;
    /** Treated as input node — execute button stays visible in execute mode. */
    isInputNode?: boolean;

    // ---- Misc ----
    selected?: boolean;
    count?: number;
    className?: string;
    children?: ReactNode;
    overlay?: ReactNode;
    /** Whether to auto-render AbiHandles. Default true. */
    autoHandles?: boolean;
    /** Whether to show plugin selector. Default true. */
    showPluginSelect?: boolean;
    /** Optional node.data passthrough for chrome (defaults to form state). */
    data?: BaseNodeData;
    /** Custom task update handler (forwarded to useAbiExecution). */
    onTaskUpdate?: (
        task: Task,
    ) => boolean | undefined | Promise<boolean | undefined>;
    /** Final-stage prompt transformer (forwarded to useAbiExecution). */
    transformPrompts?: (
        prompts: Record<string, unknown>[],
    ) => Record<string, unknown>[];
}

export function AbiNodeShell<F extends NodeSlot>({
    feature,
    sourceSpec,
    form,
    title,
    icon,
    headerActions,
    executeLabel,
    executeIcon,
    executeDisabled,
    isInputNode,
    selected,
    count,
    className,
    children,
    overlay,
    autoHandles = true,
    showPluginSelect = true,
    data,
    onTaskUpdate,
    transformPrompts,
}: AbiNodeShellProps<F>) {
    const keyGate = useNodeKeyGate();
    const providerName = useProviderName(feature);
    const { noteTask } = keyGate;

    const handleTaskUpdate = useCallback(
        (task: Task) => {
            noteTask(task);
            return onTaskUpdate?.(task);
        },
        [noteTask, onTaskUpdate],
    );

    const exec = useAbiExecution({
        feature,
        sourceSpec,
        form,
        disabled: executeDisabled,
        onTaskUpdate: handleTaskUpdate,
        transformPrompts,
    });

    return (
        <BaseNodeShell
            selected={selected}
            count={count}
            data={data ?? (form.state as BaseNodeData)}
            overlay={overlay}
            className={className}
            title={title}
            icon={icon}
            headerActions={headerActions}
            loading={exec.loading}
            elapsedSeconds={exec.elapsedSeconds}
            progressLabel={exec.progressLabel}
            thinkingText={exec.thinkingText}
            isExecuteMode={exec.isExecuteMode}
            onExecute={exec.run}
            onCancel={exec.canCancel ? exec.cancel : undefined}
            executeLabel={executeLabel}
            executeIcon={executeIcon}
            executeDisabled={executeDisabled || !exec.canRun}
            isInputNode={isInputNode}
            feature={feature}
            showPluginSelect={showPluginSelect}
            missingPluginOpen={exec.missingPluginOpen}
            setMissingPluginOpen={exec.setMissingPluginOpen}
        >
            {children}
            {keyGate.envKey ? (
                <NodeKeyPrompt
                    envKey={keyGate.envKey}
                    providerName={providerName}
                    state={keyGate.state}
                    labels={KEY_PROMPT_LABELS}
                    value={keyGate.value}
                    onChange={keyGate.setValue}
                    onSave={keyGate.save}
                />
            ) : null}
            {autoHandles && (
                <AbiHandles feature={feature} sourceSpec={sourceSpec} />
            )}
        </BaseNodeShell>
    );
}
