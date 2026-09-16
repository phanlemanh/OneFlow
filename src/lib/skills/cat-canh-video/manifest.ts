import type { SkillManifest } from "../types";

export const manifest: SkillManifest = {
    id: "cat-canh-video",
    version: "1.0.0",
    requires: ["split-video"],
    sideEffects: [],
    params: [
        {
            key: "video",
            type: "video",
            required: true,
            target: { kind: "input", name: "input_v1" },
        },
        {
            key: "do-nhay",
            type: "number",
            required: false,
            default: 20,
            min: 5,
            max: 60,
            step: 1,
            target: { kind: "config", nodeId: "s1", field: "threshold" },
        },
    ],
    outputs: [{ key: "cac-canh", type: "video", from: "output_s1" }],
};
