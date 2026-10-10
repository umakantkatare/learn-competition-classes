
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { getCourseById } from "@/services/academic/course/queries";
import {
  getCourseContentById,
} from "@/services/academic/course-content/queries";


import { Button } from "@/components/ui/button";
import { CourseContentForm } from "@/components/academic/courses/course-content-form";

interface EditCourseContentPageProps {
  params: Promise<{
    courseId: string;
    contentId: string;
  }>;
}

export default async function EditCourseContentPage({
  params,
}: EditCourseContentPageProps) {
  const { courseId, contentId } = await params;

  const [course, content] = await Promise.all([
    getCourseById(courseId),
    getCourseContentById(contentId),
  ]);

  if (!course || !content || content.courseId !== courseId) {
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
            Edit Course Content
          </h1>

          <p className="text-sm text-text-secondary">
            Update content for {course.name}.
          </p>
        </div>
      </div>

      <CourseContentForm
        courseId={course.id}
        initialData={content}
      />
    </div>
  );
}
