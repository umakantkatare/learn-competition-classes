"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useGetBatchBySlug } from "@/hooks/academic/use-batches";
import BatchDetails from "@/components/batches/batch-details";
import { Button } from "@/components/ui/button";

function LoadingState() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
      <div className="h-9 w-40 animate-pulse rounded-lg bg-muted" />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="aspect-video animate-pulse rounded-xl bg-muted" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

function ErrorState({
  title,
  description,
  onBack,
}: {
  title: string;
  description: string;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <GraduationCap className="size-8 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 size-4" />
        Back to batches
      </Button>
    </div>
  );
}

export default function BatchDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const slug = params?.slug ?? "";

  const {
    data: batch,
    isLoading,
    isError,
  } = useGetBatchBySlug(slug);

  const handleBack = () => {
    router.push("/batches");
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !batch) {
    return (
      <ErrorState
        title="Batch not found"
        description="This batch may have been removed or is no longer available."
        onBack={handleBack}
      />
    );
  }

  if (!batch.isPublished) {
    return (
      <ErrorState
        title="Batch unavailable"
        description="This batch is currently not available for enrollment."
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 md:px-6">
        <Button
          variant="ghost"
          className="-ml-3"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to batches
        </Button>
      </div>

      <BatchDetails batch={batch} />
    </div>
  );
}
