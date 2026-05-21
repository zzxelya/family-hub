"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

export default function MemberSelector() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMembers();
    fetchSelectedMember();

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (Array.isArray(data)) setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    }
  }

  async function fetchSelectedMember() {
    try {
      const res = await fetch("/api/members/selected");
      if (res.ok) {
        const { memberId } = await res.json();
        if (memberId) setSelectedId(memberId);
      }
    } catch {
      // Not selected yet, that's fine
    }
  }

  async function selectMember(id: string) {
    setSelectedId(id);
    setShowDropdown(false);
    try {
      await fetch("/api/members/set-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: id }),
      });
    } catch (err) {
      console.error("Failed to set member:", err);
    }
  }

  const selected = members.find((m) => m.id === selectedId);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm border border-white/30 hover:shadow-md transition-all btn-press"
      >
        {selected ? (
          <>
            <MemberAvatar member={selected} size="sm" />
            <span className="text-sm font-medium text-gray-700 max-w-[60px] truncate">
              {selected.name}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 px-1">选择身份</span>
        )}
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
      </button>

      {showDropdown && (
        <div
          className="absolute right-0 mt-2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/30 py-2 min-w-[160px] z-50"
          style={{ animation: "slideUp 0.2s ease-out" }}
        >
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => selectMember(member.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/50 transition-colors ${
                selectedId === member.id ? "bg-indigo-50/50" : ""
              }`}
            >
              <MemberAvatar member={member} size="sm" />
              <span className="text-sm text-gray-700 font-medium">{member.name}</span>
              {selectedId === member.id && (
                <span className="ml-auto text-indigo-500 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
