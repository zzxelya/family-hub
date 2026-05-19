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
