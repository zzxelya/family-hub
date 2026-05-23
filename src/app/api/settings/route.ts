import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth";
import { supabase, createServerClient } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("settings").select("key, value");

  if (error) {
    // Table may not exist yet, return empty
    return NextResponse.json({});
  }

  const settings: Record<string, string> = {};
  for (const row of data) {
    settings[row.key] = row.value;
  }
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  if (!(await checkAuth(request.headers))) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  const body = await request.json();
  const { key, value } = body;

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "缺少 key" }, { status: 400 });
  }

  const serverClient = createServerClient();
  const { error } = await serverClient
    .from("settings")
    .upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
