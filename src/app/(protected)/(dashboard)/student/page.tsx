import { requireDashboardRole } from "@/lib/require-dashboard-role";

export default async function StudentDashboardPage() {
  const user = await requireDashboardRole("student");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome, {user.name}</p>
    </main>
  );
}
