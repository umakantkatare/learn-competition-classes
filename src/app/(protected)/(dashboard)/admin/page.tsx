import Profile from "@/components/dashboard/profile/profile";
import { requireAdmin } from "@/lib/authorize";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();

  return (
    <main className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <p className="text-muted-foreground">Welcome, {user.name}</p>

      <Profile
        userName={user.name}
        userEmail={user.email}
        phoneNumber={user.phoneNumber ?? ""}
        userImage={user.image ?? ""}
        role={user.role}
        emailVerified={user.emailVerified}
        createdAt={user.createdAt}
      />
    </main>
  );
}
