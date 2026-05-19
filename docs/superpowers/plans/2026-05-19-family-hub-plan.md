# Family Hub 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个3-5人家庭使用的私密沟通分享网站，支持留言、生活日志、照片相册和日程管理，部署在 Vercel。

**Architecture:** Next.js App Router + Supabase（数据库+存储+实时推送）。统一密码保护入口，选择成员身份后使用。手机优先响应式设计。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Storage, Realtime), Vercel

---

## 文件结构

```
D:\family\
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局（字体、全局样式）
│   │   ├── page.tsx                # 密码入口页
│   │   ├── home/
│   │   │   └── page.tsx            # 家庭主页
│   │   ├── messages/
│   │   │   └── page.tsx            # 留言板
│   │   ├── journal/
│   │   │   └── page.tsx            # 生活日志
│   │   ├── gallery/
│   │   │   └── page.tsx            # 照片相册
│   │   ├── calendar/
│   │   │   └── page.tsx            # 日程管理
│   │   └── api/
│   │       ├── auth/
│   │       │   └── route.ts        # 密码验证 API
│   │       ├── members/
│   │       │   └── route.ts        # 成员 CRUD API
│   │       ├── messages/
│   │       │   └── route.ts        # 留言 CRUD API
│   │       ├── posts/
│   │       │   └── route.ts        # 日志 CRUD API
│   │       ├── events/
│   │       │   └── route.ts        # 日程 CRUD API
│   │       └── upload/
│   │           └── route.ts        # 图片上传 API
│   ├── components/
│   │   ├── Navbar.tsx              # 顶部导航栏
│   │   ├── MemberSelector.tsx      # 成员身份选择器
│   │   ├── MemberAvatar.tsx        # 成员头像组件
│   │   ├── MessageItem.tsx         # 单条留言组件
│   │   ├── MessageForm.tsx         # 留言发送表单
│   │   ├── PostCard.tsx            # 日志卡片组件
│   │   ├── PostForm.tsx            # 日志发布表单
│   │   ├── PhotoGrid.tsx           # 照片网格组件
│   │   ├── EventItem.tsx           # 日程条目组件
│   │   ├── EventForm.tsx           # 日程添加表单
│   │   └── ActivityFeed.tsx        # 动态流组件
│   ├── lib/
│   │   ├── supabase.ts             # Supabase 客户端初始化
│   │   ├── auth.ts                 # 密码验证和 session 工具
│   │   └── types.ts                # TypeScript 类型定义
│   └── middleware.ts               # 密码保护中间件
├── supabase/
│   └── schema.sql                  # 数据库建表和 RLS 策略
├── public/
│   └── default-avatar.png          # 默认头像
├── .env.local.example              # 环境变量示例
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .gitignore
```

---

### Task 1: 项目初始化

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.gitignore`, `.env.local.example`, `src/app/layout.tsx`

- [ ] **Step 1: 创建 Next.js 项目**

Run:
```powershell
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

在 `D:\family` 目录下执行。遇到提示全部选择默认值。

- [ ] **Step 2: 安装 Supabase 依赖**

Run:
```powershell
npm install @supabase/supabase-js
```

- [ ] **Step 3: 创建环境变量示例文件**

Create `.env.local.example`:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FAMILY_PASSWORD=your-family-password
```

- [ ] **Step 4: 创建 .env.local 并填写占位值**

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=placeholder
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
SUPABASE_SERVICE_ROLE_KEY=placeholder
FAMILY_PASSWORD=family123
```

- [ ] **Step 5: 确认 .gitignore 包含 .env.local**

Read `.gitignore` and verify it contains `.env.local`. If not, add it.

- [ ] **Step 6: 验证项目能启动**

Run:
```powershell
npm run dev
```

Expected: 服务器在 http://localhost:3000 启动，页面显示 Next.js 默认页面。Ctrl+C 停止。

- [ ] **Step 7: 清理默认内容，设置根布局**

Replace `src/app/layout.tsx` with:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Family Hub - 我们的家",
  description: "家人之间的沟通分享空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "chore: initialize Next.js project with Supabase dependency"
```

---

### Task 2: TypeScript 类型定义和 Supabase 客户端

**Files:**
- Create: `src/lib/types.ts`, `src/lib/supabase.ts`

- [ ] **Step 1: 创建类型定义文件**

Create `src/lib/types.ts`:
```typescript
export interface Member {
  id: string;
  name: string;
  avatar_url: string;
  color: string;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  member_id: string;
  created_at: string;
  member?: Member;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  member_id: string;
  image_urls: string[];
  created_at: string;
  member?: Member;
}

export interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  recurrence: "none" | "yearly" | "monthly";
  description: string;
  member_id: string;
  created_at: string;
  member?: Member;
}
```

- [ ] **Step 2: 创建 Supabase 客户端**

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "feat: add TypeScript types and Supabase client"
```

---

### Task 3: Supabase 数据库 Schema

**Files:**
- Create: `supabase/schema.sql`

- [ ] **Step 1: 创建数据库 Schema 文件**

Create `supabase/schema.sql`:
```sql
-- 家庭成员表
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 留言表
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 生活日志表
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  image_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 日程/纪念日表
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  recurrence TEXT DEFAULT 'none' CHECK (recurrence IN ('none', 'yearly', 'monthly')),
  description TEXT DEFAULT '',
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 启用 RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS 策略：允许 anon 角色读写（安全由应用层密码保护实现）
CREATE POLICY "Allow anon read on members" ON members FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on members" ON members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on members" ON members FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on members" ON members FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read on messages" ON messages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on messages" ON messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon delete on messages" ON messages FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read on posts" ON posts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on posts" ON posts FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on posts" ON posts FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on posts" ON posts FOR DELETE TO anon USING (true);

CREATE POLICY "Allow anon read on events" ON events FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on events" ON events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update on events" ON events FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow anon delete on events" ON events FOR DELETE TO anon USING (true);

-- Storage Buckets（需要在 Supabase Dashboard 手动创建或通过 API 创建）
-- 1. avatars bucket（公开读取）
-- 2. photos bucket（公开读取）

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC);
CREATE INDEX IF NOT EXISTS idx_messages_member_id ON messages(member_id);
CREATE INDEX IF NOT EXISTS idx_posts_member_id ON posts(member_id);
CREATE INDEX IF NOT EXISTS idx_events_member_id ON events(member_id);
```

- [ ] **Step 2: Commit**

```powershell
git add -A
git commit -m "feat: add Supabase database schema with RLS policies"
```

---

### Task 4: 密码验证和中间件保护

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/route.ts`, `src/middleware.ts`

- [ ] **Step 1: 创建认证工具函数**

Create `src/lib/auth.ts`:
```typescript
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
    maxAge: 60 * 60 * 24 * 30, // 30 天
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
```

- [ ] **Step 2: 创建密码验证 API**

Create `src/app/api/auth/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, setAuthCookie, clearAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (verifyPassword(password)) {
    await setAuthCookie();
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "密码错误" }, { status: 401 });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: 创建中间件保护路由**

Create `src/middleware.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/api/auth"];

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

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: add password auth with middleware route protection"
```

---

### Task 5: 密码入口页面

**Files:**
- Create: `src/app/page.tsx`

- [ ] **Step 1: 创建密码入口页**

Replace `src/app/page.tsx` with:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/home");
      } else {
        setError("密码错误，请重试");
      }
    } catch {
      setError("连接失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🏠</div>
            <h1 className="text-2xl font-bold text-gray-800">Family Hub</h1>
            <p className="text-gray-500 mt-2">我们的家</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入家庭密码"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-center text-lg"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl font-medium transition-colors"
            >
              {loading ? "验证中..." : "进入"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证页面**

Run:
```powershell
npm run dev
```

Expected: http://localhost:3000 显示密码登录页面，输入 `family123` 后跳转（此时会404因为 /home 还没创建，这是正常的）。

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "feat: add password login page"
```

---

### Task 6: 导航栏和成员选择器组件

**Files:**
- Create: `src/components/Navbar.tsx`, `src/components/MemberAvatar.tsx`, `src/components/MemberSelector.tsx`

- [ ] **Step 1: 创建成员头像组件**

Create `src/components/MemberAvatar.tsx`:
```tsx
import { Member } from "@/lib/types";

export default function MemberAvatar({
  member,
  size = "md",
}: {
  member: Member;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
      style={{ backgroundColor: member.color }}
      title={member.name}
    >
      {member.avatar_url ? (
        <img
          src={member.avatar_url}
          alt={member.name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        member.name.charAt(0)
      )}
    </div>
  );
}
```

- [ ] **Step 2: 创建成员选择器组件**

Create `src/components/MemberSelector.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

export default function MemberSelector() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchMembers();
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setSelectedId(saved);
  }, []);

  async function fetchMembers() {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at");
    if (data) setMembers(data);
  }

  async function selectMember(id: string) {
    setSelectedId(id);
    setShowDropdown(false);
    document.cookie = `family_hub_member=${id}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }

  const selected = members.find((m) => m.id === selectedId);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        {selected ? (
          <>
            <MemberAvatar member={selected} size="sm" />
            <span className="text-sm font-medium text-gray-700 max-w-[60px] truncate">
              {selected.name}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 px-2">选择身份</span>
        )}
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px] z-50">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => selectMember(member.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                selectedId === member.id ? "bg-indigo-50" : ""
              }`}
            >
              <MemberAvatar member={member} size="sm" />
              <span className="text-sm text-gray-700">{member.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 创建导航栏组件**

Create `src/components/Navbar.tsx`:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MemberSelector from "./MemberSelector";

const NAV_ITEMS = [
  { href: "/home", label: "主页", icon: "🏠" },
  { href: "/messages", label: "留言", icon: "💬" },
  { href: "/journal", label: "日志", icon: "📝" },
  { href: "/gallery", label: "相册", icon: "📸" },
  { href: "/calendar", label: "日程", icon: "📅" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/home" className="text-lg font-bold text-indigo-600">
            Family Hub
          </Link>
          <MemberSelector />
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                pathname === item.href
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "feat: add Navbar, MemberAvatar, and MemberSelector components"
```

---

### Task 7: 成员管理 API

**Files:**
- Create: `src/app/api/members/route.ts`

- [ ] **Step 1: 创建成员 API**

Create `src/app/api/members/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  const body = await request.json();
  const { data, error } = await supabase
    .from("members")
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("members").delete().eq("id", id!);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Commit**

```powershell
git add -A
git commit -m "feat: add members CRUD API"
```

---

### Task 8: 留言 API 和留言页面

**Files:**
- Create: `src/app/api/messages/route.ts`, `src/components/MessageItem.tsx`, `src/components/MessageForm.tsx`, `src/app/messages/page.tsx`

- [ ] **Step 1: 创建留言 API**

Create `src/app/api/messages/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  const body = await request.json();
  const { data, error } = await supabase
    .from("messages")
    .insert([body])
    .select("*, member:members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("messages").delete().eq("id", id!);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: 创建留言条目组件**

Create `src/components/MessageItem.tsx`:
```tsx
import { Message } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

export default function MessageItem({ message }: { message: Message }) {
  const time = new Date(message.created_at).toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-3 py-3">
      {message.member && <MemberAvatar member={message.member} size="sm" />}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-sm text-gray-800">
            {message.member?.name || "未知"}
          </span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <p className="text-gray-600 text-sm mt-0.5 whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建留言表单组件**

Create `src/components/MessageForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Message } from "@/lib/types";

export default function MessageForm({
  memberId,
  onSent,
}: {
  memberId: string | null;
  onSent: (message: Message) => void;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !content.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), member_id: memberId }),
      });
      const data = await res.json();
      if (res.ok) {
        setContent("");
        onSent(data);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={memberId ? "说点什么..." : "请先选择身份"}
        disabled={!memberId}
        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400"
        maxLength={500}
      />
      <button
        type="submit"
        disabled={sending || !content.trim() || !memberId}
        className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
      >
        发送
      </button>
    </form>
  );
}
```

- [ ] **Step 4: 创建留言页面**

Create `src/app/messages/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { Message } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MessageItem from "@/components/MessageItem";
import MessageForm from "@/components/MessageForm";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setMemberId(saved);

    fetchMessages();
  }, []);

  async function fetchMessages() {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data);
  }

  function handleMessageSent(message: Message) {
    setMessages((prev) => [message, ...prev]);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">留言板</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <MessageForm memberId={memberId} onSent={handleMessageSent} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              还没有留言，说点什么吧
            </p>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: add messages page with API, form, and real-time display"
```

---

### Task 9: 生活日志 API 和页面

**Files:**
- Create: `src/app/api/posts/route.ts`, `src/app/api/upload/route.ts`, `src/components/PostCard.tsx`, `src/components/PostForm.tsx`, `src/app/journal/page.tsx`

- [ ] **Step 1: 创建图片上传 API**

Create `src/app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "photos";

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const supabase = createServerClient();
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { contentType: file.type });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);

  return NextResponse.json({ url: urlData.publicUrl });
}
```

- [ ] **Step 2: 创建日志 API**

Create `src/app/api/posts/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  const body = await request.json();
  const { data, error } = await supabase
    .from("posts")
    .insert([body])
    .select("*, member:members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("posts").delete().eq("id", id!);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: 创建日志卡片组件**

Create `src/components/PostCard.tsx`:
```tsx
import { Post } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

export default function PostCard({ post }: { post: Post }) {
  const time = new Date(post.created_at).toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {post.image_urls.length > 0 && (
        <div className="grid gap-0.5">
          {post.image_urls.length === 1 ? (
            <img
              src={post.image_urls[0]}
              alt={post.title}
              className="w-full max-h-80 object-cover"
            />
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              {post.image_urls.slice(0, 4).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${post.title} - ${i + 1}`}
                  className="w-full aspect-square object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {post.member && <MemberAvatar member={post.member} size="sm" />}
          <span className="text-sm font-medium text-gray-700">
            {post.member?.name}
          </span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">{post.title}</h3>
        {post.content && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 创建日志发布表单**

Create `src/components/PostForm.tsx`:
```tsx
"use client";

import { useState, useRef } from "react";
import { Post } from "@/lib/types";

export default function PostForm({
  memberId,
  onCreated,
}: {
  memberId: string | null;
  onCreated: (post: Post) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "photos");

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [...prev, data.url]);
        }
      } catch {}
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !title.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          member_id: memberId,
          image_urls: images,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setContent("");
        setImages([]);
        setShowForm(false);
        onCreated(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        disabled={!memberId}
        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-2xl font-medium transition-colors text-sm"
      >
        {memberId ? "写新日志" : "请先选择身份"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">写日志</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="记录一下今天的生活..."
        rows={3}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm resize-none"
      />
      <div className="flex flex-wrap gap-2">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-20">
            <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm cursor-pointer transition-colors">
          {uploading ? "上传中..." : "添加图片"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
        >
          {submitting ? "发布中..." : "发布"}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 5: 创建日志页面**

Create `src/app/journal/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";

export default function JournalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setMemberId(saved);

    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  }

  function handlePostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">生活日志</h2>
        <PostForm memberId={memberId} onCreated={handlePostCreated} />
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            还没有日志，记录你的生活吧
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 6: Commit**

```powershell
git add -A
git commit -m "feat: add journal page with posts API, upload, and post form"
```

---

### Task 10: 照片相册页面

**Files:**
- Create: `src/components/PhotoGrid.tsx`, `src/app/gallery/page.tsx`

- [ ] **Step 1: 创建照片网格组件**

Create `src/components/PhotoGrid.tsx`:
```tsx
"use client";

import { useState } from "react";

export default function PhotoGrid({ photos }: { photos: { url: string; title: string }[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setSelected(photo.url)}
            className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected}
            alt="大图"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: 创建相册页面**

Create `src/app/gallery/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import Navbar from "@/components/Navbar";
import PhotoGrid from "@/components/PhotoGrid";

export default function GalleryPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.filter((p: Post) => p.image_urls.length > 0));
  }

  const allPhotos = posts.flatMap((post) =>
    post.image_urls.map((url) => ({ url, title: post.title }))
  );

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">照片相册</h2>
        {allPhotos.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            还没有照片，去日志里上传吧
          </div>
        ) : (
          <PhotoGrid photos={allPhotos} />
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "feat: add gallery page with photo grid and lightbox"
```

---

### Task 11: 日程管理 API 和页面

**Files:**
- Create: `src/app/api/events/route.ts`, `src/components/EventItem.tsx`, `src/components/EventForm.tsx`, `src/app/calendar/page.tsx`

- [ ] **Step 1: 创建日程 API**

Create `src/app/api/events/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  const body = await request.json();
  const { data, error } = await supabase
    .from("events")
    .insert([body])
    .select("*, member:members(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { id, ...updates } = body;
  const { data, error } = await supabase
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
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const { error } = await supabase.from("events").delete().eq("id", id!);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: 创建日程条目组件**

Create `src/components/EventItem.tsx`:
```tsx
import { FamilyEvent } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

const RECURRENCE_LABELS = {
  none: "",
  yearly: "每年",
  monthly: "每月",
};

export default function EventItem({ event }: { event: FamilyEvent }) {
  const date = new Date(event.date + "T00:00:00");
  const isBirthday = event.recurrence === "yearly";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let daysLabel = "";
  if (diffDays === 0) daysLabel = "今天";
  else if (diffDays === 1) daysLabel = "明天";
  else if (diffDays > 0) daysLabel = `${diffDays}天后`;
  else daysLabel = `已过${Math.abs(diffDays)}天`;

  const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`;

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
          isBirthday ? "bg-pink-50" : "bg-indigo-50"
        }`}
      >
        <span className={`text-lg font-bold ${isBirthday ? "text-pink-600" : "text-indigo-600"}`}>
          {date.getDate()}
        </span>
        <span className="text-[10px] text-gray-500">
          {date.getMonth() + 1}月
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">
            {isBirthday ? "🎂 " : ""}
            {event.title}
          </span>
          {event.recurrence !== "none" && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {RECURRENCE_LABELS[event.recurrence]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{monthDay}</span>
          <span className={`text-xs ${diffDays >= 0 ? "text-indigo-500" : "text-gray-400"}`}>
            {daysLabel}
          </span>
        </div>
        {event.description && (
          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
        )}
      </div>
      {event.member && <MemberAvatar member={event.member} size="sm" />}
    </div>
  );
}
```

- [ ] **Step 3: 创建日程表单组件**

Create `src/components/EventForm.tsx`:
```tsx
"use client";

import { useState } from "react";
import { FamilyEvent } from "@/lib/types";

export default function EventForm({
  memberId,
  onCreated,
}: {
  memberId: string | null;
  onCreated: (event: FamilyEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "yearly" | "monthly">("none");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !title.trim() || !date) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          description: description.trim(),
          recurrence,
          member_id: memberId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setDate("");
        setDescription("");
        setRecurrence("none");
        setShowForm(false);
        onCreated(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        disabled={!memberId}
        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-2xl font-medium transition-colors text-sm"
      >
        {memberId ? "添加日程" : "请先选择身份"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">添加日程</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="日程名称（如：妈妈生日）"
        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm"
        required
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm"
          required
        />
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as "none" | "yearly" | "monthly")}
          className="px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm"
        >
          <option value="none">不重复</option>
          <option value="yearly">每年</option>
          <option value="monthly">每月</option>
        </select>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="备注..."
        rows={2}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm resize-none"
      />
      <button
        type="submit"
        disabled={submitting || !title.trim() || !date}
        className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
      >
        {submitting ? "添加中..." : "添加"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: 创建日程页面**

Create `src/app/calendar/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { FamilyEvent } from "@/lib/types";
import Navbar from "@/components/Navbar";
import EventItem from "@/components/EventItem";
import EventForm from "@/components/EventForm";

export default function CalendarPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setMemberId(saved);

    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  }

  function handleEventCreated(event: FamilyEvent) {
    setEvents((prev) =>
      [...prev, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }

  const upcoming = events.filter((e) => new Date(e.date + "T00:00:00") >= new Date(new Date().toDateString()));
  const past = events.filter((e) => new Date(e.date + "T00:00:00") < new Date(new Date().toDateString()));

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">日程管理</h2>
        <EventForm memberId={memberId} onCreated={handleEventCreated} />

        {upcoming.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">即将到来</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
              {upcoming.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">已过</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
              {past.reverse().map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            还没有日程，添加一个吧
          </div>
        )}
      </main>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "feat: add calendar page with events API, form, and upcoming/past view"
```

---

### Task 12: 家庭主页

**Files:**
- Create: `src/components/ActivityFeed.tsx`, `src/app/home/page.tsx`

- [ ] **Step 1: 创建动态流组件**

Create `src/components/ActivityFeed.tsx`:
```tsx
import { Message, Post, FamilyEvent, Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

type ActivityItem =
  | { type: "message"; data: Message }
  | { type: "post"; data: Post }
  | { type: "event"; data: FamilyEvent };

export default function ActivityFeed({
  items,
  members,
}: {
  items: ActivityItem[];
  members: Member[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-center text-gray-400 py-8 text-sm">
        还没有动态，去留言或写日志吧
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {items.map((item, i) => {
        if (item.type === "message") {
          const member = members.find((m) => m.id === item.data.member_id);
          return (
            <div key={`msg-${i}`} className="flex gap-3 py-3">
              {member && <MemberAvatar member={member} size="sm" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {member?.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.data.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{item.data.content}</p>
              </div>
            </div>
          );
        }

        if (item.type === "post") {
          const member = members.find((m) => m.id === item.data.member_id);
          return (
            <div key={`post-${i}`} className="flex gap-3 py-3">
              {member && <MemberAvatar member={member} size="sm" />}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    {member?.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.data.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800">{item.data.title}</p>
                {item.data.image_urls.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {item.data.image_urls.slice(0, 3).map((url, j) => (
                      <img
                        key={j}
                        src={url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        }

        const member = members.find((m) => m.id === item.data.member_id);
        return (
          <div key={`evt-${i}`} className="flex gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm shrink-0">
              {item.data.recurrence === "yearly" ? "🎂" : "📅"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{item.data.title}</span>
                <span className="text-gray-400 ml-2">
                  {new Date(item.data.date + "T00:00:00").toLocaleDateString("zh-CN")}
                </span>
              </p>
              {member && (
                <p className="text-xs text-gray-400">由 {member.name} 添加</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 创建家庭主页**

Create `src/app/home/page.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Message, Post, FamilyEvent, Member } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MemberAvatar from "@/components/MemberAvatar";
import ActivityFeed from "@/components/ActivityFeed";

type ActivityItem =
  | { type: "message"; data: Message }
  | { type: "post"; data: Post }
  | { type: "event"; data: FamilyEvent };

export default function HomePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<FamilyEvent[]>([]);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchActivities()]);
  }, []);

  async function fetchMembers() {
    const res = await fetch("/api/members");
    const data = await res.json();
    setMembers(data);
  }

  async function fetchActivities() {
    const [msgRes, postRes, eventRes] = await Promise.all([
      fetch("/api/messages"),
      fetch("/api/posts"),
      fetch("/api/events"),
    ]);

    const messages: Message[] = await msgRes.json();
    const posts: Post[] = await postRes.json();
    const events: FamilyEvent[] = await eventRes.json();

    const today = new Date(new Date().toDateString());
    setUpcomingEvents(
      events.filter((e) => new Date(e.date + "T00:00:00") >= today).slice(0, 3)
    );

    const items: ActivityItem[] = [
      ...messages.slice(0, 10).map((m) => ({ type: "message" as const, data: m })),
      ...posts.slice(0, 10).map((p) => ({ type: "post" as const, data: p })),
      ...events.slice(0, 5).map((e) => ({ type: "event" as const, data: e })),
    ];

    items.sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() -
        new Date(a.data.created_at).getTime()
    );

    setActivities(items.slice(0, 15));
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4 space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-4">我们的家</h1>
          <div className="flex gap-3">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-1">
                <MemberAvatar member={member} size="lg" />
                <span className="text-xs opacity-90">{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/messages"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">💬</div>
            <div className="text-xs text-gray-600">留言</div>
          </Link>
          <Link
            href="/journal"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xs text-gray-600">日志</div>
          </Link>
          <Link
            href="/gallery"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">📸</div>
            <div className="text-xs text-gray-600">相册</div>
          </Link>
          <Link
            href="/calendar"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">📅</div>
            <div className="text-xs text-gray-600">日程</div>
          </Link>
        </div>

        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">即将到来</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
              {upcomingEvents.map((event) => {
                const date = new Date(event.date + "T00:00:00");
                const days = Math.ceil(
                  (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={event.id} className="flex items-center justify-between py-2">
                    <span className="text-sm">
                      {event.recurrence === "yearly" ? "🎂 " : "📅 "}
                      {event.title}
                    </span>
                    <span className="text-xs text-indigo-500">
                      {days <= 0 ? "今天" : `${days}天后`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">最新动态</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <ActivityFeed items={activities} members={members} />
          </div>
        </div>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add -A
git commit -m "feat: add home page with member cards, activity feed, and quick links"
```

---

### Task 13: 初始化 Git 仓库并推送到 GitHub

- [ ] **Step 1: 初始化 Git 仓库**

```powershell
git init
git add -A
git commit -m "feat: complete Family Hub - family communication and sharing website"
```

- [ ] **Step 2: 在 GitHub 创建仓库**

1. 访问 https://github.com/new
2. 仓库名：`family-hub`
3. 选择 Private（私有仓库）
4. 不要勾选 README、.gitignore、License
5. 点击 Create repository

- [ ] **Step 3: 推送代码到 GitHub**

```powershell
git remote add origin https://github.com/YOUR_USERNAME/family-hub.git
git branch -M main
git push -u origin main
```

把 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

---

### Task 14: 配置 Supabase

- [ ] **Step 1: 创建 Supabase 项目**

1. 访问 https://supabase.com 并用 GitHub 登录
2. 点击 "New Project"
3. 项目名称：`family-hub`
4. 设置数据库密码（记住这个密码）
5. 选择离你最近的区域
6. 点击 "Create new project"
7. 等待项目初始化完成

- [ ] **Step 2: 执行数据库 Schema**

1. 在 Supabase Dashboard 左侧点击 "SQL Editor"
2. 点击 "New Query"
3. 将 `supabase/schema.sql` 的全部内容粘贴进去
4. 点击 "Run" 执行

- [ ] **Step 3: 创建 Storage Buckets**

1. 左侧点击 "Storage"
2. 点击 "Create Bucket"
3. 创建名为 `avatars` 的 bucket，勾选 Public
4. 再创建名为 `photos` 的 bucket，勾选 Public

- [ ] **Step 4: 获取环境变量**

1. 左侧点击 "Settings" → "API"
2. 复制以下值：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`（点击 Reveal 显示）

---

### Task 15: 部署到 Vercel

- [ ] **Step 1: 导入项目**

1. 访问 https://vercel.com 并用 GitHub 登录
2. 点击 "Add New" → "Project"
3. 选择 `family-hub` 仓库
4. Framework Preset 选择 "Next.js"（通常自动检测）

- [ ] **Step 2: 配置环境变量**

在部署页面的 "Environment Variables" 中添加：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `FAMILY_PASSWORD` | 你想设置的家庭密码 |

- [ ] **Step 3: 部署**

点击 "Deploy"，等待部署完成。

- [ ] **Step 4: 访问网站**

部署完成后 Vercel 会给你一个 URL（如 `family-hub.vercel.app`），打开它即可看到密码入口页。

---

### Task 16: 添加家庭成员初始数据

- [ ] **Step 1: 在 Supabase 中添加家庭成员**

1. 在 Supabase Dashboard 左侧点击 "Table Editor"
2. 点击 `members` 表
3. 点击 "Insert Row" 添加每个家庭成员
4. 填写：
   - `name`：家人名字
   - `color`：选一个代表颜色（如 `#6366f1`、`#ec4899`、`#10b981`、`#f59e0b`）
   - `avatar_url`：留空（之后可以上传）

- [ ] **Step 2: 添加一些纪念日**

在 `events` 表中添加家人的生日等重要日期，recurrence 选择 `yearly`。

- [ ] **Step 3: 测试完整流程**

1. 访问 Vercel 给的 URL
2. 输入密码进入
3. 选择身份
4. 尝试发留言、写日志、添加日程
5. 用手机访问测试响应式布局
