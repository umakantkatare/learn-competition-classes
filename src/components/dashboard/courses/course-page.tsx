"use client";

import Link from "next/link";

import {
  Eye,
  Layers3,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";

import { useCourses } from "@/hooks/course/use-courses";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CoursePage() {
  const { data: courses = [], isLoading, isError, error } = useCourses();

  return (
    <main className="container mx-auto min-h-screen py-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Courses
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage courses and their academic structure.
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/dashboard/courses/new" />}
          className="w-full rounded-button bg-primary text-primary-foreground hover:bg-brand-primary-hover sm:w-auto"
        >
          <Plus className="mr-2 size-4" />
          Create Course
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search courses..."
            className="h-10 rounded-input border-input bg-card pl-9 text-sm shadow-none focus-visible:ring-ring"
          />
        </div>

        <div className="flex w-full gap-3 sm:w-auto">
          <Select defaultValue="all">
            <SelectTrigger className="h-10 w-full rounded-input border-input bg-card shadow-none sm:w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-button border-input bg-card"
          >
            <SlidersHorizontal className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-card border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-12 pl-5 text-xs font-medium text-muted-foreground">
                Course
              </TableHead>

              <TableHead className="h-12 text-xs font-medium text-muted-foreground">
                Sections
              </TableHead>

              <TableHead className="h-12 text-xs font-medium text-muted-foreground">
                Status
              </TableHead>

              <TableHead className="h-12 text-xs font-medium text-muted-foreground">
                Updated
              </TableHead>

              <TableHead className="h-12 w-[60px] pr-5" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-destructive"
                >
                  {error instanceof Error
                    ? error.message
                    : "Failed to load courses."}
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-sm text-muted-foreground"
                >
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow
                  key={course.id}
                  className="border-border hover:bg-accent"
                >
                  <TableCell className="py-4 pl-5">
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {course.title}
                    </Link>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {course.sections}
                  </TableCell>

                  <TableCell>
                    <span
                      className={
                        course.isActive
                          ? "inline-flex rounded-pill bg-brand-dark px-2.5 py-1 text-xs font-medium text-white"
                          : "inline-flex rounded-pill bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      }
                    >
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {course.updatedAt.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>

                  <TableCell className="pr-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-button text-muted-foreground hover:bg-muted"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Eye className="mr-2 size-4" />
                          View Course
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Pencil className="mr-2 size-4" />
                          Edit Course
                        </DropdownMenuItem>

                        <DropdownMenuItem>
                          <Layers3 className="mr-2 size-4" />
                          Manage Structure
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                          <Power className="mr-2 size-4" />
                          Activate / Deactivate
                        </DropdownMenuItem>

                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 size-4" />
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
