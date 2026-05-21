# Family Hub 安全审计与优化报告

审计日期：2026-05-21

---

## 一、安全漏洞

### 🔴 严重（Critical）

#### 1. 硬编码的默认密码

**文件**: `src/lib/auth.ts` 第 3 行

```ts
const FAMILY_PASSWORD = process.env.FAMILY_PASSWORD || "family123";
```

如果环境变量 `FAMILY_PASSWORD` 缺失或为空，密码会回退到 `family123`，这是极其容易被猜到的弱密码。此外密码以明文存储在环境变量中。

**修复建议**: 移除默认密码回退，若环境变量未设置则拒绝启动。使用 bcrypt/argon2 对密码做哈希处理，不在代码或环境变量中存储明文。

```ts
// 修复方案
const FAMILY_PASSWORD_HASH = process.env.FAMILY_PASSWORD_HASH;
if (!FAMILY_PASSWORD_HASH) {
  throw new Error("FAMILY_PASSWORD_HASH environment variable is required");
}
```

---

#### 2. Supabase RLS 策略形同虚设

**文件**: `supabase/schema.sql` 第 46-63 行

```sql
CREATE POLICY "Allow anon read on members" ON members FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert on members" ON members FOR INSERT TO anon WITH CHECK (true);
-- ...所有表均如此
```

所有表的 RLS 策略都设置为 `USING (true)` / `WITH CHECK (true)`，意味着任何持有 anon key（它是公开的，会打包进前端代码）的人都可以直接通过 Supabase API 完全绕过你的 Next.js 应用，对所有数据进行无限制的增删改查。

**修复建议**: 要么彻底移除 anon 角色的写入权限，只允许通过 service role 从后端写入；要么将应用改为使用 Supabase Auth 认证，RLS 策略基于 `auth.uid()` 做访问控制。对于家庭密码模式，建议取消 anon 直接写权限，所有数据操作都经过 Next.js API 路由。

---

#### 3. API 路由缺少身份验证检查

**文件**: 所有 `src/app/api/*/route.ts`

除了 `/api/auth` 外，所有 API 路由（members、messages、posts、events、upload）都没有验证请求是否来自已认证用户。虽然 middleware 会在页面层面拦截未认证请求，但 API 端点本身可以被直接调用。

**修复建议**: 在每个需要保护的 API handler 开头添加身份验证检查：

```ts
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  // ... 原有逻辑
}
```

---

#### 4. 批量赋值（Mass Assignment）漏洞

**文件**: `src/app/api/members/route.ts`、`/api/events/route.ts`、`/api/posts/route.ts`、`/api/messages/route.ts`

POST 和 PATCH 端点将整个请求体直接传入 Supabase，攻击者可以注入任意字段：

```ts
// messages/route.ts 第 19 行
const body = await request.json();
const { data, error } = await supabase.from("messages").insert([body]);
```

攻击者可以发送 `{ "content": "x", "member_id": "别人的id", "id": "伪造id", "created_at": "任意时间" }`，覆盖不属于自己的成员身份或篡改时间戳。

**修复建议**: 显式提取和验证允许的字段：

```ts
const body = await request.json();
const { content } = body;
if (!content || typeof content !== "string") {
  return NextResponse.json({ error: "无效输入" }, { status: 400 });
}
const { data, error } = await supabase
  .from("messages")
  .insert([{ content, member_id: validatedMemberId }]);
```

---

#### 5. 文件上传缺乏安全校验

**文件**: `src/app/api/upload/route.ts`

存在多个问题：

- **无文件大小限制**：可以上传任意大小的文件，导致存储耗尽或 DoS
- **无文件类型验证**：客户端的 `accept="image/*"` 仅在浏览器端生效，服务端未验证文件实际类型
- **存储桶名来自用户输入**：`const bucket = (formData.get("bucket") as string) || "photos"`，攻击者可以指定任意 bucket 名称
- **无内容检测**：未验证上传文件是否真的为图片

**修复建议**:

```ts
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 });
}
if (file.size > MAX_SIZE) {
  return NextResponse.json({ error: "文件过大" }, { status: 400 });
}
// 强制使用固定 bucket
const bucket = "photos";
```

---

### 🟡 中等（Medium）

#### 6. 登录接口无暴力破解防护

**文件**: `src/app/api/auth/route.ts`

密码验证端点没有速率限制，攻击者可以无限次尝试密码。

**修复建议**: 实现简单的基于 IP 或 session 的速率限制（例如使用内存 Map 或 Redis）。可以用一个简单的 middleware 来限制每分钟最多 10 次尝试。

---

#### 7. .env.local 文件已包含真实数据

**文件**: `.env.local`

文件中包含 `FAMILY_PASSWORD=family123` 和 Supabase 密钥。虽然 `.gitignore` 已包含 `.env*`，但需确认这些敏感信息未被提交到 Git 历史中。

**修复建议**: 运行 `git log --all --full-history -- .env.local` 检查是否有泄露记录。如果有，需要轮换所有密钥。

---

#### 8. 客户端直接暴露 Supabase 凭据

**文件**: `src/components/MemberSelector.tsx` 第 24-27 行

MemberSelector 组件直接在前端使用 `supabase` 客户端（包含 anon key），而 anon key 配合宽松的 RLS 策略等于完全开放了数据库。

```ts
const { data } = await supabase.from("members").select("*").order("created_at");
```

**修复建议**: 统一通过 `/api/members` 获取数据，不在前端直接访问 Supabase。

---

#### 9. 成员身份 Cookie 不安全

**文件**: `src/lib/auth.ts` 第 33-41 行，`src/components/MemberSelector.tsx` 第 33 行

- `MEMBER_COOKIE` 被设置为 `httpOnly: false`，可被 JavaScript 读写
- MemberSelector 中通过 `document.cookie` 直接设置 cookie，未添加 `Secure` 和 `SameSite` 属性
- 成员 ID 可被用户篡改，冒充其他家庭成员

```ts
// MemberSelector.tsx 中的不安全 cookie 设置
document.cookie = `family_hub_member=${id}; path=/; max-age=${60 * 60 * 24 * 30)}`;
```

**修复建议**: 将成员选择也通过 API 设置为 HttpOnly cookie，或者在后端验证成员 ID 的有效性。

---

#### 10. DELETE 请求未验证 ID 参数

**文件**: 多个 API 路由

```ts
const id = searchParams.get("id");
const { error } = await supabase.from("messages").delete().eq("id", id!);
```

`id` 可能为 null，`id!` 的非空断言可能引发意外行为。

**修复建议**:

```ts
const id = searchParams.get("id");
if (!id) {
  return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
}
```

---

#### 11. 缺少安全响应头

**文件**: `next.config.ts`

未配置任何安全头部（Content-Security-Policy、X-Frame-Options、X-Content-Type-Options 等）。

**修复建议**:

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img-src 'self' https://*.supabase.co; style-src 'self' 'unsafe-inline'",
          },
        ],
      },
    ];
  },
};
```

---

#### 12. Service Role Key 在上传路由中使用

**文件**: `src/app/api/upload/route.ts` 第 13 行

`createServerClient()` 使用 service role key，该密钥完全绕过 RLS。如果此密钥泄露（例如通过源码泄露），攻击者将获得数据库的完全控制权。

**修复建议**: 尽量减少 service role key 的使用范围。对于文件上传，如果存储桶策略配置得当，可以使用 anon key。

---

## 二、功能优化建议

### 性能优化

**1. 使用 next/image 替代原生 img 标签**

全站使用了原生 `<img>` 标签（PostCard、PhotoGrid、MemberAvatar 等）。Next.js 的 `Image` 组件提供自动优化、懒加载、响应式尺寸等能力。

```tsx
import Image from "next/image";
<Image src={url} alt={title} width={400} height={400} className="object-cover" />
```

**2. 添加数据缓存策略**

当前每次页面加载都重新请求所有数据。建议引入 SWR 或 React Query：

```ts
// 示例：使用 SWR
const { data: messages } = useSWR("/api/messages", fetcher, {
  revalidateOnFocus: false,
  refreshInterval: 30000,
});
```

**3. 实现分页或无限滚动**

留言和日志页面一次性加载所有数据（messages 限制 200 条，posts 限制 100 条），随着数据增长会成为性能瓶颈。

**4. 首页减少并发请求**

`home/page.tsx` 的 `fetchActivities` 同时发起 3 个 API 请求，每个请求又各自查询 Supabase。可以考虑创建一个聚合 API 端点，一次返回所有首页需要的数据。

### 代码质量

**5. 提取公共 Cookie 读取逻辑**

读取 `family_hub_member` cookie 的代码在 `messages/page.tsx`、`journal/page.tsx`、`calendar/page.tsx` 和 `MemberSelector.tsx` 中重复出现。应提取为公共 hook：

```ts
// src/hooks/useMemberId.ts
export function useMemberId() {
  const [memberId, setMemberId] = useState<string | null>(null);
  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setMemberId(saved);
  }, []);
  return memberId;
}
```

**6. 添加统一的错误处理**

多处 `catch {}` 静默吞掉错误（如 `PostForm.tsx` 第 37 行）。应至少记录日志并给用户反馈。

**7. 添加输入校验和长度限制**

所有文本输入应在服务端也做长度限制和格式校验，而不仅仅依赖前端的 `maxLength` 属性。例如留言内容限制 500 字符、标题限制 100 字符等。

**8. 使用 Server Components**

目前所有页面都是 `"use client"` 客户端组件。对于初始数据加载，可以利用 Next.js 的 Server Components 直接在服务端获取数据，减少客户端 JavaScript 体积和首屏加载时间。

### 用户体验

**9. 添加加载状态**

大部分页面在数据加载时没有 loading 指示器，用户会看到空白页面。

**10. 添加错误边界**

使用 React Error Boundary 包裹各页面，防止局部错误导致整个应用崩溃。

**11. 添加空状态重试按钮**

当数据加载失败时，提供重试按钮而非仅显示空状态文案。

---

## 三、漏洞修复优先级总结

| 优先级 | 漏洞 | 影响范围 |
|--------|------|----------|
| P0 | RLS 策略全开 (#2) | 数据库完全暴露 |
| P0 | 硬编码默认密码 (#1) | 认证可被绕过 |
| P0 | API 无认证 (#3) | 未授权数据操作 |
| P0 | 批量赋值 (#4) | 数据篡改 |
| P1 | 文件上传无校验 (#5) | 恶意文件上传 |
| P1 | 无暴力破解防护 (#6) | 密码可被暴力破解 |
| P1 | .env.local 泄露检查 (#7) | 密钥泄露 |
| P1 | 客户端直连 Supabase (#8) | 绕过应用层控制 |
| P2 | Cookie 安全 (#9) | 身份冒充 |
| P2 | 缺少安全头 (#11) | 点击劫持等攻击 |
| P2 | Service Role 滥用 (#12) | 密钥泄露风险扩大 |
