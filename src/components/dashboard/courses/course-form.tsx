"use client";

import Link from "next/link";

import { ArrowLeft, ImagePlus, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  type CourseCreateInput,
  courseCreateSchema,
} from "@/validations/course/course-validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateCourse } from "@/hooks/course/use-create-course";

export function CourseForm() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const form = useForm<CourseCreateInput>({
    resolver: zodResolver(courseCreateSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      thumbnail: "",
      isActive: true,
    },
  });

  const onSubmit = async (values: CourseCreateInput) => {
    console.log("Submitting course form with values:", values);
    try {
      await createCourse.mutateAsync(values);

      toast.success("Course created successfully");

      router.push("/dashboard/courses");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create course.";

      toast.error(message);
    }
  };

  return (
    <main className="w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Button
            nativeButton={false}
            variant="ghost"
            size="icon"
            render={<Link href="/dashboard/courses" />}
            className="mt-0.5 size-9 shrink-0 rounded-button text-muted-foreground hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create Course
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Create a new course and configure its basic information.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 max-w-3xl">
        <Card className="rounded-card border-border bg-card shadow-none">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Course Information
            </CardTitle>

            <CardDescription>
              Add the basic details that will be used throughout the course.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>

              <Input
                id="title"
                placeholder="e.g. SSC Foundation"
                {...form.register("title")}
                className="rounded-input border-input shadow-none focus-visible:ring-ring"
              />

              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>

              <Input
                id="slug"
                placeholder="e.g. ssc-foundation"
                {...form.register("slug")}
                className="rounded-input border-input shadow-none focus-visible:ring-ring"
              />

              <p className="text-xs text-muted-foreground">
                Use lowercase letters, numbers and hyphens.
              </p>

              {form.formState.errors.slug && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>

              <Textarea
                id="description"
                placeholder="Write a short description about this course..."
                {...form.register("description")}
                className="min-h-28 resize-none rounded-input border-input shadow-none focus-visible:ring-ring"
              />

              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>

              <div className="rounded-card border border-dashed border-border bg-background p-6">
                {thumbnailPreview ? (
                  <div className="relative overflow-hidden rounded-card">
                    <img
                      src={thumbnailPreview}
                      alt="Course thumbnail preview"
                      className="aspect-video w-full rounded-card object-cover"
                    />

                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => setThumbnailPreview(null)}
                      className="absolute right-3 top-3 size-8 rounded-button"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex size-12 items-center justify-center rounded-button bg-muted">
                      <ImagePlus className="size-5 text-muted-foreground" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-foreground">
                      Upload course thumbnail
                    </p>

                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      Add a clear image that represents this course.
                    </p>

                    <label
                      htmlFor="course-thumbnail"
                      className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-button border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <Upload className="mr-2 size-4" />
                      Choose Image
                    </label>

                    <input
                      id="course-thumbnail"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) {
                          return;
                        }

                        const previewUrl = URL.createObjectURL(file);

                        setThumbnailPreview(previewUrl);
                      }}
                    />

                    <p className="mt-3 text-xs text-muted-foreground">
                      PNG, JPG or WEBP
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between rounded-card border border-border p-4">
              <div className="space-y-1">
                <Label htmlFor="active">Course Status</Label>

                <p className="text-xs text-muted-foreground">
                  Make this course available after creation.
                </p>
              </div>

              <Switch
                id="active"
                checked={form.watch("isActive")}
                onCheckedChange={(checked) =>
                  form.setValue("isActive", checked)
                }
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button
                nativeButton={false}
                type="button"
                variant="outline"
                render={<Link href="/dashboard/courses" />}
                className="rounded-button border-border"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={createCourse.isPending}
                className="rounded-button bg-primary text-primary-foreground hover:bg-brand-primary-hover"
              >
                {createCourse.isPending ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </main>
  );
}
