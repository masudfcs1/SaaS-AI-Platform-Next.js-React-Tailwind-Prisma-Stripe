import Image from "next/image";
import Link from "next/link";
import React from "react";
import imglogo from "../public/logo.png";
import {
  Code,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Music,
  Settings,
  VideoIcon,
} from "lucide-react";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
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

const Sidebar = () => {
  return (
    <div className=" space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="  px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <Image alt="logo" src={imglogo} />
          </div>
          <h1 className={cn(" text-2xl font-bold", montserrat.className)}>
            Dune Ai
          </h1>
        </Link>
        <div className=" space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className=" text-sm group flex p-4 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition "
            >
              <div className=" flex items-center flex-1">
                <route.icon className={cn(" h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
