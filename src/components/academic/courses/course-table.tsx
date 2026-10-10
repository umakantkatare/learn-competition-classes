"use client";

import Link from "next/link";
import { MoreHorizontal, Pencil, Eye, Power } from "lucide-react";

import type { Course } from "@/services/academic/course/types";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CourseTableProps {
  courses: Course[];
  onStatusChange: (course: Course) => void;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function CourseTable({ courses, onStatusChange }: CourseTableProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell>
                <div className="flex min-w-0 items-center gap-3">
                  {course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnail}
                      alt=""
                      className="size-12 shrink-0 rounded-md border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted text-text-secondary">
                      <Eye className="size-5" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="max-w-64 truncate font-medium text-text-primary">
                      {course.name}
                    </p>
                    <p className="max-w-64 truncate text-sm text-text-secondary">
                      {course.slug}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <div className="space-y-1">
                  {course.salePrice !== null ? (
                    <>
                      <p className="font-medium text-text-primary">
                        {formatPrice(course.salePrice)}
                      </p>
                      <p className="text-sm text-text-secondary line-through">
                        {formatPrice(course.price)}
                      </p>
                    </>
                  ) : (
                    <p className="font-medium text-text-primary">
                      {formatPrice(course.price)}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>
                <Badge variant={course.isActive ? "default" : "secondary"}>
                  {course.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Actions for ${course.name}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/academic/courses/${course.id}`}>
                        <Eye className="mr-2 size-4" />
                        View details
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href={`/academic/courses/${course.id}/edit`}>
                        <Pencil className="mr-2 size-4" />
                        Edit course
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onSelect={() => onStatusChange(course)}>
                      <Power className="mr-2 size-4" />
                      {course.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
