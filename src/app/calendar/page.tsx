"use client";

import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { FamilyEvent } from "@/lib/types";
import Navbar from "@/components/Navbar";
import EventItem from "@/components/EventItem";
import EventForm from "@/components/EventForm";

export default function CalendarPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchSelectedMember();
    fetchEvents();
  }, []);

  async function fetchSelectedMember() {
    try {
      const res = await fetch("/api/members/selected");
      if (res.ok) {
        const { memberId: id } = await res.json();
        if (id) setMemberId(id);
      }
    } catch {}
  }

  async function fetchEvents() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  }

  function handleEventCreated(event: FamilyEvent) {
    setEvents((prev) =>
      [...prev, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
  }

  const upcoming = events.filter((e) => new Date(e.date + "T00:00:00") >= new Date(new Date().toDateString()));
  const past = events.filter((e) => new Date(e.date + "T00:00:00") < new Date(new Date().toDateString()));

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={22} className="text-pink-500" />
          <h2 className="text-xl font-bold text-gray-800">日程管理</h2>
        </div>
        <EventForm memberId={memberId} onCreated={handleEventCreated} />

        {upcoming.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              即将到来
            </h3>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-4 divide-y divide-gray-50">
              {upcoming.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              已过
            </h3>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-4 divide-y divide-gray-50 opacity-70">
              {[...past].reverse().map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-12 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-gray-400 text-sm">还没有日程，添加一个吧</p>
          </div>
        )}
      </main>
    </>
  );
}
