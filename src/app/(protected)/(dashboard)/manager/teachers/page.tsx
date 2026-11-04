import TeacherForm from "@/components/teachers/teacher-form";
import TeacherList from "@/components/teachers/teacher-list";
import React from "react";

const page = () => {
  return (
    <div>
      <TeacherForm />
      <TeacherList />
    </div>
  );
};

export default page;
