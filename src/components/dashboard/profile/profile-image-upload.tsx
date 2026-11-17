
"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { uploadFile } from "@/helper/imagekit/upload";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/constants/image-size";

interface ProfileImageUploadProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
  disabled?: boolean;
}

const ACCEPTED_IMAGE_TYPES = ALLOWED_IMAGE_TYPES.join(",");

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

export function ProfileImageUpload({
  name,
  value,
  onChange,
  onUploadingChange,
  disabled = false,
}: ProfileImageUploadProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    value || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Keep preview synchronized with the parent form value.
  useEffect(() => {
    setPreviewUrl(value || null);
  }, [value]);

  // Release temporary object URLs to prevent memory leaks.
  useEffect(() => {
    if (!previewUrl?.startsWith("blob:")) return;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    setUploadError("");

    // Validate MIME type.
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      const message =
        "Only JPEG, PNG, WebP images are supported.";

      setUploadError(message);
      toast.error(message);
      return;
    }

    // Validate file size.
    if (file.size > MAX_IMAGE_SIZE) {
      const message = "Image size must not exceed 5 MB.";

      setUploadError(message);
      toast.error(message);
      return;
    }

    const localPreview = URL.createObjectURL(file);

    setPreviewUrl(localPreview);
    setUploadProgress(0);
    setIsUploading(true);
    onUploadingChange?.(true);

    try {
      const uploadedFile = await uploadFile({
        file,
        fileName: `profile-${Date.now()}-${file.name}`,
        folder: "profiles",
        tags: ["profile-image"],
        onProgress: (progress) => {
          setUploadProgress(
            Math.min(100, Math.max(0, progress))
          );
        },
      });

      if (!uploadedFile.url) {
        throw new Error(
          "Image upload completed without returning a URL."
        );
      }

      // Update the parent form only after successful upload.
      onChange(uploadedFile.url);
      setPreviewUrl(uploadedFile.url);
      setUploadProgress(100);

      toast.success("Profile image uploaded successfully.");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to upload profile image.";

      setUploadError(message);
      setPreviewUrl(value || null);

      toast.error(message);
    } finally {
      setIsUploading(false);
      onUploadingChange?.(false);
    }
  }

  function handleRemoveImage() {
    if (disabled || isUploading) return;

    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadError("");

    onChange("");

    toast.success("Profile image removed from the form.");
  }

  const isDisabled = disabled || isUploading;

  return (
    <div className="space-y-3">
      <Label
        htmlFor={inputId}
        className="text-sm font-semibold text-text-primary dark:text-foreground"
      >
        Profile Picture
      </Label>

      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
        <Avatar className="size-20 shrink-0 border-2 border-border ring-1 ring-border">
          <AvatarImage
            src={previewUrl ?? undefined}
            alt={name || "Profile preview"}
          />

          <AvatarFallback className="bg-brand-dark text-lg font-bold text-white dark:bg-secondary dark:text-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-text-primary dark:text-foreground">
              Upload your profile picture
            </p>

            <p className="text-xs text-text-secondary dark:text-muted-foreground">
              JPEG, PNG, WebP or AVIF. Maximum size: 5 MB.
            </p>
          </div>

          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={handleImageSelect}
            disabled={isDisabled}
            className="sr-only"
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-[var(--radius-button)] border-border font-medium hover:bg-muted"
            >
              {isUploading ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 size-4" />
              )}

              {isUploading ? "Uploading..." : "Choose Image"}
            </Button>

            {previewUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDisabled}
                onClick={handleRemoveImage}
                className="rounded-[var(--radius-button)] text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="mr-2 size-4" />
                Remove
              </Button>
            )}
          </div>

          {isUploading && (
            <div
              className="space-y-1.5"
              role="status"
              aria-live="polite"
            >
              <div className="flex justify-between text-xs font-medium text-text-secondary dark:text-muted-foreground">
                <span>Uploading image...</span>
                <span>{uploadProgress}%</span>
              </div>

              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label="Image upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={uploadProgress}
              >
                <div
                  className="h-full rounded-full bg-brand-primary transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {previewUrl && !isUploading && !uploadError && (
            <p className="text-xs font-medium text-text-secondary dark:text-muted-foreground">
              Profile image ready.
            </p>
          )}

          {uploadError && (
            <p
              role="alert"
              className="text-xs font-medium text-destructive"
            >
              {uploadError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
