"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Member } from "@/lib/types";
import MemberAvatar from "./MemberAvatar";

export default function MemberSelector() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchMembers();
    const saved = document.cookie
      .split("; ")
      .find((row) => row.startsWith("family_hub_member="))
      ?.split("=")[1];
    if (saved) setSelectedId(saved);
  }, []);

  async function fetchMembers() {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at");
    if (data) setMembers(data);
  }

  async function selectMember(id: string) {
    setSelectedId(id);
    setShowDropdown(false);
    document.cookie = `family_hub_member=${id}; path=/; max-age=${60 * 60 * 24 * 30}`;
  }

  const selected = members.find((m) => m.id === selectedId);

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
      >
        {selected ? (
          <>
            <MemberAvatar member={selected} size="sm" />
            <span className="text-sm font-medium text-gray-700 max-w-[60px] truncate">
              {selected.name}
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 px-2">选择身份</span>
        )}
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[140px] z-50">
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => selectMember(member.id)}
              className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors ${
                selectedId === member.id ? "bg-indigo-50" : ""
              }`}
            >
              <MemberAvatar member={member} size="sm" />
              <span className="text-sm text-gray-700">{member.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
