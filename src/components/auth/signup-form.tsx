"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type SubmitHandler,
  type FieldPath,
} from "react-hook-form";

import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/validations/signUpValidation";
import { toast } from "sonner";
import Logo from "../common/logo";
import { GoogleSignInButton } from "./google-sign-in-button";

type SignUpFormInput = z.input<typeof signUpSchema>;
type SignUpFormOutput = z.output<typeof signUpSchema>;

const labelClass =
  "mb-[0.7] block text-[12px] font-medium text-neutral-800 sm:text-[13px]";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-3 text-[13px] font-normal text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 sm:text-[14px]";

const errorClass = "mt-1 text-[11px] font-normal leading-4 text-red-500";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignUpFormInput, unknown, SignUpFormOutput>({
    resolver: zodResolver(signUpSchema),

    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },

    mode: "onTouched",
  });

  const handleSignUp: SubmitHandler<SignUpFormOutput> = async (data) => {
    try {
      const { name, email, phoneNumber, password } = data;
      const { error } = await authClient.signUp.email({
        name,
        email,
        phoneNumber,
        password,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Failed to create account.");
        return;
      }

      toast.success("Account created successfully!");
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const fieldName = (
    name: FieldPath<SignUpFormInput>,
  ): FieldPath<SignUpFormInput> => name;
  return (
    <Card
      {...props}
      className="w-full max-w-md gap-0 rounded-2xl border border-amber-200/70 bg-white px-5 py-4 shadow-xl shadow-amber-500/5 sm:px-7 sm:py-5"
    >
      <CardHeader className="mb-4 flex flex-col items-center p-0 text-center">
        <div className="relative mb-2 flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
          <Logo width={70} height={70} showName={false} />
        </div>

        <CardTitle className="text-[22px] font-bold leading-tight tracking-tight text-neutral-900 sm:text-[25px]">
          Create Your <span className="text-amber-500">Account</span>
        </CardTitle>

        <CardDescription className="mt-1.5 max-w-xs text-[11px] font-normal leading-4 text-neutral-500 sm:text-[10px]">
          Join LCC Institute and start your preparation journey today.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form
          id="signup-form"
          onSubmit={handleSubmit(handleSignUp)}
          className="space-y-3"
          noValidate
        >
          <FieldGroup className="gap-3">
            <Controller
              name={fieldName("name")}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name" className={labelClass}>
                    Full Name
                  </FieldLabel>

                  <div className="relative">
                    <User
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    />

                    <Input
                      {...field}
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Enter your full name"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className={errorClass}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name={fieldName("email")}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className={labelClass}>
                    Email Address
                  </FieldLabel>

                  <div className="relative">
                    <Mail
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    />

                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email address"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className={errorClass}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name={fieldName("phoneNumber")}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="phoneNumber" className={labelClass}>
                    Phone Number
                  </FieldLabel>

                  <div className="relative">
                    <Phone
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    />

                    <Input
                      {...field}
                      id="phoneNumber"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      autoComplete="tel"
                      placeholder="Enter 10 digit mobile number"
                      aria-invalid={fieldState.invalid}
                      className={inputClass}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);

                        field.onChange(value);
                      }}
                    />
                  </div>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className={errorClass}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name={fieldName("password")}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password" className={labelClass}>
                    Password
                  </FieldLabel>

                  <div className="relative">
                    <Lock
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    />

                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      aria-invalid={fieldState.invalid}
                      className={`${inputClass} pr-10`}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-neutral-400 hover:bg-transparent hover:text-neutral-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className={errorClass}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name={fieldName("confirmPassword")}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword" className={labelClass}>
                    Confirm Password
                  </FieldLabel>

                  <div className="relative">
                    <Lock
                      aria-hidden="true"
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                    />

                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Confirm your password"
                      aria-invalid={fieldState.invalid}
                      className={`${inputClass} pr-10`}
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-neutral-400 hover:bg-transparent hover:text-neutral-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                      className={errorClass}
                    />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="group h-10 w-full rounded-lg bg-amber-500 px-4 text-[13px] font-semibold text-neutral-900 shadow-sm shadow-amber-500/20 transition-all duration-200 hover:bg-amber-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[14px]"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}

              {!isSubmitting && (
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              )}
            </Button>

            <div className="relative flex items-center justify-center py-0.5">
              <div className="w-full border-t border-neutral-200" />

              <span className="absolute bg-white px-3 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                OR
              </span>
            </div>

            <GoogleSignInButton
              callbackURL="/"
              errorCallbackURL="/sign-up"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-4 text-[12px] font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-700 active:bg-neutral-100 sm:text-[13px]"
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="m-4 justify-center p-0 bg-transparent sm:m-5">
        <p className="text-center text-[11px] font-normal leading-5 text-neutral-800 sm:text-[12px]">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-amber-600 transition-colors hover:text-amber-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
