import { BatchLectureRepository } from "@/server/repositories/academic/batch-lecture-repository";
import { BatchRepository } from "@/server/repositories/academic/batch-repository";
import { LectureRepository } from "@/server/repositories/academic/lecture-repository";

export class BatchLectureService {
  private readonly batchLectureRepo: BatchLectureRepository;
  private readonly batchRepo: BatchRepository;
  private readonly lectureRepo: LectureRepository;

  constructor() {
    this.batchLectureRepo = new BatchLectureRepository();
    this.batchRepo = new BatchRepository();
    this.lectureRepo = new LectureRepository();
  }

  // 1. Assign one lecture to a batch
  async assignLectureToBatch(batchId: string, lectureId: string) {
    const [batch, lecture] = await Promise.all([
      this.batchRepo.findById(batchId),
      this.lectureRepo.findById(lectureId),
    ]);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    if (!lecture) {
      throw new Error("Lecture not found.");
    }

    const existingAssignments =
      await this.batchLectureRepo.findByBatchId(batchId);

    const alreadyAssigned = existingAssignments.some(
      (assignment) => assignment.lectureId === lectureId,
    );

    if (alreadyAssigned) {
      throw new Error("This lecture is already assigned to this batch.");
    }

    return this.batchLectureRepo.create({ batchId, lectureId });
  }

  // 2. Assign multiple lectures to a batch
  async assignMultipleLectures(batchId: string, lectureIds: string[]) {
    if (lectureIds.length === 0) {
      return [];
    }

    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    // Remove duplicate IDs from the request.
    const uniqueLectureIds = [...new Set(lectureIds)];

    // Verify that every requested lecture exists.
    const lectures = await Promise.all(
      uniqueLectureIds.map((id) => this.lectureRepo.findById(id)),
    );

    const missingLectureIds = uniqueLectureIds.filter(
      (_, index) => !lectures[index],
    );

    if (missingLectureIds.length > 0) {
      throw new Error(`Lecture(s) not found: ${missingLectureIds.join(", ")}`);
    }

    const existingAssignments =
      await this.batchLectureRepo.findByBatchId(batchId);

    const existingLectureIds = new Set(
      existingAssignments.map((assignment) => assignment.lectureId),
    );

    const newLectureIds = uniqueLectureIds.filter(
      (id) => !existingLectureIds.has(id),
    );

    if (newLectureIds.length === 0) {
      return [];
    }

    return this.batchLectureRepo.createMany(
      newLectureIds.map((lectureId) => ({
        batchId,
        lectureId,
      })),
    );
  }

  // 3. Get lectures assigned to a batch
  async getLecturesForBatch(batchId: string) {
    const batch = await this.batchRepo.findById(batchId);

    if (!batch) {
      throw new Error("Batch not found.");
    }

    return this.batchLectureRepo.findByBatchId(batchId);
  }

  // 4. Get batches containing a lecture
  async getBatchesForLecture(lectureId: string) {
    const lecture = await this.lectureRepo.findById(lectureId);

    if (!lecture) {
      throw new Error("Lecture not found.");
    }

    return this.batchLectureRepo.findByLectureId(lectureId);
  }

  // 5. Remove a lecture assignment
  async removeLectureFromBatch(batchId: string, lectureId: string) {
    const deletedRecord = await this.batchLectureRepo.delete(
      batchId,
      lectureId,
    );

    if (!deletedRecord) {
      throw new Error(
        "Assignment not found. The lecture is not assigned to this batch.",
      );
    }

    return deletedRecord;
  }
}
