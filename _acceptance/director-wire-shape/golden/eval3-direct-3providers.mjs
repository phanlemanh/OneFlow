/** EVAL-3 dong nguong: gui CUNG schema (AI SDK sinh ra) toi tung hang bang KHOA TRUC TIEP.
 *  Hai bien the: oneOf (discriminatedUnion, hien tai) vs anyOf (union, de xuat). */
import { readFileSync } from "node:fs";
import { z } from "zod";
const env=Object.fromEntries(readFileSync("/Users/manh-macmini/dev/oneflow/.env","utf8").split("\n")
  .map(l=>l.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)$/)).filter(Boolean).map(m=>[m[1],m[2].trim().replace(/^["']|["']$/g,"")]));
const PU="/Users/manh-macmini/dev/oneflow/node_modules/.pnpm/@ai-sdk+provider-utils@5.0.12_zod@4.4.3/node_modules/@ai-sdk/provider-utils/dist/index.js";
const { zodSchema } = await import(PU);

const StepId=z.string().min(1).max(24).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
const IE=z.strictObject({field:z.string().min(1),value:z.union([z.string().min(1),z.array(z.string().min(1)).min(1)])});
const PE=z.strictObject({field:z.string().min(1),value:z.union([z.string(),z.number(),z.boolean()])});
const TS=z.strictObject({id:StepId,kind:z.literal("text"),text:z.string().min(1)});
const GS=z.strictObject({id:StepId,kind:z.literal("gen"),slot:z.string().min(1),inputs:z.array(IE),params:z.array(PE)});
const mk=u=>z.strictObject({dslVersion:z.literal(1),name:z.string().min(1).max(120),description:z.string().max(500),steps:z.array(u).min(1).max(60)});
const VARIANTS={ oneOf:mk(z.discriminatedUnion("kind",[TS,GS])), anyOf:mk(z.union([TS,GS])) };
// Bo tu khoa tung hang tu choi, xem schema co di lot khong
const strip=(o,keys)=>{ if(Array.isArray(o)) return o.map(x=>strip(x,keys));
  if(o&&typeof o==="object") return Object.fromEntries(Object.entries(o).filter(([k])=>!keys.includes(k)).map(([k,v])=>[k,strip(v,keys)]));
  return o; };
const PROMPT='Tra ve ke hoach toi thieu: mot buoc kind="text", id="s1", text="xin chao". dslVersion=1.';

const cls=m=>/oneOf|anyOf|schema|not permitted|unsupported|enum|response_schema|format/i.test(m)?"TU CHOI SCHEMA":"loi khac";

async function anthropic(schema){
  const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
    headers:{"content-type":"application/json","x-api-key":env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},
    body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:800,
      messages:[{role:"user",content:PROMPT}],
      output_config:{format:{type:"json_schema",schema}}}),signal:AbortSignal.timeout(90_000)});
  const t=await r.text(); let j={}; try{j=JSON.parse(t)}catch{}
  return r.ok?{ok:true}:{ok:false,status:r.status,msg:(j?.error?.message??t).slice(0,140)};
}
async function gemini(schema){
  const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
    {method:"POST",headers:{"content-type":"application/json"},
     body:JSON.stringify({contents:[{parts:[{text:PROMPT}]}],
       generationConfig:{responseMimeType:"application/json",responseSchema:schema}}),signal:AbortSignal.timeout(90_000)});
  const t=await r.text(); let j={}; try{j=JSON.parse(t)}catch{}
  return r.ok?{ok:true}:{ok:false,status:r.status,msg:(j?.error?.message??t).slice(0,140)};
}

for (const [hang,fn,key] of [["anthropic",anthropic,env.ANTHROPIC_API_KEY],["google",gemini,env.GEMINI_API_KEY]]) {
  if(!key){ console.log(`[bo qua] ${hang} — khong co khoa`); continue; }
  for (const [name,sch] of Object.entries(VARIANTS)) {
    let schema=zodSchema(sch).jsonSchema;
    if(process.env.STRIP){ const keys=process.env.STRIP.split(","); schema=strip(schema,keys); }
    process.stdout.write(`  ${hang.padEnd(10)} ${name.padEnd(7)} ... `);
    try{ const r=await fn(schema);
      console.log(r.ok?"CHAP NHAN 200":`${cls(r.msg)} ${r.status} — ${r.msg}`);
    }catch(e){ console.log(`loi mang — ${String(e.message).slice(0,90)}`); }
  }
}
