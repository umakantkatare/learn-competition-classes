import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateExamForm } from "@/components/academic/exams/create-exam-form";

export default function CreateExamPage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/academic/exams" aria-label="Back to exams">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
            Create Exam
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Add a new examination and academic year.
          </p>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <CreateExamForm />
      </div>
    </div>
  );
}