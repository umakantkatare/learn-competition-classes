import { SubjectPageHeader } from "@/components/academic/subjects/subject-page-header";
import { SubjectsContent } from "@/components/academic/subjects/subjects-content";

export default function SubjectsPage() {
  return (
    <div className="space-y-6">
      <SubjectPageHeader />
      <SubjectsContent />
    </div>
  );
}
