# normalize-text-vi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the deterministic `normalize-text-vi` slot — ABI entry, the Vietnamese reader inside the SDK, the canvas node, the "must precede TTS" export guard, Tier-A caching, official-plugin registration, and SDK 0.2.19.

**Architecture:** The ABI gets one new slot shaped exactly like `gen-text` (`{text}` → `{success, error, text}`). The reader lives in `sdk/tongflow/text/` as three layers — an OneFlow pre-pass (domain dictionary, `₫`→`đ`, ranges), a pinned `vietnormalizer==0.2.3` call, and an OneFlow post-check that fails loudly when anything is still unreadable. The plugin `oneflow-api-normalize-text-vi` is a thin shell in its own repo that delegates to the SDK function.

**Tech Stack:** TypeScript (Next.js canvas, workflow exporter, vitest), Python 3.10+ (SDK, pydantic, pytest), `vietnormalizer==0.2.3` (MIT, zero-dependency).

## Global Constraints

- Contract: [`_acceptance/normalize-text-vi/contract.md`](../../../_acceptance/normalize-text-vi/contract.md) — 15 criteria, approved by Manh 2026-08-19. Evals: [`evals.yaml`](../../../_acceptance/normalize-text-vi/evals.yaml) — 26 evals.
- Design: [`2026-08-19-normalize-text-vi-design.md`](../specs/2026-08-19-normalize-text-vi-design.md).
- Slot name is exactly `normalize-text-vi`. Node type key is exactly `normalizeTextViNode`. i18n namespace is exactly `normalizeTextVi`. Plugin id is exactly `oneflow-api-normalize-text-vi`, origin `https://github.com/phanlemanh`.
- SDK version is exactly `0.2.19`, in **both** `sdk/pyproject.toml` and `sdk/tongflow/__init__.py`. Library pin is exactly `vietnormalizer==0.2.3`.
- Code comments in **English only** (CLAUDE.md). Contract/plan/user-facing prose stays Vietnamese.
- **Every new measure needs its two-way pair on the same fixture** (MEASURE-BIRTH-CLAUSE): healthy → green, deliberately broken copy → red **with a pinned message** naming the case/invariant, not just a non-zero exit. A task is not done without the red half demonstrated.
- **Pilot N=2 token:** any command matching `pnpm test|pnpm build|vitest|pytest|next build` needs `~/.claude/oneflow-pilot/s4lock acquire lane-13` first, and `release` right after. The hook matches the *command string*, so a heredoc whose **content** contains `pytest` trips it too.
- Never touch `src/components/workspace/nodes/add/**`, `src/lib/media-library/**`, or `_acceptance/features/add-media-library/**` — lane-13b owns those. `src/components/workspace/types.tsx`, `src/i18n/messages/*.json` and `src/lib/workflow/exporter.ts` are shared: add lines, never edit existing ones.

---

### Task 1: ABI slot + codegen train

**Files:**
- Modify: `config/tongflow.abi.json` (the `nodes` array)
- Generated (commit them): `src/generated/abi/index.ts`, `sdk/tongflow/_data/tongflow.abi.json`, `sdk/tongflow/models/normalize_text_vi.py`, `sdk/tongflow/node_slots.py`

**Interfaces:**
- Consumes: nothing.
- Produces: TS types `NormalizeTextViInput` / `NormalizeTextViOutput` from `@/generated/abi`; Python `NormalizeTextViInput` / `NormalizeTextViOutput` in `tongflow.models.normalize_text_vi`; `NodeSlots.NORMALIZE_TEXT_VI` (value `"normalize-text-vi"`).

**independent:** false — every other task depends on this one.

**Serves:** AC-1 (E1a, E1b).

- [ ] **Step 1: Add the slot to the ABI**

In `config/tongflow.abi.json`, inside the top-level `nodes` array, immediately after the `gen-text` entry (it is the structural twin — same in/out shape):

```json
{
  "nodeSlot": "normalize-text-vi",
  "inputs": {
    "type": "object",
    "required": ["text"],
    "properties": {
      "text": { "type": "string", "minLength": 1 }
    },
    "additionalProperties": false
  },
  "outputs": {
    "type": "object",
    "required": ["success"],
    "properties": {
      "success": { "type": "boolean" },
      "error": { "type": "string" },
      "text": { "type": "string" }
    },
    "additionalProperties": false
  }
}
```

Do **not** add any other field. Strictness level, dictionaries and output codec are plugin constants (ABI hygiene, CLAUDE.md).

- [ ] **Step 2: Run the codegen train**

Run: `pnpm gen:abi`
Expected: writes `src/generated/abi/index.ts` and `sdk/tongflow/_data/tongflow.abi.json`; the Python generators write `sdk/tongflow/models/normalize_text_vi.py` and update `sdk/tongflow/node_slots.py`.

- [ ] **Step 3: Verify the generated Python matches `gen_text.py`'s shape**

Read `sdk/tongflow/models/normalize_text_vi.py`. Expected content:

```python
from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from .asset import Asset, AudioRef, FileRef, ImageRef, ModelRef, VideoRef


class NormalizeTextViInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    text: str

class NormalizeTextViOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    success: bool
    error: str | None = None
    text: str | None = None
```

If `text: str` came out optional, the `required` array in Step 1 is wrong — fix the ABI, do not hand-edit the generated file.

- [ ] **Step 4: Run both guards (the green half)**

Run: `bash scripts/abi/check-python-gen-clean.sh`
Expected: exit 0, no diff, no untracked generated files. (Commit the new model file first — this guard fails on untracked ones by design.)

Run: `pnpm gen:abi && git diff --exit-code src/generated/abi sdk/tongflow/_data/tongflow.abi.json`
Expected: exit 0.

- [ ] **Step 5: Demonstrate the red half**

Delete the `NormalizeTextViInput` class body from `sdk/tongflow/models/normalize_text_vi.py`, then run `bash scripts/abi/check-python-gen-clean.sh`.
Expected: **non-zero**, and the diff output names `sdk/tongflow/models/normalize_text_vi.py`.
Restore with `git checkout sdk/tongflow/models/normalize_text_vi.py`.

- [ ] **Step 6: Commit**

```bash
git add config/tongflow.abi.json src/generated/abi/index.ts sdk/tongflow/_data/tongflow.abi.json sdk/tongflow/models/normalize_text_vi.py sdk/tongflow/node_slots.py
git commit -m "feat(abi): add normalize-text-vi slot and regenerate TS + Python types"
```

---

### Task 2: The three-layer reader in the SDK

**Files:**
- Create: `sdk/tongflow/text/__init__.py`
- Create: `sdk/tongflow/text/normalize_vi.py` (the pipeline)
- Create: `sdk/tongflow/text/vi_dictionary.py` (domain dictionary — the only place abbreviations live)
- Create: `sdk/tests/test_normalize_vi.py` (the golden corpus and every reader assertion)
- Modify: `sdk/pyproject.toml` (add the dependency; the version bump is Task 12)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces:
  - `normalize_vi(text: str) -> NormalizeResult` where `NormalizeResult` is a frozen dataclass `(ok: bool, text: str, residual: tuple[str, ...], error: str | None)`.
  - `CORPUS_MONEY`, `CORPUS_TIME`, `CORPUS_ID`, `CORPUS_AMBIGUOUS`, `CORPUS_EDGE` — module-level tuples of `(raw, expected)` pairs in `sdk/tests/test_normalize_vi.py`, imported by Task 11's slot test so expectations are never restated.

**independent:** false — Tasks 3–6 build on this file.

**Serves:** AC-6 (E6a, E6b), AC-8 (E8).

- [ ] **Step 1: Declare the dependency**

In `sdk/pyproject.toml`, change the `dependencies` line to:

```toml
dependencies = ["pydantic>=2.0", "typing_extensions>=4.12", "vietnormalizer==0.2.3"]
```

The pin is exact on purpose: this slot promises determinism, and a patch release that reads one string differently is precisely what we promise cannot happen.

- [ ] **Step 2: Write the failing test for the post-check pair**

Create `sdk/tests/test_normalize_vi.py`:

```python
"""Golden corpus and invariants for the Vietnamese reader (AC-2..AC-8)."""

from __future__ import annotations

import unicodedata

from tongflow.text.normalize_vi import normalize_vi

# Fixture shared by the negative and positive halves of AC-6: the SAME string,
# once with a token the reader cannot read and once without.
RESIDUAL_FIXTURE_BROKEN = "Căn hộ giá 1.999.000₫, mã ⌘X7"
RESIDUAL_FIXTURE_CLEAN = "Căn hộ giá 1.999.000₫"


def test_residual_tokens_fail_and_are_listed() -> None:
    r = normalize_vi(RESIDUAL_FIXTURE_BROKEN)
    assert r.ok is False
    # The list is compared as a set of tokens, not a substring of the message:
    # "the error mentions it somewhere" is not the same promise as "the error
    # names exactly what was left over".
    assert set(r.residual) == {"⌘X7"}
    assert "⌘X7" in (r.error or "")


def test_clean_input_has_no_digits_left() -> None:
    r = normalize_vi(RESIDUAL_FIXTURE_CLEAN)
    assert r.ok is True
    assert not any(ch.isdigit() for ch in r.text)
    assert "₫" not in r.text and "%" not in r.text
    # Relational half: money in, money word out. A pure absence rule stays green
    # when the library silently EATS "đồng", which is the measured 0.2.3 defect.
    assert "đồng" in r.text
```

- [ ] **Step 3: Run it and watch it fail**

Run: `~/.claude/oneflow-pilot/s4lock acquire lane-13 >/dev/null && cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with vietnormalizer python -m pytest -q tests/test_normalize_vi.py; cd ..; ~/.claude/oneflow-pilot/s4lock release`
Expected: FAIL — `ModuleNotFoundError: No module named 'tongflow.text'`.

- [ ] **Step 4: Write the domain dictionary**

Create `sdk/tongflow/text/vi_dictionary.py`:

```python
"""Domain vocabulary the upstream library does not cover.

Measured against vietnormalizer 0.2.3 on 2026-08-19: it spells "TP.HCM" out
letter by letter and leaves "Q.7" untouched, so administrative abbreviations
are ours to expand. Everything here is a plugin-internal constant, never an
ABI field (CLAUDE.md, ABI hygiene).
"""

from __future__ import annotations

# Longest-first so "TP.HCM" wins over a bare "P." prefix rule.
ABBREVIATIONS: tuple[tuple[str, str], ...] = (
    ("TP.HCM", "thành phố Hồ Chí Minh"),
    ("TP.HN", "thành phố Hà Nội"),
    ("TPHCM", "thành phố Hồ Chí Minh"),
    ("CMND", "chứng minh nhân dân"),
    ("CCCD", "căn cước công dân"),
    ("BĐS", "bất động sản"),
)

# `Q.7` / `P.Bến Nghé` — prefix plus a value the reader still has to read.
PREFIXES: tuple[tuple[str, str], ...] = (
    ("Q.", "quận "),
    ("P.", "phường "),
    ("TT.", "thị trấn "),
    ("H.", "huyện "),
)

CURRENCY_SIGNS: tuple[tuple[str, str], ...] = (
    ("₫", "đ"),
    ("VNĐ", "đồng"),
    ("VND", "đồng"),
)

CURRENCY_MARKERS: tuple[str, ...] = ("₫", "đ", "VNĐ", "VND")
CURRENCY_WORD = "đồng"
```

- [ ] **Step 5: Write the pipeline**

Create `sdk/tongflow/text/normalize_vi.py`:

```python
"""Deterministic Vietnamese text normalisation for the TTS hand-off.

Three layers: an OneFlow pre-pass that fixes what the library measurably gets
wrong, the pinned library itself, and a post-check that refuses to hand a
half-read string to a voice. See docs/superpowers/specs/2026-08-19-normalize-text-vi-design.md.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from vietnormalizer import VietnameseNormalizer

from .vi_dictionary import (
    ABBREVIATIONS,
    CURRENCY_MARKERS,
    CURRENCY_SIGNS,
    CURRENCY_WORD,
    PREFIXES,
)

_NORMALIZER = VietnameseNormalizer()

# A hyphen BETWEEN two numbers is a range in spoken Vietnamese; the library
# leaves it as a bare character, which a voice reads as a pause or a minus.
_RANGE = re.compile(r"(?<=\d)\s*-\s*(?=\d)")
_RESIDUAL = re.compile(r"[0-9₫%]+|(?<=\S)-(?=\S)")


@dataclass(frozen=True)
class NormalizeResult:
    ok: bool
    text: str
    residual: tuple[str, ...]
    error: str | None = None


def _pre(text: str) -> str:
    out = unicodedata.normalize("NFC", text)
    for src, dst in ABBREVIATIONS:
        out = out.replace(src, dst)
    for src, dst in PREFIXES:
        out = out.replace(src, dst)
    for src, dst in CURRENCY_SIGNS:
        out = out.replace(src, dst)
    return _RANGE.sub(" đến ", out)


def normalize_vi(text: str) -> NormalizeResult:
    if not text or not text.strip():
        return NormalizeResult(
            ok=False, text="", residual=(), error="Chuỗi vào rỗng — không có gì để đọc"
        )

    had_money = any(marker in text for marker in CURRENCY_MARKERS)
    out = unicodedata.normalize("NFC", _NORMALIZER.normalize(_pre(text)))

    residual = tuple(dict.fromkeys(m.group(0) for m in _RESIDUAL.finditer(out)))
    if residual:
        return NormalizeResult(
            ok=False,
            text=out,
            residual=residual,
            error="Chưa đọc được: " + ", ".join(residual),
        )
    if had_money and CURRENCY_WORD not in out:
        return NormalizeResult(
            ok=False,
            text=out,
            residual=("<đơn vị tiền>",),
            error="Mất đơn vị tiền: chuỗi vào có ký hiệu tiền, chuỗi ra không có chữ 'đồng'",
        )
    return NormalizeResult(ok=True, text=out, residual=(), error=None)
```

Create `sdk/tongflow/text/__init__.py`:

```python
from .normalize_vi import NormalizeResult, normalize_vi

__all__ = ["NormalizeResult", "normalize_vi"]
```

- [ ] **Step 6: Run the test to verify it passes**

Same command as Step 3.
Expected: 2 passed.

- [ ] **Step 7: Add the edge cases (AC-8)**

Append to `sdk/tests/test_normalize_vi.py`:

```python
PLAIN = "Căn hộ đẹp không có số nào cả"


def test_edge_inputs() -> None:
    for empty in ("", "   ", "\n\t"):
        r = normalize_vi(empty)
        assert r.ok is False and "rỗng" in (r.error or "")

    # Plain prose comes back unchanged EXCEPT for case: the library lowercases,
    # and capital letters carry no sound. Compared byte-for-byte, not "roughly".
    plain = normalize_vi(PLAIN)
    assert plain.ok is True
    assert plain.text == PLAIN.lower()

    long_input = ("Giá 5 tỷ. " * 1000)
    assert normalize_vi(long_input).ok is True

    for messy in ("Xem tại https://a.vn nhé", "Mail: a@b.vn", "Đẹp quá 😍"):
        normalize_vi(messy)  # must not raise

    # Unicode form is a Gate-G1 concern ("không lỗi dấu"), so it is asserted as a
    # RELATION between the two encodings, not as "did not crash".
    for raw, _ in CORPUS_MONEY + CORPUS_TIME + CORPUS_ID:
        out = normalize_vi(raw)
        assert unicodedata.is_normalized("NFC", out.text)
        nfd = unicodedata.normalize("NFD", raw)
        assert normalize_vi(nfd).text == out.text
```

This references the corpora built in Tasks 3–4; run it after Task 4 lands.

- [ ] **Step 8: Demonstrate the red half of the post-check**

In a scratch copy, delete the `for src, dst in CURRENCY_SIGNS:` loop from `_pre` and run the two AC-6 tests.
Expected: `test_clean_input_has_no_digits_left` FAILS on the `"đồng" in r.text` assertion — the absence rule alone stays green, which is exactly why the relational half exists. Restore the loop.

- [ ] **Step 9: Commit**

```bash
git add sdk/tongflow/text sdk/tests/test_normalize_vi.py sdk/pyproject.toml
git commit -m "feat(sdk): three-layer Vietnamese reader with a residual post-check"
```

---

### Task 3: The money-and-numbers matrix (AC-2)

**Files:**
- Modify: `sdk/tests/test_normalize_vi.py`

**Interfaces:**
- Consumes: `normalize_vi` from Task 2.
- Produces: `CORPUS_MONEY: tuple[tuple[str, str], ...]` and `MONEY_MATRIX_CELLS`.

**independent:** false — same file as Task 2.

**Serves:** AC-2 (E2).

- [ ] **Step 1: Write the matrix and its coverage assertion first**

Append to `sdk/tests/test_normalize_vi.py`:

```python
# Full matrix, declared BEFORE the cases: variant × position. The reader is
# measured against it, and an empty cell is a failure that names the cell —
# so "we ran eight strings and pasted what came back" cannot pass for coverage.
MONEY_VARIANTS = ("linh", "lẻ", "mốt", "lăm", "mươi")
MONEY_POSITIONS = ("chục", "trăm", "nghìn", "triệu", "tỷ")

CORPUS_MONEY: tuple[tuple[str, str], ...] = (
    ("41 căn hộ", "bốn mươi mốt căn hộ"),
    ("21 tầng", "hai mươi mốt tầng"),
    ("15 phút", "mười lăm phút"),
    ("105 m2", "một trăm lẻ năm mét vuông"),
    ("125.000 đồng", "một trăm hai mươi lăm nghìn đồng"),
    ("1.999.000₫", "một triệu chín trăm chín mươi chín nghìn đồng"),
    ("50.000đ", "năm mươi nghìn đồng"),
    ("3 tỷ 2", "ba tỷ hai"),
    ("2,5 tỷ", "hai phẩy năm tỷ"),
    ("-7 độ", "âm bảy độ"),
    ("15%", "mười lăm phần trăm"),
)
MONEY_COUNT = 11

# Which matrix cells each case is claimed to cover. Written by hand: deriving it
# from the expected string would make the matrix agree with itself.
MONEY_MATRIX_CELLS: dict[str, tuple[tuple[str, str], ...]] = {
    "41 căn hộ": (("mốt", "chục"),),
    "21 tầng": (("mốt", "chục"),),
    "15 phút": (("lăm", "chục"),),
    "105 m2": (("lẻ", "trăm"), ("linh", "trăm")),
    "125.000 đồng": (("lăm", "nghìn"), ("mươi", "chục")),
    "1.999.000₫": (("mươi", "triệu"),),
    "50.000đ": (("mươi", "nghìn"),),
    "3 tỷ 2": (("mươi", "tỷ"),),
}


def test_numbers_and_money_golden() -> None:
    assert len(CORPUS_MONEY) == MONEY_COUNT

    covered = {cell for cells in MONEY_MATRIX_CELLS.values() for cell in cells}
    missing = [
        (v, p)
        for v in MONEY_VARIANTS
        for p in MONEY_POSITIONS
        if (v, p) not in covered and (v, p) not in KNOWN_EMPTY_MONEY_CELLS
    ]
    assert not missing, f"Ô ma trận chưa có ca nào: {missing}"

    for raw, expected in CORPUS_MONEY:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong '{expected}', nhận '{got.text}'"


# Cells that cannot exist in Vietnamese (e.g. "mốt" never lands on a bare
# hundred). Listed explicitly so the matrix stays honest instead of shrinking.
KNOWN_EMPTY_MONEY_CELLS: frozenset[tuple[str, str]] = frozenset(
    {
        ("linh", "chục"), ("linh", "nghìn"), ("linh", "triệu"), ("linh", "tỷ"),
        ("lẻ", "chục"), ("lẻ", "nghìn"), ("lẻ", "triệu"), ("lẻ", "tỷ"),
        ("mốt", "trăm"), ("mốt", "nghìn"), ("mốt", "triệu"), ("mốt", "tỷ"),
        ("lăm", "trăm"), ("lăm", "triệu"), ("lăm", "tỷ"),
    }
)
```

- [ ] **Step 2: Run it**

Run: `~/.claude/oneflow-pilot/s4lock acquire lane-13 >/dev/null && cd sdk && PYTHONPATH=. uv run --no-project --with pytest --with tomli --with pydantic --with typing_extensions --with vietnormalizer python -m pytest -q tests/test_normalize_vi.py::test_numbers_and_money_golden; cd ..; ~/.claude/oneflow-pilot/s4lock release`
Expected: PASS. Every expected string above was measured against 0.2.3 on 2026-08-19 except `2,5 tỷ`, `-7 độ`, `15%` — if one of those three differs, **fix the expected string to what Vietnamese actually says**, and if the library disagrees with Vietnamese, fix it in `_pre`/post — never edit a case to match the library.

- [ ] **Step 3: Demonstrate the red half**

Delete the `("105 m2", ...)` line from `CORPUS_MONEY` (and drop `MONEY_COUNT` to 10) and re-run.
Expected: FAIL with `Ô ma trận chưa có ca nào: [('lẻ', 'trăm'), ('linh', 'trăm')]` — the message names the cell, not just a count. Restore.

- [ ] **Step 4: Commit**

```bash
git add sdk/tests/test_normalize_vi.py
git commit -m "test(sdk): full variant×position matrix for Vietnamese number reading"
```

---

### Task 4: Time, identifiers and units (AC-3, AC-4)

**Files:**
- Modify: `sdk/tests/test_normalize_vi.py`
- Modify: `sdk/tongflow/text/vi_dictionary.py` (only if a case needs a new entry)

**Interfaces:**
- Consumes: `normalize_vi`, the corpus conventions from Task 3.
- Produces: `CORPUS_TIME`, `CORPUS_ID`.

**independent:** false — same file as Task 3.

**Serves:** AC-3 (E3), AC-4 (E4).

- [ ] **Step 1: Write both corpora with their matrices**

```python
TIME_KINDS = ("ngày", "tháng", "năm", "giờ", "phút", "khoảng")
CORPUS_TIME: tuple[tuple[str, str], ...] = (
    ("19/8/2026", "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu"),
    ("19-08-2026", "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu"),
    ("14:30", "mười bốn giờ ba mươi phút"),
    ("25-26/12", "ngày hai mươi lăm đến hai mươi sáu tháng mười hai"),
)
TIME_COUNT = 4

ID_KINDS = ("điện thoại", "đơn vị", "viết tắt")
CORPUS_ID: tuple[tuple[str, str], ...] = (
    ("0901234567", "không chín không một hai ba bốn năm sáu bảy"),
    ("85m2", "tám mươi lăm mét vuông"),
    ("60 km/h", "sáu mươi ki lô mét trên giờ"),
    ("TP.HCM", "thành phố hồ chí minh"),
    ("Q.7", "quận bảy"),
    ("P.Bến Nghé", "phường bến nghé"),
)
ID_COUNT = 6


def test_datetime_golden() -> None:
    assert len(CORPUS_TIME) == TIME_COUNT
    for raw, expected in CORPUS_TIME:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong '{expected}', nhận '{got.text}'"


def test_identifiers_units_abbrev_golden() -> None:
    assert len(CORPUS_ID) == ID_COUNT
    for raw, expected in CORPUS_ID:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong '{expected}', nhận '{got.text}'"
    # No abbreviation dot may survive into speech.
    for raw, _ in CORPUS_ID:
        assert "." not in normalize_vi(raw).text
```

- [ ] **Step 2: Run both**

Run the suite as in Task 3, targeting `::test_datetime_golden` and `::test_identifiers_units_abbrev_golden`.
Expected: PASS. `25-26/12` and `60 km/h` were **not** in the 19/08 measurement — if they come out differently, extend `_pre` (ranges already become "đến"; a day-range may need the "ngày" prefix) rather than weakening the expectation.

- [ ] **Step 3: Demonstrate the red half**

Remove the `("Q.", "quận ")` entry from `PREFIXES` and re-run `::test_identifiers_units_abbrev_golden`.
Expected: FAIL naming `'Q.7'` with the received string. Restore.

- [ ] **Step 4: Commit**

```bash
git add sdk/tests/test_normalize_vi.py sdk/tongflow/text/vi_dictionary.py
git commit -m "test(sdk): time, phone, unit and administrative-abbreviation corpora"
```

---

### Task 5: The three ambiguity constants (AC-5)

**Files:**
- Modify: `sdk/tests/test_normalize_vi.py`

**independent:** false — same file.

**Serves:** AC-5 (E5).

- [ ] **Step 1: Write the test**

```python
CORPUS_AMBIGUOUS: tuple[tuple[str, str], ...] = (
    ("5/3", "năm tháng ba"),
    ("1.500", "một nghìn năm trăm"),
    ("10-15", "mười đến mười lăm"),
)

AMBIGUOUS_CARRIERS = (
    "Khai trương {}",
    "Giá {} nhé anh",
    "{}",
)


def test_ambiguous_policy_pinned() -> None:
    for raw, expected in CORPUS_AMBIGUOUS:
        assert normalize_vi(raw).text == expected
    # The contract says the reading is a CONSTANT, so the same fragment must read
    # the same way in every carrier sentence — that is the measurable half of
    # "does not depend on sentence context".
    for raw, expected in CORPUS_AMBIGUOUS:
        readings = {normalize_vi(c.format(raw)).text.count(expected) for c in AMBIGUOUS_CARRIERS}
        assert readings == {1}, f"{raw!r} đọc khác nhau theo câu: {readings}"
```

- [ ] **Step 2: Run it**

Expected: PASS.

- [ ] **Step 3: Demonstrate the red half**

Change `_RANGE.sub(" đến ", out)` to `_RANGE.sub(" ", out)` and re-run.
Expected: FAIL naming `'10-15'`. Restore.

- [ ] **Step 4: Commit**

```bash
git add sdk/tests/test_normalize_vi.py
git commit -m "test(sdk): pin the three ambiguous readings as product constants"
```

---

### Task 6: Determinism and idempotence (AC-7)

**Files:**
- Modify: `sdk/tests/test_normalize_vi.py`

**independent:** false — same file.

**Serves:** AC-7 (E7).

- [ ] **Step 1: Write the test over the WHOLE corpus**

```python
ALL_CORPUS = CORPUS_MONEY + CORPUS_TIME + CORPUS_ID + CORPUS_AMBIGUOUS


def test_idempotent_and_byte_identical() -> None:
    for raw, _ in ALL_CORPUS:
        once = normalize_vi(raw)
        assert normalize_vi(raw).text == once.text  # same input, same bytes
        twice = normalize_vi(once.text)
        assert twice.text == once.text, f"{raw!r} không idempotent: {twice.text!r}"
```

- [ ] **Step 2: Run it** — Expected: PASS.

- [ ] **Step 3: Demonstrate the red half**

Add `out = out + "."` at the end of `normalize_vi`'s success path and re-run.
Expected: FAIL naming the first corpus entry. Restore.

- [ ] **Step 4: Commit**

```bash
git add sdk/tests/test_normalize_vi.py
git commit -m "test(sdk): determinism and idempotence over the whole corpus"
```

---

### Task 7: Canvas node

**Files:**
- Create: `src/components/workspace/nodes/transfer/normalize-text-vi.tsx`
- Create: `src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx`
- Modify: `src/lib/abi/node-feature-registry.ts` (two additive entries)
- Modify: `src/components/workspace/types.tsx` (three additive lines)
- Modify: `src/i18n/messages/{en,vi,ja,ko,zh}.json` (additive keys only)

**Interfaces:**
- Consumes: `NodeSlots.NORMALIZE_TEXT_VI` / generated TS types from Task 1.
- Produces: node type key `normalizeTextViNode`; `NODE_TYPE_SOURCE_SPEC.normalizeTextViNode = { text: textBatch() }`.

**independent:** true — no other task touches these files.

**Serves:** AC-9 (E9a).

- [ ] **Step 1: Register the feature and the source spec**

In `src/lib/abi/node-feature-registry.ts`, add to `NODE_TYPE_TO_ABI_FEATURE` (transfer group):

```ts
    normalizeTextViNode: "normalize-text-vi",
```

and to `NODE_TYPE_SOURCE_SPEC` (transfer group, next to the TTS nodes it feeds):

```ts
    // Same spec as every TTS node: one plugin call per upstream string, so
    // split-text → normalize-text-vi → text-gen-speech-* keeps one fan-out.
    normalizeTextViNode: { text: textBatch() },
```

- [ ] **Step 2: Write the node**

Create `src/components/workspace/nodes/transfer/normalize-text-vi.tsx`:

```tsx
import { SpellCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { memo } from "react";

import { useAbiForm } from "@/hooks/use-abi-form";
import { NODE_TYPE_SOURCE_SPEC } from "@/lib/abi/node-feature-registry";
import type { RfDataNodeProps } from "@/types/nodes";

import { AbiNodeShell } from "../base/abi-node-shell";

type NormalizeTextViRfProps = RfDataNodeProps<"normalizeTextViNode">;

const NormalizeTextViNode = ({ selected, data }: NormalizeTextViRfProps) => {
    const t = useTranslations("Workspace.nodes");
    const form = useAbiForm("normalize-text-vi");
    const texts = data.texts;

    return (
        <AbiNodeShell
            feature="normalize-text-vi"
            sourceSpec={NODE_TYPE_SOURCE_SPEC.normalizeTextViNode}
            form={form}
            selected={selected}
            data={data}
            title={t("titles.normalizeTextVi")}
            icon={<SpellCheck className="h-5 w-5" />}
            executeLabel={t("actions.normalizeTextVi")}
            executeDisabled={!texts?.length}
        />
    );
};

export default memo(NormalizeTextViNode);
```

- [ ] **Step 3: Register the component**

In `src/components/workspace/types.tsx`: add the import next to the other transfer imports, add `normalizeTextViNode: NormalizeTextViNode,` to `NODE_TYPES`, and add `"normalizeTextViNode"` to `NODE_CATEGORIES.TRANSFORM`. Add lines only — lane-13b adds its own line to the same file.

- [ ] **Step 4: Add i18n keys to all five locales**

Under `Workspace.nodes.titles` and `Workspace.nodes.actions` in each of `en,vi,ja,ko,zh`:

| locale | title | action |
|---|---|---|
| vi | `Đọc số thành chữ` | `Đọc thành chữ` |
| en | `Read numbers aloud` | `Normalize` |
| zh | `数字转文字` | `规范化` |
| ja | `数字を読み上げ用に変換` | `正規化` |
| ko | `숫자를 읽기용으로 변환` | `정규화` |

- [ ] **Step 5: Write the test**

Create `src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx`, copying the React Flow jsdom shims and the provider wrapper verbatim from `compose-overlay.test.tsx` (same file, lines 40–120 — repeat them, do not import from a test file), then:

```tsx
it("renders exactly the two ABI handles", async () => {
    renderNode();
    await waitFor(() => {
        expect(document.querySelector('[data-handleid="in:text"]')).toBeTruthy();
        expect(document.querySelector('[data-handleid="out:text"]')).toBeTruthy();
    });
});

it("uses the same fan-out spec as the TTS nodes", () => {
    // Compared against the neighbouring node's spec rather than a hardcoded
    // expectation: the promise is "identical to TTS", so TTS is the oracle.
    expect(NODE_TYPE_SOURCE_SPEC.normalizeTextViNode).toEqual(
        NODE_TYPE_SOURCE_SPEC.textGenSpeechPresetNode,
    );
});
```

- [ ] **Step 6: Run the test**

Run: `~/.claude/oneflow-pilot/s4lock acquire lane-13 >/dev/null; pnpm vitest run src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx; ~/.claude/oneflow-pilot/s4lock release`
Expected: PASS.

- [ ] **Step 7: Demonstrate the red half**

Change the spec to `{ text: textScalar() }` and re-run.
Expected: the second test FAILS showing both specs. Restore.

- [ ] **Step 8: Commit**

```bash
git add src/components/workspace/nodes/transfer/normalize-text-vi.tsx src/components/workspace/nodes/transfer/normalize-text-vi.test.tsx src/lib/abi/node-feature-registry.ts src/components/workspace/types.tsx src/i18n/messages
git commit -m "feat(canvas): normalize-text-vi node with TTS-identical fan-out"
```

---

### Task 8: The "must precede TTS" export guard

**Files:**
- Modify: `src/lib/workflow/exporter.ts` (add a constant, a private method, and one validation pass before the `return {` at ~line 282)
- Create: `src/lib/workflow/tts-order-guard.test.ts`

**Interfaces:**
- Consumes: `ExecutableNode.feature` and `ExecutableNode.dependencies` (already exist in `executable-workflow.ts:81,104`).
- Produces: exported `TTS_SLOTS: readonly string[]` and `WORKFLOW_TTS_NEEDS_NORMALIZE` error code, both read by the test.

**independent:** true.

**Serves:** AC-10 (E10a, E10b, E10c).

- [ ] **Step 1: Write the failing tests first**

Create `src/lib/workflow/tts-order-guard.test.ts` with three describes named so the eval keys select them: `violation`, `compliant`, `two-way`.

```ts
describe("violation", () => {
    it.each(TTS_SLOTS)("blocks %s without an upstream normalize-text-vi", (slot) => {
        const flow = buildFlow([{ id: "a", feature: "gen-text" }, { id: "b", feature: slot, deps: ["a"] }]);
        expect(() => flow.export()).toThrow(new RegExp(`${WORKFLOW_TTS_NEEDS_NORMALIZE}[\\s\\S]*\\bb\\b`));
    });
});

describe("compliant", () => {
    it("allows normalize-text-vi two nodes upstream", () => {
        const flow = buildFlow([
            { id: "a", feature: "normalize-text-vi" },
            { id: "m", feature: "combine-text", deps: ["a"] },
            { id: "b", feature: "text-gen-speech-preset", deps: ["m"] },
        ]);
        expect(() => flow.export()).not.toThrow();
    });

    it.each(["gen-music", "music-repaint", "music-cover", "music-lego", "music-complete", "separate-sound"])(
        "leaves the music slot %s alone",
        (slot) => {
            const flow = buildFlow([{ id: "a", feature: "gen-text" }, { id: "b", feature: slot, deps: ["a"] }]);
            expect(() => flow.export()).not.toThrow();
        },
    );
});

describe("two-way", () => {
    it("keeps TTS_SLOTS in step with the ABI", () => {
        const fromAbi = Object.entries(ABI_NODES)
            .filter(([, n]) => "text" in (n.inputs.properties ?? {}) && "audio" in (n.outputs.properties ?? {}))
            .map(([slot]) => slot)
            .filter((slot) => !MUSIC_SLOTS.includes(slot));
        expect([...TTS_SLOTS].sort()).toEqual(fromAbi.sort());
    });
});
```

- [ ] **Step 2: Run them and watch them fail** — Expected: `TTS_SLOTS is not exported`.

- [ ] **Step 3: Implement the guard**

In `src/lib/workflow/exporter.ts`, near the top:

```ts
/** Slots that turn written text into speech. An explicit allowlist, not a rule:
 *  "text in, audio out" also matches six music slots whose `text` is a prompt
 *  for the model, and "name contains speech" matches two slots that CONSUME
 *  speech. `tts-order-guard.test.ts` keeps this list in step with the ABI. */
export const TTS_SLOTS = [
    "text-gen-speech-preset",
    "text-gen-speech-clone",
    "text-gen-speech-instruct",
    "text-audio-gen-speech",
] as const;

export const MUSIC_SLOTS = [
    "gen-music", "music-repaint", "music-cover",
    "music-lego", "music-complete", "separate-sound",
] as const;

export const WORKFLOW_TTS_NEEDS_NORMALIZE = "WORKFLOW_TTS_NEEDS_NORMALIZE";
```

and a private method plus the validation pass immediately before `return {` (~line 282):

```ts
    private hasUpstreamSlot(
        nodeId: string,
        slot: string,
        nodes: ExecutableNode[],
    ): boolean {
        const byId = new Map(nodes.map((n) => [n.id, n]));
        const seen = new Set<string>();
        const stack = [...(byId.get(nodeId)?.dependencies ?? [])];
        while (stack.length) {
            const id = stack.pop() as string;
            if (seen.has(id)) continue;
            seen.add(id);
            const up = byId.get(id);
            if (!up) continue;
            if (up.feature === "normalize-text-vi" && slot === "normalize-text-vi") return true;
            stack.push(...up.dependencies);
        }
        return false;
    }
```

```ts
        // Roadmap 1.3: reading numbers aloud is mandatory before any TTS node.
        // Enforced here because this is the one gate every workflow passes,
        // whether the Director planned it or a person wired it by hand.
        const offenders = executableNodes
            .filter((n) => (TTS_SLOTS as readonly string[]).includes(n.feature))
            .filter((n) => !this.hasUpstreamSlot(n.id, "normalize-text-vi", executableNodes))
            .map((n) => n.id);
        if (offenders.length) {
            throw new Error(
                `${WORKFLOW_TTS_NEEDS_NORMALIZE}: node ${offenders.join(", ")} đọc chữ thành tiếng nhưng phía trên không có node "Đọc số thành chữ". Thêm node đó vào giữa nguồn chữ và node giọng đọc.`,
            );
        }
```

- [ ] **Step 4: Run the tests** — Expected: all three describes PASS.

- [ ] **Step 5: Demonstrate the red half of the two-way check**

Remove `"text-audio-gen-speech"` from `TTS_SLOTS` and re-run.
Expected: `two-way` FAILS naming that slot, and `violation` loses a case. Restore.

- [ ] **Step 6: Commit**

```bash
git add src/lib/workflow/exporter.ts src/lib/workflow/tts-order-guard.test.ts
git commit -m "feat(workflow): block export when a TTS node has no upstream normalize-text-vi"
```

---

### Task 9: Exporter shape for the new node

**Files:**
- Create: `src/lib/workflow/normalize-text-vi-export.test.ts`

**independent:** true.

**Serves:** AC-9 (E9b).

- [ ] **Step 1: Write the test** — model it on `src/lib/workflow/compose-overlay-export.test.ts`: build a canvas with a text node → `normalizeTextViNode`, export, and assert the emitted `ExecutableNode` has `pluginId` at the top level, `prompt`/`bindings` carrying only `text`, and `batchField === "text"`.
- [ ] **Step 2: Run it** — Expected: PASS (Task 7 already produced the wiring).
- [ ] **Step 3: Demonstrate the red half** — temporarily change the source spec to `configField()`; the `batchField` assertion fails. Restore.
- [ ] **Step 4: Commit** — `test(workflow): normalize-text-vi export shape`

---

### Task 10: Tier-A caching

**Files:**
- Modify: `sdk/tongflow/engine/node_cache.py` (`TIER_A_SLOTS`)
- Modify: `sdk/tests/test_node_cache.py` (the pinned list at line ~99)
- Create: `sdk/tests/test_node_cache_normalize.py`

**independent:** true.

**Serves:** AC-11 (E11a, E11b).

- [ ] **Step 1: Add the slot to the allowlist**

```python
    # normalize-text-vi: pure function over a string — no model call, no seed.
    # Byte-identity evidence is tests/test_normalize_vi.py (AC-7).
    "normalize-text-vi",
```

and add the same string to the pinned frozenset in `test_node_cache.py`.

- [ ] **Step 2: Write the two-node cache test** — copy the shape of `sdk/tests/test_node_cache_overlay.py`: fake tier-B handler feeding a fake tier-A `normalize-text-vi`; run twice unchanged (assert 0 plugin calls on run 2); change the input `text` (assert tier-B is not re-invoked and normalize is).
- [ ] **Step 3: Run both** — Expected: PASS.
- [ ] **Step 4: Demonstrate the red half** — remove the slot from `TIER_A_SLOTS` only; the pinned-list test fails naming the slot. Restore.
- [ ] **Step 5: Commit** — `feat(engine): cache normalize-text-vi as a Tier A slot`

---

### Task 11: Conformance fixture

**Files:**
- Create: `sdk/tests/conformance/fixtures/normalize-text-vi.json`
- Modify: `sdk/tests/conformance/test_conformance.py`, `src/lib/abi/conformance.ts`, `src/lib/abi/conformance.test.ts`

**independent:** true.

**Serves:** AC-12 (E12a, E12b).

- [ ] **Step 1: Produce the fixture by round-tripping the real exporter** — build the canvas flow in a scratch vitest, call `export()`, write the JSON. Do **not** hand-write it to the reader's shape: a hand-built fixture proves the reader agrees with itself.
- [ ] **Step 2: Register it on both sides**, following the `compose-overlay.json` entry verbatim.
- [ ] **Step 3: Run both halves** — Expected: same call count, `text` arriving as a scalar per call.
- [ ] **Step 4: Demonstrate the red half** — change the fixture's `batchField` to `null`; the Python side reports a different call count. Restore.
- [ ] **Step 5: Commit** — `test(conformance): normalize-text-vi fixture across both runtimes`

---

### Task 12: SDK version bump + the offline release guard

**Files:**
- Modify: `sdk/pyproject.toml`, `sdk/tongflow/__init__.py`
- Create: `scripts/abi/check-normalize-sdk-train-local.sh`

**independent:** true.

**Serves:** AC-13 (E14a).

- [ ] **Step 1: Bump both files to `0.2.19`** — they must match; drift between them is a recurring bug (CLAUDE.md).
- [ ] **Step 2: Write the guard**

```bash
#!/usr/bin/env bash
# E14a — offline half of the release train. Runs every verify round.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"   # from the script, not cwd
py="$(sed -n 's/^version = "\(.*\)"/\1/p' "$ROOT/sdk/pyproject.toml" | head -1)"
init="$(sed -n 's/^__version__ = "\(.*\)"/\1/p' "$ROOT/sdk/tongflow/__init__.py" | head -1)"
[ "$py" = "$init" ] || { echo "FAIL: pyproject=$py nhưng __init__=$init"; exit 1; }
grep -q 'vietnormalizer==0.2.3' "$ROOT/sdk/pyproject.toml" || {
    echo "FAIL: thiếu pin chính xác vietnormalizer==0.2.3"; exit 1; }
echo "OK: SDK $py, pin thư viện chính xác"
```

The version is **derived**, never hardcoded here — a guard that hardcodes the number goes green forever after the next bump.

- [ ] **Step 3: Run it (green), then break a copy (red)** — set `__version__` to `0.2.18` in a scratch copy; expect the failure to print both numbers. Restore.
- [ ] **Step 4: Commit** — `chore(sdk): bump to 0.2.19 and guard the version pair offline`

---

### Task 13: Official-plugin registration + docs

**Files:**
- Modify: `config/official-plugins.json`, `scripts/plugins/check-manifest-unmoved.sh`, `README.md`, `docs/README_ZH.md`, `docs/README_JA.md`
- Create: `scripts/plugins/check-normalize-registration.sh`

**independent:** true.

**Serves:** AC-13 (E13).

- [ ] **Step 1: Add the manifest entry** — `{"id": "oneflow-api-normalize-text-vi", "origin": "https://github.com/phanlemanh"}`, placed next to the other two `oneflow-api-*` origin entries.
- [ ] **Step 2: Re-cut the manifest guard** — inside its `node -e` block: `objects.length !== 4`, and add the id to `EXPECTED_IDS`. The plain-string count stays 36. **Do not touch `check-manifest-guard-teeth.sh`** — its perturbation #2 pushes one entry *above* the real count, so it self-adjusts.
- [ ] **Step 3: Update all three READMEs** — one entry in the official-plugins list (API plugins group, ordered to match the manifest), and a **new row** under `Transform → Text` in the capability matrix (that section has exactly one row today, so this is an addition, not a ⬜→✅ flip).
- [ ] **Step 4: Write `check-normalize-registration.sh`** — assert: the manifest entry exists with the right origin; all three READMEs mention the plugin id; all three have the new matrix row; the five locale files each have `normalizeTextVi` under both `titles` and `actions`. Derive the repo root from `BASH_SOURCE`, not cwd.
- [ ] **Step 5: Run it green, then red** — delete the Japanese README line; expect a failure naming that file. Restore.
- [ ] **Step 6: Run the teeth guard** — `bash scripts/plugins/check-manifest-guard-teeth.sh` → expect "OK: ... red for all 6 perturbations".
- [ ] **Step 7: Commit** — `feat(plugins): register oneflow-api-normalize-text-vi and sync docs`

---

### Task 14: The plugin repo and its shell

**Files (in a NEW repository `phanlemanh/oneflow-api-normalize-text-vi`, not this one):**
- Create: `entry.py`, `requirements.txt`, `tongflow.plugin.json`, `README.md`, `tests/test_shell.py`
- Create in THIS repo: `scripts/plugins/run-normalize-plugin-tests.sh`

**Interfaces:**
- Consumes: `tongflow.text.normalize_vi` (Task 2), `NodeSlots.NORMALIZE_TEXT_VI` (Task 1).
- Produces: the installed plugin that serves the slot.

**independent:** false — needs Tasks 1, 2 and 12 published or at least pinned locally.

**Serves:** AC-14 (E17a, E17b).

> **Deviation to approve at Gate 1.5:** the contract's AC-14 says the round-trip must exercise the **real** shell. The shell lives in a separate repo (this repo's `plugins/` is gitignored), so E17a/E17b cannot be plain SDK tests as first written. They become a clone-and-run guard, exactly like `run-overlay-plugin-tests.sh` — the same mechanism `compose-overlay` already ships. The corpus stays in-repo and fast; only the shell needs the network. Eval executor changes from `test` to `script`; **the criterion text does not change**.

- [ ] **Step 1: Write the shell**

```python
"""Local entry for the Vietnamese reader — one slot, no cloud account."""

from __future__ import annotations

import json
import sys

from tongflow.models.normalize_text_vi import (
    NormalizeTextViInput,
    NormalizeTextViOutput,
)
from tongflow.node_slots import NodeSlots
from tongflow.slots import node_slot
from tongflow.text import normalize_vi

TONGFLOW_DEFAULT_SLOTS = ["normalize-text-vi"]


@node_slot(NodeSlots.NORMALIZE_TEXT_VI)
def normalize_text_vi(input: NormalizeTextViInput) -> NormalizeTextViOutput:
    try:
        r = normalize_vi(input.text)
    except Exception as e:  # surfaced to the UI as an ABI failure
        return NormalizeTextViOutput(success=False, error=f"Lỗi khi đọc chuỗi: {e}")
    if not r.ok:
        return NormalizeTextViOutput(success=False, error=r.error)
    return NormalizeTextViOutput(success=True, text=r.text)
```

plus the same stdin/stdout dispatcher tail as `plugins/oneflow-api-ffmpeg/entry.py` (copy it verbatim — it is identical across local plugins).

`requirements.txt`:

```
oneflow-sdk==0.2.19
```

- [ ] **Step 2: Write the shell test in the plugin repo**

```python
def test_slot_roundtrip_calls_sdk_once(monkeypatch):
    calls = []
    real = entry.normalize_vi
    monkeypatch.setattr(entry, "normalize_vi", lambda t: (calls.append(t), real(t))[1])
    out = entry.normalize_text_vi({"text": "1.999.000₫"})
    assert out["success"] is True
    assert out["text"] == EXPECTED_FROM_SDK_CORPUS  # imported, not restated
    assert len(calls) == 1  # the shell delegates; it does not re-implement


def test_slot_reports_error_without_traceback(monkeypatch):
    monkeypatch.setattr(entry, "normalize_vi", _raise)
    out = entry.normalize_text_vi({"text": "x"})
    assert out["success"] is False
    assert "Lỗi khi đọc chuỗi" in out["error"] and "Traceback" not in out["error"]
```

- [ ] **Step 3: Write the clone guard in this repo**, modelled on `scripts/plugins/run-overlay-plugin-tests.sh`, printing the plugin repo's commit sha so evidence can cite it.
- [ ] **Step 4: Demonstrate the red half** — in a scratch clone, change the shell body to `return NormalizeTextViOutput(success=True, text=input.text)`; expect the round-trip test to fail on the expected string **and** the call-count assertion. This is the exact defect the criterion exists for.
- [ ] **Step 5: Commit the guard here** — `test(plugins): clone-and-run guard for the normalize plugin shell`

---

### Task 15: Design gate captures

**Files:** evidence only — `_acceptance/normalize-text-vi/evidence/design/captures/`

**independent:** false — needs Task 7.

**Serves:** AC-15 (E15, E16).

- [ ] **Step 1: Start the dev server on port 3000** — ping lane-13b first; they hold 3000 for their own preview.
- [ ] **Step 2: Capture four states** — `state-1-idle`, `state-2-wired`, `state-3-running`, `state-4-residual-error` — with `pnpm ui:capture`.
- [ ] **Step 3: Run the design gate** — expect the P0 floor to pass with a clean console.

---

### Task 16 (GATED — do not run without the owner's word): publish and pin

**Serves:** AC-13 (E14b).

This is the irreversible step: publishing `oneflow-sdk==0.2.19` to PyPI cannot be undone, and creating the public plugin repo publishes content. Both wait for the owner at Gate 2.

- [ ] **Step 1: `pnpm sdk:publish`** (needs `TWINE_USERNAME=__token__` + `TWINE_PASSWORD` in `.env`).
- [ ] **Step 2: Create the plugin repo under `phanlemanh` and push Task 14's files.**
- [ ] **Step 3: Write and run `scripts/abi/check-normalize-sdk-published.sh`** — assert PyPI serves 0.2.19, that the published wheel contains `NormalizeTextViInput/Output` and `NORMALIZE_TEXT_VI`, and that the plugin repo pins `oneflow-sdk==0.2.19`. Explicit timeout; a failure here before publishing is infrastructure, not a rejected criterion.

---

## Self-review

**Spec coverage:** AC-1 → T1 · AC-2 → T3 · AC-3/AC-4 → T4 · AC-5 → T5 · AC-6 → T2 · AC-7 → T6 · AC-8 → T2 · AC-9 → T7, T9 · AC-10 → T8 · AC-11 → T10 · AC-12 → T11 · AC-13 → T12, T13, T16 · AC-14 → T14 · AC-15 → T15. No criterion is unassigned.

**Placeholder scan:** the three "copy the shape of X" steps (T9, T10, T11) name the exact file to copy from and the exact assertions to produce; T14's dispatcher tail is a verbatim copy of a file in this repo. No TBDs.

**Type consistency:** `normalize_vi` returns `NormalizeResult` everywhere; the shell converts it to `NormalizeTextViOutput` and nowhere else; `TTS_SLOTS` / `MUSIC_SLOTS` / `WORKFLOW_TTS_NEEDS_NORMALIZE` are exported from `exporter.ts` and imported by one test file.

**Parallel fan-out:** Tasks 7, 8, 9, 10, 11, 12, 13 are marked `independent: true` and touch disjoint files — they are the S3 fan-out set. Tasks 1–6 are strictly sequential (one module, one test file); Tasks 14–16 depend on the release train.
