import { studentRepository } from "@/server/repositories/academic/student-repository";

export class StudentService {
  async getTotalStudents() {
    return studentRepository.getTotalStudents();
  }

  // Get active student count for each batch
  async getStudentsPerBatch() {
    return studentRepository.getStudentsPerBatch();
  }

  // Get active student count for a specific batch
  async getStudentsByBatchId(batchId: string) {
    if (!batchId?.trim()) {
      throw new Error("Batch ID is required");
    }

    return studentRepository.getStudentsByBatchId(batchId);
  }
}

export const studentService = new StudentService();
