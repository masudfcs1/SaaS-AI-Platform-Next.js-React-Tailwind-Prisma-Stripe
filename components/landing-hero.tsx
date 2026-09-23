import Link from "next/link";
import { ArrowDown, ArrowUpRight, AudioLines, Code2, ImageIcon, MessageSquare, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DuneMark } from "@/components/dune-mark";

function DuneArtwork() {
  return (
    <svg className="h-full w-full" viewBox="0 0 640 720" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="dune-sky" x1="320" y1="0" x2="320" y2="720" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EACCB3" /><stop offset=".55" stopColor="#F1D5B9" /><stop offset="1" stopColor="#CE9D7D" />
        </linearGradient>
        <radialGradient id="dune-sun" cx="0" cy="0" r="1" gradientTransform="translate(252 219) rotate(54) scale(331)" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFA65F" /><stop offset=".45" stopColor="#E9713F" /><stop offset=".8" stopColor="#B44429" /><stop offset="1" stopColor="#6E2C23" />
        </radialGradient>
        <linearGradient id="dune-rear" x1="420" y1="435" x2="540" y2="652" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5DEC1" /><stop offset=".45" stopColor="#D3AD8F" /><stop offset="1" stopColor="#8E5B41" />
        </linearGradient>
        <linearGradient id="dune-front" x1="150" y1="415" x2="303" y2="733" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFEDD1" /><stop offset=".35" stopColor="#DEBE98" /><stop offset="1" stopColor="#A67656" />
        </linearGradient>
        <linearGradient id="dune-fold" x1="215" y1="510" x2="407" y2="694" gradientUnits="userSpaceOnUse">
          <stop stopColor="#76503D" /><stop offset=".6" stopColor="#A97B5A" /><stop offset="1" stopColor="#CA9B71" />
        </linearGradient>
        <filter id="dune-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer><feFuncA type="linear" slope=".12" /></feComponentTransfer>
          <feBlend in="SourceGraphic" mode="soft-light" />
        </filter>
      </defs>
      <g filter="url(#dune-grain)">
        <path fill="url(#dune-sky)" d="M0 0h640v720H0z" />
        <circle cx="329" cy="296" r="164" fill="url(#dune-sun)" />
        <ellipse cx="329" cy="296" rx="234" ry="78" transform="rotate(-31 329 296)" stroke="#FFF1D8" strokeOpacity=".7" strokeWidth="1" />
        <path d="M-30 558c133 11 263-114 375-149 123-39 207 24 325 9v302H-30V558Z" fill="url(#dune-rear)" />
        <path d="M-40 447c117-41 211-36 307 58 98 95 236 151 413 106v109H-40V447Z" fill="url(#dune-front)" />
        <path d="M172 438c102 45 121 203 364 282H277c64-36 40-174-105-282Z" fill="url(#dune-fold)" />
        <path d="M-20 477c111-38 188-27 259 36M-20 494c114-39 185-26 269 44M-20 511c118-40 192-25 280 51M-20 528c123-40 201-22 292 58M-20 545c128-40 211-20 304 65M-20 562c132-39 222-17 319 75M-20 579c137-38 236-13 338 87M-20 596c146-36 252-8 360 100M-20 613c155-34 264-2 377 109M-20 630c165-31 273 5 376 99M-20 647c174-28 275 10 361 83M-20 664c181-24 275 14 336 60M-20 681c185-19 271 17 301 41" stroke="#FFF0D4" strokeOpacity=".32" />
        <path d="M369 434c75-10 124 28 213 31M352 447c80-11 132 27 229 36M338 460c89-11 142 27 247 43M330 475c91-8 147 26 253 47" stroke="#FBEDD2" strokeOpacity=".4" />
      </g>
      <path d="M50 58h23M61.5 46.5v23M568 630h23M579.5 618.5v23" stroke="#70482F" strokeOpacity=".65" />
      <circle cx="505" cy="159" r="4" fill="#FFF4DC" />
    </svg>
  );
}

export const LandingHero = () => (
  <section aria-labelledby="hero-heading" className="landing-container relative pb-14 pt-10 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-14">
    <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_1fr] lg:gap-12 xl:gap-20">
      <div className="relative z-10 lg:pb-8">
        <p className="landing-eyebrow flex items-center gap-2.5"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" /> A little intelligence. Endless possibility.</p>
        <h1 id="hero-heading" className="mt-7 text-[clamp(3.5rem,7vw,6.5rem)] font-medium leading-[.98] tracking-[-.07em]">
          Your ideas,<br />with room<br />to <span className="landing-serif text-primary">grow.</span>
        </h1>
        <p className="mt-7 max-w-[23rem] text-base leading-7 text-muted-foreground sm:mt-8 sm:text-[17px] sm:leading-8">A thoughtful space to talk it through, build something useful, and bring a little more imagination to your everyday.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5 sm:gap-7">
          <Button asChild size="lg" className="group h-12 gap-6 rounded-full px-6">
            <Link href="/dashboard">Start creating <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" /></Link>
          </Button>
          <Link href="#workspace" className="group inline-flex items-center gap-2 rounded-sm py-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Take a look around <ArrowDown aria-hidden="true" className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5 motion-reduce:transform-none" /></Link>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">No account. No sign-in. Just your next idea.</p>
      </div>
      <figure className="relative mx-auto w-full max-w-[35rem] lg:mx-0">
        <div className="landing-art relative aspect-[8/9] overflow-hidden rounded-t-[42%] rounded-b-[1.5rem] border border-foreground/5">
          <DuneArtwork />
          <div className="absolute inset-x-0 bottom-7 flex items-end justify-between px-7 text-[#402b20] sm:bottom-9 sm:px-9">
            <p className="text-[10px] font-medium uppercase leading-5 tracking-[.2em]">An open mind.<br />A new horizon.</p><DuneMark className="h-9 w-9" />
          </div>
        </div>
        <div className="absolute -left-2 bottom-[22%] flex items-center gap-3 rounded-2xl border border-border bg-card/95 py-3 pl-3 pr-5 shadow-[0_12px_40px_-16px_hsl(var(--foreground)/0.25)] backdrop-blur-md sm:-left-7 sm:py-4 sm:pl-4 sm:pr-6 lg:-left-9">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary"><DuneMark className="h-6 w-6" /></span>
          <div><p className="text-[10px] uppercase tracking-[.14em] text-muted-foreground">A starting point</p><p className="mt-1 text-sm font-medium">What if we tried something new?</p></div>
        </div>
        <figcaption className="mt-4 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[.16em] text-muted-foreground sm:text-[10px]"><span>Fig. 001 &mdash; A study in possibility</span><Plus className="h-3 w-3" aria-hidden="true" /></figcaption>
      </figure>
    </div>
    <div className="mt-14 flex flex-col justify-between gap-5 border-y border-border py-5 sm:mt-20 sm:flex-row sm:items-center lg:mt-20">
      <p className="text-xs text-muted-foreground">One curious mind. Four ways to create.</p>
      <div className="grid grid-cols-4 gap-3 sm:gap-8 lg:gap-12">
        {[
          { label: "Think it.", icon: MessageSquare, href: "/conversation" },
          { label: "Build it.", icon: Code2, href: "/code" },
          { label: "See it.", icon: ImageIcon, href: "/image" },
          { label: "Say it.", icon: AudioLines, href: "/audio" },
        ].map(({ label, icon: Icon, href }) => (
          <Link key={href} href={href} className="flex items-center gap-2 rounded-sm py-1 text-xs font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"><Icon className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" strokeWidth={1.5} aria-hidden="true" />{label}</Link>
        ))}
      </div>
    </div>
  </section>
);
