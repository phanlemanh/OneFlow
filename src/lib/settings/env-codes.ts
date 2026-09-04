/**
 * The two codes the key-store endpoint puts on the wire, in one place.
 *
 * They are a contract between a server file and a browser file, which is
 * exactly the shape that cannot be checked by either side alone. The server
 * constant already lived in `env-store.server.ts`, but the browser could not
 * import it — a `.server.ts` module is not reachable from client code — so the
 * reader compared against a hand-typed string, and the newer refusal code was
 * a literal on both sides.
 *
 * A typo in either copy turns "your store is fine, I refused the wipe" into
 * "your store is broken", which is the precise confusion this whole dossier
 * exists to remove, and neither typecheck nor a unit test on one side would
 * see it. Neutral module, no I/O, importable from both.
 */

/** The store exists and could not be parsed. */
export const ENV_STORE_UNREADABLE = "ENV_STORE_UNREADABLE" as const;

/**
 * A replace-the-store request arrived claiming the store is unreadable, and it
 * is not. Nothing was written.
 */
export const ENV_STORE_REPLACE_REFUSED = "ENV_STORE_REPLACE_REFUSED" as const;
