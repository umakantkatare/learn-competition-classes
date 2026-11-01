"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

import {
  useCreateExamCategory,
  useUpdateExamCategory,
} from "@/hooks/academic/use-exam-categories";

import {
  createExamCategorySchema,
  type CreateExamCategoryInput,
  type CreateExamCategoryOutput,
} from "@/validations/academic/exam-category-validation";

import { uploadFile } from "@/helper/imagekit/upload";

type ExamCategory = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
};

type ExamCategoryPayload = {
  name: string;
  slug: string;
  isActive: boolean;
  logo: string | null;
};

interface ExamCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExamCategory | null;
}

const defaultValues: CreateExamCategoryInput = {
  name: "",
  slug: "",
  isActive: true,
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

export function ExamCategoryDialog({
  open,
  onOpenChange,
  category,
}: ExamCategoryDialogProps) {
  const isEditing = Boolean(category);

  const createMutation = useCreateExamCategory();
  const updateMutation = useUpdateExamCategory();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    category?.logo ?? null,
  );

  const [removeExistingIcon, setRemoveExistingIcon] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const isBusy = isPending || isUploading;

  const form = useForm<
    CreateExamCategoryInput,
    unknown,
    CreateExamCategoryOutput
  >({
    resolver: zodResolver(createExamCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      isActive: category?.isActive ?? true,
    },
  });

  /**
   * Releases a temporary browser object URL.
   * Remote ImageKit URLs must not be revoked.
   */
  function releaseObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  /**
   * Cleanup only: no synchronous state updates inside this effect.
   */
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  /**
   * Reset the form when opening or closing the dialog.
   * This runs in an event handler, not in an effect.
   */
  function resetForm() {
    releaseObjectUrl();

    form.reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      isActive: category?.isActive ?? true,
    });

    setSelectedFile(null);
    setFileError(null);
    setPreviewUrl(category?.logo ?? null);
    setRemoveExistingIcon(false);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /**
   * Validate the selected image and generate its preview.
   */
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) return;

    setFileError(null);

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setFileError("Choose a PNG, JPG, WEBP, or SVG image.");

      event.currentTarget.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("Image size must not exceed 5 MB.");

      event.currentTarget.value = "";
      return;
    }

    releaseObjectUrl();

    const objectUrl = URL.createObjectURL(file);

    objectUrlRef.current = objectUrl;

    setSelectedFile(file);
    setPreviewUrl(objectUrl);
    setRemoveExistingIcon(false);
    setUploadProgress(0);
  }

  /**
   * Remove the selected image or existing category icon.
   */
  function handleRemoveImage() {
    releaseObjectUrl();

    setSelectedFile(null);
    setFileError(null);
    setPreviewUrl(null);
    setRemoveExistingIcon(true);
    setUploadProgress(0);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /**
   * Create or update an exam category.
   */
  async function onSubmit(values: CreateExamCategoryOutput) {
    if (fileError || isBusy) return;

    setIsUploading(Boolean(selectedFile));
    setUploadProgress(0);

    try {
      let logo: string | null = category?.logo ?? null;

      if (selectedFile) {
        const uploaded = await uploadFile({
          file: selectedFile,
          folder: "/exam-categories",
          tags: ["exam-category", "icon"],
          onProgress: setUploadProgress,
        });

        if (!uploaded.url) {
          throw new Error("Image upload failed. Please try again.");
        }

        logo = uploaded.url;
      } else if (removeExistingIcon) {
        logo = null;
      }

      const payload: ExamCategoryPayload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        isActive: values.isActive,
        logo,
      };

      // Mutations send JSON, not FormData.
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          data: payload,
        });

        toast.success("Exam category updated successfully.");
      } else {
        await createMutation.mutateAsync(payload);

        toast.success("Exam category created successfully.");
      }

      resetForm();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  /**
   * Handle opening and closing through the dialog UI.
   */
  function handleOpenChange(nextOpen: boolean) {
    if (isBusy) return;

    resetForm();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Exam Category" : "Create Exam Category"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the exam category details and icon."
              : "Add a new exam category with its name, slug, and optional icon."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          {/* Category name */}
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">
                  Category Name <span className="text-destructive">*</span>
                </FieldLabel>

                <Input
                  {...field}
                  id="name"
                  placeholder="e.g. Government Exams"
                  autoComplete="off"
                  disabled={isBusy}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Category slug */}
          <Controller
            control={form.control}
            name="slug"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </FieldLabel>

                <Input
                  {...field}
                  id="slug"
                  placeholder="e.g. government-exams"
                  autoComplete="off"
                  disabled={isBusy}
                  aria-invalid={fieldState.invalid}
                />

                <FieldDescription>
                  A URL-friendly identifier for this category.
                </FieldDescription>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Category icon */}
          <Field data-invalid={Boolean(fileError)}>
            <FieldLabel>Category Icon</FieldLabel>

            <div className="space-y-3">
              {previewUrl ? (
                <div className="relative flex min-h-36 items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4">
                  <Image
                    src={previewUrl}
                    alt="Category icon preview"
                    width={96}
                    height={96}
                    unoptimized
                    className="h-24 w-24 rounded-md object-contain"
                  />

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-8 w-8"
                    onClick={handleRemoveImage}
                    disabled={isBusy}
                    aria-label="Remove category icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isBusy}
                  className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/20 p-6 text-center transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="rounded-full bg-background p-3 shadow-sm">
                    <ImagePlus className="h-6 w-6" />
                  </span>

                  <span className="text-sm font-medium">
                    Click to upload an icon
                  </span>

                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP, or SVG · Maximum 5 MB
                  </span>
                </button>
              )}

              <Input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                disabled={isBusy}
                onChange={handleFileChange}
                aria-label="Choose category icon"
                aria-invalid={Boolean(fileError)}
              />

              {selectedFile && (
                <p className="break-all text-xs text-muted-foreground">
                  {selectedFile.name} · {(selectedFile.size / 1024).toFixed(1)}{" "}
                  KB
                </p>
              )}

              {isUploading && (
                <div className="space-y-1" role="status" aria-live="polite">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Uploading icon…</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={uploadProgress}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {fileError && (
                <p role="alert" className="text-sm text-destructive">
                  {fileError}
                </p>
              )}

              <FieldDescription>
                {isEditing
                  ? "Choose a new image to replace the existing icon, or remove it to clear the saved icon URL."
                  : "Choose an image to represent this exam category. Image upload is optional."}
              </FieldDescription>
            </div>
          </Field>

          {/* Active status */}
          <Controller
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <Field>
                <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="space-y-1">
                    <FieldLabel htmlFor="isActive">Active Status</FieldLabel>

                    <FieldDescription>
                      {field.value
                        ? "This category is active."
                        : "This category is inactive."}
                    </FieldDescription>
                  </div>

                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isBusy}
                  />
                </div>
              </Field>
            )}
          />

          {/* Form actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isBusy}>
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading…" : "Saving…"}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
