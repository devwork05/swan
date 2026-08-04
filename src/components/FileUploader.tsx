"use client";

import { useRef, useState } from "react";
import { Loader2, Upload, X, ImageIcon, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface Props {
  /** Existing URL (edit mode). */
  value?: string | null;
  /** Fires with the new secure URL after successful upload; parent stores it. */
  onChange: (url: string) => void;
  /** Optional Cloudinary folder to organise assets. */
  folder?: string;
  /** Restrict picker (defaults to images). */
  accept?: string;
  /** Label shown above the drop zone. */
  label?: string;
  /** Show a smaller preview (e.g. for logo thumbs). Defaults to true. */
  preview?: boolean;
}

/**
 * Drops a file into Cloudinary via {@code POST /uploads} and hands the returned
 * URL to the parent through {@code onChange}. The endpoint 500s if Cloudinary
 * config isn't set — we surface that as a toast so the admin knows to fill it in.
 */
export function FileUploader({ value, onChange, folder, accept = "image/*", label, preview = true }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await api.uploads.file(file, folder);
      onChange(url);
      toast.success("Uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-[12px] font-medium text-secondary">{label}</label>}
      <div className="flex items-start gap-3">
        {preview && value && (
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="preview"
              className="h-16 w-16 rounded-lg border bg-page object-contain p-1"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              title="Remove"
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border bg-red-500/80 text-white hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <label
          className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-dashed p-3 transition-colors ${
            uploading ? "border-brand-red bg-brand-red/5" : "border bg-page hover:border-brand-red"
          }`}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin text-brand-red" />
          ) : value ? (
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          ) : (
            <Upload className="h-4 w-4 text-brand-red" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-secondary">
              {uploading ? "Uploading…" : value ? "Replace file" : "Choose a file to upload"}
            </p>
            {value && !uploading && (
              <p className="truncate text-[11px] text-subtle font-mono">{shortUrl(value)}</p>
            )}
          </div>
          <ImageIcon className="h-4 w-4 shrink-0 text-subtle" />
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handle(f);
              // Clear input so the same file can be re-uploaded if needed.
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

function shortUrl(u: string) {
  try {
    const url = new URL(u);
    const parts = url.pathname.split("/");
    return `…/${parts.slice(-2).join("/")}`;
  } catch {
    return u;
  }
}
