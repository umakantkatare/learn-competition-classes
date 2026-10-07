"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
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
import { assignSubjectToExamAction } from "@/actions/academic/exam/examId-actions";

interface AvailableSubject {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

interface AssignSubjectDialogProps {
  examId: string;
  availableSubjects: AvailableSubject[];
}

export function AssignSubjectDialog({
  examId,
  availableSubjects,
}: AssignSubjectDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  async function handleAssign(subjectId: string) {
    setIsAssigning(true);

    try {
      const result = await assignSubjectToExamAction({
        examId,
        subjectId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Subject assigned successfully.");

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(
        "Assign subject error:",
        error,
      );

      toast.error(
        "Unable to assign subject to exam.",
      );
    } finally {
      setIsAssigning(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isAssigning) {
          setOpen(nextOpen);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Subject
        </Button>
      </DialogTrigger>

      <DialogContent className="p-0 sm:max-w-[500px]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>
            Add Subject
          </DialogTitle>

          <DialogDescription>
            Select an active subject to add to this
            examination.
          </DialogDescription>
        </DialogHeader>

        <Command className="rounded-none border-0">
          <CommandInput
            placeholder="Search subjects..."
            disabled={isAssigning}
          />

          <CommandList className="max-h-[320px]">
            <CommandEmpty>
              No available subjects found.
            </CommandEmpty>

            <CommandGroup heading="Available Subjects">
              {availableSubjects.map((subject) => (
                <CommandItem
                  key={subject.id}
                  value={`${subject.name} ${subject.slug}`}
                  disabled={isAssigning}
                  onSelect={() =>
                    handleAssign(subject.id)
                  }
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium text-text-primary">
                      {subject.name}
                    </span>

                    <span className="text-xs text-text-secondary">
                      {subject.slug}
                    </span>
                  </div>

                  <Check className="ml-auto size-4 opacity-0" />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>

        {isAssigning && (
          <div className="border-t border-border px-6 py-3 text-sm text-text-secondary">
            Assigning subject...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}