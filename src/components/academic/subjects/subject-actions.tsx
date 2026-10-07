"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { setSubjectStatusAction } from "@/actions/academic/subject/subject-actions";
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

interface SubjectActionsProps {
  subjectId: string;
  isActive: boolean;
}

export function SubjectActions({
  subjectId,
  isActive,
}: SubjectActionsProps) {
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange() {
    setIsUpdating(true);

    try {
      const result = await setSubjectStatusAction(
        subjectId,
        !isActive,
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ["academic", "subjects"],
      });

      toast.success(
        isActive
          ? "Subject deactivated successfully."
          : "Subject activated successfully.",
      );

      setDialogOpen(false);
    } catch (error) {
      console.error(
        "Subject status update error:",
        error,
      );

      toast.error("Unable to update subject status.");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Subject actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link
              href={`/academic/subjects/${subjectId}/edit`}
            >
              Edit
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => setDialogOpen(true)}
          >
            {isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!isUpdating) {
            setDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive
                ? "Deactivate subject?"
                : "Activate subject?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {isActive
                ? "This subject will no longer be available for new academic assignments."
                : "This subject will become available for academic assignments again."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isUpdating}
            >
              {isUpdating
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