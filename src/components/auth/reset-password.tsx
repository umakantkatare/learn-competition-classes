"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Logo from "../common/logo";

// ---------------------------------------------
// Validation Schema
// ---------------------------------------------

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(128, "Password cannot exceed 128 characters"),

    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// ---------------------------------------------
// Constants
// ---------------------------------------------

const PASSWORD_INPUT_CLASS =
  "h-12 rounded-xl border-neutral-300 pl-10 pr-12 text-sm focus-visible:border-amber-500 focus-visible:ring-amber-500/30";

const SUBMIT_BUTTON_CLASS =
  "flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

const LINK_BUTTON_CLASS =
  "h-11 w-full rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 font-semibold text-neutral-900 shadow-sm transition-all hover:brightness-105";

// ---------------------------------------------
// Reusable Password Field
// ---------------------------------------------

interface PasswordFieldProps {
  id: string;
  label: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
  error?: string;
  registration: UseFormRegisterReturn;
  disabled: boolean;
  autoFocus?: boolean;
}

function PasswordField({
  id,
  label,
  placeholder,
  visible,
  onToggle,
  error,
  registration,
  disabled,
  autoFocus = false,
}: PasswordFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-semibold text-neutral-800">
        {label}
      </Label>

      <div className="relative">
        <LockKeyhole
          aria-hidden="true"
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400"
        />

        <Input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete="new-password"
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={PASSWORD_INPUT_CLASS}
          {...registration}
        />

        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------
// Reusable Status Message
// ---------------------------------------------

function StatusMessage({
  title,
  description,
  variant = "success",
}: {
  title: string;
  description?: string;
  variant?: "success" | "error";
}) {
  const isSuccess = variant === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className={`rounded-xl border p-4 ${
        isSuccess
          ? "border-amber-200 bg-amber-50/70"
          : "border-red-200 bg-red-50/70"
      }`}
    >
      <div className="flex items-center gap-2">
        {isSuccess && (
          <ShieldCheck
            aria-hidden="true"
            className="size-5 shrink-0 text-amber-600"
          />
        )}

        <p
          className={`text-sm font-semibold ${
            isSuccess ? "text-neutral-800" : "text-red-600"
          }`}
        >
          {title}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Main Component
// ---------------------------------------------

export default function ResetPassword() {
  // Token state
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isResetComplete, setIsResetComplete] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Prevent duplicate initialization in Strict Mode
  const initialized = useRef(false);

  // -------------------------------------------
  // React Hook Form
  // -------------------------------------------

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;

    const params = new URLSearchParams(window.location.search);

    const resetToken = params.get("token")?.trim();
    const hasError = params.has("error");

    setToken(resetToken && !hasError ? resetToken : null);

    if (params.has("token") || hasError) {
      params.delete("token");
      params.delete("error");

      const query = params.toString();

      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
    }

    setIsCheckingToken(false);
  }, []);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Invalid or expired password reset link.");
      return;
    }

    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });

      if (error) {
        toast.error(
          error.message ||
            "Unable to reset password. Your reset link may have expired.",
        );
        return;
      }

      // Clear sensitive form data
      reset();
      setToken(null);
      setShowPassword(false);
      setShowConfirmPassword(false);

      setIsResetComplete(true);

      toast.success("Your password has been reset successfully.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  // -------------------------------------------
  // Loading State
  // -------------------------------------------

  const renderContent = () => {
    if (isCheckingToken) {
      return (
        <div className="flex min-h-40 flex-col items-center justify-center gap-3">
          <Loader2
            aria-hidden="true"
            className="size-7 animate-spin text-amber-500"
          />

          <p className="text-sm text-neutral-500">Verifying reset link...</p>
        </div>
      );
    }

    // -----------------------------------------
    // Success State
    // -----------------------------------------

    if (isResetComplete) {
      return (
        <div className="space-y-5">
          <StatusMessage title="Password Successfully Changed" />

          <Button
            render={<Link href="/sign-in" />}
            className={LINK_BUTTON_CLASS}
          >
            Continue to Sign In
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      );
    }

    // -----------------------------------------
    // Invalid Token State
    // -----------------------------------------

    if (!token) {
      return (
        <div className="space-y-5">
          <StatusMessage
            variant="error"
            title="Invalid or Expired Reset Link"
            description="This password reset link is missing, invalid, or has expired. Request a new password reset link to continue."
          />

          <Button
            render={<Link href="/forgot-password" />}
            className={LINK_BUTTON_CLASS}
          >
            Request New Reset Link
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      );
    }

    // -----------------------------------------
    // Reset Password Form
    // -----------------------------------------

    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <PasswordField
          id="password"
          label="New Password"
          placeholder="Enter new password"
          visible={showPassword}
          onToggle={() => setShowPassword((prev) => !prev)}
          error={errors.password?.message}
          registration={register("password")}
          disabled={isSubmitting}
          autoFocus
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter new password"
          visible={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((prev) => !prev)}
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
          disabled={isSubmitting}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className={SUBMIT_BUTTON_CLASS}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Updating Password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="ml-2 size-4 stroke-[2.5]" />
            </>
          )}
        </Button>
      </form>
    );
  };

  // -------------------------------------------
  // UI
  // -------------------------------------------

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 py-8 sm:px-6">
      {/* Background Decorations */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] size-[550px] rounded-full bg-gradient-to-br from-amber-200/40 via-amber-100/10 to-transparent blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-[-10%] size-[550px] rounded-full bg-gradient-to-tr from-amber-200/40 via-amber-100/10 to-transparent blur-3xl"
      />

      {/* Main Card */}

      <Card className="relative z-10 w-full max-w-md gap-0 rounded-2xl border border-amber-300/80 bg-white p-6 shadow-xl shadow-amber-500/5 sm:p-8">
        {/* Brand */}

        <CardHeader className="flex flex-col items-center px-0 pt-2 text-center">
          <div className="relative flex size-24 items-center justify-center">
            <Logo width={70} height={70} showName={false} />
          </div>

        <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[26px]">
            {isResetComplete ? (
              <>
                Password <span className="text-amber-500">Updated!</span>
              </>
            ) : (
              <>
                Reset Your <span className="text-amber-500">Password</span>
              </>
            )}
          </CardTitle> 
        </CardHeader>

        <CardContent className="px-0 pt-7">
          {renderContent()}

          {/* Back to Sign In */}

          {!isResetComplete && (
            <div className="mt-7 border-t border-neutral-200 pt-5">
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-700 transition-colors hover:text-amber-600"
              >
                <ArrowLeft className="size-4" />
                Back to Sign In
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
