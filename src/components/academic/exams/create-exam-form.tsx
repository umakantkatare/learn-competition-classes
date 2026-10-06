"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

import {
  type CreateExamInput,
  createExamSchema,
} from "@/validations/academic/exam/exam-validation";
import { createExamAction } from "@/actions/academic/exam/exam-actions";

export function CreateExamForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateExamInput>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      name: "",
      slug: "",
      year: new Date().getFullYear(),
      isActive: true,
    },
  });

  async function onSubmit(values: CreateExamInput) {
    setIsSubmitting(true);

    try {
      const result = await createExamAction(values);

      if (!result.success) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, messages]) => {
            const message = messages?.[0];

            if (message) {
              form.setError(field as keyof CreateExamInput, {
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
        queryKey: ["academic", "exams"],
      });

      toast.success("Exam created successfully.");

      router.push("/academic/exams");
    } catch (error) {
      console.error("Create exam form error:", error);

      toast.error("Unable to create exam.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        {/* Exam Name */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Exam Name</FieldLabel>

              <Input
                {...field}
                id="name"
                placeholder="e.g. SSC CGL"
                aria-invalid={fieldState.invalid}
              />

              <FieldDescription>
                Enter the official name of the examination.
              </FieldDescription>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Slug */}
        <Controller
          name="slug"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="slug">Slug</FieldLabel>

              <Input
                {...field}
                id="slug"
                placeholder="e.g. ssc-cgl"
                aria-invalid={fieldState.invalid}
              />

              <FieldDescription>
                Use lowercase letters, numbers and hyphens.
              </FieldDescription>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Year */}
        <Controller
          name="year"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="year">Academic Year</FieldLabel>

              <Input
                {...field}
                id="year"
                type="number"
                min={2000}
                max={2100}
                aria-invalid={fieldState.invalid}
                onChange={(event) => {
                  field.onChange(event.target.valueAsNumber);
                }}
              />

              <FieldDescription>
                Select the year in which this examination is organized.
              </FieldDescription>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Active Status */}
        <Controller
          name="isActive"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              orientation="horizontal"
              data-invalid={fieldState.invalid}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex-1 space-y-1">
                <FieldLabel htmlFor="isActive">Active Status</FieldLabel>

                <FieldDescription>
                  Active exams are available for academic management.
                </FieldDescription>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </div>

              <Switch
                id="isActive"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </FieldGroup>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.back()}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}

          {isSubmitting ? "Creating..." : "Create Exam"}
        </Button>
      </div>
    </form>
  );
}
