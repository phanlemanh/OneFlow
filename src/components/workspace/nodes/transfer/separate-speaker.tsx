import { Atom } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import type { RfDataNodeProps } from "@/types/nodes";

import { AbiNodeShell } from "../base/abi-node-shell";

type SeparateSpeakerRfProps = RfDataNodeProps<"separateSpeakerNode">;

const SeparateSpeakerNode = ({ selected, data }: SeparateSpeakerRfProps) => {
    const t = useTranslations("Workspace.nodes");
    const form = useAbiForm("separate_speaker");
    const fileKeys = data.fileKeys;

    return (
        <AbiNodeShell
            feature="separate_speaker"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.separateSpeakerNode}
            form={form}
            selected={selected}
            data={data}
            title={t("titles.separateSpeaker")}
            icon={<Atom className="h-5 w-5" />}
            executeLabel={t("actions.startSeparation")}
            executeDisabled={!fileKeys?.length}
        />
    );
};

export default memo(SeparateSpeakerNode);
