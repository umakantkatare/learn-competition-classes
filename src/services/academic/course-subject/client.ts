export interface CourseSubjectItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface AvailableCourseSubject {
  id: string;
  name: string;
  slug: string;
}

async function fetchSubjectData<T>(url: string): Promise<T[]> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to fetch subjects.");
  }

  const result: {
    success: boolean;
    data?: T[];
    error?: string;
  } = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error ?? "Unable to fetch subjects.");
  }

  return result.data;
}

export function getCourseSubjects(courseId: string) {
  return fetchSubjectData<CourseSubjectItem>(
    `/api/academic/courses/${courseId}/subjects`,
  );
}

export function getAvailableCourseSubjects(courseId: string) {
  return fetchSubjectData<AvailableCourseSubject>(
    `/api/academic/courses/${courseId}/available-subjects`,
  );
}
