"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createCourseSchema,
  type CreateCourseInput,
} from "@/validations/courses/course-validation";

import { CourseThumbnailUpload } from "./course-thumbnail-upload";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type CourseFormProps = {
  initialData?: CreateCourseInput;
  onSubmit: (data: CreateCourseInput) => Promise<void>;
};

export function CourseForm({ initialData, onSubmit }: CourseFormProps) {
  const form = useForm<CreateCourseInput>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: initialData ?? {
      name: "",
      slug: "",
      description: null,
      thumbnail: null,
      features: [],
      price: 0,
      salePrice: null,
      startDate: null,
      endDate: null,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(data: CreateCourseInput) {
    await onSubmit(data);
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Course name */}
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Course name</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="MERN Stack Development"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Slug */}
      <Controller
        control={form.control}
        name="slug"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
            <Input
              {...field}
              id={field.name}
              placeholder="mern-stack-development"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Description */}
      <Controller
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Description</FieldLabel>
            <Textarea
              id={field.name}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              placeholder="Describe this course..."
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value || null)}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Thumbnail */}
      <Controller
        control={form.control}
        name="thumbnail"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Course thumbnail</FieldLabel>
            <CourseThumbnailUpload
              value={field.value ?? ""}
              onChange={(url) => field.onChange(url || null)}
              disabled={isSubmitting}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Price */}
      <Controller
        control={form.control}
        name="price"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Price (₹)</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              type="number"
              min="0"
              step="1"
              value={field.value / 100}
              onChange={(event) => {
                const rupees = Number(event.target.value);
                field.onChange(
                  Number.isFinite(rupees) ? Math.round(rupees * 100) : 0,
                );
              }}
              aria-invalid={fieldState.invalid}
            />
            <FieldDescription>Stored in paise. ₹499 = 49900.</FieldDescription>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Sale price */}
      <Controller
        control={form.control}
        name="salePrice"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Sale price (₹)</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              type="number"
              min="0"
              step="1"
              value={field.value == null ? "" : field.value / 100}
              onChange={(event) => {
                const value = event.target.value;
                field.onChange(
                  value === "" ? null : Math.round(Number(value) * 100),
                );
              }}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Features */}
      <Controller
        control={form.control}
        name="features"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Features (one per line)
            </FieldLabel>
            <Textarea
              id={field.name}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              placeholder={"Live classes\nAssignments\nDoubt support"}
              value={(field.value ?? []).join("\n")}
              onChange={(event) =>
                field.onChange(event.target.value.split("\n").slice(0, 20))
              }
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Start date */}
      <Controller
        control={form.control}
        name="startDate"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Start date</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              type="datetime-local"
              value={field.value ? field.value.slice(0, 16) : ""}
              onChange={(event) =>
                field.onChange(
                  event.target.value
                    ? new Date(event.target.value).toISOString()
                    : null,
                )
              }
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* End date */}
      <Controller
        control={form.control}
        name="endDate"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>End date (optional)</FieldLabel>
            <Input
              id={field.name}
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              type="datetime-local"
              value={field.value ? field.value.slice(0, 16) : ""}
              onChange={(event) =>
                field.onChange(
                  event.target.value
                    ? new Date(event.target.value).toISOString()
                    : null,
                )
              }
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      {/* Active course */}
      <Controller
        control={form.control}
        name="isActive"
        render={({ field, fieldState }) => (
          <Field
            orientation="horizontal"
            data-invalid={fieldState.invalid}
            className="justify-between rounded-lg border p-4"
          >
            <FieldContent>
              <FieldLabel htmlFor={field.name}>Active course</FieldLabel>
            </FieldContent>
            <Switch
              id={field.name}
              name={field.name}
              checked={field.value}
              onCheckedChange={field.onChange}
              onBlur={field.onBlur}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting
          ? "Saving..."
          : initialData
            ? "Update course"
            : "Create course"}
      </Button>
    </form>
  );
}
