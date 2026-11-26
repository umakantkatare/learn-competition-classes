"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

import { useMyBatches } from "@/hooks/academic/use-batch-teacher";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Thumbnail = string | { url?: string } | null;

interface TeacherBatch {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  thumbnail?: Thumbnail;

  startDate?: Date | string | null;
  expiryDate?: Date | string | null;

  status?: "UPCOMING" | "ONGOING" | "COMPLETED" | "EXPIRED";
  medium?: "ENGLISH" | "HINDI" | "HINGLISH";

  validityMonths?: number;
  isPublished?: boolean;
  isFree?: boolean;
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function getThumbnail(thumbnail?: Thumbnail): string | null {
  if (typeof thumbnail === "string") {
    return thumbnail || null;
  }

  return thumbnail?.url ?? null;
}

function formatDate(date?: Date | string | null): string | null {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return null;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

// Validity priority: validityMonths > expiryDate
function getBatchValidity(batch: TeacherBatch): string | null {
  if (
    typeof batch.validityMonths === "number" &&
    Number.isFinite(batch.validityMonths) &&
    batch.validityMonths > 0
  ) {
    return `${batch.validityMonths} ${
      batch.validityMonths === 1 ? "Month" : "Months"
    } Validity`;
  }

  const expiryDate = formatDate(batch.expiryDate);

  if (expiryDate) {
    return `Expires ${expiryDate}`;
  }

  return null;
}

function getStatusVariant(
  status?: TeacherBatch["status"],
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "ONGOING":
      return "default";

    case "UPCOMING":
      return "secondary";

    case "COMPLETED":
      return "outline";

    case "EXPIRED":
      return "destructive";

    default:
      return "outline";
  }
}

// --------------------------------------------------
// Loading Skeleton
// --------------------------------------------------

function BatchCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-none">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        <Skeleton className="aspect-video w-full rounded-lg sm:h-[116px] sm:w-[193px] sm:shrink-0" />

        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        <Skeleton className="h-10 w-full sm:w-[180px]" />
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// Empty State
// --------------------------------------------------

function EmptyBatches() {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center justify-center px-5 py-16 text-center">
        <div className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <GraduationCap className="size-8 text-primary" />
        </div>

        <h3 className="text-lg font-semibold tracking-tight">
          No teaching batches yet
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          You haven't been assigned to any batches yet. Your assigned teaching
          batches will appear here.
        </p>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// Teacher Batch Card
// --------------------------------------------------

const TeacherBatchCard = memo(function TeacherBatchCard({
  batch,
}: {
  batch: TeacherBatch;
}) {
  const title = batch.title || "Untitled Batch";

  const thumbnail = getThumbnail(batch.thumbnail);

  const batchUrl = `/teacher/batches/${batch.id}`;

  const startDate = formatDate(batch.startDate);

  // Check validityMonths first, then expiryDate
  const validity = getBatchValidity(batch);

  return (
    <Card className="group overflow-hidden border-border/70 bg-card shadow-none transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        {/* Thumbnail */}

        <Link
          href={batchUrl}
          className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-auto sm:h-[116px] sm:w-[193px]"
          aria-label={`Open ${title}`}
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, 193px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="size-10 text-muted-foreground/50" />
            </div>
          )}
        </Link>

        {/* Batch Information */}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="line-clamp-2 text-sm font-semibold leading-6 text-foreground sm:text-base"
                title={title}
              >
                {title}
              </h3>

              {batch.status && (
                <Badge variant={getStatusVariant(batch.status)}>
                  {batch.status}
                </Badge>
              )}
            </div>
          </div>

          {/* Batch Metadata */}

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {startDate && (
              <div className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                <span>Starts {startDate}</span>
              </div>
            )}

            {validity && (
              <div className="flex items-center gap-1.5">
                <Clock3 className="size-3.5" />
                <span>{validity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Batch Action */}

        <div className="w-full shrink-0 sm:w-[180px]">
          <Button className="h-10 w-full" render={<Link href={batchUrl} />}>
            Manage Batch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// --------------------------------------------------
// Error State
// --------------------------------------------------

function BatchError({
  message,
  onRetry,
  isFetching,
}: {
  message?: string;
  onRetry: () => void;
  isFetching: boolean;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-6 text-destructive" />
        </div>

        <h3 className="font-semibold">Unable to load teaching batches</h3>

        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
          {message || "Something went wrong while fetching your batches."}
        </p>

        <Button onClick={onRetry} disabled={isFetching}>
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function TeacherBatches() {
  const {
    data: batches = [],
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useMyBatches();

  const teacherBatches = batches as TeacherBatch[];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 pb-12 sm:space-y-8 sm:p-6 lg:p-8">
      {/* Page Header */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Teaching Batches
          </h1>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </section>

      {/* Batches Section */}

      <section className="space-y-5">
        {/* Loading */}

        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <BatchCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error */}

        {isError && (
          <BatchError
            message={error?.message}
            onRetry={() => refetch()}
            isFetching={isFetching}
          />
        )}

        {/* Empty */}

        {!isPending && !isError && teacherBatches.length === 0 && (
          <EmptyBatches />
        )}

        {/* Batch List */}

        {!isPending && !isError && teacherBatches.length > 0 && (
          <div className="space-y-4">
            {teacherBatches.map((batch) => (
              <TeacherBatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
