import Link from "next/link";
import { ArrowDown, ArrowUpRight, AudioLines, Check, Code2, ImageIcon, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LandingHeroScene } from "@/components/landing-hero-scene";

const creativeTools = [
  { number: "01", label: "Think it.", description: "A conversation away", icon: MessageSquare, href: "/conversation" },
  { number: "02", label: "Build it.", description: "From idea to code", icon: Code2, href: "/code" },
  { number: "03", label: "See it.", description: "Imagination, in focus", icon: ImageIcon, href: "/image" },
  { number: "04", label: "Say it.", description: "Words with a voice", icon: AudioLines, href: "/audio" },
];

export const LandingHero = () => (
  <section aria-labelledby="hero-heading" className="landing-hero">
    <div className="landing-container">
      <div className="hero-layout">
        <div className="hero-copy">
          <p className="hero-eyebrow"><span aria-hidden="true" /> A little intelligence. A new perspective.</p>
          <h1 id="hero-heading" className="hero-heading">
            Your ideas,<br />in a new<br /><span className="landing-serif">dimension.</span>
          </h1>
          <p className="hero-description">A thoughtful space to turn what if into what&apos;s next. Think, build, and create with a little help from AI.</p>
          <div className="hero-actions">
            <Button asChild size="lg" className="hero-primary-action group h-[52px] gap-6 rounded-full px-7">
              <Link href="/dashboard">Start creating <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></Link>
            </Button>
            <Link href="#workspace" className="hero-secondary-action">Explore the workspace <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" /></Link>
          </div>
          <p className="hero-footnote"><Check aria-hidden="true" className="h-3.5 w-3.5" /> No account needed <span aria-hidden="true">·</span> Just bring your curiosity</p>
        </div>

        <LandingHeroScene />
      </div>

      <div className="hero-toolkit">
        <div className="hero-toolkit-intro"><span className="landing-eyebrow">Your creative toolkit</span><p>One space. Endless possibilities.</p></div>
        <nav aria-label="Creative tools" className="hero-tools">
          {creativeTools.map(({ number, label, description, icon: Icon, href }) => (
            <Link key={href} href={href} className="hero-tool">
              <span aria-hidden="true" className="hero-tool-icon"><Icon className="h-[18px] w-[18px]" strokeWidth={1.5} /></span>
              <span><span className="hero-tool-title">{label}<ArrowUpRight aria-hidden="true" className="h-3 w-3" /></span><span className="hero-tool-description">{description}</span></span>
              <span aria-hidden="true" className="hero-tool-number">{number}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  </section>
);
