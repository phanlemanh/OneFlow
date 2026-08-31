# Cổng tự canh mình — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the acceptance gate's two drift guards into CI, and stop the verify suite from burning its own rounds.

**Architecture:** Three new scripts under `scripts/ci/` assert invariants (they never regenerate artifacts — the product-map generator lives in a plugin cache CI cannot see). Each new check ships with a `*-teeth.sh` proving it goes red, in the shape `scripts/roadmap/check-roadmap-guard-teeth.sh` already established. Two steps go into the existing `Acceptance Gate` job — no new job.

**Tech Stack:** Node 24 (**builtins only**), bash, GitHub Actions.

**Spec:** [`docs/superpowers/specs/2026-08-31-cong-tu-canh-minh-design.md`](../specs/2026-08-31-cong-tu-canh-minh-design.md)
**Contract:** [`_acceptance/cong-tu-canh-minh/contract.md`](../../../_acceptance/cong-tu-canh-minh/contract.md) · 13 AC
**Evals:** [`_acceptance/cong-tu-canh-minh/evals.yaml`](../../../_acceptance/cong-tu-canh-minh/evals.yaml) · 16 evals

---

## Global Constraints

- **`scripts/ci/check-product-map.mjs` may import ONLY `node:*` builtins.** Measured: the `acceptance-gate` job in `.github/workflows/ci.yml` has **no `pnpm install` step**, so `node_modules` does not exist when it runs. `scripts/roadmap/roadmap-drift.mjs` is the precedent — it imports only `node:fs` and `node:path` and hand-rolls its frontmatter matching.
- **Code comments in English only** (CLAUDE.md). Vietnamese is allowed only in user-facing `echo` output, matching `check-roadmap-guard-teeth.sh`.
- **No new CI job.** Two independent reasons, both measured: (a) `acceptance-gate` already pays `fetch-depth: 0` + Node 24 setup; (b) `scripts/ci/check-action-pins.sh` asserts `EXPECTED_CHECKOUT_SITES=8` — a new job adds a ninth `actions/checkout` and turns that unrelated guard red. Adding *steps* keeps the count at 8.
- **Every new check ships a two-directional pair on the same fixture**: healthy tree → green; a broken copy → red **naming the drifted thing** (slug name, both numbers). Exit code alone is not evidence — an always-red check also exits non-zero.
- **Teeth scripts accept REPEATED `--case`.** Three declared executors pass two or three cases in one invocation (`pmap_teeth_unreadable`, `pmap_teeth_extra_slug`, `pmap_teeth_source_buckets`). Note `check-roadmap-guard-teeth.sh` accepts only one and overwrites on repeat — the new script must **accumulate** instead. Getting this wrong makes those executors silently measure only the last case.
- **The 16 executor keys in `_acceptance/config.yaml` are already committed and signed.** Match the commands exactly; do not rename keys.
- Before every commit: `pnpm lint:check`, `pnpm typecheck`, `pnpm build`.
- Branch: `feat/cong-tu-canh-minh` (already created, Gate 1 record committed at `3d2ee67`).

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/ci/check-product-map.mjs` | **Create.** Assert `PRODUCT-MAP.md` matches `_acceptance/*/`. Fail-closed on both sides. |
| `scripts/ci/check-product-map-teeth.sh` | **Create.** Ten addressable cases proving the above has teeth. |
| `scripts/ci/check-gate-guards-job.sh` | **Create.** Seven modes: `shape`, `no-softening`, `teeth`, `job-count`, `reachable`, `suite-keys`, `a11y-dist-dir`. |
| `scripts/roadmap/roadmap-drift.mjs` | **Modify** (~line 119). Ledger check C collapses duplicates into a `Set`. Add a duplicate-row rule. |
| `scripts/roadmap/check-roadmap-guard-teeth.sh` | **Modify.** Add case `ledger-duplicate`. |
| `scripts/roadmap/check-roadmap-fresh.sh` | **Modify.** Its header says "NOT wired into CI yet, on purpose" — false once Task 5 lands. |
| `docs/roadmap.md` | **Modify.** Remove the duplicate `normalize-text-vi` ledger row (lines 18 and 27 of the ledger block). |
| `.github/workflows/ci.yml` | **Modify** (after line 133). Two steps into `acceptance-gate`. |
| `_acceptance/config.yaml` | **Modify.** `feature_loop.suite_keys`: replace `executors.test.build_typecheck` with `executors.test.build` + `executors.test.typecheck`. Keep `executors.test.build_typecheck` itself. |
| `scripts/onboarding/check-a11y-proto.sh` | **Modify** (line 22). Add its own `NEXT_DIST_DIR`. |

---

### Task 1: Product-map checker — the map side

**Files:**
- Create: `scripts/ci/check-product-map.mjs`
- Create: `scripts/ci/check-product-map-teeth.sh`

**Makes green:** E1 (`missing-slug`), E2 (`count-mismatch`), E3 (`opportunity-mismatch`), E4 (`artifact-missing` + `artifact-unreadable`), E5 (real tree). Serves AC-1, AC-2, AC-3, AC-4.

**Interfaces:**
- Produces: `check-product-map.mjs` exits 0 clean, 1 on drift, and prints every failure as `FAIL <rule>: <message>`. `check-product-map-teeth.sh` exposes `--list`, `--case <name>` (repeatable), and prints `CASE <name>: PASS|FAIL` per case.

**Reference shape to read first:** `scripts/roadmap/roadmap-drift.mjs` (rule/fail structure, frontmatter regex) and `scripts/roadmap/check-roadmap-guard-teeth.sh` (fixture builder, case runner, CLI refusal).

**What the map looks like** (measured 31/08, `PRODUCT-MAP.md`):

```text
  A["Đang cân nhắc cơ hội<br/>2 việc"] --> GD{"Cổng Đáng"}
  GP --> DL["Đang làm<br/>1 việc"] --> GB{"Cổng Bằng chứng"}
  GB --> DG["Đã giao<br/>27 việc"]

## Đang cân nhắc cơ hội
- Director v2 — … (`director-v2`)

## Đã giao
- Node nạp-từ-kho — … (`add-media-library`)
```

An empty bucket renders `chưa có` instead of `N việc` — the number parser must treat that as **zero**, not as unparsable.

- [ ] **Step 1: Write the teeth harness with the five map-side cases (they will fail — the checker does not exist yet)**

Create `scripts/ci/check-product-map-teeth.sh`. Copy the fixture/case/CLI skeleton from `scripts/roadmap/check-roadmap-guard-teeth.sh`, with **one deliberate difference**: `--case` accumulates.

```bash
#!/usr/bin/env bash
# Teeth for check-product-map.mjs.
#
# ONE EXIT CODE PER CASE. A case that was never implemented looks identical to a
# case that passed, and both are green — this repo already paid for that lesson
# (see the `stale-scope-by-paths` comment in _acceptance/config.yaml).
#
# `--case` is REPEATABLE here, unlike scripts/roadmap/check-roadmap-guard-teeth.sh
# which takes one and overwrites. Three declared executors pass two or three
# cases in a single invocation; overwriting would silently measure only the last.
#
# An unknown `--case` is REFUSED (exit 2 + the valid list) rather than skipped: a
# typo that exits 0 turns an eval into a permanent green no-op.
set -euo pipefail
cd "$(dirname "$0")/../.."

repo_root=$(pwd)
checker="$repo_root/scripts/ci/check-product-map.mjs"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

CASES=(
  clean
  missing-slug
  count-mismatch
  opportunity-mismatch
  artifact-missing
  artifact-unreadable
  extra-slug
  status-downgraded
  contract-unparsable
  status-unknown
  dir-empty
)

is_case() { local n="$1" c; for c in "${CASES[@]}"; do [ "$c" = "$n" ] && return 0; done; return 1; }

# Minimal tree the checker can read: PRODUCT-MAP.md plus contract.md /
# opportunity.md files only.
build_fixture() {
  rm -rf "$tmp/t"
  mkdir -p "$tmp/t/_acceptance"
  cp "$repo_root/PRODUCT-MAP.md" "$tmp/t/PRODUCT-MAP.md"
  for d in "$repo_root"/_acceptance/*/; do
    slug=$(basename "$d")
    mkdir -p "$tmp/t/_acceptance/$slug"
    [ -f "$d/contract.md" ] && cp "$d/contract.md" "$tmp/t/_acceptance/$slug/contract.md"
    [ -f "$d/opportunity.md" ] && cp "$d/opportunity.md" "$tmp/t/_acceptance/$slug/opportunity.md"
  done
  return 0
}

check_capture() {
  local rc=0
  (cd "$tmp/t" && node "$checker") > "$tmp/out" 2>&1 || rc=$?
  return $rc
}
check_is_red()   { ! check_capture; }
check_is_green() {   check_capture; }
out_has() { grep -Eq -- "$1" "$tmp/out"; }
```

The five map-side cases:

```bash
# AC-1 control. Without it a checker hardcoded to `exit 1` passes every red case.
case_clean() {
  build_fixture
  check_is_green || return 1
  # The count line must be PRESENT and the numbers EQUAL: a checker printing
  # "0 signed, 0 on the map" is also green, and that green means nothing.
  out_has 'đã giao: [0-9]+ hồ sơ ký, [0-9]+ mục trên bản đồ, nút mermaid [0-9]+' || return 1
  python3 - "$tmp/out" <<'COUNTS'
import sys, pathlib, re
m = re.search(r"đã giao: (\d+) hồ sơ ký, (\d+) mục trên bản đồ, nút mermaid (\d+)",
              pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
if not m: raise SystemExit("thiếu dòng đếm")
a, b, c = (int(x) for x in m.groups())
if not (a == b == c): raise SystemExit(f"ba số lệch: {a} / {b} / {c}")
if a == 0: raise SystemExit("cây thật phải có hồ sơ đã ký")
COUNTS
}

# AC-1. Drop ONE signed slug from the `## Đã giao` block.
#
# The slug MUST be one that still appears elsewhere in PRODUCT-MAP.md, otherwise
# this case cannot tell "reads inside the block" from "greps the whole file" —
# a whole-file grep would pass it. `chong-mat-khoa-byo` is the choice: Task 1
# adds a second mention of it in the file header comment for exactly this reason.
case_missing_slug() {
  build_fixture
  grep -v '(`chong-mat-khoa-byo`)' "$tmp/t/PRODUCT-MAP.md" > "$tmp/x" && mv "$tmp/x" "$tmp/t/PRODUCT-MAP.md"
  check_is_red || return 1
  out_has 'chong-mat-khoa-byo' || return 1   # names the slug, not "map is off"
}

# AC-2. Wrong number in the mermaid node. The message must carry BOTH numbers.
case_count_mismatch() {
  build_fixture
  sed -i.bak 's|Đã giao<br/>[0-9]* việc|Đã giao<br/>99 việc|' "$tmp/t/PRODUCT-MAP.md"
  check_is_red || return 1
  out_has '99' || return 1
  out_has 'đã giao' || return 1
  # The real count must appear too — one number does not say by how much or
  # which way. Assert a second, different integer is present in the message.
  python3 - "$tmp/out" <<'BOTH'
import sys, pathlib, re
t = pathlib.Path(sys.argv[1]).read_text(encoding="utf-8")
line = next((l for l in t.splitlines() if "99" in l and "FAIL" in l), None)
if line is None: raise SystemExit("không có dòng FAIL nào nêu số 99")
nums = {int(n) for n in re.findall(r"\d+", line)}
if len(nums - {99}) == 0: raise SystemExit(f"chỉ nêu một số: {line}")
BOTH
}

# AC-3. A new opportunity-only dossier that the map does not know about.
case_opportunity_mismatch() {
  build_fixture
  mkdir -p "$tmp/t/_acceptance/teeth-probe-opportunity"
  printf '# probe\n' > "$tmp/t/_acceptance/teeth-probe-opportunity/opportunity.md"
  check_is_red || return 1
  out_has 'cân nhắc cơ hội' || return 1
}

# AC-4 fail-closed (a): the artifact is not there at all.
case_artifact_missing() {
  build_fixture
  rm -f "$tmp/t/PRODUCT-MAP.md"
  check_is_red || return 1
  out_has 'PRODUCT-MAP.md' || return 1
}

# AC-4 fail-closed (b): the file is there but the thing to read is not.
# A checker that cannot find what it came to check has checked nothing, and
# exiting 0 there is a lie worse than silence.
case_artifact_unreadable() {
  build_fixture
  sed -i.bak 's|^## Đã giao$|## Đã giao (đổi tiêu đề)|' "$tmp/t/PRODUCT-MAP.md"
  sed -i.bak 's|Đã giao<br/>[0-9]* việc|Đã giao|' "$tmp/t/PRODUCT-MAP.md"
  check_is_red || return 1
  out_has 'không tìm thấy|không đọc được' || return 1
}
```

Runner + CLI (accumulating `--case`):

```bash
run_case() {
  local name="$1" fn="case_${1//-/_}"
  if declare -F "$fn" >/dev/null && "$fn"; then
    echo "CASE $name: PASS"; return 0
  fi
  echo "CASE $name: FAIL"; return 1
}

refuse() {
  echo "check-product-map-teeth: $1" >&2
  echo "case hợp lệ: ${CASES[*]}" >&2
  exit 2
}

SELECTED=()
while [ $# -gt 0 ]; do
  case "$1" in
    --list) printf '%s\n' "${CASES[@]}"; exit 0 ;;
    --case)
      [ $# -ge 2 ] || refuse "\`--case\` cần một tên ngay sau nó — nhận được (trống)"
      case "$2" in --*) refuse "\`--case\` cần một tên ngay sau nó — nhận được \`$2\`" ;; esac
      is_case "$2" || refuse "case lạ \`$2\`"
      SELECTED+=("$2"); shift 2 ;;
    *) refuse "tham số lạ \`$1\` — chỉ nhận \`--case <tên>\` và \`--list\`" ;;
  esac
done
[ ${#SELECTED[@]} -eq 0 ] && SELECTED=("${CASES[@]}")

pass=0; fail=0
for c in "${SELECTED[@]}"; do
  if run_case "$c"; then pass=$((pass + 1)); else fail=$((fail + 1)); fi
done
echo
if [ "$fail" -ne 0 ]; then
  echo "❌ răng: $pass đạt / $fail hỏng — bộ kiểm bản đồ không đáng tin"
  exit 1
fi
echo "✅ răng: $pass/$pass case — mỗi case một mã thoát riêng"
```

- [ ] **Step 2: Run the teeth to verify they fail**

Run: `bash scripts/ci/check-product-map-teeth.sh --case clean`
Expected: `CASE clean: FAIL` and exit 1 — `check-product-map.mjs` does not exist, so `node` errors.

- [ ] **Step 3: Add a second mention of `chong-mat-khoa-byo` to `PRODUCT-MAP.md`'s header**

Required by `case_missing_slug` (see its comment). `PRODUCT-MAP.md` is generated, so put the mention in the hand-written intro quote that the generator preserves — verify with `node <plugin>/scripts/product-map.mjs --root .` that a regen keeps it. If a regen strips it, use `roadmap-drift-guard` as the fixture slug instead: it appears in both `## Đã giao` and `docs/roadmap.md`, and pick a whole-file grep target that survives regeneration. **Whichever slug is used, the case comment must say why.**

- [ ] **Step 4: Write `scripts/ci/check-product-map.mjs`**

```js
#!/usr/bin/env node
// Asserts PRODUCT-MAP.md still matches the dossiers under _acceptance/.
//
// Node BUILTINS ONLY: the `acceptance-gate` job in .github/workflows/ci.yml has
// no `pnpm install` step, so node_modules does not exist when this runs.
// scripts/roadmap/roadmap-drift.mjs is the precedent.
//
// This ASSERTS an invariant rather than regenerating and diffing (the shape
// `gen_abi_clean` uses), because the generator lives in a plugin cache a clean
// CI runner does not have. Vendoring it would freeze a fork and leave two
// different rulers for one thing. Deliberate deviation — see the design doc §4.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const MAP = "PRODUCT-MAP.md";
const ACCEPTANCE_DIR = "_acceptance";

const failures = [];
const fail = (rule, msg) => failures.push(`FAIL ${rule}: ${msg}`);
const read = (p) => readFileSync(p, "utf8");
```

Implement in this order:

1. **Read the map, fail-closed.** `try { map = read(MAP) } catch { fail("map", `không đọc được ${MAP}`); report(); }` — and stop, do not continue with an empty string.
2. **`blockItems(heading)`** — return the `` `slug` `` tokens inside the `## <heading>` section, from that heading to the next `^## `. Missing heading → `null` (distinct from `[]`), and the caller fails with `không tìm thấy khối "## <heading>"`.
3. **`mermaidCount(label)`** — match `` `<label><br/>(\d+) việc` `` OR `` `<label><br/>chưa có` `` → `0`. Neither → `null` → fail `không đọc được nút mermaid "<label>"`.
4. **`classifyDossiers()`** — the four closed buckets (Task 2 completes this; for now return `{signed, opportunity}` and leave the `unclassified` bucket wired but empty).
5. **Three assertions**, each naming the drifted thing:
   - every signed slug appears in `## Đã giao` → else `` `<slug>` đã ký nhưng vắng trên bản đồ ``
   - `signed.length === blockItems("Đã giao").length === mermaidCount("Đã giao")` → else `đã giao lệch: <a> hồ sơ ký, <b> mục trên bản đồ, nút mermaid <c>`
   - the same triple for `Đang cân nhắc cơ hội` ↔ opportunity-only dossiers
6. **Always print the count line on success**, in the exact shape `case_clean` greps:
   `đã giao: <a> hồ sơ ký, <b> mục trên bản đồ, nút mermaid <c>`
7. `process.exit(failures.length ? 1 : 0)`, printing every failure.

- [ ] **Step 5: Run the teeth to verify they pass**

Run: `bash scripts/ci/check-product-map-teeth.sh`
Expected: `CASE clean: PASS` … through `CASE artifact-unreadable: PASS`, then `❌ răng: 6 đạt / 5 hỏng` — the five Task-2 cases are not implemented yet. **That partial red is correct at this point.**

Run: `node scripts/ci/check-product-map.mjs`
Expected: exit 0 plus the count line.

- [ ] **Step 6: Commit**

```bash
git add scripts/ci/check-product-map.mjs scripts/ci/check-product-map-teeth.sh PRODUCT-MAP.md
git commit -m "feat(ci): product-map invariant checker with map-side teeth"
```

---

### Task 2: Product-map checker — the source side (four closed buckets)

**Files:**
- Modify: `scripts/ci/check-product-map.mjs`
- Modify: `scripts/ci/check-product-map-teeth.sh`

**Makes green:** E14 (`extra-slug`, `status-downgraded`), E15 (`contract-unparsable`, `status-unknown`, `dir-empty`). Serves AC-11, AC-12.

**Interfaces:**
- Consumes: `classifyDossiers()` from Task 1.
- Produces: `classifyDossiers()` returns `{signed: string[], other: string[], opportunity: string[], unclassified: {slug, reason}[]}`.

**Why this task exists:** Task 1 only checks map ⟸ dossiers. The clean-context critic found both halves of the gap. (a) A dossier that is **withdrawn** leaves its old row on the map and everything stays green — this repo withdrew one for real on 26/08. (b) Fail-closed guarded only the map; a dossier whose frontmatter reads `"signed-off"` with quotes, or `Signed-off` capitalised, or whose YAML is broken, gets silently binned as "not signed" — it drops out of the must-appear set, the counts still match, and the whole checker is green while the map is missing exactly that dossier. That is a fail-OPEN inside a checker sold as fail-closed.

- [ ] **Step 1: Write the five failing cases**

```bash
# AC-11. The map advertises a slug with no dossier at all.
case_extra_slug() {
  build_fixture
  python3 - "$tmp/t/PRODUCT-MAP.md" <<'ADD'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); t = p.read_text(encoding="utf-8")
p.write_text(t.replace("## Đã giao\n\n", "## Đã giao\n\n- Việc ma (`teeth-probe-ghost`)\n", 1), encoding="utf-8")
ADD
  check_is_red || return 1
  out_has 'teeth-probe-ghost' || return 1
}

# AC-11. The dossier still exists but is no longer signed; the row stays.
case_status_downgraded() {
  build_fixture
  sed -i.bak 's/^status: signed-off$/status: draft/' "$tmp/t/_acceptance/roadmap-drift-guard/contract.md"
  check_is_red || return 1
  out_has 'roadmap-drift-guard' || return 1
}

# AC-12 bucket four: frontmatter that does not parse.
case_contract_unparsable() {
  build_fixture
  printf -- '---\nstatus: [unclosed\n' > "$tmp/t/_acceptance/roadmap-drift-guard/contract.md"
  check_is_red || return 1
  out_has 'roadmap-drift-guard' || return 1
}

# AC-12 bucket four: a status outside the closed set. Quoted and capitalised
# forms are the realistic typos — both must land in bucket four, NOT in "signed"
# and NOT silently in "other".
case_status_unknown() {
  build_fixture
  sed -i.bak 's/^status: signed-off$/status: "signed-off"/' "$tmp/t/_acceptance/roadmap-drift-guard/contract.md"
  check_is_red || return 1
  out_has 'roadmap-drift-guard' || return 1
}

# AC-12 bucket four: a directory with neither file.
case_dir_empty() {
  build_fixture
  mkdir -p "$tmp/t/_acceptance/teeth-probe-empty"
  check_is_red || return 1
  out_has 'teeth-probe-empty' || return 1
}
```

- [ ] **Step 2: Run them to verify they fail**

Run: `bash scripts/ci/check-product-map-teeth.sh --case extra-slug --case status-downgraded --case contract-unparsable --case status-unknown --case dir-empty`
Expected: five `FAIL` lines, exit 1. (This command also proves repeated `--case` accumulates — with the roadmap script's overwriting CLI you would see only one line.)

- [ ] **Step 3: Implement the four buckets and the reverse direction**

In `check-product-map.mjs`:

```js
// Every directory under _acceptance/ lands in exactly one of four closed
// buckets. The fourth is RED BY NAME, never a silent skip: a dossier whose
// frontmatter is off by a quote drops out of the must-appear set, the counts
// still balance, and the whole checker goes green while the map is missing
// exactly that dossier — fail-OPEN inside a checker sold as fail-closed.
const STATUS_CLOSED = new Set([
    "draft", "approved", "implemented", "verified", "machine-cleared", "signed-off",
]);

function classifyDossiers() {
    const out = { signed: [], other: [], opportunity: [], unclassified: [] };
    for (const d of readdirSync(ACCEPTANCE_DIR, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        const slug = d.name;
        let contract = null;
        try {
            contract = read(join(ACCEPTANCE_DIR, slug, "contract.md"));
        } catch {
            /* no contract — may still be an opportunity */
        }
        if (contract === null) {
            try {
                read(join(ACCEPTANCE_DIR, slug, "opportunity.md"));
                out.opportunity.push(slug);
            } catch {
                out.unclassified.push({ slug, reason: "không có contract.md lẫn opportunity.md" });
            }
            continue;
        }
        const fm = contract.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (!fm) {
            out.unclassified.push({ slug, reason: "frontmatter không đọc được" });
            continue;
        }
        const m = fm[1].match(/^status:[ \t]*(.*)$/m);
        // Deliberately NOT trimming quotes: `"signed-off"` is a typo we must
        // surface, not normalise away. Normalising is how it stays invisible.
        const status = m ? m[1].trim() : "";
        if (!STATUS_CLOSED.has(status)) {
            out.unclassified.push({ slug, reason: `status lạ \`${status || "(trống)"}\`` });
        } else if (status === "signed-off") {
            out.signed.push(slug);
        } else {
            out.other.push(slug);
        }
    }
    return out;
}
```

Then add two assertions:

```js
for (const { slug, reason } of dossiers.unclassified)
    fail("nguồn", `\`${slug}\` không phân loại được: ${reason}`);

// The reverse direction. AC-1 only walks dossiers → map, so a WITHDRAWN dossier
// leaves its row behind and stays green. This repo withdrew one for real
// (`normalize-text-vi`, 26/08).
for (const slug of deliveredOnMap)
    if (!dossiers.signed.includes(slug))
        fail("bản đồ", `bản đồ còn mục \`${slug}\` nhưng hồ sơ đó không ở trạng thái ký`);
```

- [ ] **Step 4: Run the full teeth suite to verify it passes**

Run: `bash scripts/ci/check-product-map-teeth.sh`
Expected: `✅ răng: 11/11 case`.

Run: `bash scripts/ci/check-product-map-teeth.sh --case no-such-case`
Expected: exit 2 and the valid-case list on stderr.

Run: `node scripts/ci/check-product-map.mjs`
Expected: exit 0 (the real tree is clean).

- [ ] **Step 5: Commit**

```bash
git add scripts/ci/check-product-map.mjs scripts/ci/check-product-map-teeth.sh
git commit -m "feat(ci): fail-closed on the dossier side and the reverse map direction"
```

---

### Task 3: Roadmap guard — the duplicate-row hole

**Files:**
- Modify: `scripts/roadmap/roadmap-drift.mjs:119` (check C)
- Modify: `scripts/roadmap/check-roadmap-guard-teeth.sh` (add to `CASES`)
- Modify: `docs/roadmap.md` (remove the duplicate row)

**Makes green:** E6 (`ledger-duplicate`), E7 (real tree). Serves AC-5.

**The measured hole:** check C builds `inLedger` as a `Set`, so two rows for the same slug collapse to one and the guard is blind. Measured 31/08 — the ledger block **has** two `normalize-text-vi` rows (dated 21/08 and 27/08) and `check-roadmap-fresh.sh` reports clean.

- [ ] **Step 1: Add the failing case**

Append `ledger-duplicate` to `CASES` in `check-roadmap-guard-teeth.sh` and add:

```bash
# AC-5. Check C compares the SET of slugs inside the marker block, so a
# duplicated row is invisible. Measured 31/08: the real ledger HAS two
# `normalize-text-vi` rows and the guard reports clean.
case_ledger_duplicate() {
  build_fixture
  python3 - "$tmp/t/docs/roadmap.md" <<'DUP'
import sys, pathlib
p = pathlib.Path(sys.argv[1]); lines = p.read_text(encoding="utf-8").splitlines(keepends=True)
row = next(i for i, l in enumerate(lines) if "`local-cpu-plugins`" in l)
lines.insert(row + 1, lines[row])
p.write_text("".join(lines), encoding="utf-8")
DUP
  guard_is_red || return 1
  out_has 'local-cpu-plugins' || return 1
  out_has 'trùng|hai dòng|lặp' || return 1
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `bash scripts/roadmap/check-roadmap-guard-teeth.sh --case ledger-duplicate`
Expected: `CASE ledger-duplicate: FAIL`, exit 1 — the rule does not exist.

Also run: `bash scripts/roadmap/check-roadmap-fresh.sh`
Expected: **green today, on a tree that has a real duplicate.** That green is the bug, and it is worth seeing once before fixing.

- [ ] **Step 3: Add the rule**

In `roadmap-drift.mjs`, replace the `Set` construction with an array + duplicate detection:

```js
const ledgerSlugs = [...ledger[1].matchAll(/`([a-z0-9][a-z0-9-]*)`/g)].map((m) => m[1]);
const inLedger = new Set(ledgerSlugs);

// A Set hides duplicates, and a duplicated row is real drift: the same item
// classified twice, usually with two different dates, so the ledger no longer
// says one thing. Measured 31/08: `normalize-text-vi` had two rows and this
// guard was green.
const seen = new Set();
for (const slug of ledgerSlugs) {
    if (seen.has(slug))
        fail("C/ledger", `sổ cái có hai dòng cùng slug \`${slug}\` — mỗi hạng mục chỉ một dòng`);
    seen.add(slug);
}
```

- [ ] **Step 4: Run to verify the case passes and the real tree now goes red**

Run: `bash scripts/roadmap/check-roadmap-guard-teeth.sh --case ledger-duplicate`
Expected: `CASE ledger-duplicate: PASS`.

Run: `bash scripts/roadmap/check-roadmap-fresh.sh`
Expected: **RED**, naming `normalize-text-vi`. The guard has found a real duplicate that has been sitting in `docs/roadmap.md`.

- [ ] **Step 5: Clean the real duplicate**

In the `roadmap-ledger` block of `docs/roadmap.md`, the two rows are:

```text
| `normalize-text-vi` | T3 | 21/08 | **1.3** — slot/node đọc số-giá-ngày tất định, bắt buộc đứng trước TTS |
| `normalize-text-vi` | T3 | 27/08 | **1.3** — đọc số/giá/ngày thành chữ, bắt buộc đứng trước TTS |
```

Keep the **27/08** row (the later signature) and delete the 21/08 row. Not doing this makes CI red the moment this package lands — the package would break its own CI.

- [ ] **Step 6: Run the full roadmap teeth suite**

Run: `bash scripts/roadmap/check-roadmap-guard-teeth.sh`
Expected: `✅ răng: 11/11 case` (10 existing + `ledger-duplicate`).

Run: `bash scripts/roadmap/check-roadmap-fresh.sh`
Expected: green.

- [ ] **Step 7: Commit**

```bash
git add scripts/roadmap/roadmap-drift.mjs scripts/roadmap/check-roadmap-guard-teeth.sh docs/roadmap.md
git commit -m "fix(roadmap): guard duplicate ledger rows and clean the existing one"
```

---

### Task 4: Gate-guards script — the two config modes

**Files:**
- Create: `scripts/ci/check-gate-guards-job.sh`
- Modify: `_acceptance/config.yaml` (`feature_loop.suite_keys` only)
- Modify: `scripts/onboarding/check-a11y-proto.sh:22`

**Makes green:** E11 (`suite-keys`), E12 (`a11y-dist-dir`). Serves AC-8, AC-9.

These two modes need no `ci.yml` changes, so they land first and prove the script's skeleton before Task 5 adds the CI-reading modes.

**Measured today:** `feature_loop.suite_keys` contains `executors.test.build_typecheck`. `scripts/onboarding/check-a11y-proto.sh` mentions `NEXT_DIST_DIR` **0** times; `scripts/media-library/check-a11y-proto.sh` mentions it **1** time (`NEXT_DIST_DIR=build/aml-a11y`). There are exactly **two** wrappers matching `scripts/*/check-a11y-proto.sh`.

- [ ] **Step 1: Write the script with both modes (they will fail)**

```bash
#!/usr/bin/env bash
# cong-tu-canh-minh — guards for AC-6..AC-9 and AC-13.
#
# Usage: check-gate-guards-job.sh <shape|no-softening|teeth|job-count|reachable|suite-keys|a11y-dist-dir>
#
# The acceptance gate's own two drift guards had ZERO references in ci.yml
# (measured 31/08), so they only ran when somebody typed them. PRODUCT-MAP.md
# drifted by four slugs and nobody knew.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

WF=.github/workflows/ci.yml
MODE="${1:?usage: check-gate-guards-job.sh <shape|no-softening|teeth|job-count|reachable|suite-keys|a11y-dist-dir>}"

fail() { echo "FAIL: $*" >&2; exit 1; }

case "$MODE" in
suite-keys)
    # AC-8. Three assertions, read with a YAML parser rather than grep.
    #
    # (3) is the suppressing half: a "tidy-up" that deletes the combined key
    # would pass (1) and (2) while breaking seven signed evidence packages.
    python3 - <<'PY' || exit 1
import sys, yaml
d = yaml.safe_load(open("_acceptance/config.yaml"))
keys = d["feature_loop"]["suite_keys"]
tests = d["executors"]["test"]
errs = []
for want in ("executors.test.build", "executors.test.typecheck"):
    if want not in keys: errs.append(f"feature_loop.suite_keys thiếu {want}")
if "executors.test.build_typecheck" in keys:
    errs.append("feature_loop.suite_keys vẫn dùng khoá gộp executors.test.build_typecheck")
if "build_typecheck" not in tests:
    errs.append("executors.test.build_typecheck đã bị xoá — bảy hồ sơ đã ký tham chiếu nó")
if errs:
    for e in errs: print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print("OK: suite_keys dùng build + typecheck rời, và khoá gộp vẫn còn trong executors")
PY
    ;;

a11y-dist-dir)
    # AC-9. A closed matrix over the wrappers that EXIST, not a hardcoded pair:
    # a new wrapper copied from the wrong template must fail this too.
    #
    # Why it matters: `pnpm build` is a suite key that runs in PARALLEL, and a
    # build landing mid-scan deletes the chunks the dev server is still handing
    # out. Only PAGES die, so route-handler evals stay green and a broken round
    # reads like a clean one. Measured 31/08: onboarding 0, media-library 1.
    mapfile -t wrappers < <(ls scripts/*/check-a11y-proto.sh 2>/dev/null || true)
    [ "${#wrappers[@]}" -ge 2 ] \
        || fail "tìm thấy ${#wrappers[@]} wrapper a11y — cần ít nhất 2 (media-library là đối chứng dương)"
    missing=0
    for w in "${wrappers[@]}"; do
        if grep -q 'NEXT_DIST_DIR' "$w"; then
            echo "  ok  $w"
        else
            echo "FAIL: $w dựng dev server mà không đặt NEXT_DIST_DIR riêng" >&2
            missing=$((missing + 1))
        fi
    done
    [ "$missing" -eq 0 ] || fail "$missing/${#wrappers[@]} wrapper a11y thiếu NEXT_DIST_DIR"
    echo "OK: ${#wrappers[@]}/${#wrappers[@]} wrapper a11y đặt NEXT_DIST_DIR riêng"
    ;;

*)
    fail "unknown mode '$MODE' (shape|no-softening|teeth|job-count|reachable|suite-keys|a11y-dist-dir)"
    ;;
esac
```

- [ ] **Step 2: Run both modes to verify they fail**

Run: `bash scripts/ci/check-gate-guards-job.sh suite-keys`
Expected: FAIL — `suite_keys` still names the combined key.

Run: `bash scripts/ci/check-gate-guards-job.sh a11y-dist-dir`
Expected: FAIL naming `scripts/onboarding/check-a11y-proto.sh`.

- [ ] **Step 3: Split the suite keys**

In `_acceptance/config.yaml`, inside `feature_loop.suite_keys`, replace the single entry `executors.test.build_typecheck` with two entries, `executors.test.build` and `executors.test.typecheck`, in that position. **Leave `executors.test.build_typecheck` itself untouched** — seven signed dossiers reference it (`dependency-refresh-2026-07`, `per-plugin-origin`, `oneflow-plugin-prefix`, `measure-harness`, `pnpm-build-approvals`, `task-metering`, `sdk-distribution-rename`).

Verify no collateral damage:

```bash
git diff _acceptance/config.yaml | grep -c '^-[^-]'
```
Expected: `1` (only the combined-key line leaves `suite_keys`).

- [ ] **Step 4: Give the onboarding wrapper its own dist dir**

`scripts/onboarding/check-a11y-proto.sh:22` currently reads:

```bash
pnpm dev --port "$PORT" >/dev/null 2>&1 &
```

Change it to, with the comment:

```bash
# Own dist dir, not the shared `.next`. Suite commands run in PARALLEL and
# `pnpm build` is a standing suite key: a build landing while this server is
# serving deletes the chunks it is still handing out, and only PAGES die — the
# route-handler evals stay green, so the round reads like a healthy tree with a
# broken UI. scripts/media-library/check-a11y-proto.sh solved this in S4 round 7;
# this wrapper predates that finding. A SUBdirectory of build/, because the
# ui-check lane's dev server takes build/ itself.
NEXT_DIST_DIR=build/bko-a11y pnpm dev --port "$PORT" >/dev/null 2>&1 &
```

- [ ] **Step 5: Run both modes to verify they pass**

Run: `bash scripts/ci/check-gate-guards-job.sh suite-keys`
Expected: `OK: suite_keys dùng build + typecheck rời, …`

Run: `bash scripts/ci/check-gate-guards-job.sh a11y-dist-dir`
Expected: `OK: 2/2 wrapper a11y đặt NEXT_DIST_DIR riêng`

- [ ] **Step 6: Commit**

```bash
git add scripts/ci/check-gate-guards-job.sh _acceptance/config.yaml scripts/onboarding/check-a11y-proto.sh
git commit -m "fix(verify): split the build+typecheck suite key and stop the a11y dist-dir collision"
```

---

### Task 5: Plug the guards into CI

**Files:**
- Modify: `scripts/ci/check-gate-guards-job.sh` (five more modes)
- Modify: `.github/workflows/ci.yml:133` (two steps into `acceptance-gate`)

**Makes green:** E8 (`teeth`), E9 (`shape` + `no-softening`), E10 (`job-count`), E16 (`reachable`). Serves AC-6, AC-7, AC-13.

**Reference to read first:** `scripts/ci/check-vitest-job.sh` — it already solves this exact problem for the vitest job: parse the job block **by indentation** (a renamed step cannot hide), and **read the command out of the YAML and run it** rather than asserting the YAML contains a script name. An earlier version of that script ran `pnpm test` directly and a clean-context verifier caught it: it stayed green on a tree with no CI job at all.

- [ ] **Step 1: Add the five modes (they will fail)**

Add a `job_block()` helper matching `check-vitest-job.sh`'s, retargeted at `acceptance-gate`, then:

**`shape`** — the block contains a step running `scripts/roadmap/check-roadmap-fresh.sh` and one running `scripts/ci/check-product-map.mjs`; the job still carries `fetch-depth: 0` (the roadmap guard needs history) and `node-version: 24`; the workflow still has both `pull_request:` and `push:` triggers.

**`no-softening`** — no line inside the block matches `continue-on-error`, `|| true`, or `set +e`.

**`job-count`** — exactly six top-level job keys, and the name set equals `{lint, typecheck, build, unit-tests, sdk-tests, acceptance-gate}`. Then the second half of AC-7:

```bash
# AC-7 second half. Counting jobs and matching names says nothing about a job's
# BODY: `continue-on-error: true` on `lint` keeps six jobs and the same five
# names, and `shape`/`no-softening` only look inside acceptance-gate.
base=$(git merge-base HEAD origin/main 2>/dev/null || echo "")
if [ -z "$base" ]; then
    echo "  (bỏ qua so sánh merge-base: không phân giải được origin/main)"
else
    python3 - "$base" <<'PY' || exit 1
import subprocess, sys, yaml
base = sys.argv[1]
old = yaml.safe_load(subprocess.run(
    ["git", "show", f"{base}:.github/workflows/ci.yml"],
    capture_output=True, text=True, check=True).stdout)
new = yaml.safe_load(open(".github/workflows/ci.yml"))
errs = []
for job in ("lint", "typecheck", "build", "unit-tests", "sdk-tests"):
    if old["jobs"].get(job) != new["jobs"].get(job):
        okeys, nkeys = old["jobs"].get(job) or {}, new["jobs"].get(job) or {}
        changed = sorted({k for k in set(okeys) | set(nkeys) if okeys.get(k) != nkeys.get(k)})
        errs.append(f"job `{job}` đổi định nghĩa ở khoá: {', '.join(changed) or '(thân step)'}")
if errs:
    for e in errs: print(f"FAIL: {e}", file=sys.stderr)
    sys.exit(1)
print("OK: năm job còn lại deep-equal với merge-base")
PY
fi
```

**`reachable`** — the half no other mode covers. Assert: neither guard step carries an `if:`; the `acceptance-gate` job carries no `if:` and no `needs:`; and the workflow's `pull_request` trigger has no `paths` / `paths-ignore` excluding `PRODUCT-MAP.md`, `docs/roadmap.md` or `_acceptance/**`. Comment it with the reason:

```bash
# Without this, `if: github.ref == 'refs/heads/main'` on a guard step leaves
# shape, no-softening, teeth and job-count all green while the guard never runs
# on a PR — which is exactly the zero-reference state this package closes.
```

**`teeth`** — read the two guard commands out of `ci.yml` and run each, **both directions on the same extracted string**:

```bash
# The command is READ OUT OF ci.yml, never hardcoded. Both directions run on
# that same extracted string: a typo'd flag exits non-zero on the broken copy
# too, so a red-only assertion cannot tell "the guard caught it" from "the
# command is broken" — and CI would then be red on every PR after merge.
block=$(job_block)
for needle in check-roadmap-fresh.sh check-product-map.mjs; do
    cmd=$(printf '%s\n' "$block" | sed -n "s|^[[:space:]]*run:[[:space:]]*\(.*${needle}.*\)$|\1|p" | tail -1)
    [ -n "$cmd" ] || fail "không rút được lệnh chạy $needle ra từ $WF"
    echo "lệnh dưới phép thử (rút từ $WF): $cmd"

    # Green half, on the healthy tree.
    set +e; eval "$cmd" >/tmp/cggj-green.log 2>&1; green_rc=$?; set -e
    [ "$green_rc" -eq 0 ] \
        || fail "'$cmd' đỏ trên cây LÀNH (exit $green_rc) — lệnh sai, không phải guard bắt lỗi"
done
```

Then the red half: perturb a throwaway copy (drop a signed slug from `PRODUCT-MAP.md`; duplicate a ledger row in `docs/roadmap.md`), run each extracted command against that copy, and require non-zero. Clean up on every exit path with a `trap`.

Finally the `always-red-command` guard-of-the-guard: append a junk flag to a copy of the extracted command and assert **this mode itself** would fail — proving it distinguishes "guard caught it" from "any command is broken".

- [ ] **Step 2: Run the five modes to verify they fail**

Run: `for m in shape no-softening job-count reachable teeth; do bash scripts/ci/check-gate-guards-job.sh $m; done`
Expected: `shape`, `reachable` and `teeth` FAIL (no guard steps in `ci.yml` yet). `no-softening` and `job-count` should already pass — six jobs exist and nothing is softened.

- [ ] **Step 3: Add the two steps to `ci.yml`**

After line 133 (`run: bash scripts/pre-merge-check.sh . --base …`), inside the same `acceptance-gate` job:

```yaml
      - name: Roadmap ledger freshness
        run: bash scripts/roadmap/check-roadmap-fresh.sh

      - name: Product map freshness
        run: node scripts/ci/check-product-map.mjs
```

No `if:`, no `continue-on-error`. Both scripts use Node builtins and bash only, so the job's missing `pnpm install` is not a problem.

- [ ] **Step 4: Run all seven modes to verify they pass**

Run: `for m in shape no-softening teeth job-count reachable suite-keys a11y-dist-dir; do echo "== $m"; bash scripts/ci/check-gate-guards-job.sh $m || echo "  ĐỎ"; done`
Expected: all seven OK.

Run: `bash scripts/ci/check-action-pins.sh`
Expected: still `ok actions/checkout: 8 site(s)` — steps were added, not a job.

- [ ] **Step 5: Commit**

```bash
git add scripts/ci/check-gate-guards-job.sh .github/workflows/ci.yml
git commit -m "feat(ci): run the roadmap and product-map guards in the Acceptance Gate job"
```

---

### Task 6: Retire the stale comment, then the full suite

**Files:**
- Modify: `scripts/roadmap/check-roadmap-fresh.sh` (header comment)

**Makes green:** nothing new — this closes a doc-lie the package itself creates.

`check-roadmap-fresh.sh`'s header currently says:

> NOT wired into CI yet, on purpose. scripts/ci/check-action-pins.sh counts pinned `actions/checkout` SITES (6 today) … Wiring this in is therefore a two-file change that belongs in its own PR, together with bumping the expected site count. Until then it runs on demand.

Task 5 makes every sentence of that false. It is also wrong on its own terms now: the count is **8**, not 6, and this package adds **steps**, so no bump is needed.

- [ ] **Step 1: Replace the paragraph**

```bash
# Wired into CI on 2026-08-31 (`cong-tu-canh-minh`): the `Acceptance Gate` job
# in .github/workflows/ci.yml runs this on every PR. The earlier note here said
# wiring it in would require bumping check-action-pins.sh's expected checkout
# count — that only applies to adding a JOB. This went in as a STEP on the
# existing job, so the count stayed at 8 and that guard never moved.
```

- [ ] **Step 2: Run the whole machine lane**

```bash
pnpm lint:check && pnpm typecheck && pnpm build
```

```bash
bash scripts/ci/check-product-map-teeth.sh
bash scripts/roadmap/check-roadmap-guard-teeth.sh
bash scripts/ci/check-action-pins.sh
bash scripts/pre-merge-check.sh . --base origin/main
```

Expected: all green. `pre-merge-check.sh` is the independent backstop — it re-runs the staleness and tier rules on the merged tree.

- [ ] **Step 3: Commit**

```bash
git add scripts/roadmap/check-roadmap-fresh.sh
git commit -m "docs(roadmap): the freshness guard is in CI now"
```

---

## Self-Review

**Spec coverage.** Design §5.1 → Tasks 1–2. §5.2 → Task 5. §5.3 → Task 4. §5.4 → Task 3. §6 (two-directional pairs) → every task's red-then-green step order. §8 (3 re-pins) → unchanged; no task adds a file outside the eight measured paths, plus `check-roadmap-fresh.sh` which is already inside `roadmap-drift-guard`'s declared `scripts/roadmap/**`.

**Eval coverage.** E1–E5 → T1. E14, E15 → T2. E6, E7 → T3. E11, E12 → T4. E8, E9, E10, E16 → T5. E13 (case-completeness across both teeth scripts, and unknown `--case` → exit 2) → satisfied by T1 Step 1's CLI and verified in T2 Step 4 and T6 Step 2.

**Placeholders.** None. Two spots are deliberately conditional and say what to do in each branch: T1 Step 3 (which slug survives regeneration) and T5 Step 1 `job-count` (merge-base unresolvable → skip with a printed note, rather than fail on a shallow clone).

**Type consistency.** `classifyDossiers()` returns the same four-key shape in T1 Step 4 and T2 Step 3. The count line `đã giao: <a> hồ sơ ký, <b> mục trên bản đồ, nút mermaid <c>` is written in T1 Step 4 and grepped by `case_clean` in T1 Step 1 — same string. Mode names in the `usage:` line, the `*)` refusal, T4 and T5 all read `shape|no-softening|teeth|job-count|reachable|suite-keys|a11y-dist-dir`.

**One risk the plan does not remove.** T5's `job-count` merge-base comparison reads `origin/main`. On a CI runner with `fetch-depth: 0` that resolves; in a shallow local clone it does not, and the mode prints a skip note instead of failing. That is the safe direction (a missing comparison never invents a pass), but it does mean the deep-equal half of AC-7 is unmeasured in that environment. Flag it in the evidence report rather than silently.
