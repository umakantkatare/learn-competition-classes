"use client";

import { useMemo } from "react";
import Link from "next/link";

import { AlertCircle, BookOpen, RefreshCw, Plus } from "lucide-react";

import { useSubjects } from "@/hooks/academic/subjects/use-subjects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectActions } from "./subject-actions";


interface SubjectTableFilters {
  search: string;
  status: string;
}

interface SubjectTableProps {
  filters: SubjectTableFilters;
}

export function SubjectTable({ filters }: SubjectTableProps) {
  const {
    data: subjects = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useSubjects();

  const filteredSubjects = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        !normalizedSearch ||
        subject.name.toLowerCase().includes(normalizedSearch) ||
        subject.slug.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        filters.status === "all" ||
        (filters.status === "active" && subject.isActive) ||
        (filters.status === "inactive" && !subject.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [subjects, filters]);

  if (isLoading) {
    return <SubjectTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>

        <div>
          <h3 className="font-medium text-text-primary">
            Unable to load subjects
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            Something went wrong while fetching subjects.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          Try Again
        </Button>
      </div>
    );
  }

  if (subjects.length === 0) {
    return <EmptySubjectsState />;
  }

  if (filteredSubjects.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-muted text-text-secondary">
          <BookOpen className="size-5" />
        </div>

        <h3 className="mt-3 font-medium text-text-primary">
          No matching subjects
        </h3>

        <p className="mt-1 text-sm text-text-secondary">
          Try changing your search or status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredSubjects.map((subject) => (
            <TableRow key={subject.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                    <BookOpen className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/academic/subjects/${subject.id}`}
                      className="font-medium text-text-primary hover:underline"
                    >
                      {subject.name}
                    </Link>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <code className="rounded-md bg-muted px-2 py-1 text-xs text-text-secondary">
                  {subject.slug}
                </code>
              </TableCell>

              <TableCell>
                <Badge variant={subject.isActive ? "default" : "secondary"}>
                  {subject.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <SubjectActions
                  subjectId={subject.id}
                  isActive={subject.isActive}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SubjectTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-lg" />

                  <Skeleton className="h-4 w-32" />
                </div>
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-28" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="ml-auto size-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmptySubjectsState() {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-text-secondary">
        <BookOpen className="size-5" />
      </div>

      <h3 className="mt-3 font-medium text-text-primary">No subjects yet</h3>

      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Create your first subject to start organizing examinations and courses.
      </p>

      <Button asChild className="mt-4">
        <Link href="/academic/subjects/create">
          <Plus className="size-4" />
          Create Subject
        </Link>
      </Button>
    </div>
  );
}
