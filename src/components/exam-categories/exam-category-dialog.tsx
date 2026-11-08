"use client";

import { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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

import ExamCategoryLogoUpload from "./exam-category-logo-upload";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type ExamCategory = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  logoFileId?: string | null;
  isActive: boolean;
};

type ExamCategoryPayload = {
  name: string;
  slug: string;
  isActive: boolean;
  logo: string | null;
  logoFileId: string | null;
};

interface ExamCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExamCategory | null;
}

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const defaultValues: CreateExamCategoryInput = {
  name: "",
  slug: "",
  isActive: true,
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ExamCategoryDialog({
  open,
  onOpenChange,
  category,
}: ExamCategoryDialogProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreateExamCategory();
  const updateMutation = useUpdateExamCategory();

  const isEditing = Boolean(category);
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

  const name = form.watch("name");

  const previousName = useRef(category?.name ?? "");

  useEffect(() => {
    if (name === previousName.current) return;

    previousName.current = name;

    form.setValue("slug", generateSlug(name ?? ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [name, form]);

  function resetMediaState() {
    setLogoFile(null);
    setLogoRemoved(false);
  }

  function resetForm() {
    previousName.current = category?.name ?? "";

    form.reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      isActive: category?.isActive ?? true,
    });

    resetMediaState();
  }

  useEffect(() => {
    if (!open) return;

    resetForm();
  }, [open, category?.id]);

  function handleOpenChange(nextOpen: boolean) {
    if (isBusy) return;

    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  async function onSubmit(values: CreateExamCategoryOutput) {
    if (isBusy) return;

    setIsUploading(true);

    try {
      let logo: string | null = logoRemoved ? null : (category?.logo ?? null);
      let logoFileId: string | null = logoRemoved
        ? null
        : (category?.logoFileId ?? null);

      if (logoFile) {
        const uploadedLogo = await uploadFile({
          file: logoFile,
          fileName: logoFile.name,
          folder: "exam-categories",
          tags: ["exam-category", "logo"],
          // onProgress: (progress) => {
          //   setUploadProgress({
          //     logo: Math.round(progress),
          //   });
          // },
        });

        if (!uploadedLogo.url || !uploadedLogo.fileId) {
          throw new Error("Category logo upload failed.");
        }

        logo = uploadedLogo.url;
        logoFileId = uploadedLogo.fileId;
      }

      // API Payload

      const payload: ExamCategoryPayload = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        isActive: values.isActive,
        logo,
        logoFileId,
      };

      // Update Category

      if (isEditing && category) {
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
      console.error("Exam category submission failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Tags className="size-5 text-primary" />
            </div>

            {isEditing ? "Update Exam Category" : "Create Exam Category"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the category details and logo."
              : "Create a new exam category with its name, slug and logo."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {/* Basic Information */}

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>

            {/* Category Name */}

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Category Name</FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    placeholder="e.g. Teaching"
                    autoComplete="off"
                    disabled={isBusy}
                    aria-invalid={fieldState.invalid}
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {/* Category Slug */}

            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="slug">Category Slug</FieldLabel>

                  <Input
                    {...field}
                    id="slug"
                    placeholder="e.g. teaching"
                    autoComplete="off"
                    readOnly
                    disabled={isBusy}
                    className="bg-muted"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </section>

          {/* Category Media */}

          <ExamCategoryLogoUpload
            logoFileId={logoFile}
            logoUrl={category?.logo ?? null}
            logoRemoved={logoRemoved}
            onLogoChange={setLogoFile}
            onLogoRemove={setLogoRemoved}
            disabled={isBusy}
          />

          {/* Active Status */}

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

          {/* Form Actions */}

          <DialogFooter className="gap-2">
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
                  <Loader2 className="mr-2 size-4 animate-spin" />

                  {isUploading ? "Uploading logo..." : "Saving..."}
                </>
              ) : isEditing ? (
                "Update Category"
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
