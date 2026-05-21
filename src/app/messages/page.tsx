"use client";

import { useState, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { Message } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MessageItem from "@/components/MessageItem";
import MessageForm from "@/components/MessageForm";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchSelectedMember();
    fetchMessages();
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

  async function fetchMessages() {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data);
  }

  function handleMessageSent(message: Message) {
    setMessages((prev) => [message, ...prev]);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={22} className="text-indigo-500" />
          <h2 className="text-xl font-bold text-gray-800">留言板</h2>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-4 mb-4">
          <MessageForm memberId={memberId} onSent={handleMessageSent} />
        </div>
        <div className="space-y-1">
          {messages.length === 0 ? (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-8 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-400 text-sm">还没有留言，说点什么吧</p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                isOwn={msg.member_id === memberId}
              />
            ))
          )}
        </div>
      </main>
    </>
  );
}
