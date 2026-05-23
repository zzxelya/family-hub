import { NextRequest, NextResponse } from "next/server";
import { checkAuth, getMemberIdFromRequest } from "@/lib/auth";
import { supabase, createServerClient } from "@/lib/supabase";

const VALID_RECURRENCE = ["none", "yearly", "monthly"] as const;

export async function GET() {
  const { data, error } = await supabase
    .from("events")
    .select("*, member:members(*)")
    .order("date", { ascending: true });

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
  const { title, date, recurrence, description } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0 || title.length > 100) {
    return NextResponse.json({ error: "标题无效（1-100 字符）" }, { status: 400 });
  }
  if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "日期格式无效" }, { status: 400 });
  }

  const memberId = await getMemberIdFromRequest(request.headers);
  if (!memberId) {
    return NextResponse.json({ error: "请先选择身份" }, { status: 400 });
  }

  const insertData: Record<string, unknown> = {
    title: title.trim(),
    date,
    recurrence: VALID_RECURRENCE.includes(recurrence) ? recurrence : "none",
    description: typeof description === "string" ? description.slice(0, 500) : "",
    member_id: memberId,
  };

  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("events")
    .insert([insertData])
    .select("*, member:members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAuth(request.headers))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { id, title, date, recurrence, description } = body;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof title === "string" && title.trim().length > 0 && title.length <= 100) {
    updates.title = title.trim();
  }
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    updates.date = date;
  }
  if (VALID_RECURRENCE.includes(recurrence)) {
    updates.recurrence = recurrence;
  }
  if (typeof description === "string") {
    updates.description = description.slice(0, 500);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "无有效更新字段" }, { status: 400 });
  }

  const serverClient = createServerClient();
  const { data, error } = await serverClient
    .from("events")
    .update(updates)
    .eq("id", id)
    .select("*, member:members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
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
  const { error } = await serverClient.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
