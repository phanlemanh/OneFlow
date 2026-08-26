#!/usr/bin/env node
/**
 * EVAL-0 — do baseline Director v1 tren golden set 30 prompt.
 *
 * Ban qua ENDPOINT HTTP THAT (/api/director) chu khong import module, vi:
 *  - director.server.ts co marker `server-only` (test runner khong nap duoc)
 *  - di qua route.ts moi do dung ca tran MAX_PROMPT_LENGTH va bang STATUS_BY_CODE
 *
 * DUNG: node run-baseline.mjs [--base http://localhost:3000] [--dry] [--limit N]
 *   --dry  : khong goi API, chi kiem golden set + in ke hoach (MIEN PHI)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(n); return i === -1 ? d : args[i + 1]; };
const BASE = flag("--base", "http://localhost:3000");
const DRY = args.includes("--dry");
const LIMIT = Number(flag("--limit", "0")) || 0;
const RESUME = args.includes("--resume");
const TIMEOUT_MS = 180_000; // khop REQUEST_TIMEOUT_MS cua director-prompt.tsx

const golden = JSON.parse(readFileSync(join(HERE, "golden-set.json"), "utf8"));
const frozen = JSON.parse(readFileSync(join(HERE, "frozen-config.json"), "utf8"));
let prompts = golden.prompts;
let priorResults = [];
if (RESUME) {
  try {
    const prev = JSON.parse(readFileSync(join(HERE, "baseline-results.json"), "utf8"));
    priorResults = prev.results ?? [];
    const done = new Set(priorResults.map((r) => r.id));
    prompts = prompts.filter((p) => !done.has(p.id));
    console.log(`--resume: da co ${done.size} ket qua, con ${prompts.length} prompt phai chay`);
  } catch { console.log("--resume: chua co ket qua cu, chay tu dau"); }
}
if (LIMIT) prompts = prompts.slice(0, LIMIT);

const MAX_PROMPT_LENGTH = 2000; // route.ts:6

function preflight() {
  const bad = [];
  const seen = new Set();
  for (const p of golden.prompts) {
    if (!p.id || seen.has(p.id)) bad.push(`id trung hoac thieu: ${p.id}`);
    seen.add(p.id);
    if (!p.prompt?.trim()) bad.push(`${p.id}: prompt rong`);
    if (p.prompt.length > MAX_PROMPT_LENGTH) bad.push(`${p.id}: ${p.prompt.length} > ${MAX_PROMPT_LENGTH}`);
  }
  return bad;
}

async function callDirector(prompt) {
  const t0 = performance.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE}/api/director`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
      signal: ctrl.signal,
    });
    const ms = Math.round(performance.now() - t0);
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      return { ok: true, ms, status: res.status,
        nodes: body.nodes?.length ?? 0, edges: body.edges?.length ?? 0, name: body.name };
    }
    return { ok: false, ms, status: res.status,
      code: body.error?.code ?? "UNKNOWN",
      message: body.error?.message ?? "",
      issues: (body.error?.details ?? []).map((d) => d.code) };
  } catch (err) {
    return { ok: false, ms: Math.round(performance.now() - t0), status: 0,
      code: err.name === "AbortError" ? "TIMEOUT" : "NETWORK", message: String(err?.message ?? err), issues: [] };
  } finally { clearTimeout(timer); }
}

const pct = (n, d) => (d ? `${((n / d) * 100).toFixed(1)}%` : "-");
function percentile(sorted, f) {
  if (!sorted.length) return null;
  return sorted[Math.min(Math.max(Math.ceil(f * sorted.length), 1), sorted.length) - 1];
}

const bad = preflight();
if (bad.length) { console.error("GOLDEN SET HONG:"); bad.forEach((b) => console.error("  " + b)); process.exit(1); }
console.log(`golden set OK — ${golden.prompts.length} prompt, dai nhat ${Math.max(...golden.prompts.map((p) => p.prompt.length))} ky tu`);
console.log(`cau hinh ghim: repo ${frozen.repoHead.slice(0, 7)}, ${Object.keys(frozen.installedPlugins).length} plugin tren dia`);

if (DRY) {
  console.log(`\n--dry: KHONG goi API. Chay that se ton ~${prompts.length}-${prompts.length * 2} luot goi model.`);
  for (const p of prompts) console.log(`  ${p.id.padEnd(7)} ${p.tier}  ${p.prompt.slice(0, 62)}...`);
  process.exit(0);
}

const results = [];
for (const [i, p] of prompts.entries()) {
  process.stdout.write(`[${String(i + 1).padStart(2)}/${prompts.length}] ${p.id} ... `);
  const r = await callDirector(p.prompt);
  results.push({ ...p, result: r });
  console.log(r.ok ? `OK ${r.nodes}n/${r.edges}e ${r.ms}ms` : `${r.code} ${r.ms}ms ${r.issues.join(",")}`);
}

results.unshift(...priorResults);

// --- thuoc do bo sung ---
const okRuns = results.filter((r) => r.result.ok);
const okLat = okRuns.map((r) => r.result.ms).sort((a, b) => a - b);
const medOk = okLat.length ? okLat[Math.floor(okLat.length / 2)] : 0;
const RETRY_MS = medOk * 2; // nguong UOC LUONG, khong phai do that
for (const r of results) {
  r.result.likelyTwoAttempts = medOk > 0 ? r.result.ms > RETRY_MS : null;
  if (r.result.ok) {
    const want = Math.max(1, (r.expect ?? []).length);
    r.result.nodeInflation = Number((r.result.nodes / want).toFixed(2));
  }
}
const inflated = okRuns.filter((r) => r.result.nodeInflation >= 3);
const retryN = results.filter((r) => r.result.likelyTwoAttempts).length;

const okN = results.filter((r) => r.result.ok).length;
const lat = results.map((r) => r.result.ms).sort((a, b) => a - b);
const byCode = {}, byIssue = {}, byTier = {};
for (const r of results) {
  byTier[r.tier] ??= { n: 0, ok: 0 };
  byTier[r.tier].n++; if (r.result.ok) byTier[r.tier].ok++;
  if (!r.result.ok) {
    byCode[r.result.code] = (byCode[r.result.code] ?? 0) + 1;
    for (const c of r.result.issues) byIssue[c] = (byIssue[c] ?? 0) + 1;
  }
}
const summary = {
  measuredAt: new Date().toISOString(),
  frozenConfig: { repoHead: frozen.repoHead, plugins: Object.keys(frozen.installedPlugins) },
  total: results.length, ok: okN, successRateWithin2Attempts: pct(okN, results.length),
  latencyMs: { p50: percentile(lat, 0.5), p95: percentile(lat, 0.95), max: lat.at(-1) },
  failureByCode: byCode, compileIssueByCode: byIssue,
  byTier: Object.fromEntries(Object.entries(byTier).map(([t, v]) => [t, { ...v, rate: pct(v.ok, v.n) }])),
  attemptsEstimate: {
    method: `UOC LUONG tu do tre: ms > 2x median cua cac lan thanh cong (${Math.round(RETRY_MS)}ms)`,
    likelyTwoAttempts: retryN, rate: pct(retryN, results.length),
    caveat: "KHONG phai so do that. Chi thay the duoc bang director_events.attempts (goi D0).",
  },
  nodeInflation: {
    method: "so node chia so slot ky vong trong golden set; chi tinh cho lan thanh cong",
    median: (() => { const a = okRuns.map((r) => r.result.nodeInflation).sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; })(),
    over3x: inflated.map((r) => ({ id: r.id, nodes: r.result.nodes, want: (r.expect ?? []).length, ratio: r.result.nodeInflation })),
    why: "Plan compile sach nhung phinh gap nhieu lan la 'dung cu phap, sai y dinh' — EVAL-1 hien khong bat duoc.",
  },
  NOT_MEASURED: [
    "Ty le compile-0-issue o LUOT 1 — endpoint chi tra ket qua CUOI sau <=2 luot; logger.warn cung chi ghi ket qua cuoi. Can telemetry cua goi D0 (director_events.attempts).",
    "Token in/out va cache read/write — chua co instrumentation.",
  ],
};
writeFileSync(join(HERE, "baseline-results.json"), JSON.stringify({ summary, results }, null, 2));
console.log("\n=== BASELINE ===");
console.log(`  thanh cong (<=2 luot): ${okN}/${results.length}  ${summary.successRateWithin2Attempts}`);
console.log(`  do tre p50/p95: ${summary.latencyMs.p50}ms / ${summary.latencyMs.p95}ms`);
console.log(`  loi theo ma:`, byCode);
console.log(`  CompileIssue:`, byIssue);
console.log(`  theo tier:`, Object.fromEntries(Object.entries(summary.byTier).map(([k, v]) => [k, v.rate])));
console.log(`  uoc luong 2 luot: ${retryN}/${results.length} (nguong ${Math.round(RETRY_MS)}ms) — UOC LUONG`);
console.log(`  phinh node (median): ${summary.nodeInflation.median}x; qua 3x:`, summary.nodeInflation.over3x.map((x) => `${x.id}=${x.ratio}x`).join(" ") || "khong co");
console.log(`\n  -> baseline-results.json`);
