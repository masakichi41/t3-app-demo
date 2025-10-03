"use client";

import { cn } from "~/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
}

export function Avatar({ src, alt, fallback, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-medium",
        className,
      )}
      {...props}
    >
      {src ? <img alt={alt ?? "avatar"} src={src} className="h-full w-full object-cover" /> : fallback}
    </div>
  );
}
