/**
 * The library's asset endpoint returns NO mime, size or filename — those fields
 * are not in its contract and not columns on its table. The extension therefore
 * has to be inferred, and it matters: /api/uploads/[...path] derives the served
 * Content-Type FROM the extension, so a wrong suffix is a clip that sits in the
 * store and will not play.
 *
 * Generic mime table on purpose: no domain vocabulary crosses this file.
 */
const MIME_TO_EXT: Record<string, string> = {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/x-matroska": "mkv",
};

const DEFAULT_EXT = "mp4";

/**
 * The only suffixes this feature may persist.
 *
 * Rung 1 reads the suffix off a URL an OUTSIDE service chose, and
 * /api/uploads/[...path] derives the served Content-Type from the stored
 * suffix — so an unconstrained rung 1 lets a `.svg` object key become a file
 * served same-origin as `image/svg+xml`, i.e. active content. Stage A only ever
 * asks for `media_type: "video"`, so the allow-list is the video set and
 * anything else falls through to the declared type.
 */
const ALLOWED_EXT = new Set(Object.values(MIME_TO_EXT));

export function extensionFor(url: string, contentType: string | null): string {
    // Rung 1: the signed URL usually keeps the original object name.
    let pathname = "";
    try {
        pathname = new URL(url).pathname;
    } catch {
        pathname = "";
    }
    const fromPath = pathname
        .match(/\.([A-Za-z0-9]{2,5})$/)?.[1]
        ?.toLowerCase();
    if (fromPath && ALLOWED_EXT.has(fromPath)) return fromPath;

    // Rung 2: the byte response's own declared type.
    //
    // `Object.hasOwn`, not a truthiness check on the index. `MIME_TO_EXT` is a
    // plain object literal, so an index lookup walks the PROTOTYPE CHAIN with a
    // string taken straight from an upstream header: `content-type: constructor`
    // returned the `Object` function and `content-type: __proto__` returned
    // `Object.prototype`. Both truthy, neither a string — the value is typed
    // `string` and is not one. It reaches `${nanoid()}.${ext}` in the storage
    // driver and persists a file named `aH8xK2m9qP.function Object() { [native
    // code] }`, whose key then goes into /api/uploads unencoded. Rung 1 is
    // allow-listed and rung 3 is a constant; this was the only rung accepting an
    // unfiltered value from the far side.
    const mime = (contentType ?? "").split(";")[0].trim().toLowerCase();
    if (Object.hasOwn(MIME_TO_EXT, mime)) return MIME_TO_EXT[mime];

    // Rung 3.
    return DEFAULT_EXT;
}
