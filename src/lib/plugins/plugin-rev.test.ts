import { describe, expect, it } from "vitest";
import { PluginsRegistrySchema } from "./plugins-registry-schema";

/**
 * `pluginRev` is written by the Python scanner and read here. The field is
 * optional, and these tests pin what that has to mean on the TypeScript side:
 * old registries keep working, new ones round-trip the rev.
 */
const registryWithoutRev = {
    version: 1 as const,
    generatedAt: "2026-07-01T00:00:00Z",
    nodePluginMap: { "image-gen": ["oneflow-example"] },
    plugins: {
        "oneflow-example": {
            localSubdir: "oneflow-example",
            methodsByNodeSlot: { "image-gen": { methodName: "run" } },
        },
    },
};

describe("pluginRev in the registry schema", () => {
    it("parses a registry written before the field existed", () => {
        // Making this required would break every installed build the moment it
        // upgraded, before a rescan ever had a chance to run.
        expect(() =>
            PluginsRegistrySchema.parse(registryWithoutRev),
        ).not.toThrow();
    });

    it("parses and preserves a 40-character rev", () => {
        const sha = "a".repeat(40);
        const withRev = structuredClone(registryWithoutRev) as Record<
            string,
            unknown
        >;
        (
            (withRev.plugins as Record<string, Record<string, unknown>>)[
                "oneflow-example"
            ] as Record<string, unknown>
        ).pluginRev = sha;

        const parsed = PluginsRegistrySchema.parse(withRev);
        expect(parsed.plugins["oneflow-example"].pluginRev).toBe(sha);
    });

    it("rejects a shortened sha", () => {
        // A short sha is ambiguous by construction, and L1 would key a cache on
        // it. Better to fail at the boundary than to collide later.
        const withShort = structuredClone(registryWithoutRev) as Record<
            string,
            unknown
        >;
        (
            (withShort.plugins as Record<string, Record<string, unknown>>)[
                "oneflow-example"
            ] as Record<string, unknown>
        ).pluginRev = "abc1234";

        expect(() => PluginsRegistrySchema.parse(withShort)).toThrow();
    });
});
