import { NextResponse } from "next/server";
import { listSkills } from "@/lib/skills/run.server";
export async function GET() {
    return NextResponse.json({ skills: listSkills() });
}
