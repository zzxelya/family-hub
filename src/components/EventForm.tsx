"use client";

import { useState } from "react";
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
          member_id: memberId,
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
        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-2xl font-medium transition-colors text-sm"
      >
        {memberId ? "添加日程" : "请先选择身份"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">添加日程</h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
          ✕
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="日程名称（如：妈妈生日）"
        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm"
        required
      />
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm"
          required
        />
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value as "none" | "yearly" | "monthly")}
          className="px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm"
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
        className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 outline-none text-sm resize-none"
      />
      <button
        type="submit"
        disabled={submitting || !title.trim() || !date}
        className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white rounded-xl text-sm font-medium transition-colors"
      >
        {submitting ? "添加中..." : "添加"}
      </button>
    </form>
  );
}
