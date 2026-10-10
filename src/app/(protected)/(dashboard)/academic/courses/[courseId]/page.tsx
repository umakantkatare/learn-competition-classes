import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Video,
  FileText,
  ClipboardCheck,
} from "lucide-react";

import { getCourseById } from "@/services/academic/course/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CourseSubjects } from "@/components/academic/courses/course-subjects";
import { CourseContentManager } from "@/components/academic/courses/course-content-manager";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-content space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" asChild className="w-fit">
          <Link href="/academic/courses">
            <ArrowLeft className="mr-2 size-4" />
            Back to Courses
          </Link>
        </Button>

        <Button asChild>
          <Link href={`/academic/courses/${course.id}/edit`}>
            <Pencil className="mr-2 size-4" />
            Edit Course
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid gap-0 md:grid-cols-[280px_minmax(0,1fr)]">
            <div className="aspect-video overflow-hidden rounded-t-xl bg-muted md:aspect-auto md:rounded-l-xl md:rounded-tr-none">
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnail}
                  alt={`${course.name} thumbnail`}
                  className="h-full min-h-56 w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-56 items-center justify-center text-text-secondary">
                  <BookOpen className="size-12" />
                </div>
              )}
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={course.isActive ? "default" : "secondary"}>
                  {course.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline">Course</Badge>
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                  {course.name}
                </h1>
                <p className="mt-2 text-sm text-text-secondary">
                  /{course.slug}
                </p>
              </div>

              <Separator />

              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-2xl font-semibold text-text-primary">
                  {formatPrice(course.salePrice ?? course.price)}
                </span>

                {course.salePrice !== null && (
                  <span className="text-base text-text-secondary line-through">
                    {formatPrice(course.price)}
                  </span>
                )}
              </div>

              <p className="text-sm text-text-secondary">
                {course.salePrice !== null
                  ? "Discounted course price"
                  : "Regular course price"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
              <CardDescription>Overview of this course.</CardDescription>
            </CardHeader>

            <CardContent>
              {course.description ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-text-secondary">
                  {course.description}
                </p>
              ) : (
                <p className="text-sm text-text-secondary">
                  No description has been added yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Features</CardTitle>
              <CardDescription>
                Benefits included with this course.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {course.features.length > 0 ? (
                <ul className="space-y-3">
                  {course.features.map((feature, index) => (
                    <li
                      key={`${feature}-${index}`}
                      className="flex items-start gap-3 text-sm text-text-primary"
                    >
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                        <BookOpen className="size-3.5" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">
                  No features have been added yet.
                </p>
              )}
            </CardContent>
          </Card>

          <CourseSubjects courseId={course.id} />
        </div>

        <div className="space-y-6">
          <CourseContentManager courseId={course.id} />
        </div>
      </div>
    </div>
  );
}
