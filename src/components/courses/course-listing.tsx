"use client";

import { useMemo } from "react";

import { CourseCard } from "./course-card";
import { CourseFilters } from "./course-filters";
import { useCourseUIStore } from "@/store/course/course-store";
import { useCourses } from "@/hooks/courses/use-courses";

export function CourseListing() {
  const { data: courses, isPending, isError, error, refetch } = useCourses();

  const search = useCourseUIStore((state) => state.search);
  const activeOnly = useCourseUIStore((state) => state.activeOnly);

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return (courses ?? []).filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(normalizedSearch) ||
        course.slug.toLowerCase().includes(normalizedSearch);

      const matchesStatus = !activeOnly || course.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, activeOnly]);

  if (isPending) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Loading courses...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-3 py-12 text-center">
        <p className="text-destructive">
          {error.message || "Unable to load courses."}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Courses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse available courses.
        </p>
      </div>

      <CourseFilters />

      {filteredCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h2 className="font-semibold">No courses found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </section>
  );
}
