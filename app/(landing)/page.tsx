import { LandingNavbar } from "@/components/landing-navbar";
import { LandingHero } from "@/components/landing-hero";
import { LandingContent } from "@/components/landing-content";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const LandingPage = () => {
  return (
    <div>
      <a href="#main-content" className="sr-only fixed left-4 top-4 z-50 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only">Skip to content</a>
      <LandingNavbar />
      <main id="main-content">
        <LandingHero />
        <LandingContent />
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" />
            <p>&copy; {new Date().getFullYear()} Dune AI</p>
          </div>
          <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <Link href="/dashboard" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Workspace</Link>
            <Link href="/conversation" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Chat</Link>
            <Link href="/code" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Code</Link>
            <Link href="/settings" className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Settings</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
