"use client";

import { useState, useEffect } from "react";
import { Images } from "lucide-react";
import { Post } from "@/lib/types";
import Navbar from "@/components/Navbar";
import PhotoGrid from "@/components/PhotoGrid";

export default function GalleryPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(data.filter((p: Post) => p.image_urls.length > 0));
  }

  const allPhotos = posts.flatMap((post) =>
    post.image_urls.map((url) => ({ url, title: post.title }))
  );

  return (
    <>
      <Navbar />
      <main className="max-w-lg mx-auto pt-16 pb-20 px-4">
        <div className="flex items-center gap-2 mb-4">
          <Images size={22} className="text-emerald-500" />
          <h2 className="text-xl font-bold text-gray-800">照片相册</h2>
          {allPhotos.length > 0 && (
            <span className="text-xs text-gray-400 ml-auto">{allPhotos.length} 张照片</span>
          )}
        </div>
        {allPhotos.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-12 text-center">
            <div className="text-4xl mb-3">📸</div>
            <p className="text-gray-400 text-sm">还没有照片，去日志里上传吧</p>
          </div>
        ) : (
          <PhotoGrid photos={allPhotos} />
        )}
      </main>
    </>
  );
}
