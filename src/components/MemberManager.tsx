"use client";

import { useState, useRef } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import { Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

export default function MemberManager({ onClose }: { onClose: () => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // Load members on first render
  if (!loaded) {
    setLoaded(true);
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
      })
      .catch(console.error);
  }

  async function handleAvatarUpload(memberId: string, file: File) {
    setLoadingId(memberId);

    try {
      // Compress image to 512x512
      const compressed = await compressImage(file, 512, 0.8);

      // Upload to storage
      const formData = new FormData();
      formData.append("file", compressed, `avatar-${memberId}.jpg`);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });

      if (!uploadRes.ok) throw new Error("上传失败");
      const { url } = await uploadRes.json();

      // Update member avatar_url
      const patchRes = await fetch("/api/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId, avatar_url: url }),
      });

      if (!patchRes.ok) throw new Error("更新失败");
      const updated = await patchRes.json();

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, avatar_url: updated.avatar_url } : m))
      );
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("头像上传失败，请重试");
    } finally {
      setLoadingId(null);
    }
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
          <h3 className="text-lg font-bold text-gray-800">管理成员</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <p className="text-xs text-gray-400">点击头像可更换图片</p>

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="relative group">
                <MemberAvatar member={member} size="lg" />
                {loadingId === member.id ? (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <Loader2 size={18} className="text-white animate-spin" />
                  </div>
                ) : (
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer">
                    <Camera size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={(el) => { fileInputs.current[member.id] = el; }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(member.id, file);
                  }}
                />
                <button
                  onClick={() => fileInputs.current[member.id]?.click()}
                  className="absolute inset-0 rounded-full cursor-pointer"
                  aria-label={`更换${member.name}的头像`}
                />
              </div>
              <div>
                <span className="font-medium text-gray-800">{member.name}</span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {member.avatar_url ? "已设置头像" : "使用默认头像"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function compressImage(file: File, maxSize: number, quality: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const size = Math.min(width, height);
      const left = (width - size) / 2;
      const top = (height - size) / 2;

      canvas.width = maxSize;
      canvas.height = maxSize;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, left, top, size, size, 0, 0, maxSize, maxSize);

      canvas.toBlob(
        (blob) => resolve(new File([blob!], file.name, { type: "image/jpeg" })),
        "image/jpeg",
        quality
      );
    };
    img.src = URL.createObjectURL(file);
  });
}
