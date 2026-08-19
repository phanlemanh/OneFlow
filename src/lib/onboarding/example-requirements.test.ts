import { describe, expect, it } from "vitest";
import exampleWorkflow from "../../../public/example.json";
import {
    missingPluginIds,
    readExampleRequirements,
} from "./example-requirements";

describe("readExampleRequirements", () => {
    it("returns the exact plugin id set the bundled example needs", () => {
        const reqs = readExampleRequirements(exampleWorkflow);
        const ids = reqs.map((r) => r.pluginId).sort();

        // Asserted element by element. A count alone would let a parser that
        // returns the wrong two ids pass.
        expect(ids).toEqual([
            "oneflow-api-ffmpeg",
            "oneflow-api-pyscenedetect",
        ]);
        expect(ids.length).toBeGreaterThanOrEqual(2);
    });

    it("reads at load time without executing anything", () => {
        // A pure read of the JSON: no fetch, no child process, no registry.
        const reqs = readExampleRequirements(exampleWorkflow);
        expect(reqs.every((r) => typeof r.feature === "string")).toBe(true);
    });

    it("returns an empty missing set when every plugin is installed", () => {
        // Suppression half: detection must not report phantoms.
        const reqs = readExampleRequirements(exampleWorkflow);
        const installed = reqs.map((r) => r.pluginId);
        expect(missingPluginIds(reqs, installed)).toEqual([]);
    });

    it("names only the plugins that are actually absent", () => {
        const reqs = readExampleRequirements(exampleWorkflow);
        const installed = [reqs[0].pluginId];
        expect(missingPluginIds(reqs, installed)).toEqual([reqs[1].pluginId]);
    });

    it("ignores a workflow with no executable nodes rather than throwing", () => {
        expect(readExampleRequirements({ executableNodes: [] })).toEqual([]);
    });
});
