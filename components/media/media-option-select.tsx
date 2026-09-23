"use client";

import { useId } from "react";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MediaOptionSelectProps<T extends string | number> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}

export function MediaOptionSelect<T extends string | number>({ label, value, options, onChange, className }: MediaOptionSelectProps<T>) {
  const id = useId();

  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <Label htmlFor={id} className="text-[10px] font-medium text-muted-foreground">{label}</Label>
      <Select value={String(value)} onValueChange={(selected) => {
        const option = options.find((item) => String(item.value) === selected);
        if (option) onChange(option.value);
      }}>
        <SelectTrigger id={id} aria-label={label} className="h-9 rounded-lg border-border bg-background text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="top" align="start" sideOffset={8} className="rounded-xl">
          {options.map((option) => <SelectItem key={option.value} value={String(option.value)} className="rounded-lg text-xs">{option.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
