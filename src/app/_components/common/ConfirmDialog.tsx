"use client";

import { useState } from "react";

import { Button } from "~/components/ui/button";

interface ConfirmDialogProps {
  triggerLabel: string;
  triggerVariant?: React.ComponentProps<typeof Button>["variant"];
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDialog({
  triggerLabel,
  triggerVariant = "destructive",
  title,
  description,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant={triggerVariant} size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button variant={triggerVariant} size="sm" onClick={handleConfirm} isLoading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
