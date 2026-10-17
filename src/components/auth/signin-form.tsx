"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type SubmitHandler,
  type FieldPath,
} from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";

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
import { authClient } from "@/lib/auth-client";
import {
  SignInFormInput,
  SignInFormOutput,
  signInSchema,
} from "@/validations/signInValidation";
import Logo from "../common/logo";
import { GoogleSignInButton } from "./google-sign-in-button";

const labelClass =
  "mb-[0.7] block text-[12px] font-medium text-neutral-800 sm:text-[13px]";

const inputClass =
  "h-10 w-full rounded-lg border border-neutral-300 bg-white py-2 pl-10 pr-3 text-[13px] font-normal text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 sm:text-[14px]";

const errorClass = "mt-1 text-[11px] font-normal leading-4 text-red-500";

export function SigninForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignInFormInput, unknown, SignInFormOutput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const handleSignIn: SubmitHandler<SignInFormOutput> = async (data) => {
    try {
      const { email, password } = data;
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/",
      });

      if (error) {
        toast.error(error.message || "Invalid credentials.");
        return;
      }

      toast.success("Welcome back!");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const fieldName = (
    name: FieldPath<SignInFormInput>,
  ): FieldPath<SignInFormInput> => name;

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
          Welcome <span className="text-amber-500">Back</span>
        </CardTitle>

        <CardDescription className="mt-1.5 max-w-xs text-[11px] font-normal leading-4 text-neutral-500 sm:text-[12px]">
          Login to continue your learning journey with LCC Institute.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form
          id="signin-form"
          onSubmit={handleSubmit(handleSignIn)}
          className="space-y-3"
          noValidate
        >
          <FieldGroup className="gap-3">
            <Controller
              name={fieldName("email")}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className={labelClass}>
                    Email
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
                      autoComplete="current-password"
                      placeholder="Enter your password"
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

            <div className="flex justify-end pt-0.5">
              <Link
                href="/forgot-password"
                className="text-[12px] font-medium text-amber-600 transition-colors hover:text-amber-700 hover:underline sm:text-[13px]"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="group h-10 w-full rounded-lg bg-amber-500 px-4 text-[13px] font-semibold text-neutral-900 shadow-sm shadow-amber-500/20 transition-all duration-200 hover:bg-amber-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-[14px]"
            >
              {isSubmitting ? "Logging in..." : "Login"}

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
              errorCallbackURL="/sign-in"
              className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-4 text-[12px] font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 hover:text-neutral-700 active:bg-neutral-100 sm:text-[13px]"
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="m-4 justify-center p-0 bg-transparent sm:m-5">
        <p className="text-center text-[11px] font-normal leading-5 text-neutral-800 sm:text-[12px]">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-amber-600 transition-colors hover:text-amber-700 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
