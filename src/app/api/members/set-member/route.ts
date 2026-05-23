import { NextRequest, NextResponse } from "next/server";
import { checkAuth, setSelectedMember } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request.headers))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { memberId } = await request.json();

  if (!memberId || typeof memberId !== "string") {
    return NextResponse.json({ error: "无效的成员 ID" }, { status: 400 });
  }

  // Verify the member exists
  const { data } = await supabase
    .from("members")
    .select("id")
    .eq("id", memberId)
    .single();

  if (!data) {
    return NextResponse.json({ error: "成员不存在" }, { status: 400 });
  }

  await setSelectedMember(memberId);
  return NextResponse.json({ success: true });
}
