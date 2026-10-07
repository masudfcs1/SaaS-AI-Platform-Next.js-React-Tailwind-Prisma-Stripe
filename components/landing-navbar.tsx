import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { DuneLogo } from "@/components/dune-logo";

export const LandingNavbar = () => (
  <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/85">
    <div className="landing-container flex h-[76px] items-center justify-between gap-4 sm:h-[88px]">
      <Link href="/" aria-label="Dune AI home" className="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background">
        <DuneLogo />
      </Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-8 text-[13px] text-muted-foreground md:flex lg:gap-10">
        <Link href="#workspace" className="landing-nav-link">The workspace</Link><Link href="#tools" className="landing-nav-link">Our tools</Link><Link href="#how-it-works" className="landing-nav-link">How it works</Link>
      </nav>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <ModeToggle contentClassName="landing-page" />
        <Button asChild size="sm" className="h-10 gap-3 rounded-full px-4 sm:px-5"><Link href="/dashboard"><span className="sm:hidden">Open app</span><span className="hidden sm:inline">Open workspace</span><ArrowUpRight aria-hidden="true" className="hidden h-3.5 w-3.5 sm:block" /></Link></Button>
      </div>
    </div>
  </header>
);
