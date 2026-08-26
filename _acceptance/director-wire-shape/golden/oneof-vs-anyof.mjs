/** Gia thuyet: OpenAI cam 'oneOf' nhung CHAP NHAN 'anyOf'.
 *  Duong Anthropic (zodOutputFormat) da emit anyOf; duong AI SDK emit oneOf.
 *  Neu doi discriminatedUnion -> union thi co ra anyOf khong? */
import { z } from "zod";
const PU = "/Users/manh-macmini/dev/oneflow/node_modules/.pnpm/@ai-sdk+provider-utils@5.0.12_zod@4.4.3/node_modules/@ai-sdk/provider-utils/dist/index.js";
const { zodSchema } = await import(PU);

const StepId = z.string().min(1).max(24).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
const TextStep = z.strictObject({ id: StepId, kind: z.literal("text"), text: z.string().min(1) });
const GenStep  = z.strictObject({ id: StepId, kind: z.literal("gen"), slot: z.string().min(1) });

const variants = {
  "discriminatedUnion (hien tai)": z.strictObject({ steps: z.array(z.discriminatedUnion("kind", [TextStep, GenStep])).min(1).max(60) }),
  "union thuong":                  z.strictObject({ steps: z.array(z.union([TextStep, GenStep])).min(1).max(60) }),
};
for (const [name, sch] of Object.entries(variants)) {
  const js = JSON.stringify(zodSchema(sch).jsonSchema);
  const one = (js.match(/"oneOf"/g) || []).length;
  const any = (js.match(/"anyOf"/g) || []).length;
  console.log(`  ${name.padEnd(32)} oneOf=${one}  anyOf=${any}`);
}
