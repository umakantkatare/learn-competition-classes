"use client";

import Link from "next/link";

import { ArrowLeft, Layers3, Pencil, Power } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useCourse } from "@/hooks/course/use-courses";
import { useToggleCourseStatus } from "@/hooks/course/use-course-mutations";

type CourseDetailsProps = {
  courseId: string;
};

export function CourseDetails({ courseId }: CourseDetailsProps) {
  const { data: course, isLoading, isError } = useCourse(courseId);

  const toggleStatus = useToggleCourseStatus();

  if (isLoading) {
    return (
      <main className="container mx-auto min-h-screen py-8">
        <div className="rounded-card border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Loading course...</p>
        </div>
      </main>
    );
  }

  if (isError || !course) {
    return (
      <main className="container mx-auto min-h-screen py-8">
        <div className="rounded-card border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">
            Course not found
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            The course may have been deleted or you may not have access.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto min-h-screen py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/dashboard/courses" />}
          className="mb-4 rounded-button px-2 text-muted-foreground"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Courses
        </Button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Course</p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {course.title}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage course information and academic structure.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link href={`/dashboard/courses/${courseId}/structure`} />
              }
              className="rounded-button border-input bg-card"
            >
              <Layers3 className="mr-2 size-4" />
              Manage Structure
            </Button>

            <Button
              nativeButton={false}
              render={<Link href={`/dashboard/courses/${courseId}/edit`} />}
              className="rounded-button bg-primary text-primary-foreground hover:bg-brand-primary-hover"
            >
              <Pencil className="mr-2 size-4" />
              Edit Course
            </Button>
          </div>
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-card p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-foreground">
            Course Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Course Title</p>

              <p className="mt-1 text-sm font-medium text-foreground">
                {course.title}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Slug</p>

              <p className="mt-1 text-sm font-medium text-foreground">
                {course.slug || "—"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Description</p>

              <p className="mt-1 text-sm text-foreground">
                {course.description || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-card border border-border bg-card p-5">
          <h2 className="text-base font-semibold text-foreground">
            Course Status
          </h2>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span
              className={
                course.isActive
                  ? "inline-flex rounded-pill bg-brand-dark px-2.5 py-1 text-xs font-medium text-white"
                  : "inline-flex rounded-pill bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              }
            >
              {course.isActive ? "Active" : "Inactive"}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={toggleStatus.isPending}
              onClick={() => toggleStatus.mutate(courseId)}
              className="rounded-button border-input"
            >
              <Power className="mr-2 size-4" />

              {toggleStatus.isPending
                ? "Updating..."
                : course.isActive
                  ? "Deactivate"
                  : "Activate"}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
