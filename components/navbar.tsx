"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import MobileSidebar from "@/components/mobileSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { tools } from "@/constants";

const Navbar = () => {
  const pathname = usePathname();
  const title = pathname === "/dashboard"
    ? "Workspace"
    : tools.find((tool) => tool.href === pathname)?.label ?? "Workspace";

  return (
    <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 bg-white px-3 dark:border-white/[0.07] dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <MobileSidebar />
        <span className="hidden text-sm text-slate-400 dark:text-slate-500 sm:inline">Dune AI</span>
        <ChevronRight aria-hidden="true" className="hidden h-3.5 w-3.5 text-slate-300 dark:text-slate-600 sm:block" />
        <p className="truncate text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
          {title}
        </p>
      </div>
      <ModeToggle />
    </header>
  );
};

export default Navbar;
