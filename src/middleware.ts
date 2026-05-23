import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/api/auth"];
const FAMILY_PASSWORD = process.env.FAMILY_PASSWORD || "family123";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("family_hub_auth");

  if (authCookie?.value === "authenticated") {
    return NextResponse.next();
  }

  // 支持小程序通过密码头认证
  const passwordHeader = request.headers.get("x-family-password");
  if (passwordHeader === FAMILY_PASSWORD) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
