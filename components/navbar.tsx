"use client";

import React from "react";
import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";
import MobileSidebar from "@/components/mobileSidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <div className="flex items-center p-4 border-b border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
      <MobileSidebar />
      <div className="flex w-full justify-end items-center gap-x-3">
        <ModeToggle />
        {isLoaded && !isSignedIn && (
          <Link href="/sign-in">
            <Button variant="premium" size="sm" className="rounded-full px-4">
              Sign In
            </Button>
          </Link>
        )}
        {isSignedIn && (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9 ring-2 ring-purple-500/20",
              },
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
