/** EVAL-3 (ban dung) — di qua DUNG duong Director v2 se dung:
 *  ai@7 generateText + Output.object + gateway (/v4/ai), khong phai /v1/chat/completions. */
import { readFileSync } from "node:fs";
import { z } from "zod";
import { generateText, Output } from "ai";

const env = Object.fromEntries(
  readFileSync("/Users/manh-macmini/dev/oneflow/.env", "utf8").split("\n")
    .map((l) => l.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)$/)).filter(Boolean)
    .map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, "")]));
process.env.AI_GATEWAY_API_KEY = env.AI_GATEWAY_API_KEY;

const V = 1;
const StepId = z.string().min(1).max(24).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
const InputEntry = z.strictObject({ field: z.string().min(1), value: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]) });
const ParamEntry = z.strictObject({ field: z.string().min(1), value: z.union([z.string(), z.number(), z.boolean()]) });
const TextStep = z.strictObject({ id: StepId, kind: z.literal("text"), text: z.string().min(1) });
const GenStep = z.strictObject({ id: StepId, kind: z.literal("gen"), slot: z.string().min(1), inputs: z.array(InputEntry), params: z.array(ParamEntry) });
const DirectorPlanSchema = z.strictObject({
  dslVersion: z.literal(V), name: z.string().min(1).max(120), description: z.string().max(500),
  steps: z.array(z.discriminatedUnion("kind", [TextStep, GenStep])).min(1).max(60),
});

const MODELS = process.argv.slice(2);
const PROMPT = 'Tra ve ke hoach toi thieu: mot buoc kind="text", id="s1", text="xin chao". dslVersion=1.';

for (const model of MODELS) {
  process.stdout.write(`${model.padEnd(34)} ... `);
  const t0 = Date.now();
  try {
    const { output } = await generateText({
      model, prompt: PROMPT, maxOutputTokens: 800,
      output: Output.object({ schema: DirectorPlanSchema }),
    });
    const ok = DirectorPlanSchema.safeParse(output).success;
    console.log(`CHAP NHAN ${Date.now() - t0}ms  plan hop le=${ok}  steps=${output?.steps?.length}`);
  } catch (e) {
    const m = String(e?.message ?? e);
    const isSchema = /schema|oneOf|response_format|not permitted|unsupported|enum/i.test(m);
    console.log(`${isSchema ? "TU CHOI SCHEMA" : "loi khac"} ${Date.now() - t0}ms — ${m.slice(0, 160)}`);
  }
}
