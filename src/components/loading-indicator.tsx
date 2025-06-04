"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  size?: number;
  className?: string;
}

export function LoadingIndicator({ size = 24, className }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <Loader2 className={cn("animate-spin text-primary", `w-${size/4} h-${size/4}`)} style={{ width: `${size}px`, height: `${size}px` }} />
    </div>
  );
}
