"use client";

import { useEffect, useState } from "react";

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "@/constants/image-size";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

import { ImagePlus, Video, X, Upload, FileVideo } from "lucide-react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface BatchMediaUploadProps {
  thumbnailFile: File | null;
  previewVideoFile: File | null;

  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;

  thumbnailRemoved: boolean;
  previewVideoRemoved: boolean;

  onThumbnailChange: (file: File | null) => void;
  onPreviewVideoChange: (file: File | null) => void;

  onThumbnailRemove: (removed: boolean) => void;
  onPreviewVideoRemove: (removed: boolean) => void;

  disabled?: boolean;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatFileSize(size: number): string {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function BatchMediaUpload({
  thumbnailFile,
  previewVideoFile,

  thumbnailUrl,
  previewVideoUrl,

  thumbnailRemoved,
  previewVideoRemoved,

  onThumbnailChange,
  onPreviewVideoChange,

  onThumbnailRemove,
  onPreviewVideoRemove,

  disabled = false,
}: BatchMediaUploadProps) {
  const [thumbnailError, setThumbnailError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Preview URLs
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(thumbnailFile);

    setThumbnailPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [thumbnailFile]);

  useEffect(() => {
    if (!previewVideoFile) {
      setVideoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(previewVideoFile);

    setVideoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [previewVideoFile]);

  // ---------------------------------------------------------------------------
  // Thumbnail Handler
  // ---------------------------------------------------------------------------

  function handleThumbnailChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setThumbnailError(null);

    if (!file) return;

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      setThumbnailError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setThumbnailError("Thumbnail size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    onThumbnailChange(file);
    onThumbnailRemove(false);

    event.target.value = "";
  }

  // ---------------------------------------------------------------------------
  // Preview Video Handler
  // ---------------------------------------------------------------------------

  function handlePreviewVideoChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    setVideoError(null);

    if (!file) return;

    if (
      !ALLOWED_VIDEO_TYPES.includes(
        file.type as (typeof ALLOWED_VIDEO_TYPES)[number],
      )
    ) {
      setVideoError("Please select an MP4, WebM, or MOV video.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_SIZE) {
      setVideoError("Preview video size must not exceed 100 MB.");
      event.target.value = "";
      return;
    }

    onPreviewVideoChange(file);
    onPreviewVideoRemove(false);

    event.target.value = "";
  }

  // ---------------------------------------------------------------------------
  // Remove Handlers
  // ---------------------------------------------------------------------------

  function handleRemoveThumbnail() {
    setThumbnailError(null);

    if (thumbnailFile) {
      onThumbnailChange(null);
      return;
    }

    onThumbnailRemove(true);
  }

  function handleRemoveVideo() {
    setVideoError(null);

    if (previewVideoFile) {
      onPreviewVideoChange(null);
      return;
    }

    onPreviewVideoRemove(true);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold">Batch Media</h3>

        <p className="text-sm text-muted-foreground">
          Upload a thumbnail and preview video for your batch.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* ---------------------------------------------------------------- */}
        {/* Thumbnail */}
        {/* ---------------------------------------------------------------- */}

        <Field>
          <FieldLabel>Batch Thumbnail</FieldLabel>

          <FieldDescription>JPG, PNG, WebP · Maximum 5 MB</FieldDescription>

          {!thumbnailRemoved && (
            <>
              {thumbnailPreview || thumbnailUrl ? (
                <div className="relative overflow-hidden rounded-lg border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnailPreview ?? thumbnailUrl!}
                    alt="Batch thumbnail preview"
                    className="h-44 w-full object-cover"
                  />

                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    disabled={disabled}
                    onClick={handleRemoveThumbnail}
                    className="absolute right-2 top-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="batch-thumbnail"
                  className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 transition hover:bg-muted/60"
                >
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />

                  <span className="text-sm font-medium">Select Thumbnail</span>

                  <span className="text-xs text-muted-foreground">
                    Click to browse
                  </span>
                </label>
              )}
            </>
          )}

          {thumbnailRemoved && (
            <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
              <ImagePlus className="h-8 w-8 text-muted-foreground" />

              <p className="text-sm text-muted-foreground">Thumbnail removed</p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => onThumbnailRemove(false)}
              >
                Undo
              </Button>
            </div>
          )}

          <Input
            id="batch-thumbnail"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={disabled}
            onChange={handleThumbnailChange}
          />

          {thumbnailFile && (
            <p className="break-all text-xs text-muted-foreground">
              {thumbnailFile.name} · {formatFileSize(thumbnailFile.size)}
            </p>
          )}

          {thumbnailError && (
            <p className="text-sm text-destructive">{thumbnailError}</p>
          )}

          {thumbnailFile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onThumbnailChange(null)}
            >
              Remove selected file
            </Button>
          )}
        </Field>

        {/* ---------------------------------------------------------------- */}
        {/* Preview Video */}
        {/* ---------------------------------------------------------------- */}

        <Field>
          <FieldLabel>Preview Video</FieldLabel>

          <FieldDescription>MP4, WebM, MOV · Maximum 100 MB</FieldDescription>

          {!previewVideoRemoved && (
            <>
              {videoPreview || previewVideoUrl ? (
                <div className="relative overflow-hidden rounded-lg border bg-muted">
                  <video
                    src={videoPreview ?? previewVideoUrl ?? undefined}
                    controls
                    className="h-44 w-full bg-black object-contain"
                  />

                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    disabled={disabled}
                    onClick={handleRemoveVideo}
                    className="absolute right-2 top-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="batch-preview-video"
                  className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 transition hover:bg-muted/60"
                >
                  <FileVideo className="h-8 w-8 text-muted-foreground" />

                  <span className="text-sm font-medium">
                    Select Preview Video
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Click to browse
                  </span>
                </label>
              )}
            </>
          )}

          {previewVideoRemoved && (
            <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
              <Video className="h-8 w-8 text-muted-foreground" />

              <p className="text-sm text-muted-foreground">
                Preview video removed
              </p>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => onPreviewVideoRemove(false)}
              >
                Undo
              </Button>
            </div>
          )}

          <Input
            id="batch-preview-video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            disabled={disabled}
            onChange={handlePreviewVideoChange}
          />

          {previewVideoFile && (
            <p className="break-all text-xs text-muted-foreground">
              {previewVideoFile.name} · {formatFileSize(previewVideoFile.size)}
            </p>
          )}

          {videoError && (
            <p className="text-sm text-destructive">{videoError}</p>
          )}

          {previewVideoFile && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onPreviewVideoChange(null)}
            >
              Remove selected file
            </Button>
          )}
        </Field>
      </div>

      <p className="text-xs text-muted-foreground">
        Files will be uploaded to ImageKit when you submit the batch form.
      </p>
    </section>
  );
}
