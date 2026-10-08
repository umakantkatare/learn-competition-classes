"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createTopicSchema,
  type CreateTopicInput,
} from "@/validations/academic/topic/topic-validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Switch } from "@/components/ui/switch";
import { useSubjects } from "@/hooks/academic/subjects/use-subjects";
import { createTopicAction } from "@/actions/academic/topic/topic-actions";

interface CreateTopicFormProps {
  defaultSubjectId?: string;
}

export function CreateTopicForm({ defaultSubjectId }: CreateTopicFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjects();

  const form = useForm<CreateTopicInput>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      subjectId: defaultSubjectId ?? "",
      name: "",
      slug: "",
      isActive: true,
    },
  });

  const selectedSubjectId = form.watch("subjectId");

  const canSubmit = useMemo(
    () => Boolean(selectedSubjectId) && !isLoadingSubjects && !isSubmitting,
    [selectedSubjectId, isLoadingSubjects, isSubmitting],
  );

  async function onSubmit(values: CreateTopicInput) {
    setIsSubmitting(true);

    try {
      const result = await createTopicAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["academic", "topics"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["academic", "subject-topics", values.subjectId],
      });

      toast.success("Topic created successfully.");

      router.push("/academic/topics");
      router.refresh();
    } catch (error) {
      console.error("Create topic error:", error);

      toast.error("Unable to create topic.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup>
        {/* Subject */}
        <Field>
          <FieldLabel htmlFor="subjectId">Subject</FieldLabel>

          <Select
            value={form.watch("subjectId")}
            onValueChange={(value) => {
              if (!value) {
                return;
              }

              form.setValue("subjectId", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            disabled={isLoadingSubjects || isSubmitting}
          >
            <SelectTrigger id="subjectId">
              <SelectValue
                placeholder={
                  isLoadingSubjects ? "Loading subjects..." : "Select a subject"
                }
              />
            </SelectTrigger>

            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FieldDescription>
            Select the subject this topic belongs to.
          </FieldDescription>

          {form.formState.errors.subjectId && (
            <FieldError>{form.formState.errors.subjectId.message}</FieldError>
          )}
        </Field>

        {/* Name */}
        <Field>
          <FieldLabel htmlFor="name">Topic Name</FieldLabel>

          <Input
            id="name"
            placeholder="e.g. Percentage"
            {...form.register("name")}
            disabled={isSubmitting}
          />

          <FieldDescription>
            Enter the name of the academic topic.
          </FieldDescription>

          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        {/* Slug */}
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>

          <Input
            id="slug"
            placeholder="e.g. percentage"
            {...form.register("slug")}
            disabled={isSubmitting}
          />

          <FieldDescription>
            Use lowercase letters, numbers and hyphens.
          </FieldDescription>

          {form.formState.errors.slug && (
            <FieldError>{form.formState.errors.slug.message}</FieldError>
          )}
        </Field>

        {/* Status */}
        <Field orientation="horizontal">
          <div className="flex-1">
            <FieldLabel htmlFor="isActive">Active</FieldLabel>

            <FieldDescription>
              Active topics can be used in the academic structure.
            </FieldDescription>
          </div>

          <Switch
            id="isActive"
            checked={form.watch("isActive")}
            onCheckedChange={(checked) => form.setValue("isActive", checked)}
            disabled={isSubmitting}
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/academic/topics")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={!canSubmit}>
          {isSubmitting ? "Creating..." : "Create Topic"}
        </Button>
      </div>
    </form>
  );
}
