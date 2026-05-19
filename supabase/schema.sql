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

-- RLS 策略：允许 anon 角色读写
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date ASC);
CREATE INDEX IF NOT EXISTS idx_messages_member_id ON messages(member_id);
CREATE INDEX IF NOT EXISTS idx_posts_member_id ON posts(member_id);
CREATE INDEX IF NOT EXISTS idx_events_member_id ON events(member_id);
