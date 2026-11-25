"use client";

import React, { useState } from "react";
import Link from "next/link";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "sonner";

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import Logo from "../common/logo";

// ----------------------------------------
// Validation
// ----------------------------------------

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Please enter a valid email address."),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// ----------------------------------------
// Component
// ----------------------------------------

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onSubmit",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // ----------------------------------------
  // Request Password Reset
  // ----------------------------------------

  const requestResetLink = async (email: string): Promise<boolean> => {
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Unable to send reset instructions", {
          description: error.message || "Please try again after a few moments.",
        });

        return false;
      }

      return true;
    } catch (error) {
      console.error("Password reset request error:", error);

      toast.error("Something went wrong", {
        description: "We couldn't process your request. Please try again.",
      });

      return false;
    }
  };

  // ----------------------------------------
  // Submit Form
  // ----------------------------------------

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    const email = values.email.trim().toLowerCase();

    const success = await requestResetLink(email);

    if (!success) return;

    setSubmittedEmail(email);
    setIsSubmitted(true);

    toast.success("Reset password link sent successfully");
  };

  // ----------------------------------------
  // Resend Reset Link
  // ----------------------------------------

  const handleResend = async () => {
    if (!submittedEmail || isResending) return;

    setIsResending(true);

    try {
      const success = await requestResetLink(submittedEmail);

      if (success) {
        toast.success("Password reset link sent successfully!");
      }
    } finally {
      setIsResending(false);
    }
  };

  // ----------------------------------------
  // Change Email
  // ----------------------------------------

  const handleAnotherEmail = () => {
    setIsSubmitted(false);
    setSubmittedEmail("");
    reset({ email: "" });
  };

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 py-8">
      {/* Background Decorations */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-amber-200/40 via-amber-100/10 to-transparent blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-[-10%] h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-amber-200/40 via-amber-100/10 to-transparent blur-3xl"
      />

      {/* Main Card */}

      <Card className="relative z-10 w-full max-w-md gap-0 rounded-2xl border border-amber-300/80 bg-white p-6 shadow-xl shadow-amber-500/5 sm:p-8">
        <CardHeader className="flex flex-col items-center px-0 text-center">
          {/* Logo */}

          <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
            <Logo width={70} height={70} showName={false} />
          </div>

          {/* Heading */}

          <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[26px]">
            {isSubmitted ? (
              <>
                Check Your <span className="text-amber-500">Email</span>
              </>
            ) : (
              <>
                Forgot Your <span className="text-amber-500">Password?</span>
              </>
            )}
          </CardTitle>

          {/* <CardDescription className="mt-2 text-xs leading-relaxed text-neutral-500">
            {isSubmitted
              ? "We've processed your request. If an account exists with this email, you'll receive password reset instructions."
              : "Enter your registered email address and we'll send you link to reset your password."}
          </CardDescription> */}
        </CardHeader>

        <CardContent className="px-0 pt-7">
          {!isSubmitted ? (
            /* Request Reset Form */

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-6"
            >
              {/* Email Input */}

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-neutral-800"
                >
                  Email Address
                </Label>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />

                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    autoComplete="email"
                    autoFocus
                    disabled={isSubmitting}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="h-12 rounded-xl border-neutral-300 pl-10 text-sm focus-visible:border-amber-500 focus-visible:ring-amber-500/30"
                    {...register("email")}
                  />
                </div>

                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-xs font-medium text-red-500"
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 size-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-1.5 size-4 stroke-[2.5]" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900">
                    Reset password link email sent to
                  </p>
                </div>

                <div className="mt-4 rounded-lg border border-amber-200/80 bg-white px-3 py-3">
                  <p className="break-all text-sm font-semibold text-amber-600">
                    {submittedEmail}
                  </p>
                </div>
              </div>

              {/* Actions */}

              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isResending}
                  onClick={handleResend}
                  className="h-11 w-full rounded-lg border-amber-300 font-semibold text-neutral-800 transition-colors hover:bg-amber-50 hover:text-amber-700"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Sending Reset Link...
                    </>
                  ) : (
                    "Resend Password Reset Link"
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  disabled={isResending}
                  onClick={handleAnotherEmail}
                  className="h-10 w-full rounded-lg text-sm font-medium text-neutral-600 hover:text-amber-600"
                >
                  Use Another Email
                </Button>
              </div>
            </div>
          )}

          {/* Back to Sign In */}

          <div className="mt-7 border-t border-neutral-200 pt-5">
            <Link
              href="/sign-in"
              className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-700 transition-colors hover:text-amber-600"
            >
              <ArrowLeft className="size-4" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
