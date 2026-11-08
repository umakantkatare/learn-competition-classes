
"use client";

import { useEffect, useState } from "react";
import { ImagePlus, X, Undo2, ImageIcon } from "lucide-react";

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
} from "@/constants/image-size";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
} from "@/components/ui/field";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ExamCategoryMediaUploadProps {
  logoFileId: File | null;
  logoUrl?: string | null;
  logoRemoved: boolean;

  onLogoChange: (file: File | null) => void;
  onLogoRemove: (removed: boolean) => void;

  disabled?: boolean;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function ExamCategoryLogoUpload({
  logoFileId,
  logoUrl,
  logoRemoved,
  onLogoChange,
  onLogoRemove,
  disabled = false,
}: ExamCategoryMediaUploadProps) {
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Preview URL
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!logoFileId) {
      setLogoPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(logoFileId);

    setLogoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [logoFileId]);

  // ---------------------------------------------------------------------------
  // Logo Handler
  // ---------------------------------------------------------------------------

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setLogoError(null);

    if (!file) return;

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
      )
    ) {
      setLogoError("Please select a valid PNG, JPG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setLogoError("Logo size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    onLogoChange(file);
    onLogoRemove(false);

    event.target.value = "";
  }

  // ---------------------------------------------------------------------------
  // Remove Handler
  // ---------------------------------------------------------------------------

  function handleRemoveLogo() {
    setLogoError(null);

    if (logoFileId) {
      onLogoChange(null);
      return;
    }

    onLogoRemove(true);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <section className="space-y-4">
      <Field>
        <FieldLabel>Category Logo</FieldLabel>
        {!logoRemoved && (
          <>
            {logoPreview || logoUrl ? (
              <div className="relative flex min-h-40 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoPreview ?? logoUrl!}
                  alt="Exam category logo preview"
                  className="h-28 w-full object-contain"
                />

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  disabled={disabled}
                  onClick={handleRemoveLogo}
                  className="absolute right-2 top-2"
                  aria-label="Remove category logo"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="exam-category-logo"
                className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-muted/30 transition hover:bg-muted/60"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />

                <span className="text-sm font-medium">
                  Select Category Logo
                </span>

                <span className="text-xs text-muted-foreground">
                  Click to browse
                </span>
              </label>
            )}
          </>
        )}

        {/* Removed State */}

        {logoRemoved && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />

            <p className="text-sm text-muted-foreground">
              Category logo removed
            </p>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onLogoRemove(false)}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              Undo
            </Button>
          </div>
        )}

        {/* File Input */}

        <Input
          id="exam-category-logo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={handleLogoChange}
        />

        {/* Validation Error */}

        {logoError && (
          <p className="text-sm text-destructive" role="alert">
            {logoError}
          </p>
        )}

        {/* Remove Selected File */}

        {logoFileId && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onLogoChange(null)}
          >
            Remove selected file
          </Button>
        )}
      </Field>
    </section>
  );
}
