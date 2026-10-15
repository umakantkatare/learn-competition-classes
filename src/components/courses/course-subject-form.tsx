"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createCourseSubjectSchema,
  type CreateCourseSubjectInput,
} from "@/validations/courses/course-subject-schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";

type CourseSubjectFormProps = {
  courseId: string;
  initialData?: Partial<CreateCourseSubjectInput>;
  onSubmit: (data: CreateCourseSubjectInput) => Promise<void>;
};

export function CourseSubjectForm({
  courseId,
  initialData,
  onSubmit,
}: CourseSubjectFormProps) {
  const form = useForm<CreateCourseSubjectInput>({
    resolver: zodResolver(createCourseSubjectSchema),
    defaultValues: {
      courseId,
      teacherId: null,
      name: "",
      isPublished: false,
      ...initialData,
    },
  });

  useEffect(() => {
    form.reset({
      courseId,
      teacherId: null,
      name: "",
      isPublished: false,
      ...initialData,
    });
  }, [courseId, initialData, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const {
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const isPublished = watch("isPublished");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <FieldGroup>
        {/* Subject name */}
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">Subject name</FieldLabel>

          <Input
            id="name"
            placeholder="e.g. Mathematics"
            aria-invalid={!!errors.name}
            {...register("name")}
          />

          <FieldError errors={[errors.name]} />
        </Field>

        {/* Teacher ID */}
        <Field data-invalid={!!errors.teacherId}>
          <FieldLabel htmlFor="teacherId">Teacher ID (optional)</FieldLabel>

          <Input
            id="teacherId"
            placeholder="Enter teacher user ID"
            aria-invalid={!!errors.teacherId}
            {...register("teacherId", {
              setValueAs: (value: string) => value || null,
            })}
          />

          <FieldError errors={[errors.teacherId]} />
        </Field>

        {/* Publish subject */}
        <Field
          orientation="horizontal"
          className="justify-between rounded-lg border p-4"
        >
          <div className="space-y-1">
            <FieldLabel htmlFor="isPublished">Publish subject</FieldLabel>

            <FieldDescription>
              Published subjects are visible on public course pages.
            </FieldDescription>
          </div>

          <Switch
            id="isPublished"
            checked={isPublished}
            onCheckedChange={(checked) =>
              setValue("isPublished", checked, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Saving..."
          : initialData?.name
            ? "Update subject"
            : "Create subject"}
      </Button>
    </form>
  );
}
