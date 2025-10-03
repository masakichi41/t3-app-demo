"use client";

import { Button } from "~/components/ui/button";
import type { Label, Status } from "~/trpc/react";

import { SearchAndFilters } from "./SearchAndFilters";

interface AppHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: Status | "all";
  onStatusChange: (value: Status | "all") => void;
  labelId: string | "all";
  onLabelChange: (value: string | "all") => void;
  labels: Label[];
  onCreate: () => void;
  onResetFilters: () => void;
}

export function AppHeader({
  query,
  onQueryChange,
  status,
  onStatusChange,
  labelId,
  onLabelChange,
  labels,
  onCreate,
  onResetFilters,
}: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 rounded-3xl border border-border bg-card/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Kanban Lite</h1>
          <p className="text-sm text-muted-foreground">モックAPIでタスクを管理するシンプルなボード</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onResetFilters}>
            リセット
          </Button>
          <Button onClick={onCreate}>新規作成</Button>
        </div>
      </div>
      <SearchAndFilters
        query={query}
        onQueryChange={onQueryChange}
        status={status}
        onStatusChange={onStatusChange}
        labelId={labelId}
        onLabelChange={onLabelChange}
        labels={labels}
      />
    </header>
  );
}
