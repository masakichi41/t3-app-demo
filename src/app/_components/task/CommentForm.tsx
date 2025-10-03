"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { useAddComment } from "~/trpc/react";

interface CommentFormProps {
  taskId: string | null;
}

export function CommentForm({ taskId }: CommentFormProps) {
  const [body, setBody] = useState("");
  const mutation = useAddComment();
  const disabled = !taskId || mutation.isPending;

  const submit = async () => {
    if (!taskId) return;
    if (!body.trim()) {
      toast.warning("コメントを入力してください");
      return;
    }
    try {
      await mutation.mutateAsync({ taskId, body });
      setBody("");
      toast.success("コメントを追加しました");
    } catch (error) {
      console.error(error);
      toast.error("コメントの追加に失敗しました");
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="コメントを入力"
        disabled={disabled}
      />
      <Button onClick={submit} disabled={disabled} isLoading={mutation.isPending}>
        コメントする
      </Button>
    </div>
  );
}
