import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CoursePageHeaderProps {
  totalCourses: number;
}

export function CoursePageHeader({ totalCourses }: CoursePageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          <BookOpen className="size-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Courses
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage your courses, pricing, and learning content.
          </p>

          <p className="mt-2 text-sm text-text-secondary">
            {totalCourses} {totalCourses === 1 ? "course" : "courses"} total
          </p>
        </div>
      </div>

      <Button asChild className="w-full sm:w-auto">
        <Link href="/academic/courses/create">
          <Plus className="mr-2 size-4" />
          Create Course
        </Link>
      </Button>
    </div>
  );
}
