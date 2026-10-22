import {
  ExamCategoryRepository,
  NewExamCategory,
  UpdateExamCategory,
} from "../../repositories/academic/exam-category-repository";

export class ExamCategoryService {
  private readonly categoryRepo: ExamCategoryRepository;

  constructor() {
    this.categoryRepo = new ExamCategoryRepository();
  }

  // Create category
  async createCategory(data: NewExamCategory) {
    const existingCategory = await this.categoryRepo.findBySlug(data.slug);

    if (existingCategory) {
      throw new Error("An exam category with this slug already exists.");
    }

    return this.categoryRepo.create(data);
  }

  // Get category by ID
  async getCategoryById(id: string) {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new Error("Exam category not found.");
    }

    return category;
  }

  // Get category by slug
  async getCategoryBySlug(slug: string) {
    const category = await this.categoryRepo.findBySlug(slug);

    if (!category) {
      throw new Error("Exam category not found.");
    }

    return category;
  }

  // Get active categories for public pages
  async getActiveCategories() {
    return this.categoryRepo.findAllActive();
  }

  // Update category
  async updateCategory(id: string, data: UpdateExamCategory) {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new Error("Exam category not found.");
    }

    if (data.slug && data.slug !== category.slug) {
      const existingCategory = await this.categoryRepo.findBySlug(data.slug);

      if (existingCategory && existingCategory.id !== id) {
        throw new Error("Another exam category is already using this slug.");
      }
    }

    return this.categoryRepo.update(id, data);
  }

  // Deactivate category instead of permanently deleting it
  async deactivateCategory(id: string) {
    const category = await this.categoryRepo.findById(id);

    if (!category) {
      throw new Error("Exam category not found.");
    }

    if (!category.isActive) {
      return category;
    }

    const deactivatedCategory = await this.categoryRepo.deactivate(id);

    if (!deactivatedCategory) {
      throw new Error("Failed to deactivate exam category.");
    }

    return deactivatedCategory;
  }
}
