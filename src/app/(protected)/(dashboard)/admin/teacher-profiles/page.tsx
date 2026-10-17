"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  Pencil,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useDeleteTeacherProfile,
  useTeacherProfiles,
} from "@/hooks/courses/use-teacher-profile";

export default function TeacherProfilesPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const {
    data: teachers = [],
    isPending,
    isError,
    refetch,
  } = useTeacherProfiles();

  const deleteMutation = useDeleteTeacherProfile();

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return teachers;

    return teachers.filter((teacher) =>
      [
        teacher.userId,
        teacher.bio ?? "",
        teacher.qualification ?? "",
        ...teacher.specializations,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [teachers, search]);

  async function handleDelete(userId: string) {
    try {
      await deleteMutation.mutateAsync(userId);
      toast.success("Teacher profile deleted successfully");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete teacher profile",
      );
    }
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Teacher Profiles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage teacher qualifications, experience and specializations.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/teacher-profiles/new">
            <Plus className="mr-2 size-4" />
            Add Teacher Profile
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Profiles
            </CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teachers.length}</div>
            <p className="text-xs text-muted-foreground">
              Existing teacher profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Experience</CardTitle>
            <BriefcaseBusiness className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers.length
                ? (
                    teachers.reduce(
                      (total, teacher) => total + teacher.experienceYears,
                      0,
                    ) / teachers.length
                  ).toFixed(1)
                : "0"}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                years avg.
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Average teaching experience
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Specializations
            </CardTitle>
            <BookOpen className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                new Set(teachers.flatMap((teacher) => teacher.specializations))
                  .size
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Unique subjects covered
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Teachers</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {filteredTeachers.length} profile
                {filteredTeachers.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search bio, qualification, subject..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Loading teacher profiles...
            </div>
          ) : isError ? (
            <div className="space-y-3 py-10 text-center">
              <p className="text-sm text-destructive">
                Failed to load teacher profiles.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <GraduationCap className="size-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">
                  {search ? "No matching profiles" : "No teacher profiles yet"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search
                    ? "Try another search term."
                    : "Create a profile to get started."}
                </p>
              </div>
              {!search && (
                <Button asChild variant="outline">
                  <Link href="/admin/teacher-profiles/new">
                    <Plus className="mr-2 size-4" />
                    Add profile
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTeachers.map((teacher) => (
                <div
                  key={teacher.userId}
                  className="flex flex-col gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        {teacher.qualification || "Teacher"}
                      </h3>
                      <Badge variant="secondary">
                        {teacher.experienceYears} years experience
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      User ID: {teacher.userId}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {teacher.bio || "No bio added."}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {teacher.specializations.length > 0 ? (
                        teacher.specializations.map((specialization) => (
                          <Badge key={specialization} variant="outline">
                            {specialization}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No specializations added
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created {new Date(teacher.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/admin/teacher-profiles/${encodeURIComponent(teacher.userId)}/edit`}
                      >
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          aria-label="Delete teacher profile"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete teacher profile?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this profile. The
                            associated user account will not be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(teacher.userId)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending
                              ? "Deleting..."
                              : "Delete profile"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
