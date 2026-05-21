"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, BookImage, Images, CalendarDays, Gift, ImagePlus } from "lucide-react";
import { Message, Post, FamilyEvent, Member } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MemberAvatar from "@/components/MemberAvatar";
import ActivityFeed from "@/components/ActivityFeed";
import BackgroundSettings from "@/components/BackgroundSettings";

type ActivityItem =
  | { type: "message"; data: Message }
  | { type: "post"; data: Post }
  | { type: "event"; data: FamilyEvent };

const QUICK_LINKS = [
  { href: "/messages", label: "留言", Icon: MessageCircle, gradient: "from-indigo-500 to-blue-500", bg: "bg-indigo-50", text: "text-indigo-600" },
  { href: "/journal", label: "日志", Icon: BookImage, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", text: "text-amber-600" },
  { href: "/gallery", label: "相册", Icon: Images, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50", text: "text-emerald-600" },
  { href: "/calendar", label: "日程", Icon: CalendarDays, gradient: "from-pink-500 to-rose-500", bg: "bg-pink-50", text: "text-pink-600" },
];

export default function HomePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<FamilyEvent[]>([]);
  const [showBgSettings, setShowBgSettings] = useState(false);

  useEffect(() => {
    Promise.all([fetchMembers(), fetchActivities()]);
  }, []);

  async function fetchMembers() {
    const res = await fetch("/api/members");
    const data = await res.json();
    setMembers(data);
  }

  async function fetchActivities() {
    const [msgRes, postRes, eventRes] = await Promise.all([
      fetch("/api/messages"),
      fetch("/api/posts"),
      fetch("/api/events"),
    ]);

    const messages: Message[] = await msgRes.json();
    const posts: Post[] = await postRes.json();
    const events: FamilyEvent[] = await eventRes.json();

    const today = new Date(new Date().toDateString());
    setUpcomingEvents(
      events.filter((e) => new Date(e.date + "T00:00:00") >= today).slice(0, 3)
    );

    const items: ActivityItem[] = [
      ...messages.slice(0, 10).map((m) => ({ type: "message" as const, data: m })),
      ...posts.slice(0, 10).map((p) => ({ type: "post" as const, data: p })),
      ...events.slice(0, 5).map((e) => ({ type: "event" as const, data: e })),
    ];

    items.sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() -
        new Date(a.data.created_at).getTime()
    );

    setActivities(items.slice(0, 15));
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4 space-y-5">
        {/* Banner */}
        <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 text-white overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h1 className="text-2xl font-bold">我们的家</h1>
            <button
              onClick={() => setShowBgSettings(true)}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              title="更换背景"
            >
              <ImagePlus size={16} />
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1 relative z-10 scrollbar-hide">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-2 shrink-0">
                <MemberAvatar member={member} size="lg" withRing />
                <span className="text-xs font-medium" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Background Settings Modal */}
        {showBgSettings && (
          <BackgroundSettings onClose={() => setShowBgSettings(false)} />
        )}

        {/* Quick Links */}
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_LINKS.map(({ href, label, Icon, bg, text }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 py-3 rounded-2xl bg-white shadow-sm border border-[var(--color-border)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 btn-press"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={20} className={text} />
              </div>
              <span className="text-xs text-gray-600 font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <Gift size={14} />
              即将到来
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-4 divide-y divide-gray-50">
              {upcomingEvents.map((event) => {
                const date = new Date(event.date + "T00:00:00");
                const days = Math.ceil(
                  (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={event.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <span className="text-sm flex items-center gap-1.5">
                      {event.recurrence === "yearly" ? "🎂" : "📅"}
                      <span className="font-medium text-gray-800">{event.title}</span>
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      days <= 0
                        ? "bg-indigo-100 text-indigo-600"
                        : days <= 7
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {days <= 0 ? "今天" : `${days}天后`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-500">最新动态</h2>
            <span className="text-xs text-gray-400">{activities.length} 条</span>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] p-4">
            <ActivityFeed items={activities} members={members} />
          </div>
        </div>
      </main>
    </>
  );
}
