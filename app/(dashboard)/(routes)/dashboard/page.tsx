"use client";

import {
  ArrowRight,
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Music,
  Settings,
  VideoIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const tools = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    bgColor: "bg-violet-500/10",
    color: " text-sky-600",
  },
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: " text-violet-600",
  },
  {
    label: "Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: " text-pink-600",
  },
  {
    label: "Video Generation",
    icon: VideoIcon,
    href: "/video",
    color: " text-orange-600",
  },
  {
    label: "Music Generation",
    icon: Music,
    href: "/music",
    color: " text-blue-600",
  },
  {
    label: "Code Generation",
    icon: Code,
    href: "/code",
    color: " text-green-600",
  },
  {
    label: "Setting",
    icon: Settings,
    href: "/settings",
  },
];

const Dashboard = () => {
  const router = useRouter();

  return (
    <>
      <div className=" mb-8 space-y-4 ">
        <h2 className=" text-2xl md:text-4xl font-bold text-center ">
          Explore the Power if Ai
        </h2>
        <p className="text-muted-foreground text-center text-sm md:text-lg font-light">
          Chat with the smartext AI - Experience the power of AI{" "}
        </p>
      </div>
      <div className=" px-4 md:px-15 lg:px-22 space-y-4">
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className=" p-4  border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
          >
            <div className=" flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />{" "}
              </div>
              <div className=" font-semibold">{tool.label} </div>
            </div>
            <ArrowRight className=" w-5 h-5" />
          </Card>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
