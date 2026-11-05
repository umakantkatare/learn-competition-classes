import TeacherForm from "@/components/teachers/teacher-form";
import TeacherList from "@/components/teachers/teacher-list";

const page = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        <TeacherForm />
        <TeacherList />
      </div>
    </div>
  );
};

export default page;
