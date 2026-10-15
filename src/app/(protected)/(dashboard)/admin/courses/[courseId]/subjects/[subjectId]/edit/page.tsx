"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  useCourseSubject,
  useUpdateCourseSubject,
} from "@/hooks/courses/use-course-subject";
import type { CreateCourseSubjectInput } from "@/validations/courses/course-subject-schema";
import { CourseSubjectForm } from "@/components/courses/course-subject-form";

export default function EditCourseSubjectPage() {
  const router = useRouter();

  const params = useParams<{
    courseId: string;
    subjectId: string;
  }>();

  const { courseId, subjectId } = params;

  const {
    data: subject,
    isPending,
    isError,
    error,
    refetch,
  } = useCourseSubject(subjectId);

  const updateMutation = useUpdateCourseSubject();

  async function handleUpdate(data: CreateCourseSubjectInput) {
    try {
      await updateMutation.mutateAsync({
        id: subjectId,
        data,
      });

      toast.success("Subject updated successfully");
      router.push(`/admin/courses/${courseId}/subjects`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update subject",
      );
    }
  }

  if (isPending) {
    return (
      <main className="p-8 text-sm text-muted-foreground">
        Loading subject...
      </main>
    );
  }

  if (isError || !subject) {
    return (
      <main className="space-y-4 p-8">
        <p>Unable to load subject: {error?.message ?? "Subject not found"}</p>
        <Button variant="outline" onClick={() => refetch()}>
          Try again
        </Button>
      </main>
    );
  }

  const initialData: CreateCourseSubjectInput = {
    courseId: subject.courseId,
    teacherId: subject.teacherId,
    name: subject.name,
    description: subject.description,
    thumbnail: subject.thumbnail,
    order: subject.order,
    isPublished: subject.isPublished,
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-3">
          ← Back
        </Button>

        <h1 className="text-2xl font-bold">Edit Subject</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update subject details and publication status.
        </p>
      </div>

      <div className="rounded-xl border p-5 md:p-8">
        <CourseSubjectForm
          key={subject.id}
          courseId={courseId}
          initialData={initialData}
          onSubmit={handleUpdate}
        />
      </div>
    </main>
  );
}
