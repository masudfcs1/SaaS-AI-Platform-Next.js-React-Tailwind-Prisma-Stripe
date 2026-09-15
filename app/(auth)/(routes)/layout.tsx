import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const font = Montserrat({ weight: "600", subsets: ["latin"] });

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#111827] flex flex-col items-center justify-center relative p-4 sm:p-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-[350px] h-[350px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-8 z-10">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-medium text-zinc-400 hover:text-white transition gap-1.5 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-6 w-6">
            <Image fill alt="Logo" src="/logo.png" />
          </div>
          <span className={cn("text-lg font-bold text-white", font.className)}>
            Dune Ai
          </span>
        </Link>
      </div>

      {/* Auth Card Container */}
      <div className="z-10 w-full flex justify-center">{children}</div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-zinc-500 z-10">
        Protected by Clerk &copy; {new Date().getFullYear()} Dune AI
      </div>
    </div>
  );
}
