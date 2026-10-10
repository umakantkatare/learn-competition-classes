
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateCourseForm } from "@/components/academic/courses/create-course-form";

export default function CreateCoursePage() {
  return (
    <div className="mx-auto w-full max-w-content space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/academic/courses">
            <ArrowLeft className="mr-2 size-4" />
            Back to Courses
          </Link>
        </Button>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <BookOpen className="size-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Create Course
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Add course details, pricing, and features.
          </p>
        </div>
      </div>

      <CreateCourseForm />
    </div>
  );
}
