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
} from "lucide-react";

import { useGetMyBatches } from "@/hooks/academic/use-enrollment";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// --------------------------------------------------
// Types
// --------------------------------------------------

type Thumbnail = string | { url?: string } | null;

interface MyBatchItem {
  enrollment: {
    id: string;
    batchId: string;
    status: "ACTIVE";
    expiresAt?: Date | string | null;
    createdAt?: Date | string;
  };

  batch: {
    id: string;
    title: string;
    slug?: string;
    thumbnail?: Thumbnail;
  };
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
          <BookOpen className="size-8 text-primary" />
        </div>

        <h3 className="text-lg font-semibold tracking-tight">
          Your learning journey starts here
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
          You haven't joined any batches yet. Explore our batches and enroll to
          start learning.
        </p>

        <Button className="mt-6" render={<Link href="/batches" />}>
          Explore Batches
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------
// Enrollment Card
// --------------------------------------------------

const EnrollmentCard = memo(function EnrollmentCard({
  item,
}: {
  item: MyBatchItem;
}) {
  const batchTitle = item.batch.title || "My Learning Batch";
  const thumbnail = getThumbnail(item.batch.thumbnail);

  const learningUrl = `/my-batches/${item.enrollment.batchId}`;

  const enrolledDate = formatDate(item.enrollment.createdAt);
  const expiryDate = formatDate(item.enrollment.expiresAt);

  return (
    <Card className="group overflow-hidden border-border/70 bg-card shadow-none transition-all duration-200 hover:border-primary/40 hover:shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
        {/* Thumbnail */}

        <Link
          href={learningUrl}
          className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:aspect-auto sm:h-[116px] sm:w-[193px]"
          aria-label={`Open ${batchTitle}`}
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={batchTitle}
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
            <h3
              className="line-clamp-2 text-sm font-semibold leading-6 text-foreground sm:text-base"
              title={batchTitle}
            >
              {batchTitle}
            </h3>

          
          </div>

          {/* Enrollment Dates */}

          {(enrolledDate || expiryDate) && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {enrolledDate && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  <span>Enrolled {enrolledDate}</span>
                </div>
              )}

              {expiryDate && (
                <div className="flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  <span>Expires {expiryDate}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Learning Action */}

        <div className="w-full shrink-0 sm:w-[180px]">
          <Button className="h-10 w-full" render={ <Link href={learningUrl}/>}>
           
              Go To Course
              <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// --------------------------------------------------
// Error State
// --------------------------------------------------

function EnrollmentError({
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

        <h3 className="font-semibold">Unable to load your batches</h3>

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

const MyBatches = () => {
  const { data, isPending, isError, error, refetch, isFetching } =
    useGetMyBatches();

  const batches = (data ?? []) as MyBatchItem[];

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 pb-12 sm:space-y-8 sm:p-6 lg:p-8">
      {/* Page Header */}

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Batches
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
        {/* Loading State */}

        {isPending && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <BatchCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}

        {isError && (
          <EnrollmentError
            message={error?.message}
            onRetry={() => refetch()}
            isFetching={isFetching}
          />
        )}

        {/* Empty State */}

        {!isPending && !isError && batches.length === 0 && <EmptyBatches />}

        {/* Enrollment List */}

        {!isPending && !isError && batches.length > 0 && (
          <div className="space-y-4">
            {batches.map((item) => (
              <EnrollmentCard key={item.enrollment.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default MyBatches;
