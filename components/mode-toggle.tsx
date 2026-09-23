"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const subscribe = () => () => {};

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-9 h-9 border-zinc-200 dark:border-white/15 bg-transparent"
        aria-label="Toggle theme"
      >
        <span className="w-4 h-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full w-9 h-9 border-zinc-200 dark:border-white/15 bg-transparent hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-all rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-300 transition-all rotate-0 scale-100" />
      )}
    </Button>
  );
}
