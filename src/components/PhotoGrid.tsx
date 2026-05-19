"use client";

import { useState } from "react";

export default function PhotoGrid({ photos }: { photos: { url: string; title: string }[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setSelected(photo.url)}
            className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
          >
            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <img
            src={selected}
            alt="大图"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setSelected(null)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white text-xl transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
