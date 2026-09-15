"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import imglogo from "../public/logo.png";
import { LayoutDashboard, Zap } from "lucide-react";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { tools, MAX_FREE_COUNTS } from "@/constants";
import { Button } from "@/components/ui/button";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

export const Sidebar = () => {
  const pathname = usePathname();

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      color: "text-sky-500",
    },
    ...tools,
  ];

  // Mock API limits for UI purposes
  const apiLimitCount = 2;

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <Image alt="logo" src={imglogo} />
          </div>
          <h1 className={cn("text-2xl font-bold", montserrat.className)}>
            Dune AI
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              href={route.href}
              key={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition-all",
                pathname === route.href
                  ? "text-white bg-white/10"
                  : "text-zinc-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Professional Free Tier Usage / Upgrade Card */}
      <div className="px-3 mb-4">
        <div className="bg-white/10 rounded-xl p-4 flex flex-col gap-y-4 shadow-sm border border-white/10">
          <div className="text-center">
            <p className="text-sm font-semibold text-white/80 mb-2">
              {apiLimitCount} / {MAX_FREE_COUNTS} Free Generations
            </p>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${(apiLimitCount / MAX_FREE_COUNTS) * 100}%` }}
              />
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-0 hover:opacity-90 transition text-white">
            <Zap className="w-4 h-4 mr-2 fill-white" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
