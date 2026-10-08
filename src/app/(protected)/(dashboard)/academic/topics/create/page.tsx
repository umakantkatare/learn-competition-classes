import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTopicForm } from "@/components/academic/topics/create-topic-form";

interface CreateTopicPageProps {
  searchParams: Promise<{
    subjectId?: string;
  }>;
}

export default async function CreateTopicPage({
  searchParams,
}: CreateTopicPageProps) {
  const { subjectId } = await searchParams;
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/academic/topics">
            <ArrowLeft className="size-4" />
            <span className="sr-only">Back to topics</span>
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Create Topic
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Add a new topic under a subject.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Topic Details</CardTitle>
        </CardHeader>

        <CardContent>
          <CreateTopicForm defaultSubjectId={subjectId} />
        </CardContent>
      </Card>
    </div>
  );
}
