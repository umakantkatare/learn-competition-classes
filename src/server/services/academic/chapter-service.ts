import {
  ChapterRepository,
  NewChapter,
  UpdateChapter,
} from "@/server/repositories/academic/chapter-repository";

import { SubjectRepository } from "@/server/repositories/academic/subject-repository";

export class ChapterService {
  private readonly chapterRepo: ChapterRepository;
  private readonly subjectRepo: SubjectRepository;

  constructor() {
    this.chapterRepo = new ChapterRepository();
    this.subjectRepo = new SubjectRepository();
  }

  // Create chapter
  async createChapter(data: NewChapter) {
    const title = data.title?.trim();

    if (!title) {
      throw new Error("Chapter title cannot be empty.");
    }

    const subject = await this.subjectRepo.findById(data.subjectId);

    if (!subject) {
      throw new Error("The specified subject does not exist.");
    }

    if (data.sortOrder !== undefined && data.sortOrder < 1) {
      throw new Error("Sort order must be 1 or greater.");
    }

    return this.chapterRepo.create({
      ...data,
      title,
    });
  }

  // Get chapter by ID
  async getChapterById(id: string) {
    const chapter = await this.chapterRepo.findById(id);

    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    return chapter;
  }

  // Get chapters by subject
  async getChaptersBySubject(subjectId: string) {
    const subject = await this.subjectRepo.findById(subjectId);

    if (!subject) {
      throw new Error("Subject not found.");
    }

    return this.chapterRepo.findBySubjectId(subjectId);
  }

  // Update chapter
  async updateChapter(id: string, data: UpdateChapter) {
    const existingChapter = await this.chapterRepo.findById(id);

    if (!existingChapter) {
      throw new Error("Chapter not found.");
    }

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a chapter.");
    }

    if (data.subjectId && data.subjectId !== existingChapter.subjectId) {
      const subject = await this.subjectRepo.findById(data.subjectId);

      if (!subject) {
        throw new Error("The specified subject does not exist.");
      }
    }

    const updateData: UpdateChapter = { ...data };

    if (data.title !== undefined) {
      const title = data.title.trim();

      if (!title) {
        throw new Error("Chapter title cannot be empty.");
      }

      updateData.title = title;
    }

    if (data.sortOrder !== undefined && data.sortOrder < 1) {
      throw new Error("Sort order must be 1 or greater.");
    }

    const updatedChapter = await this.chapterRepo.update(id, updateData);

    if (!updatedChapter) {
      throw new Error("Failed to update chapter.");
    }

    return updatedChapter;
  }

  // Delete chapter
  async deleteChapter(id: string) {
    const existingChapter = await this.chapterRepo.findById(id);

    if (!existingChapter) {
      throw new Error("Chapter not found.");
    }

    return this.chapterRepo.delete(id);
  }
}
