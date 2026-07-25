import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import type { TongflowPluginNodeProps } from "@/types/tongflow-flow";

import { AbiNodeShell } from "../base/abi-node-shell";

const FileGenTextNode = ({
    selected,
    data,
}: TongflowPluginNodeProps<"parse-document", "fileGenTextNode">) => {
    const t = useTranslations("Workspace.nodes");
    const form = useAbiForm("parse-document");
    const { fileKeys = [] } = data;

    return (
        <AbiNodeShell
            feature="parse-document"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.fileGenTextNode}
            form={form}
            selected={selected}
            className="min-w-[480px]"
            data={data}
            title={t("titles.fileGenText")}
            icon={<FileText className="h-5 w-5" />}
            executeLabel={t("actions.parseDocument")}
            executeDisabled={!fileKeys?.length}
        />
    );
};

FileGenTextNode.displayName = "FileGenTextNode";

export default memo(FileGenTextNode);
