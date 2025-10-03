"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "~/components/ui/button";

interface UploadButtonProps {
  value?: string | null;
  onChange: (value: string | undefined) => void;
}

export function UploadButton({ value, onChange }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | undefined>(value ?? undefined);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    setPreview(value ?? undefined);
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setPreview(undefined);
      onChange(undefined);
      return;
    }
    const file = files.item(0);
    if (!file) {
      setPreview(undefined);
      onChange(undefined);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    setPreview(url);
    onChange(url);
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
        添付ファイルを選択
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFiles(event.currentTarget.files)}
      />
      {preview ? (
        <div className="overflow-hidden rounded-xl border border-dashed p-2">
          <img src={preview} alt="preview" className="h-32 w-full rounded-lg object-cover" />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">JPG/PNG などの画像を 1 件だけ添付できます。</p>
      )}
    </div>
  );
}
