import { Message } from "@/lib/types";
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
  return new Date(dateStr).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

export default function MessageItem({ message, isOwn = false }: { message: Message; isOwn?: boolean }) {
  if (isOwn) {
    return (
      <div className="flex justify-end gap-2 py-2 stagger-item">
        <div className="max-w-[75%]">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className="text-[10px] text-gray-400 text-right mt-1 mr-1">{relativeTime(message.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 py-2 stagger-item">
      {message.member && <MemberAvatar member={message.member} size="sm" />}
      <div className="max-w-[75%]">
        {message.member && (
          <span className="text-xs font-medium text-gray-500 ml-1 mb-0.5 block">{message.member.name}</span>
        )}
        <div className="bg-white px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm border border-[var(--color-border)]">
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 ml-1">{relativeTime(message.created_at)}</p>
      </div>
    </div>
  );
}
