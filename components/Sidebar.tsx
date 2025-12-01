// components/Sidebar.tsx
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Server, Activity, Globe, BarChart3, Settings, LogOut, Github, Star } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] h-screen bg-gray-50/50 border-r border-gray-200 flex flex-col sticky top-0">

      {/* 1. Profile Section */}
      <div className="p-4 mb-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold">
            <img
              src="https://avatar.vercel.sh/channelc"
              alt="Avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900">Channel C</span>
            <span className="text-xs text-gray-500">@channelc</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">

        {/* 2. Navigation Section */}
        <div>
          <nav className="space-y-0.5">
            <NavItem href="/" icon={<LayoutGrid size={18} />} label="Overview" active={pathname === "/"} />
            <NavItem href="/allvideos" icon={<Server size={18} />} label="All Videos" active={pathname === "/allvideos"} />
            <NavItem href="/analytics" icon={<Activity size={18} />} label="Deep Analytics" active={pathname === "/analytics"} />
            <NavItem href="/customize" icon={<Globe size={18} />} label="Customize Channel" active={pathname === "/customize"} />
            <NavItem href="/revenue" icon={<BarChart3 size={18} />} label="Revenue" active={pathname === "/revenue"} />
          </nav>
        </div>

        {/* 3. Teams Section */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 tracking-wider mb-2">
            Your Channels
          </h3>
          <div className="space-y-0.5">
            <TeamItem name="MrBeast" initial="M" />
            <TeamItem name="PewDiePie" initial="D" />
            <TeamItem name="Logan Paul" initial="L" />
          </div>
        </div>

      </div>
      <div className="p-3 border-t border-gray-200 mt-auto space-y-1">

        {/* GitHub Rate */}
        <Link
          href="https://github.com/yourusername/project"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Github size={18} />
            <span>Rate on GitHub</span>
          </div>
          {/* Star Count Badge */}
          <div className="flex items-center gap-1 bg-gray-200 px-1.5 py-0.5 rounded-md text-xs font-semibold group-hover:bg-gray-300 transition-colors">
            <Star size={10} className="fill-gray-600" />
            <span>12.5k</span>
          </div>
        </Link>

        {/* Settings (Moved here) */}
        <NavItem href="/settings" icon={<Settings size={18} />} label="Settings" active={pathname === "/settings"} />

        {/* Logout */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left"

        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}

// Helper Component for Navigation Links
function NavItem({ href, icon, label, active = false }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
        ${active
          ? "bg-gray-100 text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}
      `}
    >
      <span className={active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}

// Helper Component for Teams
function TeamItem({ name, initial }: { name: string; initial: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-left">
      <div className="w-6 h-6 rounded border bg-white flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm">
        {initial}
      </div>
      {name}
    </button>
  );
}