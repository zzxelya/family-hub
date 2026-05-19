"use client";

import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";

export default function JournalPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setMemberId(saved);

    fetchPosts();
  }, []);

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
        <h2 className="text-xl font-bold text-gray-800">生活日志</h2>
        <PostForm memberId={memberId} onCreated={handlePostCreated} />
        {posts.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            还没有日志，记录你的生活吧
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </main>
    </>
  );
}
