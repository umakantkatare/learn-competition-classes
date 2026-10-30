export type ExamCategory = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};
