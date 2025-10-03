"use client";

import { cn } from "~/lib/utils";

interface LabelBadgeProps {
  name: string;
  color: string;
  className?: string;
}

function normalizeHex(value: string) {
  const hex = value.trim().replace(/^#/, "");
  if (hex.length === 3) {
    return hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return hex.padEnd(6, "0").slice(0, 6);
}

function getContrastColor(hexColor: string) {
  const hex = normalizeHex(hexColor);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 140 ? "#0f172a" : "#f8fafc";
}

export function LabelBadge({ name, color, className }: LabelBadgeProps) {
  const foreground = getContrastColor(color);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm",
        className,
      )}
      style={{ backgroundColor: color, color: foreground }}
    >
      {name}
    </span>
  );
}
