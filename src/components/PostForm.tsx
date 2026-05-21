"use client";

import { useState, useRef } from "react";
import { Plus, X, ImagePlus, Loader2, PenLine } from "lucide-react";
import { Post } from "@/lib/types";

export default function PostForm({
  memberId,
  onCreated,
}: {
  memberId: string | null;
  onCreated: (post: Post) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [...prev, data.url]);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!memberId || !title.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image_urls: images,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTitle("");
        setContent("");
        setImages([]);
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
        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-2xl font-medium transition-all text-sm btn-press shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center gap-2"
      >
        <PenLine size={16} />
        {memberId ? "写新日志" : "请先选择身份"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-[var(--color-border)] p-4 space-y-3" style={{ animation: "slideUp 0.3s ease-out" }}>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 flex items-center gap-1.5">
          <PenLine size={16} className="text-amber-500" />
          写日志
        </h3>
        <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm bg-white/60 transition-all"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="记录一下今天的生活..."
        rows={3}
        className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm resize-none bg-white/60 transition-all"
      />
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative w-20 h-20 group">
              <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <label className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm cursor-pointer transition-colors flex items-center gap-1.5 text-gray-600">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
          {uploading ? "上传中..." : "图片"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl text-sm font-medium transition-all btn-press shadow-sm disabled:shadow-none flex items-center justify-center gap-1.5"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? "发布中..." : "发布"}
        </button>
      </div>
    </form>
  );
}
