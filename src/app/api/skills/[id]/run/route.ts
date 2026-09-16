import { type NextRequest, NextResponse } from "next/server";
import { submitSkillRun } from "@/lib/skills/run.server";
export async function POST(
    request: NextRequest,
    ctx: { params: Promise<{ id: string }> },
) {
    const { id } = await ctx.params;
    let body: unknown = {};
    try {
        body = await request.json();
    } catch {
        body = {};
    }
    const params =
        typeof body === "object" && body !== null
            ? (body as { params?: unknown }).params
            : undefined;
    const { status, ...payload } = await submitSkillRun(id, params ?? {});
    return NextResponse.json(payload, { status });
}
