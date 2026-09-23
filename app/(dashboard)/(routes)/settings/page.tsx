import Link from "next/link";
import { ArrowRight, Code2, ImageIcon, MessageSquare, Music2, Palette, Sparkles, Video } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const capabilities = [
  { label: "Conversation", description: "Ask questions, explore ideas, and write together.", icon: MessageSquare, available: true },
  { label: "Code", description: "Build, understand, and improve your code.", icon: Code2, available: true },
  { label: "Images", description: "Turn your ideas into visuals.", icon: ImageIcon, available: false },
  { label: "Music", description: "Create original sounds and compositions.", icon: Music2, available: false },
  { label: "Video", description: "Bring your stories to motion.", icon: Video, available: false },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-400">Your workspace</p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">A few essentials to make yourself at home.</p>
      </div>

      <div className="space-y-5">
        <section aria-labelledby="appearance-heading" className="flex items-center justify-between gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6">
          <div className="flex items-start gap-4">
            <div className="hidden rounded-xl bg-violet-50 p-2.5 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 sm:block">
              <Palette aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <h2 id="appearance-heading" className="text-sm font-semibold text-slate-900 dark:text-white">Appearance</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Switch between a light and dark workspace.</p>
            </div>
          </div>
          <div className="shrink-0"><ModeToggle /></div>
        </section>

        <section aria-labelledby="access-heading" className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-white/[0.08] dark:bg-white/[0.02] sm:p-6">
          <h2 id="access-heading" className="text-sm font-semibold text-slate-900 dark:text-white">Open to everyone</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">Start a conversation or explore the workspace without creating an account. No sign-in is needed.</p>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-md text-sm font-medium text-violet-600 transition-colors hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:text-violet-400 dark:hover:text-violet-300 dark:focus-visible:ring-offset-slate-950">
            Open workspace <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </section>

        <section aria-labelledby="capabilities-heading" className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-white/[0.08] dark:bg-white/[0.02]">
          <div className="border-b border-slate-200/70 p-5 dark:border-white/[0.06] sm:px-6">
            <h2 id="capabilities-heading" className="text-sm font-semibold text-slate-900 dark:text-white">Workspace tools</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Chat and code are ready to use. More creative tools are on the way.</p>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-white/[0.05]">
            {capabilities.map((capability) => (
              <li key={capability.label} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6">
                <capability.icon aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{capability.label}</p>
                  <p className="mt-0.5 hidden text-xs leading-5 text-slate-500 dark:text-slate-400 sm:block">{capability.description}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium", capability.available ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-white/[0.05] dark:text-slate-400")}>
                  {capability.available ? "Available" : "Coming soon"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Link href="/conversation" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950">
        <Sparkles aria-hidden="true" className="h-4 w-4" /> Start a conversation
      </Link>
    </div>
  );
}
