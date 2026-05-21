"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Message } from "@/lib/types";

export default function MessageForm({
  memberId,
  onSent,
}: {
  memberId: string | null;
  onSent: (message: Message) => void;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !content.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setContent("");
        onSent(data);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={memberId ? "说点什么..." : "请先选择身份"}
        disabled={!memberId}
        className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm disabled:bg-gray-50 disabled:text-gray-400 bg-white/60 transition-all"
        maxLength={500}
      />
      <button
        type="submit"
        disabled={sending || !content.trim() || !memberId}
        className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl text-sm font-medium transition-all btn-press shadow-sm disabled:shadow-none flex items-center gap-1.5"
      >
        {sending ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        发送
      </button>
    </form>
  );
}
