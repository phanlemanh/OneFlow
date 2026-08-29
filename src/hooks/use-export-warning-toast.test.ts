// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useExportWarningToasts } from "@/hooks/use-export-warning-toast";
import { usePluginsRegistryStore } from "@/hooks/use-plugins-registry";
import type { ExecutableWorkflow } from "@/lib/workflow/executable-workflow";
import {
    NORMALIZE_SLOT,
    WORKFLOW_TTS_NEEDS_NORMALIZE,
} from "@/lib/workflow/exporter";

/**
 * The warning's REMEDY has to be performable, and only this layer can tell.
 *
 * `tts-order-guard.test.ts` measures the exporter: given a speech node with no
 * reader upstream, a warning is emitted. That stays true and is not what this
 * file is about. What it could never see is whether the sentence the user then
 * reads asks for something possible — the exporter is pure and has no plugin
 * registry. Measured 2026-08-28: no plugin serves `normalize-text-vi`, so the
 * toast fired on every save, export and run of every existing speech workflow,
 * naming a node no machine can install.
 */

vi.mock("next-intl", () => ({
    useTranslations: () => (key: string, vars?: Record<string, unknown>) =>
        `${key}:${vars?.nodes ?? ""}`,
}));

vi.mock("react-hot-toast", () => ({
    default: vi.fn(),
}));

const WORKFLOW = {
    warnings: [{ code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b"] }],
} as unknown as ExecutableWorkflow;

/** Seed the registry the way the API payload would. */
function setInstalledPlugins(nodePluginMap: Record<string, string[]>): void {
    usePluginsRegistryStore.setState({
        registry: { nodePluginMap, plugins: {} } as never,
    });
}

beforeEach(() => {
    vi.mocked(toast).mockClear();
});

afterEach(() => {
    usePluginsRegistryStore.setState({ registry: null });
});

describe("TTS-order warning only fires when its remedy exists", () => {
    it("stays silent when no plugin serves the reader slot", () => {
        setInstalledPlugins({});
        const { result } = renderHook(() => useExportWarningToasts());
        result.current(WORKFLOW);

        expect(
            vi.mocked(toast).mock.calls.length,
            "cảnh báo bảo người dùng thêm một node mà không plugin nào chạy được",
        ).toBe(0);
    });

    it("stays silent when the registry has not loaded yet", () => {
        // Null registry is the first paint of every session. Warning here would
        // mean the toast appears or not depending on a race.
        usePluginsRegistryStore.setState({ registry: null });
        const { result } = renderHook(() => useExportWarningToasts());
        result.current(WORKFLOW);

        expect(vi.mocked(toast).mock.calls.length).toBe(0);
    });

    it("fires once the slot has a plugin", () => {
        setInstalledPlugins({
            [NORMALIZE_SLOT]: ["oneflow-api-normalize-text-vi"],
        });
        const { result } = renderHook(() => useExportWarningToasts());
        result.current(WORKFLOW);

        expect(
            vi.mocked(toast).mock.calls.length,
            "người dùng LÀM ĐƯỢC điều cảnh báo bảo, nhưng cảnh báo không hiện",
        ).toBe(1);
        expect(String(vi.mocked(toast).mock.calls[0][0])).toContain(
            "ttsNeedsNormalize",
        );
    });

    it("names the offending nodes so the user knows where to look", () => {
        setInstalledPlugins({ [NORMALIZE_SLOT]: ["some-plugin"] });
        const { result } = renderHook(() => useExportWarningToasts());
        result.current({
            warnings: [
                { code: WORKFLOW_TTS_NEEDS_NORMALIZE, nodeIds: ["b", "c"] },
            ],
        } as unknown as ExecutableWorkflow);

        expect(String(vi.mocked(toast).mock.calls[0][0])).toContain("b, c");
    });

    it("a plugin for a DIFFERENT slot does not unlock the warning", () => {
        // The gate has to read the reader's own slot. Keying it off "any plugin
        // installed" would let an unrelated install re-enable impossible advice.
        setInstalledPlugins({
            "text-gen-speech-preset": ["tongflow-modal-qwen3tts"],
        });
        const { result } = renderHook(() => useExportWarningToasts());
        result.current(WORKFLOW);

        expect(vi.mocked(toast).mock.calls.length).toBe(0);
    });
});
