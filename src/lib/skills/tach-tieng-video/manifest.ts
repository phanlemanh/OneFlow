import type { SkillManifest } from "../types";

export const manifest: SkillManifest = {
    id: "tach-tieng-video",
    version: "1.0.0",
    requires: ["extract-audio", "remove-video-audio"],
    sideEffects: [],
    params: [
        {
            key: "video",
            type: "video",
            required: true,
            target: { kind: "input", name: "input_v1" },
        },
    ],
    outputs: [
        { key: "tieng", type: "audio", from: "output_a1" },
        { key: "video-cam", type: "video", from: "output_r1" },
    ],
};
