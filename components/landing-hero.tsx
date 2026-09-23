import Link from "next/link";
import { ArrowRight, ArrowUp, Check, Code2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const LandingHero = () => {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-20 -z-10 h-96 w-96 rounded-full bg-primary/[0.07] blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-10 lg:py-28">
        <div className="max-w-xl">
          <Badge variant="outline" className="gap-1.5 rounded-full border-primary/20 bg-primary/5 px-3 py-1.5 font-medium text-primary">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Your AI workspace
          </Badge>
          <h1 id="hero-heading" className="mt-6 text-4xl font-semibold leading-[1.12] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Think it through.<br />
            <span className="text-primary">Make it happen.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Chat through ideas, write useful code, create images, and turn scripts into spoken audio. Bring your next project to Dune.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2 rounded-xl px-6">
              <Link href="/dashboard">Open workspace <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl px-6">
              <Link href="#tools">Explore the tools</Link>
            </Button>
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <Check aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> No account or sign-in needed.
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-xl lg:mx-0">
          <Card className="overflow-hidden rounded-2xl border-border shadow-xl shadow-primary/[0.04]">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border bg-muted/40 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles aria-hidden="true" className="h-4 w-4" /></span>
                <span className="text-sm font-semibold">Dune AI</span>
              </div>
              <Badge variant="outline" className="bg-background text-[10px] font-normal text-muted-foreground">Example conversation</Badge>
            </CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-6">
              <div className="flex justify-end">
                <p className="max-w-[88%] rounded-2xl rounded-tr-md bg-muted px-4 py-3 text-sm leading-6">Help me plan a simple portfolio website.</p>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold"><Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> Dune AI</div>
                <p className="text-sm leading-6 text-muted-foreground">Start with a few things that tell your story well:</p>
                <ol className="mt-4 space-y-3">
                  {[
                    ["A clear introduction", "Who you are and what you love making."],
                    ["Your best work", "Three projects, with the story behind each one."],
                    ["An easy next step", "A simple way for people to get in touch."],
                  ].map(([title, detail], index) => (
                    <li key={title} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{index + 1}</span>
                      <div className="text-sm leading-6"><span className="font-medium">{title}</span><p className="text-xs leading-5 text-muted-foreground">{detail}</p></div>
                    </li>
                  ))}
                </ol>
              </div>
              <div aria-hidden="true" className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-xs text-muted-foreground">
                <span>Ask a follow-up question...</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ArrowUp className="h-3.5 w-3.5" /></span>
              </div>
            </CardContent>
          </Card>
          <figcaption className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"><Code2 aria-hidden="true" className="h-3.5 w-3.5" /> One workspace. Room to think, build, and create.</figcaption>
        </figure>
      </div>
    </section>
  );
};
