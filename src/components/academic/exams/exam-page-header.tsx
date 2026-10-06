import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ExamPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
          Exams
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage examinations and academic years.
        </p>
      </div>

      <Button asChild variant="link" size="sm">
        <Link href="/academic/exams/create">
          <Plus className="size-4" />
          Create Exam
        </Link>
      </Button>
    </div>
  );
}
