import type {
  CreateCourseInput,
  UpdateCourseInput,
} from "@/validations/courses/course-validation";

export type Course = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  features: string[];
  price: number;
  salePrice: number | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
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

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success || result.data === undefined) {
    throw new Error(result.message ?? "Something went wrong");
  }

  return result.data;
}

export const courseApi = {
  getAll: () => request<Course[]>("/api/courses"),

  getById: (id: string) =>
    request<Course>(`/api/courses/${encodeURIComponent(id)}`),

  create: (data: CreateCourseInput) =>
    request<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateCourseInput) =>
    request<Course>(`/api/courses/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/api/courses/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
