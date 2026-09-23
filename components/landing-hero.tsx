"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const phrases = [
  "Chatbot.",
  "Photo Generation.",
  "Code Generation.",
  "Music Generation.",
  "Video Generation.",
];

export const LandingHero = () => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (subIndex === phrases[index].length + 1 && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 1500);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 40 : 80);

    return () => clearTimeout(timeout);
  }, [subIndex, index, isDeleting]);

  return (
    <div className="text-white font-bold py-24 sm:py-32 text-center space-y-6">
      <div className="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm text-zinc-300 font-medium mb-4 backdrop-blur-sm">
        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
        <span>Next Generation AI Suite</span>
      </div>

      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl space-y-4 font-extrabold tracking-tight">
        <h1>The Best AI Tool for</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 min-h-[1.2em]">
          {phrases[index].substring(0, subIndex)}
          <span className="inline-block w-1 h-10 md:h-14 bg-pink-500 ml-1 translate-y-2 animate-pulse" />
        </div>
      </div>

      <div className="text-sm md:text-xl font-light text-zinc-400 max-w-xl mx-auto px-4">
        Create intelligent content, generate realistic media, and write code using state-of-the-art AI models 10x faster.
      </div>

      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          asChild
          variant="premium"
          className="md:text-lg p-4 md:p-6 rounded-full font-semibold group flex items-center gap-2"
        >
          <Link href="/dashboard">
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>
        </Button>
      </div>

      <div className="text-zinc-500 text-xs md:text-sm font-normal">
        No sign-in required. Explore the dashboard for free.
      </div>
    </div>
  );
};
