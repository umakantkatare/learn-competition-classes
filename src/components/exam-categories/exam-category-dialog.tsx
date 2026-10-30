"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

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

type ExamCategory = {
  id: string;
  name: string;
  slug: string;
  iconUrl?: string | null;
  isActive: boolean;
};

interface ExamCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: ExamCategory | null;
}

const defaultValues: CreateExamCategoryInput = {
  name: "",
  slug: "",
  iconUrl: null,
  isActive: true,
};

export function ExamCategoryDialog({
  open,
  onOpenChange,
  category,
}: ExamCategoryDialogProps) {
  const isEditing = Boolean(category);

  const createMutation = useCreateExamCategory();
  const updateMutation = useUpdateExamCategory();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<
    CreateExamCategoryInput,
    unknown,
    CreateExamCategoryOutput
  >({
    resolver: zodResolver(createExamCategorySchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      iconUrl: category?.iconUrl ?? null,
      isActive: category?.isActive ?? true,
    });
  }, [open, category, form]);

  async function onSubmit(values: CreateExamCategoryOutput) {
    const formData = new FormData();

    formData.set("name", values.name.trim());
    formData.set("slug", values.slug.trim());
    formData.set("isActive", String(values.isActive));

    if (values.iconUrl) {
      formData.set("iconUrl", values.iconUrl.trim());
    }

    try {
      if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          formData,
        });

        toast.success("Exam category updated successfully.");
      } else {
        await createMutation.mutateAsync(formData);

        toast.success("Exam category created successfully.");
      }

      form.reset(defaultValues);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset(defaultValues);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Exam Category" : "Create Exam Category"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the exam category details below."
              : "Add a new exam category to organize examinations."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
          noValidate
        >
          {/* Category Name */}
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Category Name
                  <span className="text-destructive">*</span>
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Government Exams"
                  autoComplete="off"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Slug */}
          <Controller
            control={form.control}
            name="slug"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Slug
                  <span className="text-destructive">*</span>
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. government-exams"
                  autoComplete="off"
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />

                <FieldDescription>
                  A URL-friendly identifier for this category.
                </FieldDescription>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Icon URL */}
          <Controller
            control={form.control}
            name="iconUrl"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Icon URL</FieldLabel>

                <Input
                  id={field.name}
                  type="url"
                  placeholder="https://example.com/icon.svg"
                  value={field.value ?? ""}
                  onChange={(event) =>
                    field.onChange(event.target.value || null)
                  }
                  onBlur={field.onBlur}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                />

                <FieldDescription>
                  Optional. Enter a valid URL for the category icon.
                </FieldDescription>

                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
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
                    disabled={isPending}
                  />
                </div>
              </Field>
            )}
          />

          {/* Actions */}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
