"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  TeacherProfileForm,
  type TeacherProfileFormValues,
} from "@/components/teacher/teacher-profile-form";

// import { useTeacherProfileByUserId } from "@/features/teacher-profile/hooks/use-teacher-profile";
// import { useUpdateTeacherProfile } from "@/features/teacher-profile/hooks/use-teacher-profile-mutations";

import { Button } from "@/components/ui/button";
import { useUpdateTeacherProfile } from "@/hooks/courses/use-teacher-profile";

export default function EditTeacherProfilePage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params.userId;

  const {
    data: profile,
    isPending,
    isError,
    refetch,
  } = useTeacherProfileByUserId(userId);

  const mutation = useUpdateTeacherProfile();

  useEffect(() => {
    if (isError) {
      toast.error("Unable to load teacher profile");
    }
  }, [isError]);

  async function handleSubmit(values: TeacherProfileFormValues) {
    try {
      await mutation.mutateAsync({
        userId,
        data: values,
      });

      toast.success("Teacher profile updated successfully");
      router.push("/admin/teacher-profiles");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update teacher profile",
      );
    }
  }

  if (isPending) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Loading teacher profile...
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">
          Teacher profile could not be loaded.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/teacher-profiles")}
          >
            Back to teachers
          </Button>
        </div>
      </div>
    );
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

        <h1 className="text-2xl font-bold">Edit Teacher Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update qualifications, experience and specializations.
        </p>
        <p className="mt-2 break-all text-xs text-muted-foreground">
          User ID: {profile.userId}
        </p>
      </div>

      <div className="rounded-xl border p-5 md:p-7">
        <TeacherProfileForm
          key={profile.userId}
          initialData={{
            bio: profile.bio,
            qualification: profile.qualification,
            experienceYears: profile.experienceYears,
            specializations: profile.specializations,
          }}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
