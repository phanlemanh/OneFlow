// @vitest-environment jsdom
/**
 * E5 / AC-11 (cross-layer) — exactly one write leaves the browser, and it
 * carries what it is supposed to carry.
 *
 * Counting the writes is only half. A flagged PUT that omits `env`, or carries
 * the old rubbish forward, means the user accepted losing their keys and the
 * store stayed broken — the single guard rail leading nowhere. So the body is
 * asserted too.
 */
import {
    act,
    cleanup,
    fireEvent,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { READ_FAILURES } from "@/lib/settings/__fixtures__/read-failures";
import { openSettings, SU } from "./__fixtures__/settings-harness";

const unreadable = READ_FAILURES[0][1];
const bodyOf = (call: unknown[]) =>
    JSON.parse(String((call[1] as RequestInit).body));

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("the destructive write", () => {
    it("is exactly one PUT, flagged, carrying an empty store", async () => {
        const h = await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
        fireEvent.click(
            await screen.findByRole("button", { name: SU.confirmOk }),
        );

        await waitFor(() => expect(h.puts().length).toBe(1));
        const body = bodyOf(h.puts()[0]);
        expect(body.replaceUnreadableStore).toBe(true);
        // `env` must be PRESENT and empty — not absent. Written first as
        // `Object.keys(body.env ?? {}).length` , which passes when `env` is
        // missing entirely: the `?? {}` silently supplied the very shape the
        // assertion was meant to demand. Caught by running the red direction,
        // which is the only reason it is not still in here.
        expect(
            Object.hasOwn(body, "env"),
            `body must carry env; body was ${JSON.stringify(body)}`,
        ).toBe(true);
        expect(
            body.env !== null &&
                typeof body.env === "object" &&
                !Array.isArray(body.env),
            `env must be a plain object; body was ${JSON.stringify(body)}`,
        ).toBe(true);
        expect(
            Object.keys(body.env).length,
            `env must be empty; body was ${JSON.stringify(body)}`,
        ).toBe(0);
    });

    it("never sends an UNFLAGGED PUT at any point in the sequence", async () => {
        // Asserted across the whole array, not just the last element: a write
        // slipped in before the confirmation is precisely the silent overwrite
        // this dossier exists to stop.
        const h = await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
        fireEvent.click(
            await screen.findByRole("button", { name: SU.confirmOk }),
        );

        await waitFor(() => expect(h.puts().length).toBeGreaterThan(0));
        const unflagged = h
            .puts()
            .filter((c) => !bodyOf(c).replaceUnreadableStore);
        expect(
            unflagged.length,
            `${unflagged.length} unflagged PUT(s) left the browser`,
        ).toBe(0);
    });

    it("stays at exactly one PUT when the confirm button is DOUBLE clicked", async () => {
        // A double click is the ordinary way "exactly one write" becomes two.
        const h = await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
        const ok = await screen.findByRole("button", { name: SU.confirmOk });

        await act(async () => {
            fireEvent.click(ok);
            fireEvent.click(ok);
        });

        await waitFor(() => expect(h.puts().length).toBeGreaterThan(0));
        expect(
            h.puts().length,
            `double click produced ${h.puts().length} PUT(s)`,
        ).toBe(1);
    });

    it("NEGATIVE CONTROL: cancelling writes nothing at all", async () => {
        const h = await openSettings(unreadable);
        fireEvent.click(screen.getByRole("button", { name: SU.escape }));
        fireEvent.click(
            await screen.findByRole("button", { name: SU.confirmCancel }),
        );
        expect(h.puts().length).toBe(0);
    });
});
