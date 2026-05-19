# Family Hub - 家庭沟通分享网站设计文档

## 概述

一个面向3-5人小家庭的私密沟通分享平台，支持留言、生活日志、照片相册和日程管理。部署在 Vercel，使用统一密码保护访问。

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端 + API | Next.js (App Router) | 页面渲染、API 路由 |
| 后端服务 | Supabase (免费版) | 数据库、图片存储、实时推送 |
| 样式 | Tailwind CSS | 界面样式 |
| 部署 | Vercel | 托管和自动部署 |
| 语言 | TypeScript | 类型安全 |

## 架构

```
家人浏览器 (手机/电脑/平板)
       |  HTTPS
       v
Vercel (Next.js 应用)
       |  Supabase Client SDK
       v
Supabase
  - PostgreSQL 数据库
  - Storage 图片存储
  - Realtime 实时推送
```

## 前置准备

1. **GitHub 账号** — 存放代码，连接 Vercel
2. **Vercel 账号** — 用 GitHub 登录，托管网站
3. **Supabase 账号** — 用 GitHub 登录，提供数据库和图片存储
4. **Node.js 18+** — 本地安装，用于开发

## 安全设计

- 统一密码保护：访问网站时需要输入密码
- 密码存储在环境变量中，通过 Next.js API 验证
- 验证通过后设置 session cookie，后续请求免密码
- 不对外公开注册，只有知道密码的家人能访问
- Supabase 使用 service_role key（服务端）和 anon key（客户端），通过 RLS 策略配合密码保护

## 数据模型

### members（家庭成员）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| name | text | 名字 |
| avatar_url | text | 头像图片地址 |
| color | text | 代表颜色（用于界面标识） |
| created_at | timestamptz | 创建时间 |

### messages（留言）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| content | text | 留言内容 |
| member_id | uuid | 外键 → members.id |
| created_at | timestamptz | 创建时间 |

### posts（生活日志）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| title | text | 日志标题 |
| content | text | 日志内容（支持文本描述） |
| member_id | uuid | 外键 → members.id |
| image_urls | text[] | 图片地址数组 |
| created_at | timestamptz | 创建时间 |

### events（日程/纪念日）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| title | text | 日程标题 |
| date | date | 日期 |
| recurrence | text | 重复类型：none / yearly / monthly |
| description | text | 描述 |
| member_id | uuid | 外键 → members.id（创建者） |
| created_at | timestamptz | 创建时间 |

## 页面结构

### `/` — 密码入口页
- 输入密码的表单
- 验证通过后跳转到 /home

### `/home` — 家庭主页
- 顶部：家庭名称和成员头像
- 最新动态（最近的留言、日志、照片混合展示）
- 即将到来的日程提醒
- 快捷操作入口（发留言、写日志、传照片）

### `/messages` — 留言板
- 消息流式展示（按时间排序）
- 选择成员身份发送留言
- 支持实时更新（新留言自动出现）

### `/journal` — 生活日志
- 图文日志卡片列表
- 发布新日志（标题 + 内容 + 图片）
- 按时间倒序排列

### `/gallery` — 照片相册
- 瀑布流/网格展示照片
- 点击照片查看大图
- 按日志或上传时间分组

### `/calendar` — 日程管理
- 日历视图展示日程
- 添加新日程/纪念日
- 支持每年重复（生日、纪念日等）
- 列出即将到来的重要日期

## 成员切换

因为没有独立账号系统，使用"选择身份"方式：
- 首次进入后选择"我是谁"（从预设成员列表选择）
- 选择后记住在 cookie 中
- 发送留言、日志时自动关联成员身份
- 可随时切换身份

## Supabase 配置

### Storage Bucket
- `avatars` — 存储成员头像
- `photos` — 存储生活日志照片

### RLS 策略
- 所有表启用 RLS
- 由于使用密码保护而非用户认证，RLS 主要通过 anon key 允许已登录（通过密码验证）的用户读写
- 实际安全由应用层的密码保护机制实现

## 环境变量

```
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
FAMILY_PASSWORD=xxx
```

## 响应式设计

- 手机优先设计，适配所有设备
- 家人主要用手机访问
- Tailwind CSS 响应式断点处理

## 免费额度评估

| 服务 | 免费额度 | 预计使用量 |
|------|---------|-----------|
| Vercel | 100GB 带宽/月 | < 1GB |
| Supabase 数据库 | 500MB | < 50MB |
| Supabase 存储 | 1GB | < 500MB |
| Supabase Realtime | 200 并发连接 | < 5 |

3-5人家庭使用完全在免费额度内。
