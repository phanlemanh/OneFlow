"""Deterministic Vietnamese text normalisation for the TTS hand-off.

Three layers: an OneFlow pre-pass that fixes what the pinned library
measurably gets wrong, the library itself, and a post-check that refuses to
hand a half-read string to a voice.

See docs/superpowers/specs/2026-08-19-normalize-text-vi-design.md for the
measurement this design is built on.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from vietnormalizer import VietnameseNormalizer

from .vi_dictionary import (
    ABBREVIATION_PATTERNS,
    CURRENCY_SIGN_PATTERNS,
    CURRENCY_WORD,
    LETTER,
    PREFIX_PATTERNS,
)

_NORMALIZER = VietnameseNormalizer()

# A dash-separated date must be rewritten BEFORE the range rule below, or
# "19-08-2026" reads as "muoi chin den tam den hai nghin..." — measured.
_DASH_DATE = re.compile(r"\b(\d{1,2})-(\d{1,2})-(\d{4})\b")

# The library prefixes its OWN "ngày" when reading a full d/m/y date, so the
# extremely common written form "ngày 19/8/2026" came back as "ngày ngày mười
# chín..." — a voice says the word twice (measured, S4 round 2 finding). Drop
# the written word and let the library re-add it. Full dates only: a bare d/m
# reads WITHOUT the word (measured), so there the written "ngày" must stay.
# ...but ONLY when the library can actually read the date. The rule used to fire
# on every token matching the SHAPE, trusting the library to re-add the word.
# That assumption holds only for a date it parses: measured on this tree,
# "ngày 12/25/2026" (US order) came back "mười hai tháng hai/hai nghìn…" — the
# written "ngày" gone, the 25 gone entirely, month read as 2, and the slash
# still sitting there with ok=True and an empty residual (S4 round 12 of the
# parent contract; AC-9 here).
#
# Validity is decided on the DAY and MONTH fields, which is the whole
# difference between a date the library reads and a shape that merely looks
# like one. An invalid one keeps its written "ngày" and falls through to the
# residual guard, which refuses rather than speaking half a date.
_DAY_WORD_BEFORE_DATE = re.compile(r"(?i)\bngày\s+(?=(\d{1,2})[/-](\d{1,2})[/-]\d{4}\b)")


def _drop_day_word_if_readable(match: re.Match[str]) -> str:
    day, month = int(match.group(1)), int(match.group(2))
    readable = 1 <= day <= 31 and 1 <= month <= 12
    return "" if readable else match.group(0)

# The SPACED price form "500 đ". has_money deliberately counts it as money
# ((?<=\d)\s*đ\b), but the pinned library only expands the GLUED form —
# measured: "50.000đ" → "…nghìn đồng" while "500 đ" leaves the "đ" verbatim.
# So without this rewrite every spaced-đ price failed the money-loss rule with
# ok=False, for one of the most common ways Vietnamese prices are written
# (S4 round 2 finding). Rewrite to the word the library understands.
# The magnitude words a price may carry between its digits and its currency
# mark. "5 tỷ đ" is ordinary sales copy, and every money rule below used to
# anchor on a digit IMMEDIATELY left of the "đ", so one word in between made
# all three layers miss at once (S4 round 5 finding, measured on this branch:
# "Giá 5 tỷ đ" → "giá năm tỷ đ", ok=True, price unspoken). Kept as one shared
# constant so the pre-pass, the money test and any later rule cannot drift
# apart the way the unit LIST did for ranges in round 4.
# "trăm" và "chục" added 2026-08-26. Their absence made all three layers miss
# together — the pre-pass did not rewrite "5 trăm đ", has_money() returned False
# so the money-loss relation never ran, and the ambiguity rule did not match
# either, so a bare currency letter reached the voice with ok=True. Same defect
# class this constant was introduced to close in round 5, one element along
# (S4 round 15 finding).
_MAGNITUDE_WORDS = ("nghìn", "ngàn", "triệu", "tỷ", "tỉ", "trăm", "chục")
_MAGNITUDE = "(?:" + "|".join(_MAGNITUDE_WORDS) + ")"
# A lookbehind must be fixed-width, so the alternation is over whole lookbehind
# groups rather than inside one. BUILT from the tuple above, not retyped: the
# first version of this rule listed the five words a second time here, which is
# precisely the drift the comment above claims is structurally impossible
# (S4 round 6 finding — the reviewer read the claim and checked it).
_MAGNITUDE_BEHIND = "|".join(f"(?<={w})" for w in _MAGNITUDE_WORDS)

# ONE separator class for the whole "<number> đ <word>" family. The refusal
# rule and the two rewrites it must veto have to agree on what counts as a gap,
# or the veto never reaches the inputs the rewrites accept: the rewrites used
# `\s` while the refusal used `[ \t]`, so a newline, an NBSP, or no gap at all
# let a street address through as a price with ok=True (S4 round 17, measured:
# 'Số 5 Đ.\nLê Lợi' -> 'số năm đồng. lê lợi'). Shared the way _MAGNITUDE_WORDS
# is shared — a second spelling is the drift.
_SEP = r"\s"

_SPACED_DONG = re.compile(
    rf"(?<=\d){_SEP}+(?i:đ)\b"
    rf"|(?i:{_MAGNITUDE_BEHIND}){_SEP}*(?i:đ)\b"
)

# A hyphen BETWEEN two numbers is a range in spoken Vietnamese. The library
# leaves the bare character in place ("muoi-muoi lam"), which a voice reads as
# a pause or a minus sign, and "5%-10%" fell through to the MINUS rule below
# and read as "năm phần trămâm mười phần trăm" (measured, S4 round 2).
#
# Anchored on the NUMBER, with whatever unit token follows it carried along —
# NOT on a list of known unit signs. Two rounds in a row the sign list was the
# bug: "5%-10%" then "1.000 đ-2.000 đ" each had to be added by hand, and the
# corpus grew by CASE while AC-5 promises a CLASS, so the next member stayed
# silent. Measured before this rewrite, all with ok=True: "5 triệu - 10 triệu"
# → "năm triệu mười triệu", "5 tỷ - 10 tỷ", "5kg-10kg", "5 người - 10 người"
# (S4 round 4 finding). The unit group is any single letter-word, so a unit
# spelled as a sign (%, ₫), an abbreviation (đ) or a full word (triệu, kg,
# người) all take the same path; the right side still requires a digit, so a
# letter compound ("ki-lô-mét") cannot match.
_RANGE = re.compile(r"(?<=\d)(?P<unit>[ \t]*(?:%|₫|[^\W\d_][^\W_]{0,15})?)[ \t]*-[ \t]*(?=\d)")

# A dash in front of a number, once ranges are gone, is a minus sign.
# Amounts written the standard Vietnamese way. The pinned library reads the
# THOUSAND DOT correctly on its own ("1.999.000 ₫" → "một triệu chín trăm chín
# mươi chín nghìn đồng"); what it cannot read is the DECIMAL COMMA, and it
# fails silently in two different directions, neither leaving a digit behind
# for the post-check:
#   "3.000.000,00 đ" -> "ba.không.không đồng"   (words around a literal dot)
#   "3000000,00 đ"   -> "ba trăm triệu đồng"    (right shape, wrong SCALE)
# The second is the dangerous one — a confident, order-of-magnitude-wrong price
# spoken as success. Measured S4 round 5; owner raised scope 2026-08-22 rather
# than filing it as a known limit, because invoice copy is written this way and
# the failure direction is "speaks a wrong number", not "refuses to speak".
#
# Lifting the decimal part out into the word the library DOES read ("phẩy") is
# enough on its own; a companion rule stripping the thousand dots was written
# first and then deleted, because removing it left every matrix cell green —
# a rule no case can turn red is the exact shape of defect this feature keeps
# shipping (measured while proving the red direction, same day).
#
# One or two decimal places only. Three would be ambiguous with the ENGLISH
# thousand separator ("1,000"), which this rule must not silently re-scale.
# One comma only, and not part of a chain. `(?<![,\d]\d)` would still allow a
# list, so the guard is on the RIGHT: a decimal is followed by end-of-number,
# never by another `,digit` group. Without it, "Chọn đáp án 1,2,3" became
# "một phẩy hai phẩy ba" with ok=True — an enumeration read as decimals, and
# every guard silent because no digit survived (S4 round 17).
_DECIMAL_COMMA = re.compile(r"(?<=\d),(\d{1,2})(?!\d)")

# A CHAIN of comma-separated numbers is an enumeration, never a decimal — a
# decimal has one comma. Matched as a whole token and rewritten to plain commas
# BEFORE the decimal rule sees it; guarding only the right-hand side left the
# last comma of "1,2,3" looking like a decimal ("một, hai phẩy ba").
#
# Declared limit: a SINGLE comma ("Bước 1,2") stays a decimal. It is genuinely
# ambiguous — "1,2" is a valid quantity — and erring toward the decimal keeps
# every price reading intact, which is what this slot exists for.
_COMMA_CHAIN = re.compile(r"\d+(?:,\d+){2,}")

# THE COMMA TABLE — declared first, and the ONLY comma shapes this reader
# claims to read. A run is `<digits>(,<digits>)+`; what it means depends on the
# groups, and two of the four shapes cannot be told apart from another meaning:
#
#   one group, 1-2 digits    "7,05"             -> DECIMAL, readable
#   many groups, not all     "1,2,3"            -> ENUMERATION, readable
#     exactly 3 digits
#   many groups, ALL         "1,000,000"        -> REFUSE: the English thousand
#     exactly 3 digits                             separator and an enumeration
#                                                  are written identically
#   one group, >=3 digits    "1,000" "3,14159"  -> REFUSE: English thousands, or
#                                                  a fraction outside the
#                                                  declared decimal shape
#
# Measured before this table existed, every one with ok=True and an empty
# residual: "1,000,000 VND" read as "một, không, không đồng" (six orders of
# magnitude out); "3,14159" as "ba phẩy mười bốn nghìn một trăm năm mươi chín".
# Guessing one of two meanings is speaking a wrong number; refusing is something
# the user SEES. Same doctrine as _AMBIGUOUS_D below.
_COMMA_RUN = re.compile(r"\d+(?:,\d+)+")


def _unreadable_comma_runs(text: str) -> tuple[str, ...]:
    """The comma runs this reader refuses rather than guesses. Table above."""
    refused: list[str] = []
    for match in _COMMA_RUN.finditer(text):
        run = match.group(0)
        groups = run.split(",")[1:]
        all_three = all(len(g) == 3 for g in groups)
        if all_three or (len(groups) == 1 and len(groups[0]) >= 3):
            refused.append(run)
    return tuple(dict.fromkeys(refused))



def _decimal_tail(match: re.Match[str]) -> str:
    # An all-zero fraction is not spoken in a Vietnamese price: "3.000.000,00 đ"
    # is read "ba triệu đồng", never "ba triệu phẩy không đồng".
    digits = match.group(1)
    if set(digits) == {"0"}:
        return ""
    # LEADING ZEROS ARE SPOKEN, the rest is a cardinal. Handing the raw fraction
    # to the library made it a cardinal as a whole, and a cardinal has no leading
    # zero: "7,05%" came back "bảy phẩy năm" (7.5%) and "3,09 triệu" was
    # byte-identical to "3,9 triệu" — a confident, order-of-magnitude-wrong
    # number spoken as success, with residual empty and the currency word
    # present, so both post-checks stayed green (S4 round 18).
    lead = len(digits) - len(digits.lstrip("0"))
    return f" phẩy {'không ' * lead}{digits[lead:]}"


# "<số hoặc đơn vị lớn> đ[.] <từ>" is REFUSED, not guessed.
#
# Vietnamese writes a price and an address with the same characters:
#   "Giá 500 đ. Bao gồm VAT"   — currency mark, then a sentence period
#   "Số 5 Đ. Lê Lợi"           — abbreviation for Đường, then a street name
# Only meaning separates them. Three rules tried a signal and each shipped a
# wrong reading: letter case (round 6), the dot (round 11), a capital after the
# dot (round 13) — measured, all with ok=True, and every guard blind because the
# rewrite either removed the digits or injected the very word the money-loss
# relation looks for.
#
# What is NOT ambiguous, and still reads: the mark at end of string, before a
# comma or a slash, or spelled out in full ("ĐỒNG", "VNĐ"). Nothing can follow
# it there that would make it an address.
_AMBIGUOUS_D = re.compile(
    # `\b` after the mark is what makes the zero-width gap safe: without it,
    # "đồng" would match here (đ + no dot + no gap + a letter) and every price
    # would be refused. With it, "đ" glued to a letter is not a match at all.
    #
    # The lookahead covers a LETTER, a DIGIT or a COMMA. Digits belong here
    # because Vietnamese street names are frequently numbers — Đường 3/2,
    # Đường 30/4, Đường 2/9 are major streets in HCMC, Cần Thơ and Đà Nẵng — and
    # the earlier letter-only lookahead let them through as prices: measured on
    # this branch, "Số 25 Đ. 3/2, Q.10" read "số hai mươi lăm đồng. ba tháng
    # hai, quận mười" with ok=True and an empty residual (S4 round 19, owner
    # widened the refusal 2026-08-27). A comma belongs for the same reason:
    # "Số 25 Đ, Q.1". Measured cost of the widening: none of the 126 strings in
    # the declared corpora changes verdict, and one genuine price spelling —
    # "Giá 500 đ, bao gồm VAT" — is now refused, declared in Known limits.
    #
    # END OF STRING is deliberately still read, so "Số nhà 25 Đ." stays a known
    # limit: refusing there would take "Giá 500 đ" with it, which is the single
    # commonest price spelling this slot exists to read.
    rf"(?:(?<=\d)|(?i:{_MAGNITUDE_BEHIND})){_SEP}*(?i:đ)\b\.?{_SEP}*(?=[^\W_]|,)"
)

# ONE dash class for the whole family. Every rule that reasons about a dash —
# range, minus, date, residual — has to agree on what counts as one, or a
# typographic dash walks straight past all of them. Measured on this tree, every
# case ok=True with an empty residual:
#   "Giá 5–10 triệu"   -> "giá năm THÁNG mười triệu"  (library read it as a date)
#   "Giá 5%–10%"       -> "giá năm phần trăm mười phần trăm"  (word "đến" gone)
#   "Nhiệt độ −7 độ"   -> "nhiệt độ -bảy độ"  (dash survived INTO the speech)
# The ASCII spellings of all three read correctly, so this is purely a character
# class hole, not a rule-logic one.
#
# Folded to ASCII in the pre-pass rather than added to each rule: one fold, and
# every downstream rule keeps the single spelling it was written for.
_TYPOGRAPHIC_DASHES = "\u2013\u2014\u2212"  # – en, — em, − minus
_DASH_FOLD = re.compile(f"[{_TYPOGRAPHIC_DASHES}]")

# THE DASH TABLE — which dash-joined digit runs this reader claims to read as a
# RANGE, and which it refuses rather than guessing. A range has exactly TWO
# endpoints and both are quantities; the shapes below are neither, and reading
# them as a range LOSES DIGITS, which no post-check can see:
#
#   "ISO 2026-08-19"           -> "hai nghìn… ĐẾN tám ĐẾN mười chín"
#   "Gọi 0912-345-678"         -> "chín trăm mười hai ĐẾN …"   (leading 0 gone)
#   "Mã 0123-4567"             -> "một trăm hai mươi ba ĐẾN …" (leading 0 gone)
#
# Two structural signals, both properties of the RUN, not of the rule measuring
# it: three or more groups cannot be a two-endpoint range, and a group with a
# leading zero is an identifier, never a quantity.
#
# Declared limit that stays: "1234-5678" (two groups, no leading zero) is
# genuinely indistinguishable from the range "1234 đến 5678". Refusing it would
# take "5-10" with it — the shape this rule exists to read.
# A BRAND TOKEN is Latin letters with an uppercase INSIDE it — the signal that
# separates "VNDirect" and "iPhone" from an ordinary capitalised Vietnamese word
# ("Hotline", "Thanh") and from an all-caps abbreviation ("VAT", "VNDS"), both of
# which the library reads correctly. Measured: exactly 1 of the 170 strings in
# the declared corpora carries one, and it is the token already pinned as a
# limit — "Mua qua VNDirect" came back "mua qua ndi re", then "di re" on a second
# pass, breaking the idempotence promise (AC-4).
#
# Masking it away from the library was tried first and is WORSE: a digit-bearing
# placeholder gets read as a number, and a private-use code point is deleted
# outright, so the brand vanished from the sentence (both measured 2026-08-27).
#
# What separates a mangling from a legitimate transliteration is measurable, and
# it is the promise the parent contract already makes: reading a reading must
# change nothing. "iPhone" -> "ai phôn" -> "ai phôn" is stable and stays.
# "VNDirect" -> "ndi re" -> "di re" is not, and a token that reads differently
# every pass is not being read at all — so it is refused BY NAME.
_LATIN_TOKEN = re.compile(r"\b[A-Za-z]{3,}\b")


def _is_brand_token(token: str) -> bool:
    return any(c.isupper() for c in token[1:]) and any(c.islower() for c in token)


# A URL is not speech. Left to the library it does not merely read badly — it
# DISAPPEARS: measured, "Xem tại https://oneflow.vn/gia nhé" came back
# "xem tại nhé" with ok=True, i.e. a sentence quietly missing its subject (AC-2).
_URL = re.compile(r"(?i)\b(?:https?://|ftp://|www\.)\S+")


_DASH_RUN = re.compile(r"\d+(?:-\d+)+")


def _unreadable_dash_runs(text: str) -> tuple[str, ...]:
    """Dash-joined digit runs this reader refuses rather than guesses."""
    # d-m-y dates are rewritten to slashes before the range rule ever sees them,
    # so they are not candidates: mask them out first or "ngày 19-08-2026" (three
    # groups, a zero-padded month) would be refused as an identifier.
    masked = _DASH_DATE.sub(lambda m: "\x00" * len(m.group(0)), text)
    refused: list[str] = []
    for match in _DASH_RUN.finditer(masked):
        run = match.group(0)
        groups = run.split("-")
        many_groups = len(groups) >= 3
        zero_padded = any(len(g) > 1 and g[0] == "0" for g in groups)
        if many_groups or zero_padded:
            refused.append(run)
    return tuple(dict.fromkeys(refused))


_NEGATIVE = re.compile(r"(?<![\w])-(?=\d)")

# What must never survive into speech: digits, a currency sign, a percent sign,
# or a hyphen still standing between two digits. It deliberately does NOT flag a
# hyphen between letters — the library writes real Vietnamese compounds that way
# ("ki-lo-met"), and flagging those rejects correct output. The surviving-colon
# rule used to live here as a shape test; it is relational now, just below.
_RESIDUAL = re.compile(
    rf"[0-9₫%]+|(?<=\d)-(?=\d)"
    # A typographic dash must never reach the voice. After the fold above
    # there should be none left; keeping them here is the tooth that makes
    # removing the fold a RED test instead of a silent regression.
    rf"|[{_TYPOGRAPHIC_DASHES}]"
)

# A SLASH the library did not turn into words. It reads the ones it knows
# ("100km/h" -> "ki lô mét trên giờ"), so a surviving "/" can mean it gave up:
# "Giá 50.000 đ/kg" -> "…đồng/kg" and "Lãi 5%/năm" -> "…phần trăm/năm", both
# ok=True with an empty residual before this (AC-10). It is also what makes a
# half-parsed date silent — the library leaves a slash, not a digit, so a
# post-check watching only [0-9₫%] is blind to it (AC-9).
#
# Decided RELATIONALLY, exactly like the clock colon above and for the same
# reason. Watching the output alone refused ordinary prose that was never a
# number: "và/hoặc", "TP/HCM", "nam/nữ", "N/A" all came back ok=False naming
# "/" while the speech string was already correct (S4 round 2 finding). What
# separates the two families is the INPUT — a number-related slash sits against
# a digit, a percent sign, or a currency mark that itself follows digits. Both
# halves are required: a surviving slash in the OUTPUT *and* a numeric slash in
# the INPUT.
_SLASH = re.compile("/")
# What sits against a slash to make it part of a NUMBER: a digit, a percent
# sign, a currency glyph, or the currency WORD. The word — not the letter "đ" —
# because this runs on the PRE-PROCESSED string, where `_SPACED_DONG` has
# already turned "50.000 đ/kg" into "50.000 đồng/kg". Anchoring on "đ" here
# silently stopped matching the most common price shape in the corpus.
_NUM_LEFT_OF_SLASH = re.compile(rf"(?:\d|%|₫|{CURRENCY_WORD}){_SEP}*$")
_NUM_RIGHT_OF_SLASH = re.compile(rf"^{_SEP}*\d")


def _prose_slash_count(pre: str) -> int:
    """Slashes in the pre-processed input that were never part of a number.

    Counted PER OCCURRENCE, because the two halves of the rule have to line up
    on the SAME slash. Testing them independently over the whole string refused
    "Ngày 19/8/2026 và/hoặc thứ hai" — the date read perfectly and only the
    prose slash survived, yet one numeric slash anywhere condemned every prose
    slash in the sentence (S4 round 3 finding).
    """
    prose = 0
    for match in _SLASH.finditer(pre):
        i = match.start()
        numeric = bool(_NUM_LEFT_OF_SLASH.search(pre[:i])) or bool(
            _NUM_RIGHT_OF_SLASH.match(pre[i + 1 :])
        )
        if not numeric:
            prose += 1
    return prose

# The colon left over from a MANGLED CLOCK, decided relationally instead of by
# shape. The shape test `:(?=\S)` could not tell "mười bốn:ba mươi" (a clock the
# library mis-parsed) from "Ghi chú:Xem thêm" (a missing space after a colon in
# ordinary prose) — both are a colon glued between words — so it failed whole
# TTS chains over a typo in text carrying no number at all (S4 round 4 finding).
# What separates them is not the OUTPUT alone but the pair: a clock puts DIGITS
# on both sides of the colon going in, and when the library mis-parses it the
# colon comes back sitting between two WORDS. Both halves are required.
# Known imperfection, stated rather than hidden: an input that carries BOTH a
# real clock and a glued prose colon ("Ghi chú:Xem thêm lúc 14:30") still trips
# it. That errs toward refusing to speak, never toward speaking wrong content.
_CLOCK_IN = re.compile(r"\d\s*:\s*\d")
_COLON_BETWEEN_WORDS = re.compile(r"(?<=[^\W\d_]):(?=[^\W\d_])")

# "Money is present" must be a precise test, not a substring search: the letter
# "d" alone appears inside ordinary words ("do", "dep"), so `"d" in text` marks
# every second Vietnamese sentence as a price. Measured: "-7 do" and "Can ho
# dep..." both tripped it before this was tightened. VNĐ/VND carry the same
# letter-boundary anchors as the dictionary replacement — without them,
# "VNDirect" counts as money going in, no currency word comes out, and the
# relational rule rejects a perfectly clean sentence.
_MONEY = re.compile(
    rf"₫"
    # Case-insensitive, matching CURRENCY_SIGN_PATTERNS: these two anchors were
    # the last case-SENSITIVE money marks left, so lowercase price copy turned
    # the relational guard off entirely (S4 round 7).
    rf"|(?<!{LETTER})(?i:VNĐ)(?!{LETTER})"
    rf"|(?<!{LETTER})(?i:VND)(?!{LETTER})"
    # Case-insensitive on purpose, and only on these two: the sibling anchors
    # above always covered uppercase (VNĐ/VND), while "Giá 500 Đ" reported no
    # money at all — so the relational money-loss rule never ran and a bare "đ"
    # reached the voice with ok=True (S4 round 4 finding). ALL-CAPS price copy
    # is ordinary in the sales text this node exists for.
    rf"|(?<=\d)\s*(?i:đ)\b"
    # ...and the same mark standing after a magnitude word ("5 tỷ đ"), which
    # is a price by every reader's eye but had no digit to its left.
    rf"|(?i:{_MAGNITUDE})\s*(?i:đ)\b"
    rf"|(?<=\d)\s*(?i:đồng)\b"
)

# The library writes compound loanwords with hyphens ("ki-lo-met"), and reading
# its own output back splits them again ("ki lo met") — so the hyphen makes the
# function non-idempotent, which AC-7 forbids for a node that sits in every
# chain and may run twice. Settle it here, in the direction the library itself
# converges to.
_LETTER_HYPHEN = re.compile(r"(?<=[^\W\d_])-(?=[^\W\d_])")


@dataclass(frozen=True)
class NormalizeResult:
    """Outcome of one normalisation.

    `ok` is False whenever the text cannot be handed to a voice as-is; `residual`
    then names the exact tokens that stopped it, so the error message can be
    compared as a set rather than searched as a substring.
    """

    ok: bool
    text: str
    residual: tuple[str, ...]
    error: str | None = None
    # STABLE, machine-readable reason for the refusal. `error` is a Vietnamese
    # sentence and is for LOGS ONLY.
    #
    # Scope, stated plainly so the comment does not describe a thing that is not
    # here: today this code is used inside the SDK and its tests, and NOWHERE
    # else. It does not reach a user. The slot's ABI outputs are
    # {success, error, text} with `additionalProperties: false`, so a plugin
    # cannot even emit it. Rendering a refusal in the viewer's own language was
    # narrowed out of this contract on 2026-08-28 (owner, ngả b) and stays open
    # in roadmap item 1.3 — see `_acceptance/chong-doc-sai-em-ru/contract.md`
    # under AC-6 for the two measured blockers. Carrying it to the interface
    # means adding the field to the ABI first, then `pnpm gen:abi` +
    # `gen_models.py`, then an i18n catalogue — in that order.
    code: str | None = None


# The closed set of refusal reasons. Declared here so the test can check the
# relation BOTH ways — every declared code reachable, every produced code
# declared — instead of grepping the source for string literals.
ERROR_EMPTY_INPUT = "EMPTY_INPUT"
ERROR_RESIDUAL_TOKENS = "RESIDUAL_TOKENS"
ERROR_MONEY_UNIT_LOST = "MONEY_UNIT_LOST"

NORMALIZE_ERROR_CODES: frozenset[str] = frozenset(
    {ERROR_EMPTY_INPUT, ERROR_RESIDUAL_TOKENS, ERROR_MONEY_UNIT_LOST}
)


def has_money(text: str) -> bool:
    """True when the text really carries a price.

    Public because the corpus asserts the money relation and must use the SAME
    rule: a test that re-implements it loosely repeats the very bug this
    replaced — `"đ" in text` marks "độ" and "đẹp" as prices.

    Normalizes to NFC first: the `_MONEY` patterns are NFC literals, and this
    runs on the RAW input (before `_pre`'s own NFC step). Without it, an NFD
    string carrying a real price reports no money, and the relational
    money-loss rule below is silently skipped for exactly the inputs macOS
    tools like to produce — measured, S4 round 1 finding.

    Address abbreviations are removed FIRST, for the same reason the pre-pass
    consumes them before the currency rules: "Số 5 Đ. Lê Lợi" carries a digit
    followed by "Đ" and matched the money test, so the relational money-loss
    rule demanded a currency word from an address and rejected it (measured
    while fixing S4 round 6 — the street rewrite alone fixed the OUTPUT but
    left this test reading the raw string).
    """
    return _MONEY.search(unicodedata.normalize("NFC", text)) is not None


def _pre(text: str) -> str:
    # Anchored patterns, never bare str.replace: "VNDirect" must not become
    # "đồngirect" and "H.264" must not become "huyện 264" — both measured,
    # see vi_dictionary's module docstring.
    out = unicodedata.normalize("NFC", text)
    for pattern, dst in ABBREVIATION_PATTERNS:
        out = pattern.sub(dst, out)
    for pattern, dst in PREFIX_PATTERNS:
        out = pattern.sub(dst, out)
    for pattern, dst in CURRENCY_SIGN_PATTERNS:
        out = pattern.sub(dst, out)
    # Fold typographic dashes to ASCII BEFORE any rule that reasons about a
    # dash — the date rule, the range rule and the minus rule are all written
    # for the ASCII spelling. Runs here, ahead of _DASH_DATE, so "19–08–2026"
    # takes the same path as "19-08-2026".
    out = _DASH_FOLD.sub("-", out)
    # Before every digit rule below: lift the decimal part into a word the
    # library can read. Runs early so the range and minus rules downstream see
    # plain digits either side of any dash.
    # Chains first: an enumeration must not reach the decimal rule.
    out = _COMMA_CHAIN.sub(lambda m: m.group(0).replace(",", ", "), out)
    out = _DECIMAL_COMMA.sub(_decimal_tail, out)
    out = _DASH_DATE.sub(r"\1/\2/\3", out)
    out = _DAY_WORD_BEFORE_DATE.sub(_drop_day_word_if_readable, out)
    # ORDER IS LOAD-BEARING: the range rule runs BEFORE the spaced-đồng rewrite.
    # Reversed (as it shipped in 0.2.21) the rewrite turns "1.000 đ" into
    # "1.000 đồng" and destroys the very "đ" the range rule anchors on, so
    # "1.000 đ-2.000 đ" came back as "một nghìn đồng hai nghìn đồng" — range
    # word gone, ok=True, nothing red. Measured, S4 round 3 finding.
    out = _RANGE.sub(lambda m: f"{m.group('unit')} đến ", out)
    out = _SPACED_DONG.sub(" đồng", out)
    # Ranges are resolved first, so any dash still sitting in front of a number
    # is a minus sign. The library reads the digits but leaves the dash, and a
    # voice says nothing at all for it ("-bay do" — measured).
    return _NEGATIVE.sub("âm ", out)


def normalize_vi(text: str) -> NormalizeResult:
    """Read Vietnamese numbers, prices and dates out as words.

    Deterministic: the same input always yields the same bytes, and normalising
    an already-normalised string is a no-op.
    """
    if not text or not text.strip():
        return NormalizeResult(
            ok=False,
            text="",
            residual=(),
            error="Chuỗi vào rỗng — không có gì để đọc",
            code=ERROR_EMPTY_INPUT,
        )

    had_money = has_money(text)
    # Kept, not inlined: the slash rule below has to look at what `_pre`
    # PRODUCED, not at what the user typed. `_pre` rewrites "d-m-y" into
    # "d/m/y", so a dash-written date carries no slash in the raw input at all.
    pre = _pre(text)
    out = _LETTER_HYPHEN.sub(" ", _NORMALIZER.normalize(pre))
    out = unicodedata.normalize("NFC", out)

    residual = tuple(dict.fromkeys(m.group(0) for m in _RESIDUAL.finditer(out)))
    if _COLON_BETWEEN_WORDS.search(out) and _CLOCK_IN.search(text):
        residual = residual + (":",)
    # More slashes survived than the prose put there ⇒ at least one NUMERIC
    # slash came back unread. Counting is what ties the two halves to the same
    # occurrence; a plain `"/" in out` test got this wrong in both directions
    # at once (S4 round 3): it refused a perfectly read date sitting next to
    # "và/hoặc", and it let "Hop dong 12-25-2026" through speaking
    # "mười hai tháng hai/hai nghìn…" with ok=True — the 25 silently gone.
    if out.count("/") > _prose_slash_count(pre):
        residual = residual + ("/",)
    # Relational, like the clock-colon rule above: decided on the INPUT, because
    # the output is lower-cased and the capital that makes "<số> Đ <TênHoa>"
    # ambiguous is gone by then.
    if _AMBIGUOUS_D.search(unicodedata.normalize("NFC", text)):
        residual = residual + ("đ",)
    # Same doctrine, decided on the INPUT for the same reason: the comma is gone
    # from the output, so the shape that made it ambiguous is unreadable there.
    residual = residual + _unreadable_comma_runs(unicodedata.normalize("NFC", text))
    residual = residual + _unreadable_dash_runs(_DASH_FOLD.sub("-", unicodedata.normalize("NFC", text)))
    residual = residual + tuple(dict.fromkeys(_URL.findall(unicodedata.normalize("NFC", text))))
    # Brand tokens only: re-reading the output must change nothing. Costs a
    # second pass, and only for the rare input that carries such a token.
    brands = [t for t in _LATIN_TOKEN.findall(text) if _is_brand_token(t)]
    if brands:
        again = unicodedata.normalize(
            "NFC", _LETTER_HYPHEN.sub(" ", _NORMALIZER.normalize(_pre(out)))
        )
        if again != out:
            residual = residual + tuple(dict.fromkeys(brands))
    if residual:
        return NormalizeResult(
            ok=False,
            text=out,
            residual=residual,
            error="Chưa đọc được: " + ", ".join(residual),
            code=ERROR_RESIDUAL_TOKENS,
        )

    # Relational rule, not an absence rule. Money in must mean money word out:
    # the library drops the currency sign together with the word, and a pure
    # "no digits left" check stays green on exactly that failure.
    if had_money and CURRENCY_WORD not in out:
        return NormalizeResult(
            ok=False,
            text=out,
            residual=("<đơn vị tiền>",),
            error=(
                "Mất đơn vị tiền: chuỗi vào có ký hiệu tiền, "
                "chuỗi ra không có chữ 'đồng'"
            ),
            code=ERROR_MONEY_UNIT_LOST,
        )

    return NormalizeResult(ok=True, text=out, residual=(), error=None)
