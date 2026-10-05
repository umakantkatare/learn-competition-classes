import { CourseDetails } from "@/components/dashboard/courses/course-details";

type CourseDetailsPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseDetailsPage({
  params,
}: CourseDetailsPageProps) {
  const { courseId } = await params;

  return <CourseDetails courseId={courseId} />;
}
