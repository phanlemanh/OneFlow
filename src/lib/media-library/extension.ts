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

export function extensionFor(url: string, contentType: string | null): string {
    // Rung 1: the signed URL usually keeps the original object name.
    let pathname = "";
    try {
        pathname = new URL(url).pathname;
    } catch {
        pathname = "";
    }
    const fromPath = pathname.match(/\.([A-Za-z0-9]{2,5})$/)?.[1];
    if (fromPath) return fromPath.toLowerCase();

    // Rung 2: the byte response's own declared type.
    const mime = (contentType ?? "").split(";")[0].trim().toLowerCase();
    if (MIME_TO_EXT[mime]) return MIME_TO_EXT[mime];

    // Rung 3.
    return DEFAULT_EXT;
}
