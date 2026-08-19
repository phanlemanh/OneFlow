/**
 * Turn a task failure into the one exit that actually helps.
 *
 * Three outcomes only, and the third is deliberately empty: an error we did not
 * recognise gets today's plain message and no button. A plausible-looking
 * action for an unknown cause is worse than none — it looks like help and ends
 * somewhere useless.
 *
 * Every pattern below is anchored to a string this repo really produces (or
 * will produce), not to an imagined one: a regex tuned to an invented message
 * is a test that passes and a product that does not.
 */

export type FailureAction =
    | { kind: "install-plugin"; pluginId: string }
    | { kind: "enter-key"; envKey: string }
    | { kind: "none" };

/**
 * "No plugin installed for nodeSlot=<slot> (<pluginId>)" — the slot has no
 * installed implementation, and the message names the one to install.
 */
const MISSING_PLUGIN = /no plugin installed for nodeslot=\S+\s*\(([^)]+)\)/i;

/**
 * "Unknown plugin: <pluginId>" — what `executePlugin` / `execPlugin` throw
 * today when a workflow references a plugin the registry does not know.
 * Deliberately narrow: `Plugin <id> does not implement nodeSlot=<slot>` also
 * names a plugin id, but that plugin is already installed, so re-installing it
 * fixes nothing and must fall through to "none".
 */
const UNKNOWN_PLUGIN = /unknown plugin:\s*([\w.-]+)/i;

/** "Missing required env var <KEY>" — the key the run needs is absent. */
const MISSING_KEY = /missing required env var ([A-Z][A-Z0-9_]*)/i;

/**
 * "Set <KEY> in Settings" — the shape `director.server.ts` returns today for a
 * missing provider key.
 */
const UNSET_KEY = /set ([A-Z][A-Z0-9_]*) in settings/i;

export function classifyFailure(message: string): FailureAction {
    const plugin = MISSING_PLUGIN.exec(message) ?? UNKNOWN_PLUGIN.exec(message);
    if (plugin) return { kind: "install-plugin", pluginId: plugin[1] };

    const key = MISSING_KEY.exec(message) ?? UNSET_KEY.exec(message);
    if (key) return { kind: "enter-key", envKey: key[1] };

    return { kind: "none" };
}
