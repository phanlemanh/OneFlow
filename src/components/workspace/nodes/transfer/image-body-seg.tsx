import { Puzzle } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import type { TongflowPluginNodeProps } from "@/types/tongflow-flow";

import { AbiNodeShell } from "../base/abi-node-shell";

const ImageBodySegNode = ({
    selected,
    data,
}: TongflowPluginNodeProps<"image-body-seg", "imageBodySegNode">) => {
    const t = useTranslations("Workspace.nodes");
    const form = useAbiForm("image-body-seg");
    const fileKeys = data.fileKeys ?? [];

    return (
        <AbiNodeShell
            feature="image-body-seg"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.imageBodySegNode}
            form={form}
            selected={selected}
            data={data}
            title={t("titles.imageBodySeg")}
            icon={<Puzzle className="h-5 w-5" />}
            executeLabel={t("actions.segmentBody")}
            executeDisabled={!fileKeys?.length}
        />
    );
};

ImageBodySegNode.displayName = "ImageBodySegNode";

export default memo(ImageBodySegNode);
