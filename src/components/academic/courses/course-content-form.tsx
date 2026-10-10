"use client";

import { useEffect, useTransition } from "react";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";

import {
  createCourseContentAction,
  updateCourseContentAction,
} from "@/actions/academic/content-actions";

import type { CourseContentItem } from "@/services/academic/course-content/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const formSchema = z
  .object({
    courseId: z.string().min(1, "Course is required"),
    title: z.string().trim().min(1, "Title is required").max(200),
    description: z.string().max(5000).nullable(),
    type: z.enum(["VIDEO", "PDF", "TEST"]),
    videoId: z.string().nullable(),
    fileUrl: z
      .union([z.string().url("Enter a valid PDF URL"), z.literal("")])
      .nullable(),
    thumbnail: z
      .union([z.string().url("Enter a valid thumbnail URL"), z.literal("")])
      .nullable(),
    subjectId: z.string().nullable(),
    topicId: z.string().nullable(),
    sortOrder: z.number().int().min(0),
    isPublished: z.boolean(),
    isPreview: z.boolean(),
  })

  .superRefine((data, ctx) => {
    if (data.type === "VIDEO" && !data.videoId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["videoId"],
        message: "Video reference is required",
      });
    }

    if (data.type === "PDF" && !data.fileUrl?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["fileUrl"],
        message: "PDF URL is required",
      });
    }

    if (data.topicId && !data.subjectId) {
      ctx.addIssue({
        code: "custom",
        path: ["subjectId"],
        message: "Select a subject before selecting a topic",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

interface CourseContentFormProps {
  courseId: string;
  initialData?: CourseContentItem;
}

export function CourseContentForm({
  courseId,
  initialData,
}: CourseContentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(initialData);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId,
      title: initialData?.title ?? "",
      description: initialData?.description ?? null,
      type: initialData?.type ?? "VIDEO",
      videoId: initialData?.videoId ?? null,
      fileUrl: initialData?.fileUrl ?? null,
      thumbnail: initialData?.thumbnail ?? null,
      subjectId: initialData?.subjectId ?? null,
      topicId: initialData?.topicId ?? null,
      sortOrder: initialData?.sortOrder ?? 0,
      isPublished: initialData?.isPublished ?? false,
      isPreview: initialData?.isPreview ?? false,
    },
  });

  useEffect(() => {
    form.reset({
      courseId,
      title: initialData?.title ?? "",
      description: initialData?.description ?? null,
      type: initialData?.type ?? "VIDEO",
      videoId: initialData?.videoId ?? null,
      fileUrl: initialData?.fileUrl ?? null,
      thumbnail: initialData?.thumbnail ?? null,
      subjectId: initialData?.subjectId ?? null,
      topicId: initialData?.topicId ?? null,
      sortOrder: initialData?.sortOrder ?? 0,
      isPublished: initialData?.isPublished ?? false,
      isPreview: initialData?.isPreview ?? false,
    });
  }, [courseId, initialData, form]);

  const contentType = form.watch("type");

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const payload = {
        ...values,
        description: values.description?.trim() || null,
        videoId:
          values.type === "VIDEO" ? values.videoId?.trim() || null : null,
        fileUrl: values.type === "PDF" ? values.fileUrl?.trim() || null : null,
        thumbnail: values.thumbnail?.trim() || null,
        subjectId: values.subjectId?.trim() || null,
        topicId: values.topicId?.trim() || null,
        isPreview: values.type === "VIDEO" && values.isPreview,
      };

      const result =
        isEditing && initialData
          ? await updateCourseContentAction(initialData.id, payload)
          : await createCourseContentAction(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        isEditing ? "Course content updated" : "Course content created",
      );
      router.push(`/academic/courses/${courseId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card className="rounded-card border-border bg-surface">
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit content details" : "Content details"}
          </CardTitle>

          <CardDescription>
            Add or update videos, study materials, and tests.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            {/* Title */}
            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="e.g. Introduction to Algebra"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </Field>
              )}
            />

            {/* Content Type */}
            <Controller
              control={form.control}
              name="type"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Content type</FieldLabel>

                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("videoId", null, {
                        shouldValidate: true,
                      });
                      form.setValue("fileUrl", null, {
                        shouldValidate: true,
                      });
                      if (value !== "VIDEO") {
                        form.setValue("isPreview", false, {
                          shouldValidate: true,
                        });
                      }
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video</SelectItem>
                      <SelectItem value="PDF">PDF</SelectItem>
                      <SelectItem value="TEST">Test</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </Field>
              )}
            />

            {/* Video ID */}
            {contentType === "VIDEO" && (
              <Controller
                control={form.control}
                name="videoId"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Bunny Stream video ID
                    </FieldLabel>
                    <Input
                      id={field.name}
                      placeholder="Enter video ID"
                      value={field.value ?? ""}
                      onChange={(event) =>
                        field.onChange(event.target.value || null)
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />
            )}

            {/* PDF URL */}
            {contentType === "PDF" && (
              <Controller
                control={form.control}
                name="fileUrl"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>PDF URL</FieldLabel>
                    <Input
                      id={field.name}
                      type="url"
                      placeholder="https\://..."
                      value={field.value ?? ""}
                      onChange={(event) => field.onChange(event.target.value)}
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />
            )}

            {/* Description */}
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Description (optional)
                  </FieldLabel>

                  <Textarea
                    id={field.name}
                    rows={4}
                    placeholder="Describe this learning material"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </Field>
              )}
            />

            {/* Thumbnail URL */}
            <Controller
              control={form.control}
              name="thumbnail"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Thumbnail URL (optional)
                  </FieldLabel>

                  <Input
                    id={field.name}
                    type="url"
                    placeholder="https\://..."
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value)}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </Field>
              )}
            />

            {/* Display Order */}
            <Controller
              control={form.control}
              name="sortOrder"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Display order</FieldLabel>
                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </Field>
              )}
            />

            {/* Publish Content */}
            <Controller
              control={form.control}
              name="isPublished"
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="space-y-1">
                    <FieldLabel htmlFor={field.name}>
                      Publish content
                    </FieldLabel>

                    <FieldDescription>
                      Make this material available to students.
                    </FieldDescription>
                  </div>

                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />

            {form.watch("type") === "VIDEO" && (
              <Controller
                control={form.control}

                name="isPreview"

                render={({ field }) => (
                  <Field
                    orientation="horizontal"

                    className="justify-between rounded-card border border-border p-4"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor="isPreview">
                        Free preview video
                      </FieldLabel>

                      <FieldDescription>
                        Allow students to watch this video before purchasing the
                        course.
                      </FieldDescription>
                    </FieldContent>

                    <Switch
                      id="isPreview"

                      checked={field.value}

                      onCheckedChange={field.onChange}

                      aria-label="Enable free preview video"
                    />
                  </Field>
                )}
              />
            )}
          </FieldGroup>
        </CardContent>
      </Card>

      {contentType === "TEST" && (
        <p className="text-sm text-text-secondary">
          Test-to-assessment linking has not been implemented yet.
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}

          {isEditing ? "Update Content" : "Save Content"}
        </Button>
      </div>
    </form>
  );
}
