"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Please enter all 6 digits of your verification code.")
    .regex(/^\d+$/, "Verification code must contain only numbers."),
});

type VerifyEmailInput = z.input<typeof verifyEmailSchema>;
type VerifyEmailOutput = z.output<typeof verifyEmailSchema>;

interface VerifyEmailProps {
  email?: string;
  onSuccess?: () => void;
  onResend?: () => Promise<void> | void;
}

const RESEND_DELAY = 45;

export default function VerifyEmail({
  email = "umakant@example.com",
  onSuccess,
  onResend,
}: VerifyEmailProps) {
  const [timer, setTimer] = useState<number>(RESEND_DELAY);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  React.useEffect(() => {
    if (canResend) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [canResend]);

  const form = useForm<VerifyEmailInput, unknown, VerifyEmailOutput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: "",
    },
    mode: "onSubmit",
  });

  const handleEmailVerify: SubmitHandler<VerifyEmailOutput> = async (values) => {
    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email,
        otp: values.code,
      });

      if (error) {
        toast.error(
          error.message || "Invalid verification code. Please try again.",
        );
        return;
      }

      if (!data) {
        toast.error("Unable to verify your email. Please try again.");
        return;
      }

      toast.success("Email verified successfully!");

      form.reset({ code: "" });

      onSuccess?.();
    } catch (error) {
      console.error("Email verification error:", error);

      toast.error("Something went wrong while verifying your email.");
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);

    try {
      await onResend?.();

      form.reset({ code: "" });

      setTimer(RESEND_DELAY);
      setCanResend(false);

      toast.success("A fresh verification code has been sent.");
    } catch {
      toast.error("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const formattedTimer = `00:${String(timer).padStart(2, "0")}`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-50 px-4 py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-amber-200/40 via-amber-100/10 to-transparent blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 left-[-10%] h-[550px] w-[550px] rounded-full bg-gradient-to-tr from-amber-200/40 via-amber-100/10 to-transparent blur-3xl"
      />

      <Card className="relative z-10 w-full max-w-md gap-0 rounded-2xl border border-amber-300/80 bg-white p-6 shadow-xl shadow-amber-500/5 sm:p-8">
        <CardHeader className=" flex flex-col items-center px-0 text-center">
          <div className="relative mb-4 flex h-24 w-24 items-center justify-center">
            <Image
              src="/images/LCC-logo.jpg"
              alt="LCC Institute"
              width={96}
              height={96}
              priority
              className="rounded-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[26px]">
            Verify Your <span className="text-amber-500">Email</span>
          </CardTitle>

          <CardDescription className="mt-2 text-xs leading-relaxed text-neutral-500">
            We&apos;ve sent a 6-digit verification code to
            <br />
            <span className="break-all font-semibold text-amber-500">
              {email}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0 pt-7">
          <form
            onSubmit={form.handleSubmit(handleEmailVerify)}
            noValidate
            className="space-y-6"
          >
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="items-center"
                >
                  <FieldLabel className="sr-only">
                    Enter verification code
                  </FieldLabel>

                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={form.formState.isSubmitting}
                    aria-invalid={fieldState.invalid}
                    aria-label="6-digit email verification code"
                  >
                    <InputOTPGroup className="gap-2 sm:gap-2.5">
                      {Array.from({ length: 6 }, (_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-12 w-11 rounded-lg border border-neutral-300 text-lg font-semibold text-neutral-800 transition-all data-[active=true]:border-amber-500 data-[active=true]:ring-2 data-[active=true]:ring-amber-500/30 sm:h-13 sm:w-12"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>

                  {fieldState.error && (
                    <FieldError className="mt-2 text-center text-xs">
                      {fieldState.error.message}
                    </FieldError>
                  )}
                </Field>
              )}
            />

            <div className="text-center text-xs text-neutral-500">
              Didn&apos;t receive the code?{" "}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="font-semibold text-amber-500 transition-colors hover:text-amber-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending ? "Sending..." : "Resend Code"}
                </button>
              ) : (
                <span aria-live="polite" className="font-medium text-amber-500">
                  Resend Code ({formattedTimer})
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 text-sm font-semibold text-neutral-900 shadow-sm transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Email
                  <ArrowRight className="ml-1.5 h-4 w-4 stroke-[2.5]" />
                </>
              )}
            </Button>

            <div className="pt-1 text-center">
              <Link
                href="/sign-up"
                className="inline-flex items-center text-xs font-semibold text-neutral-700 transition hover:text-neutral-900 hover:underline hover:underline-offset-2"
              >
                <ArrowLeft className="ml-1.5 h-4 w-4 stroke-[2.5]" />
                Back to Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
