# Family Hub 视觉优化与自定义功能实施方案

> 日期：2026-05-21
> 状态：待实施

---

## 一、素材清单与用途

| 文件名 | 用途 | 使用方式 |
|--------|------|----------|
| `father.jpg` (272KB) | 爸爸头像 | 直接放入 `public/images/avatars/`，代码中按成员名字自动匹配显示 |
| `mother.jpg` (4.5MB) | 妈妈头像 | 同上（部署前本地压缩至 ≤512px） |
| `son.jpg` (476KB) | 儿子头像 | 同上 |
| `together.jpg` (11.7MB) | 全局页面背景 | 放入 `public/images/` 重命名为 `background.jpg`（部署前本地压缩至 ≤1920px 宽度） |

**核心原则：用户无需任何上传操作，图片直接生效。**

---

## 二、当前问题诊断

### 2.1 视觉瑕疵

1. **头像粗糙**：成员头像仅为带首字的纯色圆圈，与温馨家庭主题不搭
2. **Banner 层次单一**：紫色渐变 Banner 固定不变，缺少温度
3. **整页背景单调**：`--background: #faf9f7` 纯色底，没有视觉层次

### 2.2 现有代码基础

- `MemberAvatar.tsx` 已有 `avatar_url` 判断逻辑 — 只需补上图片源即可生效
- `/api/upload` 和 `/api/members` PATCH 已支持上传和更新 — 后续用户想换图时可用
- 缺少：背景图片机制 + 头像与成员名字的匹配映射

---

## 三、实施方案

### 第一步：图片处理与放置

#### 3.1 本地压缩图片

通过脚本在部署前完成压缩，无需用户操作：

| 图片 | 原始大小 | 压缩目标 | 处理方式 |
|------|---------|---------|---------|
| `father.jpg` | 272KB | ≤100KB | 缩放至 512x512，JPEG quality 0.8 |
| `mother.jpg` | 4.5MB | ≤100KB | 同上 |
| `son.jpg` | 476KB | ≤100KB | 同上 |
| `together.jpg` | 11.7MB | ≤500KB | 缩放至宽度 1920px，JPEG quality 0.8 |

#### 3.2 放入项目静态目录

```
public/
  images/
    avatars/
      father.jpg        ← 爸爸头像
      mother.jpg        ← 妈妈头像
      son.jpg           ← 儿子头像
    background.jpg      ← 页面背景（来自 together.jpg）
```

压缩后的图片直接放入以上目录，Next.js 自动通过 `/images/...` 路径提供服务。

---

### 第二步：头像组件改造

#### 3.3 修改 `src/components/MemberAvatar.tsx`

**改动要点**：

- 新增「默认头像映射表」，按成员名字自动匹配本地图片：

```
名字包含 "爸" 或 "爸爸" → /images/avatars/father.jpg
名字包含 "妈" 或 "妈妈" → /images/avatars/mother.jpg
名字包含 "儿" 或 "儿子" → /images/avatars/son.jpg
其他成员 → 纯色圆圈 + 首字（兜底）
```

- 图片加载优先级：
  1. `member.avatar_url`（用户后续自定义上传的 Supabase URL）→ 最优先
  2. 默认本地图片（上面的映射表）→ 次优先
  3. 纯色圆圈 + 首字 → 兜底

- 有图时确保 `object-cover` 圆形裁剪，无变形
- 无图时优化纯色圆圈样式（加内阴影、微渐变）

#### 3.4 修改 `src/components/MemberSelector.tsx`

- 下拉菜单底部增加「管理成员」按钮
- 点击弹出成员管理弹窗（第三步实现）
- 用于将来用户想更换头像时使用

---

### 第三步：背景图片应用

#### 3.5 修改 `src/app/globals.css` — 背景样式

```css
body {
  background-color: var(--background);
  background-image: url('/images/background.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
}

/* 半透明遮罩，保证内容可读 */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: rgba(250, 249, 247, 0.82);
  z-index: -1;
}
```

效果：背景图铺满全屏 + 半透明遮罩让卡片文字依然清晰可读。

#### 3.6 修改 `src/app/layout.tsx` — 预留动态替换能力

- `<body>` 使用 CSS 变量 `--bg-image` 控制背景
- 默认值指向 `/images/background.jpg`
- 后续用户想自定义时，可通过 JS 动态替换 `--bg-image` 变量

---

### 第四步：Banner 区域视觉优化

#### 3.7 修改 `src/app/home/page.tsx` — Banner 微调

- 头像列表增加间距（`gap-4`）
- 头像下方名字加 `text-shadow` 提升在渐变背景上的可读性
- Banner 右上角增加一个「更换背景」图标按钮（第五步实现）

---

### 第五步：预留自定义能力（可选，后续按需启用）

以下功能在本次实施中**先搭建骨架**，用户将来想更换图片时直接可用：

#### 3.8 新增 `src/components/MemberManager.tsx` — 成员管理弹窗

- 展示所有成员，点击头像可选择新图片上传
- 调用 `/api/upload` → `/api/members` PATCH 更新
- 上传后 `member.avatar_url` 被设置，优先级高于默认本地图片

#### 3.9 新增 `src/components/BackgroundSettings.tsx` — 背景设置弹窗

- 显示当前背景预览 + 上传按钮 + 「恢复默认」按钮
- 上传后通过 CSS 变量 `--bg-image` 实时替换，无需刷新

#### 3.10 数据库新增 `settings` 表（仅在使用自定义功能时需要）

```sql
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read on settings" ON settings FOR SELECT TO anon USING (true);
```

#### 3.11 新增 `src/app/api/settings/route.ts` — 设置读写接口

---

## 四、文件改动总览

| 序号 | 文件 | 操作 | 说明 |
|------|------|------|------|
| 1 | `public/images/avatars/father.jpg` | 新增 | 压缩后的爸爸头像 |
| 2 | `public/images/avatars/mother.jpg` | 新增 | 压缩后的妈妈头像 |
| 3 | `public/images/avatars/son.jpg` | 新增 | 压缩后的儿子头像 |
| 4 | `public/images/background.jpg` | 新增 | 压缩后的全家福背景 |
| 5 | `src/components/MemberAvatar.tsx` | 修改 | 加入默认头像映射 + 图片优先级逻辑 |
| 6 | `src/app/globals.css` | 修改 | 添加背景图样式 + 遮罩层 |
| 7 | `src/app/layout.tsx` | 修改 | 支持 CSS 变量动态背景 |
| 8 | `src/app/home/page.tsx` | 修改 | Banner 视觉微调 + 背景设置入口 |
| 9 | `src/components/MemberSelector.tsx` | 修改 | 增加「管理成员」入口 |
| 10 | `src/components/MemberManager.tsx` | 新增 | 成员管理弹窗（预留自定义能力） |
| 11 | `src/components/BackgroundSettings.tsx` | 新增 | 背景设置弹窗（预留自定义能力） |
| 12 | `src/app/api/settings/route.ts` | 新增 | 设置读写接口（预留） |
| 13 | `supabase/schema.sql` | 修改 | 追加 settings 表（预留） |

---

## 五、用户体验流程

### 本次实施后（直接生效，零操作）

1. 打开页面 → 背景自动显示全家福照片（带半透明遮罩）
2. 导航栏和 Banner 中的成员头像自动显示为真实照片
3. 无需任何点击或上传

### 将来想更换时

1. 点击导航栏身份选择器 → 底部出现「管理成员」
2. 点击某成员头像 → 选择新图片 → 自动上传替换
3. 点击 Banner 右上角「更换背景」→ 选择新图片 → 实时替换
4. 随时可点「恢复默认」回到本次配置的图片
