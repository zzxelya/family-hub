"use client";

import { useState, useEffect } from "react";
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
        <h2 className="text-xl font-bold text-gray-800 mb-4">照片相册</h2>
        {allPhotos.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            还没有照片，去日志里上传吧
          </div>
        ) : (
          <PhotoGrid photos={allPhotos} />
        )}
      </main>
    </>
  );
}
