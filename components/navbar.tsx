"use client";

import React from "react";
import MobileSidebar from "@/components/mobileSidebar";
import { ModeToggle } from "@/components/mode-toggle";

const Navbar = () => {
  return (
    <div className="flex items-center p-4 border-b border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
      <MobileSidebar />
      <div className="flex w-full justify-end items-center gap-x-3">
        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
