"use client";

import { useState, useRef } from "react";
import { X, Upload, RotateCcw, Loader2 } from "lucide-react";

export default function BackgroundSettings({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    try {
      // Compress to max 1920px width
      const compressed = await compressBackground(file, 1920, 0.8);

      const formData = new FormData();
      formData.append("file", compressed, "background.jpg");
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("上传失败");
      const { url } = await uploadRes.json();

      // Save to settings
      const settingsRes = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "background_url", value: url }),
      });
      if (!settingsRes.ok) throw new Error("保存失败");

      // Apply immediately
      document.documentElement.style.setProperty("--bg-image", `url(${url})`);
      setPreviewUrl(url);
    } catch (err) {
      console.error("Background upload failed:", err);
      alert("背景上传失败，请重试");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    document.documentElement.style.setProperty("--bg-image", "url('/images/background.jpg')");
    // Clear custom setting
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "background_url", value: "" }),
    }).catch(console.error);
    setPreviewUrl(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 space-y-4"
        style={{ animation: "slideUp 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">更换背景</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Current background preview */}
        <div className="w-full h-32 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          <img
            src={previewUrl || "/images/background.jpg"}
            alt="背景预览"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Upload button */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInput}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all btn-press shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <Upload size={18} />
              选择新背景图片
            </>
          )}
        </button>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          恢复默认背景
        </button>
      </div>
    </div>
  );
}

async function compressBackground(file: File, maxWidth: number, quality: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}
