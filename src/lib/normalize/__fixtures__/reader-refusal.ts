import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A reader refusal built FROM the slot contract, not typed out by hand.
 *
 * A hand-written fixture is the failure mode this feature was rejected for: the
 * reader side and the fixture agreed with each other while the writer side —
 * `config/tongflow.abi.json`, `additionalProperties: false` — could not produce
 * the field at all. The tests stayed green and the user still read
 * "Could not read: ." with an empty token list.
 *
 * So the builder below asserts each field it uses is actually declared on the
 * slot's outputs, and throws NAMING the field when it is not. Drop `residual`
 * from the ABI and every test that renders a refusal goes red at the ABI, which
 * is where the removal happened.
 */

const ROOT = join(__dirname, "..", "..", "..", "..");
const READER_SLOT = "normalize-text-vi";

type JsonSchema = {
    type?: string;
    items?: JsonSchema;
    properties?: Record<string, JsonSchema>;
    additionalProperties?: boolean;
};

/** The `outputs` schema the reader slot is allowed to emit. */
export function readerOutputSchema(): JsonSchema {
    const abi = JSON.parse(
        readFileSync(join(ROOT, "config", "tongflow.abi.json"), "utf8"),
    ) as { nodes?: { nodeSlot?: string; outputs?: JsonSchema }[] };
    const node = abi.nodes?.find((n) => n.nodeSlot === READER_SLOT);
    if (!node?.outputs) {
        throw new Error(`ABI declares no outputs for slot ${READER_SLOT}`);
    }
    return node.outputs;
}

function declaredField(name: string): JsonSchema {
    const schema = readerOutputSchema();
    const field = schema.properties?.[name];
    if (!field) {
        throw new Error(
            `${READER_SLOT} outputs declare no "${name}" field — the UI reads it, so a plugin that cannot emit it makes the message a shrug`,
        );
    }
    return field;
}

/**
 * The refusal payload a reader plugin emits, with every key checked against the
 * contract that permits it.
 */
export function readerRefusalOutput(): Record<string, unknown> {
    if (declaredField("code").type !== "string") {
        throw new Error(`${READER_SLOT}.code must be a string`);
    }
    const residual = declaredField("residual");
    if (residual.type !== "array" || residual.items?.type !== "string") {
        throw new Error(`${READER_SLOT}.residual must be an array of strings`);
    }
    return {
        success: false,
        code: "RESIDUAL_TOKENS",
        residual: REFUSED_TOKENS,
        // The Vietnamese sentence the SDK keeps for logs. Nothing the user
        // reads may be derived from it — that is the point of the code.
        error: `Chưa đọc được: ${REFUSED_TOKENS.join(", ")}`,
    };
}

/** The tokens that stopped the reading, as the user should see them listed. */
export const REFUSED_TOKENS = ["đ", "/"] as const;
export const REFUSED_TOKENS_RENDERED = REFUSED_TOKENS.join(", ");
