import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getTopicById } from "@/services/academic/topic/queries";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditTopicForm } from "@/components/academic/topics/edit-topic-form";

interface EditTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function EditTopicPage({ params }: EditTopicPageProps) {
  const { topicId } = await params;

  const topic = await getTopicById(topicId);

  if (!topic) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/academic/topics/${topic.id}`}>
            <ArrowLeft className="size-4" />

            <span className="sr-only">Back to topic</span>
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            Edit Topic
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Update topic details and subject assignment.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Topic Details</CardTitle>
        </CardHeader>

        <CardContent>
          <EditTopicForm topic={topic} />
        </CardContent>
      </Card>
    </div>
  );
}
