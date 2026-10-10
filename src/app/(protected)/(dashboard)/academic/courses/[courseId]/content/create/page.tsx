import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCourseById } from "@/services/academic/course/queries";

import { Button } from "@/components/ui/button";
import { CourseContentForm } from "@/components/academic/courses/course-content-form";

interface CreateCourseContentPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CreateCourseContentPage({
  params,
}: CreateCourseContentPageProps) {
  const { courseId } = await params;

  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-content space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/academic/courses/${course.id}`}>
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to course</span>
          </Link>
        </Button>

        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-text-primary">
            Add Course Content
          </h1>

          <p className="text-sm text-text-secondary">
            Add a video, PDF, or test to {course.name}.
          </p>
        </div>
      </div>

      <CourseContentForm courseId={course.id} />
    </div>
  );
}
