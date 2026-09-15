import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface HeadingProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

const Heading = ({
  title,
  description,
  icon: Icon,
  iconColor,
  bgColor,
}: HeadingProps) => {
  return (
    <div className="flex px-4 md:px-8 items-center gap-x-3 mb-8 py-6">
      <div className={cn("p-2 w-fit rounded-lg", bgColor)}>
        <Icon className={cn("w-8 h-8", iconColor)} />
      </div>
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
};

export default Heading;
