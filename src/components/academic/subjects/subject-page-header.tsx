import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SubjectPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Subjects
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage academic subjects used across examinations and courses.
        </p>
      </div>

      <Button asChild>
        <Link href="/academic/subjects/create">
          <Plus className="size-4" />
          Create Subject
        </Link>
      </Button>
    </div>
  );
}