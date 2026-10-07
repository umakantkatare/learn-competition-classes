import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Pencil } from "lucide-react";

import { getSubjectById } from "@/services/academic/subject/queries";
import { getExamsBySubjectId } from "@/services/academic/exam-subject/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubjectDetailPageProps {
  params: Promise<{
    subjectId: string;
  }>;
}

export default async function SubjectDetailPage({
  params,
}: SubjectDetailPageProps) {
  const { subjectId } = await params;

  const [subject, exams] = await Promise.all([
    getSubjectById(subjectId),
    getExamsBySubjectId(subjectId),
  ]);

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
                {subject.name}
              </h1>

              <Badge variant={subject.isActive ? "default" : "secondary"}>
                {subject.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-text-secondary">
              Subject details and academic configuration.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/academic/subjects/${subject.id}/edit`}>
            <Pencil className="size-4" />
            Edit Subject
          </Link>
        </Button>
      </div>

      {/* Subject Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            Subject Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-text-secondary">Subject Name</p>

              <p className="mt-1 font-medium text-text-primary">
                {subject.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Slug</p>

              <code className="mt-1 inline-block rounded-md bg-muted px-2 py-1 text-sm text-text-secondary">
                {subject.slug}
              </code>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Status</p>

              <div className="mt-1">
                <Badge variant={subject.isActive ? "default" : "secondary"}>
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Created</p>

              <p className="mt-1 font-medium text-text-primary">
                {subject.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Examinations */}
      <Card>
        <CardHeader>
          <CardTitle>Examinations</CardTitle>

          <p className="text-sm text-text-secondary">
            Examinations where this subject is included.
          </p>
        </CardHeader>

        <CardContent>
          {exams.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="font-medium text-text-primary">
                No examinations assigned
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                This subject is not currently assigned to any examination.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/academic/exams/${exam.id}`}
                  className="rounded-lg border border-border p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-text-primary">
                        {exam.name}
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
                        {exam.year}
                      </p>
                    </div>

                    <Badge variant={exam.isActive ? "default" : "secondary"}>
                      {exam.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
