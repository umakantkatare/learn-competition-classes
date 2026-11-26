"use client";

import { Users, Layers3, GraduationCap, RefreshCw } from "lucide-react";

import {
  useTotalStudents,
  useStudentsPerBatch,
} from "@/hooks/academic/use-students";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function StudentsEnrollment() {
  const totalQuery = useTotalStudents();
  const batchesQuery = useStudentsPerBatch();

  const isLoading = totalQuery.isPending || batchesQuery.isPending;
  const isError = totalQuery.isError || batchesQuery.isError;

  const totalStudents = totalQuery.data ?? 0;
  const batches = batchesQuery.data ?? [];

  const highestBatchCount = Math.max(
    ...batches.map((item: any) => item.totalStudents),
    1,
  );

  if (isLoading) {
    return <StudentEnrollmentsSkeleton />;
  }

  if (isError) {
    return (
      <Card className="rounded-card">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm font-medium text-destructive">
            Failed to load student statistics.
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              totalQuery.refetch();
              batchesQuery.refetch();
            }}
          >
            <RefreshCw className="mr-2 size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            Student Overview
          </h2>
        </div>

        <Badge variant="secondary" className="w-fit rounded-pill px-3 py-1">
          Active Enrollments
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Total Students */}
        <Card className="rounded-card border-border shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Total Students
              </p>

              <p className="text-3xl font-bold tracking-tight text-text-primary tabular-nums">
                {totalStudents.toLocaleString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Total Batches */}
        <Card className="rounded-card border-border shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                Total Batches
              </p>

              <p className="text-3xl font-bold tracking-tight text-text-primary tabular-nums">
                {batches.length.toLocaleString("en-IN")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch-wise Students */}
      <Card className="rounded-card border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              Students by Batch
            </CardTitle>

            <p className="text-sm text-text-secondary">Active enrollments</p>
          </div>
        </CardHeader>

        <CardContent>
          {batches.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-text-secondary">
                No batches available.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {batches.map((item: any) => {
                const percentage =
                  (item.totalStudents / highestBatchCount) * 100;

                return (
                  <div key={item.batchId} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-text-primary">
                        {item.batchTitle}
                      </p>

                      <span className="shrink-0 text-sm font-semibold tabular-nums text-text-primary">
                        {item.totalStudents.toLocaleString("en-IN")}
                        <span className="ml-1 font-normal text-text-secondary">
                          students
                        </span>
                      </span>
                    </div>

                    <div
                      className="h-2 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label={`${item.batchTitle} student count relative to the largest batch`}
                      aria-valuenow={item.totalStudents}
                      aria-valuemin={0}
                      aria-valuemax={highestBatchCount}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

// Loading Skeleton
function StudentEnrollmentsSkeleton() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="rounded-card shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-36" />
              </div>

              <Skeleton className="size-12 rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-card shadow-none">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>

        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
