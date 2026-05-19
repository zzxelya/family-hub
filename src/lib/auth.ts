import { cookies } from "next/headers";

const FAMILY_PASSWORD = process.env.FAMILY_PASSWORD || "family123";
const SESSION_COOKIE = "family_hub_auth";
const MEMBER_COOKIE = "family_hub_member";

export function verifyPassword(password: string): boolean {
  return password === FAMILY_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === "authenticated";
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
    httpOnly: false,
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
