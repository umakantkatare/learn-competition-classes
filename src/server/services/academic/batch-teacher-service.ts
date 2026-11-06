import { db } from "@/db";

import { BatchTeacherRepository } from "@/server/repositories/academic/batch-teacher-repository";
import { BatchRepository } from "@/server/repositories/academic/batch-repository";
import { TeacherRepository } from "@/server/repositories/academic/teacher-repository";

export class BatchTeacherService {
  private readonly batchTeacherRepo: BatchTeacherRepository;
  private readonly batchRepo: BatchRepository;
  private readonly teacherRepo: TeacherRepository;

  constructor() {
    this.batchTeacherRepo = new BatchTeacherRepository();
    this.batchRepo = new BatchRepository();
    this.teacherRepo = new TeacherRepository();
  }

  // ---------------------------------------------
  // Private Helpers
  // ---------------------------------------------

  private async validateTeacher(teacherId: string): Promise<void> {
    const teacher = await this.teacherRepo.findById(teacherId);

    if (!teacher) {
      throw new Error("Teacher profile not found.");
    }
  }

  private async validateTeachers(teacherIds: string[]): Promise<void> {
    if (teacherIds.length === 0) return;

    const teacherProfiles = await Promise.all(
      teacherIds.map((id) => this.teacherRepo.findById(id)),
    );

    if (teacherProfiles.some((teacher) => !teacher)) {
      throw new Error("One or more teacher profiles were not found.");
    }
  }

  // ---------------------------------------------
  // Assign One Teacher To Batch
  // ---------------------------------------------

  async assignTeacherToBatch(batchId: string, teacherId: string) {
    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    await this.validateTeacher(teacherId);

    const existingAssignment = await this.batchTeacherRepo.findAssignment(
      batchId,
      teacherId,
    );

    if (existingAssignment) {
      throw new Error("This teacher is already assigned to this batch.");
    }

    return this.batchTeacherRepo.create({
      batchId,
      teacherId,
    });
  }

  // ---------------------------------------------
  // Assign Multiple Teachers To Batch
  // ---------------------------------------------

  // async assignMultipleTeachers(batchId: string, teacherIds: string[]) {
  //   // Prevent duplicate IDs
  //   const uniqueTeacherIds = [...new Set(teacherIds)];

  //   if (uniqueTeacherIds.length !== teacherIds.length) {
  //     throw new Error("Duplicate teachers are not allowed.");
  //   }

  //   if (uniqueTeacherIds.length === 0) {
  //     return [];
  //   }

  //   const batch = await this.batchRepo.findById(batchId);

  //   if (!batch) {
  //     throw new Error("Batch not found.");
  //   }

  //   // Verify all teacher profiles
  //   await this.validateTeachers(uniqueTeacherIds);

  //   // Find existing assignments
  //   const existingAssignments =
  //     await this.batchTeacherRepo.findByBatchId(batchId);

  //   const existingTeacherIds = new Set(
  //     existingAssignments.map((item) => item.teacherId),
  //   );

  //   // Only assign new teachers
  //   const newTeacherIds = uniqueTeacherIds.filter(
  //     (id) => !existingTeacherIds.has(id),
  //   );

  //   if (newTeacherIds.length === 0) {
  //     return [];
  //   }

  //   // YAHAN CHANGE KIYA GAYA HAI
  //   // db.transaction hata diya gaya hai kyunki single createMany apne aap mein atomic hai
  //   return this.batchTeacherRepo.createMany(
  //     newTeacherIds.map((teacherId) => ({
  //       batchId,
  //       teacherId,
  //     })),
  //     // 'tx' argument pass karne ki ab zarurat nahi
  //   );
  // }

// any one

  async assignMultipleTeachers(batchId: string, teacherIds: string[]) {
    // Prevent duplicate IDs
    const uniqueTeacherIds = [...new Set(teacherIds)];

    if (uniqueTeacherIds.length !== teacherIds.length) {
      throw new Error("Duplicate teachers are not allowed.");
    }

    if (uniqueTeacherIds.length === 0) {
      return [];
    }

    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    // Verify all teacher profiles
    await this.validateTeachers(uniqueTeacherIds);

    // Find existing assignments
    const existingAssignments =
      await this.batchTeacherRepo.findByBatchId(batchId);

    const existingTeacherIds = new Set(
      existingAssignments.map((item) => item.teacherId),
    );

    // Only assign new teachers
    const newTeacherIds = uniqueTeacherIds.filter(
      (id) => !existingTeacherIds.has(id),
    );

    if (newTeacherIds.length === 0) {
      return [];
    }

    return db.transaction(async (tx) => {
      return this.batchTeacherRepo.createMany(
        newTeacherIds.map((teacherId) => ({
          batchId,
          teacherId,
        })),
        tx,
      );
    });
  }

  // ---------------------------------------------
  // Get Teachers Assigned To Batch
  // ---------------------------------------------

  async getTeachersForBatch(batchId: string) {
    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return this.batchTeacherRepo.findByBatchId(batchId);
  }

  // ---------------------------------------------
  // Get Batches Assigned To Teacher
  // ---------------------------------------------

  async getBatchesForTeacher(teacherId: string) {
    await this.validateTeacher(teacherId);

    return this.batchTeacherRepo.findByTeacherId(teacherId);
  }

  // ---------------------------------------------
  // Remove Teacher From Batch
  // ---------------------------------------------

  async removeTeacherFromBatch(batchId: string, teacherId: string) {
    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    const deletedRecord = await this.batchTeacherRepo.delete(
      batchId,
      teacherId,
    );

    if (!deletedRecord) {
      throw new Error(
        "Assignment not found. The teacher is not assigned to this batch.",
      );
    }

    return deletedRecord;
  }
}
