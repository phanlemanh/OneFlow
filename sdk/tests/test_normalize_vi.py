"""Golden corpus and invariants for the Vietnamese reader (AC-2..AC-8).

Every expected string here is what VIETNAMESE says, checked against the pinned
library rather than copied from it. Where the two disagree the fix goes into
tongflow/text/, never into a case: a corpus edited to match the library is a
corpus that can no longer catch the library.
"""

from __future__ import annotations

import unicodedata

from tongflow.text.normalize_vi import has_money, normalize_vi

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
)
MONEY_COUNT = 17

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
)
TIME_COUNT = 12

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
)
ID_COUNT = 16

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
        assert got.ok is True, f"{raw!r} → {got.error}"
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
)

AMBIGUOUS_CARRIERS = ("Khai trương {}", "Giá {} nhé anh", "{}")


def test_ambiguous_policy_pinned() -> None:
    for raw, expected in CORPUS_AMBIGUOUS:
        assert normalize_vi(raw).text == expected

    # The contract calls these CONSTANTS, so the same fragment must read the
    # same way in every carrier sentence — that is the measurable half of
    # "does not depend on sentence context".
    for raw, expected in CORPUS_AMBIGUOUS:
        counts = {
            normalize_vi(carrier.format(raw)).text.count(expected)
            for carrier in AMBIGUOUS_CARRIERS
        }
        assert counts == {1}, f"{raw!r} đọc khác nhau theo câu: {counts}"


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
    got = normalize_vi("ngày 14:30")
    assert got.ok is False and ":" in got.residual, (
        f"dấu hai chấm sống sót phải bị từ chối — {got!r}"
    )


def test_clean_input_has_no_digits_left() -> None:
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
    for raw, _ in CORPUS_MONEY:
        result = normalize_vi(raw)
        if result.ok and has_money(raw):
            assert "đồng" in result.text, f"{raw!r} mất đơn vị tiền"


# --------------------------------------------------------------------------
# AC-7 — determinism and idempotence over the WHOLE corpus.
# --------------------------------------------------------------------------

ALL_CORPUS = CORPUS_MONEY + CORPUS_TIME + CORPUS_ID + CORPUS_AMBIGUOUS


def test_idempotent_and_byte_identical() -> None:
    for raw, _ in ALL_CORPUS:
        once = normalize_vi(raw)
        assert normalize_vi(raw).text == once.text, f"{raw!r} không tất định"
        twice = normalize_vi(once.text)
        assert twice.text == once.text, f"{raw!r} không idempotent: {twice.text!r}"


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

    for messy in ("Xem tại https://a.vn nhé", "Mail: a@b.vn", "Đẹp quá 😍"):
        normalize_vi(messy)  # must not raise

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
