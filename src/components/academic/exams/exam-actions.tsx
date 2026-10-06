"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Power } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

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
import { setExamStatusAction } from "@/actions/academic/exam/exam-actions";


interface ExamActionsProps {
  examId: string;
  isActive?: boolean;
}

export function ExamActions({ examId, isActive }: ExamActionsProps) {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStatusChange() {
    setIsSubmitting(true);

    try {
      const result = await setExamStatusAction(examId, !isActive);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["academic", "exams"],
      });

      toast.success(
        isActive
          ? "Exam deactivated successfully."
          : "Exam activated successfully.",
      );

      setDialogOpen(false);
    } catch (error) {
      console.error("Update exam status error:", error);

      toast.error("Unable to update exam status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Exam actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/academic/exams/${examId}/edit`}>
              <Pencil className="mr-2 size-4" />
              Edit
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
            <Power className="mr-2 size-4" />

            {isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Deactivate this exam?" : "Activate this exam?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {isActive
                ? "This exam will no longer be available as an active examination."
                : "This exam will become active and available for academic management."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                handleStatusChange();
              }}
            >
              {isSubmitting
                ? "Updating..."
                : isActive
                  ? "Deactivate"
                  : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
