"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useCourseSubjects, useDeleteCourseSubject } from "@/hooks/courses/use-course-subject";



export default function CourseSubjectsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectToDelete, setSubjectToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const {
    data: subjects = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useCourseSubjects(courseId);

  const deleteMutation = useDeleteCourseSubject();

  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        subject.name.toLowerCase().includes(query) ||
        (subject.description ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && subject.isPublished) ||
        (statusFilter === "unpublished" && !subject.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [subjects, search, statusFilter]);

  async function handleDelete() {
    if (!subjectToDelete) return;

    try {
      await deleteMutation.mutateAsync(subjectToDelete.id);
      toast.success("Subject deleted successfully");
      setSubjectToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete subject",
      );
    }
  }

  return (
    <main className="space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" asChild className="-ml-3 mb-2">
            <Link href="/admin/courses">
              <ArrowLeft className="mr-2 size-4" />
              Back to courses
            </Link>
          </Button>

          <h1 className="text-2xl font-bold tracking-tight">Course Subjects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage subject content, publication and display order.
          </p>
        </div>

        <Button asChild>
          <Link href={`/admin/courses/${courseId}/subjects/new`}>
            <Plus className="mr-2 size-4" />
            Add subject
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total subjects</p>
          <p className="mt-2 text-2xl font-semibold">{subjects.length}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="mt-2 text-2xl font-semibold">
            {subjects.filter((subject) => subject.isPublished).length}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Unpublished</p>
          <p className="mt-2 text-2xl font-semibold">
            {subjects.filter((subject) => !subject.isPublished).length}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search subjects..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </section>

      {isPending ? (
        <div className="rounded-xl border p-12 text-center">
          <RefreshCw className="mx-auto size-6 animate-spin text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading subjects...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="font-medium">Unable to load subjects</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <BookOpen className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No subjects found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Change your filters or add a subject to this course.
          </p>
          {!search && statusFilter === "all" && (
            <Button asChild className="mt-4">
              <Link href={`/admin/courses/${courseId}/subjects/new`}>
                <Plus className="mr-2 size-4" />
                Create first subject
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="border-t">
                    <td className="px-4 py-4">
                      <p className="font-medium">{subject.name}</p>
                      <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
                        {subject.description || "No description"}
                      </p>
                    </td>

                    <td className="px-4 py-4">{subject.order}</td>

                    <td className="px-4 py-4">
                      <Badge
                        variant={subject.isPublished ? "default" : "secondary"}
                      >
                        {subject.isPublished ? "Published" : "Unpublished"}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/admin/courses/${courseId}/subjects/${subject.id}/edit`}
                            aria-label={`Edit ${subject.name}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label={`Delete ${subject.name}`}
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            setSubjectToDelete({
                              id: subject.id,
                              name: subject.name,
                            })
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t px-4 py-3 text-sm text-muted-foreground">
            Showing {filteredSubjects.length} of {subjects.length} subjects
          </div>
        </div>
      )}

      <AlertDialog
        open={Boolean(subjectToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setSubjectToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this subject?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{subjectToDelete?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete subject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
