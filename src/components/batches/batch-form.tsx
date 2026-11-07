"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useCreateBatch,
  useUpdateBatch,
  type Batch,
} from "@/hooks/academic/use-batches";
import { useGetAllExaminations } from "@/hooks/academic/use-exams";
import { useGetAllTeachers } from "@/hooks/academic/use-teachers";

import { createBatchSchema } from "@/validations/academic/batch-validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

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

import { ScrollArea } from "@/components/ui/scroll-area";

import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type BatchFormValues = z.input<typeof createBatchSchema>;
type BatchFormOutput = z.output<typeof createBatchSchema>;

interface BatchFormProps {
  initialData?: Batch;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  onSuccessCallback?: () => void;
}

interface ExaminationOption {
  id: string;
  title?: string;
  name?: string;
}

interface TeacherOption {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  experienceYears: number;
  qualification: string;
  bio: string | null;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function extractList<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const result = response as Record<string, unknown>;

  if (Array.isArray(result.data)) return result.data as T[];
  if (Array.isArray(result.items)) return result.items as T[];
  if (Array.isArray(result.examinations)) {
    return result.examinations as T[];
  }
  if (Array.isArray(result.teachers)) {
    return result.teachers as T[];
  }

  if (result.data && typeof result.data === "object") {
    return extractList<T>(result.data);
  }

  return [];
}

function getDefaultValues(initialData?: Batch): BatchFormValues {
  return {
    examinationId: initialData?.examinationId ?? "",

    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    description: initialData?.description ?? "",

    features: initialData?.features ?? [],

    thumbnail: initialData?.thumbnail ?? "",
    previewVideo: initialData?.previewVideo ?? "",

    originalPrice: initialData ? Number(initialData.originalPrice) : 0,

    discountPrice: initialData ? Number(initialData.discountPrice) : 0,

    isFree: initialData?.isFree ?? false,

    startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : "",

    expiryDate: initialData?.expiryDate
      ? initialData.expiryDate.slice(0, 10)
      : "",

    validityMonths: initialData?.validityMonths ?? null,

    medium: initialData?.medium ?? "HINGLISH",

    isPublished: initialData?.isPublished ?? false,

    teacherIds: initialData?.teachers?.map((item) => item.teacherId) ?? [],
  };
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function BatchForm({
  initialData,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
  onSuccessCallback,
}: BatchFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const [examinationOpen, setExaminationOpen] = useState(false);
  const [mediumOpen, setMediumOpen] = useState(false);

  const [featureInput, setFeatureInput] = useState("");

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const isEditing = Boolean(initialData);

  const createMutation = useCreateBatch();
  const updateMutation = useUpdateBatch();

  const examinationQuery = useGetAllExaminations();
  const teacherQuery = useGetAllTeachers();

  const examinations = useMemo(
    () => extractList<ExaminationOption>(examinationQuery.data),
    [examinationQuery.data],
  );

  const teachers = useMemo(
    () => extractList<TeacherOption>(teacherQuery.data),
    [teacherQuery.data],
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  const mediumOptions = {
    ENGLISH: "English",
    HINDI: "Hindi",
    HINGLISH: "Hinglish",
  } as const;

  const form = useForm<BatchFormValues, unknown, BatchFormOutput>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const isFree = form.watch("isFree");
  const features = form.watch("features") ?? [];

  const expiryDate = form.watch("expiryDate");
  const validityMonths = form.watch("validityMonths");

  const hasExpiryDate = Boolean(expiryDate);
  const hasValidityMonths =
    validityMonths !== null &&
    validityMonths !== undefined &&
    validityMonths !== "";

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(initialData));
      setFeatureInput("");
    }
  }, [open, initialData, form]);

  // ---------------------------------------------------------------------------
  // Dialog
  // ---------------------------------------------------------------------------

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      form.reset(getDefaultValues(initialData));
      setFeatureInput("");
    }
  }

  // ---------------------------------------------------------------------------
  // Feature Handlers
  // ---------------------------------------------------------------------------

  function addFeature() {
    const value = featureInput.trim();

    if (!value) return;

    if (
      features.some((feature) => feature.toLowerCase() === value.toLowerCase())
    ) {
      form.setError("features", {
        type: "manual",
        message: "This feature has already been added.",
      });
      return;
    }

    if (value.length > 150) {
      form.setError("features", {
        type: "manual",
        message: "Feature must not exceed 150 characters.",
      });
      return;
    }

    form.setValue("features", [...features, value], {
      shouldDirty: true,
      shouldValidate: true,
    });

    form.clearErrors("features");
    setFeatureInput("");
  }

  function removeFeature(index: number) {
    form.setValue(
      "features",
      features.filter((_, i) => i !== index),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Schedule Handlers
  // ---------------------------------------------------------------------------

  function handleExpiryDateChange(value: string) {
    form.setValue("expiryDate", value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value) {
      form.setValue("validityMonths", null, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  function handleValidityChange(value: string) {
    form.setValue("validityMonths", value === "" ? null : Number(value), {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value !== "") {
      form.setValue("expiryDate", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function onSubmit(values: BatchFormOutput) {
    const payload = {
      ...values,

      // Ensure empty features are stored as an empty array.
      features: values.features ?? [],

      // Preserve mutually exclusive schedule fields.
      expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,

      validityMonths: values.validityMonths ?? null,
    };

    try {
      if (isEditing && initialData) {
        const response = await updateMutation.mutateAsync({
          id: initialData.id,
          formData: payload,
        });

        if (!response.success) return;
      } else {
        const response = await createMutation.mutateAsync(payload);

        if (!response.success) return;
      }

      handleOpenChange(false);
      onSuccessCallback?.();
    } catch {
      // Mutation hooks handle errors.
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger
          render={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Batch
            </Button>
          }
        />
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update Batch" : "Create Batch"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the batch details and assigned teachers."
              : "Create a new batch and configure its details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Examination */}

          <Controller
            control={form.control}
            name="examinationId"
            render={({ field, fieldState }) => {
              const selectedExamination = examinations.find(
                (examination) => examination.id === field.value,
              );

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Examination</FieldLabel>

                  <Popover
                    open={examinationOpen}
                    onOpenChange={setExaminationOpen}
                  >
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={examinationOpen}
                          aria-invalid={fieldState.invalid}
                          className="w-full justify-between font-normal"
                        >
                          <span className="truncate">
                            {selectedExamination
                              ? (selectedExamination.title ??
                                selectedExamination.name ??
                                selectedExamination.id)
                              : "Select examination"}
                          </span>

                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />

                    <PopoverContent
                      className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search examination..." />

                        <CommandList>
                          {examinationQuery.isLoading ? (
                            <CommandEmpty>Loading examinations...</CommandEmpty>
                          ) : examinations.length === 0 ? (
                            <CommandEmpty>No examination found.</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {examinations.map((examination) => {
                                const label =
                                  examination.title ??
                                  examination.name ??
                                  examination.id;

                                const isSelected =
                                  field.value === examination.id;

                                return (
                                  <CommandItem
                                    key={examination.id}
                                    value={label}
                                    onSelect={() => {
                                      field.onChange(examination.id);
                                      setExaminationOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        isSelected ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {label}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FieldError errors={[fieldState.error]} />
                </Field>
              );
            }}
          />

          {/* Basic Information */}

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="title"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="title">Batch Title</FieldLabel>

                    <Input
                      id="title"
                      placeholder="e.g. SSC CGL 2027 Batch"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="slug">Slug</FieldLabel>

                    <Input
                      id="slug"
                      placeholder="ssc-cgl-2027-batch"
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="description">Description</FieldLabel>

                  <Textarea
                    id="description"
                    placeholder="Enter batch description"
                    rows={4}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </section>

          {/* Batch Features */}

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Batch Features</h3>

              <p className="text-sm text-muted-foreground">
                Add the key benefits and facilities included in this batch.
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                value={featureInput}
                onChange={(event) => setFeatureInput(event.target.value)}
                placeholder="e.g. Live classes, mock tests, study material"
                maxLength={150}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addFeature();
                  }
                }}
              />

              <Button
                type="button"
                variant="outline"
                onClick={addFeature}
                disabled={!featureInput.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm"
                  >
                    <span>{feature}</span>

                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${feature}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <FieldError errors={[form.formState.errors.features]} />
          </section>

          {/* Media */}

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Media</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="thumbnail"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="thumbnail">Thumbnail URL</FieldLabel>

                    <Input
                      id="thumbnail"
                      placeholder="https://example.com/image.jpg"
                      aria-invalid={fieldState.invalid}
                      {...field}
                      value={typeof field.value === "string" ? field.value : ""}
                    />

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="previewVideo"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="previewVideo">
                      Preview Video URL
                    </FieldLabel>

                    <Input
                      id="previewVideo"
                      placeholder="https://example.com/video"
                      aria-invalid={fieldState.invalid}
                      {...field}
                      value={typeof field.value === "string" ? field.value : ""}
                    />

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </section>

          {/* Pricing */}

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Pricing</h3>

            <Controller
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <FieldLabel>Free Batch</FieldLabel>

                    <FieldDescription>
                      Allow students to access this batch without payment.
                    </FieldDescription>
                  </div>

                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);

                      if (checked) {
                        form.setValue("originalPrice", 0);
                        form.setValue("discountPrice", 0);
                      }
                    }}
                  />
                </Field>
              )}
            />

            {!isFree && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="originalPrice"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="originalPrice">
                        Original Price (₹)
                      </FieldLabel>

                      <Input
                        id="originalPrice"
                        type="number"
                        min="0"
                        placeholder="4999"
                        aria-invalid={fieldState.invalid}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? ""
                              : Number(event.target.value),
                          )
                        }
                      />

                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="discountPrice"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="discountPrice">
                        Discount Price (₹)
                      </FieldLabel>

                      <Input
                        id="discountPrice"
                        type="number"
                        min="0"
                        placeholder="2999"
                        aria-invalid={fieldState.invalid}
                        value={field.value ?? ""}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value === ""
                              ? ""
                              : Number(event.target.value),
                          )
                        }
                      />

                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            )}
          </section>

          {/* Schedule */}

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Batch Schedule</h3>

              <p className="text-sm text-muted-foreground">
                Choose either a fixed expiry date or a validity duration.
              </p>
            </div>

            <Controller
              control={form.control}
              name="startDate"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="startDate">Start Date</FieldLabel>

                  <Input
                    id="startDate"
                    type="date"
                    aria-invalid={fieldState.invalid}
                    {...field}
                    value={String(field.value ?? "")}
                  />

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="expiryDate"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="expiryDate">Expiry Date</FieldLabel>

                    <Input
                      id="expiryDate"
                      type="date"
                      aria-invalid={fieldState.invalid}
                      value={String(field.value ?? "")}
                      disabled={hasValidityMonths}
                      onChange={(event) =>
                        handleExpiryDateChange(event.target.value)
                      }
                    />

                    <FieldDescription>
                      Use this when the batch has a fixed expiry date.
                    </FieldDescription>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name="validityMonths"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="validityMonths">
                      Validity (Months)
                    </FieldLabel>

                    <Input
                      id="validityMonths"
                      type="number"
                      min="1"
                      placeholder="12"
                      aria-invalid={fieldState.invalid}
                      value={String(field.value ?? "")}
                      disabled={hasExpiryDate}
                      onChange={(event) =>
                        handleValidityChange(event.target.value)
                      }
                    />

                    <FieldDescription>
                      Use this when access is valid for a fixed number of
                      months.
                    </FieldDescription>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            {(hasExpiryDate || hasValidityMonths) && (
              <p className="text-xs text-muted-foreground">
                {hasExpiryDate
                  ? "Fixed expiry date selected. Validity months are disabled."
                  : "Validity duration selected. Expiry date is disabled."}
              </p>
            )}
          </section>

          {/* Medium */}

          <section className="space-y-4">
            <Controller
              control={form.control}
              name="medium"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Medium</FieldLabel>

                  <Popover open={mediumOpen} onOpenChange={setMediumOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={mediumOpen}
                          aria-invalid={fieldState.invalid}
                          className="w-full justify-between font-normal"
                        >
                          {mediumOptions[
                            field.value as keyof typeof mediumOptions
                          ] ?? "Select medium"}

                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      }
                    />

                    <PopoverContent
                      className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search medium..." />

                        <CommandList>
                          <CommandEmpty>No medium found.</CommandEmpty>

                          <CommandGroup>
                            {[
                              { value: "ENGLISH", label: "English" },
                              { value: "HINDI", label: "Hindi" },
                              { value: "HINGLISH", label: "Hinglish" },
                            ].map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  field.onChange(option.value);
                                  setMediumOpen(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    field.value === option.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />

                                {option.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </section>

          {/* Publishing */}

          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Publishing</h3>

            <Controller
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <Field className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <FieldLabel>Publish Batch</FieldLabel>

                    <FieldDescription>
                      Published batches can be visible to students.
                    </FieldDescription>
                  </div>

                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </section>

          {/* Teachers */}

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Assign Teachers</h3>

              <p className="text-sm text-muted-foreground">
                Select one or more teachers for this batch.
              </p>
            </div>

            <Controller
              control={form.control}
              name="teacherIds"
              render={({ field, fieldState }) => {
                const selectedIds: string[] = field.value ?? [];

                return (
                  <Field data-invalid={fieldState.invalid}>
                    <ScrollArea className="h-52 rounded-md border p-3">
                      {teacherQuery.isLoading ? (
                        <p className="p-2 text-sm text-muted-foreground">
                          Loading teachers...
                        </p>
                      ) : teachers.length === 0 ? (
                        <p className="p-2 text-sm text-muted-foreground">
                          No teachers found.
                        </p>
                      ) : (
                        teachers.map((teacher) => {
                          const checked = selectedIds.includes(teacher.id);

                          return (
                            <label
                              key={teacher.id}
                              className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  const nextIds = value
                                    ? [...selectedIds, teacher.id]
                                    : selectedIds.filter(
                                        (id) => id !== teacher.id,
                                      );

                                  field.onChange(nextIds);
                                }}
                              />

                              <div className="min-w-0">
                                <p className="text-sm font-medium">
                                  {teacher.name}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {teacher.subject.replace(/[{}"]/g, " ")}
                                </p>
                              </div>
                            </label>
                          );
                        })
                      )}
                    </ScrollArea>

                    <FieldDescription>
                      {selectedIds.length} teacher(s) selected
                    </FieldDescription>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                );
              }}
            />
          </section>

          {/* Actions */}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

              {isEditing ? "Update Batch" : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
