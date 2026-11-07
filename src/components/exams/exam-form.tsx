"use client";

import { useEffect, useState } from "react";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Loader2,
  Plus,
  Pencil,
  GraduationCap,
} from "lucide-react";

// Hooks
import {
  useCreateExamination,
  useUpdateExamination,
} from "@/hooks/academic/use-exams";

import { useGetExamCategories } from "@/hooks/academic/use-exam-categories";

// Validation
import { createExaminationSchema } from "@/validations/academic/examination-validations";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Check, ChevronsUpDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

// --------------------------------------------------
// Types
// --------------------------------------------------

type ExamFormValues = z.input<typeof createExaminationSchema>;

interface ExamFormProps {
  initialData?: ExamFormValues & {
    id: string;
  };

  onSuccessCallback?: () => void;

  open?: boolean;

  onOpenChange?: (open: boolean) => void;

  hideTrigger?: boolean;
}

type ExamCategory = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

// --------------------------------------------------
// Default Values
// --------------------------------------------------

const getDefaultValues = (
  initialData?: ExamFormProps["initialData"],
): ExamFormValues => ({
  categoryId: initialData?.categoryId ?? "",
  name: initialData?.name ?? "",
  slug: initialData?.slug ?? "",
  isActive: initialData?.isActive ?? true,
});

// --------------------------------------------------
// Slug Generator
// --------------------------------------------------

function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function ExamForm({
  initialData,
  onSuccessCallback,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: ExamFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : internalOpen;

  // Edit Mode

  const isEditing = Boolean(initialData);

  // Slug Management

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(
    Boolean(initialData?.slug),
  );

  // --------------------------------------------------
  // Mutations
  // --------------------------------------------------

  const createExaminationMutation = useCreateExamination();
  const updateExaminationMutation = useUpdateExamination();

  const isPending =
    createExaminationMutation.isPending || updateExaminationMutation.isPending;

  // --------------------------------------------------
  // Fetch Active Exam Categories
  // --------------------------------------------------

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetExamCategories(true);

  const examCategories = (categories ?? []) as ExamCategory[];

  // --------------------------------------------------
  // React Hook Form
  // --------------------------------------------------

  const form = useForm<ExamFormValues>({
    resolver: zodResolver(createExaminationSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const examName = form.watch("name");

  // --------------------------------------------------
  // Reset Form
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    form.reset(getDefaultValues(initialData));

    setIsSlugManuallyEdited(Boolean(initialData?.slug));
  }, [initialData, open, form]);

  // --------------------------------------------------
  // Auto Generate Slug
  // --------------------------------------------------

  useEffect(() => {
    if (isSlugManuallyEdited || isEditing) return;

    form.setValue("slug", generateSlug(examName ?? ""), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [examName, isSlugManuallyEdited, isEditing, form]);

  // --------------------------------------------------
  // Submit Form
  // --------------------------------------------------

  async function onSubmit(values: ExamFormValues) {
    try {
      if (isEditing && initialData) {
        const result = await updateExaminationMutation.mutateAsync({
          id: initialData.id,
          payload: values,
        });

        if (!result) {
          throw new Error("Failed to update examination.");
        }

        toast.success("Examination updated successfully.");
      } else {
        const result = await createExaminationMutation.mutateAsync(values);

        if (!result) {
          throw new Error("Failed to create examination.");
        }

        toast.success("Examination created successfully.");
      }

      handleOpenChange(false);
      onSuccessCallback?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save examination. Please try again.",
      );
    }
  }

  // --------------------------------------------------
  // Dialog Actions
  // --------------------------------------------------

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return;

    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      form.reset(getDefaultValues(initialData));
      setIsSlugManuallyEdited(Boolean(initialData?.slug));
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger */}

      {!hideTrigger && (
        <div className="mb-5 flex justify-end">
          <DialogTrigger
            render={
              <Button>
                {isEditing ? (
                  <>
                    <Pencil className="mr-2 size-4" />
                    Edit Exam
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Create Exam
                  </>
                )}
              </Button>
            }
          />
        </div>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        {/* Header */}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEditing ? (
                <Pencil className="size-4" />
              ) : (
                <GraduationCap className="size-4" />
              )}
            </span>

            {isEditing ? "Edit Exam" : "Create Exam"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the examination category, name, slug and status."
              : "Enter the details below to create a new examination."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 border-t pt-6"
          noValidate
        >
          {/* ====================================== */}
          {/* Exam Information */}
          {/* ====================================== */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <h3 className="text-sm font-semibold">Exam Information</h3>
            </div>

            {/* Exam Category */}

            <Controller
              control={form.control}
              name="categoryId"
              render={({ field, fieldState }) => {
                const selectedCategory = examCategories.find(
                  (category) => category.id === field.value,
                );

                const activeCategories = examCategories.filter(
                  (category) => category.isActive,
                );

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="categoryId">
                      Exam Category *
                    </FieldLabel>

                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                      <PopoverTrigger
                        render={
                          <Button
                            id="categoryId"
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={categoryOpen}
                            aria-invalid={fieldState.invalid}
                            disabled={
                              isPending ||
                              isCategoriesLoading ||
                              isCategoriesError ||
                              activeCategories.length === 0
                            }
                            className="w-full justify-between font-normal"
                          >
                            <span className="truncate">
                              {isCategoriesLoading
                                ? "Loading categories..."
                                : isCategoriesError
                                  ? "Unable to load categories"
                                  : (selectedCategory?.name ??
                                    "Select exam category")}
                            </span>

                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                          </Button>
                        }
                      />

                      <PopoverContent
                        align="start"
                        side="bottom"
                        sideOffset={4}
                        className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] p-0"
                      >
                        <Command>
                          <CommandInput placeholder="Search exam category..." />

                          <CommandList className="max-h-56 overflow-y-auto">
                            <CommandEmpty>No exam category found.</CommandEmpty>

                            <CommandGroup>
                              {activeCategories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={`${category.name} ${category.slug}`}
                                  onSelect={() => {
                                    field.onChange(category.id);
                                    setCategoryOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <span className="flex-1 truncate">
                                    {category.name}
                                  </span>

                                  <Check
                                    className={`ml-auto size-4 ${
                                      field.value === category.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    }`}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}

                    {!isCategoriesLoading &&
                      !isCategoriesError &&
                      activeCategories.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No active exam categories available. Create an active
                          category first.
                        </p>
                      )}
                  </Field>
                );
              }}
            />

            {/* Exam Name */}

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Exam Name *</FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    placeholder="e.g. SSC CGL"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Exam Slug */}

            <Controller
              control={form.control}
              name="slug"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="slug">Exam Slug *</FieldLabel>

                  <Input
                    {...field}
                    id="slug"
                    placeholder="e.g. ssc-cgl"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      setIsSlugManuallyEdited(true);
                      field.onChange(generateSlug(event.target.value));
                    }}
                  />

                  <p className="text-xs text-muted-foreground">
                    Automatically generated from exam name. You can edit it
                    manually.
                  </p>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </section>

          {/* ====================================== */}
          {/* Exam Status */}
          {/* ====================================== */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <h3 className="text-sm font-semibold">Exam Status</h3>
            </div>

            {/* Is Active */}

            <Controller
              control={form.control}
              name="isActive"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FieldLabel htmlFor="isActive">Is Active</FieldLabel>

                      <p className="text-xs text-muted-foreground">
                        {field.value
                          ? "This exam is currently active."
                          : "This exam is currently inactive."}
                      </p>
                    </div>

                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </div>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </section>

          {/* ====================================== */}
          {/* Form Actions */}
          {/* ====================================== */}

          <DialogFooter className="gap-2 border-t pt-4 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Exam"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
