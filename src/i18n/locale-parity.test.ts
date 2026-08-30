// @vitest-environment node
/**
 * Locale parity for the screens this change set touches.
 *
 * The key list is DERIVED from the writers, never hand-listed. A hand-listed
 * constant cannot go red on the day someone adds a `t()` call and forgets four
 * of the five bundles — it only knows the keys whoever wrote it remembered,
 * which makes "every new string is translated" a claim about the test author's
 * memory rather than about the product.
 *
 * The scope is deliberately these files rather than the whole repo: `ja.json`
 * is already 76 keys behind the others (measured 2026-08-31, 987 vs 1063), so a
 * repo-wide check would go red on old debt and say nothing about this work.
 */

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { COPY as PROTO_COPY } from "@/components/proto/chong-mat-khoa-byo-proto";

const LOCALES = ["en", "ja", "ko", "vi", "zh"] as const;

/** Files this change set makes user-visible copy from, via `t("...")`. */
const WRITERS = [
    "src/components/workspace/settings-dialog.tsx",
    "src/components/workspace/nodes/add/add-media-library-node.tsx",
] as const;

/** `t("a.b")` and `tSettings("a.b")` alike — any identifier ending in `t`/`T`. */
const CALL = /\b[a-zA-Z]*[tT]\(\s*"([A-Za-z0-9_.]+)"/g;

/** Only keys this feature introduced; older ones carry their own history. */
const OWNED =
    /^(storeUnreadable|dropStore|openSettingsHint|saveBlockedUnreadable)/;

function keysUsedBy(file: string): string[] {
    return [...readFileSync(file, "utf8").matchAll(CALL)].map((m) => m[1]);
}

function dig(bundle: unknown, dotted: string): unknown {
    return dotted
        .split(".")
        .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown>)?.[part],
            bundle,
        );
}

const bundles = Object.fromEntries(
    LOCALES.map((l) => [
        l,
        JSON.parse(readFileSync(`src/i18n/messages/${l}.json`, "utf8")),
    ]),
) as Record<(typeof LOCALES)[number], unknown>;

const used = [...new Set(WRITERS.flatMap(keysUsedBy))].filter((k) =>
    OWNED.test(k),
);

describe("locale parity for this change set", () => {
    it("actually found keys to check", () => {
        // Without this, a regex that stops matching turns the whole suite into
        // a vacuous green.
        expect(used.length).toBeGreaterThanOrEqual(8);
    });

    it.each(LOCALES)("%s carries every key these screens use", (loc) => {
        const missing = used.filter(
            (k) => typeof dig(bundles[loc], `Settings.${k}`) !== "string",
        );
        expect(
            missing,
            `thiếu khoá trong ${loc}.json: ${missing.join(", ")}`,
        ).toEqual([]);
    });

    it.each(LOCALES.filter((l) => l !== "en"))(
        "%s is translated, not copied from English",
        (loc) => {
            const copied = used.filter(
                (k) =>
                    dig(bundles[loc], `Settings.${k}`) ===
                    dig(bundles.en, `Settings.${k}`),
            );
            expect(
                copied,
                `chưa dịch trong ${loc}.json: ${copied.join(", ")}`,
            ).toEqual([]);
        },
    );
});

/**
 * The prototype and the shipped screens must say the same thing.
 *
 * The accessibility floor for this feature is measured on the PROTOTYPE, while
 * the behaviour criteria are measured on the real components. If the two drift,
 * the accessibility run is scanning a screen nobody uses — a green that has
 * stopped being about the product. Rather than re-checking that by eye each
 * round, this pins it.
 */
describe("prototype says what the shipped screens say", () => {
    const PAIRS: ReadonlyArray<[keyof typeof PROTO_COPY, string]> = [
        ["unreadableTitle", "storeUnreadableTitle"],
        ["unreadableBody", "storeUnreadableBody"],
        ["unreadableReasonLabel", "storeUnreadableReasonLabel"],
        ["escape", "dropStore"],
        ["confirmTitle", "dropStoreConfirmTitle"],
        ["confirmBody", "dropStoreConfirmBody"],
        ["confirmOk", "dropStoreConfirmOk"],
        ["confirmCancel", "dropStoreCancel"],
        ["panelHint", "openSettingsHint"],
        ["panelError", "saveBlockedUnreadable"],
    ];

    it.each(PAIRS)(
        "proto %s matches Settings.%s in vi.json",
        (protoKey, viKey) => {
            expect(PROTO_COPY[protoKey]).toBe(
                dig(bundles.vi, `Settings.${viKey}`),
            );
        },
    );
});
