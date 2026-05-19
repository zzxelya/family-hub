"use client";

import { useState, useEffect } from "react";
import { Message } from "@/lib/types";
import Navbar from "@/components/Navbar";
import MessageItem from "@/components/MessageItem";
import MessageForm from "@/components/MessageForm";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setMemberId(saved);

    fetchMessages();
  }, []);

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
        <h2 className="text-xl font-bold text-gray-800 mb-4">留言板</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <MessageForm memberId={memberId} onSent={handleMessageSent} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 divide-y divide-gray-50">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              还没有留言，说点什么吧
            </p>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
        </div>
      </main>
    </>
  );
}
