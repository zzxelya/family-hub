"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Message, Post, FamilyEvent, Member } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MemberAvatar from "@/components/MemberAvatar";
import ActivityFeed from "@/components/ActivityFeed";

type ActivityItem =
  | { type: "message"; data: Message }
  | { type: "post"; data: Post }
  | { type: "event"; data: FamilyEvent };

export default function HomePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<FamilyEvent[]>([]);

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
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4 space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-4">我们的家</h1>
          <div className="flex gap-3">
            {members.map((member) => (
              <div key={member.id} className="flex flex-col items-center gap-1">
                <MemberAvatar member={member} size="lg" />
                <span className="text-xs opacity-90">{member.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            href="/messages"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">💬</div>
            <div className="text-xs text-gray-600">留言</div>
          </Link>
          <Link
            href="/journal"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">📝</div>
            <div className="text-xs text-gray-600">日志</div>
          </Link>
          <Link
            href="/gallery"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">📸</div>
            <div className="text-xs text-gray-600">相册</div>
          </Link>
          <Link
            href="/calendar"
            className="flex-1 bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-1">📅</div>
            <div className="text-xs text-gray-600">日程</div>
          </Link>
        </div>

        {upcomingEvents.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">即将到来</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
              {upcomingEvents.map((event) => {
                const date = new Date(event.date + "T00:00:00");
                const days = Math.ceil(
                  (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={event.id} className="flex items-center justify-between py-2">
                    <span className="text-sm">
                      {event.recurrence === "yearly" ? "🎂 " : "📅 "}
                      {event.title}
                    </span>
                    <span className="text-xs text-indigo-500">
                      {days <= 0 ? "今天" : `${days}天后`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-gray-500 mb-2">最新动态</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <ActivityFeed items={activities} members={members} />
          </div>
        </div>
      </main>
    </>
  );
}
