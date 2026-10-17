"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCreateTeacherProfile } from "@/hooks/courses/use-teacher-profile";
import { Button } from "@/components/ui/button";
import {
  TeacherProfileForm,
  type TeacherProfileFormValues,
} from "@/components/teacher/teacher-profile-form";

export default function NewTeacherProfilePage() {
  const router = useRouter();
  const mutation = useCreateTeacherProfile();

  async function handleSubmit(values: TeacherProfileFormValues) {
    try {
      await mutation.mutateAsync(values);
      toast.success("Teacher profile created successfully");
      router.push("/admin/teacher-profiles");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create teacher profile",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/teacher-profiles")}
          className="mb-2 -ml-3"
        >
          Back to teachers
        </Button>

        <h1 className="text-2xl font-bold">Create Teacher Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add professional details and teaching specializations.
        </p>
      </div>

      <div className="rounded-xl border p-5 md:p-7">
        <TeacherProfileForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          submitLabel="Create Profile"
        />
      </div>
    </div>
  );
}
