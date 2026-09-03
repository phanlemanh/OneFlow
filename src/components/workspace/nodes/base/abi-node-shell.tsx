/**
 * ABI-driven node shell. Wires `useAbiExecution` to `BaseNodeShell` and
 * auto-renders `<AbiHandles>`. Node components only declare:
 *   - `feature` + (optional) `sourceSpec`
 *   - the form (passed from `useAbiForm` so the same instance feeds execution)
 *   - presentation: title / icon / executeLabel / children
 */

import { useNodeId, useReactFlow, useStore } from "@xyflow/react";
import { useTranslations } from "next-intl";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import {
    type KeyPromptState,
    NodeKeyPrompt,
    type NodeKeyPromptLabels,
} from "@/components/workspace/node-key-prompt";
import {
    ONBOARDING_RECOVERY_EVENT,
    type OnboardingRecoveryDetail,
} from "@/components/workspace/task-failure-toaster";
import type { NodeSlot } from "@/generated/abi";
import { useAbiExecution } from "@/hooks/use-abi-execution";
import type { UseAbiFormReturn } from "@/hooks/use-abi-form";
import {
    useNodePluginIds,
    usePluginsRegistryStore,
} from "@/hooks/use-plugins-registry";
import type { Task } from "@/hooks/use-task";
import type { SourceSpec } from "@/lib/abi/sources";
import { classifyFailure } from "@/lib/onboarding/failure-actions";
import type { KeyVerdict } from "@/lib/onboarding/key-verify";
import {
    type EnvReadFailure,
    saveEnvKeys,
    type WriteFailure,
} from "@/lib/settings/env-client";
import { writeFailureText } from "@/lib/settings/read-failure-text";
import type { BaseNodeData } from "@/types/nodes";

import { AbiHandles } from "./abi-handles";
import { BaseNodeShell } from "./base-node-shell";

/* ------------------------------------------------------------------ */
/* Inline key prompt                                                   */
/* ------------------------------------------------------------------ */

/**
 * UI copy is Vietnamese, matching the repo locale.
 *
 * The blocked-store copy is the exception and comes from the message catalogue
 * instead — see `useKeyPromptLabels`. This file's remaining hardcoded strings
 * are pre-existing i18n debt that `chong-mat-khoa-byo-giao-dien` explicitly
 * declined to clean up; only strings that dossier ADDS go through next-intl.
 */
const KEY_PROMPT_BASE = {
    needsKey: "Bước này cần một khoá API",
    describe: (providerName) =>
        `Nhập khoá của ${providerName}. Khoá được lưu trên máy bạn và được thử ngay sau khi lưu.`,
    placeholder: "Dán khoá vào đây",
    save: "Lưu và kiểm tra",
    verifying: "Đang kiểm tra khoá…",
    invalid: "Khoá chưa dùng được",
    verified: "Khoá đã dùng được",
    savedUnverified: "Đã lưu khoá — chưa kiểm tra được",
} satisfies NodeKeyPromptLabels;

/*
 * The blocked-store copy used to be threaded through here as four more label
 * props. It is not, any more: the card now reads its own namespace, because
 * three states x four strings threaded through two prop bags is the drift
 * vector this dossier exists to remove. Everything ABOVE stays a prop — those
 * strings differ per surface; the read-state copy does not.
 */
function useKeyPromptLabels(): NodeKeyPromptLabels {
    return KEY_PROMPT_BASE;
}

/** Failure messages that mean "a key is missing or was rejected". */
const KEY_FAILURE_PATTERN =
    /(missing|invalid|unauthorized|not set|401|403|thiếu khoá|sai khoá)/i;
/** The env var such a failure names, e.g. OPENAI_API_KEY. */
const ENV_KEY_PATTERN =
    /\b([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_(?:API_KEY|KEY|TOKEN|SECRET))\b/;

/**
 * The env key a failed task is asking for, or null when the failure is about
 * something else. The FIRST reading is the shared classifier — the same one
 * the failure toast routes on — which understands the executor's canonical
 * "Missing required env var X" sentence for ANY key name (S4 round 1: the
 * suffix-shaped pattern below never matched MODAL_TOKEN_ID, so the prompt
 * never mounted for the one real required-key plugin). The legacy patterns
 * stay as a fallback for provider-worded failures that happen to name a
 * conventionally-shaped key. Never inspects the shape of a key VALUE.
 */
function envKeyFromFailure(task: Task): string | null {
    const message = task.error ?? "";
    const action = classifyFailure(message);
    if (action.kind === "enter-key") return action.envKey;
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
 * Merge one key into the store and return the server's verdict for it.
 *
 * Routed through `saveEnvKeys` rather than a local pair of fetches. The local
 * version never checked whether the read succeeded, so an unreadable store
 * produced `current.env === undefined` and it sent the PUT anyway — the server
 * refused with a 409, but the request still left the browser, which is exactly
 * what AC-12 forbids.
 */
async function saveAndVerifyKey(
    envKey: string,
    value: string,
): Promise<
    KeyVerdict | { readFailed: EnvReadFailure } | { writeFailed: WriteFailure }
> {
    const out = await saveEnvKeys({ [envKey]: value }, [envKey]);
    if (!out.ok) {
        if (out.reason === "read-failed") {
            // The whole union travels. Collapsing it to one shape here is how
            // an expired session reached the node as "your key store is
            // broken" — and the card for that offers to erase the store.
            return { readFailed: out.read };
        }
        // A failed WRITE is not a statement about the key. Throwing here landed
        // in the catch below as `phase: "invalid"` — "Khoá chưa dùng được" —
        // which invites the user to type a new key because the disk was full or
        // the connection dropped.
        // `replace-refused` cannot reach here: only the destructive replace
        // asks for it, and this path never does. Narrowing rather than casting
        // keeps that a compiler-checked claim.
        if (out.reason === "replace-refused") {
            return { writeFailed: { code: "http", status: 409 } };
        }
        return { writeFailed: out.detail };
    }
    return (
        out.verdicts[envKey] ?? {
            works: false,
            checked: false,
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
export function useNodeKeyGate(): NodeKeyGate {
    const tStore = useTranslations("Workspace.storeUnreadable");
    const writeFailedText = useCallback(
        (cause: WriteFailure) => writeFailureText(tStore, cause),
        [tStore],
    );
    const [envKey, setEnvKey] = useState<string | null>(null);
    const [state, setState] = useState<KeyPromptState>({ phase: "needs-key" });
    const [value, setValue] = useState("");
    const nodeId = useNodeId();
    const reactFlow = useReactFlow();

    const noteTask = useCallback((task: Task) => {
        if (task.status !== "FAILED") return;
        const key = envKeyFromFailure(task);
        if (!key) return;
        setEnvKey(key);
        setState({ phase: "needs-key" });
    }, []);

    // The failure toast's "enter key" control routes HERE: the node whose
    // prompt owns this env key brings itself into view, so the recovery
    // action lands on the form instead of dispatching into silence (the S4
    // round 1 finding: an event nothing listened to).
    useEffect(() => {
        if (!envKey || !nodeId) return;
        const onRecovery = (event: Event) => {
            const detail = (event as CustomEvent<OnboardingRecoveryDetail>)
                .detail;
            if (detail.kind !== "enter-key" || detail.envKey !== envKey) {
                return;
            }
            setState({ phase: "needs-key" });
            void reactFlow.fitView({
                nodes: [{ id: nodeId }],
                duration: 400,
                maxZoom: 1.2,
            });
        };
        window.addEventListener(ONBOARDING_RECOVERY_EVENT, onRecovery);
        return () =>
            window.removeEventListener(ONBOARDING_RECOVERY_EVENT, onRecovery);
    }, [envKey, nodeId, reactFlow]);

    const save = useCallback(async () => {
        if (!envKey) return;
        setState({ phase: "verifying" });
        try {
            const verdict = await saveAndVerifyKey(envKey, value);
            if ("writeFailed" in verdict) {
                setState({
                    phase: "saved-unverified",
                    reason: writeFailedText(verdict.writeFailed),
                });
            } else if ("readFailed" in verdict) {
                // Not a statement about the key. Saying "invalid" here would
                // invite the user to type a new one, into a store that may not
                // be readable at all.
                setState({ phase: "read-failed", read: verdict.readFailed });
            } else if (verdict.works) {
                setState({ phase: "verified" });
            } else if (verdict.checked) {
                // The provider was asked and said no — genuinely unusable.
                setState({ phase: "invalid", reason: verdict.detail });
            } else {
                // Nobody could ask (no prober / provider unreachable). Saved
                // is true, unusable is NOT established — showing destructive
                // "invalid" here was S4 round 1's false negative.
                setState({ phase: "saved-unverified", reason: verdict.detail });
            }
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
    const keyPromptLabels = useKeyPromptLabels();
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
                    labels={keyPromptLabels}
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
