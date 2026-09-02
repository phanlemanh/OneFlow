// @vitest-environment jsdom
/**
 * E3 / AC-10 (cross-layer) — what LEAVES the browser, not what it draws.
 *
 * E2 proves the screen looks right. A screen can look right and still post: on
 * `main`, `abi-node-shell` renders a perfectly sensible prompt and sends its
 * PUT anyway. The criterion's server half is a claim about requests, so this
 * suite counts requests.
 */
import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { READ_FAILURES } from "@/lib/settings/__fixtures__/read-failures";
import { healthyGet, openSettings, S } from "./__fixtures__/settings-harness";

afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
});

describe("settings screen, store unreadable — nothing is written", () => {
    for (const [name, make] of READ_FAILURES) {
        it(`sends one GET and zero PUTs for ${name}`, async () => {
            const h = await openSettings(make);

            // Try every remaining way to provoke a write.
            fireEvent.click(screen.getByRole("button", { name: S.save }));
            const dialog = document.querySelector('[role="dialog"]');
            if (dialog) {
                fireEvent.keyDown(dialog, { key: "Enter", code: "Enter" });
            }

            expect(
                h.puts().length,
                `shape ${name} sent ${h.puts().length} PUT(s) — none may leave the browser`,
            ).toBe(0);
            expect(h.gets().length, `shape ${name}`).toBe(1);
        });
    }

    it("POSITIVE CONTROL: a healthy store DOES send exactly one PUT on Save", async () => {
        // Without this, a dialog that can never write at all satisfies every
        // case above.
        const h = await openSettings(() => healthyGet());
        fireEvent.click(screen.getByRole("button", { name: S.save }));
        await vi.waitFor(() => expect(h.puts().length).toBe(1));
    });
});
