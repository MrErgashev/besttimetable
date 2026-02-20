"use client";

import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const px = sizeMap[size];

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        className="animate-[spin_1s_steps(8)_infinite]"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={i}
            x="11"
            y="2"
            width="2"
            height="6"
            rx="1"
            fill="currentColor"
            opacity={0.15 + (i / 8) * 0.85}
            transform={`rotate(${i * 45} 12 12)`}
          />
        ))}
      </svg>
    </div>
  );
}
