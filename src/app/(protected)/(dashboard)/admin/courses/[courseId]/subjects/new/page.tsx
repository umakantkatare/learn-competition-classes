"use client";

import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCreateCourseSubject } from "@/hooks/courses/use-course-subject";
import { CourseSubjectForm } from "@/components/courses/course-subject-form";
import type { CreateCourseSubjectInput } from "@/validations/courses/course-subject-schema";

export default function CreateCourseSubjectPage() {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const createMutation = useCreateCourseSubject();

  async function handleCreate(data: CreateCourseSubjectInput) {
    try {
      await createMutation.mutateAsync({ courseId, data });

      toast.success("Subject created successfully");
      router.push(`/admin/courses/${courseId}/subjects`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create subject",
      );
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="mb-3"
        >
          ← Back
        </Button>

        <h1 className="text-2xl font-bold">Create Subject</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a subject to this course.
        </p>
      </div>

      <div className="rounded-xl border p-5 md:p-8">
        <CourseSubjectForm courseId={courseId} onSubmit={handleCreate} />
      </div>
    </main>
  );
}
