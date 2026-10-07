import { notFound } from "next/navigation";

import { getSubjectById } from "@/services/academic/subject/queries";
import { EditSubjectForm } from "@/components/academic/subjects/edit-subject-form";


interface EditSubjectPageProps {
  params: Promise<{
    subjectId: string;
  }>;
}

export default async function EditSubjectPage({
  params,
}: EditSubjectPageProps) {
  const { subjectId } = await params;

  const subject = await getSubjectById(subjectId);

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Edit Subject
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Update the subject details and status.
        </p>
      </div>

      <div className="rounded-card border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold text-text-primary">Subject Details</h2>

          <p className="mt-1 text-sm text-text-secondary">
            Changes will apply to this canonical subject.
          </p>
        </div>

        <div className="p-6">
          <EditSubjectForm subject={subject} />
        </div>
      </div>
    </div>
  );
}
