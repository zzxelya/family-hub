import { Message, Post, FamilyEvent, Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";
import { MessageCircle, BookImage, CalendarDays } from "lucide-react";

type ActivityItem =
  | { type: "message"; data: Message }
  | { type: "post"; data: Post }
  | { type: "event"; data: FamilyEvent };

const TYPE_CONFIG = {
  message: { icon: MessageCircle, color: "text-indigo-500", bg: "bg-indigo-50", label: "留言" },
  post: { icon: BookImage, color: "text-amber-500", bg: "bg-amber-50", label: "日志" },
  event: { icon: CalendarDays, color: "text-pink-500", bg: "bg-pink-50", label: "日程" },
};

export default function ActivityFeed({
  items,
  members,
}: {
  items: ActivityItem[];
  members: Member[];
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-3xl mb-2">✨</div>
        <p className="text-gray-400 text-sm">还没有动态，去留言或写日志吧</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {items.map((item, i) => {
        const config = TYPE_CONFIG[item.type];
        const Icon = config.icon;

        if (item.type === "message") {
          const member = members.find((m) => m.id === item.data.member_id);
          return (
            <div key={`msg-${i}`} className="flex gap-3 py-3 stagger-item">
              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {member && (
                    <span className="text-sm font-medium text-gray-700">{member.name}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(item.data.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-0.5">{item.data.content}</p>
              </div>
            </div>
          );
        }

        if (item.type === "post") {
          const member = members.find((m) => m.id === item.data.member_id);
          return (
            <div key={`post-${i}`} className="flex gap-3 py-3 stagger-item">
              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                <Icon size={16} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {member && (
                    <span className="text-sm font-medium text-gray-700">{member.name}</span>
                  )}
                  <span className="text-xs text-gray-400">
                    {new Date(item.data.created_at).toLocaleDateString("zh-CN")}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-800 mt-0.5">{item.data.title}</p>
                {item.data.image_urls.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
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
          <div key={`evt-${i}`} className="flex gap-3 py-3 stagger-item">
            <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800">
                <span className="font-medium">{item.data.title}</span>
                <span className="text-gray-400 ml-2">
                  {new Date(item.data.date + "T00:00:00").toLocaleDateString("zh-CN")}
                </span>
              </p>
              {member && (
                <p className="text-xs text-gray-400 mt-0.5">由 {member.name} 添加</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
