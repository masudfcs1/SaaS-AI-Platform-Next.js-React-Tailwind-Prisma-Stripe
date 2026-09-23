import { Settings } from "lucide-react";
import { chatModes, chatTools } from "@/lib/chat-tools";

export const MAX_FREE_COUNTS = 5;

export const tools = [
  ...chatModes.map((mode) => ({
    label: chatTools[mode].label,
    icon: chatTools[mode].icon,
    href: chatTools[mode].href,
    color: chatTools[mode].accent,
    bgColor: "bg-accent",
  })),
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
];
