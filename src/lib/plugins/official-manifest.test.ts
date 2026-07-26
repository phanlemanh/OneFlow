import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
    findOfficialEntry,
    normalizeOfficialManifest,
    type OfficialPluginEntry,
    officialGitUrl,
} from "@/lib/plugins/official-manifest";

const DEFAULT_ORG = "https://github.com/tong-io";
const FORK_ORIGIN = "https://github.com/phanlemanh";

function shipped(): unknown {
    return JSON.parse(
        readFileSync(
            join(process.cwd(), "config", "official-plugins.json"),
            "utf8",
        ),
    );
}

function urlOf(
    manifest: ReturnType<typeof normalizeOfficialManifest>,
    id: string,
): string {
    const entry = findOfficialEntry(manifest, id);
    if (!entry) throw new Error(`fixture error: no entry for ${id}`);
    return officialGitUrl(entry);
}

describe("string entries — today's manifest (AC-1)", () => {
    it("resolves every id to the top-level org", () => {
        const manifest = normalizeOfficialManifest(shipped());
        expect(manifest.org).toBe(DEFAULT_ORG);
        for (const entry of manifest.entries) {
            expect(entry.origin).toBe(DEFAULT_ORG);
            expect(officialGitUrl(entry)).toBe(
                `${DEFAULT_ORG}/${entry.id}.git`,
            );
        }
    });

    it("preserves the id list element for element, in order", () => {
        const raw = shipped() as { plugins: string[] };
        const manifest = normalizeOfficialManifest(raw);
        expect(manifest.entries.map((e) => e.id)).toEqual(raw.plugins);
    });
});

describe("override entries (AC-2)", () => {
    const raw = {
        org: DEFAULT_ORG,
        plugins: [
            "tongflow-api-gemini",
            { id: "oneflow-api-openai", origin: FORK_ORIGIN },
            "tongflow-api-deepseek",
        ],
    };

    it("appends id and .git to the entry's own origin", () => {
        const manifest = normalizeOfficialManifest(raw);
        expect(urlOf(manifest, "oneflow-api-openai")).toBe(
            `${FORK_ORIGIN}/oneflow-api-openai.git`,
        );
    });

    it("leaves every sibling on the default origin", () => {
        const manifest = normalizeOfficialManifest(raw);
        for (const id of ["tongflow-api-gemini", "tongflow-api-deepseek"]) {
            expect(urlOf(manifest, id)).toBe(`${DEFAULT_ORG}/${id}.git`);
        }
    });

    it("accepts an object entry with no origin and falls back to the default", () => {
        const manifest = normalizeOfficialManifest({
            org: DEFAULT_ORG,
            plugins: [{ id: "tongflow-api-gemini" }],
        });
        expect(urlOf(manifest, "tongflow-api-gemini")).toBe(
            `${DEFAULT_ORG}/tongflow-api-gemini.git`,
        );
    });

    it("keeps order across mixed string and object entries", () => {
        const manifest = normalizeOfficialManifest(raw);
        expect(manifest.entries.map((e) => e.id)).toEqual([
            "tongflow-api-gemini",
            "oneflow-api-openai",
            "tongflow-api-deepseek",
        ]);
    });

    it("finds nothing for an id that is not in the manifest", () => {
        const manifest = normalizeOfficialManifest(raw);
        expect(
            findOfficialEntry(manifest, "tongflow-api-nope"),
        ).toBeUndefined();
    });
});

describe("malformed entries are rejected by name (AC-4)", () => {
    it.each([
        [
            "unknown key",
            { id: "tongflow-api-gemini", orgin: FORK_ORIGIN },
            "orgin",
        ],
        ["missing id", { origin: FORK_ORIGIN }, "id"],
        ["non-string id", { id: 7 }, "id"],
        ["empty string entry", "", "empty"],
        ["empty id", { id: "" }, "empty"],
        [
            "non-string origin",
            { id: "tongflow-api-gemini", origin: 7 },
            "origin",
        ],
        ["empty origin", { id: "tongflow-api-gemini", origin: "" }, "origin"],
        ["entry is an array", [], "entry"],
        ["entry is null", null, "entry"],
        ["entry is a number", 7, "entry"],
    ])("rejects %s", (_label, entry, needle) => {
        expect(() =>
            normalizeOfficialManifest({ org: DEFAULT_ORG, plugins: [entry] }),
        ).toThrowError(new RegExp(needle as string, "i"));
    });

    it("names the offending entry rather than failing anonymously", () => {
        expect(() =>
            normalizeOfficialManifest({
                org: DEFAULT_ORG,
                plugins: [
                    "tongflow-api-gemini",
                    { id: "tongflow-api-openai", orgin: FORK_ORIGIN },
                ],
            }),
        ).toThrowError(/entry 1/);
    });

    it("rejects a duplicate id and names it", () => {
        expect(() =>
            normalizeOfficialManifest({
                org: DEFAULT_ORG,
                plugins: ["tongflow-api-gemini", "tongflow-api-gemini"],
            }),
        ).toThrowError(/tongflow-api-gemini/);
    });

    it("rejects a duplicate across string and object forms", () => {
        expect(() =>
            normalizeOfficialManifest({
                org: DEFAULT_ORG,
                plugins: [
                    "tongflow-api-gemini",
                    { id: "tongflow-api-gemini", origin: FORK_ORIGIN },
                ],
            }),
        ).toThrowError(/tongflow-api-gemini/);
    });

    it("rejects a missing or non-array plugins list", () => {
        expect(() => normalizeOfficialManifest({ org: DEFAULT_ORG })).toThrow();
        expect(() =>
            normalizeOfficialManifest({ org: DEFAULT_ORG, plugins: {} }),
        ).toThrow();
    });

    it("rejects a missing or non-string org", () => {
        expect(() => normalizeOfficialManifest({ plugins: [] })).toThrow();
        expect(() =>
            normalizeOfficialManifest({ org: 7, plugins: [] }),
        ).toThrow();
    });

    it("rejects a non-object root", () => {
        expect(() => normalizeOfficialManifest(null)).toThrow();
        expect(() => normalizeOfficialManifest("nope")).toThrow();
        expect(() => normalizeOfficialManifest([])).toThrow();
    });
});

describe("non-http(s) origins are rejected (AC-5)", () => {
    it.each([
        "git@github.com:phanlemanh/x",
        "../etc",
        "javascript:alert(1)",
        "file:///tmp/x",
        "ssh://git@github.com/x",
        "not a url at all",
    ])("rejects %s as an entry origin", (origin) => {
        expect(() =>
            normalizeOfficialManifest({
                org: DEFAULT_ORG,
                plugins: [{ id: "tongflow-api-gemini", origin }],
            }),
        ).toThrowError(/http/i);
    });

    it("rejects a non-http(s) top-level org", () => {
        expect(() =>
            normalizeOfficialManifest({
                org: "git@github.com:tong-io",
                plugins: [],
            }),
        ).toThrowError(/http/i);
    });

    it("accepts a plain http origin", () => {
        const manifest = normalizeOfficialManifest({
            org: DEFAULT_ORG,
            plugins: [
                { id: "tongflow-api-gemini", origin: "http://git.local/x" },
            ],
        });
        const entry = manifest.entries[0] as OfficialPluginEntry;
        expect(officialGitUrl(entry)).toBe(
            "http://git.local/x/tongflow-api-gemini.git",
        );
    });
});
