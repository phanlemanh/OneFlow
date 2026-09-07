/**
 * Shape of the `/api/director` request body, versioned additively.
 *
 * `prompt` is the whole contract today. `turns`, `canvas` and `options` are
 * declared now and left unused: changing the HTTP contract *after*
 * `director-transport-open` ships is a breaking change for every client,
 * whereas declaring the shape while it is still free costs one validator.
 * When a field is absent the behaviour is byte-for-byte what it was before
 * this package (AC-8).
 *
 * Caps are PER FIELD, not one budget over the whole body. A single "body too
 * large" would tell a caller that something is oversized without saying what,
 * and the three fields fail for unrelated reasons: a long conversation, a big
 * canvas, and a long prompt are three different user mistakes.
 */

/** Route-level cap on prompt length (spec §9's UI-facing limit). */
export const MAX_PROMPT_LENGTH = 2000;
/** Replayed conversation turns a client may send back. */
export const MAX_TURNS = 20;
/** Nodes in the canvas digest. A 20-node graph is the size director-v2's
 *  assumption #1 is written against. */
export const MAX_CANVAS_NODES = 60;
/** Total serialized bytes of `canvas`, independent of node count — a few
 *  nodes carrying large literals is the same problem as many small ones. */
export const MAX_CANVAS_BYTES = 32_000;

const encoder = new TextEncoder();
/** UTF-8 byte length — the unit MAX_CANVAS_BYTES is written in. */
export function utf8ByteLength(text: string): number {
    return encoder.encode(text).length;
}

export interface DirectorRequestBody {
    prompt: string;
    turns?: { role: "user" | "assistant"; text: string }[];
    canvas?: { nodes?: unknown[]; edges?: unknown[] };
    options?: { useMemory?: boolean };
}

export type BodyRejection = { field: string; message: string };

/**
 * Validate without coercing. Returns the parsed body, or the *first* field
 * that failed with a message naming that field (AC-9).
 */
export function parseDirectorBody(
    body: unknown,
):
    | { ok: true; value: DirectorRequestBody }
    | { ok: false; error: BodyRejection } {
    const b = body as Record<string, unknown> | null;

    const prompt = b?.prompt;
    if (typeof prompt !== "string") {
        return {
            ok: false,
            error: {
                field: "prompt",
                message: "prompt is required and must be a string",
            },
        };
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
        return {
            ok: false,
            error: {
                field: "prompt",
                message: `prompt must be at most ${MAX_PROMPT_LENGTH} characters`,
            },
        };
    }

    const turns = b?.turns;
    if (turns !== undefined) {
        if (!Array.isArray(turns)) {
            return {
                ok: false,
                error: { field: "turns", message: "turns must be an array" },
            };
        }
        if (turns.length > MAX_TURNS) {
            return {
                ok: false,
                error: {
                    field: "turns",
                    message: `turns must be at most ${MAX_TURNS} entries`,
                },
            };
        }
    }

    const canvas = b?.canvas;
    if (canvas !== undefined) {
        if (
            typeof canvas !== "object" ||
            canvas === null ||
            Array.isArray(canvas)
        ) {
            return {
                ok: false,
                error: { field: "canvas", message: "canvas must be an object" },
            };
        }
        const nodes = (canvas as { nodes?: unknown }).nodes;
        if (nodes !== undefined && !Array.isArray(nodes)) {
            return {
                ok: false,
                error: {
                    field: "canvas",
                    message: "canvas.nodes must be an array",
                },
            };
        }
        if (Array.isArray(nodes) && nodes.length > MAX_CANVAS_NODES) {
            return {
                ok: false,
                error: {
                    field: "canvas",
                    message: `canvas must have at most ${MAX_CANVAS_NODES} nodes`,
                },
            };
        }
        // Measured in UTF-8 bytes, as the constant and the message promise.
        // `.length` counts UTF-16 code units, which under-counts every
        // non-ASCII character — a Vietnamese canvas could exceed the byte cap
        // while looking half its size (S4 round-1 finding, AC-9).
        if (utf8ByteLength(JSON.stringify(canvas)) > MAX_CANVAS_BYTES) {
            return {
                ok: false,
                error: {
                    field: "canvas",
                    message: `canvas must be at most ${MAX_CANVAS_BYTES} bytes`,
                },
            };
        }
    }

    const options = b?.options;
    if (
        options !== undefined &&
        (typeof options !== "object" ||
            options === null ||
            Array.isArray(options))
    ) {
        return {
            ok: false,
            error: { field: "options", message: "options must be an object" },
        };
    }

    return {
        ok: true,
        value: {
            prompt,
            turns: turns as DirectorRequestBody["turns"],
            canvas: canvas as DirectorRequestBody["canvas"],
            options: options as DirectorRequestBody["options"],
        },
    };
}
