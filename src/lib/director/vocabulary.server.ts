import "server-only";

import { loadPluginsRegistry } from "@/lib/plugins/plugins-registry.server";
import { installedSafeSlots, renderVocabulary } from "./vocabulary";

export interface DirectorCatalog {
    /** LLM-facing vocabulary block (installed, director-safe slots only). */
    vocab: string;
    /** slot -> head of nodePluginMap (the default installed plugin). */
    slotDefaultPlugin: Partial<Record<string, string>>;
}

export function buildDirectorCatalog(): DirectorCatalog {
    const reg = loadPluginsRegistry();
    const slots = installedSafeSlots(reg.nodePluginMap);
    const slotDefaultPlugin: Partial<Record<string, string>> = {};
    for (const slot of slots) {
        // installedSafeSlots only keeps slots with a non-empty plugin list.
        slotDefaultPlugin[slot] = reg.nodePluginMap[slot][0];
    }
    return { vocab: renderVocabulary(slots), slotDefaultPlugin };
}
