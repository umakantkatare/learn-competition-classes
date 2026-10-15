"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";

type CourseThumbnailUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  onFileIdChange?: (fileId: string) => void;
  disabled?: boolean;
};

type UploadAuth = {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export function CourseThumbnailUpload({
  value = "",
  onChange,
  onFileIdChange,
  disabled = false,
}: CourseThumbnailUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    // Allow the same file to be selected again.
    input.value = "";

    if (!file) return;

    setError(null);
    setProgress(0);

    if (!ALLOWED_TYPES.has(file.type)) {
      setError("Only JPG, PNG and WebP images are allowed.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsUploading(true);

    try {
      const authResponse = await fetch("/api/upload-auth", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });

      if (!authResponse.ok) {
        throw new Error("Unable to authorize image upload.");
      }

      const auth: UploadAuth = await authResponse.json();

      if (!auth.token || !auth.signature || !auth.publicKey || !auth.expire) {
        throw new Error("Invalid upload authentication response.");
      }

      const result = await upload({
        file,
        fileName: file.name,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
        publicKey: auth.publicKey,
        folder: "/lcc/courses",
        useUniqueFileName: true,
        abortSignal: controller.signal,
        onProgress: ({ loaded, total }) => {
          if (total > 0) {
            setProgress(Math.min(100, Math.round((loaded / total) * 100)));
          }
        },
      });

      if (controller.signal.aborted) return;

      onChange(result.url!);
      onFileIdChange?.(result.fileId!);
      setProgress(100);
    } catch (err) {
      if (err instanceof ImageKitAbortError) {
        setError("Upload was cancelled.");
      } else if (err instanceof ImageKitInvalidRequestError) {
        setError("Invalid image upload request.");
      } else if (err instanceof ImageKitUploadNetworkError) {
        setError("Network error. Please try again.");
      } else if (err instanceof ImageKitServerError) {
        setError("ImageKit server error. Please try again.");
      } else if (err instanceof Error && err.name === "AbortError") {
        setError("Upload was cancelled.");
      } else {
        console.error("Course thumbnail upload failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Image upload failed. Please try again.",
        );
      }

      setProgress(0);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setIsUploading(false);
      }
    }
  }

  function removeThumbnail() {
    if (disabled || isUploading) return;

    onChange("");
    onFileIdChange?.("");
    setError(null);
    setProgress(0);
  }

  return (
    <div className="w-full space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        disabled={disabled || isUploading}
        onChange={handleUpload}
        aria-label="Select course thumbnail"
      />

      {value ? (
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border bg-muted">
            <img
              src={value}
              alt="Course thumbnail preview"
              className="aspect-video w-full object-cover"
            />

            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
                <Loader2 className="size-7 animate-spin" />
                <p className="text-sm font-medium">Uploading {progress}%</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus className="size-4" />
              Change thumbnail
            </button>

            <button
              type="button"
              disabled={disabled || isUploading}
              onClick={removeThumbnail}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="size-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="size-8 animate-spin text-primary" />
          ) : (
            <div className="rounded-full bg-muted p-3">
              <Upload className="size-6" />
            </div>
          )}

          <span className="font-medium">
            {isUploading ? "Uploading thumbnail..." : "Upload thumbnail"}
          </span>

          <span className="text-sm text-muted-foreground">
            JPG, PNG or WebP · Maximum 5 MB
          </span>
        </button>
      )}

      {isUploading && (
        <div className="space-y-2">
          <div
            role="progressbar"
            aria-label="Thumbnail upload progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {progress}% uploaded
            </p>

            <button
              type="button"
              onClick={cancelUpload}
              className="inline-flex items-center gap-1 text-sm text-destructive hover:underline"
            >
              <X className="size-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
