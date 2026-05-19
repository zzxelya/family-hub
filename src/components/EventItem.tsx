import { FamilyEvent } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

const RECURRENCE_LABELS = {
  none: "",
  yearly: "每年",
  monthly: "每月",
};

export default function EventItem({ event }: { event: FamilyEvent }) {
  const date = new Date(event.date + "T00:00:00");
  const isBirthday = event.recurrence === "yearly";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let daysLabel = "";
  if (diffDays === 0) daysLabel = "今天";
  else if (diffDays === 1) daysLabel = "明天";
  else if (diffDays > 0) daysLabel = `${diffDays}天后`;
  else daysLabel = `已过${Math.abs(diffDays)}天`;

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
          isBirthday ? "bg-pink-50" : "bg-indigo-50"
        }`}
      >
        <span className={`text-lg font-bold ${isBirthday ? "text-pink-600" : "text-indigo-600"}`}>
          {date.getDate()}
        </span>
        <span className="text-[10px] text-gray-500">
          {date.getMonth() + 1}月
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-gray-800">
            {isBirthday ? "🎂 " : ""}
            {event.title}
          </span>
          {event.recurrence !== "none" && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
              {RECURRENCE_LABELS[event.recurrence]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{`${date.getMonth() + 1}月${date.getDate()}日`}</span>
          <span className={`text-xs ${diffDays >= 0 ? "text-indigo-500" : "text-gray-400"}`}>
            {daysLabel}
          </span>
        </div>
        {event.description && (
          <p className="text-xs text-gray-500 mt-1">{event.description}</p>
        )}
      </div>
      {event.member && <MemberAvatar member={event.member} size="sm" />}
    </div>
  );
}
