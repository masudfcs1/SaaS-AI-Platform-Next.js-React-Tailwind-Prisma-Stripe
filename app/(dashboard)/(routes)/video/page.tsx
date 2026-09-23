import Link from "next/link";
import { ArrowUp, AudioLines, ImageIcon, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function VideoPage() {
  return (
    <section aria-label="Video studio workspace" className="flex h-full min-h-0 flex-1 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2.5 px-4 py-5 text-sm sm:px-7">
        <Video aria-hidden="true" className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span className="font-medium">Video studio</span>
        <Badge variant="outline" className="font-normal text-muted-foreground">Unavailable</Badge>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-7">
        <div className="m-auto w-full max-w-xl py-6 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <Video aria-hidden="true" className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Video generation is unavailable.</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">You can still turn your ideas into images and spoken audio.</p>
          <Card className="mt-7 rounded-2xl text-left shadow-none">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-semibold">OpenAI video service update</h2>
              <CardDescription className="leading-6">OpenAI has scheduled the Sora video API shutdown for September 24, 2026. Video generation is disabled in this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="link" className="h-auto p-0 text-xs">
                <a href="https://developers.openai.com/api/docs/deprecations" target="_blank" rel="noopener noreferrer">Read the OpenAI service notice</a>
              </Button>
            </CardContent>
          </Card>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-xl"><Link href="/image"><ImageIcon className="h-4 w-4" aria-hidden="true" /> Create an image</Link></Button>
            <Button asChild variant="outline" className="rounded-xl"><Link href="/audio"><AudioLines className="h-4 w-4" aria-hidden="true" /> Create audio</Link></Button>
          </div>
        </div>
      </div>
      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
        <Card className="mx-auto max-w-3xl rounded-2xl">
          <label htmlFor="video-prompt" className="sr-only">Video prompt</label>
          <Textarea id="video-prompt" disabled rows={1} placeholder="Video generation is currently unavailable" className="min-h-[64px] resize-none rounded-b-none rounded-t-2xl border-0 bg-transparent px-4 pt-4 shadow-none" />
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-xs text-muted-foreground">Video studio</span>
            <Button disabled size="icon" aria-label="Video generation unavailable" className="h-9 w-9 rounded-xl"><ArrowUp aria-hidden="true" className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
