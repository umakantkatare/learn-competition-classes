"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  BookOpen,
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

type Course = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  price: number;
  salePrice: number | null;
  isActive: boolean;
  createdAt: string | Date;
};

async function fetchAdminCourses(): Promise<Course[]> {
  const response = await fetch("/api/admin/courses", {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Failed to load courses");
  }

  return result.data;
}

async function deleteCourse(id: string) {
  const response = await fetch(`/api/courses/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Failed to delete course");
  }
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const {
    data: courses = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "courses"],
    queryFn: fetchAdminCourses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: async () => {
      toast.success("Course deleted successfully");
      setCourseToDelete(null);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["admin", "courses"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["courses"],
        }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to delete course");
    },
  });

  const filteredCourses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return courses.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.slug.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item.isActive) ||
        (statusFilter === "inactive" && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  return (
    <main className="space-y-6 p-4 md:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, update and manage your courses.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="mr-2 size-4" />
            Create Course
          </Link>
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Total courses</p>
          <p className="mt-2 text-2xl font-semibold">{courses.length}</p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="mt-2 text-2xl font-semibold">
            {courses.filter((item) => item.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <p className="mt-2 text-2xl font-semibold">
            {courses.filter((item) => !item.isActive).length}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by course name or slug..."
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
            Loading courses...
          </p>
        </div>
      ) : isError ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="font-medium">Unable to load courses</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <BookOpen className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No courses found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing the search or status filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-4">
                      <p className="font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        /{item.slug}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <div>{formatPrice(item.salePrice ?? item.price)}</div>
                      {item.salePrice !== null && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.price)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>

                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/admin/courses/${item.id}/edit`}
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="size-4" />
                          </Link>
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label={`Delete ${item.name}`}
                          disabled={deleteMutation.isPending}
                          onClick={() => setCourseToDelete(item)}
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
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>
      )}

      <AlertDialog
        open={Boolean(courseToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setCourseToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete <strong>{courseToDelete?.name}</strong>.
              This action may be irreversible.
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

                if (courseToDelete) {
                  deleteMutation.mutate(courseToDelete.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete course"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
