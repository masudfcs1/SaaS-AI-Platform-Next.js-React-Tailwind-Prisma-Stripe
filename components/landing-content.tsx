import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Braces, MessageSquare, Sparkle } from "lucide-react";

import { Button } from "@/components/ui/button";

const tools = [
  { number: "01", name: "Chat", title: "A thought, taken further.", description: "Find the right words, understand something new, or give a half-formed idea a little room to grow.", href: "/conversation", kind: "chat" },
  { number: "02", name: "Code", title: "Less stuck. More building.", description: "Untangle a bug, explore an approach, or turn what you have in mind into code you can work with.", href: "/code", kind: "code" },
  { number: "03", name: "Image", title: "See what you mean.", description: "Describe a mood, a scene, a possibility. Create an image, explore a direction, and make it your own.", href: "/image", kind: "image" },
  { number: "04", name: "Audio", title: "Give your words a voice.", description: "Turn a script into spoken audio. Choose the voice and pace, then listen, download, and share.", href: "/audio", kind: "audio" },
] as const;

const workflow = [
  { number: "01", title: "Bring a little curiosity.", description: "A question, a rough draft, a sketch in your head. You do not need a perfect prompt to begin." },
  { number: "02", title: "Find your direction.", description: "Talk it through in Chat, experiment with code, or open a studio to create an image or narration." },
  { number: "03", title: "Take it somewhere.", description: "Copy the words and code you need. Download your images and audio. Keep making from there." },
] as const;

function ToolPreview({ kind }: { kind: (typeof tools)[number]["kind"] }) {
  if (kind === "chat") {
    return (
      <div aria-hidden="true" className="relative flex h-36 w-full flex-col justify-center gap-3 overflow-hidden px-6 sm:px-8">
        <div className="ml-auto flex items-center gap-2 rounded-[14px_14px_4px_14px] border border-border/70 bg-background px-3 py-2.5 text-[11px] text-muted-foreground">
          <MessageSquare className="h-3 w-3" strokeWidth={1.5} /> What if we tried something new?
        </div>
        <div className="flex max-w-[90%] items-start gap-2.5 rounded-[14px_14px_14px_4px] bg-primary/10 px-3 py-3 text-[11px] leading-[1.6]">
          <Sparkle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.6} />
          <span>Let&apos;s start with the possibility.<br /><span className="text-muted-foreground">Where would you like to go?</span></span>
        </div>
      </div>
    );
  }

  if (kind === "code") {
    return (
      <div aria-hidden="true" className="flex h-36 w-full items-center justify-center overflow-hidden px-6 sm:px-8">
        <div className="w-full max-w-[280px] rounded-lg border border-border/70 bg-background px-4 py-3">
          <div className="mb-2.5 flex items-center justify-between border-b border-border/70 pb-2 text-[9px] text-muted-foreground"><span className="font-mono">possibility.ts</span><Braces className="h-3 w-3" /></div>
          <div className="font-mono text-[11px] leading-[1.8] text-muted-foreground"><span className="text-primary">const</span> nextIdea = () =&gt; &#123;<br /><span className="pl-4"><span className="text-primary">return</span> &quot;Something good.&quot;</span><br />&#125;;</div>
        </div>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div aria-hidden="true" className="relative flex h-36 w-full items-center justify-center overflow-hidden px-6 sm:px-8">
        <svg viewBox="0 0 280 120" className="h-[120px] w-full max-w-[280px] rounded-lg" fill="none">
          <rect width="280" height="120" className="fill-primary/10" />
          <circle cx="197" cy="32" r="19" className="fill-primary/40" />
          <path d="M0 101C41 48 93 50 146 84C197 117 241 53 280 79V120H0V101Z" className="fill-primary/20" />
          <path d="M0 120V100C43 116 75 84 124 83C178 81 212 135 280 102V120H0Z" className="fill-primary/30" />
          <path d="M76 94V64C76 49 87 38 102 38C117 38 128 49 128 64V94H112V64C112 58 108 54 102 54C96 54 92 58 92 64V94H76Z" className="fill-background" />
          <path d="M128 94V64C128 49 117 38 102 38" className="stroke-foreground/20" strokeWidth="1.2" />
          <path d="M65 95H142" className="stroke-primary/30" strokeWidth="1.2" />
          <path d="M14 14H24M14 14V24M266 14H256M266 14V24M14 106H24M14 106V96M266 106H256M266 106V96" className="stroke-primary/40" strokeWidth="1" />
        </svg>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="flex h-36 w-full flex-col items-center justify-center gap-4 overflow-hidden px-6 sm:px-8">
      <div className="flex h-12 items-center justify-center gap-[4px] text-primary">
        {[12, 20, 14, 30, 23, 38, 48, 27, 18, 33, 42, 28, 20, 36, 46, 26, 17, 29, 21, 13, 23, 15, 9].map((height, index) => (
          <span key={index} className="w-[3px] rounded-full bg-current" style={{ height, opacity: 0.35 + (height / 48) * 0.65 }} />
        ))}
      </div>
      <div className="flex items-center gap-2 text-[10px] tracking-wide text-muted-foreground"><AudioLines className="h-3 w-3" strokeWidth={1.5} /> A voice for your next chapter.</div>
    </div>
  );
}

export const LandingContent = () => (
  <>
    <section id="tools" aria-labelledby="tools-heading" className="scroll-mt-28 border-t border-border/70 py-20 sm:py-28 lg:py-32">
      <div className="landing-container">
        <div className="mb-12 grid gap-7 md:grid-cols-[1.2fr_0.8fr] md:items-end lg:mb-16">
          <div>
            <p className="landing-eyebrow text-primary">A small toolkit. An open canvas.</p>
            <h2 id="tools-heading" className="mt-5 text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.06] tracking-[-0.055em]">One idea.<br /><span className="landing-serif font-normal">So many possibilities.</span></h2>
          </div>
          <p className="max-w-[350px] text-sm leading-7 text-muted-foreground md:mb-1 md:justify-self-end sm:text-base">For the words you cannot quite find, the thing you want to build, and the image you can almost see.</p>
        </div>

        <div className="border-t border-border">
          {tools.map((tool) => (
            <Link key={tool.kind} href={tool.href} aria-label={`Open ${tool.name}: ${tool.title}`} className="group grid grid-cols-[minmax(0,1fr)_36px] gap-x-7 gap-y-6 border-b border-border py-7 outline-none transition-colors hover:bg-muted/30 focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background sm:grid-cols-[80px_minmax(0,1fr)_36px] sm:items-center sm:py-9 lg:grid-cols-[110px_minmax(0,1fr)_minmax(260px,0.8fr)_40px] lg:gap-x-9">
              <div className="col-span-2 flex items-center gap-3 self-start pt-0.5 text-muted-foreground sm:col-span-1 sm:flex-col sm:items-start sm:gap-4">
                <span className="font-mono text-[10px] tracking-[0.15em]">{tool.number}</span>
                <span className="text-xs font-medium text-foreground sm:text-sm">{tool.name}</span>
              </div>
              <div>
                <h3 className="text-2xl font-medium leading-tight tracking-[-0.04em] transition-colors group-hover:text-primary sm:text-[28px]">{tool.title}</h3>
                <p className="mt-3 max-w-[380px] text-[13px] leading-[1.8] text-muted-foreground sm:text-sm">{tool.description}</p>
              </div>
              <div className="hidden overflow-hidden rounded-xl bg-muted/50 lg:block"><ToolPreview kind={tool.kind} /></div>
              <span className="flex h-9 w-9 items-center justify-center self-end rounded-full border border-border text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground sm:self-center sm:justify-self-end"><ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} /></span>
            </Link>
          ))}
        </div>
        <p className="mt-5 hidden text-right text-[11px] leading-5 text-muted-foreground lg:block">Illustrative previews. Your ideas set the direction.</p>
      </div>
    </section>

    <section id="how-it-works" aria-labelledby="workflow-heading" className="scroll-mt-24 border-y border-border/70 bg-muted/40 py-20 sm:py-28 lg:py-32">
      <div className="landing-container grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-28">
        <div>
          <p className="landing-eyebrow text-primary">Less friction. More flow.</p>
          <h2 id="workflow-heading" className="mt-5 max-w-[480px] text-[clamp(2.5rem,4.5vw,4rem)] font-medium leading-[1.08] tracking-[-0.05em]">From &ldquo;what if&rdquo;<br />to <span className="landing-serif font-normal">what&apos;s next.</span></h2>
          <p className="mt-6 max-w-[330px] text-sm leading-7 text-muted-foreground">Start small. Follow a thought. Make something you did not have a moment ago.</p>
          <Button asChild variant="link" className="mt-6 h-auto gap-3 p-0 text-sm text-foreground decoration-primary underline-offset-8 hover:text-primary">
            <Link href="/dashboard">Find your starting point <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} /></Link>
          </Button>
          <svg aria-hidden="true" viewBox="0 0 250 110" className="mt-10 hidden h-28 w-64 text-primary/50 lg:block" fill="none">
            <path d="M12 40C34 13 69 5 90 27C106 44 83 72 60 61C31 47 78 1 128 24C164 40 136 102 104 86C82 75 122 32 164 42C190 48 204 64 226 65M214 55L228 65L217 78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <ol className="max-w-xl lg:pt-1">
          {workflow.map((step, index) => (
            <li key={step.number} className="relative flex gap-5 pb-10 last:pb-0 sm:gap-7 sm:pb-12">
              {index < workflow.length - 1 && <span aria-hidden="true" className="absolute bottom-3 left-[18px] top-12 w-px bg-border" />}
              <span className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-border bg-background font-mono text-[10px] text-primary">{step.number}</span>
              <div className="pt-1">
                <h3 className="text-lg font-medium tracking-[-0.025em] sm:text-xl">{step.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section aria-labelledby="start-heading" className="relative overflow-hidden py-24 sm:py-32 lg:py-40">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-1/2 h-[360px] w-[360px] -translate-y-1/2 rounded-full border border-primary/10 sm:-right-20 sm:h-[440px] sm:w-[440px] lg:right-[calc(50%-700px)] lg:h-[540px] lg:w-[540px]">
        <div className="absolute inset-8 rounded-full border border-primary/10" /><div className="absolute inset-16 rounded-full border border-primary/10" /><div className="absolute inset-24 rounded-full border border-primary/10" />
      </div>
      <div className="landing-container relative">
        <div className="mb-7 flex items-center gap-3 text-primary"><span className="landing-eyebrow">The next part is yours</span><ArrowDown aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} /></div>
        <h2 id="start-heading" className="max-w-[880px] text-[clamp(3.25rem,8vw,7rem)] font-medium leading-[1.02] tracking-[-0.065em]">Make room for<br />your <span className="landing-serif font-normal text-primary">next idea.</span></h2>
        <div className="mt-9 flex flex-col items-start gap-6 sm:mt-12 sm:flex-row sm:items-center sm:gap-9">
          <Button asChild size="lg" className="h-14 gap-6 rounded-full px-8 text-sm shadow-none">
            <Link href="/dashboard">Open your workspace <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} /></Link>
          </Button>
          <p className="text-sm text-muted-foreground">A little curiosity is all you need.<br /><span className="mt-1 inline-block text-xs">No account required to explore.</span></p>
        </div>
      </div>
    </section>
  </>
);
