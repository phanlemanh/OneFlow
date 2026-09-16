/**
 * Test harness for the skill panel (tests only).
 *
 * Nothing the panel reads is typed by hand: `fetch` is routed to the REAL
 * route handlers over the temp database, and `EventSource` is a stand-in for
 * the wait route that dispatches the task through the REAL runner and forwards
 * the events the REAL engine delegate emits, serialised exactly as the wait
 * route serialises them. The caller mocks the edges this cannot own: the
 * plugin registry, the engine child process, and the upload helper.
 */
import { NextIntlClientProvider } from "next-intl";
import vi from "@/i18n/messages/vi.json";

export const messages = vi;

export function ViIntl({ children }: { children: React.ReactNode }) {
    return (
        <NextIntlClientProvider
            locale="vi"
            messages={vi}
            timeZone="Asia/Ho_Chi_Minh"
        >
            {children}
        </NextIntlClientProvider>
    );
}

export interface FetchLog {
    runBodies: unknown[];
    /** Shape problems in route answers the panel depends on. */
    contractErrors: string[];
}

/** Route the panel's fetches to the real handlers. */
export async function installRouteFetch(log: FetchLog): Promise<void> {
    const list = await import("@/app/api/skills/route");
    const runRoute = await import("@/app/api/skills/[id]/run/route");
    const runs = await import("@/app/api/skills/runs/[taskId]/route");
    const plan = await import("@/app/api/skills/runs/[taskId]/plan/route");
    const fake = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const path = url.replace(/^https?:\/\/[^/]+/, "");
        let m = path.match(/^\/api\/skills\/runs\/([^/]+)\/plan$/);
        if (m) {
            const taskId = decodeURIComponent(m[1]);
            return plan.GET(new Request(`http://localhost${path}`), {
                params: Promise.resolve({ taskId }),
            });
        }
        m = path.match(/^\/api\/skills\/runs\/([^/]+)$/);
        if (m) {
            const taskId = decodeURIComponent(m[1]);
            const res = await runs.GET(new Request(`http://localhost${path}`), {
                params: Promise.resolve({ taskId }),
            });
            const body = await res.clone().json();
            // The panel reads these fields; a renamed one should fail by name,
            // not as a render that never settles.
            for (const field of ["status", "steps", "outputs", "error"]) {
                if (res.status === 200 && !(field in body)) {
                    log.contractErrors.push(`run view lacks field "${field}"`);
                }
            }
            return res;
        }
        m = path.match(/^\/api\/skills\/([^/]+)\/run$/);
        if (m) {
            const id = decodeURIComponent(m[1]);
            log.runBodies.push(JSON.parse(String(init?.body ?? "{}")));
            return runRoute.POST(
                new Request(`http://localhost${path}`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: String(init?.body ?? "{}"),
                }) as never,
                { params: Promise.resolve({ id }) },
            );
        }
        if (path === "/api/skills") return list.GET();
        throw new Error(`unrouted fetch in panel test: ${url}`);
    };
    globalThis.fetch = fake as typeof fetch;
}

/** EventSource that behaves like /api/task/wait for one task. */
export async function installWaitRouteEventSource(): Promise<void> {
    const { onTaskEvent } = await import("@/lib/task/emitter");
    const { jsonStringifyForSse } = await import("@/lib/json-sse");
    const { dispatchTask } = await import("@/lib/task/runner");
    class WaitRouteEventSource {
        onmessage: ((event: { data: string }) => void) | null = null;
        onerror: (() => void) | null = null;
        private unsubscribe: () => void;
        constructor(url: string) {
            const taskId =
                new URL(url, "http://localhost").searchParams.get("taskId") ??
                "";
            this.unsubscribe = onTaskEvent(taskId, (event) => {
                this.onmessage?.({ data: jsonStringifyForSse(event) });
            });
            void dispatchTask(taskId);
        }
        close() {
            this.unsubscribe();
        }
    }
    globalThis.EventSource =
        WaitRouteEventSource as unknown as typeof EventSource;
}
