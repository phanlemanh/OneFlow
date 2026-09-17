import { NextResponse } from "next/server";
import { readSkillRun } from "@/lib/skills/run.server";
export async function GET(
    _req: Request,
    ctx: { params: Promise<{ taskId: string }> },
) {
    const run = await readSkillRun((await ctx.params).taskId);
    return run
        ? NextResponse.json(run)
        : NextResponse.json({ code: "SKILL_RUN_NOT_FOUND" }, { status: 404 });
}
