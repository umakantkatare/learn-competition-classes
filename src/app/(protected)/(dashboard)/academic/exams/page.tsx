import { ExamPageHeader } from "@/components/academic/exams/exam-page-header";
import { ExamsContent } from "@/components/academic/exams/exams-content";

export default function ExamsPage() {
  return (
    <div className="space-y-6">
      <ExamPageHeader />
      <ExamsContent />
    </div>
  );
}
