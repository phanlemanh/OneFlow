/**
 * ADR-0012 guarantee #7: the boundary is versioned, and a mismatch refuses BY
 * NAME rather than guessing.
 *
 * The ADR says "major mismatch". This pins the whole 0.2 LINE because the
 * library is at 0.x, where minor IS the breaking axis: 0.1.0 -> 0.2.0 is what
 * introduced the search surface this node consumes. From 1.0.0 on, only major
 * is compared. Loosening later is cheap; tightening after shipping is not.
 */
export const SUPPORTED_CONTRACTS = "0.2";

export type VersionVerdict = { ok: true } | { ok: false; message: string };

export function checkContractsVersion(received: string): VersionVerdict {
    const [major = "", minor = ""] = String(received).split(".");
    const [wantMajor = "", wantMinor = ""] = SUPPORTED_CONTRACTS.split(".");
    const compatible =
        major === wantMajor && (major !== "0" || minor === wantMinor);
    return compatible
        ? { ok: true }
        : {
              ok: false,
              message: `Lệch phiên bản hợp đồng media-library: OneFlow ghim ${SUPPORTED_CONTRACTS}, dịch vụ trả ${received}. Đã dừng, không đọc dữ liệu theo hình dạng cũ.`,
          };
}
