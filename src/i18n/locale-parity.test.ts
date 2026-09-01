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
 * Japanese keys already missing on 2026-09-01, FROZEN at the measured count.
 *
 * The number is an assertion in its own right, and it is checked in BOTH
 * directions. An allowlist that may only grow is how a parity guard quietly
 * stops guarding: every new gap gets waved through by the very mechanism meant
 * to bound the old ones. So a key that has since been translated must be
 * removed from the debt or this fails. The debt can shrink; it can never
 * silently grow.
 */
const JA_DEBT_COUNT = 76;

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
    it("the frozen Japanese debt is exactly the size it was on 2026-09-01", () => {
        expect(
            jaDebt.length,
            `ja is missing ${jaDebt.length} keys, frozen at ${JA_DEBT_COUNT}. ` +
                "Translated some? Lower the constant. Grew? You added an " +
                `untranslated key: ${jaDebt.slice(0, 5).join(", ")}`,
        ).toBe(JA_DEBT_COUNT);
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
            const debt = name === "ja" ? new Set(jaDebt) : new Set<string>();
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
