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
export type MediaLibraryErrorCode =
    | "MISSING_CONFIG"
    | "AUTH_REJECTED"
    | "MISSING_SCOPE"
    | "BAD_REQUEST"
    | "NOT_FOUND"
    | "UPSTREAM_ERROR"
    | "NOT_IMPLEMENTED"
    | "BAD_RESPONSE"
    | "NETWORK_ERROR"
    | "VERSION_MISMATCH";

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
