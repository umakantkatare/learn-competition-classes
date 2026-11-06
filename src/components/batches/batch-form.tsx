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
import {
  createBatchSchema,
  type CreateBatchInput,
} from "@/validations/academic/batch-validations";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Loader2, Plus } from "lucide-react";

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
  subject?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function extractList<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const result = response as Record<string, unknown>;

  if (Array.isArray(result.data)) {
    return result.data as T[];
  }

  if (Array.isArray(result.items)) {
    return result.items as T[];
  }

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

    thumbnail: initialData?.thumbnail ?? "",
    previewVideo: initialData?.previewVideo ?? "",

    originalPrice: initialData ? Number(initialData.originalPrice) : 0,

    discountPrice: initialData ? Number(initialData.discountPrice) : 0,

    isFree: initialData?.isFree ?? false,

    startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : "",

    expiryDate: initialData?.expiryDate
      ? initialData.expiryDate.slice(0, 10)
      : "",

    validityMonths: initialData?.validityMonths ?? 12,

    medium: initialData?.medium ?? "HINGLISH",
    status: initialData?.status ?? "UPCOMING",
    isPublished: initialData?.isPublished ?? false,

    teacherIds: initialData?.teachers?.map((item) => item.teacherId) ?? [],
  };
}

function buildBatchPayload(values: BatchFormValues) {
  return {
    examinationId: values.examinationId,
    title: values.title,
    slug: values.slug,
    description: values.description,

    thumbnail: values.thumbnail || undefined,
    previewVideo: values.previewVideo || undefined,

    originalPrice: values.isFree ? 0 : values.originalPrice,

    discountPrice: values.isFree ? 0 : values.discountPrice,

    isFree: values.isFree,

    startDate: values.startDate,
    expiryDate: values.expiryDate,
    validityMonths: values.validityMonths,

    medium: values.medium,
    status: values.status,
    isPublished: values.isPublished,

    teacherIds: values.teacherIds ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function BatchForm({
  initialData,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
  onSuccessCallback,
}: BatchFormProps) {
  const [internalOpen, setInternalOpen] = useState(false);

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

  const form = useForm<BatchFormValues, unknown, BatchFormOutput>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const isFree = form.watch("isFree");

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(initialData));
    }
  }, [open, initialData, form]);

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      form.reset(getDefaultValues(initialData));
    }
  }

  async function onSubmit(values: BatchFormOutput) {
    const payload = {
      ...values,
      startDate: values.startDate.toISOString(),
      expiryDate: values.expiryDate?.toISOString() ?? null,
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
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Examination</FieldLabel>

                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select examination" />
                  </SelectTrigger>

                  <SelectContent>
                    {examinations.map((examination) => (
                      <SelectItem key={examination.id} value={examination.id}>
                        {examination.title ??
                          examination.name ??
                          examination.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
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
                      value={field.value ?? ""}
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
                      value={field.value ?? ""}
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
            <h3 className="text-sm font-semibold">Batch Schedule</h3>

            <div className="grid gap-4 sm:grid-cols-2">
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
                      value={field.value ?? ""}
                    />

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

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
                      {...field}
                      value={field.value ?? ""}
                    />

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
                name="medium"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Medium</FieldLabel>

                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ENGLISH">English</SelectItem>
                        <SelectItem value="HINDI">Hindi</SelectItem>
                        <SelectItem value="HINGLISH">Hinglish</SelectItem>
                      </SelectContent>
                    </Select>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
          </section>

          {/* Status */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold">Batch Status</h3>

            <Controller
              control={form.control}
              name="status"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Status</FieldLabel>

                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>

                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

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
                      {teachers.length > 0 ? (
                        <div className="space-y-3">
                          {teachers.map((teacher) => {
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
                                    {teacher.user?.name ?? "Unnamed Teacher"}
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    {teacher.subject ??
                                      teacher.user?.email ??
                                      "No subject specified"}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                          {teacherQuery.isLoading
                            ? "Loading teachers..."
                            : "No teachers found."}
                        </p>
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
