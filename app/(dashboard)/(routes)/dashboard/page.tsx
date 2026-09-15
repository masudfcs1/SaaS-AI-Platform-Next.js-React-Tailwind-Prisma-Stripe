"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

import { tools } from "@/constants";

const DashboardPage = () => {
  const router = useRouter();

  return (
    <div>
      <div className="mb-8 space-y-4 text-center px-4">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Explore the Power of AI
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base font-normal max-w-lg mx-auto">
          Chat with the smartest AI models — Experience the next generation of creative intelligence.
        </p>
      </div>

      <div className="px-4 md:px-20 lg:px-32 space-y-4 max-w-5xl mx-auto">
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className="p-4 bg-white dark:bg-white/[0.04] border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.08] flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2.5 w-fit rounded-lg", tool.bgColor)}>
                <tool.icon className={cn("w-7 h-7", tool.color)} />
              </div>
              <div className="font-semibold text-zinc-900 dark:text-white text-base">
                {tool.label}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
