"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  Loader2,
  Plus,
  Pencil,
  RotateCcw,
  Users,
  UserRound,
  Mail,
  Phone,
  BriefcaseBusiness,
  X,
} from "lucide-react";

import { upload } from "@imagekit/next";

// Hooks
import {
  useCreateManager,
  useUpdateManagerProfile,
} from "@/hooks/academic/use-managers";

// Validation
import { createManagerProfileSchema } from "@/validations/academic/manager-validations";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

type ManagerFormValues = z.infer<typeof createManagerProfileSchema>;

interface ManagerFormProps {
  initialData?: ManagerFormValues & {
    id: string;
  };

  onSuccessCallback?: () => void;
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
  initialData?: ManagerFormProps["initialData"],
): ManagerFormValues => ({
  name: initialData?.name ?? "",
  email: initialData?.email ?? "",
  phoneNumber: initialData?.phoneNumber ?? "",
  employeeCode: initialData?.employeeCode ?? "",
  image: initialData?.image ?? null,
  avatarFileId: initialData?.avatarFileId ?? null,
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

export default function ManagerForm({
  initialData,
  onSuccessCallback,
}: ManagerFormProps) {
  // Dialog State
  const [open, setOpen] = useState(false);

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Edit Mode
  const isEditing = Boolean(initialData);

  // --------------------------------------------------
  // Mutations
  // --------------------------------------------------

  const createManagerMutation = useCreateManager();
  const updateManagerMutation = useUpdateManagerProfile();

  const isPending =
    createManagerMutation.isPending || updateManagerMutation.isPending;

  // --------------------------------------------------
  // React Hook Form
  // --------------------------------------------------

  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(createManagerProfileSchema),
    defaultValues: getDefaultValues(initialData),
  });

  const imageUrl = form.watch("image");

  // --------------------------------------------------
  // Reset Form
  // --------------------------------------------------

  useEffect(() => {
    if (!open) return;

    form.reset(getDefaultValues(initialData));
    setPreviewUrl(null);
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

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    // Prevent multiple uploads.
    if (isUploading || isPending) return;

    // Validate image format.
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Only JPEG, PNG and WebP images are allowed.");
      return;
    }

    // Validate image size.
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Image size cannot exceed 5MB.");
      return;
    }

    // Generate local preview.
    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Get ImageKit authentication parameters.
      const authParams = await authenticator();

      // Upload image to ImageKit.
      const uploadResponse = await upload({
        ...authParams,

        file,
        fileName: file.name,
        useUniqueFileName: true,
        folder: "/managers",

        onProgress: (event) => {
          const progress =
            event.total > 0
              ? Math.round((event.loaded / event.total) * 100)
              : 0;

          setUploadProgress(progress);
        },

        abortSignal: controller.signal,
      });

      // Store ImageKit URL.
      form.setValue("image", uploadResponse.url, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Store ImageKit File ID.
      form.setValue("avatarFileId", uploadResponse.fileId, {
        shouldValidate: true,
        shouldDirty: true,
      });

      // Switch from local preview to ImageKit URL.
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
  // Submit Form
  // --------------------------------------------------

  async function onSubmit(values: ManagerFormValues) {
    if (isUploading) {
      toast.error("Please wait until image upload completes.");
      return;
    }

    try {
      if (isEditing && initialData) {
        await updateManagerMutation.mutateAsync({
          id: initialData.id,
          formData: values,
        });

        toast.success("Manager updated successfully.");
      } else {
        await createManagerMutation.mutateAsync(values);

        toast.success("Manager created successfully.");
      }

      setOpen(false);
      setPreviewUrl(null);

      onSuccessCallback?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save manager. Please try again.",
      );
    }
  }

  // --------------------------------------------------
  // Dialog Actions
  // --------------------------------------------------

  function handleOpenChange(nextOpen: boolean) {
    if (isPending || isUploading) return;

    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset(getDefaultValues(initialData));
      setPreviewUrl(null);
    }
  }

  function handleReset() {
    if (isUploading || isPending) return;

    form.reset(getDefaultValues(initialData));
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Trigger */}

      <DialogTrigger
        render={
          <Button>
            {isEditing ? (
              <>
                <Pencil className="mr-2 size-4" />
                Edit Manager
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Create Manager
              </>
            )}
          </Button>
        }
      />

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        {/* Header */}

        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEditing ? (
                <Pencil className="size-4" />
              ) : (
                <Users className="size-4" />
              )}
            </span>

            {isEditing ? "Edit Manager" : "Create Manager"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the manager profile details."
              : "Enter the details below to create a new manager."}
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
              {/* Avatar Preview */}

              <div className="group relative">
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted">
                  {previewUrl || imageUrl ? (
                    <Image
                      src={previewUrl || imageUrl!}
                      alt="Manager profile"
                      width={96}
                      height={96}
                      unoptimized={!!previewUrl}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <UserRound className="size-10 text-muted-foreground" />
                  )}
                </div>

                {/* Upload / Replace Button */}

                <button
                  type="button"
                  disabled={isPending || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                  aria-label={
                    imageUrl ? "Change profile image" : "Upload profile image"
                  }
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

              {/* Upload Information */}

              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold">Profile Photo</p>

                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WebP. Maximum 5MB.
                </p>
              </div>

              {/* Hidden File Input */}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isPending || isUploading}
                onChange={handleImageUpload}
              />

              {/* Upload Progress */}

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
                    aria-label="Image upload progress"
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
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

              {/* Remove Image */}

              {(imageUrl || previewUrl) && !isUploading && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive hover:text-destructive"
                  disabled={isPending}
                  onClick={handleRemoveImage}
                >
                  <X className="mr-1 size-3" />
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
                  <FieldLabel htmlFor="name">
                    Full Name
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    placeholder="Enter manager name"
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
                  <FieldLabel htmlFor="email">
                    Email Address
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="manager@example.com"
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
                  <FieldLabel htmlFor="phoneNumber">
                    Phone Number
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      {...field}
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter phone number"
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
          {/* Employment Information */}
          {/* ====================================== */}

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <BriefcaseBusiness className="size-4 text-muted-foreground" />

              <h3 className="text-sm font-semibold">Employment Information</h3>
            </div>

            {/* Employee Code */}

            <Controller
              control={form.control}
              name="employeeCode"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="employeeCode">
                    Employee Code
                    <span className="text-destructive">*</span>
                  </FieldLabel>

                  <Input
                    {...field}
                    id="employeeCode"
                    placeholder="e.g. MGR-001"
                    disabled={isPending}
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
              onClick={handleReset}
            >
              <RotateCcw className="mr-2 size-4" />
              Reset
            </Button>

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
                "Create Manager"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
