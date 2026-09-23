"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, AudioLines, Check, Code2, ImageIcon, MessageCircle, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const previewTools = [
  { id: "chat", label: "Chat", icon: MessageCircle, href: "/conversation", title: "Make a little room for a big idea.", subtitle: "Think it through, one conversation at a time.", prompt: "Help me plan a slower, more creative morning." },
  { id: "code", label: "Code", icon: Code2, href: "/code", title: "Build the thing you keep imagining.", subtitle: "Turn a problem into a clear next step.", prompt: "Write a small function to format a reading time." },
  { id: "image", label: "Image", icon: ImageIcon, href: "/image", title: "Give your imagination a shape.", subtitle: "Describe a direction. Explore what it could become.", prompt: "A sunlit desert, soft curves, and the quiet of an open horizon." },
  { id: "audio", label: "Audio", icon: AudioLines, href: "/audio", title: "Find the voice in your words.", subtitle: "Bring a script to life with spoken audio.", prompt: "Read this as a warm, unhurried introduction." },
] as const;

const waveHeights = [18, 28, 19, 40, 56, 35, 24, 47, 70, 51, 35, 58, 79, 63, 41, 57, 87, 65, 44, 67, 91, 71, 46, 58, 80, 54, 35, 61, 76, 50, 28, 40, 60, 43, 26, 39, 53, 32, 19, 27];

function ChatExample() {
  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="max-w-lg">
        <p className="text-base font-medium leading-7">Let&apos;s start small. Give yourself 30 minutes before the day asks anything of you.</p>
        <div className="mt-5 space-y-4">
          {[
            ["01", "Ease into it", "Open the curtains. Make something warm. Leave your phone where it is."],
            ["02", "Make a little space", "Write a page, sketch a shape, or follow an idea without needing to finish it."],
            ["03", "Choose one thing", "Pick the one small thing you want to carry into the rest of your day."],
          ].map(([number, title, text]) => (
            <div key={number} className="flex gap-3">
              <span className="mt-0.5 font-mono text-[10px] leading-5 text-primary">{number}</span>
              <div>
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="hidden w-28 rotate-[5deg] rounded-sm border border-border bg-background p-3 shadow-[3px_5px_0_hsl(var(--muted))] lg:block">
        <div className="flex h-20 items-center justify-center rounded-full bg-primary/10">
          <svg viewBox="0 0 64 64" className="h-16 w-16 text-primary" fill="none">
            <path d="M21 28h24v12a12 12 0 0 1-24 0V28Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="M45 31h3a5 5 0 1 1 0 10h-3M19 53h29M27 20c-5-5 5-7 0-12m10 12c-5-5 5-7 0-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="mt-3 text-center font-serif text-sm italic">Less rush.<br />More room.</p>
      </div>
    </div>
  );
}

function CodeExample() {
  return (
    <div>
      <p className="max-w-xl text-sm leading-6 text-muted-foreground">Count the words, divide by a comfortable reading pace, and round up. This also handles an empty string.</p>
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2"><Code2 aria-hidden="true" className="h-3.5 w-3.5" /> reading-time.ts</span>
          <span>TypeScript</span>
        </div>
        <pre tabIndex={0} role="region" aria-label="Example TypeScript code" className="overflow-x-auto p-4 font-mono text-[11px] leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5 sm:text-xs"><code><span className="text-primary">{"function "}</span>{"readingTime(text: string) {\n"}<span className="text-muted-foreground">{"  const words = text.trim()\n"}</span>{"    ? text.trim().split(/\\s+/).length\n    : 0;\n\n"}<span className="text-primary">{"  return "}</span>{"`${Math.max(1, Math.ceil(words / 200))} min`;\n}"}</code></pre>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Check aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> Small, readable, and ready to adapt.</p>
    </div>
  );
}

function ImageExample() {
  return (
    <figure className="min-w-0">
      <div className="relative isolate overflow-hidden rounded-xl bg-[#e9cfad]">
        <svg viewBox="0 0 780 330" role="img" aria-label="An abstract desert illustration with a pale sun and layered terracotta dunes" className="aspect-[78/33] w-full">
          <rect width="780" height="330" fill="#ead5b8" />
          <circle cx="535" cy="105" r="62" fill="#fbefcf" />
          <path d="M0 206C120 195 178 105 306 156c77 30 113 92 213 79 98-12 151-67 261-67v162H0Z" fill="#dcb88d" />
          <path d="M0 267c135-81 271-112 405-30 144 88 223-12 375-26v119H0Z" fill="#be7855" />
          <path d="M0 288c178 56 283-103 448-47 123 42 212 72 332 30v59H0Z" fill="#92533c" />
          <path d="M0 312c178-36 290-70 437-17 112 41 235 31 343-4v39H0Z" fill="#643e31" />
          <path d="M596 158c-6-3-10-2-15 1m26-4c-5-4-8-4-12-1" stroke="#92533c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
        <div aria-hidden="true" className="absolute bottom-4 left-5 font-serif text-2xl italic tracking-tight text-[#fff4df] sm:bottom-5 sm:text-3xl">Somewhere, slower.</div>
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground"><span>Concept illustration · Made for this preview</span><span>Warm tones / Open spaces</span></figcaption>
    </figure>
  );
}

function AudioExample() {
  return (
    <div>
      <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><AudioLines aria-hidden="true" className="h-5 w-5" /></span>
          <div><p className="text-sm font-medium">A moment to begin</p><p className="mt-0.5 text-[11px] text-muted-foreground">Narration concept · Warm &amp; unhurried</p></div>
        </div>
        <div aria-hidden="true" className="mt-5 flex h-24 items-center justify-center gap-[3px] sm:gap-[5px]">
          {waveHeights.map((height, index) => <span key={index} className="min-w-0 max-w-1.5 flex-1 rounded-full bg-primary/65" style={{ height: `${height}%`, opacity: index > 27 ? 0.3 : index > 19 ? 0.5 : 1 }} />)}
        </div>
        <p className="mt-4 border-t border-primary/10 pt-4 font-serif text-lg leading-relaxed sm:text-xl">&ldquo;Every good thing starts with a little space. A breath. An idea. A moment to begin.&rdquo;</p>
      </div>
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">Illustrative waveform. Open Audio to generate and listen to AI speech from your own script.</p>
    </div>
  );
}

export function LandingPreview() {
  const [selected, setSelected] = useState(0);
  const [vertical, setVertical] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const active = previewTools[selected];

  useEffect(() => {
    const breakpoint = window.matchMedia("(min-width: 768px)");
    const update = () => setVertical(breakpoint.matches);
    update();
    breakpoint.addEventListener("change", update);
    return () => breakpoint.removeEventListener("change", update);
  }, []);

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    let next: number;
    if (event.key === (vertical ? "ArrowDown" : "ArrowRight")) next = (current + 1) % previewTools.length;
    else if (event.key === (vertical ? "ArrowUp" : "ArrowLeft")) next = (current + previewTools.length - 1) % previewTools.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = previewTools.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="workspace" aria-labelledby={`${id}-heading`} className="scroll-mt-24 py-14 sm:py-20">
      <div className="landing-container">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-9 sm:flex-row sm:items-end">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">A feel for the flow</p><h2 id={`${id}-heading`} className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">One space. Many ways to begin.</h2></div>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">Take a look around. Choose a tool and see where your next idea could go.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_-36px_hsl(var(--foreground)/0.2)] sm:rounded-[1.4rem]">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-6">
            <div className="flex min-w-0 items-center gap-3"><div aria-hidden="true" className="hidden gap-1.5 sm:flex"><span className="h-2 w-2 rounded-full bg-foreground/20" /><span className="h-2 w-2 rounded-full bg-foreground/10" /><span className="h-2 w-2 rounded-full bg-foreground/10" /></div><span className="truncate text-[11px] font-medium tracking-wide">Dune creative workspace</span></div>
            <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">Workspace preview</span>
          </div>

          <div className="grid min-w-0 md:grid-cols-[190px_minmax(0,1fr)] lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="min-w-0 border-b border-border bg-background/40 p-3 md:border-b-0 md:border-r md:p-5">
              <div className="mb-7 hidden items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:flex"><span>Your toolkit</span><Plus aria-hidden="true" className="h-3 w-3" /></div>
              <div role="tablist" aria-label="Preview a creative tool" aria-orientation={vertical ? "vertical" : "horizontal"} className="grid grid-cols-4 gap-1 md:flex md:flex-col md:gap-2">
                {previewTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return <Button key={tool.id} ref={(element) => { tabRefs.current[index] = element; }} id={`${id}-tab-${tool.id}`} role="tab" type="button" variant="ghost" aria-selected={selected === index} aria-controls={`${id}-panel-${tool.id}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={(event) => moveTab(event, index)} className={cn("h-14 min-w-0 flex-col gap-1 rounded-lg px-1 text-[10px] font-medium md:h-11 md:w-full md:flex-row md:justify-start md:gap-3 md:px-3 md:text-sm", selected === index ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />{tool.label}<span aria-hidden="true" className={cn("ml-auto hidden h-1 w-1 rounded-full bg-primary md:block", selected !== index && "invisible")} /></Button>;
                })}
              </div>
              <div className="mt-24 hidden rounded-lg border border-border p-3.5 md:block"><Sparkles aria-hidden="true" className="h-4 w-4 text-primary" /><p className="mt-3 text-xs font-medium leading-5">A little curiosity<br />goes a long way.</p><p className="mt-2 text-[10px] leading-4 text-muted-foreground">Bring an idea.<br />Make it your own.</p></div>
            </div>

            <div className="min-w-0">
              {previewTools.map((tool, index) => <div key={tool.id} id={`${id}-panel-${tool.id}`} role="tabpanel" aria-labelledby={`${id}-tab-${tool.id}`} hidden={selected !== index} tabIndex={0} className="min-w-0 px-5 pb-6 pt-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-8 sm:pt-8 lg:px-10">
                <div className="mb-6 flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Illustrative example</p><h3 className="mt-2 text-xl font-medium leading-snug tracking-tight sm:text-2xl">{tool.title}</h3><p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm">{tool.subtitle}</p></div><Sparkles aria-hidden="true" className="mt-1 hidden h-5 w-5 shrink-0 text-primary sm:block" strokeWidth={1.5} /></div>
                <div className="mb-6 ml-auto max-w-[90%] rounded-2xl rounded-tr-sm bg-muted px-4 py-3 text-xs leading-5 sm:max-w-[85%] sm:text-sm">{tool.prompt}</div>
                <div className="min-h-[305px] min-w-0 sm:min-h-[300px]">
                  {tool.id === "chat" && <ChatExample />}
                  {tool.id === "code" && <CodeExample />}
                  {tool.id === "image" && <ImageExample />}
                  {tool.id === "audio" && <AudioExample />}
                </div>
              </div>)}
              <div className="flex flex-col items-start justify-between gap-3 border-t border-border bg-background/30 px-5 py-4 sm:flex-row sm:items-center sm:px-8 lg:px-10"><p className="text-[11px] leading-5 text-muted-foreground">Your idea belongs here. Give it a try.</p><Button asChild size="sm" className="gap-2 rounded-full px-4"><Link href={active.href}>Try {active.label}<ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link></Button></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
