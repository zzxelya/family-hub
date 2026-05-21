"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, BookImage, Images, CalendarDays } from "lucide-react";
import MemberSelector from "./MemberSelector";

const NAV_ITEMS = [
  { href: "/home", label: "主页", Icon: Home },
  { href: "/messages", label: "留言", Icon: MessageCircle },
  { href: "/journal", label: "日志", Icon: BookImage },
  { href: "/gallery", label: "相册", Icon: Images },
  { href: "/calendar", label: "日程", Icon: CalendarDays },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-b border-white/20 z-40 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <Link href="/home" className="flex items-center gap-1.5 group">
            <span className="text-lg">🏠</span>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Family Hub
            </span>
          </Link>
          <MemberSelector />
        </div>
      </header>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-white/20 z-40 shadow-[0_-1px_10px_rgba(0,0,0,0.04)]">
        <div className="max-w-lg mx-auto flex justify-around py-1.5 px-2">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 btn-press ${
                  active
                    ? "text-indigo-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {active && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                )}
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
