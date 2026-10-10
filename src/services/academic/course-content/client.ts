export interface CourseContentItem {
  id: string;
  courseId: string;
  subjectId: string | null;
  topicId: string | null;
  title: string;
  description: string | null;
  type: "VIDEO" | "PDF" | "TEST";
  videoId: string | null;
  fileUrl: string | null;
  thumbnail: string | null;
  sortOrder: number;
  isPublished: boolean;
  isPreview: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function getCourseContent(
  courseId: string,
): Promise<CourseContentItem[]> {
  const response = await fetch(`/api/academic/courses/${courseId}/content`, {
    cache: "no-store",
  });

  const result = (await response.json()) as ApiResponse<CourseContentItem[]>;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Failed to fetch course content");
  }

  return result.data;
}
