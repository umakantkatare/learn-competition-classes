"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";

import type { Course } from "@/services/academic/course/types";
import { updateCourseAction } from "@/actions/academic/course/courses-actions";
import { courseKeys } from "@/hooks/academic/courses/use-courses";
import { updateCourseSchema } from "@/validations/academic/course/course-validation";

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
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const courseFormSchema = updateCourseSchema.extend({
  price: z.number().min(0, "Price cannot be negative"),
  salePrice: z.number().min(0, "Sale price cannot be negative").nullable(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface EditCourseFormProps {
  course: Course;
}

export function EditCourseForm({ course }: EditCourseFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: course.name,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail,
      features: course.features.length ? course.features : [""],
      price: course.price / 100,
      salePrice: course.salePrice === null ? null : course.salePrice / 100,
      isActive: course.isActive,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  async function onSubmit(values: CourseFormValues) {
    setIsSubmitting(true);

    try {
      const result = await updateCourseAction(course.id, {
        ...values,
        description: values.description?.trim() || null,
        thumbnail: values.thumbnail?.trim() || null,
        features: values.features.map((feature) => feature.trim()),
        price: Math.round(values.price * 100),
        salePrice:
          values.salePrice === null ? null : Math.round(values.salePrice * 100),
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: courseKeys.all,
      });

      toast.success("Course updated successfully.");
      router.push(`/academic/courses/${course.id}`);
      router.refresh();
    } catch (error) {
      console.error("Update course form error:", error);
      toast.error("Unable to update course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Update the course name and public-facing details.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Course name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="e.g. Complete Mathematics"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Used in the course URL.</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    rows={5}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="thumbnail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Thumbnail URL</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(event.target.value || null)
                    }
                    placeholder="https://..."
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    URL of the hosted course thumbnail.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Features</CardTitle>
          <CardDescription>
            Manage the benefits displayed on the course page.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            {fields.map((item, index) => (
              <Controller
                key={item.id}
                name={`features.${index}`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Feature {index + 1}
                    </FieldLabel>

                    <div className="flex gap-2">
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Complete recorded lectures"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Remove feature ${index + 1}`}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-fit"
              disabled={fields.length >= 20}
              onClick={() => append("")}
            >
              <Plus className="mr-2 size-4" />
              Add feature
            </Button>

            <FieldError errors={[form.formState.errors.features]} />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing and Availability</CardTitle>
          <CardDescription>
            Enter prices in rupees. Saved values are converted to paise.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Regular price (₹)
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    type="number"
                    min="0"
                    step="0.01"
                    value={field.value}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? 0
                          : Number(event.target.value),
                      )
                    }
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="salePrice"
              control={form.control}
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
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(event) =>
                      field.onChange(
                        event.target.value === ""
                          ? null
                          : Number(event.target.value),
                      )
                    }
                    placeholder="Leave blank for no discount"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability</CardTitle>
        </CardHeader>

        <CardContent>
          <Controller
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <Field orientation="horizontal">
                <div className="flex-1 space-y-1">
                  <FieldLabel htmlFor={field.name}>Active course</FieldLabel>
                  <FieldDescription>
                    Active courses appear in active course listings.
                  </FieldDescription>
                </div>
                <Switch
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push(`/academic/courses/${course.id}`)}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving changes..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
