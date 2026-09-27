"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VerifyEmail from "@/components/verify-email";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  return <VerifyEmail email={email} />;
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
