import { NextResponse } from "next/server";
import { isAuthenticated, getSelectedMemberId } from "@/lib/auth";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const memberId = await getSelectedMemberId();
  return NextResponse.json({ memberId });
}
