"use client";

import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Post } from "@/lib/types";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";

export default function JournalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchSelectedMember();
    fetchPosts();
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

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data);
  }

  function handlePostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen size={22} className="text-amber-500" />
          <h2 className="text-xl font-bold text-gray-800">生活日志</h2>
        </div>
        <PostForm memberId={memberId} onCreated={handlePostCreated} />
        {posts.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-12 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-400 text-sm">还没有日志，记录你的生活吧</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>
    </>
  );
}
