import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAuthCookie, clearAuthCookie, checkLoginRateLimit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  if (!checkLoginRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "尝试次数过多，请稍后再试" },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { success: false, error: "请输入密码" },
      { status: 400 }
    );
  }

  if (verifyPassword(password)) {
    await setAuthCookie();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: "密码错误" },
    { status: 401 }
  );
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
