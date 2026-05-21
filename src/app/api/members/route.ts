import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { supabase, createServerClient } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at");

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
  const { name, avatar_url, color } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 50) {
    return NextResponse.json({ error: "名称无效（1-50 字符）" }, { status: 400 });
  }

  const insertData: Record<string, string> = { name: name.trim() };
  if (typeof avatar_url === "string" && avatar_url.length <= 500) {
    insertData.avatar_url = avatar_url;
  }
  if (typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)) {
    insertData.color = color;
  }

  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("members")
    .insert([insertData])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, avatar_url, color } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (typeof name === "string" && name.trim().length > 0 && name.length <= 50) {
    updates.name = name.trim();
  }
  if (typeof avatar_url === "string" && avatar_url.length <= 500) {
    updates.avatar_url = avatar_url;
  }
  if (typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)) {
    updates.color = color;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "无有效更新字段" }, { status: 400 });
  }

  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("members")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
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
  const { error } = await serverClient.from("members").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
