"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, RefreshCw } from "lucide-react";

import { BatchCard } from "@/components/batches/batch-card";
import { useGetPublishedBatches } from "@/hooks/academic/use-batches";

import { Button } from "@/components/ui/button";

const FEATURED_BATCH_LIMIT = 3;

function BatchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="mx-3 mt-3 aspect-[16/9] animate-pulse rounded-lg bg-slate-200" />

      <div className="space-y-4 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-8 animate-pulse rounded bg-slate-200" />
        <div className="h-10 animate-pulse rounded bg-slate-100" />
      </div>
    </div>
  );
}


function FeaturedCoursesSkeleton() {
  return (
    <section className="bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-1 w-12 rounded-full bg-slate-200" />
          </div>

          <div className="h-5 w-64 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: FEATURED_BATCH_LIMIT }).map((_, index) => (
            <BatchCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCoursesError({
  onRetry,
  isFetching,
}: {
  onRetry: () => void;
  isFetching: boolean;
}) {
  return (
    <section className="bg-[#fffdf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-red-50">
          <RefreshCw className="size-7 text-red-500" />
        </div>

        <h3 className="text-lg font-semibold text-slate-800">
          Unable to load courses
        </h3>

        <p className="text-sm text-slate-500">
          Something went wrong while fetching available batches. Please try
          again.
        </p>

        <Button variant="outline" onClick={onRetry} disabled={isFetching}>
          <RefreshCw
            className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Try Again
        </Button>
      </div>
    </section>
  );
}

// --------------------------------------------------
// Empty State
// --------------------------------------------------

function FeaturedCoursesEmpty() {
  return (
    <section className="bg-[#fffdf8] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-10 text-center">
        <h3 className="text-lg font-semibold text-slate-800">
          No Courses Available
        </h3>

        <p className="max-w-md text-sm text-slate-500">
          New batches will be available soon. Stay tuned!
        </p>

        <Button
          variant="outline"
          className="mt-2"
          render={<Link href="/batches" />}
        >
          Explore Batches
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </section>
  );
}

// --------------------------------------------------
// Featured Courses
// --------------------------------------------------

export function FeaturedCourses() {
  const {
    data: batches = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetPublishedBatches();

  if (isLoading) {
    return <FeaturedCoursesSkeleton />;
  }

  if (isError) {
    return (
      <FeaturedCoursesError
        onRetry={() => void refetch()}
        isFetching={isFetching}
      />
    );
  }

  const featuredBatches = batches.slice(0, FEATURED_BATCH_LIMIT);

  if (featuredBatches.length === 0) {
    return <FeaturedCoursesEmpty />;
  }

  return (
    <section className="bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#171717] sm:text-3xl">
              Featured <span className="text-primary">Courses</span>
            </h2>

            <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
            <p className="text-xs text-slate-500 sm:text-sm">
              Comprehensive courses designed for your success.
            </p>

            <Link
              href="/batches"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-red-600 transition-colors hover:text-orange-700"
            >
              View All
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Featured Batch Cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredBatches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} />
          ))}
        </div>
      </div>
    </section>
  );
}
