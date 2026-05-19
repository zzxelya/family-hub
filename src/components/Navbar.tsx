"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MemberSelector from "./MemberSelector";

const NAV_ITEMS = [
  { href: "/home", label: "主页", icon: "🏠" },
  { href: "/messages", label: "留言", icon: "💬" },
  { href: "/journal", label: "日志", icon: "📝" },
  { href: "/gallery", label: "相册", icon: "📸" },
  { href: "/calendar", label: "日程", icon: "📅" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/home" className="text-lg font-bold text-indigo-600">
            Family Hub
          </Link>
          <MemberSelector />
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                pathname === item.href
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
