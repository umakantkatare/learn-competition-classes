"use client";

import { useMemo, useState } from "react";
import { AlertCircle, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import type { Course } from "@/services/academic/course/types";
import { useCourses, courseKeys } from "@/hooks/academic/courses/use-courses";

import { CourseFilters, type CourseStatusFilter } from "./course-filters";
import { CourseTable } from "./course-table";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { setCourseStatusAction } from "@/actions/academic/course/courses-actions";

export function CoursesContent() {
  const queryClient = useQueryClient();
  const { data: courses, isPending, isError, refetch } = useCourses();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CourseStatusFilter>("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    const normalizedSearch = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !normalizedSearch ||
        course.name.toLowerCase().includes(normalizedSearch) ||
        course.slug.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        status === "all" ||
        (status === "active" && course.isActive) ||
        (status === "inactive" && !course.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, status]);

  async function handleStatusChange() {
    if (!selectedCourse) return;

    setIsUpdating(true);

    try {
      const result = await setCourseStatusAction(
        selectedCourse.id,
        !selectedCourse.isActive,
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: courseKeys.all,
      });

      toast.success(
        `Course ${result.data.isActive ? "activated" : "deactivated"} successfully.`,
      );

      setSelectedCourse(null);
    } catch (error) {
      console.error("Course status update error:", error);
      toast.error("Unable to update course status.");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  if (isError || !courses) {
    return (
      <div className="flex flex-col items-center justify-center rounded-card border border-border p-8 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <h2 className="mt-3 font-semibold text-text-primary">
          Unable to load courses
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Check your connection and try again.
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const hasFilters = search.trim().length > 0 || status !== "all";

  return (
    <>
      <div className="space-y-5">
        <CourseFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />

        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border p-10 text-center">
            <BookOpen className="size-8 text-text-secondary" />
            <h2 className="mt-3 font-semibold text-text-primary">
              No courses yet
            </h2>
            <p className="mt-1 max-w-sm text-sm text-text-secondary">
              Create your first course to start organizing learning content.
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-card border border-dashed border-border p-8 text-center">
            <h2 className="font-semibold text-text-primary">
              No matching courses
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Try changing your search or status filter.
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary">
              Showing {filteredCourses.length} of {courses.length} courses.
            </p>

            <CourseTable
              courses={filteredCourses}
              onStatusChange={setSelectedCourse}
            />
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(selectedCourse)}
        onOpenChange={(open) => {
          if (!open && !isUpdating) setSelectedCourse(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCourse?.isActive
                ? "Deactivate course?"
                : "Activate course?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCourse
                ? selectedCourse.isActive
                  ? `${selectedCourse.name} will no longer be available in active course listings.`
                  : `${selectedCourse.name} will become available in active course listings.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isUpdating}
            >
              {isUpdating
                ? "Updating..."
                : selectedCourse?.isActive
                  ? "Deactivate"
                  : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
