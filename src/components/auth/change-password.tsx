"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  MonitorSmartphone,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

// Validation
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must not exceed 128 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
    revokeOtherSessions: z.boolean(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different",
    path: ["newPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export default function ChangePasswordForm({
  onSuccess,
}: ChangePasswordFormProps) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      revokeOtherSessions: true,
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const { error } = await authClient.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        revokeOtherSessions: values.revokeOtherSessions,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
        return;
      }

      toast.success("Password changed successfully");

      reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      onSuccess?.();
    } catch (error) {
      console.error("Change password error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  // Reusable password input
  const PasswordInput = ({
    field,
    name,
    visible,
    toggleVisibility,
    placeholder,
    autoComplete,
  }: {
    field: {
      value: string;
      onChange: (value: string) => void;
      onBlur: () => void;
      name: string;
    };
    name: string;
    visible: boolean;
    toggleVisibility: () => void;
    placeholder: string;
    autoComplete: string;
  }) => (
    <div className="relative">
      <Input
        id={name}
        name={field.name}
        value={field.value}
        onChange={(event) => field.onChange(event.target.value)}
        onBlur={field.onBlur}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={isSubmitting}
        className="h-10 rounded-[var(--radius-input)] border-border bg-background pr-11 text-sm focus-visible:ring-brand-primary/30"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={isSubmitting}
        onClick={toggleVisibility}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-muted"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Password Fields */}
      <FieldGroup className="gap-4">
        <Controller
          name="currentPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="currentPassword">
                Current Password
              </FieldLabel>

              <PasswordInput
                field={field}
                name="currentPassword"
                visible={showCurrent}
                toggleVisibility={() => setShowCurrent((prev) => !prev)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="newPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="newPassword">New Password</FieldLabel>

              <PasswordInput
                field={field}
                name="newPassword"
                visible={showNew}
                toggleVisibility={() => setShowNew((prev) => !prev)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <FieldDescription>Use at least 8 characters.</FieldDescription>

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">
                Confirm New Password
              </FieldLabel>

              <PasswordInput
                field={field}
                name="confirmPassword"
                visible={showConfirm}
                toggleVisibility={() => setShowConfirm((prev) => !prev)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      {/* Session Management */}
      <Controller
        name="revokeOtherSessions"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/30 p-3.5 transition-colors hover:bg-muted/50">
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              disabled={isSubmitting}
              className="mt-0.5"
            />

            <span className="min-w-0 flex-1 space-y-1">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MonitorSmartphone className="size-4 text-muted-foreground" />
                Sign out from other devices
              </span>

              <span className="block text-xs leading-relaxed text-muted-foreground">
                Revoke other active sessions after changing your password.
              </span>
            </span>
          </label>
        )}
      />

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-10 w-full rounded-[var(--radius-button)] bg-brand-primary font-semibold text-black hover:bg-brand-primary-hover hover:text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Updating Password...
          </>
        ) : (
          <>
            Update Password
          </>
        )}
      </Button>
    </form>
  );
}
