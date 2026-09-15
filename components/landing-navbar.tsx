"use client";

import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

const font = Montserrat({ weight: "600", subsets: ["latin"] });

export const LandingNavbar = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className="p-4 bg-transparent flex items-center justify-between">
      <Link href="/" className="flex items-center">
        <div className="relative h-8 w-8 mr-4">
          <Image fill alt="Logo" src="/logo.png" />
        </div>
        <h1 className={cn("text-2xl font-bold text-white", font.className)}>
          Dune Ai
        </h1>
      </Link>
      <div className="flex items-center gap-x-3">
        <ModeToggle />
        {isLoaded && isSignedIn ? (
          <Link href="/dashboard">
            <Button variant="premium" className="rounded-full">
              Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="premium" className="rounded-full">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
