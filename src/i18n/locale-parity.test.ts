/**
 * E8 / AC-13 — every displayed string exists in all five locales.
 *
 * This guard compares ALL five files rather than just the namespaces this work
 * package adds. A test scoped to the new namespaces would be satisfied by a new
 * key placed in the wrong namespace, which is the same class of self-satisfying
 * measurement the rest of this dossier is built to avoid.
 */
import { describe, expect, it } from "vitest";
import en from "./messages/en.json";
import ja from "./messages/ja.json";
import ko from "./messages/ko.json";
import vi from "./messages/vi.json";
import zh from "./messages/zh.json";

/**
 * Japanese keys already missing on 2026-09-01, FROZEN as a SET.
 *
 * It was a COUNT first, and that was not the same claim. `jaDebt` is recomputed
 * from the files on every run, so translating one debt key while adding one new
 * untranslated key leaves the total at exactly 76 and the suite passes — a new
 * untranslated string ships green, which is the thing the guard exists to stop.
 * The second test closed that only for this work package's two namespaces;
 * every other namespace was unguarded.
 *
 * Freezing the list makes the claim true in both directions: a key translated
 * must be removed here or the suite fails, and a key newly missing fails
 * wherever it lives.
 */
const JA_DEBT: readonly string[] = Object.freeze([
    "Workspace.nodes.music.fast",
    "Workspace.nodes.music.genders.female",
    "Workspace.nodes.music.genders.male",
    "Workspace.nodes.music.genre",
    "Workspace.nodes.music.genres.blues",
    "Workspace.nodes.music.genres.classicRock",
    "Workspace.nodes.music.genres.classical",
    "Workspace.nodes.music.genres.country",
    "Workspace.nodes.music.genres.dance",
    "Workspace.nodes.music.genres.dancepop",
    "Workspace.nodes.music.genres.deephouse",
    "Workspace.nodes.music.genres.electronic",
    "Workspace.nodes.music.genres.experimental",
    "Workspace.nodes.music.genres.experimentalPop",
    "Workspace.nodes.music.genres.folk",
    "Workspace.nodes.music.genres.hardRock",
    "Workspace.nodes.music.genres.hiphop",
    "Workspace.nodes.music.genres.house",
    "Workspace.nodes.music.genres.jazz",
    "Workspace.nodes.music.genres.kpop",
    "Workspace.nodes.music.genres.pop",
    "Workspace.nodes.music.genres.popPunk",
    "Workspace.nodes.music.genres.popRock",
    "Workspace.nodes.music.genres.rap",
    "Workspace.nodes.music.genres.reggae",
    "Workspace.nodes.music.genres.rnb",
    "Workspace.nodes.music.genres.rock",
    "Workspace.nodes.music.genres.rockAndRoll",
    "Workspace.nodes.music.genres.rockabilly",
    "Workspace.nodes.music.genres.soul",
    "Workspace.nodes.music.instrument",
    "Workspace.nodes.music.instrumentAndRhythm",
    "Workspace.nodes.music.instruments.acousticGuitar",
    "Workspace.nodes.music.instruments.banjo",
    "Workspace.nodes.music.instruments.bass",
    "Workspace.nodes.music.instruments.beats",
    "Workspace.nodes.music.instruments.brass",
    "Workspace.nodes.music.instruments.cello",
    "Workspace.nodes.music.instruments.doubleBass",
    "Workspace.nodes.music.instruments.drums",
    "Workspace.nodes.music.instruments.electricGuitar",
    "Workspace.nodes.music.instruments.fiddle",
    "Workspace.nodes.music.instruments.guitar",
    "Workspace.nodes.music.instruments.harmonica",
    "Workspace.nodes.music.instruments.piano",
    "Workspace.nodes.music.instruments.saxophone",
    "Workspace.nodes.music.instruments.strings",
    "Workspace.nodes.music.instruments.synthesizer",
    "Workspace.nodes.music.instruments.trumpet",
    "Workspace.nodes.music.instruments.violin",
    "Workspace.nodes.music.moderate",
    "Workspace.nodes.music.mood",
    "Workspace.nodes.music.moods.angry",
    "Workspace.nodes.music.moods.emotional",
    "Workspace.nodes.music.moods.happy",
    "Workspace.nodes.music.moods.intense",
    "Workspace.nodes.music.moods.melancholic",
    "Workspace.nodes.music.moods.romantic",
    "Workspace.nodes.music.moods.sad",
    "Workspace.nodes.music.moods.uplifting",
    "Workspace.nodes.music.noTagsSelected",
    "Workspace.nodes.music.selectedCount",
    "Workspace.nodes.music.slow",
    "Workspace.nodes.music.songTitle",
    "Workspace.nodes.music.songTitlePlaceholder",
    "Workspace.nodes.music.styleSettings",
    "Workspace.nodes.music.tagsHint",
    "Workspace.nodes.music.tagsPlaceholder",
    "Workspace.nodes.music.timbre",
    "Workspace.nodes.music.timbres.bright",
    "Workspace.nodes.music.timbres.dark",
    "Workspace.nodes.music.timbres.rock",
    "Workspace.nodes.music.timbres.soft",
    "Workspace.nodes.music.timbres.vocal",
    "Workspace.nodes.music.timbres.warm",
    "Workspace.nodes.music.voiceGender",
]);

/** Namespaces this work package adds. They may never join the debt. */
const NEW_NAMESPACES = [
    "Settings.storeUnreadable.",
    "Workspace.storeUnreadable.",
];

const flatten = (o: unknown, prefix = ""): string[] =>
    Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
        v && typeof v === "object" && !Array.isArray(v)
            ? flatten(v, `${prefix}${k}.`)
            : [`${prefix}${k}`],
    );

const EN = new Set(flatten(en));
const LOCALES: Record<string, unknown> = { ja, ko, vi, zh };
const JA_KEYS = new Set(flatten(ja));
const jaDebt = [...EN].filter((k) => !JA_KEYS.has(k)).sort();

describe("locale parity — all five files, frozen debt", () => {
    it("the frozen Japanese debt is exactly the SET it was on 2026-09-01", () => {
        // Set equality, not length. A count is satisfied by any swap: translate
        // one debt key, add one untranslated key, total unchanged, suite green.
        const paid = JA_DEBT.filter((k) => !jaDebt.includes(k));
        const grown = jaDebt.filter((k) => !JA_DEBT.includes(k));
        expect(
            grown,
            `ja is newly missing ${grown.length} key(s) outside the frozen debt: ${grown.join(", ")}`,
        ).toEqual([]);
        expect(
            paid,
            `${paid.length} debt key(s) are now translated — remove them from JA_DEBT so the debt cannot only grow: ${paid.join(", ")}`,
        ).toEqual([]);
    });

    it("no key of this work package is in the debt", () => {
        const leaked = jaDebt.filter((k) =>
            NEW_NAMESPACES.some((n) => k.startsWith(n)),
        );
        expect(
            leaked,
            "new keys ship in all five locales, they do not join the debt: " +
                leaked.join(", "),
        ).toEqual([]);
    });

    for (const [name, messages] of Object.entries(LOCALES)) {
        const keys = new Set(flatten(messages));

        it(`${name} is missing no key outside the frozen debt`, () => {
            const debt = name === "ja" ? new Set(JA_DEBT) : new Set<string>();
            const missing = [...EN].filter((k) => !keys.has(k) && !debt.has(k));
            expect(
                missing,
                `${name} is missing: ${missing.join(", ")}`,
            ).toEqual([]);
        });

        it(`${name} has no key absent from en`, () => {
            const extra = [...keys].filter((k) => !EN.has(k));
            expect(
                extra,
                `${name} has keys en does not: ${extra.join(", ")}`,
            ).toEqual([]);
        });
    }
});
