/**
 * A local stand-in for media-library, shaped from its real contract.
 *
 * It RECORDS every request so a test can assert the request OneFlow actually
 * sent, and it 401s when the Authorization header is absent — so an adapter
 * that forgets auth fails loudly instead of quietly returning an empty list.
 */
import { createServer, type IncomingMessage, type Server } from "node:http";

export interface RecordedRequest {
    method: string;
    path: string;
    headers: Record<string, string>;
    body: unknown;
}

export interface StubOptions {
    searchResponse?: unknown;
    searchStatus?: number;
    assetResponse?: unknown;
    /**
     * Serve a full AssetDetail whose `urls.original` points back at THIS stub's
     * own byte route. Needed because the signed URL can only be spelled once
     * the server has a port, and a caller cannot know the port before start.
     */
    assetOriginalPath?: string;
    assetStatus?: number;
    contractsVersion?: string;
    bytes?: Buffer;
    bytesContentType?: string;
    /** Default true: a request without a Bearer header gets 401, like the real service. */
    requireAuth?: boolean;
    /** Answer with a body that is not JSON, to exercise the parse-failure arm. */
    nonJsonBody?: boolean;
    /** Status for that body — an error page from a proxy is the real-world case. */
    nonJsonStatus?: number;
    /**
     * Send headers, then never finish the body. This is what a stalled CDN
     * looks like, and it is the ONLY way the download timeout is reachable:
     * the abort signal is attached to a fetch that has already returned its
     * response, so a timeout can only fire while the stream is being read.
     */
    hangBytes?: boolean;
}

export interface StubHandle {
    url: string;
    requests: RecordedRequest[];
    close(): Promise<void>;
}

async function readBody(req: IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    if (chunks.length === 0) return undefined;
    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        return undefined;
    }
}

export async function startStub(opts: StubOptions = {}): Promise<StubHandle> {
    const version = opts.contractsVersion ?? "0.2.0";
    const requests: RecordedRequest[] = [];
    /** Filled in once the port is known; read by the /v1/assets/ handler. */
    let selfUrl = "";

    const server: Server = createServer((req, res) => {
        void (async () => {
            const path = req.url ?? "";
            requests.push({
                method: req.method ?? "",
                path,
                headers: Object.fromEntries(
                    Object.entries(req.headers).map(([k, v]) => [k, String(v)]),
                ),
                body: await readBody(req),
            });

            const send = (status: number, payload: unknown) => {
                res.writeHead(status, { "content-type": "application/json" });
                res.end(JSON.stringify(payload));
            };

            if (path.startsWith("/bytes")) {
                res.writeHead(200, {
                    "content-type": opts.bytesContentType ?? "video/mp4",
                });
                if (opts.hangBytes) {
                    // Headers out, first chunk out, then silence — the socket
                    // stays open until the client gives up.
                    res.write(Buffer.from("first-chunk"));
                    return;
                }
                res.end(opts.bytes ?? Buffer.from("fake-mp4-bytes"));
                return;
            }
            if ((opts.requireAuth ?? true) && !req.headers.authorization) {
                send(401, {
                    error: "unauthorized",
                    contracts_version: version,
                });
                return;
            }
            if (opts.nonJsonBody) {
                res.writeHead(opts.nonJsonStatus ?? 200, {
                    "content-type": "text/html",
                });
                res.end("<html>not json</html>");
                return;
            }
            if (path.startsWith("/v1/search")) {
                send(
                    opts.searchStatus ?? 200,
                    opts.searchResponse ?? {
                        cards: [],
                        context: null,
                        candidates: 0,
                        skipped: 0,
                        warnings: [],
                        contracts_version: version,
                    },
                );
                return;
            }
            if (path.startsWith("/v1/assets/")) {
                if (opts.assetOriginalPath) {
                    send(opts.assetStatus ?? 200, {
                        card: { id: "stub" },
                        urls: {
                            original: `${selfUrl}${opts.assetOriginalPath}`,
                            proxy: null,
                            thumb: null,
                        },
                        expires_in_s: 900,
                        contracts_version: version,
                    });
                    return;
                }
                send(
                    opts.assetStatus ?? 200,
                    opts.assetResponse ?? { contracts_version: version },
                );
                return;
            }
            send(404, { error: "not_found", contracts_version: version });
        })();
    });

    await new Promise<void>((resolve) => {
        server.listen(0, "127.0.0.1", resolve);
    });
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    selfUrl = `http://127.0.0.1:${port}`;

    return {
        url: selfUrl,
        requests,
        close: () =>
            new Promise<void>((resolve) => {
                server.close(() => resolve());
            }),
    };
}
