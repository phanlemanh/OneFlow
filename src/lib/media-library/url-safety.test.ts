import { describe, expect, it } from "vitest";
import { checkFetchTarget, isPrivateHost } from "./url-safety";

/**
 * A full table, not a handful of cases.
 *
 * The two defects this module replaced were both "the rule was there but this
 * spelling walked past it", so the measure that matters is coverage of the
 * SPELLINGS, asserted one row at a time. `new URL()` normalises some of them
 * before we ever see them — those rows document that, and would go red if a
 * future runtime stopped doing it.
 */
const PRIVATE = [
    ["dotted loopback", "https://127.0.0.1/x"],
    ["dotted loopback, high octet", "https://127.99.1.2/x"],
    ["all-zeros", "https://0.0.0.0/x"],
    ["RFC1918 ten", "https://10.1.2.3/x"],
    ["RFC1918 one-nine-two", "https://192.168.1.1/x"],
    ["RFC1918 one-seven-two low", "https://172.16.0.1/x"],
    ["RFC1918 one-seven-two high", "https://172.31.255.255/x"],
    ["link-local metadata", "https://169.254.169.254/latest/meta-data/"],
    ["CGNAT low", "https://100.64.0.1/x"],
    ["CGNAT high", "https://100.127.255.255/x"],
    ["decimal IPv4 (URL normalises)", "https://2130706433/x"],
    ["octal IPv4 (URL normalises)", "https://0177.0.0.1/x"],
    ["IPv6 loopback", "https://[::1]/x"],
    ["IPv6 unspecified", "https://[::]/x"],
    ["IPv6 ULA", "https://[fd00::1]/x"],
    ["IPv6 link-local", "https://[fe80::1]/x"],
    ["IPv4-mapped IPv6, dotted", "https://[::ffff:127.0.0.1]/x"],
    ["IPv4-mapped IPv6, hex", "https://[::ffff:7f00:1]/x"],
    ["IPv4-mapped IPv6, RFC1918", "https://[::ffff:10.0.0.5]/x"],
    ["localhost", "https://localhost/x"],
    ["localhost subdomain", "https://api.localhost/x"],
    // The absolute-FQDN spellings. WHATWG keeps the root label's trailing dot
    // on NAMES (it strips it from dotted-quad IPs), so `localhost.` reached the
    // guard as a host that matched no branch at all and was allowed through.
    ["localhost, absolute FQDN", "https://localhost./x"],
    ["localhost subdomain, absolute FQDN", "https://api.localhost./x"],
    ["localhost, several trailing dots", "https://localhost.../x"],
] as const;

const PUBLIC = [
    ["ordinary host", "https://cdn.example/clip.mp4"],
    ["public IPv4", "https://93.184.216.34/x"],
    ["public IPv6", "https://[2606:2800:220:1:248:1893:25c8:1946]/x"],
    // Adjacent to private ranges on purpose: an over-broad pattern catches these
    // and quietly breaks legitimate downloads, which is the failure mode a
    // refusal-only test set would never notice.
    ["just below CGNAT", "https://100.63.255.255/x"],
    ["just above CGNAT", "https://100.128.0.1/x"],
    ["just below RFC1918 172", "https://172.15.0.1/x"],
    ["just above RFC1918 172", "https://172.32.0.1/x"],
    ["not-localhost lookalike", "https://notlocalhost.example/x"],
    // Stripping the trailing dot must not start refusing ordinary absolute
    // FQDNs: a public name with a root label is still public.
    ["public host, absolute FQDN", "https://cdn.example./clip.mp4"],
] as const;

describe("isPrivateHost — every spelling a URL can carry", () => {
    for (const [name, url] of PRIVATE) {
        it(`refuses ${name}`, () => {
            expect(isPrivateHost(new URL(url).hostname)).toBe(true);
        });
    }

    /**
     * The load-bearing half: a classifier that answered "private" to everything
     * would pass all 21 rows above and break every real download.
     */
    for (const [name, url] of PUBLIC) {
        it(`allows ${name}`, () => {
            expect(isPrivateHost(new URL(url).hostname)).toBe(false);
        });
    }

    it("covers both directions, so neither list can quietly empty out", () => {
        expect(PRIVATE.length).toBeGreaterThanOrEqual(24);
        expect(PUBLIC.length).toBeGreaterThanOrEqual(9);
    });
});

describe("checkFetchTarget — scheme, host, and the dev exemption", () => {
    it("refuses http on a public host, naming the scheme", () => {
        const v = checkFetchTarget("http://cdn.example/clip.mp4", null);
        expect(v.ok).toBe(false);
        if (v.ok) return;
        expect(v.reason).toBe("scheme");
    });

    it("refuses https to a private host, naming the host", () => {
        const v = checkFetchTarget("https://169.254.169.254/x", null);
        expect(v.ok).toBe(false);
        if (v.ok) return;
        expect(v.reason).toBe("private-host");
        expect(v.detail).toBe("169.254.169.254");
    });

    it("refuses a malformed URL rather than throwing", () => {
        const v = checkFetchTarget("not a url", null);
        expect(v.ok).toBe(false);
        if (v.ok) return;
        expect(v.reason).toBe("malformed");
    });

    it("allows a public https target", () => {
        expect(checkFetchTarget("https://cdn.example/clip.mp4", null).ok).toBe(
            true,
        );
    });

    it("exempts EXACTLY the configured local library, host and port", () => {
        expect(
            checkFetchTarget("http://127.0.0.1:5599/bytes", "127.0.0.1:5599")
                .ok,
        ).toBe(true);
    });

    /**
     * The reason the exemption is a host:port match and not "any localhost in
     * development": otherwise a library response could point at any other port
     * on the developer's machine and OneFlow would fetch it.
     */
    it("does NOT exempt a different port on the same local host", () => {
        const v = checkFetchTarget("http://127.0.0.1:5432/x", "127.0.0.1:5599");
        expect(v.ok).toBe(false);
        if (v.ok) return;
        expect(v.reason).toBe("scheme");
    });
});
