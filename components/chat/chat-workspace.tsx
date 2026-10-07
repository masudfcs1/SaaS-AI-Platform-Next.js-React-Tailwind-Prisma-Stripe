"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, CircleAlert, Loader2, RotateCcw, Square, SquarePen } from "lucide-react";
import { chatModes, chatTools, type ChatMode } from "@/lib/chat-tools";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/chat/copy-button";
import { MessageContent } from "@/components/chat/message-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DuneMark } from "@/components/dune-mark";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWorkspaceProps {
  mode: Extract<ChatMode, "conversation" | "code">;
  overview?: boolean;
}

export function ChatWorkspace({ mode, overview = false }: ChatWorkspaceProps) {
  const router = useRouter();
  const tool = chatTools[mode];
  const Icon = tool.icon;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stopped, setStopped] = useState(false);
  const [showLatest, setShowLatest] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const followLatest = useRef(true);

  useEffect(() => () => {
    const request = requestRef.current;
    requestRef.current = null;
    request?.abort();
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
    if (transcript && followLatest.current) {
      transcript.scrollTo({ top: transcript.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading, error, stopped]);

  const scrollToLatest = useCallback(() => {
    followLatest.current = true;
    const transcript = transcriptRef.current;
    transcript?.scrollTo({ top: transcript.scrollHeight, behavior: "smooth" });
    setShowLatest(false);
  }, []);

  const generate = async (history: ChatMessage[]) => {
    if (requestRef.current || !tool.available) return;
    const controller = new AbortController();
    requestRef.current = controller;
    followLatest.current = true;
    setMessages(history);
    setIsLoading(true);
    setError(null);
    setStopped(false);

    try {
      const response = await fetch(mode === "code" ? "/api/code" : "/api/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail && !detail.trimStart().startsWith("<") && detail.length < 300
          ? detail : "We couldn’t generate a response. Please try again.");
      }
      const result: unknown = await response.json();
      if (!result || typeof result !== "object" || !("content" in result) ||
        typeof result.content !== "string" || !result.content.trim()) {
        throw new Error("The response was empty. Please try again.");
      }
      if (requestRef.current !== controller || controller.signal.aborted) return;
      setMessages([...history, { id: crypto.randomUUID(), role: "assistant", content: result.content }]);
    } catch (cause) {
      if (requestRef.current !== controller) return;
      if (controller.signal.aborted) setStopped(true);
      else setError(cause instanceof Error && cause.message !== "Failed to fetch"
        ? cause.message : "Couldn’t connect. Check your connection and try again.");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const send = () => {
    const content = draft.trim();
    if (!content || requestRef.current || !tool.available) return;
    setDraft("");
    void generate([...messages, { id: crypto.randomUUID(), role: "user", content }]);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const newChat = () => {
    const request = requestRef.current;
    requestRef.current = null;
    request?.abort();
    setMessages([]);
    setDraft("");
    setError(null);
    setStopped(false);
    setIsLoading(false);
    setShowLatest(false);
    followLatest.current = true;
    inputRef.current?.focus();
  };

  const stopGenerating = () => {
    const request = requestRef.current;
    requestRef.current = null;
    request?.abort();
    setIsLoading(false);
    setStopped(true);
    inputRef.current?.focus();
  };

  const applySuggestion = (prompt: string) => {
    setDraft(prompt);
    inputRef.current?.focus();
  };

  return (
    <section className="relative flex h-full min-h-0 flex-1 flex-col bg-background text-foreground" aria-label={`${tool.label} workspace`}>
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-2.5 text-sm">
          <Icon className={cn("h-4 w-4 shrink-0", tool.accent)} aria-hidden="true" />
          <span className="truncate font-medium">{overview ? "Your workspace" : tool.label}</span>
          <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
            Gemini
          </Badge>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={newChat} className="shrink-0 gap-2 rounded-lg px-2.5 text-xs text-muted-foreground">
          <SquarePen className="h-4 w-4" aria-hidden="true" />
          <span>New chat</span>
        </Button>
      </div>

      <div
        ref={transcriptRef}
        role="region"
        aria-label="Chat transcript"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-7"
        onScroll={() => {
          const element = transcriptRef.current;
          if (!element) return;
          const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
          followLatest.current = nearBottom;
          setShowLatest(!nearBottom);
        }}
      >
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col items-center justify-center py-8 text-center sm:py-10">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 shadow-sm">
              {overview || mode === "conversation" ? <DuneMark className="h-9 w-9" /> : <Icon className={cn("h-7 w-7", tool.accent)} aria-hidden="true" />}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight [text-wrap:balance] sm:text-3xl lg:text-4xl">
              {overview ? "What would you like to create?" : tool.title}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {tool.description}
            </p>
            {overview && (
              <nav aria-label="Explore AI tools" className="mt-6 flex flex-wrap justify-center gap-2">
                {chatModes.map((item) => {
                  const option = chatTools[item];
                  const OptionIcon = option.icon;
                  return (
                    <Button key={item} asChild variant="outline" size="sm" className="h-8 gap-2 rounded-full border-border bg-card px-3 text-xs text-muted-foreground hover:border-primary/30">
                      <Link href={option.href}><OptionIcon className={cn("h-3.5 w-3.5", option.accent)} aria-hidden="true" />{option.shortLabel}</Link>
                    </Button>
                  );
                })}
              </nav>
            )}
            {tool.suggestions.length > 0 && (
              <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-2.5 text-left sm:gap-3">
                {tool.suggestions.map((suggestion) => (
                  <Button key={suggestion.title} type="button" variant="outline" onClick={() => applySuggestion(suggestion.prompt)} className="group h-auto min-h-[68px] justify-between gap-3 whitespace-normal rounded-xl border-border bg-card p-3.5 text-left text-xs text-muted-foreground shadow-sm hover:border-primary/30 hover:shadow-md sm:p-4 sm:text-sm">
                    {suggestion.title}<ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
                  </Button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text" className="mx-auto w-full max-w-3xl space-y-8 pb-8 pt-5">
            {messages.map((message, index) => message.role === "user" ? (
              <article key={message.id} aria-label="Your message" className="flex justify-end">
                <div className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md border border-border/50 bg-muted px-4 py-3 text-sm leading-7 text-foreground sm:max-w-[85%] sm:px-5">
                  {message.content}
                </div>
              </article>
            ) : (
              <article key={message.id} aria-label="Dune AI response" className="min-w-0">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted"><DuneMark className="h-6 w-6" /></div>
                  <span className="text-xs font-semibold">Dune AI</span>
                </div>
                <div className="min-w-0 sm:pl-[38px]"><MessageContent content={message.content} /></div>
                <div className="mt-3 flex items-center gap-1 sm:pl-[38px]">
                  <CopyButton text={message.content} label="Copy response" />
                  {index === messages.length - 1 && !isLoading && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => void generate(messages.slice(0, -1))} aria-label="Regenerate response" title="Regenerate response" className="h-8 w-8 rounded-lg text-muted-foreground"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /></Button>
                  )}
                </div>
              </article>
            ))}
            {isLoading && (
              <div role="status" className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10"><Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" /></div>
                <span>Dune is thinking<span className="motion-safe:animate-pulse">…</span></span>
              </div>
            )}
            {(error || stopped) && (
              <div role={error ? "alert" : "status"} className={cn("flex flex-wrap items-center gap-3 rounded-xl border p-4 text-sm", error ? "border-destructive/20 bg-destructive/5 text-destructive" : "border-border bg-muted/50 text-muted-foreground")}>
                {error ? <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                <span className="min-w-0 flex-1">{error || "Response stopped. You can try again or send a new message."}</span>
                <Button type="button" variant="link" size="sm" onClick={() => void generate(messages)} className="h-auto gap-1.5 px-2 py-1 text-inherit underline"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Try again</Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative shrink-0 bg-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7">
        {showLatest && (
          <Button type="button" variant="outline" size="sm" onClick={scrollToLatest} className="absolute -top-11 left-1/2 z-10 -translate-x-1/2 gap-1.5 rounded-full border-border bg-card text-xs text-muted-foreground shadow-md"><ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />Jump to latest</Button>
        )}
        <Card className="mx-auto max-w-3xl rounded-2xl border-border shadow-lg shadow-foreground/5 transition-shadow focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
          <form onSubmit={onSubmit} aria-label="Message composer">
            <label htmlFor={`prompt-${mode}`} className="sr-only">Message Dune AI</label>
            <Textarea ref={inputRef} id={`prompt-${mode}`} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} rows={1} placeholder={tool.placeholder} aria-describedby={`composer-hint-${mode}`} className="block max-h-[180px] min-h-[64px] resize-none overflow-y-auto rounded-b-none rounded-t-2xl border-0 bg-transparent px-4 pb-3 pt-4 text-base leading-6 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 sm:px-5 sm:text-sm" />
            <div className="flex items-center justify-between gap-3 px-3 pb-3 sm:px-4">
              <Select value={mode} onValueChange={(value) => router.push(chatTools[value as ChatMode].href)}>
                <SelectTrigger aria-label="Choose AI tool" className="h-8 w-[136px] rounded-lg border-transparent bg-muted/70 px-2.5 text-xs text-muted-foreground shadow-none hover:bg-muted focus:ring-1">
                  <SelectValue>
                    <span className="flex items-center gap-2"><Icon className={cn("h-3.5 w-3.5", tool.accent)} aria-hidden="true" />{tool.shortLabel}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent side="top" align="start" sideOffset={8} className="min-w-[220px] rounded-xl">
                  <SelectGroup>
                    <SelectLabel className="text-xs text-muted-foreground">Choose a workspace</SelectLabel>
                    {chatModes.map((option) => {
                      const item = chatTools[option];
                      const ItemIcon = item.icon;
                      return (
                        <SelectItem key={option} value={option} textValue={item.shortLabel} className="rounded-lg py-2.5">
                          <span className="flex items-center gap-2"><ItemIcon className={cn("h-4 w-4", item.accent)} aria-hidden="true" />{item.shortLabel}{!item.available && <span className="ml-2 text-[10px] text-muted-foreground">Unavailable</span>}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {isLoading ? (
                <Button type="button" variant="secondary" size="icon" onClick={stopGenerating} aria-label="Stop generating" title="Stop generating" className="h-9 w-9 shrink-0 rounded-xl bg-foreground text-background hover:bg-foreground/90"><Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /></Button>
              ) : (
                <Button type="submit" size="icon" disabled={!draft.trim() || !tool.available} aria-label="Send message" title="Send message" className="h-9 w-9 shrink-0 rounded-xl disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"><ArrowUp className="h-4 w-4" aria-hidden="true" /></Button>
              )}
            </div>
          </form>
        </Card>
        <p id={`composer-hint-${mode}`} className="mx-auto mt-2.5 max-w-3xl text-center text-[10px] leading-4 text-muted-foreground sm:text-[11px]">
          <span className="hidden sm:inline">Enter to send · Shift + Enter for a new line<span className="mx-2">/</span></span>Your ideas, a little further.
        </p>
      </div>
    </section>
  );
}
