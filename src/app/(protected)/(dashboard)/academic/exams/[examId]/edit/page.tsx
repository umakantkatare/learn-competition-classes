import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Pencil } from "lucide-react";

import { getExamById } from "@/services/academic/exam/queries";
import { getSubjectsByExamId } from "@/services/academic/exam-subject/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface ExamDetailPageProps {
  params: Promise<{
    examId: string;
  }>;
}

export default async function ExamDetailPage({ params }: ExamDetailPageProps) {
  const { examId } = await params;

  const exam = await getExamById(examId);

  if (!exam) {
    notFound();
  }

  const subjects = await getSubjectsByExamId(examId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Back to exams"
          >
            <Link href="/academic/exams">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                {exam.name}
              </h1>

              <Badge variant={exam.isActive ? "default" : "secondary"}>
                {exam.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-text-secondary">
              Manage examination details and subjects.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/academic/exams/${exam.id}/edit`}>
            <Pencil className="size-4" />
            Edit Exam
          </Link>
        </Button>
      </div>

      {/* Exam information */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-text-secondary">Exam Name</p>

              <p className="mt-1 font-medium text-text-primary">{exam.name}</p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Year</p>

              <div className="mt-1 flex items-center gap-2">
                <CalendarDays className="size-4 text-text-secondary" />

                <span className="font-medium text-text-primary">
                  {exam.year}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Slug</p>

              <code className="mt-1 inline-block rounded-md bg-muted px-2 py-1 text-sm text-text-secondary">
                {exam.slug}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <ExamSubjects examId={exam.id} subjects={subjects} />
    </div>
  );
}
