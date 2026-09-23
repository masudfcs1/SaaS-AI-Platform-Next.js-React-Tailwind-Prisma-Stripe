import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingPreview } from "@/components/landing-preview";
import { LandingContent } from "@/components/landing-content";
import { DuneLogo } from "@/components/dune-logo";

export const metadata: Metadata = {
  title: "Dune AI — A little intelligence. Endless possibility.",
  description: "A thoughtful AI workspace to explore ideas, write code, create images, and turn words into speech. Open Dune and start creating, no sign-in needed.",
};

export default function LandingPage() {
  return (
    <>
      <a href="#main-content" className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only">Skip to content</a>
      <LandingNavbar />
      <main id="main-content" tabIndex={-1} className="outline-none"><LandingHero /><LandingPreview /><LandingContent /></main>
      <footer className="border-t border-border bg-muted/40">
        <div className="landing-container py-10 sm:py-14">
          <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
            <div>
              <Link href="/" aria-label="Dune AI home" className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><DuneLogo compact /></Link>
              <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">For the things you haven&apos;t made yet.</p>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <Link href="/conversation" className="landing-nav-link">Chat</Link><Link href="/code" className="landing-nav-link">Code</Link><Link href="/image" className="landing-nav-link">Images</Link><Link href="/audio" className="landing-nav-link">Audio</Link><Link href="/settings" className="landing-nav-link inline-flex items-center gap-1">Settings <ArrowUpRight aria-hidden="true" className="h-3 w-3" /></Link>
            </nav>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted-foreground sm:mt-12"><p>&copy; {new Date().getFullYear()} Dune AI</p><p>A little space for your next big thing.</p></div>
        </div>
      </footer>
    </>
  );
}
