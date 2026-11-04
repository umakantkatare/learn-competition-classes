import ManagerForm from "@/components/managers/manager-form";
import ManagerList from "@/components/managers/manager-list";

export default function ManagersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Managers</h1>
      </div>
      <div className="space-y-4ेोोेोेोेोेोे">
        <ManagerForm />
        <ManagerList />
      </div>
    </div>
  );
}
