export type TeacherProfile = {
  userId: string;
  bio: string | null;
  qualification: string | null;
  experienceYears: number;
  specializations: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type CreateTeacherProfileInput = {
  userId: string;
  bio?: string | null;
  qualification?: string | null;
  experienceYears?: number;
  specializations?: string[];
};

export type UpdateTeacherProfileInput = Partial<CreateTeacherProfileInput>;

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
    throw new Error(result.message ?? "Request failed");
  }

  return result.data;
}

export const teacherProfileApi = {
  getMine: () => request<TeacherProfile>("/api/teacher-profile"),

  getByUserId: (userId: string) =>
    request<TeacherProfile>(
      `/api/teacher-profile/${encodeURIComponent(userId)}`,
    ),

  getAll: () => request<TeacherProfile[]>("/api/admin/teacher-profiles"),

  create: (data: CreateTeacherProfileInput) =>
    request<TeacherProfile>("/api/teacher-profile", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (userId: string, data: UpdateTeacherProfileInput) =>
    request<TeacherProfile>(
      `/api/teacher-profile/${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    ),

  delete: (userId: string) =>
    request<TeacherProfile>(
      `/api/teacher-profile/${encodeURIComponent(userId)}`,
      { method: "DELETE" },
    ),
};
