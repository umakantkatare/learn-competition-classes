"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";
import { toast } from "sonner";
import { upload } from "@imagekit/next";

import {
  Loader2,
  Plus,
  Pencil,
  RotateCcw,
  UserRound,
  Mail,
  Phone,
  BriefcaseBusiness,
  GraduationCap,
  X,
  BookOpen,
  Trash2,
  FileText,
} from "lucide-react";

// Hooks
import {
  useCreateTeacher,
  useUpdateTeacher,
} from "@/hooks/academic/use-teachers";

// Validation
import { createTeacherSchema } from "@/validations/academic/teacher-validations";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/constants/image-size";

// --------------------------------------------------
// Types
// --------------------------------------------------

type TeacherFormValues = z.input<typeof createTeacherSchema>;

interface TeacherFormProps {
  initialData?: TeacherFormValues & {
    id: string;
  };

  onSuccessCallback?: () => void;

  open?: boolean;

  onOpenChange?: (open: boolean) => void;

  hideTrigger?: boolean;
}

interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
}

// --------------------------------------------------
// Default Values
// --------------------------------------------------

const getDefaultValues = (
  initialData?: TeacherFormProps["initialData"],
): TeacherFormValues => ({
  name: initialData?.name ?? "",
  email: initialData?.email ?? "",
  phoneNumber: initialData?.phoneNumber ?? "",
  image: initialData?.image ?? null,
  avatarFileId: initialData?.avatarFileId ?? null,
  bio: initialData?.bio ?? "",
  subject: initialData?.subject ?? [],
  experienceYears: initialData?.experienceYears ?? 1,
  qualification: initialData?.qualification ?? "",
});

// --------------------------------------------------
// ImageKit Authenticator
// --------------------------------------------------

async function authenticator(): Promise<ImageKitAuthParams> {
  const response = await fetch("/api/upload-auth", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate ImageKit upload.");
  }

  return response.json();
}

// --------------------------------------------------
// Component
// --------------------------------------------------

export default function TeacherForm({
  initialData,
  onSuccessCallback,
  open: controlledOpen,
  onOpenChange,
  hideTrigger = false,
}: TeacherFormProps) {
  // Dialog State
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;

  const open = isControlled ? controlledOpen : internalOpen;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Subject Input
  const [subjectInput, setSubjectInput] = useState("");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Edit Mode
  const isEditing = Boolean(initialData);

  // --------------------------------------------------
  // Mutations
  // --------------------------------------------------

  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();

  const isPending =
    createTeacherMutation.isPending || updateTeacherMutation.isPending;

  // --------------------------------------------------
  // React Hook Form
  // --------------------------------------------------

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const imageUrl = form.watch("image");
  const selectedSubjects = form.watch("subject") ?? [];

  // --------------------------------------------------
  // Reset Form
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    form.reset(getDefaultValues(initialData));

    setPreviewUrl(null);
    setSubjectInput("");
  }, [initialData, open, form]);

  // --------------------------------------------------
  // Cleanup Object URL
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // --------------------------------------------------
  // Cleanup Upload
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // --------------------------------------------------
  // Image Upload
  // --------------------------------------------------

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (isUploading || isPending) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG and WebP images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size cannot exceed 5MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);

    setPreviewUrl(localPreview);

    const controller = new AbortController();

    abortControllerRef.current = controller;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const authParams = await authenticator();

      const uploadResponse = await upload({
        ...authParams,
        file,
        fileName: file.name,
        useUniqueFileName: true,
        folder: "/teachers",

        onProgress: (event) => {
          const progress =
            event.total > 0
              ? Math.round((event.loaded / event.total) * 100)
              : 0;

          setUploadProgress(progress);
        },

        abortSignal: controller.signal,
      });

      form.setValue("image", uploadResponse.url, {
        shouldValidate: true,
        shouldDirty: true,
      });

      form.setValue("avatarFileId", uploadResponse.fileId, {
        shouldValidate: true,
        shouldDirty: true,
      });

      setPreviewUrl(null);

      toast.success("Profile image uploaded successfully.");
    } catch (error) {
      setPreviewUrl(null);

      if (controller.signal.aborted) {
        toast.info("Image upload cancelled.");
        return;
      }

      console.error("ImageKit upload failed:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to upload profile image.",
      );
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  }

  // --------------------------------------------------
  // Cancel Upload
  // --------------------------------------------------

  function handleCancelUpload() {
    abortControllerRef.current?.abort();
  }

  // --------------------------------------------------
  // Remove Image
  // --------------------------------------------------

  function handleRemoveImage() {
    if (isUploading || isPending) return;

    setPreviewUrl(null);

    form.setValue("image", null, {
      shouldValidate: true,
      shouldDirty: true,
    });

    form.setValue("avatarFileId", null, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    toast.success("Profile image removed.");
  }

  // --------------------------------------------------
  // Subjects Management
  // --------------------------------------------------

  function handleAddSubject() {
    const subject = subjectInput.trim();

    if (!subject) return;

    if (selectedSubjects.length >= 10) {
      toast.error("You can select a maximum of 10 subjects.");
      return;
    }

    const alreadyExists = selectedSubjects.some(
      (item) => item.toLowerCase() === subject.toLowerCase(),
    );

    if (alreadyExists) {
      toast.error("This subject has already been added.");
      return;
    }

    if (subject.length < 2 || subject.length > 50) {
      toast.error("Subject must contain 2 to 50 characters.");
      return;
    }

    form.setValue("subject", [...selectedSubjects, subject], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setSubjectInput("");
  }

  function handleRemoveSubject(subjectToRemove: string) {
    form.setValue(
      "subject",
      selectedSubjects.filter((subject) => subject !== subjectToRemove),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  }

  function handleSubjectKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSubject();
    }
  }

  // --------------------------------------------------
  // Submit Form
  // --------------------------------------------------

  async function onSubmit(values: TeacherFormValues) {
    if (isUploading) {
      toast.error("Please wait until image upload completes.");
      return;
    }

    try {
      if (isEditing && initialData) {
        const result = await updateTeacherMutation.mutateAsync({
          id: initialData.id,
          payload: values,
        });

        if (!result.success) {
          throw new Error(result.message || "Unable to update teacher.");
        }

        toast.success("Teacher updated successfully.");
      } else {
        const result = await createTeacherMutation.mutateAsync(values);

        if (!result.success) {
          throw new Error(result.message || "Unable to create teacher.");
        }

        toast.success("Teacher created successfully.");
      }

      handleOpenChange(false);

      setPreviewUrl(null);

      onSuccessCallback?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save teacher. Please try again.",
      );
    }
  }

  // --------------------------------------------------
  // Dialog Actions
  // --------------------------------------------------

  function handleOpenChange(nextOpen: boolean) {
    if (isPending || isUploading) return;

    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      form.reset(getDefaultValues(initialData));

      setPreviewUrl(null);
      setSubjectInput("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger */}

      {!hideTrigger && (
        <div className="flex justify-end mb-5">
          <DialogTrigger
            render={
              <Button>
                {isEditing ? (
                  <>
                    <Pencil className="mr-2 size-4" />
                    Edit Teacher
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Create Teacher
                  </>
                )}
              </Button>
            }
          />
        </div>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        {/* Header */}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEditing ? (
                <Pencil className="size-4" />
              ) : (
                <GraduationCap className="size-4" />
              )}
            </span>

            {isEditing ? "Edit Teacher" : "Create Teacher"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the teacher profile and professional details."
              : "Enter the details below to add a new teacher."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 border-t pt-6"
          noValidate
        >
          {/* ====================================== */}
          {/* Personal Information */}
          {/* ====================================== */}

          <section className="space-y-4">
            {/* Profile Image */}

            <section className="flex flex-col items-center gap-3">
              <div className="group relative">
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted">
                  {previewUrl || imageUrl ? (
                    <Image
                      src={previewUrl || imageUrl!}
                      alt="Teacher profile"
                      width={96}
                      height={96}
                      unoptimized={!!previewUrl}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-10 text-muted-foreground" />
                  )}
                </div>

                <button
                  type="button"
                  disabled={isPending || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
                  aria-label="Upload profile image"
                >
                  {isUploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : imageUrl ? (
                    <Pencil className="size-3.5" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </button>
              </div>

              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold">Profile Photo</p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP. Maximum 5MB.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isPending || isUploading}
                onChange={handleImageUpload}
              />

              {isUploading && (
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uploading image...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={uploadProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleCancelUpload}
                  >
                    <X className="mr-2 size-3" />
                    Cancel Upload
                  </Button>
                </div>
              )}

              {(imageUrl || previewUrl) && !isUploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={handleRemoveImage}
                >
                  <Trash2 className="mr-1 size-3" />
                  Remove Photo
                </Button>
              )}
            </section>

            {/* Full Name */}

            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Full Name *</FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    placeholder="Enter teacher name"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Email */}

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">Email Address *</FieldLabel>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="teacher@example.com"
                      className="pl-9"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                  </div>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Phone Number */}

            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phoneNumber">Phone Number *</FieldLabel>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      {...field}
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      className="pl-9"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                  </div>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </section>

          {/* ====================================== */}
          {/* Professional Information */}
          {/* ====================================== */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <GraduationCap className="size-4 text-muted-foreground" />

              <h3 className="text-sm font-semibold">
                Professional Information
              </h3>
            </div>

            {/* Experience */}

            <Controller
              control={form.control}
              name="experienceYears"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="experienceYears">
                    Experience (Years) *
                  </FieldLabel>

                  <div className="relative">
                    <BriefcaseBusiness className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      id="experienceYears"
                      type="number"
                      min={0}
                      max={60}
                      step={1}
                      placeholder="e.g. 5"
                      className="pl-9"
                      disabled={isPending}
                      value={String(field.value ?? 1)}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? ""
                            : Number(event.target.value),
                        )
                      }
                      aria-invalid={fieldState.invalid}
                    />
                  </div>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Qualification */}

            <Controller
              control={form.control}
              name="qualification"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="qualification">Qualification</FieldLabel>

                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      {...field}
                      value={field.value ?? ""}
                      id="qualification"
                      placeholder="e.g. M.Sc. Mathematics, B.Ed."
                      className="pl-9"
                      disabled={isPending}
                      aria-invalid={fieldState.invalid}
                    />
                  </div>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Subjects */}

            <Controller
              control={form.control}
              name="subject"
              render={({ fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="subject">Subjects *</FieldLabel>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <BookOpen className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="subject"
                        placeholder="e.g. Mathematics"
                        className="pl-9"
                        value={subjectInput}
                        disabled={isPending}
                        onChange={(event) =>
                          setSubjectInput(event.target.value)
                        }
                        onKeyDown={handleSubjectKeyDown}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddSubject}
                      disabled={
                        isPending ||
                        !subjectInput.trim() ||
                        selectedSubjects.length >= 10
                      }
                      aria-label="Add subject"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  {selectedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedSubjects.map((subject) => (
                        <span
                          key={subject}
                          className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2.5 py-1 text-xs font-medium"
                        >
                          {subject}

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleRemoveSubject(subject)}
                            className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                            aria-label={`Remove ${subject}`}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Add 1 to 10 subjects. Press Enter or click +.
                  </p>

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </section>

          {/* ====================================== */}
          {/* Additional Information */}
          {/* ====================================== */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <FileText className="size-4 text-muted-foreground" />

              <h3 className="text-sm font-semibold">Additional Information</h3>
            </div>

            {/* Bio */}

            <Controller
              control={form.control}
              name="bio"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="bio">Teacher Bio</FieldLabel>

                  <Textarea
                    {...field}
                    value={field.value ?? ""}
                    id="bio"
                    placeholder="Write a short introduction about the teacher..."
                    rows={4}
                    maxLength={2000}
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                    className="resize-none"
                  />

                  <div className="flex justify-between">
                    {fieldState.error ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <span />
                    )}

                    <span className="text-xs text-muted-foreground">
                      {(field.value ?? "").length}/2000
                    </span>
                  </div>
                </Field>
              )}
            />
          </section>

          {/* ====================================== */}
          {/* Form Actions */}
          {/* ====================================== */}

          <DialogFooter className="gap-2 border-t pt-4 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending || isUploading}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending || isUploading}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Teacher"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
