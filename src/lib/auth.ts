import { cookies } from "next/headers";

const FAMILY_PASSWORD = process.env.FAMILY_PASSWORD;
if (!FAMILY_PASSWORD) {
  throw new Error("FAMILY_PASSWORD environment variable is required");
}

const SESSION_COOKIE = "family_hub_auth";
const MEMBER_COOKIE = "family_hub_member";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 60 * 1000;

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    return false;
  }

  entry.count++;
  return true;
}

export function verifyPassword(password: string): boolean {
  return password === FAMILY_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  if (cookieStore.get(SESSION_COOKIE)?.value === "authenticated") {
    return true;
  }

  return false;
}

export function isHeaderAuthenticated(headers: Headers): boolean {
  return headers.get("x-family-password") === FAMILY_PASSWORD;
}

export function checkAuth(headers: Headers): boolean {
  const headerPassword = headers.get("x-family-password");
  if (headerPassword === FAMILY_PASSWORD) {
    return true;
  }
  return false;
}

export async function setAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function setSelectedMember(memberId: string) {
  const cookieStore = await cookies();
  cookieStore.set(MEMBER_COOKIE, memberId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getSelectedMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(MEMBER_COOKIE)?.value || null;
}

export async function getMemberIdFromRequest(headers: Headers): Promise<string | null> {
  return headers.get("x-member-id") || await getSelectedMemberId();
}
