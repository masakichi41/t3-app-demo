"use client";

import { Paperclip } from "lucide-react";

import { LabelBadge } from "~/app/_components/common/LabelBadge";
import type { Label, Task } from "~/trpc/react";

interface TaskCardProps {
  task: Task;
  label?: Label | null;
  onClick: (task: Task) => void;
}

function formatDateString(value: string) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function TaskCard({ task, label, onClick }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(task)}
      className="flex w-full flex-col gap-2 rounded-2xl bg-card p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold leading-tight text-foreground line-clamp-2">{task.title}</p>
        {task.attachmentUrl ? <Paperclip className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      {label ? <LabelBadge name={label.name} color={label.color} /> : null}
      {task.description ? (
        <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      ) : null}
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        更新: {formatDateString(task.updatedAt)}
      </span>
    </button>
  );
}
