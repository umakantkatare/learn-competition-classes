import BatchForm from "@/components/batches/batch-form";
import BatchList from "@/components/batches/batch-lists";
import React from "react";

const page = () => {
  return (
    <div>
      <BatchForm/>
      <BatchList />
    </div>
  );
};

export default page;
