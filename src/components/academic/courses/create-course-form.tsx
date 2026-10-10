"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";

import { createCourseSchema } from "@/validations/academic/course/course-validation";
import { createCourseAction } from "@/actions/academic/course/courses-actions";
import { courseKeys } from "@/hooks/academic/courses/use-courses";

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

const courseFormSchema = createCourseSchema.safeExtend({
  price: z.number().min(0, "Price cannot be negative"),
  salePrice: z.number().min(0, "Sale price cannot be negative").nullable(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function CreateCourseForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: null,
      thumbnail: null,
      features: [""],
      price: 0,
      salePrice: null,
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features",
  });

  async function onSubmit(values: CourseFormValues) {
    setIsSubmitting(true);

    try {
      const result = await createCourseAction({
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

      toast.success("Course created successfully.");
      router.push(`/academic/courses/${result.data.id}`);
      router.refresh();
    } catch (error) {
      console.error("Create course form error:", error);
      toast.error("Unable to create course. Please try again.");
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
            Enter the course name and public-facing details.
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
                    placeholder="e.g. Complete Mathematics"
                    aria-invalid={fieldState.invalid}
                    onChange={(event) => {
                      field.onChange(event);
                      if (!form.getFieldState("slug").isDirty) {
                        form.setValue("slug", slugify(event.target.value), {
                          shouldValidate: true,
                        });
                      }
                    }}
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
                    placeholder="complete-mathematics"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Used in the course URL. Use lowercase letters, numbers, and
                    hyphens.
                  </FieldDescription>
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
                    placeholder="Describe what students will learn..."
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
                    Use the hosted image URL from your image storage provider.
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
            Add the key benefits displayed on the course detail page.
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
                        placeholder="e.g. Complete recorded lectures"
                        aria-invalid={fieldState.invalid}
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

            <Field>
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
            </Field>

            <FieldError errors={[form.formState.errors.features]} />
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing and Availability</CardTitle>
          <CardDescription>
            Enter prices in rupees. Values are converted to paise when saved.
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
                  <FieldDescription>
                    Must not exceed the regular price.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="isActive"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <div className="flex-1 space-y-1">
                    <FieldLabel htmlFor={field.name}>Active course</FieldLabel>
                    <FieldDescription>
                      Active courses can appear in active course listings.
                    </FieldDescription>
                  </div>

                  <Switch
                    id={field.name}
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => router.push("/academic/courses")}
        >
          Cancel
        </Button>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating course..." : "Create Course"}
        </Button>
      </div>
    </form>
  );
}
