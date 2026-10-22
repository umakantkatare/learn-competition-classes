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

  // Assign one teacher to a batch
  async assignTeacherToBatch(batchId: string, teacherId: string) {
    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    const teacher = await this.teacherRepo.findById(teacherId);

    if (!teacher) {
      throw new Error("Teacher profile not found.");
    }

    const existingAssignments =
      await this.batchTeacherRepo.findByBatchId(batchId);

    if (existingAssignments.some((item) => item.teacherId === teacherId)) {
      throw new Error("This teacher is already assigned to this batch.");
    }

    return this.batchTeacherRepo.create({ batchId, teacherId });
  }

  // Assign multiple teachers to a batch
  async assignMultipleTeachers(batchId: string, teacherIds: string[]) {
    const uniqueTeacherIds = [...new Set(teacherIds)];

    if (uniqueTeacherIds.length === 0) {
      return [];
    }

    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    // Verify every teacher exists before creating assignments
    const teacherProfiles = await Promise.all(
      uniqueTeacherIds.map((id) => this.teacherRepo.findById(id)),
    );

    if (teacherProfiles.some((teacher) => !teacher)) {
      throw new Error("One or more teacher profiles were not found.");
    }

    const existingAssignments =
      await this.batchTeacherRepo.findByBatchId(batchId);

    const existingTeacherIds = new Set(
      existingAssignments.map((item) => item.teacherId),
    );

    const newTeacherIds = uniqueTeacherIds.filter(
      (id) => !existingTeacherIds.has(id),
    );

    if (newTeacherIds.length === 0) {
      return [];
    }

    return this.batchTeacherRepo.createMany(
      newTeacherIds.map((teacherId) => ({
        batchId,
        teacherId,
      })),
    );
  }

  // Get teachers assigned to a batch
  async getTeachersForBatch(batchId: string) {
    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return this.batchTeacherRepo.findByBatchId(batchId);
  }

  // Get batches assigned to a teacher
  async getBatchesForTeacher(teacherId: string) {
    const teacher = await this.teacherRepo.findById(teacherId);

    if (!teacher) {
      throw new Error("Teacher profile not found.");
    }

    return this.batchTeacherRepo.findByTeacherId(teacherId);
  }

  // Remove teacher assignment
  async removeTeacherFromBatch(batchId: string, teacherId: string) {
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
