"use client";

import { CourseForm } from "@/components/courses/course-form";
import { useCourse, useUpdateCourse } from "@/hooks/courses/use-courses";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const courseQuery = useCourse(id);
  const mutation = useUpdateCourse();

  if (courseQuery.isPending) {
    return <main className="p-8">Loading course...</main>;
  }

  if (courseQuery.isError || !courseQuery.data) {
    return (
      <main className="p-8">
        <p className="text-destructive">Unable to load course.</p>
      </main>
    );
  }

  const course = courseQuery.data;

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Edit Course</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update course details.
        </p>
      </div>

      <CourseForm
        key={course.id}
        initialData={{
          name: course.name,
          slug: course.slug,
          description: course.description,
          thumbnail: course.thumbnail,
          features: course.features,
          price: course.price,
          salePrice: course.salePrice,
          startDate: course.startDate,
          endDate: course.endDate,
          isActive: course.isActive,
        }}
        onSubmit={async (data) => {
          try {
            await mutation.mutateAsync({ id, data });

            toast.success("Course updated successfully");
            router.push("/admin/courses");
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to update course",
            );
          }
        }}
      />
    </main>
  );
}
