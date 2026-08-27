/**
 * Pre-flight check for the env keys a plugin declares it cannot run without.
 *
 * Before this existed, a task with a missing/blank credential was handed to
 * the plugin anyway and died minutes later inside the provider's SDK, with an
 * error message in the provider's own words — words no failure classifier can
 * route. The canonical "Missing required env var X" sentence below is the
 * contract with `classifyFailure()` (src/lib/onboarding/failure-actions.ts):
 * the executor SPEAKS it, the classifier ROUTES it to the key form, and the
 * node's inline prompt mounts from the same sentence. required-env.test.ts
 * pins that relation from both sides.
 */

/** The subset of a plugin's `tongflow.plugin.json` env entry read here. */
export type RequiredEnvDecl = {
    key: string;
    required?: boolean;
};

/**
 * Required keys with no usable value. A blank or whitespace-only value counts
 * as missing: an empty string satisfies "the variable exists" while failing
 * the provider exactly like an absent one — the case S4 round 1 caught live.
 */
export function missingRequiredEnvKeys(
    declared: readonly RequiredEnvDecl[],
    env: Readonly<Record<string, string | undefined>>,
): string[] {
    return declared
        .filter((decl) => decl.required === true)
        .map((decl) => decl.key)
        .filter((key) => !env[key] || env[key].trim() === "");
}

/**
 * The canonical failure sentence. The FIRST key is the one classifiers
 * capture; the rest are named so a human reading the toast sees the whole
 * bill, not one item of it.
 */
export function missingRequiredEnvMessage(keys: readonly string[]): string {
    const [first, ...rest] = keys;
    const alsoMissing =
        rest.length > 0 ? ` (also missing: ${rest.join(", ")})` : "";
    return `Missing required env var ${first}${alsoMissing}`;
}
