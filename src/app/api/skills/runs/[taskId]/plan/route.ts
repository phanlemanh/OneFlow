import { NextResponse } from "next/server";
import { readSkillPlan } from "@/lib/skills/run.server";

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ taskId: string }> },
) {
    const plan = await readSkillPlan((await ctx.params).taskId);
    return plan
        ? NextResponse.json(plan)
        : NextResponse.json({ code: "SKILL_RUN_NOT_FOUND" }, { status: 404 });
}
