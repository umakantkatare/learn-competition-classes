
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Plus, X, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import type { Course } from "@/services/academic/course/types";

import {
  assignSubjectToCourseAction,
  removeSubjectFromCourseAction,
} from "@/actions/academic/course/courses-subjects-actions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

interface CourseSubject {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface CourseSubjectsProps {
  courseId: string;
}

export function CourseSubjects({ courseId }: CourseSubjectsProps) {
  const queryClient = useQueryClient();

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [removeSubject, setRemoveSubject] = useState<CourseSubject | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const assignedQueryKey = ["academic", "course-subjects", courseId];
  const availableQueryKey = [
    "academic",
    "available-course-subjects",
    courseId,
  ];

  const {
    data: subjects = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: assignedQueryKey,
    queryFn: () => getCourseSubjects(courseId),
  });

  const { data: availableSubjects = [] } = useQuery({
    queryKey: availableQueryKey,
    queryFn: () => getAvailableCourseSubjects(courseId),
    enabled: assignOpen,
  });

  async function handleAssign() {
    if (!selectedSubjectId) {
      toast.error("Select a subject first.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await assignSubjectToCourseAction({
        courseId,
        subjectId: selectedSubjectId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assignedQueryKey }),
        queryClient.invalidateQueries({ queryKey: availableQueryKey }),
      ]);

      toast.success(result.message);
      setSelectedSubjectId("");
      setAssignOpen(false);
    } catch (error) {
      console.error("Assign course subject error:", error);
      toast.error("Unable to assign subject.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove() {
    if (!removeSubject) return;

    setIsSaving(true);

    try {
      const result = await removeSubjectFromCourseAction(
        courseId,
        removeSubject.id,
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: assignedQueryKey }),
        queryClient.invalidateQueries({ queryKey: availableQueryKey }),
      ]);

      toast.success(result.message);
      setRemoveSubject(null);
    } catch (error) {
      console.error("Remove course subject error:", error);
      toast.error("Unable to remove subject.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Subjects</CardTitle>
            <CardDescription className="mt-1">
              Subjects included in this course.
            </CardDescription>
          </div>

          <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                Assign Subject
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign a subject</DialogTitle>
                <DialogDescription>
                  Choose an active subject to include in this course.
                </DialogDescription>
              </DialogHeader>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={isSaving}
                  >
                    {availableSubjects.find(
                      (subject) => subject.id === selectedSubjectId,
                    )?.name ?? "Select a subject"}
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search subjects..." />
                    <CommandList>
                      <CommandEmpty>No available subjects.</CommandEmpty>
                      <CommandGroup>
                        {availableSubjects.map((subject) => (
                          <CommandItem
                            key={subject.id}
                            value={subject.name}
                            onSelect={() =>
                              setSelectedSubjectId(subject.id)
                            }
                          >
                            <Check
                              className={`mr-2 size-4 ${
                                selectedSubjectId === subject.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            />
                            {subject.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Button
                onClick={handleAssign}
                disabled={!selectedSubjectId || isSaving}
              >
                {isSaving ? "Assigning..." : "Assign Subject"}
              </Button>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <p className="text-sm text-text-secondary">Loading subjects...</p>
          ) : isError ? (
            <div className="space-y-3">
              <p className="text-sm text-destructive">
                Unable to load course subjects.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex min-h-36 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
              <BookOpen className="size-7 text-text-secondary" />
              <p className="mt-3 font-medium text-text-primary">
                No subjects assigned
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                Assign subjects to organize this course.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <BookOpen className="size-5 shrink-0 text-brand-primary" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-text-primary">
                        {subject.name}
                      </p>
                      <Badge variant="secondary" className="mt-1">
                        {subject.slug}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${subject.name} from course`}
                    onClick={() => setRemoveSubject(subject)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(removeSubject)}
        onOpenChange={(open) => {
          if (!open && !isSaving) setRemoveSubject(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subject?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeSubject
                ? `${removeSubject.name} will be removed from this course.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isSaving}
            >
              {isSaving ? "Removing..." : "Remove Subject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
