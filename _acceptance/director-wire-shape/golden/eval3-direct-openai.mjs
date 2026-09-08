/** Phep thu co lap: CUNG mot model, CUNG mot prompt, chi khac oneOf vs anyOf. */
import { readFileSync } from "node:fs";
import { z } from "zod";
const env = Object.fromEntries(readFileSync("/Users/manh-macmini/dev/oneflow/.env","utf8").split("\n")
  .map(l=>l.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].trim().replace(/^["']|["']$/g,"")]));
const PU="/Users/manh-macmini/dev/oneflow/node_modules/.pnpm/@ai-sdk+provider-utils@5.0.12_zod@4.4.3/node_modules/@ai-sdk/provider-utils/dist/index.js";
const { zodSchema } = await import(PU);

const StepId=z.string().min(1).max(24).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
const InputEntry=z.strictObject({field:z.string().min(1),value:z.union([z.string().min(1),z.array(z.string().min(1)).min(1)])});
const ParamEntry=z.strictObject({field:z.string().min(1),value:z.union([z.string(),z.number(),z.boolean()])});
const TextStep=z.strictObject({id:StepId,kind:z.literal("text"),text:z.string().min(1)});
const GenStep=z.strictObject({id:StepId,kind:z.literal("gen"),slot:z.string().min(1),inputs:z.array(InputEntry),params:z.array(ParamEntry)});
const mk=(u)=>z.strictObject({dslVersion:z.literal(1),name:z.string().min(1).max(120),description:z.string().max(500),steps:z.array(u).min(1).max(60)});

const CASES={
  "oneOf  (discriminatedUnion — hien tai)": mk(z.discriminatedUnion("kind",[TextStep,GenStep])),
  "anyOf  (union thuong — de xuat sua)":    mk(z.union([TextStep,GenStep])),
};
for (const [label,sch] of Object.entries(CASES)) {
  const schema=zodSchema(sch).jsonSchema;
  process.stdout.write(`  ${label.padEnd(42)} `);
  try{
    const res=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",
      headers:{"Content-Type":"application/json",Authorization:`Bearer ${env.OPENAI_API_KEY}`},
      body:JSON.stringify({model:"gpt-4.1-mini",max_completion_tokens:600,
        messages:[{role:"user",content:'Tra ve ke hoach toi thieu: mot buoc kind="text", id="s1", text="xin chao". dslVersion=1.'}],
        response_format:{type:"json_schema",json_schema:{name:"director_plan",strict:true,schema}}}),
      signal:AbortSignal.timeout(90_000)});
    const t=await res.text(); let j={}; try{j=JSON.parse(t)}catch{}
    if(!res.ok){ console.log(`TU CHOI ${res.status} — ${(j?.error?.message??t).slice(0,120)}`); continue; }
    const c=j?.choices?.[0]?.message?.content??""; let valid=false;
    try{ valid=sch.safeParse(JSON.parse(c)).success }catch{}
    console.log(`CHAP NHAN 200  plan hop le=${valid}`);
  }catch(e){ console.log(`loi — ${String(e.message).slice(0,110)}`); }
}
