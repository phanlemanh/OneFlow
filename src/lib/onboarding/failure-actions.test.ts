import { describe, expect, it } from "vitest";
import { classifyFailure } from "./failure-actions";

describe("classifyFailure", () => {
    it("maps a missing plugin to the plugin manager, filtered to that plugin", () => {
        const action = classifyFailure(
            "No plugin installed for nodeSlot=split-video (oneflow-api-pyscenedetect)",
        );
        expect(action).toEqual({
            kind: "install-plugin",
            pluginId: "oneflow-api-pyscenedetect",
        });

        // The shape the runner produces today: a workflow that references a
        // plugin the registry does not know (execute.ts / runners/generic.ts).
        expect(
            classifyFailure("Unknown plugin: oneflow-api-pyscenedetect"),
        ).toEqual({
            kind: "install-plugin",
            pluginId: "oneflow-api-pyscenedetect",
        });
    });

    it("maps a missing key to the key form, naming the env var", () => {
        const action = classifyFailure(
            "Missing required env var OPENAI_API_KEY",
        );
        expect(action).toEqual({ kind: "enter-key", envKey: "OPENAI_API_KEY" });

        // The shape the director produces today (director.server.ts).
        expect(classifyFailure("Set ANTHROPIC_API_KEY in Settings")).toEqual({
            kind: "enter-key",
            envKey: "ANTHROPIC_API_KEY",
        });
    });

    it("offers NO action for an error it does not understand", () => {
        // Suppression half: inventing a plausible button for an unrecognised
        // error sends the user somewhere useless and looks like help.
        expect(classifyFailure("ffmpeg exited with code 137")).toEqual({
            kind: "none",
        });
        expect(classifyFailure("")).toEqual({ kind: "none" });

        // An installed plugin that does not implement the slot does name a
        // plugin id, but installing that plugin again fixes nothing — the
        // honest answer is no action rather than a button that leads nowhere.
        expect(
            classifyFailure(
                "Plugin oneflow-api-ffmpeg does not implement nodeSlot=split-video",
            ),
        ).toEqual({ kind: "none" });
    });
});
