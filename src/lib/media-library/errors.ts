/**
 * The failure taxonomy OneFlow speaks at this boundary.
 *
 * Classification reads the HTTP status plus the response's `error` FIELD, never
 * the prose: the service answers in Vietnamese ("forbidden: cần scope search")
 * and is free to reword at any time, so a regex over the message is a bug
 * waiting for a copy edit.
 *
 * There is deliberately no RATE_LIMITED arm: the service has no rate limiting
 * anywhere, so a 429 branch would be dead code impersonating care.
 */
/**
 * The taxonomy as a VALUE, not just a type.
 *
 * A test that wants to say "every failure code gets its own message" has to be
 * able to enumerate them; when the only artifact was a type, the tests wrote
 * their own literal list instead — and those lists went stale twice without a
 * single assertion going red (they still said eight after VERSION_MISMATCH and
 * LOCAL_FAILURE joined). Deriving the type from this array means a code added
 * here reaches every test that iterates it, and a list that drifts stops
 * compiling rather than quietly measuring less.
 *
 * LOCAL_FAILURE is OneFlow's own side failing — the file store, most likely.
 * Separate from NETWORK_ERROR on purpose: a full disk reported as "could not
 * reach the library" sends the user to check a key or a URL that were never the
 * problem.
 */
export const MEDIA_LIBRARY_ERROR_CODES = [
    "MISSING_CONFIG",
    /**
     * The key store could not be read, so we cannot tell whether the values are
     * configured. Distinct from MISSING_CONFIG on purpose: collapsing the two
     * put the user in front of a "you have not configured this" panel with no
     * fields and a live Save button, which is the misleading half of the bug
     * `chong-mat-khoa-byo-giao-dien` exists to remove.
     */
    "STORE_UNREADABLE",
    "AUTH_REJECTED",
    "MISSING_SCOPE",
    "BAD_REQUEST",
    "NOT_FOUND",
    "UPSTREAM_ERROR",
    "NOT_IMPLEMENTED",
    "BAD_RESPONSE",
    "NETWORK_ERROR",
    "VERSION_MISMATCH",
    "LOCAL_FAILURE",
] as const;

export type MediaLibraryErrorCode = (typeof MEDIA_LIBRARY_ERROR_CODES)[number];

export interface MediaLibraryFailure {
    code: MediaLibraryErrorCode;
    message: string;
    /**
     * Present only on MISSING_CONFIG: the variable names that are absent, so the
     * caller can render one field per name instead of parsing them back out of
     * the sentence. The sentence is for people; this list is for the form.
     */
    missing?: string[];
}

export function classify(
    status: number,
    errorField: string,
): MediaLibraryFailure {
    if (status === 401) {
        return {
            code: "AUTH_REJECTED",
            message: "Khoá media-library không được chấp nhận.",
        };
    }
    if (status === 403) {
        return {
            code: "MISSING_SCOPE",
            message:
                "Khoá thiếu quyền search — xin cấp scope search cho khoá này.",
        };
    }
    if (status === 501 || errorField === "not_implemented") {
        return {
            code: "NOT_IMPLEMENTED",
            message:
                "Dịch vụ media-library chưa nối đủ phụ thuộc cho lối gọi này.",
        };
    }
    if (status === 404) {
        return {
            code: "NOT_FOUND",
            message:
                "Không thấy asset — đã xoá, hoặc khoá này không thấy được nó.",
        };
    }
    if (status === 400) {
        return {
            code: "BAD_REQUEST",
            message: "Yêu cầu gửi tới media-library không hợp lệ.",
        };
    }
    return {
        code: "UPSTREAM_ERROR",
        message: `media-library trả lỗi ${status}.`,
    };
}
