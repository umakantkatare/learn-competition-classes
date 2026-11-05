"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  RefreshCw,
  Mail,
  Phone,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetAllTeachers,
  useDeleteTeacher,
} from "@/hooks/academic/use-teachers";

import TeacherForm from "./teacher-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string | string[];
  experienceYears: number;
  qualification: string;
};

function TeacherListSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading teachers" aria-busy="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}

function normalizeSubjects(subject: string | string[]): string[] {
  if (Array.isArray(subject)) return subject;

  if (!subject) return [];

  const value = subject.trim();

  if (value.startsWith("{") && value.endsWith("}")) {
    return value
      .slice(1, -1)
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map((item) => item.trim().replace(/^"(.*)"$/, "$1"))
      .filter(Boolean);
  }

  return [value];
}

function TeacherEmptyState({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Users className="size-7 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          {isSearching ? "No matching teachers" : "No teachers yet"}
        </h3>

        <p className="max-w-sm text-sm text-muted-foreground">
          {isSearching
            ? "Try searching with a different name, email, phone or subject."
            : "Teacher profiles will appear here when they are available."}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Error State
// ---------------------------------------------

function TeacherErrorState({
  onRetry,
  isFetching,
  message,
}: {
  onRetry: () => void;
  isFetching: boolean;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="size-7 text-destructive" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          Failed to load teachers
        </h3>

        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <Button variant="outline" onClick={onRetry} disabled={isFetching}>
        <RefreshCw
          className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
        />
        {isFetching ? "Retrying..." : "Try again"}
      </Button>
    </div>
  );
}

// ---------------------------------------------
// Delete Confirmation Dialog
// ---------------------------------------------

function DeleteTeacherDialog({
  teacher,
  isDeleting,
  onClose,
  onConfirm,
}: {
  teacher: Teacher | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={Boolean(teacher)}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>

          <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {teacher?.name}
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} onClick={onClose}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isDeleting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 size-4" />
                Delete Teacher
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------
// Teacher List
// ---------------------------------------------

export default function TeacherList() {
  const {
    data: teachers,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAllTeachers();

  const deleteTeacherMutation = useDeleteTeacher();

  const isDeleting = deleteTeacherMutation.isPending;

  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // -------------------------------------------
  // Search and Filter
  // -------------------------------------------

  const filteredTeachers = useMemo(() => {
    const list = (teachers ?? []) as Teacher[];
    const query = search.trim().toLowerCase();

    if (!query) return list;

    return list.filter((teacher) =>
      [
        teacher.name,
        teacher.email,
        teacher.phone,
        teacher.subject,
        teacher.experienceYears,
        teacher.qualification,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [teachers, search]);

  console.log("filtered-list", filteredTeachers);

  // -------------------------------------------
  // Refresh
  // -------------------------------------------

  function handleRefresh() {
    void refetch();
  }

  // -------------------------------------------
  // Delete Teacher
  // -------------------------------------------

  async function handleDeleteTeacher() {
    if (!teacherToDelete || isDeleting) return;

    try {
      await deleteTeacherMutation.mutateAsync(teacherToDelete.id);

      toast.success("Teacher deleted successfully.");
      setTeacherToDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete teacher. Please try again.",
      );
    }
  }

  // -------------------------------------------
  // Render
  // -------------------------------------------

  return (
    <>
      <Card className="rounded-card border-border/70 bg-card shadow-sm">
        {/* Header */}

        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              Teachers
            </CardTitle>

            <CardDescription>
              Manage teacher profiles, qualifications, experience and subjects.
            </CardDescription>
          </div>

          {/* Search */}

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search teachers..."
              className="h-10 rounded-input bg-background pl-9"
              aria-label="Search teachers"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <TeacherListSkeleton />
          ) : isError ? (
            <TeacherErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Something went wrong while fetching teachers."
              }
              onRetry={handleRefresh}
              isFetching={isFetching}
            />
          ) : (
            <>
              {/* Toolbar */}

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    {filteredTeachers.length}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {filteredTeachers.length === 1
                      ? "Teacher found"
                      : "Teachers found"}
                  </span>

                  {isFetching && (
                    <span className="text-xs text-muted-foreground">
                      Updating...
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFetching}
                  onClick={handleRefresh}
                  className="w-fit rounded-button"
                >
                  <RefreshCw
                    className={`mr-2 size-4 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Empty State / Table */}

              {filteredTeachers.length === 0 ? (
                <TeacherEmptyState isSearching={Boolean(search.trim())} />
              ) : (
                <div className="relative w-full max-w-full max-h-[500px] overflow-auto rounded-section border border-border">
                  <Table className="min-w-[1000px] w-full">
                    <TableHeader className="sticky top-0 z-10 bg-muted shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-44 font-semibold">
                          Teacher
                        </TableHead>

                        <TableHead className="min-w-52 font-semibold">
                          Email
                        </TableHead>

                        <TableHead className="min-w-36 font-semibold">
                          Phone
                        </TableHead>

                        <TableHead className="min-w-36 font-semibold">
                          Subject
                        </TableHead>

                        <TableHead className="min-w-32 font-semibold">
                          Experience
                        </TableHead>

                        <TableHead className="min-w-40 font-semibold">
                          Qualification
                        </TableHead>

                        <TableHead className="w-16 text-right font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredTeachers.map((teacher) => (
                        <TableRow
                          key={teacher.id}
                          className="transition-colors hover:bg-accent/40"
                        >
                          {/* Name */}

                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {teacher.name?.charAt(0)?.toUpperCase() || "T"}
                              </div>

                              <span>{teacher.name || "—"}</span>
                            </div>
                          </TableCell>

                          {/* Email */}

                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="size-3.5 shrink-0" />
                              <span className="truncate">
                                {teacher.email || "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Phone */}

                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="size-3.5 shrink-0" />
                              {teacher.phone || "—"}
                            </div>
                          </TableCell>

                          {/* Subject */}

                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <BookOpen className="size-3.5 shrink-0" />

                              <span>
                                {normalizeSubjects(teacher.subject).join(
                                  ", ",
                                ) || "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Experience */}

                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm">
                              <BriefcaseBusiness className="size-4 text-muted-foreground" />
                              {teacher.experienceYears ?? 0} Years
                            </div>
                          </TableCell>

                          {/* Qualification */}

                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <GraduationCap className="size-4 shrink-0" />
                              {teacher.qualification || "—"}
                            </div>
                          </TableCell>

                          {/* Actions */}

                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label={`Actions for ${teacher.name}`}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                }
                              />

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setSelectedTeacher(teacher)}
                                >
                                  <Pencil className="mr-2 size-4" />
                                  Edit
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() => setTeacherToDelete(teacher)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}

      {selectedTeacher && (
        <TeacherForm
          key={selectedTeacher.id}
          open={Boolean(selectedTeacher)}
          hideTrigger
          initialData={{
            id: selectedTeacher.id,
            name: selectedTeacher.name,
            email: selectedTeacher.email,
            phoneNumber: selectedTeacher.phone,
            subject: normalizeSubjects(selectedTeacher.subject),
            experienceYears: selectedTeacher.experienceYears,
            qualification: selectedTeacher.qualification,
          }}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTeacher(null);
            }
          }}
          onSuccessCallback={() => {
            setSelectedTeacher(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}

      <DeleteTeacherDialog
        teacher={teacherToDelete}
        isDeleting={isDeleting}
        onClose={() => setTeacherToDelete(null)}
        onConfirm={handleDeleteTeacher}
      />
    </>
  );
}
