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
    <header className="z-20 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <MobileSidebar />
        <span className="hidden text-sm text-muted-foreground sm:inline">Dune AI</span>
        <ChevronRight aria-hidden="true" className="hidden h-3.5 w-3.5 text-muted-foreground/60 sm:block" />
        <p className="truncate text-sm font-semibold tracking-tight text-foreground">
          {title}
        </p>
      </div>
      <ModeToggle />
    </header>
  );
};

export default Navbar;
