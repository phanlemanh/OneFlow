// @vitest-environment jsdom
/**
 * E4 / AC-11 — the one way out, and what it tells the user first.
 *
 * The escape destroys data on purpose: the owner ruled on 2026-08-31 that the
 * broken store is NOT preserved, which makes this confirmation the entire guard
 * rail. So the two things it must say are asserted separately — a box that says
 * half of it is a different product than one that says both.
 */
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { READ_FAILURES } from "@/lib/settings/__fixtures__/read-failures";
import {
    inputCount,
    notices,
    openSettings,
    SU,
} from "./__fixtures__/settings-harness";

const unreadable = READ_FAILURES[0][1]; // the 503 shape

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("the escape from an unreadable store", () => {
    it("asks first, and says BOTH halves of what will happen", async () => {
        await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));

        const box = await screen.findByRole("alertdialog");
        // Two assertions, not one `toContain` of the whole sentence: if a half
        // goes missing the failure has to name which half.
        expect(box.textContent, "must say the stored keys are lost").toContain(
            "sẽ mất",
        );
        expect(box.textContent, "must say the loss is unrecoverable").toContain(
            "không khôi phục được",
        );
    });

    it("styles the confirming button with the repo's destructive variant", async () => {
        // A hand-copied class list is how the dark-mode branches and the focus
        // ring got dropped in an earlier draft — exactly what the dark-theme
        // accessibility floor measures.
        await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
        const ok = await screen.findByRole("button", { name: SU.confirmOk });
        expect(ok.className).toContain("bg-destructive");
    });

    it("returns the screen to normal once the store has been replaced", async () => {
        await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
        fireEvent.click(
            await screen.findByRole("button", { name: SU.confirmOk }),
        );

        await waitFor(() => expect(notices().length).toBe(0));
        expect(
            document.querySelector('[role="dialog"]'),
            "the settings dialog stays open, now in its normal state",
        ).toBeTruthy();
    });

    it("NEGATIVE CONTROL: cancelling leaves the blocked state exactly as it was", async () => {
        // Without this, a confirm box that always proceeds passes the case
        // above.
        await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
        fireEvent.click(
            await screen.findByRole("button", { name: SU.confirmCancel }),
        );

        await waitFor(() =>
            expect(screen.queryByRole("alertdialog")).toBeNull(),
        );
        expect(notices().length, "still blocked").toBe(1);
        expect(inputCount(), "still no key form").toBe(0);
    });
});
