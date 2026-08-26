/** B04 / EVAL-2 — phep thu MIEN PHI:
 *  So sanh JSON Schema ma HAI duong sinh ra tu CUNG DirectorPlanSchema.
 *   (a) Anthropic SDK  zodOutputFormat  -> duong Director v1 dang dung
 *   (b) AI SDK         Output.object    -> duong Director v2 de xuat
 *  Cau hoi: rang buoc (pattern / maxLength / maxItems / const) SONG hay bi HA CAP
 *  thanh chu trong `description`?  Khong goi API, khong ton tien. */
import { z } from "zod";

const DIRECTOR_DSL_VERSION = 1;
const StepIdSchema = z.string().min(1).max(24).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
const InputEntrySchema = z.strictObject({
  field: z.string().min(1),
  value: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
});
const ParamEntrySchema = z.strictObject({
  field: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
});
const TextStepSchema = z.strictObject({ id: StepIdSchema, kind: z.literal("text"), text: z.string().min(1) });
const GenStepSchema = z.strictObject({
  id: StepIdSchema, kind: z.literal("gen"), slot: z.string().min(1),
  inputs: z.array(InputEntrySchema), params: z.array(ParamEntrySchema),
});
export const DirectorPlanSchema = z.strictObject({
  dslVersion: z.literal(DIRECTOR_DSL_VERSION),
  name: z.string().min(1).max(120),
  description: z.string().max(500),
  steps: z.array(z.discriminatedUnion("kind", [TextStepSchema, GenStepSchema])).min(1).max(60),
});

const KEYWORDS = ["pattern", "maxLength", "minLength", "maxItems", "minItems", "const", "enum"];
function scan(node, path = "$", hits = { kept: [], inDescription: [] }) {
  if (Array.isArray(node)) { node.forEach((v, i) => scan(v, `${path}[${i}]`, hits)); return hits; }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) {
      if (KEYWORDS.includes(k)) hits.kept.push(`${path}.${k} = ${JSON.stringify(v)}`);
      if (k === "description" && typeof v === "string") {
        for (const kw of KEYWORDS) if (v.includes(kw)) hits.inDescription.push(`${path}.description ~ "${v.slice(0, 70)}"`);
      }
      scan(v, `${path}.${k}`, hits);
    }
  }
  return hits;
}

const report = (label, schema) => {
  const h = scan(schema);
  const json = JSON.stringify(schema);
  console.log(`\n=== ${label} ===`);
  console.log(`  kich thuoc JSON: ${json.length} ky tu`);
  console.log(`  rang buoc GIU NGUYEN trong grammar: ${h.kept.length}`);
  h.kept.slice(0, 8).forEach((x) => console.log(`     ${x}`));
  if (h.kept.length > 8) console.log(`     ... con ${h.kept.length - 8}`);
  console.log(`  rang buoc BI HA CAP vao description: ${h.inDescription.length}`);
  h.inDescription.slice(0, 6).forEach((x) => console.log(`     ${x}`));
  return { label, size: json.length, kept: h.kept.length, degraded: h.inDescription.length };
};

const results = [];

// (b) AI SDK — dung dung ham AI SDK dung de bien Zod thanh JSON Schema
try {
  const { zodSchema } = await import("/Users/manh-macmini/dev/oneflow/node_modules/.pnpm/@ai-sdk+provider-utils@5.0.12_zod@4.4.3/node_modules/@ai-sdk/provider-utils/dist/index.js");
  const s = zodSchema(DirectorPlanSchema);
  results.push(report("AI SDK  Output.object  (zodSchema)", s.jsonSchema));
} catch (e) { console.log("\n[AI SDK] khong nap duoc:", e.message); }

// (a) Anthropic SDK — zodOutputFormat
try {
  const { zodOutputFormat } = await import("@anthropic-ai/sdk/helpers/zod");
  const f = zodOutputFormat(DirectorPlanSchema);
  const sch = f?.schema ?? f?.json_schema?.schema ?? f;
  results.push(report("Anthropic  zodOutputFormat", sch));
} catch (e) { console.log("\n[Anthropic] khong nap duoc:", e.message); }

if (results.length === 2) {
  const [ai, an] = results;
  console.log("\n=== KET LUAN ===");
  console.log(`  rang buoc giu trong grammar:  AI SDK ${ai.kept}  vs  Anthropic ${an.kept}`);
  console.log(`  rang buoc ha cap vao mo ta:   AI SDK ${ai.degraded}  vs  Anthropic ${an.degraded}`);
  console.log(`  kich thuoc schema:            AI SDK ${ai.size}  vs  Anthropic ${an.size} ky tu`);
}
