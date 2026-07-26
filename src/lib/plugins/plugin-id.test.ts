import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { normalizeOfficialManifest } from "@/lib/plugins/official-manifest";
import {
    isValidPluginId,
    pluginDisplayName,
    pluginIdError,
} from "@/lib/plugins/plugin-id";

describe("plugin id — oneflow convention (AC-1)", () => {
    it.each([
        "oneflow-modal-foo",
        "oneflow-api-foo",
        "oneflow-modal-z-image",
        "oneflow-api-openrouter-free",
        "oneflow-modal-a",
        "oneflow-modal-0",
        "oneflow-modal-flux2-klein9b",
    ])("accepts %s", (id) => {
        expect(isValidPluginId(id)).toBe(true);
    });
});

describe("plugin id — tongflow stays installable (AC-2)", () => {
    // Read the REAL manifest rather than a copied list. A new official plugin
    // added to config/official-plugins.json cannot then slip past this check by
    // being absent from a fixture nobody remembered to update.
    // Go through the shared normaliser rather than casting the parsed JSON.
    // Entries may be either a plain string or `{id, origin}`; a cast to
    // string[] compiles, then feeds an object into the id regex, where it
    // stringifies to "[object Object]" and fails with a meaningless case name
    // — precisely for the entries most likely to be newly added.
    const manifest = normalizeOfficialManifest(
        JSON.parse(
            readFileSync(
                join(process.cwd(), "config/official-plugins.json"),
                "utf8",
            ),
        ),
    );
    const officialIds = manifest.entries.map((entry) => entry.id);

    it("the manifest still points at the upstream org we do not control", () => {
        // The premise of the whole feature: these are not our repos, so their
        // names are not ours to change. If this ever stops being true, the
        // legacy half of the regex is a candidate for removal.
        expect(manifest.org).toBe("https://github.com/tong-io");
    });

    it("has a non-trivial number of official plugins", () => {
        // Guards against the file being emptied or reshaped, which would make
        // the per-id assertion below vacuously pass.
        expect(officialIds.length).toBeGreaterThan(30);
    });

    it.each(officialIds)("accepts official plugin %s", (id) => {
        expect(isValidPluginId(id)).toBe(true);
    });
});

describe("plugin id — everything else is still rejected (AC-3)", () => {
    it.each([
        // Wrong prefix.
        ["foo-modal-bar", "unrelated prefix"],
        ["flow-modal-bar", "prefix substring only"],
        ["twoflow-modal-bar", "near-miss prefix"],
        ["oneflowmodal-x", "missing the separator"],
        ["one-flow-modal-x", "hyphen inside the prefix"],
        // Wrong runner segment — hardware must never be encoded in the id.
        ["oneflow-gpu-x", "hardware token instead of a runner"],
        ["oneflow-cpu-x", "hardware token instead of a runner"],
        ["oneflow-worker-x", "unknown runner"],
        ["oneflow-modal", "no name segment"],
        ["oneflow-modal-", "empty name segment"],
        ["oneflow-", "prefix alone"],
        // Case and shape.
        ["ONEFLOW-MODAL-X", "uppercase"],
        ["oneflow-Modal-x", "uppercase runner"],
        ["oneflow-modal-Foo", "uppercase name"],
        ["oneflow-modal--foo", "name starts with a hyphen"],
        ["oneflow-modal-_foo", "underscore"],
        ["oneflow-modal-foo ", "trailing space"],
        [" oneflow-modal-foo", "leading space"],
        ["oneflow-modal-foo/bar", "path separator"],
        ["../oneflow-modal-foo", "traversal"],
        ["", "empty"],
    ])("rejects %s (%s)", (id) => {
        expect(isValidPluginId(id)).toBe(false);
    });

    it("rejects a name whose valid form is only a substring", () => {
        // Anchors, not a search: `x` before and after must both break it.
        expect(isValidPluginId("xoneflow-modal-foo")).toBe(false);
        expect(isValidPluginId("oneflow-modal-foo\nevil")).toBe(false);
    });
});

describe("plugin id — the error teaches the current convention (AC-4)", () => {
    const msg = pluginIdError("bad-name");

    it("quotes the offending name", () => {
        expect(msg).toContain('"bad-name"');
    });

    it("names oneflow before tongflow", () => {
        const one = msg.indexOf("oneflow-");
        const tong = msg.indexOf("tongflow-");
        expect(one).toBeGreaterThanOrEqual(0);
        expect(tong).toBeGreaterThan(one);
    });

    it("marks the tongflow form as legacy rather than presenting it as equal", () => {
        expect(msg).toMatch(/legacy/i);
    });

    it("names both runner segments for the current convention", () => {
        expect(msg).toContain("oneflow-modal-*");
        expect(msg).toContain("oneflow-api-*");
    });
});

describe("plugin display name — the prefix is a label, not a distinction", () => {
    it("strips either vendor prefix, so twins render identically", () => {
        // Before this was fixed, only `tongflow` was stripped: two plugins
        // differing solely in prefix appeared in the picker as "api-openai" and
        // "oneflow-api-openai" — the prefix leaking back out as a visible
        // difference after the scanner had stopped treating it as one.
        expect(pluginDisplayName("oneflow-api-openai")).toBe("api-openai");
        expect(pluginDisplayName("tongflow-api-openai")).toBe("api-openai");
        expect(pluginDisplayName("oneflow-modal-z-image")).toBe(
            "modal-z-image",
        );
        expect(pluginDisplayName("tongflow-modal-z-image")).toBe(
            "modal-z-image",
        );
    });

    it("leaves a name with no vendor prefix alone", () => {
        expect(pluginDisplayName("api-openai")).toBe("api-openai");
    });
});
