import { Member } from "@/lib/types";

// 默认头像映射：按成员名字匹配本地图片
const DEFAULT_AVATARS: { pattern: RegExp; src: string }[] = [
  { pattern: /爸|父亲|爸爸|daddy/i, src: "/images/avatars/father.jpg" },
  { pattern: /妈|母亲|妈妈|mommy/i, src: "/images/avatars/mother.jpg" },
  { pattern: /儿|儿子|boy|kid/i, src: "/images/avatars/son.jpg" },
];

function getDefaultAvatar(name: string): string | null {
  for (const { pattern, src } of DEFAULT_AVATARS) {
    if (pattern.test(name)) return src;
  }
  return null;
}

export default function MemberAvatar({
  member,
  size = "md",
  withRing = false,
}: {
  member: Member;
  size?: "sm" | "md" | "lg";
  withRing?: boolean;
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
  };

  const ringClass = withRing ? "ring-2 ring-white ring-offset-1 ring-offset-transparent" : "";

  // 图片优先级：用户上传 > 本地默认 > 兜底首字
  const avatarUrl = member.avatar_url || getDefaultAvatar(member.name);

  return (
    <div
      className={`${sizeClasses[size]} ${ringClass} rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}
      style={!avatarUrl ? { backgroundColor: member.color, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.15)" } : undefined}
      title={member.name}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={member.name}
          className="w-full h-full rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        member.name.charAt(0)
      )}
    </div>
  );
}
