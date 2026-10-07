"use client";

import { useState } from "react";
import { BookOpen, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import type { Subject } from "@/services/academic/subject/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

import { removeSubjectFromExamAction } from "@/actions/academic/exam/examId-actions";
import { AssignSubjectDialog } from "./assign-subject-dialog";

interface ExamSubjectsProps {
  examId: string;
  subjects: Subject[];
  availableSubjects: AvailableSubject[];
}

interface AvailableSubject {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export function ExamSubjects({
  examId,
  subjects,
  availableSubjects,
}: ExamSubjectsProps) {
  const queryClient = useQueryClient();

  const [removeSubject, setRemoveSubject] = useState<Subject | null>(null);

  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (!removeSubject) {
      return;
    }

    setIsRemoving(true);

    try {
      const result = await removeSubjectFromExamAction(
        examId,
        removeSubject.id,
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["academic", "exam-subjects", examId],
      });

      toast.success(`${removeSubject.name} removed from exam.`);

      setRemoveSubject(null);
    } catch (error) {
      console.error("Remove exam subject error:", error);

      toast.error("Unable to remove subject from exam.");
    } finally {
      setIsRemoving(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Subjects</CardTitle>

            <p className="mt-1 text-sm text-text-secondary">
              Subjects included in this examination.
            </p>
          </div>

          <AssignSubjectDialog
            examId={examId}
            availableSubjects={availableSubjects}
          />
        </CardHeader>

        <CardContent>
          {subjects.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted text-text-secondary">
                <BookOpen className="size-5" />
              </div>

              <h3 className="mt-3 font-medium text-text-primary">
                No subjects assigned
              </h3>

              <p className="mt-1 text-sm text-text-secondary">
                Add subjects to define this examination's academic structure.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                      <BookOpen className="size-4" />
                    </div>

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
                    className="shrink-0"
                    aria-label={`Remove ${subject.name}`}
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
          if (!open && !isRemoving) {
            setRemoveSubject(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove subject?</AlertDialogTitle>

            <AlertDialogDescription>
              {removeSubject
                ? `${removeSubject.name} will be removed from this examination.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleRemove} disabled={isRemoving}>
              {isRemoving ? "Removing..." : "Remove Subject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
