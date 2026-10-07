import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CreateSubjectForm } from "./components/create-subject-form";

export default function CreateSubjectPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Back to subjects"
        >
          <Link href="/academic/subjects">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Create Subject
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Add a reusable academic subject.
          </p>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-text-primary">Subject Details</h2>

          <p className="mt-1 text-sm text-text-secondary">
            Enter the basic information for this subject.
          </p>
        </div>

        <div className="p-6">
          <CreateSubjectForm />
        </div>
      </div>
    </div>
  );
}
