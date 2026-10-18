import { requireDashboardRole } from "@/lib/require-dashboard-role";

export default async function AdminDashboardPage() {
  const user = await requireDashboardRole("admin");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome, {user.name}</p>
    </main>
  );
}
