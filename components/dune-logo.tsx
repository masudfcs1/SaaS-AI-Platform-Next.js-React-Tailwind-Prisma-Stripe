import { DuneMark } from "@/components/dune-mark";
import { cn } from "@/lib/utils";

export function DuneLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-2 sm:gap-2.5", className)}>
      <DuneMark className={cn("shrink-0", compact ? "h-8 w-8" : "h-8 w-8 sm:h-10 sm:w-10")} />
      <span className="flex items-center gap-1.5 sm:gap-2">
        <span className={cn("font-semibold leading-none tracking-[-.055em] text-foreground", compact ? "text-[25px]" : "text-[25px] sm:text-[29px]")}>dune</span>
        <span className="rounded-[5px] border border-[#b76b44]/20 bg-[#b76b44]/[0.06] px-1.5 py-1 text-[8px] font-semibold leading-none tracking-[.12em] text-[#9f4e2d] dark:border-[#e9aa7e]/20 dark:bg-[#e9aa7e]/[0.06] dark:text-[#e9aa7e]">AI</span>
      </span>
    </span>
  );
}
