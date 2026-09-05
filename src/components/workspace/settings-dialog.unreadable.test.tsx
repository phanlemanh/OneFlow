// @vitest-environment jsdom
/**
 * E2 / AC-10 — what the settings screen SHOWS when the key store is unreadable.
 *
 * Five failure shapes, not one. The criterion's verbatim text asked only for
 * the 503 cell; the parent dossier's carry-forward lesson demanded every read
 * error, and the amendment of 2026-09-01 widened the Given to match. On `main`
 * all five leave an empty, saveable form.
 */
import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
    EXPECTED_STATE,
    READ_FAILURES,
} from "@/lib/settings/__fixtures__/read-failures";
import {
    healthyGet,
    inputCount,
    notices,
    openSettings,
    S,
    SU,
} from "./__fixtures__/settings-harness";

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("settings screen, store unreadable — all five shapes", () => {
    for (const [name, make] of READ_FAILURES) {
        it(`blocks and explains for ${name}`, async () => {
            await openSettings(make);

            // (a) the form is REPLACED, not covered
            expect(
                inputCount(),
                `shape ${name}: key form must be replaced`,
            ).toBe(0);

            // (b) one shared card, carrying the reassurance the criterion
            // names. WHICH card depends on the shape: khong-noi-sai-ve-kho-khoa
            // split the single "store unreadable" verdict into three, because
            // an expired session and a proxy 502 say nothing about the bytes on
            // disk. The reassurance is the half that survives unchanged — it is
            // true of all three.
            const want = EXPECTED_STATE[name];
            const card = screen.queryAllByTestId(`${want}-notice`);
            expect(
                card.length,
                `shape ${name}: expected the ${want} card`,
            ).toBe(1);
            expect(
                card[0].textContent,
                `shape ${name}: must promise nothing was changed`,
            ).toContain(SU.unchanged);

            // (c) Save PRESENT and disabled — hiding it is a failure, not a pass
            const save = screen.getByRole("button", { name: S.save });
            expect(
                (save as HTMLButtonElement).disabled,
                `shape ${name}: Save must be present but not clickable`,
            ).toBe(true);

            // (d) exactly one way out, and WHICH way out is the claim.
            // The destructive escape belongs to a genuinely broken store and
            // to nothing else; every other shape gets a retry instead, because
            // there is nothing here to repair.
            expect(
                screen.queryAllByRole("button", { name: SU.escape }).length,
                `shape ${name}: the wipe button belongs to store-unreadable only`,
            ).toBe(want === "store-unreadable" ? 1 : 0);
            expect(
                screen.queryAllByRole("button", { name: SU.retry }).length,
                `shape ${name}: every blocked card offers a retry`,
            ).toBe(1);
        });
    }

    it("POSITIVE CONTROL: a healthy store renders the normal form", async () => {
        // Without this, a dialog that blocks unconditionally passes every case
        // above.
        await openSettings(() => healthyGet());
        expect(notices().length, "a healthy store shows no blocked card").toBe(
            0,
        );
        expect(
            inputCount(),
            "a healthy store shows the key form",
        ).toBeGreaterThan(0);
        expect(
            (screen.getByRole("button", { name: S.save }) as HTMLButtonElement)
                .disabled,
        ).toBe(false);
    });
});
