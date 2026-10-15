"use client";

import { CourseForm } from "@/components/courses/course-form";
import { useCreateCourse } from "@/hooks/courses/use-courses";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewCoursePage() {
  const router = useRouter();
  const mutation = useCreateCourse();

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Create Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a new course to LCC.
        </p>
      </div>

      <CourseForm
        onSubmit={async (data) => {
          try {
            await mutation.mutateAsync(data);

            toast.success("Course created successfully");
            router.push("/admin/courses");
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to create course",
            );
          }
        }}
      />
    </main>
  );
}
