import { Post } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const time = new Date(dateStr).getTime();
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(dateStr).toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
}

export default function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden card stagger-item">
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
      <div className="p-4 relative">
        {/* Colored side bar */}
        {post.member && (
          <div
            className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
            style={{ backgroundColor: post.member.color }}
          />
        )}
        <div className="pl-2">
          <div className="flex items-center gap-2 mb-2">
            {post.member && <MemberAvatar member={post.member} size="sm" />}
            <span className="text-sm font-medium text-gray-700">
              {post.member?.name}
            </span>
            <span className="text-xs text-gray-400">{relativeTime(post.created_at)}</span>
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{post.title}</h3>
          {post.content && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{post.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}
