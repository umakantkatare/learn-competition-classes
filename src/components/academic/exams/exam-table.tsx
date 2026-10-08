 "use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { useExams } from "@/hooks/academic/exams/use-exams";
import { ExamActions } from "./exam-actions";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ExamTableFilters {
  search: string;
  year: string;
  status: string;
}

interface ExamTableProps {
  filters: ExamTableFilters;
}

export function ExamTable({ filters }: ExamTableProps) {
  const {
    data: exams = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useExams();

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>

                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>

                <TableCell>
                  <Skeleton className="size-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
        <div>
          <p className="font-medium text-text-primary">Unable to load exams</p>

          <p className="mt-1 text-sm text-text-secondary">
            Something went wrong while fetching the exam list.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Retrying..." : "Try Again"}
        </Button>
      </div>
    );
  }

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name
      .toLowerCase()
      .includes(filters.search.toLowerCase());

    const matchesYear =
      filters.year === "all" || exam.year.toString() === filters.year;

    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" && exam.isActive) ||
      (filters.status === "inactive" && !exam.isActive);

    return matchesSearch && matchesYear && matchesStatus;
  });

  if (exams.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
        <div>
          <p className="font-medium text-text-primary">No exams yet</p>

          <p className="mt-1 text-sm text-text-secondary">
            Create your first exam to start managing examinations.
          </p>
        </div>

        <Button asChild className="mt-4">
          <Link href="/academic/exams/create">Create Exam</Link>
        </Button>
      </div>
    );
  }

  if (filteredExams.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center p-8 text-center">
        <div>
          <p className="font-medium text-text-primary">No matching exams</p>

          <p className="mt-1 text-sm text-text-secondary">
            Try changing your search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredExams.map((exam) => (
            <TableRow key={exam.id}>
              <TableCell className="font-medium text-text-primary">
                {exam.name}
              </TableCell>

              <TableCell>{exam.year}</TableCell>

              <TableCell>
                <Badge variant={exam.isActive ? "default" : "secondary"}>
                  {exam.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell>
                <ExamActions examId={exam.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
