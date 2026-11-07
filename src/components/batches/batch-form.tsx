"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";

import {
  useCreateBatch,
  useUpdateBatch,
  type Batch,
} from "@/hooks/academic/use-batches";
import { useGetAllExaminations } from "@/hooks/academic/use-exams";
import { useGetAllTeachers } from "@/hooks/academic/use-teachers";
import { createBatchSchema } from "@/validations/academic/batch-validation";
import { uploadFile, type UploadedFile } from "@/helper/imagekit/upload";
import BatchMediaUpload from "./batch-media-upload";

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

interface UploadProgress {
  thumbnail: number;
  previewVideo: number;
}

function extractList<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== "object") return [];

  const result = response as Record<string, unknown>;
  if (Array.isArray(result.data)) return result.data as T[];
  if (Array.isArray(result.items)) return result.items as T[];
  if (Array.isArray(result.examinations)) return result.examinations as T[];
  if (Array.isArray(result.teachers)) return result.teachers as T[];
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

    thumbnail: initialData?.thumbnail ?? null,
    thumbnailFileId: initialData?.thumbnailFileId ?? null,

    previewVideo: initialData?.previewVideo ?? null,
    previewVideoFileId: initialData?.previewVideoFileId ?? null,

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
  } as BatchFormValues;
}

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

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewVideoFile, setPreviewVideoFile] = useState<File | null>(null);
  const [thumbnailRemoved, setThumbnailRemoved] = useState(false);
  const [previewVideoRemoved, setPreviewVideoRemoved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    thumbnail: 0,
    previewVideo: 0,
  });
  const [isUploading, setIsUploading] = useState(false);

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
  const isBusy = isPending || isUploading;

  const form = useForm<BatchFormValues, unknown, BatchFormOutput>({
    resolver: zodResolver(createBatchSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const title = form.watch("title");
  const previousTitle = useRef(initialData?.title ?? "");
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
    if (title === previousTitle.current) return;
    previousTitle.current = title;
    form.setValue("slug", generateSlug(title ?? ""), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [title, form]);

  useEffect(() => {
    if (!open) return;
    form.reset(getDefaultValues(initialData));
    previousTitle.current = initialData?.title ?? "";
    setFeatureInput("");
    setThumbnailFile(null);
    setPreviewVideoFile(null);
    setThumbnailRemoved(false);
    setPreviewVideoRemoved(false);
    setUploadProgress({ thumbnail: 0, previewVideo: 0 });
  }, [open, initialData, form]);

  function resetMediaState() {
    setThumbnailFile(null);
    setPreviewVideoFile(null);
    setThumbnailRemoved(false);
    setPreviewVideoRemoved(false);
    setUploadProgress({ thumbnail: 0, previewVideo: 0 });
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      form.reset(getDefaultValues(initialData));
      previousTitle.current = initialData?.title ?? "";
      setFeatureInput("");
      resetMediaState();
    }
  }

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
      features.filter((_, itemIndex) => itemIndex !== index),
      { shouldDirty: true, shouldValidate: true },
    );
  }

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

  async function onSubmit(values: BatchFormOutput) {
    setIsUploading(true);

    setUploadProgress({
      thumbnail: 0,
      previewVideo: 0,
    });

    try {
      let thumbnail = thumbnailRemoved ? null : (values.thumbnail ?? null);
      let thumbnailFileId = thumbnailRemoved
        ? null
        : (values.thumbnailFileId ?? null);
      let previewVideo = previewVideoRemoved
        ? null
        : (values.previewVideo ?? null);
      let previewVideoFileId = previewVideoRemoved
        ? null
        : (values.previewVideoFileId ?? null);

      if (thumbnailFile) {
        const uploadedThumbnail = await uploadFile({
          file: thumbnailFile,
          fileName: thumbnailFile.name,
          folder: "batches/thumbnails",
          tags: ["batch", "thumbnail"],
          onProgress: (progress) => {
            setUploadProgress((current) => ({
              ...current,
              thumbnail: Math.round(progress),
            }));
          },
        });

        if (!uploadedThumbnail.url || !uploadedThumbnail.fileId) {
          throw new Error("Thumbnail upload failed.");
        }

        thumbnail = uploadedThumbnail.url;
        thumbnailFileId = uploadedThumbnail.fileId;
      }

      if (previewVideoFile) {
        const uploadedVideo = await uploadFile({
          file: previewVideoFile,
          fileName: previewVideoFile.name,
          folder: "batches/previews",
          tags: ["batch", "preview-video"],
          onProgress: (progress) => {
            setUploadProgress((current) => ({
              ...current,
              previewVideo: Math.round(progress),
            }));
          },
        });

        if (!uploadedVideo.url || !uploadedVideo.fileId) {
          throw new Error("Preview video upload failed.");
        }

        previewVideo = uploadedVideo.url;
        previewVideoFileId = uploadedVideo.fileId;
      }

      const payload = {
        ...values,
        thumbnail,
        thumbnailFileId,
        previewVideo,
        previewVideoFileId,
        features: values.features ?? [],
        expiryDate: values.expiryDate ? String(values.expiryDate) : null,
        validityMonths: values.validityMonths ?? null,
      };

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
    } catch (error) {
      console.error("Batch submission failed:", error);
    } finally {
      setIsUploading(false);
    }
  }

  const mediumOptions = {
    ENGLISH: "English",
    HINDI: "Hindi",
    HINGLISH: "Hinglish",
  } as const;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <div className="mb-5 flex justify-end">
          <DialogTrigger
            render={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            }
          />
        </div>
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
          <Controller
            control={form.control}
            name="examinationId"
            render={({ field, fieldState }) => {
              const selected = examinations.find(
                (item) => item.id === field.value,
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
                          className="w-full justify-between font-normal"
                        >
                          <span className="truncate">
                            {selected?.title ??
                              selected?.name ??
                              "Select examination"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent
                      className="w-[var(--anchor-width)] p-0"
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
                              {examinations.map((item) => {
                                const label =
                                  item.title ?? item.name ?? item.id;
                                return (
                                  <CommandItem
                                    key={item.id}
                                    value={label}
                                    onSelect={() => {
                                      field.onChange(item.id);
                                      setExaminationOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${field.value === item.id ? "opacity-100" : "opacity-0"}`}
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
                      {...field}
                      readOnly
                      className="bg-muted"
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
                    {...field}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </section>

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

          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Media</h3>
              <p className="text-sm text-muted-foreground">
                Upload a batch thumbnail and an optional preview video.
              </p>
            </div>
            <BatchMediaUpload
              thumbnailFile={thumbnailFile}
              previewVideoFile={previewVideoFile}
              thumbnailUrl={initialData?.thumbnail ?? null}
              previewVideoUrl={initialData?.previewVideo ?? null}
              thumbnailRemoved={thumbnailRemoved}
              previewVideoRemoved={previewVideoRemoved}
              onThumbnailChange={setThumbnailFile}
              onPreviewVideoChange={setPreviewVideoFile}
              onThumbnailRemove={setThumbnailRemoved}
              onPreviewVideoRemove={setPreviewVideoRemoved}
              disabled={isBusy}
            />
            {isUploading && (thumbnailFile || previewVideoFile) && (
              <div className="space-y-2 rounded-md border p-3 text-sm">
                {thumbnailFile && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Thumbnail upload</span>
                      <span>{uploadProgress.thumbnail}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${uploadProgress.thumbnail}%` }}
                      />
                    </div>
                  </div>
                )}
                {previewVideoFile && (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Preview video upload</span>
                      <span>{uploadProgress.previewVideo}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${uploadProgress.previewVideo}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

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
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="expiryDate">Expiry Date</FieldLabel>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={String(expiryDate ?? "")}
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
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="validityMonths">
                      Validity (Months)
                    </FieldLabel>
                    <Input
                      id="validityMonths"
                      type="number"
                      min="1"
                      placeholder="12"
                      value={String(validityMonths ?? "")}
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
                          className="w-full justify-between font-normal"
                        >
                          {mediumOptions[
                            field.value as keyof typeof mediumOptions
                          ] ?? "Select medium"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      }
                    />
                    <PopoverContent
                      className="w-[var(--anchor-width)] p-0"
                      align="start"
                    >
                      <Command>
                        <CommandInput placeholder="Search medium..." />
                        <CommandList>
                          <CommandEmpty>No medium found.</CommandEmpty>
                          <CommandGroup>
                            {Object.entries(mediumOptions).map(
                              ([value, label]) => (
                                <CommandItem
                                  key={value}
                                  value={label}
                                  onSelect={() => {
                                    field.onChange(value);
                                    setMediumOpen(false);
                                  }}
                                >
                                  <Check
                                    className={`mr-2 h-4 w-4 ${field.value === value ? "opacity-100" : "opacity-0"}`}
                                  />
                                  {label}
                                </CommandItem>
                              ),
                            )}
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
                                onCheckedChange={(value) =>
                                  field.onChange(
                                    value
                                      ? [...selectedIds, teacher.id]
                                      : selectedIds.filter(
                                          (id) => id !== teacher.id,
                                        ),
                                  )
                                }
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

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading
                ? "Uploading media..."
                : isEditing
                  ? "Update Batch"
                  : "Create Batch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
