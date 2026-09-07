"""Golden corpus and invariants for the Vietnamese reader (AC-2..AC-8).

Every expected string here is what VIETNAMESE says, checked against the pinned
library rather than copied from it. Where the two disagree the fix goes into
tongflow/text/, never into a case: a corpus edited to match the library is a
corpus that can no longer catch the library.
"""

from __future__ import annotations

import re
import sys
import unicodedata

from tongflow.text.normalize_vi import (
    ERROR_EMPTY_INPUT,
    ERROR_MONEY_UNIT_LOST,
    ERROR_RESIDUAL_TOKENS,
    NORMALIZE_ERROR_CODES,
    has_money,
    normalize_vi,
)
from tongflow.text.vi_dictionary import _ABBREVIATIONS, _PREFIXES

# --------------------------------------------------------------------------
# AC-2 — numbers and money, as a full matrix declared BEFORE the cases.
# --------------------------------------------------------------------------

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
    # The two ISO-code spellings, absent from the first corpus — which is
    # exactly why the unanchored "VND" replacement shipped (S4 round 1).
    ("Vé 500.000VND", "vé năm trăm nghìn đồng"),
    ("Giá 2 triệu VNĐ", "giá hai triệu đồng"),
    # Fillers for matrix cells the first corpus left uncovered — surfaced when
    # the coverage claims below became machine-checked (S4 round 1 finding).
    ("35 người", "ba mươi lăm người"),
    ("250 chỗ ngồi", "hai trăm năm mươi chỗ ngồi"),
    ("25 triệu", "hai mươi lăm triệu"),
    ("35 tỷ", "ba mươi lăm tỷ"),
    # Gate-2 scope raise (owner, 2026-08-21): unit-suffixed ranges and the
    # SPACED price form. "1.000₫-2.000₫" silently lost "đến" and "500 đ" was
    # guaranteed ok=False — both measured, S4 round 2 findings.
    ("từ 1.000₫-2.000₫", "từ một nghìn đồng đến hai nghìn đồng"),
    ("50.000đ-70.000đ", "năm mươi nghìn đồng đến bảy mươi nghìn đồng"),
    ("Giá 500 đ", "giá năm trăm đồng"),
)
MONEY_COUNT = 20

# Which matrix cells each case is claimed to cover: (variant, position) means
# the variant word occurs inside that magnitude group of the reading. Written
# by hand, but every claim is MACHINE-CHECKED against the case's expected
# string in the test below — the first version of this dict was self-agreeing
# ("3 tỷ 2" claimed ("mươi","tỷ") while its expected contains no "mươi" at
# all), so coverage was reported for cells nothing exercised (S4 round 1).
MONEY_MATRIX_CELLS: dict[str, tuple[tuple[str, str], ...]] = {
    "41 căn hộ": (("mốt", "chục"),),
    "21 tầng": (("mốt", "chục"),),
    "15 phút": (("lăm", "chục"),),
    "105 m2": (("lẻ", "trăm"),),
    "125.000 đồng": (("lăm", "nghìn"), ("mươi", "nghìn")),
    "1.999.000₫": (("mươi", "nghìn"),),
    "50.000đ": (("mươi", "nghìn"),),
    "35 người": (("mươi", "chục"), ("lăm", "chục")),
    "250 chỗ ngồi": (("mươi", "trăm"),),
    "25 triệu": (("mươi", "triệu"), ("lăm", "triệu")),
    "35 tỷ": (("mươi", "tỷ"), ("lăm", "tỷ")),
}

# Cells the corpus DELIBERATELY does not cover, each for a stated reason —
# either unreachable with the pinned library or descoped. Listed explicitly so
# the matrix stays honest instead of quietly shrinking to whatever the corpus
# happens to cover. NOT a claim of linguistic impossibility: the first version
# claimed ("lăm","triệu") could not exist while "25 triệu" plainly produces it.
#   - linh×*: the pinned library always reads the bridging zero as "lẻ"
#     ("105" → "một trăm lẻ năm", measured), so "linh" is unreachable.
#   - remaining lẻ/mốt/lăm cells: reachable in longer readings (e.g. "121" →
#     "...hai mươi mốt" inside a trăm group) but descoped — the variant words
#     themselves are each exercised elsewhere in the matrix.
DELIBERATELY_UNCOVERED_MONEY_CELLS: frozenset[tuple[str, str]] = frozenset(
    {
        ("linh", "chục"),
        ("linh", "trăm"),
        ("linh", "nghìn"),
        ("linh", "triệu"),
        ("linh", "tỷ"),
        ("lẻ", "chục"),
        ("lẻ", "nghìn"),
        ("lẻ", "triệu"),
        ("lẻ", "tỷ"),
        ("mốt", "trăm"),
        ("mốt", "nghìn"),
        ("mốt", "triệu"),
        ("mốt", "tỷ"),
        ("lăm", "trăm"),
    }
)

_BIG_POSITION_WORDS = ("trăm", "nghìn", "triệu", "tỷ")
_GROUP_WORDS = ("tỷ", "triệu", "nghìn")


def _money_claim_holds(expected: str, variant: str, position: str) -> bool:
    """(variant, position) holds iff the variant word sits INSIDE that
    magnitude group of the reading — not merely somewhere in the string.

    Substring co-presence was the previous check, and it green-lit claims
    like ("mươi","triệu") on '1.999.000₫', whose triệu group is just "một"
    (S4 round 2 finding). Groups are the word runs delimited by tỷ/triệu/
    nghìn; trăm/chục are intra-group shapes, checked as "largest magnitude".
    """
    words = expected.split()
    if position == "chục":
        return variant in words and not any(w in words for w in _BIG_POSITION_WORDS)
    if position == "trăm":
        return (
            variant in words
            and "trăm" in words
            and not any(w in words for w in _GROUP_WORDS)
        )
    if position not in words:
        return False
    p = words.index(position)
    bigger = _GROUP_WORDS[: _GROUP_WORDS.index(position)]
    start = 0
    for i in range(p - 1, -1, -1):
        if words[i] in bigger:
            start = i + 1
            break
    return variant in words[start:p]


def test_numbers_and_money_golden() -> None:
    assert len(CORPUS_MONEY) == MONEY_COUNT

    # The claims must be about cases that exist, and each claim must hold in
    # that case's expected string under GROUP semantics — a dict entry nothing
    # checks is how the self-agreeing matrix shipped.
    expected_by_raw = dict(CORPUS_MONEY)
    orphans = set(MONEY_MATRIX_CELLS) - set(expected_by_raw)
    assert not orphans, f"Ô khai cho ca không còn trong corpus: {sorted(orphans)}"
    for raw, cells in MONEY_MATRIX_CELLS.items():
        for variant, position in cells:
            assert _money_claim_holds(expected_by_raw[raw], variant, position), (
                f"{raw!r} khai ô ({variant}, {position}) nhưng biến thể "
                f"không nằm trong nhóm hàng đó của expected"
            )

    covered = {cell for cells in MONEY_MATRIX_CELLS.values() for cell in cells}
    overlap = covered & DELIBERATELY_UNCOVERED_MONEY_CELLS
    assert not overlap, f"Ô vừa được phủ vừa khai bỏ: {sorted(overlap)}"
    missing = [
        (variant, position)
        for variant in MONEY_VARIANTS
        for position in MONEY_POSITIONS
        if (variant, position) not in covered
        and (variant, position) not in DELIBERATELY_UNCOVERED_MONEY_CELLS
    ]
    assert not missing, f"Ô ma trận chưa có ca nào: {missing}"

    for raw, expected in CORPUS_MONEY:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"




# --------------------------------------------------------------------------
# AC-6 — the currency word must survive a MAGNITUDE WORD between the digit and
# the "đ". Both money rules anchored on a digit immediately left of the "đ", so
# the ordinary sales form "<số> <đơn vị lớn> đ" put a word in between and all
# three layers missed at once: the pre-pass did not rewrite it, has_money() said
# False so the relational rule never ran, and a bare letter is not residual —
# ok=True with the price unspoken (S4 round 5 finding, measured on this branch:
# "Giá 5 tỷ đ" → "giá năm tỷ đ").
#
# Declared as a CLASS, not a case list: {đơn vị lớn} × {dính, có khoảng trắng}.
# The round-4 lesson was that patching only the member that just leaked keeps
# the corpus growing by case while the criterion is written by class.
# --------------------------------------------------------------------------

# "trăm" và "chục" thêm 2026-08-26: chúng vắng mặt nên cả ba lớp cùng trượt —
# `Giá 5 trăm đ` ra "giá năm trăm đ" với ok=True và has_money=False, tức ký hiệu
# tiền đi thẳng tới giọng đọc dưới dạng chữ cái trơ. Đúng lớp lỗi mà chính hằng
# dùng chung này ra đời để đóng ở vòng 5, chỉ khác phần tử.
MAGNITUDE_WORDS = ("nghìn", "ngàn", "triệu", "tỷ", "tỉ", "trăm", "chục")
DONG_SPACING = ("dính", "có khoảng trắng")

MAGNITUDE_DONG_MATRIX: dict[tuple[str, str], tuple[str, str]] = {
    ("nghìn", "có khoảng trắng"): ("Giá 5 nghìn đ", "giá năm nghìn đồng"),
    ("ngàn", "có khoảng trắng"): ("Giá 5 ngàn đ", "giá năm ngàn đồng"),
    ("triệu", "có khoảng trắng"): ("Giá 500 triệu đ", "giá năm trăm triệu đồng"),
    ("tỷ", "có khoảng trắng"): ("Giá 5 tỷ đ", "giá năm tỷ đồng"),
    ("tỉ", "có khoảng trắng"): ("Giá 5 tỉ đ", "giá năm tỉ đồng"),
    ("nghìn", "dính"): ("Giá 5 nghìnđ", "giá năm nghìn đồng"),
    ("ngàn", "dính"): ("Giá 5 ngànđ", "giá năm ngàn đồng"),
    ("triệu", "dính"): ("Giá 500 triệuđ", "giá năm trăm triệu đồng"),
    ("tỷ", "dính"): ("Giá 5 tỷđ", "giá năm tỷ đồng"),
    ("tỉ", "dính"): ("Giá 5 tỉđ", "giá năm tỉ đồng"),
    ("trăm", "có khoảng trắng"): ("Giá 5 trăm đ", "giá năm trăm đồng"),
    ("chục", "có khoảng trắng"): ("Giá 2 chục đ", "giá hai chục đồng"),
    ("trăm", "dính"): ("Giá 5 trămđ", "giá năm trăm đồng"),
    ("chục", "dính"): ("Giá 2 chụcđ", "giá hai chục đồng"),
}


def test_both_money_rules_read_the_same_magnitude_list() -> None:
    """The two rules must not drift apart — the comment claims they cannot.

    `_MAGNITUDE` says it exists so "the pre-pass, the money test and any later
    rule cannot drift apart the way the unit LIST did for ranges in round 4".
    A comment cannot enforce that; this does. The first version of the rule
    re-listed the five words inline in `_SPACED_DONG`, so adding a word made
    has_money() say True while the rewrite left the bare mark alone
    (S4 round 6 finding).
    """
    from tongflow.text.normalize_vi import (
        _MAGNITUDE,
        _MAGNITUDE_BEHIND,
        _MAGNITUDE_WORDS,
        _MONEY,
        _SPACED_DONG,
    )

    assert _MAGNITUDE_WORDS, "danh sách đơn vị lớn rỗng — phép đo mất đối tượng"
    for word in _MAGNITUDE_WORDS:
        assert f"(?<={word})" in _MAGNITUDE_BEHIND, (
            f"{word!r} có trong hằng nhưng không vào mẫu tiền xử lý"
        )
        assert word in _MAGNITUDE, f"{word!r} không vào mẫu nhận diện tiền"
        assert f"(?<={word})" in _SPACED_DONG.pattern, (
            f"{word!r} không vào luật viết lại — nó sẽ được nhận là tiền "
            f"nhưng không bao giờ được đọc thành chữ"
        )
        assert word in _MONEY.pattern, f"{word!r} không vào luật nhận diện tiền"

    # ...and nothing was hand-added to either rule outside the shared list.
    import re as _re

    behind_in_rule = set(_re.findall(r"\(\?<=([^)]+)\)", _SPACED_DONG.pattern))
    # Hoisted out of the f-string: a backslash inside the expression part is a
    # SyntaxError on Python 3.10 (CI) even though 3.12+ accepts it — measured on
    # the PR #77 merge run.
    stray_anchors = sorted(behind_in_rule - set(_MAGNITUDE_WORDS) - {"\\d"})
    assert behind_in_rule <= set(_MAGNITUDE_WORDS) | {"\\d"}, (
        f"luật viết lại có mỏ neo không đến từ hằng dùng chung: {stray_anchors}"
    )


def test_currency_word_survives_magnitude_word() -> None:
    missing = [
        (word, spacing)
        for word in MAGNITUDE_WORDS
        for spacing in DONG_SPACING
        if (word, spacing) not in MAGNITUDE_DONG_MATRIX
    ]
    assert not missing, f"Ô ma trận chưa có ca nào: {missing}"

    for (word, spacing), (raw, expected) in MAGNITUDE_DONG_MATRIX.items():
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} ({word}, {spacing}) → {got.error}"
        assert got.text == expected, (
            f"{raw!r} ({word}, {spacing}): mong {expected!r}, nhận {got.text!r}"
        )
        # The point of the criterion, stated separately so a wrong expected
        # string cannot hide a MISSING currency word behind a diff.
        assert "đồng" in got.text, (
            f"{raw!r} ({word}, {spacing}) mất chữ tiền: {got.text!r}"
        )

    # Uppercase carries too — the sibling anchors already did (AC-6 amendment).
    for raw, expected in (
        ("Giá 5 TỶ Đ", "giá năm tỷ đồng"),
        ("GIÁ 500 TRIỆU Đ", "giá năm trăm triệu đồng"),
    ):
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert "đồng" in got.text, f"{raw!r} mất chữ tiền: {got.text!r}"


# --------------------------------------------------------------------------
# AC-6 — "Đ." is the standard Vietnamese abbreviation for Đường (street), and
# the round-4 amendment that made the currency mark case-insensitive turned
# every address carrying it into a price: "Số 5 Đ. Lê Lợi" read out as "số năm
# đồng. lê lợi" with ok=True (S4 round 6 finding, measured on this branch).
#
# Both guards were blind BY DESIGN: nothing numeric survived for the residual
# check, and the money-loss relation found the very "đồng" the rewrite had just
# injected — it confirmed itself. Addresses are first-class input here: the
# dictionary already expands Q., P., TP. for exactly this domain.
#
# Fixed where the sibling abbreviations live, not in the currency rules: the
# prefix pass runs BEFORE them, so it consumes the address form first.
# --------------------------------------------------------------------------

# Only the DOTTED form is unambiguous. "Đ." is never a currency mark, so it can
# be expanded with confidence.
# There is NO street rule any more, and no test asserts one.
#
# Three attempts to tell "<số> đ <từ>" apart each failed on a signal that turned
# out not to exist: letter case (round 6), the dot (round 11), a capital after
# the dot (round 13). The dot was the sharpest lesson — it is a SENTENCE period
# as often as an abbreviation mark, so "Giá 500 đ. Bao gồm VAT" read out as
# "giá năm trăm ĐƯỜNG bao gồm…" with ok=True, while "Số 5 đ. lê lợi" (lowercase
# street name) fell through to the money rule and read "đồng".
#
# Vietnamese uses this exact shape for both a price and an address; only MEANING
# separates them. So the reader refuses the whole family. A refused sentence is
# visible to the user; a price spoken as a street name is not.
CORPUS_AMBIGUOUS_D: tuple[str, ...] = (
    # giá mà luật đường từng đọc thành địa chỉ
    "Giá 500 đ. Bao gồm VAT",
    "Tổng cộng 1.999.000 đ. Thanh toán khi nhận hàng",
    "Giá 2 triệu đ. Liên hệ ngay",
    "Giá 1.999.000 Đ Bao gồm VAT",
    "Chỉ 500 Đ Thôi",
    # địa chỉ mà luật tiền từng đọc thành giá
    "Số 5 đ. lê lợi",
    "Nhà 12 Đ Trần Phú",
    # ...và ca mà luật cũ ĐỌC ĐÚNG. Mất nó là cái giá đã khai để không bao giờ
    # đọc sai hai nhóm trên.
    "Số 5 Đ. Lê Lợi",
    # THE SAME two addresses as above, only the separator differs. The refusal
    # rule anchored on `[ \t]` while the two money rewrites it must veto anchor
    # on `\s`, so every separator that is not a space or a tab leaked: the four
    # rows below used to read "số năm đồng. lê lợi" / "nhà mười hai đồng trần
    # phú" with ok=True and nothing red (S4 round 17). This is the RED direction
    # of the shared _SEP constant.
    "Số 5 Đ.\nLê Lợi",
    "Số 5 Đ.\xa0Lê Lợi",
    "Số 5 Đ.Lê Lợi",
    "Nhà 12 Đ\xa0Trần Phú",
    # Vietnamese street names are often NUMBERS (Đường 3/2, Đường 30/4, Đường
    # 2/9 are major streets in HCMC, Cần Thơ, Đà Nẵng), and an address can be
    # followed by a comma. The letter-only lookahead read all four of these as
    # prices with ok=True and an empty residual — "Số 25 Đ. 3/2, Q.10" came out
    # "số hai mươi lăm đồng. ba tháng hai, quận mười" (S4 round 19; owner
    # widened the refusal 2026-08-27). RED direction of the digit/comma
    # lookahead.
    "Số 25 Đ. 3/2, Q.10",
    "Nhà 12 Đ. 30/4",
    "Địa chỉ 5 Đ. 2/9 Đà Nẵng",
    "Số 25 Đ, Q.1",
)

# The price forms the street rule must NOT eat. Two of them are the very cases
# the round-4 uppercase amendment was raised for, so this is also its regression
# pin: narrowing "Đ" must never cost them.
CORPUS_MONEY_MARK_UNAMBIGUOUS: tuple[tuple[str, str], ...] = (
    ("Giá 500 Đ", "giá năm trăm đồng"),
    ("Giá 5 tỷ đ", "giá năm tỷ đồng"),
    # Positive anchors for the 2026-08-27 widening: end of string and a slash
    # are still read. Refusing at end of string would take the commonest price
    # spelling of all with it, so that position stays out of the refusal.
    ("Giá 500 đ", "giá năm trăm đồng"),
    ("Tổng 2.000 đ.", "tổng hai nghìn đồng."),
)


# The ISO-code spellings are case-insensitive like their sibling "đ".
#
# Round 4 made the bare mark case-insensitive because "ALL-CAPS price copy is
# ordinary in the sales text this node exists for"; VNĐ/VND kept case-SENSITIVE
# anchors, so lowercase copy turned the money relation off entirely. Measured on
# this branch: has_money() was False for every lowercase spelling, which means
# the relational money-loss guard never ran for any of them — two of the four
# still read correctly, but only because the pinned library happened to expand
# them. "Giá 2 triệu vnđ" did not: it reached the voice as "giá hai triệu vnđ"
# with ok=True (S4 round 7 finding, corrected — the finding listed four broken
# cases, two of which were already fine; what was actually broken was the GUARD
# being blind, and one reading with it).
CORPUS_MONEY_LOWERCASE_ISO: tuple[tuple[str, str], ...] = (
    ("Giá 2 triệu vnđ", "giá hai triệu đồng"),
    ("Giá 500.000 vnd", "giá năm trăm nghìn đồng"),
    ("Vé 500.000Vnd", "vé năm trăm nghìn đồng"),
    ("Giá 1.999.000 Vnđ", "giá một triệu chín trăm chín mươi chín nghìn đồng"),
)

# The brand token that must not be read as money: an unanchored replacement
# turned "VNDirect" into "đồngirect" in round 1, and lowering the case must not
# re-open that — in EITHER case now that the anchors ignore case.
#
# The expected strings PIN A KNOWN LIMIT, not desired output: the pinned library
# mangles the brand token to "ndi re" on its own, and it did so before this
# change too (measured on the committed tree while writing this). The existing
# brand test only asserts that "đồng" is absent, which stays green through that
# mangling — so this is the first place the real reading is visible. If a
# library bump fixes it, this test goes RED and the Known limits section must be
# updated with it, rather than the expectation being edited to match.
CORPUS_MONEY_LOWERCASE_ISO_NEGATIVE: tuple[tuple[str, str], ...] = (
    ("Mua qua VNDirect", "mua qua ndi re"),
    ("mua qua vndirect", "mua qua ndi re"),
)


def test_iso_currency_codes_are_case_insensitive() -> None:
    for raw, expected in CORPUS_MONEY_LOWERCASE_ISO:
        assert has_money(raw), (
            f"{raw!r}: luật quan hệ tắt — mọi cách đọc sai sau đó đều đi qua êm ru"
        )
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"

    for raw, expected in CORPUS_MONEY_LOWERCASE_ISO_NEGATIVE:
        got = normalize_vi(raw)
        # Content claim, not an acceptance claim: the brand token must not turn
        # into a currency reading. Since 2026-08-27 the capitalised spelling is
        # refused by name (AC-4) — a stronger outcome than reading it — so the
        # verdict is deliberately not asserted here.
        assert got.text == expected, (
            f"{raw!r} (ca ÂM, tên thương hiệu): mong {expected!r}, nhận {got.text!r}"
        )


def test_number_dash_number_that_is_not_a_range() -> None:
    """A run that loses digits when read as a range must be refused, by name."""
    for kind, raw, run in CORPUS_DASH_REFUSED:
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"[{kind}] {raw!r}: đọc thành khoảng làm MẤT chữ số, phải TỪ CHỐI — "
            f"nhận ok=True -> {got.text!r}"
        )
        assert run in got.residual, (
            f"[{kind}] {raw!r}: từ chối nhưng không nêu TÊN cụm ({run!r} không "
            f"có trong {got.residual})"
        )


# A SURVIVING SLASH means the library gave up on that token, so the output is a
# half-reading. Both criteria land here: a price written "đ/kg" (AC-10) and a
# date the library could not parse (AC-9) leave the same character behind, which
# is exactly why a post-check watching only digits was blind to both.
CORPUS_SLASH_REFUSED: tuple[tuple[str, str], ...] = (
    ("giá theo đơn vị", "Giá 50.000 đ/kg"),
    ("lãi theo năm", "Lãi 5%/năm"),
    ("giá theo lít", "Giá 20.000 ₫/lít"),
    ("ngày kiểu Mỹ", "ngày 12/25/2026"),
    ("ngày không tồn tại", "ngày 32/8/2026"),
    ("ngày kiểu Mỹ, không có chữ ngày", "12/25/2026"),
    # The SAME mis-parse written with dashes. `_pre` rewrites "d-m-y" into
    # "d/m/y", so these carry no slash in the raw input at all — a rule that
    # asked the RAW input whether a numeric slash existed let every one of them
    # through speaking a wrong date with ok=True (S4 round 3). They are also
    # invisible to the dash-run rule, which deliberately masks `_DASH_DATE`
    # matches, so this family has exactly one net left.
    ("ngày kiểu Mỹ viết bằng gạch ngang", "Hop dong 12-25-2026 co hieu luc"),
    ("cùng ca, gạch en", "Hop dong 12–25–2026"),
    ("ngày có nhóm 0 đứng đầu, gạch ngang", "Han 00-12-2026"),
)

# ...and the slashes that must NOT be flagged. Two different reasons, both real:
#
#  - the library reads some of them into words ("100km/h"), so no slash survives;
#  - ordinary prose slashes were never a number, and a rule watching only the
#    OUTPUT refused all of them. Measured at S4 round 2: "và/hoặc", "TP/HCM",
#    "nam/nữ", "N/A" every one came back ok=False naming "/" while the speech
#    string was already correct. A false refusal blocks the whole voice chain
#    over text carrying no number at all, so these carry the same weight as the
#    positive cases.
CORPUS_SLASH_NEGATIVE: tuple[tuple[str, str], ...] = (
    ("Tốc độ 100km/h", "tốc độ một trăm ki lô mét trên giờ"),
    ("Giá 5/3 triệu", "giá năm tháng ba triệu"),
    ("và/hoặc là được", "và/hoặc là được"),
    # Measured, not guessed: the library spells the letters out rather than
    # expanding the abbreviation. Either reading is speakable; what matters for
    # AC-10 is that it is NOT refused.
    ("TP/HCM đông quá", "tê pê/hát xê em đông quá"),
    ("Giới tính nam/nữ", "giới tính nam/nữ"),
    ("Trạng thái N/A", "trạng thái n/a"),
    # BOTH families in one string. The date reads perfectly and only the prose
    # slash survives, so refusing here fails a whole voice chain over text that
    # was read correctly. Testing the two halves independently over the whole
    # string did exactly that (S4 round 3) — the corpus had no mixed case, so
    # 37 tests stayed green over it.
    (
        "Ngày 19/8/2026 và/hoặc thứ hai",
        "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu và/hoặc thứ hai",
    ),
    ("Giá 5 triệu, nam/nữ đều được", "giá năm triệu, nam/nữ đều được"),
)

# ---------------------------------------------------------------------------
# DECLARED LIMITS, pinned so they cannot rot.
#
# A limit written in the contract and nowhere else is a claim nobody re-checks:
# the day a library bump or a rule change closes it, the file keeps confessing
# to a defect that no longer exists, and the next reader trusts a lie. So each
# declared limit is measured HERE with its today-behaviour, and the test goes
# red when the limit HEALS — that red is the reminder to delete it from the
# contract. Same shape as `test_idempotence_exclusions_are_still_broken`.
#
# Root cause of all four, written once: `_NUM_LEFT_OF_SLASH` is a LEXICAL guess
# about what standing next to a slash makes it a number. It cannot see that
# "100đ" (no space before đ) is money, that "/home" is a path, or that a domain
# is a domain. Closing these needs a token classifier — money / unit / path /
# idiom — which is a contract of its own, not a fifth patch to this regex
# (owner, 2026-08-28, after four rounds each fixing a different wrong scope).

# AC-10: two slash families the rule reads instead of refusing.
CORPUS_SLASH_KNOWN_LIMIT: tuple[tuple[str, str, str], ...] = (
    (
        "hai họ gạch chéo triệt tiêu nhau",
        "Tốc độ 100km/h, lãi 5%/năm",
        "tốc độ một trăm ki lô mét trên giờ, lãi năm phần trăm/năm",
    ),
    (
        "tiền không dấu cách, trộn hai họ",
        "Giá 100đ/kg và/hoặc 200đ/lít",
        "giá một trăm đồng/kg và/hoặc hai trăm đồng/lít",
    ),
)

# AC-2: the "đường dẫn" half. A scheme or a `www.` prefix is recognised; a bare
# path and a schemeless domain are not, and their raw slashes reach the voice.
CORPUS_PATH_KNOWN_LIMIT: tuple[tuple[str, str, str], ...] = (
    ("đường dẫn trần", "Mở /home/user/file.txt", "mở /hôm/u xơ/phai.txt"),
    (
        "tên miền không có scheme",
        "Truy cập oneflow.vn/gia",
        "truy cập o nép lô.vn/gia",
    ),
)


# Two more, found at S4 round 5. They sit on DIFFERENT tiers and the file says
# so, because "reads instead of refusing" covers two very unlike harms:
#
#   MẤT DỮ LIỆU  — the reading itself is WRONG. Heaviest tier; this is the exact
#                  shape the whole contract exists to prevent, and it is declared
#                  rather than closed only because closing it needs the token
#                  classifier (see the root note above).
#   TỪ CHỐI OAN  — the reading is CORRECT and we refuse anyway. Blocks the voice
#                  chain, but never speaks anything false.
CORPUS_DATA_LOSS_KNOWN_LIMIT: tuple[tuple[str, str, str], ...] = (
    (
        "ngày nửa-đọc lọt khi câu còn một gạch chéo văn xuôi BỊ NUỐT",
        "ngày 12/25/2026, tốc độ 100km/h",
        "ngày mười hai tháng hai/hai nghìn không trăm hai mươi sáu, "
        "tốc độ một trăm ki lô mét trên giờ",
    ),
)

CORPUS_FALSE_REFUSAL_KNOWN_LIMIT: tuple[tuple[str, str, str], ...] = (
    (
        "khoảng thập phân dùng DẤU PHẨY",
        "Giá 1,05-2,5 triệu",
        "giá một phẩy không năm đến hai phẩy năm triệu",
    ),
)


def test_data_loss_limit_is_still_broken() -> None:
    """The heaviest declared limit, pinned so it cannot rot unnoticed.

    Unlike the others this one SPEAKS A WRONG READING: the 25 is gone and the
    month is read as 2. It is here, and not in the code, only because the owner
    ruled at round 5 that closing it needs the token classifier — a contract of
    its own. Anyone who makes this go green has fixed a real defect and must
    delete this block along with the contract entry.
    """
    for kind, raw, today in CORPUS_DATA_LOSS_KNOWN_LIMIT:
        got = normalize_vi(raw)
        assert got.ok is True, (
            f"[{kind}] {raw!r} NAY ĐÃ BỊ TỪ CHỐI — giới hạn MẤT DỮ LIỆU đã đóng. "
            f"Gỡ nó khỏi contract §Known limits và khỏi corpus này."
        )
        assert got.text == today, (
            f"[{kind}] {raw!r}: hành vi đã đổi — mong {today!r}, nhận {got.text!r}"
        )


def test_false_refusal_limit_is_still_broken() -> None:
    """A refusal we know is wrong: the reading was already correct."""
    for kind, raw, correct_reading in CORPUS_FALSE_REFUSAL_KNOWN_LIMIT:
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"[{kind}] {raw!r} NAY ĐÃ ĐỌC ĐƯỢC — giới hạn đã lành, gỡ khỏi "
            f"contract §Known limits và khỏi corpus này."
        )
        assert got.text == correct_reading, (
            f"[{kind}] {raw!r}: bản đọc bị từ chối lẽ ra ĐÚNG — mong "
            f"{correct_reading!r}, nhận {got.text!r}"
        )


def test_declared_limits_are_still_broken() -> None:
    """A declared limit that has quietly healed is a lie in the contract."""
    for kind, raw, today in CORPUS_SLASH_KNOWN_LIMIT + CORPUS_PATH_KNOWN_LIMIT:
        got = normalize_vi(raw)
        assert got.ok is True, (
            f"[{kind}] {raw!r} NAY ĐÃ BỊ TỪ CHỐI — giới hạn đã lành. Gỡ nó khỏi "
            f"contract §Known limits và khỏi corpus này, đừng để hồ sơ nhận một "
            f"khuyết tật không còn tồn tại. residual={got.residual}"
        )
        assert got.text == today, (
            f"[{kind}] {raw!r}: hành vi hôm nay đã đổi — mong {today!r}, "
            f"nhận {got.text!r}. Cập nhật cả contract lẫn dòng này."
        )


# The written "ngày" must SURVIVE when the date is not readable — dropping it was
# how a half-parsed date lost a field silently.
CORPUS_DAY_WORD_KEPT: tuple[tuple[str, str], ...] = (
    ("ngày 12/25/2026", "ngày"),
    ("ngày 32/8/2026", "ngày"),
)


def test_surviving_slash_is_refused() -> None:
    for kind, raw in CORPUS_SLASH_REFUSED:
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"[{kind}] {raw!r}: dấu gạch chéo còn sót là token CHƯA ĐỌC ĐƯỢC, "
            f"phải TỪ CHỐI — nhận ok=True -> {got.text!r}"
        )
        assert "/" in got.residual, (
            f"[{kind}] {raw!r}: từ chối nhưng không nêu dấu gạch chéo: {got.residual}"
        )


def test_readable_slash_is_not_flagged() -> None:
    for raw, expected in CORPUS_SLASH_NEGATIVE:
        got = normalize_vi(raw)
        assert got.ok is True, (
            f"{raw!r} (ca ÂM): thư viện ĐỌC ĐƯỢC dấu gạch chéo này, không được "
            f"từ chối — {got.error}"
        )
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"


def test_day_word_survives_an_unreadable_date() -> None:
    """AC-9 in full, not just its first word.

    The single `startswith` assert this used to carry passed on `text="ngày"`
    alone, and passed on ok=True with a mis-read date — while E6's other test
    (`test_datetime_golden`) only carries VALID dates. So the half AC-9 calls its
    core, "refuse and name the token rather than swallow a date component", was
    in no test E6 ran; it lived only in a test belonging to AC-10 (S4 round 6).
    """
    for raw, word in CORPUS_DAY_WORD_KEPT:
        got = normalize_vi(raw)
        assert got.text.startswith(word), (
            f"{raw!r}: chữ {word!r} bị nuốt dù ngày không đọc được — đó là cách "
            f"một thành phần của ngày biến mất trong im lặng: {got.text!r}"
        )
        assert got.ok is False, (
            f"{raw!r}: ngày KHÔNG đọc được mà vẫn ok=True — chữ {word!r} còn "
            f"đó không cứu được gì nếu chuỗi vẫn được gửi cho giọng đọc: "
            f"{got.text!r}"
        )
        assert got.residual, (
            f"{raw!r}: từ chối mà không NÊU TÊN cụm nào — người dùng không biết "
            f"sửa gì"
        )
        assert got.text != word, (
            f"{raw!r}: đầu ra chỉ còn đúng chữ {word!r}, phần ngày biến mất hẳn"
        )


# A brand token that reads differently on every pass is not being read at all.
# Refused BY NAME rather than excluded from the idempotence sweep, which is where
# "VNDirect" used to hide (AC-4).
CORPUS_BRAND_REFUSED: tuple[tuple[str, str], ...] = (
    ("Công ty VNDirect niêm yết", "VNDirect"),
    ("Mua qua VNDirect", "VNDirect"),
)

# ...and the Latin tokens the library reads STABLY, which must keep reading.
CORPUS_BRAND_NEGATIVE: tuple[tuple[str, str], ...] = (
    ("Mã VNDS hôm nay", "mã vê en đê ét hôm nay"),
    ("Dùng iPhone 15", "dùng ai phôn mười lăm"),
)

# A URL does not read badly — it DISAPPEARS, taking the sentence's subject with
# it (AC-2).
CORPUS_URL_REFUSED: tuple[tuple[str, str], ...] = (
    ("Xem tại https://oneflow.vn/gia nhé", "https://oneflow.vn/gia"),
    ("Vào www.oneflow.vn xem", "www.oneflow.vn"),
)


def test_unstable_brand_token_is_refused_by_name() -> None:
    for raw, token in CORPUS_BRAND_REFUSED:
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"{raw!r}: token đọc lại ra KHÁC là token chưa đọc được, phải TỪ "
            f"CHỐI — nhận ok=True -> {got.text!r}"
        )
        assert token in got.residual, (
            f"{raw!r}: từ chối nhưng không nêu tên token: {got.residual}"
        )


def test_stable_latin_token_still_reads() -> None:
    for raw, expected in CORPUS_BRAND_NEGATIVE:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} (ca ÂM) bị từ chối: {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"


def test_url_is_refused_by_name() -> None:
    for raw, url in CORPUS_URL_REFUSED:
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"{raw!r}: địa chỉ web BIẾN MẤT khỏi câu, phải TỪ CHỐI — nhận "
            f"ok=True -> {got.text!r}"
        )
        assert url in got.residual, (
            f"{raw!r}: từ chối nhưng không nêu địa chỉ: {got.residual}"
        )


def test_refusal_paths_return_stable_codes() -> None:
    """Two-way: nothing produced is undeclared, nothing declared is dead.

    The set is what a user-facing message is rendered FROM (AC-6), so a code
    that no path produces would be a translation key nobody can ever see, and a
    code produced but undeclared would reach the UI with no sentence attached.
    """
    produced: dict[str, str] = {}
    for raw, _ in ALL_CORPUS:
        got = normalize_vi(raw)
        if got.code:
            produced.setdefault(got.code, raw)
    for raw in ("", "   "):
        got = normalize_vi(raw)
        if got.code:
            produced.setdefault(got.code, raw)

    undeclared = sorted(set(produced) - NORMALIZE_ERROR_CODES)
    assert undeclared == [], (
        f"mã lỗi sinh ra nhưng không khai trong NORMALIZE_ERROR_CODES: {undeclared}"
    )
    assert {ERROR_EMPTY_INPUT, ERROR_RESIDUAL_TOKENS} <= set(produced), (
        "hai mã này phải đạt tới bằng đầu vào THẬT trong corpus, không phải bằng "
        f"phép nhiễu — hiện đạt tới: {sorted(produced)}"
    )

    # MONEY_UNIT_LOST is a BACKSTOP, and saying so out loud is the point: the
    # currency pre-pass always injects the word, so no natural input reaches it.
    # A guard nobody has ever seen fire is indistinguishable from a dead one, so
    # it is proven here by removing the pre-pass it backs up.
    # `import tongflow.text.normalize_vi as module` binds the FUNCTION, not the
    # module: the package re-exports normalize_vi under the same name, so the
    # attribute lookup wins. Reach the module object through sys.modules.
    import sys

    module = sys.modules["tongflow.text.normalize_vi"]

    saved = module.CURRENCY_SIGN_PATTERNS
    module.CURRENCY_SIGN_PATTERNS = ()
    try:
        hurt = normalize_vi("Tổng 1.999.000₫")
    finally:
        module.CURRENCY_SIGN_PATTERNS = saved
    assert hurt.code == ERROR_MONEY_UNIT_LOST, (
        "gỡ bước tiền xử lý ký hiệu tiền mà lưới chặn mất-đơn-vị-tiền KHÔNG bắn "
        f"— nó đã chết: nhận code={hurt.code!r}, ok={hurt.ok}"
    )

    dead = sorted(NORMALIZE_ERROR_CODES - set(produced) - {ERROR_MONEY_UNIT_LOST})
    assert dead == [], f"mã khai nhưng không đường nào sinh ra: {dead}"


def test_every_refusal_carries_a_code() -> None:
    """A refusal with no code cannot be shown to a non-Vietnamese user."""
    for raw, _ in ALL_CORPUS:
        got = normalize_vi(raw)
        if got.ok is False:
            assert got.code in NORMALIZE_ERROR_CODES, (
                f"{raw!r}: bị từ chối nhưng không mang mã máy đọc được "
                f"(code={got.code!r}) — câu lỗi sẽ không dịch được"
            )


# THE TYPOGRAPHIC-DASH MATRIX — 3 dash characters × 3 roles, declared before the
# cases. The claim is a RELATION, not a literal: a typographic dash must read
# EXACTLY like its ASCII spelling, so the expectation is computed from the ASCII
# twin rather than retyped. A literal table would let both halves drift together.
#
# Measured before the fold, every one ok=True with an empty residual:
#   "Giá 5–10 triệu" -> "giá năm THÁNG mười triệu"   (read as a date)
#   "Giá 5%–10%"     -> "giá năm phần trăm mười phần trăm"  ("đến" gone)
#   "Nhiệt độ −7 độ" -> "nhiệt độ -bảy độ"  (the dash reached the speech)
# The character axis is read out of the IMPLEMENTATION, not retyped. A fourth
# typographic dash added to `_TYPOGRAPHIC_DASHES` without cases is then red by
# name, instead of a matrix that quietly stays "complete" because it was
# generated from its own axis (S4 round 4 finding: the cells were built by a
# comprehension over DASH_CHARS × DASH_ROLES and then asserted against those
# same two dicts, so `missing` was the empty list by construction and no change
# whatsoever could turn the measure red).
DASH_CHARS: dict[str, str] = {
    unicodedata.name(ch).split()[0].lower(): ch
    for ch in sys.modules["tongflow.text.normalize_vi"]._TYPOGRAPHIC_DASHES
}
DASH_ROLES: dict[str, str] = {
    "khoảng số": "Giá 5{d}10 triệu",
    "khoảng có đơn vị": "Giá 5%{d}10%",
    "âm": "Nhiệt độ {d}7 độ",
}

# WRITTEN OUT, one line per cell — deliberately not a comprehension. This is the
# case list the completeness assert measures; generating it from the axes is
# what made that assert vacuous. Deleting a line here is red by name.
TYPOGRAPHIC_DASH_MATRIX: dict[tuple[str, str], str] = {
    ("en", "khoảng số"): "Giá 5\u201310 triệu",
    ("en", "khoảng có đơn vị"): "Giá 5%\u201310%",
    ("en", "âm"): "Nhiệt độ \u20137 độ",
    ("em", "khoảng số"): "Giá 5\u201410 triệu",
    ("em", "khoảng có đơn vị"): "Giá 5%\u201410%",
    ("em", "âm"): "Nhiệt độ \u20147 độ",
    ("minus", "khoảng số"): "Giá 5\u221210 triệu",
    ("minus", "khoảng có đơn vị"): "Giá 5%\u221210%",
    ("minus", "âm"): "Nhiệt độ \u22127 độ",
}

# Compound words are the case the fold must NOT touch: the library writes real
# Vietnamese compounds with a hyphen ("ki-lô-mét"), and an earlier residual rule
# that flagged those rejected correct output.
CORPUS_DASH_NEGATIVE: tuple[tuple[str, str], ...] = (
    ("Quãng ki-lô-mét", "quãng ki lô mét"),
    ("Quãng ki\u2013lô\u2013mét", "quãng ki lô mét"),
    ("Đường Hai-Bà-Trưng", "đường hai bà trưng"),
)


# Every cell of the dash matrix has a case today. The mapping is declared empty
# rather than omitted so the shape matches its sibling matrices: the day a cell
# becomes genuinely unreachable, there is an obvious place to name it and a
# reason to write, instead of a row quietly going missing.
DELIBERATELY_UNCOVERED_DASH_CELLS: dict[tuple[str, str], str] = {}


def test_dash_matrix_has_no_silently_empty_cell() -> None:
    missing = [
        (d, r)
        for d in DASH_CHARS
        for r in DASH_ROLES
        if (d, r) not in TYPOGRAPHIC_DASH_MATRIX
        and (d, r) not in DELIBERATELY_UNCOVERED_DASH_CELLS
    ]
    assert missing == [], f"ô ma trận gạch kiểu chữ còn trống: {missing}"

    # ...and the other way. A case for a character the implementation no longer
    # folds is a case measuring nothing, and it would otherwise sit here looking
    # like coverage.
    stray = [
        (d, r) for (d, r) in TYPOGRAPHIC_DASH_MATRIX if d not in DASH_CHARS
    ]
    assert stray == [], (
        f"ma trận có ô cho ký tự mà bản cài đặt không còn gấp: {stray}"
    )


def test_typographic_dashes_read_as_ascii() -> None:
    """Relation, not literal: the typographic twin must equal the ASCII one."""
    for (dash_name, role_name), raw in sorted(TYPOGRAPHIC_DASH_MATRIX.items()):
        ascii_twin = DASH_ROLES[role_name].format(d="-")
        want = normalize_vi(ascii_twin)
        assert want.ok is True, (
            f"ca ASCII đối chứng {ascii_twin!r} tự nó đã hỏng — {want.error}"
        )
        got = normalize_vi(raw)
        assert got.ok is True, (
            f"ô ({dash_name}, {role_name}) — {raw!r} bị từ chối: {got.error}"
        )
        assert got.text == want.text, (
            f"ô ({dash_name}, {role_name}) — {raw!r} đọc KHÁC bản ASCII "
            f"{ascii_twin!r}: nhận {got.text!r}, mong {want.text!r}"
        )


def test_compound_word_hyphen_is_not_a_range() -> None:
    for raw, expected in CORPUS_DASH_NEGATIVE:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} (ca ÂM) bị từ chối: {got.error}"
        assert got.text == expected, (
            f"{raw!r} (ca ÂM, từ ghép): mong {expected!r}, nhận {got.text!r}"
        )
        assert "đến" not in got.text, (
            f"{raw!r}: từ ghép bị đọc thành khoảng — {got.text!r}"
        )


# THE DICTIONARY COVERAGE MATRIX — one positive and one negative case for EVERY
# entry, with the subject set read off the DICTIONARY ITSELF. Adding an entry to
# vi_dictionary.py without adding cases turns this red by name; a hand-copied
# list of entries could not do that, and 6 of the 11 entries had no case at all
# until this matrix existed.
#
# The negative half is what proves the letter anchor does anything: "VNDirect"
# became "đồngirect" and "H.264" became "huyện 264" precisely because an entry
# was matched without one.
DICT_ABBREV_MATRIX: dict[str, tuple[str, str]] = {
    src: (f"Địa chỉ ở {src} hôm nay", f"Mã X{src}Y hôm nay")
    for src, _dst in _ABBREVIATIONS
}

DICT_PREFIX_MATRIX: dict[str, tuple[str, str]] = {
    src: (
        f"Ở {src}7 hôm nay" if src in ("Q.", "P.") else f"Ở {src}Bến Nghé hôm nay",
        f"Ở {src}abc hôm nay",
    )
    for src, _dst, _rule in _PREFIXES
}


def test_dictionary_matrix_covers_every_entry() -> None:
    """Each generated case must actually CONTAIN the entry it claims to cover.

    Deriving the cases from the dictionary is the point — add an entry and it is
    covered automatically — so "is every entry a key?" is an identity and cannot
    fail (S4 round 5 finding). The relation that CAN fail is the one below: a
    template edit that stops embedding `src` leaves a case that runs, passes, and
    measures a different string than the entry it is filed under. The prefix
    templates already branch on `src`, so this is not hypothetical.
    """
    for src, _dst in _ABBREVIATIONS:
        pos, neg = DICT_ABBREV_MATRIX[src]
        assert src in pos and src in neg, (
            f"ca của mục viết tắt {src!r} không chứa chính nó — "
            f"dương={pos!r}, âm={neg!r}"
        )
    for src, _dst, _rule in _PREFIXES:
        pos, neg = DICT_PREFIX_MATRIX[src]
        assert src in pos and src in neg, (
            f"ca của tiền tố {src!r} không chứa chính nó — "
            f"dương={pos!r}, âm={neg!r}"
        )


def test_every_dictionary_entry_expands_and_is_anchored() -> None:
    """Positive: the entry expands. Negative: glued to letters it must NOT."""
    for src, dst in _ABBREVIATIONS:
        pos, neg = DICT_ABBREV_MATRIX[src]
        # The WHOLE expansion, not its first word. "thành" is the head of
        # TP.HCM, TPHCM, TP.HN and the TP. prefix alike, so a head-only check
        # cannot tell an entry's own expansion from one another rule produced —
        # swap TP.HN's target to the wrong city and it stays green (S4 round 6).
        want = dst.lower()
        got_pos = normalize_vi(pos)
        assert got_pos.ok is True, f"{src}: ca DƯƠNG bị từ chối — {got_pos.error}"
        assert want in got_pos.text.lower(), (
            f"{src}: ca DƯƠNG không bung ĐÚNG — mong nguyên cụm {want!r} trong "
            f"{got_pos.text!r}"
        )
        got_neg = normalize_vi(neg)
        assert want not in got_neg.text.lower(), (
            f"{src}: ca ÂM bung dù token dính chữ — mỏ neo chữ cái không có tác "
            f"dụng: {got_neg.text!r}"
        )

    for src, dst, _rule in _PREFIXES:
        pos, neg = DICT_PREFIX_MATRIX[src]
        want = dst.strip().lower()
        got_pos = normalize_vi(pos)
        assert got_pos.ok is True, f"{src}: ca DƯƠNG bị từ chối — {got_pos.error}"
        assert want in got_pos.text.lower(), (
            f"{src}: ca DƯƠNG không bung ĐÚNG — mong nguyên cụm {want!r} trong "
            f"{got_pos.text!r}"
        )
        got_neg = normalize_vi(neg)
        assert want not in got_neg.text.lower(), (
            f"{src}: ca ÂM bung dù sau dấu chấm là chữ thường — mỏ neo không có "
            f"tác dụng: {got_neg.text!r}"
        )


# THE AMBIGUOUS-Đ MATRIX — declared BEFORE the cases, the way the six sibling
# families in this file are. The flat tuple above is the historical pin list: it
# grew by four rows in round 17 and four more in round 19, each time AFTER a
# reviewer found a leak, because a flat list cannot say which cell is empty.
#
# Two axes, both named by the leaks themselves:
#   separator AFTER the mark — round 17: the refusal anchored on `[ \t]` while
#     the two money rewrites anchored on `\s`, so newline / NBSP / nothing leaked
#   token FOLLOWING that separator — round 19: the lookahead accepted only a
#     LETTER, so Vietnamese street names that are NUMBERS (Đường 3/2, 30/4, 2/9)
#     and addresses followed by a comma leaked
D_SEPARATORS: dict[str, str] = {
    "cách": " ",
    "tab": "\t",
    "xuống dòng": "\n",
    "NBSP": "\xa0",
    "không có": "",
}
D_FOLLOWING: dict[str, str] = {
    "chữ": "Lê Lợi",
    "số": "3/2, Q.10",
    "dấu phẩy": ", Q.1",
    "kết chuỗi": "",
}

AMBIGUOUS_D_MATRIX: dict[tuple[str, str], str] = {
    (sep_name, follow_name): f"Số 25 Đ.{sep}{follow}"
    for sep_name, sep in D_SEPARATORS.items()
    for follow_name, follow in D_FOLLOWING.items()
    if follow_name != "kết chuỗi"
}

# The whole "kết chuỗi" column is out of the refusal ON PURPOSE, and the reason is
# the same for all five cells, so they are listed rather than silently absent.
# Refusing a currency mark at end of string would take "Giá 500 đ" with it — the
# single commonest price spelling this slot exists to read. Declared in the
# contract's Known limits (widening of 2026-08-27); the five cells also collapse
# to one input, because trailing whitespace before end of string is not a
# separator anyone can see.
DELIBERATELY_UNCOVERED_D_CELLS: dict[tuple[str, str], str] = {
    (sep_name, "kết chuỗi"): (
        "dấu tiền ở cuối chuỗi CỐ Ý vẫn đọc — chặn ở đó sẽ giết luôn 'Giá 500 đ'"
    )
    for sep_name in D_SEPARATORS
}


def test_ambiguous_d_separators_are_what_the_rule_calls_a_separator() -> None:
    """The test's separator axis must be the IMPLEMENTATION's, not a wish.

    `AMBIGUOUS_D_MATRIX` is generated from `D_SEPARATORS` × `D_FOLLOWING` and the
    completeness test below then asserts against those same two dicts, so that
    assert is an identity — it cannot fail. What CAN drift, invisibly, is the
    axis itself: the rule decides what counts as a gap with `_SEP`, and if that
    class narrows, a separator listed here stops being one while every cell
    still reports "covered" (S4 round 5 finding, same shape as the dash matrix
    at round 4). So assert the RELATION between axis and implementation.
    """
    module = sys.modules["tongflow.text.normalize_vi"]
    sep_class = re.compile(module._SEP)
    for name, sep in D_SEPARATORS.items():
        if name == "không có":
            # The deliberate non-separator: the zero-width gap. It must NOT be
            # matched, and that is half the relation.
            assert sep == "", f"ô '{name}' phải là khoảng trống rỗng, nhận {sep!r}"
            continue
        assert sep_class.fullmatch(sep), (
            f"'{name}' ({sep!r}) được khai là dấu ngăn trong bộ ca, nhưng luật "
            f"(_SEP = {module._SEP!r}) KHÔNG coi nó là dấu ngăn — ma trận đang "
            f"đo một trục mà bản cài đặt không có"
        )


def test_ambiguous_d_following_tokens_are_what_the_rule_looks_for() -> None:
    """The SECOND axis, anchored the same way as the first.

    Round 6 anchored `D_SEPARATORS` to `_SEP` and stopped there — leaving
    `D_FOLLOWING` free-floating, so deleting a key silently shrank the matrix
    from 20 declared cells to 15 while every assert stayed green and the
    evals.yaml text still said "20 ô" (S4 round 6 finding, found in the very
    round chartered to close this shape). The rule's lookahead is what decides
    which token counts as "following", so assert against it.
    """
    module = sys.modules["tongflow.text.normalize_vi"]
    # The lookahead the rule actually carries: a word character, or a comma.
    follows = re.compile(r"[^\W_]|,")
    for name, token in D_FOLLOWING.items():
        if name == "kết chuỗi":
            assert token == "", f"ô '{name}' phải là kết chuỗi rỗng, nhận {token!r}"
            continue
        assert token and follows.match(token[0]), (
            f"'{name}' ({token!r}) được khai là token-theo-sau trong bộ ca, nhưng "
            f"ký tự đầu của nó không khớp lớp mà luật _AMBIGUOUS_D nhìn tới — "
            f"ma trận đang đo một trục bản cài đặt không có"
        )
    assert len(D_SEPARATORS) * len(D_FOLLOWING) == 20, (
        f"lời khai trong evals.yaml nói 20 ô; hai trục hiện cho "
        f"{len(D_SEPARATORS)} × {len(D_FOLLOWING)} = "
        f"{len(D_SEPARATORS) * len(D_FOLLOWING)}"
    )


def test_ambiguous_d_matrix_has_no_silently_empty_cell() -> None:
    """Every (separator, following-token) cell is either measured or named."""
    missing = [
        (sep_name, follow_name)
        for sep_name in D_SEPARATORS
        for follow_name in D_FOLLOWING
        if (sep_name, follow_name) not in AMBIGUOUS_D_MATRIX
        and (sep_name, follow_name) not in DELIBERATELY_UNCOVERED_D_CELLS
    ]
    assert missing == [], (
        "ô ma trận Đ-nhập-nhằng không có ca và cũng không được khai là cố ý bỏ: "
        f"{missing}"
    )
    overlap = set(AMBIGUOUS_D_MATRIX) & set(DELIBERATELY_UNCOVERED_D_CELLS)
    assert overlap == set(), f"ô vừa có ca vừa khai bỏ: {sorted(overlap)}"


def test_ambiguous_d_matrix_every_cell_refuses_by_name() -> None:
    for (sep_name, follow_name), raw in sorted(AMBIGUOUS_D_MATRIX.items()):
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"ô ({sep_name}, {follow_name}) — {raw!r}: dạng nhập nhằng phải TỪ "
            f"CHỐI, nhận ok=True -> {got.text!r}"
        )
        assert "Đ" in got.residual or "đ" in got.residual, (
            f"ô ({sep_name}, {follow_name}) — {raw!r}: từ chối nhưng không nêu "
            f"token gây nhập nhằng: {got.residual}"
        )


def test_declared_uncovered_d_cells_are_still_uncovered() -> None:
    """A limit that has quietly healed is a lie in the file."""
    for (sep_name, _), _reason in DELIBERATELY_UNCOVERED_D_CELLS.items():
        raw = f"Số 25 Đ.{D_SEPARATORS[sep_name]}"
        got = normalize_vi(raw)
        assert got.ok is True, (
            f"ô ({sep_name}, kết chuỗi) — {raw!r} nay ĐÃ bị từ chối; gỡ nó khỏi "
            "DELIBERATELY_UNCOVERED_D_CELLS và cập nhật Known limits"
        )


def test_ambiguous_undotted_d_refuses_rather_than_guessing() -> None:
    for raw in CORPUS_AMBIGUOUS_D:
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"{raw!r}: dạng nhập nhằng phải TỪ CHỐI, nhận ok=True -> {got.text!r}"
        )
        assert "Đ" in got.residual or "đ" in got.residual, (
            f"{raw!r}: từ chối nhưng không nêu token gây nhập nhằng: {got.residual}"
        )
        # ...and it must never have guessed either reading before refusing.
        assert "đường" not in got.text, f"{raw!r} đoán thành đường: {got.text!r}"


def test_unambiguous_money_marks_still_read() -> None:
    """Dấu tiền chỉ đọc khi KHÔNG có gì phía sau làm nó nhập nhằng.

    Kết chuỗi, dấu phẩy, dấu gạch chéo, hoặc chữ "đồng" đầy đủ — không ca nào
    trong số này có thể là một địa chỉ.
    """
    for raw, expected in CORPUS_MONEY_MARK_UNAMBIGUOUS:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"
        assert "đường" not in got.text, f"{raw!r} bị đọc thành đường: {got.text!r}"


# --------------------------------------------------------------------------
# AC-5 — amounts written the standard Vietnamese way, with a thousand dot
# and/or a decimal comma. The pinned library mis-parses both: with dots it
# emits words around a literal "." ("giá ba.không.không đồng" for three
# million), and without dots it mis-scales the decimal form ("3000000,00" →
# "ba trăm triệu"). Neither leaves a digit behind, so the post-check saw
# nothing and ok=True — an order-of-magnitude-wrong price spoken as success
# (S4 round 5 finding, owner raised scope 2026-08-22).
#
# Declared as a CLASS: {thousand dot, none} × {no fraction, all-zero fraction,
# non-zero fraction}. Pinned reading: an all-zero fraction is DROPPED
# ("3.000.000,00" reads "ba triệu đồng", the way a Vietnamese price is spoken);
# a non-zero fraction reads "phẩy <digits>".
# --------------------------------------------------------------------------

GROUPING_KINDS = ("có chấm nghìn", "không chấm")
FRACTION_KINDS = ("không có phần lẻ", "phần lẻ bằng 0", "phần lẻ khác 0")

VN_AMOUNT_MATRIX: dict[tuple[str, str], tuple[str, str]] = {
    ("có chấm nghìn", "không có phần lẻ"): (
        "Giá 1.999.000 ₫",
        "giá một triệu chín trăm chín mươi chín nghìn đồng",
    ),
    ("có chấm nghìn", "phần lẻ bằng 0"): (
        "Giá 3.000.000,00 đ",
        "giá ba triệu đồng",
    ),
    ("có chấm nghìn", "phần lẻ khác 0"): (
        "Giá 1.999.000,50 đ",
        "giá một triệu chín trăm chín mươi chín nghìn phẩy năm mươi đồng",
    ),
    ("không chấm", "không có phần lẻ"): (
        "Giá 1999000 đ",
        "giá một triệu chín trăm chín mươi chín nghìn đồng",
    ),
    ("không chấm", "phần lẻ bằng 0"): (
        "Giá 3000000,00 đ",
        "giá ba triệu đồng",
    ),
    ("không chấm", "phần lẻ khác 0"): (
        "Giá 12345,67 đ",
        "giá mười hai nghìn ba trăm bốn mươi lăm phẩy sáu mươi bảy đồng",
    ),
}

# Shapes that use the same characters but are NOT grouped amounts — pinned so a
# future widening of the rule cannot quietly eat them.
VN_AMOUNT_NEGATIVE: tuple[tuple[str, str], ...] = (
    ("phiên bản 0.2.3", "phiên bản không.hai.ba"),
    ("Ngày 5/3/2025", "ngày năm tháng ba năm hai nghìn không trăm hai mươi lăm"),
    ("Giá 1.500 đ", "giá một nghìn năm trăm đồng"),
)


# A comma between two SHORT integers is a list separator, not a decimal point.
#
# The decimal rule was written for prices ("1.999.000,50") and fired on every
# `digit,digit` pair, so an ordinary enumeration became a chain of decimals with
# ok=True — no digit, currency mark or ambiguity token survives, so every guard
# stayed quiet (S4 round 17 finding). Measured before the fix:
#   'Chọn đáp án 1,2,3' -> 'chọn đáp án một phẩy hai phẩy ba'
#   'Bước 1,2'          -> 'bước NHẤT phẩy hai'
#   'Ngày 1,2 tháng 3'  -> 'ngày một phẩy NGÀY hai tháng ba'
#
# What separates them is what comes BEFORE the comma: a decimal has a
# multi-digit or grouped integer part ("1.234,5", "3.000.000,00", "2,5" as a
# quantity); a list has single digits repeating. The rule now requires the comma
# to be followed by digits and NOT by another `,digit` group — one comma only.
CORPUS_COMMA_LIST: tuple[tuple[str, str], ...] = (
    ("Chọn đáp án 1,2,3", "chọn đáp án một, hai, ba"),
    ("Lô 1,2,3,4", "lô một, hai, ba, bốn"),
)


def test_comma_separated_lists_are_not_decimals() -> None:
    for raw, expected in CORPUS_COMMA_LIST:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert "phẩy" not in got.text, (
            f"{raw!r} là danh sách nhưng đọc thành số thập phân: {got.text!r}"
        )
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"


# THE COMMA TABLE — negative half. The two shapes below are written exactly like
# another meaning, so the reader REFUSES instead of guessing (owner chose the
# "narrow the scope" path on 2026-08-27, after round 18 produced the same defect
# class as round 17).
#
# Measured before the table existed, every case ok=True with an EMPTY residual:
#   "Giá 1,000,000 VND"          -> "giá một, không, không đồng"   (six orders out)
#   "Doanh thu 100,200,300 đồng" -> "doanh thu một trăm, hai trăm, ba trăm đồng"
#   "Giá 1,000 VND"              -> "giá một nghìn đồng"  (RIGHT, but only because
#                                    the library GUESSED thousands)
#   "Pi 3,14159"                 -> "pi ba phẩy mười bốn nghìn một trăm năm mươi chín"
CORPUS_COMMA_UNREADABLE: tuple[tuple[str, str], ...] = (
    # (input, the run that must be named in `residual`)
    ("Giá 1,000,000 VND", "1,000,000"),
    ("Doanh thu 100,200,300 đồng", "100,200,300"),
    ("Giá 1,000 VND", "1,000"),
    ("Pi 3,14159", "3,14159"),
)

# ...and the POSITIVE half of the SAME comma family: a declared shape must still
# read, and a fraction with a leading zero must KEEP that zero. "7,05%" used to
# come back "bảy phẩy năm" (7.5%) and "3,09 triệu" was byte-identical to
# "3,9 triệu" — a cardinal has no leading zero. The last two rows are the
# regression anchors for the approved goldens: a fraction WITHOUT a leading zero
# still reads exactly as before.
CORPUS_COMMA_READABLE: tuple[tuple[str, str], ...] = (
    ("Lãi suất 7,05%", "lãi suất bảy phẩy không năm phần trăm"),
    ("Giá 3,09 triệu đồng", "giá ba phẩy không chín triệu đồng"),
    ("Tỷ lệ 0,08%", "tỷ lệ không phẩy không tám phần trăm"),
    ("Giá 3,9 triệu đồng", "giá ba phẩy chín triệu đồng"),
    ("Giá 1.999.000,50 đ", "giá một triệu chín trăm chín mươi chín nghìn phẩy năm mươi đồng"),
)


def test_unreadable_comma_shapes_are_refused_by_name() -> None:
    for raw, run in CORPUS_COMMA_UNREADABLE:
        got = normalize_vi(raw)
        assert got.ok is False, (
            f"{raw!r}: dạng dấu phẩy không đọc được dứt khoát phải TỪ CHỐI, "
            f"nhận ok=True -> {got.text!r}"
        )
        assert run in got.residual, (
            f"{raw!r}: từ chối nhưng không nêu TÊN cụm gây từ chối "
            f"({run!r} không có trong {got.residual})"
        )


def test_declared_comma_shapes_still_read_and_keep_leading_zeros() -> None:
    for raw, expected in CORPUS_COMMA_READABLE:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"

    # Relational, not shape-based: different fractions MUST read differently.
    # This anchor catches the very defect the literal rows above would miss if
    # someone edited the expectations to match the code instead of fixing it.
    assert normalize_vi("Giá 3,09 triệu đồng").text != normalize_vi("Giá 3,9 triệu đồng").text, (
        "3,09 và 3,9 cho ra CÙNG một câu — số 0 đứng đầu của phần lẻ bị nuốt"
    )


def test_vietnamese_grouped_amounts_read_at_the_right_scale() -> None:
    missing = [
        (grouping, fraction)
        for grouping in GROUPING_KINDS
        for fraction in FRACTION_KINDS
        if (grouping, fraction) not in VN_AMOUNT_MATRIX
    ]
    assert not missing, f"Ô ma trận chưa có ca nào: {missing}"

    for (grouping, fraction), (raw, expected) in VN_AMOUNT_MATRIX.items():
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} ({grouping}, {fraction}) → {got.error}"
        assert got.text == expected, (
            f"{raw!r} ({grouping}, {fraction}): mong {expected!r}, nhận {got.text!r}"
        )
        # A stray separator between two spelled-out groups is the shape that
        # made the wrong reading pass — assert it directly, not via the diff.
        assert "." not in got.text, (
            f"{raw!r} còn dấu chấm trong đầu ra: {got.text!r}"
        )

    for raw, expected in VN_AMOUNT_NEGATIVE:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, (
            f"{raw!r} (ca ÂM, luật không được ăn): mong {expected!r}, nhận {got.text!r}"
        )

# --------------------------------------------------------------------------
# AC-3 / AC-4 — time, identifiers, units, administrative abbreviations.
# --------------------------------------------------------------------------

CORPUS_TIME: tuple[tuple[str, str], ...] = (
    (
        "19/8/2026",
        "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu",
    ),
    (
        "19-08-2026",
        "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu",
    ),
    ("14:30", "mười bốn giờ ba mươi phút"),
    ("25-26/12", "hai mươi lăm đến hai mươi sáu tháng mười hai"),
    # Matrix fillers (S4 round 1 finding: the declared matrix had no cells).
    ("5/9/2026", "ngày năm tháng chín năm hai nghìn không trăm hai mươi sáu"),
    ("05/09/2026", "ngày năm tháng chín năm hai nghìn không trăm hai mươi sáu"),
    # A bare d/m without a year reads WITHOUT the word "ngày" — pinned as-is;
    # it therefore claims no "ngày" cell below.
    ("3/12", "ba tháng mười hai"),
    ("8:05", "tám giờ năm phút"),
    ("08:30", "tám giờ ba mươi phút"),
    ("8-9/3", "tám đến chín tháng ba"),
    # The written word "ngày" before a full date must NOT double up with the
    # "ngày" the library injects — "ngày ngày" was shipping with ok=True on
    # the feature's own canonical fixture string (S4 round 2 finding).
    (
        "Giá 1.999.000₫ ngày 19/8/2026",
        "giá một triệu chín trăm chín mươi chín nghìn đồng "
        "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu",
    ),
    (
        "Ngày 19/8/2026 khai trương",
        "ngày mười chín tháng tám năm hai nghìn không trăm hai mươi sáu khai trương",
    ),
    # Both colon roles in ONE sentence: the punctuation colon (followed by a
    # space) must survive, the clock must still read out — the first colon
    # rule rejected every ':' including legitimate prose (S4 round 2 finding).
    (
        "Giờ chiếu: 14:30 hôm nay",
        "giờ chiếu: mười bốn giờ ba mươi phút hôm nay",
    ),
)
TIME_COUNT = 13

# Matrix: aspect × digit shape. Claims are hand-written; the aspect half of
# every claim is machine-checked against the expected string via the marker
# words below, and the shape half is auditable from the raw at a glance. The
# first version of this test declared the matrix only in the eval's prose and
# measured none of it (S4 round 1 finding).
TIME_ASPECTS = ("ngày", "tháng", "năm", "giờ", "phút", "khoảng")
TIME_SHAPES = ("0-đầu", "1-chữ-số", "2-chữ-số", "4-chữ-số")
TIME_ASPECT_MARKERS: dict[str, str] = {
    "ngày": "ngày",
    "tháng": "tháng",
    "năm": "năm hai nghìn",
    "giờ": "giờ",
    "phút": "phút",
    "khoảng": "đến",
}
TIME_MATRIX_CELLS: dict[str, tuple[tuple[str, str], ...]] = {
    "19/8/2026": (("ngày", "2-chữ-số"), ("tháng", "1-chữ-số"), ("năm", "4-chữ-số")),
    "19-08-2026": (("ngày", "2-chữ-số"), ("tháng", "0-đầu")),
    "14:30": (("giờ", "2-chữ-số"), ("phút", "2-chữ-số")),
    "25-26/12": (("khoảng", "2-chữ-số"), ("tháng", "2-chữ-số")),
    "5/9/2026": (("ngày", "1-chữ-số"),),
    "05/09/2026": (("ngày", "0-đầu"),),
    "8:05": (("giờ", "1-chữ-số"), ("phút", "0-đầu")),
    "08:30": (("giờ", "0-đầu"),),
    "8-9/3": (("khoảng", "1-chữ-số"),),
}
# Deliberately uncovered, each with a reason: four-digit shapes only exist for
# years; a year is only ever written with four digits in this product's copy;
# minutes are conventionally two digits.
DELIBERATELY_UNCOVERED_TIME_CELLS: frozenset[tuple[str, str]] = frozenset(
    {
        ("ngày", "4-chữ-số"),
        ("tháng", "4-chữ-số"),
        ("giờ", "4-chữ-số"),
        ("phút", "4-chữ-số"),
        ("phút", "1-chữ-số"),
        ("khoảng", "4-chữ-số"),
        ("khoảng", "0-đầu"),
        ("năm", "0-đầu"),
        ("năm", "1-chữ-số"),
        ("năm", "2-chữ-số"),
    }
)

CORPUS_ID: tuple[tuple[str, str], ...] = (
    ("0901234567", "không chín không một hai ba bốn năm sáu bảy"),
    ("85m2", "tám mươi lăm mét vuông"),
    ("60 km/h", "sáu mươi ki lô mét trên giờ"),
    ("TP.HCM", "thành phố hồ chí minh"),
    ("TP.Thủ Đức", "thành phố thủ đức"),
    ("Q.7", "quận bảy"),
    ("P.Bến Nghé", "phường bến nghé"),
    # Sentence-position carriers: the eval's declared axis {đầu, giữa, cuối}
    # had no case at all — every original case was a standalone fragment
    # (S4 round 1 finding). One case per (type × position) cell.
    ("0901234567 là số hỗ trợ", "không chín không một hai ba bốn năm sáu bảy là số hỗ trợ"),
    ("Gọi 0901234567 để đặt chỗ", "gọi không chín không một hai ba bốn năm sáu bảy để đặt chỗ"),
    ("Hotline là 0901234567", "hót lain là không chín không một hai ba bốn năm sáu bảy"),
    ("85m2 là diện tích sàn", "tám mươi lăm mét vuông là diện tích sàn"),
    ("Căn 85m2 có ban công", "căn tám mươi lăm mét vuông có ban công"),
    ("Diện tích là 85m2", "diện tích là tám mươi lăm mét vuông"),
    ("TP.HCM có mưa", "thành phố hồ chí minh có mưa"),
    ("Về Q.7 lúc chiều", "về quận bảy lúc chiều"),
    ("Chuyển hàng về TP.HCM", "chuyển hàng về thành phố hồ chí minh"),
    # The positive half of the H. rule: "H.264 → not huyện" alone is a lone
    # negative — deleting the dictionary entry outright kept every test green
    # (S4 round 2 finding).
    ("H.Bình Chánh", "huyện bình chánh"),
)
ID_COUNT = 17

# raw → (fragment, type, position). Position is machine-checked against the
# RAW string: đầu ⇒ starts with the fragment, cuối ⇒ ends with it, giữa ⇒
# contains it strictly inside.
ID_TYPES = ("điện thoại", "đơn vị", "viết tắt")
ID_POSITIONS = ("đầu", "giữa", "cuối")
ID_POSITION_CELLS: dict[str, tuple[str, str, str]] = {
    "0901234567 là số hỗ trợ": ("0901234567", "điện thoại", "đầu"),
    "Gọi 0901234567 để đặt chỗ": ("0901234567", "điện thoại", "giữa"),
    "Hotline là 0901234567": ("0901234567", "điện thoại", "cuối"),
    "85m2 là diện tích sàn": ("85m2", "đơn vị", "đầu"),
    "Căn 85m2 có ban công": ("85m2", "đơn vị", "giữa"),
    "Diện tích là 85m2": ("85m2", "đơn vị", "cuối"),
    "TP.HCM có mưa": ("TP.HCM", "viết tắt", "đầu"),
    "Về Q.7 lúc chiều": ("Q.7", "viết tắt", "giữa"),
    "Chuyển hàng về TP.HCM": ("TP.HCM", "viết tắt", "cuối"),
}


def _time_component(raw: str, aspect: str) -> str | None:
    """Pull the digit run the aspect refers to OUT OF THE RAW string, so the
    shape half of a claim is machine-checked too — it used to be hand-audited
    only (S4 round 2 finding)."""
    import re as _re

    clock = _re.search(r"(\d{1,2}):(\d{2})", raw)
    rng = _re.search(r"(\d{1,2})-(\d{1,2})/(\d{1,2})", raw)
    date = _re.search(r"(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?", raw)
    if aspect == "giờ":
        return clock.group(1) if clock else None
    if aspect == "phút":
        return clock.group(2) if clock else None
    if aspect == "khoảng":
        return rng.group(1) if rng else None
    if aspect == "tháng":
        if rng:
            return rng.group(3)
        return date.group(2) if date else None
    if aspect == "ngày":
        return date.group(1) if date else None
    if aspect == "năm":
        return date.group(3) if date else None
    return None


def _shape_of(component: str) -> str:
    if len(component) == 2 and component.startswith("0"):
        return "0-đầu"
    return {1: "1-chữ-số", 2: "2-chữ-số", 4: "4-chữ-số"}[len(component)]


def test_datetime_golden() -> None:
    assert len(CORPUS_TIME) == TIME_COUNT

    expected_by_raw = dict(CORPUS_TIME)
    orphans = set(TIME_MATRIX_CELLS) - set(expected_by_raw)
    assert not orphans, f"Ô khai cho ca không còn trong corpus: {sorted(orphans)}"
    for raw, cells in TIME_MATRIX_CELLS.items():
        for aspect, shape in cells:
            marker = TIME_ASPECT_MARKERS[aspect]
            assert marker in expected_by_raw[raw], (
                f"{raw!r} khai ô ({aspect}, {shape}) nhưng expected "
                f"không chứa {marker!r}"
            )
            component = _time_component(raw, aspect)
            assert component is not None, (
                f"{raw!r} khai ô ({aspect}, {shape}) nhưng không trích được "
                f"thành phần {aspect} từ raw"
            )
            assert _shape_of(component) == shape, (
                f"{raw!r} khai hình dạng {shape} cho {aspect} nhưng thành phần "
                f"thật là {component!r} ({_shape_of(component)})"
            )

    covered = {cell for cells in TIME_MATRIX_CELLS.values() for cell in cells}
    overlap = covered & DELIBERATELY_UNCOVERED_TIME_CELLS
    assert not overlap, f"Ô vừa được phủ vừa khai bỏ: {sorted(overlap)}"
    missing = [
        (aspect, shape)
        for aspect in TIME_ASPECTS
        for shape in TIME_SHAPES
        if (aspect, shape) not in covered
        and (aspect, shape) not in DELIBERATELY_UNCOVERED_TIME_CELLS
    ]
    assert not missing, f"Ô ma trận chưa có ca nào: {missing}"

    for raw, expected in CORPUS_TIME:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"


def test_identifiers_units_abbrev_golden() -> None:
    assert len(CORPUS_ID) == ID_COUNT

    raws = {raw for raw, _ in CORPUS_ID}
    orphans = set(ID_POSITION_CELLS) - raws
    assert not orphans, f"Ô khai cho ca không còn trong corpus: {sorted(orphans)}"
    for raw, (fragment, cell_type, position) in ID_POSITION_CELLS.items():
        # The TYPE axis is machine-checked from the fragment's own shape — it
        # used to be hand-declared only (S4 round 2 finding).
        if fragment.isdigit():
            derived_type = "điện thoại"
        elif any(u in fragment for u in ("m2", "km/h", "kg")):
            derived_type = "đơn vị"
        else:
            derived_type = "viết tắt"
        assert derived_type == cell_type, (
            f"{raw!r} khai loại {cell_type!r} nhưng mảnh {fragment!r} "
            f"có hình dạng {derived_type!r}"
        )
        if position == "đầu":
            assert raw.startswith(fragment), f"{raw!r} khai đầu câu nhưng không"
        elif position == "cuối":
            assert raw.endswith(fragment), f"{raw!r} khai cuối câu nhưng không"
        else:
            inner = raw.find(fragment)
            assert 0 < inner < len(raw) - len(fragment), (
                f"{raw!r} khai giữa câu nhưng không"
            )

    covered = {
        (cell_type, position)
        for _fragment, cell_type, position in ID_POSITION_CELLS.values()
    }
    missing = [
        (cell_type, position)
        for cell_type in ID_TYPES
        for position in ID_POSITIONS
        if (cell_type, position) not in covered
    ]
    assert not missing, f"Ô loại×vị-trí chưa có ca nào: {missing}"

    for raw, expected in CORPUS_ID:
        got = normalize_vi(raw)
        assert got.ok is True, f"{raw!r} → {got.error}"
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"
        # No abbreviation dot may survive into speech.
        assert "." not in got.text, f"{raw!r}: còn dấu chấm viết tắt trong {got.text!r}"


# --------------------------------------------------------------------------
# AC-2/AC-4 amendment (S4 round 1, confirmed finding) — brand tokens must
# SURVIVE the currency and prefix rules. Before the dictionary was anchored,
# "VNDirect" came back as "đồngirect" and "H.264" as "huyện 264", and every
# guard stayed green: no digits were left for the residual rule, and the money
# relation saw the word "đồng" — the very fragment spliced into the brand name.
# These asserts pin the RELATION (nothing injected), not the exact spelling of
# a foreign word — how the library sounds out "VNDS" is the library's policy.
# --------------------------------------------------------------------------


def test_brand_tokens_survive_currency_and_prefix_rules() -> None:
    for raw in ("Công ty VNDirect niêm yết", "Mã VNDS tăng trần"):
        assert has_money(raw) is False, f"{raw!r} không phải giá tiền"
        got = normalize_vi(raw)
        # The claim here is about CONTENT, not about acceptance: a brand token
        # must never have "đồng" injected into it. Since 2026-08-27 an unstable
        # brand token is refused by name (AC-4), which satisfies the claim more
        # strongly than reading it — so acceptance is deliberately not asserted.
        assert "đồng" not in got.text, (
            f"{raw!r}: chữ 'đồng' bị tiêm vào tên riêng — {got.text!r}"
        )

    got = normalize_vi("Xem chuẩn H.264 nhé")
    assert "huyện" not in got.text, (
        f"mã codec bị đọc thành đơn vị hành chính — {got.text!r}"
    )


# --------------------------------------------------------------------------
# AC-5 — the three ambiguous readings, pinned as product constants.
# --------------------------------------------------------------------------

CORPUS_AMBIGUOUS: tuple[tuple[str, str], ...] = (
    ("5/3", "năm tháng ba"),
    ("1.500", "một nghìn năm trăm"),
    ("10-15", "mười đến mười lăm"),
    # Gate-2 scope raise (owner, 2026-08-21): the range policy also holds when
    # both ends carry a unit suffix. "5%-10%" used to read as MINUS — "năm
    # phần trămâm mười phần trăm", glued, ok=True (S4 round 2 finding).
    ("5%-10%", "năm phần trăm đến mười phần trăm"),
    ("5% - 10%", "năm phần trăm đến mười phần trăm"),
    # S4 round 3 finding: the round-2 fix for spaced money ("500 đ") ran BEFORE
    # the range rule, so it rewrote the very "đ" the range rule anchors on —
    # and the range word vanished with ok=True. That is the same silent shape
    # the scope raise existed to kill, one keystroke away: a space between the
    # amount and its unit. Measured before the fix:
    #   "1.000 đ-2.000 đ"      -> "một nghìn đồng hai nghìn đồng"
    #   "1.000 ₫ - 2.000 ₫"    -> "một nghìn đồng hai nghìn đồng"
    #   "1.000 đồng - 2.000 đồng" -> "một nghìn đồng hai nghìn đồng"
    ("1.000 đ-2.000 đ", "một nghìn đồng đến hai nghìn đồng"),
    ("1.000 ₫ - 2.000 ₫", "một nghìn đồng đến hai nghìn đồng"),
    ("1.000 đồng - 2.000 đồng", "một nghìn đồng đến hai nghìn đồng"),
    # S4 round 4: the two rows above pinned exactly the two anchors the reader
    # hardcoded, so the corpus could never catch the NEXT member of the class
    # AC-5 promises. These are that next member — a unit written as an ordinary
    # word. Measured before the fix, all four silently lost the range word with
    # ok=True: "năm triệu mười triệu", "năm tỷ mười tỷ", …
    ("5 triệu - 10 triệu", "năm triệu đến mười triệu"),
    ("5 tỷ - 10 tỷ", "năm tỷ đến mười tỷ"),
    ("5kg-10kg", "năm ki lô gam đến mười ki lô gam"),
    ("5 người - 10 người", "năm người đến mười người"),
)

# The axis the corpus above is a full grid over: WHAT sits between the number
# and the hyphen. Declared BEFORE the cases, the way CORPUS_MONEY/TIME/ID do —
# the shape whose absence was the round-4 finding: a corpus of point-cases
# cannot fail on the next member of the class its criterion names.
RANGE_UNIT_KINDS = ("không đơn vị", "ký hiệu", "chữ viết tắt", "từ đầy đủ")
RANGE_SPACING = ("dính", "có khoảng trắng")

# (kind, spacing) -> a case in CORPUS_AMBIGUOUS above.
RANGE_MATRIX: dict[tuple[str, str], str] = {
    ("không đơn vị", "dính"): "10-15",
    ("ký hiệu", "dính"): "5%-10%",
    ("ký hiệu", "có khoảng trắng"): "5% - 10%",
    ("chữ viết tắt", "dính"): "1.000 đ-2.000 đ",
    ("chữ viết tắt", "có khoảng trắng"): "1.000 ₫ - 2.000 ₫",
    ("từ đầy đủ", "dính"): "5kg-10kg",
    ("từ đầy đủ", "có khoảng trắng"): "5 triệu - 10 triệu",
}

# THE NEGATIVE AXIS — what must NOT become a range. Without it, RANGE_MATRIX
# trên tuy phủ kín {kiểu đơn vị} × {khoảng cách} nhưng cả hai trục đều là trục
# above only ever asserts POSITIVE cases, so it is completely blind to the
# direction "what else does the range rule swallow" (S4 round
# 5, hai reviewer độc lập cùng nêu).
#
# The rows below PIN A KNOWN LIMIT, not desired behaviour: today's range rule
# fires on EVERY `digit-hyphen-digit`, so an ISO date, an order code and a
# hyphenated phone number all read as "đến" with ok=True. This is a Known limit
# đồng và thuộc hợp đồng follow-up "chống đọc sai êm ru" (owner quyết ở Cổng 2
# round 3), NOT this round's work. Pinned by test so the limit is (a) visible
# in the suite rather than only in prose, and (b) when someone fixes the rule
# this test goes RED and forces the contract to be updated with it, instead of
# the behaviour changing silently.
# The dash shapes this reader now REFUSES rather than reading as a range, and the
# ONE that remains a declared limit. Two of the three former limits are gone: an
# ISO date and a dash-written phone number both lose digits when read as a range
# ("0912-345-678" dropped its leading zero), and losing a digit while reporting
# success is the defect class this contract exists to close (AC-3, 2026-08-27).
CORPUS_DASH_REFUSED: tuple[tuple[str, str, str], ...] = (
    ("ngày kiểu ISO", "ISO 2026-08-19", "2026-08-19"),
    ("điện thoại có gạch", "Gọi 0912-345-678 để biết thêm", "0912-345-678"),
    ("mã có số 0 đứng đầu", "Mã 0123-4567 đã giao", "0123-4567"),
)

# The negative half of the dash rule, and it carries the same weight as the
# positive half. The scan reads the RAW input, where Vietnamese groups thousands
# with a DOT, so an unanchored pattern matched the FRAGMENT "000-2" inside
# "Giá 1.000-2.000 đồng": three leading zeros then one digit, which trips the
# leading-zero signal. The reader had already produced the CORRECT sentence
# ("giá một nghìn đến hai nghìn đồng") and the post-check overrode it, naming a
# token the user never typed (S4 round 4). Dotted price ranges are the
# commonest shape this slot exists to read, so a false refusal here fails the
# voice chain on ordinary catalogue copy.
CORPUS_DOTTED_RANGE_READS: tuple[tuple[str, str], ...] = (
    ("Giá 1.000-2.000 đồng", "giá một nghìn đến hai nghìn đồng"),
    ("Khoảng 10.000-20.000 người", "khoảng mười nghìn đến hai mươi nghìn người"),
)


def test_dotted_thousand_ranges_are_not_refused() -> None:
    for raw, expected in CORPUS_DOTTED_RANGE_READS:
        got = normalize_vi(raw)
        assert got.ok is True, (
            f"{raw!r}: đọc ra ĐÚNG ({got.text!r}) mà vẫn bị từ chối vì "
            f"{got.residual} — cụm đó không phải thứ người dùng gõ"
        )
        assert got.text == expected, f"{raw!r}: mong {expected!r}, nhận {got.text!r}"


# STILL a limit, and the reason is structural rather than an oversight: two
# groups with no leading zero is indistinguishable from a real range, and
# refusing it would take "Giá 5-10 triệu" — the shape the range rule exists for.
CORPUS_RANGE_NEGATIVE_KNOWN_LIMIT: tuple[tuple[str, str, str], ...] = (
    (
        "mã có gạch, hai nhóm",
        "Mã đơn 1234-5678 đã giao",
        "mã đơn một nghìn hai trăm ba mươi tư đến năm nghìn sáu trăm bảy mươi tám đã giao",
    ),
)

# Cells deliberately left uncovered, each with its reason — not forgotten.
DELIBERATELY_UNCOVERED_RANGE_CELLS: dict[tuple[str, str], str] = {
    ("không đơn vị", "có khoảng trắng"): (
        "'10 - 15' viết cách không đơn vị trùng hình dạng với gạch đầu dòng và "
        "dấu ngang câu; luật chỉ nhận khi hai đầu là số nên ca này ĐƯỢC phủ bởi "
        "chính hàng 'dính' — thêm ca chỉ nhân đôi cùng một nhánh mã"
    ),
}

AMBIGUOUS_CARRIERS = ("Khai trương {}", "Giá {} nhé anh", "{}")


def test_ambiguous_policy_pinned() -> None:
    for raw, expected in CORPUS_AMBIGUOUS:
        got = normalize_vi(raw).text
        assert got == expected, f"{raw!r}: mong {expected!r}, nhận {got!r}"

    # The contract calls these CONSTANTS, so the same fragment must read the
    # same way in every carrier sentence — that is the measurable half of
    # "does not depend on sentence context".
    for raw, expected in CORPUS_AMBIGUOUS:
        counts = {
            normalize_vi(carrier.format(raw)).text.count(expected)
            for carrier in AMBIGUOUS_CARRIERS
        }
        assert counts == {1}, f"{raw!r} đọc khác nhau theo câu: {counts}"

    # The grid itself, asserted the way the other three corpora assert theirs:
    # every (kind × spacing) cell either holds a case or is named as knowingly
    # uncovered. Deleting a row from CORPUS_AMBIGUOUS now fails HERE, by cell
    # name, instead of quietly shrinking what AC-5 measures.
    pinned = {case for case, _ in CORPUS_AMBIGUOUS}
    missing = []
    for kind in RANGE_UNIT_KINDS:
        for spacing in RANGE_SPACING:
            cell = (kind, spacing)
            if cell in DELIBERATELY_UNCOVERED_RANGE_CELLS:
                continue
            case = RANGE_MATRIX.get(cell)
            if case is None or case not in pinned:
                missing.append(f"{kind}/{spacing}")
    assert missing == [], f"ô ma trận khoảng không có ca nào: {missing}"
    assert len(RANGE_MATRIX) + len(DELIBERATELY_UNCOVERED_RANGE_CELLS) == len(
        RANGE_UNIT_KINDS
    ) * len(RANGE_SPACING), "ma trận khoảng không phủ hết tích Descartes"

    # Trục ÂM. Đọc kỹ chú thích ở CORPUS_RANGE_NEGATIVE_KNOWN_LIMIT: ba dòng này
    # pins a LIMIT, not a correct behaviour. A failure here means the range rule
    # changed — update the contract's Known limits section at the same time,
    # rather than editing the expectation to match the code.
    for kind, raw, today in CORPUS_RANGE_NEGATIVE_KNOWN_LIMIT:
        got = normalize_vi(raw)
        assert got.text == today, (
            f"[{kind}] {raw!r}: giới hạn đã ghim đổi hành vi — mong {today!r}, "
            f"nhận {got.text!r}. Nếu đây là bản SỬA luật khoảng thì cập nhật cả "
            f"mục Known limits trong _acceptance/normalize-text-vi/contract.md."
        )
        assert got.ok is True, (
            f"[{kind}] {raw!r}: giới hạn này im lặng (ok=True) — đó chính là "
            f"lý do nó nguy hiểm và được ghim ở đây"
        )


# --------------------------------------------------------------------------
# AC-6 — the two halves of the post-check, on ONE fixture family.
# --------------------------------------------------------------------------

# A real string the library mis-parses: it reads "9001:2015" as a clock time and
# leaves two digit runs behind. Product codes like this appear in sales copy.
RESIDUAL_FIXTURE_BROKEN = "Đạt chuẩn ISO 9001:2015"
RESIDUAL_FIXTURE_CLEAN = "Căn hộ giá 1.999.000₫"


def test_residual_tokens_fail_and_are_listed() -> None:
    got = normalize_vi(RESIDUAL_FIXTURE_BROKEN)
    assert got.ok is False
    # Compared as a SET of tokens, not as a substring of the message: "the error
    # mentions it somewhere" is a weaker promise than "the error names exactly
    # what was left over".
    assert set(got.residual) == {"90", "15"}
    for token in got.residual:
        assert token in (got.error or "")

    # A surviving clock colon is unreadable too: "ngày 14:30" mis-parses in
    # the pinned library and came back as "ngày mười bốn:ba mươi" with ok=True
    # under the digit-only rule (S4 round 2 finding). Every clean reading
    # drops its colon, so rejecting it costs nothing correct.
    # The OTHER side of the same rule, in the same test so neither can drift:
    # prose whose colon simply lost its space is not a mangled clock. It has no
    # number, price or date at all, so rejecting it blocks a TTS chain over a
    # typo (measured S4 round 4: ok=False, residual=(':',)).
    for prose in ("Ghi chú:Xem thêm", "Nội dung:Khai trương hôm nay"):
        clean = normalize_vi(prose)
        assert clean.ok is True, (
            f"{prose!r} là văn xuôi không số — phải đọc được, nhận "
            f"ok={clean.ok} residual={clean.residual}"
        )

    got = normalize_vi("ngày 14:30")
    assert got.ok is False and ":" in got.residual, (
        f"dấu hai chấm sống sót phải bị từ chối — {got!r}"
    )


# Positive anchors for the money predicate, one per spelling. Without them
# every has_money assertion in this file is negative or symmetric, so a
# predicate degraded to always-False silently empties BOTH the E6b relational
# loop below AND the runtime money-loss rule that shares it (S4 round 2
# finding).
MONEY_POSITIVE_ANCHORS = (
    "1.999.000₫",
    "50.000đ",
    "125.000 đồng",
    "Vé 500.000VND",
    "Giá 2 triệu VNĐ",
    # The SPACED form — has_money always claimed it; since the Gate-2 scope
    # raise the pre-pass also reads it, so the claim finally has a green path.
    "Giá 500 đ",
    # UPPERCASE. All three layers missed it at once (S4 round 4): has_money said
    # False, the pre-pass left the letter alone, the residual rule never flags a
    # bare currency letter — so "Giá 500 Đ" came back ok=True reading "…năm trăm
    # đ". ALL-CAPS price copy is ordinary in the sales/BĐS text this node exists
    # for, and the sibling anchors (VNĐ/VND) always covered uppercase.
    "Giá 500 Đ",
    "GIÁ 1.999.000 Đ",
    "Giá 125.000 ĐỒNG",
)


def test_clean_input_has_no_digits_left() -> None:
    for anchor in MONEY_POSITIVE_ANCHORS:
        assert has_money(anchor) is True, f"{anchor!r} phải là giá tiền"

    # Uppercase must not just be DETECTED as money, it must READ OUT as money —
    # has_money alone was true for "500.000VND" long before anything expanded it.
    for raw in ("Giá 500 Đ", "GIÁ 1.999.000 Đ", "Giá 125.000 ĐỒNG"):
        upper = normalize_vi(raw)
        assert upper.ok is True and "đồng" in upper.text, (
            f"{raw!r}: giá viết HOA phải đọc ra chữ tiền, nhận "
            f"ok={upper.ok} text={upper.text!r}"
        )

    got = normalize_vi(RESIDUAL_FIXTURE_CLEAN)
    assert got.ok is True
    assert not any(ch.isdigit() for ch in got.text)
    assert "₫" not in got.text and "%" not in got.text
    # Relational half. A pure absence rule stays green when the library silently
    # EATS the currency word, which is the measured 0.2.3 defect: "1.999.000₫"
    # came back as "...chin muoi chin nghin" with no "dong" and no digits.
    assert "đồng" in got.text
    # Uses the implementation's own money test on purpose. Re-deciding "is this
    # a price?" inside the test is how the first draft of this file repeated the
    # exact bug it was meant to catch: `"đ" in raw` calls "-7 độ" a price.
    # NO `if result.ok` gate here. The runtime money-loss rule sets ok=False on
    # exactly the failure this loop claims to catch, so gating on ok made the
    # branch unreachable-red: lose the currency word and the loop SKIPS the case
    # (measured S4 round 5 — the old shape stayed green against a stub that
    # dropped "đồng"). The relation is asserted on the outcome, not guarded by
    # it: a money case must read out AND must keep its currency word.
    for raw, _ in CORPUS_MONEY:
        if not has_money(raw):
            continue
        result = normalize_vi(raw)
        assert result.ok, (
            f"{raw!r}: ca corpus mang tiền phải đọc được, nhận ok=False "
            f"residual={result.residual} error={result.error!r}"
        )
        assert "đồng" in result.text, f"{raw!r} mất đơn vị tiền: {result.text!r}"


# --------------------------------------------------------------------------
# AC-7 — determinism and idempotence over the WHOLE corpus.
# --------------------------------------------------------------------------

def _raw_inputs(corpus: object) -> tuple[str, ...]:
    """Every raw input a declared corpus carries, whatever its row shape.

    The corpora in this file are written in four shapes — pairs, triples, a
    matrix keyed by cell with a pair value, and a matrix keyed by cell with a
    bare input. Reading them by shape here is what lets the sweep below take
    ALL of them without each new matrix having to remember to enlist itself.
    """
    rows = corpus.values() if isinstance(corpus, dict) else corpus
    out: list[str] = []
    for row in rows:
        if isinstance(row, str):
            out.append(row)
        elif isinstance(row, tuple) and row:
            # (raw, expected) or (label, raw, expected)
            out.append(row[0] if len(row) == 2 else row[1])
    return tuple(out)


# Named explicitly rather than discovered, so the sweep's contents are readable
# — but test_determinism_sweep_covers_every_declared_corpus below FAILS if any
# module-level corpus is missing from it. AC-7 says "the WHOLE corpus", and
# before round 6 this tuple silently held four of the eleven declared bodies:
# every matrix added in rounds 4-6 was outside the determinism sweep while the
# heading still claimed to cover everything (S4 round 6 finding).
_DECLARED_CORPORA: tuple[tuple[str, object], ...] = (
    ("CORPUS_MONEY", CORPUS_MONEY),
    ("CORPUS_TIME", CORPUS_TIME),
    ("CORPUS_ID", CORPUS_ID),
    ("CORPUS_AMBIGUOUS", CORPUS_AMBIGUOUS),
    ("MAGNITUDE_DONG_MATRIX", MAGNITUDE_DONG_MATRIX),
    ("VN_AMOUNT_MATRIX", VN_AMOUNT_MATRIX),
    ("VN_AMOUNT_NEGATIVE", VN_AMOUNT_NEGATIVE),
    ("CORPUS_MONEY_MARK_UNAMBIGUOUS", CORPUS_MONEY_MARK_UNAMBIGUOUS),
    ("RANGE_MATRIX", RANGE_MATRIX),
    ("CORPUS_RANGE_NEGATIVE_KNOWN_LIMIT", CORPUS_RANGE_NEGATIVE_KNOWN_LIMIT),
    ("CORPUS_DASH_REFUSED", CORPUS_DASH_REFUSED),
    ("CORPUS_DOTTED_RANGE_READS", CORPUS_DOTTED_RANGE_READS),
    ("CORPUS_SLASH_REFUSED", CORPUS_SLASH_REFUSED),
    ("CORPUS_SLASH_NEGATIVE", CORPUS_SLASH_NEGATIVE),
    ("CORPUS_DAY_WORD_KEPT", CORPUS_DAY_WORD_KEPT),
    ("CORPUS_BRAND_REFUSED", CORPUS_BRAND_REFUSED),
    ("CORPUS_BRAND_NEGATIVE", CORPUS_BRAND_NEGATIVE),
    ("CORPUS_URL_REFUSED", CORPUS_URL_REFUSED),
    ("CORPUS_MONEY_LOWERCASE_ISO", CORPUS_MONEY_LOWERCASE_ISO),
    ("CORPUS_MONEY_LOWERCASE_ISO_NEGATIVE", CORPUS_MONEY_LOWERCASE_ISO_NEGATIVE),
    ("CORPUS_AMBIGUOUS_D", CORPUS_AMBIGUOUS_D),
    ("CORPUS_COMMA_LIST", CORPUS_COMMA_LIST),
    ("CORPUS_COMMA_UNREADABLE", CORPUS_COMMA_UNREADABLE),
    ("CORPUS_COMMA_READABLE", CORPUS_COMMA_READABLE),
    ("AMBIGUOUS_D_MATRIX", AMBIGUOUS_D_MATRIX),
    ("DICT_ABBREV_MATRIX", DICT_ABBREV_MATRIX),
    ("DICT_PREFIX_MATRIX", DICT_PREFIX_MATRIX),
    ("TYPOGRAPHIC_DASH_MATRIX", TYPOGRAPHIC_DASH_MATRIX),
    ("CORPUS_DASH_NEGATIVE", CORPUS_DASH_NEGATIVE),
    ("CORPUS_SLASH_KNOWN_LIMIT", CORPUS_SLASH_KNOWN_LIMIT),
    ("CORPUS_PATH_KNOWN_LIMIT", CORPUS_PATH_KNOWN_LIMIT),
    ("CORPUS_DATA_LOSS_KNOWN_LIMIT", CORPUS_DATA_LOSS_KNOWN_LIMIT),
    ("CORPUS_FALSE_REFUSAL_KNOWN_LIMIT", CORPUS_FALSE_REFUSAL_KNOWN_LIMIT),
)

ALL_CORPUS = tuple(
    (raw, "")
    for _, corpus in _DECLARED_CORPORA
    for raw in _raw_inputs(corpus)
)


def test_idempotence_exclusions_are_still_broken() -> None:
    """An exclusion that has quietly healed is a lie in the file.

    Without this, the day a library bump fixes the brand token, the mapping
    above keeps claiming a limit that no longer exists and the sweep keeps
    skipping an input it could now cover.
    """
    for raw, reason in IDEMPOTENCE_EXCLUDED.items():
        once = normalize_vi(raw).text
        twice = normalize_vi(once).text
        assert once != twice, (
            f"{raw!r} nay ĐÃ idempotent ({once!r}) — gỡ khỏi IDEMPOTENCE_EXCLUDED "
            f"và cập nhật Known limits. Lý do đang khai: {reason}"
        )


def test_determinism_sweep_covers_every_declared_corpus() -> None:
    """No declared corpus may sit outside the AC-7 sweep.

    The class claim is "the WHOLE corpus"; this is what makes adding a matrix
    without enlisting it a RED test instead of a silent shrinking of scope.
    """
    import sys

    module = sys.modules[__name__]
    enlisted = {name for name, _ in _DECLARED_CORPORA}
    declared = {
        name
        for name in vars(module)
        if (
            name.startswith("CORPUS_")
            or name.endswith("_MATRIX")
            # ...and the negative bodies, which carry the "what must NOT change"
            # half. Discovered by the same naming convention rather than listed,
            # so a new one cannot be added without this test seeing it.
            or name.endswith("_NEGATIVE")
        )
        and not name.startswith("DELIBERATELY_")
    }
    missing = sorted(declared - enlisted)
    assert not missing, (
        f"corpus khai ở module nhưng không vào phép quét tất định: {missing}"
    )
    stale = sorted(enlisted - declared)
    assert not stale, f"phép quét nhắc corpus không còn tồn tại: {stale}"

    swept = {raw for raw, _ in ALL_CORPUS}
    for name, corpus in _DECLARED_CORPORA:
        for raw in _raw_inputs(corpus):
            assert raw in swept, f"{name}: ca {raw!r} không vào phép quét"


# Inputs the AC-7 sweep skips, each with the reason spelled out. Written as a
# named mapping rather than left out of the corpus, so the exception is visible
# to a reader of this file and to the coverage checks above.
#
# The pinned library mangles the mixed-case brand token "VNDirect" into
# "ndi re" on the first pass and "di re" on the second, so the reading is
# already wrong before idempotence is even in question. That is the SAME
# silent-wrong-reading class the feature exists to stop, but for a shape no AC
# promises today (the existing brand test only asserts no currency word is
# injected). Surfaced 2026-08-22 by enlisting the brand rows in the sweep;
# awaiting owner triage at Gate 2 — see contract.md Known limits.
IDEMPOTENCE_EXCLUDED: dict[str, str] = {
    # The CAPITALISED spelling left this mapping on 2026-08-27: an unstable brand
    # token is now refused by name (AC-4). The all-lowercase spelling stays,
    # and the reason is structural rather than an oversight — the signal that
    # identifies a brand is an uppercase letter INSIDE the token, and
    # "vndirect" has none, so nothing separates it from an ordinary Vietnamese
    # word. Detecting it would need a brand list, which is the fork of the
    # reading library this contract's Out of scope rules out.
    "mua qua vndirect": (
        "dạng chữ thường không có tín hiệu cấu trúc nào để nhận là tên thương "
        "hiệu; nhận diện được nó đòi một danh sách tên riêng — ngoài phạm vi"
    ),
}


# The ONE input whose VERDICT is not idempotent, named rather than skipped.
#
# Deliberately narrow: it exempts the `.ok` comparison only, so the byte-level
# idempotence check still runs on this string. Putting it in
# IDEMPOTENCE_EXCLUDED would have hidden both.
#
# The flip is a CONSEQUENCE of a limit already declared under AC-10: money
# written without a space ("100đ") is not rewritten to the word "đồng" on pass
# one, so `_NUM_LEFT_OF_SLASH` — anchored on the WORD — reads that slash as
# prose. On pass two the input already says "đồng/kg", and the same slash is
# numeric. Same root as every other slash finding: a LEXICAL classifier.
#
# Owner đã xem chuỗi đầu ra của ca này rồi chốt đóng hồ sơ (2026-08-28). Khai
# trong contract §Known limits; đóng thật thuộc hợp đồng bo-phan-loai-token.
VERDICT_NOT_IDEMPOTENT: dict[str, str] = {
    "Giá 100đ/kg và/hoặc 200đ/lít": (
        "tiền viết liền '100đ' chỉ thành 'đồng' ở lượt sau, nên cùng một dấu "
        "gạch chéo bị xếp loại khác nhau giữa hai lượt — hệ quả của giới hạn "
        "AC-10 đã khai, cùng gốc phân loại từ vựng"
    ),
}


def test_verdict_flip_exclusions_are_still_broken() -> None:
    """An exemption that has quietly healed is a lie in the file."""
    for raw, reason in VERDICT_NOT_IDEMPOTENT.items():
        once = normalize_vi(raw)
        twice = normalize_vi(once.text)
        assert once.ok != twice.ok, (
            f"{raw!r} nay đã ĐỒNG NHẤT verdict qua hai lượt — gỡ khỏi "
            f"VERDICT_NOT_IDEMPOTENT và khỏi contract. Lý do đang khai: {reason}"
        )


def test_idempotent_and_byte_identical() -> None:
    for raw, _ in ALL_CORPUS:
        if raw in IDEMPOTENCE_EXCLUDED:
            continue
        once = normalize_vi(raw)
        # Determinism is promised for EVERY input, refused ones included: the
        # same string must always produce the same bytes.
        assert normalize_vi(raw).text == once.text, f"{raw!r} không tất định"
        if once.ok is False:
            # ...but idempotence is a promise about a READING, and a refused
            # input has none. Its `text` is a diagnostic showing how far the
            # library got, not output anyone speaks. Feeding that fragment back
            # in would measure the fragment, not the product. Narrowed
            # 2026-08-27, when the refusal families (comma, dash, brand, URL)
            # made refused inputs a normal part of the corpus rather than an
            # oddity.
            continue
        twice = normalize_vi(once.text)
        assert twice.text == once.text, f"{raw!r} không idempotent: {twice.text!r}"
        # The VERDICT has to be idempotent too, not just the bytes. This node
        # "sits in every chain and may run twice"; a chain that reads a string,
        # gets ok=True, then reads the result again and gets ok=False is blocked
        # on a string it already approved. Comparing only `.text` cannot see it —
        # the text is byte-identical in exactly that case (S4 round 6 finding).
        if raw in VERDICT_NOT_IDEMPOTENT:
            continue
        assert twice.ok == once.ok, (
            f"{raw!r}: đọc lại chính đầu ra của mình thì cờ lật "
            f"{once.ok} → {twice.ok} trong khi text KHÔNG đổi. Một dây chạy bộ "
            f"đọc hai lần sẽ bị chặn ở lần hai trên đúng chuỗi lần một đã duyệt. "
            f"residual lần hai: {twice.residual}"
        )


# --------------------------------------------------------------------------
# AC-8 — edges, and the Unicode form the voice actually receives.
# --------------------------------------------------------------------------

PLAIN = "Căn hộ đẹp không có số nào cả"
LONG_INPUT = "Giá 5 tỷ. " * 1000


def test_edge_inputs() -> None:
    for empty in ("", "   ", "\n\t"):
        got = normalize_vi(empty)
        assert got.ok is False and "rỗng" in (got.error or "")

    # Plain prose comes back unchanged EXCEPT for case: the library lowercases,
    # and capital letters carry no sound. Compared byte-for-byte, not "roughly".
    plain = normalize_vi(PLAIN)
    assert plain.ok is True
    assert plain.text == PLAIN.lower()

    assert normalize_vi(LONG_INPUT).ok is True

    # "must not raise" is not a measurement: this loop stayed green while the
    # URL case silently dropped the address and answered ok=True (S4 round 1
    # finding). Each messy input now states what it does, so a change of
    # behaviour is red here instead of invisible.
    url_case = normalize_vi("Xem tại https://a.vn nhé")
    assert url_case.ok is False, "URL bị nuốt mà vẫn nói ok=True"
    assert url_case.residual == ("https://a.vn",)

    # Read, not refused: "@" has a Vietnamese reading, so the sentence survives.
    # The Latin token "Mail" reads as "mêu" — an instance of the known limit
    # declared for AC-4 (a Latin token with no INTERNAL capital cannot be told
    # apart from a Vietnamese word), not a separate hole.
    email_case = normalize_vi("Mail: a@b.vn")
    assert email_case.ok is True
    assert "a còng" in email_case.text

    # An emoji carries no sound; dropping it loses nothing a voice could say.
    emoji_case = normalize_vi("Đẹp quá 😍")
    assert emoji_case.ok is True
    assert emoji_case.text == "đẹp quá"

    # Unicode form is the other half of Gate G1's "no broken diacritics", so it
    # is asserted as a RELATION between the two encodings — not as "did not
    # crash". A fixture typed on the same machine as the reader would otherwise
    # agree with itself in whichever form that machine happens to use.
    for raw, _ in ALL_CORPUS + ((PLAIN, ""),):
        got = normalize_vi(raw)
        assert unicodedata.is_normalized("NFC", got.text), f"{raw!r} ra không phải NFC"
        decomposed = unicodedata.normalize("NFD", raw)
        got_nfd = normalize_vi(decomposed)
        assert got_nfd.text == got.text, f"{raw!r} lệch giữa NFC và NFD"
        # `.ok` must agree too, not just `.text`: had_money used to be computed
        # on the RAW input while the money patterns are NFC literals, so NFD
        # input skipped the money-loss rule — same text out, different verdict.
        # A text-only comparison stayed green on exactly that hole (measured,
        # S4 round 1 finding).
        assert got_nfd.ok == got.ok, f"{raw!r}: ok lệch giữa NFC và NFD"
        assert has_money(decomposed) == has_money(raw), (
            f"{raw!r}: has_money lệch giữa NFC và NFD"
        )
