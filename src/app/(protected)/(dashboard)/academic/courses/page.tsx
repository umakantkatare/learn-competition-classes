import { CoursePageHeader } from "@/components/academic/courses/course-page-header";
import { CoursesContent } from "@/components/academic/courses/courses-content";

export default function CoursesPage() {
  return (
    <div className="mx-auto w-full max-w-content space-y-6">
      <CoursePageHeader totalCourses={0} />
      <CoursesContent />
    </div>
  );
}
