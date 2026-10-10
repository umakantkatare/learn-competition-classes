
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";

import { getCourseById } from "@/services/academic/course/queries";
import { Button } from "@/components/ui/button";
import { EditCourseForm } from "./components/edit-course-form";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

export default async function EditCoursePage({
  params,
}: EditCoursePageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-content space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/academic/courses/${course.id}`}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Course
        </Link>
      </Button>

      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <BookOpen className="size-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Edit Course
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Update course details, features, and pricing.
          </p>
        </div>
      </div>

      <EditCourseForm course={course} />
    </div>
  );
}
