import { PersonStanding } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import type { TongflowPluginNodeProps } from "@/types/tongflow-flow";

import { AbiNodeShell } from "../base/abi-node-shell";

const ImagePoseNode = ({
    selected,
    data,
}: TongflowPluginNodeProps<"image-pose", "imagePoseNode">) => {
    const t = useTranslations("Workspace.nodes");
    const form = useAbiForm("image-pose");
    const fileKeys = data.fileKeys ?? [];

    return (
        <AbiNodeShell
            feature="image-pose"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.imagePoseNode}
            form={form}
            selected={selected}
            data={data}
            title={t("titles.imagePose")}
            icon={<PersonStanding className="h-5 w-5" />}
            executeLabel={t("actions.detectPose")}
            executeDisabled={!fileKeys?.length}
        />
    );
};

ImagePoseNode.displayName = "ImagePoseNode";

export default memo(ImagePoseNode);
