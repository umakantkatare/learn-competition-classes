import {
  LectureRepository,
  NewLecture,
  UpdateLecture,
} from "@/server/repositories/academic/lecture-repository";

import { SubjectRepository } from "@/server/repositories/academic/subject-repository";
import { ChapterRepository } from "@/server/repositories/academic/chapter-repository";
import { TeacherRepository } from "@/server/repositories/academic/teacher-repository";

export class LectureService {
  private readonly lectureRepo: LectureRepository;
  private readonly subjectRepo: SubjectRepository;
  private readonly chapterRepo: ChapterRepository;
  private readonly teacherRepo: TeacherRepository;

  constructor() {
    this.lectureRepo = new LectureRepository();
    this.subjectRepo = new SubjectRepository();
    this.chapterRepo = new ChapterRepository();
    this.teacherRepo = new TeacherRepository();
  }

  // Validate lecture relationships
  private async validateRelationships(data: {
    subjectId: string;
    chapterId: string;
    teacherId: string;
  }) {
    const [subject, chapter, teacher] = await Promise.all([
      this.subjectRepo.findById(data.subjectId),
      this.chapterRepo.findById(data.chapterId),
      this.teacherRepo.findById(data.teacherId),
    ]);

    if (!subject) {
      throw new Error("The specified subject does not exist.");
    }

    if (!chapter) {
      throw new Error("The specified chapter does not exist.");
    }

    if (chapter.subjectId !== data.subjectId) {
      throw new Error("The chapter does not belong to the specified subject.");
    }

    if (!teacher) {
      throw new Error("The specified teacher does not exist.");
    }
  }

  // Validate lecture fields and LIVE scheduling rules
  private validateLectureData(data: {
    title: string;
    durationMinutes: number | null;
    lectureType: string;
    scheduledAt: Date | null;
  }) {
    if (!data.title.trim()) {
      throw new Error("Lecture title cannot be empty.");
    }

    if (
      data.durationMinutes !== null &&
      (!Number.isFinite(data.durationMinutes) || data.durationMinutes < 0)
    ) {
      throw new Error("Lecture duration must be a non-negative number.");
    }

    if (data.lectureType === "LIVE" && !data.scheduledAt) {
      throw new Error("Scheduled date/time is required for LIVE lectures.");
    }

    if (data.scheduledAt === null && data.lectureType !== "VOD") {
      throw new Error("Only VOD lectures can have no scheduled date/time.");
    }
  }

  // Create lecture
  async createLecture(data: NewLecture) {
    await this.validateRelationships({
      subjectId: data.subjectId,
      chapterId: data.chapterId,
      teacherId: data.teacherId,
    });

    this.validateLectureData({
      title: data.title,
      durationMinutes: data.durationMinutes ?? null,
      lectureType: data.lectureType ?? "",
      scheduledAt: data.scheduledAt ?? null,
    });

    return this.lectureRepo.create({
      ...data,
      title: data.title.trim(),
    });
  }

  // Get lecture by ID
  async getLectureById(id: string) {
    const lecture = await this.lectureRepo.findById(id);

    if (!lecture) {
      throw new Error("Lecture not found.");
    }

    return lecture;
  }

  // Get lectures by chapter
  async getLecturesByChapter(chapterId: string) {
    const chapter = await this.chapterRepo.findById(chapterId);

    if (!chapter) {
      throw new Error("Chapter not found.");
    }

    return this.lectureRepo.findByChapterId(chapterId);
  }

  // Update lecture
  async updateLecture(id: string, data: UpdateLecture) {
    const existingLecture = await this.lectureRepo.findById(id);

    if (!existingLecture) {
      throw new Error("Lecture not found.");
    }

    if (Object.keys(data).length === 0) {
      throw new Error("At least one field is required to update a lecture.");
    }

    // Merge existing state with partial updates
    const merged = {
      subjectId: data.subjectId ?? existingLecture.subjectId,
      chapterId: data.chapterId ?? existingLecture.chapterId,
      teacherId: data.teacherId ?? existingLecture.teacherId,
      title: data.title ?? existingLecture.title,
      durationMinutes: data.durationMinutes ?? existingLecture.durationMinutes,
      lectureType: data.lectureType ?? existingLecture.lectureType,
      scheduledAt:
        data.scheduledAt !== undefined
          ? data.scheduledAt
          : existingLecture.scheduledAt,
    };

    await this.validateRelationships({
      subjectId: merged.subjectId,
      chapterId: merged.chapterId,
      teacherId: merged.teacherId,
    });

    this.validateLectureData(merged);

    const updateData: UpdateLecture = {
      ...data,
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
    };

    const updatedLecture = await this.lectureRepo.update(id, updateData);

    if (!updatedLecture) {
      throw new Error("Failed to update lecture.");
    }

    return updatedLecture;
  }

  // Delete lecture
  async deleteLecture(id: string) {
    const existingLecture = await this.lectureRepo.findById(id);

    if (!existingLecture) {
      throw new Error("Lecture not found.");
    }

    return this.lectureRepo.delete(id);
  }
}
