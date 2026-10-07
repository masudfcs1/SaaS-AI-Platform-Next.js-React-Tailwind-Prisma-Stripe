"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpLeft,
  LayoutGrid,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { chatModes, chatTools } from "@/lib/chat-tools";
import { DuneLogo } from "@/components/dune-logo";

const workspaceRoute = {
  label: "Workspace",
  icon: LayoutGrid,
  href: "/dashboard",
};

const toolRoutes = chatModes.map((mode) => ({
  label: mode === "conversation" ? chatTools[mode].label : chatTools[mode].shortLabel,
  icon: chatTools[mode].icon,
  href: chatTools[mode].href,
}));

type SidebarProps = {
  onNavigate?: () => void;
};

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const pathname = usePathname();

  const renderRoute = (route: typeof workspaceRoute) => {
    const active = pathname === route.href;

    return (
      <Button
        key={route.href}
        asChild
        variant="ghost"
        className={cn(
          "group h-11 w-full justify-start gap-3 rounded-xl px-3 text-sm font-medium",
          active
            ? "bg-accent text-accent-foreground ring-1 ring-primary/10"
            : "text-muted-foreground"
        )}
      >
        <Link href={route.href} onClick={onNavigate} aria-current={active ? "page" : undefined}>
          <route.icon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
          <span className="flex-1">{route.label}</span>
          {active && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/50">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex h-20 shrink-0 items-center gap-3 px-6 pr-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
        aria-label="Dune AI workspace"
      >
        <DuneLogo compact />
      </Link>

      <nav aria-label="Workspace navigation" className="min-h-0 flex-1 overflow-y-auto px-3 pb-6 pt-3">
        {renderRoute(workspaceRoute)}
        <p className="mb-2 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Create with AI
        </p>
        <div className="space-y-1">
          {toolRoutes.map(renderRoute)}
        </div>
      </nav>

      <div className="shrink-0 border-t border-border px-3 pb-4 pt-3">
        {renderRoute({ label: "Settings", icon: Settings2, href: "/settings" })}
        <Button asChild variant="ghost" className="mt-1 h-11 w-full justify-start gap-3 rounded-xl px-3 text-muted-foreground">
          <Link href="/" onClick={onNavigate}>
            <ArrowUpLeft aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
            Back to website
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
