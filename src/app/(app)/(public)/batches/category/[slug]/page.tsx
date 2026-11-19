
"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

import { BatchCard } from "@/components/batches/batch-card";

import { useGetExamCategories } from "@/hooks/academic/use-exam-categories";
import { useGetExaminationsByCategory } from "@/hooks/academic/use-exams";
import { useGetAllBatches } from "@/hooks/academic/use-batches";

// Page Component

export default function CategoryBatchesPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  // 1. Fetch Active Exam Categories

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useGetExamCategories(true);

  const category = useMemo(
    () => categories.find((item) => item.slug === slug),
    [categories, slug]
  );

  // 2. Fetch Examinations by Category

  const {
    data: examinations = [],
    isLoading: examinationsLoading,
    isError: examinationsError,
    refetch: refetchExaminations,
  } = useGetExaminationsByCategory(category?.id ?? "");

  // 3. Fetch All Batches

  const {
    data: batches = [],
    isLoading: batchesLoading,
    isError: batchesError,
    refetch: refetchBatches,
  } = useGetAllBatches();

  // 4. Filter Batches by Examination IDs

  const categoryBatches = useMemo(() => {
    const examinationIds = new Set(
      examinations.map((exam) => exam.id)
    );

    return batches.filter((batch) =>
      examinationIds.has(batch.examinationId)
    );
  }, [batches, examinations]);

  // 5. Loading and Error States

  const isLoading =
    categoriesLoading ||
    (Boolean(category) && examinationsLoading) ||
    batchesLoading;

  const isError =
    categoriesError ||
    examinationsError ||
    batchesError;

  const handleRetry = () => {
    refetchCategories();
    refetchExaminations();
    refetchBatches();
  };

  if (isLoading) {
    return (
      <main className="container mx-auto min-h-[60vh] px-4 py-10">
        <div className="mb-8 space-y-3">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />
          <div className="h-9 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-96 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">
            Category Not Found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            The requested exam category does not exist or is inactive.
          </p>

          <Link
            href="/batches"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="size-4" />
            Explore All Batches
          </Link>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">
            Unable to Load Batches
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong while fetching category information.
          </p>

          <button
            type="button"
            onClick={handleRetry}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            <RefreshCw className="size-4" />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // 6. Render Category Batches

  return (
    <main className="container mx-auto min-h-[60vh] px-4 py-8 md:py-10">

      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {category.name} Batches
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Explore {category.name} preparation batches
              and find the right course for your exam preparation.
            </p>
          </div>
        </div>
      </section>

      {/* Batch Listing */}
      {categoryBatches.length > 0 ? (
        <section>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryBatches.map((batch) => (
              <BatchCard
                key={batch.id}
                batch={batch}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-5 text-center">
          <h2 className="text-lg font-semibold">
            No Batches Available
          </h2>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            There are currently no batches available for{" "}
            {category.name}. Please check back later.
          </p>

          <Link
            href="/batches"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Explore All Batches
          </Link>
        </section>
      )}
    </main>
  );
}
