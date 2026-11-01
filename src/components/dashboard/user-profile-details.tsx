"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ElementType,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  User,
  Mail,
  Phone,
  Shield,
  CalendarDays,
  Pencil,
  Trash2,
  Loader2,
  ImagePlus,
  X,
  CheckCircle2,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { uploadFile } from "@/helper/imagekit/upload";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/constants/image-size";

// --------------------------------------------------
// Types
// --------------------------------------------------

type UserProfile = {
  name: string;
  email: string;
  phoneNumber?: string | null;
  image?: string | null;
  role: string;
  emailVerified?: boolean;
  createdAt?: string | Date | null;
};

type ProfileForm = {
  name: string;
  phoneNumber: string;
  image: string;
};

interface ProfileFieldProps {
  icon: ElementType;
  label: string;
  value: string;
}

function formatDate(value?: string | Date | null): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

// --------------------------------------------------
// Profile Field Component
// --------------------------------------------------

function ProfileField({ icon: Icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex min-w-0 items-start gap-3.5">
      <div className="rounded-[var(--radius-button)] border border-border bg-muted/60 p-2.5 transition-colors">
        <Icon className="size-4 text-brand-dark dark:text-muted-foreground" />
      </div>

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-xs font-medium text-text-secondary dark:text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p className="break-words text-sm font-semibold text-text-primary dark:text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

// --------------------------------------------------
// Main Component
// --------------------------------------------------

export function UserProfileDetails({ user }: { user: UserProfile }) {
  const router = useRouter();

  // Dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form error
  const [formError, setFormError] = useState("");

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.image ?? null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  // Profile form
  const [form, setForm] = useState<ProfileForm>({
    name: user.name ?? "",
    phoneNumber: user.phoneNumber ?? "",
    image: user.image ?? "",
  });

  const initials = getInitials(user.name || "");
  const emailVerified = user.emailVerified ?? false;

  // Cleanup blob URLs
  useEffect(() => {
    if (!previewUrl?.startsWith("blob:")) {
      return;
    }
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function openEditDialog() {
    setForm({
      name: user.name ?? "",
      phoneNumber: user.phoneNumber ?? "",
      image: user.image ?? "",
    });

    setSelectedImage(null);
    setPreviewUrl(user.image ?? null);
    setUploadProgress(0);
    setUploadError("");
    setFormError("");

    setIsEditOpen(true);
  }

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setUploadError("");
    setFormError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WebP, and AVIF images are supported.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError("Image size must not exceed 5 MB.");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setSelectedImage(file);
    setPreviewUrl(localPreview);
    setUploadProgress(0);
    setIsUploading(true);

    try {
      const uploadedFile = await uploadFile({
        file,
        fileName: `profile-${Date.now()}-${file.name}`,
        folder: "profiles",
        tags: ["profile-image"],
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
      });

      if (!uploadedFile.url) {
        throw new Error("Image upload completed without returning a URL.");
      }

      updateField("image", uploadedFile.url);
      setPreviewUrl(uploadedFile.url);
      setSelectedImage(null);
      setUploadProgress(100);
      toast.success("Profile image uploaded successfully.");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to upload profile image.";

      setUploadError(message);
      setPreviewUrl(form.image || null);
      setSelectedImage(null);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemoveImage() {
    if (isUploading || isSaving) return;

    setSelectedImage(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setUploadError("");
    updateField("image", "");
    toast.success("Profile image removed from the form.");
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const phoneNumber = form.phoneNumber.trim();
    const image = form.image.trim();

    if (!name) {
      setFormError("Name is required.");
      return;
    }

    if (name.length > 100) {
      setFormError("Name must not exceed 100 characters.");
      return;
    }

    if (phoneNumber && !/^[+\d\s()-]{7,20}$/.test(phoneNumber)) {
      setFormError("Enter a valid phone number.");
      return;
    }

    if (isUploading) {
      setFormError("Please wait for the image upload to finish.");
      return;
    }

    if (image) {
      try {
        const parsedUrl = new URL(image);
        if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
          setFormError("Profile image must use HTTP or HTTPS.");
          return;
        }
      } catch {
        setFormError("Enter a valid profile image URL.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const updateResult = await authClient.updateUser({
        name,
        image: image || null,
        phoneNumber,
      } as Parameters<typeof authClient.updateUser>[0]);

      if (updateResult.error) {
        throw new Error(
          updateResult.error.message || "Unable to update your profile.",
        );
      }

      setForm({ name, phoneNumber, image });
      setPreviewUrl(image || null);
      setSelectedImage(null);
      toast.success("Profile updated successfully.");
      setIsEditOpen(false);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update your profile.";

      setFormError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    try {
      setIsDeleting(true);
      const deleteResult = await authClient.deleteUser();

      if (deleteResult.error) {
        throw new Error(
          deleteResult.error.message || "Unable to delete your account.",
        );
      }

      toast.success("Account deleted successfully.");
      setIsDeleteOpen(false);
      router.replace("/");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete your account.";

      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* --------------------------------------------- */}
      {/* Profile Overview */}
      {/* --------------------------------------------- */}
      <Card className="rounded-[var(--radius-card)] border-border bg-surface shadow-xs transition-shadow hover:shadow-sm dark:bg-card">
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-20 shrink-0 border-2 border-border ring-2 ring-brand-primary/20">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-brand-dark font-heading text-xl font-bold text-white dark:bg-secondary dark:text-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-text-primary dark:text-foreground">
              {user.name || "Unnamed User"}
            </h2>

            <p className="break-all text-sm font-medium text-text-secondary dark:text-muted-foreground">
              {user.email || "Not available"}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-[var(--radius-pill)] border border-border/60 bg-muted px-2.5 py-0.5 text-xs font-semibold capitalize text-foreground"
              >
                {user.role}
              </Badge>

              <Badge
                variant={emailVerified ? "default" : "outline"}
                className={`rounded-[var(--radius-pill)] px-2.5 py-0.5 text-xs font-medium ${
                  emailVerified
                    ? "border-transparent bg-brand-dark text-white hover:bg-brand-dark/90 dark:bg-primary dark:text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {emailVerified ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-brand-primary" />
                    Email Verified
                  </span>
                ) : (
                  "Email Not Verified"
                )}
              </Badge>
            </div>
          </div>

          <Button
            onClick={openEditDialog}
            className="w-full shrink-0 rounded-[var(--radius-button)] bg-brand-primary font-medium text-black transition-all hover:bg-brand-primary-hover hover:text-white sm:w-auto"
          >
            <Pencil className="mr-2 size-4" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* --------------------------------------------- */}
      {/* Personal Information */}
      {/* --------------------------------------------- */}
      <Card className="rounded-[var(--radius-card)] border-border bg-surface shadow-xs dark:bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-text-primary dark:text-foreground">
            Personal Information
          </CardTitle>
          <CardDescription className="text-text-secondary dark:text-muted-foreground">
            Your basic account and contact information.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ProfileField
              icon={User}
              label="Full Name"
              value={user.name || "Not available"}
            />

            <ProfileField
              icon={Mail}
              label="Email Address"
              value={user.email || "Not available"}
            />

            <ProfileField
              icon={Phone}
              label="Phone Number"
              value={user.phoneNumber || "Not provided"}
            />
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------- */}
      {/* Account Information */}
      {/* --------------------------------------------- */}
      <Card className="rounded-[var(--radius-card)] border-border bg-surface shadow-xs dark:bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold tracking-tight text-text-primary dark:text-foreground">
            Account Information
          </CardTitle>
          <CardDescription className="text-text-secondary dark:text-muted-foreground">
            Your account role and registration details.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ProfileField
              icon={Shield}
              label="Account Role"
              value={user.role}
            />

            <ProfileField
              icon={Mail}
              label="Email Verification"
              value={emailVerified ? "Verified" : "Not verified"}
            />

            <ProfileField
              icon={CalendarDays}
              label="Account Created"
              value={formatDate(user.createdAt)}
            />
          </div>

          <Separator className="bg-border" />

          <div className="rounded-[var(--radius-button)] border border-border/80 bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <Shield className="mt-0.5 size-5 shrink-0 text-brand-dark dark:text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary dark:text-foreground">
                  Account Permissions
                </p>
                <p className="text-sm text-text-secondary dark:text-muted-foreground">
                  Your account has the{" "}
                  <span className="font-semibold capitalize text-text-primary dark:text-foreground">
                    {user.role}
                  </span>{" "}
                  role. Available features depend on your assigned permissions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --------------------------------------------- */}
      {/* Danger Zone */}
      {/* --------------------------------------------- */}
      {user.role === "student" && (
        <Card className="rounded-[var(--radius-card)] border-destructive/30 bg-surface shadow-xs dark:bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-destructive">
              Danger Zone
            </CardTitle>
            <CardDescription className="text-text-secondary dark:text-muted-foreground">
              Permanently delete your account and associated data. This action
              may not be reversible.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4 rounded-[var(--radius-button)] border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary dark:text-foreground">
                  Delete Account
                </p>
                <p className="text-xs text-text-secondary dark:text-muted-foreground">
                  Make sure you have saved any information you need.
                </p>
              </div>

              <Button
                variant="destructive"
                className="w-full shrink-0 rounded-[var(--radius-button)] font-medium sm:w-auto"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --------------------------------------------- */}
      {/* Edit Profile Dialog */}
      {/* --------------------------------------------- */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (isSaving || isUploading) return;
          setIsEditOpen(open);
          if (!open) {
            setFormError("");
            setUploadError("");
            setSelectedImage(null);
            setPreviewUrl(user.image ?? null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-[var(--radius-section)] border-border bg-surface sm:max-w-lg dark:bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-text-primary dark:text-foreground">
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-text-secondary dark:text-muted-foreground">
              Update your personal information and profile picture.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Profile Image Upload */}
            <div className="space-y-3">
              <Label
                htmlFor="profile-image-upload"
                className="text-sm font-semibold text-text-primary dark:text-foreground"
              >
                Profile Picture
              </Label>

              <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-dashed border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
                <Avatar className="size-20 shrink-0 border-2 border-border ring-1 ring-border">
                  <AvatarImage
                    src={previewUrl ?? undefined}
                    alt={form.name || "Profile preview"}
                  />
                  <AvatarFallback className="bg-brand-dark text-lg font-bold text-white dark:bg-secondary dark:text-foreground">
                    {getInitials(form.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-text-primary dark:text-foreground">
                      Upload your profile picture
                    </p>
                    <p className="text-xs text-text-secondary dark:text-muted-foreground">
                      JPEG, PNG, WebP or AVIF. Maximum size: 5 MB.
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    id="profile-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={handleImageSelect}
                    disabled={isSaving || isUploading}
                    className="sr-only"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSaving || isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-[var(--radius-button)] border-border font-medium hover:bg-muted"
                    >
                      {isUploading ? (
                        <Loader2 className="mr-2 size-4 animate-spin text-brand-primary" />
                      ) : (
                        <ImagePlus className="mr-2 size-4 text-brand-dark dark:text-foreground" />
                      )}
                      {isUploading ? "Uploading..." : "Choose Image"}
                    </Button>

                    {previewUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSaving || isUploading}
                        onClick={handleRemoveImage}
                        className="rounded-[var(--radius-button)] text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="mr-2 size-4" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div
                      className="space-y-1.5"
                      role="status"
                      aria-live="polite"
                    >
                      <div className="flex justify-between text-xs font-medium text-text-secondary dark:text-muted-foreground">
                        <span>Uploading image...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-[var(--radius-pill)] bg-muted"
                        role="progressbar"
                        aria-label="Image upload progress"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={uploadProgress}
                      >
                        <div
                          className="h-full rounded-[var(--radius-pill)] bg-brand-primary transition-all duration-200"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {previewUrl && !isUploading && !uploadError && (
                    <p className="text-xs font-medium text-text-secondary dark:text-muted-foreground">
                      Profile image ready.
                    </p>
                  )}

                  {uploadError && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-destructive"
                    >
                      {uploadError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="profile-name"
                className="text-sm font-semibold text-text-primary dark:text-foreground"
              >
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Enter your full name"
                maxLength={100}
                autoComplete="name"
                required
                disabled={isSaving || isUploading}
                className="rounded-[var(--radius-input)] border-input focus-visible:ring-brand-primary"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label
                htmlFor="profile-email"
                className="text-sm font-semibold text-text-primary dark:text-foreground"
              >
                Email Address
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
                readOnly
                className="cursor-not-allowed rounded-[var(--radius-input)] border-input bg-muted/50 text-muted-foreground"
              />
              <p className="text-xs text-text-secondary dark:text-muted-foreground">
                Email changes require a separate verified email-update flow.
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <Label
                htmlFor="profile-phone"
                className="text-sm font-semibold text-text-primary dark:text-foreground"
              >
                Phone Number
              </Label>
              <Input
                id="profile-phone"
                type="tel"
                value={form.phoneNumber}
                onChange={(event) =>
                  updateField("phoneNumber", event.target.value)
                }
                placeholder="Enter your phone number"
                autoComplete="tel"
                maxLength={20}
                disabled={isSaving || isUploading}
                className="rounded-[var(--radius-input)] border-input focus-visible:ring-brand-primary"
              />
            </div>

            {/* Form Error */}
            {formError && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {formError}
              </p>
            )}

            {/* Form Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving || isUploading}
                onClick={() => setIsEditOpen(false)}
                className="rounded-[var(--radius-button)] border-border hover:bg-muted"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSaving || isUploading}
                className="rounded-[var(--radius-button)] bg-brand-primary font-medium text-black transition-all hover:bg-brand-primary-hover hover:text-white"
              >
                {isSaving || isUploading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {isUploading ? "Uploading Image..." : "Saving..."}
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --------------------------------------------- */}
      {/* Delete Confirmation Dialog */}
      {/* --------------------------------------------- */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setIsDeleteOpen(open);
        }}
      >
        <AlertDialogContent className="rounded-[var(--radius-section)] border-border bg-surface dark:bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-text-primary dark:text-foreground">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary dark:text-muted-foreground">
              This action permanently deletes your account and cannot be undone.
              Your Better Auth configuration and database relations determine
              how associated records are handled.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-[var(--radius-button)] border-border hover:bg-muted"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={isDeleting}
              className="rounded-[var(--radius-button)] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
