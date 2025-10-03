"use client";

import { Column } from "./Column";

import type { Label, Status, Task } from "~/trpc/react";

interface BoardProps {
  groups: Record<Status, Task[]>;
  labels: Label[];
  onTaskClick: (task: Task) => void;
  loading?: boolean;
}

const order: Status[] = ["Todo", "InProgress", "Done"];

export default function Board({ groups, labels, onTaskClick, loading }: BoardProps) {
  const labelsById = labels.reduce<Record<string, Label>>((acc, label) => {
    acc[label.id] = label;
    return acc;
  }, {});

  const total = order.reduce((sum, status) => sum + (groups[status]?.length ?? 0), 0);

  if (!loading && total === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        表示できるタスクがありません。新規作成でタスクを追加してください。
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
      {order.map((status) => (
        <Column
          key={status}
          status={status}
          tasks={groups[status] ?? []}
          labels={labelsById}
          onTaskClick={onTaskClick}
        />
      ))}
      {loading ? (
        <div className="col-span-full text-center text-sm text-muted-foreground">読み込み中…</div>
      ) : null}
    </div>
  );
}
