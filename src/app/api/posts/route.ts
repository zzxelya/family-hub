import { NextRequest, NextResponse } from "next/server";
import { checkAuth, getMemberIdFromRequest } from "@/lib/auth";
import { supabase, createServerClient } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("posts")
    .select("*, member:members(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request.headers))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, image_urls } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "标题不能为空" }, { status: 400 });
  }
  if (title.length > 100) {
    return NextResponse.json({ error: "标题不能超过 100 字符" }, { status: 400 });
  }
  if (content && typeof content === "string" && content.length > 5000) {
    return NextResponse.json({ error: "内容不能超过 5000 字符" }, { status: 400 });
  }

  const memberId = await getMemberIdFromRequest(request.headers);
  if (!memberId) {
    return NextResponse.json({ error: "请先选择身份" }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    title: title.trim(),
    content: typeof content === "string" ? content : "",
    member_id: memberId,
  };

  if (Array.isArray(image_urls)) {
    insertData.image_urls = image_urls.filter(
      (url: unknown) => typeof url === "string" && url.length <= 500
    );
  }

  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("posts")
    .insert([insertData])
    .select("*, member:members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth(request.headers))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
  }

  const serverClient = createServerClient();
  const { error } = await serverClient.from("posts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
