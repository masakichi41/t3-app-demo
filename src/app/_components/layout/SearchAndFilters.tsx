"use client";

import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import type { Label, Status } from "~/trpc/react";

interface SearchAndFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: Status | "all";
  onStatusChange: (value: Status | "all") => void;
  labelId: string | "all";
  onLabelChange: (value: string | "all") => void;
  labels: Label[];
}

export function SearchAndFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  labelId,
  onLabelChange,
  labels,
}: SearchAndFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="タスクを検索"
        aria-label="検索"
      />
      <Select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as Status | "all")}
        aria-label="ステータス"
      >
        <option value="all">すべてのステータス</option>
        <option value="Todo">Todo</option>
        <option value="InProgress">In Progress</option>
        <option value="Done">Done</option>
      </Select>
      <Select
        value={labelId}
        onChange={(event) => onLabelChange(event.target.value)}
        aria-label="ラベル"
      >
        <option value="all">すべてのラベル</option>
        {labels.map((label) => (
          <option key={label.id} value={label.id}>
            {label.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
