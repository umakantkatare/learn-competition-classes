"use client";

import { GraduationCap, RefreshCw } from "lucide-react";

import { BatchCard } from "@/components/batches/batch-card";
import { useGetPublishedBatches } from "@/hooks/academic/use-batches";

// Batch Card Skeleton
function BatchCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="mx-3 mt-3 aspect-[16/9] animate-pulse rounded-lg bg-muted" />

      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="h-5 w-4/5 animate-pulse rounded bg-muted" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />

        <div className="flex items-center justify-between pt-3">
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}

// Loading State
function BatchLoadingState() {
  return (
    <section
      aria-label="Loading batches"
      aria-busy="true"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <BatchCardSkeleton key={index} />
      ))}
    </section>
  );
}

// Empty State
function BatchEmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
        <GraduationCap className="size-8 text-primary" />
      </div>

      <h2 className="text-lg font-semibold">No batches available</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        There are currently no published batches available. Please check back
        later for upcoming batches.
      </p>
    </div>
  );
}

// Error State
function BatchErrorState({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-destructive/20 bg-card px-6 py-12 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <RefreshCw className="size-6 text-destructive" />
      </div>

      <h2 className="font-semibold">Unable to load batches</h2>

      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Something went wrong while fetching batches. Please try again.
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw className={`size-4 ${isRetrying ? "animate-spin" : ""}`} />
        {isRetrying ? "Retrying..." : "Try Again"}
      </button>
    </div>
  );
}

// Main Page
export default function BatchesPage() {
  const {
    data: batches = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetPublishedBatches();

  const handleRetry = () => {
    void refetch();
  };

  return (
    <main className="container mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Batches
        </h1>

        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Find the right batch for your examination preparation and start
          learning with experienced instructors.
        </p>
      </section>

      {/* Batch Listing */}
      {isLoading ? (
        <BatchLoadingState />
      ) : isError ? (
        <BatchErrorState onRetry={handleRetry} isRetrying={isFetching} />
      ) : batches.length === 0 ? (
        <BatchEmptyState />
      ) : (
        <section
          aria-label="Available batches"
          aria-busy={isFetching}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {batches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </section>
      )}
    </main>
  );
}
