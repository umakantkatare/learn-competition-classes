"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { Topic } from "@/services/academic/topic/types";

import {
  updateTopicSchema,
  type UpdateTopicInput,
} from "@/validations/academic/topic/topic-validation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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
import { useSubjects } from "@/hooks/academic/subjects/use-subjects";
import { updateTopicAction } from "@/actions/academic/topic/topic-actions";

interface EditTopicFormProps {
  topic: Topic;
}

export function EditTopicForm({ topic }: EditTopicFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjects();

  const form = useForm<UpdateTopicInput>({
    resolver: zodResolver(updateTopicSchema),
    defaultValues: {
      subjectId: topic.subjectId,
      name: topic.name,
      slug: topic.slug,
      isActive: topic.isActive,
    },
  });

  async function onSubmit(values: UpdateTopicInput) {
    setIsSubmitting(true);

    try {
      const result = await updateTopicAction(topic.id, values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["academic", "topics"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["academic", "subject-topics", topic.subjectId],
        }),

        queryClient.invalidateQueries({
          queryKey: ["academic", "subject-topics", values.subjectId],
        }),
      ]);

      toast.success("Topic updated successfully.");

      router.push(`/academic/topics/${topic.id}`);

      router.refresh();
    } catch (error) {
      console.error("Update topic error:", error);

      toast.error("Unable to update topic.");
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
              <SelectValue placeholder="Select a subject" />
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

          <Input id="name" {...form.register("name")} disabled={isSubmitting} />

          <FieldDescription>Enter the academic topic name.</FieldDescription>

          {form.formState.errors.name && (
            <FieldError>{form.formState.errors.name.message}</FieldError>
          )}
        </Field>

        {/* Slug */}
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>

          <Input id="slug" {...form.register("slug")} disabled={isSubmitting} />

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
            onCheckedChange={(checked) =>
              form.setValue("isActive", checked, {
                shouldValidate: true,
              })
            }
            disabled={isSubmitting}
          />
        </Field>
      </FieldGroup>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/academic/topics/${topic.id}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting || isLoadingSubjects}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
