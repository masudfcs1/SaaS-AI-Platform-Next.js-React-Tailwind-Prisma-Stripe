import Link from "next/link";
import { ArrowRight, Palette, Sparkles } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { chatModes, chatTools } from "@/lib/chat-tools";

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Make the workspace feel right for you.</p>
      </div>

      <div className="space-y-5">
        <Card role="region" aria-labelledby="appearance-heading" className="rounded-2xl">
          <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-accent p-2.5 text-accent-foreground">
                <Palette aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <h2 id="appearance-heading" className="text-base font-semibold">Appearance</h2>
                <CardDescription className="mt-1 max-w-md leading-6">
                  Choose light, dark, or follow your system. Your preference is saved for every page on this device.
                </CardDescription>
              </div>
            </div>
            <div className="shrink-0 self-start sm:self-center"><ModeToggle showLabel /></div>
          </CardHeader>
        </Card>

        <Card role="region" aria-labelledby="access-heading" className="rounded-2xl">
          <CardHeader>
            <h2 id="access-heading" className="text-base font-semibold">Open to everyone</h2>
            <CardDescription className="leading-6">
              Start a conversation or explore the workspace without creating an account. No sign-in is needed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Open workspace <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card role="region" aria-labelledby="capabilities-heading" className="overflow-hidden rounded-2xl">
          <CardHeader className="border-b">
            <h2 id="capabilities-heading" className="text-base font-semibold">Workspace tools</h2>
            <CardDescription className="leading-6">Chat, code, image generation, and speech audio are ready to use. Video generation is currently unavailable.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {chatModes.map((mode) => {
                const tool = chatTools[mode];
                const Icon = tool.icon;
                return (
                  <li key={mode} className="flex items-center gap-3 px-6 py-4 sm:gap-4">
                    <Icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-muted-foreground" strokeWidth={1.8} />
                    <Link href={tool.href} className="min-w-0 flex-1 rounded-md text-sm font-medium underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {tool.label}
                    </Link>
                    <Badge variant={tool.available ? "secondary" : "outline"} className="shrink-0 font-medium">
                      {tool.available ? "Available" : "Unavailable"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Button asChild className="mt-7 rounded-xl">
        <Link href="/conversation"><Sparkles aria-hidden="true" className="h-4 w-4" /> Start a conversation</Link>
      </Button>
    </div>
  );
}
