import { NextRequest, NextResponse } from "next/server";
import { checkAuth, getMemberIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request.headers))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const memberId = await getMemberIdFromRequest(request.headers);
  return NextResponse.json({ memberId });
}
