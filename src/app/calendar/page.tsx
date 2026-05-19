"use client";

import { useState, useEffect } from "react";
import { FamilyEvent } from "@/lib/types";
import Navbar from "@/components/Navbar";
import EventItem from "@/components/EventItem";
import EventForm from "@/components/EventForm";

export default function CalendarPage() {
  const [events, setEvents] = useState<FamilyEvent[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setMemberId(saved);

    fetchEvents();
  }, []);

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
        <h2 className="text-xl font-bold text-gray-800">日程管理</h2>
        <EventForm memberId={memberId} onCreated={handleEventCreated} />

        {upcoming.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">即将到来</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
              {upcoming.map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">已过</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
              {[...past].reverse().map((event) => (
                <EventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {events.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">
            还没有日程，添加一个吧
          </div>
        )}
      </main>
    </>
  );
}
