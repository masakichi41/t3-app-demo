"use client";

import { TaskCard } from "./TaskCard";

import type { Label, Status, Task } from "~/trpc/react";

interface ColumnProps {
  status: Status;
  tasks: Task[];
  labels: Record<string, Label>;
  onTaskClick: (task: Task) => void;
}

const statusMeta: Record<Status, { label: string; badgeClass: string }> = {
  Todo: { label: "Todo", badgeClass: "bg-slate-100 text-slate-700" },
  InProgress: { label: "In Progress", badgeClass: "bg-amber-100 text-amber-700" },
  Done: { label: "Done", badgeClass: "bg-emerald-100 text-emerald-700" },
};

export function Column({ status, tasks, labels, onTaskClick }: ColumnProps) {
  const meta = statusMeta[status];
  return (
    <section className="flex flex-1 flex-col gap-4 rounded-3xl border border-border bg-muted/30 p-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}>
            {meta.label}
          </span>
          <span className="text-xs text-muted-foreground">{tasks.length} 件</span>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-3">
        {tasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            まだタスクがありません
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} label={task.labelId ? labels[task.labelId] : undefined} onClick={onTaskClick} />
          ))
        )}
      </div>
    </section>
  );
}
