"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, AlertCircle, LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copying" | "copied" | "error">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  async function copy() {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setStatus("copying");

    try {
      await navigator.clipboard.writeText(text);
      if (mounted.current) setStatus("copied");
    } catch {
      if (mounted.current) setStatus("error");
    }

    if (mounted.current) {
      resetTimer.current = setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const currentLabel = status === "copied" ? "Copied" : status === "error" ? "Copy failed" : status === "copying" ? "Copying…" : label;
  const Icon = status === "copied" ? Check : status === "error" ? AlertCircle : status === "copying" ? LoaderCircle : Copy;

  return (
    <button
      type="button"
      onClick={copy}
      disabled={status === "copying"}
      aria-label={currentLabel}
      title={status === "error" ? "Unable to copy. Select the text to copy it manually, or try again." : currentLabel}
      className={cn(
        "inline-flex min-h-[32px] items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-wait disabled:opacity-60 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", status === "copying" && "animate-spin")} aria-hidden="true" />
      <span aria-live="polite" aria-atomic="true">{currentLabel}</span>
    </button>
  );
}
