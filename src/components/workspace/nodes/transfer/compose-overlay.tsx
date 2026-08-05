/**
 * compose-overlay transfer node: paste text / price tags / a logo / a safe
 * zone onto an upstream image or video (`in:media`). The ops list is edited
 * in `ComposeOverlayOpsEditor`; `{text}` placeholders are fed from `in:text`
 * and the logo image from `in:logo` — substitution happens plugin-side.
 *
 * UI spec = the approved design-of-record
 * (`_acceptance/compose-overlay/evidence/design/reference/source/`, 6 states).
 */

import { type Edge, useNodeId, useNodesData, useStore } from "@xyflow/react";
import { Stamp } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import { getEffectiveOutputType } from "@/lib/workflow/flow-connection-shared";
import type { TongflowPluginNodeProps } from "@/types/tongflow-flow";

import { AbiNodeShell } from "../base/abi-node-shell";
import {
    ComposeOverlayOpsEditor,
    type OverlayMediaKind,
} from "./compose-overlay-ops-editor";

const ComposeOverlayNode = ({
    selected,
    data,
}: TongflowPluginNodeProps<"compose-overlay", "composeOverlayNode">) => {
    const t = useTranslations("Workspace.nodes");
    const tOv = useTranslations("Workspace.nodes.composeOverlay");
    const form = useAbiForm(
        "compose-overlay",
        NODE_TYPE_SOURCE_SPEC.composeOverlayNode,
    );

    const nodeId = useNodeId();
    const edges = useStore((state) => state.edges as Edge[]);

    const { mediaSourceId, mediaSourceHandle, isLogoConnected } =
        useMemo(() => {
            let mediaSrc: string | null = null;
            let mediaHandle: string | null = null;
            let logoConnected = false;
            if (nodeId) {
                for (const e of edges) {
                    if (e.target !== nodeId) continue;
                    if (e.targetHandle === "in:media") {
                        mediaSrc = e.source;
                        mediaHandle = e.sourceHandle ?? null;
                    } else if (e.targetHandle === "in:logo") {
                        logoConnected = true;
                    }
                }
            }
            return {
                mediaSourceId: mediaSrc,
                mediaSourceHandle: mediaHandle,
                isLogoConnected: logoConnected,
            };
        }, [edges, nodeId]);

    const mediaNode = useNodesData(mediaSourceId ?? "");

    const mediaKind: OverlayMediaKind = useMemo(() => {
        if (!mediaSourceId) return null;
        // Same resolver the connection validator and the inline edge select
        // use. A hand-rolled `sourceHandle === "out:video"` test misses every
        // slot whose VideoRef field is named otherwise (`split-video` ->
        // `out:video_parts`, `drop-video` -> `out:clips`), which silently hid
        // the per-op time controls for those upstreams.
        const outType = getEffectiveOutputType(
            mediaSourceId,
            mediaNode?.type,
            mediaSourceHandle,
        );
        if (outType === "videoNode") return "video";
        if (outType === "imageNode") return "image";
        return "image";
    }, [mediaSourceId, mediaNode, mediaSourceHandle]);

    const ops = form.state.ops ?? [];
    const hasLogoOp = ops.some((op) => op.type === "logo");
    // State 5: a logo op exists but nothing is connected on in:logo.
    const isLogoMissing = hasLogoOp && !isLogoConnected;

    const executeDisabled = !mediaSourceId || ops.length === 0 || isLogoMissing;

    const opsLabel =
        mediaKind === null
            ? tOv("opsLabel")
            : tOv("opsMediaLabel", {
                  kind: tOv(
                      mediaKind === "video" ? "mediaVideo" : "mediaImage",
                  ),
              });

    return (
        <AbiNodeShell
            feature="compose-overlay"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.composeOverlayNode}
            form={form}
            selected={selected}
            data={data}
            className="min-w-[340px]"
            title={t("titles.composeOverlay")}
            icon={<Stamp className="h-5 w-5" />}
            executeLabel={t("actions.applyOverlay")}
            executeDisabled={executeDisabled}
        >
            <div className="space-y-3 p-4 pt-3 nodrag">
                {isLogoMissing && (
                    <div
                        data-testid="compose-overlay-logo-banner"
                        className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                    >
                        {tOv("logoMissingBanner")}
                    </div>
                )}
                <div className="text-xs font-medium text-muted-foreground">
                    {opsLabel}
                </div>
                <ComposeOverlayOpsEditor
                    ops={ops}
                    onChange={(next) => form.set("ops", next)}
                    mediaKind={mediaKind}
                    logoConnected={isLogoConnected}
                />
            </div>
        </AbiNodeShell>
    );
};

ComposeOverlayNode.displayName = "ComposeOverlayNode";

export default memo(ComposeOverlayNode);
