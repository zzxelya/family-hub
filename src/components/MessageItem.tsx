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
