"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, CircleAlert, Loader2, RotateCcw, Sparkles, Square, SquarePen } from "lucide-react";
import { chatModes, chatTools, type ChatMode } from "@/lib/chat-tools";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/chat/copy-button";
import { MessageContent } from "@/components/chat/message-content";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWorkspaceProps {
  mode: ChatMode;
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
    <section className="relative flex h-full min-h-0 flex-1 flex-col bg-white dark:bg-slate-950" aria-label={`${tool.label} workspace`}>
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-7">
        <div className="flex min-w-0 items-center gap-2.5 text-sm">
          <Icon className={cn("h-4 w-4 shrink-0", tool.accent)} aria-hidden="true" />
          <span className="truncate font-medium text-slate-700 dark:text-slate-200">{overview ? "Your workspace" : tool.label}</span>
          <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-400">
            {tool.available ? "Gemini" : "Coming soon"}
          </span>
        </div>
        <button type="button" onClick={newChat} className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white">
          <SquarePen className="h-4 w-4" aria-hidden="true" />
          <span>New chat</span>
        </button>
      </div>

      <div
        ref={transcriptRef}
        role="region"
        aria-label="Chat transcript"
        tabIndex={0}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 sm:px-7"
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
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 shadow-sm dark:border-violet-400/15 dark:bg-violet-400/10">
              {overview || mode === "conversation" ? <Sparkles className="h-7 w-7 text-violet-500 dark:text-violet-400" aria-hidden="true" /> : <Icon className={cn("h-7 w-7", tool.accent)} aria-hidden="true" />}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 [text-wrap:balance] sm:text-3xl lg:text-4xl dark:text-slate-100">
              {overview ? "What would you like to create?" : tool.title}
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500 sm:text-[15px] dark:text-slate-400">
              {tool.description}
            </p>
            {overview && (
              <nav aria-label="Explore AI tools" className="mt-6 flex flex-wrap justify-center gap-2">
                {chatModes.map((item) => {
                  const option = chatTools[item];
                  const OptionIcon = option.icon;
                  return <Link key={item} href={option.href} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-slate-300 dark:hover:border-violet-400/40 dark:hover:bg-violet-400/10"><OptionIcon className={cn("h-3.5 w-3.5", option.accent)} aria-hidden="true" />{option.shortLabel}</Link>;
                })}
              </nav>
            )}
            {tool.suggestions.length > 0 && (
              <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-2.5 text-left sm:gap-3">
                {tool.suggestions.map((suggestion) => (
                  <button key={suggestion.title} type="button" onClick={() => applySuggestion(suggestion.prompt)} className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-left text-xs font-medium text-slate-600 transition hover:border-violet-300 hover:bg-white hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 sm:p-4 sm:text-sm dark:border-white/[0.08] dark:bg-white/[0.025] dark:text-slate-300 dark:hover:border-violet-400/30 dark:hover:bg-white/[0.05]">
                    {suggestion.title}<ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-violet-500" aria-hidden="true" />
                  </button>
                ))}
              </div>
            )}
            {!tool.available && (
              <Link href="/conversation" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2">
                Explore your idea in Chat <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        ) : (
          <div role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text" className="mx-auto w-full max-w-3xl space-y-8 pb-8 pt-5">
            {messages.map((message, index) => message.role === "user" ? (
              <article key={message.id} aria-label="Your message" className="flex justify-end">
                <div className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-slate-100 px-4 py-3 text-sm leading-7 text-slate-800 sm:max-w-[85%] sm:px-5 dark:bg-white/[0.07] dark:text-slate-100">
                  {message.content}
                </div>
              </article>
            ) : (
              <article key={message.id} aria-label="Dune AI response" className="min-w-0">
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-400/10"><Sparkles className="h-4 w-4 text-violet-500 dark:text-violet-400" aria-hidden="true" /></div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Dune AI</span>
                </div>
                <div className="min-w-0 sm:pl-[38px]"><MessageContent content={message.content} /></div>
                <div className="mt-3 flex items-center gap-1 sm:pl-[38px]">
                  <CopyButton text={message.content} label="Copy response" />
                  {index === messages.length - 1 && !isLoading && (
                    <button type="button" onClick={() => void generate(messages.slice(0, -1))} aria-label="Regenerate response" title="Regenerate response" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:hover:bg-white/5 dark:hover:text-slate-200"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /></button>
                  )}
                </div>
              </article>
            ))}
            {isLoading && (
              <div role="status" className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-400/10"><Loader2 className="h-4 w-4 animate-spin text-violet-500" aria-hidden="true" /></div>
                <span>Dune is thinking<span className="motion-safe:animate-pulse">…</span></span>
              </div>
            )}
            {(error || stopped) && (
              <div role={error ? "alert" : "status"} className={cn("flex flex-wrap items-center gap-3 rounded-xl border p-4 text-sm", error ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/5 dark:text-rose-300" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300")}>
                {error ? <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Check className="h-4 w-4 shrink-0" aria-hidden="true" />}
                <span className="min-w-0 flex-1">{error || "Response stopped. You can try again or send a new message."}</span>
                <button type="button" onClick={() => void generate(messages)} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Try again</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative shrink-0 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-7 dark:bg-slate-950">
        {showLatest && (
          <button type="button" onClick={scrollToLatest} className="absolute -top-11 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-md transition hover:text-violet-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:border-white/15 dark:bg-slate-900 dark:text-slate-300"><ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />Jump to latest</button>
        )}
        <form onSubmit={onSubmit} aria-label="Message composer" className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-[0_3px_24px_-8px_rgba(15,23,42,0.14)] transition focus-within:border-violet-400 focus-within:ring-2 focus-within:ring-violet-500/10 dark:border-white/[0.12] dark:bg-[#151c2c] dark:shadow-none dark:focus-within:border-violet-400/60">
          <label htmlFor={`prompt-${mode}`} className="sr-only">{tool.available ? "Message Dune AI" : `${tool.label} prompt`}</label>
          <textarea ref={inputRef} id={`prompt-${mode}`} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onKeyDown} rows={1} placeholder={tool.placeholder} aria-describedby={`composer-hint-${mode}`} className="block max-h-[180px] min-h-[64px] w-full resize-none overflow-y-auto rounded-t-2xl bg-transparent px-4 pb-3 pt-4 text-base leading-6 text-slate-800 outline-none placeholder:text-slate-400 sm:px-5 sm:text-sm dark:text-slate-100 dark:placeholder:text-slate-500" />
          <div className="flex items-center justify-between gap-3 px-3 pb-3 sm:px-4">
            <div className="relative flex items-center">
              <Icon className={cn("pointer-events-none absolute left-2.5 h-3.5 w-3.5", tool.accent)} aria-hidden="true" />
              <select aria-label="Choose AI tool" value={mode} onChange={(event) => router.push(chatTools[event.target.value as ChatMode].href)} className="appearance-none rounded-lg bg-slate-50 py-2 pl-8 pr-7 text-xs font-medium text-slate-600 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-violet-500 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                {chatModes.map((option) => <option key={option} value={option} className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">{chatTools[option].shortLabel}{chatTools[option].available ? "" : " · Coming soon"}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 h-3 w-3 text-slate-400" aria-hidden="true" />
            </div>
            {isLoading ? (
              <button type="button" onClick={stopGenerating} aria-label="Stop generating" title="Stop generating" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-white dark:text-slate-900"><Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" /></button>
            ) : (
              <button type="submit" disabled={!draft.trim() || !tool.available} aria-label="Send message" title={tool.available ? "Send message" : `${tool.label} is coming soon`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-white/[0.07] dark:disabled:text-slate-500"><ArrowUp className="h-4 w-4" aria-hidden="true" /></button>
            )}
          </div>
        </form>
        <p id={`composer-hint-${mode}`} className="mx-auto mt-2.5 max-w-3xl text-center text-[10px] leading-4 text-slate-400 sm:text-[11px] dark:text-slate-500">
          {tool.available ? <><span className="hidden sm:inline">Enter to send · Shift + Enter for a new line<span className="mx-2">/</span></span>Your ideas, a little further.</> : `${tool.label} is coming soon. Chat and Code are ready to use.`}
        </p>
      </div>
    </section>
  );
}
