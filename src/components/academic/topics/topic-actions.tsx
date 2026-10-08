"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Power } from "lucide-react";

import type { TopicWithSubject } from "@/services/academic/topic/types";

import { Button } from "@/components/ui/button";
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
import { setTopicStatusAction } from "@/actions/academic/topic/topic-actions";

interface TopicActionsProps {
  topic: TopicWithSubject | null;
  onClose: () => void;
}

export function TopicActions({ topic, onClose }: TopicActionsProps) {
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleStatusChange() {
    if (!topic) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await setTopicStatusAction(topic.id, !topic.isActive);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["academic", "topics"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["academic", "subject-topics", topic.subject.id],
        }),
      ]);

      toast.success(
        topic.isActive
          ? "Topic deactivated successfully."
          : "Topic activated successfully.",
      );

      onClose();
    } catch (error) {
      console.error("Topic status change error:", error);

      toast.error("Unable to update topic status.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AlertDialog
      open={Boolean(topic)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {topic?.isActive ? "Deactivate topic?" : "Activate topic?"}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {topic
              ? topic.isActive
                ? `${topic.name} will be marked as inactive and will no longer be available for active academic use.`
                : `${topic.name} will be marked as active and available for academic use.`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            onClick={handleStatusChange}
            disabled={isSubmitting}
          >
            <Power className="mr-2 size-4" />

            {isSubmitting
              ? "Updating..."
              : topic?.isActive
                ? "Deactivate"
                : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
