"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";


import type { Subject } from "@/services/academic/subject/types";

import {
  updateSubjectSchema,
  type UpdateSubjectInput,
} from "@/validations/academic/subject/subject-validation";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { updateSubjectAction } from "@/actions/academic/subject/subject-actions";

interface EditSubjectFormProps {
  subject: Subject;
}

export function EditSubjectForm({ subject }: EditSubjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UpdateSubjectInput>({
    resolver: zodResolver(updateSubjectSchema),

    defaultValues: {
      name: subject.name,
      slug: subject.slug,
      isActive: subject.isActive,
    },
  });

  async function onSubmit(values: UpdateSubjectInput) {
    setIsSubmitting(true);

    try {
      const result = await updateSubjectAction(subject.id, values);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const message = messages?.[0];

            if (message) {
              form.setError(field as keyof UpdateSubjectInput, {
                type: "server",
                message,
              });
            }
          });
        }

        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["academic", "subjects"],
      });

      toast.success("Subject updated successfully.");

      router.push("/academic/subjects");
    } catch (error) {
      console.error("Update subject form error:", error);

      toast.error("Unable to update subject.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="subject-name">Subject Name</FieldLabel>

              <Input
                {...field}
                id="subject-name"
                placeholder="e.g. Mathematics"
                aria-invalid={fieldState.invalid}
              />

              <FieldDescription>
                Use the canonical name of the subject.
              </FieldDescription>

              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="subject-slug">Slug</FieldLabel>

              <Input
                {...field}
                id="subject-slug"
                placeholder="e.g. mathematics"
                aria-invalid={fieldState.invalid}
              />

              <FieldDescription>
                Lowercase letters, numbers and hyphens only.
              </FieldDescription>

              {fieldState.error && (
                <FieldError>{fieldState.error.message}</FieldError>
              )}
            </Field>
          )}
        />

        <Controller
          name="isActive"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <div className="flex-1">
                <FieldLabel htmlFor="subject-active">Active</FieldLabel>

                <FieldDescription>
                  Active subjects can be assigned to academic structures.
                </FieldDescription>
              </div>

              <Switch
                id="subject-active"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
