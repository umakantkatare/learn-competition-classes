import type {
  CreateCourseSubjectInput,
  UpdateCourseSubjectInput,
} from "@/validations/courses/course-subject-schema";

export type CourseSubject = {
  id: string;
  courseId: string;
  teacherId: string | null;
  name: string;
  description: string | null;
  thumbnail: string | null;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message ?? "Something went wrong");
  }

  if (result.data === undefined) {
    throw new Error("The server returned no data");
  }

  return result.data;
}

export const courseSubjectApi = {
  // Public: published subjects only.
  getPublishedByCourseId(courseId: string) {
    return request<CourseSubject[]>(
      `/api/courses/${encodeURIComponent(courseId)}/subjects`,
    );
  },

  // Admin: requires the protected admin endpoint added below.
  getAllByCourseId(courseId: string) {
    return request<CourseSubject[]>(
      `/api/admin/courses/${encodeURIComponent(courseId)}/subjects`,
    );
  },

  getById(id: string) {
    return request<CourseSubject>(
      `/api/course-subjects/${encodeURIComponent(id)}`,
    );
  },

  create(courseId: string, data: CreateCourseSubjectInput) {
    return request<CourseSubject>(
      `/api/courses/${encodeURIComponent(courseId)}/subjects`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  update(id: string, data: UpdateCourseSubjectInput) {
    return request<CourseSubject>(
      `/api/course-subjects/${encodeURIComponent(id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
  },

  delete(id: string) {
    return request<CourseSubject>(
      `/api/course-subjects/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
  },
};
