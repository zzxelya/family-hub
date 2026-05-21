"use client";

import { useState } from "react";
import { Plus, X, Loader2, CalendarPlus } from "lucide-react";
import { FamilyEvent } from "@/lib/types";

export default function EventForm({
  memberId,
  onCreated,
}: {
  memberId: string | null;
  onCreated: (event: FamilyEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [recurrence, setRecurrence] = useState<"none" | "yearly" | "monthly">("none");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !title.trim() || !date) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date,
          description: description.trim(),
          recurrence,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setDate("");
        setDescription("");
        setRecurrence("none");
        setShowForm(false);
        onCreated(data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        disabled={!memberId}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all text-sm btn-press shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center gap-2"
      >
        <CalendarPlus size={16} />
        {memberId ? "添加日程" : "请先选择身份"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-4 space-y-3" style={{ animation: "slideUp 0.3s ease-out" }}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 flex items-center gap-1.5">
          <CalendarPlus size={16} className="text-pink-500" />
          添加日程
        </h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="日程名称（如：妈妈生日）"
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-sm bg-white/60 transition-all"
        required
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-sm bg-white/60 transition-all"
          required
        />
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as "none" | "yearly" | "monthly")}
          className="px-3 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-sm bg-white/60 transition-all"
        >
          <option value="none">不重复</option>
          <option value="yearly">每年</option>
          <option value="monthly">每月</option>
        </select>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="备注..."
        rows={2}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-sm resize-none bg-white/60 transition-all"
      />
      <button
        type="submit"
        disabled={submitting || !title.trim() || !date}
        className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl text-sm font-medium transition-all btn-press shadow-sm disabled:shadow-none flex items-center justify-center gap-1.5"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        {submitting ? "添加中..." : "添加"}
      </button>
    </form>
  );
}
