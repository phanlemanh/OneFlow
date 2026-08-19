/**
 * Does this key actually work?
 *
 * Verification means asking the thing the key unlocks. It explicitly does NOT
 * mean checking the key's shape: a well-formed key that the provider rejects is
 * the case that matters, and a regex calls it good. "Saved" has to mean
 * "usable", or the user discovers the truth one failed run later.
 */

export type KeyVerdict = { works: boolean; detail: string };
export type Prober = (envKey: string, value: string) => Promise<Response>;

const PROBES: Readonly<Record<string, Prober>> = {
    OPENAI_API_KEY: (_k, value) =>
        fetch("https://api.openai.com/v1/models", {
            headers: { Authorization: `Bearer ${value}` },
        }),
    // Add one entry per provider whose plugins declare a required key.
};

export async function verifyKey(
    envKey: string,
    value: string,
    probe?: Prober,
): Promise<KeyVerdict> {
    const run = probe ?? PROBES[envKey];
    if (!run) {
        return {
            works: false,
            detail: `Chưa kiểm tra được khoá cho ${envKey} (no prober).`,
        };
    }
    try {
        const res = await run(envKey, value);
        return res.ok
            ? { works: true, detail: "Nhà cung cấp chấp nhận khoá này." }
            : {
                  works: false,
                  detail: `Nhà cung cấp từ chối khoá này (HTTP ${res.status}).`,
              };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            works: false,
            detail: `Không gọi được tới nhà cung cấp: ${message}`,
        };
    }
}
