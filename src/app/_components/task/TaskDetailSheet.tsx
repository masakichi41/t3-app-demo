"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "~/app/_components/common/ConfirmDialog";
import { UploadButton } from "~/app/_components/common/UploadButton";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import type { Status } from "~/trpc/react";
import {
  useCreateTask,
  useDeleteTask,
  useLabels,
  useTask,
  useUpdateTask,
} from "~/trpc/react";

import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";

interface TaskDetailSheetProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormState = {
  title: string;
  description: string;
  status: Status;
  labelId: string;
  attachmentUrl?: string;
  version: number;
};

function createInitialState(): FormState {
  return {
    title: "",
    description: "",
    status: "Todo",
    labelId: "",
    attachmentUrl: undefined,
    version: 0,
  };
}

export function TaskDetailSheet({ taskId, open, onOpenChange }: TaskDetailSheetProps) {
  const [form, setForm] = useState<FormState>(createInitialState);
  const taskQuery = useTask(open ? taskId : null);
  const { data: labels = [] } = useLabels();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const isEditing = Boolean(taskId);
  const loadingTask = taskQuery.isLoading || taskQuery.isFetching;

  useEffect(() => {
    if (!open) {
      setForm(createInitialState());
      return;
    }

    const task = taskQuery.data;
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        labelId: task.labelId ?? "",
        attachmentUrl: task.attachmentUrl,
        version: task.version,
      });
    } else if (!taskId) {
      setForm(createInitialState());
    }
  }, [open, taskId, taskQuery.data]);

  const close = () => onOpenChange(false);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.warning("タイトルを入力してください");
      return;
    }

    if (isEditing && taskId) {
      try {
        const updated = await updateTask.mutateAsync({
          id: taskId,
          input: {
            title: form.title,
            description: form.description || undefined,
            status: form.status,
            labelId: form.labelId || undefined,
            attachmentUrl: form.attachmentUrl,
            version: form.version,
          },
        });
        setForm({
          title: updated.title,
          description: updated.description ?? "",
          status: updated.status,
          labelId: updated.labelId ?? "",
          attachmentUrl: updated.attachmentUrl,
          version: updated.version,
        });
        toast.success("タスクを更新しました");
      } catch (error: unknown) {
        console.error(error);
        if (error instanceof Error && (error as { status?: number }).status === 409) {
          toast.error("他のユーザーが更新しました。再読み込みしてから保存してください。");
          void taskQuery.refetch();
          return;
        }
        if (error instanceof Error && error.message === "Conflict") {
          toast.error("最新のバージョンを取得して再度保存してください");
          void taskQuery.refetch();
          return;
        }
        toast.error("タスクの更新に失敗しました");
      }
      return;
    }

    try {
      await createTask.mutateAsync({
        title: form.title,
        description: form.description || undefined,
        labelId: form.labelId || undefined,
      });
      toast.success("タスクを作成しました");
      setForm(createInitialState());
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("タスクの作成に失敗しました");
    }
  };

  const handleDelete = async () => {
    if (!taskId) return;
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success("タスクを削除しました");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("タスクの削除に失敗しました");
    }
  };

  const headerTitle = isEditing ? "タスク詳細" : "新規タスク";

  const statusOptions: { value: Status; label: string }[] = useMemo(
    () => [
      { value: "Todo", label: "Todo" },
      { value: "InProgress", label: "In Progress" },
      { value: "Done", label: "Done" },
    ],
    [],
  );

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <aside
        className="relative ml-auto flex h-full w-full max-w-xl flex-col gap-6 overflow-y-auto bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{headerTitle}</h2>
            {isEditing && taskQuery.data ? (
              <p className="text-xs text-muted-foreground">
                最終更新: {new Date(taskQuery.data.updatedAt).toLocaleString("ja-JP")}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <ConfirmDialog
                triggerLabel="削除"
                onConfirm={handleDelete}
                title="このタスクを削除しますか？"
                description="削除するとコメントも含めて元に戻せません。"
              />
            ) : null}
            <Button variant="ghost" onClick={close}>
              閉じる
            </Button>
          </div>
        </header>

        {loadingTask && isEditing ? (
          <p className="text-sm text-muted-foreground">タスク情報を読み込んでいます…</p>
        ) : null}

        <section className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">タイトル</label>
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="タスク名"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">詳細</label>
            <Textarea
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="タスクの詳細を入力"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">ステータス</label>
              <Select
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as Status }))}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ラベル</label>
              <Select
                value={form.labelId}
                onChange={(event) => setForm((prev) => ({ ...prev, labelId: event.target.value }))}
              >
                <option value="">未指定</option>
                {labels.map((label) => (
                  <option key={label.id} value={label.id}>
                    {label.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">添付</label>
            <UploadButton value={form.attachmentUrl} onChange={(value) => setForm((prev) => ({ ...prev, attachmentUrl: value }))} />
          </div>
        </section>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={close}>
            キャンセル
          </Button>
          <Button onClick={handleSave} isLoading={createTask.isPending || updateTask.isPending}>
            {isEditing ? "更新" : "作成"}
          </Button>
        </div>

        <section className="space-y-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">コメント</h3>
          <CommentList taskId={isEditing ? taskId : null} />
          <CommentForm taskId={isEditing ? taskId : null} />
        </section>
      </aside>
    </div>
  );
}
