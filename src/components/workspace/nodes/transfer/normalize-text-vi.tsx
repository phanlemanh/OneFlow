import { SpellCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import type { RfDataNodeProps } from "@/types/nodes";

import { AbiNodeShell } from "../base/abi-node-shell";

type NormalizeTextViRfProps = RfDataNodeProps<"normalizeTextViNode">;

const NormalizeTextViNode = ({ selected, data }: NormalizeTextViRfProps) => {
    const t = useTranslations("Workspace.nodes");
    const form = useAbiForm("normalize-text-vi");
    const texts = data.texts;

    return (
        <AbiNodeShell
            feature="normalize-text-vi"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.normalizeTextViNode}
            form={form}
            selected={selected}
            data={data}
            title={t("titles.normalizeTextVi")}
            icon={<SpellCheck className="h-5 w-5" />}
            executeLabel={t("actions.normalizeTextVi")}
            executeDisabled={!texts?.length}
        />
    );
};

export default memo(NormalizeTextViNode);
