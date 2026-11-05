import ManagerForm from "@/components/managers/manager-form";
import ManagerList from "@/components/managers/manager-list";

export default function ManagersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        <ManagerForm />
        <ManagerList />
      </div>
    </div>
  );
}
