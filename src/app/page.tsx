"use client";

import { useMemo, useState } from "react";

import Board from "~/app/_components/board/Board";
import { AppHeader } from "~/app/_components/layout/AppHeader";
import { TaskDetailSheet } from "~/app/_components/task/TaskDetailSheet";
import type { Status } from "~/trpc/react";
import { useLabels, useTasks } from "~/trpc/react";

export default function Page() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [labelFilter, setLabelFilter] = useState<string | "all">("all");
  const [open, setOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const filters = useMemo(() => {
    return {
      q: query || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      labelId: labelFilter === "all" ? undefined : labelFilter,
    };
  }, [query, statusFilter, labelFilter]);

  const tasksQuery = useTasks(filters.q || filters.status || filters.labelId ? filters : undefined);
  const labelsQuery = useLabels();

  const items = tasksQuery.data ?? [];
  const groups = useMemo(
    () => ({
      Todo: items.filter((task) => task.status === "Todo"),
      InProgress: items.filter((task) => task.status === "InProgress"),
      Done: items.filter((task) => task.status === "Done"),
    }),
    [items],
  );

  const handleCreate = () => {
    setSelectedTaskId(null);
    setOpen(true);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setOpen(true);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSelectedTaskId(null);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setLabelFilter("all");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
      <AppHeader
        query={query}
        onQueryChange={setQuery}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        labelId={labelFilter}
        onLabelChange={setLabelFilter}
        labels={labelsQuery.data ?? []}
        onCreate={handleCreate}
        onResetFilters={resetFilters}
      />
      <Board
        groups={groups}
        labels={labelsQuery.data ?? []}
        onTaskClick={(task) => handleTaskClick(task.id)}
        loading={tasksQuery.isLoading || tasksQuery.isFetching}
      />
      <TaskDetailSheet taskId={selectedTaskId} open={open} onOpenChange={handleOpenChange} />
    </main>
  );
}
