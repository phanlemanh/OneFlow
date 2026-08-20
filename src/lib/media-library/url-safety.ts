/**
 * The single place that decides whether OneFlow may fetch a URL the library
 * handed it.
 *
 * This exists as its own module because the previous shape — a regex checked
 * inline on the download path — produced the same defect twice: a guard that
 * was written but not reached (redirects skipped it), then a guard that was
 * reached but incomplete (`::ffff:127.0.0.1` walked straight through it). Both
 * are the same failure, and both come from having the rule live next to the
 * code that happens to call it rather than in one auditable place with one
 * exhaustive table.
 *
 * KNOWN LIMIT, deliberate: this classifies the LITERAL host in the URL. A public
 * name that DNS-resolves to a private address (`internal.example.com` ->
 * 10.0.0.5) is not caught here, and resolving it would still leave a
 * time-of-check/time-of-use gap between the lookup and the connection. Closing
 * that needs a socket-level hook, which is a bigger change than stage A carries;
 * it is written into the contract's Known limits instead of being silently
 * absent.
 */

/** Loopback, link-local, and every RFC1918 / CGNAT / ULA form a URL can spell. */
const PRIVATE_IPV4 =
    /^(0\.|10\.|127\.|169\.254\.|192\.168\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|172\.(1[6-9]|2\d|3[01])\.)/;

function isPrivateIpv4(host: string): boolean {
    return PRIVATE_IPV4.test(host) || host === "0.0.0.0";
}

/**
 * `new URL()` normalises decimal and octal IPv4 (`2130706433`, `0177.0.0.1`)
 * to dotted form, so those arrive here already readable. IPv6 does NOT get that
 * courtesy: it arrives bracketed and compressed, and an IPv4-mapped address
 * (`::ffff:127.0.0.1`) normalises to `::ffff:7f00:1` — which no IPv4 pattern
 * matches. That form was a real hole.
 */
function isPrivateIpv6(host: string): boolean {
    if (!host.startsWith("[") || !host.endsWith("]")) return false;
    const inner = host.slice(1, -1).toLowerCase();

    if (inner === "::1" || inner === "::") return true;
    // Unique-local fc00::/7 and link-local fe80::/10.
    if (/^f[cd][0-9a-f]{2}:/.test(inner)) return true;
    if (/^fe[89ab][0-9a-f]:/.test(inner)) return true;

    const mapped = inner.match(/^::ffff:(.+)$/);
    if (!mapped) return false;
    const tail = mapped[1];
    // Either spelling of a mapped address: dotted (::ffff:127.0.0.1) or the
    // hex form the URL parser rewrites it into (::ffff:7f00:1).
    if (tail.includes(".")) return isPrivateIpv4(tail);
    const words = tail.split(":");
    if (words.length !== 2) return false;
    const high = Number.parseInt(words[0], 16);
    const low = Number.parseInt(words[1], 16);
    if (Number.isNaN(high) || Number.isNaN(low)) return false;
    const dotted = [high >> 8, high & 0xff, low >> 8, low & 0xff].join(".");
    return isPrivateIpv4(dotted);
}

export function isPrivateHost(host: string): boolean {
    const lower = host.toLowerCase();
    if (lower === "localhost" || lower.endsWith(".localhost")) return true;
    return isPrivateIpv4(lower) || isPrivateIpv6(lower);
}

export type UrlVerdict =
    | { ok: true }
    | {
          ok: false;
          reason: "malformed" | "scheme" | "private-host";
          detail: string;
      };

/**
 * @param raw           the URL to fetch — from the library, or from a redirect.
 * @param devLocalHost  host:port of the configured library, and only when that
 *                      library is itself a local dev instance. Anything else on
 *                      localhost stays refused even in development.
 */
export function checkFetchTarget(
    raw: string,
    devLocalHost: string | null,
): UrlVerdict {
    let url: URL;
    try {
        url = new URL(raw);
    } catch {
        return { ok: false, reason: "malformed", detail: raw.slice(0, 120) };
    }

    const exempt = devLocalHost !== null && url.host === devLocalHost;
    if (exempt) return { ok: true };

    if (url.protocol !== "https:") {
        return { ok: false, reason: "scheme", detail: url.protocol };
    }
    if (isPrivateHost(url.hostname)) {
        return { ok: false, reason: "private-host", detail: url.hostname };
    }
    return { ok: true };
}
