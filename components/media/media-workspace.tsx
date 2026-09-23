"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUpRight, AudioLines, CircleAlert, Download, Loader2, RotateCcw, SlidersHorizontal, Sparkles, Square, SquarePen } from "lucide-react";

import { MediaOptionSelect } from "@/components/media/media-option-select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { chatTools } from "@/lib/chat-tools";
import {
  AUDIO_FORMATS, AUDIO_INPUT_MAX_LENGTH, AUDIO_INSTRUCTIONS_MAX_LENGTH, AUDIO_SPEEDS, AUDIO_VOICES,
  IMAGE_PROMPT_MAX_LENGTH, IMAGE_QUALITIES, IMAGE_SIZES,
} from "@/lib/media-options";
import { cn } from "@/lib/utils";

type ImageRequest = {
  kind: "image";
  prompt: string;
  size: (typeof IMAGE_SIZES)[number]["value"];
  quality: (typeof IMAGE_QUALITIES)[number]["value"];
};
type AudioRequest = {
  kind: "audio";
  input: string;
  voice: (typeof AUDIO_VOICES)[number]["value"];
  format: (typeof AUDIO_FORMATS)[number]["value"];
  speed: (typeof AUDIO_SPEEDS)[number]["value"];
  instructions?: string;
};
type MediaRequest = ImageRequest | AudioRequest;
type MediaResult = {
  id: string;
  request: MediaRequest;
  status: "loading" | "complete" | "error" | "stopped";
  url?: string;
  error?: string;
};

function requestText(request: MediaRequest) {
  return request.kind === "image" ? request.prompt : request.input;
}

function requestDetails(request: MediaRequest) {
  if (request.kind === "image") {
    return `${IMAGE_SIZES.find((option) => option.value === request.size)?.label} · ${request.quality} quality`;
  }
  const voice = AUDIO_VOICES.find((option) => option.value === request.voice)?.label;
  return `${voice} · ${request.format.toUpperCase()} · ${request.speed}× speed`;
}

export function MediaWorkspace({ mode }: { mode: "image" | "audio" }) {
  return <MediaSession key={mode} mode={mode} />;
}

function MediaSession({ mode }: { mode: "image" | "audio" }) {
  const isImage = mode === "image";
  const tool = chatTools[mode];
  const title = tool.label;
  const Icon = tool.icon;
  const maxLength = isImage ? IMAGE_PROMPT_MAX_LENGTH : AUDIO_INPUT_MAX_LENGTH;
  const [draft, setDraft] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [size, setSize] = useState<ImageRequest["size"]>("1024x1024");
  const [quality, setQuality] = useState<ImageRequest["quality"]>("medium");
  const [voice, setVoice] = useState<AudioRequest["voice"]>("marin");
  const [format, setFormat] = useState<AudioRequest["format"]>("mp3");
  const [speed, setSpeed] = useState<AudioRequest["speed"]>(1);
  const [results, setResults] = useState<MediaResult[]>([]);
  const [showLatest, setShowLatest] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<{ id: string; controller: AbortController } | null>(null);
  const urlsRef = useRef(new Set<string>());
  const followLatest = useRef(true);
  const isGenerating = results.some((result) => result.status === "loading");

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      const active = requestRef.current;
      requestRef.current = null;
      active?.controller.abort();
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      input.style.height = "0px";
      input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
    }
  }, [draft]);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (transcript && followLatest.current) transcript.scrollTo({ top: transcript.scrollHeight, behavior: "smooth" });
  }, [results]);

  async function generate(request: MediaRequest, retryId?: string) {
    if (requestRef.current) return;
    const id = retryId ?? crypto.randomUUID();
    const active = { id, controller: new AbortController() };
    requestRef.current = active;
    followLatest.current = true;
    setShowLatest(false);
    setResults((previous) => retryId
      ? previous.map((result) => result.id === id ? { ...result, status: "loading", error: undefined } : result)
      : [...previous, { id, request, status: "loading" }]);

    try {
      const { kind, ...payload } = request;
      const response = await fetch(`/api/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: active.controller.signal,
      });
      if (!response.ok) {
        const detail: unknown = await response.json().catch(() => null);
        const message = detail && typeof detail === "object" && "error" in detail && typeof detail.error === "string"
          ? detail.error : "Generation didn't finish. Please try again.";
        throw new Error(message);
      }
      const blob = await response.blob();
      const validType = kind === "image" ? blob.type === "image/png" : /^audio\/(mpeg|wav|wave|x-wav)$/.test(blob.type);
      if (!blob.size || !validType) throw new Error("The generated file could not be opened. Please try again.");
      if (requestRef.current !== active || active.controller.signal.aborted) return;
      const url = URL.createObjectURL(blob);
      urlsRef.current.add(url);
      setResults((previous) => previous.map((result) => result.id === id ? { ...result, status: "complete", url } : result));
    } catch (cause) {
      if (requestRef.current !== active) return;
      const error = cause instanceof Error && cause.message !== "Failed to fetch"
        ? cause.message : "Couldn't connect. Check your connection and try again.";
      setResults((previous) => previous.map((result) => result.id === id ? { ...result, status: "error", error } : result));
    } finally {
      if (requestRef.current === active) requestRef.current = null;
    }
  }

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || text.length > maxLength || requestRef.current) return;
    const request: MediaRequest = isImage
      ? { kind: "image", prompt: text, size, quality }
      : { kind: "audio", input: text, voice, format, speed, ...(instructions.trim() ? { instructions: instructions.trim() } : {}) };
    setDraft("");
    void generate(request);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  }

  function stop() {
    const active = requestRef.current;
    requestRef.current = null;
    active?.controller.abort();
    if (active) setResults((previous) => previous.map((result) => result.id === active.id ? { ...result, status: "stopped" } : result));
    inputRef.current?.focus();
  }

  function newSession() {
    const active = requestRef.current;
    requestRef.current = null;
    active?.controller.abort();
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
    setResults([]);
    setDraft("");
    setInstructions("");
    setShowInstructions(false);
    setShowLatest(false);
    followLatest.current = true;
    inputRef.current?.focus();
  }

  return (
    <section aria-label={`${title} workspace`} className="relative flex h-full min-h-0 flex-1 flex-col bg-background text-foreground">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-2.5 text-sm">
          <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate font-medium">{title}</span>
          <Badge variant="secondary" className="rounded-full text-[10px] font-medium text-muted-foreground">OpenAI</Badge>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={newSession} className="gap-2 rounded-lg text-xs text-muted-foreground"><SquarePen className="h-4 w-4" aria-hidden="true" />New session</Button>
      </div>

      <div ref={transcriptRef} role="region" aria-label="Generated media" tabIndex={0} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-7" onScroll={() => {
        const element = transcriptRef.current;
        if (!element) return;
        const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
        followLatest.current = nearBottom;
        setShowLatest(!nearBottom);
      }}>
        {results.length === 0 ? (
          <div className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-8 text-center sm:py-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10"><Icon className="h-7 w-7 text-primary" aria-hidden="true" /></div>
            <h1 className="text-2xl font-semibold tracking-tight [text-wrap:balance] sm:text-3xl lg:text-4xl">{tool.title}</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-[15px]">{tool.description}</p>
            {!isImage && <Badge variant="outline" className="mt-4 border-primary/20 bg-primary/5 font-normal text-muted-foreground">All voices are AI-generated</Badge>}
            <div className="mt-7 grid w-full max-w-xl grid-cols-2 gap-2.5 text-left sm:gap-3">
              {tool.suggestions.map((suggestion) => (
                <Button key={suggestion.title} type="button" variant="outline" onClick={() => { setDraft(suggestion.prompt); inputRef.current?.focus(); }} className="group h-auto min-h-[68px] justify-between gap-3 whitespace-normal rounded-xl border-border bg-card p-3.5 text-left text-xs text-muted-foreground hover:border-primary/30 sm:p-4 sm:text-sm">{suggestion.title}<ArrowUpRight className="h-4 w-4 shrink-0 group-hover:text-primary" aria-hidden="true" /></Button>
              ))}
            </div>
          </div>
        ) : (
          <div aria-live="polite" aria-relevant="additions text" className="mx-auto w-full max-w-3xl space-y-8 pb-8 pt-5">
            {results.map((result) => (
              <article key={result.id} aria-label={result.request.kind === "image" ? "Image generation" : "Voice generation"} className="space-y-4">
                <div className="flex justify-end"><p className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md border border-border/50 bg-muted px-4 py-3 text-sm leading-7 sm:max-w-[85%]">{requestText(result.request)}</p></div>
                <Card className="overflow-hidden rounded-2xl border-border shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4 text-primary" aria-hidden="true" />{result.request.kind === "image" ? "Generated image" : "Generated voiceover"}</p>
                      <p className="mt-1 text-xs capitalize text-muted-foreground">{requestDetails(result.request)}</p>
                    </div>
                    {result.status === "complete" && result.url && <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-lg text-xs"><a href={result.url} download={`dune-${result.request.kind}-${result.id.slice(0, 8)}.${result.request.kind === "image" ? "png" : result.request.format}`}><Download className="h-3.5 w-3.5" aria-hidden="true" />Download {result.request.kind === "image" ? "PNG" : result.request.format.toUpperCase()}</a></Button>}
                  </div>
                  {result.status === "loading" && <div role="status" className="flex min-h-[180px] flex-col items-center justify-center gap-3 p-6 text-center"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10"><Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" /></div><p className="text-sm font-medium">{result.request.kind === "image" ? "Creating your image" : "Recording your voiceover"}</p><p className="text-xs text-muted-foreground">{result.request.kind === "image" ? "Great details take a little time." : "Finding the rhythm in your words."}</p></div>}
                  {(result.status === "error" || result.status === "stopped") && <div role={result.status === "error" ? "alert" : "status"} className="flex flex-wrap items-center gap-3 p-4 sm:p-5"><CircleAlert className={cn("h-4 w-4 shrink-0", result.status === "error" ? "text-destructive" : "text-muted-foreground")} aria-hidden="true" /><p className="min-w-0 flex-1 text-sm leading-6 text-muted-foreground">{result.error || "Stopped waiting. You can retry this request or start another."}</p><Button type="button" variant="outline" size="sm" disabled={isGenerating} onClick={() => void generate(result.request, result.id)} className="gap-1.5 rounded-lg"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Try again</Button></div>}
                  {result.status === "complete" && result.url && (result.request.kind === "image" ? (
                    <div className="bg-muted/30 p-2 sm:p-3"><Image src={result.url} alt={result.request.prompt.slice(0, 180)} width={Number(result.request.size.split("x")[0])} height={Number(result.request.size.split("x")[1])} unoptimized className="mx-auto max-h-[520px] w-full rounded-xl object-contain" /></div>
                  ) : (
                    <div className="space-y-4 p-4 sm:p-5">
                      <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/5 font-normal text-primary"><AudioLines className="h-3.5 w-3.5" aria-hidden="true" />AI-generated voice</Badge>
                      <audio controls preload="metadata" src={result.url} aria-label="Generated voiceover playback" className="w-full">Your browser does not support audio playback. Download the file to listen.</audio>
                      <details className="rounded-xl border border-border bg-muted/30 p-3.5"><summary className="cursor-pointer text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Transcript and voice details</summary><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">{result.request.input}</p>{result.request.instructions && <p className="mt-3 border-t border-border pt-3 text-xs leading-6 text-muted-foreground"><span className="font-medium text-foreground">Voice direction: </span>{result.request.instructions}</p>}</details>
                    </div>
                  ))}
                </Card>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="relative shrink-0 bg-background">
        {showLatest && <Button type="button" variant="outline" size="sm" onClick={() => { followLatest.current = true; setShowLatest(false); const element = transcriptRef.current; element?.scrollTo({ top: element.scrollHeight, behavior: "smooth" }); }} className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 gap-1.5 rounded-full bg-card text-xs text-muted-foreground shadow-md"><ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />Jump to latest</Button>}
        <div className="max-h-[min(60dvh,calc(100dvh-8rem))] overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
        <Card className="mx-auto max-w-3xl rounded-2xl border-border shadow-lg shadow-foreground/5 transition-shadow focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
          <form aria-label={isImage ? "Image composer" : "Voice composer"} onSubmit={submit}>
            <Label htmlFor={`media-prompt-${mode}`} className="sr-only">{isImage ? "Describe your image" : "Text to read aloud"}</Label>
            <Textarea ref={inputRef} id={`media-prompt-${mode}`} value={draft} maxLength={maxLength} onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} rows={2} placeholder={tool.placeholder} aria-describedby={`media-hint-${mode}`} className="block max-h-[180px] min-h-[88px] resize-none overflow-y-auto rounded-b-none rounded-t-2xl border-0 bg-transparent px-4 pb-3 pt-4 text-base leading-6 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-5 sm:text-sm" />
            {!isImage && showInstructions && <div id="voice-direction" className="space-y-2 border-t border-border/60 px-4 py-3 sm:px-5"><Label htmlFor="voice-instructions" className="text-xs text-muted-foreground">Voice direction (optional)</Label><Textarea id="voice-instructions" value={instructions} maxLength={AUDIO_INSTRUCTIONS_MAX_LENGTH} onChange={(event) => setInstructions(event.target.value)} rows={2} placeholder="For example: warm and conversational, with a gentle pace." className="min-h-[64px] resize-none rounded-lg bg-muted/30 text-xs" /></div>}
            <div className="flex flex-wrap items-end gap-2 border-t border-border/60 px-3 pb-3 pt-2 sm:px-4">
              {isImage ? <>
                <MediaOptionSelect label="Aspect ratio" value={size} options={IMAGE_SIZES} onChange={setSize} className="w-[125px]" />
                <MediaOptionSelect label="Quality" value={quality} options={IMAGE_QUALITIES} onChange={setQuality} className="w-[105px]" />
              </> : <>
                <MediaOptionSelect label="Voice" value={voice} options={AUDIO_VOICES} onChange={setVoice} className="w-[100px]" />
                <MediaOptionSelect label="Format" value={format} options={AUDIO_FORMATS} onChange={setFormat} className="w-[85px]" />
                <MediaOptionSelect label="Speed" value={speed} options={AUDIO_SPEEDS} onChange={setSpeed} className="w-[95px]" />
              </>}
              <div className="ml-auto flex items-center gap-1.5 pt-1">
                {!isImage && <Button type="button" variant="ghost" size="icon" aria-label="Voice direction" aria-expanded={showInstructions} aria-controls="voice-direction" onClick={() => setShowInstructions((previous) => !previous)} className={cn("h-9 w-9 rounded-lg text-muted-foreground", showInstructions && "bg-accent text-accent-foreground")}><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /></Button>}
                {isGenerating ? <Button type="button" variant="secondary" onClick={stop} aria-label="Stop waiting" className="h-9 gap-2 rounded-xl bg-foreground px-3 text-background hover:bg-foreground/90"><Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /><span className="hidden sm:inline">Stop</span></Button> : <Button type="submit" disabled={!draft.trim() || draft.trim().length > maxLength} aria-label={isImage ? "Generate image" : "Generate voice"} className="h-9 gap-2 rounded-xl px-3 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"><Sparkles className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Generate</span></Button>}
              </div>
            </div>
          </form>
        </Card>
        <p id={`media-hint-${mode}`} className="mx-auto mt-2.5 flex max-w-3xl justify-between gap-3 text-[10px] leading-4 text-muted-foreground sm:text-[11px]"><span>{isImage ? "Describe it. Create it. Make it yours." : "AI-generated speech. Enter to create · Shift + Enter for a new line."}</span><span className="shrink-0 tabular-nums">{draft.length.toLocaleString()} / {maxLength.toLocaleString()}</span></p>
        </div>
      </div>
    </section>
  );
}
