"use client";

import { useEffect, useRef, useState } from "react";
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
  iconUrl?: string | null;
  isActive: boolean;
};

type ExamCategoryPayload = {
  name: string;
  slug: string;
  isActive: boolean;
  iconUrl: string | null;
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
    category?.iconUrl ?? null,
  );
  const [removeExistingIcon, setRemoveExistingIcon] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isBusy = isPending || isUploading;

  const form = useForm<
    CreateExamCategoryInput,
    unknown,
    CreateExamCategoryOutput
  >({
    resolver: zodResolver(createExamCategorySchema),
    defaultValues,
  });

  // Reset form state whenever the dialog opens or the selected category changes.
  useEffect(() => {
    if (!open) return;

    form.reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      isActive: category?.isActive ?? true,
    });

    setSelectedFile(null);
    setFileError(null);
    setPreviewUrl(category?.iconUrl ?? null);
    setRemoveExistingIcon(false);
    setUploadProgress(0);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, category, form]);

  // Create a temporary preview URL for a locally selected file and release it on cleanup.
  useEffect(() => {
    if (!selectedFile) return;

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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

    setSelectedFile(file);
    setRemoveExistingIcon(false);
    setUploadProgress(0);
  }

  function handleRemoveImage() {
    setSelectedFile(null);
    setFileError(null);
    setPreviewUrl(null);
    setRemoveExistingIcon(true);
    setUploadProgress(0);

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(values: CreateExamCategoryOutput) {
    if (fileError || isBusy) return;

    setIsUploading(Boolean(selectedFile));
    setUploadProgress(0);

    try {
      let iconUrl: string | null = category?.iconUrl ?? null;

      if (selectedFile) {
        const uploaded = await uploadFile({
          file: selectedFile,
          folder: "/exam-categories",
          tags: ["exam-category", "icon"],
          onProgress: setUploadProgress,
        });

        iconUrl = uploaded.url!;
      } else if (removeExistingIcon) {
        iconUrl = null;
      }

      const payload: ExamCategoryPayload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        isActive: values.isActive,
        iconUrl,
      };

      // These mutations must send JSON, not FormData.
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

      form.reset(defaultValues);
      setSelectedFile(null);
      setFileError(null);
      setRemoveExistingIcon(false);
      setPreviewUrl(null);
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

  function handleOpenChange(nextOpen: boolean) {
    if (isBusy) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset(defaultValues);
      setSelectedFile(null);
      setFileError(null);
      setPreviewUrl(null);
      setRemoveExistingIcon(false);
      setUploadProgress(0);

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

          <Field data-invalid={Boolean(fileError)}>
            <FieldLabel>Category Icon</FieldLabel>

            <div className="space-y-3">
              {previewUrl ? (
                <div className="relative flex min-h-36 items-center justify-center rounded-lg border border-dashed bg-muted/30 p-4">
                  {/* Plain img supports local object URLs and remote ImageKit URLs. */}
                  <img
                    src={previewUrl}
                    alt="Category icon preview"
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
                    PNG, JPG, WEBP, or SVG · Maximum 2 MB
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
                      style={{ width: `${uploadProgress}%` }}
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
