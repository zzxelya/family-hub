import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, getSelectedMemberId } from "@/lib/auth";
import { supabase, createServerClient } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("messages")
    .select("*, member:members(*)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { content } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "留言内容不能为空" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "留言内容不能超过 500 字符" }, { status: 400 });
  }

  const memberId = await getSelectedMemberId();
  if (!memberId) {
    return NextResponse.json({ error: "请先选择身份" }, { status: 400 });
  }

  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("messages")
    .insert([{ content: content.trim(), member_id: memberId }])
    .select("*, member:members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
  }

  const serverClient = createServerClient();
  const { error } = await serverClient.from("messages").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
