"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";

import { createTeacherProfileSchema } from "@/validations/teacher-profile-validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const teacherProfileFormSchema = createTeacherProfileSchema.omit({
  userId: true,
});

type TeacherProfileFormInput = z.input<typeof teacherProfileFormSchema>;

export type TeacherProfileFormValues = z.output<
  typeof teacherProfileFormSchema
>;

type TeacherProfileFormProps = {
  initialData?: Partial<TeacherProfileFormValues>;
  onSubmit: (values: TeacherProfileFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
};

export function TeacherProfileForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Profile",
}: TeacherProfileFormProps) {
  const form = useForm<
    TeacherProfileFormInput,
    unknown,
    TeacherProfileFormValues
  >({
    resolver: zodResolver(teacherProfileFormSchema),
    defaultValues: {
      bio: initialData?.bio ?? "",
      qualification: initialData?.qualification ?? "",
      experienceYears: initialData?.experienceYears ?? 0,
      specializations: initialData?.specializations?.length
        ? initialData.specializations
        : [""],
    },
  });

  const specializations = useWatch({
    control: form.control,
    name: "specializations",
  }) ?? [""];

  useEffect(() => {
    form.reset({
      bio: initialData?.bio ?? "",
      qualification: initialData?.qualification ?? "",
      experienceYears: initialData?.experienceYears ?? 0,
      specializations: initialData?.specializations?.length
        ? initialData.specializations
        : [""],
    });
  }, [initialData, form]);

  function appendSpecialization() {
    if (specializations.length >= 30) return;

    form.setValue("specializations", [...specializations, ""], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function removeSpecialization(index: number) {
    if (specializations.length <= 1) return;

    form.setValue(
      "specializations",
      specializations.filter((_, i) => i !== index),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  async function handleSubmit(values: TeacherProfileFormValues) {
    await onSubmit({
      ...values,
      bio: values.bio?.trim() || null,
      qualification: values.qualification?.trim() || null,
      specializations: values.specializations
        .map((item) => item.trim())
        .filter(Boolean),
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-6"
      noValidate
    >
      <FieldGroup>
        {/* Qualification */}
        <Field data-invalid={!!form.formState.errors.qualification}>
          <FieldLabel htmlFor="qualification">Qualification</FieldLabel>

          <Input
            id="qualification"
            placeholder="e.g. M.Sc. Physics, B.Ed."
            aria-invalid={!!form.formState.errors.qualification}
            {...form.register("qualification")}
          />

          <FieldError>
            {form.formState.errors.qualification?.message}
          </FieldError>
        </Field>

        {/* Professional Bio */}
        <Field data-invalid={!!form.formState.errors.bio}>
          <FieldLabel htmlFor="bio">Professional Bio</FieldLabel>

          <Textarea
            id="bio"
            placeholder="Describe the teacher's experience and teaching approach..."
            className="min-h-32 resize-y"
            aria-invalid={!!form.formState.errors.bio}
            {...form.register("bio")}
          />

          <FieldDescription>Maximum 3000 characters.</FieldDescription>

          <FieldError>{form.formState.errors.bio?.message}</FieldError>
        </Field>

        {/* Teaching Experience */}
        <Field data-invalid={!!form.formState.errors.experienceYears}>
          <FieldLabel htmlFor="experienceYears">
            Teaching Experience (years)
          </FieldLabel>

          <Input
            id="experienceYears"
            type="number"
            min={0}
            max={80}
            step={1}
            aria-invalid={!!form.formState.errors.experienceYears}
            {...form.register("experienceYears", {
              valueAsNumber: true,
            })}
          />

          <FieldError>
            {form.formState.errors.experienceYears?.message}
          </FieldError>
        </Field>

        {/* Specializations */}
        <FieldGroup>
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Specializations</h3>

            <p className="text-sm text-muted-foreground">
              Add the subjects this teacher specializes in.
            </p>
          </div>

          {specializations.map((_, index) => {
            const error = form.formState.errors.specializations?.[index];

            return (
              <Field key={index} data-invalid={!!error}>
                <div className="flex gap-2">
                  <Input
                    id={`specialization-${index}`}
                    placeholder={`Specialization ${index + 1}`}
                    aria-label={`Specialization ${index + 1}`}
                    aria-invalid={!!error}
                    {...form.register(`specializations.${index}`)}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Remove specialization ${index + 1}`}
                    disabled={specializations.length === 1}
                    onClick={() => removeSpecialization(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <FieldError>{error?.message}</FieldError>
              </Field>
            );
          })}

          <div>
            <Button
              type="button"
              variant="outline"
              onClick={appendSpecialization}
              disabled={specializations.length >= 30}
            >
              <Plus className="mr-2 size-4" />
              Add specialization
            </Button>
          </div>
        </FieldGroup>
      </FieldGroup>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
