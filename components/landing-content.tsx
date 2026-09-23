import Link from "next/link";
import { ArrowRight, Check, CornerDownRight, Layers3, MessageSquareText, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { chatModes, chatTools } from "@/lib/chat-tools";

const workflows = [
  { title: "Start with a thought", description: "Ask a question, describe an image, or paste a script to turn into speech. Bring the words; choose the tool.", icon: MessageSquareText },
  { title: "Keep the conversation going", description: "Use Chat and Code to ask follow-up questions and refine the answer. Each conversation keeps the context as you work.", icon: Layers3 },
  { title: "Take the next step", description: "Copy text and code, or download an image or audio clip for your own project.", icon: CornerDownRight },
];

export const LandingContent = () => {
  const availableTools = chatModes.filter((mode) => chatTools[mode].available);
  const unavailableTools = chatModes.filter((mode) => !chatTools[mode].available);

  return (
    <>
      <section id="tools" aria-labelledby="tools-heading" className="scroll-mt-24 border-y border-border bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Made for your everyday ideas</p>
            <h2 id="tools-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">A little help. A lot of possibilities.</h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">Find the right tool for chat, code, images, or spoken audio. Each has its own focused workspace.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
            {availableTools.map((mode) => {
              const tool = chatTools[mode];
              const Icon = tool.icon;
              return (
                <Card key={mode} className="flex flex-col rounded-2xl border-border shadow-sm">
                  <CardHeader className="pb-3 sm:p-7 sm:pb-3">
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} /></span>
                      <Badge variant="secondary" className="gap-1 rounded-full font-medium"><Check aria-hidden="true" className="h-3 w-3" /> Available now</Badge>
                    </div>
                    <CardTitle className="text-xl">{tool.label}</CardTitle>
                    <CardDescription className="pt-1 leading-6">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto pt-3 sm:px-7 sm:pb-7">
                    <Button asChild variant="outline" className="gap-2 rounded-lg">
                      <Link href={tool.href}>Open {tool.shortLabel} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <div className="mt-5 grid gap-4 lg:gap-6">
            {unavailableTools.map((mode) => {
              const tool = chatTools[mode];
              const Icon = tool.icon;
              return (
                <Card key={mode} className="flex flex-col rounded-2xl border-dashed border-border bg-card/70 shadow-none sm:flex-row sm:items-center">
                  <CardHeader className="flex-1 pb-3 sm:pb-6">
                    <div className="flex flex-wrap items-center gap-3">
                      <Icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" strokeWidth={1.8} />
                      <CardTitle className="text-base">{tool.label}</CardTitle>
                      <Badge variant="outline" className="rounded-full text-[10px] font-normal text-muted-foreground">Currently unavailable</Badge>
                    </div>
                    <CardDescription className="pt-1 text-xs leading-6">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="shrink-0 sm:pt-6">
                    <Button asChild variant="link" size="sm" className="h-auto gap-1.5 px-0 py-0 text-xs">
                      <Link href={tool.href}>View studio <ArrowRight aria-hidden="true" className="h-3 w-3" /></Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="workflow-heading" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.5fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">From thought to next step</p>
            <h2 id="workflow-heading" className="mt-3 max-w-sm text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Keep your focus.<br />Find your flow.</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">A calm workspace that makes room for the conversation, with your next prompt always close by.</p>
            <Button asChild variant="link" className="mt-3 gap-2 px-0">
              <Link href="/conversation">Start a conversation <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {workflows.map((workflow, index) => (
              <div key={workflow.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 sm:gap-5 sm:p-6">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary"><workflow.icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} /></div>
                <div>
                  <h3 className="text-sm font-semibold"><span className="mr-2 text-xs font-normal text-muted-foreground">0{index + 1}</span>{workflow.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{workflow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="start-heading" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24 lg:px-10">
        <Card className="overflow-hidden rounded-3xl border-primary/15 bg-accent/60 shadow-none">
          <CardContent className="flex flex-col items-start justify-between gap-8 p-7 sm:p-10 md:flex-row md:items-center lg:p-12">
            <div className="max-w-xl">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles aria-hidden="true" className="h-5 w-5" /></div>
              <h2 id="start-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">Your next idea starts here.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Open the workspace and see where a conversation takes you.</p>
            </div>
            <Button asChild size="lg" className="shrink-0 gap-2 rounded-xl">
              <Link href="/dashboard">Let&apos;s get started <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
};
