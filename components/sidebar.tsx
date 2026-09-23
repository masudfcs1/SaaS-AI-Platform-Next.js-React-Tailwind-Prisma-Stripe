"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpLeft,
  Code2,
  ImageIcon,
  LayoutGrid,
  MessageSquare,
  Music2,
  Settings2,
  Sparkles,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

const workspaceRoute = {
  label: "Workspace",
  icon: LayoutGrid,
  href: "/dashboard",
};

const toolRoutes = [
  { label: "Conversation", icon: MessageSquare, href: "/conversation" },
  { label: "Code", icon: Code2, href: "/code" },
  { label: "Images", icon: ImageIcon, href: "/image" },
  { label: "Music", icon: Music2, href: "/music" },
  { label: "Video", icon: Video, href: "/video" },
];

type SidebarProps = {
  onNavigate?: () => void;
};

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  const renderRoute = (route: typeof workspaceRoute) => {
    const active = pathname === route.href;

    return (
      <Link
        key={route.href}
        href={route.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900",
          active
            ? "bg-white text-violet-700 shadow-sm ring-1 ring-slate-200/70 dark:bg-white/[0.08] dark:text-violet-300 dark:ring-white/[0.04]"
            : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-100"
        )}
      >
        <route.icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
        <span className="flex-1">{route.label}</span>
        {active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
      </Link>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 dark:bg-[#111521]">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex h-20 shrink-0 items-center gap-3 px-6 pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500"
        aria-label="Dune AI workspace"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/20">
          <Sparkles aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
        </span>
        <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-slate-900 dark:text-white">Dune AI<span className="text-violet-500">.</span></span>
      </Link>

      <nav aria-label="Workspace navigation" className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {renderRoute(workspaceRoute)}
        <p className="mb-2 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">
          Create with AI
        </p>
        <div className="space-y-1">
          {toolRoutes.map(renderRoute)}
        </div>
      </nav>

      <div className="shrink-0 border-t border-slate-200/80 px-3 pb-4 pt-3 dark:border-white/[0.06]">
        {renderRoute({ label: "Settings", icon: Settings2, href: "/settings" })}
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-1 flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm text-slate-500 transition-colors hover:bg-slate-200/50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-slate-500 dark:hover:bg-white/[0.04] dark:hover:text-slate-200"
        >
          <ArrowUpLeft aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
          Back to website
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
