import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

export const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Dune AI home" className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Dune AI<span className="text-primary">.</span></span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <Link href="#tools" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Explore tools</Link>
          <Link href="#how-it-works" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">How it works</Link>
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ModeToggle />
          <Button asChild size="sm" className="gap-1.5 rounded-lg">
            <Link href="/dashboard">
              <span className="sm:hidden">Open app</span>
              <span className="hidden sm:inline">Open workspace</span>
              <ArrowUpRight aria-hidden="true" className="hidden h-3.5 w-3.5 sm:block" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
