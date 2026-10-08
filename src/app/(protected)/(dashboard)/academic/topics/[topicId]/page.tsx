import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, Pencil } from "lucide-react";

import { getTopicById } from "@/services/academic/topic/queries";
import { getSubjectById } from "@/services/academic/subject/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopicDetailPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function TopicDetailPage({
  params,
}: TopicDetailPageProps) {
  const { topicId } = await params;

  const topic = await getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  const subject = await getSubjectById(topic.subjectId);

  if (!subject) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/academic/topics">
              <ArrowLeft className="size-4" />

              <span className="sr-only">Back to topics</span>
            </Link>
          </Button>

          <div className="flex size-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <BookOpen className="size-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
              {topic.name}
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              Topic details and academic information.
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href={`/academic/topics/${topic.id}/edit`}>
            <Pencil className="mr-2 size-4" />
            Edit Topic
          </Link>
        </Button>
      </div>

      {/* Topic details */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div>
              <p className="text-sm text-text-secondary">Name</p>

              <p className="mt-1 font-medium text-text-primary">{topic.name}</p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Slug</p>

              <p className="mt-1 font-medium text-text-primary">{topic.slug}</p>
            </div>

            <div>
              <p className="text-sm text-text-secondary">Status</p>

              <div className="mt-1">
                <Badge variant={topic.isActive ? "default" : "secondary"}>
                  {topic.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject */}
        <Card>
          <CardHeader>
            <CardTitle>Subject</CardTitle>
          </CardHeader>

          <CardContent>
            <Link
              href={`/academic/subjects/${subject.id}`}
              className="group block rounded-lg border border-border p-4 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <BookOpen className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-medium text-text-primary transition-colors group-hover:text-brand-primary">
                    {subject.name}
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    Parent subject
                  </p>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
