"use client";

import { useEffect, useState } from "react";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/constants/image-size";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

import { ImagePlus, X, UserRound } from "lucide-react";
import { Image } from "@imagekit/next";


interface ProfileImageUploadProps {
  profileImageFile: File | null;
  profileImageUrl?: string | null;

  profileImageRemoved: boolean;

  onProfileImageChange: (file: File | null) => void;
  onProfileImageRemove: (removed: boolean) => void;

  disabled?: boolean;
}


function formatFileSize(size: number): string {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

// Component

export default function ProfileImageUpload({
  profileImageFile,
  profileImageUrl,
  profileImageRemoved,
  onProfileImageChange,
  onProfileImageRemove,
  disabled = false,
}: ProfileImageUploadProps) {
  const [imageError, setImageError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Generate local image preview

  useEffect(() => {
    if (!profileImageFile) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(profileImageFile);

    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [profileImageFile]);

  // Image Handler

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setImageError(null);

    if (!file) return;

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      setImageError("Please select a JPG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Profile image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    onProfileImageChange(file);
    onProfileImageRemove(false);

    event.target.value = "";
  }

  // Remove Handler

  function handleRemoveImage() {
    setImageError(null);

    if (profileImageFile) {
      onProfileImageChange(null);
      return;
    }

    onProfileImageRemove(true);
  }

  // Render

  return (
    <section className="space-y-4">
      <Field>
        <FieldLabel>Profile Image</FieldLabel>

        <FieldDescription>JPG, PNG, WebP · Maximum 5 MB</FieldDescription>

        {!profileImageRemoved && (
          <>
            {imagePreview || profileImageUrl ? (
              <div className="relative flex w-fit items-center justify-center">
                <div className="relative size-32 overflow-hidden rounded-full border bg-muted">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile image preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Image
                      urlEndpoint={
                        process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
                      }
                      src={profileImageUrl!}
                      alt="Profile image"
                      width={300}
                      height={300}
                      className="h-full w-full object-cover"
                      transformation={[
                        {
                          width: 300,
                          height: 300,
                          quality: 80,
                          format: "webp",
                        },
                      ]}
                    />
                  )}
                </div>

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  disabled={disabled}
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label
                htmlFor="profile-image"
                className="flex size-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed bg-muted/30 transition hover:bg-muted/60"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />

                <span className="text-xs font-medium">Upload Image</span>
              </label>
            )}
          </>
        )}

        {profileImageRemoved && (
          <div className="flex size-32 flex-col items-center justify-center gap-2 rounded-full border border-dashed">
            <UserRound className="h-8 w-8 text-muted-foreground" />

            <p className="text-xs text-muted-foreground">Image removed</p>

            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled}
              onClick={() => onProfileImageRemove(false)}
            >
              Undo
            </Button>
          </div>
        )}

        <Input
          id="profile-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={handleImageChange}
        />

        {profileImageFile && (
          <p className="break-all text-xs text-muted-foreground">
            {profileImageFile.name} · {formatFileSize(profileImageFile.size)}
          </p>
        )}

        {imageError && <p className="text-sm text-destructive">{imageError}</p>}

        {profileImageFile && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onProfileImageChange(null)}
          >
            Remove selected file
          </Button>
        )}
      </Field>

      <p className="text-xs text-muted-foreground">
        Profile image will be uploaded when you submit the profile form.
      </p>
    </section>
  );
}
