/**
 * Cross-component request to open the settings screen.
 *
 * An exported constant with a registered listener, following the repo's own
 * pattern for window events (`ONBOARDING_RECOVERY_EVENT`,
 * `TASK_CANCEL_REQUEST_EVENT`) rather than a bare string literal duplicated at
 * each dispatch site.
 *
 * The shape matters here more than usual. When the key store cannot be read,
 * the two on-canvas surfaces deliberately have NO way to repair it — the
 * destructive write lives only in the settings screen — so this event is the
 * single way forward they offer. A dispatch with no listener would leave the
 * user in a card whose only control does nothing, which is a worse dead end
 * than the one the blocked state exists to prevent.
 */
export const OPEN_SETTINGS_EVENT = "oneflow:open-settings";

/** Ask the settings screen to open. Safe to call from any client component. */
export function requestOpenSettings(): void {
    window.dispatchEvent(new CustomEvent(OPEN_SETTINGS_EVENT));
}
