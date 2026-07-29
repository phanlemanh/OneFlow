# Review Findings: stale-scope-by-paths (round 2)

## Trong hợp đồng

- **Monorepo layout silently skips the declared-paths cross-check (fail-open narrow scope)**
  file: `scripts/pre-merge-check.sh:646`
  severity: high
  AC: AC-5
  source: bugs
  detail: slug_acceptance_touched() matches only the top-level-anchored prefix `case "$f" in "_acceptance/$1/"*)`, while every sibling consumer of the same `git diff --name-only` list accepts both spellings: slug_in_diff() (line 755) uses `_acceptance/"$1"/*|*/_acceptance/"$1"/*`, and stale_files() (line 627) / gated_coverage() (line 543) use `_acceptance/*|*/_acceptance/*`. git diff paths are relative to the git top-level, not $ROOT, so in the `pkg/_acceptance/` monorepo layout the script explicitly documents (comments at lines 577-586 and 744-749) this function always returns 1. The `elif slug_acceptance_touched "$slug"` branch at line 1077 therefore never runs, the declaration is never cross-checked against the PR's gated diff, and narrow scope is granted unchecked — AC-5/AC-7 are dead in that layout.

    Reproduced with identical fixtures differing only in root placement (PR touches its own _acceptance/fx/run-log.jsonl plus src/other/new.txt, which the declaration does not cover):
      - flat root: `NOTE [fx]: declared eval paths do not cover this PR's gated diff` + `VIOLATION [fx]: evidence is stale`
      - pkg/ root: `NOTE [fx]: narrow staleness scope applied (pkg/src/covered/**) — suppressed 1 whole-tree change(s)` then `pre-merge-check: clean`, rc 0.

    No guard covers it: mk_subdir_fixture (scripts/acceptance/fixtures.sh:243) takes --base AFTER the report commit, so both monorepo halves of case_in_scope deliberately sit outside the cross-check. Fix: accept `*/_acceptance/"$1"/*` as well, matching slug_in_diff().
  rationale: Finding tai tao dung kich ban AC-5 mo ta (paths khai bao khong phu coverage set, _acceptance/<slug>/ nam trong PR diff) va cho thay o bo cuc monorepo, gate cap narrow scope 'clean' thay vi tu choi va in danh sach file chua phu nhu AC-5 yeu cau.

- **feature_scope() completeness is a line count, so a duplicate `paths:` key makes a partial declaration read as complete**
  file: `scripts/pre-merge-check.sh:493`
  severity: medium
  AC: AC-4
  source: bugs
  detail: Completeness is decided by `[ "$n_evals" -eq "$n_paths" ]`, comparing the number of `- id:` lines against the number of lines matching the paths grammar — never per eval. Two `paths:` lines under one eval and none under another balances the count, so feature_scope returns 0 ("complete") and narrow scope is granted from a partial declaration, silently dropping the undeclared eval's implicit whole-tree scope. This is precisely the failure mode AC-4 and perturbation (b) of run_mutation_case (scripts/acceptance/fixtures.sh:352) exist to prove is caught.

    Confirmed by extracting the shipped function and running it on:
      evals:
        - id: E1
          paths: ["src/a/**"]
          paths: ["src/b/**"]
        - id: E2
          criterion: AC-2
    → rc=0, union `src/a/** src/b/**`; E2 contributes nothing. A copy-paste duplicate line is enough to trigger it, and it is the one shape the "whitelist what is understood" grammar does not refuse.
  rationale: Ban than finding trich dan ro: day chinh la 'the failure mode AC-4... exist to prove is caught' — khai bao paths tren mot phan eval (do trung dong paths:) phai duoc doc la 'not-declared' va fallback whole-tree theo AC-4, nhung bi doc nham la 'complete'.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Vietnamese comments and gate output added to tracked code — repo rule is English-only**
  Người dùng thấy gì: Nhieu dong chu thich va thong bao canh bao khi gate chan merge hien dang viet bang tieng Viet, khien thanh vien nhom khong doc duoc tieng Viet kho hieu vi sao merge bi chan hoac cach khac phuc.
  file: `scripts/pre-merge-check.sh`
  severity: high
  Đề xuất: new-contract

- **Branch leaves its own Acceptance Gate CI job red (8 violations)**
  Người dùng thấy gì: Chay kiem tra tu dong tren chinh nhanh nay van bao that bai vi bay tinh nang khac chua lien quan bi danh dau la bang chung da cu — day la he qua da duoc ghi nhan truoc, nhung nguoi merge nhanh nay se van thay pipeline do.
  file: `_acceptance/stale-scope-by-paths/evidence-report.md`
  severity: high
  Đề xuất: known-limits

- **Comment in lib/evidence-core.js truncated mid-sentence by the kit bump**
  Người dùng thấy gì: Mot doan chu thich giai thich quy tac xu ly bang chung bi cat cut giua chung do lan cap nhat thu vien nen, khien nguoi doc sau nay kho hieu dung quy tac chuyen trang thai da tai lieu hoa.
  file: `lib/evidence-core.js`
  severity: low
  Đề xuất: known-limits

- **New executors.script entries drop the quoting style every existing entry uses**
  Người dùng thấy gì: Cac dong cau hinh moi khong duoc dat trong dau ngoac kep giong cac dong cu, hien khong gay loi nhung tao rui ro doc sai gia tri cau hinh trong tuong lai neu gia tri chua ky tu dac biet.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Dead assertion in the AC-4 guard: `grep -q 'narrow scope'` matches no gate output**
  Người dùng thấy gì: Mot dieu kien kiem tra trong bo kiem thu tu dong cho truong hop khai bao thieu khong bao gio duoc kich hoat, nen neu logic lien quan bi hong trong tuong lai, bo kiem thu se khong bat duoc loi do.
  file: `scripts/acceptance/check-stale-scoping.sh`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/stale-scope-by-paths/evidence-report.md, lib/evidence-core.js, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
