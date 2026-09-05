# Ô đo chạy 0 ca vẫn xanh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A measurement that runs zero test cases can no longer report PASS.

**Architecture:** One checker reads `_acceptance/config.yaml`, asks vitest itself for the collected test names, and asserts every name-filtered eval matches at least one. It runs as a step on the existing `Acceptance Gate` job, and is registered as the third entry in that job's guard list so it inherits the shape/no-softening/reachable/teeth protection the two existing guards already have.

**Tech Stack:** Node 24 (hand-rolled YAML line parsing — the repo has no YAML parser), bash, GitHub Actions.

**Spec:** [`docs/superpowers/specs/2026-08-31-o-do-chay-0-ca-van-xanh-design.md`](../specs/2026-08-31-o-do-chay-0-ca-van-xanh-design.md)
**Contract:** [`_acceptance/o-do-chay-0-ca-van-xanh/contract.md`](../../../_acceptance/o-do-chay-0-ca-van-xanh/contract.md) · 13 AC · 17 evals

---

## Global Constraints

- **No YAML parser exists in this repo.** `yaml` and `js-yaml` both resolve to nothing and neither is in `package.json`. Parse `_acceptance/config.yaml` by line, as `scripts/roadmap/roadmap-drift.mjs` and `scripts/ci/check-product-map.mjs` already do. Measured: **no executor uses a block scalar** (`|` or `>`), so the three cases to handle are single-quoted, double-quoted, and unquoted — that is exactly what the `undercount` teeth case proves.
- **Never touch the five guarded jobs.** `lint · typecheck · build · unit-tests · sdk-tests` are deep-equal-checked against merge-base by `check-gate-guards-job.sh job-count`. Adding a step to `unit-tests` — where `node_modules` already exists — would turn our own guard red. That is why the checker goes on `acceptance-gate` and that job gains `pnpm install`.
- **Collect by "invokes vitest", not by "has `-t`".** A wrapper born yesterday already breaks the `-t` criterion; a second one next week would make its evals invisible. An executor that runs a script under `scripts/` which mentions vitest, and which the checker does not recognise, is **RED by name**.
- **Read the wrapper's pinned file out of the wrapper.** `scripts/settings/run-one-test.sh:20` holds `FILE=…`. Duplicating that path in the checker is how the two drift apart.
- **Comments in English only** (CLAUDE.md); Vietnamese only in user-facing `echo`.
- Before every commit: `pnpm lint:check`, `pnpm typecheck`. `pnpm build` once at the end (~299s).
- Branch `feat/o-do-chay-0-ca-van-xanh` exists with the Gate-1 record at `98df49b`.

---

## File Structure

| File | Responsibility |
|---|---|
| `scripts/ci/check-eval-filters.mjs` | **Create.** The checker. Fail-closed on four fronts. |
| `scripts/ci/check-eval-filters-teeth.sh` | **Create.** Nine addressable cases. |
| `scripts/ci/check-gate-guards-job.sh` | **Modify.** Third `GUARD_NEEDLES` entry + a config perturbation in `teeth`. |
| `.github/workflows/ci.yml` | **Modify.** pnpm setup + install + the new step, all on `acceptance-gate`. |
| `_acceptance/config.yaml` | Already modified at Gate 1 (13 new executors). No further change. |

---

### Task 1: The checker

**Files:** Create `scripts/ci/check-eval-filters.mjs`

**Makes green:** E2 (AC-2), E6 (AC-6). The red-direction evals land in Task 2.

**Interfaces:**
- Produces: `node scripts/ci/check-eval-filters.mjs` → exit 0 clean, 1 on any violation. `--show-shapes` prints the per-shape breakdown. Every failure line reads `FAIL <rule>: <message>` and names the executor key.

- [ ] **Step 1: Collect the executors**

Parse `_acceptance/config.yaml` by line. Track the current `executors.<kind>:` section; an entry is `    <key>: <value>` at four-space indent. Strip a surrounding `'` or `"` if present; otherwise take the rest of the line. Classify each command:

| Command shape | Class |
|---|---|
| mentions `vitest` and has `-t <filter>` | `direct` — extract the test file(s) and the filter |
| runs a script under `scripts/` | read that script; if it mentions `vitest`, it is a wrapper |
| wrapper is `run-one-test.sh` | `wrapped` — filter is the first quoted argument; **file read from `FILE=` inside the script** |
| wrapper mentions vitest but is unrecognised | **`unknown` → RED**, naming the key and the script |
| anything else | ignored (does not filter by name) |

- [ ] **Step 2: Ask vitest for the real names**

```js
// Ask vitest, do not parse test files. `it.each` is already expanded, names are
// the full `describe > it` chain, and nested describes are correct by
// definition rather than by an approximation that will drift.
// Measured 31/08: 720 cases, 1 second, 149 KB.
const out = execFileSync(process.execPath,
    [path.join(root, "node_modules/vitest/vitest.mjs"), "list", "--json"],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
```

Wrap it: any throw becomes `FAIL liệt-kê: không chạy được vitest list (<lý do>)` and exits — never "no cases exist, so nothing matches", which would turn a tool failure into a verdict about the product.

- [ ] **Step 3: Match with a regex, not a substring**

```js
// `-t` is vitest's testNamePattern, which is a REGEX. Substring matching would
// disagree with the very tool this checker polices: `answers 503 .* code`
// matches by regex and not by substring, and the reverse case exists too.
const re = new RegExp(filter);
const hit = names.some((n) => n.file === abs && re.test(n.name));
```

An invalid regex is itself a fail-closed case: report it as unparsable, do not silently fall back to substring.

- [ ] **Step 4: The four fail-closed exits**

1. any `unknown` wrapper → red, naming key + script
2. any command with `-t` that will not parse into (file, filter) → red, naming key
3. `vitest list` fails → red, naming the cause
4. **zero collected executors → red.** The most important one: if the command shape changes, the checker silently covers nothing while still reporting success — this feature's own failure class, reborn inside it.

- [ ] **Step 5: Print the three numbers on success**

```
   đã kiểm 33 ô đo lọc theo tên — 23 gọi thẳng, 10 qua bộ bọc
✅ mọi ô đo đều khớp ít nhất một ca thử.
```

Not just a total: an undercount prints a plausible number and exits 0, which is more dangerous than finding zero. `--show-shapes` additionally lists each key with its shape and match count.

- [ ] **Step 6: Run it**

Run: `node scripts/ci/check-eval-filters.mjs`
Expected: exit 0, and the three numbers **33 / 23 / 10**. If they differ, the parser is wrong — do not adjust the expected numbers to match the parser.

Run: `node scripts/ci/check-eval-filters.mjs --show-shapes`
Expected: 33 lines plus the summary.

- [ ] **Step 7: Commit**

```bash
git add scripts/ci/check-eval-filters.mjs
git commit -m "feat(ci): assert every name-filtered eval actually matches a test"
```

---

### Task 2: The teeth

**Files:** Create `scripts/ci/check-eval-filters-teeth.sh`

**Makes green:** E1, E3, E4, E5, E7, E14, E15, E16, E17.

**Reference shape:** `scripts/ci/check-product-map-teeth.sh` — repeatable `--case`, one exit code per case, `CASE <name>: PASS|FAIL`, unknown case → exit 2, `--list`.

**Nine cases, pinned in AC-12 — not derived from `--list`:**

| Case | Perturbation | Must be red because |
|---|---|---|
| `clean` | none | **positive control, own exit code.** Without it a teeth script reading the exit code backwards passes every red case. |
| `no-match` | one filter → a name that does not exist | names the key AND the filter |
| `zero-executors` | remove every name-filtered eval | says it found none |
| `undercount` | N evals across all three quoting variants | reports exactly N |
| `unparsable` | `-t` with no string after it | names the key |
| `list-broken` | point the checker at a tree with no `node_modules` | names the cause |
| `regex-semantics` | four filters, both disagreement directions | agrees with real `vitest -t` |
| `unknown-wrapper` | an eval calling a new script that mentions vitest | names key AND script |
| `needle-missing` | drop the third entry from `GUARD_NEEDLES` | that removal is detected |

- [ ] **Step 1: Build the harness with isolation**

Cases patch `_acceptance/config.yaml` and `scripts/ci/check-gate-guards-job.sh`. Other evals read those files and **run in parallel**, so patch a copy, never the shared tree:

```bash
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT INT TERM
cp -R "$repo_root/_acceptance" "$tmp/t/_acceptance"
ln -s "$repo_root/node_modules" "$tmp/t/node_modules"
cp -R "$repo_root/scripts" "$tmp/t/scripts"
```

The checker must therefore accept a `--root` so it can be pointed at the copy. **Derive the default root from the script's own location, never hardcode it.**

End of run, prove it rather than promise it:

```bash
git -C "$repo_root" diff --quiet -- _acceptance/config.yaml scripts/ci/check-gate-guards-job.sh \
  && echo "cây chung sạch" || { echo "FAIL: cây chung BẨN" >&2; exit 1; }
```

- [ ] **Step 2: The `regex-semantics` matrix**

Four filters, and each one **actually runs `vitest run -t`** so the comparison is against real behaviour, not a promise:

| Filter | regex | substring | source of truth |
|---|---|---|---|
| `answers 503 .* code` | matches | does not | run vitest, read the count |
| a literal containing `(` unescaped | does not (invalid or different) | matches | run vitest, read the count |
| a plain word present in a name | matches | matches | run vitest |
| a plain word absent everywhere | no | no | run vitest |

Assert the checker's verdict equals vitest's for all four. Print all four rows — a matrix that prints only failures cannot be told from a matrix that ran nothing.

- [ ] **Step 3: Verify the harness reports honestly**

Run: `bash scripts/ci/check-eval-filters-teeth.sh --list` → nine names.
Run: `bash scripts/ci/check-eval-filters-teeth.sh --case nope` → exit 2 + valid list.
Run: `bash scripts/ci/check-eval-filters-teeth.sh` → nine PASS, clean-tree line, exit 0.

- [ ] **Step 4: Prove the teeth can say FAIL**

Replace one case's perturbation with a no-op, run it, confirm it reports **FAIL**, then restore from a `cp` backup. **Never `git checkout` to restore** — it destroys uncommitted work; that cost a rebuild earlier in this session. Record the result in the evidence.

- [ ] **Step 5: Commit**

```bash
chmod +x scripts/ci/check-eval-filters-teeth.sh
git add scripts/ci/check-eval-filters-teeth.sh
git commit -m "test(ci): teeth for the eval-filter checker, nine addressable cases"
```

---

### Task 3: Wire it in, and put it under guard

**Files:** Modify `.github/workflows/ci.yml`, `scripts/ci/check-gate-guards-job.sh`

**Makes green:** E8 (AC-8), E9 (AC-9), E10 (AC-10), E11 (AC-10), E12 (AC-11), E13 (AC-11).

- [ ] **Step 1: Add the third needle first, and watch it fail**

In `check-gate-guards-job.sh`:

```bash
GUARD_NEEDLES=(check-roadmap-fresh.sh check-product-map.mjs check-eval-filters.mjs)
```

Run: `bash scripts/ci/check-gate-guards-job.sh shape`
Expected: **FAIL** — no step runs the third guard yet. That failure is the point: it proves `shape` really does require every declared needle.

- [ ] **Step 2: Add the step and the dependencies to `acceptance-gate`**

The job has no `node_modules` and `vitest list` needs it. Add pnpm setup and install alongside the new step, with the reason recorded:

```yaml
      # vitest list needs node_modules, and this job had none. It goes here
      # rather than on unit-tests — which already has them — because
      # check-gate-guards-job.sh deep-equals the five other jobs against
      # merge-base, so the cheaper route would trip our own guard.
      - uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Eval filters match real tests
        run: node scripts/ci/check-eval-filters.mjs
```

`pnpm/action-setup` is not counted by `check-action-pins.sh`, which only tracks `actions/checkout` (8) and `docker/login-action` (1). E13 asserts that.

- [ ] **Step 3: Extend the `teeth` perturbation**

`teeth` mode extracts each needle's command from `ci.yml` and runs it green-then-red. The probe tree already copies `_acceptance/`; add a filter break to it so the third command has something to go red on.

- [ ] **Step 4: Run all seven modes**

```bash
for m in shape no-softening teeth job-count reachable suite-keys a11y-dist-dir; do
  printf '%-14s ' "$m"; bash scripts/ci/check-gate-guards-job.sh "$m" >/dev/null 2>&1 && echo ok || echo RED
done
bash scripts/ci/check-action-pins.sh
```
Expected: seven ok; action-pins still **8 site**.

- [ ] **Step 5: Prove the red directions on a copy of `ci.yml`**

Back up with `cp`, perturb, run, restore — the four cases `cong-tu-canh-minh` established, plus one new: **drop the third needle and confirm `shape` goes green again**, which is exactly why E11 exists as a separate eval.

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/ci.yml scripts/ci/check-gate-guards-job.sh
git commit -m "feat(ci): run the eval-filter guard in the Acceptance Gate job"
```

---

### Task 4: Full lane and the machine gate

- [ ] **Step 1:** `pnpm lint:check && pnpm typecheck && pnpm test`
- [ ] **Step 2:** `pnpm build` — once, ~299s.
- [ ] **Step 3:** every teeth suite in the repo: eval-filters (9), product-map (11), roadmap (11), env-store (7).
- [ ] **Step 4:** `bash scripts/pre-merge-check.sh . --base origin/main`. Upper bound on re-pins is 2 (`ci-vitest-sdk-pin`, `cong-tu-canh-minh`); the gate decides. That method predicted 3 and the gate asked 1, then predicted 3 and the gate asked 0 — treat 2 as a ceiling, not a schedule.
- [ ] **Step 5:** set the contract to `implemented`, then verify.

---

## Self-Review

**Spec coverage.** §5.1 → Task 1. §5.2 → Task 3 Step 2. §5.3 → Task 3 Steps 1 and 3. §4 (ask vitest, do not parse) → Task 1 Step 2.

**Eval coverage.** E2, E6 → T1. E1, E3, E4, E5, E7, E14–E17 → T2. E8–E13 → T3.

**Placeholders.** None. Task 1 Step 6 states explicitly that a mismatch means the parser is wrong, not that the expected numbers should be edited — that inversion is the cheapest way to fake this feature.

**Type consistency.** The checker's exit contract (0 / 1, `FAIL <rule>: <msg>`) is fixed in Task 1 and relied on by every teeth case in Task 2. `--root` is introduced in Task 2 Step 1 because the teeth need it; Task 1 must therefore accept it from the start — it is listed there as a produced interface, not bolted on later.

**A risk this plan does not remove.** `pnpm install` on `acceptance-gate` takes that job from ~19s to roughly a minute. It does not change wall-clock for the workflow, because `Build` runs 1m17s in parallel — but it is a real cost paid on every PR, and it exists only because the cheaper placement would trip a guard this session wrote. Worth naming at Gate 2 rather than discovering later.
