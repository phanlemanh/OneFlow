/**
 * Shared harness for the settings-dialog suites.
 *
 * Four eval files drive the same screen through the same five failure shapes;
 * without one harness they would drift apart, and a drifted harness is how two
 * suites end up asserting about two different screens while both look green.
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { expect, vi } from "vitest";
import { SettingsDialog } from "@/components/workspace/settings-dialog";
import vi_msg from "@/i18n/messages/vi.json";

export const msg = vi_msg;
export const S = vi_msg.Settings;
export const SU = vi_msg.Settings.storeUnreadable;

/** A healthy GET body. The positive control every refusal case needs. */
export const healthyGet = (
    env: Record<string, string> = { OPENAI_API_KEY: "sk-1" },
) => new Response(JSON.stringify({ env, pluginEnv: [] }), { status: 200 });

export interface Harness {
    fetchMock: ReturnType<typeof vi.fn>;
    puts: () => unknown[][];
    gets: () => unknown[][];
}

/**
 * Render the dialog, open it, and wait for the fetch to settle.
 *
 * `makeGet` produces the GET response (or throws, for the network shape).
 * `putResponse` is what a PUT answers with, so the destructive-write suites can
 * drive the whole open -> escape -> confirm sequence.
 */
export async function openSettings(
    makeGet: () => Response,
    putResponse: () => Response = () =>
        new Response(JSON.stringify({ env: {}, verdicts: {} }), {
            status: 200,
        }),
    locale: { locale: string; messages: unknown } = {
        locale: "vi",
        messages: vi_msg,
    },
): Promise<Harness> {
    let firstGetDone = false;
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
        if (init?.method === "PUT") return putResponse();
        // Only the FIRST get uses the failure shape; a refetch after a
        // successful replace must find a healthy store, or the return-to-normal
        // assertion could never be true.
        if (firstGetDone) return healthyGet({});
        firstGetDone = true;
        return makeGet();
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
        <NextIntlClientProvider
            locale={locale.locale}
            messages={locale.messages as Record<string, unknown>}
        >
            <SettingsDialog />
        </NextIntlClientProvider>,
    );

    // Derive the trigger's name from the catalogue actually in use. Hardcoding
    // the Vietnamese label made the dialog unopenable under any other locale —
    // which is precisely what the i18n eval needs to exercise.
    const triggerName = (locale.messages as { Settings: { title: string } })
        .Settings.title;
    fireEvent.click(screen.getByRole("button", { name: triggerName }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    // The dialog paints its blocked/normal body after the promise settles.
    await waitFor(() =>
        expect(document.querySelector('[role="dialog"]')).toBeTruthy(),
    );

    const byMethod = (want: string) =>
        fetchMock.mock.calls.filter(
            (c: unknown[]) =>
                ((c[1] as RequestInit | undefined)?.method ?? "GET") === want,
        );

    return {
        fetchMock,
        puts: () => byMethod("PUT"),
        gets: () => byMethod("GET"),
    };
}

/** Inputs still on screen — the form is REPLACED, not merely covered. */
export const inputCount = () =>
    document.querySelectorAll('[role="dialog"] input').length;

export const notices = () => screen.queryAllByTestId("store-unreadable-notice");
