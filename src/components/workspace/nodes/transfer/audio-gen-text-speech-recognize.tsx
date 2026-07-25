import { Music as AudioIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import type { TongflowPluginNodeProps } from "@/types/tongflow-flow";

import { AbiNodeShell } from "../base/abi-node-shell";

const AudioGenTextSpeechRecognizeNode = ({
    selected,
    data,
}: TongflowPluginNodeProps<
    "transcribe",
    "audioGenTextSpeechRecognizeNode"
>) => {
    const t = useTranslations("Workspace.nodes");
    const form = useAbiForm("transcribe");
    const fileKeys = data.fileKeys ?? [];

    return (
        <AbiNodeShell
            feature="transcribe"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.audioGenTextSpeechRecognizeNode}
            form={form}
            selected={selected}
            className="min-w-[480px]"
            data={data}
            title={t("titles.speechRecognize")}
            icon={<AudioIcon className="h-5 w-5" />}
            executeLabel={t("actions.recognizeSpeech")}
            executeDisabled={!fileKeys.length}
        />
    );
};

AudioGenTextSpeechRecognizeNode.displayName = "AudioGenTextSpeechRecognizeNode";

export default memo(AudioGenTextSpeechRecognizeNode);
