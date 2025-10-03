"use client";

import { Avatar } from "~/components/ui/avatar";
import { useComments } from "~/trpc/react";

interface CommentListProps {
  taskId: string | null;
}

function formatTimestamp(value: string) {
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function CommentList({ taskId }: CommentListProps) {
  const { data, isLoading, isError } = useComments(taskId ?? "");

  if (!taskId) {
    return <p className="text-sm text-muted-foreground">コメントはタスク保存後に追加できます。</p>;
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">コメントを読み込んでいます…</p>;
  }

  if (isError) {
    return <p className="text-sm text-destructive">コメントの取得に失敗しました。</p>;
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">コメントはまだありません。</p>;
  }

  return (
    <ul className="space-y-4">
      {data.map((comment) => (
        <li key={comment.id} className="flex gap-3 rounded-2xl border border-border bg-muted/40 p-3">
          <Avatar fallback={comment.body.slice(0, 1).toUpperCase()} className="h-8 w-8" />
          <div className="flex-1 text-sm">
            <p className="whitespace-pre-wrap text-foreground">{comment.body}</p>
            <span className="mt-2 block text-[11px] uppercase tracking-wide text-muted-foreground">
              {formatTimestamp(comment.createdAt)}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
